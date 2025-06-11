# Setup Development Environment - PowerShell Script
# Rick's signature: Clean environment, zero conflicts ☠️

Write-Host "🔥 Setting up Agentic Social Media Development Environment ☠️" -ForegroundColor Red
Write-Host "=" * 60

# Check if Python is installed
try {
    $pythonVersion = python --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Python not found"
    }
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.9+ from https://python.org" -ForegroundColor Yellow
    exit 1
}

# Check Python version
$pythonVersionNum = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
if ([float]$pythonVersionNum -lt 3.9) {
    Write-Host "❌ Python 3.9+ required. Found: $pythonVersionNum" -ForegroundColor Red
    exit 1
}

Write-Host "🐍 Creating virtual environment..." -ForegroundColor Cyan

# Remove existing venv if it exists
if (Test-Path "venv") {
    Write-Host "🗑️ Removing existing virtual environment..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force venv
}

# Create virtual environment
python -m venv venv
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create virtual environment" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Virtual environment created" -ForegroundColor Green

# Activate virtual environment
Write-Host "🔌 Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "⬆️ Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install requirements
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host "⚠️ This may take several minutes for ML dependencies..." -ForegroundColor Yellow

pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "💡 Try using Docker dev container instead" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

# Create .env template if it doesn't exist
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

# Database (PostgreSQL)
DATABASE_URL=postgresql://rick:socialmedia2024@localhost:5432/agentic_social

# Azure Cognitive Search (Optional)
AZURE_COGNITIVE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_COGNITIVE_SEARCH_KEY=your-azure-search-admin-key

# Google Cloud / Vertex AI (Optional)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# HuggingFace (for LoRA training)
HF_TOKEN=hf_your-huggingface-token

# Development
LOG_LEVEL=INFO
RICK_MODE=DEVELOPMENT
VECTOR_STORE_TYPE=postgresql
"@ | Out-File -FilePath ".env" -Encoding UTF8
    
    Write-Host "✅ .env template created - please add your API keys" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Development environment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your API keys"
Write-Host "2. Set up PostgreSQL database (local or cloud)"
Write-Host "3. Configure Azure Cognitive Search (optional)"
Write-Host "4. Configure Google Cloud credentials (optional)"
Write-Host "5. Run: python main.py (to test basic functionality)"
Write-Host "6. Run: python example_usage.py (to test Replicate integration)"
Write-Host ""
Write-Host "🐳 Alternative: Use Docker dev container (recommended for consistency)"
Write-Host "   See: .devcontainer/devcontainer.json"
Write-Host ""
Write-Host "🔥 Rick's signature: Environment ready for cloud-native domination ☠️" -ForegroundColor Red 