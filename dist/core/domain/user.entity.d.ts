export declare class User {
    readonly id: string;
    name: string;
    email: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    avatarUrl?: string | undefined;
    readonly createdAt: Date;
    constructor(id: string, name: string, email: string, firstName?: string | undefined, lastName?: string | undefined, avatarUrl?: string | undefined, createdAt?: Date);
}
