import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { BookingsController } from './bookings/bookings.controller';
import { CarriersController } from './carriers/carriers.controller';
import { VesselsController } from './vessels/vessels.controller';
import { VoyagesController } from './voyages/voyages.controller';
import { SpacesController } from './spaces/spaces.controller';
import { AllocationsController } from './allocations/allocations.controller';
import { BookingsService } from './bookings/bookings.service';
import { CarriersService } from './carriers/carriers.service';
import { VesselsService } from './vessels/vessels.service';
import { VoyagesService } from './voyages/voyages.service';
import { SpacesService } from './spaces/spaces.service';
import { AllocationsService } from './allocations/allocations.service';
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
    BookingsController,
    CarriersController,
    VesselsController,
    VoyagesController,
    SpacesController,
    AllocationsController,
    HealthController,
  ],
  providers: [
    BookingsService,
    CarriersService,
    VesselsService,
    VoyagesService,
    SpacesService,
    AllocationsService,
  ],
})
export class AppModule {}