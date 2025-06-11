"""
Main backend application entry point for Impact Realty AI
"""

import asyncio
import logging
import argparse
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .agents.supervisor_agent import SupervisorAgent
from .graphs.graph import (
    create_main_graph, 
    create_graph_for_environment,
    initialize_workflow_state,
    execute_parallel_workflows
)
from .db.connection import initialize_database

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Impact Realty AI Backend",
    description="LangGraph-based agentic system for real estate operations",
    version="1.0.0"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # NextJS frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent instances
supervisor_agent = None
main_graph = None

@app.on_event("startup")
async def startup_event():
    """Initialize the application"""
    global supervisor_agent, main_graph
    
    logger.info("Initializing Impact Realty AI Backend...")
    
    # Initialize database
    await initialize_database()
    
    # Initialize consolidated supervisor agent
    supervisor_agent = SupervisorAgent()
    
    # Create main LangGraph
    main_graph = create_main_graph(supervisor_agent)
    
    logger.info("Backend initialization complete")

# =============================================================================
# Web API Endpoints
# =============================================================================

@app.get("/")
async def root():
    return {"message": "Impact Realty AI Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.post("/api/supervisor")
async def supervisor_endpoint(request: dict):
    """Main supervisor endpoint for processing requests"""
    global supervisor_agent
    
    if supervisor_agent is None:
        return {"error": "Supervisor agent not initialized", "status": "failed"}
    
    try:
        result = await supervisor_agent.route_request(request)
        return result
    except Exception as e:
        logger.error(f"Supervisor request error: {e}")
        return {"error": str(e), "status": "failed"}

@app.get("/api/status")
async def status_endpoint():
    """Get overall system status"""
    global supervisor_agent
    
    if supervisor_agent is None:
        return {"error": "Supervisor agent not initialized", "status": "failed"}
    
    try:
        status = await supervisor_agent.get_status()
        return status
    except Exception as e:
        logger.error(f"Status request error: {e}")
        return {"error": str(e), "status": "failed"}

# =============================================================================
# Demo API Endpoints  
# =============================================================================

@app.post("/api/demo/recruitment")
async def demo_recruitment_endpoint():
    """Demo recruitment pipeline via API"""
    try:
        result = await demo_recruitment_pipeline()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Recruitment demo error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/demo/compliance")
async def demo_compliance_endpoint():
    """Demo compliance workflow via API"""
    try:
        result = await demo_compliance_workflow()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Compliance demo error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/demo/kevin-assistant")
async def demo_kevin_assistant_endpoint():
    """Demo Kevin's assistant via API"""
    try:
        result = await demo_kevin_assistant()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Kevin assistant demo error: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/demo/parallel")
async def demo_parallel_endpoint():
    """Demo parallel workflow execution via API"""
    try:
        result = await demo_parallel_workflows()
        return {"status": "success", "data": result}
    except Exception as e:
        logger.error(f"Parallel demo error: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/api/demo/states")
async def demo_states_endpoint():
    """Show workflow state structures via API"""
    try:
        from .graphs.graph import WorkflowState, RecruitmentState, ComplianceState
        
        states = {
            "base_workflow_state": {
                "messages": [],
                "request_type": "example",
                "request_id": "demo_123",
                "status": "initialized",
                "current_step": "demo",
                "results": {},
                "errors": [],
                "metadata": {}
            },
            "recruitment_extensions": {
                "candidates": [],
                "qualified_candidates": [],
                "engaged_candidates": [],
                "sourcing_criteria": {},
                "pipeline_metrics": {}
            },
            "compliance_extensions": {
                "deal_id": "deal_example",
                "documents": [],
                "validation_results": {},
                "compliance_score": 0.0,
                "required_actions": [],
                "approvals": []
            }
        }
        
        return {"status": "success", "data": states}
    except Exception as e:
        logger.error(f"States demo error: {e}")
        return {"status": "error", "message": str(e)}

# =============================================================================
# Demo Functions (Consolidated from run.py)
# =============================================================================

async def demo_recruitment_pipeline():
    """Demonstrate recruitment pipeline workflow"""
    logger.info("Starting recruitment pipeline demo")
    
    # Initialize supervisor and graph
    supervisor = SupervisorAgent()
    graph = create_graph_for_environment(supervisor, "development")
    
    # Create recruitment request
    request_data = {
        "type": "recruitment",
        "action": "run_full_pipeline",
        "criteria": {
            "target_count": 10,
            "geo_targets": ["Tampa", "St_Petersburg"],
            "experience_min_years": 2
        }
    }
    
    # Initialize workflow state
    initial_state = initialize_workflow_state(request_data)
    
    # Execute workflow
    logger.info("Executing recruitment pipeline...")
    result = await graph.ainvoke(initial_state)
    
    logger.info(f"Recruitment demo completed with status: {result['status']}")
    return result

async def demo_compliance_workflow():
    """Demonstrate compliance workflow"""
    logger.info("Starting compliance workflow demo")
    
    supervisor = SupervisorAgent()
    graph = create_graph_for_environment(supervisor, "development")
    
    # Create compliance request
    request_data = {
        "type": "compliance",
        "action": "full_compliance_check",
        "deal_id": "deal_12345"
    }
    
    initial_state = initialize_workflow_state(request_data)
    
    logger.info("Executing compliance workflow...")
    result = await graph.ainvoke(initial_state)
    
    logger.info(f"Compliance demo completed with status: {result['status']}")
    return result

async def demo_kevin_assistant():
    """Demonstrate Kevin's assistant functionality"""
    logger.info("Starting Kevin's assistant demo")
    
    supervisor = SupervisorAgent()
    graph = create_graph_for_environment(supervisor, "development")
    
    # Create Kevin's assistant request
    request_data = {
        "type": "kevin_assistant",
        "action": "daily_briefing"
    }
    
    initial_state = initialize_workflow_state(request_data)
    
    logger.info("Executing Kevin's daily briefing...")
    result = await graph.ainvoke(initial_state)
    
    logger.info(f"Kevin assistant demo completed with status: {result['status']}")
    return result

async def demo_parallel_workflows():
    """Demonstrate parallel workflow execution"""
    logger.info("Starting parallel workflows demo")
    
    supervisor = SupervisorAgent()
    
    # Define multiple workflows to run in parallel
    workflows = [
        {
            "type": "recruitment",
            "action": "source_candidates",
            "criteria": {"target_count": 5}
        },
        {
            "type": "compliance", 
            "action": "verify_commission",
            "deal_id": "deal_123"
        },
        {
            "type": "kevin_assistant",
            "action": "process_emails"
        }
    ]
    
    logger.info("Executing 3 workflows in parallel...")
    results = await execute_parallel_workflows(supervisor, workflows)
    
    logger.info(f"Parallel demo completed: {results['successful_workflows']}/{results['total_workflows']} successful")
    return results

async def demo_workflow_states():
    """Demonstrate different workflow state types"""
    logger.info("Demonstrating workflow state management")
    
    from .graphs.graph import WorkflowState, RecruitmentState, ComplianceState
    
    # Show different state structures
    print("🔹 Base WorkflowState structure:")
    base_state = {
        "messages": [],
        "request_type": "example",
        "request_id": "demo_123",
        "status": "initialized",
        "current_step": "demo",
        "results": {},
        "errors": [],
        "metadata": {}
    }
    print(json.dumps(base_state, indent=2))
    
    print("\n🔹 RecruitmentState extends base with:")
    recruitment_extensions = {
        "candidates": [],
        "qualified_candidates": [],
        "engaged_candidates": [],
        "sourcing_criteria": {},
        "pipeline_metrics": {}
    }
    print(json.dumps(recruitment_extensions, indent=2))
    
    print("\n🔹 ComplianceState extends base with:")
    compliance_extensions = {
        "deal_id": "deal_example",
        "documents": [],
        "validation_results": {},
        "compliance_score": 0.0,
        "required_actions": [],
        "approvals": []
    }
    print(json.dumps(compliance_extensions, indent=2))

# =============================================================================
# CLI Demo Functions
# =============================================================================

async def run_cli_demos():
    """Run all workflow demonstrations via CLI"""
    print("🚀 IMPACT REALTY AI - LANGGRAPH WORKFLOW DEMO")
    print("=" * 60)
    
    try:
        # Demo individual workflows
        print("\n🎯 RECRUITMENT PIPELINE DEMO")
        print("=" * 50)
        print("📝 Executing recruitment pipeline...")
        result1 = await demo_recruitment_pipeline()
        print(f"✅ Status: {result1['status']}")
        print(f"📊 Results: {json.dumps(result1['results'], indent=2)}")
        
        print("\n📋 COMPLIANCE WORKFLOW DEMO")
        print("=" * 50)
        print("🔍 Executing compliance workflow...")
        result2 = await demo_compliance_workflow()
        print(f"✅ Status: {result2['status']}")
        print(f"📊 Compliance Score: {result2['results'].get('compliance', {}).get('overall_compliance', {}).get('score', 'N/A')}")
        
        print("\n👨‍💼 KEVIN'S ASSISTANT DEMO")
        print("=" * 50)
        print("📧 Executing Kevin's daily briefing...")
        result3 = await demo_kevin_assistant()
        print(f"✅ Status: {result3['status']}")
        briefing = result3['results'].get('kevin_assistant', {})
        if briefing.get('summary'):
            print(f"📈 Priority Emails: {briefing['summary'].get('priority_emails', 0)}")
            print(f"📅 Scheduled Events: {briefing['summary'].get('scheduled_events', 0)}")
        
        print("\n🔄 PARALLEL WORKFLOWS DEMO")
        print("=" * 50)
        print("🚀 Executing 3 workflows in parallel...")
        result4 = await demo_parallel_workflows()
        print(f"✅ Status: {result4['status']}")
        print(f"📊 Successful Workflows: {result4['successful_workflows']}/{result4['total_workflows']}")
        
        # Demo state management
        print("\n📊 WORKFLOW STATE MANAGEMENT DEMO")
        print("=" * 50)
        await demo_workflow_states()
        
        print("\n✅ ALL DEMOS COMPLETED SUCCESSFULLY!")
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"\n❌ Demo failed: {e}")

# =============================================================================
# Main Application Entry Point
# =============================================================================

def main():
    """Main entry point with CLI argument support"""
    parser = argparse.ArgumentParser(description="Impact Realty AI Backend")
    parser.add_argument(
        "--mode", 
        choices=["server", "demo", "test"],
        default="server",
        help="Run mode: server (FastAPI), demo (CLI demonstrations), or test (validation)"
    )
    parser.add_argument("--host", default="0.0.0.0", help="Server host")
    parser.add_argument("--port", type=int, default=8000, help="Server port")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload for development")
    
    args = parser.parse_args()
    
    if args.mode == "demo":
        # Run CLI demonstrations
        print("🎯 Starting CLI Demo Mode...")
        asyncio.run(run_cli_demos())
        
    elif args.mode == "test":
        # Run validation tests
        print("🧪 Starting Test Mode...")
        asyncio.run(run_validation_tests())
        
    else:
        # Run FastAPI server
        print(f"🚀 Starting FastAPI Server on {args.host}:{args.port}")
        import uvicorn
        uvicorn.run(
            "backend.main:app", 
            host=args.host, 
            port=args.port,
            reload=args.reload
        )

async def run_validation_tests():
    """Run basic validation tests"""
    print("🧪 IMPACT REALTY AI - VALIDATION TESTS")
    print("=" * 50)
    
    try:
        # Test supervisor agent initialization
        print("🔍 Testing supervisor agent initialization...")
        supervisor = SupervisorAgent()
        status = await supervisor.get_status()
        print(f"✅ Supervisor Status: {status['status']}")
        
        # Test graph creation
        print("🔍 Testing graph creation...")
        graph = create_graph_for_environment(supervisor, "development")
        print("✅ Graph created successfully")
        
        # Test state initialization
        print("🔍 Testing state initialization...")
        test_request = {"type": "test", "action": "validate"}
        state = initialize_workflow_state(test_request)
        print("✅ State initialization successful")
        
        print("\n✅ ALL VALIDATION TESTS PASSED!")
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        print(f"\n❌ Validation failed: {e}")

if __name__ == "__main__":
    main() 