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
    return Object.values(budget).reduce<number>((acc, val) => acc + (val ?? 0), 0);
  }

  async create(plan: TripPlan): Promise<void> {
    // 1. Insert into trip_plans
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
      created_at: plan.createdAt.toISOString(),
      updated_at: plan.createdAt.toISOString(),
    });
    if (planErr) throw new Error(planErr.message);

    // 2. Insert days & items in parallel per day to keep latency low (<1s)
    await Promise.all(plan.schedule.map(async (day) => {
      const dayId = uuid();
      const dayDate = new Date(plan.startDate.getTime() + (day.day - 1) * 24 * 60 * 60 * 1000);
      const { error: dayErr } = await this.client.from('trip_plan_days').insert({
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
        const { error: itemsErr } = await this.client.from('trip_plan_items').insert(itemRows);
        if (itemsErr) throw new Error(itemsErr.message);
      }
    }));
  }
} 