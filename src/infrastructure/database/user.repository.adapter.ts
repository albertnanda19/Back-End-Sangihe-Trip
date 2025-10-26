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
    return new User(
      row.id,
      row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
      row.email,
      row.first_name,
      row.last_name,
      row.avatar_url,
      new Date(row.created_at),
    );
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select()
      .eq('id', id)
      .single();
    if (error) {
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
      throw new Error(
        `Failed to save user: ${error?.message ?? 'Unknown error'}`,
      );
    }

    return this.mapRowToUser(data);
  }

  async update(
    id: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    },
  ): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbData: any = {};

    if (updateData.firstName !== undefined) {
      dbData.first_name = updateData.firstName;
    }
    if (updateData.lastName !== undefined) {
      dbData.last_name = updateData.lastName;
    }
    if (updateData.avatarUrl !== undefined) {
      dbData.avatar_url = updateData.avatarUrl;
    }

    dbData.updated_at = new Date().toISOString();

    const { data, error } = await this.client
      .from('users')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapRowToUser(data);
  }
}
