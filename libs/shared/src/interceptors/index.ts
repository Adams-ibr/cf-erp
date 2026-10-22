import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY, SKIP_CACHE_KEY, AUDIT_LOG_KEY, SKIP_AUDIT_LOG_KEY, TRANSFORM_GROUPS_KEY } from '../decorators';
import { ICacheService, IAuditService, AuditLogInput } from '../interfaces';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          const statusCode = context.switchToHttp().getResponse().statusCode;
          this.logger.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`${method} ${url} ${error.status || 500} ${duration}ms - ${ip} - ${userAgent}`, error.stack);
        },
      }),
    );
  }
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: ICacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const skipCache = this.reflector.getAllAndOverride<boolean>(SKIP_CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCache) {
      return next.handle();
    }

    const cacheConfig = this.reflector.getAllAndOverride<{ ttl: number; key?: string }>(CACHE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!cacheConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const cacheKey = cacheConfig.key || `cache:${request.method}:${request.url}:${JSON.stringify(request.query)}:${request.user?.id || 'anonymous'}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return new Observable(subscriber => {
        subscriber.next(cached);
        subscriber.complete();
      });
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(cacheKey, response, cacheConfig.ttl);
      }),
    );
  }
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: IAuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skipAuditLog = this.reflector.getAllAndOverride<boolean>(SKIP_AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuditLog) {
      return next.handle();
    }

    const auditConfig = this.reflector.getAllAndOverride<{ action: string; resource: string }>(AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(async (response) => {
        const duration = Date.now() - startTime;
        const auditLog: AuditLogInput = {
          tenantId: request.tenantId || request.user?.tenantId,
          branchId: request.branchId || request.user?.branchId,
          userId: request.user?.id || request.user?.sub,
          action: auditConfig.action,
          resource: auditConfig.resource,
          resourceId: request.params?.id,
          metadata: {
            method: request.method,
            url: request.url,
            duration,
            statusCode: context.switchToHttp().getResponse().statusCode,
            query: request.query,
            body: this.sanitizeBody(request.body),
          },
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          sessionId: request.sessionId,
        };

        await this.auditService.log(auditLog);
      }),
    );
  }

  private sanitizeBody(body: Record<string, unknown>): Record<string, unknown> {
    if (!body) return {};
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard', 'ssn'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const groups = this.reflector.getAllAndOverride<string[]>(TRANSFORM_GROUPS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    return next.handle().pipe(
      tap((data) => {
        // Transformation logic would go here based on groups
        // This is typically handled by class-transformer in pipes
      }),
    );
  }
}

@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        if (data && typeof data === 'object' && !('success' in data)) {
          response.data = {
            success: true,
            data,
            meta: {
              timestamp: new Date(),
              requestId: context.switchToHttp().getRequest().requestId,
              version: process.env.APP_VERSION || '1.0.0',
            },
          };
        }
      }),
    );
  }
}

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const timeout = 30000; // 30 seconds default

    return new Observable(subscriber => {
      const timer = setTimeout(() => {
        subscriber.error(new Error('Request timeout'));
      }, timeout);

      const subscription = next.handle().subscribe({
        next: (value) => subscriber.next(value),
        error: (err) => subscriber.error(err),
        complete: () => subscriber.complete(),
      });

      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    });
  }
}