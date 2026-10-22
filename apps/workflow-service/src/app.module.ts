import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { WorkflowsController } from './workflows/workflows.controller';
import { TasksController } from './tasks/tasks.controller';
import { ProcessesController } from './processes/processes.controller';
import { AutomationController } from './automation/automation.controller';
import { FormsController } from './forms/forms.controller';
import { ApprovalsController } from './approvals/approvals.controller'.
import { NotificationsController } from './notifications/notifications.controller'.
import { WorkflowsService } from './workflows/workflows.service'.
import { TasksService } from './tasks/tasks.service'.
import { ProcessesService } from './processes/processes.service'.
import { AutomationService } from './automation/automation.service'.
import { FormsService } from './forms/forms.service'.
import { ApprovalsService } from './approvals/approvals.service'.
import { NotificationsService } from './notifications/notifications.service'.
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
    WorkflowsController,
    TasksController,
    ProcessesController,
    AutomationController,
    FormsController,
    ApprovalsController,
    NotificationsController,
    HealthController,
  ],
  providers: [
    WorkflowsService,
    TasksService,
    ProcessesService,
    AutomationService,
    FormsService,
    ApprovalsService,
    NotificationsService,
  ],
})
export class AppModule {}