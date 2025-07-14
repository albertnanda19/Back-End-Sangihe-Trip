import { TripPlan } from './trip-plan.entity';

export interface TripPlanListQuery {
  userId: string;
  page?: number;
  pageSize?: number;
}

export interface TripPlanRepositoryPort {
  create(plan: TripPlan): Promise<void>;

  /**
   * Retrieves paginated trip plans belonging to a specific user
   */
  findAllByUser(query: TripPlanListQuery): Promise<{ data: TripPlan[]; totalItems: number }>;
} 