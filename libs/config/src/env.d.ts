export declare const env: {
    nodeEnv: string;
    isDevelopment: boolean;
    isProduction: boolean;
    isTest: boolean;
    app: {
        name: string;
        version: string;
        port: number;
        host: string;
        apiPrefix: string;
        corsOrigin: string;
        corsCredentials: boolean;
    };
    database: {
        url: string;
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        schema: string;
        ssl: boolean;
        poolSize: number;
        connectionTimeout: number;
    };
    redis: {
        url: string;
        host: string;
        port: number;
        password: string;
        db: number;
        tls: boolean;
        connectionTimeout: number;
        maxRetriesPerRequest: number;
    };
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
        issuer: string;
        audience: string;
    };
    rabbitmq: {
        url: string;
        host: string;
        port: number;
        username: string;
        password: string;
        vhost: string;
        connectionTimeout: number;
        heartbeat: number;
    };
    kafka: {
        brokers: string[];
        clientId: string;
        groupId: string;
        ssl: boolean;
        sasl: {
            mechanism: string;
            username: string;
            password: string;
        };
    };
    email: {
        provider: string;
        smtp: {
            host: string;
            port: number;
            secure: boolean;
            username: string;
            password: string;
        };
        from: string;
        fromName: string;
        templatesDir: string;
    };
    sms: {
        provider: string;
        twilio: {
            accountSid: string;
            authToken: string;
            fromNumber: string;
        };
        vonage: {
            apiKey: string;
            apiSecret: string;
            fromNumber: string;
        };
    };
    push: {
        provider: string;
        firebase: {
            projectId: string;
            privateKey: string;
            clientEmail: string;
        };
        apns: {
            keyId: string;
            teamId: string;
            privateKey: string;
            production: boolean;
        };
    };
    storage: {
        provider: string;
        local: {
            uploadDir: string;
            maxFileSize: number;
        };
        s3: {
            region: string;
            bucket: string;
            accessKeyId: string;
            secretAccessKey: string;
            endpoint: string;
            cdnUrl: string;
        };
        gcs: {
            projectId: string;
            bucket: string;
            keyFile: string;
        };
        azure: {
            accountName: string;
            accountKey: string;
            container: string;
        };
    };
    logging: {
        level: string;
        format: string;
        dir: string;
        maxFiles: number;
        maxSize: string;
    };
    monitoring: {
        enabled: boolean;
        prometheus: {
            port: number;
            path: string;
        };
        sentry: {
            dsn: string;
            environment: string;
            tracesSampleRate: number;
        };
        datadog: {
            apiKey: string;
            appKey: string;
            site: string;
        };
    };
    rateLimit: {
        enabled: boolean;
        windowMs: number;
        maxRequests: number;
        skipSuccessfulRequests: boolean;
        skipFailedRequests: boolean;
    };
    cors: {
        origin: string;
        methods: string[];
        allowedHeaders: string[];
        credentials: boolean;
        maxAge: number;
    };
    swagger: {
        enabled: boolean;
        path: string;
        title: string;
        description: string;
        version: string;
    };
    featureFlags: {
        enableCustomerPortal: boolean;
        enableMobileApp: boolean;
        enableAiAssistant: boolean;
        enableAdvancedAnalytics: boolean;
        enableBlockchainTracking: boolean;
    };
    integrations: {
        customs: {
            enabled: boolean;
            apiUrl: string;
            apiKey: string;
        };
        shippingLines: {
            enabled: boolean;
            apiUrl: string;
            apiKey: string;
        };
        ports: {
            enabled: boolean;
            apiUrl: string;
            apiKey: string;
        };
        banks: {
            enabled: boolean;
            apiUrl: string;
            apiKey: string;
        };
        erp: {
            enabled: boolean;
            apiUrl: string;
            apiKey: string;
        };
    };
};
