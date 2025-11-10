import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminTripUseCase } from '../../core/application/admin-trip.use-case';
import { AdminTripQueryDto } from '../dtos/admin/admin-trip-query.dto';

@Controller('admin/trips')
@UseGuards(JwtAdminGuard)
export class AdminTripController {
  constructor(
    private readonly tripUseCase: AdminTripUseCase,
  ) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar trip plans')
  async list(@Query() query: AdminTripQueryDto) {
    return await this.tripUseCase.list(query);
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail trip plan')
  async getById(@Param('id') id: string) {
    return await this.tripUseCase.getById(id);
  }
}
