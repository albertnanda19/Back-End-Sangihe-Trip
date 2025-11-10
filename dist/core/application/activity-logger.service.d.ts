import { SupabaseClient } from '@supabase/supabase-js';
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
export declare class ActivityLoggerService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    logActivity(data: ActivityLogData): Promise<void>;
    logUserRegistration(userId: string, userData: any, ipAddress?: string, userAgent?: string): Promise<void>;
    logTripPlanAction(userId: string, action: 'create' | 'update' | 'delete', tripId: string, tripData?: any, oldData?: any, userName?: string, userEmail?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logProfileUpdate(userId: string, oldProfile: any, newProfile: any, userName?: string, userEmail?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logReviewSubmission(userId: string, reviewId: string, reviewData: any, userName?: string, userEmail?: string, destinationName?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logPasswordChange(userId: string, userName?: string, userEmail?: string, ipAddress?: string, userAgent?: string): Promise<void>;
    logLogin(userId: string, userName?: string, userEmail?: string, loginMethod?: string, ipAddress?: string, userAgent?: string, actorRole?: 'user' | 'admin'): Promise<void>;
    logAdminAction(adminId: string, action: string, modelType: string, modelId?: string, details?: any, newValues?: any, adminName?: string, adminEmail?: string, modelName?: string, ipAddress?: string, userAgent?: string, oldValues?: any): Promise<void>;
}
