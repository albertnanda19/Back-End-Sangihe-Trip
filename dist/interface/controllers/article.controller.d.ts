import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { FirebaseStorage } from 'firebase/storage';
import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
export declare class ArticleController {
    private readonly createArticleUc;
    private readonly listArticlesUc;
    private readonly storage;
    constructor(createArticleUc: CreateArticleUseCase, listArticlesUc: ListArticlesUseCase, storage: FirebaseStorage);
    list(query: ArticleQueryDto): Promise<{
        data: import("../../core/domain/article.entity").Article[];
        totalItems: number;
        featured?: import("../../core/domain/article.entity").Article | null;
        sidebar?: any;
    }>;
    create(req: any): Promise<{
        status: number;
        message: string;
        data: import("../../core/domain/article.entity").Article;
    }>;
}
