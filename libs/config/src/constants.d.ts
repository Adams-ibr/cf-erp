export declare const CONFIG_CONSTANTS: {
    readonly APP: {
        readonly NAME: "CF-ERP";
        readonly VERSION: "1.0.0";
        readonly DEFAULT_PORT: 3000;
        readonly DEFAULT_HOST: "0.0.0.0";
        readonly DEFAULT_API_PREFIX: "api/v1";
    };
    readonly DATABASE: {
        readonly DEFAULT_PORT: 5432;
        readonly DEFAULT_POOL_SIZE: 10;
        readonly DEFAULT_CONNECTION_TIMEOUT: 30000;
        readonly DEFAULT_SSL: false;
    };
    readonly REDIS: {
        readonly DEFAULT_PORT: 6379;
        readonly DEFAULT_DB: 0;
        readonly DEFAULT_CONNECTION_TIMEOUT: 10000;
        readonly DEFAULT_MAX_RETRIES: 3;
    };
    readonly JWT: {
        readonly DEFAULT_EXPIRES_IN: "24h";
        readonly DEFAULT_REFRESH_EXPIRES_IN: "7d";
        readonly DEFAULT_ISSUER: "cf-erp";
        readonly DEFAULT_AUDIENCE: "cf-erp-api";
        readonly MIN_SECRET_LENGTH: 32;
    };
    readonly RABBITMQ: {
        readonly DEFAULT_PORT: 5672;
        readonly DEFAULT_VHOST: "/";
        readonly DEFAULT_CONNECTION_TIMEOUT: 10000;
        readonly DEFAULT_HEARTBEAT: 60;
    };
    readonly KAFKA: {
        readonly DEFAULT_CLIENT_ID: "cf-erp";
        readonly DEFAULT_GROUP_ID: "cf-erp-group";
        readonly DEFAULT_SSL: false;
        readonly DEFAULT_SASL: false;
    };
    readonly EMAIL: {
        readonly DEFAULT_PROVIDER: "smtp";
        readonly DEFAULT_PORT: 587;
        readonly DEFAULT_SECURE: false;
        readonly DEFAULT_FROM: "noreply@cf-erp.com";
        readonly DEFAULT_FROM_NAME: "CF-ERP";
    };
    readonly SMS: {
        readonly DEFAULT_PROVIDER: "twilio";
    };
    readonly PUSH: {
        readonly DEFAULT_PROVIDER: "firebase";
    };
    readonly STORAGE: {
        readonly DEFAULT_PROVIDER: "local";
        readonly DEFAULT_MAX_FILE_SIZE: number;
    };
    readonly LOGGING: {
        readonly DEFAULT_LEVEL: "info";
        readonly DEFAULT_FORMAT: "json";
        readonly DEFAULT_DIR: "./logs";
        readonly DEFAULT_MAX_FILES: 30;
        readonly DEFAULT_MAX_SIZE: "10m";
    };
    readonly MONITORING: {
        readonly DEFAULT_PROMETHEUS_PORT: 9090;
        readonly DEFAULT_PROMETHEUS_PATH: "/metrics";
        readonly DEFAULT_SENTRY_TRACES_SAMPLE_RATE: 0.1;
        readonly DEFAULT_DATADOG_SITE: "datadoghq.com";
    };
    readonly RATE_LIMIT: {
        readonly DEFAULT_ENABLED: true;
        readonly DEFAULT_WINDOW_MS: 60000;
        readonly DEFAULT_MAX_REQUESTS: 100;
        readonly DEFAULT_SKIP_SUCCESS: false;
        readonly DEFAULT_SKIP_FAILED: false;
    };
    readonly CORS: {
        readonly DEFAULT_ORIGIN: "*";
        readonly DEFAULT_METHODS: readonly ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"];
        readonly DEFAULT_ALLOWED_HEADERS: readonly ["Content-Type", "Authorization"];
        readonly DEFAULT_CREDENTIALS: false;
        readonly DEFAULT_MAX_AGE: 86400;
    };
    readonly SWAGGER: {
        readonly DEFAULT_ENABLED: true;
        readonly DEFAULT_PATH: "api/docs";
        readonly DEFAULT_TITLE: "CF-ERP API";
        readonly DEFAULT_VERSION: "1.0.0";
    };
    readonly FEATURE_FLAGS: {
        readonly DEFAULT_CUSTOMER_PORTAL: false;
        readonly DEFAULT_MOBILE_APP: false;
        readonly DEFAULT_AI_ASSISTANT: false;
        readonly DEFAULT_ADVANCED_ANALYTICS: false;
        readonly DEFAULT_BLOCKCHAIN_TRACKING: false;
    };
    readonly INTEGRATIONS: {
        readonly DEFAULT_CUSTOMS_ENABLED: false;
        readonly DEFAULT_SHIPPING_LINES_ENABLED: false;
        readonly DEFAULT_PORTS_ENABLED: false;
        readonly DEFAULT_BANKS_ENABLED: false;
        readonly DEFAULT_ERP_ENABLED: false;
    };
};
