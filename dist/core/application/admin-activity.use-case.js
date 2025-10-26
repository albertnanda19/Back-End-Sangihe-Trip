"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminActivityUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let AdminActivityUseCase = class AdminActivityUseCase {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getActivities(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        let activities = [];
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
            reviews.forEach((review) => {
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
        const { data: destinations } = await this.supabase
            .from('destinations')
            .select('id, name, created_at, updated_at, created_by')
            .order('updated_at', { ascending: false })
            .limit(20);
        if (destinations) {
            destinations.forEach((dest) => {
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
        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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
    async getAlerts(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        const alerts = [];
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
            suspiciousReviews.forEach((review) => {
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
            const userReviewCounts = suspiciousReviews.reduce((acc, review) => {
                acc[review.user_id] = (acc[review.user_id] || 0) + 1;
                return acc;
            }, {});
            Object.entries(userReviewCounts).forEach(([userId, count]) => {
                if (count >= 3) {
                    const userReviews = suspiciousReviews.filter((r) => r.user_id === userId);
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
        const { data: lowRatedDestinations } = await this.supabase
            .from('destinations')
            .select('id, name, avg_rating, total_reviews')
            .lt('avg_rating', 3.0)
            .gte('total_reviews', 3)
            .limit(10);
        if (lowRatedDestinations) {
            lowRatedDestinations.forEach((dest) => {
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
};
exports.AdminActivityUseCase = AdminActivityUseCase;
exports.AdminActivityUseCase = AdminActivityUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], AdminActivityUseCase);
//# sourceMappingURL=admin-activity.use-case.js.map