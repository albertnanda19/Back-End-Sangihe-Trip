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
    const { error: planErr } = await this.client.from('trip_plans').insert({
      id: plan.id,
      user_id: plan.userId,
      title: plan.name,
      description: plan.notes,
      start_date: plan.startDate.toISOString().split('T')[0],
      end_date: plan.endDate.toISOString().split('T')[0],
      total_people: plan.peopleCount,
      trip_type: plan.tripType,
      estimated_budget: estimatedBudget,
      privacy_level: plan.isPublic ? 'public' : 'private',
      status: 'planning',
      settings: {
        budget: plan.budget,
        packingList: plan.packingList,
        destinations: plan.destinations,
      },
      created_at: plan.createdAt.toISOString(),
      updated_at: plan.createdAt.toISOString(),
    });
    if (planErr) throw new Error(planErr.message);

    await Promise.all(
      plan.schedule.map(async (day) => {
        const dayId = uuid();
        const dayDate = new Date(
          plan.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000,
        );
        const { error: dayErr } = await this.client
          .from('trip_plan_days')
          .insert({
            id: dayId,
            trip_plan_id: plan.id,
            day_number: day.day,
            date: dayDate.toISOString().split('T')[0],
            title: `Hari ${day.day}`,
            description: null,
            created_at: plan.createdAt.toISOString(),
            updated_at: plan.createdAt.toISOString(),
          });
        if (dayErr) throw new Error(dayErr.message);

        if (day.items?.length) {
          const itemRows = day.items.map((item) => ({
            id: uuid(),
            trip_plan_day_id: dayId,
            destination_id: item.destinationId,
            title: item.activity,
            description: item.notes ?? null,
            start_time: item.startTime,
            end_time: item.endTime,
            estimated_cost: 0,
            item_type: 'destination',
            sort_order: 0,
            created_at: plan.createdAt.toISOString(),
            updated_at: plan.createdAt.toISOString(),
          }));
          const { error: itemsErr } = await this.client
            .from('trip_plan_items')
            .insert(itemRows);
          if (itemsErr) throw new Error(itemsErr.message);
        }
      }),
    );
  }

  async findById(id: string): Promise<TripPlan | null> {
    const { data: planRow, error: planErr } = await this.client
      .from('trip_plans')
      .select('*')
      .eq('id', id)
      .single();
    if (planErr?.code === 'PGRST116') return null;
    if (planErr) throw new Error(planErr.message);

    const { data: dayRows, error: dayErr } = await this.client
      .from('trip_plan_days')
      .select('*, trip_plan_items(*)')
      .eq('trip_plan_id', id)
      .order('day_number', { ascending: true });
    if (dayErr) throw new Error(dayErr.message);

    const schedule = (dayRows || []).map((d: any) => ({
      day: d.day_number,
      items: (d.trip_plan_items || []).map((it: any) => ({
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
    const packingList: string[] = settings.packingList || [];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const destinations: string[] = settings.destinations || [];

    return new TripPlan(
      planRow.user_id,
      planRow.title,
      new Date(planRow.start_date),
      new Date(planRow.end_date),
      planRow.total_people,
      planRow.trip_type,
      planRow.privacy_level === 'public',
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
        `id, user_id, title, start_date, end_date, total_people, trip_type, estimated_budget, privacy_level, created_at, updated_at`,
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
          row.privacy_level === 'public',
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
    if (updates.isPublic !== undefined)
      updateData.privacy_level = updates.isPublic ? 'public' : 'private';
    if (updates.notes !== undefined) updateData.description = updates.notes;

    const currentSettings = (existingTrip as any).settings || {};
    const newSettings = { ...currentSettings };

    if (updates.budget !== undefined) {
      newSettings.budget = updates.budget;
      updateData.estimated_budget = this.calcEstimatedBudget(updates.budget);
    }
    if (updates.packingList !== undefined) {
      newSettings.packingList = updates.packingList;
    }
    if (updates.destinations !== undefined) {
      newSettings.destinations = updates.destinations;
    }

    updateData.settings = newSettings;

    const { error: planErr } = await this.client
      .from('trip_plans')
      .update(updateData)
      .eq('id', id);

    if (planErr) throw new Error(planErr.message);

    if (updates.schedule !== undefined) {
      const { error: deleteErr } = await this.client
        .from('trip_plan_days')
        .delete()
        .eq('trip_plan_id', id);

      if (deleteErr) throw new Error(deleteErr.message);

      await Promise.all(
        updates.schedule.map(async (day) => {
          const dayId = uuid();
          const baseDate = updates.startDate || existingTrip.startDate;
          const dayDate = new Date(
            baseDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000,
          );

          const { error: dayErr } = await this.client
            .from('trip_plan_days')
            .insert({
              id: dayId,
              trip_plan_id: id,
              day_number: day.day,
              date: dayDate.toISOString().split('T')[0],
              title: `Hari ${day.day}`,
              description: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (dayErr) throw new Error(dayErr.message);

          if (day.items?.length) {
            const itemRows = day.items.map((item) => ({
              id: uuid(),
              trip_plan_day_id: dayId,
              destination_id: item.destinationId,
              title: item.activity,
              description: item.notes ?? null,
              start_time: item.startTime,
              end_time: item.endTime,
              estimated_cost: 0,
              item_type: 'destination',
              sort_order: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));

            const { error: itemsErr } = await this.client
              .from('trip_plan_items')
              .insert(itemRows);

            if (itemsErr) throw new Error(itemsErr.message);
          }
        }),
      );
    }

    return this.findById(id);
  }
}
