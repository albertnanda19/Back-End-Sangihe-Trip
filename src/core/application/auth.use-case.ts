import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { User } from '../domain/user.entity';


/**
 * AuthUseCase is responsible only for authenticating users (Curly's Law).
 * It does not concern itself with HTTP or DB implementation details.
 */
@Injectable()
export class AuthUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  private mapRowToUser(row: any): User {
    return new User(row.id, `${row.first_name} ${row.last_name}`.trim(), row.email, new Date(row.created_at));
  }

  async execute(dto: { name: string; email: string; password: string }): Promise<User> {
    const { email, password, name } = dto;

    // 1. Ensure email is not already registered
    const { data: existing } = await this.client
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new ConflictException('Email telah terdaftar');
    }

    // 2. Create new user
    const hashed = await bcrypt.hash(password, 10);
    const newUserId = uuidv4();
    const { data: created, error: insertErr } = await this.client
      .from('users')
      .insert({ id: newUserId, email, password_hash: hashed, first_name: name, last_name: '' })
      .select()
      .single();
    if (insertErr || !created) {
      throw new Error(insertErr?.message ?? 'Failed to create account');
    }

    const user = this.mapRowToUser(created);
    return user;
  }
}
