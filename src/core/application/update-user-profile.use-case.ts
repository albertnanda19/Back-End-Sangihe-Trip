import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { ActivityLoggerService } from './activity-logger.service';

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
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

    if (data.firstName) {
      updateData.firstName = data.firstName;
    }

    if (data.lastName) {
      updateData.lastName = data.lastName;
    }

    if (data.avatarUrl) {
      updateData.avatarUrl = data.avatarUrl;
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
      lastName: updatedUser.lastName,
      avatarUrl: updatedUser.avatarUrl,
    };
  }
}
