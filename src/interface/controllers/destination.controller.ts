import {
  Controller,
  HttpCode,
  Post,
  UseGuards,
  Inject,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { DestinationUseCase } from '../../core/application/destination.use-case';
import { AdminGuard } from '../../common/guards/admin.guard';
import { randomUUID } from 'crypto';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { CreateDestinationDto } from '../dtos/destination/create-destination.dto';
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
}
