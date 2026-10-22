import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { DutiesController } from './duties/duties.controller';
import { TaxesController } from './taxes/taxes.controller';
import { DisbursementsController } from './disbursements/disbursements.controller';
import { TariffCodesController } from './tariff-codes/tariff-codes.controller';
import { TradeAgreementsController } from './trade-agreements/trade-agreements.controller';
import { ExemptionsController } from './exemptions/exemptions.controller';
import { RefundsController } from './refunds/refunds.controller';
import { ReportsController } from './reports/reports.controller';
import { DutiesService } from './duties/duties.service';
import { TaxesService } from './taxes/taxes.service';
import { DisbursementsService } from './disbursements/disbursements.service';
import { TariffCodesService } from './tariff-codes/tariff-codes.service';
import { TradeAgreementsService } from './trade-agreements/trade-agreements.service';
import { ExemptionsService } from './exemptions/exemptions.service';
import { RefundsService } from './refunds/refunds.service';
import { ReportsService } from './reports/reports.service';
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
    DutiesController,
    TaxesController,
    DisbursementsController,
    TariffCodesController,
    TradeAgreementsController,
    ExemptionsController,
    RefundsController,
    ReportsController,
    HealthController,
  ],
  providers: [
    DutiesService,
    TaxesService,
    DisbursementsService,
    TariffCodesService,
    TradeAgreementsService,
    ExemptionsService,
    RefundsService,
    ReportsService,
  ],
})
export class AppModule {}