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

  async execute(
    userId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: 'date' | 'rating' = 'date',
    order: 'asc' | 'desc' = 'desc',
    rating?: '1' | '2' | '3' | '4' | '5' | 'all',
  ) {
    const { data: reviews, totalItems } =
      await this.reviewRepository.findAllByUser({
        userId,
        page,
        pageSize: limit,
      });

    let filteredReviews = reviews;
    if (rating && rating !== 'all') {
      const ratingNum = parseInt(rating);
      filteredReviews = reviews.filter((r) => r.rating === ratingNum);
    }

    const sortedReviews = [...filteredReviews].sort((a, b) => {
      if (sortBy === 'date') {
        const comparison = a.createdAt.getTime() - b.createdAt.getTime();
        return order === 'asc' ? comparison : -comparison;
      } else {
        const comparison = a.rating - b.rating;
        return order === 'asc' ? comparison : -comparison;
      }
    });

    const enrichedReviews = await Promise.all(
      sortedReviews.map(async (review) => {
        const destination = await this.destinationRepository.findById(
          review.destinationId,
        );

        return {
          id: review.id,
          destinationId: review.destinationId,
          destinationName: destination?.name || 'Unknown Destination',
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
          content: review.comment,
          helpful: review.helpful,
          helpfulCount: review.helpful,
          likes: review.helpful,
          createdAt: review.createdAt.toISOString(),
          date: review.createdAt.toISOString(),
        };
      }),
    );

    const totalPages = Math.ceil(
      (rating && rating !== 'all' ? filteredReviews.length : totalItems) /
        limit,
    );

    return {
      data: enrichedReviews,
      meta: {
        page,
        per_page: limit,
        total: rating && rating !== 'all' ? filteredReviews.length : totalItems,
        total_pages: totalPages,
      },
    };
  }
}
