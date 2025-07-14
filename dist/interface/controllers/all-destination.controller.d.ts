import { ListAllDestinationsUseCase } from '../../core/application/list-all-destinations.use-case';
export declare class AllDestinationController {
    private readonly listAllDestinationsUseCase;
    constructor(listAllDestinationsUseCase: ListAllDestinationsUseCase);
    getAllDestinations(): Promise<{
        id: string;
        name: string;
        category: string;
        rating: number;
        totalReviews: number;
        location: string;
        price: number;
        image: string;
        images: string[];
        facilities: any[];
        description: string;
    }[]>;
}
