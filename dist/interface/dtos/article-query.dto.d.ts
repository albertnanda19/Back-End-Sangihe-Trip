export declare class ArticleQueryDto {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    tag?: string;
    sort?: 'latest' | 'oldest' | 'popular';
    include_featured?: boolean;
    include_sidebar?: boolean;
}
