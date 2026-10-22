"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitMQClient = exports.RabbitMQClient = void 0;
exports.initializeRabbitMQ = initializeRabbitMQ;
exports.shutdownRabbitMQ = shutdownRabbitMQ;
const amqp = __importStar(require("amqplib"));
const config_1 = require("@cf-erp/config");
const common_1 = require("@nestjs/common");
class RabbitMQClient {
    connection = null;
    channel = null;
    logger = new common_1.Logger(RabbitMQClient.name);
    handlers = new Map();
    exchangeName = 'cf-erp.events';
    deadLetterExchange = 'cf-erp.dlx';
    isConnecting = false;
    async connect() {
        if (this.connection || this.isConnecting) {
            return;
        }
        this.isConnecting = true;
        try {
            this.connection = await amqp.connect(config_1.env.rabbitmq.url, {
                heartbeat: config_1.env.rabbitmq.heartbeat,
                connection_timeout: config_1.env.rabbitmq.connectionTimeout,
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
        }
        catch (error) {
            this.logger.error('Failed to connect to RabbitMQ', error);
            throw error;
        }
        finally {
            this.isConnecting = false;
        }
    }
    async setupExchanges() {
        if (!this.channel)
            return;
        await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });
    }
    async setupDeadLetterExchange() {
        if (!this.channel)
            return;
        await this.channel.assertExchange(this.deadLetterExchange, 'topic', { durable: true });
    }
    handleConnectionError() {
        this.connection = null;
        this.channel = null;
        setTimeout(() => this.connect(), 5000);
    }
    async disconnect() {
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
    async publish(event) {
        if (!this.channel) {
            await this.connect();
        }
        const routingKey = `${event.aggregateType}.${event.eventType}`.toLowerCase();
        const message = Buffer.from(JSON.stringify(event));
        this.channel.publish(this.exchangeName, routingKey, message, {
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
    async publishBatch(events) {
        if (!this.channel) {
            await this.connect();
        }
        for (const event of events) {
            await this.publish(event);
        }
    }
    async subscribe(eventType, handler) {
        if (!this.channel) {
            await this.connect();
        }
        const queueName = `cf-erp.${eventType.toLowerCase()}`;
        const routingKey = eventType.toLowerCase();
        await this.channel.assertQueue(queueName, {
            durable: true,
            deadLetterExchange: this.deadLetterExchange,
            deadLetterRoutingKey: `${routingKey}.dlq`,
        });
        await this.channel.bindQueue(queueName, this.exchangeName, routingKey);
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler);
        this.handlers.set(eventType, handlers);
        await this.consumeQueue(queueName, eventType);
    }
    async unsubscribe(eventType, handler) {
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
    async consumeQueue(queueName, eventType) {
        if (!this.channel)
            return;
        await this.channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const event = JSON.parse(msg.content.toString());
                const handlers = this.handlers.get(eventType) || [];
                await Promise.all(handlers.map(handler => handler(event)));
                this.channel.ack(msg);
            }
            catch (error) {
                this.logger.error(`Error processing event ${eventType}`, error);
                this.channel.nack(msg, false, false);
            }
        });
    }
    async publishToQueue(queueName, message) {
        if (!this.channel) {
            await this.connect();
        }
        await this.channel.assertQueue(queueName, { durable: true });
        this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
            persistent: true,
            contentType: 'application/json',
        });
    }
    async consumeQueueDirect(queueName, handler) {
        if (!this.channel) {
            await this.connect();
        }
        await this.channel.assertQueue(queueName, { durable: true });
        await this.channel.consume(queueName, async (msg) => {
            if (!msg)
                return;
            try {
                const message = JSON.parse(msg.content.toString());
                await handler(message);
                this.channel.ack(msg);
            }
            catch (error) {
                this.logger.error(`Error consuming from queue ${queueName}`, error);
                this.channel.nack(msg, false, false);
            }
        });
    }
}
exports.RabbitMQClient = RabbitMQClient;
exports.rabbitMQClient = new RabbitMQClient();
async function initializeRabbitMQ() {
    await exports.rabbitMQClient.connect();
}
async function shutdownRabbitMQ() {
    await exports.rabbitMQClient.disconnect();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFiYml0bXEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyYWJiaXRtcS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvTkEsZ0RBRUM7QUFFRCw0Q0FFQztBQTFORCw4Q0FBZ0M7QUFDaEMsMkNBQXFDO0FBRXJDLDJDQUF3QztBQUV4QyxNQUFhLGNBQWM7SUFDakIsVUFBVSxHQUEyQixJQUFJLENBQUM7SUFDMUMsT0FBTyxHQUF3QixJQUFJLENBQUM7SUFDM0IsTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QyxRQUFRLEdBQWdDLElBQUksR0FBRyxFQUFFLENBQUM7SUFDbEQsWUFBWSxHQUFHLGVBQWUsQ0FBQztJQUMvQixrQkFBa0IsR0FBRyxZQUFZLENBQUM7SUFDM0MsWUFBWSxHQUFHLEtBQUssQ0FBQztJQUU3QixLQUFLLENBQUMsT0FBTztRQUNYLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7WUFDekMsT0FBTztRQUNULENBQUM7UUFFRCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUV6QixJQUFJLENBQUM7WUFDSCxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtnQkFDckQsU0FBUyxFQUFFLFlBQUcsQ0FBQyxRQUFRLENBQUMsU0FBUztnQkFDakMsa0JBQWtCLEVBQUUsWUFBRyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUI7YUFDbkQsQ0FBQyxDQUFDO1lBRUgsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFD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QyxDQUFDO2dCQUNuRCxNQUFNLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLE9BQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQztZQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7Z0JBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsOEJBQThCLFNBQVMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNwRSxJQUFJLENBQUMsT0FBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTNNRCx3Q0EyTUM7QUFFWSxRQUFBLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBRTVDLEtBQUssVUFBVSxrQkFBa0I7SUFDdEMsTUFBTSxzQkFBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pDLENBQUM7QUFFTSxLQUFLLFVBQVUsZ0JBQWdCO0lBQ3BDLE1BQU0sc0JBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNwQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgYW1xcCBmcm9tICdhbXFwbGliJztcbmltcG9ydCB7IGVudiB9IGZyb20gJ0BjZi1lcnAvY29uZmlnJztcbmltcG9ydCB7IERvbWFpbkV2ZW50LCBFdmVudEhhbmRsZXIsIElFdmVudFB1Ymxpc2hlciwgSUV2ZW50U3Vic2NyaWJlciB9IGZyb20gJ0BjZi1lcnAvc2hhcmVkJztcbmltcG9ydCB7IExvZ2dlciB9IGZyb20gJ0BuZXN0anMvY29tbW9uJztcblxuZXhwb3J0IGNsYXNzIFJhYmJpdE1RQ2xpZW50IGltcGxlbWVudHMgSUV2ZW50UHVibGlzaGVyLCBJRXZlbnRTdWJzY3JpYmVyIHtcbiAgcHJpdmF0ZSBjb25uZWN0aW9uOiBhbXFwLkNvbm5lY3Rpb24gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBjaGFubmVsOiBhbXFwLkNoYW5uZWwgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXIgPSBuZXcgTG9nZ2VyKFJhYmJpdE1RQ2xpZW50Lm5hbWUpO1xuICBwcml2YXRlIHJlYWRvbmx5IGhhbmRsZXJzOiBNYXA8c3RyaW5nLCBFdmVudEhhbmRsZXJbXT4gPSBuZXcgTWFwKCk7XG4gIHByaXZhdGUgcmVhZG9ubHkgZXhjaGFuZ2VOYW1lID0gJ2NmLWVycC5ldmVudHMnO1xuICBwcml2YXRlIHJlYWRvbmx5IGRlYWRMZXR0ZXJFeGNoYW5nZSA9ICdjZi1lcnAuZGx4JztcbiAgcHJpdmF0ZSBpc0Nvbm5lY3RpbmcgPSBmYWxzZTtcblxuICBhc3luYyBjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNvbm5lY3Rpb24gfHwgdGhpcy5pc0Nvbm5lY3RpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmlzQ29ubmVjdGluZyA9IHRydWU7XG5cbiAgICB0cnkge1xuICAgICAgdGhpcy5jb25uZWN0aW9uID0gYXdhaXQgYW1xcC5jb25uZWN0KGVudi5yYWJiaXRtcS51cmwsIHtcbiAgICAgICAgaGVhcnRiZWF0OiBlbnYucmFiYml0bXEuaGVhcnRiZWF0LFxuICAgICAgICBjb25uZWN0aW9uX3RpbWVvdXQ6IGVudi5yYWJiaXRtcS5jb25uZWN0aW9uVGltZW91dCxcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNvbm5lY3Rpb24ub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcignUmFiYml0TVEgY29ubmVjdGlvbiBlcnJvcicsIGVycik7XG4gICAgICAgIHRoaXMuaGFuZGxlQ29ubmVjdGlvbkVycm9yKCk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jb25uZWN0aW9uLm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5sb2dnZXIud2FybignUmFiYml0TVEgY29ubmVjdGlvbiBjbG9zZWQnKTtcbiAgICAgICAgdGhpcy5oYW5kbGVDb25uZWN0aW9uRXJyb3IoKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmNoYW5uZWwgPSBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY3JlYXRlQ2hhbm5lbCgpO1xuICAgICAgYXdhaXQgdGhpcy5jaGFubmVsLnByZWZldGNoKDEwKTtcblxuICAgICAgYXdhaXQgdGhpcy5zZXR1cEV4Y2hhbmdlcygpO1xuICAgICAgYXdhaXQgdGhpcy5zZXR1cERlYWRMZXR0ZXJFeGNoYW5nZSgpO1xuXG4gICAgICB0aGlzLmxvZ2dlci5sb2coJ1JhYmJpdE1RIGNvbm5lY3RlZCBzdWNjZXNzZnVsbHknKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoJ0ZhaWxlZCB0byBjb25uZWN0IHRvIFJhYmJpdE1RJywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuaXNDb25uZWN0aW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZXR1cEV4Y2hhbmdlcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbCkgcmV0dXJuO1xuXG4gICAgYXdhaXQgdGhpcy5jaGFubmVsLmFzc2VydEV4Y2hhbmdlKHRoaXMuZXhjaGFuZ2VOYW1lLCAndG9waWMnLCB7IGR1cmFibGU6IHRydWUgfSk7XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIHNldHVwRGVhZExldHRlckV4Y2hhbmdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jaGFubmVsKSByZXR1cm47XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwuYXNzZXJ0RXhjaGFuZ2UodGhpcy5kZWFkTGV0dGVyRXhjaGFuZ2UsICd0b3BpYycsIHsgZHVyYWJsZTogdHJ1ZSB9KTtcbiAgfVxuXG4gIHByaXZhdGUgaGFuZGxlQ29ubmVjdGlvbkVycm9yKCk6IHZvaWQge1xuICAgIHRoaXMuY29ubmVjdGlvbiA9IG51bGw7XG4gICAgdGhpcy5jaGFubmVsID0gbnVsbDtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuY29ubmVjdCgpLCA1MDAwKTtcbiAgfVxuXG4gIGFzeW5jIGRpc2Nvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMuY2hhbm5lbCkge1xuICAgICAgYXdhaXQgdGhpcy5jaGFubmVsLmNsb3NlKCk7XG4gICAgICB0aGlzLmNoYW5uZWwgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5jb25uZWN0aW9uKSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgICAgIHRoaXMuY29ubmVjdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMubG9nZ2VyLmxvZygnUmFiYml0TVEgZGlzY29ubmVjdGVkJyk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoKGV2ZW50OiBEb21haW5FdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jaGFubmVsKSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBjb25zdCByb3V0aW5nS2V5ID0gYCR7ZXZlbnQuYWdncmVnYXRlVHlwZX0uJHtldmVudC5ldmVudFR5cGV9YC50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShldmVudCkpO1xuXG4gICAgdGhpcy5jaGFubmVsIS5wdWJsaXNoKHRoaXMuZXhjaGFuZ2VOYW1lLCByb3V0aW5nS2V5LCBtZXNzYWdlLCB7XG4gICAgICBwZXJzaXN0ZW50OiB0cnVlLFxuICAgICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIG1lc3NhZ2VJZDogZXZlbnQuZXZlbnRJZCxcbiAgICAgIHRpbWVzdGFtcDogZXZlbnQudGltZXN0YW1wLmdldFRpbWUoKSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgdGVuYW50SWQ6IGV2ZW50LnRlbmFudElkLFxuICAgICAgICBicmFuY2hJZDogZXZlbnQuYnJhbmNoSWQsXG4gICAgICAgIHVzZXJJZDogZXZlbnQudXNlcklkLFxuICAgICAgICBhZ2dyZWdhdGVJZDogZXZlbnQuYWdncmVnYXRlSWQsXG4gICAgICAgIGFnZ3JlZ2F0ZVR5cGU6IGV2ZW50LmFnZ3JlZ2F0ZVR5cGUsXG4gICAgICAgIHZlcnNpb246IGV2ZW50LnZlcnNpb24sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5sb2dnZXIuZGVidWcoYFB1Ymxpc2hlZCBldmVudDogJHtyb3V0aW5nS2V5fWAsIHsgZXZlbnRJZDogZXZlbnQuZXZlbnRJZCB9KTtcbiAgfVxuXG4gIGFzeW5jIHB1Ymxpc2hCYXRjaChldmVudHM6IERvbWFpbkV2ZW50W10pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbCkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBldmVudCBvZiBldmVudHMpIHtcbiAgICAgIGF3YWl0IHRoaXMucHVibGlzaChldmVudCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc3Vic2NyaWJlKGV2ZW50VHlwZTogc3RyaW5nLCBoYW5kbGVyOiBFdmVudEhhbmRsZXIpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuY2hhbm5lbCkge1xuICAgICAgYXdhaXQgdGhpcy5jb25uZWN0KCk7XG4gICAgfVxuXG4gICAgY29uc3QgcXVldWVOYW1lID0gYGNmLWVycC4ke2V2ZW50VHlwZS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgY29uc3Qgcm91dGluZ0tleSA9IGV2ZW50VHlwZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgYXdhaXQgdGhpcy5jaGFubmVsIS5hc3NlcnRRdWV1ZShxdWV1ZU5hbWUsIHtcbiAgICAgIGR1cmFibGU6IHRydWUsXG4gICAgICBkZWFkTGV0dGVyRXhjaGFuZ2U6IHRoaXMuZGVhZExldHRlckV4Y2hhbmdlLFxuICAgICAgZGVhZExldHRlclJvdXRpbmdLZXk6IGAke3JvdXRpbmdLZXl9LmRscWAsXG4gICAgfSk7XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwhLmJpbmRRdWV1ZShxdWV1ZU5hbWUsIHRoaXMuZXhjaGFuZ2VOYW1lLCByb3V0aW5nS2V5KTtcblxuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycy5nZXQoZXZlbnRUeXBlKSB8fCBbXTtcbiAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgIHRoaXMuaGFuZGxlcnMuc2V0KGV2ZW50VHlwZSwgaGFuZGxlcnMpO1xuXG4gICAgYXdhaXQgdGhpcy5jb25zdW1lUXVldWUocXVldWVOYW1lLCBldmVudFR5cGUpO1xuICB9XG5cbiAgYXN5bmMgdW5zdWJzY3JpYmUoZXZlbnRUeXBlOiBzdHJpbmcsIGhhbmRsZXI6IEV2ZW50SGFuZGxlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycy5nZXQoZXZlbnRUeXBlKSB8fCBbXTtcbiAgICBjb25zdCBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcik7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgaGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICBpZiAoaGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmhhbmRsZXJzLmRlbGV0ZShldmVudFR5cGUpO1xuICAgICAgY29uc3QgcXVldWVOYW1lID0gYGNmLWVycC4ke2V2ZW50VHlwZS50b0xvd2VyQ2FzZSgpfWA7XG4gICAgICBpZiAodGhpcy5jaGFubmVsKSB7XG4gICAgICAgIGF3YWl0IHRoaXMuY2hhbm5lbC5kZWxldGVRdWV1ZShxdWV1ZU5hbWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgY29uc3VtZVF1ZXVlKHF1ZXVlTmFtZTogc3RyaW5nLCBldmVudFR5cGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jaGFubmVsKSByZXR1cm47XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwuY29uc3VtZShxdWV1ZU5hbWUsIGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGlmICghbXNnKSByZXR1cm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV2ZW50OiBEb21haW5FdmVudCA9IEpTT04ucGFyc2UobXNnLmNvbnRlbnQudG9TdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycy5nZXQoZXZlbnRUeXBlKSB8fCBbXTtcblxuICAgICAgICBhd2FpdCBQcm9taXNlLmFsbChoYW5kbGVycy5tYXAoaGFuZGxlciA9PiBoYW5kbGVyKGV2ZW50KSkpO1xuXG4gICAgICAgIHRoaXMuY2hhbm5lbCEuYWNrKG1zZyk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLmxvZ2dlci5lcnJvcihgRXJyb3IgcHJvY2Vzc2luZyBldmVudCAke2V2ZW50VHlwZX1gLCBlcnJvcik7XG4gICAgICAgIHRoaXMuY2hhbm5lbCEubmFjayhtc2csIGZhbHNlLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBwdWJsaXNoVG9RdWV1ZShxdWV1ZU5hbWU6IHN0cmluZywgbWVzc2FnZTogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jaGFubmVsKSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwhLmFzc2VydFF1ZXVlKHF1ZXVlTmFtZSwgeyBkdXJhYmxlOiB0cnVlIH0pO1xuICAgIHRoaXMuY2hhbm5lbCEuc2VuZFRvUXVldWUocXVldWVOYW1lLCBCdWZmZXIuZnJvbShKU09OLnN0cmluZ2lmeShtZXNzYWdlKSksIHtcbiAgICAgIHBlcnNpc3RlbnQ6IHRydWUsXG4gICAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgY29uc3VtZVF1ZXVlRGlyZWN0KHF1ZXVlTmFtZTogc3RyaW5nLCBoYW5kbGVyOiAobWVzc2FnZTogdW5rbm93bikgPT4gUHJvbWlzZTx2b2lkPik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5jaGFubmVsKSB7XG4gICAgICBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoYW5uZWwhLmFzc2VydFF1ZXVlKHF1ZXVlTmFtZSwgeyBkdXJhYmxlOiB0cnVlIH0pO1xuICAgIGF3YWl0IHRoaXMuY2hhbm5lbCEuY29uc3VtZShxdWV1ZU5hbWUsIGFzeW5jIChtc2cpID0+IHtcbiAgICAgIGlmICghbXNnKSByZXR1cm47XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBKU09OLnBhcnNlKG1zZy5jb250ZW50LnRvU3RyaW5nKCkpO1xuICAgICAgICBhd2FpdCBoYW5kbGVyKG1lc3NhZ2UpO1xuICAgICAgICB0aGlzLmNoYW5uZWwhLmFjayhtc2cpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIuZXJyb3IoYEVycm9yIGNvbnN1bWluZyBmcm9tIHF1ZXVlICR7cXVldWVOYW1lfWAsIGVycm9yKTtcbiAgICAgICAgdGhpcy5jaGFubmVsIS5uYWNrKG1zZywgZmFsc2UsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgcmFiYml0TVFDbGllbnQgPSBuZXcgUmFiYml0TVFDbGllbnQoKTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVSYWJiaXRNUSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgcmFiYml0TVFDbGllbnQuY29ubmVjdCgpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2h1dGRvd25SYWJiaXRNUSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgcmFiYml0TVFDbGllbnQuZGlzY29ubmVjdCgpO1xufSJdfQ==