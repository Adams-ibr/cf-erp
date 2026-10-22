import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { DemurrageController } from './demurrage/demurrage.controller';
import { DetentionController } from './detention/detention.controller';
import { StorageController } from './storage/storage.controller';
import { ChargesController } from './charges/charges.controller';
import { WaiversController } from './waivers/waivers.controller';
import { DisputesController } from './disputes/disputes.controller';
import { ReportsController } from './reports/reports.controller';
import { DemurrageService } from './demurrage/demurrage.service';
import { DetentionService } from './detention/detention.service';
import { StorageService } from './storage/storage.service';
import { ChargesService } from './charges/charges.service';
import { WaiversService } from './waivers/waivers.service';
import { DisputesService } from './disputes/disputes.service';
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
    DemurrageController,
    DetentionController,
    StorageController,
    ChargesController,
    WaiversController,
    DisputesController,
    ReportsController,
    HealthController,
  ],
  providers: [
    DemurrageService,
    DetentionService,
    StorageService,
    ChargesService,
    WaiversService,
    DisputesService,
    ReportsService,
  ],
})
export class AppModule {}