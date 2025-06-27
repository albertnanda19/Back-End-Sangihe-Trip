import { Destination } from './destination.entity';

export interface DestinationRepositoryPort {
  save(destination: Destination): Promise<Destination>;
}
