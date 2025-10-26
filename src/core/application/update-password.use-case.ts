import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly client: SupabaseClient,
  ) {}

  async execute(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const { data: user, error } = await this.client
      .from('users')
      .select('id, password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Password saat ini tidak sesuai');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await this.client
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update password');
    }
  }
}
