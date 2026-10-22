import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { NotificationsController } from './notifications/notifications.controller'.
import { TemplatesController } from './templates/templates.controller'.
import { ChannelsController } from './channels/channels.controller'.
import { SubscriptionsController } from './subscriptions/subscriptions.controller'.
import { PreferencesController } from './preferences/preferences.controller'.
import { ProvidersController } from './providers/providers.controller'.
import { QueuesController } from './queues/queues.controller'.
import { SchedulesController } from './schedules/schedules.controller'.
import { AnalyticsController } from './analytics/analytics.controller'.
import { NotificationsService } from './notifications/notifications.service'.
import { TemplatesService } from './templates/templates.service'.
import { ChannelsService } from './channels/channels.service'.
import { SubscriptionsService } from './subscriptions/subscriptions.service'.
import { PreferencesService } from './preferences/preferences.service'.
import { ProvidersService } from './providers/providers.service'.
import { QueuesService } from './queues/queues.service'.
import { SchedulesService } from './schedules/schedules.service'.
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
    NotificationsController,
    TemplatesController,
    ChannelsController,
    SubscriptionsController,
    PreferencesController,
    ProvidersController,
    QueuesController,
    SchedulesController,
    AnalyticsController,
    HealthController,
  ],
  providers: [
    NotificationsService,
    TemplatesService,
    ChannelsService,
    SubscriptionsService,
    PreferencesService,
    ProvidersService,
    QueuesService,
    SchedulesService,
    AnalyticsService,
  ],
})
export class AppModule {}