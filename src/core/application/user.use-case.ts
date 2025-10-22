import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';

@Injectable()
export class UserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepositoryPort,
    @Inject('TripPlanRepository')
    private readonly tripPlanRepository: TripPlanRepositoryPort,
  ) {}

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserProfile(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get trip statistics
    const { totalItems: tripCount } =
      await this.tripPlanRepository.findAllByUser({
        userId: id,
        page: 1,
        pageSize: 1,
      });

    // Calculate profile completion (simple logic)
    const profileCompletion = this.calculateProfileCompletion(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: null, // User entity doesn't have avatar field yet
      role: 'user', // Default role, can be extended later
      joinDate: user.createdAt.toISOString(),
      profileCompletion,
      stats: {
        tripPlans: tripCount,
        visitedDestinations: 0, // To be implemented with destination tracking
        reviewsWritten: 0, // To be implemented with review system
        points: 0, // To be implemented with gamification
        badges: 0, // To be implemented with achievement system
      },
    };
  }

  private calculateProfileCompletion(user: User): number {
    let completion = 0;

    // Basic fields (60% total)
    if (user.name) completion += 30;
    if (user.email) completion += 30;

    // Additional fields would add more percentage:
    // if (user.avatar) completion += 20;
    // if (user.bio) completion += 10;
    // if (user.phone) completion += 10;
    // etc.

    return Math.min(completion, 100);
  }
}
