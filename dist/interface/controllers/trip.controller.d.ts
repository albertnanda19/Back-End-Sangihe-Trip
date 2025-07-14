import { CreateTripUseCase } from '../../core/application/create-trip.use-case';
import { CreateTripDto } from '../dtos/trip/create-trip.dto';
export declare class TripController {
    private readonly createTripUc;
    constructor(createTripUc: CreateTripUseCase);
    create(dto: CreateTripDto, req: any): Promise<null>;
}
