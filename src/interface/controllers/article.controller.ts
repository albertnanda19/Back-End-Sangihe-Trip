import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';
import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { GetArticleUseCase } from '../../core/application/get-article.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { Article } from '../../core/domain/article.entity';

@Controller('article')
export class ArticleController {
  constructor(
    private readonly listArticlesUc: ListArticlesUseCase,
    private readonly getArticleUc: GetArticleUseCase,
  ) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar artikel')
  async list(@Query() query: ArticleQueryDto) {
    const result = await this.listArticlesUc.execute({
      page: query.page,
      perPage: query.per_page,
      search: query.search,
      category: query.category,
      tag: query.tag,
      sort: query.sort,
      includeFeatured: query.include_featured,
      includeSidebar: query.include_sidebar,
    });

    // Helper to format publish date in Indonesian locale
    const formatPublishDate = (date: Date | undefined) =>
      date
        ? new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(date)
        : '';

    // Transform an Article entity (with extra props) into response shape
    const mapArticle = (article: Article) => ({
      id: article.id,
      title: article.title,
      excerpt: (article as any).excerpt ?? '',
      category:
        typeof article.category === 'string'
          ? article.category
          : String(article.category),
      author: {
        name: (article as any).author?.name ?? '',
        avatar:
          (article as any).author?.avatar ??
          '/placeholder.svg?height=32&width=32',
      },
      publishDate: formatPublishDate(article.publishDate),
      readingTime: `${article.readingTime} menit`,
      image: article.featuredImageUrl,
      slug: article.slug,
    });

    return {
      featured: result.featured ? mapArticle(result.featured) : null,
      articles: result.data.map((a) => mapArticle(a)),
    };
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail artikel')
  async detail(@Param('id') id: string) {
    return this.getArticleUc.execute(id);
  }
}
