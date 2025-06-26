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
exports.UserRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const user_entity_1 = require("../../core/domain/user.entity");
let UserRepositoryAdapter = class UserRepositoryAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    mapRowToUser(row) {
        return new user_entity_1.User(row.id, row.name, row.email, new Date(row.created_at));
    }
    async findById(id) {
        const { data, error } = await this.client
            .from('users')
            .select()
            .eq('id', id)
            .single();
        if (error) {
            return null;
        }
        if (!data)
            return null;
        return this.mapRowToUser(data);
    }
    async save(user) {
        const { data, error } = await this.client
            .from('users')
            .insert({ id: user.id, name: user.name, email: user.email })
            .select()
            .single();
        if (error || !data) {
            throw new Error(`Failed to save user: ${error?.message ?? 'Unknown error'}`);
        }
        return this.mapRowToUser(data);
    }
};
exports.UserRepositoryAdapter = UserRepositoryAdapter;
exports.UserRepositoryAdapter = UserRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], UserRepositoryAdapter);
//# sourceMappingURL=user.repository.adapter.js.map