#!/bin/bash
# Logware Security Platform - Kubernetes Deployment Script

# Configuration
DOCKER_REGISTRY="your-registry.example.com"
VERSION=$(git describe --tags --always)
NAMESPACE="logware"
ENVIRONMENT=${1:-"development"}  # default to development if not specified

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment-specific variables
if [ -f "kubernetes/environments/$ENVIRONMENT.env" ]; then
  echo -e "${GREEN}Loading $ENVIRONMENT environment configuration...${NC}"
  source "kubernetes/environments/$ENVIRONMENT.env"
else
  echo -e "${RED}Error: Environment file for '$ENVIRONMENT' not found${NC}"
  echo -e "${YELLOW}Available environments:${NC}"
  ls -1 kubernetes/environments/*.env | sed 's/.*\/\(.*\)\.env/  - \1/'
  exit 1
fi

# Create namespace if it doesn't exist
echo -e "${GREEN}Ensuring namespace $NAMESPACE exists...${NC}"
kubectl get namespace $NAMESPACE &> /dev/null || kubectl create namespace $NAMESPACE

# Apply secrets
echo -e "${GREEN}Applying secrets...${NC}"
# MongoDB secrets
kubectl create secret generic mongodb-secrets \
  --namespace=$NAMESPACE \
  --from-literal=MONGO_ROOT_USERNAME=$MONGO_ROOT_USERNAME \
  --from-literal=MONGO_ROOT_PASSWORD=$MONGO_ROOT_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f -

# Redis secrets
kubectl create secret generic redis-secrets \
  --namespace=$NAMESPACE \
  --from-literal=REDIS_PASSWORD=$REDIS_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f -

# Backend secrets
kubectl create secret generic backend-secrets \
  --namespace=$NAMESPACE \
  --from-literal=JWT_SECRET=$JWT_SECRET \
  --from-literal=REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET \
  --from-literal=ENCRYPTION_KEY=$ENCRYPTION_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

# Grafana secrets
kubectl create secret generic grafana-secrets \
  --namespace=$NAMESPACE \
  --from-literal=ADMIN_USER=$GRAFANA_ADMIN_USER \
  --from-literal=ADMIN_PASSWORD=$GRAFANA_ADMIN_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f -

# Registry credentials
kubectl create secret docker-registry registry-credentials \
  --namespace=$NAMESPACE \
  --docker-server=$DOCKER_REGISTRY \
  --docker-username=$DOCKER_USERNAME \
  --docker-password=$DOCKER_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f -

# Process and apply Kubernetes configuration files
for file in kubernetes/*.yaml; do
  echo -e "${GREEN}Processing $file...${NC}"
  # Replace variables in the config files
  sed -e "s|\${DOCKER_REGISTRY}|$DOCKER_REGISTRY|g" \
      -e "s|\${VERSION}|$VERSION|g" \
      -e "s|\${BASE64_JWT_SECRET}|$(echo -n $JWT_SECRET | base64)|g" \
      -e "s|\${BASE64_REFRESH_TOKEN_SECRET}|$(echo -n $REFRESH_TOKEN_SECRET | base64)|g" \
      -e "s|\${BASE64_ENCRYPTION_KEY}|$(echo -n $ENCRYPTION_KEY | base64)|g" \
      -e "s|\${BASE64_MONGO_ROOT_USERNAME}|$(echo -n $MONGO_ROOT_USERNAME | base64)|g" \
      -e "s|\${BASE64_MONGO_ROOT_PASSWORD}|$(echo -n $MONGO_ROOT_PASSWORD | base64)|g" \
      -e "s|\${BASE64_REDIS_PASSWORD}|$(echo -n $REDIS_PASSWORD | base64)|g" \
      -e "s|\${BASE64_GRAFANA_ADMIN_USER}|$(echo -n $GRAFANA_ADMIN_USER | base64)|g" \
      -e "s|\${BASE64_GRAFANA_ADMIN_PASSWORD}|$(echo -n $GRAFANA_ADMIN_PASSWORD | base64)|g" \
      "$file" | kubectl apply -n $NAMESPACE -f -
done

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}You can check the status with:${NC} kubectl get all -n $NAMESPACE"
