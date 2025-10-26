import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminDestinationUseCase } from '../../core/application/admin-destination.use-case';
import { AdminDestinationQueryDto } from '../dtos/admin/admin-destination-query.dto';
import {
  CreateAdminDestinationDto,
  UpdateAdminDestinationDto,
} from '../dtos/admin/admin-destination.dto';

interface AuthenticatedRequest {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

@Controller('admin/destinations')
@UseGuards(JwtAdminGuard)
export class AdminDestinationController {
  constructor(
    private readonly destinationUseCase: AdminDestinationUseCase,
  ) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar destinasi')
  async list(@Query() query: AdminDestinationQueryDto) {
    return await this.destinationUseCase.list(query);
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail destinasi')
  async getById(@Param('id') id: string) {
    return await this.destinationUseCase.getById(id);
  }

  @Post()
  @HttpCode(201)
  @ResponseMessage('Berhasil membuat destinasi baru')
  async create(
    @Body() dto: CreateAdminDestinationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const adminId = req.user?.id as string;
    return await this.destinationUseCase.create(dto, adminId);
  }

  @Put(':id')
  @ResponseMessage('Berhasil memperbarui destinasi')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDestinationDto,
  ) {
    return await this.destinationUseCase.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ResponseMessage('Berhasil menghapus destinasi')
  async delete(@Param('id') id: string, @Query('hard') hard?: string) {
    await this.destinationUseCase.delete(id, hard === 'true');
    return null;
  }
}
