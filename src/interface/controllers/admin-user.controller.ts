import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminUserUseCase } from '../../core/application/admin-user.use-case';
import { AdminUserQueryDto } from '../dtos/admin/admin-user-query.dto';
import { UpdateUserDto } from '../dtos/admin/admin-user-update.dto';

@Controller('admin/users')
@UseGuards(JwtAdminGuard)
export class AdminUserController {
  constructor(private readonly userUseCase: AdminUserUseCase) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar pengguna')
  async list(@Query() query: AdminUserQueryDto) {
    return await this.userUseCase.list(query);
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail pengguna')
  async getById(@Param('id') id: string) {
    return await this.userUseCase.getById(id);
  }

  @Patch(':id')
  @ResponseMessage('Berhasil memperbarui pengguna')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
    const adminUser = req.user; // From JWT guard

    return await this.userUseCase.update(id, dto, adminUser, ipAddress, userAgent);
  }

  @Delete(':id')
  @HttpCode(204)
  @ResponseMessage('Berhasil menghapus pengguna')
  async delete(@Param('id') id: string, @Query('hard') hard?: string) {
    await this.userUseCase.delete(id, hard === 'true');
    return null;
  }
}
