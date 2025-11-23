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
const crypto_1 = require("crypto");
const storage_1 = require("firebase/storage");
const firebase_provider_1 = require("../../infrastructure/firebase/firebase.provider");
const create_article_use_case_1 = require("../../core/application/create-article.use-case");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const response_decorator_1 = require("../../common/decorators/response.decorator");
const admin_article_use_case_1 = require("../../core/application/admin-article.use-case");
const admin_article_query_dto_1 = require("../dtos/admin/admin-article-query.dto");
const admin_article_dto_1 = require("../dtos/admin/admin-article.dto");
let AdminArticleController = class AdminArticleController {
    adminArticleUseCase;
    createArticleUc;
    storage;
    constructor(adminArticleUseCase, createArticleUc, storage) {
        this.adminArticleUseCase = adminArticleUseCase;
        this.createArticleUc = createArticleUc;
        this.storage = storage;
    }
    async list(query) {
        const result = await this.adminArticleUseCase.list(query);
        return result;
    }
    async getById(id) {
        const result = await this.adminArticleUseCase.getById(id);
        return result;
    }
    async createWithUpload(req) {
        const parts = req.parts();
        const fields = {};
        let featuredImageUrl = '';
        const uploadedRefs = [];
        try {
            for await (const part of parts) {
                if (part.type === 'file' && part.fieldname === 'featuredImage') {
                    const buffer = await part.toBuffer();
                    if (buffer.length > 2 * 1024 * 1024) {
                        throw new common_1.HttpException({ status: 400, message: 'Ukuran gambar maksimal 2MB' }, common_1.HttpStatus.BAD_REQUEST);
                    }
                    const ext = (part.filename?.split('.').pop() ?? '').toLowerCase();
                    const filename = `${(0, crypto_1.randomUUID)()}.${ext}`;
                    const storageRef = (0, storage_1.ref)(this.storage, `articles/${filename}`);
                    await (0, storage_1.uploadBytes)(storageRef, buffer, { contentType: part.mimetype });
                    uploadedRefs.push(storageRef);
                    featuredImageUrl = await (0, storage_1.getDownloadURL)(storageRef);
                }
                else if (part.type === 'field') {
                    fields[part.fieldname] = part.value;
                }
            }
            const { title, category, readingTime, content, slug } = fields;
            if (!title ||
                !category ||
                !readingTime ||
                !content ||
                !featuredImageUrl) {
                throw new common_1.HttpException({ status: 400, message: 'Data wajib tidak lengkap' }, common_1.HttpStatus.BAD_REQUEST);
            }
            const tagsRaw = fields['tags[]'];
            const tags = Array.isArray(tagsRaw) ? tagsRaw : tagsRaw ? [tagsRaw] : [];
            const authorId = req.user?.id;
            const article = await this.createArticleUc.execute({
                title,
                category,
                authorId,
                readingTime: Number(readingTime),
                content,
                tags,
                featuredImageUrl,
                slug,
            });
            return article;
        }
        catch (e) {
            await Promise.all(uploadedRefs.map((r) => (0, storage_1.deleteObject)(r).catch(() => { })));
            throw e;
        }
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
    (0, common_1.Post)('upload'),
    (0, response_decorator_1.ResponseMessage)('Berhasil membuat artikel baru'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminArticleController.prototype, "createWithUpload", null);
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
    __param(2, (0, common_1.Inject)(firebase_provider_1.FIREBASE_STORAGE)),
    __metadata("design:paramtypes", [admin_article_use_case_1.AdminArticleUseCase,
        create_article_use_case_1.CreateArticleUseCase, Object])
], AdminArticleController);
//# sourceMappingURL=admin-article.controller.js.map