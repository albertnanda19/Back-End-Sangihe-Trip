import { AdminTripUseCase } from '../../core/application/admin-trip.use-case';
import { AdminTripQueryDto } from '../dtos/admin/admin-trip-query.dto';
export declare class AdminTripController {
    private readonly tripUseCase;
    constructor(tripUseCase: AdminTripUseCase);
    list(query: AdminTripQueryDto): Promise<import("../../core/application/admin-trip.use-case").AdminTripListResult>;
    getById(id: string): Promise<any>;
}
