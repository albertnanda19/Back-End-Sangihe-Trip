import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  ArticleRepositoryPort,
  ArticleQuery,
} from '../domain/article.repository.port';

@Injectable()
export class ListArticlesUseCase {
  constructor(
    @Inject('ArticleRepository')
    private readonly repository: ArticleRepositoryPort,
  ) {}

  async execute(query: ArticleQuery) {
    try {
      return await this.repository.findAll(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
