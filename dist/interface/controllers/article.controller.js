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
exports.ArticleController = void 0;
const common_1 = require("@nestjs/common");
const create_article_use_case_1 = require("../../core/application/create-article.use-case");
const crypto_1 = require("crypto");
const storage_1 = require("firebase/storage");
const firebase_provider_1 = require("../../infrastructure/firebase/firebase.provider");
const jwt_admin_guard_1 = require("../../common/guards/jwt-admin.guard");
const list_articles_use_case_1 = require("../../core/application/list-articles.use-case");
const article_query_dto_1 = require("../dtos/article-query.dto");
const response_decorator_1 = require("../../common/decorators/response.decorator");
let ArticleController = class ArticleController {
    createArticleUc;
    listArticlesUc;
    storage;
    constructor(createArticleUc, listArticlesUc, storage) {
        this.createArticleUc = createArticleUc;
        this.listArticlesUc = listArticlesUc;
        this.storage = storage;
    }
    async list(query) {
        return await this.listArticlesUc.execute({
            page: query.page,
            perPage: query.per_page,
            search: query.search,
            category: query.category,
            tag: query.tag,
            sort: query.sort,
            includeFeatured: query.include_featured,
            includeSidebar: query.include_sidebar,
        });
    }
    async create(req) {
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
            if (!title || !category || !readingTime || !content || !featuredImageUrl) {
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
            return { status: 200, message: 'Berhasil menambahkan artikel', data: article };
        }
        catch (e) {
            await Promise.all(uploadedRefs.map(r => (0, storage_1.deleteObject)(r).catch(() => { })));
            throw e;
        }
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mendapatkan data daftar artikel'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_query_dto_1.ArticleQueryDto]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_admin_guard_1.JwtAdminGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "create", null);
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('article'),
    __param(2, (0, common_1.Inject)(firebase_provider_1.FIREBASE_STORAGE)),
    __metadata("design:paramtypes", [create_article_use_case_1.CreateArticleUseCase,
        list_articles_use_case_1.ListArticlesUseCase, Object])
], ArticleController);
//# sourceMappingURL=article.controller.js.map