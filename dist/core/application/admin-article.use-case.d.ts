import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';
export interface AdminArticleListQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
    sortBy?: string;
    sortOrder?: string;
}
export declare class AdminArticleUseCase {
    private readonly supabase;
    private readonly activityLogger;
    constructor(supabase: SupabaseClient, activityLogger: ActivityLoggerService);
    list(query: AdminArticleListQuery): Promise<any>;
    getById(id: string): Promise<any>;
    create(data: any, adminId: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    update(id: string, data: any, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    delete(id: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<void>;
    publish(id: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any>;
    private generateSlug;
    private generateUniqueSlug;
    private calculateReadingTime;
}
