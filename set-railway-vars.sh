#!/bin/bash
# Set all environment variables on Railway for all 30 services
# Run this AFTER deploying services to Railway

set -e

echo "🔧 Setting up Railway Environment Variables"
echo "============================================="

# Global variables (Project level)
echo "Setting global variables..."
railway variables set JWT_SECRET="$(openssl rand -base64 32)" --project
railway variables set JWT_REFRESH_SECRET="$(openssl rand -base64 32)" --project
railway variables set JWT_EXPIRES_IN="24h" --project
railway variables set JWT_REFRESH_EXPIRES_IN="7d" --project
railway variables set JWT_ISSUER="cf-erp" --project
railway variables set JWT_AUDIENCE="cf-erp-api" --project
railway variables set NODE_ENV="production" --project
railway variables set API_PREFIX="api/v1" --project
railway variables set CORS_ORIGIN="https://your-frontend-domain.com" --project
railway variables set RATE_LIMIT_WINDOW_MS="60000" --project
railway variables set RATE_LIMIT_MAX_REQUESTS="100" --project
railway variables set SWAGGER_ENABLED="true" --project
railway variables set SWAGGER_PATH="api/docs" --project
railway variables set SWAGGER_TITLE="CF-ERP API" --project
railway variables set SWAGGER_DESCRIPTION="Clearing & Forwarding ERP API Documentation" --project
railway variables set SWAGGER_VERSION="1.0.0" --project

# Common settings
railway variables set LOG_LEVEL="info" --project
railway variables set LOG_FORMAT="json" --project
railway variables set MONITORING_ENABLED="true" --project

# Feature flags
railway variables set FF_CUSTOMER_PORTAL="false" --project
railway variables set FF_MOBILE_APP="false" --project
railway variables set FF_AI_ASSISTANT="false" --project
railway variables set FF_ADVANCED_ANALYTICS="false" --project
railway variables set FF_BLOCKCHAIN_TRACKING="false" --project

echo "✅ Global variables set"

# Service-specific ports
echo "Setting service ports..."

declare -A PORTS=(
  ["api-gateway"]=3000
  ["auth-service"]=3001
  ["customer-service"]=3002
  ["quotation-service"]=3003
  ["job-service"]=3004
  ["booking-service"]=3005
  ["customs-service"]=3006
  ["document-service"]=3007
  ["tracking-service"]=3008
  ["warehouse-service"]=3009
  ["transport-service"]=3010
  ["container-service"]=3011
  ["demurrage-service"]=3012
  ["finance-service"]=3013
  ["invoicing-service"]=3014
  ["duty-service"]=3015
  ["ar-ap-service"]=3016
  ["agent-service"]=3017
  ["portal-service"]=3018
  ["workflow-service"]=3019
  ["hr-service"]=3020
  ["reports-service"]=3021
  ["audit-service"]=3022
  ["branch-service"]=3023
  ["config-service"]=3024
  ["currency-service"]=3025
  ["integration-service"]=3026
  ["notification-service"]=3027
  ["admin-service"]=3028
  ["dashboard-service"]=3029
)

for service in "${!PORTS[@]}"; do
  port=${PORTS[$service]}
  echo "Setting PORT=$port for $service"
  railway variables set PORT=$port --service $service
done

echo "✅ Service ports set"

# Database URLs will be auto-injected by Railway when you link databases
# Run these AFTER linking databases:
# railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service api-gateway
# railway variables set REDIS_URL='${{Redis.REDIS_URL}}' --service api-gateway

echo ""
echo "✅ Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Link databases: railway add postgresql --name pg-main"
echo "2. Link Redis: railway add redis --name redis-main"
echo "3. Run migrations: railway run --filter=@cf-erp/auth-service npx prisma migrate deploy"
echo "2. Check variables: railway variables --service <service-name>"