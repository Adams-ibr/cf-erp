import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { JobsController } from './jobs/jobs.controller';
import { ShipmentsController } from './shipments/shipments.controller';
import { LegsController } from './legs/legs.controller';
import { MilestonesController } from './milestones/milestones.controller';
import { JobsService } from './jobs/jobs.service';
import { ShipmentsService } from './shipments/shipments.service';
import { LegsService } from './legs/legs.service';
import { MilestonesService } from './milestones/milestones.service';
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
    JobsController,
    ShipmentsController,
    LegsController,
    MilestonesController,
    HealthController,
  ],
  providers: [
    JobsService,
    ShipmentsService,
    LegsService,
    MilestonesService,
  ],
})
export class AppModule {}