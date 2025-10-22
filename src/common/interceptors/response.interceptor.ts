import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from '../decorators/response.decorator';
import { ResponseDto } from '../dtos/response.dto';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ?? '';
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        // Support dynamic placeholders in the message, e.g. "Berhasil ... {name}!"
        // Any placeholder found will be replaced with a matching property from the
        // data object (if present). When at least one replacement happens we set
        // the final data payload to null, allowing controllers to return only the
        // values needed for interpolation while still producing the desired
        // response shape.
        let finalMessage = message;
        let hasReplacement = false;

        if (data && typeof data === 'object') {
          finalMessage = message.replace(/\{(\w+)\}/g, (_, key: string) => {
            if (key in (data as Record<string, any>)) {
              hasReplacement = true;
              return String((data as Record<string, any>)[key]);
            }
            // If the key isn't found, keep the placeholder as-is
            return `{${key}}`;
          });
        }

        return {
          status: statusCode,
          message: finalMessage,
          // Always attach the original payload to keep response versatile.
          data: data ?? null,
        } as ResponseDto<T>;
      }),
    );
  }
}
