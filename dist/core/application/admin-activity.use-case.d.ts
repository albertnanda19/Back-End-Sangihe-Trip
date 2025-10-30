import { SupabaseClient } from '@supabase/supabase-js';
export interface AdminActivityListQuery {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    userType?: 'admin' | 'user' | 'all';
}
export interface AdminAlertListQuery {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    severity?: string;
}
export interface ActivityLogData {
    id: number;
    user_id: string;
    action: string;
    model_type: string;
    model_id: string;
    old_values?: any;
    new_values?: any;
    metadata?: any;
    created_at: string;
    users?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}
export declare class AdminActivityUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getActivities(query: AdminActivityListQuery): Promise<any>;
    private getEntityName;
    private getActivityDetails;
    getAlerts(query: AdminAlertListQuery): Promise<any>;
}
