import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { UserRepositoryPort } from '../domain/user.repository.port';
export declare class GetTripUseCase {
    private readonly repository;
    private readonly destinationRepository;
    private readonly userRepository;
    constructor(repository: TripPlanRepositoryPort, destinationRepository: DestinationRepositoryPort, userRepository: UserRepositoryPort);
    execute(id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        slug: string;
        startDate: string;
        endDate: string;
        peopleCount: number;
        tripType: string;
        isPublic: boolean;
        destinations: {
            id: string;
            name: string;
        }[];
        schedule: {
            day: number;
            items: {
                destinationName: string;
                destinationId: string;
                startTime: string;
                endTime: string;
                activity: string;
                notes?: string;
            }[];
        }[];
        budget: import("../domain/trip-plan.entity").TripBudget;
        totalBudget: number;
        notes: string;
        packingList: string[];
        coverImage: string | null;
        createdAt: string;
        updatedAt: string;
        owner: {
            id: string;
            name: string;
            firstName: string | undefined;
            lastName: string | undefined;
            avatar: string | undefined;
        } | null;
    }>;
}
