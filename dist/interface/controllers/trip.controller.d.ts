import { CreateTripUseCase } from '../../core/application/create-trip.use-case';
import { GetTripUseCase } from '../../core/application/get-trip.use-case';
import { CreateTripDto } from '../dtos/trip/create-trip.dto';
export declare class TripController {
    private readonly createTripUc;
    private readonly getTripUc;
    constructor(createTripUc: CreateTripUseCase, getTripUc: GetTripUseCase);
    create(dto: CreateTripDto, req: any): Promise<null>;
    getTripDetail(id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        slug: string;
        startDate: string;
        endDate: string;
        peopleCount: number;
        tripType: string;
        isPublic: boolean;
        destinations: {
            id: string;
            name: string;
        }[];
        schedule: {
            day: number;
            items: {
                destinationName: string;
                destinationId: string;
                startTime: string;
                endTime: string;
                activity: string;
                notes?: string;
            }[];
        }[];
        budget: import("../../core/domain/trip-plan.entity").TripBudget;
        totalBudget: number;
        notes: string;
        packingList: string[];
        coverImage: string | null;
        createdAt: string;
        updatedAt: string;
        owner: {
            id: string;
            name: string;
            firstName: string | undefined;
            lastName: string | undefined;
            avatar: string | undefined;
        } | null;
    }>;
}
