import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
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
  async register(@Body() body: RegisterDto, @Req() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';

    const user = await this.authUseCase.execute(body, ipAddress, userAgent);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @Post('login')
  @HttpCode(200)
  @ResponseMessage('Berhasil melakukan login!')
  async login(@Body() body: LoginDto, @Req() req: any) {
    const ipAddress = req.ip || req.ips?.[0] || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers?.['user-agent'] || req.get?.('User-Agent') || 'Unknown';

    const tokens = await this.authUseCase.login(body, ipAddress, userAgent);
    return tokens;
  }
}
