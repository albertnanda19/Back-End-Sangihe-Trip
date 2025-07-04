import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Destination } from '../../core/domain/destination.entity';
import { DestinationRepositoryPort } from '../../core/domain/destination.repository.port';

@Injectable()
export class DestinationRepositoryAdapter implements DestinationRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  /**
   * Maps a Destination domain entity to a plain object suitable for the DB.
   */
  private toRow(dest: Destination) {
    const {
      id,
      name,
      category,
      location,
      distanceKm,
      price,
      openHours,
      description,
      facilities,
      tips,
      images,
      video,
      createdAt,
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
      price,
      entry_fee: price, // for backward compatibility, but prefer price
      category,
      facilities: Array.isArray(facilities) ? facilities : [],
      images: Array.isArray(images) ? images : [],
      video: video ?? null,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
    };
  }

  async save(destination: Destination): Promise<Destination> {
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

  async findAll(query: import('../../core/domain/destination.repository.port').DestinationQuery): Promise<{ data: Destination[]; totalItems: number }> {
    const {
      search,
      category,
      location,
      minRating,
      priceMin,
      priceMax,
      sortBy = 'popular',
      page = 1,
      pageSize = 12,
    } = query;

    let supabaseQuery = this.client
      .from('destinations')
      .select(
        `id, name, category, address, price, images, facilities, description, created_at`,
        { count: 'exact' }
      );

    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
    }
    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }
    if (location) {
      supabaseQuery = supabaseQuery.ilike('address', `%${location}%`);
    }
    // minRating filter is ignored because there is no rating column
    // if (typeof minRating === 'number') {
    //   supabaseQuery = supabaseQuery.gte('rating', minRating);
    // }
    if (typeof priceMin === 'number') {
      supabaseQuery = supabaseQuery.gte('price', priceMin);
    }
    if (typeof priceMax === 'number') {
      supabaseQuery = supabaseQuery.lte('price', priceMax);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        supabaseQuery = supabaseQuery.order('price', { ascending: true });
        break;
      case 'newest':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        break;
      // For 'popular' and 'rating', fallback to 'created_at' since we have no review/rating column
      case 'popular':
      case 'rating':
      default:
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
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
    function parsePgArray(str: string): string[] {
      if (!str) return [];
      return str
        .replace(/^{|}$/g, '')
        .split(',')
        .map(s => s.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
    }

    const mapped = (data || []).map((row: any) => {
      let imagesArr: string[] = [];
      if (Array.isArray(row.images)) {
        imagesArr = row.images;
      } else if (typeof row.images === 'string') {
        imagesArr = parsePgArray(row.images);
      }
      return new Destination(
        row.id,
        row.name,
        row.category,
        {
          address: row.address,
          lat: row.latitude ?? 0,
          lng: row.longitude ?? 0,
        },
        row.distance_km ?? 0,
        row.price,
        row.opening_hours ?? '',
        row.description,
        row.facilities ?? [],
        [], // tips
        imagesArr,
        undefined, // video
        row.created_at ? new Date(row.created_at) : new Date(),
        // Tambahan untuk rating dan totalReviews, set ke 0
        // (Jika nanti ingin diisi dari agregasi, bisa diubah)
      );
    });

    return {
      data: mapped,
      totalItems: count || 0,
    };
  }
}
