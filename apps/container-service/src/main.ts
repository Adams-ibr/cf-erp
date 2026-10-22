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
      .setTitle('CF-ERP Container Service')
      .setDescription('Container Management Microservice')
      .setVersion('1.0.0')
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

  const port = parseInt(process.env.CONTAINER_SERVICE_PORT || '3011', 10);
  await app.listen(port, env.app.host);
  console.log(`📦 Container Service running on http://${env.app.host}:${port}${env.app.apiPrefix}`);
}

bootstrap();