import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminArticleUseCase } from '../../core/application/admin-article.use-case';
import { AdminArticleQueryDto } from '../dtos/admin/admin-article-query.dto';
import {
  CreateAdminArticleDto,
  UpdateAdminArticleDto,
} from '../dtos/admin/admin-article.dto';

@Controller('admin/articles')
@UseGuards(JwtAdminGuard)
export class AdminArticleController {
  constructor(private readonly adminArticleUseCase: AdminArticleUseCase) {}

  @Get()
  @ResponseMessage('Berhasil mendapatkan daftar artikel')
  async list(@Query() query: AdminArticleQueryDto) {
    const result = await this.adminArticleUseCase.list(query);
    return result;
  }

  @Get(':id')
  @ResponseMessage('Berhasil mendapatkan detail artikel')
  async getById(@Param('id') id: string) {
    const result = await this.adminArticleUseCase.getById(id);
    return result;
  }

  @Post()
  @ResponseMessage('Berhasil membuat artikel baru')
  async create(@Body() dto: CreateAdminArticleDto, @Request() req: any) {
    const adminId = req.user.id;
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
    const adminUser = req.user;

    const result = await this.adminArticleUseCase.create(dto, adminId, adminUser, ipAddress, userAgent);
    return result;
  }

  @Patch(':id')
  @ResponseMessage('Berhasil memperbarui artikel')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminArticleDto, @Request() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
    const adminUser = req.user;

    const result = await this.adminArticleUseCase.update(id, dto, adminUser, ipAddress, userAgent);
    return result;
  }

  @Delete(':id')
  @ResponseMessage('Berhasil menghapus artikel')
  async delete(@Param('id') id: string, @Request() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
    const adminUser = req.user;

    await this.adminArticleUseCase.delete(id, adminUser, ipAddress, userAgent);
    return null;
  }

  @Put(':id/publish')
  @ResponseMessage('Berhasil mempublikasikan artikel')
  async publish(@Param('id') id: string, @Request() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';
    const adminUser = req.user;

    const result = await this.adminArticleUseCase.publish(id, adminUser, ipAddress, userAgent);
    return result;
  }
}
