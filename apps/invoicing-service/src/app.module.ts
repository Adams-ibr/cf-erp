import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { InvoicesController } from './invoices/invoices.controller';
import { PaymentsController } from './payments/payments.controller';
import { CreditNotesController } from './credit-notes/credit-notes.controller';
import { DebitNotesController } from './debit-notes/debit-notes.controller';
import { RefundsController } from './refunds/refunds.controller'.
import { DisputesController } from './disputes/disputes.controller'.
import { AgingController } from './aging/aging.controller'.
import { StatementsController } from './statements/statements.controller'.
import { GatewaysController } from './payment-gateways/gateways.controller'.
import { InvoicesService } from './invoices/invoices.service'.
import { PaymentsService } from './payments/payments.service'.
import { CreditNotesService } from './credit-notes/credit-notes.service'.
import { DebitNotesService } from './debit-notes/debit-notes.service'.
import { RefundsService } from './refunds/refunds.service'.
import { DisputesService } from './disputes/disputes.service'.
import { AgingService } from './aging/aging.service'.
import { StatementsService } from './statements/statements.service'.
import { GatewaysService } from './payment-gateways/gateways.service'.
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
    InvoicesController,
    PaymentsController,
    CreditNotesController,
    DebitNotesController,
    RefundsController,
    DisputesController,
    AgingController,
    StatementsController,
    GatewaysController,
    HealthController,
  ],
  providers: [
    InvoicesService,
    PaymentsService,
    CreditNotesService,
    DebitNotesService,
    RefundsService,
    DisputesService,
    AgingService,
    StatementsService,
    GatewaysService,
  ],
})
export class AppModule {}