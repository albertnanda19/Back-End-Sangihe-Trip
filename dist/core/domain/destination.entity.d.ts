export interface Location {
    address: string;
    lat: number;
    lng: number;
}
export interface Facility {
    name: string;
    icon: string;
    available: boolean;
}
export declare class Destination {
    readonly id: string;
    name: string;
    category: string;
    location: Location;
    distanceKm: number;
    price: number;
    openHours: string;
    description: string;
    facilities: Facility[];
    tips: string[];
    images: string[];
    video?: string | undefined;
    readonly createdAt: Date;
    constructor(id: string, name: string, category: string, location: Location, distanceKm: number, price: number, openHours: string, description: string, facilities: Facility[], tips: string[], images: string[], video?: string | undefined, createdAt?: Date);
}
