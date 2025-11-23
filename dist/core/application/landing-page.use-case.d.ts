import { DestinationRepositoryPort } from '../domain/destination.repository.port';
import { ArticleRepositoryPort } from '../domain/article.repository.port';
export declare class LandingPageUseCase {
    private readonly destinationRepo;
    private readonly articleRepo;
    private readonly supabase;
    constructor(destinationRepo: DestinationRepositoryPort, articleRepo: ArticleRepositoryPort, supabase: any);
    execute(category?: string): Promise<{
        hero: {
            title: string;
            highlight: string;
            subtitle: string;
            backgroundImage: string;
            ctas: {
                label: string;
                type: string;
                href: string;
            }[];
        };
        filters: string[];
        destinations: {
            id: string;
            name: string;
            location: string;
            rating: number;
            price: string;
            images: any;
        }[];
        articles: {
            id: any;
            slug: any;
            title: any;
            excerpt: any;
            date: any;
            image: any;
        }[];
    }>;
}
