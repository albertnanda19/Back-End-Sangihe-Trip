import { SubmitReviewUseCase } from 'src/core/application/submit-review.use-case';
import { GetDestinationReviewsUseCase } from 'src/core/application/get-destination-reviews.use-case';
import { LikeReviewUseCase } from 'src/core/application/like-review.use-case';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { GetReviewsDto } from '../dtos/review/get-reviews.dto';
export declare class ReviewController {
    private readonly submitReviewUseCase;
    private readonly getDestinationReviewsUseCase;
    private readonly likeReviewUseCase;
    constructor(submitReviewUseCase: SubmitReviewUseCase, getDestinationReviewsUseCase: GetDestinationReviewsUseCase, likeReviewUseCase: LikeReviewUseCase);
    submitReview(createReviewDto: CreateReviewDto, req: any): Promise<import("../../core/domain/review.entity").Review>;
    getDestinationReviews(destinationId: string, query: GetReviewsDto, req: any): Promise<{
        reviews: import("../../core/domain/review.repository.port").ReviewWithUser[];
        total: number;
        stats: import("../../core/domain/review.repository.port").ReviewStats;
    }>;
    likeReview(reviewId: string, req: any): Promise<{
        helpful: number;
        isLiked: boolean;
    }>;
}
