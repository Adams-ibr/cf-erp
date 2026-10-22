import { DomainEvent } from '@cf-erp/shared';
export interface EventMetadata {
    correlationId?: string;
    causationId?: string;
    traceId?: string;
    spanId?: string;
}
export declare abstract class BaseDomainEvent implements DomainEvent {
    readonly eventId: string;
    readonly eventType: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly tenantId: string;
    readonly branchId?: string;
    readonly userId?: string;
    readonly timestamp: Date;
    readonly payload: Record<string, unknown>;
    readonly metadata?: Record<string, unknown>;
    readonly version: number;
    constructor(eventType: string, aggregateId: string, aggregateType: string, tenantId: string, payload: Record<string, unknown>, options?: {
        eventId?: string;
        branchId?: string;
        userId?: string;
        metadata?: Record<string, unknown>;
        version?: number;
    });
}
export declare function createEvent<T extends Record<string, unknown>>(eventType: string, aggregateId: string, aggregateType: string, tenantId: string, payload: T, options?: {
    eventId?: string;
    branchId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    version?: number;
}): DomainEvent;
export declare const EventTypes: {
    readonly USER: {
        readonly CREATED: "user.created";
        readonly UPDATED: "user.updated";
        readonly DELETED: "user.deleted";
        readonly ROLE_CHANGED: "user.role_changed";
        readonly PASSWORD_CHANGED: "user.password_changed";
    };
    readonly CUSTOMER: {
        readonly CREATED: "customer.created";
        readonly UPDATED: "customer.updated";
        readonly DELETED: "customer.deleted";
        readonly STATUS_CHANGED: "customer.status_changed";
    };
    readonly SUPPLIER: {
        readonly CREATED: "supplier.created";
        readonly UPDATED: "supplier.updated";
        readonly DELETED: "supplier.deleted";
    };
    readonly QUOTATION: {
        readonly CREATED: "quotation.created";
        readonly UPDATED: "quotation.updated";
        readonly SENT: "quotation.sent";
        readonly ACCEPTED: "quotation.accepted";
        readonly REJECTED: "quotation.rejected";
        readonly EXPIRED: "quotation.expired";
        readonly CONVERTED: "quotation.converted";
    };
    readonly RATE: {
        readonly CREATED: "rate.created";
        readonly UPDATED: "rate.updated";
        readonly DELETED: "rate.deleted";
        readonly EXPIRED: "rate.expired";
    };
    readonly JOB: {
        readonly CREATED: "job.created";
        readonly UPDATED: "job.updated";
        readonly DELETED: "job.deleted";
        readonly STATUS_CHANGED: "job.status_changed";
        readonly ASSIGNED: "job.assigned";
        readonly COMPLETED: "job.completed";
    };
    readonly SHIPMENT: {
        readonly CREATED: "shipment.created";
        readonly UPDATED: "shipment.updated";
        readonly DELETED: "shipment.deleted";
        readonly STATUS_CHANGED: "shipment.status_changed";
        readonly BOOKED: "shipment.booked";
        readonly LOADED: "shipment.loaded";
        readonly IN_TRANSIT: "shipment.in_transit";
        readonly ARRIVED: "shipment.arrived";
        readonly DELIVERED: "shipment.delivered";
        readonly COMPLETED: "shipment.completed";
        readonly CANCELLED: "shipment.cancelled";
    };
    readonly BOOKING: {
        readonly CREATED: "booking.created";
        readonly UPDATED: "booking.updated";
        readonly CONFIRMED: "booking.confirmed";
        readonly CANCELLED: "booking.cancelled";
        readonly AMENDED: "booking.amended";
    };
    readonly CONTAINER: {
        readonly CREATED: "container.created";
        readonly UPDATED: "container.updated";
        readonly STATUS_CHANGED: "container.status_changed";
        readonly PICKED_UP: "container.picked_up";
        readonly RETURNED: "container.returned";
        readonly DAMAGED: "container.damaged";
    };
    readonly DOCUMENT: {
        readonly CREATED: "document.created";
        readonly UPDATED: "document.updated";
        readonly DELETED: "document.deleted";
        readonly UPLOADED: "document.uploaded";
        readonly APPROVED: "document.approved";
        readonly REJECTED: "document.rejected";
    };
    readonly CUSTOMS: {
        readonly DECLARATION_CREATED: "customs.declaration_created";
        readonly DECLARATION_SUBMITTED: "customs.declaration_submitted";
        readonly CLEARED: "customs.cleared";
        readonly HOLD: "customs.hold";
        readonly EXAMINATION: "customs.examination";
        readonly RELEASED: "customs.released";
    };
    readonly INVOICE: {
        readonly CREATED: "invoice.created";
        readonly UPDATED: "invoice.updated";
        readonly SENT: "invoice.sent";
        readonly PAID: "invoice.paid";
        readonly OVERDUE: "invoice.overdue";
        readonly CANCELLED: "invoice.cancelled";
    };
    readonly PAYMENT: {
        readonly CREATED: "payment.created";
        readonly PROCESSING: "payment.processing";
        readonly COMPLETED: "payment.completed";
        readonly FAILED: "payment.failed";
        readonly REFUNDED: "payment.refunded";
    };
    readonly EXPENSE: {
        readonly CREATED: "expense.created";
        readonly APPROVED: "expense.approved";
        readonly REJECTED: "expense.rejected";
        readonly PAID: "expense.paid";
    };
    readonly TASK: {
        readonly CREATED: "task.created";
        readonly UPDATED: "task.updated";
        readonly ASSIGNED: "task.assigned";
        readonly COMPLETED: "task.completed";
        readonly OVERDUE: "task.overdue";
    };
    readonly WORKFLOW: {
        readonly STARTED: "workflow.started";
        readonly COMPLETED: "workflow.completed";
        readonly PAUSED: "workflow.paused";
        readonly FAILED: "workflow.failed";
    };
    readonly NOTIFICATION: {
        readonly SENT: "notification.sent";
        readonly DELIVERED: "notification.delivered";
        readonly FAILED: "notification.failed";
        readonly READ: "notification.read";
    };
    readonly INTEGRATION: {
        readonly SYNC_STARTED: "integration.sync_started";
        readonly SYNC_COMPLETED: "integration.sync_completed";
        readonly SYNC_FAILED: "integration.sync_failed";
    };
    readonly AUDIT: {
        readonly LOGGED: "audit.logged";
    };
};
export type EventType = typeof EventTypes[keyof typeof EventTypes][keyof typeof EventTypes[keyof typeof EventTypes]];
export interface EventHandlerContext {
    event: DomainEvent;
    retryCount: number;
    maxRetries: number;
}
export type AsyncEventHandler = (context: EventHandlerContext) => Promise<void>;
export declare class EventBus {
    private handlers;
    subscribe(eventType: string, handler: AsyncEventHandler): void;
    unsubscribe(eventType: string, handler: AsyncEventHandler): void;
    publish(event: DomainEvent): Promise<void>;
    publishBatch(events: DomainEvent[]): Promise<void>;
}
export declare const eventBus: EventBus;
