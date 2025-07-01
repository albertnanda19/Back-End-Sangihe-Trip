"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const uuid_1 = require("uuid");
class Article {
    title;
    category;
    authorId;
    readingTime;
    content;
    tags;
    featuredImageUrl;
    slug;
    id;
    createdAt;
    updatedAt;
    publishDate;
    status = 'draft';
    constructor(title, category, authorId, readingTime, content, tags = [], featuredImageUrl, slug, id, createdAt) {
        this.title = title;
        this.category = category;
        this.authorId = authorId;
        this.readingTime = readingTime;
        this.content = content;
        this.tags = tags;
        this.featuredImageUrl = featuredImageUrl;
        this.slug = slug;
        this.id = id ?? (0, uuid_1.v4)();
        this.publishDate = new Date();
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = new Date();
        this.status = 'draft';
        if (!this.featuredImageUrl) {
            throw new Error('featuredImageUrl is required');
        }
        this.slug = this.generateSlug(title);
    }
    generateSlug(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');
    }
}
exports.Article = Article;
//# sourceMappingURL=article.entity.js.map