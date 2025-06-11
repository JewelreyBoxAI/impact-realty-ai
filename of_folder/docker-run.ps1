# Rick's Agentic Social Media Docker Runner - PowerShell Edition ☠️
# Cloud-native PostgreSQL + Azure/Vertex hybrid architecture

param(
    [switch]$Build,
    [switch]$Clean,
    [switch]$Logs,
    [switch]$Stop,
    [switch]$Dev
)

# Color output functions
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

Write-Host "🔥 Rick's Agentic Social Media Platform ☠️" -ForegroundColor Red
Write-Host "=" * 60

# Check if Docker is running
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-ColorOutput Green "✅ Docker is running"
} catch {
    Write-ColorOutput Red "❌ Docker is not running"
    Write-ColorOutput Yellow "Please start Docker Desktop and try again"
    exit 1
}

# Determine Docker Compose command
$composeCmd = "docker-compose"
try {
    docker-compose version | Out-Null
} catch {
    try {
        docker compose version | Out-Null
        $composeCmd = "docker compose"
    } catch {
        Write-ColorOutput Red "❌ Docker Compose not found"
        exit 1
    }
}

# Stop containers if requested
if ($Stop) {
    Write-ColorOutput Yellow "🛑 Stopping all containers..."
    & $composeCmd down
    exit 0
}

# Clean containers and volumes if requested  
if ($Clean) {
    Write-ColorOutput Yellow "🧹 Cleaning up containers and volumes..."
    & $composeCmd down --volumes --remove-orphans
    docker system prune -f
    Write-ColorOutput Green "✅ Cleanup completed"
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-ColorOutput Cyan "📝 Creating .env template..."
    @'
# Rick's Agentic Social Media Configuration ☠️

# Core API Keys - REQUIRED
OPENAI_API_KEY=sk-your-openai-key-here
REPLICATE_API_TOKEN=r8_your-replicate-token-here

# Database Configuration (PostgreSQL)
DATABASE_URL=postgresql://rick:socialmedia2024@postgres:5432/agentic_social
VECTOR_STORE_TYPE=postgresql

# Azure Cognitive Search (Optional - Enterprise Features)
AZURE_COGNITIVE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_COGNITIVE_SEARCH_KEY=your-azure-search-admin-key

# Google Cloud / Vertex AI (Optional - Advanced Embeddings)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret

INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
INSTAGRAM_USER_ID=your-instagram-user-id

REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=AgenticSocialMedia/1.0

# HuggingFace (for LoRA training)
HF_TOKEN=hf_your-huggingface-token

# System Configuration
LOG_LEVEL=INFO
RICK_MODE=PRODUCTION
'@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-ColorOutput Green "✅ .env template created"
    Write-ColorOutput Yellow "⚠️  Please edit .env with your actual API keys before continuing"
}

# Create required directories
$directories = @("data", "logs", "config", "models")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-ColorOutput Cyan "📁 Created: $dir"
    }
}

# Build if requested or if images don't exist
if ($Build -or -not (docker images --format "table {{.Repository}}" | Select-String "rick-agentic-social")) {
    Write-ColorOutput Cyan "🏗️ Building Docker images..."
    & $composeCmd build
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "❌ Build failed"
        exit 1
    }
    Write-ColorOutput Green "✅ Build completed"
}

# Prometheus configuration
$prometheusConfig = @'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'agentic-social'
    static_configs:
      - targets: ['agentic-social:8000']
    metrics_path: /metrics
    scrape_interval: 30s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
    metrics_path: /metrics
    scrape_interval: 60s
'@

if (-not (Test-Path "prometheus.yml")) {
    $prometheusConfig | Out-File -FilePath "prometheus.yml" -Encoding UTF8
    Write-ColorOutput Cyan "📊 Created Prometheus configuration"
}

# Start the application stack
Write-ColorOutput Cyan "🚀 Starting Agentic Social Media Platform..."

# Start core services first
Write-ColorOutput Yellow "📀 Starting PostgreSQL..."
& $composeCmd up -d postgres

# Wait for PostgreSQL to be ready
Write-ColorOutput Yellow "⏳ Waiting for PostgreSQL to be ready..."
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    Start-Sleep -Seconds 2
    $pgReady = & $composeCmd exec -T postgres pg_isready -U rick -d agentic_social 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput Green "✅ PostgreSQL is ready"
        break
    }
    if ($attempt -eq $maxAttempts) {
        Write-ColorOutput Red "❌ PostgreSQL failed to start"
        & $composeCmd logs postgres
        exit 1
    }
} while ($true)

# Start the main application
Write-ColorOutput Yellow "🤖 Starting Agentic Social Media application..."
& $composeCmd up -d

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput Red "❌ Failed to start application"
    & $composeCmd logs
    exit 1
}

# Show status
Write-ColorOutput Green "`n🎉 Agentic Social Media Platform is running!"
Write-ColorOutput Cyan "`n📊 Service Status:"
& $composeCmd ps

# Show access URLs
Write-ColorOutput Green "`n🌐 Access URLs:"
Write-Host "🤖 Main Application:     http://localhost:8000" -ForegroundColor White
Write-Host "📊 Prometheus:           http://localhost:9090" -ForegroundColor White  
Write-Host "📈 Grafana:              http://localhost:3000" -ForegroundColor White
Write-Host "🔍 Jaeger Tracing:       http://localhost:16686" -ForegroundColor White
Write-Host "🗄️  PostgreSQL:           localhost:5432" -ForegroundColor White

Write-ColorOutput Green "`n📋 Management Commands:"
Write-Host "📜 View logs:            docker-compose logs -f" -ForegroundColor White
Write-Host "🛑 Stop services:        .\docker-run.ps1 -Stop" -ForegroundColor White
Write-Host "🧹 Clean everything:     .\docker-run.ps1 -Clean" -ForegroundColor White
Write-Host "🔧 Rebuild images:       .\docker-run.ps1 -Build" -ForegroundColor White

Write-ColorOutput Green "`n🗄️ Database Access:"
Write-Host "📊 Admin Query:          docker-compose exec postgres psql -U rick -d agentic_social" -ForegroundColor White

Write-ColorOutput Cyan "`n📋 Cloud Configuration:"
Write-Host "├── PostgreSQL: Primary database with pgvector for vectors" -ForegroundColor White
Write-Host "├── Azure Search: Optional hybrid search (configure AZURE_* env vars)" -ForegroundColor White
Write-Host "└── Vertex AI: Optional advanced embeddings (configure GOOGLE_* env vars)" -ForegroundColor White

Write-ColorOutput Yellow "`n⚠️  Next Steps:"
Write-Host "1. Edit .env file with your API keys"
Write-Host "2. Configure cloud services (Azure/GCP) for enhanced features"
Write-Host "3. Monitor logs: docker-compose logs -f agentic-social"
Write-Host "4. Access Grafana dashboard for metrics visualization"

if ($Logs) {
    Write-ColorOutput Yellow "`n📜 Following application logs..."
    & $composeCmd logs -f agentic-social
}

Write-ColorOutput Red "`n🔥 Rick's signature: Social media domination activated ☠️" 