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
  /**
   * Persists an article and returns the stored entity.
   */
  save(article: Article): Promise<Article>;

  /**
   * Retrieves paginated articles with optional filters.
   */
  findAll(query: ArticleQuery): Promise<{
    data: Article[];
    totalItems: number;
    featured?: Article | null;
    sidebar?: any;
  }>;

  // New: retrieve a single article with full details by ID **or** slug
  findByIdWithDetails(idOrSlug: string): Promise<any>;
}
