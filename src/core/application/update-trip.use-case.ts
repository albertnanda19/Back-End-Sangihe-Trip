import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TripPlan } from '../domain/trip-plan.entity';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';

export interface UpdateTripCommand {
  tripId: string;
  userId: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  peopleCount?: number;
  tripType?: string;
  isPublic?: boolean;
  destinations?: string[];
  schedule?: TripPlan['schedule'];
  budget?: TripPlan['budget'];
  notes?: string;
  packingList?: string[];
}

@Injectable()
export class UpdateTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly repository: TripPlanRepositoryPort,
  ) {}

  async execute(command: UpdateTripCommand): Promise<void> {
    const existingTrip = await this.repository.findById(command.tripId);

    if (!existingTrip) {
      throw new NotFoundException('Trip tidak ditemukan');
    }

    if (existingTrip.userId !== command.userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk mengubah trip ini',
      );
    }

    const updates: any = {};

    if (command.name !== undefined) updates.name = command.name;
    if (command.startDate !== undefined)
      updates.startDate = new Date(command.startDate);
    if (command.endDate !== undefined)
      updates.endDate = new Date(command.endDate);
    if (command.peopleCount !== undefined)
      updates.peopleCount = command.peopleCount;
    if (command.tripType !== undefined) updates.tripType = command.tripType;
    if (command.isPublic !== undefined) updates.isPublic = command.isPublic;
    if (command.destinations !== undefined)
      updates.destinations = command.destinations;
    if (command.schedule !== undefined) updates.schedule = command.schedule;
    if (command.budget !== undefined) updates.budget = command.budget;
    if (command.notes !== undefined) updates.notes = command.notes;
    if (command.packingList !== undefined)
      updates.packingList = command.packingList;

    await this.repository.update(command.tripId, updates);
  }
}
