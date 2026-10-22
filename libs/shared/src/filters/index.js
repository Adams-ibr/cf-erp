"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException ? exception.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException ? exception.getResponse() : 'Internal server error';
        const error = exception instanceof Error ? exception.message : 'Unknown error';
        const errorResponse = {
            success: false,
            error: {
                code: this.getErrorCode(status),
                message: typeof message === 'string' ? message : message.message || error,
                details: exception instanceof common_1.HttpException ? message : undefined,
                stack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: request.headers['x-request-id'] || request.id,
                path: request.url,
                method: request.method,
            },
        };
        this.logger.error(`${request.method} ${request.url} ${status}`, exception instanceof Error ? exception.stack : error);
        response.status(status).json(errorResponse);
    }
    getErrorCode(status) {
        switch (status) {
            case 400:
                return 'BAD_REQUEST';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            case 422:
                return 'VALIDATION_ERROR';
            case 429:
                return 'RATE_LIMIT_EXCEEDED';
            case 500:
                return 'INTERNAL_SERVER_ERROR';
            case 503:
                return 'SERVICE_UNAVAILABLE';
            default:
                return 'UNKNOWN_ERROR';
        }
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const responseBody = exception.getResponse();
        const errorResponse = {
            success: false,
            error: {
                code: this.getErrorCode(status),
                message: typeof responseBody === 'string' ? responseBody : responseBody.message || exception.message,
                details: typeof responseBody === 'object' ? responseBody : undefined,
            },
            meta: {
                timestamp: new Date().toISOString(),
                requestId: request.headers['x-request-id'] || request.id,
                path: request.url,
                method: request.method,
            },
        };
        response.status(status).json(errorResponse);
    }
    getErrorCode(status) {
        switch (status) {
            case 400:
                return 'BAD_REQUEST';
            case 401:
                return 'UNAUTHORIZED';
            case 403:
                return 'FORBIDDEN';
            case 404:
                return 'NOT_FOUND';
            case 409:
                return 'CONFLICT';
            case 422:
                return 'VALIDATION_ERROR';
            case 429:
                return 'RATE_LIMIT_EXCEEDED';
            default:
                return 'HTTP_ERROR';
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(common_1.HttpException)
], HttpExceptionFilter);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsMkNBQTBHO0FBSW5HLElBQU0sbUJBQW1CLDJCQUF6QixNQUFNLG1CQUFtQjtJQUNiLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxxQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUvRCxLQUFLLENBQUMsU0FBa0IsRUFBRSxJQUFtQjtRQUMzQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEMsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsRUFBWSxDQUFDO1FBQzdDLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQVcsQ0FBQztRQUUxQyxNQUFNLE1BQU0sR0FBRyxTQUFTLFlBQVksc0JBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxtQkFBVSxDQUFDLHFCQUFxQixDQUFDO1FBQzdHLE1BQU0sT0FBTyxHQUFHLFNBQVMsWUFBWSxzQkFBYSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDO1FBQ3ZHLE1BQU0sS0FBSyxHQUFHLFNBQVMsWUFBWSxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQztRQUUvRSxNQUFNLGFBQWEsR0FBRztZQUNwQixPQUFPLEVBQUUsS0FBSztZQUNkLEtBQUssRUFBRTtnQkFDTCxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7Z0JBQy9CLE9BQU8sRUFBRSxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUUsT0FBbUMsQ0FBQyxPQUFPLElBQUksS0FBSztnQkFDdEcsT0FBTyxFQUFFLFNB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RTtnQkFDbkMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFXLElBQUksT0FBTyxDQUFDLEVBQVk7Z0JBQzVFLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRztnQkFDakIsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO2FBQ3ZCO1NBQ0YsQ0FBQztRQUVGLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTyxZQUFZLENBQUMsTUFBYztRQUNqQyxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2YsS0FBSyxHQUFHO2dCQUNOLE9BQU8sYUFBYSxDQUFDO1lBQ3ZCLEtBQUssR0FBRztnQkFDTixPQUFPLGNBQWMsQ0FBQztZQUN4QixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxXQUFXLENBQUM7WUFDckIsS0FBSyxHQUFHO2dCQUNOLE9BQU8sV0FBVyxDQUFDO1lBQ3JCLEtBQUssR0FBRztnQkFDTixPQUFPLFVBQVUsQ0FBQztZQUNwQixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxrQkFBa0IsQ0FBQztZQUM1QixLQUFLLEdBQUc7Z0JBQ04sT0FBTyxxQkFBcUIsQ0FBQztZQUMvQjtnQkFDRSxPQUFPLFlBQVksQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUEvQ1ksa0RBQW1COzhCQUFuQixtQkFBbUI7SUFEL0IsSUFBQSxjQUFLLEVBQUMsc0JBQWEsQ0FBQztHQUNSLG1CQUFtQixDQStDL0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeGNlcHRpb25GaWx0ZXIsIENhdGNoLCBBcmd1bWVudHNIb3N0LCBIdHRwRXhjZXB0aW9uLCBIdHRwU3RhdHVzLCBMb2dnZXIgfSBmcm9tICdAbmVzdGpzL2NvbW1vbic7XG5pbXBvcnQgeyBSZXF1ZXN0LCBSZXNwb25zZSB9IGZyb20gJ2V4cHJlc3MnO1xuXG5AQ2F0Y2goKVxuZXhwb3J0IGNsYXNzIEFsbEV4Y2VwdGlvbnNGaWx0ZXIgaW1wbGVtZW50cyBFeGNlcHRpb25GaWx0ZXIge1xuICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlciA9IG5ldyBMb2dnZXIoQWxsRXhjZXB0aW9uc0ZpbHRlci5uYW1lKTtcblxuICBjYXRjaChleGNlcHRpb246IHVua25vd24sIGhvc3Q6IEFyZ3VtZW50c0hvc3QpOiB2b2lkIHtcbiAgICBjb25zdCBjdHggPSBob3N0LnN3aXRjaFRvSHR0cCgpO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gY3R4LmdldFJlc3BvbnNlPFJlc3BvbnNlPigpO1xuICAgIGNvbnN0IHJlcXVlc3QgPSBjdHguZ2V0UmVxdWVzdDxSZXF1ZXN0PigpO1xuXG4gICAgY29uc3Qgc3RhdHVzID0gZXhjZXB0aW9uIGluc3RhbmNlb2YgSHR0cEV4Y2VwdGlvbiA/IGV4Y2VwdGlvbi5nZXRTdGF0dXMoKSA6IEh0dHBTdGF0dXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBleGNlcHRpb24gaW5zdGFuY2VvZiBIdHRwRXhjZXB0aW9uID8gZXhjZXB0aW9uLmdldFJlc3BvbnNlKCkgOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJztcbiAgICBjb25zdCBlcnJvciA9IGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEVycm9yID8gZXhjZXB0aW9uLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcic7XG5cbiAgICBjb25zdCBlcnJvclJlc3BvbnNlID0ge1xuICAgICAgc3VjY2VzczogZmFsc2UsXG4gICAgICBlcnJvcjoge1xuICAgICAgICBjb2RlOiB0aGlzLmdldEVycm9yQ29kZShzdGF0dXMpLFxuICAgICAgICBtZXNzYWdlOiB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgPyBtZXNzYWdlIDogKG1lc3NhZ2UgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLm1lc3NhZ2UgfHwgZXJyb3IsXG4gICAgICAgIGRldGFpbHM6IGV4Y2VwdGlvbiBpbnN0YW5jZW9mIEh0dHBFeGNlcHRpb24gPyAobWVzc2FnZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikgOiB1bmRlZmluZWQsXG4gICAgICAgIHN0YWNrOiBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ2RldmVsb3BtZW50JyAmJiBleGNlcHRpb24gaW5zdGFuY2VvZiBFcnJvciA/IGV4Y2VwdGlvbi5zdGFjayA6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgICBtZXRhOiB7XG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICByZXF1ZXN0SWQ6IHJlcXVlc3QuaGVhZGVyc1sneC1yZXF1ZXN0LWlkJ10gYXMgc3RyaW5nIHx8IHJlcXVlc3QuaWQgYXMgc3RyaW5nLFxuICAgICAgICBwYXRoOiByZXF1ZXN0LnVybCxcbiAgICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIHRoaXMubG9nZ2VyLmVycm9yKGAke3JlcXVlc3QubWV0aG9kfSAke3JlcXVlc3QudXJsfSAke3N0YXR1c31gLCBleGNlcHRpb24gaW5zdGFuY2VvZiBFcnJvciA/IGV4Y2VwdGlvbi5zdGFjayA6IGVycm9yKTtcblxuICAgIHJlc3BvbnNlLnN0YXR1cyhzdGF0dXMpLmpzb24oZXJyb3JSZXNwb25zZSk7XG4gIH1cblxuICBwcml2YXRlIGdldEVycm9yQ29kZShzdGF0dXM6IG51bWJlcik6IHN0cmluZyB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgNDAwOlxuICAgICAgICByZXR1cm4gJ0JBRF9SRVFVRVNUJztcbiAgICAgIGNhc2UgNDAxOlxuICAgICAgICByZXR1cm4gJ1VOQVVUSE9SSVpFRCc7XG4gICAgICBjYXNlIDQwMzpcbiAgICAgICAgcmV0dXJuICdGT1JCSURERU4nO1xuICAgICAgY2FzZSA0MDQ6XG4gICAgICAgIHJldHVybiAnTk9UX0ZPVU5EJztcbiAgICAgIGNhc2UgNDA5OlxuICAgICAgICByZXR1cm4gJ0NPTkZMSUNUJztcbiAgICAgIGNhc2UgNDIyOlxuICAgICAgICByZXR1cm4gJ1ZBTElEQVRJT05fRVJST1InO1xuICAgICAgY2FzZSA0Mjk6XG4gICAgICAgIHJldHVybiAnUkFURV9MSU1JVF9FWENFRURFRCc7XG4gICAgICBjYXNlIDUwMDpcbiAgICAgICAgcmV0dXJuICdJTlRFUk5BTF9TRVJWRVJfRVJST1InO1xuICAgICAgY2FzZSA1MDM6XG4gICAgICAgIHJldHVybiAnU0VSVklDRV9VTkFWQUlMQUJMRSc7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gJ1VOS05PV05fRVJST1InO1xuICAgIH1cbiAgfVxufVxuXG5AQ2F0Y2goSHR0cEV4Y2VwdGlvbilcbmV4cG9ydCBjbGFzcyBIdHRwRXhjZXB0aW9uRmlsdGVyIGltcGxlbWVudHMgRXhjZXB0aW9uRmlsdGVyIHtcbiAgY2F0Y2goZXhjZXB0aW9uOiBIdHRwRXhjZXB0aW9uLCBob3N0OiBBcmd1bWVudHNIb3N0KTogdm9pZCB7XG4gICAgY29uc3QgY3R4ID0gaG9zdC5zd2l0Y2hUb0h0dHAoKTtcbiAgICBjb25zdCByZXNwb25zZSA9IGN0eC5nZXRSZXNwb25zZTxSZXNwb25zZT4oKTtcbiAgICBjb25zdCByZXF1ZXN0ID0gY3R4LmdldFJlcXVlc3Q8UmVxdWVzdD4oKTtcblxuICAgIGNvbnN0IHN0YXR1cyA9IGV4Y2VwdGlvbi5nZXRTdGF0dXMoKTtcbiAgICBjb25zdCByZXNwb25zZUJvZHkgPSBleGNlcHRpb24uZ2V0UmVzcG9uc2UoKTtcblxuICAgIGNvbnN0IGVycm9yUmVzcG9uc2UgPSB7XG4gICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIGVycm9yOiB7XG4gICAgICAgIGNvZGU6IHRoaXMuZ2V0RXJyb3JDb2RlKHN0YXR1cyksXG4gICAgICAgIG1lc3NhZ2U6IHR5cGVvZiByZXNwb25zZUJvZHkgPT09ICdzdHJpbmcnID8gcmVzcG9uc2VCb2R5IDogKHJlc3BvbnNlQm9keSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikubWVzc2FnZSB8fCBleGNlcHRpb24ubWVzc2FnZSxcbiAgICAgICAgZGV0YWlsczogdHlwZW9mIHJlc3BvbnNlQm9keSA9PT0gJ29iamVjdCcgPyByZXNwb25zZUJvZHkgOiB1bmRlZmluZWQsXG4gICAgICB9LFxuICAgICAgbWV0YToge1xuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgcmVxdWVzdElkOiByZXF1ZXN0LmhlYWRlcnNbJ3gtcmVxdWVzdC1pZCddIGFzIHN0cmluZyB8fCByZXF1ZXN0LmlkIGFzIHN0cmluZyxcbiAgICAgICAgcGF0aDogcmVxdWVzdC51cmwsXG4gICAgICAgIG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICByZXNwb25zZS5zdGF0dXMoc3RhdHVzKS5qc29uKGVycm9yUmVzcG9uc2UpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRFcnJvckNvZGUoc3RhdHVzOiBudW1iZXIpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIDQwMDpcbiAgICAgICAgcmV0dXJuICdCQURfUkVRVUVTVCc7XG4gICAgICBjYXNlIDQwMTpcbiAgICAgICAgcmV0dXJuICdVTkFVVEhPUklaRUQnO1xuICAgICAgY2FzZSA0MDM6XG4gICAgICAgIHJldHVybiAnRk9SQklEREVOJztcbiAgICAgIGNhc2UgNDA0OlxuICAgICAgICByZXR1cm4gJ05PVF9GT1VORCc7XG4gICAgICBjYXNlIDQwOTpcbiAgICAgICAgcmV0dXJuICdDT05GTElDVCc7XG4gICAgICBjYXNlIDQyMjpcbiAgICAgICAgcmV0dXJuICdWQUxJREFUSU9OX0VSUk9SJztcbiAgICAgIGNhc2UgNDI5OlxuICAgICAgICByZXR1cm4gJ1JBVEVfTElNSVRfRVhDRUVERUQnO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdIVFRQX0VSUk9SJztcbiAgICB9XG4gIH1cbn0iXX0=