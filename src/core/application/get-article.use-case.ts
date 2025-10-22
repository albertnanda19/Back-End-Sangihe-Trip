import {
  Inject,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArticleRepositoryPort } from '../domain/article.repository.port';

@Injectable()
export class GetArticleUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly repository: ArticleRepositoryPort,
  ) {}

  async execute(idOrSlug: string) {
    try {
      const result = await this.repository.findByIdWithDetails(idOrSlug);
      if (!result) {
        throw new NotFoundException('Artikel tidak ditemukan');
      }
      return result;
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException(e.message);
    }
  }
}
