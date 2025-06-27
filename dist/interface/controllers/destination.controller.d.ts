import { FastifyRequest } from 'fastify';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import { GetDestinationsQueryDto, GetDestinationsResponseDto } from '../dtos/destination/get-destinations.dto';
export declare class DestinationController {
    private readonly destinationUseCase;
    private readonly storagePath;
    constructor(destinationUseCase: DestinationUseCase, storagePath: string);
    createDestination(req: FastifyRequest): Promise<import("../../core/domain/destination.entity").Destination>;
    getDestinations(query: GetDestinationsQueryDto, req: any): Promise<GetDestinationsResponseDto>;
}
