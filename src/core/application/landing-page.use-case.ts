import { Injectable, Inject } from '@nestjs/common';
import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { ArticleRepositoryPort } from '../domain/article.repository.port';

@Injectable()
export class LandingPageUseCase {
  constructor(
    @Inject('DestinationRepository')
    private readonly destinationRepo: DestinationRepositoryPort,
    @Inject('ArticleRepository')
    private readonly articleRepo: ArticleRepositoryPort,
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: any,
  ) {}

  async execute(category?: string) {
    // Static hero section – could be moved to DB / CMS later
    const hero = {
      title: 'Rencanakan Perjalananmu ke',
      highlight: 'Surga Tropis Sangihe',
      subtitle:
        'Temukan destinasi tersembunyi, budaya lokal, dan kuliner khas di kepulauan yang memukau',
      backgroundImage: '/images/pantai-sangihe.jpg',
      ctas: [
        { label: 'Mulai Rencana', type: 'primary', href: '/rencana' },
        { label: 'Lihat Destinasi', type: 'outline', href: '/destinasi' },
      ],
    };

    // For now we hard-code the filter list; later we can generate from categories table
    const filters = ['Semua', 'Pantai', 'Budaya', 'Kuliner', 'Alam'];

    // Map UI category (Indonesian) to DB enum values
    const categoryMap: Record<string, string> = {
      Pantai: 'beach',
      Budaya: 'cultural',
      Kuliner: 'culinary',
      Alam: 'nature',
    };

    const dbCategory =
      category && category !== 'Semua' ? categoryMap[category] : undefined;

    // Fetch data in parallel to keep total latency low (<1s) – DRY & SRP
    const [destRes, artRes] = await Promise.all([
      this.destinationRepo.findAll({
        page: 1,
        pageSize: 6,
        sortBy: 'rating',
        category: dbCategory,
      }),
      this.articleRepo.findAll({ page: 1, perPage: 3, sort: 'latest' }),
    ]);

    const toRupiah = (value?: number): string =>
      typeof value === 'number'
        ? `Rp ${value.toLocaleString('id-ID')}`
        : 'Rp -';

    const destinationIds = destRes.data.map((d) => d.id);
    const { data: allImages } = await this.supabase
      .from('destination_images')
      .select('*')
      .in('destination_id', destinationIds)
      .order('sort_order', { ascending: true });

    // Group images by destination_id
    const imagesByDestination = (allImages || []).reduce(
      (acc: any, img: any) => {
        if (!acc[img.destination_id]) {
          acc[img.destination_id] = [];
        }
        acc[img.destination_id].push(img);
        return acc;
      },
      {},
    );

    const destinations = destRes.data.map((d) => {
      const images = imagesByDestination[d.id] || [];
      return {
        id: d.id,
        name: d.name,
        location: d.location.address,
        rating: d.rating ?? 0,
        price: toRupiah(d.price),
        images: images.map((img: any) => ({
          id: img.id,
          image_url: img.image_url,
          alt_text: img.alt_text,
          sort_order: img.sort_order,
          is_featured: img.is_featured,
        })),
      };
    });

    const articles = artRes.data.map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt ?? '',
      date: a.publishDate.toISOString().split('T')[0],
      image: a.featuredImageUrl,
    }));

    return {
      hero,
      filters,
      destinations,
      articles,
    };
  }
}
