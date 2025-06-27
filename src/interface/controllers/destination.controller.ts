import {
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Inject,
  Req,
  Get,
  Query,
  Param,
  Res,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import { AdminGuard } from '../../common/guards/admin.guard';
import { randomUUID } from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { CreateDestinationDto } from '../dtos/destination/create-destination.dto';
import { GetDestinationsQueryDto, GetDestinationsResponseDto } from '../dtos/destination/get-destinations.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationUseCase: DestinationUseCase,
    @Inject('STORAGE_PATH') private readonly storagePath: string,
  ) {}

  @Post()
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ResponseMessage('Berhasil menambahkan destinasi baru!')
  async createDestination(@Req() req: FastifyRequest) {
    const files: string[] = [];
    const savedFilePaths: string[] = [];
    let videoFile: string | undefined;
    let payloadJson = '';

    try {
      // Ensure multipart parsing is enabled (Fastify registers it in main.ts elsewhere)
      // Read parts sequentially to avoid buffering whole file uploads (performance)
      // Fastify multipart plugin augments FastifyRequest with `parts()` when registered
      // Casting to `any` to satisfy TypeScript without introducing heavy dependencies
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts = (req as any).parts();
      for await (const part of parts) {
        if (part.type === 'file') {
          const extension = (part.filename?.split('.').pop() ?? '').toLowerCase();
          const filename = `${randomUUID()}.${extension}`;
          const filepath = join(this.storagePath, filename);
          await writeFile(filepath, await part.toBuffer());
          savedFilePaths.push(filepath);

          if (part.fieldname === 'images') {
            files.push(filename);
          } else if (part.fieldname === 'video') {
            videoFile = filename;
          }
        } else if (part.type === 'field' && part.fieldname === 'payload') {
          payloadJson = part.value as string;
        }
      }

      if (!payloadJson) {
        throw new Error('Missing payload field');
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(payloadJson);
      } catch {
        throw new Error('Invalid JSON in payload field');
      }

      const dto = plainToInstance(CreateDestinationDto, parsed, {
        enableImplicitConversion: true,
      });

      await validateOrReject(dto as object, { whitelist: true });

      const result = await this.destinationUseCase.execute({
        ...dto,
        images: files,
        video: videoFile,
        uploaderId: (req as any).user.id,
      });

      return result;
    } catch (err) {
      // cleanup files if any error occurs
      await Promise.all(
        savedFilePaths.map((p) => unlink(p).catch(() => undefined)),
      );
      throw err;
    }
  }

  @ResponseMessage('Berhasil mendapatkan data daftar destinasi')
  @Get()
  @HttpCode(200)
  async getDestinations(@Query() query: GetDestinationsQueryDto, @Req() req: any): Promise<GetDestinationsResponseDto> {
    const result = await this.destinationUseCase.findAll(query);
    const { data, totalItems } = result;
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Build base URL from request
    const baseUrl = `${req.protocol}://${req.headers.host}/image/`;

    return {
      data: data.map((d: any) => {
        let imageFiles: string[] = [];
        if (Array.isArray(d.images)) {
          imageFiles = d.images;
        } else if (typeof d.images === 'string') {
          imageFiles = d.images
            .replace(/^{|}$/g, '')
            .split(',')
            .map((s: string) => s.trim().replace(/^"|"$/g, ''))
            .filter(Boolean);
        }
        // Only map to valid image links (skip empty/undefined)
        const imageLinks = imageFiles
          .filter((img: string) => !!img)
          .map((img: string) => `${req.protocol}://${req.headers.host}/image/${img}`);
        return {
          id: d.id,
          name: d.name,
          category: d.category,
          rating: 0,
          totalReviews: 0,
          location: d.location.address,
          price: d.price,
          image: imageLinks[0] ?? '',
          images: imageLinks,
          facilities: Array.isArray(d.facilities)
            ? d.facilities.map((f: any) => typeof f === 'string' ? f : f.icon || f.name)
            : [],
          description: d.description,
        };
      }),
      meta: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
    };
  }


}

