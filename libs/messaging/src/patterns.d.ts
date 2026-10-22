export declare const MessagePatterns: {
    readonly CMD: {
        readonly CREATE: "cmd.create";
        readonly UPDATE: "cmd.update";
        readonly DELETE: "cmd.delete";
        readonly GET: "cmd.get";
        readonly LIST: "cmd.list";
        readonly SEARCH: "cmd.search";
        readonly EXPORT: "cmd.export";
        readonly IMPORT: "cmd.import";
        readonly APPROVE: "cmd.approve";
        readonly REJECT: "cmd.reject";
        readonly ASSIGN: "cmd.assign";
        readonly UNASSIGN: "cmd.unassign";
        readonly STATUS_CHANGE: "cmd.status_change";
        readonly BULK_CREATE: "cmd.bulk_create";
        readonly BULK_UPDATE: "cmd.bulk_update";
        readonly BULK_DELETE: "cmd.bulk_delete";
    };
    readonly QUERY: {
        readonly GET: "query.get";
        readonly LIST: "query.list";
        readonly SEARCH: "query.search";
        readonly COUNT: "query.count";
        readonly AGGREGATE: "query.aggregate";
        readonly EXPORT: "query.export";
    };
    readonly EVENT: {
        readonly CREATED: "event.created";
        readonly UPDATED: "event.updated";
        readonly DELETED: "event.deleted";
        readonly STATUS_CHANGED: "event.status_changed";
        readonly ASSIGNED: "event.assigned";
        readonly COMPLETED: "event.completed";
    };
    readonly NOTIFICATION: {
        readonly SEND: "notification.send";
        readonly SEND_BULK: "notification.send_bulk";
        readonly MARK_READ: "notification.mark_read";
        readonly MARK_ALL_READ: "notification.mark_all_read";
    };
    readonly INTEGRATION: {
        readonly SYNC: "integration.sync";
        readonly SYNC_FULL: "integration.sync_full";
        readonly SYNC_INCREMENTAL: "integration.sync_incremental";
        readonly TEST_CONNECTION: "integration.test_connection";
    };
    readonly REPORT: {
        readonly GENERATE: "report.generate";
        readonly SCHEDULE: "report.schedule";
        readonly CANCEL_SCHEDULE: "report.cancel_schedule";
    };
    readonly FILE: {
        readonly UPLOAD: "file.upload";
        readonly DOWNLOAD: "file.download";
        readonly DELETE: "file.delete";
        readonly LIST: "file.list";
    };
    readonly AUDIT: {
        readonly LOG: "audit.log";
        readonly QUERY: "audit.query";
        readonly EXPORT: "audit.export";
    };
};
export declare const QueueNames: {
    readonly COMMANDS: "cf-erp.commands";
    readonly QUERIES: "cf-erp.queries";
    readonly EVENTS: "cf-erp.events";
    readonly NOTIFICATIONS: "cf-erp.notifications";
    readonly INTEGRATIONS: "cf-erp.integrations";
    readonly REPORTS: "cf-erp.reports";
    readonly FILES: "cf-erp.files";
    readonly AUDIT: "cf-erp.audit";
    readonly DEAD_LETTER: "cf-erp.dlq";
    readonly RETRY: "cf-erp.retry";
    readonly SCHEDULED: "cf-erp.scheduled";
};
export declare const ExchangeNames: {
    readonly COMMANDS: "cf-erp.commands";
    readonly QUERIES: "cf-erp.queries";
    readonly EVENTS: "cf-erp.events";
    readonly NOTIFICATIONS: "cf-erp.notifications";
    readonly INTEGRATIONS: "cf-erp.integrations";
    readonly DEAD_LETTER: "cf-erp.dlx";
};
export declare const RoutingKeys: {
    readonly USER: "user";
    readonly CUSTOMER: "customer";
    readonly SUPPLIER: "supplier";
    readonly QUOTATION: "quotation";
    readonly RATE: "rate";
    readonly JOB: "job";
    readonly SHIPMENT: "shipment";
    readonly BOOKING: "booking";
    readonly CONTAINER: "container";
    readonly DOCUMENT: "document";
    readonly CUSTOMS: "customs";
    readonly INVOICE: "invoice";
    readonly PAYMENT: "payment";
    readonly EXPENSE: "expense";
    readonly TASK: "task";
    readonly WORKFLOW: "workflow";
    readonly NOTIFICATION: "notification";
    readonly INTEGRATION: "integration";
    readonly REPORT: "report";
    readonly FILE: "file";
    readonly AUDIT: "audit";
    readonly SYSTEM: "system";
};
export declare function buildRoutingKey(domain: string, action: string): string;
export declare function buildQueueName(service: string, domain: string): string;
export declare function buildTopicName(domain: string): string;
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
export declare function createMessageEnvelope<T>(domain: string, action: string, payload: T, options?: {
    messageId?: string;
    correlationId?: string;
    causationId?: string;
    metadata?: Record<string, unknown>;
    headers?: Record<string, string>;
}): MessageEnvelope<T>;
export declare function parseMessageEnvelope<T>(message: unknown): MessageEnvelope<T> | null;
export declare const RetryPolicies: {
    readonly DEFAULT: {
        readonly maxRetries: 3;
        readonly initialInterval: 1000;
        readonly maxInterval: 30000;
        readonly multiplier: 2;
    };
    readonly FAST: {
        readonly maxRetries: 5;
        readonly initialInterval: 100;
        readonly maxInterval: 5000;
        readonly multiplier: 1.5;
    };
    readonly SLOW: {
        readonly maxRetries: 2;
        readonly initialInterval: 5000;
        readonly maxInterval: 60000;
        readonly multiplier: 2;
    };
    readonly CRITICAL: {
        readonly maxRetries: 10;
        readonly initialInterval: 1000;
        readonly maxInterval: 300000;
        readonly multiplier: 2;
    };
};
export type RetryPolicy = typeof RetryPolicies.DEFAULT;
