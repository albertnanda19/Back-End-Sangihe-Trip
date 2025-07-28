import { TripPlan } from './trip-plan.entity';
export interface TripPlanListQuery {
    userId: string;
    page?: number;
    pageSize?: number;
}
export interface TripPlanRepositoryPort {
    create(plan: TripPlan): Promise<void>;
    findAllByUser(query: TripPlanListQuery): Promise<{
        data: TripPlan[];
        totalItems: number;
    }>;
    findById(id: string): Promise<TripPlan | null>;
}
