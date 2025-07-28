import {
  Body,
  Get,
  HttpCode,
  Param,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateTripUseCase } from '../../core/application/create-trip.use-case';
import { GetTripUseCase } from '../../core/application/get-trip.use-case';
import { CreateTripDto } from '../dtos/trip/create-trip.dto';
import { JwtAccessGuard } from '../../common/guards/jwt-access.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';

@Controller('trip')
export class TripController {
  constructor(
    private readonly createTripUc: CreateTripUseCase,
    private readonly getTripUc: GetTripUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  @ResponseMessage('Berhasil menambah rencana perjalanan baru')
  async create(@Body() dto: CreateTripDto, @Req() req: any) {
    const userId = req.user?.id;
    await this.createTripUc.execute({ ...dto, userId, schedule: dto.schedule as any, budget: { ...dto.budget } as any });
    // Returning null allows ResponseInterceptor to set data: null
    return null;
  }

  // ----------------------------------------------
  // GET TRIP DETAIL
  // ----------------------------------------------
  @Get(':id')
  @HttpCode(200)
  @ResponseMessage('Berhasil mendapatkan data trip {name}')
  async getTripDetail(@Param('id') id: string) {
    const trip = await this.getTripUc.execute(id);
    return trip;
  }
}