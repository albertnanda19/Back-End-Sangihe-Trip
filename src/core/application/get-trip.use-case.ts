import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { UserRepositoryPort } from '../domain/user.repository.port';

@Injectable()
export class GetTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly repository: TripPlanRepositoryPort,
    @Inject('DestinationRepository')
    private readonly destinationRepository: DestinationRepositoryPort,
    @Inject('UserRepository')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(id: string) {
    try {
      const trip = await this.repository.findById(id);
      if (!trip) {
        throw new NotFoundException('Trip tidak ditemukan');
      }

      const owner = await this.userRepository.findById(trip.userId);

      const destinationsWithDetails = await Promise.all(
        trip.destinations.map(async (destId) => {
          const dest = await this.destinationRepository.findById(destId);
          return dest
            ? { id: dest.id, name: dest.name }
            : { id: destId, name: 'Unknown Destination' };
        }),
      );

      let coverImage: string | null = null;
      if (trip.destinations.length > 0) {
        const firstDest = await this.destinationRepository.findById(
          trip.destinations[0],
        );
        if (firstDest && firstDest.images && firstDest.images.length > 0) {
          coverImage = firstDest.images[0];
        }
      }

      const totalBudget = Object.values(trip.budget).reduce<number>(
        (sum, val) => sum + (val || 0),
        0,
      );

      const slug = trip.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const enrichedSchedule = await Promise.all(
        trip.schedule.map(async (day) => {
          const enrichedItems = await Promise.all(
            day.items.map(async (item) => {
              const dest = await this.destinationRepository.findById(
                item.destinationId,
              );
              return {
                ...item,
                destinationName: dest?.name || 'Unknown Destination',
              };
            }),
          );
          return {
            day: day.day,
            items: enrichedItems,
          };
        }),
      );

      return {
        id: trip.id,
        userId: trip.userId,
        name: trip.name,
        slug,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        peopleCount: trip.peopleCount,
        tripType: trip.tripType,
        isPublic: trip.isPublic,
        destinations: destinationsWithDetails,
        schedule: enrichedSchedule,
        budget: trip.budget,
        totalBudget,
        notes: trip.notes || '',
        packingList: trip.packingList,
        coverImage,
        createdAt: trip.createdAt.toISOString(),
        updatedAt: trip.createdAt.toISOString(),
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              firstName: owner.firstName,
              lastName: owner.lastName,
              avatar: owner.avatarUrl,
            }
          : null,
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException(
        e instanceof Error ? e.message : 'Unknown error',
      );
    }
  }
}
