import { SupabaseClient } from '@supabase/supabase-js';
import { Review } from '../../core/domain/review.entity';
import { ReviewRepositoryPort, ReviewListQuery, ReviewWithUser, ReviewStats } from '../../core/domain/review.repository.port';
export declare class ReviewRepositoryAdapter implements ReviewRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    findAllByUser(query: ReviewListQuery): Promise<{
        data: Review[];
        totalItems: number;
    }>;
    findAllByDestination(query: ReviewListQuery, currentUserId?: string): Promise<{
        data: ReviewWithUser[];
        totalItems: number;
        stats: ReviewStats;
    }>;
    findById(id: string): Promise<Review | null>;
    findByUserAndDestination(userId: string, destinationId: string): Promise<Review | null>;
    create(review: Review): Promise<Review>;
    toggleLike(reviewId: string, userId: string): Promise<{
        helpful: number;
        isLiked: boolean;
    }>;
    isLikedByUser(reviewId: string, userId: string): Promise<boolean>;
    private getDestinationReviewStats;
    private parseImages;
}
