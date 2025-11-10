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
                user_name: data.userName || null,
                user_email: data.userEmail || null,
                action: data.action,
                model_type: data.modelType,
                model_id: data.modelId || null,
                model_name: data.modelName || null,
                description: data.description || null,
                old_values: data.oldValues || null,
                new_values: data.newValues || null,
                ip_address: data.ipAddress || null,
                user_agent: data.userAgent || null,
                metadata: data.metadata || null,
                actor_role: data.actorRole || null,
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
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        await this.logActivity({
            userId,
            userName: fullName,
            userEmail: userData.email,
            action: 'register',
            modelType: 'auth',
            modelId: userId,
            modelName: fullName,
            description: `${fullName} registered a new account`,
            newValues: {
                email: userData.email,
                firstName: userData.firstName,
                lastName: userData.lastName,
                userType: userData.userType,
            },
            ipAddress,
            userAgent,
            actorRole: 'user',
            metadata: {
                registrationMethod: 'email',
                emailVerified: false,
            },
        });
    }
    async logTripPlanAction(userId, action, tripId, tripData, oldData, userName, userEmail, ipAddress, userAgent) {
        const tripName = tripData?.name || oldData?.name || 'Trip Plan';
        const actionMap = { create: 'created', update: 'updated', delete: 'deleted' };
        const actionPast = actionMap[action];
        await this.logActivity({
            userId,
            userName,
            userEmail,
            action,
            modelType: 'trip_plan',
            modelId: tripId,
            modelName: tripName,
            description: `${userName || 'User'} ${actionPast} trip plan "${tripName}"`,
            oldValues: oldData,
            newValues: tripData,
            ipAddress,
            userAgent,
            actorRole: 'user',
        });
    }
    async logProfileUpdate(userId, oldProfile, newProfile, userName, userEmail, ipAddress, userAgent) {
        const fullName = `${newProfile?.firstName || oldProfile?.firstName || ''} ${newProfile?.lastName || oldProfile?.lastName || ''}`.trim();
        await this.logActivity({
            userId,
            userName: userName || fullName,
            userEmail: userEmail || newProfile?.email || oldProfile?.email,
            action: 'update',
            modelType: 'user',
            modelId: userId,
            modelName: userName || fullName,
            description: `${userName || fullName || 'User'} updated their profile`,
            oldValues: oldProfile,
            newValues: newProfile,
            ipAddress,
            userAgent,
            actorRole: 'user',
        });
    }
    async logReviewSubmission(userId, reviewId, reviewData, userName, userEmail, destinationName, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            userName,
            userEmail,
            action: 'create',
            modelType: 'review',
            modelId: reviewId,
            modelName: destinationName || 'Destination',
            description: `${userName || 'User'} submitted a review for "${destinationName || 'destination'}" with ${reviewData.rating}/5 rating`,
            newValues: {
                destinationId: reviewData.destinationId,
                rating: reviewData.rating,
                commentLength: reviewData.comment?.length || 0,
                imagesCount: reviewData.images?.length || 0,
            },
            ipAddress,
            userAgent,
            actorRole: 'user',
        });
    }
    async logPasswordChange(userId, userName, userEmail, ipAddress, userAgent) {
        await this.logActivity({
            userId,
            userName,
            userEmail,
            action: 'update',
            modelType: 'user',
            modelId: userId,
            modelName: userName,
            description: `${userName || 'User'} changed their password`,
            ipAddress,
            userAgent,
            actorRole: 'user',
            metadata: {
                securityEvent: true,
                updateType: 'password',
            },
        });
    }
    async logLogin(userId, userName, userEmail, loginMethod = 'email', ipAddress, userAgent, actorRole = 'user') {
        await this.logActivity({
            userId,
            userName,
            userEmail,
            action: 'login',
            modelType: 'auth',
            modelId: userId,
            modelName: userName,
            description: `${userName || 'User'} logged in via ${loginMethod}`,
            ipAddress,
            userAgent,
            actorRole,
            metadata: {
                loginMethod,
            },
        });
    }
    async logAdminAction(adminId, action, modelType, modelId, details, newValues, adminName, adminEmail, modelName, ipAddress, userAgent, oldValues) {
        const actionDescription = details?.description || `Admin performed ${action} on ${modelType}`;
        await this.logActivity({
            userId: adminId,
            userName: adminName,
            userEmail: adminEmail,
            action,
            modelType,
            modelId,
            modelName,
            description: actionDescription,
            oldValues,
            newValues: newValues || details,
            ipAddress,
            userAgent,
            actorRole: 'admin',
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