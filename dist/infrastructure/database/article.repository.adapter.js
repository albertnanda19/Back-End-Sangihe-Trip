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
exports.ArticleRepositoryAdapter = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const article_entity_1 = require("../../core/domain/article.entity");
let ArticleRepositoryAdapter = class ArticleRepositoryAdapter {
    client;
    constructor(client) {
        this.client = client;
    }
    toRow(article) {
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            category_id: typeof article.category === 'string' ? parseInt(article.category, 10) : article.category,
            author_id: article.authorId,
            content: article.content,
            featured_image_url: article.featuredImageUrl,
            status: article.status,
            created_at: article.createdAt.toISOString(),
            updated_at: new Date().toISOString(),
        };
    }
    async save(article) {
        const { error } = await this.client
            .from('articles')
            .insert(this.toRow(article));
        if (error) {
            throw new Error(error.message);
        }
        return article;
    }
    async findAll(query) {
        const { page = 1, perPage = 10, search, category, tag, sort = 'latest', includeFeatured = true, includeSidebar = true, } = query;
        let supa = this.client
            .from('articles')
            .select(`id, slug, title, excerpt, category_id, author_id, publish_date, reading_time, featured_image_url`, { count: 'exact' });
        if (search) {
            supa = supa.textSearch('title', search, {
                type: 'websearch',
            });
        }
        if (category) {
            supa = supa.eq('category_id', category);
        }
        if (tag) {
            supa = supa.contains('tags', [tag]);
        }
        switch (sort) {
            case 'oldest':
                supa = supa.order('publish_date', { ascending: true });
                break;
            case 'popular':
                supa = supa.order('publish_date', { ascending: false });
                break;
            case 'latest':
            default:
                supa = supa.order('publish_date', { ascending: false });
        }
        const limit = Math.min(Math.max(perPage, 1), 100);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        supa = supa.range(from, to);
        const { data, count, error } = await supa;
        if (error)
            throw new Error(error.message);
        const categoryIds = Array.from(new Set((data || []).map((r) => r.category_id).filter(Boolean)));
        const authorIds = Array.from(new Set((data || []).map((r) => r.author_id).filter(Boolean)));
        const [catMap, authorMap] = await Promise.all([
            categoryIds.length
                ? this.client
                    .from('categories')
                    .select('id,name')
                    .in('id', categoryIds)
                    .then((res) => {
                    const map = {};
                    (res.data || []).forEach((c) => (map[c.id] = c.name));
                    return map;
                })
                : Promise.resolve({}),
            authorIds.length
                ? this.client
                    .from('users')
                    .select('id,name,avatar_url')
                    .in('id', authorIds)
                    .then((res) => {
                    const map = {};
                    (res.data || []).forEach((u) => (map[u.id] = { name: u.name, avatar: u.avatar_url }));
                    return map;
                })
                : Promise.resolve({}),
        ]);
        const articles = (data || []).map((row) => new article_entity_1.Article(row.title, catMap[row.category_id] ?? row.category_id, row.author_id, row.reading_time, '', [], row.featured_image_url, row.slug, row.id, row.publish_date ? new Date(row.publish_date) : undefined));
        let featured = null;
        let sidebar = undefined;
        if (includeFeatured || includeSidebar) {
            const promises = [];
            if (includeFeatured) {
                promises.push(this.client
                    .from('articles')
                    .select('id, slug, title, excerpt, category_id, author_id, publish_date, reading_time, featured_image_url')
                    .order('publish_date', { ascending: false })
                    .limit(1)
                    .single());
            }
            if (includeSidebar) {
                promises.push(Promise.all([
                    this.client
                        .from('articles')
                        .select('id, title, publish_date, featured_image_url')
                        .order('publish_date', { ascending: false })
                        .limit(5),
                    this.client
                        .from('articles')
                        .select('title')
                        .order('publish_date', { ascending: false })
                        .limit(5),
                    this.client.from('categories').select('name'),
                    this.client.from('tags').select('name').limit(20),
                ]));
            }
            const results = await Promise.all(promises);
            let idx = 0;
            if (includeFeatured) {
                const { data: feat } = results[idx++];
                if (feat) {
                    featured = new article_entity_1.Article(feat.title, catMap[feat.category_id] ?? feat.category_id, feat.author_id ?? '', feat.reading_time, '', [], feat.featured_image_url, feat.slug, feat.id, feat.publish_date ? new Date(feat.publish_date) : undefined);
                }
            }
            if (includeSidebar) {
                const [recentRes, popularRes, catRes, tagRes] = results[idx];
                sidebar = {
                    recent: recentRes.data ?? [],
                    popular: popularRes.data ?? [],
                    categories: (catRes.data ?? []).map((c) => c.name),
                    tags: (tagRes.data ?? []).map((t) => t.name),
                };
            }
        }
        return {
            data: articles,
            totalItems: count || 0,
            featured,
            sidebar,
        };
    }
};
exports.ArticleRepositoryAdapter = ArticleRepositoryAdapter;
exports.ArticleRepositoryAdapter = ArticleRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], ArticleRepositoryAdapter);
//# sourceMappingURL=article.repository.adapter.js.map