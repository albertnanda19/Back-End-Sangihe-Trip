import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { ActivityLoggerService } from './activity-logger.service';

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
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  async execute(userId: string, data: UpdateProfileData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Store old profile data for logging
    const oldProfile = {
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
    };

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

    // Log profile update activity
    const newProfile = {
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };

    await this.activityLogger.logProfileUpdate(userId, oldProfile, newProfile);

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
