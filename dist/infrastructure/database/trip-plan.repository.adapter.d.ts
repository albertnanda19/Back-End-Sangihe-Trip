import { SupabaseClient } from '@supabase/supabase-js';
import { TripPlan } from '../../core/domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../../core/domain/trip-plan.repository.port';
export declare class TripPlanRepositoryAdapter implements TripPlanRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    private calcEstimatedBudget;
    create(plan: TripPlan): Promise<void>;
}
