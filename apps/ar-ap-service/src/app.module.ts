import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { ARInvoicesController } from './accounts-receivable/ar-invoices.controller';
import { ARPaymentsController } from './accounts-receivable/ar-payments.controller';
import { ARCreditMemosController } from './accounts-receivable/ar-credit-memos.controller';
import { ARActivitiesController } from './accounts-receivable/ar-activities.controller';
import { ARDisputesController } from './accounts-receivable/ar-disputes.controller';
import { APBillsController } from './accounts-payable/ap-bills.controller';
import { APPaymentsController } from './accounts-payable/ap-payments.controller';
import { APCreditMemosController } from './accounts-payable/ap-credit-memos.controller';
import { APActivitiesController } from './accounts-payable/ap-activities.controller';
import { APDisputesController } from './accounts-payable/ap-disputes.controller';
import { AgingController } from './aging/aging.controller';
import { CollectionsController } from './collections/collections.controller';
import { ReconciliationController } from './reconciliation/reconciliation.controller'.
import { ReportsController } from './reports/reports.controller'.
import { ARInvoicesService } from './accounts-receivable/ar-invoices.service'.
import { ARPaymentsService } from './accounts-receivable/ar-payments.service'.
import { ARCreditMemosService } from './accounts-receivable/ar-credit-memos.service'.
import { ARActivitiesService } from './accounts-receivable/ar-activities.service'.
import { ARDisputesService } from './accounts-receivable/ar-disputes.service'.
import { APBillsService } from './accounts-payable/ap-bills.service'.
import { APPaymentsService } from './accounts-payable/ap-payments.service'.
import { APCreditMemosService } from './accounts-payable/ap-credit-memos.service'.
import { APActivitiesService } from './accounts-payable/ap-activities.service'.
import { APDisputesService } from './accounts-payable/ap-disputes.service'.
import { AgingService } from './aging/aging.service'.
import { CollectionsService } from './collections/collections.service'.
import { ReconciliationService } from './reconciliation/reconciliation.service'.
import { ReportsService } from './reports/reports.service'.
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
    ARInvoicesController,
    ARPaymentsController,
    ARCreditMemosController,
    ARActivitiesController,
    ARDisputesController,
    APBillsController,
    APPaymentsController,
    APCreditMemosController,
    APActivitiesController,
    APDisputesController,
    AgingController,
    CollectionsController,
    ReconciliationController,
    ReportsController,
    HealthController,
  ],
  providers: [
    ARInvoicesService,
    ARPaymentsService,
    ARCreditMemosService,
    ARActivitiesService,
    ARDisputesService,
    APBillsService,
    APPaymentsService,
    APCreditMemosService,
    APActivitiesService,
    APDisputesService,
    AgingService,
    CollectionsService,
    ReconciliationService,
    ReportsService,
  ],
})
export class AppModule {}