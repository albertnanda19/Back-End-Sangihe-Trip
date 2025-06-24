import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../core/domain/user.entity';
import { UserRepositoryPort } from '../../core/domain/user.repository.port';

@Injectable()
export class UserRepositoryAdapter implements UserRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  /**
   * Transforms a raw database row into a `User` domain entity.
   * Keeping it isolated satisfies DRY and SSOT principles.
   */
  private mapRowToUser(row: any): User {
    return new User(row.id, row.name, row.email, new Date(row.created_at));
  }

  

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select()
      .eq('id', id)
      .single();
    if (error) {
      // Treat DB errors as "not found" for this query context
      return null;
    }
    if (!data) return null;
    return this.mapRowToUser(data);
  }

  async save(user: User): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert({ id: user.id, name: user.name, email: user.email })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to save user: ${error?.message ?? 'Unknown error'}`);
    }

    return this.mapRowToUser(data);
  }
}
