import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';

@Injectable()
export class DeleteTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly tripRepository: TripPlanRepositoryPort,
  ) {}

  async execute(tripId: string, userId: string): Promise<void> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this trip');
    }

    const deleted = await this.tripRepository.delete(tripId);
    
    if (!deleted) {
      throw new NotFoundException('Trip not found');
    }
  }
}
