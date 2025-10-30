import { TripPlan } from '../domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ActivityLoggerService } from './activity-logger.service';
export interface UpdateTripCommand {
    tripId: string;
    userId: string;
    name?: string;
    startDate?: string;
    endDate?: string;
    peopleCount?: number;
    tripType?: string;
    isPublic?: boolean;
    destinations?: string[];
    schedule?: TripPlan['schedule'];
    budget?: TripPlan['budget'];
    notes?: string;
    packingList?: string[];
}
export declare class UpdateTripUseCase {
    private readonly repository;
    private readonly activityLogger;
    constructor(repository: TripPlanRepositoryPort, activityLogger: ActivityLoggerService);
    execute(command: UpdateTripCommand): Promise<void>;
}
