"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutInterceptor = exports.ResponseTransformInterceptor = exports.TransformInterceptor = exports.AuditLogInterceptor = exports.CacheInterceptor = exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const core_1 = require("@nestjs/core");
const decorators_1 = require("../decorators");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    logger = new common_1.Logger(LoggingInterceptor_1.name);
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const startTime = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: (response) => {
                const duration = Date.now() - startTime;
                const statusCode = context.switchToHttp().getResponse().statusCode;
                this.logger.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`);
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                this.logger.error(`${method} ${url} ${error.status || 500} ${duration}ms - ${ip} - ${userAgent}`, error.stack);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
let CacheInterceptor = class CacheInterceptor {
    cacheService;
    reflector;
    constructor(cacheService, reflector) {
        this.cacheService = cacheService;
        this.reflector = reflector;
    }
    async intercept(context, next) {
        const skipCache = this.reflector.getAllAndOverride(decorators_1.SKIP_CACHE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipCache) {
            return next.handle();
        }
        const cacheConfig = this.reflector.getAllAndOverride(decorators_1.CACHE_KEY, [
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
            return new rxjs_1.Observable(subscriber => {
                subscriber.next(cached);
                subscriber.complete();
            });
        }
        return next.handle().pipe((0, rxjs_1.tap)(async (response) => {
            await this.cacheService.set(cacheKey, response, cacheConfig.ttl);
        }));
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], CacheInterceptor);
let AuditLogInterceptor = class AuditLogInterceptor {
    auditService;
    reflector;
    constructor(auditService, reflector) {
        this.auditService = auditService;
        this.reflector = reflector;
    }
    intercept(context, next) {
        const skipAuditLog = this.reflector.getAllAndOverride(decorators_1.SKIP_AUDIT_LOG_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipAuditLog) {
            return next.handle();
        }
        const auditConfig = this.reflector.getAllAndOverride(decorators_1.AUDIT_LOG_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!auditConfig) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const startTime = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)(async (response) => {
            const duration = Date.now() - startTime;
            const auditLog = {
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
        }));
    }
    sanitizeBody(body) {
        if (!body)
            return {};
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'creditCard', 'ssn'];
        for (const field of sensitiveFields) {
            if (field in sanitized) {
                sanitized[field] = '[REDACTED]';
            }
        }
        return sanitized;
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, core_1.Reflector])
], AuditLogInterceptor);
let TransformInterceptor = class TransformInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const groups = this.reflector.getAllAndOverride(decorators_1.TRANSFORM_GROUPS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        return next.handle().pipe((0, rxjs_1.tap)((data) => {
            // Transformation logic would go here based on groups
            // This is typically handled by class-transformer in pipes
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TransformInterceptor);
let ResponseTransformInterceptor = class ResponseTransformInterceptor {
    intercept(context, next) {
        return next.handle().pipe((0, rxjs_1.tap)((data) => {
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
        }));
    }
};
exports.ResponseTransformInterceptor = ResponseTransformInterceptor;
exports.ResponseTransformInterceptor = ResponseTransformInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseTransformInterceptor);
let TimeoutInterceptor = class TimeoutInterceptor {
    intercept(context, next) {
        const timeout = 30000; // 30 seconds default
        return new rxjs_1.Observable(subscriber => {
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
};
exports.TimeoutInterceptor = TimeoutInterceptor;
exports.TimeoutInterceptor = TimeoutInterceptor = __decorate([
    (0, common_1.Injectable)()
], TimeoutInterceptor);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQW9HO0FBQ3BHLCtCQUF1QztBQUN2Qyx1Q0FBeUM7QUFDekMsOENBQW1IO0FBSTVHLElBQU0sa0JBQWtCLDBCQUF4QixNQUFNLGtCQUFrQjtJQUNaLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxvQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUU5RCxTQUFTLENBQUMsT0FBeUIsRUFBRSxJQUFpQjtRQUNwRCxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDcEQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQztRQUM3QyxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzlDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3QixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQ3ZCLElBQUEsVUFBRyxFQUFDO1lBQ0YsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7Z0JBQ2pCLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7Z0JBQ3hDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxVQUFVLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxJQUFJLEdBQUcsSUFBSSxVQUFVLElBQUksUUFBUSxRQUFRLEVBQUUsTUFBTSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQ3pGLENBQUM7WUFDRCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFB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LEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQ3JDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFO2FBQ3RDLENBQUMsQ0FBQztZQUVILE9BQU8sR0FBRyxFQUFFO2dCQUNWLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEIsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGLENBQUE7QUFyQlksZ0RBQWtCOzZCQUFsQixrQkFBa0I7SUFEOUIsSUFBQSxtQkFBVSxHQUFFO0dBQ0Esa0JBQWtCLENBcUI5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUsIE5lc3RJbnRlcmNlcHRvciwgRXhlY3V0aW9uQ29udGV4dCwgQ2FsbEhhbmRsZXIsIExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IE9ic2VydmFibGUsIHRhcCB9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHsgUmVmbGVjdG9yIH0gZnJvbSAnQG5lc3Rqcy9jb3JlJztcbmltcG9ydCB7IENBQ0hFX0tFWSwgU0tJUF9DQUNIRV9LRVksIEFVRElUX0xPR19LRVksIFNLSVBfQVVESVRfTE9HX0tFWSwgVFJBTlNGT1JNX0dST1VQU19LRVkgfSBmcm9tICcuLi9kZWNvcmF0b3JzJztcbmltcG9ydCB7IElDYWNoZVNlcnZpY2UsIElBdWRpdFNlcnZpY2UsIEF1ZGl0TG9nSW5wdXQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIExvZ2dpbmdJbnRlcmNlcHRvciBpbXBsZW1lbnRzIE5lc3RJbnRlcmNlcHRvciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyID0gbmV3IExvZ2dlcihMb2dnaW5nSW50ZXJjZXB0b3IubmFtZSk7XG5cbiAgaW50ZXJjZXB0KGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQsIG5leHQ6IENhbGxIYW5kbGVyKTogT2JzZXJ2YWJsZTx1bmtub3duPiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGNvbnRleHQuc3dpdGNoVG9IdHRwKCkuZ2V0UmVxdWVzdCgpO1xuICAgIGNvbnN0IHsgbWV0aG9kLCB1cmwsIGlwLCBoZWFkZXJzIH0gPSByZXF1ZXN0O1xuICAgIGNvbnN0IHVzZXJBZ2VudCA9IGhlYWRlcnNbJ3VzZXItYWdlbnQnXSB8fCAnJztcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKCkucGlwZShcbiAgICAgIHRhcCh7XG4gICAgICAgIG5leHQ6IChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgICAgICBjb25zdCBzdGF0dXNDb2RlID0gY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXNwb25zZSgpLnN0YXR1c0NvZGU7XG4gICAgICAgICAgdGhpcy5sb2dnZXIubG9nKGAke21ldGhvZH0gJHt1cmx9ICR7c3RhdHVzQ29kZX0gJHtkdXJhdGlvbn1tcyAtICR7aXB9IC0gJHt1c2VyQWdlbnR9YCk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYCR7bWV0aG9kfSAke3VybH0gJHtlcnJvci5zdGF0dXMgfHwgNTAwfSAke2R1cmF0aW9ufW1zIC0gJHtpcH0gLSAke3VzZXJBZ2VudH1gLCBlcnJvci5zdGFjayk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBDYWNoZUludGVyY2VwdG9yIGltcGxlbWVudHMgTmVzdEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSByZWFkb25seSBjYWNoZVNlcnZpY2U6IElDYWNoZVNlcnZpY2UsXG4gICAgcHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3RvcixcbiAgKSB7fVxuXG4gIGFzeW5jIGludGVyY2VwdChjb250ZXh0OiBFeGVjdXRpb25Db250ZXh0LCBuZXh0OiBDYWxsSGFuZGxlcik6IFByb21pc2U8T2JzZXJ2YWJsZTx1bmtub3duPj4ge1xuICAgIGNvbnN0IHNraXBDYWNoZSA9IHRoaXMucmVmbGVjdG9yLmdldEFsbEFuZE92ZXJyaWRlPGJvb2xlYW4+KFNLSVBfQ0FDSEVfS0VZLCBbXG4gICAgICBjb250ZXh0LmdldEhhbmRsZXIoKSxcbiAgICAgIGNvbnRleHQuZ2V0Q2xhc3MoKSxcbiAgICBdKTtcblxuICAgIGlmIChza2lwQ2FjaGUpIHtcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGNhY2hlQ29uZmlnID0gdGhpcy5yZWZsZWN0b3IuZ2V0QWxsQW5kT3ZlcnJpZGU8eyB0dGw6IG51bWJlcjsga2V5Pzogc3RyaW5nIH0+KENBQ0hFX0tFWSwgW1xuICAgICAgY29udGV4dC5nZXRIYW5kbGVyKCksXG4gICAgICBjb250ZXh0LmdldENsYXNzKCksXG4gICAgXSk7XG5cbiAgICBpZiAoIWNhY2hlQ29uZmlnKSB7XG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUoKTtcbiAgICB9XG5cbiAgICBjb25zdCByZXF1ZXN0ID0gY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCk7XG4gICAgY29uc3QgY2FjaGVLZXkgPSBjYWNoZUNvbmZpZy5rZXkgfHwgYGNhY2hlOiR7cmVxdWVzdC5tZXRob2R9OiR7cmVxdWVzdC51cmx9OiR7SlNPTi5zdHJpbmdpZnkocmVxdWVzdC5xdWVyeSl9OiR7cmVxdWVzdC51c2VyPy5pZCB8fCAnYW5vbnltb3VzJ31gO1xuXG4gICAgY29uc3QgY2FjaGVkID0gYXdhaXQgdGhpcy5jYWNoZVNlcnZpY2UuZ2V0KGNhY2hlS2V5KTtcbiAgICBpZiAoY2FjaGVkKSB7XG4gICAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoc3Vic2NyaWJlciA9PiB7XG4gICAgICAgIHN1YnNjcmliZXIubmV4dChjYWNoZWQpO1xuICAgICAgICBzdWJzY3JpYmVyLmNvbXBsZXRlKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUoKS5waXBlKFxuICAgICAgdGFwKGFzeW5jIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5zZXQoY2FjaGVLZXksIHJlc3BvbnNlLCBjYWNoZUNvbmZpZy50dGwpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXVkaXRMb2dJbnRlcmNlcHRvciBpbXBsZW1lbnRzIE5lc3RJbnRlcmNlcHRvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYXVkaXRTZXJ2aWNlOiBJQXVkaXRTZXJ2aWNlLFxuICAgIHByaXZhdGUgcmVhZG9ubHkgcmVmbGVjdG9yOiBSZWZsZWN0b3IsXG4gICkge31cblxuICBpbnRlcmNlcHQoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCwgbmV4dDogQ2FsbEhhbmRsZXIpOiBPYnNlcnZhYmxlPHVua25vd24+IHtcbiAgICBjb25zdCBza2lwQXVkaXRMb2cgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxib29sZWFuPihTS0lQX0FVRElUX0xPR19LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgaWYgKHNraXBBdWRpdExvZykge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgYXVkaXRDb25maWcgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTx7IGFjdGlvbjogc3RyaW5nOyByZXNvdXJjZTogc3RyaW5nIH0+KEFVRElUX0xPR19LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgaWYgKCFhdWRpdENvbmZpZykge1xuICAgICAgcmV0dXJuIG5leHQuaGFuZGxlKCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdCA9IGNvbnRleHQuc3dpdGNoVG9IdHRwKCkuZ2V0UmVxdWVzdCgpO1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cbiAgICByZXR1cm4gbmV4dC5oYW5kbGUoKS5waXBlKFxuICAgICAgdGFwKGFzeW5jIChyZXNwb25zZSkgPT4ge1xuICAgICAgICBjb25zdCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzdGFydFRpbWU7XG4gICAgICAgIGNvbnN0IGF1ZGl0TG9nOiBBdWRpdExvZ0lucHV0ID0ge1xuICAgICAgICAgIHRlbmFudElkOiByZXF1ZXN0LnRlbmFudElkIHx8IHJlcXVlc3QudXNlcj8udGVuYW50SWQsXG4gICAgICAgICAgYnJhbmNoSWQ6IHJlcXVlc3QuYnJhbmNoSWQgfHwgcmVxdWVzdC51c2VyPy5icmFuY2hJZCxcbiAgICAgICAgICB1c2VySWQ6IHJlcXVlc3QudXNlcj8uaWQgfHwgcmVxdWVzdC51c2VyPy5zdWIsXG4gICAgICAgICAgYWN0aW9uOiBhdWRpdENvbmZpZy5hY3Rpb24sXG4gICAgICAgICAgcmVzb3VyY2U6IGF1ZGl0Q29uZmlnLnJlc291cmNlLFxuICAgICAgICAgIHJlc291cmNlSWQ6IHJlcXVlc3QucGFyYW1zPy5pZCxcbiAgICAgICAgICBtZXRhZGF0YToge1xuICAgICAgICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgICAgICAgIHVybDogcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IGNvbnRleHQuc3dpdGNoVG9IdHRwKCkuZ2V0UmVzcG9uc2UoKS5zdGF0dXNDb2RlLFxuICAgICAgICAgICAgcXVlcnk6IHJlcXVlc3QucXVlcnksXG4gICAgICAgICAgICBib2R5OiB0aGlzLnNhbml0aXplQm9keShyZXF1ZXN0LmJvZHkpLFxuICAgICAgICAgIH0sXG4gICAgICAgICAgaXBBZGRyZXNzOiByZXF1ZXN0LmlwLFxuICAgICAgICAgIHVzZXJBZ2VudDogcmVxdWVzdC5oZWFkZXJzWyd1c2VyLWFnZW50J10sXG4gICAgICAgICAgc2Vzc2lvbklkOiByZXF1ZXN0LnNlc3Npb25JZCxcbiAgICAgICAgfTtcblxuICAgICAgICBhd2FpdCB0aGlzLmF1ZGl0U2VydmljZS5sb2coYXVkaXRMb2cpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgc2FuaXRpemVCb2R5KGJvZHk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGlmICghYm9keSkgcmV0dXJuIHt9O1xuICAgIGNvbnN0IHNhbml0aXplZCA9IHsgLi4uYm9keSB9O1xuICAgIGNvbnN0IHNlbnNpdGl2ZUZpZWxkcyA9IFsncGFzc3dvcmQnLCAndG9rZW4nLCAnc2VjcmV0JywgJ2tleScsICdjcmVkaXRDYXJkJywgJ3NzbiddO1xuICAgIGZvciAoY29uc3QgZmllbGQgb2Ygc2Vuc2l0aXZlRmllbGRzKSB7XG4gICAgICBpZiAoZmllbGQgaW4gc2FuaXRpemVkKSB7XG4gICAgICAgIHNhbml0aXplZFtmaWVsZF0gPSAnW1JFREFDVEVEXSc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzYW5pdGl6ZWQ7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRyYW5zZm9ybUludGVyY2VwdG9yIGltcGxlbWVudHMgTmVzdEludGVyY2VwdG9yIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSByZWZsZWN0b3I6IFJlZmxlY3Rvcikge31cblxuICBpbnRlcmNlcHQoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCwgbmV4dDogQ2FsbEhhbmRsZXIpOiBPYnNlcnZhYmxlPHVua25vd24+IHtcbiAgICBjb25zdCBncm91cHMgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxzdHJpbmdbXT4oVFJBTlNGT1JNX0dST1VQU19LRVksIFtcbiAgICAgIGNvbnRleHQuZ2V0SGFuZGxlcigpLFxuICAgICAgY29udGV4dC5nZXRDbGFzcygpLFxuICAgIF0pO1xuXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKCkucGlwZShcbiAgICAgIHRhcCgoZGF0YSkgPT4ge1xuICAgICAgICAvLyBUcmFuc2Zvcm1hdGlvbiBsb2dpYyB3b3VsZCBnbyBoZXJlIGJhc2VkIG9uIGdyb3Vwc1xuICAgICAgICAvLyBUaGlzIGlzIHR5cGljYWxseSBoYW5kbGVkIGJ5IGNsYXNzLXRyYW5zZm9ybWVyIGluIHBpcGVzXG4gICAgICB9KSxcbiAgICApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSZXNwb25zZVRyYW5zZm9ybUludGVyY2VwdG9yIGltcGxlbWVudHMgTmVzdEludGVyY2VwdG9yIHtcbiAgaW50ZXJjZXB0KGNvbnRleHQ6IEV4ZWN1dGlvbkNvbnRleHQsIG5leHQ6IENhbGxIYW5kbGVyKTogT2JzZXJ2YWJsZTx1bmtub3duPiB7XG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKCkucGlwZShcbiAgICAgIHRhcCgoZGF0YSkgPT4ge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGNvbnRleHQuc3dpdGNoVG9IdHRwKCkuZ2V0UmVzcG9uc2UoKTtcbiAgICAgICAgaWYgKGRhdGEgJiYgdHlwZW9mIGRhdGEgPT09ICdvYmplY3QnICYmICEoJ3N1Y2Nlc3MnIGluIGRhdGEpKSB7XG4gICAgICAgICAgcmVzcG9uc2UuZGF0YSA9IHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgbWV0YToge1xuICAgICAgICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgIHJlcXVlc3RJZDogY29udGV4dC5zd2l0Y2hUb0h0dHAoKS5nZXRSZXF1ZXN0KCkucmVxdWVzdElkLFxuICAgICAgICAgICAgICB2ZXJzaW9uOiBwcm9jZXNzLmVudi5BUFBfVkVSU0lPTiB8fCAnMS4wLjAnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBUaW1lb3V0SW50ZXJjZXB0b3IgaW1wbGVtZW50cyBOZXN0SW50ZXJjZXB0b3Ige1xuICBpbnRlcmNlcHQoY29udGV4dDogRXhlY3V0aW9uQ29udGV4dCwgbmV4dDogQ2FsbEhhbmRsZXIpOiBPYnNlcnZhYmxlPHVua25vd24+IHtcbiAgICBjb25zdCB0aW1lb3V0ID0gMzAwMDA7IC8vIDMwIHNlY29uZHMgZGVmYXVsdFxuXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKHN1YnNjcmliZXIgPT4ge1xuICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgc3Vic2NyaWJlci5lcnJvcihuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKTtcbiAgICAgIH0sIHRpbWVvdXQpO1xuXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBuZXh0LmhhbmRsZSgpLnN1YnNjcmliZSh7XG4gICAgICAgIG5leHQ6ICh2YWx1ZSkgPT4gc3Vic2NyaWJlci5uZXh0KHZhbHVlKSxcbiAgICAgICAgZXJyb3I6IChlcnIpID0+IHN1YnNjcmliZXIuZXJyb3IoZXJyKSxcbiAgICAgICAgY29tcGxldGU6ICgpID0+IHN1YnNjcmliZXIuY29tcGxldGUoKSxcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbn0iXX0=