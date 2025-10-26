import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AdminActivityListQuery {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  adminId?: string;
}

export interface AdminAlertListQuery {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  severity?: string;
}

@Injectable()
export class AdminActivityUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async getActivities(query: AdminActivityListQuery): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query for admin activity logs
    // Since we don't have an activity_logs table yet, we'll create synthetic data
    // from actual database changes (reviews moderation, destination updates, etc.)
    
    let activities: any[] = [];

    // Get recent review moderations (approve/reject actions)
    const { data: reviews } = await this.supabase
      .from('reviews')
      .select(`
        id,
        status,
        moderated_at,
        moderated_by,
        destination_id,
        destinations(name),
        users!reviews_user_id_fkey(first_name, last_name, email)
      `)
      .not('moderated_at', 'is', null)
      .order('moderated_at', { ascending: false })
      .limit(20);

    if (reviews) {
      reviews.forEach((review: any) => {
        activities.push({
          id: `review_${review.id}`,
          action: review.status === 'active' ? 'approve' : 'reject',
          entityType: 'review',
          entityId: review.id,
          entityName: review.destinations?.name || 'Unknown Destination',
          adminId: review.moderated_by,
          details: `Review for ${review.destinations?.name} by ${review.users?.first_name || 'User'}`,
          timestamp: review.moderated_at,
        });
      });
    }

    // Get recent destination creations/updates
    const { data: destinations } = await this.supabase
      .from('destinations')
      .select('id, name, created_at, updated_at, created_by')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (destinations) {
      destinations.forEach((dest: any) => {
        const isNew = new Date(dest.created_at).getTime() === new Date(dest.updated_at).getTime();
        activities.push({
          id: `destination_${dest.id}`,
          action: isNew ? 'create' : 'update',
          entityType: 'destination',
          entityId: dest.id,
          entityName: dest.name,
          adminId: dest.created_by,
          details: `${isNew ? 'Created' : 'Updated'} destination: ${dest.name}`,
          timestamp: dest.updated_at,
        });
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filters
    if (query.action) {
      activities = activities.filter(a => a.action === query.action);
    }
    if (query.entityType) {
      activities = activities.filter(a => a.entityType === query.entityType);
    }
    if (query.adminId) {
      activities = activities.filter(a => a.adminId === query.adminId);
    }

    const total = activities.length;
    const paginatedActivities = activities.slice(offset, offset + limit);

    return {
      data: paginatedActivities,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getAlerts(query: AdminAlertListQuery): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const alerts: any[] = [];

    // Check for spam reviews (reviews with very short comments or multiple reviews from same user)
    const { data: suspiciousReviews } = await this.supabase
      .from('reviews')
      .select(`
        id,
        comment,
        rating,
        user_id,
        created_at,
        status,
        destinations(id, name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(50);

    if (suspiciousReviews) {
      // Check for very short comments (potential spam)
      suspiciousReviews.forEach((review: any) => {
        if (review.comment && review.comment.length < 20) {
          alerts.push({
            id: `spam_review_${review.id}`,
            type: 'spam_review',
            severity: 'medium',
            status: 'pending',
            title: 'Suspicious Review - Very Short Comment',
            description: `Review for "${review.destinations?.name}" has only ${review.comment.length} characters`,
            entityType: 'review',
            entityId: review.id,
            metadata: {
              reviewId: review.id,
              userId: review.user_id,
              destinationName: review.destinations?.name,
              commentLength: review.comment.length,
            },
            createdAt: review.created_at,
          });
        }
      });

      // Check for users with multiple pending reviews (potential spam)
      const userReviewCounts = suspiciousReviews.reduce((acc: any, review: any) => {
        acc[review.user_id] = (acc[review.user_id] || 0) + 1;
        return acc;
      }, {});

      Object.entries(userReviewCounts).forEach(([userId, count]) => {
        if ((count as number) >= 3) {
          const userReviews = suspiciousReviews.filter((r: any) => r.user_id === userId);
          const firstReview = userReviews[0];
          alerts.push({
            id: `suspicious_user_${userId}`,
            type: 'suspicious_user',
            severity: 'high',
            status: 'pending',
            title: 'Suspicious User Activity - Multiple Pending Reviews',
            description: `User ${userId} has ${count} pending reviews`,
            entityType: 'user',
            entityId: userId,
            metadata: {
              userId,
              pendingReviewsCount: count,
            },
            createdAt: firstReview?.created_at,
          });
        }
      });
    }

    // Check for destinations with low average ratings
    const { data: lowRatedDestinations } = await this.supabase
      .from('destinations')
      .select('id, name, avg_rating, total_reviews')
      .lt('avg_rating', 3.0)
      .gte('total_reviews', 3)
      .limit(10);

    if (lowRatedDestinations) {
      lowRatedDestinations.forEach((dest: any) => {
        alerts.push({
          id: `low_rating_${dest.id}`,
          type: 'low_rating',
          severity: 'low',
          status: 'pending',
          title: 'Low Rated Destination',
          description: `"${dest.name}" has average rating of ${dest.avg_rating} with ${dest.total_reviews} reviews`,
          entityType: 'destination',
          entityId: dest.id,
          metadata: {
            destinationId: dest.id,
            destinationName: dest.name,
            avgRating: dest.avg_rating,
            totalReviews: dest.total_reviews,
          },
          createdAt: new Date().toISOString(),
        });
      });
    }

    // Apply filters
    let filteredAlerts = alerts;
    if (query.status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === query.status);
    }
    if (query.type) {
      filteredAlerts = filteredAlerts.filter(a => a.type === query.type);
    }
    if (query.severity) {
      filteredAlerts = filteredAlerts.filter(a => a.severity === query.severity);
    }

    const total = filteredAlerts.length;
    const paginatedAlerts = filteredAlerts.slice(offset, offset + limit);

    return {
      data: paginatedAlerts,
      meta: {
        page,
        limit,
        total,
      },
    };
  }
}
