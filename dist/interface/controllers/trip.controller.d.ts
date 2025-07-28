import { CreateTripUseCase } from '../../core/application/create-trip.use-case';
import { GetTripUseCase } from '../../core/application/get-trip.use-case';
import { CreateTripDto } from '../dtos/trip/create-trip.dto';
export declare class TripController {
    private readonly createTripUc;
    private readonly getTripUc;
    constructor(createTripUc: CreateTripUseCase, getTripUc: GetTripUseCase);
    create(dto: CreateTripDto, req: any): Promise<null>;
    getTripDetail(id: string): Promise<import("../../core/domain/trip-plan.entity").TripPlan>;
}
