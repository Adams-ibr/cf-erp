export const MessagePatterns = {
  CMD: {
    CREATE: 'cmd.create',
    UPDATE: 'cmd.update',
    DELETE: 'cmd.delete',
    GET: 'cmd.get',
    LIST: 'cmd.list',
    SEARCH: 'cmd.search',
    EXPORT: 'cmd.export',
    IMPORT: 'cmd.import',
    APPROVE: 'cmd.approve',
    REJECT: 'cmd.reject',
    ASSIGN: 'cmd.assign',
    UNASSIGN: 'cmd.unassign',
    STATUS_CHANGE: 'cmd.status_change',
    BULK_CREATE: 'cmd.bulk_create',
    BULK_UPDATE: 'cmd.bulk_update',
    BULK_DELETE: 'cmd.bulk_delete',
  },
  QUERY: {
    GET: 'query.get',
    LIST: 'query.list',
    SEARCH: 'query.search',
    COUNT: 'query.count',
    AGGREGATE: 'query.aggregate',
    EXPORT: 'query.export',
  },
  EVENT: {
    CREATED: 'event.created',
    UPDATED: 'event.updated',
    DELETED: 'event.deleted',
    STATUS_CHANGED: 'event.status_changed',
    ASSIGNED: 'event.assigned',
    COMPLETED: 'event.completed',
  },
  NOTIFICATION: {
    SEND: 'notification.send',
    SEND_BULK: 'notification.send_bulk',
    MARK_READ: 'notification.mark_read',
    MARK_ALL_READ: 'notification.mark_all_read',
  },
  INTEGRATION: {
    SYNC: 'integration.sync',
    SYNC_FULL: 'integration.sync_full',
    SYNC_INCREMENTAL: 'integration.sync_incremental',
    TEST_CONNECTION: 'integration.test_connection',
  },
  REPORT: {
    GENERATE: 'report.generate',
    SCHEDULE: 'report.schedule',
    CANCEL_SCHEDULE: 'report.cancel_schedule',
  },
  FILE: {
    UPLOAD: 'file.upload',
    DOWNLOAD: 'file.download',
    DELETE: 'file.delete',
    LIST: 'file.list',
  },
  AUDIT: {
    LOG: 'audit.log',
    QUERY: 'audit.query',
    EXPORT: 'audit.export',
  },
} as const;

export const QueueNames = {
  COMMANDS: 'cf-erp.commands',
  QUERIES: 'cf-erp.queries',
  EVENTS: 'cf-erp.events',
  NOTIFICATIONS: 'cf-erp.notifications',
  INTEGRATIONS: 'cf-erp.integrations',
  REPORTS: 'cf-erp.reports',
  FILES: 'cf-erp.files',
  AUDIT: 'cf-erp.audit',
  DEAD_LETTER: 'cf-erp.dlq',
  RETRY: 'cf-erp.retry',
  SCHEDULED: 'cf-erp.scheduled',
} as const;

export const ExchangeNames = {
  COMMANDS: 'cf-erp.commands',
  QUERIES: 'cf-erp.queries',
  EVENTS: 'cf-erp.events',
  NOTIFICATIONS: 'cf-erp.notifications',
  INTEGRATIONS: 'cf-erp.integrations',
  DEAD_LETTER: 'cf-erp.dlx',
} as const;

export const RoutingKeys = {
  USER: 'user',
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
  QUOTATION: 'quotation',
  RATE: 'rate',
  JOB: 'job',
  SHIPMENT: 'shipment',
  BOOKING: 'booking',
  CONTAINER: 'container',
  DOCUMENT: 'document',
  CUSTOMS: 'customs',
  INVOICE: 'invoice',
  PAYMENT: 'payment',
  EXPENSE: 'expense',
  TASK: 'task',
  WORKFLOW: 'workflow',
  NOTIFICATION: 'notification',
  INTEGRATION: 'integration',
  REPORT: 'report',
  FILE: 'file',
  AUDIT: 'audit',
  SYSTEM: 'system',
} as const;

export function buildRoutingKey(domain: string, action: string): string {
  return `${domain}.${action}`.toLowerCase();
}

export function buildQueueName(service: string, domain: string): string {
  return `cf-erp.${service}.${domain}`;
}

export function buildTopicName(domain: string): string {
  return `cf-erp.${domain}`;
}

export interface MessageEnvelope<T = unknown> {
  messageId: string;
  correlationId?: string;
  causationId?: string;
  timestamp: Date;
  type: string;
  domain: string;
  action: string;
  payload: T;
  metadata?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export function createMessageEnvelope<T>(
  domain: string,
  action: string,
  payload: T,
  options: {
    messageId?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: Record<string, unknown>;
    headers?: Record<string, string>;
  } = {},
): MessageEnvelope<T> {
  return {
    messageId: options.messageId || crypto.randomUUID(),
    correlationId: options.correlationId,
    causationId: options.causationId,
    timestamp: new Date(),
    type: `${domain}.${action}`,
    domain,
    action,
    payload,
    metadata: options.metadata,
    headers: options.headers,
  };
}

export function parseMessageEnvelope<T>(message: unknown): MessageEnvelope<T> | null {
  try {
    return message as MessageEnvelope<T>;
  } catch {
    return null;
  }
}

export const RetryPolicies = {
  DEFAULT: {
    maxRetries: 3,
    initialInterval: 1000,
    maxInterval: 30000,
    multiplier: 2,
  },
  FAST: {
    maxRetries: 5,
    initialInterval: 100,
    maxInterval: 5000,
    multiplier: 1.5,
  },
  SLOW: {
    maxRetries: 2,
    initialInterval: 5000,
    maxInterval: 60000,
    multiplier: 2,
  },
  CRITICAL: {
    maxRetries: 10,
    initialInterval: 1000,
    maxInterval: 300000,
    multiplier: 2,
  },
} as const;

export type RetryPolicy = typeof RetryPolicies.DEFAULT;