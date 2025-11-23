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
  Inject,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FirebaseStorage } from 'firebase/storage';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../infrastructure/firebase/firebase.provider';
import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminArticleUseCase } from '../../core/application/admin-article.use-case';
import { AdminArticleQueryDto } from '../dtos/admin/admin-article-query.dto';
import {
  CreateAdminArticleDto,
  UpdateAdminArticleDto,
} from '../dtos/admin/admin-article.dto';

interface ArticleFields {
  title: string;
  category: string | number;
  readingTime: number;
  content: string;
  'tags[]'?: string[] | string;
  slug?: string;
}

@Controller('admin/articles')
@UseGuards(JwtAdminGuard)
export class AdminArticleController {
  constructor(
    private readonly adminArticleUseCase: AdminArticleUseCase,
    private readonly createArticleUc: CreateArticleUseCase,
    @Inject(FIREBASE_STORAGE) private readonly storage: FirebaseStorage,
  ) {}

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

  @Post('upload')
  @ResponseMessage('Berhasil membuat artikel baru')
  async createWithUpload(@Req() req: any) {
    const parts = req.parts();
    const fields: Partial<ArticleFields> = {};
    let featuredImageUrl = '';
    const uploadedRefs: any[] = [];

    try {
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'featuredImage') {
          const buffer = await part.toBuffer();
          if (buffer.length > 2 * 1024 * 1024) {
            throw new HttpException(
              { status: 400, message: 'Ukuran gambar maksimal 2MB' },
              HttpStatus.BAD_REQUEST,
            );
          }
          const ext = (part.filename?.split('.').pop() ?? '').toLowerCase();
          const filename = `${randomUUID()}.${ext}`;
          const storageRef = ref(this.storage, `articles/${filename}`);
          await uploadBytes(storageRef, buffer, { contentType: part.mimetype });
          uploadedRefs.push(storageRef);
          featuredImageUrl = await getDownloadURL(storageRef);
        } else if (part.type === 'field') {
          (fields as any)[part.fieldname] = part.value;
        }
      }

      const { title, category, readingTime, content, slug } =
        fields as ArticleFields;
      if (
        !title ||
        !category ||
        !readingTime ||
        !content ||
        !featuredImageUrl
      ) {
        throw new HttpException(
          { status: 400, message: 'Data wajib tidak lengkap' },
          HttpStatus.BAD_REQUEST,
        );
      }
      const tagsRaw = fields['tags[]'];
      const tags = Array.isArray(tagsRaw) ? tagsRaw : tagsRaw ? [tagsRaw] : [];
      const authorId = req.user?.id;

      const article = await this.createArticleUc.execute({
        title,
        category,
        authorId,
        readingTime: Number(readingTime),
        content,
        tags,
        featuredImageUrl,
        slug,
      });

      return article;
    } catch (e) {
      // rollback upload
      await Promise.all(
        uploadedRefs.map((r) => deleteObject(r).catch(() => {})),
      );
      throw e;
    }
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
