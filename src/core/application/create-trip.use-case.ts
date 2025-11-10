import { Inject, Injectable } from '@nestjs/common';
import { TripPlan } from '../domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ActivityLoggerService } from './activity-logger.service';

export interface CreateTripCommand {
  userId: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  peopleCount: number;
  tripType: string;
  isPublic: boolean;
  destinations: string[];
  schedule: TripPlan['schedule'];
  budget: TripPlan['budget'];
  notes?: string;
  packingList?: string[];
}

@Injectable()
export class CreateTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly repo: TripPlanRepositoryPort,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async execute(cmd: CreateTripCommand): Promise<void> {
    const plan = new TripPlan(
      cmd.userId,
      cmd.name,
      new Date(cmd.startDate),
      new Date(cmd.endDate),
      cmd.peopleCount,
      cmd.tripType,
      cmd.isPublic,
      cmd.destinations,
      cmd.schedule,
      cmd.budget,
      cmd.notes ?? null,
      cmd.packingList ?? [],
    );

    // Delegate persistence to repository (SRP / DIP)
    await this.repo.create(plan);

    // Log trip creation activity
    await this.activityLogger.logTripPlanAction(
      cmd.userId,
      'create',
      plan.id,
      {
        name: cmd.name,
        startDate: cmd.startDate,
        endDate: cmd.endDate,
        peopleCount: cmd.peopleCount,
        tripType: cmd.tripType,
        isPublic: cmd.isPublic,
        destinations: cmd.destinations,
      },
    );
  }
}
