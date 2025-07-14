import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
export interface ListUserTripsResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class ListUserTripsUseCase {
    private readonly repo;
    constructor(repo: TripPlanRepositoryPort);
    execute(userId: string, page?: number, limit?: number): Promise<ListUserTripsResult>;
}
