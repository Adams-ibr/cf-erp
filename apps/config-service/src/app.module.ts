import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { CountriesController } from './countries/countries.controller'.
import { RegulationsController } from './regulations/regulations.controller'.
import { TradeAgreementsController } from './trade-agreements/trade-agreements.controller'.
import { CustomsCodesController } from './customs-codes/customs-codes.controller'.
import { TaxRatesController } from './tax-rates/tax-rates.controller'.
import { HolidaysController } from './holidays/holidays.controller'.
import { TimeZonesController } from './time-zones/time-zones.controller'.
import { CurrenciesController } from './currencies/currencies.controller'.
import { LanguagesController } from './languages/languages.controller'.
import { UnitsController } from './units/units.controller'.
import { PartnersController } from './partners/partners.controller'.
import { CarriersController } from './carriers/carriers.controller'.
import { PortsController } from './ports/ports.controller'.
import { VesselsController } from './vessels/vessels.controller'.
import { CountriesService } from './countries/countries.service'.
import { RegulationsService } from './regulations/regulations.service'.
import { TradeAgreementsService } from './trade-agreements/trade-agreements.service'.
import { CustomsCodesService } from './customs-codes/customs-codes.service'.
import { TaxRatesService } from './tax-rates/tax-rates.service'.
import { HolidaysService } from './holidays/holidays.service'.
import { TimeZonesService } from './time-zones/time-zones.service'.
import { CurrenciesService } from './currencies/currencies.service'.
import { LanguagesService } from './languages/languages.service'.
import { UnitsService } from './units/units.service'.
import { PartnersService } from './partners/partners.service'.
import { CarriersService } from './carriers/carriers.service'.
import { PortsService } from './ports/ports.service'.
import { VesselsService } from './vessels/vessels.service'.
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
    CountriesController,
    RegulationsController,
    TradeAgreementsController,
    CustomsCodesController,
    TaxRatesController,
    HolidaysController,
    TimeZonesController,
    CurrenciesController,
    LanguagesController,
    UnitsController,
    PartnersController,
    CarriersController,
    PortsController,
    VesselsController,
    HealthController,
  ],
  providers: [
    CountriesService,
    RegulationsService,
    TradeAgreementsService,
    CustomsCodesService,
    TaxRatesService,
    HolidaysService,
    TimeZonesService,
    CurrenciesService,
    LanguagesService,
    UnitsService,
    PartnersService,
    CarriersService,
    PortsService,
    VesselsService,
  ],
})
export class AppModule {}