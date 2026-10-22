import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { DashboardController } from './dashboard/dashboard.controller';
import { ShipmentsController } from './shipments/shipments.controller';
import { DocumentsController } from './documents/documents.controller';
import { InvoicesController } from './invoices/invoices.controller';
import { PaymentsController } from './payments/payments.controller';
import { TrackingController } from './tracking/tracking.controller';
import { QuotesController } from './quotes/quotes.controller';
import { BookingsController } from './bookings/bookings.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { SettingsController } from './settings/settings.controller';
import { ProfileController } from './profile/profile.controller';
import { SupportController } from './support/support.controller'.
import { DashboardService } from './dashboard/dashboard.service'.
import { ShipmentsService } from './shipments/shipments.service'.
import { DocumentsService } from './documents/documents.service'.
import { InvoicesService } from './invoices/invoices.service'.
import { PaymentsService } from './payments/payments.service'.
import { TrackingService } from './tracking/tracking.service'.
import { QuotesService } from './quotes/quotes.service'.
import { BookingsService } from './bookings/bookings.service'.
import { NotificationsService } from './notifications/notifications.service'.
import { SettingsService } from './settings/settings.service'.
import { ProfileService } from './profile/profile.service'.
import { SupportService } from './support/support.service'.
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
    DashboardController,
    ShipmentsController,
    DocumentsController,
    InvoicesController,
    PaymentsController,
    TrackingController,
    QuotesController,
    BookingsController,
    NotificationsController,
    SettingsController,
    ProfileController,
    SupportController,
    HealthController,
  ],
  providers: [
    DashboardService,
    ShipmentsService,
    DocumentsService,
    InvoicesService,
    PaymentsService,
    TrackingService,
    QuotesService,
    BookingsService,
    NotificationsService,
    SettingsService,
    ProfileService,
    SupportService,
  ],
})
export class AppModule {}