import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { ReportsController } from './reports/reports.controller'.
import { DashboardsController } from './dashboards/dashboards.controller'.
import { DataSourcesController } from './data-sources/data-sources.controller'.
import { DatasetsController } from './datasets/datasets.controller'.
import { KPIsController } from './kpis/kpis.controller'.
import { ExportsController } from './exports/exports.controller'.
import { ReportsService } from './reports/reports.service'.
import { DashboardsService } from './dashboards/dashboards.service'.
import { DataSourcesService } from './data-sources/data-sources.service'.
import { DatasetsService } from './datasets/datasets.service'.
import { KPIsService } from './kpis/kpis.service'.
import { ExportsService } from './exports/exports.service'.
import { HealthController } from './health.controller'.
import { PrismaModule } from './prisma.module'.

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: ['.env', `.env.${env.nodeEnv}`],
    }),
    ThrottlerModule.forRoot([{
      ttl: env.rateLimit.windowMs,
      limit: env.rateLimit.maxRequests,
    }]),
    TerminusModule,
    ScheduleModule.forRoot(),
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    ReportsController,
    DashboardsController,
    DataSourcesController,
    DatasetsController,
    KPIsController,
    ExportsController,
    HealthController,
  ],
  providers: [
    ReportsService,
    DashboardsService,
    DataSourcesService,
    DatasetsService,
    KPIsService,
    ExportsService,
  ],
})
export class AppModule {}