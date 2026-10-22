export declare class PaginationDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    search?: string;
}
export declare class DateRangeDto {
    startDate: Date;
    endDate: Date;
}
export declare class AddressDto {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    coordinates?: GeoCoordinatesDto;
}
export declare class GeoCoordinatesDto {
    latitude: number;
    longitude: number;
}
export declare class ContactInfoDto {
    email?: string;
    phone?: string;
    mobile?: string;
    fax?: string;
    website?: string;
}
export declare class BankDetailsDto {
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban?: string;
    swiftBic?: string;
    routingNumber?: string;
    branchName?: string;
    branchAddress?: AddressDto;
    currency: string;
}
export declare class MoneyDto {
    amount: number;
    currency: string;
}
export declare class DocumentReferenceDto {
    id: string;
    type: string;
    name: string;
    url: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    uploadedBy: string;
    metadata?: Record<string, unknown>;
}
export declare class StatusHistoryDto {
    status: string;
    changedAt: Date;
    changedBy: string;
    reason?: string;
    metadata?: Record<string, unknown>;
}
export declare class NotificationPreferencesDto {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
    events: string[];
}
export declare class IntegrationConfigDto {
    provider: string;
    enabled: boolean;
    credentials: Record<string, string>;
    endpoints: Record<string, string>;
    webhookUrl?: string;
    syncFrequency?: number;
    lastSyncAt?: Date;
    metadata?: Record<string, unknown>;
}
export declare class BulkActionDto {
    ids: string[];
    action: string;
    metadata?: Record<string, unknown>;
}
export declare class ExportOptionsDto {
    format: 'csv' | 'excel' | 'pdf';
    fields?: string[];
    filters?: Record<string, unknown>;
}
export declare class ImportOptionsDto {
    format: 'csv' | 'excel';
    fileUrl: string;
    updateExisting?: boolean;
    skipErrors?: boolean;
}
export declare class WebhookRegistrationDto {
    url: string;
    events: string[];
    secret?: string;
    active?: boolean;
}
export declare class ApiKeyDto {
    name: string;
    permissions?: string[];
    expiresAt?: Date;
    allowedIps?: string[];
}
export declare class TenantSettingsDto {
    name: string;
    logo?: string;
    timezone?: string;
    locale?: string;
    dateFormat?: string;
    currency?: string;
    address?: AddressDto;
    contact?: ContactInfoDto;
    settings?: Record<string, unknown>;
}
export declare class BranchSettingsDto {
    name: string;
    code: string;
    address?: AddressDto;
    contact?: ContactInfoDto;
    managerId?: string;
    isActive?: boolean;
    settings?: Record<string, unknown>;
}
