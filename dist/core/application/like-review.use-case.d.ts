import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';
export declare class LikeReviewUseCase {
    private readonly reviewRepository;
    constructor(reviewRepository: ReviewRepositoryPort);
    execute(reviewId: string, userId: string): Promise<{
        helpful: number;
        isLiked: boolean;
    }>;
}
