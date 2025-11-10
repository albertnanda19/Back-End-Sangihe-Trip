import { SupabaseClient } from '@supabase/supabase-js';
export interface AdminActivityListQuery {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    entityId?: string;
    userId?: string;
    search?: string;
    search_fields?: string;
    dateFrom?: string;
    dateTo?: string;
    ipAddress?: string;
    actorRole?: string;
}
export interface AdminAlertListQuery {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    severity?: string;
}
export interface ActivityLogData {
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    action: string;
    model_type: string;
    model_id: string;
    model_name: string;
    description: string;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
}
export declare class AdminActivityUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getActivities(query: AdminActivityListQuery): Promise<any>;
    private formatActivityDescription;
    private getEntityName;
    private getActivityDetails;
    getAlerts(query: AdminAlertListQuery): Promise<any>;
}
