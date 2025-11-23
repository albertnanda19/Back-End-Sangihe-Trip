import { UserRepositoryPort } from '../domain/user.repository.port';
import { ActivityLoggerService } from './activity-logger.service';
interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}
export declare class UpdateUserProfileUseCase {
    private readonly userRepository;
    private readonly activityLogger;
    constructor(userRepository: UserRepositoryPort, activityLogger: ActivityLoggerService);
    execute(userId: string, data: UpdateProfileData): Promise<{
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        avatarUrl: string | undefined;
    }>;
}
export {};
