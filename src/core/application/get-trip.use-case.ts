import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';

@Injectable()
export class GetTripUseCase {
  constructor(
    @Inject('TripPlanRepository')
    private readonly repository: TripPlanRepositoryPort,
  ) {}

  async execute(id: string) {
    try {
      const trip = await this.repository.findById(id);
      if (!trip) {
        throw new NotFoundException('Trip tidak ditemukan');
      }
      return trip;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException(e.message);
    }
  }
}
