# Logware Security Platform - Deployment Guide

This directory contains all the necessary configuration files for deploying the Logware Security Platform using Kubernetes.

## Architecture Overview

The Logware Security Platform deployment consists of the following components:

- **Frontend**: React-based web application served through Nginx
- **Backend**: REST API service
- **Databases**:
  - MongoDB: For storing user data, configurations, and logs
  - Elasticsearch: For advanced log searching and analysis
  - Redis: For caching and session management
- **Monitoring**:
  - Prometheus: For metrics collection and alerting
  - Grafana: For visualization and dashboards

## Deployment Prerequisites

1. A Kubernetes cluster (v1.19+)
2. `kubectl` CLI installed and configured
3. Docker registry access
4. Domains configured for the platform's components
5. TLS certificates (can be automatically provisioned via cert-manager)

## Deployment Environments

The deployment is designed to support multiple environments:

- **Development**: For local testing
- **Staging**: For QA and testing
- **Production**: For live deployment

Each environment has its own configuration file in the `environments/` directory.

## Deployment Process

### 1. Update Environment Configuration

Edit the appropriate environment file in `environments/` to set:
- Docker registry credentials
- Database credentials
- JWT secrets
- Domain names

### 2. Deploy Using the Script

Run the deployment script with the desired environment:

```bash
# Deploy to development environment
./deploy.sh development

# Deploy to staging environment
./deploy.sh staging

# Deploy to production environment
./deploy.sh production
```

### 3. Verify Deployment

After deployment, verify that all components are running correctly:

```bash
kubectl get all -n logware
```

## Monitoring and Management

- Access Grafana dashboards at: `https://grafana.logware.example.com`
- View logs using:
  ```bash
  kubectl logs -f deployment/logware-frontend -n logware
  kubectl logs -f deployment/logware-backend -n logware
  ```

## Scaling

You can scale components as needed:

```bash
kubectl scale deployment/logware-frontend --replicas=5 -n logware
kubectl scale deployment/logware-backend --replicas=5 -n logware
```

## Rollback

If a deployment fails, you can rollback to the previous version:

```bash
kubectl rollout undo deployment/logware-frontend -n logware
kubectl rollout undo deployment/logware-backend -n logware
```

## Security Considerations

- All secrets are stored as Kubernetes secrets
- TLS is enabled for all external endpoints
- Network policies are defined to restrict communication between services
- Pod security contexts are defined to limit container privileges

## Performance Tuning

- Resource requests and limits are defined for all containers
- HPA (Horizontal Pod Autoscaler) can be enabled for automatic scaling
- Storage classes can be adjusted for different performance requirements

## Troubleshooting

For common issues, refer to the main project documentation or check the logs of the affected components.
