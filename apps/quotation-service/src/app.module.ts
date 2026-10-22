import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { QuotationsController } from './quotations/quotations.controller';
import { RatesController } from './rates/rates.controller';
import { RateCardsController } from './rate-cards/rate-cards.controller';
import { ValidityRulesController } from './validity-rules/validity-rules.controller';
import { QuotationsService } from './quotations/quotations.service';
import { RatesService } from './rates/rates.service';
import { RateCardsService } from './rate-cards/rate-cards.service';
import { ValidityRulesService } from './validity-rules/validity-rules.service';
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
    QuotationsController,
    RatesController,
    RateCardsController,
    ValidityRulesController,
    HealthController,
  ],
  providers: [
    QuotationsService,
    RatesService,
    RateCardsService,
    ValidityRulesService,
  ],
})
export class AppModule {}