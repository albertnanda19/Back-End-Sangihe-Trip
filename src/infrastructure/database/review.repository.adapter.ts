import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Review } from '../../core/domain/review.entity';
import {
  ReviewRepositoryPort,
  ReviewListQuery,
} from '../../core/domain/review.repository.port';

@Injectable()
export class ReviewRepositoryAdapter implements ReviewRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  async findAllByUser(
    query: ReviewListQuery,
  ): Promise<{ data: Review[]; totalItems: number }> {
    const { userId, page = 1, pageSize = 10 } = query;

    // TODO: Implement actual database query when reviews table is created
    // For now, return empty array

    // Uncomment when reviews table exists:
    /*
    const safePageSize = Math.min(Math.max(pageSize, 1), 50);
    const from = (page - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, count, error } = await this.client
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const mapped = (data || []).map((row: any) =>
      new Review(
        row.id,
        row.user_id,
        row.destination_id,
        row.rating,
        row.comment,
        row.helpful ?? 0,
        new Date(row.created_at),
        new Date(row.updated_at),
      ),
    );

    return {
      data: mapped,
      totalItems: count || 0,
    };
    */

    return {
      data: [],
      totalItems: 0,
    };
  }

  async findById(id: string): Promise<Review | null> {
    // TODO: Implement when reviews table exists
    return null;
  }

  async create(review: Review): Promise<Review> {
    // TODO: Implement when reviews table exists
    throw new Error('Review creation not yet implemented');
  }
}
