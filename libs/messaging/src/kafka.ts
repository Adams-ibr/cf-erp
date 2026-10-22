import { Kafka, Producer, Consumer, EachMessagePayload, CompressionTypes } from 'kafkajs';
import { env } from '@cf-erp/config';
import { DomainEvent, EventHandler, IEventPublisher, IEventSubscriber } from '@cf-erp/shared';
import { Logger } from '@nestjs/common';

export class KafkaClient implements IEventPublisher, IEventSubscriber {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumers: Map<string, Consumer> = new Map();
  private readonly logger = new Logger(KafkaClient.name);
  private readonly handlers: Map<string, EventHandler[]> = new Map();
  private readonly topicPrefix = 'cf-erp';

  constructor() {
    this.kafka = new Kafka({
      clientId: env.kafka.clientId,
      brokers: env.kafka.brokers,
      ssl: env.kafka.ssl,
      sasl: env.kafka.sasl,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  async connect(): Promise<void> {
    this.producer = this.kafka.producer({
      allowAutoCreateTopics: true,
      transactionTimeout: 30000,
    });

    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async disconnect(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.producer = null;
    }

    for (const [topic, consumer] of this.consumers) {
      await consumer.disconnect();
      this.logger.log(`Kafka consumer disconnected: ${topic}`);
    }
    this.consumers.clear();
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.producer) {
      await this.connect();
    }

    const topic = `${this.topicPrefix}.${event.aggregateType.toLowerCase()}`;
    const messages = [{
      key: event.aggregateId,
      value: JSON.stringify(event),
      headers: {
        tenantId: event.tenantId,
        branchId: event.branchId || '',
        userId: event.userId || '',
        eventId: event.eventId,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        version: String(event.version),
        timestamp: event.timestamp.toISOString(),
      },
    }];

    await this.producer!.send({
      topic,
      messages,
      compression: CompressionTypes.GZIP,
    });

    this.logger.debug(`Published event to Kafka: ${topic}`, { eventId: event.eventId });
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (!this.producer) {
      await this.connect();
    }

    const topics = new Map<string, typeof events>();

    for (const event of events) {
      const topic = `${this.topicPrefix}.${event.aggregateType.toLowerCase()}`;
      const existing = topics.get(topic) || [];
      existing.push(event);
      topics.set(topic, existing);
    }

    for (const [topic, topicEvents] of topics) {
      const messages = topicEvents.map(event => ({
        key: event.aggregateId,
        value: JSON.stringify(event),
        headers: {
          tenantId: event.tenantId,
          branchId: event.branchId || '',
          userId: event.userId || '',
          eventId: event.eventId,
          eventType: event.eventType,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          version: String(event.version),
          timestamp: event.timestamp.toISOString(),
        },
      }));

      await this.producer!.send({
        topic,
        messages,
        compression: CompressionTypes.GZIP,
      });
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    const topic = `${this.topicPrefix}.${eventType.toLowerCase()}`;
    const groupId = `${env.kafka.groupId}.${eventType.toLowerCase()}`;

    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    await consumer.subscribe({ topic, fromBeginning: false });

    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);

    await consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          const event: DomainEvent = JSON.parse(message.value.toString());
          const eventHandlers = this.handlers.get(eventType) || [];
          await Promise.all(eventHandlers.map(h => h(event)));
        } catch (error) {
          this.logger.error(`Error processing Kafka event ${eventType}`, error);
        }
      },
    });

    this.consumers.set(eventType, consumer);
    this.logger.log(`Kafka consumer subscribed: ${topic}`);
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.handlers.delete(eventType);
      const consumer = this.consumers.get(eventType);
      if (consumer) {
        await consumer.disconnect();
        this.consumers.delete(eventType);
      }
    }
  }

  async sendToTopic(topic: string, messages: Array<{ key?: string; value: unknown; headers?: Record<string, string> }>): Promise<void> {
    if (!this.producer) {
      await this.connect();
    }

    await this.producer!.send({
      topic,
      messages: messages.map(msg => ({
        key: msg.key,
        value: JSON.stringify(msg.value),
        headers: msg.headers,
      })),
      compression: CompressionTypes.GZIP,
    });
  }

  async createTopic(topic: string, numPartitions = 3, replicationFactor = 1): Promise<void> {
    const admin = this.kafka.admin();
    await admin.connect();
    await admin.createTopics({
      topics: [{
        topic,
        numPartitions,
        replicationFactor,
        configEntries: [
          { name: 'cleanup.policy', value: 'delete' },
          { name: 'retention.ms', value: '604800000' }, // 7 days
        ],
      }],
    });
    await admin.disconnect();
  }
}

export const kafkaClient = new KafkaClient();

export async function initializeKafka(): Promise<void> {
  await kafkaClient.connect();
}

export async function shutdownKafka(): Promise<void> {
  await kafkaClient.disconnect();
}