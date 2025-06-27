import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FastifyRequest } from 'fastify';

/**
 * Guard that ensures the incoming request is authenticated *and* the decoded
 * JWT payload contains a `role` property equal to `admin`.  This class focuses
 * on a single responsibility (authorisation) and delegates token validation to
 * {@link JwtService}, satisfying SRP & DIP.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.toString().replace('Bearer ', '').trim();

    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload?.role !== 'admin') {
      throw new ForbiddenException('Administrator role required');
    }

    // Attach decoded payload for downstream consumers (SSOT)
    (request as any).user = payload;
    return true;
  }
}
