import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTripUseCase } from '../../core/application/create-trip.use-case';
import { CreateTripDto } from '../dtos/trip/create-trip.dto';
import { JwtAccessGuard } from '../../common/guards/jwt-access.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';

@Controller('trips')
export class TripController {
  constructor(private readonly createTripUc: CreateTripUseCase) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil menambah rencana perjalanan baru')
  async create(@Body() dto: CreateTripDto, @Req() req: any) {
    const userId = req.user?.id;
    await this.createTripUc.execute({ ...dto, userId, schedule: dto.schedule as any, budget: { ...dto.budget } as any });
    // Returning null allows ResponseInterceptor to set data: null
    return null;
  }
} 