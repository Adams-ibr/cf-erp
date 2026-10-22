import { DomainEvent, EventHandler, IEventPublisher, IEventSubscriber } from '@cf-erp/shared';
export declare class RabbitMQClient implements IEventPublisher, IEventSubscriber {
    private connection;
    private channel;
    private readonly logger;
    private readonly handlers;
    private readonly exchangeName;
    private readonly deadLetterExchange;
    private isConnecting;
    connect(): Promise<void>;
    private setupExchanges;
    private setupDeadLetterExchange;
    private handleConnectionError;
    disconnect(): Promise<void>;
    publish(event: DomainEvent): Promise<void>;
    publishBatch(events: DomainEvent[]): Promise<void>;
    subscribe(eventType: string, handler: EventHandler): Promise<void>;
    unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
    private consumeQueue;
    publishToQueue(queueName: string, message: unknown): Promise<void>;
    consumeQueueDirect(queueName: string, handler: (message: unknown) => Promise<void>): Promise<void>;
}
export declare const rabbitMQClient: RabbitMQClient;
export declare function initializeRabbitMQ(): Promise<void>;
export declare function shutdownRabbitMQ(): Promise<void>;
