import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@cf-erp/auth';
import { DatabaseModule } from '@cf-erp/database';
import { MessagingModule } from '@cf-erp/messaging';
import { env, envValidationSchema } from '@cf-erp/config';
import { DocumentsController } from './documents/documents.controller';
import { FoldersController } from './folders/folders.controller';
import { TemplatesController } from './templates/templates.controller';
import { VersionsController } from './versions/versions.controller';
import { AccessControlController } from './access-control/access-control.controller';
import { OCRController } from './ocr/ocr.controller';
import { ClassificationController } from './classification/classification.controller';
import { DocumentsService } from './documents/documents.service';
import { FoldersService } from './folders/folders.service';
import { TemplatesService } from './templates/templates.service';
import { VersionsService } from './versions/versions.service';
import { AccessControlService } from './access-control/access-control.service';
import { OCRService } from './ocr/ocr.service';
import { ClassificationService } from './classification/classification.service';
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
    DocumentsController,
    FoldersController,
    TemplatesController,
    VersionsController,
    AccessControlController,
    OCRController,
    ClassificationController,
    HealthController,
  ],
  providers: [
    DocumentsService,
    FoldersService,
    TemplatesService,
    VersionsService,
    AccessControlService,
    OCRService,
    ClassificationService,
  ],
})
export class AppModule {}