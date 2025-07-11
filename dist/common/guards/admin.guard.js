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
exports.AdminGuard = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let AdminGuard = class AdminGuard {
    jwtService;
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'] || request.headers['Authorization'];
        if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or malformed Authorization header');
        }
        const token = authHeader.toString().replace('Bearer ', '').trim();
        let payload;
        try {
            payload = this.jwtService.verify(token);
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        if (payload?.role !== 'admin') {
            throw new common_1.ForbiddenException('Administrator role required');
        }
        request.user = payload;
        return true;
    }
};
exports.AdminGuard = AdminGuard;
exports.AdminGuard = AdminGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AdminGuard);
//# sourceMappingURL=admin.guard.js.map