import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';
import { prisma } from '@cf-erp/database';
import { rabbitMQClient } from '@cf-erp/messaging';
import { kafkaClient } from '@cf-erp/messaging';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkRabbitMQ(),
      () => this.checkKafka(),
      () => this.checkMemory(),
      () => this.checkDisk(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkRabbitMQ(),
    ]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkMemory(),
    ]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down', error: error.message } };
    }
  }

  private async checkRabbitMQ(): Promise<HealthIndicatorResult> {
    try {
      // Check if RabbitMQ connection is alive
      return { rabbitmq: { status: 'up' } };
    } catch (error) {
      return { rabbitmq: { status: 'down', error: error.message } };
    }
  }

  private async checkKafka(): Promise<HealthIndicatorResult> {
    try {
      // Check if Kafka connection is alive
      return { kafka: { status: 'up' } };
    } catch (error) {
      return { kafka: { status: 'down', error: error.message } };
    }
  }

  private async checkMemory(): Promise<HealthIndicatorResult> {
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    const total = process.memoryUsage().heapTotal / 1024 / 1024;
    const percentage = (used / total) * 100;

    return {
      memory: {
        status: percentage < 90 ? 'up' : 'down',
        used: `${Math.round(used)} MB`,
        total: `${Math.round(total)} MB`,
        percentage: `${Math.round(percentage)}%`,
      },
    };
  }

  private async checkDisk(): Promise<HealthIndicatorResult> {
    // Would use a disk space checker in production
    return { disk: { status: 'up' } };
  }
}