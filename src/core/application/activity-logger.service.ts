import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface ActivityLogData {
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  modelType: string;
  modelId?: string;
  modelName?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  actorRole?: 'user' | 'admin';
}

@Injectable()
export class ActivityLoggerService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async logActivity(data: ActivityLogData): Promise<void> {
    try {
      const activityData = {
        id: uuidv4(),
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
        // Don't throw error to avoid breaking the main flow
      }
    } catch (error) {
      console.error('Activity logging error:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async logUserRegistration(userId: string, userData: any, ipAddress?: string, userAgent?: string): Promise<void> {
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

  async logTripPlanAction(
    userId: string,
    action: 'create' | 'update' | 'delete',
    tripId: string,
    tripData?: any,
    oldData?: any,
    userName?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logProfileUpdate(
    userId: string,
    oldProfile: any,
    newProfile: any,
    userName?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logReviewSubmission(
    userId: string,
    reviewId: string,
    reviewData: any,
    userName?: string,
    userEmail?: string,
    destinationName?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logPasswordChange(
    userId: string,
    userName?: string,
    userEmail?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logLogin(
    userId: string,
    userName?: string,
    userEmail?: string,
    loginMethod: string = 'email',
    ipAddress?: string,
    userAgent?: string,
    actorRole: 'user' | 'admin' = 'user',
  ): Promise<void> {
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

  async logAdminAction(
    adminId: string,
    action: string,
    modelType: string,
    modelId?: string,
    details?: any,
    newValues?: any,
    adminName?: string,
    adminEmail?: string,
    modelName?: string,
    ipAddress?: string,
    userAgent?: string,
    oldValues?: any,
  ): Promise<void> {
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
}