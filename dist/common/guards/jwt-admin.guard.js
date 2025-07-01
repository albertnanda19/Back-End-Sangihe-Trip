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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAdminGuard = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const jwt = require("jsonwebtoken");
let JwtAdminGuard = class JwtAdminGuard {
    publicKey;
    constructor() {
        this.publicKey = (0, fs_1.readFileSync)((0, path_1.join)(process.cwd(), 'public.pem'), 'utf8');
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] || request.headers['Authorization'];
        if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Header Authorization tidak ditemukan atau format tidak benar');
        }
        const token = authHeader.toString().replace('Bearer ', '').trim();
        let payload;
        try {
            payload = jwt.verify(token, this.publicKey, {
                algorithms: ['RS256'],
            });
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
        }
        if (payload?.type !== 'access') {
            throw new common_1.UnauthorizedException('Token bukan akses token');
        }
        if (payload?.role !== 'admin') {
            throw new common_1.ForbiddenException('Hanya admin yang diperbolehkan');
        }
        request.user = payload;
        return true;
    }
};
exports.JwtAdminGuard = JwtAdminGuard;
exports.JwtAdminGuard = JwtAdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JwtAdminGuard);
//# sourceMappingURL=jwt-admin.guard.js.map