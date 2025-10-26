import { SupabaseClient } from '@supabase/supabase-js';
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
    constructor(supabase: SupabaseClient);
    list(query: AdminDestinationListQuery): Promise<AdminDestinationListResult>;
    getById(id: string): Promise<any>;
    create(data: any, adminId: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string, hard?: boolean): Promise<void>;
    private mapSortField;
    private generateSlug;
}
