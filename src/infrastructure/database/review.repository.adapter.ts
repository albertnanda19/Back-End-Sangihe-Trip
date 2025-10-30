/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuid } from 'uuid';
import { Review } from '../../core/domain/review.entity';
import {
  ReviewRepositoryPort,
  ReviewListQuery,
  ReviewWithUser,
  ReviewStats,
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

    const safePageSize = Math.min(Math.max(pageSize, 1), 50);
    const from = (page - 1) * safePageSize;
    const to = from + safePageSize - 1;

    const { data, count, error } = await this.client
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const mapped = (data || []).map(
      (row: any) =>
        new Review(
          row.id,
          row.user_id,
          row.destination_id,
          row.rating,
          row.content || '',
          this.parseImages(row.review_images),
          row.helpful_count ?? 0,
          new Date(row.created_at),
          new Date(row.updated_at),
        ),
    );

    return {
      data: mapped,
      totalItems: count || 0,
    };
  }

  async findAllByDestination(
    query: ReviewListQuery,
    currentUserId?: string,
  ): Promise<{
    data: ReviewWithUser[];
    totalItems: number;
    stats: ReviewStats;
  }> {
    const {
      destinationId,
      page = 1,
      pageSize = 10,
      sortBy = 'newest',
    } = query;

    const safePageSize = Math.min(Math.max(pageSize, 1), 50);
    const from = (page - 1) * safePageSize;
    const to = from + safePageSize - 1;

    let orderColumn = 'created_at';
    let ascending = false;

    switch (sortBy) {
      case 'oldest':
        orderColumn = 'created_at';
        ascending = true;
        break;
      case 'highest':
        orderColumn = 'rating';
        ascending = false;
        break;
      case 'lowest':
        orderColumn = 'rating';
        ascending = true;
        break;
      case 'helpful':
        orderColumn = 'helpful_count';
        ascending = false;
        break;
      default:
        orderColumn = 'created_at';
        ascending = false;
    }

    const { data, count, error } = await this.client
      .from('reviews')
      .select(
        `
        id,
        user_id,
        destination_id,
        rating,
        content,
        helpful_count,
        created_at,
        updated_at,
        users!reviews_user_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `,
        { count: 'exact' },
      )
      .eq('destination_id', destinationId)
      .eq('status', 'active')
      .order(orderColumn, { ascending })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    const reviewIds = (data || []).map((r: any) => r.id);
    const { data: imagesData } = await this.client
      .from('review_images')
      .select('review_id, image_url')
      .in('review_id', reviewIds);

    const imagesByReview = (imagesData || []).reduce(
      (acc: any, img: any) => {
        if (!acc[img.review_id]) acc[img.review_id] = [];
        acc[img.review_id].push(img.image_url);
        return acc;
      },
      {},
    );

    let likedReviews = new Set<string>();
    if (currentUserId && reviewIds.length > 0) {
      const { data: likesData } = await this.client
        .from('review_helpful')
        .select('review_id')
        .eq('user_id', currentUserId)
        .eq('is_helpful', true)
        .in('review_id', reviewIds);

      likedReviews = new Set((likesData || []).map((l: any) => l.review_id));
    }

    const mapped: ReviewWithUser[] = (data || []).map((row: any) => {
      const user = row.users || {};
      return Object.assign(
        new Review(
          row.id,
          row.user_id,
          row.destination_id,
          row.rating,
          row.content || '',
          imagesByReview[row.id] || [],
          row.helpful_count ?? 0,
          new Date(row.created_at),
          new Date(row.updated_at),
        ),
        {
          user: {
            id: user.id || row.user_id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anonymous',
            avatar: user.avatar_url || null,
          },
          isHelpful: likedReviews.has(row.id),
        },
      );
    });

    const stats = await this.getDestinationReviewStats(destinationId!);

    return {
      data: mapped,
      totalItems: count || 0,
      stats,
    };
  }

  async findById(id: string): Promise<Review | null> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);

    const { data: imagesData } = await this.client
      .from('review_images')
      .select('image_url')
      .eq('review_id', id);

    return new Review(
      data.id,
      data.user_id,
      data.destination_id,
      data.rating,
      data.content || '',
      (imagesData || []).map((img: any) => img.image_url),
      data.helpful_count ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }

  async findByUserAndDestination(
    userId: string,
    destinationId: string,
  ): Promise<Review | null> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('destination_id', destinationId)
      .single();

    if (error?.code === 'PGRST116') return null;
    if (error) throw new Error(error.message);

    const { data: imagesData } = await this.client
      .from('review_images')
      .select('image_url')
      .eq('review_id', data.id);

    return new Review(
      data.id,
      data.user_id,
      data.destination_id,
      data.rating,
      data.content || '',
      (imagesData || []).map((img: any) => img.image_url),
      data.helpful_count ?? 0,
      new Date(data.created_at),
      new Date(data.updated_at),
    );
  }

  async create(review: Review): Promise<Review> {
    const reviewId = review.id || uuid();

    const { error: reviewError } = await this.client.from('reviews').insert({
      id: reviewId,
      user_id: review.userId,
      destination_id: review.destinationId,
      rating: review.rating,
      content: review.comment,
      status: review.status,
      helpful_count: 0,
      created_at: review.createdAt.toISOString(),
      updated_at: review.updatedAt.toISOString(),
    });

    if (reviewError) throw new Error(reviewError.message);

    if (review.images && review.images.length > 0) {
      const imageRows = review.images.map((url, index) => ({
        id: uuid(),
        review_id: reviewId,
        image_url: url,
        sort_order: index,
        created_at: new Date().toISOString(),
      }));

      const { error: imagesError } = await this.client
        .from('review_images')
        .insert(imageRows);

      if (imagesError) throw new Error(imagesError.message);
    }

    return new Review(
      reviewId,
      review.userId,
      review.destinationId,
      review.rating,
      review.comment,
      review.images,
      0,
      review.createdAt,
      review.updatedAt,
    );
  }

  async toggleLike(
    reviewId: string,
    userId: string,
  ): Promise<{ helpful: number; isLiked: boolean }> {
    const { data: existingLike } = await this.client
      .from('review_helpful')
      .select('id, is_helpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    let isLiked: boolean;

    if (existingLike) {
      const newIsHelpful = !existingLike.is_helpful;
      const { error } = await this.client
        .from('review_helpful')
        .update({ is_helpful: newIsHelpful })
        .eq('id', existingLike.id);

      if (error) throw new Error(error.message);
      isLiked = newIsHelpful;
    } else {
      const { error } = await this.client.from('review_helpful').insert({
        id: uuid(),
        review_id: reviewId,
        user_id: userId,
        is_helpful: true,
        created_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);
      isLiked = true;
    }

    const { data: review } = await this.client
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single();

    return {
      helpful: review?.helpful_count ?? 0,
      isLiked,
    };
  }

  async isLikedByUser(reviewId: string, userId: string): Promise<boolean> {
    const { data } = await this.client
      .from('review_helpful')
      .select('is_helpful')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    return data?.is_helpful === true;
  }

  private async getDestinationReviewStats(
    destinationId: string,
  ): Promise<ReviewStats> {
    const { data, error } = await this.client
      .from('reviews')
      .select('rating')
      .eq('destination_id', destinationId)
      .eq('status', 'active');

    if (error) throw new Error(error.message);

    const reviews = data || [];
    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      };
    }

    const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    const distribution = reviews.reduce(
      (acc: any, r: any) => {
        const rating = String(r.rating);
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
      },
      { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    );

    return {
      averageRating,
      ratingDistribution: distribution,
    };
  }

  private parseImages(reviewImages: any): string[] {
    if (!Array.isArray(reviewImages)) return [];
    return reviewImages.map((img: any) => img.image_url || '').filter(Boolean);
  }
}
