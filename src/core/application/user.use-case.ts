import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepositoryPort } from '../domain/user.repository.port';
import { TripPlanRepositoryPort } from '../domain/trip-plan.repository.port';
import { ReviewRepositoryPort } from '../domain/review.repository.port';

@Injectable()
export class UserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepositoryPort,
    @Inject('TripPlanRepository')
    private readonly tripPlanRepository: TripPlanRepositoryPort,
    @Inject('ReviewRepository')
    private readonly reviewRepository: ReviewRepositoryPort,
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

    const { totalItems: tripCount } =
      await this.tripPlanRepository.findAllByUser({
        userId: id,
        page: 1,
        pageSize: 1,
      });

    const { totalItems: reviewCount } = await this.reviewRepository.findAllByUser({
      userId: id,
      page: 1,
      pageSize: 1,
    });

    const profileCompletion = this.calculateProfileCompletion(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      firstName: user.firstName,
      first_name: user.firstName,
      lastName: user.lastName,
      last_name: user.lastName,
      avatar: user.avatarUrl,
      avatar_url: user.avatarUrl,
      role: 'user',
      joinDate: user.createdAt.toISOString(),
      created_at: user.createdAt.toISOString(),
      profileCompletion,
      stats: {
        tripPlans: tripCount,
        visitedDestinations: 0,
        reviewsWritten: reviewCount,
      },
    };
  }

  private calculateProfileCompletion(user: User): number {
    let completion = 0;

    if (user.email) completion += 20;
    if (user.firstName && user.lastName) completion += 20;

    if (user.avatarUrl) completion += 30;
    if (user.name) completion += 30;

    return Math.min(completion, 100);
  }
}
