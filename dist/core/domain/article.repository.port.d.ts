import { Article } from './article.entity';
export interface ArticleQuery {
    page?: number;
    perPage?: number;
    search?: string;
    category?: string;
    tag?: string;
    sort?: 'latest' | 'oldest' | 'popular';
    includeFeatured?: boolean;
    includeSidebar?: boolean;
}
export interface ArticleRepositoryPort {
    save(article: Article): Promise<Article>;
    findAll(query: ArticleQuery): Promise<{
        data: Article[];
        totalItems: number;
        featured?: Article | null;
        sidebar?: any;
    }>;
}
