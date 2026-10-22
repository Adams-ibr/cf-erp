import { PaginatedResult, FilterOptions, DateRange, Money, Address, ContactInfo, BankDetails, DocumentReference, StatusHistory, NotificationPreferences, IntegrationConfig, ApiResponse, ApiError, WebhookPayload, HealthCheckResult } from '../types';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(options?: FilterOptions): Promise<PaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  count(filters?: Record<string, unknown>): Promise<number>;
  exists(id: string): Promise<boolean>;
}

export interface ITenantRepository<T> extends IRepository<T> {
  findByTenant(tenantId: string, options?: FilterOptions): Promise<PaginatedResult<T>>;
  findByTenantAndBranch(tenantId: string, branchId: string, options?: FilterOptions): Promise<PaginatedResult<T>>;
}

export interface IAuditableRepository<T> extends ITenantRepository<T> {
  getHistory(id: string): Promise<StatusHistory[]>;
  getVersion(id: string, version: number): Promise<T | null>;
}

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
  publishBatch(events: DomainEvent[]): Promise<void>;
}

export interface IEventSubscriber {
  subscribe(eventType: string, handler: EventHandler): Promise<void>;
  unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
}

export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  branchId?: string;
  userId?: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  version: number;
}

export type EventHandler = (event: DomainEvent) => Promise<void>;

export interface ICommandHandler<T extends ICommand> {
  execute(command: T): Promise<CommandResult>;
}

export interface ICommand {
  commandId: string;
  commandType: string;
  aggregateId: string;
  tenantId: string;
  branchId?: string;
  userId?: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface CommandResult {
  success: boolean;
  aggregateId?: string;
  events?: DomainEvent[];
  error?: string;
}

export interface IQueryHandler<T extends IQuery, R> {
  execute(query: T): Promise<R>;
}

export interface IQuery {
  queryId: string;
  queryType: string;
  tenantId: string;
  branchId?: string;
  userId?: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface IUnitOfWork {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  getRepository<T>(entity: new () => T): IRepository<T>;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  deletePattern(pattern: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  increment(key: string, ttl?: number): Promise<number>;
  decrement(key: string, ttl?: number): Promise<number>;
}

export interface IFileStorageService {
  upload(file: FileUploadInput): Promise<FileUploadResult>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  list(prefix: string): Promise<FileListItem[]>;
  copy(sourceKey: string, destinationKey: string): Promise<void>;
  move(sourceKey: string, destinationKey: string): Promise<void>;
}

export interface FileUploadInput {
  buffer: Buffer;
  key: string;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface FileUploadResult {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  etag: string;
}

export interface FileListItem {
  key: string;
  size: number;
  lastModified: Date;
  mimeType: string;
  metadata?: Record<string, string>;
}

export interface IEmailService {
  send(email: EmailInput): Promise<EmailResult>;
  sendBulk(emails: EmailInput[]): Promise<EmailResult[]>;
  sendTemplate(templateId: string, to: string | string[], data: Record<string, unknown>): Promise<EmailResult>;
}

export interface EmailInput {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

export interface EmailResult {
  messageId: string;
  accepted: string[];
  rejected: string[];
  response: string;
}

export interface ISmsService {
  send(sms: SmsInput): Promise<SmsResult>;
  sendBulk(smsList: SmsInput[]): Promise<SmsResult[]>;
}

export interface SmsInput {
  to: string | string[];
  body: string;
  from?: string;
}

export interface SmsResult {
  messageId: string;
  status: string;
  to: string;
}

export interface IPushNotificationService {
  send(push: PushNotificationInput): Promise<PushNotificationResult>;
  sendToTopic(topic: string, push: PushNotificationInput): Promise<PushNotificationResult>;
  subscribe(token: string, topic: string): Promise<void>;
  unsubscribe(token: string, topic: string): Promise<void>;
}

export interface PushNotificationInput {
  title: string;
  body: string;
  data?: Record<string, string>;
  tokens?: string[];
  topic?: string;
  imageUrl?: string;
  actions?: PushAction[];
}

export interface PushAction {
  identifier: string;
  title: string;
  icon?: string;
}

export interface PushNotificationResult {
  successCount: number;
  failureCount: number;
  responses: PushNotificationResponse[];
}

export interface PushNotificationResponse {
  token: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWebhookService {
  register(webhook: WebhookRegistration): Promise<WebhookRegistration>;
  unregister(id: string): Promise<void>;
  deliver(webhookId: string, payload: WebhookPayload): Promise<WebhookDeliveryResult>;
  retryDelivery(deliveryId: string): Promise<WebhookDeliveryResult>;
}

export interface WebhookRegistration {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  response?: string;
  error?: string;
  timestamp: Date;
}

export interface IReportService {
  generate(report: ReportRequest): Promise<ReportResult>;
  schedule(report: ScheduledReport): Promise<ScheduledReport>;
  getScheduledReports(): Promise<ScheduledReport[]>;
  cancelScheduledReport(id: string): Promise<void>;
}

export interface ReportRequest {
  reportId: string;
  parameters: Record<string, unknown>;
  format: 'pdf' | 'excel' | 'csv' | 'html';
  filters?: Record<string, unknown>;
  dateRange?: DateRange;
}

export interface ReportResult {
  reportId: string;
  format: string;
  url: string;
  generatedAt: Date;
  expiresAt: Date;
  size: number;
}

export interface ScheduledReport {
  id: string;
  reportId: string;
  name: string;
  cronExpression: string;
  parameters: Record<string, unknown>;
  format: string;
  recipients: string[];
  active: boolean;
  lastRunAt?: Date;
  nextRunAt?: Date;
}

export interface IIntegrationService {
  connect(config: IntegrationConfig): Promise<IntegrationConnection>;
  disconnect(connectionId: string): Promise<void>;
  sync(connectionId: string): Promise<SyncResult>;
  getStatus(connectionId: string): Promise<ConnectionStatus>;
  testConnection(config: IntegrationConfig): Promise<ConnectionTestResult>;
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  status: ConnectionStatus;
  connectedAt: Date;
  lastSyncAt?: Date;
  config: IntegrationConfig;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors: SyncError[];
  startedAt: Date;
  completedAt: Date;
}

export interface SyncError {
  recordId?: string;
  field?: string;
  message: string;
  code: string;
}

export interface ConnectionTestResult {
  success: boolean;
  latency: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface INotificationService {
  send(notification: NotificationInput): Promise<NotificationResult>;
  sendBulk(notifications: NotificationInput[]): Promise<NotificationResult[]>;
  getPreferences(userId: string): Promise<NotificationPreferences>;
  updatePreferences(userId: string, preferences: NotificationPreferences): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

export interface NotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  channels?: string[];
  data?: Record<string, unknown>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expiresAt?: Date;
}

export interface NotificationResult {
  id: string;
  userId: string;
  sent: boolean;
  channels: NotificationChannelResult[];
}

export interface NotificationChannelResult {
  channel: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ISearchService {
  index(index: string, documents: SearchDocument[]): Promise<void>;
  search(index: string, query: SearchQuery): Promise<SearchResult>;
  delete(index: string, ids: string[]): Promise<void>;
  update(index: string, documents: SearchDocument[]): Promise<void>;
  createIndex(index: string, mapping: SearchMapping): Promise<void>;
  deleteIndex(index: string): Promise<void>;
}

export interface SearchDocument {
  id: string;
  tenantId: string;
  type: string;
  fields: Record<string, unknown>;
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, unknown>;
  facets?: string[];
  sort?: Record<string, 'asc' | 'desc'>;
  page: number;
  limit: number;
  highlight?: string[];
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  facets?: Record<string, FacetResult>;
  took: number;
  page: number;
  limit: number;
}

export interface SearchHit {
  id: string;
  type: string;
  score: number;
  fields: Record<string, unknown>;
  highlights?: Record<string, string[]>;
}

export interface FacetResult {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface SearchMapping {
  properties: Record<string, SearchFieldMapping>;
}

export interface SearchFieldMapping {
  type: 'text' | 'keyword' | 'number' | 'date' | 'boolean' | 'nested';
  analyzer?: string;
  fields?: Record<string, SearchFieldMapping>;
}

export interface IAuditService {
  log(audit: AuditLogInput): Promise<void>;
  query(query: AuditQuery): Promise<PaginatedResult<AuditLog>>;
  export(query: AuditQuery): Promise<Buffer>;
}

export interface AuditLogInput {
  tenantId: string;
  branchId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  branchId?: string;
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: Date;
}

export interface AuditQuery {
  tenantId: string;
  branchId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  dateRange?: DateRange;
  page: number;
  limit: number;
}

export interface ISettingsService {
  get<T>(key: string, defaultValue?: T): Promise<T>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  getAll(prefix?: string): Promise<Record<string, unknown>>;
  setAll(settings: Record<string, unknown>): Promise<void>;
}

export interface ILocalizationService {
  translate(key: string, locale: string, params?: Record<string, unknown>): string;
  getSupportedLocales(): string[];
  getDefaultLocale(): string;
  setDefaultLocale(locale: string): void;
}

export interface IRateLimitingService {
  checkLimit(key: string, limit: number, windowMs: number): Promise<RateLimitInfo>;
  increment(key: string, windowMs: number): Promise<RateLimitInfo>;
  reset(key: string): Promise<void>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface IHealthCheckService {
  registerCheck(name: string, check: HealthCheckFunction): void;
  unregisterCheck(name: string): void;
  runChecks(): Promise<HealthCheckResult>;
}

export type HealthCheckFunction = () => Promise<HealthCheck>;

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}