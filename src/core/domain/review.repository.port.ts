import { Review } from './review.entity';

export interface ReviewListQuery {
  userId?: string;
  destinationId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

export interface ReviewWithUser extends Review {
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  isHelpful?: boolean;
}

export interface ReviewStats {
  averageRating: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export interface ReviewRepositoryPort {
  findAllByUser(
    query: ReviewListQuery,
  ): Promise<{ data: Review[]; totalItems: number }>;
  
  findAllByDestination(
    query: ReviewListQuery,
    currentUserId?: string,
  ): Promise<{ 
    data: ReviewWithUser[]; 
    totalItems: number;
    stats: ReviewStats;
  }>;
  
  findById(id: string): Promise<Review | null>;
  
  findByUserAndDestination(
    userId: string,
    destinationId: string,
  ): Promise<Review | null>;
  
  create(review: Review): Promise<Review>;
  
  toggleLike(
    reviewId: string,
    userId: string,
  ): Promise<{ helpful: number; isLiked: boolean }>;
  
  isLikedByUser(reviewId: string, userId: string): Promise<boolean>;
}
