import {
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Inject,
  Get,
  Query,
} from '@nestjs/common';
import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { randomUUID } from 'crypto';
import { FirebaseStorage } from 'firebase/storage';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../infrastructure/firebase/firebase.provider';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
import { ResponseMessage } from '../../common/decorators/response.decorator';

interface ArticleFields {
  title: string;
  category: string | number;
  readingTime: number;
  content: string;
  'tags[]'?: string[] | string;
  slug?: string;
}

@Controller('article')
export class ArticleController {
  constructor(
    private readonly createArticleUc: CreateArticleUseCase,
    private readonly listArticlesUc: ListArticlesUseCase,
    @Inject(FIREBASE_STORAGE) private readonly storage: FirebaseStorage,
  ) {}

  @Get()
  @ResponseMessage('Berhasil mendapatkan data daftar artikel')
  async list(@Query() query: ArticleQueryDto) {
    return await this.listArticlesUc.execute({
      page: query.page,
      perPage: query.per_page,
      search: query.search,
      category: query.category,
      tag: query.tag,
      sort: query.sort,
      includeFeatured: query.include_featured,
      includeSidebar: query.include_sidebar,
    });
  }

  @Post()
  @UseGuards(JwtAdminGuard)
  async create(@Req() req: any) {
    const parts = (req as any).parts();
    const fields: Partial<ArticleFields> = {};
    let featuredImageUrl = '';
    const uploadedRefs: any[] = [];

    try {
      for await (const part of parts) {
        if (part.type === 'file' && part.fieldname === 'featuredImage') {
          const buffer = await part.toBuffer();
          if (buffer.length > 2 * 1024 * 1024) {
            throw new HttpException({ status:400, message:'Ukuran gambar maksimal 2MB'}, HttpStatus.BAD_REQUEST);
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

      const { title, category, readingTime, content, slug } = fields as ArticleFields;
      if (!title || !category || !readingTime || !content || !featuredImageUrl) {
        throw new HttpException({ status:400, message:'Data wajib tidak lengkap'}, HttpStatus.BAD_REQUEST);
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

      return { status:200, message:'Berhasil menambahkan artikel', data: article };
    } catch (e) {
      // rollback upload
      await Promise.all(uploadedRefs.map(r=>deleteObject(r).catch(()=>{})));
      throw e;
    }

    

    

    }

    
    

    
    
}
