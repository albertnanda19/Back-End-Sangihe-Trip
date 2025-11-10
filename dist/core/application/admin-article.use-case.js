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
exports.AdminArticleUseCase = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const activity_logger_service_1 = require("./activity-logger.service");
let AdminArticleUseCase = class AdminArticleUseCase {
    supabase;
    activityLogger;
    constructor(supabase, activityLogger) {
        this.supabase = supabase;
        this.activityLogger = activityLogger;
    }
    async list(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;
        const sortBy = query.sortBy || 'created_at';
        const sortOrder = query.sortOrder || 'desc';
        let dbQuery = this.supabase
            .from('articles')
            .select('*, users!articles_author_id_fkey(first_name, last_name, email)', {
            count: 'exact',
        })
            .is('deleted_at', null);
        if (query.search) {
            dbQuery = dbQuery.or(`title.ilike.%${query.search}%,content.ilike.%${query.search}%,excerpt.ilike.%${query.search}%`);
        }
        if (query.status) {
            dbQuery = dbQuery.eq('status', query.status);
        }
        if (query.category) {
            dbQuery = dbQuery.eq('category', query.category);
        }
        const ascending = sortOrder === 'asc';
        dbQuery = dbQuery.order(sortBy, { ascending });
        dbQuery = dbQuery.range(offset, offset + limit - 1);
        const { data, error, count } = await dbQuery;
        if (error) {
            throw new Error(`Failed to fetch articles: ${error.message}`);
        }
        const transformedData = (data || []).map((article) => ({
            id: article.id,
            title: article.title,
            category: article.category,
            status: article.status,
            viewCount: article.view_count,
            author: {
                firstName: article.users?.first_name,
                lastName: article.users?.last_name,
            },
            createdAt: article.created_at,
            updatedAt: article.updated_at,
            publishedAt: article.published_at,
        }));
        return {
            data: transformedData,
            meta: {
                page,
                limit,
                total: count || 0,
            },
        };
    }
    async getById(id) {
        const { data: article, error } = await this.supabase
            .from('articles')
            .select('*, users!articles_author_id_fkey(first_name, last_name, email, avatar_url)')
            .eq('id', id)
            .is('deleted_at', null)
            .single();
        if (error || !article) {
            throw new common_1.NotFoundException('Article not found');
        }
        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            excerpt: article.excerpt,
            category: article.category,
            featuredImage: article.featured_image,
            status: article.status,
            viewCount: article.view_count,
            readingTime: article.reading_time,
            author: {
                firstName: article.users?.first_name,
                lastName: article.users?.last_name,
                email: article.users?.email,
                avatarUrl: article.users?.avatar_url,
            },
            createdAt: article.created_at,
            updatedAt: article.updated_at,
            publishedAt: article.published_at,
        };
    }
    async create(data, adminId, adminUser, ipAddress, userAgent) {
        const slug = await this.generateUniqueSlug(data.title);
        const readingTime = this.calculateReadingTime(data.content);
        const articleData = {
            title: data.title,
            slug,
            content: data.content,
            excerpt: data.excerpt,
            category: data.category,
            featured_image: data.coverImage,
            status: data.status || 'draft',
            author_id: adminId,
            view_count: 0,
            reading_time: readingTime,
        };
        if (articleData.status === 'published') {
            articleData.published_at = new Date().toISOString();
            articleData.published_by = adminId;
        }
        const { data: article, error } = await this.supabase
            .from('articles')
            .insert(articleData)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create article: ${error.message}`);
        }
        if (adminUser) {
            const adminName = adminUser.name || 'Admin';
            await this.activityLogger.logAdminAction(adminUser.id, 'create', 'article', article.id, {
                articleTitle: data.title,
                description: `${adminName} created article "${data.title}"`,
            }, article, adminName, adminUser.email, data.title, ipAddress, userAgent);
        }
        return this.getById(article.id);
    }
    async update(id, data, adminUser, ipAddress, userAgent) {
        const existingArticle = await this.getById(id);
        const updateData = {};
        if (data.title !== undefined) {
            updateData.title = data.title;
            updateData.slug = await this.generateUniqueSlug(data.title, id);
        }
        if (data.content !== undefined) {
            updateData.content = data.content;
            updateData.reading_time = this.calculateReadingTime(data.content);
        }
        if (data.excerpt !== undefined)
            updateData.excerpt = data.excerpt;
        if (data.category !== undefined)
            updateData.category = data.category;
        if (data.coverImage !== undefined)
            updateData.featured_image = data.coverImage;
        if (data.status !== undefined) {
            updateData.status = data.status;
            if (data.status === 'published') {
                const { data: current } = await this.supabase
                    .from('articles')
                    .select('published_at')
                    .eq('id', id)
                    .single();
                if (!current?.published_at) {
                    updateData.published_at = new Date().toISOString();
                }
            }
        }
        const { error } = await this.supabase
            .from('articles')
            .update(updateData)
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to update article: ${error.message}`);
        }
        const updatedArticle = await this.getById(id);
        if (adminUser && Object.keys(updateData).length > 0) {
            const adminName = adminUser.name || 'Admin';
            const articleTitle = updatedArticle.title;
            const oldValues = {};
            const newValues = {};
            if (data.title !== undefined) {
                oldValues.title = existingArticle.title;
                newValues.title = data.title;
            }
            if (data.content !== undefined) {
                oldValues.content = existingArticle.content;
                newValues.content = data.content;
            }
            if (data.excerpt !== undefined) {
                oldValues.excerpt = existingArticle.excerpt;
                newValues.excerpt = data.excerpt;
            }
            if (data.category !== undefined) {
                oldValues.category = existingArticle.category;
                newValues.category = data.category;
            }
            if (data.coverImage !== undefined) {
                oldValues.featured_image = existingArticle.featuredImage;
                newValues.featured_image = data.coverImage;
            }
            if (data.status !== undefined) {
                oldValues.status = existingArticle.status;
                newValues.status = data.status;
            }
            await this.activityLogger.logAdminAction(adminUser.id, 'update', 'article', id, {
                articleTitle,
                description: `${adminName} updated article "${articleTitle}"`,
            }, newValues, adminName, adminUser.email, articleTitle, ipAddress, userAgent, oldValues);
        }
        return updatedArticle;
    }
    async delete(id, adminUser, ipAddress, userAgent) {
        const existing = await this.getById(id);
        if (adminUser) {
            const adminName = adminUser.name || 'Admin';
            await this.activityLogger.logAdminAction(adminUser.id, 'delete', 'article', id, {
                articleTitle: existing.title,
                description: `${adminName} deleted article "${existing.title}"`,
            }, null, adminName, adminUser.email, existing.title, ipAddress, userAgent);
        }
        const { error } = await this.supabase.from('articles').delete().eq('id', id);
        if (error) {
            throw new Error(`Failed to delete article: ${error.message}`);
        }
    }
    async publish(id, adminUser, ipAddress, userAgent) {
        const existingArticle = await this.getById(id);
        const updateData = {
            status: 'published',
            published_at: new Date().toISOString(),
        };
        const { error } = await this.supabase
            .from('articles')
            .update(updateData)
            .eq('id', id);
        if (error) {
            throw new Error(`Failed to publish article: ${error.message}`);
        }
        const updatedArticle = await this.getById(id);
        if (adminUser) {
            const adminName = adminUser.name || 'Admin';
            const articleTitle = updatedArticle.title;
            await this.activityLogger.logAdminAction(adminUser.id, 'update', 'article', id, {
                articleTitle,
                description: `${adminName} published article "${articleTitle}"`,
            }, { status: 'published', published_at: updateData.published_at }, adminName, adminUser.email, articleTitle, ipAddress, userAgent, { status: existingArticle.status, published_at: existingArticle.publishedAt });
        }
        return updatedArticle;
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    async generateUniqueSlug(title, excludeId) {
        const baseSlug = this.generateSlug(title);
        let slug = baseSlug;
        let counter = 1;
        while (true) {
            let query = this.supabase
                .from('articles')
                .select('id')
                .eq('slug', slug)
                .is('deleted_at', null);
            if (excludeId) {
                query = query.neq('id', excludeId);
            }
            const { data, error } = await query.maybeSingle();
            if (error) {
                throw new Error(`Failed to check slug uniqueness: ${error.message}`);
            }
            if (!data) {
                return slug;
            }
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }
    calculateReadingTime(content) {
        if (!content)
            return 1;
        const words = content
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);
        const minutes = Math.ceil(words.length / 200);
        return Math.max(1, minutes);
    }
};
exports.AdminArticleUseCase = AdminArticleUseCase;
exports.AdminArticleUseCase = AdminArticleUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        activity_logger_service_1.ActivityLoggerService])
], AdminArticleUseCase);
//# sourceMappingURL=admin-article.use-case.js.map