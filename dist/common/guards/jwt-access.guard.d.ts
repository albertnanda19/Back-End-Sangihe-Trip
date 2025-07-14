import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class JwtAccessGuard implements CanActivate {
    private readonly publicKey;
    constructor();
    canActivate(context: ExecutionContext): boolean;
}
