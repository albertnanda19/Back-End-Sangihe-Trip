import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { ActivityLoggerService } from './activity-logger.service';

export interface AdminArticleListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: string;
}

@Injectable()
export class AdminArticleUseCase {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async list(query: AdminArticleListQuery): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';

    // Build query
    let dbQuery = this.supabase
      .from('articles')
      .select('*, users!articles_author_id_fkey(first_name, last_name, email)', {
        count: 'exact',
      })
      .is('deleted_at', null);

    // Apply filters
    if (query.search) {
      dbQuery = dbQuery.or(
        `title.ilike.%${query.search}%,content.ilike.%${query.search}%,excerpt.ilike.%${query.search}%`,
      );
    }

    if (query.status) {
      dbQuery = dbQuery.eq('status', query.status);
    }

    if (query.category) {
      dbQuery = dbQuery.eq('category', query.category);
    }

    // Sort
    const ascending = sortOrder === 'asc';
    dbQuery = dbQuery.order(sortBy, { ascending });

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error, count } = await dbQuery;

    if (error) {
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    // Transform data
    const transformedData = (data || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      status: article.status,
      viewCount: article.view_count,
      author: {
        firstName: article.users?.first_name,
        lastName: article.users?.last_name,
      },
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      publishedAt: article.published_at,
    }));

    return {
      data: transformedData,
      meta: {
        page,
        limit,
        total: count || 0,
      },
    };
  }

  async getById(id: string): Promise<any> {
    const { data: article, error } = await this.supabase
      .from('articles')
      .select('*, users!articles_author_id_fkey(first_name, last_name, email, avatar_url)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !article) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      content: article.content,
      excerpt: article.excerpt,
      category: article.category,
      featuredImage: article.featured_image,
      status: article.status,
      viewCount: article.view_count,
      readingTime: article.reading_time,
      author: {
        firstName: article.users?.first_name,
        lastName: article.users?.last_name,
        email: article.users?.email,
        avatarUrl: article.users?.avatar_url,
      },
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      publishedAt: article.published_at,
    };
  }

  async create(data: any, adminId: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any> {
    // Generate unique slug from title
    const slug = await this.generateUniqueSlug(data.title);

    // Calculate reading time (words per minute = 200)
    const readingTime = this.calculateReadingTime(data.content);

    const articleData: any = {
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      category: data.category,
      featured_image: data.coverImage,
      status: data.status || 'draft',
      author_id: adminId,
      view_count: 0,
      reading_time: readingTime,
    };

    // Set published_at and published_by if status is published
    if (articleData.status === 'published') {
      articleData.published_at = new Date().toISOString();
      articleData.published_by = adminId;
    }

    const { data: article, error } = await this.supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create article: ${error.message}`);
    }

    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      await this.activityLogger.logAdminAction(
        adminUser.id,
        'create',
        'article',
        article.id,
        {
          articleTitle: data.title,
          description: `${adminName} created article "${data.title}"`,
        },
        article, // newValues: created article
        adminName,
        adminUser.email,
        data.title,
        ipAddress,
        userAgent,
      );
    }

    return this.getById(article.id);
  }

  async update(id: string, data: any, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any> {
    // Verify article exists
    const existingArticle = await this.getById(id);

    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = await this.generateUniqueSlug(data.title, id);
    }
    if (data.content !== undefined) {
      updateData.content = data.content;
      // Recalculate reading time when content changes
      updateData.reading_time = this.calculateReadingTime(data.content);
    }
    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.coverImage !== undefined) updateData.featured_image = data.coverImage;
    if (data.status !== undefined) {
      updateData.status = data.status;
      // Set published_at when changing to published
      if (data.status === 'published') {
        const { data: current } = await this.supabase
          .from('articles')
          .select('published_at')
          .eq('id', id)
          .single();

        if (!current?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
    }

    const { error } = await this.supabase
      .from('articles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update article: ${error.message}`);
    }

    const updatedArticle = await this.getById(id);

    // Log admin action if admin user provided
    if (adminUser && Object.keys(updateData).length > 0) {
      const adminName = adminUser.name || 'Admin';
      const articleTitle = updatedArticle.title;

      // Prepare old and new values for logging - only include changed fields
      const oldValues: any = {};
      const newValues: any = {};

      if (data.title !== undefined) {
        oldValues.title = existingArticle.title;
        newValues.title = data.title;
      }
      if (data.content !== undefined) {
        oldValues.content = existingArticle.content;
        newValues.content = data.content;
      }
      if (data.excerpt !== undefined) {
        oldValues.excerpt = existingArticle.excerpt;
        newValues.excerpt = data.excerpt;
      }
      if (data.category !== undefined) {
        oldValues.category = existingArticle.category;
        newValues.category = data.category;
      }
      if (data.coverImage !== undefined) {
        oldValues.featured_image = existingArticle.featuredImage;
        newValues.featured_image = data.coverImage;
      }
      if (data.status !== undefined) {
        oldValues.status = existingArticle.status;
        newValues.status = data.status;
      }

      await this.activityLogger.logAdminAction(
        adminUser.id,
        'update',
        'article',
        id,
        {
          articleTitle,
          description: `${adminName} updated article "${articleTitle}"`,
        },
        newValues,
        adminName,
        adminUser.email,
        articleTitle,
        ipAddress,
        userAgent,
        oldValues,
      );
    }

    return updatedArticle;
  }

  async delete(
    id: string,
    adminUser?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // Verify article exists
    const existing = await this.getById(id);

    // Log admin action if admin user provided
    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      await this.activityLogger.logAdminAction(
        adminUser.id,
        'delete',
        'article',
        id,
        {
          articleTitle: existing.title,
          description: `${adminName} deleted article "${existing.title}"`,
        },
        null,
        adminName,
        adminUser.email,
        existing.title,
        ipAddress,
        userAgent,
      );
    }

    const { error } = await this.supabase.from('articles').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete article: ${error.message}`);
    }
  }

  async publish(id: string, adminUser?: any, ipAddress?: string, userAgent?: string): Promise<any> {
    // Verify article exists
    const existingArticle = await this.getById(id);

    const updateData: any = {
      status: 'published',
      published_at: new Date().toISOString(),
    };

    const { error } = await this.supabase
      .from('articles')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to publish article: ${error.message}`);
    }

    const updatedArticle = await this.getById(id);

    // Log admin action if admin user provided
    if (adminUser) {
      const adminName = adminUser.name || 'Admin';
      const articleTitle = updatedArticle.title;

      await this.activityLogger.logAdminAction(
        adminUser.id,
        'update',
        'article',
        id,
        {
          articleTitle,
          description: `${adminName} published article "${articleTitle}"`,
        },
        { status: 'published', published_at: updateData.published_at },
        adminName,
        adminUser.email,
        articleTitle,
        ipAddress,
        userAgent,
        { status: existingArticle.status, published_at: existingArticle.publishedAt },
      );
    }

    return updatedArticle;
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Generate unique slug by checking database and appending number if needed
   */
  private async generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const baseSlug = this.generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      // Check if slug exists
      let query = this.supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .is('deleted_at', null);

      // Exclude current article when updating
      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw new Error(`Failed to check slug uniqueness: ${error.message}`);
      }

      // If no conflict, slug is unique
      if (!data) {
        return slug;
      }

      // Add counter to slug and try again
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Calculate reading time in minutes based on word count
   * Average reading speed: 200 words per minute
   */
  private calculateReadingTime(content: string): number {
    if (!content) return 1;

    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const minutes = Math.ceil(words.length / 200);
    return Math.max(1, minutes); // Minimum 1 minute
  }
}
