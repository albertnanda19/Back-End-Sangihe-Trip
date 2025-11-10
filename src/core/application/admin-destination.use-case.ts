import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';

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
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async list(query: AdminDestinationListQuery): Promise<AdminDestinationListResult> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    // Build query
    let dbQuery = this.supabase
      .from('destinations')
      .select(
        `
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `,
        { count: 'exact' },
      );

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

    // Get review counts for all destinations
    const destinationIds = (data || []).map((d: any) => d.id);
    const { data: reviewCounts } = await this.supabase
      .from('reviews')
      .select('destination_id')
      .in('destination_id', destinationIds);

    // Count reviews per destination
    const reviewCountMap = (reviewCounts || []).reduce((acc: any, review: any) => {
      acc[review.destination_id] = (acc[review.destination_id] || 0) + 1;
      return acc;
    }, {});

    // Format creator for each destination
    const formattedData = (data || []).map((destination: any) => {
      return {
        id: destination.id,
        name: destination.name,
        status: destination.status,
        category: destination.category,
        is_featured: destination.is_featured,
        avg_rating: destination.avg_rating,
        rating_count: destination.rating_count,
        view_count: destination.view_count,
        total_reviews: reviewCountMap[destination.id] || 0,
        created_by: destination.creator
          ? {
              firstName: destination.creator.first_name,
              lastName: destination.creator.last_name,
            }
          : null,
        created_at: destination.created_at,
        updated_at: destination.updated_at,
      };
    });

    return {
      data: formattedData,
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
      .select(
        `
        *,
        creator:users!created_by (
          id,
          first_name,
          last_name
        )
      `,
      )
      .eq('id', id)
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

    // Format creator name
    const { creator, ...destinationData } = destination;
    const creatorObj = creator
      ? {
          firstName: creator.first_name,
          lastName: creator.last_name,
        }
      : null;

    return {
      ...destinationData,
      created_by: creatorObj,
      images: images || [],
    };
  }

  async create(data: any, adminId: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any> {
    // Generate unique slug
    const slug = await this.generateUniqueSlug(data.name);

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
      status: data.status || (data.published ? 'active' : 'inactive'),
      category: data.categories?.[0] || null,
      facilities: data.facilities || [],
      activities: data.activities || [],
      is_featured: false,
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

    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      await this.activityLogger.logAdminAction(
        adminUser.id,
        'create',
        'destination',
        destination.id,
        {
          destinationName: data.name,
          description: `${adminName} created destination "${data.name}"`,
        },
        destination, // newValues: full created destination
        adminName,
        adminUser.email,
        data.name,
        ipAddress,
        userAgent,
      );
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

  async update(id: string, data: any, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any> {
    const existing = await this.getById(id);

    const updateData: any = {};
    if (data.name !== undefined) {
      updateData.name = data.name;
      // Auto-regenerate unique slug when name changes (unless explicit slug provided)
      if (data.slug === undefined) {
        updateData.slug = await this.generateUniqueSlug(data.name, id);
      }
    }
    if (data.slug !== undefined) {
      // If explicit slug provided, ensure it's unique
      updateData.slug = await this.generateUniqueSlug(data.slug, id);
    }
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
    if (data.activities !== undefined) updateData.activities = data.activities;
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

    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      const newName = data.name || existing.name;
      
      // Prepare old values for logging - only include fields that are being changed
      const oldValues: any = {};
      if (data.name !== undefined) oldValues.name = existing.name;
      if (data.description !== undefined) oldValues.description = existing.description;
      if (data.address !== undefined) oldValues.address = existing.address;
      if (data.latitude !== undefined) oldValues.latitude = existing.latitude;
      if (data.longitude !== undefined) oldValues.longitude = existing.longitude;
      if (data.phone !== undefined) oldValues.phone = existing.phone;
      if (data.email !== undefined) oldValues.email = existing.email;
      if (data.website !== undefined) oldValues.website = existing.website;
      if (data.openingHours !== undefined) oldValues.opening_hours = existing.opening_hours;
      if (data.entryFee !== undefined) oldValues.entry_fee = existing.entry_fee;
      if (data.status !== undefined) oldValues.status = existing.status;
      if (data.categories !== undefined) oldValues.category = existing.category;
      if (data.facilities !== undefined) oldValues.facilities = existing.facilities;
      if (data.activities !== undefined) oldValues.activities = existing.activities;
      if (data.isFeatured !== undefined) oldValues.is_featured = existing.is_featured;
      if (data.published !== undefined) oldValues.status = existing.status;
      
      // Prepare new values for logging - only include fields that are being changed
      const newValues: any = {};
      if (data.name !== undefined) newValues.name = data.name;
      if (data.description !== undefined) newValues.description = data.description;
      if (data.address !== undefined) newValues.address = data.address;
      if (data.latitude !== undefined) newValues.latitude = data.latitude;
      if (data.longitude !== undefined) newValues.longitude = data.longitude;
      if (data.phone !== undefined) newValues.phone = data.phone;
      if (data.email !== undefined) newValues.email = data.email;
      if (data.website !== undefined) newValues.website = data.website;
      if (data.openingHours !== undefined) newValues.opening_hours = data.openingHours;
      if (data.entryFee !== undefined) newValues.entry_fee = data.entryFee;
      if (data.status !== undefined) newValues.status = data.status;
      if (data.categories !== undefined) newValues.category = data.categories[0];
      if (data.facilities !== undefined) newValues.facilities = data.facilities;
      if (data.activities !== undefined) newValues.activities = data.activities;
      if (data.isFeatured !== undefined) newValues.is_featured = data.isFeatured;
      if (data.published !== undefined) newValues.status = data.published ? 'active' : 'inactive';
      
      await this.activityLogger.logAdminAction(
        adminUser.id,
        'update',
        'destination',
        id,
        {
          destinationName: newName,
          description: `${adminName} updated destination "${newName}"`,
        },
        newValues,
        adminName,
        adminUser.email,
        newName,
        ipAddress,
        userAgent,
        oldValues,
      );
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

  async delete(id: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<void> {
    const existing = await this.getById(id);

    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      await this.activityLogger.logAdminAction(
        adminUser.id,
        'delete',
        'destination',
        id,
        {
          destinationName: existing.name,
          description: `${adminName} deleted destination "${existing.name}"`,
        },
        null, // newValues: none for delete
        adminName,
        adminUser.email,
        existing.name,
        ipAddress,
        userAgent,
      );
    }

    const { data: tripsWithDest } = await this.supabase
      .from('trip_plans')
      .select('id, days')
      .not('days', 'is', null);

    if (tripsWithDest && tripsWithDest.length > 0) {
      for (const trip of tripsWithDest) {
        const days = trip.days as any[] || [];
        let hasChanges = false;
        
        const updatedDays = days.map((day: any) => {
          const items = (day.items || []).filter((item: any) => item.destination_id !== id);
          if (items.length !== (day.items || []).length) {
            hasChanges = true;
          }
          return { ...day, items };
        });

        if (hasChanges) {
          await this.supabase
            .from('trip_plans')
            .update({ days: updatedDays })
            .eq('id', trip.id);
        }
      }
    }

    // Delete reviews that reference this destination
    const { error: reviewsError } = await this.supabase
      .from('reviews')
      .delete()
      .eq('destination_id', id);

    if (reviewsError) {
      console.error('Error deleting reviews:', reviewsError);
      throw new Error(`Failed to delete related reviews: ${reviewsError.message}`);
    }

    // Delete user favorites for this destination
    const { error: favoritesError } = await this.supabase
      .from('user_favorites')
      .delete()
      .eq('favoritable_type', 'destination')
      .eq('favoritable_id', id);

    if (favoritesError) {
      console.error('Error deleting user favorites:', favoritesError);
      throw new Error(`Failed to delete related user favorites: ${favoritesError.message}`);
    }

    // Delete page views for this destination
    const { error: pageViewsError } = await this.supabase
      .from('page_views')
      .delete()
      .eq('page_type', 'destination')
      .eq('page_id', id);

    if (pageViewsError) {
      console.error('Error deleting page views:', pageViewsError);
      throw new Error(`Failed to delete related page views: ${pageViewsError.message}`);
    }

    // Note: We DO NOT delete activity_logs to maintain audit trail
    // Activity logs should be kept for historical tracking

    // Delete page views for this destination
    const { error: facilityPivotError } = await this.supabase
      .from('destination_facility_pivot')
      .delete()
      .eq('destination_id', id);

    if (facilityPivotError) {
      console.error('Error deleting destination facility pivot:', facilityPivotError);
      throw new Error(`Failed to delete related destination facility pivot: ${facilityPivotError.message}`);
    }

    // Delete destination images
    const { error: imagesError } = await this.supabase
      .from('destination_images')
      .delete()
      .eq('destination_id', id);

    if (imagesError) {
      console.error('Error deleting destination images:', imagesError);
      throw new Error(`Failed to delete related destination images: ${imagesError.message}`);
    }

    // Finally, delete the destination
    const { error } = await this.supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Database error when deleting destination:', error);
      throw new Error(`Failed to delete destination: ${error.message}`);
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

  /**
   * Generate unique slug by checking database and appending number if needed
   */
  private async generateUniqueSlug(
    name: string,
    excludeId?: string,
  ): Promise<string> {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      // Check if slug exists
      let query = this.supabase
        .from('destinations')
        .select('id')
        .eq('slug', slug);

      // Exclude current destination when updating
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw new Error(`Failed to check slug uniqueness: ${error.message}`);
      }

      // If no conflict, slug is unique
      if (!data) {
        return slug;
      }

      // Add counter to slug and try again
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}
