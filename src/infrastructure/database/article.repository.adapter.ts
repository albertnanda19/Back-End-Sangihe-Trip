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

  // New method: get detailed article information including author, TOC, related articles, and comments.
  async findByIdWithDetails(idOrSlug: string): Promise<any> {
    // Sanitize input to prevent issues with whitespace
    const cleanInput = idOrSlug.trim();
    
    // Check if input looks like a UUID (36 chars with dashes in right positions)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
    
    // Fetch the main article row (allows lookup by id or slug)
    let query = this.client.from('articles').select('*');
    
    if (isUUID) {
      query = query.eq('id', cleanInput);
    } else {
      query = query.eq('slug', cleanInput);
    }
    
    const { data: articleRow, error: articleErr } = await query.single();

    if (articleErr) {
      // If it's a PGRST116 error, it means no rows returned (not found)
      if (articleErr.code === 'PGRST116') {
        return null;
      }
      throw new Error(articleErr.message);
    }
    if (!articleRow) return null;

    // Parallel fetches for related data to keep latency low (<1s)
    const [authorRes, categoryRes, relatedRes, commentsRes, statsRes] = await Promise.all([
      this.client
        .from('users')
        .select('id,first_name,last_name,avatar_url,bio')
        .eq('id', articleRow.author_id)
        .maybeSingle(),
      // Category is an enum, not a foreign key in this schema
      Promise.resolve({ data: null }),
      this.client
        .from('articles')
        .select('id,slug,title,category,read_time_minutes,featured_image')
        .eq('category', articleRow.category)
        .neq('id', articleRow.id)
        .order('published_at', { ascending: false })
        .limit(3),
      // comments table might not exist; wrap in rescue
      (async () => {
        try {
          return await this.client
            .from('article_comments')
            .select('id,user_id,content,created_at,likes,parent_id')
            .eq('article_id', articleRow.id)
            .order('created_at', { ascending: false })
            .limit(100);
        } catch {
          return { data: [] } as any;
        }
      })(),
      // Total articles by author
      this.client
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', articleRow.author_id),
    ]);

    const authorRow = authorRes.data as any;
    const categoryName = articleRow.category ?? 'Uncategorized';
    const totalAuthorArticles = statsRes.count ?? 0;

    // Helper to parse table of contents from markdown (## or ### headings)
    const generateTOC = (markdown: string) => {
      const lines = markdown.split(/\n/);
      const toc: { id: string; title: string }[] = [];
      for (const line of lines) {
        const match = /^(#{2,3})\s+(.*)/.exec(line.trim());
        if (match) {
          const title = match[2].trim();
          const id = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-');
          toc.push({ id, title });
        }
      }
      return toc;
    };

    const toc = generateTOC(articleRow.content || '');
    const wordCount = (articleRow.content || '').split(/\s+/).filter(Boolean).length;

    const article = {
      id: articleRow.id,
      slug: articleRow.slug,
      title: articleRow.title,
      category: categoryName,
      author: {
        id: authorRow?.id ?? '',
        name: authorRow ? `${authorRow.first_name || ''} ${authorRow.last_name || ''}`.trim() : 'Unknown Author',
        avatar: authorRow?.avatar_url ?? '/placeholder.svg?height=64&width=64',
        bio: authorRow?.bio ?? '',
        fullBio: authorRow?.bio ?? '',
        followers: 0, // Not available in current schema
        totalArticles: totalAuthorArticles,
      },
      publishDate: articleRow.published_at,
      readingTime: articleRow.read_time_minutes,
      featuredImage: articleRow.featured_image || '',
      tags: articleRow.tags ?? [],
      content: articleRow.content,
      wordCount,
    };

    const related = (relatedRes.data || []).map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: categoryName,
      image: r.featured_image || '',
      readingTime: r.read_time_minutes,
    }));

    // Build nested comments with replies (simple two-level grouping)
    const flatComments = commentsRes.data || [];
    const commentMap: Record<string, any> = {};
    const rootComments: any[] = [];
    flatComments.forEach((c: any) => {
      const comment = {
        id: c.id,
        user: {
          id: c.user_id,
          // user caching could be implemented; placeholder for now
          name: `User ${c.user_id}`,
          avatar: '/placeholder.svg?height=32&width=32',
        },
        createdAt: c.created_at,
        content: c.content,
        likes: c.likes ?? 0,
        replies: [],
      };
      commentMap[c.id] = comment;
      if (c.parent_id) {
        commentMap[c.parent_id]?.replies.push(comment);
      } else {
        rootComments.push(comment);
      }
    });

    return {
      article,
      tableOfContents: toc,
      relatedArticles: related,
      comments: rootComments,
    };
  }
}
