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

## Frontend-Backend Integration Architecture

### FastAPI REST API Layer

The system implements a clean separation between frontend and backend through a comprehensive REST API layer built with FastAPI. This architecture ensures scalability, maintainability, and clear separation of concerns.

#### Why FastAPI?
- **High Performance**: Async support for concurrent request handling
- **Type Safety**: Pydantic models provide automatic validation and serialization
- **Auto Documentation**: OpenAPI/Swagger documentation generation
- **Standards Compliant**: Full REST API standards with proper HTTP methods
- **Python Ecosystem**: Seamless integration with LangGraph and ML libraries

#### API Architecture Principles
```
Frontend (React/Next.js) ←→ REST API (FastAPI) ←→ Backend Logic (LangGraph + Agents)
     │                           │                        │
     │                           │                        │
  UI Layer Only            Request/Response           Agent Orchestration
  HTTP Calls               Validation & Routing       Business Logic
  User Interactions        Pydantic Models            Database Operations
```

### REST API Design

#### Base Configuration
```python
# FastAPI Configuration
app = FastAPI(
    title="Impact Realty AI - Agentic OS",
    description="Advanced AI agent orchestration platform",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc"  # ReDoc
)

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Request/Response Models (Pydantic)
```python
# Agent Request Models
class AgentCreateRequest(BaseModel):
    name: str
    description: str
    type: AgentType
    configuration: Dict[str, Any]
    tools: List[str] = []

class AgentResponse(BaseModel):
    id: str
    name: str
    status: AgentStatus
    created_at: datetime
    last_execution: Optional[datetime]
    performance_metrics: Dict[str, float]

# Workflow Models
class WorkflowRequest(BaseModel):
    name: str
    nodes: List[WorkflowNode]
    connections: List[WorkflowConnection]
    configuration: WorkflowConfig

class WorkflowExecutionResponse(BaseModel):
    execution_id: str
    status: ExecutionStatus
    result: Optional[Dict[str, Any]]
    error: Optional[str]
    execution_time: float
```

### API Endpoint Structure

#### Agent Management Endpoints
```python
@app.post("/api/agents", response_model=AgentResponse)
async def create_agent(request: AgentCreateRequest):
    """Create new agent instance"""
    
@app.get("/api/agents", response_model=List[AgentResponse])
async def list_agents():
    """List all available agents"""
    
@app.get("/api/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get specific agent details"""
    
@app.put("/api/agents/{agent_id}", response_model=AgentResponse)
async def update_agent(agent_id: str, request: AgentUpdateRequest):
    """Update agent configuration"""
    
@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str):
    """Remove agent instance"""
```

#### Workflow Orchestration Endpoints
```python
@app.post("/api/workflows", response_model=WorkflowResponse)
async def create_workflow(request: WorkflowRequest):
    """Create new workflow definition"""
    
@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow(workflow_id: str, params: Dict[str, Any]):
    """Execute workflow with parameters"""
    
@app.get("/api/workflows/{workflow_id}/status")
async def get_workflow_status(workflow_id: str):
    """Get real-time workflow execution status"""
    
@app.post("/api/workflows/{workflow_id}/stop")
async def stop_workflow(workflow_id: str):
    """Stop running workflow execution"""
```

#### Real Estate Operations Endpoints
```python
@app.post("/api/supervisor", response_model=SupervisorResponse)
async def supervisor_request(request: SupervisorRequest):
    """Main entry point for all agent operations"""
    
@app.post("/api/recruitment/pipeline")
async def recruitment_pipeline(request: RecruitmentRequest):
    """Execute recruitment workflow"""
    
@app.post("/api/compliance/check")
async def compliance_check(request: ComplianceRequest):
    """Perform compliance validation"""
    
@app.get("/api/metrics", response_model=MetricsResponse)
async def get_system_metrics():
    """System-wide performance metrics"""
```

### Frontend API Client Implementation

#### TypeScript API Client (`frontend/lib/api.ts`)
```typescript
class ApiClient {
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.message, response.status);
    }
    
    return response.json();
  }

  // Type-safe method implementations
  async createAgent(agentData: AgentCreateRequest): Promise<AgentResponse> {
    return this.request<AgentResponse>('/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async executeWorkflow(workflowId: string, params: any): Promise<WorkflowExecutionResponse> {
    return this.request<WorkflowExecutionResponse>(`/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}

export const api = new ApiClient();
```

#### React Integration Patterns
```typescript
// Custom hooks for API operations
export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getAgents()
      .then(setAgents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading, error, refetch: () => window.location.reload() };
}

// Component usage
function AgentList() {
  const { agents, loading, error } = useAgents();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  
  return (
    <div>
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
```

### Data Flow Architecture

#### Request Processing Flow
```
1. User Interaction (Frontend)
   ↓
2. React Event Handler
   ↓
3. API Client Method Call
   ↓
4. HTTP Request to FastAPI
   ↓
5. Pydantic Validation
   ↓
6. Route Handler Function
   ↓
7. Business Logic (LangGraph)
   ↓
8. Database Operations
   ↓
9. Response Serialization
   ↓
10. HTTP Response to Frontend
    ↓
11. State Update in React
    ↓
12. UI Re-render
```

#### Real-time Updates (WebSocket Integration)
```python
# FastAPI WebSocket endpoint
@app.websocket("/ws/workflow/{workflow_id}")
async def workflow_websocket(websocket: WebSocket, workflow_id: str):
    await websocket.accept()
    
    # Stream workflow execution updates
    async for update in workflow_execution_stream(workflow_id):
        await websocket.send_json({
            "type": "workflow_update",
            "data": update.dict()
        })
```

```typescript
// Frontend WebSocket client
class WorkflowSocket {
  private ws: WebSocket;
  
  connect(workflowId: string, onUpdate: (data: any) => void) {
    this.ws = new WebSocket(`ws://localhost:8000/ws/workflow/${workflowId}`);
    this.ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      onUpdate(update.data);
    };
  }
}
```

### Error Handling Strategy

#### Backend Error Responses
```python
# Standardized error response format
class ErrorResponse(BaseModel):
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content=ErrorResponse(
            error="validation_error",
            message="Request validation failed",
            details={"errors": exc.errors()},
            timestamp=datetime.utcnow()
        ).dict()
    )
```

#### Frontend Error Handling
```typescript
// Error boundary for API failures
class ApiErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Security Implementation

#### Authentication & Authorization
```python
# JWT token validation
@app.middleware("http")
async def authenticate_request(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        token = request.headers.get("Authorization")
        if not token:
            return JSONResponse(status_code=401, content={"error": "Missing token"})
        
        # Validate JWT token
        user = await validate_jwt_token(token)
        request.state.user = user
    
    response = await call_next(request)
    return response
```

#### HTTPS & CORS Configuration
```python
# Production security settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.impactrealty.ai"],  # Production domain
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# HTTPS redirect in production
@app.middleware("http")
async def https_redirect(request: Request, call_next):
    if request.headers.get("x-forwarded-proto") == "http":
        url = request.url.replace(scheme="https")
        return RedirectResponse(url, status_code=301)
    return await call_next(request)
```

### Performance Optimization

#### Async Operations
```python
# Async database operations
@app.get("/api/agents")
async def get_agents():
    async with get_db_session() as session:
        result = await session.execute(select(Agent))
        agents = result.scalars().all()
        return [AgentResponse.from_orm(agent) for agent in agents]

# Background task processing
@app.post("/api/workflows/{workflow_id}/execute")
async def execute_workflow_async(workflow_id: str, request: WorkflowRequest):
    task = await start_background_task(execute_workflow_task, workflow_id, request)
    return {"task_id": task.id, "status": "started"}
```

#### Caching Strategy
```python
# Redis caching for frequent requests
@app.get("/api/metrics")
@cache(expire=60)  # Cache for 1 minute
async def get_metrics():
    return await calculate_system_metrics()
```

This REST API architecture ensures clean separation between frontend UI concerns and backend agent logic, providing scalability, maintainability, and clear development boundaries for the team.

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

## API Endpoints Summary

### Current Implemented Endpoints
Based on the frontend API client implementation, the system exposes the following REST endpoints:

#### Agent Management
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/{id}` - Get specific agent
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent

#### Workflow Management  
- `GET /api/workflows` - List workflows
- `POST /api/workflows` - Create/save workflow
- `GET /api/workflows/{id}` - Get specific workflow
- `POST /api/workflows/{id}/execute` - Execute workflow
- `GET /api/workflows/{id}/status` - Get execution status

#### System Monitoring
- `GET /api/metrics` - Get system metrics
- `POST /api/metrics` - Get real-time metrics
- `GET /health` - Health check endpoint

#### Deployment (Future)
- `POST /api/deploy/{workflow_id}` - Deploy workflow
- `GET /api/deploy/{deployment_id}` - Check deployment status

### Request Examples (FastAPI + Pydantic)
```json
// Agent Creation Request
{
    "name": "Recruitment Agent",
    "description": "Automated recruitment pipeline",
    "type": "recruitment",
    "configuration": {
        "target_count": 15,
        "geo_targets": ["Tampa", "St_Petersburg"],
        "experience_min_years": 2
    },
    "tools": ["zoho_zia", "fl_dbpr", "vapi"]
}

// Workflow Execution Request
{
    "workflow_id": "workflow_123",
    "parameters": {
        "agent_type": "recruitment",
        "action": "run_full_pipeline",
        "criteria": {
            "target_count": 15, 
            "geo": "Tampa"
        }
    }
}

// Supervisor Request (Real Estate Operations)
{
    "type": "kevin_assistant",
    "action": "process_emails",
    "configuration": {
        "priority_keywords": ["urgent", "closing", "commission"],
        "auto_reply": true
    }
}
```

### Response Format (Standardized)
```json
// Success Response
{
    "success": true,
    "data": {
        "id": "agent_123",
        "status": "created",
        "created_at": "2024-01-15T10:30:00Z"
    },
    "meta": {
        "execution_time": 0.245,
        "version": "1.0.0"
    }
}

// Error Response  
{
    "success": false,
    "error": {
        "code": "validation_error",
        "message": "Invalid agent configuration",
        "details": {
            "field": "target_count",
            "issue": "Must be positive integer"
        }
    },
    "timestamp": "2024-01-15T10:30:00Z"
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

### Production Deployment Stack
```
Frontend (Next.js) → CDN/Edge (Vercel/AWS CloudFront)
                            ↓
                     Load Balancer (AWS ALB)
                            ↓
                     FastAPI Servers (ECS/K8s)
                            ↓
                     Database Cluster (RDS PostgreSQL)
                            ↓
                     Vector Store (Pinecone/PGVector)
```

## Architectural Benefits of FastAPI + React Separation

### Development Benefits
1. **Team Specialization**: Frontend and backend developers can work independently
2. **Technology Flexibility**: Can upgrade React or Python versions independently  
3. **Testing Isolation**: Unit tests for API logic separate from UI tests
4. **Clear Contracts**: API endpoints serve as clear interface contracts

### Scalability Benefits
1. **Independent Scaling**: Scale frontend (static) and backend (compute) separately
2. **Microservices Ready**: Can split FastAPI into multiple services if needed
3. **Caching Layers**: Can cache API responses independently of UI
4. **Multiple Frontends**: Same API can serve web, mobile, CLI clients

### Maintenance Benefits
1. **Clear Separation of Concerns**: UI logic vs business logic clearly separated
2. **Error Isolation**: Frontend errors don't crash backend and vice versa
3. **Deployment Independence**: Can deploy frontend and backend separately
4. **Monitoring**: Separate monitoring for API performance vs UI performance

### Security Benefits
1. **API Gateway**: FastAPI serves as security gateway for all backend access
2. **Input Validation**: Pydantic models ensure all input is validated before processing
3. **Rate Limiting**: Can implement rate limiting at API level
4. **Authentication**: Centralized auth handling in FastAPI middleware

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