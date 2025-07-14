import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';

export interface ListUserTripsResult {
  data: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

@Injectable()
export class ListUserTripsUseCase {
  constructor(
    @Inject('TripPlanRepository') private readonly repo: TripPlanRepositoryPort,
  ) {}

  async execute(userId: string, page = 1, limit = 10): Promise<ListUserTripsResult> {
    try {
      const { data, totalItems } = await this.repo.findAllByUser({
        userId,
        page,
        pageSize: limit,
      });

      const trips = data.map((plan) => {
        const slugBase = plan.name.toLowerCase().replace(/\s+/g, '-');
        const slug = `${slugBase}-${plan.id.toString().slice(0, 8)}`;

        const totalBudget = Object.values(plan.budget ?? {}).reduce<number>(
          (acc, val) => acc + (val ?? 0),
          0,
        );

        return {
          id: plan.id,
          slug,
          name: plan.name,
          startDate: plan.startDate.toISOString().split('T')[0],
          endDate: plan.endDate.toISOString().split('T')[0],
          peopleCount: plan.peopleCount,
          tripType: plan.tripType,
          destinationCount: plan.destinations.length,
          coverImage: plan.destinations?.[0] ?? null, // placeholder / TODO
          totalBudget,
          isPublic: plan.isPublic,
          createdAt: plan.createdAt.toISOString(),
          updatedAt: plan.createdAt.toISOString(), // no updatedAt in entity, fallback
        };
      });

      return {
        data: trips,
        meta: {
          page,
          limit,
          total: totalItems,
        },
      };
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
} 