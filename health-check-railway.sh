#!/bin/bash
# Health check all Railway services

set -e

echo "🏥 CF-ERP Health Check"
echo "======================"

SERVICES=(
  "api-gateway"
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
  ["demurrage-service"]
  "finance-service"
  "invoicing-service"
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

FAILED=()
HEALTHY=()

for service in "${SERVICES[@]}"; do
  echo -n "Checking $service... "
  
  # Get service URL from Railway
  URL=$(railway domain list --service $service --json | jq -r '.[0].domain' 2>/dev/null)
  
  if [ -z "$URL" ] || [ "$URL" = "null" ]; then
    # Try internal health check
    if railway run --filter=@cf-erp/$service curl -sf http://localhost:3000/health > /dev/null 2>&1; then
      echo "✅ (internal)"
      HEALTHY+=("$service")
    else
      echo "❌ No domain, internal check failed"
      FAILED+=("$service")
    fi
  else
    # Check external health endpoint
    if curl -sf "https://$URL/health" > /dev/null 2>&1; then
      echo "✅"
      HEALTHY+=("$service")
    else
      echo "❌"
      FAILED+=("$service")
    fi
  fi
done

echo ""
echo "==========================================="
echo "Health Check Summary"
echo "==========================================="
echo "✅ Healthy: ${#HEALTHY[@]}"
echo "❌ Failed:  ${#FAILED[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "Failed services:"
  for service in "${FAILED[@]}"; do
    echo "  - $service"
  done
  echo ""
  echo "Debug with: railway logs --service <service-name>"
  exit 1
else
  echo ""
  echo "🎉 All services healthy!"
fi