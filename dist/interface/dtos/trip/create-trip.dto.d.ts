declare class TripItemDto {
    destinationId: string;
    startTime: string;
    endTime: string;
    activity: string;
    activityName?: string;
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
    destinations: string[];
    schedule: TripDayDto[];
    budget: BudgetDto;
    notes?: string;
    packingList?: string[];
}
export {};
