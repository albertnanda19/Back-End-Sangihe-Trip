declare class LocationDto {
    address: string;
    lat: number;
    lng: number;
}
declare class FacilityDto {
    name: string;
    icon: string;
    available: boolean;
}
export declare class CreateDestinationDto {
    name: string;
    category: string;
    location: LocationDto;
    distanceKm: number;
    price: number;
    openHours: string;
    description: string;
    facilities: FacilityDto[];
    tips: string[];
}
export {};
