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
exports.BranchSettingsDto = exports.TenantSettingsDto = exports.ApiKeyDto = exports.WebhookRegistrationDto = exports.ImportOptionsDto = exports.ExportOptionsDto = exports.BulkActionDto = exports.IntegrationConfigDto = exports.NotificationPreferencesDto = exports.StatusHistoryDto = exports.DocumentReferenceDto = exports.MoneyDto = exports.BankDetailsDto = exports.ContactInfoDto = exports.GeoCoordinatesDto = exports.AddressDto = exports.DateRangeDto = exports.PaginationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
class PaginationDto {
    page = 1;
    limit = 20;
    sortBy;
    sortOrder;
    search;
}
exports.PaginationDto = PaginationDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PaginationDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], PaginationDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['ASC', 'DESC'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['ASC', 'DESC']),
    __metadata("design:type", String)
], PaginationDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaginationDto.prototype, "search", void 0);
class DateRangeDto {
    startDate;
    endDate;
}
exports.DateRangeDto = DateRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DateRangeDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DateRangeDto.prototype, "endDate", void 0);
class AddressDto {
    line1;
    line2;
    city;
    state;
    postalCode;
    country;
    coordinates;
}
exports.AddressDto = AddressDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "line1", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "line2", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddressDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => GeoCoordinatesDto),
    __metadata("design:type", GeoCoordinatesDto)
], AddressDto.prototype, "coordinates", void 0);
class GeoCoordinatesDto {
    latitude;
    longitude;
}
exports.GeoCoordinatesDto = GeoCoordinatesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeoCoordinatesDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], GeoCoordinatesDto.prototype, "longitude", void 0);
class ContactInfoDto {
    email;
    phone;
    mobile;
    fax;
    website;
}
exports.ContactInfoDto = ContactInfoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "mobile", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "fax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "website", void 0);
class BankDetailsDto {
    bankName;
    accountName;
    accountNumber;
    iban;
    swiftBic;
    routingNumber;
    branchName;
    branchAddress;
    currency;
}
exports.BankDetailsDto = BankDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "bankName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "iban", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "swiftBic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "routingNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "branchName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], BankDetailsDto.prototype, "branchAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "currency", void 0);
class MoneyDto {
    amount;
    currency;
}
exports.MoneyDto = MoneyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], MoneyDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], MoneyDto.prototype, "currency", void 0);
class DocumentReferenceDto {
    id;
    type;
    name;
    url;
    mimeType;
    size;
    uploadedAt;
    uploadedBy;
    metadata;
}
exports.DocumentReferenceDto = DocumentReferenceDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DocumentReferenceDto.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], DocumentReferenceDto.prototype, "uploadedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], DocumentReferenceDto.prototype, "uploadedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], DocumentReferenceDto.prototype, "metadata", void 0);
class StatusHistoryDto {
    status;
    changedAt;
    changedBy;
    reason;
    metadata;
}
exports.StatusHistoryDto = StatusHistoryDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StatusHistoryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], StatusHistoryDto.prototype, "changedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StatusHistoryDto.prototype, "changedBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StatusHistoryDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], StatusHistoryDto.prototype, "metadata", void 0);
class NotificationPreferencesDto {
    email;
    sms;
    push;
    inApp;
    events;
}
exports.NotificationPreferencesDto = NotificationPreferencesDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "sms", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "push", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], NotificationPreferencesDto.prototype, "inApp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], NotificationPreferencesDto.prototype, "events", void 0);
class IntegrationConfigDto {
    provider;
    enabled;
    credentials;
    endpoints;
    webhookUrl;
    syncFrequency;
    lastSyncAt;
    metadata;
}
exports.IntegrationConfigDto = IntegrationConfigDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IntegrationConfigDto.prototype, "provider", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], IntegrationConfigDto.prototype, "enabled", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], IntegrationConfigDto.prototype, "credentials", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], IntegrationConfigDto.prototype, "endpoints", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], IntegrationConfigDto.prototype, "webhookUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IntegrationConfigDto.prototype, "syncFrequency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], IntegrationConfigDto.prototype, "lastSyncAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], IntegrationConfigDto.prototype, "metadata", void 0);
class BulkActionDto {
    ids;
    action;
    metadata;
}
exports.BulkActionDto = BulkActionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], BulkActionDto.prototype, "ids", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkActionDto.prototype, "action", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BulkActionDto.prototype, "metadata", void 0);
class ExportOptionsDto {
    format;
    fields;
    filters;
}
exports.ExportOptionsDto = ExportOptionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['csv', 'excel', 'pdf'] }),
    (0, class_validator_1.IsEnum)(['csv', 'excel', 'pdf']),
    __metadata("design:type", String)
], ExportOptionsDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ExportOptionsDto.prototype, "fields", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ExportOptionsDto.prototype, "filters", void 0);
class ImportOptionsDto {
    format;
    fileUrl;
    updateExisting;
    skipErrors;
}
exports.ImportOptionsDto = ImportOptionsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['csv', 'excel'] }),
    (0, class_validator_1.IsEnum)(['csv', 'excel']),
    __metadata("design:type", String)
], ImportOptionsDto.prototype, "format", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportOptionsDto.prototype, "fileUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImportOptionsDto.prototype, "updateExisting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ImportOptionsDto.prototype, "skipErrors", void 0);
class WebhookRegistrationDto {
    url;
    events;
    secret;
    active;
}
exports.WebhookRegistrationDto = WebhookRegistrationDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], WebhookRegistrationDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], WebhookRegistrationDto.prototype, "events", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookRegistrationDto.prototype, "secret", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WebhookRegistrationDto.prototype, "active", void 0);
class ApiKeyDto {
    name;
    permissions;
    expiresAt;
    allowedIps;
}
exports.ApiKeyDto = ApiKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ApiKeyDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ApiKeyDto.prototype, "permissions", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], ApiKeyDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ApiKeyDto.prototype, "allowedIps", void 0);
class TenantSettingsDto {
    name;
    logo;
    timezone;
    locale;
    dateFormat;
    currency;
    address;
    contact;
    settings;
}
exports.TenantSettingsDto = TenantSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "logo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "timezone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "locale", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "dateFormat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TenantSettingsDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], TenantSettingsDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContactInfoDto),
    __metadata("design:type", ContactInfoDto)
], TenantSettingsDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TenantSettingsDto.prototype, "settings", void 0);
class BranchSettingsDto {
    name;
    code;
    address;
    contact;
    managerId;
    isActive;
    settings;
}
exports.BranchSettingsDto = BranchSettingsDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BranchSettingsDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BranchSettingsDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => AddressDto),
    __metadata("design:type", AddressDto)
], BranchSettingsDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ContactInfoDto),
    __metadata("design:type", ContactInfoDto)
], BranchSettingsDto.prototype, "contact", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BranchSettingsDto.prototype, "managerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], BranchSettingsDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BranchSettingsDto.prototype, "settings", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxxREFBdUo7QUFDdkoseURBQXlDO0FBQ3pDLDZDQUFtRTtBQUVuRSxNQUFhLGFBQWE7SUFNeEIsSUFBSSxHQUFZLENBQUMsQ0FBQztJQVFsQixLQUFLLEdBQVksRUFBRSxDQUFDO0lBS3BCLE1BQU0sQ0FBVTtJQUtoQixTQUFTLENBQWtCO0lBSzNCLE1BQU0sQ0FBVTtDQUNqQjtBQTlCRCxzQ0E4QkM7QUF4QkM7SUFMQyxJQUFBLDZCQUFtQixFQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ25DLElBQUEsNEJBQVUsR0FBRTtJQUNaLElBQUEsd0JBQUksRUFBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDbEIsSUFBQSwwQkFBUSxHQUFFO0lBQ1YsSUFBQSxxQkFBRyxFQUFDLENBQUMsQ0FBQzs7MkNBQ1c7QUFRbEI7SUFOQyxJQUFBLDZCQUFtQixFQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ3BDLElBQUEsNEJBQVUsR0FBRTtJQUNaLElBQUEsd0JBQUksRUFBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDbEIsSUFBQSwwQkFBUSxHQUFFO0lBQ1YsSUFBQSxxQkFBRyxFQUFDLENBQUMsQ0FBQztJQUNOLElBQUEscUJBQUcsRUFBQyxHQUFHLENBQUM7OzRDQUNXO0FBS3BCO0lBSEMsSUFBQSw2QkFBbUIsR0FBRTtJQUNyQixJQUFBLDRCQUFVLEdBQUU7SUFDWixJQUFBLDBCQUFRLEdBQUU7OzZDQUNLO0FBS2hCO0lBSEMsSUFBQSw2QkFBbUIsRUFBQyxFQUFFLElBQUksRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO0lBQzlDLElBQUEsNEJBQVUsR0FBRTtJQUNaLElBQUEsd0JBQU0sRUFBQyxDQUFDLEtBQUssRUFBRSxNQUFN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RTtJQUNyQixJQUFBLDRCQUFVLEdBQUU7SUFDWixJQUFBLDJCQUFTLEdBQUU7O21EQUNPO0FBSW5CO0lBRkMsSUFBQSw2QkFBbUIsR0FBRTtJQUNyQixJQUFBLDRCQUFVLEdBQUU7O21EQUNzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElzU3RyaW5nLCBJc09wdGlvbmFsLCBJc051bWJlciwgSXNEYXRlLCBJc0VudW0sIElzQm9vbGVhbiwgSXNBcnJheSwgVmFsaWRhdGVOZXN0ZWQsIElzVVVJRCwgTWluLCBNYXgsIElzRW1haWwsIElzVXJsIH0gZnJvbSAnY2xhc3MtdmFsaWRhdG9yJztcbmltcG9ydCB7IFR5cGUgfSBmcm9tICdjbGFzcy10cmFuc2Zvcm1lcic7XG5pbXBvcnQgeyBBcGlQcm9wZXJ0eSwgQXBpUHJvcGVydHlPcHRpb25hbCB9IGZyb20gJ0BuZXN0anMvc3dhZ2dlcic7XG5cbmV4cG9ydCBjbGFzcyBQYWdpbmF0aW9uRHRvIHtcbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoeyBkZWZhdWx0OiAxIH0pXG4gIEBJc09wdGlvbmFsKClcbiAgQFR5cGUoKCkgPT4gTnVtYmVyKVxuICBASXNOdW1iZXIoKVxuICBATWluKDEpXG4gIHBhZ2U/OiBudW1iZXIgPSAxO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKHsgZGVmYXVsdDogMjAgfSlcbiAgQElzT3B0aW9uYWwoKVxuICBAVHlwZSgoKSA9PiBOdW1iZXIpXG4gIEBJc051bWJlcigpXG4gIEBNaW4oMSlcbiAgQE1heCgxMDApXG4gIGxpbWl0PzogbnVtYmVyID0gMjA7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIHNvcnRCeT86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCh7IGVudW06IFsnQVNDJywgJ0RFU0MnXSB9KVxuICBASXNPcHRpb25hbCgpXG4gIEBJc0VudW0oWydBU0MnLCAnREVTQyddKVxuICBzb3J0T3JkZXI/OiAnQVNDJyB8ICdERVNDJztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgc2VhcmNoPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgRGF0ZVJhbmdlRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgQFR5cGUoKCkgPT4gRGF0ZSlcbiAgQElzRGF0ZSgpXG4gIHN0YXJ0RGF0ZTogRGF0ZTtcblxuICBAQXBpUHJvcGVydHkoKVxuICBAVHlwZSgoKSA9PiBEYXRlKVxuICBASXNEYXRlKClcbiAgZW5kRGF0ZTogRGF0ZTtcbn1cblxuZXhwb3J0IGNsYXNzIEFkZHJlc3NEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBsaW5lMTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNTdHJpbmcoKVxuICBsaW5lMj86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBjaXR5OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIHN0YXRlPzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIHBvc3RhbENvZGU6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBjb3VudHJ5OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBWYWxpZGF0ZU5lc3RlZCgpXG4gIEBUeXBlKCgpID0+IEdlb0Nvb3JkaW5hdGVzRHRvKVxuICBjb29yZGluYXRlcz86IEdlb0Nvb3JkaW5hdGVzRHRvO1xufVxuXG5leHBvcnQgY2xhc3MgR2VvQ29vcmRpbmF0ZXNEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBASXNOdW1iZXIoKVxuICBsYXRpdHVkZTogbnVtYmVyO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc051bWJlcigpXG4gIGxvbmdpdHVkZTogbnVtYmVyO1xufVxuXG5leHBvcnQgY2xhc3MgQ29udGFjdEluZm9EdG8ge1xuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzRW1haWwoKVxuICBlbWFpbD86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgcGhvbmU/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIG1vYmlsZT86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgZmF4Pzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNVcmwoKVxuICB3ZWJzaXRlPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQmFua0RldGFpbHNEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBiYW5rTmFtZTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIGFjY291bnROYW1lOiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgYWNjb3VudE51bWJlcjogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNTdHJpbmcoKVxuICBpYmFuPzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNTdHJpbmcoKVxuICBzd2lmdEJpYz86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgcm91dGluZ051bWJlcj86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgYnJhbmNoTmFtZT86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQFZhbGlkYXRlTmVzdGVkKClcbiAgQFR5cGUoKCkgPT4gQWRkcmVzc0R0bylcbiAgYnJhbmNoQWRkcmVzcz86IEFkZHJlc3NEdG87XG5cbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgY3VycmVuY3k6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIE1vbmV5RHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgQElzTnVtYmVyKClcbiAgYW1vdW50OiBudW1iZXI7XG5cbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgY3VycmVuY3k6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIERvY3VtZW50UmVmZXJlbmNlRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgQElzVVVJRCgpXG4gIGlkOiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgdHlwZTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIG5hbWU6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNVcmwoKVxuICB1cmw6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBtaW1lVHlwZTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc051bWJlcigpXG4gIHNpemU6IG51bWJlcjtcblxuICBAQXBpUHJvcGVydHkoKVxuICBAVHlwZSgoKSA9PiBEYXRlKVxuICBASXNEYXRlKClcbiAgdXBsb2FkZWRBdDogRGF0ZTtcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNVVUlEKClcbiAgdXBsb2FkZWRCeTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgU3RhdHVzSGlzdG9yeUR0byB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIHN0YXR1czogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBUeXBlKCgpID0+IERhdGUpXG4gIEBJc0RhdGUoKVxuICBjaGFuZ2VkQXQ6IERhdGU7XG5cbiAgQEFwaVByb3BlcnR5KClcbiAgQElzVVVJRCgpXG4gIGNoYW5nZWRCeTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNTdHJpbmcoKVxuICByZWFzb24/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIG1ldGFkYXRhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBjbGFzcyBOb3RpZmljYXRpb25QcmVmZXJlbmNlc0R0byB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc0Jvb2xlYW4oKVxuICBlbWFpbDogYm9vbGVhbjtcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNCb29sZWFuKClcbiAgc21zOiBib29sZWFuO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc0Jvb2xlYW4oKVxuICBwdXNoOiBib29sZWFuO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc0Jvb2xlYW4oKVxuICBpbkFwcDogYm9vbGVhbjtcblxuICBAQXBpUHJvcGVydHkoeyB0eXBlOiBbU3RyaW5nXSB9KVxuICBASXNBcnJheSgpXG4gIEBJc1N0cmluZyh7IGVhY2g6IHRydWUgfSlcbiAgZXZlbnRzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGNsYXNzIEludGVncmF0aW9uQ29uZmlnRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgcHJvdmlkZXI6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNCb29sZWFuKClcbiAgZW5hYmxlZDogYm9vbGVhbjtcblxuICBAQXBpUHJvcGVydHkoKVxuICBjcmVkZW50aWFsczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICBAQXBpUHJvcGVydHkoKVxuICBlbmRwb2ludHM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1VybCgpXG4gIHdlYmhvb2tVcmw/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBUeXBlKCgpID0+IE51bWJlcilcbiAgQElzTnVtYmVyKClcbiAgc3luY0ZyZXF1ZW5jeT86IG51bWJlcjtcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQFR5cGUoKCkgPT4gRGF0ZSlcbiAgQElzRGF0ZSgpXG4gIGxhc3RTeW5jQXQ/OiBEYXRlO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgQnVsa0FjdGlvbkR0byB7XG4gIEBBcGlQcm9wZXJ0eSh7IHR5cGU6IFtTdHJpbmddIH0pXG4gIEBJc0FycmF5KClcbiAgQElzVVVJRCgnNCcsIHsgZWFjaDogdHJ1ZSB9KVxuICBpZHM6IHN0cmluZ1tdO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIGFjdGlvbjogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBtZXRhZGF0YT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgRXhwb3J0T3B0aW9uc0R0byB7XG4gIEBBcGlQcm9wZXJ0eSh7IGVudW06IFsnY3N2JywgJ2V4Y2VsJywgJ3BkZiddIH0pXG4gIEBJc0VudW0oWydjc3YnLCAnZXhjZWwnLCAncGRmJ10pXG4gIGZvcm1hdDogJ2NzdicgfCAnZXhjZWwnIHwgJ3BkZic7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoeyB0eXBlOiBbU3RyaW5nXSB9KVxuICBASXNPcHRpb25hbCgpXG4gIEBJc0FycmF5KClcbiAgQElzU3RyaW5nKHsgZWFjaDogdHJ1ZSB9KVxuICBmaWVsZHM/OiBzdHJpbmdbXTtcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgZmlsdGVycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG5leHBvcnQgY2xhc3MgSW1wb3J0T3B0aW9uc0R0byB7XG4gIEBBcGlQcm9wZXJ0eSh7IGVudW06IFsnY3N2JywgJ2V4Y2VsJ10gfSlcbiAgQElzRW51bShbJ2NzdicsICdleGNlbCddKVxuICBmb3JtYXQ6ICdjc3YnIHwgJ2V4Y2VsJztcblxuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBmaWxlVXJsOiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc0Jvb2xlYW4oKVxuICB1cGRhdGVFeGlzdGluZz86IGJvb2xlYW47XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc0Jvb2xlYW4oKVxuICBza2lwRXJyb3JzPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIFdlYmhvb2tSZWdpc3RyYXRpb25EdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBASXNVcmwoKVxuICB1cmw6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHkoeyB0eXBlOiBbU3RyaW5nXSB9KVxuICBASXNBcnJheSgpXG4gIEBJc1N0cmluZyh7IGVhY2g6IHRydWUgfSlcbiAgZXZlbnRzOiBzdHJpbmdbXTtcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzU3RyaW5nKClcbiAgc2VjcmV0Pzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNCb29sZWFuKClcbiAgYWN0aXZlPzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGNsYXNzIEFwaUtleUR0byB7XG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIG5hbWU6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzQXJyYXkoKVxuICBASXNTdHJpbmcoeyBlYWNoOiB0cnVlIH0pXG4gIHBlcm1pc3Npb25zPzogc3RyaW5nW107XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBUeXBlKCgpID0+IERhdGUpXG4gIEBJc0RhdGUoKVxuICBleHBpcmVzQXQ/OiBEYXRlO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNBcnJheSgpXG4gIEBJc1N0cmluZyh7IGVhY2g6IHRydWUgfSlcbiAgYWxsb3dlZElwcz86IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgY2xhc3MgVGVuYW50U2V0dGluZ3NEdG8ge1xuICBAQXBpUHJvcGVydHkoKVxuICBASXNTdHJpbmcoKVxuICBuYW1lOiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIGxvZ28/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIHRpbWV6b25lPzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBASXNTdHJpbmcoKVxuICBsb2NhbGU/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIGRhdGVGb3JtYXQ/OiBzdHJpbmc7XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIGN1cnJlbmN5Pzogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eU9wdGlvbmFsKClcbiAgQElzT3B0aW9uYWwoKVxuICBAVmFsaWRhdGVOZXN0ZWQoKVxuICBAVHlwZSgoKSA9PiBBZGRyZXNzRHRvKVxuICBhZGRyZXNzPzogQWRkcmVzc0R0bztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQFZhbGlkYXRlTmVzdGVkKClcbiAgQFR5cGUoKCkgPT4gQ29udGFjdEluZm9EdG8pXG4gIGNvbnRhY3Q/OiBDb250YWN0SW5mb0R0bztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgc2V0dGluZ3M/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGNsYXNzIEJyYW5jaFNldHRpbmdzRHRvIHtcbiAgQEFwaVByb3BlcnR5KClcbiAgQElzU3RyaW5nKClcbiAgbmFtZTogc3RyaW5nO1xuXG4gIEBBcGlQcm9wZXJ0eSgpXG4gIEBJc1N0cmluZygpXG4gIGNvZGU6IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQFZhbGlkYXRlTmVzdGVkKClcbiAgQFR5cGUoKCkgPT4gQWRkcmVzc0R0bylcbiAgYWRkcmVzcz86IEFkZHJlc3NEdG87XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBWYWxpZGF0ZU5lc3RlZCgpXG4gIEBUeXBlKCgpID0+IENvbnRhY3RJbmZvRHRvKVxuICBjb250YWN0PzogQ29udGFjdEluZm9EdG87XG5cbiAgQEFwaVByb3BlcnR5T3B0aW9uYWwoKVxuICBASXNPcHRpb25hbCgpXG4gIEBJc1N0cmluZygpXG4gIG1hbmFnZXJJZD86IHN0cmluZztcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgQElzQm9vbGVhbigpXG4gIGlzQWN0aXZlPzogYm9vbGVhbjtcblxuICBAQXBpUHJvcGVydHlPcHRpb25hbCgpXG4gIEBJc09wdGlvbmFsKClcbiAgc2V0dGluZ3M/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbn0iXX0=