import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../core/domain/user.entity';
import { UserRepositoryPort } from '../../core/domain/user.repository.port';
export declare class UserRepositoryAdapter implements UserRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    private mapRowToUser;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
}
