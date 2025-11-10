import { Destination, Facility, Location } from '../domain/destination.entity';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
interface CreateDestinationInput {
    name: string;
    category: string;
    location: Location;
    distanceKm: number;
    price: number;
    openHours: string;
    description: string;
    facilities: Facility[];
    tips: string[];
    images: string[];
    video?: string;
    uploaderId: string;
}
export declare class DestinationUseCase {
    private readonly repository;
    constructor(repository: DestinationRepositoryPort);
    execute(payload: CreateDestinationInput): Promise<Destination>;
    findAll(query: import('../domain/destination.repository.port').DestinationQuery): Promise<{
        data: Destination[];
        totalItems: number;
    }>;
    findById(id: string): Promise<Destination>;
    findBySlug(slug: string): Promise<Destination>;
}
export {};
