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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdempotencyPipe = exports.FileValidationPipe = exports.SanitizePipe = exports.TrimPipe = exports.ParseNumberPipe = exports.ParseBooleanPipe = exports.ParseDatePipe = exports.ParseArrayPipe = exports.ParseJsonPipe = exports.ValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const core_1 = require("@nestjs/core");
const decorators_1 = require("../decorators");
let ValidationPipe = class ValidationPipe {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    async transform(value, metadata) {
        if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
            return value;
        }
        const groups = this.reflector.getAllAndOverride(decorators_1.VALIDATION_GROUPS_KEY, [
            metadata.type === 'body' ? metadata.metatype : null,
        ]);
        const object = (0, class_transformer_1.plainToInstance)(metadata.metatype, value, {
            enableImplicitConversion: true,
            excludeExtraneousValues: true,
            groups,
        });
        const errors = await (0, class_validator_1.validate)(object, {
            whitelist: true,
            forbidNonWhitelisted: true,
            validationError: { target: false },
            groups,
        });
        if (errors.length > 0) {
            const messages = errors.flatMap(error => Object.values(error.constraints || {}).map(constraint => ({
                field: error.property,
                message: constraint,
                value: error.value,
            })));
            throw new common_1.BadRequestException({
                message: 'Validation failed',
                errors: messages,
            });
        }
        return object;
    }
    toValidate(metatype) {
        const types = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }
};
exports.ValidationPipe = ValidationPipe;
exports.ValidationPipe = ValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], ValidationPipe);
let ParseJsonPipe = class ParseJsonPipe {
    transform(value, metadata) {
        if (!value)
            return value;
        try {
            return JSON.parse(value);
        }
        catch {
            throw new common_1.BadRequestException(`Invalid JSON in ${metadata.data}`);
        }
    }
};
exports.ParseJsonPipe = ParseJsonPipe;
exports.ParseJsonPipe = ParseJsonPipe = __decorate([
    (0, common_1.Injectable)()
], ParseJsonPipe);
let ParseArrayPipe = class ParseArrayPipe {
    separator;
    constructor(separator = ',') {
        this.separator = separator;
    }
    transform(value, metadata) {
        if (!value)
            return [];
        return value.split(this.separator).map(item => item.trim()).filter(Boolean);
    }
};
exports.ParseArrayPipe = ParseArrayPipe;
exports.ParseArrayPipe = ParseArrayPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], ParseArrayPipe);
let ParseDatePipe = class ParseDatePipe {
    transform(value, metadata) {
        if (!value)
            return value;
        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new common_1.BadRequestException(`Invalid date in ${metadata.data}`);
        }
        return date;
    }
};
exports.ParseDatePipe = ParseDatePipe;
exports.ParseDatePipe = ParseDatePipe = __decorate([
    (0, common_1.Injectable)()
], ParseDatePipe);
let ParseBooleanPipe = class ParseBooleanPipe {
    transform(value, metadata) {
        if (value === undefined || value === null)
            return value;
        if (typeof value === 'boolean')
            return value;
        if (value === 'true' || value === '1' || value === 'yes')
            return true;
        if (value === 'false' || value === '0' || value === 'no')
            return false;
        throw new common_1.BadRequestException(`Invalid boolean in ${metadata.data}`);
    }
};
exports.ParseBooleanPipe = ParseBooleanPipe;
exports.ParseBooleanPipe = ParseBooleanPipe = __decorate([
    (0, common_1.Injectable)()
], ParseBooleanPipe);
let ParseNumberPipe = class ParseNumberPipe {
    transform(value, metadata) {
        if (value === undefined || value === null)
            return value;
        const num = Number(value);
        if (isNaN(num)) {
            throw new common_1.BadRequestException(`Invalid number in ${metadata.data}`);
        }
        return num;
    }
};
exports.ParseNumberPipe = ParseNumberPipe;
exports.ParseNumberPipe = ParseNumberPipe = __decorate([
    (0, common_1.Injectable)()
], ParseNumberPipe);
let TrimPipe = class TrimPipe {
    transform(value, metadata) {
        if (typeof value === 'string') {
            return value.trim();
        }
        if (typeof value === 'object' && value !== null) {
            return this.trimObject(value);
        }
        return value;
    }
    trimObject(obj) {
        const trimmed = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                trimmed[key] = value.trim();
            }
            else if (typeof value === 'object' && value !== null) {
                trimmed[key] = this.trimObject(value);
            }
            else {
                trimmed[key] = value;
            }
        }
        return trimmed;
    }
};
exports.TrimPipe = TrimPipe;
exports.TrimPipe = TrimPipe = __decorate([
    (0, common_1.Injectable)()
], TrimPipe);
let SanitizePipe = class SanitizePipe {
    xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
    ];
    transform(value, metadata) {
        if (typeof value === 'string') {
            return this.sanitizeString(value);
        }
        if (typeof value === 'object' && value !== null) {
            return this.sanitizeObject(value);
        }
        return value;
    }
    sanitizeString(str) {
        let sanitized = str;
        for (const pattern of this.xssPatterns) {
            sanitized = sanitized.replace(pattern, '');
        }
        return sanitized;
    }
    sanitizeObject(obj) {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                sanitized[key] = this.sanitizeString(value);
            }
            else if (typeof value === 'object' && value !== null) {
                sanitized[key] = this.sanitizeObject(value);
            }
            else {
                sanitized[key] = value;
            }
        }
        return sanitized;
    }
};
exports.SanitizePipe = SanitizePipe;
exports.SanitizePipe = SanitizePipe = __decorate([
    (0, common_1.Injectable)()
], SanitizePipe);
let FileValidationPipe = class FileValidationPipe {
    allowedMimeTypes;
    maxSize;
    constructor(allowedMimeTypes = [], maxSize = 10 * 1024 * 1024) {
        this.allowedMimeTypes = allowedMimeTypes;
        this.maxSize = maxSize;
    }
    transform(file, metadata) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (this.allowedMimeTypes.length > 0 && !this.allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`File type ${file.mimetype} not allowed`);
        }
        if (file.size > this.maxSize) {
            throw new common_1.BadRequestException(`File size exceeds maximum allowed size of ${this.maxSize} bytes`);
        }
        return file;
    }
};
exports.FileValidationPipe = FileValidationPipe;
exports.FileValidationPipe = FileValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Array, Number])
], FileValidationPipe);
let IdempotencyPipe = class IdempotencyPipe {
    // private readonly cacheService: ICacheService;
    // constructor(cacheService: ICacheService) {
    //   this.cacheService = cacheService;
    // }
    async transform(value, metadata) {
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
};
exports.IdempotencyPipe = IdempotencyPipe;
exports.IdempotencyPipe = IdempotencyPipe = __decorate([
    (0, common_1.Injectable)()
], IdempotencyPipe);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSwyQ0FBa0c7QUFDbEcscURBQTJDO0FBQzNDLHlEQUFvRDtBQUNwRCx1Q0FBeUM7QUFDekMsOENBQXNEO0FBRy9DLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7SUFDSTtJQUE3QixZQUE2QixTQUFvQjtRQUFwQixjQUFTLEdBQVQsU0FBUyxDQUFXO0lBQUcsQ0FBQztJQUVyRCxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQWMsRUFBRSxRQUEwQjtRQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDOUQsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBVyxrQ0FBcUIsRUFBRTtZQUMvRSxRQUFRLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtTQUNwRCxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFBLG1DQUFlLEVBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUU7WUFDdkQsd0JBQXdCLEVBQUUsSUFBSTtZQUM5Qix1QkFBdUIsRUFBRSxJQUFJO1lBQzdCLE1BQU07U0FDUCxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsMEJBQVEsRUFBQyxNQUFNLEVBQUU7WUFDcEMsU0FBUyxFQUFFLElBQUk7WUFDZixvQkFBb0IsRUFBRSxJQUFJO1lBQzFCLGVBQWUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUU7WUFDbEMsTUFBTTtTQUNQLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxD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OUIsSUFBQSxtQkFBVSxHQUFFOztHQUNBLGtCQUFrQixDQXFCOUI7QUFHTSxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO0lBQzFCLGdEQUFnRDtJQUVoRCw2Q0FBNkM7SUFDN0Msc0NBQXNDO0lBQ3RDLElBQUk7SUFFSixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQWMsRUFBRSxRQUEwQjtRQUN4RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ3BFLGtEQUFrRDtRQUNsRCw4REFBOEQ7UUFDOUQsd0JBQXdCO1FBQ3hCLGlGQUFpRjtRQUNqRixrQkFBa0I7UUFDbEIscUJBQXFCO1FBQ3JCLE1BQU07UUFDTixJQUFJO1FBQ0osT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0YsQ0FBQTtBQW5CWSwwQ0FBZTswQkFBZixlQUFlO0lBRDNCLElBQUEsbUJBQVUsR0FBRTtHQUNBLGVBQWUsQ0FtQjNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZVRyYW5zZm9ybSwgSW5qZWN0YWJsZSwgQXJndW1lbnRNZXRhZGF0YSwgQmFkUmVxdWVzdEV4Y2VwdGlvbiB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcbmltcG9ydCB7IHZhbGlkYXRlIH0gZnJvbSAnY2xhc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IHBsYWluVG9JbnN0YW5jZSB9IGZyb20gJ2NsYXNzLXRyYW5zZm9ybWVyJztcbmltcG9ydCB7IFJlZmxlY3RvciB9IGZyb20gJ0BuZXN0anMvY29yZSc7XG5pbXBvcnQgeyBWQUxJREFUSU9OX0dST1VQU19LRVkgfSBmcm9tICcuLi9kZWNvcmF0b3JzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFZhbGlkYXRpb25QaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgcmVhZG9ubHkgcmVmbGVjdG9yOiBSZWZsZWN0b3IpIHt9XG5cbiAgYXN5bmMgdHJhbnNmb3JtKHZhbHVlOiB1bmtub3duLCBtZXRhZGF0YTogQXJndW1lbnRNZXRhZGF0YSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgIGlmICghbWV0YWRhdGEubWV0YXR5cGUgfHwgIXRoaXMudG9WYWxpZGF0ZShtZXRhZGF0YS5tZXRhdHlwZSkpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBncm91cHMgPSB0aGlzLnJlZmxlY3Rvci5nZXRBbGxBbmRPdmVycmlkZTxzdHJpbmdbXT4oVkFMSURBVElPTl9HUk9VUFNfS0VZLCBbXG4gICAgICBtZXRhZGF0YS50eXBlID09PSAnYm9keScgPyBtZXRhZGF0YS5tZXRhdHlwZSA6IG51bGwsXG4gICAgXSk7XG5cbiAgICBjb25zdCBvYmplY3QgPSBwbGFpblRvSW5zdGFuY2UobWV0YWRhdGEubWV0YXR5cGUsIHZhbHVlLCB7XG4gICAgICBlbmFibGVJbXBsaWNpdENvbnZlcnNpb246IHRydWUsXG4gICAgICBleGNsdWRlRXh0cmFuZW91c1ZhbHVlczogdHJ1ZSxcbiAgICAgIGdyb3VwcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGVycm9ycyA9IGF3YWl0IHZhbGlkYXRlKG9iamVjdCwge1xuICAgICAgd2hpdGVsaXN0OiB0cnVlLFxuICAgICAgZm9yYmlkTm9uV2hpdGVsaXN0ZWQ6IHRydWUsXG4gICAgICB2YWxpZGF0aW9uRXJyb3I6IHsgdGFyZ2V0OiBmYWxzZSB9LFxuICAgICAgZ3JvdXBzLFxuICAgIH0pO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBtZXNzYWdlcyA9IGVycm9ycy5mbGF0TWFwKGVycm9yID0+XG4gICAgICAgIE9iamVjdC52YWx1ZXMoZXJyb3IuY29uc3RyYWludHMgfHwge30pLm1hcChjb25zdHJhaW50ID0+ICh7XG4gICAgICAgICAgZmllbGQ6IGVycm9yLnByb3BlcnR5LFxuICAgICAgICAgIG1lc3NhZ2U6IGNvbnN0cmFpbnQsXG4gICAgICAgICAgdmFsdWU6IGVycm9yLnZhbHVlLFxuICAgICAgICB9KSksXG4gICAgICApO1xuXG4gICAgICB0aHJvdyBuZXcgQmFkUmVxdWVzdEV4Y2VwdGlvbih7XG4gICAgICAgIG1lc3NhZ2U6ICdWYWxpZGF0aW9uIGZhaWxlZCcsXG4gICAgICAgIGVycm9yczogbWVzc2FnZXMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9XG5cbiAgcHJpdmF0ZSB0b1ZhbGlkYXRlKG1ldGF0eXBlOiBuZXcgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdW5rbm93bik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHR5cGVzID0gW1N0cmluZywgQm9vbGVhbiwgTnVtYmVyLCBBcnJheSwgT2JqZWN0XTtcbiAgICByZXR1cm4gIXR5cGVzLmluY2x1ZGVzKG1ldGF0eXBlKTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGFyc2VKc29uUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgbWV0YWRhdGE6IEFyZ3VtZW50TWV0YWRhdGEpOiB1bmtub3duIHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gdmFsdWU7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRocm93IG5ldyBCYWRSZXF1ZXN0RXhjZXB0aW9uKGBJbnZhbGlkIEpTT04gaW4gJHttZXRhZGF0YS5kYXRhfWApO1xuICAgIH1cbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUGFyc2VBcnJheVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSByZWFkb25seSBzZXBhcmF0b3IgPSAnLCcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcsIG1ldGFkYXRhOiBBcmd1bWVudE1ldGFkYXRhKTogc3RyaW5nW10ge1xuICAgIGlmICghdmFsdWUpIHJldHVybiBbXTtcbiAgICByZXR1cm4gdmFsdWUuc3BsaXQodGhpcy5zZXBhcmF0b3IpLm1hcChpdGVtID0+IGl0ZW0udHJpbSgpKS5maWx0ZXIoQm9vbGVhbik7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhcnNlRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiBzdHJpbmcsIG1ldGFkYXRhOiBBcmd1bWVudE1ldGFkYXRhKTogRGF0ZSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIHZhbHVlO1xuICAgIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkge1xuICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oYEludmFsaWQgZGF0ZSBpbiAke21ldGFkYXRhLmRhdGF9YCk7XG4gICAgfVxuICAgIHJldHVybiBkYXRlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXJzZUJvb2xlYW5QaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIHRyYW5zZm9ybSh2YWx1ZTogc3RyaW5nLCBtZXRhZGF0YTogQXJndW1lbnRNZXRhZGF0YSk6IGJvb2xlYW4ge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gdmFsdWU7XG4gICAgaWYgKHZhbHVlID09PSAndHJ1ZScgfHwgdmFsdWUgPT09ICcxJyB8fCB2YWx1ZSA9PT0gJ3llcycpIHJldHVybiB0cnVlO1xuICAgIGlmICh2YWx1ZSA9PT0gJ2ZhbHNlJyB8fCB2YWx1ZSA9PT0gJzAnIHx8IHZhbHVlID09PSAnbm8nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oYEludmFsaWQgYm9vbGVhbiBpbiAke21ldGFkYXRhLmRhdGF9YCk7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFBhcnNlTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICB0cmFuc2Zvcm0odmFsdWU6IHN0cmluZywgbWV0YWRhdGE6IEFyZ3VtZW50TWV0YWRhdGEpOiBudW1iZXIge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSByZXR1cm4gdmFsdWU7XG4gICAgY29uc3QgbnVtID0gTnVtYmVyKHZhbHVlKTtcbiAgICBpZiAoaXNOYU4obnVtKSkge1xuICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oYEludmFsaWQgbnVtYmVyIGluICR7bWV0YWRhdGEuZGF0YX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bTtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgVHJpbVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgdHJhbnNmb3JtKHZhbHVlOiB1bmtub3duLCBtZXRhZGF0YTogQXJndW1lbnRNZXRhZGF0YSk6IHVua25vd24ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdmFsdWUudHJpbSgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMudHJpbU9iamVjdCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgdHJpbU9iamVjdChvYmo6IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICAgIGNvbnN0IHRyaW1tZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdHJpbW1lZFtrZXldID0gdmFsdWUudHJpbSgpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgIHRyaW1tZWRba2V5XSA9IHRoaXMudHJpbU9iamVjdCh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0cmltbWVkW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRyaW1tZWQ7XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFNhbml0aXplUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBwcml2YXRlIHJlYWRvbmx5IHhzc1BhdHRlcm5zID0gW1xuICAgIC88c2NyaXB0XFxiW148XSooPzooPyE8XFwvc2NyaXB0Pik8W148XSopKjxcXC9zY3JpcHQ+L2dpLFxuICAgIC88aWZyYW1lXFxiW148XSooPzooPyE8XFwvaWZyYW1lPik8W148XSopKjxcXC9pZnJhbWU+L2dpLFxuICAgIC9qYXZhc2NyaXB0Oi9naSxcbiAgICAvb25cXHcrXFxzKj0vZ2ksXG4gIF07XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiB1bmtub3duLCBtZXRhZGF0YTogQXJndW1lbnRNZXRhZGF0YSk6IHVua25vd24ge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZVN0cmluZyh2YWx1ZSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5zYW5pdGl6ZU9iamVjdCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuXG4gIHByaXZhdGUgc2FuaXRpemVTdHJpbmcoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGxldCBzYW5pdGl6ZWQgPSBzdHI7XG4gICAgZm9yIChjb25zdCBwYXR0ZXJuIG9mIHRoaXMueHNzUGF0dGVybnMpIHtcbiAgICAgIHNhbml0aXplZCA9IHNhbml0aXplZC5yZXBsYWNlKHBhdHRlcm4sICcnKTtcbiAgICB9XG4gICAgcmV0dXJuIHNhbml0aXplZDtcbiAgfVxuXG4gIHByaXZhdGUgc2FuaXRpemVPYmplY3Qob2JqOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICBjb25zdCBzYW5pdGl6ZWQ6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0ge307XG4gICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMob2JqKSkge1xuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgc2FuaXRpemVkW2tleV0gPSB0aGlzLnNhbml0aXplU3RyaW5nKHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICBzYW5pdGl6ZWRba2V5XSA9IHRoaXMuc2FuaXRpemVPYmplY3QodmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2FuaXRpemVkW2tleV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNhbml0aXplZDtcbiAgfVxufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmlsZVZhbGlkYXRpb25QaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgcmVhZG9ubHkgYWxsb3dlZE1pbWVUeXBlczogc3RyaW5nW10gPSBbXSxcbiAgICBwcml2YXRlIHJlYWRvbmx5IG1heFNpemU6IG51bWJlciA9IDEwICogMTAyNCAqIDEwMjQsIC8vIDEwTUJcbiAgKSB7fVxuXG4gIHRyYW5zZm9ybShmaWxlOiBFeHByZXNzLk11bHRlci5GaWxlLCBtZXRhZGF0YTogQXJndW1lbnRNZXRhZGF0YSk6IEV4cHJlc3MuTXVsdGVyLkZpbGUge1xuICAgIGlmICghZmlsZSkge1xuICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oJ05vIGZpbGUgcHJvdmlkZWQnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hbGxvd2VkTWltZVR5cGVzLmxlbmd0aCA+IDAgJiYgIXRoaXMuYWxsb3dlZE1pbWVUeXBlcy5pbmNsdWRlcyhmaWxlLm1pbWV0eXBlKSkge1xuICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oYEZpbGUgdHlwZSAke2ZpbGUubWltZXR5cGV9IG5vdCBhbGxvd2VkYCk7XG4gICAgfVxuXG4gICAgaWYgKGZpbGUuc2l6ZSA+IHRoaXMubWF4U2l6ZSkge1xuICAgICAgdGhyb3cgbmV3IEJhZFJlcXVlc3RFeGNlcHRpb24oYEZpbGUgc2l6ZSBleGNlZWRzIG1heGltdW0gYWxsb3dlZCBzaXplIG9mICR7dGhpcy5tYXhTaXplfSBieXRlc2ApO1xuICAgIH1cblxuICAgIHJldHVybiBmaWxlO1xuICB9XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJZGVtcG90ZW5jeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgLy8gcHJpdmF0ZSByZWFkb25seSBjYWNoZVNlcnZpY2U6IElDYWNoZVNlcnZpY2U7XG5cbiAgLy8gY29uc3RydWN0b3IoY2FjaGVTZXJ2aWNlOiBJQ2FjaGVTZXJ2aWNlKSB7XG4gIC8vICAgdGhpcy5jYWNoZVNlcnZpY2UgPSBjYWNoZVNlcnZpY2U7XG4gIC8vIH1cblxuICBhc3luYyB0cmFuc2Zvcm0odmFsdWU6IHVua25vd24sIG1ldGFkYXRhOiBBcmd1bWVudE1ldGFkYXRhKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgcmVxdWVzdCA9IG1ldGFkYXRhLnR5cGUgPT09ICdib2R5JyA/IG1ldGFkYXRhLm1ldGF0eXBlIDogbnVsbDtcbiAgICAvLyBJZGVtcG90ZW5jeSBrZXkgd291bGQgYmUgZXh0cmFjdGVkIGZyb20gaGVhZGVyc1xuICAgIC8vIGNvbnN0IGlkZW1wb3RlbmN5S2V5ID0gcmVxdWVzdD8uaGVhZGVyc1snaWRlbXBvdGVuY3kta2V5J107XG4gICAgLy8gaWYgKGlkZW1wb3RlbmN5S2V5KSB7XG4gICAgLy8gICBjb25zdCBjYWNoZWQgPSBhd2FpdCB0aGlzLmNhY2hlU2VydmljZS5nZXQoYGlkZW1wb3RlbmN5OiR7aWRlbXBvdGVuY3lLZXl9YCk7XG4gICAgLy8gICBpZiAoY2FjaGVkKSB7XG4gICAgLy8gICAgIHJldHVybiBjYWNoZWQ7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxufSJdfQ==