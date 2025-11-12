#!/bin/bash

# SaaS Builder Deployment Script
# This script automates the deployment of applications to different environments

set -e

# Configuration
PROJECT_NAME=${PROJECT_NAME:-"saas-builder"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"your-registry.com"}
VERSION=${VERSION:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed"
        exit 1
    fi

    log_success "All dependencies are available"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."

    # Backend image
    log_info "Building backend image..."
    docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${VERSION} ./backend

    # Frontend image
    log_info "Building frontend image..."
    docker build -t ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION} ./frontend

    log_success "Docker images built successfully"
}

# Push images to registry
push_images() {
    log_info "Pushing images to registry..."

    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-backend:${VERSION}
    docker push ${DOCKER_REGISTRY}/${PROJECT_NAME}-frontend:${VERSION}

    log_success "Images pushed to registry successfully"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."

    # Create namespace if it doesn't exist
    kubectl apply -f ./kubernetes/namespace.yaml

    # Apply secrets (ensure they exist)
    if ! kubectl get secret saas-builder-secrets -n saas-builder &> /dev/null; then
        log_warning "Secrets not found. Please create them first."
        log_info "You can create secrets using: kubectl create secret generic saas-builder-secrets --from-literal=..."
        exit 1
    fi

    # Apply persistent volume claims
    kubectl apply -f ./kubernetes/pvc.yaml

    # Apply deployments
    kubectl apply -f ./kubernetes/deployment.yaml

    # Apply services
    kubectl apply -f ./kubernetes/service.yaml

    # Wait for deployments to be ready
    log_info "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/saas-builder-backend -n saas-builder
    kubectl wait --for=condition=available --timeout=300s deployment/saas-builder-frontend -n saas-builder
    kubectl wait --for=condition=available --timeout=300s deployment/saas-builder-postgres -n saas-builder
    kubectl wait --for=condition=available --timeout=300s deployment/saas-builder-redis -n saas-builder

    log_success "Kubernetes deployment completed successfully"
}

# Deploy to Docker Compose
deploy_docker() {
    log_info "Deploying with Docker Compose..."

    # Set environment file
    ENV_FILE="./deployment/docker/.env"
    if [ "$ENVIRONMENT" = "production" ]; then
        ENV_FILE="./deployment/docker/.env.production"
    fi

    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found: $ENV_FILE"
        log_info "Please copy .env.example to .env and configure your variables"
        exit 1
    fi

    # Deploy with docker-compose
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f ./deployment/docker/docker-compose.prod.yml --env-file $ENV_FILE up -d
    else
        docker-compose -f ./deployment/docker/docker-compose.yml --env-file $ENV_FILE up -d
    fi

    log_success "Docker Compose deployment completed successfully"
}

# Health check
health_check() {
    log_info "Performing health check..."

    if [ "$DEPLOYMENT_TYPE" = "kubernetes" ]; then
        # Check Kubernetes pods
        kubectl get pods -n saas-builder

        # Check service endpoints
        BACKEND_URL=$(kubectl get ingress saas-builder-ingress -n saas-builder -o jsonpath='{.spec.rules[1].host}')
        FRONTEND_URL=$(kubectl get ingress saas-builder-ingress -n saas-builder -o jsonpath='{.spec.rules[0].host}')
    else
        # Docker Compose URLs
        FRONTEND_URL="http://localhost:3000"
        BACKEND_URL="http://localhost:3001"
    fi

    # Wait a moment for services to start
    sleep 10

    # Check frontend
    if curl -f -s $FRONTEND_URL > /dev/null; then
        log_success "Frontend is healthy: $FRONTEND_URL"
    else
        log_error "Frontend health check failed: $FRONTEND_URL"
    fi

    # Check backend
    if curl -f -s $BACKEND_URL/health > /dev/null; then
        log_success "Backend is healthy: $BACKEND_URL/health"
    else
        log_error "Backend health check failed: $BACKEND_URL/health"
    fi
}

# Main deployment function
main() {
    log_info "Starting deployment of $PROJECT_NAME to $ENVIRONMENT"

    # Check dependencies
    check_dependencies

    # Parse deployment type
    case ${DEPLOYMENT_TYPE:-"docker"} in
        "kubernetes"|"k8s")
            log_info "Using Kubernetes deployment"
            build_images
            push_images
            deploy_kubernetes
            ;;
        "docker"|"compose")
            log_info "Using Docker Compose deployment"
            build_images
            deploy_docker
            ;;
        *)
            log_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            log_info "Available types: docker, kubernetes"
            exit 1
            ;;
    esac

    # Health check
    health_check

    log_success "Deployment completed successfully!"

    if [ "$DEPLOYMENT_TYPE" = "kubernetes" ]; then
        log_info "Frontend: $FRONTEND_URL"
        log_info "Backend API: $BACKEND_URL"
        log_info "Dashboard: kubectl get ingress -n saas-builder"
    else
        log_info "Frontend: $FRONTEND_URL"
        log_info "Backend API: $BACKEND_URL"
        log_info "Logs: docker-compose logs -f"
    fi
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment ENV     Deployment environment (development|staging|production)"
    echo "  -t, --type TYPE          Deployment type (docker|kubernetes)"
    echo "  -v, --version VERSION    Docker image version (default: latest)"
    echo "  -r, --registry REGISTRY  Docker registry URL"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  DEPLOYMENT_TYPE          Type of deployment (docker|kubernetes)"
    echo "  PROJECT_NAME             Name of the project"
    echo "  DOCKER_REGISTRY          Docker registry URL"
    echo "  VERSION                  Docker image version"
    echo ""
    echo "Examples:"
    echo "  $0 -e production -t docker"
    echo "  $0 -e staging -t kubernetes -v v1.2.3"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -t|--type)
            DEPLOYMENT_TYPE="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -r|--registry)
            DOCKER_REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Run main function
main