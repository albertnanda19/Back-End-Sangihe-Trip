import { Destination } from './destination.entity';

export interface DestinationRepositoryPort {
  save(destination: Destination, uploadedBy: string): Promise<Destination>;
}
