declare class LocationDto {
    lat: number;
    lng: number;
    city: string;
    province: string;
}
declare class ActivityDto {
    name: string;
    startTime: string;
    endTime: string;
}
declare class ImageDto {
    url: string;
    alt?: string;
    caption?: string;
    isFeatured?: boolean;
}
export declare class CreateAdminDestinationDto {
    name: string;
    slug?: string;
    description: string;
    location?: LocationDto;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
    entryFee?: number;
    categories?: string[];
    facilities?: string[];
    activities?: ActivityDto[];
    images?: ImageDto[];
    published?: boolean;
    isFeatured?: boolean;
    status?: string;
}
export declare class UpdateAdminDestinationDto {
    name?: string;
    slug?: string;
    description?: string;
    location?: LocationDto;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
    entryFee?: number;
    categories?: string[];
    facilities?: string[];
    activities?: ActivityDto[];
    images?: ImageDto[];
    published?: boolean;
    isFeatured?: boolean;
    status?: string;
}
export {};
