import { SupabaseClient } from '@supabase/supabase-js';
export declare class SystemSettingsService {
    private readonly supabase;
    constructor(supabase: SupabaseClient);
    getSetting(key: string): Promise<any>;
    isReviewModerationEnabled(): Promise<boolean>;
    getMaxUploadSize(): Promise<number>;
    getSupportedImageTypes(): Promise<string[]>;
}
