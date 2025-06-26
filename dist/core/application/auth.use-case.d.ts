import { SupabaseClient } from '@supabase/supabase-js';
import { JwtService } from '@nestjs/jwt';
import { User } from '../domain/user.entity';
export declare class AuthUseCase {
    private readonly client;
    private readonly jwt;
    constructor(client: SupabaseClient, jwt: JwtService);
    private mapRowToUser;
    execute(dto: {
        name: string;
        email: string;
        password: string;
    }): Promise<User>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
