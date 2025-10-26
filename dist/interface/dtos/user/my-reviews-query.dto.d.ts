export declare class MyReviewsQueryDto {
    page?: number;
    per_page?: number;
    sortBy?: 'date' | 'rating';
    order?: 'asc' | 'desc';
    rating?: '1' | '2' | '3' | '4' | '5' | 'all';
}
