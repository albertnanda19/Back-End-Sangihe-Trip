import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Article } from '../../core/domain/article.entity';
import { ArticleRepositoryPort, ArticleQuery } from '../../core/domain/article.repository.port';

@Injectable()
export class ArticleRepositoryAdapter implements ArticleRepositoryPort {
  constructor(
    @Inject('SUPABASE_CLIENT') private readonly client: SupabaseClient,
  ) {}

  private toRow(article: Article) {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      category_id: typeof article.category === 'string' ? parseInt(article.category, 10) : article.category,
      author_id: article.authorId,
      
      
      content: article.content,
      featured_image_url: article.featuredImageUrl,
      
      status: article.status,
      created_at: article.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  async save(article: Article): Promise<Article> {
    const { error } = await this.client
      .from('articles')
      .insert(this.toRow(article));

    if (error) {
      throw new Error(error.message);
    }

    return article;
  }

  async findAll(query: ArticleQuery): Promise<{ data: Article[]; totalItems: number; featured?: Article | null; sidebar?: any }> {
    const {
      page = 1,
      perPage = 10,
      search,
      category,
      tag,
      sort = 'latest',
      includeFeatured = true,
      includeSidebar = true,
    } = query;

    let supa = this.client
      .from('articles')
      .select(
        `id, slug, title, excerpt, category_id, author_id, publish_date, reading_time, featured_image_url`,
        { count: 'exact' },
      )
      ;

    if (search) {
      supa = supa.textSearch('title', search, {
        type: 'websearch',
      });
    }
    if (category) {
      supa = supa.eq('category_id', category);
    }
    if (tag) {
      supa = supa.contains('tags', [tag]);
    }

    // sort
    switch (sort) {
      case 'oldest':
        supa = supa.order('publish_date', { ascending: true });
        break;
      case 'popular':
        // Fallback to publish_date if views column is not available
        supa = supa.order('publish_date', { ascending: false });
        break;
      case 'latest':
      default:
        supa = supa.order('publish_date', { ascending: false });
    }

    const limit = Math.min(Math.max(perPage, 1), 100);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    supa = supa.range(from, to);

    const { data, count, error } = await supa;
    if (error) throw new Error(error.message);

    // Build lookup maps for categories & authors
    const categoryIds = Array.from(new Set((data || []).map((r:any)=>r.category_id).filter(Boolean)));
    const authorIds = Array.from(new Set((data || []).map((r:any)=>r.author_id).filter(Boolean)));

    const [catMap, authorMap] = await Promise.all([
      categoryIds.length
        ? this.client
            .from('categories')
            .select('id,name')
            .in('id', categoryIds)
            .then((res) => {
              const map: Record<string, string> = {};
              (res.data || []).forEach((c: any) => (map[c.id] = c.name));
              return map;
            })
        : Promise.resolve({}),
      authorIds.length
        ? this.client
            .from('users')
            .select('id,name,avatar_url')
            .in('id', authorIds)
            .then((res) => {
              const map: Record<string, { name: string; avatar: string }> = {};
              (res.data || []).forEach((u: any) => (map[u.id] = { name: u.name, avatar: u.avatar_url }));
              return map;
            })
        : Promise.resolve({}),
    ]);

    const articles = (data || []).map((row: any) => {
      const art = new Article(
        row.title,
        catMap[row.category_id] ?? row.category_id,
        row.author_id,
        row.reading_time,
        '',
        [],
        row.featured_image_url,
        row.slug,
        row.id,
        row.publish_date ? new Date(row.publish_date) : undefined,
      );
      // Attach additional metadata used by the interface layer
      (art as any).excerpt = row.excerpt;
      (art as any).author = authorMap[row.author_id] ?? null;
      return art;
    });

    // featured and sidebar (parallel queries)
    let featured: Article | null = null;
    let sidebar: any = undefined;

    if (includeFeatured || includeSidebar) {
      const promises: Promise<any>[] = [];
      if (includeFeatured) {
        promises.push(
          this.client
            .from('articles')
            .select('id, slug, title, excerpt, category_id, author_id, publish_date, reading_time, featured_image_url')
            .order('publish_date', { ascending: false })
            .limit(1)
            .single() as unknown as Promise<any>,
        );
      }

      if (includeSidebar) {
        promises.push(
          Promise.all([
            this.client
              .from('articles')
              .select('id, title, publish_date, featured_image_url')
              .order('publish_date', { ascending: false })
              .limit(5) as unknown as Promise<any>,
            this.client
              .from('articles')
              .select('title')
              .order('publish_date', { ascending: false })
              .limit(5) as unknown as Promise<any>,
            this.client.from('categories').select('name') as unknown as Promise<any>,
            this.client.from('tags').select('name').limit(20) as unknown as Promise<any>,
          ]) as unknown as Promise<any>,
        );
      }

      const results = await Promise.all(promises);
      let idx = 0;
      if (includeFeatured) {
        const { data: feat } = results[idx++];
        if (feat) {
          featured = new Article(
            feat.title,
            catMap[feat.category_id] ?? feat.category_id,
            feat.author_id ?? '',
            feat.reading_time,
            '',
            [],
            feat.featured_image_url,
            feat.slug,
            feat.id,
            feat.publish_date ? new Date(feat.publish_date) : undefined,
          );
          // Attach metadata
          (featured as any).excerpt = feat.excerpt;
          (featured as any).author = authorMap[feat.author_id] ?? null;
        }
      }
      if (includeSidebar) {
        const [recentRes, popularRes, catRes, tagRes] = results[idx] as any[];
        sidebar = {
          recent: recentRes.data ?? [],
          popular: popularRes.data ?? [],
          categories: (catRes.data ?? []).map((c: any) => c.name),
          tags: (tagRes.data ?? []).map((t: any) => t.name),
        };
      }
    }

    return {
      data: articles,
      totalItems: count || 0,
      featured,
      sidebar,
    };
  }
}
