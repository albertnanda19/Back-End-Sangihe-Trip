import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AdminTripListQuery {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  tripType?: string;
  userId?: string;
}

export interface AdminTripListResult {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class AdminTripUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async list(query: AdminTripListQuery): Promise<AdminTripListResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let dbQuery = this.supabase
      .from('trip_plans')
      .select(
        `
        *,
        user:users!user_id (
          id,
          first_name,
          last_name,
          email
        )
      `,
        { count: 'exact' },
      )
      .is('deleted_at', null);

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query.search}%,description.ilike.%${query.search}%`,
      );
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.tripType) {
      dbQuery = dbQuery.eq('trip_type', query.tripType);
    }

    if (query.userId) {
      dbQuery = dbQuery.eq('user_id', query.userId);
    }

    // Apply sorting
    const [sortField, sortOrder] = (query.sort || 'createdAt:desc').split(':');
    const orderColumn = this.mapSortField(sortField);
    dbQuery = dbQuery.order(orderColumn, {
      ascending: sortOrder === 'asc',
    });

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch trip plans: ${error.message}`);
    }

    const formattedData = (data || []).map((trip: any) => {
      const days = trip.days || [];
      const dayCount = days.length;
      const itemCount = days.reduce((total: number, day: any) => {
        return total + ((day.items || []).length);
      }, 0);

      const collaborators = trip.collaborators || [];
      const collaboratorCount = collaborators.filter((c: any) => c.status === 'accepted').length;
      
      return {
        id: trip.id,
        title: trip.title,
        start_date: trip.start_date,
        end_date: trip.end_date,
        duration_days: trip.duration_days,
        total_people: trip.total_people,
        trip_type: trip.trip_type,
        status: trip.status,
        estimated_budget: trip.estimated_budget,
        actual_budget: trip.actual_budget,
        view_count: trip.view_count,
        clone_count: trip.clone_count,
        total_days: dayCount,
        total_items: itemCount,
        total_collaborators: collaboratorCount,
        user: trip.user
          ? {
              id: trip.user.id,
              firstName: trip.user.first_name,
              lastName: trip.user.last_name,
              email: trip.user.email,
            }
          : null,
        created_at: trip.created_at,
        updated_at: trip.updated_at,
      };
    });

    return {
      data: formattedData,
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  async getById(id: string): Promise<any> {
    // Get trip plan
    const { data: trip, error: tripError } = await this.supabase
      .from('trip_plans')
      .select(
        `
        *,
        user:users!user_id (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (tripError || !trip) {
      throw new NotFoundException('Trip plan not found');
    }

    const daysData = trip.days || [];
    const notesData = trip.notes || [];
    const collaboratorsData = trip.collaborators || [];

    const formattedDays = daysData.map((day: any) => ({
      day_number: day.day_number,
      date: day.date,
      title: day.title,
      description: day.description,
      daily_budget: day.daily_budget,
      items: (day.items || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        start_time: item.start_time,
        end_time: item.end_time,
        duration_minutes: item.duration_minutes,
        estimated_cost: item.estimated_cost,
        actual_cost: item.actual_cost,
        item_type: item.item_type,
        sort_order: item.sort_order,
        destination_id: item.destination_id,
      })),
    }));

    const destinationIds = new Set<string>();
    daysData.forEach((day: any) => {
      (day.items || []).forEach((item: any) => {
        if (item.destination_id) {
          destinationIds.add(item.destination_id);
        }
      });
    });

    let destinationsMap: any = {};
    if (destinationIds.size > 0) {
      const { data: destinations } = await this.supabase
        .from('destinations')
        .select('id, name, slug, category, address')
        .in('id', Array.from(destinationIds));

      destinationsMap = (destinations || []).reduce((acc: any, dest: any) => {
        acc[dest.id] = dest;
        return acc;
      }, {});
    }

    const daysWithDestinations = formattedDays.map((day: any) => ({
      ...day,
      items: day.items.map((item: any) => ({
        ...item,
        destination: item.destination_id ? destinationsMap[item.destination_id] || null : null,
      })),
    }));

    const formattedNotes = notesData.map((note: any) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      note_type: note.note_type,
      user_id: note.user_id,
      created_at: note.created_at,
    }));

    const formattedCollaborators = collaboratorsData.map((collab: any) => ({
      id: collab.id,
      user_id: collab.user_id,
      role: collab.role,
      status: collab.status,
      invited_at: collab.invited_at,
      accepted_at: collab.accepted_at,
    }));

    // Format user
    const { user, ...tripData } = trip;
    const userObj = user
      ? {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          avatarUrl: user.avatar_url,
        }
      : null;

    return {
      ...tripData,
      user: userObj,
      days: formattedDays,
      notes: formattedNotes,
      collaborators: formattedCollaborators,
    };
  }

  private mapSortField(field: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      title: 'title',
      startDate: 'start_date',
      viewCount: 'view_count',
    };
    return mapping[field] || 'created_at';
  }
}
