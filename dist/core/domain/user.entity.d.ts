export declare class User {
    readonly id: string;
    name: string;
    email: string;
    readonly createdAt: Date;
    constructor(id: string, name: string, email: string, createdAt?: Date);
}
