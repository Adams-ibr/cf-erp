import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { DashboardsController } from './dashboards/dashboards.controller'.
import { WidgetsController } from './widgets/widgets.controller'.
import { KPIsController } from './kpis/kpis.controller'.
import { AlertsController } from './alerts/alerts.controller'.
import { ViewsController } from './views/views.controller'.
import { LayoutsController } from './layouts/layouts.controller'.
import { ReportsController } from './reports/reports.controller'.
import { DataSourcesController } from './data-sources/data-sources.controller'.
import { DatasetsController } from './datasets/datasets.controller'.
import { AnalyticsController } from './analytics/analytics.controller'.
import { DashboardsService } from './dashboards/dashboards.service'.
import { WidgetsService } from './widgets/widgets.service'.
import { KPIsService } from './kpis/kpis.service'.
import { AlertsService } from './alerts/alerts.service'.
import { ViewsService } from './views/views.service'.
import { LayoutsService } from './layouts/layouts.service'.
import { ReportsService } from './reports/reports.service'.
import { DataSourcesService } from './data-sources/data-sources.service'.
import { DatasetsService } from './datasets/datasets.service'.
import { AnalyticsService } from './analytics/analytics.service'.
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
    DashboardsController,
    WidgetsController,
    KPIsController,
    AlertsController,
    ViewsController,
    LayoutsController,
    ReportsController,
    DataSourcesController,
    DatasetsController,
    AnalyticsController,
    HealthController,
  ],
  providers: [
    DashboardsService,
    WidgetsService,
    KPIsService,
    AlertsService,
    ViewsService,
    LayoutsService,
    ReportsService,
    DataSourcesService,
    DatasetsService,
    AnalyticsService,
  ],
})
export class AppModule {}