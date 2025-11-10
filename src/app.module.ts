import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';

import { createClient } from '@supabase/supabase-js';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './interface/controllers/user.controller';
import { DestinationController } from './interface/controllers/destination.controller';
import { ArticleController } from './interface/controllers/article.controller';
import { LandingPageController } from './interface/controllers/landing-page.controller';
import { AuthController } from './interface/controllers/auth.controller';
import { UserRepositoryAdapter } from './infrastructure/database/user.repository.adapter';
import { DestinationRepositoryAdapter } from './infrastructure/database/destination.repository.adapter';
import { ArticleRepositoryAdapter } from './infrastructure/database/article.repository.adapter';
import { ReviewRepositoryAdapter } from './infrastructure/database/review.repository.adapter';
import { UserUseCase } from './core/application/user.use-case';
import { UpdateUserProfileUseCase } from './core/application/update-user-profile.use-case';
import { UpdatePasswordUseCase } from './core/application/update-password.use-case';
import { DestinationUseCase } from './core/application/destination.use-case';
import { CreateArticleUseCase } from './core/application/create-article.use-case';
import { ListArticlesUseCase } from './core/application/list-articles.use-case';
import { GetArticleUseCase } from './core/application/get-article.use-case';
import { LandingPageUseCase } from './core/application/landing-page.use-case';
import { ListUserReviewsUseCase } from './core/application/list-user-reviews.use-case';
import { AuthUseCase } from './core/application/auth.use-case';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { JwtAdminGuard } from './common/guards/jwt-admin.guard';
import { TripController } from './interface/controllers/trip.controller';
import { ReviewController } from './interface/controllers/review.controller';
import { CreateTripUseCase } from './core/application/create-trip.use-case';
import { DeleteTripUseCase } from './core/application/delete-trip.use-case';
import { UpdateTripUseCase } from './core/application/update-trip.use-case';
import { TripPlanRepositoryAdapter } from './infrastructure/database/trip-plan.repository.adapter';
import { JwtAccessGuard } from './common/guards/jwt-access.guard';
import { ListUserTripsUseCase } from './core/application/list-user-trips.use-case';
import { GetTripUseCase } from './core/application/get-trip.use-case';
import { SubmitReviewUseCase } from './core/application/submit-review.use-case';
import { GetDestinationReviewsUseCase } from './core/application/get-destination-reviews.use-case';
import { LikeReviewUseCase } from './core/application/like-review.use-case';
import { AdminMetricsController } from './interface/controllers/admin-metrics.controller';
import { AdminMetricsUseCase } from './core/application/admin-metrics.use-case';
import { AdminDestinationController } from './interface/controllers/admin-destination.controller';
import { AdminDestinationUseCase } from './core/application/admin-destination.use-case';
import { AdminReviewController } from './interface/controllers/admin-review.controller';
import { AdminReviewUseCase } from './core/application/admin-review.use-case';
import { AdminUserController } from './interface/controllers/admin-user.controller';
import { AdminUserUseCase } from './core/application/admin-user.use-case';
import { AdminActivityController } from './interface/controllers/admin-activity.controller';
import { AdminActivityUseCase } from './core/application/admin-activity.use-case';
import { AdminArticleController } from './interface/controllers/admin-article.controller';
import { AdminArticleUseCase } from './core/application/admin-article.use-case';
import { AdminTripController } from './interface/controllers/admin-trip.controller';
import { AdminTripUseCase } from './core/application/admin-trip.use-case';
import { SystemSettingsService } from './core/application/system-settings.service';
import { ActivityLoggerService } from './core/application/activity-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      privateKey: readFileSync(join(__dirname, '..', 'private.pem')),
      publicKey: readFileSync(join(__dirname, '..', 'public.pem')),
      signOptions: {
        algorithm: 'RS256',
      },
    }),
    FirebaseModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    DestinationController,
    ArticleController,
    LandingPageController,
    TripController,
    ReviewController,
    AdminMetricsController,
    AdminDestinationController,
    AdminReviewController,
    AdminUserController,
    AdminActivityController,
    AdminArticleController,
    AdminTripController,
  ],
  providers: [
    AppService,
    AuthUseCase,
    UserUseCase,
    UpdateUserProfileUseCase,
    UpdatePasswordUseCase,
    DestinationUseCase,
    CreateArticleUseCase,
    ListArticlesUseCase,
    GetArticleUseCase,
    LandingPageUseCase,
    ListUserReviewsUseCase,
    CreateTripUseCase,
    DeleteTripUseCase,
    UpdateTripUseCase,
    ListUserTripsUseCase,
    GetTripUseCase,
    SubmitReviewUseCase,
    GetDestinationReviewsUseCase,
    LikeReviewUseCase,
    AdminMetricsUseCase,
    AdminDestinationUseCase,
    AdminReviewUseCase,
    AdminUserUseCase,
    AdminActivityUseCase,
    AdminArticleUseCase,
    AdminTripUseCase,
    JwtAdminGuard,
    JwtAccessGuard,
    SystemSettingsService,
    ActivityLoggerService,
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: async () => {
        const client = createClient(
          process.env.SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string,
          {
            db: {
              schema: 'public',
            },
            global: {
              headers: {
                'X-Client-Info': 'supabase-js-node',
              },
            },
          },
        );

        // Set timezone to WITA (GMT+8) - Indonesia Eastern Time
        // Call the set_timezone_wita() function we created in the database
        try {
          await client.rpc('set_timezone_wita');
        } catch {
          // If function doesn't exist yet, warn but continue
          console.warn(
            'Timezone function not found. Please run set-timezone.sql in Supabase SQL Editor.',
          );
        }

        return client;
      },
    },
    { provide: 'UserRepository', useClass: UserRepositoryAdapter },
    {
      provide: 'DestinationRepository',
      useClass: DestinationRepositoryAdapter,
    },
    { provide: 'ArticleRepository', useClass: ArticleRepositoryAdapter },
    { provide: 'ReviewRepository', useClass: ReviewRepositoryAdapter },
    { provide: 'TripPlanRepository', useClass: TripPlanRepositoryAdapter },
    {
      provide: 'STORAGE_PATH',
      useValue: join(__dirname, '..', 'storage'),
    },
  ],
})
export class AppModule {}
