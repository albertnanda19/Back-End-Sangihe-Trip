import { SupabaseClient } from '@supabase/supabase-js';
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
    constructor(supabase: SupabaseClient);
    list(query: AdminArticleListQuery): Promise<any>;
    getById(id: string): Promise<any>;
    create(data: any, adminId: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string, hard?: boolean): Promise<void>;
    publish(id: string): Promise<any>;
    private generateSlug;
}
