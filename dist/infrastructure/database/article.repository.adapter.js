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
            category: typeof article.category === 'string'
                ? parseInt(article.category, 10)
                : article.category,
            author_id: article.authorId,
            content: article.content,
            featured_image: article.featuredImageUrl,
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
            .select(`id, slug, title, excerpt, category, author_id, published_at, read_time_minutes, featured_image`, { count: 'exact' });
        if (search) {
            supa = supa.textSearch('title', search, {
                type: 'websearch',
            });
        }
        if (category) {
            supa = supa.eq('category', category);
        }
        if (tag) {
            supa = supa.contains('tags', [tag]);
        }
        switch (sort) {
            case 'oldest':
                supa = supa.order('published_at', { ascending: true });
                break;
            case 'popular':
                supa = supa.order('published_at', { ascending: false });
                break;
            case 'latest':
            default:
                supa = supa.order('published_at', { ascending: false });
        }
        const limit = Math.min(Math.max(perPage, 1), 100);
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        supa = supa.range(from, to);
        const { data, count, error } = await supa;
        if (error)
            throw new Error(error.message);
        const categoryIds = Array.from(new Set((data || []).map((r) => r.category).filter(Boolean)));
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
        const articles = (data || []).map((row) => {
            const art = new article_entity_1.Article(row.title, catMap[row.category] ?? row.category, row.author_id, row.read_time_minutes, '', [], row.featured_image, row.slug, row.id, row.published_at ? new Date(row.published_at) : undefined);
            art.excerpt = row.excerpt;
            art.author = authorMap[row.author_id] ?? null;
            return art;
        });
        let featured = null;
        let sidebar = undefined;
        if (includeFeatured || includeSidebar) {
            const promises = [];
            if (includeFeatured) {
                promises.push(this.client
                    .from('articles')
                    .select('id, slug, title, excerpt, category, author_id, published_at, read_time_minutes, featured_image')
                    .order('published_at', { ascending: false })
                    .limit(1)
                    .single());
            }
            if (includeSidebar) {
                promises.push(Promise.all([
                    this.client
                        .from('articles')
                        .select('id, title, published_at, featured_image')
                        .order('published_at', { ascending: false })
                        .limit(5),
                    this.client
                        .from('articles')
                        .select('title')
                        .order('published_at', { ascending: false })
                        .limit(5),
                    this.client
                        .from('categories')
                        .select('name'),
                    this.client
                        .from('tags')
                        .select('name')
                        .limit(20),
                ]));
            }
            const results = await Promise.all(promises);
            let idx = 0;
            if (includeFeatured) {
                const { data: feat } = results[idx++];
                if (feat) {
                    featured = new article_entity_1.Article(feat.title, catMap[feat.category] ?? feat.category, feat.author_id ?? '', feat.read_time_minutes, '', [], feat.featured_image, feat.slug, feat.id, feat.published_at ? new Date(feat.published_at) : undefined);
                    featured.excerpt = feat.excerpt;
                    featured.author = authorMap[feat.author_id] ?? null;
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
    async findByIdWithDetails(idOrSlug) {
        const cleanInput = idOrSlug.trim();
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
        let query = this.client.from('articles').select('*');
        if (isUUID) {
            query = query.eq('id', cleanInput);
        }
        else {
            query = query.eq('slug', cleanInput);
        }
        const { data: articleRow, error: articleErr } = await query.single();
        if (articleErr) {
            if (articleErr.code === 'PGRST116') {
                return null;
            }
            throw new Error(articleErr.message);
        }
        if (!articleRow)
            return null;
        if (!isUUID) {
            void this.incrementViewCount(articleRow.id, articleRow.view_count || 0);
        }
        const [authorRes, categoryRes, relatedRes, commentsRes, statsRes] = await Promise.all([
            this.client
                .from('users')
                .select('id,first_name,last_name,avatar_url,bio')
                .eq('id', articleRow.author_id)
                .maybeSingle(),
            Promise.resolve({ data: null }),
            this.client
                .from('articles')
                .select('id,slug,title,category,read_time_minutes,featured_image')
                .eq('category', articleRow.category)
                .neq('id', articleRow.id)
                .order('published_at', { ascending: false })
                .limit(3),
            (async () => {
                try {
                    return await this.client
                        .from('article_comments')
                        .select('id,user_id,content,created_at,likes,parent_id')
                        .eq('article_id', articleRow.id)
                        .order('created_at', { ascending: false })
                        .limit(100);
                }
                catch {
                    return { data: [] };
                }
            })(),
            this.client
                .from('articles')
                .select('id', { count: 'exact', head: true })
                .eq('author_id', articleRow.author_id),
        ]);
        const authorRow = authorRes.data;
        const categoryName = articleRow.category ?? 'Uncategorized';
        const totalAuthorArticles = statsRes.count ?? 0;
        const generateTOC = (markdown) => {
            const lines = markdown.split(/\n/);
            const toc = [];
            for (const line of lines) {
                const match = /^(#{2,3})\s+(.*)/.exec(line.trim());
                if (match) {
                    const title = match[2].trim();
                    const id = title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .trim()
                        .replace(/\s+/g, '-');
                    toc.push({ id, title });
                }
            }
            return toc;
        };
        const toc = generateTOC(articleRow.content || '');
        const wordCount = (articleRow.content || '')
            .split(/\s+/)
            .filter(Boolean).length;
        const article = {
            id: articleRow.id,
            slug: articleRow.slug,
            title: articleRow.title,
            category: categoryName,
            author: {
                id: authorRow?.id ?? '',
                name: authorRow
                    ? `${authorRow.first_name || ''} ${authorRow.last_name || ''}`.trim()
                    : 'Unknown Author',
                avatar: authorRow?.avatar_url ?? '/placeholder.svg?height=64&width=64',
                bio: authorRow?.bio ?? '',
                fullBio: authorRow?.bio ?? '',
                followers: 0,
                totalArticles: totalAuthorArticles,
            },
            publishDate: articleRow.published_at,
            readingTime: articleRow.read_time_minutes,
            featuredImage: articleRow.featured_image || '',
            tags: articleRow.tags ?? [],
            content: articleRow.content,
            wordCount,
            viewCount: articleRow.view_count || 0,
        };
        const related = (relatedRes.data || []).map((r) => ({
            id: r.id,
            slug: r.slug,
            title: r.title,
            category: categoryName,
            image: r.featured_image || '',
            readingTime: r.read_time_minutes,
        }));
        const flatComments = commentsRes.data || [];
        const commentMap = {};
        const rootComments = [];
        flatComments.forEach((c) => {
            const comment = {
                id: c.id,
                user: {
                    id: c.user_id,
                    name: `User ${c.user_id}`,
                    avatar: '/placeholder.svg?height=32&width=32',
                },
                createdAt: c.created_at,
                content: c.content,
                likes: c.likes ?? 0,
                replies: [],
            };
            commentMap[c.id] = comment;
            if (c.parent_id) {
                commentMap[c.parent_id]?.replies.push(comment);
            }
            else {
                rootComments.push(comment);
            }
        });
        return {
            article,
            tableOfContents: toc,
            relatedArticles: related,
            comments: rootComments,
        };
    }
    async incrementViewCount(articleId, currentCount) {
        try {
            await this.client
                .from('articles')
                .update({ view_count: currentCount + 1 })
                .eq('id', articleId);
        }
        catch (error) {
        }
    }
};
exports.ArticleRepositoryAdapter = ArticleRepositoryAdapter;
exports.ArticleRepositoryAdapter = ArticleRepositoryAdapter = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('SUPABASE_CLIENT')),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], ArticleRepositoryAdapter);
//# sourceMappingURL=article.repository.adapter.js.map