# Setup Docker Development Environment - PowerShell Script
# Rick's signature: Containerized development, zero dependency hell ☠️

param(
    [switch]$Clean,
    [switch]$NoCache,
    [switch]$Logs
)

Write-Host "🐳 Setting up Docker Development Environment ☠️" -ForegroundColor Red
Write-Host "=" * 60

# Check if Docker is running
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or not installed" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    exit 1
}

# Check if docker-compose is available
try {
    docker-compose version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        # Try docker compose (newer syntax)
        docker compose version | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Docker Compose not available"
        }
        $composeCmd = "docker compose"
    } else {
        $composeCmd = "docker-compose"
    }
    Write-Host "✅ Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not available" -ForegroundColor Red
    Write-Host "Please install Docker Compose and try again" -ForegroundColor Yellow
    exit 1
}

# Clean up if requested
if ($Clean) {
    Write-Host "🧹 Cleaning up existing development environment..." -ForegroundColor Yellow
    
    # Stop and remove containers
    & $composeCmd -f docker-compose.dev.yml down --volumes --remove-orphans
    
    # Remove development images
    docker rmi rick-dev-agentic rick-jupyter 2>$null
    
    # Remove development volumes
    docker volume rm rick-dev-postgres-data rick-dev-data rick-dev-logs rick-dev-models rick-dev-notebooks 2>$null
    
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env template..." -ForegroundColor Cyan
    @"
# Core API Keys
OPENAI_API_KEY=sk-your-openai-key-here

# Image Generation (Optional - will fallback to DALL-E)
REPLICATE_API_TOKEN=r8_your-replicate-token-here

# Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-twitter-access-token-secret
TWITTER_USER_ID=your-twitter-user-id

INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
INSTAGRAM_USER_ID=your-instagram-user-id

# Reddit (Optional)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret
REDDIT_USER_AGENT=your-reddit-user-agent

# Database URLs (for development)
DATABASE_URL=postgresql://rick:socialmedia2024@dev-postgres:5432/agentic_social

# Azure Cognitive Search (Optional)
AZURE_COGNITIVE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_COGNITIVE_SEARCH_KEY=your-azure-search-admin-key

# Google Cloud / Vertex AI (Optional)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1

# HuggingFace (for LoRA training)
HF_TOKEN=hf_your-huggingface-token

# Development settings
LOG_LEVEL=DEBUG
RICK_MODE=DEVELOPMENT
VECTOR_STORE_TYPE=postgresql
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ .env template created - please add your API keys" -ForegroundColor Green
}

# Create required directories
$directories = @("data", "logs", "config", "models", "notebooks")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "📁 Created directory: $dir" -ForegroundColor Cyan
    }
}

# Build and start development environment
Write-Host "🏗️ Building development containers..." -ForegroundColor Cyan

$buildArgs = @("-f", "docker-compose.dev.yml", "build")
if ($NoCache) {
    $buildArgs += "--no-cache"
}

& $composeCmd @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build development containers" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Development containers built successfully" -ForegroundColor Green

# Start development environment
Write-Host "🚀 Starting development environment..." -ForegroundColor Cyan

& $composeCmd -f docker-compose.dev.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start development environment" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Development environment started!" -ForegroundColor Green

# Show running containers
Write-Host "`n📊 Development Environment Status:" -ForegroundColor Cyan
& $composeCmd -f docker-compose.dev.yml ps

# Wait for services to be ready
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Show access information
Write-Host "`n🌐 Development Environment Access:" -ForegroundColor Green
Write-Host "├── Development Container: docker exec -it rick-dev-agentic bash" -ForegroundColor White
Write-Host "├── Jupyter Lab: http://localhost:8888" -ForegroundColor White
Write-Host "└── PostgreSQL: localhost:5433" -ForegroundColor White

Write-Host "`n📋 Development Commands:" -ForegroundColor Cyan
Write-Host "├── Enter dev container: docker exec -it rick-dev-agentic bash" -ForegroundColor White
Write-Host "├── Run tests: docker exec -it rick-dev-agentic python -m pytest" -ForegroundColor White
Write-Host "├── Run main app: docker exec -it rick-dev-agentic python main.py" -ForegroundColor White
Write-Host "├── Run examples: docker exec -it rick-dev-agentic python example_usage.py" -ForegroundColor White
Write-Host "└── View logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White

Write-Host "`n📋 Cloud Configuration:" -ForegroundColor Cyan
Write-Host "├── PostgreSQL: Primary vector store with pgvector extension" -ForegroundColor White
Write-Host "├── Azure Search: Optional hybrid search (configure AZURE_* env vars)" -ForegroundColor White
Write-Host "└── Vertex AI: Optional embeddings (configure GOOGLE_* env vars)" -ForegroundColor White

if ($Logs) {
    Write-Host "`n📜 Following logs (Ctrl+C to exit)..." -ForegroundColor Yellow
    & $composeCmd -f docker-compose.dev.yml logs -f
}

Write-Host "`n🎉 Development environment ready!" -ForegroundColor Green
Write-Host "🔥 Rick's signature: Cloud-native development environment deployed ☠️" -ForegroundColor Red 