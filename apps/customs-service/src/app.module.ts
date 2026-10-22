import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { CustomsEntriesController } from './customs-entries/customs-entries.controller';
import { TariffCodesController } from './tariff-codes/tariff-codes.controller';
import { TradeAgreementsController } from './trade-agreements/trade-agreements.controller';
import { CustomsBrokersController } from './customs-brokers/customs-brokers.controller';
import { DocumentsController } from './documents/documents.controller';
import { InspectionsController } from './inspections/inspections.controller';
import { FeesController } from './fees/fees.controller';
import { ComplianceRulesController } from './compliance-rules/compliance-rules.controller';
import { CustomsEntriesService } from './customs-entries/customs-entries.service';
import { TariffCodesService } from './tariff-codes/tariff-codes.service';
import { TradeAgreementsService } from './trade-agreements/trade-agreements.service';
import { CustomsBrokersService } from './customs-brokers/customs-brokers.service';
import { DocumentsService } from './documents/documents.service';
import { InspectionsService } from './inspections/inspections.service';
import { FeesService } from './fees/fees.service';
import { ComplianceRulesService } from './compliance-rules/compliance-rules.service';
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
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    CustomsEntriesController,
    TariffCodesController,
    TradeAgreementsController,
    CustomsBrokersController,
    DocumentsController,
    InspectionsController,
    FeesController,
    ComplianceRulesController,
    HealthController,
  ],
  providers: [
    CustomsEntriesService,
    TariffCodesService,
    TradeAgreementsService,
    CustomsBrokersService,
    DocumentsService,
    InspectionsService,
    FeesService,
    ComplianceRulesService,
  ],
})
export class AppModule {}