import { ReviewRepositoryPort } from '../domain/review.repository.port';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
export declare class ListUserReviewsUseCase {
    private readonly reviewRepository;
    private readonly destinationRepository;
    constructor(reviewRepository: ReviewRepositoryPort, destinationRepository: DestinationRepositoryPort);
    execute(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            destination: {
                id: string;
                name: string;
                image: string;
            };
            rating: number;
            comment: string;
            createdAt: string;
            helpful: number;
        }[];
        total: number;
        page: number;
        pageSize: number;
    }>;
}
