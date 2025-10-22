import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ResponseMessage } from '../../common/decorators/response.decorator';
import { AuthUseCase } from '../../core/application/auth.use-case';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('register')
  @HttpCode(200)
  @ResponseMessage('Berhasil mendaftarkan akun. Silahkan melakukan login')
  async register(@Body() body: RegisterDto) {
    const user = await this.authUseCase.execute(body);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @Post('login')
  @HttpCode(200)
  @ResponseMessage('Berhasil melakukan login!')
  async login(@Body() body: LoginDto) {
    const tokens = await this.authUseCase.login(body);
    return tokens;
  }
}
