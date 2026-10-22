# Railway Deployment Guide for CF-ERP
## Complete Setup Guide for 30 Microservices

---

## 📋 Prerequisites Checklist

- [ ] Railway CLI installed: `npm i -g @railway/cli`
- [ ] Railway account created at https://railway.app
- [ ] Docker installed locally (for testing)
- [ ] Node.js 20+ and npm 10+
- [ ] Git repository with all 30 services

---

## 🚀 Quick Start (5 minutes)

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login to Railway
railway login

# 2. Navigate to project
cd /Users/user/cf-erp

# 3. Initialize Railway project
railway init

# 4. Add databases (one-time setup)
railway add postgresql --name pg-main
railway add redis --name redis-main

# 5. Deploy all 30 services
railway up --detach
```

---

## 🗄️ Database Setup (One-time)

### Option A: Single PostgreSQL with Schemas (Recommended for Free Tier)

Railway creates ONE PostgreSQL instance. Each service uses a different **schema**:

```
PostgreSQL Instance (pg-main)
├── Schema: auth          → auth-service
├── Schema: customer      → customer-service
├── Schema: quotation     → quotation-service
├── Schema: job           → job-service
├── Schema: booking       → booking-service
├── Schema: customs       → customs-service
├── Schema: document      → document-service
├── Schema: tracking      → tracking-service
├── Schema: warehouse     → warehouse-service
├── Schema: transport     → transport-service
├── Schema: container     → container-service
├── Schema: demurrage     → demurrage-service
├── Schema: finance       → finance-service
├── Schema: invoicing     → invoicing-service
├── Schema: duty          → duty-service
├── Schema: arap          → ar-ap-service
├── Schema: agent         → agent-service
├── Schema: portal        → portal-service
├── Schema: workflow      → workflow-service
├── Schema: hr            → hr-service
├── Schema: reports       → reports-service
├── Schema: audit         → audit-service
├── Schema: branch        → branch-service
├── Schema: config        → config-service
├── Schema: currency      → currency-service
├── Schema: integration   → integration-service
├── Schema: notification  → notification-service
├── Schema: admin         → admin-service
├── Schema: dashboard     → dashboard-service
├── Schema: gateway       → api-gateway
├── Schema: job           → job-service (already listed)
├── Schema: booking       → booking-service (already listed)
└── Schema: customs       → customs-service (already listed)
```

**Railway automatically creates schemas** when you use `DATABASE_URL` with different schema names.

### Option B: Separate PostgreSQL Instances (Paid Tier)

For production with strict isolation:

```bash
# Create separate DB per critical service
railway add postgresql --name pg-auth
railway add postgresql --name pg-customer
railway add postgresql --name pg-finance
# ... etc
```

---

## 🔧 Environment Variables Setup

### 1. Global Variables (Set at Project Level)

Go to Railway Dashboard → Project → Variables → Add Variable:

| Variable | Value | Scope |
|----------|-------|-------|
| `JWT_SECRET` | `your-32-char-secret-key` | Project |
| `JWT_REFRESH_SECRET` | `different-32-char-secret` | Project |
| `JWT_EXPIRES_IN` | `24h` | Project |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Project |
| `JWT_ISSUER` | `cf-erp` | Project |
| `JWT_AUDIENCE` | `cf-erp-api` | Project |
| `NODE_ENV` | `production` | Project |
| `API_PREFIX` | `api/v1` | Project |
| `CORS_ORIGIN` | `https://your-frontend.com` | Project |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Project |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Project |

### 2. Per-Service Variables (Auto-injected by Railway)

When you link a database to a service, Railway automatically injects:
- `DATABASE_URL` - Full connection string with schema
- `REDIS_URL` - Redis connection string

### 3. Service-Specific Variables (Set per service)

For each service, set in Railway Dashboard → Service → Variables:

```bash
# Example for auth-service
railway variables set PORT=3001 --service auth-service
railway variables set DATABASE_URL=postgresql://... --service auth-service

# Example for customer-service
railway variables set PORT=3002 --service customer-service
railway variables set DATABASE_URL=postgresql://... --service customer-service
```

---

## 🚀 Deployment Commands

### First Time Setup

```bash
# 1. Initialize
railway login
cd /Users/user/cf-erp
railway init

# 2. Add infrastructure
railway add postgresql --name pg-main
railway add redis --name redis-main

# 3. Deploy all services
railway up --detach
```

### Subsequent Deploys

```bash
# Deploy all services
railway up

# Deploy specific service
railway up --service api-gateway

# Deploy with build
railway up --service auth-service --build

# Force rebuild
railway up --service auth-service --build --force
```

---

## 🔗 Service-to-Service Communication

Railway provides automatic private networking via `.railway.internal` DNS:

```typescript
// In any service, call another service:
const response = await fetch('http://customer-service.railway.internal:3002/api/v1/customers')
const response = await fetch('http://auth-service.railway.internal:3001/api/v1/auth/validate')
```

**No extra configuration needed!** Services communicate via private network automatically.

---

## 🗄️ Database Migrations

### Run Migrations After Deploy

```bash
# Run migrations for specific service
railway run --filter=@cf-erp/auth-service npx prisma migrate deploy

# Run for all services
railway run --filter=@cf-erp/auth-service npx prisma migrate deploy
railway run --filter=@cf-erp/customer-service npx prisma migrate deploy
# ... repeat for all services

# Or use a script
for service in auth customer quotation job booking customs document tracking warehouse transport container demurrage finance invoicing duty arap agent portal workflow hr reports audit branch config currency integration notification admin dashboard; do
  railway run --filter=@cf-erp/$service npx prisma migrate deploy
done
```

### Generate Prisma Client (if needed)

```bash
railway run --filter=@cf-erp/auth-service npx prisma generate
```

---

## 🔍 Monitoring & Debugging

### View Logs

```bash
# All services
railway logs

# Specific service
railway logs --service api-gateway
railway logs --service auth-service --follow

# Last 100 lines
railway logs --service auth-service --tail 100
```

### Check Service Status

```bash
# All services
railway status

# Specific service
railway status --service auth-service
```

### SSH into Service

```bash
railway shell --service auth-service
```

### View Environment Variables

```bash
railway variables --service auth-service
railway variables set KEY=VALUE --service auth-service
```

---

## 🔧 Common Issues & Fixes

### Build Failures

```bash
# Clear cache and rebuild
railway up --service auth-service --build --force

# Check build logs
railway logs --service auth-service --build
```

### Database Connection Issues

```bash
# Check DATABASE_URL is set
railway variables --service auth-service | grep DATABASE_URL

# Test connection
railway run --filter=@cf-erp/auth-service npx prisma db pull
```

### Port Conflicts

Each service must use unique PORT:
```bash
railway variables set PORT=3001 --service auth-service
railway variables set PORT=3002 --service customer-service
# ... etc
```

### Memory Issues

```bash
# Check resource usage
railway logs --service auth-service | grep -i memory

# Scale up (paid plans)
railway scale --service auth-service --memory 512
```

---

## 📊 Health Checks

Each service exposes `/health` endpoint:

```bash
# Test health endpoint
curl https://auth-service.railway.app/health
curl https://customer-service.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "checks": {
    "database": { "status": "up" },
    "memory": { "status": "up", "used": "45%", "total": "512MB" }
  }
}
```

---

## 📱 Custom Domains

```bash
# Add custom domain
railway domain add api.yourdomain.com --service api-gateway
railway domain add auth.yourdomain.com --service auth-service

# Verify DNS
railway domain list --service api-gateway
```

---

## 💰 Cost Optimization

### Free Tier Limits
- 500 build minutes/month
- 100 GB bandwidth/month
- 1 GB RAM per service
- 1 vCPU per service
- 1 PostgreSQL (90-day expiry on free)
- 1 Redis (25MB)

### Cost at Scale (~30 services)

| Resource | Monthly Cost |
|----------|--------------|
| 30 Web Services | ~$15-20 |
| PostgreSQL (1 main) | $7 |
| Redis | $7 |
| **Total** | **~$30-35/mo** |

---

## 🔐 Security Checklist

- [ ] JWT secrets are 32+ characters
- [ ] JWT_REFRESH_SECRET different from JWT_SECRET
- [ ] CORS_ORIGIN set to your frontend domain only
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (automatic on Railway)
- [ ] Database SSL required (Railway enforces)
- [ ] Non-root user in containers (Railway default)
- [ ] Secrets in Railway Variables (not in code)
- [ ] CORS configured per environment
- [ ] Rate limiting configured per endpoint

---

## 🚨 Emergency Commands

```bash
# Rollback deployment
railway rollback --service auth-service

# Scale down to zero (stop service)
railway scale --service auth-service --replicas 0

# Scale up
railway scale --service auth-service --replicas 1

# Delete service (careful!)
railway service delete auth-service

# View all projects
railway project list

# Switch project
railway link project-id
```

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app
- Email: support@railway.app

---

## ✅ Post-Deployment Checklist

- [ ] All 30 services deployed and healthy
- [ ] All health endpoints return 200
- [ ] Database migrations applied
- [ ] Inter-service communication works
- [ ] JWT auth works across services
- [ ] CORS configured for frontend
- [ ] Rate limiting working
- [ ] Logs visible in Railway dashboard
- [ ] Custom domains configured
- [ ] Monitoring alerts set up
- [ ] Backup strategy documented
- [ ] Rollback procedure tested

---

**🎉 You're live!** Your 30-service ERP is now running on Railway.

For issues: Check `railway logs --service <name>` first, then Railway Discord.