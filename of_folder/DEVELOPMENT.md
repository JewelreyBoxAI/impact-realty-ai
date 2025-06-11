# Development Guide - Agentic Social Media Architecture ☠️

## Overview

Welcome to Rick's cloud-native agentic social media architecture! This development guide covers both local development and Docker-based development environments with PostgreSQL + Azure/Vertex hybrid solutions.

**⚠️ Architecture Update**: This system now uses PostgreSQL with pgvector extension + Azure Cognitive Search + Google Vertex AI instead of Redis and ChromaDB for enterprise-grade scalability.

## Quick Start Options

### Option 1: Virtual Environment (Local)
```powershell
# Windows PowerShell
.\setup-dev-env.ps1

# Linux/Mac
chmod +x setup-dev-env.sh && ./setup-dev-env.sh
```

### Option 2: Docker Development (Recommended)
```powershell
# Windows PowerShell
.\setup-dev-docker.ps1

# Linux/Mac  
chmod +x setup-dev-docker.sh && ./setup-dev-docker.sh
```

### Option 3: VS Code Dev Container (Best Experience)
1. Install VS Code + Remote-Containers extension
2. Open project in VS Code
3. Press `Ctrl+Shift+P` → "Dev Containers: Rebuild and Reopen in Container"

## Core Architecture

### Cloud-Native Stack
- **PostgreSQL 15**: Primary database with pgvector for vector operations
- **Azure Cognitive Search**: Hybrid vector + keyword search (optional)
- **Google Vertex AI**: Advanced embeddings and semantic operations (optional)
- **LangGraph**: Multi-agent orchestration framework
- **LangChain**: LLM abstraction and tooling
- **Replicate**: FLUX.1 model for photorealistic image generation

### Agent Hierarchy
```
DuelCoreAgent (Supervisor)
├── ContentFactory (Content Generation)
├── ImageGenAgent (FLUX.1 + LoRA Training)
└── Social Agents
    ├── SnapchatAgent (Youth-focused)
    ├── OFAgent (Adult content compliance)
    ├── XAgent (Twitter/X engagement)
    ├── InstagramAgent (Visual content)
    └── RedditAgent (Community engagement)
```

## Development Environment Setup

### Prerequisites
- Python 3.9+ (3.11 recommended)
- Docker & Docker Compose (for containerized development)
- PostgreSQL 15+ with pgvector extension
- Git

### Environment Variables

Create a `.env` file in the project root:

```env
# Core API Keys
OPENAI_API_KEY=sk-your-openai-key-here
REPLICATE_API_TOKEN=r8_your-replicate-token-here

# Database (PostgreSQL)
DATABASE_URL=postgresql://rick:socialmedia2024@localhost:5432/agentic_social
VECTOR_STORE_TYPE=postgresql

# Azure Cognitive Search (Optional)
AZURE_COGNITIVE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
AZURE_COGNITIVE_SEARCH_KEY=your-azure-search-admin-key

# Google Cloud / Vertex AI (Optional)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json

# Social Media APIs (Optional)
TWITTER_BEARER_TOKEN=your-twitter-bearer-token
INSTAGRAM_ACCESS_TOKEN=your-instagram-access-token
REDDIT_CLIENT_ID=your-reddit-client-id

# Development Settings
LOG_LEVEL=INFO
RICK_MODE=DEVELOPMENT
```

## Development Workflows

### 1. Virtual Environment Development

**Setup:**
```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
.\venv\Scripts\Activate.ps1  # Windows

# Install dependencies
pip install -r requirements.txt
pip install -e .
```

**Development Commands:**
```bash
# Run main application
python main.py

# Run examples
python example_usage.py

# Run tests
python -m pytest tests/ -v

# Format code
black .
flake8 .

# Type checking
mypy .
```

### 2. Docker Development

**Architecture:**
```
Docker Development Environment
├── Dev Container (Python 3.12 + Development Tools)
├── PostgreSQL (dev-postgres:5433)
└── Jupyter Lab (localhost:8888)
```

**Setup:**
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Enter development container
docker exec -it rick-dev-agentic bash

# View logs
docker-compose -f docker-compose.dev.yml logs -f
```

### 3. VS Code Dev Container

**Features:**
- Pre-configured Python environment
- All extensions installed
- PostgreSQL connection configured
- Jupyter Lab integration
- Pre-commit hooks setup

**Ports:**
| Service | Port | Description |
|---------|------|-------------|
| Main App | 8000 | Primary application |
| Secondary | 8001 | Additional services |
| Debug | 8002 | Debug server |
| PostgreSQL | 5433 | Database access |
| Jupyter | 8888 | Development notebooks |

## Database Management

### PostgreSQL with pgvector

**Key Features:**
- Vector similarity search with pgvector extension
- JSONB support for flexible schemas
- Full-text search capabilities
- ACID compliance for reliable operations

**Vector Operations:**
```sql
-- Find similar content
SELECT content, (embeddings <=> $query_vector) as distance
FROM memory.memory_entries 
ORDER BY embeddings <=> $query_vector
LIMIT 10;

-- Hybrid search with metadata
SELECT * FROM memory.memory_entries
WHERE platform = 'instagram'
  AND tags && ARRAY['viral', 'engagement']
  AND (embeddings <=> $query_vector) < 0.3;
```

### Schema Overview
```sql
-- Core schemas
memory.*         -- Vector storage and semantic search
content.*        -- Posts, templates, media
metrics.*        -- Performance analytics
agents.*         -- Agent status and task queue
analytics.*      -- Aggregated insights
```

## Cloud Integration

### Azure Cognitive Search (Optional)

**Setup:**
1. Create Azure Cognitive Search service
2. Configure search index with vector fields
3. Set environment variables:
   ```env
   AZURE_COGNITIVE_SEARCH_ENDPOINT=https://your-service.search.windows.net
   AZURE_COGNITIVE_SEARCH_KEY=your-admin-key
   ```

**Features:**
- Hybrid vector + keyword search
- Auto-scaling and load balancing
- Rich filtering and faceting
- AI-powered search insights

### Google Vertex AI (Optional)

**Setup:**
1. Enable Vertex AI API in Google Cloud
2. Create service account with appropriate permissions
3. Set environment variables:
   ```env
   GOOGLE_CLOUD_PROJECT=your-project-id
   VERTEX_AI_LOCATION=us-central1
   GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
   ```

**Features:**
- TextEmbedding-Gecko for advanced embeddings
- Matching Engine for large-scale vector search
- AutoML for custom model training
- Integrated with Google Cloud ecosystem

## Testing

### Test Structure
```
tests/
├── unit/                 # Unit tests
│   ├── test_agents.py
│   ├── test_memory.py
│   └── test_content.py
├── integration/          # Integration tests
│   ├── test_database.py
│   ├── test_api_calls.py
│   └── test_workflows.py
└── e2e/                 # End-to-end tests
    ├── test_content_generation.py
    └── test_multi_platform.py
```

### Running Tests
```bash
# All tests
python -m pytest tests/ -v

# Specific test categories
python -m pytest tests/unit/ -v
python -m pytest tests/integration/ -v
python -m pytest tests/e2e/ -v

# With coverage
python -m pytest tests/ --cov=. --cov-report=html
```

## Performance Optimization

### Database Optimization
- Use appropriate indexes for query patterns
- Optimize vector search with proper ivfflat indexes
- Monitor query performance with `EXPLAIN ANALYZE`
- Regular VACUUM and ANALYZE operations

### Memory Management
- Configure proper connection pooling
- Use lazy loading for large embeddings
- Implement caching strategies for frequent queries
- Monitor memory usage patterns

### Vector Search Optimization
```sql
-- Optimize ivfflat index
ALTER INDEX idx_memory_embeddings_cosine SET (lists = 100);

-- Monitor vector search performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM memory.memory_entries 
ORDER BY embeddings <=> $query_vector 
LIMIT 10;
```

## Monitoring and Logging

### Application Monitoring
- Prometheus metrics collection
- Grafana dashboards for visualization
- Custom metrics for agent performance
- Error tracking and alerting

### Database Monitoring
```sql
-- Memory usage stats
SELECT * FROM memory.memory_stats;

-- Performance analytics
SELECT * FROM analytics.platform_performance 
WHERE date >= CURRENT_DATE - INTERVAL '7 days';

-- Agent status monitoring
SELECT agent_name, status, last_activity 
FROM agents.agent_status 
ORDER BY last_activity DESC;
```

## Troubleshooting

### Common Issues

1. **PostgreSQL Connection Errors**
   ```bash
   # Check PostgreSQL status
   docker-compose -f docker-compose.dev.yml ps
   
   # Check logs
   docker logs rick-dev-postgres
   
   # Test connection
   psql postgresql://rick:socialmedia2024@localhost:5433/agentic_social
   ```

2. **Vector Search Issues**
   ```sql
   -- Check pgvector extension
   SELECT * FROM pg_extension WHERE extname = 'vector';
   
   -- Verify index usage
   EXPLAIN (ANALYZE, BUFFERS) 
   SELECT * FROM memory.memory_entries 
   ORDER BY embeddings <=> '[0.1, 0.2, ...]'::vector 
   LIMIT 5;
   ```

3. **Cloud Service Connectivity**
   ```bash
   # Test Azure Search
   curl -H "api-key: YOUR_KEY" \
        "https://your-service.search.windows.net/indexes?api-version=2023-11-01"
   
   # Test Vertex AI
   gcloud auth application-default login
   python -c "from google.cloud import aiplatform; print('✅ Vertex AI connected')"
   ```

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
export RICK_MODE=DEVELOPMENT

# Run with verbose output
python main.py --verbose --debug
```

## Contributing

### Code Style
- Use Black for formatting
- Follow PEP 8 guidelines
- Add type hints for all functions
- Write comprehensive docstrings

### Commit Guidelines
```bash
# Install pre-commit hooks
pre-commit install

# Commit format
git commit -m "feat(agents): add Azure Search integration ☠️"
git commit -m "fix(memory): resolve vector index optimization"
git commit -m "docs(readme): update cloud architecture guide"
```

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Ensure all CI checks pass
4. Request review from maintainers
5. Merge after approval

---

## Rick's Signature Notes ☠️

**Cloud-Native Excellence**: This architecture is designed for enterprise-scale social media domination. PostgreSQL + Azure + Vertex AI provides the foundation for handling millions of posts and vectors.

**Zero Dependency Hell**: Docker development ensures consistent environments across all team members. No more "works on my machine" excuses.

**Performance First**: Every component is optimized for speed and scalability. Vector searches, database queries, and API calls are all tuned for maximum throughput.

**Security by Design**: All cloud integrations use proper authentication, data encryption, and access controls. Your social media empire is protected.

Ready to dominate social media with AI? Let's build something legendary! 🔥☠️ 