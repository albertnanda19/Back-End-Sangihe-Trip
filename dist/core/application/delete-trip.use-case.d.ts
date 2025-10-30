import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ActivityLoggerService } from './activity-logger.service';
export declare class DeleteTripUseCase {
    private readonly tripRepository;
    private readonly activityLogger;
    constructor(tripRepository: TripPlanRepositoryPort, activityLogger: ActivityLoggerService);
    execute(tripId: string, userId: string): Promise<void>;
}
