import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Review } from 'src/core/domain/review.entity';
import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';
import { CreateReviewDto } from 'src/interface/dtos/review/create-review.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmitReviewUseCase {
  constructor(
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
  ) {}

  async execute(userId: string, dto: CreateReviewDto): Promise<Review> {
    const existingReview = await this.reviewRepository.findByUserAndDestination(
      userId,
      dto.destinationId,
    );

    if (existingReview) {
      throw new BadRequestException(
        'You have already submitted a review for this destination',
      );
    }

    if (dto.images && dto.images.length > 5) {
      throw new BadRequestException('Maximum 5 images allowed per review');
    }

    const review = new Review(
      uuidv4(),
      userId,
      dto.destinationId,
      dto.rating,
      dto.comment,
      dto.images || [],
      0,
      new Date(),
      new Date(),
    );

    return await this.reviewRepository.create(review);
  }
}
