import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminReviewUseCase } from '../../core/application/admin-review.use-case';
import { AdminReviewQueryDto } from '../dtos/admin/admin-review-query.dto';
import {
  ApproveReviewDto,
  RejectReviewDto,
} from '../dtos/admin/admin-review-action.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

@Controller('admin/reviews')
@UseGuards(JwtAdminGuard)
export class AdminReviewController {
  constructor(private readonly reviewUseCase: AdminReviewUseCase) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar review')
  async list(@Query() query: AdminReviewQueryDto) {
    return await this.reviewUseCase.list(query);
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail review')
  async getById(@Param('id') id: string) {
    return await this.reviewUseCase.getById(id);
  }

  @Put(':id/approve')
  @ResponseMessage('Berhasil menyetujui review')
  async approve(
    @Param('id') id: string,
    @Body() dto: ApproveReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminId = req.user?.id as string;
    return await this.reviewUseCase.approve(id, adminId, dto.moderatorNote);
  }

  @Put(':id/reject')
  @ResponseMessage('Berhasil menolak review')
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectReviewDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminId = req.user?.id as string;
    return await this.reviewUseCase.reject(
      id,
      adminId,
      dto.reason,
      dto.moderatorNote,
    );
  }
}
