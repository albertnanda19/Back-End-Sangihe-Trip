import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

export interface AdminDestinationListQuery {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  status?: string;
  category?: string;
}

export interface AdminDestinationListResult {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class AdminDestinationUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async list(query: AdminDestinationListQuery): Promise<AdminDestinationListResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let dbQuery = this.supabase
      .from('destinations')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(
        `name.ilike.%${query.search}%,description.ilike.%${query.search}%,slug.ilike.%${query.search}%`,
      );
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }

    // Apply sorting
    const [sortField, sortOrder] = (query.sort || 'createdAt:desc').split(':');
    const orderColumn = this.mapSortField(sortField);
    dbQuery = dbQuery.order(orderColumn, {
      ascending: sortOrder === 'asc',
    });

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch destinations: ${error.message}`);
    }

    return {
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  async getById(id: string): Promise<any> {
    const { data: destination, error: destError } = await this.supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (destError || !destination) {
      throw new NotFoundException('Destination not found');
    }

    // Get images
    const { data: images } = await this.supabase
      .from('destination_images')
      .select('*')
      .eq('destination_id', id)
      .order('sort_order', { ascending: true });

    return {
      ...destination,
      images: images || [],
    };
  }

  async create(data: any, adminId: string): Promise<any> {
    const slug =
      data.slug || this.generateSlug(data.name);

    const destinationData: any = {
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      phone: data.phone,
      email: data.email,
      website: data.website,
      opening_hours: data.openingHours,
      entry_fee: data.entryFee || 0,
      status: data.status || (data.published ? 'active' : 'pending'),
      category: data.categories?.[0] || null,
      facilities: data.facilities || [],
      is_featured: data.isFeatured || false,
      created_by: adminId,
    };

    const { data: destination, error } = await this.supabase
      .from('destinations')
      .insert(destinationData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create destination: ${error.message}`);
    }

    // Insert images if provided
    if (data.images && data.images.length > 0) {
      const imageData = data.images.map((img: any, index: number) => ({
        destination_id: destination.id,
        image_url: img.url,
        alt_text: img.alt,
        caption: img.caption,
        is_featured: img.isFeatured || false,
        sort_order: index,
        uploaded_by: adminId,
      }));

      await this.supabase.from('destination_images').insert(imageData);
    }

    return this.getById(destination.id);
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.getById(id);

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.openingHours !== undefined)
      updateData.opening_hours = data.openingHours;
    if (data.entryFee !== undefined) updateData.entry_fee = data.entryFee;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.categories !== undefined)
      updateData.category = data.categories[0];
    if (data.facilities !== undefined) updateData.facilities = data.facilities;
    if (data.isFeatured !== undefined)
      updateData.is_featured = data.isFeatured;
    if (data.published !== undefined)
      updateData.status = data.published ? 'active' : 'inactive';

    const { error } = await this.supabase
      .from('destinations')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update destination: ${error.message}`);
    }

    // Update images if provided
    if (data.images !== undefined) {
      // Delete existing images
      await this.supabase
        .from('destination_images')
        .delete()
        .eq('destination_id', id);

      // Insert new images
      if (data.images.length > 0) {
        const imageData = data.images.map((img: any, index: number) => ({
          destination_id: id,
          image_url: img.url,
          alt_text: img.alt,
          caption: img.caption,
          is_featured: img.isFeatured || false,
          sort_order: index,
        }));

        await this.supabase.from('destination_images').insert(imageData);
      }
    }

    return this.getById(id);
  }

  async delete(id: string, hard: boolean = false): Promise<void> {
    const existing = await this.getById(id);

    if (hard) {
      // Hard delete
      const { error } = await this.supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete destination: ${error.message}`);
      }
    } else {
      // Soft delete
      const { error } = await this.supabase
        .from('destinations')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete destination: ${error.message}`);
      }
    }
  }

  private mapSortField(field: string): string {
    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      name: 'name',
      rating: 'avg_rating',
      viewCount: 'view_count',
    };
    return mapping[field] || 'created_at';
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
