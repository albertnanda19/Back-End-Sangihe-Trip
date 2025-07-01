import { v4 as uuid } from 'uuid';

/**
 * Domain entity that represents an Article in the system.
 * This class is **framework-agnostic** and should not import anything
 * from NestJS or infrastructure layers, keeping the Hexagonal Architecture
 * boundary clean (SRP, DIP).
 */
export class Article {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;
  readonly publishDate: Date;
  status: 'draft' = 'draft';

  constructor(
    public readonly title: string,
    public readonly category: string | number,
    public readonly authorId: string | number,
    public readonly readingTime: number,
    public readonly content: string,
    public readonly tags: string[] = [],
    public readonly featuredImageUrl: string,
    public slug?: string,
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id ?? uuid();
    this.publishDate = new Date();
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = new Date();
    this.status = 'draft';
    if (!this.featuredImageUrl) {
      throw new Error('featuredImageUrl is required');
    }

    // Generate slug if not provided
    this.slug = this.generateSlug(title);
  }

  private generateSlug(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // replace spaces with -
      .replace(/[^a-z0-9-]/g, '') // remove non-alphanumeric
      .replace(/-+/g, '-');
  }
}
