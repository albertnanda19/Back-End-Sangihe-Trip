import { SupabaseClient } from '@supabase/supabase-js';
export declare class UpdatePasswordUseCase {
    private readonly client;
    constructor(client: SupabaseClient);
    execute(userId: string, currentPassword: string, newPassword: string): Promise<void>;
}
