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
export interface Activity {
    name: string;
    startTime: string;
    endTime: string;
}
export declare class Destination {
    readonly id: string;
    name: string;
    slug: string;
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
    rating: number;
    totalReviews: number;
    viewCount: number;
    activities: Activity[];
    phone: string;
    email: string;
    website: string;
    isFeatured: boolean;
    constructor(id: string, name: string, slug: string, category: string, location: Location, distanceKm: number, price: number, openHours: string, description: string, facilities: Facility[], tips: string[], images: string[], video?: string | undefined, createdAt?: Date, rating?: number, totalReviews?: number, viewCount?: number, activities?: Activity[], phone?: string, email?: string, website?: string, isFeatured?: boolean);
}
