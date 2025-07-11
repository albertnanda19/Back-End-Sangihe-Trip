import { User } from './user.entity';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  // other needed methods
}
