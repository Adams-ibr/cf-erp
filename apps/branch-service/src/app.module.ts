import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { BranchesController } from './branches/branches.controller'.
import { RegionsController } from './regions/regions.controller'.
import { CountriesController } from './countries/countries.controller'.
import { LocationsController } from './locations/locations.controller'.
import { UsersController } from './users/users.controller'.
import { SettingsController } from './settings/settings.controller'.
import { RegulationsController } from './regulations/regulations.controller'.
import { BranchesService } from './branches/branches.service'.
import { RegionsService } from './regions/regions.service'.
import { CountriesService } from './countries/countries.service'.
import { LocationsService } from './locations/locations.service'.
import { UsersService } from './users/users.service'.
import { SettingsService } from './settings/settings.service'.
import { RegulationsService } from './regulations/regulations.service'.
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
    AuthModule,
    DatabaseModule,
    MessagingModule,
    PrismaModule,
  ],
  controllers: [
    BranchesController,
    RegionsController,
    CountriesController,
    LocationsController,
    UsersController,
    SettingsController,
    RegulationsController,
    HealthController,
  ],
  providers: [
    BranchesService,
    RegionsService,
    CountriesService,
    LocationsService,
    UsersService,
    SettingsService,
    RegulationsService,
  ],
})
export class AppModule {}