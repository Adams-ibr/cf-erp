# CF-ERP: Clearing & Forwarding Company ERP System

A comprehensive, microservices-based ERP system for Clearing & Forwarding companies built with Node.js, TypeScript, NestJS, PostgreSQL, and modern cloud-native technologies.

## 🏗️ Architecture

### Monorepo Structure
```
cf-erp/
├── apps/                    # Microservices
│   ├── api-gateway/         # API Gateway (Port 3000)
│   ├── auth-service/        # Authentication & Authorization (Port 3001)
│   ├── customer-service/    # Customer & Supplier Management
│   ├── quotation-service/   # Quotation & Rate Management
│   ├── job-service/         # Job & Shipment Management
│   ├── booking-service/     # Freight Booking & Carrier Management
│   ├── customs-service/     # Customs Clearance & Compliance
│   ├── document-service/    # Document Management
│   ├── tracking-service/    # Shipment Tracking & Notifications
│   ├── warehouse-service/   # Warehouse & Inventory Management
│   ├── transport-service/   # Transport & Delivery Management
│   ├── container-service/   # Container Management
│   ├── demurrage-service/   # Demurrage, Detention & Storage
│   ├── finance-service/     # Finance & Accounting
│   ├── invoicing-service/   # Invoicing & Payment Management
│   ├── duty-service/        # Duty, Taxes & Disbursement
│   ├── ar-ap-service/       # Accounts Receivable & Payable
│   ├── agent-service/       # Supplier & Overseas Agent Management
│   ├── portal-service/      # Customer Portal
│   ├── workflow-service/    # Task & Workflow Management
│   ├── hr-service/          # HR & Staff Management
│   ├── reports-service/     # Reports & Business Intelligence
│   ├── audit-service/       # Audit Trail & Security
│   ├── branch-service/      # Multi-Branch Management
│   ├── config-service/      # Multi-Country & Regulatory Config
│   ├── currency-service/    # Multi-Currency Management
│   ├── integration-service/ # Integration & API Management
│   ├── notification-service/# Notifications & Communication
│   ├── admin-service/       # System Administration & Configuration
│   └── dashboard-service/   # Dashboard & Management Overview
├── libs/                    # Shared Libraries
│   ├── shared/              # Common types, DTOs, guards, interceptors
│   ├── config/              # Configuration management
│   ├── database/            # Database utilities (Prisma)
│   ├── messaging/           # RabbitMQ & Kafka clients
│   ├── auth/                # Authentication & Authorization
│   └── common/              # Common utilities
├── packages/                # NPM packages
├── tools/                   # Build & deployment tools
├── docs/                    # Documentation
├── monitoring/              # Prometheus & Grafana configs
└── docker-compose.yml       # Local development stack
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16+
- Redis 7+
- RabbitMQ 3.12+
- Kafka 3.5+ (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd cf-erp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start infrastructure**
```bash
npm run docker:up
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. **Run database migrations**
```bash
npm run db:migrate
```

6. **Seed the database**
```bash
npm run db:seed
```

7. **Start development servers**
```bash
npm run dev
```

### Access Points
- **API Gateway**: http://localhost:3000/api/v1
- **Auth Service**: http://localhost:3001/api/v1
- **Swagger Docs**: http://localhost:3000/api/docs
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
- **Jaeger**: http://localhost:16686

## 🔧 Configuration

### Environment Variables
Key configuration options in `.env`:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cf_erp

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-change-in-production

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672

# Kafka
KAFKA_BROKERS=localhost:9092

# Email
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
EMAIL_FROM=noreply@cf-erp.com

# Storage
STORAGE_PROVIDER=local
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

## 📦 Microservices

### Core Services
| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 3000 | Entry point, routing, rate limiting |
| Auth Service | 3001 | Authentication, authorization, users, roles, tenants |

### Business Services
| Service | Port | Module |
|---------|------|--------|
| Customer Service | 3002 | Customer & Supplier Management |
| Quotation Service | 3003 | Quotation & Rate Management |
| Job Service | 3004 | Job & Shipment Management |
| Booking Service | 3005 | Freight Booking & Carrier Management |
| Customs Service | 3006 | Customs Clearance & Compliance |
| Document Service | 3007 | Document Management |
| Tracking Service | 3008 | Shipment Tracking & Notifications |
| Warehouse Service | 3009 | Warehouse & Inventory Management |
| Transport Service | 3010 | Transport & Delivery Management |
| Container Service | 3011 | Container Management |
| Demurrage Service | 3012 | Demurrage, Detention & Storage |
| Finance Service | 3013 | Finance & Accounting |
| Invoicing Service | 3014 | Invoicing & Payment Management |
| Duty Service | 3015 | Duty, Taxes & Disbursement |
| AR/AP Service | 3016 | Accounts Receivable & Payable |
| Agent Service | 3017 | Supplier & Overseas Agent Management |
| Portal Service | 3018 | Customer Portal |
| Workflow Service | 3019 | Task & Workflow Management |
| HR Service | 3020 | HR & Staff Management |
| Reports Service | 3021 | Reports & Business Intelligence |
| Audit Service | 3022 | Audit Trail & Security |
| Branch Service | 3023 | Multi-Branch Management |
| Config Service | 3024 | Multi-Country & Regulatory Config |
| Currency Service | 3025 | Multi-Currency Management |
| Integration Service | 3026 | Integration & API Management |
| Notification Service | 3027 | Notifications & Communication |
| Admin Service | 3028 | System Administration & Configuration |
| Dashboard Service | 3029 | Dashboard & Management Overview |

## 🛠️ Development

### Running a Single Service
```bash
# Build specific service
npm run build --filter=@cf-erp/auth-service

# Run specific service in dev mode
npm run start:dev --filter=@cf-erp/auth-service
```

### Database Operations
```bash
# Generate Prisma client
npm run prisma:generate --filter=@cf-erp/auth-service

# Run migrations
npm run prisma:migrate --filter=@cf-erp/auth-service

# Open Prisma Studio
npm run prisma:studio --filter=@cf-erp/auth-service
```

### Testing
```bash
# Run all tests
npm run test

# Run tests for specific service
npm run test --filter=@cf-erp/auth-service

# Run tests with coverage
npm run test:cov --filter=@cf-erp/auth-service
```

### Linting & Formatting
```bash
# Lint all
npm run lint

# Format code
npx prettier --write .
```

## 🐳 Docker Deployment

### Build Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build auth-service
```

### Production Deployment
```bash
# Deploy with production config
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 API Documentation

### Authentication
All endpoints (except public) require JWT Bearer token:
```
Authorization: Bearer <access_token>
```

### Multi-tenancy
Include tenant and branch headers:
```
x-tenant-id: <tenant_id>
x-branch-id: <branch_id>
```

### Common Response Format
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid",
    "path": "/api/v1/endpoint",
    "method": "GET"
  }
}
```

## 🔐 Security

### Authentication
- JWT Access Tokens (24h expiry)
- JWT Refresh Tokens (7d expiry)
- bcrypt password hashing (12 rounds)
- MFA support (TOTP + backup codes)
- Account lockout after failed attempts

### Authorization
- Role-Based Access Control (RBAC)
- Permission-based authorization
- Resource-level permissions
- Tenant isolation

### Security Headers
- Helmet.js for HTTP headers
- CORS configuration
- Rate limiting
- Request size limits

## 📊 Monitoring

### Health Checks
- `/health` - Full health check
- `/health/ready` - Readiness probe
- `/health/live` - Liveness probe

### Metrics
- Prometheus metrics at `/health/metrics`
- Custom business metrics
- Database connection pool metrics
- Cache hit/miss ratios

### Logging
- Structured JSON logging
- Request correlation IDs
- Audit logging for all mutations
- Log levels: error, warn, info, debug

## 🧪 Testing Strategy

### Unit Tests
- Service layer business logic
- Utility functions
- DTO validation

### Integration Tests
- API endpoints
- Database operations
- External service integrations

### E2E Tests
- Critical user flows
- Multi-service workflows
- Authentication flows

## 📝 Module Implementation Status

| Module | Status | Service |
|--------|--------|---------|
| 1. Dashboard & Management Overview | 📋 Planned | dashboard-service |
| 2. Customer Relationship Management (CRM) | 📋 Planned | customer-service |
| 3. Customer & Supplier Management | 📋 Planned | customer-service |
| 4. Quotation & Rate Management | 📋 Planned | quotation-service |
| 5. Job & Shipment Management | 📋 Planned | job-service |
| 6. Freight Booking & Carrier Management | 📋 Planned | booking-service |
| 7. Import & Export Management | 📋 Planned | customs-service |
| 8. Customs Clearance & Compliance | 📋 Planned | customs-service |
| 9. Shipping & Transport Documentation | 📋 Planned | document-service |
| 10. Document Management | 📋 Planned | document-service |
| 11. Shipment Tracking & Notifications | 📋 Planned | tracking-service |
| 12. Warehouse & Inventory Management | 📋 Planned | warehouse-service |
| 13. Transport & Delivery Management | 📋 Planned | transport-service |
| 14. Container Management | 📋 Planned | container-service |
| 15. Demurrage, Detention & Storage | 📋 Planned | demurrage-service |
| 16. Finance & Accounting | 📋 Planned | finance-service |
| 17. Invoicing & Payment Management | 📋 Planned | invoicing-service |
| 18. Duty, Taxes & Disbursement | 📋 Planned | duty-service |
| 19. Accounts Receivable & Payable | 📋 Planned | ar-ap-service |
| 20. Supplier & Overseas Agent Management | 📋 Planned | agent-service |
| 21. Customer Portal | 📋 Planned | portal-service |
| 22. Task & Workflow Management | 📋 Planned | workflow-service |
| 23. HR & Staff Management | 📋 Planned | hr-service |
| 24. Reports & Business Intelligence | 📋 Planned | reports-service |
| 25. User Roles & Access Control | ✅ Done | auth-service |
| 26. Audit Trail & Security | 📋 Planned | audit-service |
| 27. Multi-Branch Management | 📋 Planned | branch-service |
| 28. Multi-Country & Regulatory Config | 📋 Planned | config-service |
| 29. Multi-Currency Management | 📋 Planned | currency-service |
| 30. Integration & API Management | 📋 Planned | integration-service |
| 31. Notifications & Communication | 📋 Planned | notification-service |
| 32. System Administration & Configuration | 📋 Planned | admin-service |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions

## 🗺️ Roadmap

- [ ] Complete all 32 modules
- [ ] Add GraphQL API gateway
- [ ] Implement event sourcing for audit trail
- [ ] Add AI-powered document processing
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Blockchain-based shipment tracking
- [ ] Multi-region deployment support