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
  findAll(query: DestinationQuery): Promise<{ data: Destination[]; totalItems: number }>; 
  /**
   * Retrieves a single destination by its ID or throws if not found.
   */
  findById(id: string): Promise<Destination>;
  /**
   * Removes a destination by its ID and returns the deleted entity (or throws if not found).
   */
  delete(id: string): Promise<Destination>;
}
