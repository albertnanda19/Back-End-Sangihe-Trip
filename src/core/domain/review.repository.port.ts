import { Review } from './review.entity';

export interface ReviewListQuery {
  userId?: string;
  destinationId?: string;
  page?: number;
  pageSize?: number;
}

export interface ReviewRepositoryPort {
  findAllByUser(
    query: ReviewListQuery,
  ): Promise<{ data: Review[]; totalItems: number }>;
  findById(id: string): Promise<Review | null>;
  create(review: Review): Promise<Review>;
  // Add more methods as needed: update, delete, etc.
}
