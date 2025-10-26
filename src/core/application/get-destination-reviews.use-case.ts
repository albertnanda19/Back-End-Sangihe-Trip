import { Injectable, Inject } from '@nestjs/common';
import { ReviewRepositoryPort, ReviewListQuery, ReviewWithUser, ReviewStats } from 'src/core/domain/review.repository.port';

@Injectable()
export class GetDestinationReviewsUseCase {
  constructor(
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(
    destinationId: string,
    query: ReviewListQuery,
    currentUserId?: string,
  ): Promise<{ reviews: ReviewWithUser[]; total: number; stats: ReviewStats }> {
    const fullQuery: ReviewListQuery = {
      ...query,
      destinationId,
    };

    const result = await this.reviewRepository.findAllByDestination(
      fullQuery,
      currentUserId,
    );

    return {
      reviews: result.data,
      total: result.totalItems,
      stats: result.stats,
    };
  }
}
