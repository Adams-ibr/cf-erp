import * as amqp from 'amqplib';
import { env } from '@cf-erp/config';
import { DomainEvent, EventHandler, IEventPublisher, IEventSubscriber } from '@cf-erp/shared';
import { Logger } from '@nestjs/common';

export class RabbitMQClient implements IEventPublisher, IEventSubscriber {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly logger = new Logger(RabbitMQClient.name);
  private readonly handlers: Map<string, EventHandler[]> = new Map();
  private readonly exchangeName = 'cf-erp.events';
  private readonly deadLetterExchange = 'cf-erp.dlx';
  private isConnecting = false;

  async connect(): Promise<void> {
    if (this.connection || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = await amqp.connect(env.rabbitmq.url, {
        heartbeat: env.rabbitmq.heartbeat,
        connection_timeout: env.rabbitmq.connectionTimeout,
      });

      this.connection.on('error', (err) => {
        this.logger.error('RabbitMQ connection error', err);
        this.handleConnectionError();
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
        this.handleConnectionError();
      });

      this.channel = await this.connection.createChannel();
      await this.channel.prefetch(10);

      await this.setupExchanges();
      await this.setupDeadLetterExchange();

      this.logger.log('RabbitMQ connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async setupExchanges(): Promise<void> {
    if (!this.channel) return;

    await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
  }

  private async setupDeadLetterExchange(): Promise<void> {
    if (!this.channel) return;

    await this.channel.assertExchange(this.deadLetterExchange, 'topic', { durable: true });
  }

  private handleConnectionError(): void {
    this.connection = null;
    this.channel = null;
    setTimeout(() => this.connect(), 5000);
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
    this.logger.log('RabbitMQ disconnected');
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const routingKey = `${event.aggregateType}.${event.eventType}`.toLowerCase();
    const message = Buffer.from(JSON.stringify(event));

    this.channel!.publish(this.exchangeName, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
      messageId: event.eventId,
      timestamp: event.timestamp.getTime(),
      headers: {
        tenantId: event.tenantId,
        branchId: event.branchId,
        userId: event.userId,
        aggregateId: event.aggregateId,
        aggregateType: event.aggregateType,
        version: event.version,
      },
    });

    this.logger.debug(`Published event: ${routingKey}`, { eventId: event.eventId });
  }

  async publishBatch(events: DomainEvent[]): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    for (const event of events) {
      await this.publish(event);
    }
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const queueName = `cf-erp.${eventType.toLowerCase()}`;
    const routingKey = eventType.toLowerCase();

    await this.channel!.assertQueue(queueName, {
      durable: true,
      deadLetterExchange: this.deadLetterExchange,
      deadLetterRoutingKey: `${routingKey}.dlq`,
    });

    await this.channel!.bindQueue(queueName, this.exchangeName, routingKey);

    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);

    await this.consumeQueue(queueName, eventType);
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
    }

    if (handlers.length === 0) {
      this.handlers.delete(eventType);
      const queueName = `cf-erp.${eventType.toLowerCase()}`;
      if (this.channel) {
        await this.channel.deleteQueue(queueName);
      }
    }
  }

  private async consumeQueue(queueName: string, eventType: string): Promise<void> {
    if (!this.channel) return;

    await this.channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const event: DomainEvent = JSON.parse(msg.content.toString());
        const handlers = this.handlers.get(eventType) || [];

        await Promise.all(handlers.map(handler => handler(event)));

        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error(`Error processing event ${eventType}`, error);
        this.channel!.nack(msg, false, false);
      }
    });
  }

  async publishToQueue(queueName: string, message: unknown): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel!.assertQueue(queueName, { durable: true });
    this.channel!.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
      contentType: 'application/json',
    });
  }

  async consumeQueueDirect(queueName: string, handler: (message: unknown) => Promise<void>): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel!.assertQueue(queueName, { durable: true });
    await this.channel!.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const message = JSON.parse(msg.content.toString());
        await handler(message);
        this.channel!.ack(msg);
      } catch (error) {
        this.logger.error(`Error consuming from queue ${queueName}`, error);
        this.channel!.nack(msg, false, false);
      }
    });
  }
}

export const rabbitMQClient = new RabbitMQClient();

export async function initializeRabbitMQ(): Promise<void> {
  await rabbitMQClient.connect();
}

export async function shutdownRabbitMQ(): Promise<void> {
  await rabbitMQClient.disconnect();
}