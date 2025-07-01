import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';

/**
 * Guard that validates a JWT access token using an **asymmetric** public key.
 * It also checks that the token is not expired, is an *access* token, and that
 * the user has the `admin` role.
 */
@Injectable()
export class JwtAdminGuard implements CanActivate {
  private readonly publicKey: string;

  constructor() {
    // Load public key once at bootstrap – SSOT & performance friendly (DRY)
    this.publicKey = readFileSync(join(process.cwd(), 'public.pem'), 'utf8');
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const authHeader = request.headers['authorization'] || request.headers['Authorization'];

    if (!authHeader || !authHeader.toString().startsWith('Bearer ')) {
      throw new UnauthorizedException('Header Authorization tidak ditemukan atau format tidak benar');
    }

    const token = authHeader.toString().replace('Bearer ', '').trim();

    let payload: any;
    try {
      payload = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      });
    } catch (e) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    if (payload?.type !== 'access') {
      throw new UnauthorizedException('Token bukan akses token');
    }

    if (payload?.role !== 'admin') {
      throw new ForbiddenException('Hanya admin yang diperbolehkan');
    }

    // attach user payload
    (request as any).user = payload;
    return true;
  }
}
