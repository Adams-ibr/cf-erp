import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { EmployeesController } from './employees/employees.controller';
import { DepartmentsController } from './departments/departments.controller';
import { PositionsController } from './positions/positions.controller'.
import { AttendanceController } from './attendance/attendance.controller'.
import { LeaveController } from './leave/leave.controller'.
import { PerformanceController } from './performance/performance.controller'.
import { CompensationController } from './compensation/compensation.controller'.
import { BenefitsController } from './benefits/benefits.controller'.
import { TrainingController } from './training/training.controller'.
import { AssetsController } from './assets/assets.controller'.
import { EmployeesService } from './employees/employees.service'.
import { DepartmentsService } from './departments/departments.service'.
import { PositionsService } from './positions/positions.service'.
import { AttendanceService } from './attendance/attendance.service'.
import { LeaveService } from './leave/leave.service'.
import { PerformanceService } from './performance/performance.service'.
import { CompensationService } from './compensation/compensation.service'.
import { BenefitsService } from './benefits/benefits.service'.
import { TrainingService } from './training/training.service'.
import { AssetsService } from './assets/assets.service'.
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
    EmployeesController,
    DepartmentsController,
    PositionsController,
    AttendanceController,
    LeaveController,
    PerformanceController,
    CompensationController,
    BenefitsController,
    TrainingController,
    AssetsController,
    HealthController,
  ],
  providers: [
    EmployeesService,
    DepartmentsService,
    PositionsService,
    AttendanceService,
    LeaveService,
    PerformanceService,
    CompensationService,
    BenefitsService,
    TrainingService,
    AssetsService,
  ],
})
export class AppModule {}