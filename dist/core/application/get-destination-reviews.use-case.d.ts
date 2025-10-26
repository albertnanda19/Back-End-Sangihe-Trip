import { ReviewRepositoryPort, ReviewListQuery, ReviewWithUser, ReviewStats } from 'src/core/domain/review.repository.port';
export declare class GetDestinationReviewsUseCase {
    private readonly reviewRepository;
    constructor(reviewRepository: ReviewRepositoryPort);
    execute(destinationId: string, query: ReviewListQuery, currentUserId?: string): Promise<{
        reviews: ReviewWithUser[];
        total: number;
        stats: ReviewStats;
    }>;
}
