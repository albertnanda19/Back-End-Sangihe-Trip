import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class CreateArticleUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly repository: ArticleRepositoryPort,
  ) {}

  async execute(dto: CreateArticleDTO): Promise<Article> {
    const article = new Article(
      dto.title,
      dto.category,
      dto.authorId,
      dto.readingTime,
      dto.content,
      dto.tags,
      dto.featuredImageUrl,
      dto.slug,
    );

    return this.repository.save(article);
  }
}
