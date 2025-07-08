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
import {
  deleteObject,
  getDownloadURL,
  ref,
  StorageReference,
  uploadBytes,
} from 'firebase/storage';
import { FirebaseStorage } from 'firebase/storage';
import { FIREBASE_STORAGE } from '../../infrastructure/firebase/firebase.provider';
import { CreateDestinationDto } from '../dtos/destination/create-destination.dto';
import { GetDestinationsQueryDto, GetDestinationsResponseDto } from '../dtos/destination/get-destinations.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

@Controller('destination')
export class DestinationController {
  constructor(
    private readonly destinationUseCase: DestinationUseCase,
    @Inject(FIREBASE_STORAGE) private readonly storage: FirebaseStorage,
  ) {}

  @Post()
  @HttpCode(200)
  @UseGuards(AdminGuard)
  @ResponseMessage('Berhasil menambahkan destinasi baru!')
  async createDestination(@Req() req: FastifyRequest) {
    const uploadedImageRefs: StorageReference[] = [];
    let payloadJson = '';

    try {
      const parts = (req as any).parts();
      const uploadedImageUrls: string[] = [];
      let videoUrl: string | undefined;

      const fileProcessingPromises: Promise<void>[] = [];

      for await (const part of parts) {
        // Handle nested "parts" streams concurrently without blocking iteration
        if (part.type === 'file') {
          // Launch an async task quickly so that the iterator can continue
          const task = (async () => {
            const buffer = await part.toBuffer();

            const extension = (part.filename?.split('.').pop() ?? '').toLowerCase();
            const filename = `${randomUUID()}.${extension}`;
            const storageRef = ref(this.storage, `destinations/${filename}`);

            await uploadBytes(storageRef, buffer, { contentType: part.mimetype });

            // Keep reference for rollback *after* successful upload
            uploadedImageRefs.push(storageRef);

            const url = await getDownloadURL(storageRef);

            if (part.fieldname === 'video') {
              videoUrl = url;
            } else if (part.fieldname.startsWith('images')) {
              // Handles: images, images[], images[0], images1, etc.
              uploadedImageUrls.push(url);
            }
          })();

          fileProcessingPromises.push(task);
        } else if (part.type === 'field' && part.fieldname === 'payload') {
          payloadJson = part.value as string;
        }
      }

      // Wait until *every* upload is finished before moving on
      await Promise.all(fileProcessingPromises);

      if (!payloadJson) {
        throw new Error('Missing payload field');
      }

      const dto = plainToInstance(CreateDestinationDto, JSON.parse(payloadJson), {
        enableImplicitConversion: true,
      });

      await validateOrReject(dto as object, { whitelist: true });

      const result = await this.destinationUseCase.execute({
        ...dto,
        images: uploadedImageUrls,
        video: videoUrl,
        uploaderId: (req as any).user.id,
      });

      return result;
    } catch (err) {
      await Promise.all(
        uploadedImageRefs.map((fileRef) =>
          deleteObject(fileRef).catch(console.error),
        ),
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

    return {
      data: data.map((destination) => {
        // The images from the database are already full Firebase URLs or old filenames.
        // We don't need to prepend any base URL here.
        const images: string[] = destination.images ?? [];
        return {
          id: destination.id,
          name: destination.name,
          category: destination.category,
          rating: 0, // Placeholder
          totalReviews: 0, // Placeholder
          location: destination.location.address,
          price: destination.price,
          image: images[0] ?? '',
          images: images,
          facilities: Array.isArray(destination.facilities)
            ? destination.facilities.map((f: any) => f.name || f.icon || f)
            : [],
          description: destination.description,
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

