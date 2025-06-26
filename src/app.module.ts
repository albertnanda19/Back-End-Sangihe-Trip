import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { readFileSync } from 'fs';
import { join } from 'path';

import { createClient } from '@supabase/supabase-js';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './interface/controllers/user.controller';
import { AuthController } from './interface/controllers/auth.controller';
import { UserRepositoryAdapter } from './infrastructure/database/user.repository.adapter';
import { UserUseCase } from './core/application/user.use-case';
import { AuthUseCase } from './core/application/auth.use-case';

@Module({
  imports: [
    JwtModule.register({
      privateKey: readFileSync(join(__dirname, '..', 'private.pem')),
      publicKey: readFileSync(join(__dirname, '..', 'public.pem')),
      signOptions: {
        algorithm: 'RS256',
      },
    }),
  ],
  controllers: [AppController, UserController, AuthController],
  providers: [
    AppService,
    {
      provide: 'SUPABASE_CLIENT',
      useFactory: () =>
        createClient(
          process.env.SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string,
        ),
    },
    // Ports & Adapters
    { provide: 'UserRepository', useClass: UserRepositoryAdapter },
    // Use Cases
    UserUseCase,
    AuthUseCase,
  ],
})
export class AppModule {}
