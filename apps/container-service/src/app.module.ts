import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { ContainersController } from './containers/containers.controller';
import { ContainerTypesController } from './container-types/container-types.controller';
import { MovementsController } from './container-movements/movements.controller';
import { InspectionsController } from './container-inspections/inspections.controller';
import { RepairsController } from './container-repairs/repairs.controller';
import { LeasingController } from './container-leasing/leasing.controller';
import { SalesController } from './container-sales/sales.controller';
import { ContainersService } from './containers/containers.service';
import { ContainerTypesService } from './container-types/container-types.service';
import { MovementsService } from './container-movements/movements.service';
import { InspectionsService } from './container-inspections/inspections.service';
import { RepairsService } from './container-repairs/repairs.service';
import { LeasingService } from './container-leasing/leasing.service';
import { SalesService } from './container-sales/sales.service';
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
    ContainersController,
    ContainerTypesController,
    MovementsController,
    InspectionsController,
    RepairsController,
    LeasingController,
    SalesController,
    HealthController,
  ],
  providers: [
    ContainersService,
    ContainerTypesService,
    MovementsService,
    InspectionsService,
    RepairsService,
    LeasingService,
    SalesService,
  ],
})
export class AppModule {}