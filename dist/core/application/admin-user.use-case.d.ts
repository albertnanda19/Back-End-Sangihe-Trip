import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';
export interface AdminUserListQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
}
export interface AdminUserListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class AdminUserUseCase {
    private readonly supabase;
    private readonly activityLogger;
    constructor(supabase: SupabaseClient, activityLogger: ActivityLoggerService);
    list(query: AdminUserListQuery): Promise<AdminUserListResult>;
    getById(id: string): Promise<any>;
    update(id: string, data: any, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    delete(id: string, hard?: boolean): Promise<void>;
}
