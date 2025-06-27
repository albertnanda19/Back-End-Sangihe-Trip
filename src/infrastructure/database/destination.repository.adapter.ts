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
      entry_fee: price,
      category,
      facilities,

      created_at: createdAt.toISOString(),
    };
  }

  async save(destination: Destination, uploadedBy: string): Promise<Destination> {
    const { error } = await this.client
      .from('destinations') // DB table name
      .insert(this.toRow(destination)).select('id').single();

    if (error) {
      throw new Error(error.message);
    }

    // save images separately only if destination saved successfully
    try {
      if (destination.images.length) {
        const rows = destination.images.map((img) => ({
          destination_id: destination.id,
          image_url: img,
          uploaded_by: uploadedBy,
        }));
        const { error: imgError } = await this.client
          .from('destination_images')
          .insert(rows);
        if (imgError) throw new Error(imgError.message);
      }
    } catch (imgErr) {
      // rollback destination record to keep consistency
      await this.client.from('destinations').delete().eq('id', destination.id);
      throw imgErr;
    }

    return destination;
  }
}
