import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Destination } from '../../core/domain/destination.entity';
import { DestinationRepositoryPort } from '../../core/domain/destination.repository.port';

@Injectable()
export class DestinationRepositoryAdapter implements DestinationRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  // ----------------------------------------------
  // Helper utilities
  // ----------------------------------------------

  /** Converts a DB row to a Destination domain entity */
  private mapRowToEntity(row: any): Destination {
    return new Destination(
      row.id,
      row.name,
      row.slug ?? '',
      row.category,
      {
        address: row.address,
        lat: row.latitude ?? 0,
        lng: row.longitude ?? 0,
      },
      0,
      row.entry_fee ?? 0,
      row.opening_hours ?? '',
      row.description,
      row.facilities ?? [],
      [],
      [],
      undefined,
      row.created_at ? new Date(row.created_at) : new Date(),
      0,
      0,
      0,
      Array.isArray(row.activities) ? row.activities : [],
      row.phone ?? '',
      row.email ?? '',
      row.website ?? '',
      row.is_featured ?? false,
    );
  }

  /**
   * Maps a Destination domain entity to a plain object suitable for the DB.
   */
  private toRow(dest: Destination) {
    const {
      id,
      name,
      category,
      location,
      price,
      openHours,
      description,
      facilities,
      video,
      createdAt,
      activities,
    } = dest;

    return {
      id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
      opening_hours: openHours,
      entry_fee: price,
      category,
      facilities: Array.isArray(facilities) ? facilities : [],
      activities: Array.isArray(activities) ? activities : [],
      video: video ?? null,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  }

  async save(
    destination: Destination,
    _uploadedBy: string,
  ): Promise<Destination> {
    const rowData = this.toRow(destination);

    const { error } = await this.client
      .from('destinations')
      .insert(rowData)
      .select('id')
      .single();

    if (error) {
      // The controller will catch this and trigger the Firebase rollback
      throw new Error(error.message);
    }

    return destination;
  }

  async findAll(
    query: import('../../core/domain/destination.repository.port').DestinationQuery,
  ): Promise<{ data: Destination[]; totalItems: number }> {
    const {
      search,
      category,
      location,
      priceMin,
      priceMax,
      sortBy = 'popular',
      page = 1,
      pageSize = 12,
    } = query;

    let supabaseQuery = this.client
      .from('destinations')
      .select(
        `id, name, slug, category, address, latitude, longitude, phone, email, website, opening_hours, entry_fee, facilities, activities, description, is_featured, avg_rating, total_reviews, created_at`,
        { count: 'exact' },
      )
      .eq('status', 'active');

    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
    }
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    if (location) {
      supabaseQuery = supabaseQuery.ilike('address', `%${location}%`);
    }
    if (typeof query.minRating === 'number') {
      supabaseQuery = supabaseQuery.gte('avg_rating', query.minRating);
    }
    if (typeof priceMin === 'number') {
      supabaseQuery = supabaseQuery.gte('entry_fee', priceMin);
    }
    if (typeof priceMax === 'number') {
      supabaseQuery = supabaseQuery.lte('entry_fee', priceMax);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        supabaseQuery = supabaseQuery.order('entry_fee', { ascending: true });
        break;
      case 'rating':
        supabaseQuery = supabaseQuery.order('avg_rating', { ascending: false, nullsFirst: false });
        break;
      case 'newest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
      default:
        supabaseQuery = supabaseQuery.order('view_count', { ascending: false });
    }

    // Pagination
    const safePageSize = Math.min(Math.max(pageSize, 1), 50);
    const from = (page - 1) * safePageSize;
    const to = from + safePageSize - 1;
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, count, error } = await supabaseQuery;
    if (error) {
      throw new Error(error.message);
    }

    // Map DB rows to Destination domain entities
    const mapped = (data || []).map((row: any) => {
      return new Destination(
        row.id,
        row.name,
        row.slug ?? '',
        row.category,
        {
          address: row.address,
          lat: row.latitude ?? 0,
          lng: row.longitude ?? 0,
        },
        0,
        row.entry_fee ?? 0,
        row.opening_hours ?? '',
        row.description,
        row.facilities ?? [],
        [], // tips
        [],
        undefined, // video
        row.created_at ? new Date(row.created_at) : new Date(),
        0, // rating
        0, // totalReviews
        0, // viewCount
        [], // activities
      );
    });

    return {
      data: mapped,
      totalItems: count || 0,
    };
  }

  // ----------------------------------------------
  // PUBLIC: Get every destination (no pagination)
  // ----------------------------------------------
  async findAllNoPagination(): Promise<Destination[]> {
    const { data, error } = await this.client
      .from('destinations')
      .select(
        'id, name, slug, category, address, latitude, longitude, phone, email, website, opening_hours, entry_fee, description, facilities, activities, is_featured, created_at',
      )
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => this.mapRowToEntity(row));
  }

  /**
   * Delete a destination by id and return the deleted Destination entity.
   * Throws an error if the destination is not found or the deletion fails.
   */
  async delete(id: string): Promise<Destination> {
    // Fetch the destination first to map it back to the domain entity after deletion
    const { data: row, error: fetchError } = await this.client
      .from('destinations')
      .select(
        'id, name, slug, category, address, latitude, longitude, phone, email, website, opening_hours, entry_fee, description, facilities, activities, is_featured, created_at',
      )
      .eq('id', id)
      .single();

    if (fetchError || !row) {
      throw new Error(fetchError?.message || 'Destination not found');
    }

    const destination = new Destination(
      row.id,
      row.name,
      row.slug ?? '',
      row.category,
      {
        address: row.address,
        lat: row.latitude ?? 0,
        lng: row.longitude ?? 0,
      },
      0,
      row.entry_fee,
      row.opening_hours ?? '',
      row.description,
      row.facilities ?? [],
      [],
      [],
      undefined,
      row.created_at ? new Date(row.created_at) : new Date(),
      0,
      0,
      0,
      Array.isArray(row.activities) ? row.activities : [],
      row.phone ?? '',
      row.email ?? '',
      row.website ?? '',
      row.is_featured ?? false,
    );

    // Perform the deletion
    const { error: deleteError } = await this.client
      .from('destinations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return destination;
  }

  /**
   * Find a single destination by its primary key.
   */
  async findById(id: string): Promise<Destination> {
    const { data: row, error } = await this.client
      .from('destinations')
      .select(
        `id, name, slug, category, address, latitude, longitude, phone, email, website, opening_hours, entry_fee, description, facilities, activities, avg_rating, total_reviews, view_count, is_featured, created_at`,
      )
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error || !row) {
      throw new Error(error?.message || 'Destination not found');
    }

    // Normalize facilities column (can be JSON or any)
    const facilities = Array.isArray(row.facilities) ? row.facilities : [];
    
    // Normalize activities column (can be JSON or any)
    const activities = Array.isArray(row.activities) ? row.activities : [];

    const destination = new Destination(
      row.id,
      row.name,
      row.slug ?? '',
      row.category,
      {
        address: row.address,
        lat: row.latitude ?? 0,
        lng: row.longitude ?? 0,
      },
      0, // distanceKm (to be calculated on FE)
      row.entry_fee,
      row.opening_hours ?? '',
      row.description,
      facilities,
      [],
      [],
      undefined,
      row.created_at ? new Date(row.created_at) : new Date(),
      Number(row.avg_rating ?? 0),
      Number(row.total_reviews ?? 0),
      Number(row.view_count ?? 0),
      activities,
      row.phone ?? '',
      row.email ?? '',
      row.website ?? '',
      row.is_featured ?? false,
    );

    return destination;
  }

  /**
   * Find a single destination by slug (WITH view count increment).
   * This is for public access - increments view count automatically.
   */
  async findBySlug(slug: string): Promise<Destination> {
    const { data: row, error } = await this.client
      .from('destinations')
      .select(
        `id, name, slug, category, address, latitude, longitude, phone, email, website, opening_hours, entry_fee, description, facilities, activities, avg_rating, total_reviews, view_count, is_featured, created_at`,
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !row) {
      throw new Error(error?.message || 'Destination not found');
    }

    // Increment view count asynchronously (fire-and-forget)
    void this.incrementViewCount(row.id, row.view_count || 0);

    // Normalize facilities column (can be JSON or any)
    const facilities = Array.isArray(row.facilities) ? row.facilities : [];
    
    // Normalize activities column (can be JSON or any)
    const activities = Array.isArray(row.activities) ? row.activities : [];

    const destination = new Destination(
      row.id,
      row.name,
      row.slug ?? '',
      row.category,
      {
        address: row.address,
        lat: row.latitude ?? 0,
        lng: row.longitude ?? 0,
      },
      0,
      row.entry_fee,
      row.opening_hours ?? '',
      row.description,
      facilities,
      [],
      [],
      undefined,
      row.created_at ? new Date(row.created_at) : new Date(),
      Number(row.avg_rating ?? 0),
      Number(row.total_reviews ?? 0),
      Number(row.view_count ?? 0),
      activities,
      row.phone ?? '',
      row.email ?? '',
      row.website ?? '',
      row.is_featured ?? false,
    );

    return destination;
  }

  /**
   * Increment view count for a destination (fire-and-forget).
   * This method is called asynchronously without blocking the response.
   */
  private async incrementViewCount(
    destinationId: string,
    currentCount: number,
  ): Promise<void> {
    try {
      await this.client
        .from('destinations')
        .update({ view_count: currentCount + 1 })
        .eq('id', destinationId);
    } catch (error) {
      // Silent fail - don't block response if view count update fails
      console.error('Failed to increment destination view count:', error);
    }
  }
}
