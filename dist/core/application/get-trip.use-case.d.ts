import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
export declare class GetTripUseCase {
    private readonly repository;
    constructor(repository: TripPlanRepositoryPort);
    execute(id: string): Promise<import("../domain/trip-plan.entity").TripPlan>;
}
