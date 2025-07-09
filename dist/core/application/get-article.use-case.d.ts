import { ArticleRepositoryPort } from '../domain/article.repository.port';
export declare class GetArticleUseCase {
    private readonly repository;
    constructor(repository: ArticleRepositoryPort);
    execute(idOrSlug: string): Promise<any>;
}
