import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

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
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      featuredImage: article.featured_image,
      status: article.status,
      viewCount: article.view_count,
      author: {
        firstName: article.users?.first_name,
        lastName: article.users?.last_name,
        email: article.users?.email,
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

  async create(data: any, adminId: string): Promise<any> {
    // Generate slug from title
    const slug = this.generateSlug(data.title);

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

    return this.getById(article.id);
  }

  async update(id: string, data: any): Promise<any> {
    // Verify article exists
    await this.getById(id);

    const updateData: any = {};
    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = this.generateSlug(data.title);
    }
    if (data.content !== undefined) updateData.content = data.content;
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

    return this.getById(id);
  }

  async delete(id: string, hard: boolean = false): Promise<void> {
    // Verify article exists
    await this.getById(id);

    if (hard) {
      // Hard delete
      const { error } = await this.supabase.from('articles').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
      }
    } else {
      // Soft delete
      const { error } = await this.supabase
        .from('articles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete article: ${error.message}`);
      }
    }
  }

  async publish(id: string): Promise<any> {
    // Verify article exists
    await this.getById(id);

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

    return this.getById(id);
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
