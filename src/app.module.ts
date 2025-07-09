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
import { AuthController } from './interface/controllers/auth.controller';
import { UserRepositoryAdapter } from './infrastructure/database/user.repository.adapter';
import { DestinationRepositoryAdapter } from './infrastructure/database/destination.repository.adapter';
import { ArticleRepositoryAdapter } from './infrastructure/database/article.repository.adapter';
import { UserUseCase } from './core/application/user.use-case';
import { DestinationUseCase } from './core/application/destination.use-case';
import { DeleteDestinationUseCase } from './core/application/delete-destination.use-case';
import { CreateArticleUseCase } from './core/application/create-article.use-case';
import { ListArticlesUseCase } from './core/application/list-articles.use-case';
import { AuthUseCase } from './core/application/auth.use-case';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { JwtAdminGuard } from './common/guards/jwt-admin.guard';

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
  ],
  providers: [
    AppService,
    AuthUseCase,
    UserUseCase,
    DestinationUseCase,
    DeleteDestinationUseCase,
    CreateArticleUseCase,
    ListArticlesUseCase,
    JwtAdminGuard,
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
    {
      provide: 'STORAGE_PATH',
      useValue: join(__dirname, '..', 'storage'),
    },
  ],
})
export class AppModule {}
