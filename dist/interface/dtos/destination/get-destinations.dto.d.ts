export declare class GetDestinationsQueryDto {
    search?: string;
    category?: string;
    location?: string;
    minRating?: number;
    priceMin?: number;
    priceMax?: number;
    sortBy?: 'popular' | 'rating' | 'price-low' | 'newest';
    page?: number;
    pageSize?: number;
}
export declare class DestinationListItemDto {
    id: string;
    name: string;
    category: string;
    rating: number;
    totalReviews: number;
    location: string;
    price: number;
    image: string;
    facilities: string[];
    description: string;
}
export declare class GetDestinationsMetaDto {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}
export declare class GetDestinationsResponseDto {
    data: DestinationListItemDto[];
    meta: GetDestinationsMetaDto;
}
