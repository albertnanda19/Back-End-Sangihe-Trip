import { Inject, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { Destination } from '../domain/destination.entity';

@Injectable()
export class DeleteDestinationUseCase {
  constructor(
    @Inject('DestinationRepository')
    private readonly repository: DestinationRepositoryPort,
  ) {}

  async execute(id: string): Promise<Destination> {
    try {
      return await this.repository.delete(id);
    } catch (err) {
      // Translate lower-level errors to domain-friendly exceptions
      if (/(not found)/i.test(err?.message ?? '')) {
        throw new NotFoundException('Destinasi tidak ditemukan');
      }
      throw new InternalServerErrorException(err?.message ?? 'Gagal menghapus destinasi');
    }
  }
} 