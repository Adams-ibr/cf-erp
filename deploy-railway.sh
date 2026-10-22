#!/bin/bash
# Complete Railway Deployment - One Command Setup
# Run this after cloning the repo

set -e

echo "🚂 CF-ERP Railway Deployment"
echo "============================="

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v railway >/dev/null 2>&1 || { echo "❌ Railway CLI not installed. Run: npm i -g @railway/cli"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm not installed"; exit 1; }
echo "✅ Prerequisites OK"

# Login
echo ""
echo "🔐 Railway Login"
railway login

# Initialize project
echo ""
echo "📦 Initialize Railway Project"
railway init

# Add infrastructure
echo ""
echo "🗄️ Adding Infrastructure"
echo "Adding PostgreSQL..."
railway add postgresql --name pg-main

echo "Adding Redis..."
railway add redis --name redis-main

# Link databases to all services
echo ""
echo "🔗 Linking databases to services..."
SERVICES=(
  "api-gateway" "auth-service" "customer-service" "quotation-service"
  "job-service" "booking-service" "customs-service" "document-service"
  "tracking-service" "warehouse-service" "transport-service" "container-service"
  "demurrage-service" "finance-service" "invoicing-service" "duty-service"
  "ar-ap-service" "agent-service" "portal-service" "workflow-service"
  "hr-service" "reports-service" "audit-service" "branch-service"
  "config-service" "currency-service" "integration-service" "notification-service"
  "admin-service" "dashboard-service"
)

for service in "${SERVICES[@]}"; do
  echo "Linking databases to $service..."
  railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service $service
  railway variables set REDIS_URL='${{Redis.REDIS_URL}}' --service $service
done

# Set environment variables
echo ""
echo "🔧 Setting environment variables..."
./set-railway-vars.sh

# Deploy all services
echo ""
echo "🚀 Deploying all services..."
railway up --detach

# Wait for deployments
echo ""
echo "⏳ Waiting for deployments to complete..."
sleep 30

# Run migrations
echo ""
echo "🗄️ Running database migrations..."
./run-railway-migrations.sh

# Health check
echo ""
echo "🏥 Running health checks..."
./health-check-railway.sh

echo ""
echo "==========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "==========================================="
echo ""
echo "📋 Your CF-ERP is now running on Railway!"
echo ""
echo "📋 Service URLs:"
railway domain list --json | jq -r '.[] | "\(.service): https://\(.domain)"'
echo ""
echo "📋 Useful Commands:"
echo "  railway status                    # Check all services"
echo "  railway logs -s auth-service      # View logs"
echo "  railway logs -s auth-service -f   # Follow logs"
echo "  railway shell -s auth-service     # SSH into service"
echo "  railway open                      # Open Railway dashboard"
echo "  railway variables -s auth-service # View env vars"
echo ""
echo "🔗 Service Discovery (internal):"
echo "  http://customer-service.railway.internal:3002"
echo "  http://auth-service.railway.internal:3001"
echo "  http://api-gateway.railway.internal:3000"
echo ""
echo "🎉 Happy shipping!"