import { Module } from '@nestjs/common';

import { createClient } from '@supabase/supabase-js';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './interface/controllers/user.controller';
import { UserRepositoryAdapter } from './infrastructure/database/user.repository.adapter';
import { UserUseCase } from './core/application/user.use-case';

@Module({
  imports: [],
  controllers: [AppController, UserController],
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
  ],
})
export class AppModule {}
