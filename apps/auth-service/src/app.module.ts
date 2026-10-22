import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule, AuthService, JwtStrategy, LocalStrategy } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { AuthController } from './auth.controller';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';
import { TenantsController } from './tenants.controller';
import { HealthController } from './health.controller';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { TenantsService } from './tenants.service';
import { InvitationsService } from './invitations.service';
import { AuditService } from './audit.service';
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
    AuthController,
    UsersController,
    RolesController,
    TenantsController,
    HealthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    UsersService,
    RolesService,
    TenantsService,
    InvitationsService,
    AuditService,
  ],
})
export class AppModule {}