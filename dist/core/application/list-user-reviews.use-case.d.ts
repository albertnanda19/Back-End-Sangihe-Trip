import { ReviewRepositoryPort } from '../domain/review.repository.port';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
export declare class ListUserReviewsUseCase {
    private readonly reviewRepository;
    private readonly destinationRepository;
    constructor(reviewRepository: ReviewRepositoryPort, destinationRepository: DestinationRepositoryPort);
    execute(userId: string, page?: number, limit?: number, sortBy?: 'date' | 'rating', order?: 'asc' | 'desc', rating?: '1' | '2' | '3' | '4' | '5' | 'all'): Promise<{
        data: {
            id: string;
            destinationId: string;
            destinationName: string;
            destination: {
                id: string;
                name: string;
                image: string;
            };
            rating: number;
            comment: string;
            content: string;
            helpful: number;
            helpfulCount: number;
            likes: number;
            createdAt: string;
            date: string;
        }[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
}
