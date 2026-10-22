import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
    const error = exception instanceof Error ? exception.message : 'Unknown error';

    const errorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(status),
        message: typeof message === 'string' ? message : (message as Record<string, unknown>).message || error,
        details: exception instanceof HttpException ? (message as Record<string, unknown>) : undefined,
        stack: process.env.NODE_ENV === 'development' && exception instanceof Error ? exception.stack : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] as string || request.id as string,
        path: request.url,
        method: request.method,
      },
    };

    this.logger.error(`${request.method} ${request.url} ${status}`, exception instanceof Error ? exception.stack : error);

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
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
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const responseBody = exception.getResponse();

    const errorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(status),
        message: typeof responseBody === 'string' ? responseBody : (responseBody as Record<string, unknown>).message || exception.message,
        details: typeof responseBody === 'object' ? responseBody : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: request.headers['x-request-id'] as string || request.id as string,
        path: request.url,
        method: request.method,
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
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
}