import { TripPlan } from '../domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
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
    constructor(repository: TripPlanRepositoryPort);
    execute(command: UpdateTripCommand): Promise<void>;
}
