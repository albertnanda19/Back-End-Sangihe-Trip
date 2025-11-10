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
exports.AdminReviewUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const activity_logger_service_1 = require("./activity-logger.service");
let AdminReviewUseCase = class AdminReviewUseCase {
    supabase;
    activityLogger;
    constructor(supabase, activityLogger) {
        this.supabase = supabase;
        this.activityLogger = activityLogger;
    }
    async list(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        let dbQuery = this.supabase
            .from('reviews')
            .select(`
        *,
        users!reviews_user_id_fkey(id, first_name, last_name, email),
        destinations!reviews_destination_id_fkey(id, name, slug)
      `, { count: 'exact' })
            .is('deleted_at', null);
        if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        if (query.destinationId) {
            dbQuery = dbQuery.eq('destination_id', query.destinationId);
        }
        if (query.search) {
            dbQuery = dbQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%`);
        }
        dbQuery = dbQuery.order('created_at', { ascending: false });
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
    async getById(id) {
        const { data: review, error } = await this.supabase
            .from('reviews')
            .select(`
        *,
        users!reviews_user_id_fkey(id, first_name, last_name, email, avatar_url),
        destinations!reviews_destination_id_fkey(id, name, slug),
        review_images(*)
      `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error || !review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    async approve(reviewId, adminId, moderatorNote, adminUser, ipAddress, userAgent) {
        const review = await this.getById(reviewId);
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
        await this.recalculateDestinationRating(review.destination_id);
        const updatedReview = await this.getById(reviewId);
        if (adminUser) {
            const adminName = adminUser.name || 'Admin';
            const reviewTitle = review.title || `Review for ${review.destinations?.name || 'Destination'}`;
            await this.activityLogger.logAdminAction(adminUser.id, 'update', 'review', reviewId, {
                reviewTitle,
                description: `${adminName} approved review "${reviewTitle}"`,
            }, {
                status: 'active',
                moderated_by: adminId,
                moderation_notes: moderatorNote,
            }, adminName, adminUser.email, reviewTitle, ipAddress, userAgent, {
                status: review.status,
            });
        }
        return updatedReview;
    }
    async reject(reviewId, adminId, reason, moderatorNote, adminUser, ipAddress, userAgent) {
        const review = await this.getById(reviewId);
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
        await this.recalculateDestinationRating(review.destination_id);
        const updatedReview = await this.getById(reviewId);
        if (adminUser) {
            const adminName = adminUser.name || 'Admin';
            const reviewTitle = review.title || `Review for ${review.destinations?.name || 'Destination'}`;
            await this.activityLogger.logAdminAction(adminUser.id, 'update', 'review', reviewId, {
                reviewTitle,
                description: `${adminName} rejected review "${reviewTitle}"`,
            }, {
                status: 'rejected',
                moderated_by: adminId,
                moderation_notes: moderatorNote ? `${reason}. ${moderatorNote}` : reason,
            }, adminName, adminUser.email, reviewTitle, ipAddress, userAgent, {
                status: review.status,
            });
        }
        return updatedReview;
    }
    async recalculateDestinationRating(destinationId) {
        const { data: activeReviews } = await this.supabase
            .from('reviews')
            .select('rating')
            .eq('destination_id', destinationId)
            .eq('status', 'active')
            .is('deleted_at', null);
        const totalReviews = activeReviews?.length || 0;
        let avgRating = 0;
        if (totalReviews > 0) {
            const sumRating = activeReviews.reduce((sum, review) => sum + review.rating, 0);
            avgRating = Math.round((sumRating / totalReviews) * 100) / 100;
        }
        await this.supabase
            .from('destinations')
            .update({
            avg_rating: avgRating,
            total_reviews: totalReviews,
        })
            .eq('id', destinationId);
    }
};
exports.AdminReviewUseCase = AdminReviewUseCase;
exports.AdminReviewUseCase = AdminReviewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        activity_logger_service_1.ActivityLoggerService])
], AdminReviewUseCase);
//# sourceMappingURL=admin-review.use-case.js.map