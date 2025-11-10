import { AdminDestinationUseCase } from '../../core/application/admin-destination.use-case';
import { AdminDestinationQueryDto } from '../dtos/admin/admin-destination-query.dto';
import { CreateAdminDestinationDto, UpdateAdminDestinationDto } from '../dtos/admin/admin-destination.dto';
export declare class AdminDestinationController {
    private readonly destinationUseCase;
    constructor(destinationUseCase: AdminDestinationUseCase);
    list(query: AdminDestinationQueryDto): Promise<import("../../core/application/admin-destination.use-case").AdminDestinationListResult>;
    getById(id: string): Promise<any>;
    create(dto: CreateAdminDestinationDto, req: any): Promise<any>;
    update(id: string, dto: UpdateAdminDestinationDto, req: any): Promise<any>;
    delete(id: string, req: any): Promise<null>;
}
