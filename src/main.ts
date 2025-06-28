import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import multipart from '@fastify/multipart';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  await app.register(multipart as unknown as any, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  // Gunakan @fastify/cors untuk konfigurasi CORS pada Fastify
await app.register(require('@fastify/cors'), {
  origin: '*', // Mengizinkan semua domain (wildcard)
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true })
  );
  app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));


  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
