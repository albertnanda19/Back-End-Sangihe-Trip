import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';

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

@Injectable()
export class AdminReviewUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async list(
    query: AdminReviewListQuery,
  ): Promise<AdminReviewListResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let dbQuery = this.supabase
      .from('reviews')
      .select(
        `
        *,
        users!reviews_user_id_fkey(id, first_name, last_name, email),
        destinations!reviews_destination_id_fkey(id, name, slug)
      `,
        { count: 'exact' },
      )
      .is('deleted_at', null);

    // Apply filters
    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.destinationId) {
      dbQuery = dbQuery.eq('destination_id', query.destinationId);
    }

    if (query.search) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query.search}%,content.ilike.%${query.search}%`,
      );
    }

    // Sort by created_at desc (newest first)
    dbQuery = dbQuery.order('created_at', { ascending: false });

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return {
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  async getById(id: string): Promise<any> {
    const { data: review, error } = await this.supabase
      .from('reviews')
      .select(
        `
        *,
        users!reviews_user_id_fkey(id, first_name, last_name, email, avatar_url),
        destinations!reviews_destination_id_fkey(id, name, slug),
        review_images(*)
      `,
      )
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async approve(
    reviewId: string,
    adminId: string,
    moderatorNote?: string,
    adminUser?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    // Get review
    const review = await this.getById(reviewId);

    // Update review status to active
    const { error: updateError } = await this.supabase
      .from('reviews')
      .update({
        status: 'active',
        moderated_by: adminId,
        moderation_notes: moderatorNote || null,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      throw new Error(`Failed to approve review: ${updateError.message}`);
    }

    // Recalculate destination rating
    await this.recalculateDestinationRating(review.destination_id);

    const updatedReview = await this.getById(reviewId);

    // Log admin action
    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      const reviewTitle = review.title || `Review for ${review.destinations?.name || 'Destination'}`;

      await this.activityLogger.logAdminAction(
        adminUser.id,
        'update',
        'review',
        reviewId,
        {
          reviewTitle,
          description: `${adminName} approved review "${reviewTitle}"`,
        },
        {
          status: 'active',
          moderated_by: adminId,
          moderation_notes: moderatorNote,
        },
        adminName,
        adminUser.email,
        reviewTitle,
        ipAddress,
        userAgent,
        {
          status: review.status,
        },
      );
    }

    return updatedReview;
  }

  async reject(
    reviewId: string,
    adminId: string,
    reason: string,
    moderatorNote?: string,
    adminUser?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    // Get review
    const review = await this.getById(reviewId);

    // Update review status to rejected
    const { error: updateError } = await this.supabase
      .from('reviews')
      .update({
        status: 'rejected',
        moderated_by: adminId,
        moderation_notes: moderatorNote
          ? `${reason}. ${moderatorNote}`
          : reason,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', reviewId);

    if (updateError) {
      throw new Error(`Failed to reject review: ${updateError.message}`);
    }

    // Recalculate destination rating (in case it was active before)
    await this.recalculateDestinationRating(review.destination_id);

    const updatedReview = await this.getById(reviewId);

    // Log admin action
    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      const reviewTitle = review.title || `Review for ${review.destinations?.name || 'Destination'}`;

      await this.activityLogger.logAdminAction(
        adminUser.id,
        'update', 
        'review',
        reviewId,
        {
          reviewTitle,
          description: `${adminName} rejected review "${reviewTitle}"`,
        },
        {
          status: 'rejected',
          moderated_by: adminId,
          moderation_notes: moderatorNote ? `${reason}. ${moderatorNote}` : reason,
        },
        adminName,
        adminUser.email,
        reviewTitle,
        ipAddress,
        userAgent,
        {
          status: review.status,
        },
      );
    }

    return updatedReview;
  }

  private async recalculateDestinationRating(
    destinationId: string,
  ): Promise<void> {
    // Get all active reviews for this destination
    const { data: activeReviews } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('destination_id', destinationId)
      .eq('status', 'active')
      .is('deleted_at', null);

    const totalReviews = activeReviews?.length || 0;
    let avgRating = 0;

    if (totalReviews > 0) {
      const sumRating = activeReviews!.reduce(
        (sum: number, review: any) => sum + review.rating,
        0,
      );
      avgRating = Math.round((sumRating / totalReviews) * 100) / 100;
    }

    // Update destination
    await this.supabase
      .from('destinations')
      .update({
        avg_rating: avgRating,
        total_reviews: totalReviews,
      })
      .eq('id', destinationId);
  }
}
