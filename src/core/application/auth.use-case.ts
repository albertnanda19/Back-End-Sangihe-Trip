import { Inject, Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
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
    private readonly jwt: JwtService,
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

  async login(dto: { email: string; password: string }): Promise<{ access_token: string; refresh_token: string }> {
    const { email, password } = dto;
    const { data: row } = await this.client
      .from('users')
      .select('id, first_name, last_name, email, password_hash, role_id')
      .eq('email', email)
      .single();

    if (!row) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isMatch = await bcrypt.compare(password, row.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Fetch role name based on user's role_id
    const { data: roleRow } = await this.client
      .from('roles')
      .select('name')
      .eq('id', row.role_id)
      .single();

    const role = roleRow?.name ?? null;

    const name = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim();
    const issuer = process.env.JWT_ISSUER ?? 'sangihe-trip';
    const audience = process.env.JWT_AUDIENCE ?? 'sangihe-trip';

    const accessPayload = {
      id: row.id,
      name,
      email: row.email,
      role,
      iss: issuer,
      aud: audience,
      type: 'access',
    } as const;

    const refreshPayload = {
      iss: issuer,
      aud: audience,
      type: 'refresh',
    } as const;

    const access_token = this.jwt.sign(accessPayload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
    });

    const refresh_token = this.jwt.sign(refreshPayload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    return { access_token, refresh_token };
  }
}
