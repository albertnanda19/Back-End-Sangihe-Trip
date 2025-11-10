export interface TripBudget {
    transport?: number;
    lodging?: number;
    food?: number;
    activities?: number;
    [key: string]: number | undefined;
}
export interface TripItem {
    destinationId: string;
    startTime: string;
    endTime: string;
    activity: string;
    activityName?: string;
    notes?: string;
}
export interface TripDay {
    day: number;
    items: TripItem[];
}
export declare class TripPlan {
    readonly userId: string;
    readonly name: string;
    readonly startDate: Date;
    readonly endDate: Date;
    readonly peopleCount: number;
    readonly tripType: string;
    readonly isPublic: boolean;
    readonly destinations: string[];
    readonly schedule: TripDay[];
    readonly budget: TripBudget;
    readonly notes: string | null;
    readonly packingList: string[];
    readonly id: string;
    readonly createdAt: Date;
    constructor(userId: string, name: string, startDate: Date, endDate: Date, peopleCount: number, tripType: string, isPublic: boolean, destinations: string[], schedule: TripDay[], budget: TripBudget, notes?: string | null, packingList?: string[], id?: string, createdAt?: Date);
}
