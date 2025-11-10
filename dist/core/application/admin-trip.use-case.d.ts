import { SupabaseClient } from '@supabase/supabase-js';
export interface AdminTripListQuery {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    status?: string;
    tripType?: string;
    userId?: string;
}
export interface AdminTripListResult {
    data: any[];
    meta: {
        page: number;
        limit: number;
        total: number;
    };
}
export declare class AdminTripUseCase {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    list(query: AdminTripListQuery): Promise<AdminTripListResult>;
    getById(id: string): Promise<any>;
    private mapSortField;
}
