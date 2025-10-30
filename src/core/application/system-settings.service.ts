import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SystemSettingsService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async getSetting(key: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('system_settings')
      .select('value, type')
      .eq('key', key)
      .single();

    if (error || !data) {
      return null;
    }

    // Parse value based on type
    switch (data.type) {
      case 'boolean':
        return data.value === 'true';
      case 'integer':
        return parseInt(data.value, 10);
      case 'float':
        return parseFloat(data.value);
      case 'json':
        try {
          return JSON.parse(data.value);
        } catch {
          return data.value;
        }
      default:
        return data.value;
    }
  }

  async isReviewModerationEnabled(): Promise<boolean> {
    const value = await this.getSetting('review_moderation_enabled');
    return value === true;
  }

  async getMaxUploadSize(): Promise<number> {
    const value = await this.getSetting('max_upload_size');
    return value || 10485760; // 10MB default
  }

  async getSupportedImageTypes(): Promise<string[]> {
    const value = await this.getSetting('supported_image_types');
    return value || ['jpg', 'jpeg', 'png', 'webp'];
  }
}