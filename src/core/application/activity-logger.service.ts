import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface ActivityLogData {
  userId: string;
  action: string;
  modelType: string;
  modelId?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
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
        // Don't throw error to avoid breaking the main flow
      }
    } catch (error) {
      console.error('Activity logging error:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  async logUserRegistration(userId: string, userData: any, ipAddress?: string, userAgent?: string): Promise<void> {
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

  async logTripPlanAction(
    userId: string,
    action: 'create_trip' | 'update_trip' | 'delete_trip',
    tripId: string,
    tripData?: any,
    oldData?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logProfileUpdate(
    userId: string,
    oldProfile: any,
    newProfile: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logReviewSubmission(
    userId: string,
    reviewId: string,
    reviewData: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logLogin(
    userId: string,
    loginMethod: string = 'email',
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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

  async logAdminAction(
    adminId: string,
    action: string,
    modelType: string,
    modelId?: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
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
}