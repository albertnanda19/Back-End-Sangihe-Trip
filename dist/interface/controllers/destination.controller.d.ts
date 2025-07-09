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
    deleteDestination(id: string): Promise<{
        name: string;
    }>;
}
