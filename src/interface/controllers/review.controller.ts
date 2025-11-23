import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubmitReviewUseCase } from 'src/core/application/submit-review.use-case';
import { GetDestinationReviewsUseCase } from 'src/core/application/get-destination-reviews.use-case';
import { LikeReviewUseCase } from 'src/core/application/like-review.use-case';
import { CreateReviewDto } from '../dtos/review/create-review.dto';
import { GetReviewsDto } from '../dtos/review/get-reviews.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { ResponseMessage } from 'src/common/decorators/response.decorator';

@Controller('reviews')
export class ReviewController {
  constructor(
    private readonly submitReviewUseCase: SubmitReviewUseCase,
    private readonly getDestinationReviewsUseCase: GetDestinationReviewsUseCase,
    private readonly likeReviewUseCase: LikeReviewUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil mengirim review')
  async submitReview(
    @Body() createReviewDto: CreateReviewDto,
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return await this.submitReviewUseCase.execute(userId, createReviewDto);
  }

  @Get('destination/:destinationId')
  @ResponseMessage('Berhasil mengambil daftar review')
  async getDestinationReviews(
    @Param('destinationId') destinationId: string,
    @Query() query: GetReviewsDto,
    @Request() req: any,
  ) {
    const userId = req.user?.id as string | undefined;
    return await this.getDestinationReviewsUseCase.execute(
      destinationId,
      {
        page: query.page,
        pageSize: query.limit,
        sortBy: query.sortBy,
      },
      userId,
    );
  }

  @Post(':reviewId/like')
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil toggle like review')
  async likeReview(
    @Param('reviewId') reviewId: string,
    @Request() req: any,
  ) {
    const userId = req.user.id as string;
    return await this.likeReviewUseCase.execute(reviewId, userId);
  }
}
