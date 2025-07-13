import { LandingPageUseCase } from '../../core/application/landing-page.use-case';
import { LandingPageQueryDto } from '../dtos/landing-page-query.dto';
export declare class LandingPageController {
    private readonly landingPageUseCase;
    constructor(landingPageUseCase: LandingPageUseCase);
    getLandingPage(query: LandingPageQueryDto): Promise<{
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
            image: string;
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
