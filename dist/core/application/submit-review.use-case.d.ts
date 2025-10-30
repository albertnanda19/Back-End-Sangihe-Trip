import { Review } from 'src/core/domain/review.entity';
import { ReviewRepositoryPort } from 'src/core/domain/review.repository.port';
import { CreateReviewDto } from 'src/interface/dtos/review/create-review.dto';
import { SystemSettingsService } from './system-settings.service';
import { ActivityLoggerService } from './activity-logger.service';
export declare class SubmitReviewUseCase {
    private readonly reviewRepository;
    private readonly systemSettingsService;
    private readonly activityLogger;
    constructor(reviewRepository: ReviewRepositoryPort, systemSettingsService: SystemSettingsService, activityLogger: ActivityLoggerService);
    execute(userId: string, dto: CreateReviewDto): Promise<Review>;
}
