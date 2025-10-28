export declare class CreateAdminArticleDto {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    coverImage?: string;
    tags?: string[];
    status?: string;
}
export declare class UpdateAdminArticleDto {
    title?: string;
    content?: string;
    excerpt?: string;
    category?: string;
    coverImage?: string;
    tags?: string[];
    status?: string;
}
