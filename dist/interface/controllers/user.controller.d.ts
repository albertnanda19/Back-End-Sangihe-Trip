import { UserUseCase } from '../../core/application/user.use-case';
import { ListUserTripsUseCase } from '../../core/application/list-user-trips.use-case';
import { ListUserReviewsUseCase } from '../../core/application/list-user-reviews.use-case';
import { UpdateUserProfileUseCase } from '../../core/application/update-user-profile.use-case';
import { UpdatePasswordUseCase } from '../../core/application/update-password.use-case';
import { DeleteTripUseCase } from '../../core/application/delete-trip.use-case';
import { UpdateTripUseCase } from '../../core/application/update-trip.use-case';
import { MyTripsQueryDto } from '../dtos/trip/my-trips-query.dto';
import { UpdateProfileDto } from '../dtos/user/update-profile.dto';
import { UpdatePasswordDto } from '../dtos/user/update-password.dto';
import { UpdateTripDto } from '../dtos/trip/update-trip.dto';
import { MyReviewsQueryDto } from '../dtos/user/my-reviews-query.dto';
interface AuthenticatedRequest {
    user?: {
        id: string;
        email: string;
        type: string;
        role?: string;
    };
}
export declare class UserController {
    private readonly userUseCase;
    private readonly listUserTripsUc;
    private readonly listUserReviewsUc;
    private readonly updateUserProfileUc;
    private readonly updatePasswordUc;
    private readonly deleteTripUc;
    private readonly updateTripUc;
    constructor(userUseCase: UserUseCase, listUserTripsUc: ListUserTripsUseCase, listUserReviewsUc: ListUserReviewsUseCase, updateUserProfileUc: UpdateUserProfileUseCase, updatePasswordUc: UpdatePasswordUseCase, deleteTripUc: DeleteTripUseCase, updateTripUc: UpdateTripUseCase);
    getMyProfile(req: AuthenticatedRequest): Promise<{
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
    updateMyProfile(req: AuthenticatedRequest, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        firstName: string | undefined;
        lastName: string | undefined;
        avatarUrl: string | undefined;
    }>;
    updateMyPassword(req: AuthenticatedRequest, dto: UpdatePasswordDto): Promise<null>;
    getMyTrips(req: AuthenticatedRequest, query: MyTripsQueryDto): Promise<import("../../core/application/list-user-trips.use-case").ListUserTripsResult>;
    deleteMyTrip(req: AuthenticatedRequest, tripId: string): Promise<null>;
    updateMyTrip(req: AuthenticatedRequest, tripId: string, dto: UpdateTripDto): Promise<null>;
    getMyReviews(req: AuthenticatedRequest, query: MyReviewsQueryDto): Promise<{
        data: {
            id: string;
            destinationId: string;
            destinationName: string;
            destination: {
                id: string;
                name: string;
                image: string;
            };
            rating: number;
            comment: string;
            content: string;
            helpful: number;
            helpfulCount: number;
            likes: number;
            createdAt: string;
            date: string;
        }[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    findOne(id: string): Promise<import("../../core/domain/user.entity").User>;
}
export {};
