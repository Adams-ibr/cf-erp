import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { AuditLogsController } from './audit-logs/audit-logs.controller'.
import { SecurityEventsController } from './security-events/security-events.controller'.
import { AccessLogsController } from './access-logs/access-logs.controller'.
import { ComplianceController } from './compliance/compliance.controller'.
import { EncryptionController } from './encryption/encryption.controller'.
import { KeyManagementController } from './key-management/key-management.controller'.
import { VulnerabilityController } from './vulnerability/vulnerability.controller'.
import { IncidentsController } from './incidents/incidents.controller'.
import { ForensicsController } from './forensics/forensics.controller'.
import { AlertsController } from './alerts/alerts.controller'.
import { AuditLogsService } from './audit-logs/audit-logs.service'.
import { SecurityEventsService } from './security-events/security-events.service'.
import { AccessLogsService } from './access-logs/access-logs.service'.
import { ComplianceService } from './compliance/compliance.service'.
import { EncryptionService } from './encryption/encryption.service'.
import { KeyManagementService } from './key-management/key-management.service'.
import { VulnerabilityService } from './vulnerability/vulnerability.service'.
import { IncidentsService } from './incidents/incidents.service'.
import { ForensicsService } from './forensics/forensics.service'.
import { AlertsService } from './alerts/alerts.service'.
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
    AuditLogsController,
    SecurityEventsController,
    AccessLogsController,
    ComplianceController,
    EncryptionController,
    KeyManagementController,
    VulnerabilityController,
    IncidentsController,
    ForensicsController,
    AlertsController,
    HealthController,
  ],
  providers: [
    AuditLogsService,
    SecurityEventsService,
    AccessLogsService,
    ComplianceService,
    EncryptionService,
    KeyManagementService,
    VulnerabilityService,
    IncidentsService,
    ForensicsService,
    AlertsService,
  ],
})
export class AppModule {}