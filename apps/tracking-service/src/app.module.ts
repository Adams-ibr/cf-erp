import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { TrackingEventsController } from './tracking-events/tracking-events.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { AlertsController } from './alerts/alerts.controller';
import { SubscriptionsController } from './subscriptions/subscriptions.controller';
import { ProvidersController } from './providers/providers.controller';
import { TrackingEventsService } from './tracking-events/tracking-events.service';
import { NotificationsService } from './notifications/notifications.service';
import { AlertsService } from './alerts/alerts.service';
import { SubscriptionsService } from './subscriptions/subscriptions.service';
import { ProvidersService } from './providers/providers.service';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma.module';

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
    TrackingEventsController,
    NotificationsController,
    AlertsController,
    SubscriptionsController,
    ProvidersController,
    HealthController,
  ],
  providers: [
    TrackingEventsService,
    NotificationsService,
    AlertsService,
    SubscriptionsService,
    ProvidersService,
  ],
})
export class AppModule {}