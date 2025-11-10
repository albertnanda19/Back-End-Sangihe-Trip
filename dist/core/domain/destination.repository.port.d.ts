import { Destination } from './destination.entity';
export interface DestinationQuery {
    search?: string;
    category?: string;
    location?: string;
    minRating?: number;
    priceMin?: number;
    priceMax?: number;
    sortBy?: 'popular' | 'rating' | 'price-low' | 'newest';
    page?: number;
    pageSize?: number;
}
export interface DestinationRepositoryPort {
    save(destination: Destination, uploadedBy: string): Promise<Destination>;
    findAll(query: DestinationQuery): Promise<{
        data: Destination[];
        totalItems: number;
    }>;
    findAllNoPagination(): Promise<Destination[]>;
    findById(id: string): Promise<Destination>;
    findBySlug(slug: string): Promise<Destination>;
    delete(id: string): Promise<Destination>;
}
