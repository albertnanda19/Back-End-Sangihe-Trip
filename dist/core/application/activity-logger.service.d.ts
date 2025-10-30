import { SupabaseClient } from '@supabase/supabase-js';
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
export declare class ActivityLoggerService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    logActivity(data: ActivityLogData): Promise<void>;
    logUserRegistration(userId: string, userData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logTripPlanAction(userId: string, action: 'create_trip' | 'update_trip' | 'delete_trip', tripId: string, tripData?: any, oldData?: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logProfileUpdate(userId: string, oldProfile: any, newProfile: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logReviewSubmission(userId: string, reviewId: string, reviewData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logLogin(userId: string, loginMethod?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logAdminAction(adminId: string, action: string, modelType: string, modelId?: string, details?: any, ipAddress?: string, userAgent?: string): Promise<void>;
}
