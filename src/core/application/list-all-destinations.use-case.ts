import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Destination } from '../domain/destination.entity';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';

@Injectable()
export class ListAllDestinationsUseCase {
  constructor(
    @Inject('DestinationRepository')
    private readonly repository: DestinationRepositoryPort,
  ) {}

  async execute(): Promise<Destination[]> {
    try {
      return await this.repository.findAllNoPagination();
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
