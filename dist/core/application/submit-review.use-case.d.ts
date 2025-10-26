import { Review } from 'src/core/domain/review.entity';
import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';
import { CreateReviewDto } from 'src/interface/dtos/review/create-review.dto';
export declare class SubmitReviewUseCase {
    private readonly reviewRepository;
    constructor(reviewRepository: ReviewRepositoryPort);
    execute(userId: string, dto: CreateReviewDto): Promise<Review>;
}
