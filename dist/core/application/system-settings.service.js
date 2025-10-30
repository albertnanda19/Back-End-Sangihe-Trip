"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemSettingsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
let SystemSettingsService = class SystemSettingsService {
    supabase;
    constructor(supabase) {
        this.supabase = supabase;
    }
    async getSetting(key) {
        const { data, error } = await this.supabase
            .from('system_settings')
            .select('value, type')
            .eq('key', key)
            .single();
        if (error || !data) {
            return null;
        }
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
                }
                catch {
                    return data.value;
                }
            default:
                return data.value;
        }
    }
    async isReviewModerationEnabled() {
        const value = await this.getSetting('review_moderation_enabled');
        return value === true;
    }
    async getMaxUploadSize() {
        const value = await this.getSetting('max_upload_size');
        return value || 10485760;
    }
    async getSupportedImageTypes() {
        const value = await this.getSetting('supported_image_types');
        return value || ['jpg', 'jpeg', 'png', 'webp'];
    }
};
exports.SystemSettingsService = SystemSettingsService;
exports.SystemSettingsService = SystemSettingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], SystemSettingsService);
//# sourceMappingURL=system-settings.service.js.map