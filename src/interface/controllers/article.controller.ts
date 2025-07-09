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
  Param,
} from '@nestjs/common';
import { CreateArticleUseCase } from '../../core/application/create-article.use-case';
import { randomUUID } from 'crypto';
import { FirebaseStorage } from 'firebase/storage';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../infrastructure/firebase/firebase.provider';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ListArticlesUseCase } from '../../core/application/list-articles.use-case';
import { GetArticleUseCase } from '../../core/application/get-article.use-case';
import { ArticleQueryDto } from '../dtos/article-query.dto';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { Article } from '../../core/domain/article.entity';

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
    private readonly getArticleUc: GetArticleUseCase,
    @Inject(FIREBASE_STORAGE) private readonly storage: FirebaseStorage,
  ) {}

  @Get()
  @ResponseMessage('Berhasil mengambil daftar artikel')
  async list(@Query() query: ArticleQueryDto) {
    const result = await this.listArticlesUc.execute({
      page: query.page,
      perPage: query.per_page,
      search: query.search,
      category: query.category,
      tag: query.tag,
      sort: query.sort,
      includeFeatured: query.include_featured,
      includeSidebar: query.include_sidebar,
    });

    // Helper to format publish date in Indonesian locale
    const formatPublishDate = (date: Date | undefined) =>
      date
        ? new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(date)
        : '';

    // Transform an Article entity (with extra props) into response shape
    const mapArticle = (article: Article) => ({
      id: article.id,
      title: article.title,
      excerpt: (article as any).excerpt ?? '',
      category: typeof article.category === 'string' ? article.category : String(article.category),
      author: {
        name: (article as any).author?.name ?? '',
        avatar: (article as any).author?.avatar ?? '/placeholder.svg?height=32&width=32',
      },
      publishDate: formatPublishDate(article.publishDate),
      readingTime: `${article.readingTime} menit`,
      image: article.featuredImageUrl,
      slug: article.slug,
    });

    return {
      featured: result.featured ? mapArticle(result.featured as Article) : null,
      articles: result.data.map((a) => mapArticle(a as Article)),
    };
  }

  @Get(':id')
  @ResponseMessage('Berhasil mengambil detail artikel')
  async detail(@Param('id') id: string) {
    return this.getArticleUc.execute(id);
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
