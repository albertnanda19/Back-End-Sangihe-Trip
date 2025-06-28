import { AppService } from './app.service';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class AppController {
    private readonly appService;
    private readonly supabase;
    constructor(appService: AppService, supabase: SupabaseClient);
    getHello(): string;
    testDbConnection(): Promise<any[]>;
}
