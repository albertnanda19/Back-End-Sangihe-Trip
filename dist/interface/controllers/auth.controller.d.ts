import { AuthUseCase } from '../../core/application/auth.use-case';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';
export declare class AuthController {
    private readonly authUseCase;
    constructor(authUseCase: AuthUseCase);
    register(body: RegisterDto): Promise<{
        id: string;
        name: string;
        email: string;
    }>;
    login(body: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
}
