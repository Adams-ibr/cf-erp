import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import rTracer from 'cls-rtracer';
import { AppModule } from './app.module';
import { env } from '@cf-erp/config';
import { AllExceptionsFilter } from '@cf-erp/shared';
import { LoggingInterceptor, ResponseTransformInterceptor } from '@cf-erp/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(rTracer.expressMiddleware({
    headerName: 'x-request-id',
    useHeader: true,
    echoHeader: true,
  }));

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(compression());

  app.use(rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: env.rateLimit.skipSuccessfulRequests,
    skipFailedRequests: env.rateLimit.skipFailedRequests,
  }));

  app.enableCors({
    origin: env.cors.origin,
    methods: env.cors.methods,
    allowedHeaders: env.cors.allowedHeaders,
    credentials: env.cors.credentials,
    maxAge: env.cors.maxAge,
  });

  app.setGlobalPrefix(env.app.apiPrefix);
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: env.isProduction,
  }));

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseTransformInterceptor());

  if (env.swagger.enabled) {
    const config = new DocumentBuilder()
      .setTitle(env.swagger.title)
      .setDescription(env.swagger.description)
      .setVersion(env.swagger.version)
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
      .addApiKey({ type: 'apiKey', name: 'x-branch-id', in: 'header' }, 'branch-id')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(env.swagger.path, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
  }

  await app.listen(env.app.port, env.app.host);
  console.log(`🚀 API Gateway running on http://${env.app.host}:${env.app.port}${env.app.apiPrefix}`);
  console.log(`📚 Swagger docs: http://${env.app.host}:${env.app.port}${env.swagger.path}`);
}

bootstrap();