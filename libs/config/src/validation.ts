import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  HOST: Joi.string().default('0.0.0.0'),
  API_PREFIX: Joi.string().default('api/v1'),
  CORS_ORIGIN: Joi.string().default('*'),
  CORS_CREDENTIALS: Joi.boolean().default(false),

  DATABASE_URL: Joi.string().uri().required(),
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().port().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('cf_erp'),
  DB_SCHEMA: Joi.string().default('public'),
  DB_SSL: Joi.boolean().default(false),
  DB_POOL_SIZE: Joi.number().min(1).max(100).default(10),
  DB_CONNECTION_TIMEOUT: Joi.number().min(1000).default(30000),

  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().min(0).max(15).default(0),
  REDIS_TLS: Joi.boolean().default(false),
  REDIS_CONNECTION_TIMEOUT: Joi.number().min(1000).default(10000),
  REDIS_MAX_RETRIES: Joi.number().min(0).max(10).default(3),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  JWT_ISSUER: Joi.string().default('cf-erp'),
  JWT_AUDIENCE: Joi.string().default('cf-erp-api'),

  RABBITMQ_URL: Joi.string().uri().default('amqp://guest:guest@localhost:5672'),
  RABBITMQ_HOST: Joi.string().default('localhost'),
  RABBITMQ_PORT: Joi.number().port().default(5672),
  RABBITMQ_USERNAME: Joi.string().default('guest'),
  RABBITMQ_PASSWORD: Joi.string().default('guest'),
  RABBITMQ_VHOST: Joi.string().default('/'),
  RABBITMQ_CONNECTION_TIMEOUT: Joi.number().min(1000).default(10000),
  RABBITMQ_HEARTBEAT: Joi.number().min(10).default(60),

  KAFKA_BROKERS: Joi.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: Joi.string().default('cf-erp'),
  KAFKA_GROUP_ID: Joi.string().default('cf-erp-group'),
  KAFKA_SSL: Joi.boolean().default(false),
  KAFKA_SASL: Joi.boolean().default(false),
  KAFKA_SASL_MECHANISM: Joi.string().valid('plain', 'scram-sha-256', 'scram-sha-512').default('plain'),
  KAFKA_SASL_USERNAME: Joi.string().allow('').optional(),
  KAFKA_SASL_PASSWORD: Joi.string().allow('').optional(),

  EMAIL_PROVIDER: Joi.string().valid('smtp', 'sendgrid', 'mailgun', 'ses').default('smtp'),
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_SECURE: Joi.boolean().default(false),
  SMTP_USERNAME: Joi.string().allow('').optional(),
  SMTP_PASSWORD: Joi.string().allow('').optional(),
  EMAIL_FROM: Joi.string().email().default('noreply@cf-erp.com'),
  EMAIL_FROM_NAME: Joi.string().default('CF-ERP'),
  EMAIL_TEMPLATES_DIR: Joi.string().default('./templates/email'),

  SMS_PROVIDER: Joi.string().valid('twilio', 'vonage', 'plivo').default('twilio'),
  TWILIO_ACCOUNT_SID: Joi.string().allow('').optional(),
  TWILIO_AUTH_TOKEN: Joi.string().allow('').optional(),
  TWILIO_FROM_NUMBER: Joi.string().allow('').optional(),
  VONAGE_API_KEY: Joi.string().allow('').optional(),
  VONAGE_API_SECRET: Joi.string().allow('').optional(),
  VONAGE_FROM_NUMBER: Joi.string().allow('').optional(),

  PUSH_PROVIDER: Joi.string().valid('firebase', 'apns', 'onesignal').default('firebase'),
  FIREBASE_PROJECT_ID: Joi.string().allow('').optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().allow('').optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().allow('').optional(),
  APNS_KEY_ID: Joi.string().allow('').optional(),
  APNS_TEAM_ID: Joi.string().allow('').optional(),
  APNS_PRIVATE_KEY: Joi.string().allow('').optional(),
  APNS_PRODUCTION: Joi.boolean().default(false),

  STORAGE_PROVIDER: Joi.string().valid('local', 's3', 'gcs', 'azure').default('local'),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().min(1024).default(10485760),
  AWS_S3_REGION: Joi.string().default('us-east-1'),
  AWS_S3_BUCKET: Joi.string().allow('').optional(),
  AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
  AWS_S3_ENDPOINT: Joi.string().allow('').optional(),
  AWS_S3_CDN_URL: Joi.string().allow('').optional(),
  GCS_PROJECT_ID: Joi.string().allow('').optional(),
  GCS_BUCKET: Joi.string().allow('').optional(),
  GCS_KEY_FILE: Joi.string().allow('').optional(),
  AZURE_STORAGE_ACCOUNT: Joi.string().allow('').optional(),
  AZURE_STORAGE_KEY: Joi.string().allow('').optional(),
  AZURE_STORAGE_CONTAINER: Joi.string().allow('').optional(),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'simple').default('json'),
  LOG_DIR: Joi.string().default('./logs'),
  LOG_MAX_FILES: Joi.number().min(1).default(30),
  LOG_MAX_SIZE: Joi.string().default('10m'),

  MONITORING_ENABLED: Joi.boolean().default(false),
  PROMETHEUS_PORT: Joi.number().port().default(9090),
  PROMETHEUS_PATH: Joi.string().default('/metrics'),
  SENTRY_DSN: Joi.string().allow('').optional(),
  SENTRY_ENVIRONMENT: Joi.string().default('development'),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
  DATADOG_API_KEY: Joi.string().allow('').optional(),
  DATADOG_APP_KEY: Joi.string().allow('').optional(),
  DATADOG_SITE: Joi.string().default('datadoghq.com'),

  RATE_LIMIT_ENABLED: Joi.boolean().default(true),
  RATE_LIMIT_WINDOW_MS: Joi.number().min(1000).default(60000),
  RATE_LIMIT_MAX_REQUESTS: Joi.number().min(1).default(100),
  RATE_LIMIT_SKIP_SUCCESS: Joi.boolean().default(false),
  RATE_LIMIT_SKIP_FAILED: Joi.boolean().default(false),

  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('api/docs'),
  SWAGGER_TITLE: Joi.string().default('CF-ERP API'),
  SWAGGER_DESCRIPTION: Joi.string().default('Clearing & Forwarding ERP API Documentation'),
  SWAGGER_VERSION: Joi.string().default('1.0.0'),

  FF_CUSTOMER_PORTAL: Joi.boolean().default(false),
  FF_MOBILE_APP: Joi.boolean().default(false),
  FF_AI_ASSISTANT: Joi.boolean().default(false),
  FF_ADVANCED_ANALYTICS: Joi.boolean().default(false),
  FF_BLOCKCHAIN_TRACKING: Joi.boolean().default(false),

  CUSTOMS_INTEGRATION_ENABLED: Joi.boolean().default(false),
  CUSTOMS_API_URL: Joi.string().allow('').optional(),
  CUSTOMS_API_KEY: Joi.string().allow('').optional(),

  SHIPPING_LINES_INTEGRATION_ENABLED: Joi.boolean().default(false),
  SHIPPING_LINES_API_URL: Joi.string().allow('').optional(),
  SHIPPING_LINES_API_KEY: Joi.string().allow('').optional(),

  PORTS_INTEGRATION_ENABLED: Joi.boolean().default(false),
  PORTS_API_URL: Joi.string().allow('').optional(),
  PORTS_API_KEY: Joi.string().allow('').optional(),

  BANKS_INTEGRATION_ENABLED: Joi.boolean().default(false),
  BANKS_API_URL: Joi.string().allow('').optional(),
  BANKS_API_KEY: Joi.string().allow('').optional(),

  ERP_INTEGRATION_ENABLED: Joi.boolean().default(false),
  ERP_API_URL: Joi.string().allow('').optional(),
  ERP_API_KEY: Joi.string().allow('').optional(),
});

export function validateEnv(config: Record<string, unknown>): void {
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const messages = error.details.map(detail => `${detail.path.join('.')}: ${detail.message}`).join('\n');
    throw new Error(`Environment validation failed:\n${messages}`);
  }
}