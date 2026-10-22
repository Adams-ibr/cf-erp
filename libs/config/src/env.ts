import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`) });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  app: {
    name: process.env.APP_NAME || 'CF-ERP',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  },

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cf_erp',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'cf_erp',
    schema: process.env.DB_SCHEMA || 'public',
    ssl: process.env.DB_SSL === 'true',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true',
    connectionTimeout: parseInt(process.env.REDIS_CONNECTION_TIMEOUT || '10000', 10),
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'cf-erp',
    audience: process.env.JWT_AUDIENCE || 'cf-erp-api',
  },

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    host: process.env.RABBITMQ_HOST || 'localhost',
    port: parseInt(process.env.RABBITMQ_PORT || '5672', 10),
    username: process.env.RABBITMQ_USERNAME || 'guest',
    password: process.env.RABBITMQ_PASSWORD || 'guest',
    vhost: process.env.RABBITMQ_VHOST || '/',
    connectionTimeout: parseInt(process.env.RABBITMQ_CONNECTION_TIMEOUT || '10000', 10),
    heartbeat: parseInt(process.env.RABBITMQ_HEARTBEAT || '60', 10),
  },

  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'cf-erp',
    groupId: process.env.KAFKA_GROUP_ID || 'cf-erp-group',
    ssl: process.env.KAFKA_SSL === 'true',
    sasl: process.env.KAFKA_SASL === 'true' ? {
      mechanism: process.env.KAFKA_SASL_MECHANISM || 'plain',
      username: process.env.KAFKA_SASL_USERNAME || '',
      password: process.env.KAFKA_SASL_PASSWORD || '',
    } : undefined,
  },

  email: {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      username: process.env.SMTP_USERNAME || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@cf-erp.com',
    fromName: process.env.EMAIL_FROM_NAME || 'CF-ERP',
    templatesDir: process.env.EMAIL_TEMPLATES_DIR || './templates/email',
  },

  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_FROM_NUMBER || '',
    },
    vonage: {
      apiKey: process.env.VONAGE_API_KEY || '',
      apiSecret: process.env.VONAGE_API_SECRET || '',
      fromNumber: process.env.VONAGE_FROM_NUMBER || '',
    },
  },

  push: {
    provider: process.env.PUSH_PROVIDER || 'firebase',
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    },
    apns: {
      keyId: process.env.APNS_KEY_ID || '',
      teamId: process.env.APNS_TEAM_ID || '',
      privateKey: process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      production: process.env.APNS_PRODUCTION === 'true',
    },
  },

  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    local: {
      uploadDir: process.env.UPLOAD_DIR || './uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
    },
    s3: {
      region: process.env.AWS_S3_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || '',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      endpoint: process.env.AWS_S3_ENDPOINT || undefined,
      cdnUrl: process.env.AWS_S3_CDN_URL || undefined,
    },
    gcs: {
      projectId: process.env.GCS_PROJECT_ID || '',
      bucket: process.env.GCS_BUCKET || '',
      keyFile: process.env.GCS_KEY_FILE || '',
    },
    azure: {
      accountName: process.env.AZURE_STORAGE_ACCOUNT || '',
      accountKey: process.env.AZURE_STORAGE_KEY || '',
      container: process.env.AZURE_STORAGE_CONTAINER || '',
    },
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    dir: process.env.LOG_DIR || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '30', 10),
    maxSize: process.env.LOG_MAX_SIZE || '10m',
  },

  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
      path: process.env.PROMETHEUS_PATH || '/metrics',
    },
    sentry: {
      dsn: process.env.SENTRY_DSN || '',
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    },
    datadog: {
      apiKey: process.env.DATADOG_API_KEY || '',
      appKey: process.env.DATADOG_APP_KEY || '',
      site: process.env.DATADOG_SITE || 'datadoghq.com',
    },
  },

  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESS === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: (process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE').split(','),
    allowedHeaders: (process.env.CORS_ALLOWED_HEADERS || 'Content-Type,Authorization').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
  },

  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false',
    path: process.env.SWAGGER_PATH || 'api/docs',
    title: process.env.SWAGGER_TITLE || 'CF-ERP API',
    description: process.env.SWAGGER_DESCRIPTION || 'Clearing & Forwarding ERP API Documentation',
    version: process.env.SWAGGER_VERSION || '1.0.0',
  },

  featureFlags: {
    enableCustomerPortal: process.env.FF_CUSTOMER_PORTAL === 'true',
    enableMobileApp: process.env.FF_MOBILE_APP === 'true',
    enableAiAssistant: process.env.FF_AI_ASSISTANT === 'true',
    enableAdvancedAnalytics: process.env.FF_ADVANCED_ANALYTICS === 'true',
    enableBlockchainTracking: process.env.FF_BLOCKCHAIN_TRACKING === 'true',
  },

  integrations: {
    customs: {
      enabled: process.env.CUSTOMS_INTEGRATION_ENABLED === 'true',
      apiUrl: process.env.CUSTOMS_API_URL || '',
      apiKey: process.env.CUSTOMS_API_KEY || '',
    },
    shippingLines: {
      enabled: process.env.SHIPPING_LINES_INTEGRATION_ENABLED === 'true',
      apiUrl: process.env.SHIPPING_LINES_API_URL || '',
      apiKey: process.env.SHIPPING_LINES_API_KEY || '',
    },
    ports: {
      enabled: process.env.PORTS_INTEGRATION_ENABLED === 'true',
      apiUrl: process.env.PORTS_API_URL || '',
      apiKey: process.env.PORTS_API_KEY || '',
    },
    banks: {
      enabled: process.env.BANKS_INTEGRATION_ENABLED === 'true',
      apiUrl: process.env.BANKS_API_URL || '',
      apiKey: process.env.BANKS_API_KEY || '',
    },
    erp: {
      enabled: process.env.ERP_INTEGRATION_ENABLED === 'true',
      apiUrl: process.env.ERP_API_URL || '',
      apiKey: process.env.ERP_API_KEY || '',
    },
  },
};