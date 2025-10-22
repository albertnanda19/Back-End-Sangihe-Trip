import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
export declare class UserUseCase {
    private readonly userRepository;
    private readonly tripPlanRepository;
    constructor(userRepository: UserRepositoryPort, tripPlanRepository: TripPlanRepositoryPort);
    getUserById(id: string): Promise<User>;
    getUserProfile(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        avatar: null;
        role: string;
        joinDate: string;
        profileCompletion: number;
        stats: {
            tripPlans: number;
            visitedDestinations: number;
            reviewsWritten: number;
        };
    }>;
    private calculateProfileCompletion;
}
