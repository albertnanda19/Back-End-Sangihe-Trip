import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Inject } from '@nestjs/common';
import { ResponseMessage } from './common/decorators/response.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient,
  ) {}

  @ResponseMessage('Hello from Sangihe Trip API!')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @ResponseMessage('Database connection test successful.')
  @Get('test-db')
  async testDbConnection() {
    const { data, error } = await this.supabase.from('destination_categories').select('*').limit(1);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
