import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
export declare class UserUseCase {
    private readonly userRepository;
    constructor(userRepository: UserRepositoryPort);
    getUserById(id: string): Promise<User>;
}
