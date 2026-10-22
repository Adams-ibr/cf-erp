import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ICacheService, IAuditService } from '../interfaces';
export declare class LoggingInterceptor implements NestInterceptor {
    private readonly logger;
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
export declare class CacheInterceptor implements NestInterceptor {
    private readonly cacheService;
    private readonly reflector;
    constructor(cacheService: ICacheService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>>;
}
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly auditService;
    private readonly reflector;
    constructor(auditService: IAuditService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
    private sanitizeBody;
}
export declare class TransformInterceptor implements NestInterceptor {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
export declare class ResponseTransformInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
export declare class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
