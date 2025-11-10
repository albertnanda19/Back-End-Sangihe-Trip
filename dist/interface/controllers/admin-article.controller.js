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
exports.AdminArticleController = void 0;
const common_1 = require("@nestjs/common");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_article_use_case_1 = require("../../core/application/admin-article.use-case");
const admin_article_query_dto_1 = require("../dtos/admin/admin-article-query.dto");
const admin_article_dto_1 = require("../dtos/admin/admin-article.dto");
let AdminArticleController = class AdminArticleController {
    adminArticleUseCase;
    constructor(adminArticleUseCase) {
        this.adminArticleUseCase = adminArticleUseCase;
    }
    async list(query) {
        const result = await this.adminArticleUseCase.list(query);
        return result;
    }
    async getById(id) {
        const result = await this.adminArticleUseCase.getById(id);
        return result;
    }
    async create(dto, req) {
        const adminId = req.user.id;
        const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
        const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
        const adminUser = req.user;
        const result = await this.adminArticleUseCase.create(dto, adminId, adminUser, ipAddress, userAgent);
        return result;
    }
    async update(id, dto, req) {
        const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
        const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
        const adminUser = req.user;
        const result = await this.adminArticleUseCase.update(id, dto, adminUser, ipAddress, userAgent);
        return result;
    }
    async delete(id, req) {
        const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
        const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
        const adminUser = req.user;
        await this.adminArticleUseCase.delete(id, adminUser, ipAddress, userAgent);
        return null;
    }
    async publish(id, req) {
        const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
        const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
        const adminUser = req.user;
        const result = await this.adminArticleUseCase.publish(id, adminUser, ipAddress, userAgent);
        return result;
    }
};
exports.AdminArticleController = AdminArticleController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan daftar artikel'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_article_query_dto_1.AdminArticleQueryDto]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan detail artikel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil membuat artikel baru'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_article_dto_1.CreateAdminArticleDto, Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil memperbarui artikel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, admin_article_dto_1.UpdateAdminArticleDto, Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil menghapus artikel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "delete", null);
__decorate([
    (0, common_1.Put)(':id/publish'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mempublikasikan artikel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "publish", null);
exports.AdminArticleController = AdminArticleController = __decorate([
    (0, common_1.Controller)('admin/articles'),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __metadata("design:paramtypes", [admin_article_use_case_1.AdminArticleUseCase])
], AdminArticleController);
//# sourceMappingURL=admin-article.controller.js.map