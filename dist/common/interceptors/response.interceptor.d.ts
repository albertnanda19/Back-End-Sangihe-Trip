import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ResponseDto } from '../dtos/response.dto';
export declare class ResponseInterceptor<T> implements NestInterceptor<T, ResponseDto<T>> {
    private reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseDto<T>>;
}
