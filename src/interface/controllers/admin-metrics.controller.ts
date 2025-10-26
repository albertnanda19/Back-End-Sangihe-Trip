import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminMetricsUseCase } from '../../core/application/admin-metrics.use-case';

@Controller('admin/metrics')
@UseGuards(JwtAdminGuard)
export class AdminMetricsController {
  constructor(private readonly metricsUseCase: AdminMetricsUseCase) {}

  @Get('summary')
  @ResponseMessage('Berhasil mengambil ringkasan metrik')
  async getSummary(@Query('range') range?: string) {
    const data = await this.metricsUseCase.getSummary(range);
    return data;
  }

  @Get('registrations')
  @ResponseMessage('Berhasil mengambil data registrasi pengguna')
  async getRegistrations(@Query('range') range: string = '6mo') {
    const data = await this.metricsUseCase.getRegistrations(range);
    return data;
  }

  @Get('popular-destinations')
  @ResponseMessage('Berhasil mengambil destinasi populer')
  async getPopularDestinations(
    @Query('limit') limit: string = '10',
    @Query('period') period: string = '30d',
  ) {
    const data = await this.metricsUseCase.getPopularDestinations(
      parseInt(limit),
      period,
    );
    return data;
  }

  @Get('trip-plans')
  @ResponseMessage('Berhasil mengambil data rencana perjalanan')
  async getTripPlans(@Query('range') range: string = '6mo') {
    const data = await this.metricsUseCase.getTripPlans(range);
    return data;
  }

  @Get('review-distribution')
  @ResponseMessage('Berhasil mengambil distribusi review')
  async getReviewDistribution(@Query('period') period: string = '30d') {
    const data = await this.metricsUseCase.getReviewDistribution(period);
    return data;
  }
}
