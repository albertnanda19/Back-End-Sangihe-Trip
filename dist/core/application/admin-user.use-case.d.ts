import { SupabaseClient } from '@supabase/supabase-js';
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
    constructor(supabase: SupabaseClient);
    list(query: AdminUserListQuery): Promise<AdminUserListResult>;
    getById(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string, hard?: boolean): Promise<void>;
}
