#!/bin/bash
# Run Prisma migrations for all services on Railway

set -e

echo "🗄️ Running Prisma Migrations on Railway"
echo "==========================================="

SERVICES=(
  "auth-service"
  "customer-service"
  "quotation-service"
  "job-service"
  "booking-service"
  "customs-service"
  "document-service"
  "tracking-service"
  "warehouse-service"
  "transport-service"
  "container-service"
  "demurrage-service"
  "finance-service"
  ["invoicing-service"]
  "duty-service"
  "ar-ap-service"
  "agent-service"
  "portal-service"
  "workflow-service"
  "hr-service"
  "reports-service"
  "audit-service"
  "branch-service"
  "config-service"
  "currency-service"
  "integration-service"
  "notification-service"
  "admin-service"
  "dashboard-service"
)

# Function to run migration for a service
run_migration() {
  local service=$1
  echo "🗄️ Migrating $service..."
  
  if railway run --filter=@cf-erp/$service npx prisma migrate deploy; then
    echo "✅ $service migrated successfully"
  else
    echo "❌ $service migration failed"
    return 1
  fi
}

# Generate Prisma Client for all services first
echo "🔧 Generating Prisma Clients..."
for service in "${SERVICES[@]}"; do
  echo "  Generating for $service..."
  railway run --filter=@cf-erp/$service npx prisma generate > /dev/null 2>&1 || echo "  ⚠️  $service generate failed (may already exist)"
done
echo "✅ Prisma Clients generated"

# Run migrations
echo ""
echo "🚀 Running Migrations..."
FAILED=()

for service in "${SERVICES[@]}"; do
  if ! run_migration "$service"; then
    FAILED+=("$service")
  fi
done

echo ""
echo "==========================================="
echo "Migration Summary"
echo "==========================================="

if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✅ All migrations completed successfully!"
else
  echo "❌ Failed migrations:"
  for service in "${FAILED[@]}"; do
    echo "  - $service"
  done
  echo ""
  echo "Retry failed services with:"
  for service in "${FAILED[@]}"; do
    echo "  railway run --filter=@cf-erp/$service npx prisma migrate deploy"
  done
  exit 1
fi