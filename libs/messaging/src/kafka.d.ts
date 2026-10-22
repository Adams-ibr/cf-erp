import { DomainEvent, EventHandler, IEventPublisher, IEventSubscriber } from '@cf-erp/shared';
export declare class KafkaClient implements IEventPublisher, IEventSubscriber {
    private kafka;
    private producer;
    private consumers;
    private readonly logger;
    private readonly handlers;
    private readonly topicPrefix;
    constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publish(event: DomainEvent): Promise<void>;
    publishBatch(events: DomainEvent[]): Promise<void>;
    subscribe(eventType: string, handler: EventHandler): Promise<void>;
    unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
    sendToTopic(topic: string, messages: Array<{
        key?: string;
        value: unknown;
        headers?: Record<string, string>;
    }>): Promise<void>;
    createTopic(topic: string, numPartitions?: number, replicationFactor?: number): Promise<void>;
}
export declare const kafkaClient: KafkaClient;
export declare function initializeKafka(): Promise<void>;
export declare function shutdownKafka(): Promise<void>;
