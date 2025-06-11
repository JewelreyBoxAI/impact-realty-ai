"""
Main LangGraph Definition - Consolidated Architecture
===================================================

Orchestrates the consolidated supervisor agent with proper state management,
workflow routing, and data flow between recruitment and compliance operations.
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional, TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from ..agents.supervisor_agent import SupervisorAgent
import psutil

logger = logging.getLogger(__name__)

# State definitions for different workflow types
class WorkflowState(TypedDict):
    """Base state for all workflows"""
    messages: Annotated[List[BaseMessage], add_messages]
    request_type: str
    request_id: str
    status: str
    current_step: str
    results: Dict[str, Any]
    errors: List[str]
    metadata: Dict[str, Any]

class RecruitmentState(WorkflowState):
    """Extended state for recruitment workflows"""
    candidates: List[Dict[str, Any]]
    qualified_candidates: List[Dict[str, Any]]
    engaged_candidates: List[Dict[str, Any]]
    sourcing_criteria: Dict[str, Any]
    pipeline_metrics: Dict[str, Any]

class ComplianceState(WorkflowState):
    """Extended state for compliance workflows"""
    deal_id: str
    documents: List[Dict[str, Any]]
    validation_results: Dict[str, Any]
    compliance_score: float
    required_actions: List[str]
    approvals: List[Dict[str, Any]]

class KevinAssistantState(WorkflowState):
    """Extended state for Kevin's assistant workflows"""
    emails: List[Dict[str, Any]]
    calendar_events: List[Dict[str, Any]]
    advisory_topic: Optional[str]
    processed_items: List[Dict[str, Any]]
    recommendations: List[str]

def create_main_graph(supervisor: SupervisorAgent):
    """Create the main application graph with consolidated agent orchestration"""
    
    # Create the main workflow graph
    workflow = StateGraph(WorkflowState)
    
    # Define core nodes
    workflow.add_node("request_router", create_request_router(supervisor))
    workflow.add_node("recruitment_pipeline", create_recruitment_pipeline(supervisor))
    workflow.add_node("compliance_pipeline", create_compliance_pipeline(supervisor))
    workflow.add_node("kevin_assistant", create_kevin_assistant_pipeline(supervisor))
    workflow.add_node("result_aggregator", create_result_aggregator())
    workflow.add_node("error_handler", create_error_handler())
    
    # Set entry point
    workflow.set_entry_point("request_router")
    
    # Define routing logic
    workflow.add_conditional_edges(
        "request_router",
        route_request,
        {
            "recruitment": "recruitment_pipeline",
            "compliance": "compliance_pipeline", 
            "kevin_assistant": "kevin_assistant",
            "error": "error_handler"
        }
    )
    
    # Pipeline completions route to result aggregator
    workflow.add_edge("recruitment_pipeline", "result_aggregator")
    workflow.add_edge("compliance_pipeline", "result_aggregator")
    workflow.add_edge("kevin_assistant", "result_aggregator")
    workflow.add_edge("error_handler", "result_aggregator")
    
    # End workflow
    workflow.add_edge("result_aggregator", END)
    
    return workflow.compile()

def create_request_router(supervisor: SupervisorAgent):
    """Create request routing node"""
    async def route_request_node(state: WorkflowState) -> WorkflowState:
        """Route incoming requests to appropriate pipeline"""
        try:
            logger.info(f"Routing request: {state['request_type']}")
            
            # Extract request from messages
            if state["messages"]:
                last_message = state["messages"][-1]
                if hasattr(last_message, 'content'):
                    import json
                    try:
                        request_data = json.loads(last_message.content)
                        state["request_type"] = request_data.get("type", "unknown")
                        state["metadata"].update(request_data)
                    except json.JSONDecodeError:
                        state["request_type"] = "unknown"
            
            state["current_step"] = "routing_complete"
            state["status"] = "routed"
            
            return state
            
        except Exception as e:
            logger.error(f"Request routing error: {e}")
            state["errors"].append(f"Routing error: {str(e)}")
            state["status"] = "error"
            return state
    
    return route_request_node

def create_recruitment_pipeline(supervisor: SupervisorAgent):
    """Create recruitment workflow pipeline"""
    async def recruitment_pipeline_node(state: WorkflowState) -> WorkflowState:
        """Execute complete recruitment pipeline"""
        try:
            logger.info("Starting recruitment pipeline")
            state["current_step"] = "recruitment_processing"
            
            # Extract recruitment request details
            action = state["metadata"].get("action", "run_full_pipeline")
            criteria = state["metadata"].get("criteria", {})
            
            # Execute recruitment workflow
            if action == "run_full_pipeline":
                result = await execute_full_recruitment_pipeline(supervisor, criteria)
            elif action == "source_candidates":
                result = await supervisor.recruitment_agent.process_request({
                    "action": "source_candidates",
                    "criteria": criteria
                })
            elif action == "qualify_candidate":
                candidate_id = state["metadata"].get("candidate_id")
                result = await supervisor.recruitment_agent.process_request({
                    "action": "qualify_candidate", 
                    "candidate_id": candidate_id
                })
            elif action == "engage_candidate":
                candidate_id = state["metadata"].get("candidate_id")
                result = await supervisor.recruitment_agent.process_request({
                    "action": "engage_candidate",
                    "candidate_id": candidate_id
                })
            else:
                result = {"status": "error", "message": f"Unknown recruitment action: {action}"}
            
            # Update state with results
            state["results"]["recruitment"] = result
            state["status"] = "completed" if result.get("status") == "success" else "failed"
            state["current_step"] = "recruitment_complete"
            
            # Add response message
            response_msg = AIMessage(content=f"Recruitment pipeline completed: {result.get('status')}")
            state["messages"].append(response_msg)
            
            return state
            
        except Exception as e:
            logger.error(f"Recruitment pipeline error: {e}")
            state["errors"].append(f"Recruitment error: {str(e)}")
            state["status"] = "error"
            return state
    
    return recruitment_pipeline_node

async def execute_full_recruitment_pipeline(supervisor: SupervisorAgent, criteria: Dict[str, Any]) -> Dict[str, Any]:
    """Execute complete recruitment pipeline with enhanced orchestration"""
    pipeline_results = {
        "sourcing": None,
        "qualification": [],
        "engagement": [],
        "metrics": {}
    }
    
    try:
        # Step 1: Source candidates
        logger.info("Pipeline Step 1: Sourcing candidates")
        sourcing_result = await supervisor.recruitment_agent._source_candidates(criteria)
        pipeline_results["sourcing"] = sourcing_result
        
        if sourcing_result["status"] != "success":
            return {"status": "failed", "pipeline": pipeline_results, "error": "Sourcing failed"}
        
        candidates = sourcing_result.get("candidates", [])
        
        # Step 2: Qualify candidates (parallel processing)
        logger.info(f"Pipeline Step 2: Qualifying {len(candidates)} candidates")
        qualification_tasks = []
        for candidate in candidates:
            task = supervisor.recruitment_agent._qualify_candidate(candidate.get("id"))
            qualification_tasks.append(task)
        
        qualification_results = await asyncio.gather(*qualification_tasks, return_exceptions=True)
        
        qualified_candidates = []
        for i, result in enumerate(qualification_results):
            if isinstance(result, Exception):
                logger.error(f"Qualification error for candidate {candidates[i].get('id')}: {result}")
                continue
            if result.get("qualification", {}).get("qualified", False):
                qualified_candidates.append(result)
        
        pipeline_results["qualification"] = qualified_candidates
        
        # Step 3: Engage qualified candidates (parallel processing)
        logger.info(f"Pipeline Step 3: Engaging {len(qualified_candidates)} qualified candidates")
        engagement_tasks = []
        for qualified in qualified_candidates:
            task = supervisor.recruitment_agent._engage_candidate(qualified["candidate_id"])
            engagement_tasks.append(task)
        
        engagement_results = await asyncio.gather(*engagement_tasks, return_exceptions=True)
        
        successful_engagements = []
        for i, result in enumerate(engagement_results):
            if isinstance(result, Exception):
                logger.error(f"Engagement error for candidate {qualified_candidates[i]['candidate_id']}: {result}")
                continue
            if result.get("status") == "success":
                successful_engagements.append(result)
        
        pipeline_results["engagement"] = successful_engagements
        
        # Calculate pipeline metrics
        pipeline_results["metrics"] = {
            "total_sourced": len(candidates),
            "total_qualified": len(qualified_candidates),
            "total_engaged": len(successful_engagements),
            "qualification_rate": len(qualified_candidates) / len(candidates) if candidates else 0,
            "engagement_rate": len(successful_engagements) / len(qualified_candidates) if qualified_candidates else 0,
            "overall_conversion": len(successful_engagements) / len(candidates) if candidates else 0
        }
        
        return {"status": "success", "pipeline": pipeline_results}
        
    except Exception as e:
        logger.error(f"Full recruitment pipeline error: {e}")
        return {"status": "error", "pipeline": pipeline_results, "error": str(e)}

def create_compliance_pipeline(supervisor: SupervisorAgent):
    """Create compliance workflow pipeline"""
    async def compliance_pipeline_node(state: WorkflowState) -> WorkflowState:
        """Execute compliance workflow"""
        try:
            logger.info("Starting compliance pipeline")
            state["current_step"] = "compliance_processing"
            
            # Extract compliance request details
            action = state["metadata"].get("action", "full_compliance_check")
            deal_id = state["metadata"].get("deal_id")
            document_path = state["metadata"].get("document_path")
            document_id = state["metadata"].get("document_id")
            
            # Execute compliance workflow based on action
            if action == "full_compliance_check":
                result = await execute_full_compliance_workflow(supervisor, deal_id)
            elif action == "intake_document":
                result = await supervisor.compliance_agent.process_request({
                    "action": "intake_document",
                    "document_path": document_path
                })
            elif action == "validate_signatures":
                result = await supervisor.compliance_agent.process_request({
                    "action": "validate_signatures",
                    "document_id": document_id
                })
            elif action == "verify_commission":
                result = await supervisor.compliance_agent.process_request({
                    "action": "verify_commission",
                    "deal_id": deal_id
                })
            elif action == "check_disbursement":
                result = await supervisor.compliance_agent.process_request({
                    "action": "check_disbursement",
                    "deal_id": deal_id
                })
            else:
                result = {"status": "error", "message": f"Unknown compliance action: {action}"}
            
            # Update state with results
            state["results"]["compliance"] = result
            state["status"] = "completed" if result.get("status") == "success" else "failed"
            state["current_step"] = "compliance_complete"
            
            # Add response message
            response_msg = AIMessage(content=f"Compliance pipeline completed: {result.get('status')}")
            state["messages"].append(response_msg)
            
            return state
            
        except Exception as e:
            logger.error(f"Compliance pipeline error: {e}")
            state["errors"].append(f"Compliance error: {str(e)}")
            state["status"] = "error"
            return state
    
    return compliance_pipeline_node

async def execute_full_compliance_workflow(supervisor: SupervisorAgent, deal_id: str) -> Dict[str, Any]:
    """Execute complete compliance workflow with parallel processing"""
    try:
        # Execute compliance checks in parallel where possible
        compliance_tasks = {
            "commission_verification": supervisor.compliance_agent._verify_commission_split(deal_id),
            "disbursement_readiness": supervisor.compliance_agent._check_disbursement_readiness(deal_id)
        }
        
        # Wait for all compliance checks to complete
        results = await asyncio.gather(*compliance_tasks.values(), return_exceptions=True)
        
        compliance_results = {}
        for i, (check_name, result) in enumerate(zip(compliance_tasks.keys(), results)):
            if isinstance(result, Exception):
                logger.error(f"Compliance check {check_name} failed: {result}")
                compliance_results[check_name] = {"status": "error", "error": str(result)}
            else:
                compliance_results[check_name] = result
        
        # Calculate overall compliance score
        valid_results = [r for r in compliance_results.values() if r.get("status") == "success"]
        compliance_score = len(valid_results) / len(compliance_tasks) if compliance_tasks else 0
        
        overall_compliance = {
            "score": compliance_score,
            "status": "compliant" if compliance_score >= 0.8 else "non_compliant",
            "checks_passed": len(valid_results),
            "total_checks": len(compliance_tasks)
        }
        
        return {
            "status": "success",
            "deal_id": deal_id,
            "compliance_results": compliance_results,
            "overall_compliance": overall_compliance
        }
        
    except Exception as e:
        logger.error(f"Full compliance workflow error: {e}")
        return {"status": "error", "error": str(e)}

def create_kevin_assistant_pipeline(supervisor: SupervisorAgent):
    """Create Kevin's assistant workflow pipeline"""
    async def kevin_assistant_node(state: WorkflowState) -> WorkflowState:
        """Execute Kevin's assistant workflows"""
        try:
            logger.info("Starting Kevin's assistant pipeline")
            state["current_step"] = "kevin_processing"
            
            # Extract assistant request details
            action = state["metadata"].get("action", "process_emails")
            date = state["metadata"].get("date")
            topic = state["metadata"].get("topic")
            
            # Execute Kevin's assistant workflow
            if action == "process_emails":
                result = await supervisor._process_kevins_emails()
            elif action == "manage_calendar":
                result = await supervisor._manage_kevins_calendar(date)
            elif action == "commercial_advisory":
                result = await supervisor._provide_commercial_advisory(topic)
            elif action == "recovery_advisory":
                result = await supervisor._track_recovery_progress()
            elif action == "daily_briefing":
                result = await execute_daily_briefing_workflow(supervisor)
            else:
                result = {"status": "error", "message": f"Unknown Kevin assistant action: {action}"}
            
            # Update state with results
            state["results"]["kevin_assistant"] = result
            state["status"] = "completed" if result.get("status") == "success" else "failed"
            state["current_step"] = "kevin_complete"
            
            # Add response message
            response_msg = AIMessage(content=f"Kevin's assistant completed: {result.get('status')}")
            state["messages"].append(response_msg)
            
            return state
            
        except Exception as e:
            logger.error(f"Kevin's assistant pipeline error: {e}")
            state["errors"].append(f"Kevin assistant error: {str(e)}")
            state["status"] = "error"
            return state
    
    return kevin_assistant_node

async def execute_daily_briefing_workflow(supervisor: SupervisorAgent) -> Dict[str, Any]:
    """Execute Kevin's daily briefing workflow combining multiple data sources"""
    try:
        # Execute all briefing components in parallel
        briefing_tasks = {
            "emails": supervisor._process_kevins_emails(),
            "calendar": supervisor._manage_kevins_calendar(),
            "commercial_intel": supervisor._provide_commercial_advisory("market_analysis"),
            "recovery_update": supervisor._track_recovery_progress()
        }
        
        results = await asyncio.gather(*briefing_tasks.values(), return_exceptions=True)
        
        briefing_data = {}
        for i, (component, result) in enumerate(zip(briefing_tasks.keys(), results)):
            if isinstance(result, Exception):
                logger.error(f"Briefing component {component} failed: {result}")
                briefing_data[component] = {"status": "error", "error": str(result)}
            else:
                briefing_data[component] = result
        
        # Generate daily summary
        summary = {
            "date": supervisor.get_current_date(),
            "priority_emails": len(briefing_data.get("emails", {}).get("priority_emails", [])),
            "scheduled_events": briefing_data.get("calendar", {}).get("schedule_analysis", {}).get("total_events", 0),
            "recovery_progress": briefing_data.get("recovery_update", {}).get("recovery_data", {}).get("overall_progress", {}),
            "market_insights": briefing_data.get("commercial_intel", {}).get("advisory", {})
        }
        
        return {
            "status": "success",
            "briefing_type": "daily_briefing",
            "components": briefing_data,
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Daily briefing workflow error: {e}")
        return {"status": "error", "error": str(e)}

def create_result_aggregator():
    """Create result aggregation node"""
    async def result_aggregator_node(state: WorkflowState) -> WorkflowState:
        """Aggregate and format final results"""
        try:
            logger.info("Aggregating workflow results")
            state["current_step"] = "aggregating_results"
            
            # Compile final response
            final_result = {
                "request_id": state["request_id"],
                "request_type": state["request_type"],
                "status": state["status"],
                "results": state["results"],
                "errors": state["errors"] if state["errors"] else None,
                "metadata": {
                    "workflow_steps": state.get("current_step"),
                    "processing_time": "calculated_in_production"
                }
            }
            
            # Add final response message
            response_content = f"Workflow completed with status: {state['status']}"
            if state["errors"]:
                response_content += f" (Errors: {len(state['errors'])})"
            
            final_msg = AIMessage(content=response_content)
            state["messages"].append(final_msg)
            
            state["current_step"] = "completed"
            
            return state
            
        except Exception as e:
            logger.error(f"Result aggregation error: {e}")
            state["errors"].append(f"Aggregation error: {str(e)}")
            state["status"] = "error"
            return state
    
    return result_aggregator_node

def create_error_handler():
    """Create error handling node"""
    async def error_handler_node(state: WorkflowState) -> WorkflowState:
        """Handle workflow errors and provide recovery options"""
        try:
            logger.warning(f"Handling workflow errors: {state['errors']}")
            state["current_step"] = "error_handling"
            
            # Analyze errors and provide recovery suggestions
            error_analysis = {
                "error_count": len(state["errors"]),
                "error_types": [type(err).__name__ for err in state.get("exceptions", [])],
                "recovery_suggestions": []
            }
            
            # Add recovery suggestions based on error patterns
            if any("routing" in str(err).lower() for err in state["errors"]):
                error_analysis["recovery_suggestions"].append("Check request format and type")
            
            if any("timeout" in str(err).lower() for err in state["errors"]):
                error_analysis["recovery_suggestions"].append("Retry with reduced scope")
            
            state["results"]["error_analysis"] = error_analysis
            state["status"] = "error_handled"
            
            # Add error response message
            error_msg = AIMessage(content=f"Workflow encountered {len(state['errors'])} errors. Error handling completed.")
            state["messages"].append(error_msg)
            
            return state
            
        except Exception as e:
            logger.error(f"Error handler failed: {e}")
            state["errors"].append(f"Error handler failed: {str(e)}")
            return state
    
    return error_handler_node

def route_request(state: WorkflowState) -> str:
    """Determine which pipeline to route the request to"""
    request_type = state.get("request_type", "unknown")
    
    routing_map = {
        "recruitment": "recruitment",
        "compliance": "compliance",
        "kevin_assistant": "kevin_assistant"
    }
    
    route = routing_map.get(request_type, "error")
    logger.info(f"Routing request type '{request_type}' to '{route}'")
    
    return route

# Utility functions for state management
def initialize_workflow_state(request_data: Dict[str, Any]) -> WorkflowState:
    """Initialize workflow state from request data"""
    import uuid
    
    initial_message = HumanMessage(content=str(request_data))
    
    return WorkflowState(
        messages=[initial_message],
        request_type=request_data.get("type", "unknown"),
        request_id=str(uuid.uuid4()),
        status="initialized",
        current_step="routing",
        results={},
        errors=[],
        metadata=request_data
    )

def create_specialized_graphs():
    """Create specialized graphs for complex workflows"""
    
    # Recruitment-specific graph for complex hiring workflows
    recruitment_graph = StateGraph(RecruitmentState)
    recruitment_graph.add_node("source", lambda state: state)
    recruitment_graph.add_node("qualify", lambda state: state)
    recruitment_graph.add_node("engage", lambda state: state)
    recruitment_graph.add_edge("source", "qualify")
    recruitment_graph.add_edge("qualify", "engage")
    recruitment_graph.set_entry_point("source")
    recruitment_graph.add_edge("engage", END)
    
    # Compliance-specific graph for regulatory workflows
    compliance_graph = StateGraph(ComplianceState)
    compliance_graph.add_node("intake", lambda state: state)
    compliance_graph.add_node("validate", lambda state: state)
    compliance_graph.add_node("verify", lambda state: state)
    compliance_graph.add_node("approve", lambda state: state)
    compliance_graph.add_edge("intake", "validate")
    compliance_graph.add_edge("validate", "verify")
    compliance_graph.add_edge("verify", "approve")
    compliance_graph.set_entry_point("intake")
    compliance_graph.add_edge("approve", END)
    
    return {
        "recruitment": recruitment_graph.compile(),
        "compliance": compliance_graph.compile()
    }

# Enhanced graph compilation with checkpointing and persistence
def create_enhanced_graph(supervisor: SupervisorAgent, enable_persistence: bool = False):
    """Create enhanced graph with persistence and checkpointing"""
    
    graph = create_main_graph(supervisor)
    
    if enable_persistence:
        # In production, this would use actual persistence backend
        # from langgraph.checkpoint.sqlite import SqliteSaver
        # memory = SqliteSaver.from_conn_string(":memory:")
        # return graph.compile(checkpointer=memory)
        pass
    
    return graph

# Additional utility functions for enhanced orchestration
async def execute_parallel_workflows(supervisor: SupervisorAgent, workflows: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Execute multiple workflows in parallel for efficiency"""
    try:
        tasks = []
        for workflow in workflows:
            if workflow["type"] == "recruitment":
                task = supervisor.recruitment_agent.process_request(workflow)
            elif workflow["type"] == "compliance":
                task = supervisor.compliance_agent.process_request(workflow)
            elif workflow["type"] == "kevin_assistant":
                task = supervisor._handle_kevin_request(workflow)
            else:
                continue
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        successful_results = []
        errors = []
        
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                errors.append(f"Workflow {i} failed: {str(result)}")
            else:
                successful_results.append(result)
        
        return {
            "status": "success" if not errors else "partial_success",
            "successful_workflows": len(successful_results),
            "total_workflows": len(workflows),
            "results": successful_results,
            "errors": errors
        }
        
    except Exception as e:
        logger.error(f"Parallel workflow execution error: {e}")
        return {"status": "error", "error": str(e)}

def create_workflow_monitor():
    """Create workflow monitoring and metrics collection"""
    async def monitor_node(state: WorkflowState) -> WorkflowState:
        """Monitor workflow progress and collect metrics"""
        try:
            # Collect workflow metrics
            metrics = {
                "workflow_start_time": state.get("start_time"),
                "current_step": state["current_step"],
                "status": state["status"],
                "errors_count": len(state["errors"]),
                "messages_count": len(state["messages"])
            }
            
            # Log workflow progress
            logger.info(f"Workflow {state['request_id']} progress: {metrics}")
            
            # Store metrics in state for later analysis
            if "metrics" not in state:
                state["metrics"] = {}
            state["metrics"].update(metrics)
            
            return state
            
        except Exception as e:
            logger.error(f"Workflow monitoring error: {e}")
            return state
    
    return monitor_node

def create_adaptive_routing():
    """Create adaptive routing based on system load and performance"""
    def adaptive_route(state: WorkflowState) -> str:
        """Dynamically route based on system conditions"""
        request_type = state.get("request_type", "unknown")
        
        # Simple load balancing logic (would be more sophisticated in production)
        system_load = get_system_load()  # Would implement actual load monitoring
        
        if system_load > 0.8:
            # Route to lighter operations first
            if request_type == "kevin_assistant":
                return "kevin_assistant"
            elif request_type == "recruitment":
                return "recruitment"
            else:
                return "compliance"
        else:
            # Normal routing
            return route_request(state)
    
    return adaptive_route

def get_system_load() -> float:
    """Get current system load based on CPU and memory usage"""
    try:
        # Get CPU usage over 1 second interval
        cpu_percent = psutil.cpu_percent(interval=1)
        
        # Get memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        
        # Calculate combined load (weighted average)
        # CPU gets 60% weight, memory gets 40% weight
        combined_load = (cpu_percent * 0.6 + memory_percent * 0.4) / 100.0
        
        return min(combined_load, 1.0)  # Ensure it doesn't exceed 1.0
        
    except Exception as e:
        print(f"Error getting system load: {e}")
        return 0.5  # Default fallback

# Graph factory for different deployment environments
def create_graph_for_environment(supervisor: SupervisorAgent, environment: str = "development"):
    """Create graph optimized for specific environment"""
    
    if environment == "development":
        # Simple graph for development with detailed logging
        return create_main_graph(supervisor)
    
    elif environment == "production":
        # Enhanced graph with persistence and monitoring
        return create_enhanced_graph(supervisor, enable_persistence=True)
    
    elif environment == "testing":
        # Simplified graph for testing with mock components
        return create_test_graph(supervisor)
    
    else:
        # Default to main graph
        return create_main_graph(supervisor)

def create_test_graph(supervisor: SupervisorAgent):
    """Create simplified graph for testing"""
    workflow = StateGraph(WorkflowState)
    
    # Add simplified test nodes
    workflow.add_node("test_router", lambda state: {**state, "status": "test_routed"})
    workflow.add_node("test_processor", lambda state: {**state, "status": "test_processed"})
    workflow.add_node("test_aggregator", lambda state: {**state, "status": "test_completed"})
    
    # Simple linear flow for testing
    workflow.set_entry_point("test_router")
    workflow.add_edge("test_router", "test_processor")
    workflow.add_edge("test_processor", "test_aggregator")
    workflow.add_edge("test_aggregator", END)
    
    return workflow.compile()

# Export main functions for use in other modules
__all__ = [
    "create_main_graph",
    "create_enhanced_graph", 
    "create_graph_for_environment",
    "initialize_workflow_state",
    "WorkflowState",
    "RecruitmentState", 
    "ComplianceState",
    "KevinAssistantState"
] 