import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Destination, Facility, Location } from '../domain/destination.entity';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';

interface CreateDestinationInput {
  name: string;
  category: string;
  location: Location;
  distanceKm: number;
  price: number;
  openHours: string;
  description: string;
  facilities: Facility[];
  tips: string[];
  images: string[]; // stored filenames
  video?: string;
  uploaderId: string;
}

@Injectable()
export class DestinationUseCase {
  constructor(
    @Inject('DestinationRepository')
    private readonly repository: DestinationRepositoryPort,
  ) {}

  async execute(payload: CreateDestinationInput) {
    const dest = new Destination(
      randomUUID(),
      payload.name,
      payload.category,
      payload.location,
      payload.distanceKm,
      payload.price,
      payload.openHours,
      payload.description,
      payload.facilities,
      payload.tips,
      payload.images,
      payload.video,
    );

    try {
      return await this.repository.save(dest, payload.uploaderId);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
