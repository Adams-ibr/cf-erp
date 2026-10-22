import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { SettingsController } from './settings/settings.controller'.
import { ConfigurationsController } from './configurations/configurations.controller'.
import { FeatureFlagsController } from './feature-flags/feature-flags.controller'.
import { MaintenanceController } from './maintenance/maintenance.controller'.
import { BackupsController } from './backups/backups.controller'.
import { LogsController } from './logs/logs.controller'.
import { MetricsController } from './metrics/metrics.controller'.
import { LicensesController } from './licenses/licenses.controller'.
import { UpgradesController } from './upgrades/upgrades.controller'.
import { SecurityController } from './security/security.controller'.
import { SettingsService } from './settings/settings.service'.
import { ConfigurationsService } from './configurations/configurations.service'.
import { FeatureFlagsService } from './feature-flags/feature-flags.service'.
import { MaintenanceService } from './maintenance/maintenance.service'.
import { BackupsService } from './backups/backups.service'.
import { LogsService } from './logs/logs.service'.
import { MetricsService } from './metrics/metrics.service'.
import { LicensesService } from './licenses/licenses.service'.
import { UpgradesService } from './upgrades/upgrades.service'.
import { SecurityService } from './security/security.service'.
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
    SettingsController,
    ConfigurationsController,
    FeatureFlagsController,
    MaintenanceController,
    BackupsController,
    LogsController,
    MetricsController,
    LicensesController,
    UpgradesController,
    SecurityController,
    HealthController,
  ],
  providers: [
    SettingsService,
    ConfigurationsService,
    FeatureFlagsService,
    MaintenanceService,
    BackupsService,
    LogsService,
    MetricsService,
    LicensesService,
    UpgradesService,
    SecurityService,
  ],
})
export class AppModule {}