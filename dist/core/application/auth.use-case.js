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
exports.AuthUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");
const jwt_1 = require("@nestjs/jwt");
const uuid_1 = require("uuid");
const user_entity_1 = require("../domain/user.entity");
let AuthUseCase = class AuthUseCase {
    client;
    jwt;
    constructor(client, jwt) {
        this.client = client;
        this.jwt = jwt;
    }
    mapRowToUser(row) {
        return new user_entity_1.User(row.id, `${row.first_name} ${row.last_name}`.trim(), row.email, new Date(row.created_at));
    }
    async execute(dto) {
        const { email, password, name } = dto;
        const { data: existing } = await this.client
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
        if (existing) {
            throw new common_1.ConflictException('Email telah terdaftar');
        }
        const hashed = await bcrypt.hash(password, 10);
        const newUserId = (0, uuid_1.v4)();
        const { data: created, error: insertErr } = await this.client
            .from('users')
            .insert({ id: newUserId, email, password_hash: hashed, first_name: name, last_name: '' })
            .select()
            .single();
        if (insertErr || !created) {
            throw new Error(insertErr?.message ?? 'Failed to create account');
        }
        const user = this.mapRowToUser(created);
        return user;
    }
    async login(dto) {
        const { email, password } = dto;
        const { data: row } = await this.client
            .from('users')
            .select('id, first_name, last_name, email, password_hash, role_id')
            .eq('email', email)
            .single();
        if (!row) {
            throw new common_1.UnauthorizedException('Email atau password salah');
        }
        const isMatch = await bcrypt.compare(password, row.password_hash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Email atau password salah');
        }
        const { data: roleRow } = await this.client
            .from('roles')
            .select('name')
            .eq('id', row.role_id)
            .single();
        const role = roleRow?.name ?? null;
        const name = `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim();
        const issuer = process.env.JWT_ISSUER ?? 'sangihe-trip';
        const audience = process.env.JWT_AUDIENCE ?? 'sangihe-trip';
        const accessPayload = {
            id: row.id,
            name,
            email: row.email,
            role,
            iss: issuer,
            aud: audience,
            type: 'access',
        };
        const refreshPayload = {
            iss: issuer,
            aud: audience,
            type: 'refresh',
        };
        const access_token = this.jwt.sign(accessPayload, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '2h',
        });
        const refresh_token = this.jwt.sign(refreshPayload, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
        });
        return { access_token, refresh_token };
    }
};
exports.AuthUseCase = AuthUseCase;
exports.AuthUseCase = AuthUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        jwt_1.JwtService])
], AuthUseCase);
//# sourceMappingURL=auth.use-case.js.map