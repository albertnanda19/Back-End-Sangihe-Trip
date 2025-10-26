import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAdminGuard } from '../../common/guards/jwt-admin.guard';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AdminActivityUseCase } from '../../core/application/admin-activity.use-case';
import { AdminActivityQueryDto } from '../dtos/admin/admin-activity-query.dto';
import { AdminAlertQueryDto } from '../dtos/admin/admin-alert-query.dto';

@Controller('admin')
@UseGuards(JwtAdminGuard)
export class AdminActivityController {
  constructor(private readonly adminActivityUseCase: AdminActivityUseCase) {}

  @Get('activities')
  @ResponseMessage('Berhasil mendapatkan daftar aktivitas admin')
  async getActivities(@Query() query: AdminActivityQueryDto) {
    const result = await this.adminActivityUseCase.getActivities(query);
    return result;
  }

  @Get('alerts')
  @ResponseMessage('Berhasil mendapatkan daftar alert')
  async getAlerts(@Query() query: AdminAlertQueryDto) {
    const result = await this.adminActivityUseCase.getAlerts(query);
    return result;
  }
}
