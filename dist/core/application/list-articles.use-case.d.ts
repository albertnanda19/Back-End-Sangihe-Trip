import { ArticleRepositoryPort, ArticleQuery } from '../domain/article.repository.port';
export declare class ListArticlesUseCase {
    private readonly repository;
    constructor(repository: ArticleRepositoryPort);
    execute(query: ArticleQuery): Promise<{
        data: import("../domain/article.entity").Article[];
        totalItems: number;
        featured?: import("../domain/article.entity").Article | null;
        sidebar?: any;
    }>;
}
