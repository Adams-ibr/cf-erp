import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { SuppliersController } from './suppliers/suppliers.controller';
import { OverseasAgentsController } from './overseas-agents/overseas-agents.controller';
import { CarriersController } from './carriers/carriers.controller';
import { ContractsController } from './contracts/contracts.controller';
import { PerformanceController } from './performance/performance.controller';
import { CommissionsController } from './commissions/commissions.controller';
import { CommunicationsController } from './communications/communications.controller';
import { ComplianceController } from './compliance/compliance.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { OverseasAgentsService } from './overseas-agents/overseas-agents.service';
import { CarriersService } from './carriers/carriers.service';
import { ContractsService } from './contracts/contracts.service';
import { PerformanceService } from './performance/performance.service';
import { CommissionsService } from './commissions/commissions.service';
import { CommunicationsService } from './communications/communications.service';
import { ComplianceService } from './compliance/compliance.service';
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
    SuppliersController,
    OverseasAgentsController,
    CarriersController,
    ContractsController,
    PerformanceController,
    CommissionsController,
    CommunicationsController,
    ComplianceController,
    HealthController,
  ],
  providers: [
    SuppliersService,
    OverseasAgentsService,
    CarriersService,
    ContractsService,
    PerformanceService,
    CommissionsService,
    CommunicationsService,
    ComplianceService,
  ],
})
export class AppModule {}