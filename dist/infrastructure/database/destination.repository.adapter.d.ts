import { SupabaseClient } from '@supabase/supabase-js';
import { Destination } from '../../core/domain/destination.entity';
import { DestinationRepositoryPort } from '../../core/domain/destination.repository.port';
export declare class DestinationRepositoryAdapter implements DestinationRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    private toRow;
    save(destination: Destination): Promise<Destination>;
    findAll(query: import('../../core/domain/destination.repository.port').DestinationQuery): Promise<{
        data: Destination[];
        totalItems: number;
    }>;
}
