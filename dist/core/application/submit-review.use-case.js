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
exports.SubmitReviewUseCase = void 0;
const common_1 = require("@nestjs/common");
const review_entity_1 = require("../domain/review.entity");
const system_settings_service_1 = require("./system-settings.service");
const activity_logger_service_1 = require("./activity-logger.service");
const uuid_1 = require("uuid");
let SubmitReviewUseCase = class SubmitReviewUseCase {
    reviewRepository;
    systemSettingsService;
    activityLogger;
    supabase;
    constructor(reviewRepository, systemSettingsService, activityLogger, supabase) {
        this.reviewRepository = reviewRepository;
        this.systemSettingsService = systemSettingsService;
        this.activityLogger = activityLogger;
        this.supabase = supabase;
    }
    async execute(userId, dto) {
        const hasCompletedTrip = await this.checkUserCompletedTrip(userId, dto.destinationId);
        if (!hasCompletedTrip) {
            throw new common_1.BadRequestException('You can only review destinations from completed trips');
        }
        const existingReview = await this.reviewRepository.findByUserAndDestination(userId, dto.destinationId);
        if (existingReview) {
            throw new common_1.BadRequestException('You have already submitted a review for this destination');
        }
        if (dto.images && dto.images.length > 5) {
            throw new common_1.BadRequestException('Maximum 5 images allowed per review');
        }
        const isModerationEnabled = await this.systemSettingsService.isReviewModerationEnabled();
        const defaultStatus = isModerationEnabled ? 'pending' : 'active';
        const review = new review_entity_1.Review((0, uuid_1.v4)(), userId, dto.destinationId, dto.rating, dto.comment, dto.images || [], 0, new Date(), new Date(), defaultStatus);
        const createdReview = await this.reviewRepository.create(review);
        await this.activityLogger.logReviewSubmission(userId, createdReview.id, {
            destinationId: dto.destinationId,
            rating: dto.rating,
            comment: dto.comment,
            images: dto.images,
        });
        return createdReview;
    }
    async checkUserCompletedTrip(userId, destinationId) {
        const { data, error } = await this.supabase
            .from('trip_plans')
            .select('id, days')
            .eq('user_id', userId)
            .eq('status', 'completed')
            .not('days', 'is', null);
        if (error) {
            console.error('Error checking completed trip:', error);
            return false;
        }
        if (!data || data.length === 0) {
            return false;
        }
        for (const trip of data) {
            const days = trip.days || [];
            for (const day of days) {
                const items = (day.items || []);
                if (items.some((item) => item.destination_id === destinationId)) {
                    return true;
                }
            }
        }
        return false;
    }
};
exports.SubmitReviewUseCase = SubmitReviewUseCase;
exports.SubmitReviewUseCase = SubmitReviewUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ReviewRepository')),
    __param(3, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [Object, system_settings_service_1.SystemSettingsService,
        activity_logger_service_1.ActivityLoggerService, Object])
], SubmitReviewUseCase);
//# sourceMappingURL=submit-review.use-case.js.map