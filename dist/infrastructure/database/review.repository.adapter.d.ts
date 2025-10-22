import { SupabaseClient } from '@supabase/supabase-js';
import { Review } from '../../core/domain/review.entity';
import { ReviewRepositoryPort, ReviewListQuery } from '../../core/domain/review.repository.port';
export declare class ReviewRepositoryAdapter implements ReviewRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    findAllByUser(query: ReviewListQuery): Promise<{
        data: Review[];
        totalItems: number;
    }>;
    findById(id: string): Promise<Review | null>;
    create(review: Review): Promise<Review>;
}
