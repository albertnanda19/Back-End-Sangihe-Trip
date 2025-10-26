import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';

@Injectable()
export class LikeReviewUseCase {
  constructor(
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(
    reviewId: string,
    userId: string,
  ): Promise<{ helpful: number; isLiked: boolean }> {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return await this.reviewRepository.toggleLike(reviewId, userId);
  }
}
