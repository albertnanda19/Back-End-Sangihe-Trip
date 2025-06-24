import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';

@Injectable()
export class UserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
