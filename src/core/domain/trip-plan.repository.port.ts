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
  findAllByUser(
    query: TripPlanListQuery,
  ): Promise<{ data: TripPlan[]; totalItems: number }>;

  /**
   * Find a trip plan by its ID
   */
  findById(id: string): Promise<TripPlan | null>;

  /**
   * Delete a trip plan by its ID
   * Returns true if deleted, false if not found
   */
  delete(id: string): Promise<boolean>;

  /**
   * Update a trip plan
   * Returns the updated trip plan
   */
  update(id: string, plan: Partial<TripPlan>): Promise<TripPlan | null>;
}
