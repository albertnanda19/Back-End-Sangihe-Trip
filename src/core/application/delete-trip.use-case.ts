import { Inject, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ActivityLoggerService } from './activity-logger.service';

@Injectable()
export class DeleteTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly tripRepository: TripPlanRepositoryPort,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async execute(tripId: string, userId: string): Promise<void> {
    const trip = await this.tripRepository.findById(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this trip');
    }

    // Store trip data for logging before deletion
    const tripData = {
      name: trip.name,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      peopleCount: trip.peopleCount,
      tripType: trip.tripType,
      isPublic: trip.isPublic,
      destinations: trip.destinations,
    };

    const deleted = await this.tripRepository.delete(tripId);
    
    if (!deleted) {
      throw new NotFoundException('Trip not found');
    }

    // Log trip deletion activity
    await this.activityLogger.logTripPlanAction(
      userId,
      'delete_trip',
      tripId,
      undefined, // no new data
      tripData, // old data
    );
  }
}
