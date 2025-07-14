declare class TripItemDto {
    destinationId: number;
    startTime: string;
    endTime: string;
    activity: string;
    notes?: string;
}
declare class TripDayDto {
    day: number;
    items: TripItemDto[];
}
declare class BudgetDto {
    transport?: number;
    lodging?: number;
    food?: number;
    activities?: number;
}
export declare class CreateTripDto {
    name: string;
    startDate: string;
    endDate: string;
    peopleCount: number;
    tripType: string;
    isPublic: boolean;
    destinations: number[];
    schedule: TripDayDto[];
    budget: BudgetDto;
    notes?: string;
    packingList?: string[];
}
export {};
