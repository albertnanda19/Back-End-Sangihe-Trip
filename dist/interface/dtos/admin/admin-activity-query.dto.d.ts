export declare class AdminActivityQueryDto {
    page?: number;
    limit?: number;
    action?: string;
    entityType?: string;
    userId?: string;
    userType?: 'admin' | 'user' | 'all';
}
