import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  Patch,
  Body,
  Delete,
} from '@nestjs/common';
import { UserUseCase } from '../../core/application/user.use-case';
import { ListUserTripsUseCase } from '../../core/application/list-user-trips.use-case';
import { ListUserReviewsUseCase } from '../../core/application/list-user-reviews.use-case';
import { UpdateUserProfileUseCase } from '../../core/application/update-user-profile.use-case';
import { UpdatePasswordUseCase } from '../../core/application/update-password.use-case';
import { DeleteTripUseCase } from '../../core/application/delete-trip.use-case';
import { UpdateTripUseCase } from '../../core/application/update-trip.use-case';
import { JwtAccessGuard } from '../../common/guards/jwt-access.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { MyTripsQueryDto } from '../dtos/trip/my-trips-query.dto';
import { UpdateProfileDto } from '../dtos/user/update-profile.dto';
import { UpdatePasswordDto } from '../dtos/user/update-password.dto';
import { UpdateTripDto } from '../dtos/trip/update-trip.dto';
import { MyReviewsQueryDto } from '../dtos/user/my-reviews-query.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    type: string;
    role?: string;
  };
}

@Controller('users')
export class UserController {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly listUserTripsUc: ListUserTripsUseCase,
    private readonly listUserReviewsUc: ListUserReviewsUseCase,
    private readonly updateUserProfileUc: UpdateUserProfileUseCase,
    private readonly updatePasswordUc: UpdatePasswordUseCase,
    private readonly deleteTripUc: DeleteTripUseCase,
    private readonly updateTripUc: UpdateTripUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data profil')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    const userId = req.user?.id as string;
    return this.userUseCase.getUserProfile(userId);
  }

  @Patch('me')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil memperbarui profil')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    const userId = req.user?.id as string;
    return this.updateUserProfileUc.execute(userId, dto);
  }

  @Patch('me/password')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil memperbarui password')
  async updateMyPassword(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ) {
    const userId = req.user?.id as string;
    await this.updatePasswordUc.execute(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
    return null;
  }

  @Get('me/trips')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data daftar perjalanan')
  async getMyTrips(
    @Req() req: AuthenticatedRequest,
    @Query() query: MyTripsQueryDto,
  ) {
    const userId = req.user?.id as string;
    const page = query.page ?? 1;
    const limit = query.per_page ?? 10;
    return this.listUserTripsUc.execute(userId, page, limit);
  }

  @Delete('me/trips/:id')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil menghapus rencana perjalanan')
  async deleteMyTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') tripId: string,
  ) {
    const userId = req.user?.id as string;
    await this.deleteTripUc.execute(tripId, userId);
    return null;
  }

  @Patch('me/trips/:id')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil memperbarui rencana perjalanan')
  async updateMyTrip(
    @Req() req: AuthenticatedRequest,
    @Param('id') tripId: string,
    @Body() dto: UpdateTripDto,
  ) {
    const userId = req.user?.id as string;
    await this.updateTripUc.execute({
      tripId,
      userId,
      ...dto,
    });
    return null;
  }

  @Get('me/reviews')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data daftar review')
  async getMyReviews(
    @Req() req: AuthenticatedRequest,
    @Query() query: MyReviewsQueryDto,
  ) {
    const userId = req.user?.id as string;
    const page = query.page ?? 1;
    const limit = query.per_page ?? 10;
    const sortBy = query.sortBy ?? 'date';
    const order = query.order ?? 'desc';
    const rating = query.rating;

    return this.listUserReviewsUc.execute(
      userId,
      page,
      limit,
      sortBy,
      order,
      rating,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userUseCase.getUserById(id);
  }
}
