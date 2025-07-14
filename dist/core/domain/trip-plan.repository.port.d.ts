import { TripPlan } from './trip-plan.entity';
export interface TripPlanRepositoryPort {
    create(plan: TripPlan): Promise<void>;
}
