import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAccessGuard implements CanActivate {
  private readonly publicKey: string;

  constructor() {
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
      payload = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    } catch (e) {
      throw new UnauthorizedException('Token tidak valid atau sudah kedaluwarsa');
    }

    if (payload?.type !== 'access') {
      throw new UnauthorizedException('Token bukan akses token');
    }

    // Attach user payload for downstream use
    (request as any).user = payload;
    return true;
  }
} 