import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { Destination } from '../domain/destination.entity';
export declare class DeleteDestinationUseCase {
    private readonly repository;
    constructor(repository: DestinationRepositoryPort);
    execute(id: string): Promise<Destination>;
}
