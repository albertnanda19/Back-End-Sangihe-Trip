import { Controller, Get, Param } from '@nestjs/common';
import { UserUseCase } from '../../core/application/user.use-case';

@Controller('users')
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userUseCase.getUserById(id);
  }
}
