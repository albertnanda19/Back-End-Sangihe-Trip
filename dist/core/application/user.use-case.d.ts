import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ReviewRepositoryPort } from '../domain/review.repository.port';
export declare class UserUseCase {
    private readonly userRepository;
    private readonly tripPlanRepository;
    private readonly reviewRepository;
    constructor(userRepository: UserRepositoryPort, tripPlanRepository: TripPlanRepositoryPort, reviewRepository: ReviewRepositoryPort);
    getUserById(id: string): Promise<User>;
    getUserProfile(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        firstName: string | undefined;
        first_name: string | undefined;
        lastName: string | undefined;
        last_name: string | undefined;
        avatar: string | undefined;
        avatar_url: string | undefined;
        role: string;
        joinDate: string;
        created_at: string;
        profileCompletion: number;
        stats: {
            tripPlans: number;
            visitedDestinations: number;
            reviewsWritten: number;
        };
    }>;
    private calculateProfileCompletion;
}
