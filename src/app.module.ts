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
import { AllDestinationController } from './interface/controllers/all-destination.controller';
import { AuthController } from './interface/controllers/auth.controller';
import { UserRepositoryAdapter } from './infrastructure/database/user.repository.adapter';
import { DestinationRepositoryAdapter } from './infrastructure/database/destination.repository.adapter';
import { ArticleRepositoryAdapter } from './infrastructure/database/article.repository.adapter';
import { ReviewRepositoryAdapter } from './infrastructure/database/review.repository.adapter';
import { UserUseCase } from './core/application/user.use-case';
import { UpdateUserProfileUseCase } from './core/application/update-user-profile.use-case';
import { UpdatePasswordUseCase } from './core/application/update-password.use-case';
import { DestinationUseCase } from './core/application/destination.use-case';
import { DeleteDestinationUseCase } from './core/application/delete-destination.use-case';
import { CreateArticleUseCase } from './core/application/create-article.use-case';
import { ListArticlesUseCase } from './core/application/list-articles.use-case';
import { GetArticleUseCase } from './core/application/get-article.use-case';
import { LandingPageUseCase } from './core/application/landing-page.use-case';
import { ListAllDestinationsUseCase } from './core/application/list-all-destinations.use-case';
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
    AllDestinationController,
    AdminMetricsController,
    AdminDestinationController,
    AdminReviewController,
    AdminUserController,
  ],
  providers: [
    AppService,
    AuthUseCase,
    UserUseCase,
    UpdateUserProfileUseCase,
    UpdatePasswordUseCase,
    DestinationUseCase,
    DeleteDestinationUseCase,
    CreateArticleUseCase,
    ListArticlesUseCase,
    GetArticleUseCase,
    LandingPageUseCase,
    ListAllDestinationsUseCase,
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
    JwtAdminGuard,
    JwtAccessGuard,
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () =>
        createClient(
          process.env.SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        ),
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
