import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Review } from 'src/core/domain/review.entity';
import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';
import { CreateReviewDto } from 'src/interface/dtos/review/create-review.dto';
import { SystemSettingsService } from './system-settings.service';
import { ActivityLoggerService } from './activity-logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SubmitReviewUseCase {
  constructor(
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
    private readonly systemSettingsService: SystemSettingsService,
    private readonly activityLogger: ActivityLoggerService,
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: any,
  ) {}

  async execute(userId: string, dto: CreateReviewDto): Promise<Review> {
    // Check if user has completed a trip with this destination
    const hasCompletedTrip = await this.checkUserCompletedTrip(userId, dto.destinationId);
    
    if (!hasCompletedTrip) {
      throw new BadRequestException(
        'You can only review destinations from completed trips',
      );
    }

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

    // Check if review moderation is enabled
    const isModerationEnabled = await this.systemSettingsService.isReviewModerationEnabled();
    const defaultStatus = isModerationEnabled ? 'pending' : 'active';

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
      defaultStatus,
    );

    const createdReview = await this.reviewRepository.create(review);

    // Log review submission activity
    await this.activityLogger.logReviewSubmission(
      userId,
      createdReview.id,
      {
        destinationId: dto.destinationId,
        rating: dto.rating,
        comment: dto.comment,
        images: dto.images,
      },
    );

    return createdReview;
  }

  /**
   * Check if user has completed a trip that includes this destination
   */
  private async checkUserCompletedTrip(
    userId: string,
    destinationId: string,
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('trip_plans')
      .select('id, days')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .not('days', 'is', null);

    if (error) {
      console.error('Error checking completed trip:', error);
      return false;
    }

    if (!data || data.length === 0) {
      return false;
    }

    for (const trip of data) {
      const days = (trip.days as any[]) || [];
      for (const day of days) {
        const items = (day.items || []) as any[];
        if (items.some((item: any) => item.destination_id === destinationId)) {
          return true;
        }
      }
    }

    return false;
  }
}
