import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { env, envValidationSchema } from '@cf-erp/config';
import { AuthModule, JwtAuthGuard, PermissionsGuard, RolesGuard } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { HealthController } from './health.controller';
import { LoggingInterceptor, ResponseTransformInterceptor } from '@cf-erp/shared';

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
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
  ],
})
export class AppModule {}