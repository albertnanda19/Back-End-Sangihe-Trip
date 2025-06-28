"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const multipart_1 = require("@fastify/multipart");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter({ logger: true }));
    await app.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    });
    await app.register(require('@fastify/cors'), {
        origin: '*',
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor(new core_1.Reflector()));
    const fastifyStatic = require('@fastify/static');
    const { join } = require('path');
    app.register(fastifyStatic, {
        root: join(__dirname, '..', 'storage'),
        prefix: '/image/',
        decorateReply: false,
    });
    await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
//# sourceMappingURL=main.js.map