import { TripPlan } from '../domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
export interface CreateTripCommand {
    userId: string;
    name: string;
    startDate: string;
    endDate: string;
    peopleCount: number;
    tripType: string;
    isPublic: boolean;
    destinations: string[];
    schedule: TripPlan['schedule'];
    budget: TripPlan['budget'];
    notes?: string;
    packingList?: string[];
}
export declare class CreateTripUseCase {
    private readonly repo;
    constructor(repo: TripPlanRepositoryPort);
    execute(cmd: CreateTripCommand): Promise<void>;
}
