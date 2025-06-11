#!/bin/bash

# Rick's Agentic Social Media Architecture Docker Launcher ☠️
# This script handles the complete containerization setup

set -e

# Colors for Rick's style
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Rick's signature
echo -e "${RED}☠️  Rick's Agentic Social Media Architecture ☠️${NC}"
echo -e "${CYAN}🚀 Launching Docker containers for world domination...${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

print_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating data directories..."
mkdir -p data/{metrics,memory,content,models}
mkdir -p logs
mkdir -p config
mkdir -p ssl
mkdir -p grafana/{dashboards,datasources}

# Set proper permissions
chmod -R 755 data logs config grafana

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating environment configuration..."
    cat > .env << EOF
# Rick's Agentic Social Media Architecture Environment ☠️

# Database Configuration
POSTGRES_DB=agentic_social
POSTGRES_USER=rick
POSTGRES_PASSWORD=socialmedia2024
DATABASE_URL=postgresql://rick:socialmedia2024@postgres:5432/agentic_social

# Redis Configuration
REDIS_PASSWORD=socialmedia2024
REDIS_URL=redis://:socialmedia2024@redis:6379/0

# ChromaDB Configuration
CHROMA_HOST=chroma
CHROMA_PORT=8000
VECTOR_DB_URL=http://chroma:8000

# Application Configuration
LOG_LEVEL=INFO
RICK_MODE=PRODUCTION
PYTHONPATH=/app

# API Keys (Add your real API keys here)
OPENAI_API_KEY=your_openai_api_key_here
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here
REDDIT_CLIENT_ID=your_reddit_client_id_here
REDDIT_CLIENT_SECRET=your_reddit_client_secret_here
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
SNAPCHAT_CLIENT_ID=your_snapchat_client_id_here
ONLYFANS_API_KEY=your_onlyfans_api_key_here

# Monitoring
GRAFANA_ADMIN_PASSWORD=rickgrafana2024
EOF
    print_warning "Created .env file with default values. Please update with your real API keys!"
fi

# Create Grafana datasource configuration
print_status "Setting up Grafana configuration..."
mkdir -p grafana/datasources
cat > grafana/datasources/datasources.yml << EOF
apiVersion: 1

datasources:
  - name: PostgreSQL
    type: postgres
    url: postgres:5432
    database: agentic_social
    user: rick
    secureJsonData:
      password: socialmedia2024
    jsonData:
      sslmode: disable
      postgresVersion: 1500
    isDefault: true

  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090
    isDefault: false
EOF

# Create Prometheus configuration
print_status "Setting up Prometheus configuration..."
cat > prometheus.yml << EOF
global:
  scrape_interval: 15s
  external_labels:
    monitor: 'rick-agentic-monitor'

scrape_configs:
  - job_name: 'agentic-social'
    static_configs:
      - targets: ['agentic-social:8000', 'agentic-social:8001', 'agentic-social:8002']
    scrape_interval: 30s
    metrics_path: /metrics

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
    scrape_interval: 30s
EOF

# Build and start containers
print_status "Building Docker images..."
docker-compose build --no-cache

print_status "Starting infrastructure services..."
docker-compose up -d postgres redis chroma

# Wait for database to be ready
print_status "Waiting for database to be ready..."
sleep 10

# Start remaining services
print_status "Starting application services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 15

# Check service status
print_status "Checking service status..."
docker-compose ps

# Display access URLs
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}🎯 Rick's Agentic Social Media Architecture - Ready for Action! ☠️${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}📊 Main Application:${NC}        http://localhost:8000"
echo -e "${GREEN}📈 Grafana Dashboard:${NC}       http://localhost:3000 (admin/rickgrafana2024)"
echo -e "${GREEN}🔍 Prometheus Metrics:${NC}      http://localhost:9090"
echo -e "${GREEN}🔍 Jaeger Tracing:${NC}          http://localhost:16686"
echo -e "${GREEN}💾 PostgreSQL:${NC}              localhost:5432 (rick/socialmedia2024)"
echo -e "${GREEN}🗄️  Redis:${NC}                   localhost:6379"
echo -e "${GREEN}🧠 ChromaDB:${NC}                http://localhost:8003"
echo ""
echo -e "${YELLOW}⚠️  Remember to update your API keys in the .env file!${NC}"
echo ""
echo -e "${RED}☠️  Social media domination awaits... ☠️${NC}"
echo ""

# Show logs
print_status "Showing application logs (press Ctrl+C to stop)..."
docker-compose logs -f agentic-social 