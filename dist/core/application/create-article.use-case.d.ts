import { Article } from '../domain/article.entity';
import { ArticleRepositoryPort } from '../domain/article.repository.port';
interface CreateArticleDTO {
    title: string;
    category: string | number;
    authorId: string | number;
    readingTime: number;
    content: string;
    tags: string[];
    featuredImageUrl: string;
    slug?: string;
}
export declare class CreateArticleUseCase {
    private readonly repository;
    constructor(repository: ArticleRepositoryPort);
    execute(dto: CreateArticleDTO): Promise<Article>;
}
export {};
