import { Destination } from '../domain/destination.entity';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
export declare class ListAllDestinationsUseCase {
    private readonly repository;
    constructor(repository: DestinationRepositoryPort);
    execute(): Promise<Destination[]>;
}
