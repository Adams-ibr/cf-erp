import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { IntegrationsController } from './integrations/integrations.controller'.
import { EndpointsController } from './endpoints/endpoints.controller'.
import { WebhooksController } from './webhooks/webhooks.controller'.
import { MappingsController } from './mappings/mappings.controller'.
import { CredentialsController } from './credentials/credentials.controller'.
import { MonitoringController } from './monitoring/monitoring.controller'.
import { TransformationsController } from './transformations/transformations.controller'.
import { SchemasController } from './schemas/schemas.controller'.
import { ApiKeysController } from './api-keys/api-keys.controller'.
import { RateLimitsController } from './rate-limits/rate-limits.controller'.
import { IntegrationsService } from './integrations/integrations.service'.
import { EndpointsService } from './endpoints/endpoints.service'.
import { WebhooksService } from './webhooks/webhooks.service'.
import { MappingsService } from './mappings/mappings.service'.
import { CredentialsService } from './credentials/credentials.service'.
import { MonitoringService } from './monitoring/monitoring.service'.
import { TransformationsService } from './transformations/transformations.service'.
import { SchemasService } from './schemas/schemas.service'.
import { ApiKeysService } from './api-keys/api-keys.service'.
import { RateLimitsService } from './rate-limits/rate-limits.service'.
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
    IntegrationsController,
    EndpointsController,
    WebhooksController,
    MappingsController,
    CredentialsController,
    MonitoringController,
    TransformationsController,
    SchemasController,
    ApiKeysController,
    RateLimitsController,
    HealthController,
  ],
  providers: [
    IntegrationsService,
    EndpointsService,
    WebhooksService,
    MappingsService,
    CredentialsService,
    MonitoringService,
    TransformationsService,
    SchemasService,
    ApiKeysService,
    RateLimitsService,
  ],
})
export class AppModule {}