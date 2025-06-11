# Impact Realty AI

> Intelligent Agentic System for Real Estate Operations

## Overview

Impact Realty AI is a comprehensive LangGraph-based agentic system designed to automate and enhance real estate operations through intelligent agent coordination. The system seamlessly integrates recruitment automation, compliance management, and executive assistance into a unified platform.

## 🏗️ Architecture

### Agent Hierarchy
- **Supervisor Agent**: Central orchestrator managing recruitment and compliance
- **Kevin's Assistant**: Parallel personal assistant system
- **Recruitment Department**: Sourcing, qualification, and engagement automation
- **Compliance Executive**: Document processing and validation automation

### Technology Stack
- **Backend**: FastAPI + LangGraph + LangChain
- **Frontend**: NextJS 14 + React + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with PGVector for embeddings
- **Integrations**: Zoho ecosystem (CRM, Mail, Calendar, Sign, Zia AI)

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL with PGVector extension

### Backend Setup
```bash
cd impact_realty_ai
pip install -r requirements.txt
python run.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 📁 Project Structure

```
impact_realty_ai/
├── backend/                    # Python LangGraph backend
│   ├── agents/                # Agent implementations
│   │   ├── supervisor_agent/  # Main orchestrator
│   │   └── kevin_assistant/   # Personal assistant
│   ├── tools/                 # Integration tools
│   ├── memory/                # Vector memory management
│   ├── graphs/                # LangGraph definitions
│   └── db/                    # Database connections
├── frontend/                  # NextJS React frontend
├── MCP/                       # Model Context Protocol
└── requirements.txt           # Python dependencies
```

## 🤖 Agent Capabilities

### Supervisor Agent (Central Hub)
The main orchestrator that integrates Kevin's Assistant functionality:

**Kevin's Assistant Functions:**
- **Email Processing**: Automated categorization, priority scoring, and action suggestions
- **Calendar Management**: Intelligent scheduling with conflict detection and optimization
- **Commercial Advisory**: Market intelligence and project tracking for commercial developments
- **Recovery Advisory**: Post-disaster recovery monitoring (Helene/Milton operations)

**Executive Coordination:**
- Routes complex workflows to specialized agents
- Provides unified status monitoring
- Handles cross-functional operations

### Recruitment Department Agent
Consolidated recruitment pipeline handling:
- **Sourcing**: Zoho Zia candidate suggestions with custom scraping fallback
- **Qualification**: FL-DBPR license verification + Zia skill matching + composite scoring
- **Engagement**: Calendar scheduling + email/SMS communications via VAPI
- **Full Pipeline**: End-to-end automated recruitment workflow

### Compliance Executive Agent
Consolidated compliance operations:
- **Document Intake**: Automated processing with PDF parsing and classification
- **Signature Validation**: SOP compliance checking against document requirements
- **Commission Verification**: Mathematical + regulatory validation with split agreement checks
- **Disbursement Readiness**: Cross-system verification before payouts

## LangGraph Orchestration

The system uses **LangGraph** for sophisticated workflow orchestration with state management, parallel processing, and adaptive routing.

### Workflow Architecture

```
Request → Router → [Recruitment|Compliance|Kevin Assistant] → Aggregator → Response
```

### State Management

The graph uses typed state management for different workflow types:

```python
# Base workflow state
WorkflowState: messages, request_type, status, results, errors, metadata

# Specialized states
RecruitmentState: candidates, qualification_results, engagement_metrics
ComplianceState: deal_id, documents, validation_results, compliance_score
KevinAssistantState: emails, calendar_events, advisory_data, recommendations
```

### Graph Features

#### 1. **Conditional Routing**
```python
# Routes based on request type
{
    "recruitment": "recruitment_pipeline",
    "compliance": "compliance_pipeline", 
    "kevin_assistant": "kevin_assistant",
    "error": "error_handler"
}
```

#### 2. **Parallel Processing**
- Candidate qualification in parallel
- Compliance checks executed simultaneously  
- Kevin's daily briefing components processed concurrently

#### 3. **Error Handling & Recovery**
- Graceful error handling with recovery suggestions
- Detailed error analysis and logging
- Automatic retry mechanisms for transient failures

#### 4. **Workflow Monitoring**
- Real-time progress tracking
- Performance metrics collection
- System load monitoring for adaptive routing

### API Usage Examples

#### Recruitment Request
```json
POST /api/supervisor
{
    "type": "recruitment",
    "action": "run_full_pipeline",
    "criteria": {
        "target_count": 15,
        "geo_targets": ["Tampa", "St_Petersburg"],
        "experience_min_years": 3
    }
}
```

#### Compliance Request  
```json
POST /api/supervisor
{
    "type": "compliance",
    "action": "full_compliance_check",
    "deal_id": "deal_12345"
}
```

#### Kevin's Assistant Request
```json
POST /api/supervisor
{
    "type": "kevin_assistant", 
    "action": "daily_briefing"
}
```

### Parallel Workflow Execution

For efficiency, multiple workflows can be executed in parallel:

```python
from backend.graphs.graph import execute_parallel_workflows

workflows = [
    {"type": "recruitment", "action": "source_candidates", "criteria": {...}},
    {"type": "compliance", "action": "verify_commission", "deal_id": "deal_123"},
    {"type": "kevin_assistant", "action": "process_emails"}
]

results = await execute_parallel_workflows(supervisor, workflows)
```

### Environment-Specific Graphs

The system supports different graph configurations for different environments:

```python
from backend.graphs.graph import create_graph_for_environment

# Development: Simple graph with detailed logging
dev_graph = create_graph_for_environment(supervisor, "development")

# Production: Enhanced graph with persistence and monitoring  
prod_graph = create_graph_for_environment(supervisor, "production")

# Testing: Simplified graph with mock components
test_graph = create_graph_for_environment(supervisor, "testing")
```

### Workflow State Persistence

In production, workflows can be persisted for recovery and audit trails:

```python
# Enable state persistence
enhanced_graph = create_enhanced_graph(supervisor, enable_persistence=True)

# Workflows can be resumed after interruptions
# State is automatically checkpointed at each node
```

### Advanced Features

#### 1. **Adaptive Routing**
Routes requests based on system load and performance metrics.

#### 2. **Workflow Composition**
Complex workflows can be composed from simpler building blocks.

#### 3. **Event-Driven Processing**
Supports event-driven workflows for real-time processing.

#### 4. **Integration Monitoring**
Monitors external API performance and automatically retries failed calls.

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost/impact_realty_ai

# Zoho Integration
ZOHO_CLIENT_ID=your_client_id
ZOHO_CLIENT_SECRET=your_client_secret

# OpenAI (for LangChain)
OPENAI_API_KEY=your_openai_key
```

## 🌟 Key Features

- **Zoho-First Integration**: Leverages Zoho Zia AI for heavy lifting
- **Vector Memory**: Semantic search and historical pattern recognition
- **Regulatory Compliance**: Built-in Florida real estate compliance
- **Modern UI**: Beautiful, responsive dashboard with real-time status
- **Scalable Architecture**: Modular agents that scale independently

## 📚 Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system architecture and technical specifications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for Impact Realty operations.

## 🆘 Support

For technical support or questions, please contact the development team.

---

**Impact Realty AI** - Transforming real estate operations through intelligent automation. 