import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
export declare class DeleteTripUseCase {
    private readonly tripRepository;
    constructor(tripRepository: TripPlanRepositoryPort);
    execute(tripId: string, userId: string): Promise<void>;
}
