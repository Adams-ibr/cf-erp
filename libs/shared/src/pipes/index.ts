import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Reflector } from '@nestjs/core';
import { VALIDATION_GROUPS_KEY } from '../decorators';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly reflector: Reflector) {}

  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
      return value;
    }

    const groups = this.reflector.getAllAndOverride<string[]>(VALIDATION_GROUPS_KEY, [
      metadata.type === 'body' ? metadata.metatype : null,
    ]);

    const object = plainToInstance(metadata.metatype, value, {
      enableImplicitConversion: true,
      excludeExtraneousValues: true,
      groups,
    });

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
      groups,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap(error =>
        Object.values(error.constraints || {}).map(constraint => ({
          field: error.property,
          message: constraint,
          value: error.value,
        })),
      );

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }

  private toValidate(metatype: new (...args: unknown[]) => unknown): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

@Injectable()
export class ParseJsonPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): unknown {
    if (!value) return value;
    try {
      return JSON.parse(value);
    } catch {
      throw new BadRequestException(`Invalid JSON in ${metadata.data}`);
    }
  }
}

@Injectable()
export class ParseArrayPipe implements PipeTransform {
  constructor(private readonly separator = ',') {}

  transform(value: string, metadata: ArgumentMetadata): string[] {
    if (!value) return [];
    return value.split(this.separator).map(item => item.trim()).filter(Boolean);
  }
}

@Injectable()
export class ParseDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): Date {
    if (!value) return value;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid date in ${metadata.data}`);
    }
    return date;
  }
}

@Injectable()
export class ParseBooleanPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): boolean {
    if (value === undefined || value === null) return value;
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1' || value === 'yes') return true;
    if (value === 'false' || value === '0' || value === 'no') return false;
    throw new BadRequestException(`Invalid boolean in ${metadata.data}`);
  }
}

@Injectable()
export class ParseNumberPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): number {
    if (value === undefined || value === null) return value;
    const num = Number(value);
    if (isNaN(num)) {
      throw new BadRequestException(`Invalid number in ${metadata.data}`);
    }
    return num;
  }
}

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'object' && value !== null) {
      return this.trimObject(value);
    }
    return value;
  }

  private trimObject(obj: Record<string, unknown>): Record<string, unknown> {
    const trimmed: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        trimmed[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        trimmed[key] = this.trimObject(value as Record<string, unknown>);
      } else {
        trimmed[key] = value;
      }
    }
    return trimmed;
  }
}

@Injectable()
export class SanitizePipe implements PipeTransform {
  private readonly xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (typeof value === 'string') {
      return this.sanitizeString(value);
    }
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeObject(value);
    }
    return value;
  }

  private sanitizeString(str: string): string {
    let sanitized = str;
    for (const pattern of this.xssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized;
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedMimeTypes: string[] = [],
    private readonly maxSize: number = 10 * 1024 * 1024, // 10MB
  ) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} not allowed`);
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxSize} bytes`);
    }

    return file;
  }
}

@Injectable()
export class IdempotencyPipe implements PipeTransform {
  // private readonly cacheService: ICacheService;

  // constructor(cacheService: ICacheService) {
  //   this.cacheService = cacheService;
  // }

  async transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown> {
    const request = metadata.type === 'body' ? metadata.metatype : null;
    // Idempotency key would be extracted from headers
    // const idempotencyKey = request?.headers['idempotency-key'];
    // if (idempotencyKey) {
    //   const cached = await this.cacheService.get(`idempotency:${idempotencyKey}`);
    //   if (cached) {
    //     return cached;
    //   }
    // }
    return value;
  }
}