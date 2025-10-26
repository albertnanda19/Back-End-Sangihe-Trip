declare class UpdateTripItemDto {
    destinationId: string;
    startTime: string;
    endTime: string;
    activity: string;
    notes?: string;
}
declare class UpdateTripDayDto {
    day: number;
    items: UpdateTripItemDto[];
}
export declare class UpdateTripDto {
    name?: string;
    startDate?: string;
    endDate?: string;
    peopleCount?: number;
    tripType?: string;
    isPublic?: boolean;
    destinations?: string[];
    schedule?: UpdateTripDayDto[];
    budget?: Record<string, number>;
    notes?: string;
    packingList?: string[];
}
export {};
