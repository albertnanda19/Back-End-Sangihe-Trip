export declare class Review {
    readonly id: string;
    readonly userId: string;
    readonly destinationId: string;
    rating: number;
    comment: string;
    images: string[];
    helpful: number;
    readonly createdAt: Date;
    updatedAt: Date;
    status: string;
    constructor(id: string, userId: string, destinationId: string, rating: number, comment: string, images?: string[], helpful?: number, createdAt?: Date, updatedAt?: Date, status?: string);
}
