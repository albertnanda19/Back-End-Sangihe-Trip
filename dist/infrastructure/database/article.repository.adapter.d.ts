import { SupabaseClient } from '@supabase/supabase-js';
import { Article } from '../../core/domain/article.entity';
import { ArticleRepositoryPort, ArticleQuery } from '../../core/domain/article.repository.port';
export declare class ArticleRepositoryAdapter implements ArticleRepositoryPort {
    private readonly client;
    constructor(client: SupabaseClient);
    private toRow;
    save(article: Article): Promise<Article>;
    findAll(query: ArticleQuery): Promise<{
        data: Article[];
        totalItems: number;
        featured?: Article | null;
        sidebar?: any;
    }>;
    findByIdWithDetails(idOrSlug: string): Promise<any>;
}
