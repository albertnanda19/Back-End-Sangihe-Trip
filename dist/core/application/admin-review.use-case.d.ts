import { SupabaseClient } from '@supabase/supabase-js';
export interface AdminReviewListQuery {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
    destinationId?: string;
}
export interface AdminReviewListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class AdminReviewUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    list(query: AdminReviewListQuery): Promise<AdminReviewListResult>;
    getById(id: string): Promise<any>;
    approve(reviewId: string, adminId: string, moderatorNote?: string): Promise<any>;
    reject(reviewId: string, adminId: string, reason: string, moderatorNote?: string): Promise<any>;
    private recalculateDestinationRating;
}
