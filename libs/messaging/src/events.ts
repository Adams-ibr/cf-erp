import { DomainEvent } from '@cf-erp/shared';

export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  traceId?: string;
  spanId?: string;
}

export abstract class BaseDomainEvent implements DomainEvent {
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

  constructor(
    eventType: string,
    aggregateId: string,
    aggregateType: string,
    tenantId: string,
    payload: Record<string, unknown>,
    options: {
      eventId?: string;
      branchId?: string;
      userId?: string;
      metadata?: Record<string, unknown>;
      version?: number;
    } = {},
  ) {
    this.eventId = options.eventId || crypto.randomUUID();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.tenantId = tenantId;
    this.branchId = options.branchId;
    this.userId = options.userId;
    this.timestamp = new Date();
    this.payload = payload;
    this.metadata = options.metadata;
    this.version = options.version || 1;
  }
}

export function createEvent<T extends Record<string, unknown>>(
  eventType: string,
  aggregateId: string,
  aggregateType: string,
  tenantId: string,
  payload: T,
  options?: {
    eventId?: string;
    branchId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
    version?: number;
  },
): DomainEvent {
  return new BaseDomainEvent(eventType, aggregateId, aggregateType, tenantId, payload, options);
}

export const EventTypes = {
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    ROLE_CHANGED: 'user.role_changed',
    PASSWORD_CHANGED: 'user.password_changed',
  },
  CUSTOMER: {
    CREATED: 'customer.created',
    UPDATED: 'customer.updated',
    DELETED: 'customer.deleted',
    STATUS_CHANGED: 'customer.status_changed',
  },
  SUPPLIER: {
    CREATED: 'supplier.created',
    UPDATED: 'supplier.updated',
    DELETED: 'supplier.deleted',
  },
  QUOTATION: {
    CREATED: 'quotation.created',
    UPDATED: 'quotation.updated',
    SENT: 'quotation.sent',
    ACCEPTED: 'quotation.accepted',
    REJECTED: 'quotation.rejected',
    EXPIRED: 'quotation.expired',
    CONVERTED: 'quotation.converted',
  },
  RATE: {
    CREATED: 'rate.created',
    UPDATED: 'rate.updated',
    DELETED: 'rate.deleted',
    EXPIRED: 'rate.expired',
  },
  JOB: {
    CREATED: 'job.created',
    UPDATED: 'job.updated',
    DELETED: 'job.deleted',
    STATUS_CHANGED: 'job.status_changed',
    ASSIGNED: 'job.assigned',
    COMPLETED: 'job.completed',
  },
  SHIPMENT: {
    CREATED: 'shipment.created',
    UPDATED: 'shipment.updated',
    DELETED: 'shipment.deleted',
    STATUS_CHANGED: 'shipment.status_changed',
    BOOKED: 'shipment.booked',
    LOADED: 'shipment.loaded',
    IN_TRANSIT: 'shipment.in_transit',
    ARRIVED: 'shipment.arrived',
    DELIVERED: 'shipment.delivered',
    COMPLETED: 'shipment.completed',
    CANCELLED: 'shipment.cancelled',
  },
  BOOKING: {
    CREATED: 'booking.created',
    UPDATED: 'booking.updated',
    CONFIRMED: 'booking.confirmed',
    CANCELLED: 'booking.cancelled',
    AMENDED: 'booking.amended',
  },
  CONTAINER: {
    CREATED: 'container.created',
    UPDATED: 'container.updated',
    STATUS_CHANGED: 'container.status_changed',
    PICKED_UP: 'container.picked_up',
    RETURNED: 'container.returned',
    DAMAGED: 'container.damaged',
  },
  DOCUMENT: {
    CREATED: 'document.created',
    UPDATED: 'document.updated',
    DELETED: 'document.deleted',
    UPLOADED: 'document.uploaded',
    APPROVED: 'document.approved',
    REJECTED: 'document.rejected',
  },
  CUSTOMS: {
    DECLARATION_CREATED: 'customs.declaration_created',
    DECLARATION_SUBMITTED: 'customs.declaration_submitted',
    CLEARED: 'customs.cleared',
    HOLD: 'customs.hold',
    EXAMINATION: 'customs.examination',
    RELEASED: 'customs.released',
  },
  INVOICE: {
    CREATED: 'invoice.created',
    UPDATED: 'invoice.updated',
    SENT: 'invoice.sent',
    PAID: 'invoice.paid',
    OVERDUE: 'invoice.overdue',
    CANCELLED: 'invoice.cancelled',
  },
  PAYMENT: {
    CREATED: 'payment.created',
    PROCESSING: 'payment.processing',
    COMPLETED: 'payment.completed',
    FAILED: 'payment.failed',
    REFUNDED: 'payment.refunded',
  },
  EXPENSE: {
    CREATED: 'expense.created',
    APPROVED: 'expense.approved',
    REJECTED: 'expense.rejected',
    PAID: 'expense.paid',
  },
  TASK: {
    CREATED: 'task.created',
    UPDATED: 'task.updated',
    ASSIGNED: 'task.assigned',
    COMPLETED: 'task.completed',
    OVERDUE: 'task.overdue',
  },
  WORKFLOW: {
    STARTED: 'workflow.started',
    COMPLETED: 'workflow.completed',
    PAUSED: 'workflow.paused',
    FAILED: 'workflow.failed',
  },
  NOTIFICATION: {
    SENT: 'notification.sent',
    DELIVERED: 'notification.delivered',
    FAILED: 'notification.failed',
    READ: 'notification.read',
  },
  INTEGRATION: {
    SYNC_STARTED: 'integration.sync_started',
    SYNC_COMPLETED: 'integration.sync_completed',
    SYNC_FAILED: 'integration.sync_failed',
  },
  AUDIT: {
    LOGGED: 'audit.logged',
  },
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes][keyof typeof EventTypes[keyof typeof EventTypes]];

export interface EventHandlerContext {
  event: DomainEvent;
  retryCount: number;
  maxRetries: number;
}

export type AsyncEventHandler = (context: EventHandlerContext) => Promise<void>;

export class EventBus {
  private handlers: Map<string, AsyncEventHandler[]> = new Map();

  subscribe(eventType: string, handler: AsyncEventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  unsubscribe(eventType: string, handler: AsyncEventHandler): void {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    await Promise.all([
      ...handlers.map(h => h({ event, retryCount: 0, maxRetries: 3 })),
      ...wildcardHandlers.map(h => h({ event, retryCount: 0, maxRetries: 3 })),
    ]);
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }
}

export const eventBus = new EventBus();