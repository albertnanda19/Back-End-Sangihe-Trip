import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { TripPlan } from '../../core/domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../../core/domain/trip-plan.repository.port';

@Injectable()
export class TripPlanRepositoryAdapter implements TripPlanRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  private calcEstimatedBudget(budget: TripPlan['budget']): number {
    return Object.values(budget).reduce<number>(
      (acc, val) => acc + (val ?? 0),
      0,
    );
  }

  async create(plan: TripPlan): Promise<void> {
    const estimatedBudget = this.calcEstimatedBudget(plan.budget);

    const daysData = plan.schedule.map((day) => {
      const dayDate = new Date(
        plan.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000,
      );

      return {
        day_number: day.day,
        date: dayDate.toISOString().split('T')[0],
        title: `Hari ${day.day}`,
        description: null,
        daily_budget: 0,
        items: (day.items || []).map((item) => ({
          id: uuid(),
          destination_id: item.destinationId || null,
          title: item.activity,
          description: item.notes || null,
          start_time: item.startTime,
          end_time: item.endTime,
          duration_minutes: null,
          estimated_cost: 0,
          actual_cost: 0,
          item_type: 'destination',
          sort_order: 0,
        })),
      };
    });

    const { error: planErr } = await this.client.from('trip_plans').insert({
      id: plan.id,
      user_id: plan.userId,
      destination_ids: plan.destinations || [],
      title: plan.name,
      description: plan.notes,
      start_date: plan.startDate.toISOString().split('T')[0],
      end_date: plan.endDate.toISOString().split('T')[0],
      total_people: plan.peopleCount,
      trip_type: plan.tripType,
      estimated_budget: estimatedBudget,
      status: 'planning',
      settings: {
        budget: plan.budget,
      },
      days: daysData,
      notes: [],
      collaborators: [],
      packing_list: plan.packingList || [],
      created_at: plan.createdAt.toISOString(),
      updated_at: plan.createdAt.toISOString(),
    });

    if (planErr) throw new Error(planErr.message);
  }

  async findById(id: string): Promise<TripPlan | null> {
    const { data: planRow, error: planErr } = await this.client
      .from('trip_plans')
      .select('*')
      .eq('id', id)
      .single();

    if (planErr?.code === 'PGRST116') return null;
    if (planErr) throw new Error(planErr.message);

    const daysData = planRow.days || [];
    const schedule = daysData.map((d: any) => ({
      day: d.day_number,
      items: (d.items || []).map((it: any) => ({
        destinationId: it.destination_id,
        startTime: it.start_time,
        endTime: it.end_time,
        activity: it.title,
        notes: it.description ?? undefined,
      })),
    }));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const settings = planRow.settings || {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const budget: TripPlan['budget'] = settings.budget || {};
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const packingList: string[] = planRow.packing_list || [];
    const destinations: string[] = [];

    return new TripPlan(
      planRow.user_id,
      planRow.title,
      new Date(planRow.start_date),
      new Date(planRow.end_date),
      planRow.total_people,
      planRow.trip_type,
      false,
      destinations,
      schedule,
      budget,
      planRow.description,
      packingList,
      planRow.id,
      new Date(planRow.created_at),
    );
  }

  async findAllByUser(
    query: import('../../core/domain/trip-plan.repository.port').TripPlanListQuery,
  ): Promise<{ data: TripPlan[]; totalItems: number }> {
    const { userId, page = 1, pageSize = 10 } = query;

    const safePageSize = Math.min(Math.max(pageSize, 1), 50);
    const from = (page - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const supabaseQuery = this.client
      .from('trip_plans')
      .select(
        `id, user_id, title, start_date, end_date, total_people, trip_type, estimated_budget, created_at, updated_at`,
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, count, error } = await supabaseQuery;
    if (error) {
      throw new Error(error.message);
    }

    const mapped = (data || []).map(
      (row: any) =>
        new TripPlan(
          row.user_id,
          row.title,
          row.start_date ? new Date(row.start_date) : new Date(),
          row.end_date ? new Date(row.end_date) : new Date(),
          row.total_people ?? 0,
          row.trip_type ?? '',
          false,
          [],
          [],
          {},
          null,
          [],
          row.id,
          row.created_at ? new Date(row.created_at) : new Date(),
        ),
    );

    return {
      data: mapped,
      totalItems: count || 0,
    };
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from('trip_plans')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return false;
      }
      throw new Error(`Failed to delete trip: ${error.message}`);
    }

    return true;
  }

  async update(
    id: string,
    updates: Partial<TripPlan>,
  ): Promise<TripPlan | null> {
    const existingTrip = await this.findById(id);
    if (!existingTrip) return null;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.title = updates.name;
    if (updates.startDate !== undefined)
      updateData.start_date = updates.startDate.toISOString().split('T')[0];
    if (updates.endDate !== undefined)
      updateData.end_date = updates.endDate.toISOString().split('T')[0];
    if (updates.peopleCount !== undefined)
      updateData.total_people = updates.peopleCount;
    if (updates.tripType !== undefined) updateData.trip_type = updates.tripType;
    if (updates.notes !== undefined) updateData.description = updates.notes;

    if (updates.budget !== undefined) {
      updateData.settings = { budget: updates.budget };
      updateData.estimated_budget = this.calcEstimatedBudget(updates.budget);
    }

    if (updates.packingList !== undefined) {
      updateData.packing_list = updates.packingList;
    }

    if (updates.schedule !== undefined) {
      const baseDate = updates.startDate || existingTrip.startDate;
      const daysData = updates.schedule.map((day) => {
        const dayDate = new Date(
          baseDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000,
        );

        return {
          day_number: day.day,
          date: dayDate.toISOString().split('T')[0],
          title: `Hari ${day.day}`,
          description: null,
          daily_budget: 0,
          items: (day.items || []).map((item) => ({
            id: uuid(),
            destination_id: item.destinationId || null,
            title: item.activity,
            description: item.notes || null,
            start_time: item.startTime,
            end_time: item.endTime,
            duration_minutes: null,
            estimated_cost: 0,
            actual_cost: 0,
            item_type: 'destination',
            sort_order: 0,
          })),
        };
      });

      updateData.days = daysData;
    }

    const { error: planErr } = await this.client
      .from('trip_plans')
      .update(updateData)
      .eq('id', id);

    if (planErr) throw new Error(planErr.message);

    return this.findById(id);
  }
}
