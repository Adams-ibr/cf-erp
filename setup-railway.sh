#!/bin/bash
# Railway Setup Script for CF-ERP
# Run this script to set up all 30 services on Railway

set -e

echo "🚂 Railway Setup for CF-ERP"
echo "============================"

# Check prerequisites
command -v railway >/dev/null 2>&1 || { echo "❌ Railway CLI not installed. Run: npm i -g @railway/cli"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }

echo "✅ Prerequisites check passed"

# Login to Railway
echo ""
echo "🔐 Logging into Railway..."
railway login

# Initialize project
echo ""
echo "📦 Initializing Railway project..."
railway init

# Add databases
echo ""
echo "🗄️ Adding databases..."
echo "Adding PostgreSQL..."
railway add postgresql --name pg-main

echo "Adding Redis..."
railway add redis --name redis-main

# Link services to databases
echo ""
echo "🔗 Linking services to databases..."
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service api-gateway
railway variables set REDIS_URL='${{Redis.REDIS_URL}}' --service api-gateway

# Deploy all services
echo ""
echo "🚀 Deploying all services..."
railway up --detach

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check deployment status: railway status"
echo "2. View logs: railway logs --service <service-name>"
echo "2. Open dashboard: railway open"
echo "3. Set environment variables for each service (see .env.railway.template)"
echo ""
echo "📊 Useful commands:"
echo "  railway status                    # Check all services"
echo "  railway logs -s api-gateway       # View logs"
echo "  railway variables -s auth-service # View env vars"
echo "  railway shell -s auth-service     # SSH into service"
echo "  railway run --filter=@cf-erp/auth-service npx prisma migrate deploy"