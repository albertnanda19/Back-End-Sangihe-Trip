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
import { UserUseCase } from './core/application/user.use-case';
import { DestinationUseCase } from './core/application/destination.use-case';
import { DeleteDestinationUseCase } from './core/application/delete-destination.use-case';
import { CreateArticleUseCase } from './core/application/create-article.use-case';
import { ListArticlesUseCase } from './core/application/list-articles.use-case';
import { GetArticleUseCase } from './core/application/get-article.use-case';
import { LandingPageUseCase } from './core/application/landing-page.use-case';
import { ListAllDestinationsUseCase } from './core/application/list-all-destinations.use-case';
import { AuthUseCase } from './core/application/auth.use-case';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { JwtAdminGuard } from './common/guards/jwt-admin.guard';
import { TripController } from './interface/controllers/trip.controller';
import { CreateTripUseCase } from './core/application/create-trip.use-case';
import { TripPlanRepositoryAdapter } from './infrastructure/database/trip-plan.repository.adapter';
import { JwtAccessGuard } from './common/guards/jwt-access.guard';
import { ListUserTripsUseCase } from './core/application/list-user-trips.use-case';
import { GetTripUseCase } from './core/application/get-trip.use-case';

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
    AllDestinationController,
  ],
  providers: [
    AppService,
    AuthUseCase,
    UserUseCase,
    DestinationUseCase,
    DeleteDestinationUseCase,
    CreateArticleUseCase,
    ListArticlesUseCase,
    GetArticleUseCase,
    LandingPageUseCase,
    ListAllDestinationsUseCase,
    CreateTripUseCase,
    ListUserTripsUseCase,
    GetTripUseCase,
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
    { provide: 'DestinationRepository', useClass: DestinationRepositoryAdapter },
    { provide: 'ArticleRepository', useClass: ArticleRepositoryAdapter },
    { provide: 'TripPlanRepository', useClass: TripPlanRepositoryAdapter },
    {
      provide: 'STORAGE_PATH',
      useValue: join(__dirname, '..', 'storage'),
    },
  ],
})
export class AppModule {}
