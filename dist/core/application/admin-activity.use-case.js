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
        let dbQuery = this.supabase
            .from('activity_logs')
            .select(`
        *,
        users!activity_logs_user_id_fkey(first_name, last_name, email)
      `, { count: 'exact' })
            .order('created_at', { ascending: false });
        if (query.action) {
            dbQuery = dbQuery.eq('action', query.action);
        }
        if (query.entityType) {
            dbQuery = dbQuery.eq('model_type', query.entityType);
        }
        if (query.entityId) {
            dbQuery = dbQuery.eq('model_id', query.entityId);
        }
        if (query.userId) {
            dbQuery = dbQuery.eq('user_id', query.userId);
        }
        if (query.ipAddress) {
            dbQuery = dbQuery.eq('ip_address', query.ipAddress);
        }
        if (query.dateFrom) {
            dbQuery = dbQuery.gte('created_at', query.dateFrom);
        }
        if (query.dateTo) {
            dbQuery = dbQuery.lte('created_at', query.dateTo);
        }
        if (query.actorRole) {
            dbQuery = dbQuery.eq('actor_role', query.actorRole);
        }
        if (!query.search || !query.search_fields) {
            dbQuery = dbQuery.range(offset, offset + limit - 1);
        }
        const { data: loggedActivities, count, error } = await dbQuery;
        if (error) {
            console.error('Error fetching activities:', error);
            throw new Error(`Failed to fetch activities: ${error.message}`);
        }
        let finalActivities = loggedActivities || [];
        let finalTotal = count || 0;
        if (query.search && query.search_fields) {
            const searchTerm = query.search.toLowerCase();
            const searchFields = query.search_fields.split(',').map((f) => f.trim());
            finalActivities = finalActivities.filter((activity) => {
                return searchFields.some((field) => {
                    switch (field) {
                        case 'entityName':
                            return activity.model_name?.toLowerCase().includes(searchTerm);
                        case 'userName': {
                            const fullName = activity.users
                                ? `${activity.users.first_name} ${activity.users.last_name}`.trim()
                                : '';
                            return fullName.toLowerCase().includes(searchTerm);
                        }
                        case 'userEmail':
                            return activity.users?.email?.toLowerCase().includes(searchTerm);
                        default:
                            return false;
                    }
                });
            });
            finalTotal = finalActivities.length;
            const searchOffset = (page - 1) * limit;
            finalActivities = finalActivities.slice(searchOffset, searchOffset + limit);
        }
        const activities = finalActivities.map((activity) => ({
            id: activity.id,
            action: activity.action,
            entityType: activity.model_type,
            entityId: activity.model_id,
            entityName: activity.model_name || activity.model_type || 'Unknown',
            userId: activity.user_id,
            userName: activity.users ?
                `${activity.users.first_name} ${activity.users.last_name}`.trim() :
                'Unknown User',
            userEmail: activity.users?.email || '',
            actorRole: activity.actor_role || 'user',
            details: activity.description || this.formatActivityDescription(activity),
            timestamp: activity.created_at,
            oldValues: activity.old_values,
            newValues: activity.new_values,
            ipAddress: activity.ip_address,
            userAgent: activity.user_agent,
        }));
        return {
            data: activities,
            meta: {
                page,
                limit,
                total: finalTotal,
            },
        };
    }
    formatActivityDescription(activity) {
        const action = activity.action;
        const entityType = activity.model_type;
        const entityName = activity.model_name || activity.new_values?.name || activity.new_values?.title || 'item';
        const userName = activity.user_name || 'User';
        const actionDescriptions = {
            create: `${userName} created ${entityType} "${entityName}"`,
            update: `${userName} updated ${entityType} "${entityName}"`,
            delete: `${userName} deleted ${entityType} "${entityName}"`,
            login: `${userName} logged in`,
            logout: `${userName} logged out`,
            register: `${userName} registered`,
            approve: `${userName} approved ${entityType} "${entityName}"`,
            reject: `${userName} rejected ${entityType} "${entityName}"`,
            submit: `${userName} submitted ${entityType} "${entityName}"`,
        };
        return actionDescriptions[action] || `${userName} performed ${action} on ${entityType}`;
    }
    getEntityName(activity) {
        switch (activity.model_type) {
            case 'trip_plan':
                return 'Trip Plan';
            case 'review':
                return 'Review';
            case 'user':
                return 'User Profile';
            case 'article':
                return 'Article';
            default:
                return activity.model_type || 'Unknown';
        }
    }
    getActivityDetails(activity) {
        const action = activity.action;
        const entityType = activity.model_type;
        const userName = activity.users ? `${activity.users.first_name} ${activity.users.last_name}`.trim() : 'Unknown User';
        switch (action) {
            case 'user_registration':
                return `${userName} registered a new account`;
            case 'user_login':
                return `${userName} logged into their account`;
            case 'create_trip_plan':
                return `${userName} created a new trip plan`;
            case 'update_trip_plan':
                return `${userName} updated their trip plan`;
            case 'delete_trip_plan':
                return `${userName} deleted their trip plan`;
            case 'update_profile':
                return `${userName} updated their profile`;
            case 'submit_review':
                return `${userName} submitted a review`;
            default:
                return `${userName} performed ${action} on ${entityType}`;
        }
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