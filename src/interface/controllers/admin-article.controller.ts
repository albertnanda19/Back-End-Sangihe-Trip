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
    const result = await this.adminArticleUseCase.create(dto, adminId);
    return result;
  }

  @Put(':id')
  @ResponseMessage('Berhasil memperbarui artikel')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminArticleDto) {
    const result = await this.adminArticleUseCase.update(id, dto);
    return result;
  }

  @Delete(':id')
  @ResponseMessage('Berhasil menghapus artikel')
  async delete(@Param('id') id: string, @Query('hard') hard?: string) {
    await this.adminArticleUseCase.delete(id, hard === 'true');
    return null;
  }

  @Put(':id/publish')
  @ResponseMessage('Berhasil mempublikasikan artikel')
  async publish(@Param('id') id: string) {
    const result = await this.adminArticleUseCase.publish(id);
    return result;
  }
}
