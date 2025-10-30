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
exports.ActivityLoggerService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const uuid_1 = require("uuid");
let ActivityLoggerService = class ActivityLoggerService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async logActivity(data) {
        try {
            const activityData = {
                id: (0, uuid_1.v4)(),
                user_id: data.userId,
                action: data.action,
                model_type: data.modelType,
                model_id: data.modelId || null,
                old_values: data.oldValues || null,
                new_values: data.newValues || null,
                ip_address: data.ipAddress || null,
                user_agent: data.userAgent || null,
                metadata: data.metadata || null,
                created_at: new Date().toISOString(),
            };
            const { error } = await this.supabase
                .from('activity_logs')
                .insert(activityData);
            if (error) {
                console.error('Failed to log activity:', error);
            }
        }
        catch (error) {
            console.error('Activity logging error:', error);
        }
    }
    async logUserRegistration(userId, userData, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action: 'register',
            modelType: 'user',
            modelId: userId,
            newValues: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                userType: userData.userType,
            },
            ipAddress,
            userAgent,
            metadata: {
                registrationMethod: 'email',
                emailVerified: false,
            },
        });
    }
    async logTripPlanAction(userId, action, tripId, tripData, oldData, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action,
            modelType: 'trip_plan',
            modelId: tripId,
            oldValues: oldData,
            newValues: tripData,
            ipAddress,
            userAgent,
        });
    }
    async logProfileUpdate(userId, oldProfile, newProfile, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action: 'update_profile',
            modelType: 'user_profile',
            modelId: userId,
            oldValues: oldProfile,
            newValues: newProfile,
            ipAddress,
            userAgent,
        });
    }
    async logReviewSubmission(userId, reviewId, reviewData, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action: 'submit_review',
            modelType: 'review',
            modelId: reviewId,
            newValues: {
                destinationId: reviewData.destinationId,
                rating: reviewData.rating,
                commentLength: reviewData.comment?.length || 0,
                imagesCount: reviewData.images?.length || 0,
            },
            ipAddress,
            userAgent,
        });
    }
    async logPasswordChange(userId, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action: 'change_password',
            modelType: 'user',
            modelId: userId,
            ipAddress,
            userAgent,
            metadata: {
                securityEvent: true,
            },
        });
    }
    async logLogin(userId, loginMethod = 'email', ipAddress, userAgent) {
        await this.logActivity({
            userId,
            action: 'login',
            modelType: 'user',
            modelId: userId,
            ipAddress,
            userAgent,
            metadata: {
                loginMethod,
            },
        });
    }
    async logAdminAction(adminId, action, modelType, modelId, details, ipAddress, userAgent) {
        await this.logActivity({
            userId: adminId,
            action,
            modelType,
            modelId,
            newValues: details,
            ipAddress,
            userAgent,
            metadata: {
                adminAction: true,
            },
        });
    }
};
exports.ActivityLoggerService = ActivityLoggerService;
exports.ActivityLoggerService = ActivityLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], ActivityLoggerService);
//# sourceMappingURL=activity-logger.service.js.map