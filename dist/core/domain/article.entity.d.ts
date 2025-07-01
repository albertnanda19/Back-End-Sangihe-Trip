export declare class Article {
    readonly title: string;
    readonly category: string | number;
    readonly authorId: string | number;
    readonly readingTime: number;
    readonly content: string;
    readonly tags: string[];
    readonly featuredImageUrl: string;
    slug?: string | undefined;
    readonly id: string;
    readonly createdAt: Date;
    updatedAt: Date;
    readonly publishDate: Date;
    status: 'draft';
    constructor(title: string, category: string | number, authorId: string | number, readingTime: number, content: string, tags: string[] | undefined, featuredImageUrl: string, slug?: string | undefined, id?: string, createdAt?: Date);
    private generateSlug;
}
