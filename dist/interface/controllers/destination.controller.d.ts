import { FastifyRequest } from 'fastify';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import { FirebaseStorage } from 'firebase/storage';
import { GetDestinationsQueryDto, GetDestinationsResponseDto } from '../dtos/destination/get-destinations.dto';
export declare class DestinationController {
    private readonly destinationUseCase;
    private readonly storage;
    getDestinationDetail(id: string): Promise<import("../../core/domain/destination.entity").Destination>;
    constructor(destinationUseCase: DestinationUseCase, storage: FirebaseStorage);
    createDestination(req: FastifyRequest): Promise<import("../../core/domain/destination.entity").Destination>;
    getDestinations(query: GetDestinationsQueryDto, req: any): Promise<GetDestinationsResponseDto>;
}
