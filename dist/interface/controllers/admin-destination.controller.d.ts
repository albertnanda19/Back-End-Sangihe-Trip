import { AdminDestinationUseCase } from '../../core/application/admin-destination.use-case';
import { AdminDestinationQueryDto } from '../dtos/admin/admin-destination-query.dto';
import { CreateAdminDestinationDto, UpdateAdminDestinationDto } from '../dtos/admin/admin-destination.dto';
interface AuthenticatedRequest {
    user?: {
        id: string;
        email: string;
        name: string;
    };
}
export declare class AdminDestinationController {
    private readonly destinationUseCase;
    constructor(destinationUseCase: AdminDestinationUseCase);
    list(query: AdminDestinationQueryDto): Promise<import("../../core/application/admin-destination.use-case").AdminDestinationListResult>;
    getById(id: string): Promise<any>;
    create(dto: CreateAdminDestinationDto, req: AuthenticatedRequest): Promise<any>;
    update(id: string, dto: UpdateAdminDestinationDto): Promise<any>;
    delete(id: string, hard?: string): Promise<null>;
}
export {};
