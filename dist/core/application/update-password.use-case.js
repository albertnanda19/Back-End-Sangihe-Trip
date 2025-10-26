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
exports.UpdatePasswordUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt = require("bcrypt");
let UpdatePasswordUseCase = class UpdatePasswordUseCase {
    client;
    constructor(client) {
        this.client = client;
    }
    async execute(userId, currentPassword, newPassword) {
        const { data: user, error } = await this.client
            .from('users')
            .select('id, password_hash')
            .eq('id', userId)
            .single();
        if (error || !user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Password saat ini tidak sesuai');
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
};
exports.UpdatePasswordUseCase = UpdatePasswordUseCase;
exports.UpdatePasswordUseCase = UpdatePasswordUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], UpdatePasswordUseCase);
//# sourceMappingURL=update-password.use-case.js.map