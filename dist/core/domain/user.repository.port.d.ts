import { User } from './user.entity';
export interface UserRepositoryPort {
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
    update(id: string, data: {
        firstName?: string;
        lastName?: string;
        avatarUrl?: string;
    }): Promise<User | null>;
}
