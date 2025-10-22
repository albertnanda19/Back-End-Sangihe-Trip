import { Controller, Get, Query } from '@nestjs/common';
import { LandingPageUseCase } from '../../core/application/landing-page.use-case';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { LandingPageQueryDto } from '../dtos/landing-page-query.dto';

@Controller('landing-page')
export class LandingPageController {
  constructor(private readonly landingPageUseCase: LandingPageUseCase) {}

  @Get()
  @ResponseMessage('Berhasil mengambil data landing page')
  getLandingPage(@Query() query: LandingPageQueryDto) {
    return this.landingPageUseCase.execute(query.category);
  }
}
