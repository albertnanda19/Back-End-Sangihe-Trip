import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../domain/user.repository.port';

interface UpdateProfileData {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  avatar?: string;
  avatar_url?: string;
}

@Injectable()
export class UpdateUserProfileUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(userId: string, data: UpdateProfileData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: {
      firstName?: string;
      lastName?: string;
      avatarUrl?: string;
    } = {};

    if (data.firstName || data.first_name) {
      updateData.firstName = data.firstName || data.first_name;
    }

    if (data.lastName || data.last_name) {
      updateData.lastName = data.lastName || data.last_name;
    }

    if (data.avatar || data.avatar_url) {
      updateData.avatarUrl = data.avatar || data.avatar_url;
    }

    const updatedUser = await this.userRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundException('Failed to update user');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      first_name: updatedUser.firstName,
      lastName: updatedUser.lastName,
      last_name: updatedUser.lastName,
      avatar: updatedUser.avatarUrl,
      avatar_url: updatedUser.avatarUrl,
    };
  }
}
