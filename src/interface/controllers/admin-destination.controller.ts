import {
  Controller,
  Get,
  Post,
  Patch,
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
    @Req() req: any,
  ) {
    const adminId = req.user?.id as string;
    const adminUser = req.user;
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';

    return await this.destinationUseCase.create(dto, adminId, adminUser, ipAddress, userAgent);
  }

  @Patch(':id')
  @ResponseMessage('Berhasil memperbarui destinasi')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminDestinationDto,
    @Req() req: any,
  ) {
    const adminUser = req.user;
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';

    return await this.destinationUseCase.update(id, dto, adminUser, ipAddress, userAgent);
  }

  @Delete(':id')
  @HttpCode(204)
  @ResponseMessage('Berhasil menghapus destinasi')
  async delete(@Param('id') id: string, @Req() req: any) {
    const adminUser = req.user;
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';

    await this.destinationUseCase.delete(id, adminUser, ipAddress, userAgent);
    return null;
  }
}
