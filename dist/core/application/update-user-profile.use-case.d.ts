import { UserRepositoryPort } from '../domain/user.repository.port';
import { ActivityLoggerService } from './activity-logger.service';
interface UpdateProfileData {
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    avatar?: string;
    avatar_url?: string;
}
export declare class UpdateUserProfileUseCase {
    private readonly userRepository;
    private readonly activityLogger;
    constructor(userRepository: UserRepositoryPort, activityLogger: ActivityLoggerService);
    execute(userId: string, data: UpdateProfileData): Promise<{
        id: string;
        email: string;
        firstName: string | undefined;
        first_name: string | undefined;
        lastName: string | undefined;
        last_name: string | undefined;
        avatar: string | undefined;
        avatar_url: string | undefined;
    }>;
}
export {};
