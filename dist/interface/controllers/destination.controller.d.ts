import { FastifyRequest } from 'fastify';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import { DeleteDestinationUseCase } from '../../core/application/delete-destination.use-case';
import { FirebaseStorage } from 'firebase/storage';
import { GetDestinationsQueryDto, GetDestinationsResponseDto } from '../dtos/destination/get-destinations.dto';
export declare class DestinationController {
    private readonly destinationUseCase;
    private readonly deleteDestinationUc;
    private readonly storage;
    constructor(destinationUseCase: DestinationUseCase, deleteDestinationUc: DeleteDestinationUseCase, storage: FirebaseStorage);
    createDestination(req: FastifyRequest): Promise<import("../../core/domain/destination.entity").Destination>;
    getDestinations(query: GetDestinationsQueryDto, req: any): Promise<GetDestinationsResponseDto>;
    getDestinationDetail(id: string): Promise<{
        id: string;
        name: string;
        category: string;
        location: {
            address: string;
            lat: number;
            lng: number;
        };
        price: number;
        openHours: string;
        description: string;
        facilities: import("../../core/domain/destination.entity").Facility[];
        tips: string[];
        images: string[];
        video: string | undefined;
        rating: number;
        totalReviews: number;
    }>;
    deleteDestination(id: string): Promise<{
        name: string;
    }>;
}
