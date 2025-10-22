import { UserUseCase } from '../../core/application/user.use-case';
import { ListUserTripsUseCase } from '../../core/application/list-user-trips.use-case';
import { ListUserReviewsUseCase } from '../../core/application/list-user-reviews.use-case';
import { MyTripsQueryDto } from '../dtos/trip/my-trips-query.dto';
export declare class UserController {
    private readonly userUseCase;
    private readonly listUserTripsUc;
    private readonly listUserReviewsUc;
    constructor(userUseCase: UserUseCase, listUserTripsUc: ListUserTripsUseCase, listUserReviewsUc: ListUserReviewsUseCase);
    getMyProfile(req: any): Promise<{
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
            points: number;
            badges: number;
        };
    }>;
    getMyTrips(req: any, query: MyTripsQueryDto): Promise<import("../../core/application/list-user-trips.use-case").ListUserTripsResult>;
    getMyReviews(req: any, limit?: number): Promise<{
        data: {
            id: string;
            destination: {
                id: string;
                name: string;
                image: string;
            };
            rating: number;
            comment: string;
            createdAt: string;
            helpful: number;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<import("../../core/domain/user.entity").User>;
}
