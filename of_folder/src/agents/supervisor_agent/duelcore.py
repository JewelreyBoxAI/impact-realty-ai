"""
DuelCoreAgent - The supervisor agent that orchestrates the entire system.

This agent serves as the central coordinator for all platform agents,
content generation, and metrics collection.
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging
from datetime import datetime, timezone

from langchain.memory import ConversationBufferWindowMemory
from langchain_openai import ChatOpenAI
from langchain.schema import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolExecutor, tools_condition
from langchain.tools import BaseTool
from pydantic import BaseModel, Field

from ..agents.content_agent.content_factory import ContentFactory
from ..agents.exec_agents.metrics import MetricsAgent
from ..agents.social_agents_l3.of import OFAgent
from ..agents.social_agents_l3.x import XAgent
from ..agents.social_agents_l3.reddit import RedditAgent
from ..agents.social_agents_l3.insta import InstagramAgent as InstaAgent
from ..agents.social_agents_l3.snap import SnapchatAgent as SnapAgent
from ..memory_manager import MemoryManager
from ..mcp_tools import MCPToolWrapper


class TaskType(str, Enum):
    """Task types for the DuelCore system."""
    CONTENT_CREATION = "content_creation"
    CONTENT_DISTRIBUTION = "content_distribution"
    ENGAGEMENT_ANALYSIS = "engagement_analysis"
    METRICS_COLLECTION = "metrics_collection"
    COMPLIANCE_CHECK = "compliance_check"


@dataclass
class AgentState:
    """State management for the DuelCore agent system."""
    messages: List[BaseMessage]
    task_type: TaskType
    platforms: List[str]
    content: Optional[Dict[str, Any]] = None
    metrics: Optional[Dict[str, Any]] = None
    errors: List[str] = None
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.metadata is None:
            self.metadata = {}


class DuelCoreAgent:
    """
    The DuelCoreAgent orchestrates prompt chains and routes tasks across
    all platform agents and specialized agents.
    
    Rick's signature: No fluff, pure execution ☠️
    """
    
    def __init__(
        self,
        openai_api_key: Optional[str] = None,
        replicate_api_token: Optional[str] = None,
        model_name: str = "gpt-4-turbo-preview",
        temperature: float = 0.7,
        memory_window: int = 10,
        enable_streaming: bool = True,
        log_level: str = "INFO"
    ):
        """Initialize the DuelCoreAgent with all necessary components."""
        
        # Setup logging with Rick's signature
        self.logger = self._setup_logging(log_level)
        self.logger.info("🔥 DuelCoreAgent initializing - Rick's signature ☠️")
        
        # Core LLM setup
        self.llm = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=openai_api_key,
            streaming=enable_streaming
        )
        
        # Memory management
        self.memory = ConversationBufferWindowMemory(
            k=memory_window,
            return_messages=True
        )
        
        # Initialize specialized agents
        self.content_factory = ContentFactory(
            log_level=log_level,
            openai_api_key=openai_api_key,
            replicate_api_token=replicate_api_token
        )
        self.metrics_agent = MetricsAgent()
        
        # Initialize platform agents
        self.platform_agents = {
            "of": OFAgent(),
            "x": XAgent(), 
            "instagram": InstaAgent(),
            "snapchat": SnapAgent()
        }
        
        # Memory and tool management
        self.memory_manager = MemoryManager()
        self.mcp_tools = {
            platform: MCPToolWrapper(platform) 
            for platform in self.platform_agents.keys()
        }
        
        # Build the execution graph
        self.graph = self._build_execution_graph()
        
        self.logger.info("✅ DuelCoreAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(__name__)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ RICK - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _build_execution_graph(self) -> StateGraph:
        """Build the LangGraph execution graph for task orchestration."""
        
        # Create LangGraph state graph
        workflow = StateGraph(AgentState)
        
        def route_task(state: AgentState) -> str:
            """Route tasks based on type and requirements."""
            self.logger.info(f"🧠 Routing task: {state.task_type.value}")
            
            if state.task_type == TaskType.CONTENT_CREATION:
                return "content_generation"
            elif state.task_type == TaskType.CONTENT_DISTRIBUTION:
                return "platform_distribution"
            elif state.task_type == TaskType.ENGAGEMENT_ANALYSIS:
                return "metrics_analysis"
            elif state.task_type == TaskType.METRICS_COLLECTION:
                return "metrics_collection"
            else:
                return "compliance_check"
        
        def content_generation_node(state: AgentState) -> AgentState:
            """Handle content generation tasks."""
            try:
                self.logger.info("🎨 Starting content generation")
                
                # Extract prompt from messages
                prompt = state.messages[-1].content if state.messages else ""
                
                # Create content request
                from ..agents.content_agent.content_factory import ContentRequest, ContentType, PlatformSpec
                
                # Map platform strings to PlatformSpec enums
                platform_specs = []
                for platform in state.platforms:
                    if platform.lower() == "onlyfans" or platform.lower() == "of":
                        platform_specs.append(PlatformSpec.ONLYFANS)
                    elif platform.lower() == "x" or platform.lower() == "twitter":
                        platform_specs.append(PlatformSpec.X_TWITTER)
                    elif platform.lower() == "instagram" or platform.lower() == "ig":
                        platform_specs.append(PlatformSpec.INSTAGRAM)
                    elif platform.lower() == "snapchat" or platform.lower() == "snap":
                        platform_specs.append(PlatformSpec.SNAPCHAT)
                
                request = ContentRequest(
                    prompt=prompt,
                    platforms=platform_specs,
                    content_type=ContentType.TEXT,
                    persona_context=state.metadata.get("persona", {}),
                    generate_variants=True
                )
                
                # Generate content using ContentFactory
                content = asyncio.run(self.content_factory.generate_content(request))
                
                state.content = content
                state.messages.append(
                    AIMessage(content=f"Generated content for platforms: {state.platforms}")
                )
                
                self.logger.info("✅ Content generation completed")
                
            except Exception as e:
                self.logger.error(f"❌ Content generation failed: {str(e)}")
                state.errors.append(f"Content generation error: {str(e)}")
            
            return state
        
        def platform_distribution_node(state: AgentState) -> AgentState:
            """Handle platform distribution tasks."""
            try:
                self.logger.info("📢 Starting platform distribution")
                
                results = {}
                for platform in state.platforms:
                    if platform in self.platform_agents:
                        agent = self.platform_agents[platform]
                        result = agent.publish_content(
                            content=state.content,
                            metadata=state.metadata
                        )
                        results[platform] = result
                
                state.metadata["distribution_results"] = results
                state.messages.append(
                    AIMessage(content=f"Distributed content to: {list(results.keys())}")
                )
                
                self.logger.info("✅ Platform distribution completed")
                
            except Exception as e:
                self.logger.error(f"❌ Platform distribution failed: {str(e)}")
                state.errors.append(f"Distribution error: {str(e)}")
            
            return state
        
        def metrics_analysis_node(state: AgentState) -> AgentState:
            """Handle metrics analysis tasks."""
            try:
                self.logger.info("📊 Starting metrics analysis")
                
                # Collect metrics from all platforms
                metrics = self.metrics_agent.collect_engagement_metrics(
                    platforms=state.platforms,
                    timeframe=state.metadata.get("timeframe", "24h")
                )
                
                state.metrics = metrics
                state.messages.append(
                    AIMessage(content=f"Collected metrics from {len(metrics)} platforms")
                )
                
                self.logger.info("✅ Metrics analysis completed")
                
            except Exception as e:
                self.logger.error(f"❌ Metrics analysis failed: {str(e)}")
                state.errors.append(f"Metrics error: {str(e)}")
            
            return state
        
        def compliance_check_node(state: AgentState) -> AgentState:
            """Handle compliance and safety checks."""
            try:
                self.logger.info("🛡️ Starting compliance check")
                
                # Implement compliance checks
                compliance_results = self._check_compliance(
                    content=state.content,
                    platforms=state.platforms
                )
                
                state.metadata["compliance"] = compliance_results
                state.messages.append(
                    AIMessage(content="Compliance check completed")
                )
                
                self.logger.info("✅ Compliance check completed")
                
            except Exception as e:
                self.logger.error(f"❌ Compliance check failed: {str(e)}")
                state.errors.append(f"Compliance error: {str(e)}")
            
            return state
        
        def metrics_collection_node(state: AgentState) -> AgentState:
            """Handle metrics collection tasks."""
            try:
                self.logger.info("📊 Starting metrics collection")
                
                # Start real-time collection if not already running
                if not self.metrics_agent.is_collecting:
                    self.metrics_agent.start_real_time_collection()
                
                # Collect immediate metrics
                collected_metrics = {}
                for platform in state.platforms:
                    if platform in self.platform_agents:
                        try:
                            # Use MCP wrapper to collect metrics
                            mcp_tool = self.mcp_tools.get(platform)
                            if mcp_tool:
                                platform_metrics = mcp_tool.execute_api_call(
                                    endpoint="metrics",
                                    method="GET"
                                )
                                collected_metrics[platform] = platform_metrics
                        except Exception as e:
                            self.logger.warning(f"Metrics collection failed for {platform}: {e}")
                
                state.metrics = collected_metrics
                state.messages.append(
                    AIMessage(content=f"Metrics collected from {len(collected_metrics)} platforms")
                )
                
                self.logger.info("✅ Metrics collection completed")
                
            except Exception as e:
                self.logger.error(f"❌ Metrics collection failed: {str(e)}")
                state.errors.append(f"Metrics collection error: {str(e)}")
            
            return state
        
        # Add nodes to workflow
        workflow.add_node("content_generation", content_generation_node)
        workflow.add_node("platform_distribution", platform_distribution_node)
        workflow.add_node("metrics_analysis", metrics_analysis_node)
        workflow.add_node("metrics_collection", metrics_collection_node)
        workflow.add_node("compliance_check", compliance_check_node)
        
        # Set entry point with routing
        workflow.set_entry_point("content_generation")
        
        # Create sequential workflow with conditional routing
        workflow.add_conditional_edges(
            START,
            route_task,
            {
                "content_generation": "content_generation",
                "platform_distribution": "platform_distribution", 
                "metrics_analysis": "metrics_analysis",
                "metrics_collection": "metrics_collection",
                "compliance_check": "compliance_check"
            }
        )
        
        # Standard content creation flow
        workflow.add_edge("content_generation", "compliance_check")
        workflow.add_edge("compliance_check", "platform_distribution")
        workflow.add_edge("platform_distribution", "metrics_collection")
        
        # Direct flows for specific tasks
        workflow.add_edge("metrics_analysis", END)
        workflow.add_edge("metrics_collection", END)
        
        return workflow.compile()
    
    def _check_compliance(
        self, 
        content: Optional[Dict[str, Any]], 
        platforms: List[str]
    ) -> Dict[str, Any]:
        """Check content compliance across platforms."""
        results = {}
        
        for platform in platforms:
            # Platform-specific compliance checks
            if platform == "of":
                results[platform] = self._check_of_compliance(content)
            elif platform == "x":
                results[platform] = self._check_x_compliance(content)
            elif platform == "reddit":
                results[platform] = self._check_reddit_compliance(content)
            elif platform == "instagram":
                results[platform] = self._check_instagram_compliance(content)
            elif platform == "snapchat":
                results[platform] = self._check_snapchat_compliance(content)
        
        return results
    
    def _check_of_compliance(self, content: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """OnlyFans specific compliance checks."""
        if not content:
            return {"safe": False, "error": "No content provided"}
        
        content_text = content.get("content", "")
        violations = []
        
        # Age verification check
        age_verified = "18+" in content_text or "adult" in content_text.lower()
        if not age_verified:
            violations.append("Missing age verification")
        
        # Content restrictions
        banned_terms = ["minor", "underage", "school", "child"]
        if any(term in content_text.lower() for term in banned_terms):
            violations.append("Contains restricted terms")
        
        return {
            "age_verification": age_verified,
            "content_restrictions": len(violations) == 0,
            "payment_compliance": True,  # Would need payment gateway integration
            "safe": len(violations) == 0,
            "violations": violations
        }
    
    def _check_x_compliance(self, content: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """X (Twitter) specific compliance checks."""
        if not content:
            return {"safe": False, "error": "No content provided"}
        
        content_text = content.get("content", "")
        violations = []
        
        # Character limit check
        if len(content_text) > 280:
            violations.append("Exceeds 280 character limit")
        
        # Spam indicators
        spam_indicators = ["buy now", "click here", "limited time", "act fast"]
        if sum(1 for indicator in spam_indicators if indicator in content_text.lower()) > 2:
            violations.append("Potential spam content")
        
        return {
            "character_limit": len(content_text) <= 280,
            "content_policy": len(violations) == 0,
            "spam_check": "buy now" not in content_text.lower(),
            "safe": len(violations) == 0,
            "violations": violations
        }
    
    def _check_reddit_compliance(self, content: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Reddit specific compliance checks."""
        if not content:
            return {"safe": False, "error": "No content provided"}
        
        content_text = content.get("content", "")
        violations = []
        
        # Self-promotion check (simplified)
        promo_terms = ["my website", "my channel", "subscribe", "follow me", "check out"]
        if sum(1 for term in promo_terms if term in content_text.lower()) > 1:
            violations.append("Excessive self-promotion")
        
        # Spam check
        if content_text.count("!") > 5 or content_text.count("?") > 3:
            violations.append("Excessive punctuation")
        
        return {
            "subreddit_rules": True,  # Would need subreddit-specific rules
            "spam_check": len(violations) == 0,
            "self_promotion": "subscribe" not in content_text.lower(),
            "safe": len(violations) == 0,
            "violations": violations
        }
    
    def _check_instagram_compliance(self, content: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Instagram specific compliance checks."""
        if not content:
            return {"safe": False, "error": "No content provided"}
        
        content_text = content.get("content", "")
        hashtags = [tag for tag in content_text.split() if tag.startswith("#")]
        violations = []
        
        # Hashtag limit check
        if len(hashtags) > 30:
            violations.append("Exceeds 30 hashtag limit")
        
        # Content length check
        if len(content_text) > 2200:
            violations.append("Exceeds caption length limit")
        
        return {
            "content_policy": len(violations) == 0,
            "hashtag_limits": len(hashtags) <= 30,
            "spam_check": len(hashtags) <= 30,
            "safe": len(violations) == 0,
            "violations": violations
        }
    
    def _check_snapchat_compliance(self, content: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Snapchat specific compliance checks."""
        if not content:
            return {"safe": False, "error": "No content provided"}
        
        content_text = content.get("content", "")
        violations = []
        
        # Age appropriate content
        adult_terms = ["explicit", "nsfw", "adult", "18+"]
        if any(term in content_text.lower() for term in adult_terms):
            violations.append("Not age-appropriate for youth platform")
        
        # Length check for mobile
        if len(content_text) > 250:
            violations.append("Too long for mobile consumption")
        
        return {
            "content_policy": len(violations) == 0,
            "age_appropriate": not any(term in content_text.lower() for term in ["adult", "18+"]),
            "spam_check": len(violations) == 0,
            "safe": len(violations) == 0,
            "violations": violations
        }
    
    async def create_and_distribute_content(
        self,
        prompt: str,
        platforms: List[str],
        persona_context: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main method to create and distribute content across platforms.
        
        Args:
            prompt: The content creation prompt
            platforms: List of target platforms
            persona_context: Context for persona consistency
            metadata: Additional metadata
            
        Returns:
            Dictionary with results and metrics
        """
        self.logger.info(f"🚀 Creating and distributing content to: {platforms}")
        
        # Prepare initial state
        initial_state = AgentState(
            messages=[HumanMessage(content=prompt)],
            task_type=TaskType.CONTENT_CREATION,
            platforms=platforms,
            metadata=metadata or {}
        )
        
        if persona_context:
            initial_state.metadata["persona"] = persona_context
        
        # Execute the graph
        final_state = await self.graph.ainvoke(initial_state)
        
        # Compile results
        results = {
            "success": len(final_state.errors) == 0,
            "content": final_state.content,
            "metrics": final_state.metrics,
            "platforms": platforms,
            "errors": final_state.errors,
            "metadata": final_state.metadata,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Store in memory for future context
        self.memory_manager.store_execution_context(results)
        
        self.logger.info(f"✅ Content creation and distribution completed")
        return results
    
    def get_analytics_dashboard(self, timeframe: str = "24h") -> Dict[str, Any]:
        """Get comprehensive analytics across all platforms."""
        try:
            self.logger.info(f"📊 Generating analytics dashboard for {timeframe}")
            
            # Collect metrics from all platforms
            analytics = self.metrics_agent.generate_analytics_dashboard(
                platforms=list(self.platform_agents.keys()),
                timeframe=timeframe
            )
            
            return analytics
            
        except Exception as e:
            self.logger.error(f"❌ Analytics dashboard generation failed: {str(e)}")
            return {"error": str(e)}
    
    def optimize_content_strategy(self, historical_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Use metrics to optimize future content strategy."""
        try:
            self.logger.info("🎯 Optimizing content strategy based on metrics")
            
            # Get historical performance data
            if not historical_data:
                historical_data = self.memory_manager.get_historical_performance()
            
            # Generate optimization recommendations
            recommendations = self.content_gen.generate_optimization_recommendations(
                historical_data=historical_data
            )
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"❌ Strategy optimization failed: {str(e)}")
            return {"error": str(e)}
    
    def __repr__(self) -> str:
        return f"DuelCoreAgent(platforms={list(self.platform_agents.keys())}) ☠️" 