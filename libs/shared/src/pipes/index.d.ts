import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class ValidationPipe implements PipeTransform {
    private readonly reflector;
    constructor(reflector: Reflector);
    transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown>;
    private toValidate;
}
export declare class ParseJsonPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): unknown;
}
export declare class ParseArrayPipe implements PipeTransform {
    private readonly separator;
    constructor(separator?: string);
    transform(value: string, metadata: ArgumentMetadata): string[];
}
export declare class ParseDatePipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): Date;
}
export declare class ParseBooleanPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): boolean;
}
export declare class ParseNumberPipe implements PipeTransform {
    transform(value: string, metadata: ArgumentMetadata): number;
}
export declare class TrimPipe implements PipeTransform {
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
    private trimObject;
}
export declare class SanitizePipe implements PipeTransform {
    private readonly xssPatterns;
    transform(value: unknown, metadata: ArgumentMetadata): unknown;
    private sanitizeString;
    private sanitizeObject;
}
export declare class FileValidationPipe implements PipeTransform {
    private readonly allowedMimeTypes;
    private readonly maxSize;
    constructor(allowedMimeTypes?: string[], maxSize?: number);
    transform(file: Express.Multer.File, metadata: ArgumentMetadata): Express.Multer.File;
}
export declare class IdempotencyPipe implements PipeTransform {
    transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown>;
}
