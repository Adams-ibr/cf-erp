import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { CurrenciesController } from './currencies/currencies.controller'.
import { ExchangeRatesController } from './exchange-rates/exchange-rates.controller'.
import { ConversionsController } from './conversions/conversions.controller'.
import { HistoricalRatesController } from './historical-rates/historical-rates.controller'.
import { AlertsController } from './alerts/alerts.controller'.
import { ProvidersController } from './providers/providers.controller'.
import { AccountsController } from './accounts/accounts.controller'.
import { TransactionsController } from './transactions/transactions.controller'.
import { SettlementsController } from './settlements/settlements.controller'.
import { ReportsController } from './reports/reports.controller'.
import { CurrenciesService } from './currencies/currencies.service'.
import { ExchangeRatesService } from './exchange-rates/exchange-rates.service'.
import { ConversionsService } from './conversions/conversions.service'.
import { HistoricalRatesService } from './historical-rates/historical-rates.service'.
import { AlertsService } from './alerts/alerts.service'.
import { ProvidersService } from './providers/providers.service'.
import { AccountsService } from './accounts/accounts.service'.
import { TransactionsService } from './transactions/transactions.service'.
import { SettlementsService } from './settlements/settlements.service'.
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
    CurrenciesController,
    ExchangeRatesController,
    ConversionsController,
    HistoricalRatesController,
    AlertsController,
    ProvidersController,
    AccountsController,
    TransactionsController,
    SettlementsController,
    ReportsController,
    HealthController,
  ],
  providers: [
    CurrenciesService,
    ExchangeRatesService,
    ConversionsService,
    HistoricalRatesService,
    AlertsService,
    ProvidersService,
    AccountsService,
    TransactionsService,
    SettlementsService,
    ReportsService,
  ],
})
export class AppModule {}