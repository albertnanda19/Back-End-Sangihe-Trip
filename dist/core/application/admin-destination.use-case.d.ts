import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';
export interface AdminDestinationListQuery {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    category?: string;
}
export interface AdminDestinationListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class AdminDestinationUseCase {
    private readonly supabase;
    private readonly activityLogger;
    constructor(supabase: SupabaseClient, activityLogger: ActivityLoggerService);
    list(query: AdminDestinationListQuery): Promise<AdminDestinationListResult>;
    getById(id: string): Promise<any>;
    create(data: any, adminId: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    update(id: string, data: any, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    delete(id: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<void>;
    private mapSortField;
    private generateSlug;
    private generateUniqueSlug;
}
