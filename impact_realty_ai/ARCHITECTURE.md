# Impact Realty AI - Consolidated Architecture

## Overview

Impact Realty AI is a streamlined LangGraph-based agentic system designed to automate real estate operations through intelligent agent coordination. The system has been consolidated into a simplified architecture that combines recruitment automation, compliance management, and executive assistance into a unified platform.

## System Architecture

### Core Components

```
impact_realty_ai/
├── MCP/                          # Model Context Protocol integrations
├── backend/                      # Python LangGraph backend
│   ├── agents/                  # Consolidated agent implementations
│   │   ├── supervisor_agent/    # Main supervisor (includes Kevin's Assistant)
│   │   └── exec_agents/         # Executive agents (recruitment + compliance)
│   ├── tools/                   # Tool integrations
│   ├── memory/                  # Vector memory management
│   ├── graphs/                  # LangGraph definitions
│   └── db/                      # Database connections
├── frontend/                    # NextJS React UI
└── requirements.txt             # Python dependencies
```

## Consolidated Agent Architecture

### 1. Supervisor Agent (Central Hub)
**Location**: `backend/agents/supervisor_agent/supervisor_agent.py`

The consolidated orchestrator that manages all operations:

#### Integrated Kevin's Assistant Functions:
- **Email Processing**: Configuration-driven email categorization and priority scoring
- **Calendar Management**: Intelligent scheduling with conflict detection  
- **Commercial Advisory**: JSON-based market intelligence and project tracking
- **Recovery Advisory**: Post-disaster recovery monitoring (Helene/Milton)

#### Executive Agent Coordination:
- Routes complex workflows to specialized executive agents
- Provides unified status monitoring and reporting
- Handles cross-functional operations

### 2. Recruitment Department Agent
**Location**: `backend/agents/exec_agents/recruitment_dept_agent.py`

Consolidated recruitment pipeline in a single file:

- **Sourcing**: Zoho Zia Candidate Suggestions + custom scraping fallback
- **Qualification**: License verification (FL-DBPR) + Zia skill matching + composite scoring
- **Engagement**: Calendar scheduling + email/SMS communications via VAPI
- **Full Pipeline**: End-to-end automated recruitment workflow

### 3. Compliance Executive Agent  
**Location**: `backend/agents/exec_agents/compliance_exec_agent.py`

Consolidated compliance operations in a single file:

- **Document Intake**: Automated processing with PDF parsing and classification
- **Signature Validation**: SOP compliance checking against document requirements
- **Commission Verification**: Mathematical + regulatory validation with split agreement checks
- **Disbursement Readiness**: Cross-system verification before payouts
- **Full Compliance Check**: Comprehensive deal compliance scoring

## Configuration-Driven Approach

### JSON-Based Operations
Instead of separate agent classes for simple operations, the system uses JSON configurations:

```python
# Example: Kevin's Email Processing Config
"email_processing": {
    "priority_keywords": ["urgent", "closing", "commission", "compliance"],
    "auto_reply_templates": {
        "meeting_request": "Thank you for reaching out...",
        "property_inquiry": "Thanks for your interest..."
    }
}

# Example: Recruitment Sourcing Config
"sourcing": {
    "default_criteria": {
        "target_count": 10,
        "experience_min_years": 2,
        "license_required": True
    },
    "geo_targets": ["Tampa", "St_Petersburg", "Clearwater"]
}
```

## Technology Stack

### Backend
- **Framework**: FastAPI with async support
- **Agent System**: LangGraph for agent orchestration
- **Database**: PostgreSQL with PGVector for embeddings
- **Memory**: Vector-based memory management for semantic search
- **APIs**: Extensive Zoho ecosystem integration (CRM, Mail, Calendar, Sign)

### Frontend
- **Framework**: NextJS 14 with TypeScript
- **UI**: Modern design with Tailwind CSS and Headless UI
- **Animations**: Framer Motion for enhanced UX
- **State Management**: React hooks for agent communication

### Integrations
- **Zoho Ecosystem**: CRM, Mail, Calendar, Sign, Zia AI
- **External APIs**: FL-DBPR for license verification, Broker Sumo for disbursements
- **Communications**: VAPI for SMS/voice fallback
- **MCP Protocol**: Standardized tool calling and data exchange

## Simplified Data Flow

### 1. Unified Request Processing
```
Client Request → Supervisor Agent → Route Based on Type
                     ↓
              [recruitment | compliance | kevin_assistant]
                     ↓
              Execute via Config + Tools
                     ↓
              Return Consolidated Response
```

### 2. Recruitment Pipeline (Single Agent)
```
Source → Qualify → Engage (All in recruitment_dept_agent.py)
   ↓        ↓        ↓
Zoho Zia → FL-DBPR → Calendar + Email/SMS
```

### 3. Compliance Pipeline (Single Agent)
```
Intake → Validate → Verify → Check Readiness (All in compliance_exec_agent.py)
   ↓        ↓        ↓         ↓
PDF Parse → Signatures → Commission Math → Disbursement Ready
```

## Key Simplifications

### Consolidated Operations
- **3 Main Files**: supervisor_agent.py, recruitment_dept_agent.py, compliance_exec_agent.py
- **JSON Configuration**: Simple operations use configuration instead of separate classes
- **Integrated Functionality**: Kevin's Assistant integrated directly into Supervisor
- **Unified Routing**: Single entry point handles all request types

### Eliminated Complexity
- **No Separate Kevin's Assistant**: Integrated into Supervisor Agent
- **No Sub-Agent Folders**: Each executive function in single file
- **No Micro-Agents**: Simple operations use JSON + helper methods
- **Simplified Tool Chain**: Reduced redundant tool classes

## API Endpoints

### Main Endpoints
- `POST /api/supervisor` - Main request processing endpoint
- `GET /api/status` - System-wide status monitoring
- `GET /health` - Health check

### Request Examples
```json
// Recruitment Request
{
    "type": "recruitment",
    "action": "run_full_pipeline", 
    "criteria": {"target_count": 15, "geo": "Tampa"}
}

// Kevin's Assistant Request  
{
    "type": "kevin_assistant",
    "action": "process_emails"
}

// Compliance Request
{
    "type": "compliance", 
    "action": "full_compliance_check",
    "deal_id": "deal_12345"
}
```

## Performance Benefits

### Reduced Overhead
- **Fewer Files**: 3 main agent files vs 15+ separate files
- **Less Memory**: Single instances vs multiple agent objects
- **Faster Imports**: Simplified dependency tree
- **Simpler Debugging**: Consolidated code paths

### Enhanced Maintainability  
- **Single Source of Truth**: Each operation type in one file
- **Configuration-Driven**: Easy to modify behavior without code changes
- **Clear Separation**: Executive functions vs configuration-based operations
- **Unified Testing**: Test complete workflows in single files

## Security & Compliance

### Data Protection
- **Audit Trails**: Complete logging of all compliance-related operations
- **Document Security**: Secure storage with version control and access logging
- **API Security**: OAuth integration with Zoho and encrypted communications

### Regulatory Compliance
- **Real Estate Regulations**: Built-in Florida real estate compliance checks
- **Commission Validation**: Mathematical and regulatory validation of all splits
- **License Verification**: Automated verification against state databases

## Deployment Architecture

### Development Environment
```
Backend (Port 8000): FastAPI + LangGraph + Consolidated Agents
Frontend (Port 3000): NextJS React
Database: PostgreSQL with PGVector
```

## Getting Started

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
-- Enable PGVector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

This consolidated architecture provides the same functionality as the original design while significantly reducing complexity and improving maintainability. 