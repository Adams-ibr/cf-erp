import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthCheckResult, HealthIndicatorResult } from '@nestjs/terminus';
import { Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    @Inject('PRISMA_CLIENT') private readonly prisma: PrismaClient,
  ) {}

  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkMemory(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.checkDatabase(),
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
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: { status: 'up' } };
    } catch (error) {
      return { database: { status: 'down', error: error.message } };
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
}