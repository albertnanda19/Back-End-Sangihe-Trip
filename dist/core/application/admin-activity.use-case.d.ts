import { SupabaseClient } from '@supabase/supabase-js';
export interface AdminActivityListQuery {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    adminId?: string;
}
export interface AdminAlertListQuery {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    severity?: string;
}
export declare class AdminActivityUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getActivities(query: AdminActivityListQuery): Promise<any>;
    getAlerts(query: AdminAlertListQuery): Promise<any>;
}
