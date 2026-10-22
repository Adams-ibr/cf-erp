export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface TenantEntity extends BaseEntity {
  tenantId: string;
  branchId?: string;
}

export interface AuditableEntity extends TenantEntity {
  version: number;
  lastModifiedBy: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  filters?: Record<string, unknown>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export type CurrencyCode = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'INR' | 'AED' | 'SAR' 
  | 'SGD' | 'HKD' | 'AUD' | 'CAD' | 'CHF' | 'SEK' | 'NOK' | 'DKK'
  | 'ZAR' | 'BRL' | 'MXN' | 'KRW' | 'THB' | 'MYR' | 'IDR' | 'PHP'
  | 'VND' | 'TRY' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK'
  | string;

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: CountryCode;
  coordinates?: GeoCoordinates;
}

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type CountryCode = 
  | 'US' | 'CN' | 'DE' | 'JP' | 'GB' | 'FR' | 'IN' | 'IT' | 'BR' | 'CA'
  | 'KR' | 'RU' | 'AU' | 'ES' | 'MX' | 'ID' | 'NL' | 'SA' | 'TR' | 'CH'
  | 'TW' | 'PL' | 'BE' | 'SE' | 'IE' | 'AT' | 'NO' | 'AE' | 'SG' | 'HK'
  | 'MY' | 'TH' | 'VN' | 'PH' | 'ZA' | 'EG' | 'NG' | 'KE' | 'MA' | 'GH'
  | string;

export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  preferredContactMethod?: 'email' | 'phone' | 'mobile' | 'fax';
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban?: string;
  swiftBic?: string;
  routingNumber?: string;
  branchName?: string;
  branchAddress?: Address;
  currency: CurrencyCode;
}

export interface DocumentReference {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  metadata?: Record<string, unknown>;
}

export type DocumentType = 
  | 'invoice' | 'packing_list' | 'bill_of_lading' | 'airway_bill'
  | 'commercial_invoice' | 'certificate_of_origin' | 'insurance_certificate'
  | 'customs_declaration' | 'import_license' | 'export_license'
  | 'dangerous_goods_declaration' | 'msds' | 'phytosanitary_certificate'
  | 'fumigation_certificate' | 'weight_certificate' | 'inspection_certificate'
  | 'purchase_order' | 'sales_contract' | 'letter_of_credit'
  | 'bank_guarantee' | 'delivery_order' | 'gate_pass' | 'other';

export interface StatusHistory<T = string> {
  status: T;
  changedAt: Date;
  changedBy: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  events: NotificationEvent[];
}

export type NotificationEvent = 
  | 'shipment_created' | 'shipment_updated' | 'shipment_delivered'
  | 'customs_cleared' | 'customs_hold' | 'document_received'
  | 'document_required' | 'payment_due' | 'payment_received'
  | 'invoice_generated' | 'quote_requested' | 'quote_approved'
  | 'rate_updated' | 'container_arrived' | 'container_departed'
  | 'demurrage_warning' | 'detention_warning' | 'storage_warning'
  | 'task_assigned' | 'task_completed' | 'task_overdue'
  | 'system_alert' | 'maintenance_window';

export interface IntegrationConfig {
  provider: string;
  enabled: boolean;
  credentials: Record<string, string>;
  endpoints: Record<string, string>;
  webhookUrl?: string;
  syncFrequency?: number;
  lastSyncAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ResponseMeta {
  timestamp: Date;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WebhookPayload<T = unknown> {
  event: string;
  timestamp: Date;
  tenantId: string;
  data: T;
  signature: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;
  checks: HealthCheck[];
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration: number;
  metadata?: Record<string, unknown>;
}