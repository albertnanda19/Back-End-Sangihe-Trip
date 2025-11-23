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
const list_articles_use_case_1 = require("../../core/application/list-articles.use-case");
const get_article_use_case_1 = require("../../core/application/get-article.use-case");
const article_query_dto_1 = require("../dtos/article-query.dto");
const response_decorator_1 = require("../../common/decorators/response.decorator");
let ArticleController = class ArticleController {
    listArticlesUc;
    getArticleUc;
    constructor(listArticlesUc, getArticleUc) {
        this.listArticlesUc = listArticlesUc;
        this.getArticleUc = getArticleUc;
    }
    async list(query) {
        const result = await this.listArticlesUc.execute({
            page: query.page,
            perPage: query.per_page,
            search: query.search,
            category: query.category,
            tag: query.tag,
            sort: query.sort,
            includeFeatured: query.include_featured,
            includeSidebar: query.include_sidebar,
        });
        const formatPublishDate = (date) => date
            ? new Intl.DateTimeFormat('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }).format(date)
            : '';
        const mapArticle = (article) => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt ?? '',
            category: typeof article.category === 'string'
                ? article.category
                : String(article.category),
            author: {
                name: article.author?.name ?? '',
                avatar: article.author?.avatar ??
                    '/placeholder.svg?height=32&width=32',
            },
            publishDate: formatPublishDate(article.publishDate),
            readingTime: `${article.readingTime} menit`,
            image: article.featuredImageUrl,
            slug: article.slug,
        });
        return {
            featured: result.featured ? mapArticle(result.featured) : null,
            articles: result.data.map((a) => mapArticle(a)),
        };
    }
    async detail(id) {
        return this.getArticleUc.execute(id);
    }
};
exports.ArticleController = ArticleController;
__decorate([
    (0, common_1.Get)(),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil daftar artikel'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [article_query_dto_1.ArticleQueryDto]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, response_decorator_1.ResponseMessage)('Berhasil mengambil detail artikel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ArticleController.prototype, "detail", null);
exports.ArticleController = ArticleController = __decorate([
    (0, common_1.Controller)('article'),
    __metadata("design:paramtypes", [list_articles_use_case_1.ListArticlesUseCase,
        get_article_use_case_1.GetArticleUseCase])
], ArticleController);
//# sourceMappingURL=article.controller.js.map