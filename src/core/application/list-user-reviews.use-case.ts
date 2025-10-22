import { Inject, Injectable } from '@nestjs/common';
import { ReviewRepositoryPort } from '../domain/review.repository.port';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';

@Injectable()
export class ListUserReviewsUseCase {
  constructor(
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
    @Inject('DestinationRepository')
    private readonly destinationRepository: DestinationRepositoryPort,
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 10) {
    const { data: reviews, totalItems } =
      await this.reviewRepository.findAllByUser({
        userId,
        page,
        pageSize: limit,
      });

    // Enrich reviews with destination data
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const destination = await this.destinationRepository.findById(
          review.destinationId,
        );

        return {
          id: review.id,
          destination: destination
            ? {
                id: destination.id,
                name: destination.name,
                image:
                  destination.images && destination.images.length > 0
                    ? destination.images[0]
                    : '/placeholder.svg',
              }
            : {
                id: review.destinationId,
                name: 'Unknown Destination',
                image: '/placeholder.svg',
              },
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt.toISOString(),
          helpful: review.helpful,
        };
      }),
    );

    return {
      data: enrichedReviews,
      total: totalItems,
      page,
      pageSize: limit,
    };
  }
}
