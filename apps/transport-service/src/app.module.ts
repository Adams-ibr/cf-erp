import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { VehiclesController } from './vehicles/vehicles.controller';
import { DriversController } from './drivers/drivers.controller';
import { RoutesController } from './routes/routes.controller';
import { DeliveriesController } from './deliveries/deliveries.controller';
import { ProofOfDeliveryController } from './proof-of-delivery/proof-of-delivery.controller';
import { MaintenanceController } from './fleet-maintenance/maintenance.controller';
import { FuelController } from './fuel-management/fuel.controller';
import { VehiclesService } from './vehicles/vehicles.service';
import { DriversService } from './drivers/drivers.service';
import { RoutesService } from './routes/routes.service';
import { DeliveriesService } from './deliveries/deliveries.service';
import { ProofOfDeliveryService } from './proof-of-delivery/proof-of-delivery.service';
import { MaintenanceService } from './fleet-maintenance/maintenance.service';
import { FuelService } from './fuel-management/fuel.service';
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
    VehiclesController,
    DriversController,
    RoutesController,
    DeliveriesController,
    ProofOfDeliveryController,
    MaintenanceController,
    FuelController,
    HealthController,
  ],
  providers: [
    VehiclesService,
    DriversService,
    RoutesService,
    DeliveriesService,
    ProofOfDeliveryService,
    MaintenanceService,
    FuelService,
  ],
})
export class AppModule {}