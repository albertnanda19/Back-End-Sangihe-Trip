import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { FirebaseStorage } from 'firebase/storage';
import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
import { Article } from '../../core/domain/article.entity';
export declare class ArticleController {
    private readonly createArticleUc;
    private readonly listArticlesUc;
    private readonly storage;
    constructor(createArticleUc: CreateArticleUseCase, listArticlesUc: ListArticlesUseCase, storage: FirebaseStorage);
    list(query: ArticleQueryDto): Promise<{
        featured: {
            id: string;
            title: string;
            excerpt: any;
            category: string;
            author: {
                name: any;
                avatar: any;
            };
            publishDate: string;
            readingTime: string;
            image: string;
            slug: string | undefined;
        } | null;
        articles: {
            id: string;
            title: string;
            excerpt: any;
            category: string;
            author: {
                name: any;
                avatar: any;
            };
            publishDate: string;
            readingTime: string;
            image: string;
            slug: string | undefined;
        }[];
    }>;
    create(req: any): Promise<{
        status: number;
        message: string;
        data: Article;
    }>;
}
