import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AdminUserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

export interface AdminUserListResult {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class AdminUserUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async list(query: AdminUserListQuery): Promise<AdminUserListResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query - simplified without JOIN first
    let dbQuery = this.supabase
      .from('users')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(
        `email.ilike.%${query.search}%,first_name.ilike.%${query.search}%,last_name.ilike.%${query.search}%`,
      );
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    // Sort by created_at desc
    dbQuery = dbQuery.order('created_at', { ascending: false });

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    // Fetch roles for each user separately
    const usersWithRoles = await Promise.all(
      (data || []).map(async (user: any) => {
        // Get role from users.role_id (single role)
        let roleName: string | null = null;
        if (user.role_id) {
          const { data: roleData } = await this.supabase
            .from('roles')
            .select('name')
            .eq('id', user.role_id)
            .single();

          roleName = roleData?.name || null;
        }

        return {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status,
          email_verified: user.email_verified,
          last_login_at: user.last_login_at,
          created_at: user.created_at,
          role: roleName,
        };
      }),
    );

    return {
      data: usersWithRoles,
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  async getById(id: string): Promise<any> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    // Get user role from users.role_id (single role)
    let role: any = null;
    if (user.role_id) {
      const { data: roleData } = await this.supabase
        .from('roles')
        .select('id, name, description')
        .eq('id', user.role_id)
        .single();

      role = roleData || null;
    }

    // Get user's trip count
    const { count: tripCount } = await this.supabase
      .from('trip_plans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .is('deleted_at', null);

    // Get user's review count
    const { count: reviewCount } = await this.supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', id)
      .is('deleted_at', null);

    return {
      ...user,
      role,
      tripPlansCount: tripCount || 0,
      reviewsCount: reviewCount || 0,
    };
  }

  async update(id: string, data: any): Promise<any> {
    // Check if user exists
    await this.getById(id);

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;

    // Update role if provided (single role)
    if (data.role !== undefined) {
      // Get role ID from role name
      const { data: roleData } = await this.supabase
        .from('roles')
        .select('id')
        .eq('name', data.role)
        .single();

      if (roleData) {
        updateData.role_id = roleData.id;
      }
    }

    // Update user basic info
    if (Object.keys(updateData).length > 0) {
      const { error } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update user: ${error.message}`);
      }
    }

    return this.getById(id);
  }

  async delete(id: string, hard: boolean = false): Promise<void> {
    // Check if user exists
    await this.getById(id);

    if (hard) {
      // Hard delete
      const { error } = await this.supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    } else {
      // Soft delete
      const { error } = await this.supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }
    }
  }
}
