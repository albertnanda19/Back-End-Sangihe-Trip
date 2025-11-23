import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { GetArticleUseCase } from '../../core/application/get-article.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
export declare class ArticleController {
    private readonly listArticlesUc;
    private readonly getArticleUc;
    constructor(listArticlesUc: ListArticlesUseCase, getArticleUc: GetArticleUseCase);
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
    detail(id: string): Promise<any>;
}
