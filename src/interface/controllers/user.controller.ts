import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { UserUseCase } from '../../core/application/user.use-case';
import { ListUserTripsUseCase } from '../../core/application/list-user-trips.use-case';
import { ListUserReviewsUseCase } from '../../core/application/list-user-reviews.use-case';
import { JwtAccessGuard } from '../../common/guards/jwt-access.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { MyTripsQueryDto } from '../dtos/trip/my-trips-query.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userUseCase: UserUseCase,
    private readonly listUserTripsUc: ListUserTripsUseCase,
    private readonly listUserReviewsUc: ListUserReviewsUseCase,
  ) {}

  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data profil')
  async getMyProfile(@Req() req: any) {
    const userId = req.user?.id;
    return this.userUseCase.getUserProfile(userId);
  }

  @Get('me/trips')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data daftar perjalanan')
  async getMyTrips(@Req() req: any, @Query() query: MyTripsQueryDto) {
    const userId = req.user?.id;
    const page = query.page ?? 1;
    const limit = query.per_page ?? 10;
    return this.listUserTripsUc.execute(userId, page, limit);
  }

  @Get('me/reviews')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mendapatkan data daftar review')
  async getMyReviews(@Req() req: any, @Query('limit') limit?: number) {
    const userId = req.user?.id;
    const reviewLimit = limit ?? 10;
    return this.listUserReviewsUc.execute(userId, 1, reviewLimit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userUseCase.getUserById(id);
  }
}
