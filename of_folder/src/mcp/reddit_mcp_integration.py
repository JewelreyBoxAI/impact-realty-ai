"""
Reddit MCP Integration - Enhanced Reddit Agent with MCP Protocol Support

Bridges Reddit API with our Python-based cloud-native architecture.
Provides rate limiting, cloud-native memory integration, and enterprise-grade features.

Rick's signature: MCP-powered Reddit domination ☠️
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

import praw
from praw.models import Submission, Comment, Subreddit
from pydantic import BaseModel, Field

# Memory integration
try:
    from memory_manager import MemoryManager, MemoryEntry, MemoryType
except ImportError:
    from ..memory_manager import MemoryManager, MemoryEntry, MemoryType


class MCPConnectionStatus(str, Enum):
    """MCP connection status."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"
    INITIALIZING = "initializing"


class RedditRateLimit(BaseModel):
    """Reddit API rate limit tracking."""
    endpoint: str
    limit: int
    remaining: int
    reset_time: datetime
    used_this_hour: int = 0
    hourly_limit: int = 60  # Reddit's standard rate limit


class RedditContentType(str, Enum):
    """Reddit content types."""
    TEXT_POST = "text_post"
    LINK_POST = "link_post"
    IMAGE_POST = "image_post"
    VIDEO_POST = "video_post"
    COMMENT = "comment"
    CROSSPOST = "crosspost"


class RedditPostType(str, Enum):
    """Reddit post types."""
    DISCUSSION = "discussion"
    QUESTION = "question"
    SHOWCASE = "showcase"
    NEWS = "news"
    MEME = "meme"
    TUTORIAL = "tutorial"


@dataclass
class RedditMCPTool:
    """Reddit MCP tool definition."""
    name: str
    description: str
    parameters: Dict[str, Any]
    rate_limit: Optional[RedditRateLimit] = None


@dataclass
class RedditMCPResponse:
    """Reddit MCP response structure."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    rate_limit_info: Optional[Dict[str, Any]] = None
    execution_time: float = 0.0


@dataclass
class RedditPost:
    """Reddit post structure."""
    post_id: Optional[str]
    title: str
    content: str
    subreddit: str
    post_type: RedditContentType
    flair: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = None
    scheduled_time: Optional[datetime] = None
    posted_at: Optional[datetime] = None


@dataclass
class RedditMetrics:
    """Reddit metrics structure."""
    post_id: str
    upvotes: int
    downvotes: int
    score: int
    upvote_ratio: float
    num_comments: int
    num_awards: int
    num_crossposts: int
    views: int
    engagement_rate: float


class RedditMCPIntegration:
    """
    Reddit MCP Integration Agent - Enterprise-grade Reddit management with MCP protocol.
    
    Features:
    - MCP protocol compliance for Claude desktop integration
    - Built-in rate limiting for Reddit API (60 requests/hour standard)
    - Cloud-native memory integration with PostgreSQL + Azure/Vertex
    - Advanced analytics and engagement tracking
    - Automatic content optimization and subreddit recommendations
    - Comment management and moderation
    - Real-time performance monitoring
    - Crossposting and karma optimization
    
    Rick's signature: Where MCP meets Reddit excellence ☠️
    """
    
    def __init__(
        self,
        reddit_config: Optional[Dict[str, str]] = None,
        memory_manager: Optional[MemoryManager] = None,
        rate_limit_config: Optional[Dict[str, Any]] = None,
        auto_flair: bool = True,
        log_level: str = "INFO"
    ):
        """Initialize Reddit MCP Integration."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🚀 Reddit MCP Integration initializing - Protocol-powered domination ☠️")
        
        # Reddit API configuration
        self.reddit_config = reddit_config or self._load_reddit_config()
        
        # Initialize PRAW client
        self.reddit_client = None
        if self.reddit_config:
            self._initialize_reddit_client()
        
        # Memory manager for cloud-native storage
        self.memory_manager = memory_manager
        
        # Rate limiting configuration
        self.rate_limits = self._initialize_rate_limits(rate_limit_config)
        
        # Available MCP tools
        self.available_tools = self._initialize_mcp_tools()
        
        # Performance tracking
        self.performance_metrics = {
            "posts_created": 0,
            "comments_posted": 0,
            "api_calls": 0,
            "errors": 0,
            "rate_limit_hits": 0,
            "avg_response_time": 0.0
        }
        
        # Content cache for optimization
        self.content_cache = {}
        self.subreddit_cache = {}
        self.auto_flair = auto_flair
        
        # Popular subreddits mapping
        self.popular_subreddits = {
            "technology": ["tech", "programming", "artificial", "futurology"],
            "fitness": ["fitness", "bodybuilding", "loseit", "gainit"],
            "business": ["entrepreneur", "startups", "investing", "business"],
            "content": ["socialmedia", "marketing", "content", "creator"]
        }
        
        self.logger.info("✅ Reddit MCP Integration initialized")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.RedditMCP")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ Reddit-MCP - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _load_reddit_config(self) -> Dict[str, str]:
        """Load Reddit API configuration from environment."""
        return {
            "client_id": os.getenv("REDDIT_CLIENT_ID", ""),
            "client_secret": os.getenv("REDDIT_CLIENT_SECRET", ""),
            "username": os.getenv("REDDIT_USERNAME", ""),
            "password": os.getenv("REDDIT_PASSWORD", ""),
            "user_agent": os.getenv("REDDIT_USER_AGENT", "RedditMCP/1.0")
        }
    
    def _initialize_reddit_client(self):
        """Initialize Reddit PRAW client."""
        try:
            self.reddit_client = praw.Reddit(
                client_id=self.reddit_config["client_id"],
                client_secret=self.reddit_config["client_secret"],
                username=self.reddit_config["username"],
                password=self.reddit_config["password"],
                user_agent=self.reddit_config["user_agent"]
            )
            
            # Test authentication
            user = self.reddit_client.user.me()
            self.logger.info(f"🔐 Authenticated as u/{user.name}")
            
        except Exception as e:
            self.logger.error(f"❌ Reddit authentication failed: {str(e)}")
            self.reddit_client = None
    
    def _initialize_rate_limits(self, config: Optional[Dict[str, Any]]) -> Dict[str, RedditRateLimit]:
        """Initialize rate limiting configuration."""
        default_config = config or {}
        
        return {
            "submit_post": RedditRateLimit(
                endpoint="submit_post",
                limit=10,  # Conservative limit per hour
                remaining=10,
                reset_time=datetime.now(timezone.utc) + timedelta(hours=1),
                hourly_limit=10
            ),
            "post_comment": RedditRateLimit(
                endpoint="post_comment",
                limit=30,  # More comments allowed
                remaining=30,
                reset_time=datetime.now(timezone.utc) + timedelta(hours=1),
                hourly_limit=30
            ),
            "get_posts": RedditRateLimit(
                endpoint="get_posts",
                limit=60,  # Standard API limit
                remaining=60,
                reset_time=datetime.now(timezone.utc) + timedelta(hours=1),
                hourly_limit=60
            )
        }
    
    def _initialize_mcp_tools(self) -> Dict[str, RedditMCPTool]:
        """Initialize available MCP tools."""
        return {
            "submit_post": RedditMCPTool(
                name="submit_post",
                description="Submit a new post to a subreddit",
                parameters={
                    "title": {"type": "string", "required": True},
                    "content": {"type": "string", "required": True},
                    "subreddit": {"type": "string", "required": True},
                    "post_type": {"type": "string", "enum": ["text", "link", "image"]},
                    "flair": {"type": "string", "required": False},
                    "url": {"type": "string", "required": False}
                },
                rate_limit=self.rate_limits["submit_post"]
            ),
            "post_comment": RedditMCPTool(
                name="post_comment",
                description="Post a comment on a submission or reply to another comment",
                parameters={
                    "parent_id": {"type": "string", "required": True},
                    "content": {"type": "string", "required": True}
                },
                rate_limit=self.rate_limits["post_comment"]
            ),
            "get_hot_posts": RedditMCPTool(
                name="get_hot_posts",
                description="Get hot posts from a subreddit",
                parameters={
                    "subreddit": {"type": "string", "required": True},
                    "limit": {"type": "integer", "default": 10, "maximum": 100}
                },
                rate_limit=self.rate_limits["get_posts"]
            ),
            "search_subreddits": RedditMCPTool(
                name="search_subreddits",
                description="Search for relevant subreddits by topic",
                parameters={
                    "topic": {"type": "string", "required": True},
                    "limit": {"type": "integer", "default": 10}
                },
                rate_limit=self.rate_limits["get_posts"]
            ),
            "get_post_metrics": RedditMCPTool(
                name="get_post_metrics",
                description="Get metrics for a specific post",
                parameters={
                    "post_id": {"type": "string", "required": True}
                },
                rate_limit=self.rate_limits["get_posts"]
            )
        }
    
    async def execute_mcp_tool(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> RedditMCPResponse:
        """Execute an MCP tool with rate limiting and error handling."""
        start_time = time.time()
        
        if tool_name not in self.available_tools:
            return RedditMCPResponse(
                success=False,
                error=f"Unknown tool: {tool_name}",
                execution_time=time.time() - start_time
            )
        
        tool = self.available_tools[tool_name]
        
        # Check rate limiting
        rate_check = await self._check_rate_limit(tool_name)
        if not rate_check["allowed"]:
            return RedditMCPResponse(
                success=False,
                error="Rate limit exceeded",
                rate_limit_info=rate_check,
                execution_time=time.time() - start_time
            )
        
        # Validate arguments
        validation_result = self._validate_tool_arguments(tool, arguments)
        if validation_result["errors"]:
            return RedditMCPResponse(
                success=False,
                error=f"Validation errors: {', '.join(validation_result['errors'])}",
                execution_time=time.time() - start_time
            )
        
        try:
            # Execute the tool
            if tool_name == "submit_post":
                result = await self._execute_submit_post(arguments)
            elif tool_name == "post_comment":
                result = await self._execute_post_comment(arguments)
            elif tool_name == "get_hot_posts":
                result = await self._execute_get_hot_posts(arguments)
            elif tool_name == "search_subreddits":
                result = await self._execute_search_subreddits(arguments)
            elif tool_name == "get_post_metrics":
                result = await self._execute_get_post_metrics(arguments)
            else:
                result = {"success": False, "error": "Tool not implemented"}
            
            # Update rate limit
            await self._update_rate_limit(tool_name)
            
            # Store execution in memory
            if self.memory_manager and result.get("success"):
                await self._store_execution_memory(tool_name, arguments, result, context)
            
            # Update performance metrics
            self._update_performance_metrics(tool_name, time.time() - start_time, result.get("success", False))
            
            return RedditMCPResponse(
                success=result.get("success", False),
                data=result.get("data"),
                error=result.get("error"),
                execution_time=time.time() - start_time
            )
            
        except Exception as e:
            self.logger.error(f"❌ Tool execution failed: {str(e)}")
            self._update_performance_metrics(tool_name, time.time() - start_time, False)
            
            return RedditMCPResponse(
                success=False,
                error=str(e),
                execution_time=time.time() - start_time
            )
    
    async def _execute_submit_post(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute post submission."""
        if not self.reddit_client:
            return {"success": False, "error": "Reddit client not initialized"}
        
        try:
            subreddit = self.reddit_client.subreddit(arguments["subreddit"])
            
            # Optimize content for Reddit
            optimized_title = self._optimize_reddit_title(arguments["title"])
            optimized_content = self._optimize_reddit_content(arguments["content"])
            
            # Submit post based on type
            post_type = arguments.get("post_type", "text")
            
            if post_type == "text":
                submission = subreddit.submit(
                    title=optimized_title,
                    selftext=optimized_content,
                    flair_id=arguments.get("flair") if arguments.get("flair") else None
                )
            elif post_type == "link":
                submission = subreddit.submit(
                    title=optimized_title,
                    url=arguments["url"],
                    flair_id=arguments.get("flair") if arguments.get("flair") else None
                )
            else:
                return {"success": False, "error": f"Unsupported post type: {post_type}"}
            
            self.performance_metrics["posts_created"] += 1
            self.logger.info(f"📝 Posted to r/{arguments['subreddit']}: {submission.id}")
            
            return {
                "success": True,
                "data": {
                    "post_id": submission.id,
                    "url": f"https://reddit.com{submission.permalink}",
                    "title": optimized_title,
                    "subreddit": arguments["subreddit"],
                    "created_utc": submission.created_utc
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_post_comment(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute comment posting."""
        if not self.reddit_client:
            return {"success": False, "error": "Reddit client not initialized"}
        
        try:
            # Get parent (submission or comment)
            parent = self.reddit_client.comment(arguments["parent_id"]) if arguments["parent_id"].startswith("t1_") else self.reddit_client.submission(arguments["parent_id"])
            
            # Optimize comment content
            optimized_content = self._optimize_reddit_comment(arguments["content"])
            
            # Post comment
            comment = parent.reply(optimized_content)
            
            self.performance_metrics["comments_posted"] += 1
            self.logger.info(f"💬 Posted comment: {comment.id}")
            
            return {
                "success": True,
                "data": {
                    "comment_id": comment.id,
                    "parent_id": arguments["parent_id"],
                    "content": optimized_content,
                    "created_utc": comment.created_utc
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_get_hot_posts(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute getting hot posts from subreddit."""
        if not self.reddit_client:
            return {"success": False, "error": "Reddit client not initialized"}
        
        try:
            subreddit = self.reddit_client.subreddit(arguments["subreddit"])
            limit = arguments.get("limit", 10)
            
            posts = []
            for submission in subreddit.hot(limit=limit):
                posts.append({
                    "id": submission.id,
                    "title": submission.title,
                    "score": submission.score,
                    "upvote_ratio": submission.upvote_ratio,
                    "num_comments": submission.num_comments,
                    "created_utc": submission.created_utc,
                    "url": f"https://reddit.com{submission.permalink}",
                    "author": str(submission.author) if submission.author else "[deleted]",
                    "flair": submission.link_flair_text,
                    "is_self": submission.is_self,
                    "selftext": submission.selftext[:200] + "..." if len(submission.selftext) > 200 else submission.selftext
                })
            
            return {
                "success": True,
                "data": {
                    "subreddit": arguments["subreddit"],
                    "posts": posts,
                    "count": len(posts)
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_search_subreddits(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute subreddit search."""
        if not self.reddit_client:
            return {"success": False, "error": "Reddit client not initialized"}
        
        try:
            topic = arguments["topic"].lower()
            limit = arguments.get("limit", 10)
            
            # Search for subreddits
            subreddits = []
            for subreddit in self.reddit_client.subreddits.search(topic, limit=limit):
                subreddits.append({
                    "name": subreddit.display_name,
                    "title": subreddit.title,
                    "description": subreddit.public_description[:200] + "..." if len(subreddit.public_description) > 200 else subreddit.public_description,
                    "subscribers": subreddit.subscribers,
                    "created_utc": subreddit.created_utc,
                    "over18": subreddit.over18,
                    "url": f"https://reddit.com/r/{subreddit.display_name}"
                })
            
            # Add popular subreddits for this topic
            if topic in self.popular_subreddits:
                for sub_name in self.popular_subreddits[topic]:
                    if not any(s["name"].lower() == sub_name for s in subreddits):
                        try:
                            sub = self.reddit_client.subreddit(sub_name)
                            subreddits.append({
                                "name": sub.display_name,
                                "title": sub.title,
                                "description": sub.public_description[:200] + "..." if len(sub.public_description) > 200 else sub.public_description,
                                "subscribers": sub.subscribers,
                                "created_utc": sub.created_utc,
                                "over18": sub.over18,
                                "url": f"https://reddit.com/r/{sub.display_name}",
                                "recommended": True
                            })
                        except:
                            continue
            
            return {
                "success": True,
                "data": {
                    "topic": topic,
                    "subreddits": sorted(subreddits, key=lambda x: x["subscribers"], reverse=True),
                    "count": len(subreddits)
                }
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def _execute_get_post_metrics(self, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute getting post metrics."""
        if not self.reddit_client:
            return {"success": False, "error": "Reddit client not initialized"}
        
        try:
            submission = self.reddit_client.submission(arguments["post_id"])
            
            # Calculate engagement rate
            total_interactions = submission.num_comments + abs(submission.score)
            engagement_rate = (total_interactions / max(submission.score + submission.num_comments, 1)) * 100
            
            metrics = {
                "post_id": submission.id,
                "title": submission.title,
                "score": submission.score,
                "upvote_ratio": submission.upvote_ratio,
                "upvotes": int(submission.score * submission.upvote_ratio),
                "downvotes": int(submission.score * (1 - submission.upvote_ratio)),
                "num_comments": submission.num_comments,
                "num_awards": submission.total_awards_received,
                "num_crossposts": submission.num_crossposts,
                "views": getattr(submission, 'view_count', 0),
                "engagement_rate": engagement_rate,
                "created_utc": submission.created_utc,
                "subreddit": str(submission.subreddit),
                "author": str(submission.author) if submission.author else "[deleted]",
                "url": f"https://reddit.com{submission.permalink}",
                "is_self": submission.is_self,
                "over_18": submission.over_18
            }
            
            return {
                "success": True,
                "data": metrics
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _optimize_reddit_title(self, title: str) -> str:
        """Optimize title for Reddit."""
        # Keep titles under 300 characters
        if len(title) > 300:
            title = title[:297] + "..."
        
        # Add engagement hooks for certain subreddits
        engagement_starters = [
            "DAE", "TIL", "AMA", "PSA", "LPT", "ELI5", "TIFU", "CMV"
        ]
        
        # Don't modify if already has Reddit-style prefix
        if not any(title.upper().startswith(starter) for starter in engagement_starters):
            # Add subtle engagement elements
            if "?" not in title and len(title) < 250:
                if "how" in title.lower() or "what" in title.lower():
                    title += " - What do you think?"
        
        return title
    
    def _optimize_reddit_content(self, content: str) -> str:
        """Optimize content for Reddit."""
        optimized = content
        
        # Add Reddit-style formatting
        if not optimized.startswith("**"):
            optimized = f"**TL;DR:** {optimized.split('.')[0]}.\n\n{optimized}"
        
        # Add engagement call-to-action
        if not optimized.endswith(("?", "!", "thoughts?")):
            optimized += "\n\nWhat are your thoughts on this?"
        
        return optimized
    
    def _optimize_reddit_comment(self, content: str) -> str:
        """Optimize comment content for Reddit."""
        # Keep comments concise but engaging
        if len(content) > 1000:
            content = content[:997] + "..."
        
        # Add subtle engagement
        if not content.endswith((".", "!", "?")):
            content += "."
        
        return content
    
    async def _check_rate_limit(self, tool_name: str) -> Dict[str, Any]:
        """Check if tool is rate limited."""
        if tool_name not in self.rate_limits:
            return {"allowed": True, "remaining": float('inf')}
        
        rate_limit = self.rate_limits[tool_name]
        now = datetime.now(timezone.utc)
        
        # Reset if hour has passed
        if now >= rate_limit.reset_time:
            rate_limit.remaining = rate_limit.hourly_limit
            rate_limit.used_this_hour = 0
            rate_limit.reset_time = now + timedelta(hours=1)
        
        allowed = rate_limit.remaining > 0
        
        if not allowed:
            self.performance_metrics["rate_limit_hits"] += 1
        
        return {
            "allowed": allowed,
            "remaining": rate_limit.remaining,
            "reset_time": rate_limit.reset_time.isoformat(),
            "used_this_hour": rate_limit.used_this_hour
        }
    
    async def _update_rate_limit(self, tool_name: str):
        """Update rate limit after successful execution."""
        if tool_name in self.rate_limits:
            self.rate_limits[tool_name].remaining -= 1
            self.rate_limits[tool_name].used_this_hour += 1
    
    def _validate_tool_arguments(
        self,
        tool: RedditMCPTool,
        arguments: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate tool arguments."""
        errors = []
        
        for param_name, param_spec in tool.parameters.items():
            if param_spec.get("required", False) and param_name not in arguments:
                errors.append(f"Missing required parameter: {param_name}")
            
            if param_name in arguments:
                value = arguments[param_name]
                param_type = param_spec.get("type")
                
                if param_type == "string" and not isinstance(value, str):
                    errors.append(f"Parameter {param_name} must be a string")
                elif param_type == "integer" and not isinstance(value, int):
                    errors.append(f"Parameter {param_name} must be an integer")
                
                # Check enum values
                if "enum" in param_spec and value not in param_spec["enum"]:
                    errors.append(f"Parameter {param_name} must be one of: {param_spec['enum']}")
                
                # Check maximum values
                if "maximum" in param_spec and isinstance(value, (int, float)) and value > param_spec["maximum"]:
                    errors.append(f"Parameter {param_name} must not exceed {param_spec['maximum']}")
        
        return {"errors": errors}
    
    async def _store_execution_memory(
        self,
        tool_name: str,
        arguments: Dict[str, Any],
        result: Dict[str, Any],
        context: Optional[Dict[str, Any]]
    ):
        """Store execution details in memory manager."""
        if not self.memory_manager:
            return
        
        try:
            memory_content = f"Reddit MCP Tool Execution: {tool_name}"
            
            if tool_name == "submit_post" and result.get("success"):
                memory_content = f"Posted to r/{arguments['subreddit']}: {arguments['title']}"
            elif tool_name == "post_comment" and result.get("success"):
                memory_content = f"Commented on Reddit post: {arguments['content'][:100]}..."
            
            await self.memory_manager.store_content_context(
                content_id=f"reddit_mcp_{tool_name}_{int(time.time())}",
                content=memory_content,
                platform="reddit",
                persona_context=context,
                performance_metrics={
                    "tool_name": tool_name,
                    "success": result.get("success", False),
                    "arguments": arguments,
                    "result_data": result.get("data", {})
                }
            )
            
        except Exception as e:
            self.logger.error(f"❌ Memory storage failed: {str(e)}")
    
    def _update_performance_metrics(
        self,
        tool_name: str,
        execution_time: float,
        success: bool
    ):
        """Update performance metrics."""
        self.performance_metrics["api_calls"] += 1
        
        if not success:
            self.performance_metrics["errors"] += 1
        
        # Update average response time
        current_avg = self.performance_metrics["avg_response_time"]
        total_calls = self.performance_metrics["api_calls"]
        
        self.performance_metrics["avg_response_time"] = (
            (current_avg * (total_calls - 1) + execution_time) / total_calls
        )
    
    async def publish_content(
        self, 
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Publish content to Reddit with optimization."""
        try:
            # Extract content details
            title = content.get("title", "")
            text = content.get("content", "")
            subreddit = content.get("subreddit", "")
            post_type = content.get("type", "text")
            
            if not all([title, subreddit]):
                return {
                    "success": False,
                    "error": "Title and subreddit are required",
                    "platform": "reddit"
                }
            
            # Recommend subreddit if not specified or optimize choice
            if not subreddit or subreddit == "auto":
                recommended_subs = await self._recommend_subreddits(content)
                subreddit = recommended_subs[0] if recommended_subs else "general"
            
            # Submit post via MCP tool
            arguments = {
                "title": title,
                "content": text,
                "subreddit": subreddit,
                "post_type": post_type
            }
            
            if metadata and metadata.get("flair"):
                arguments["flair"] = metadata["flair"]
            
            if post_type == "link" and content.get("url"):
                arguments["url"] = content["url"]
            
            result = await self.execute_mcp_tool("submit_post", arguments, metadata)
            
            return {
                "success": result.success,
                "data": result.data,
                "error": result.error,
                "platform": "reddit",
                "subreddit": subreddit,
                "execution_time": result.execution_time
            }
            
        except Exception as e:
            self.logger.error(f"❌ Content publishing failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "platform": "reddit"
            }
    
    async def _recommend_subreddits(self, content: Dict[str, Any]) -> List[str]:
        """Recommend subreddits based on content."""
        title = content.get("title", "").lower()
        text = content.get("content", "").lower()
        combined = f"{title} {text}"
        
        recommendations = []
        
        # Keyword-based recommendations
        if any(word in combined for word in ["fitness", "workout", "gym", "exercise"]):
            recommendations.extend(["fitness", "bodybuilding", "homegym"])
        elif any(word in combined for word in ["tech", "technology", "ai", "programming"]):
            recommendations.extend(["technology", "programming", "artificial"])
        elif any(word in combined for word in ["business", "startup", "entrepreneur"]):
            recommendations.extend(["entrepreneur", "startups", "business"])
        elif any(word in combined for word in ["social media", "content", "marketing"]):
            recommendations.extend(["socialmedia", "marketing", "content"])
        else:
            recommendations.extend(["general", "discussion", "todayilearned"])
        
        return recommendations[:3]  # Return top 3 recommendations
    
    async def get_performance_stats(self) -> Dict[str, Any]:
        """Get comprehensive performance statistics."""
        stats = {
            "reddit_mcp_integration": {
                "posts_created": self.performance_metrics["posts_created"],
                "comments_posted": self.performance_metrics["comments_posted"],
                "total_api_calls": self.performance_metrics["api_calls"],
                "error_count": self.performance_metrics["errors"],
                "rate_limit_hits": self.performance_metrics["rate_limit_hits"],
                "average_response_time": round(self.performance_metrics["avg_response_time"], 3),
                "success_rate": round(
                    ((self.performance_metrics["api_calls"] - self.performance_metrics["errors"]) / 
                     max(self.performance_metrics["api_calls"], 1)) * 100, 2
                )
            },
            "rate_limits": {
                name: {
                    "remaining": limit.remaining,
                    "used_this_hour": limit.used_this_hour,
                    "reset_time": limit.reset_time.isoformat()
                }
                for name, limit in self.rate_limits.items()
            },
            "available_tools": list(self.available_tools.keys()),
            "reddit_client_active": self.reddit_client is not None
        }
        
        return stats
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform comprehensive health check."""
        health = {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "checks": {
                "reddit_client": {
                    "status": "pass" if self.reddit_client else "fail",
                    "details": "Reddit PRAW client initialized" if self.reddit_client else "Reddit client not initialized"
                },
                "memory_manager": {
                    "status": "pass" if self.memory_manager else "warn",
                    "details": "Memory manager connected" if self.memory_manager else "Memory manager not configured"
                },
                "rate_limits": {
                    "status": "pass",
                    "details": f"{len(self.rate_limits)} rate limiters active"
                }
            }
        }
        
        # Test Reddit API connectivity
        if self.reddit_client:
            try:
                user = self.reddit_client.user.me()
                health["checks"]["reddit_api"] = {
                    "status": "pass",
                    "details": f"Connected as u/{user.name}"
                }
            except Exception as e:
                health["checks"]["reddit_api"] = {
                    "status": "fail",
                    "details": f"API connection failed: {str(e)}"
                }
                health["status"] = "degraded"
        
        # Check rate limit status
        rate_limit_issues = []
        for name, limit in self.rate_limits.items():
            if limit.remaining <= 0:
                rate_limit_issues.append(f"{name}: rate limited")
        
        if rate_limit_issues:
            health["checks"]["rate_limits"] = {
                "status": "warn",
                "details": "; ".join(rate_limit_issues)
            }
            health["status"] = "degraded"
        
        return health
    
    def __repr__(self) -> str:
        return f"<RedditMCPIntegration client={'✅' if self.reddit_client else '❌'} tools={len(self.available_tools)}>"


async def create_reddit_mcp_agent(
    memory_manager: Optional[MemoryManager] = None,
    **kwargs
) -> RedditMCPIntegration:
    """Factory function to create Reddit MCP agent with memory integration."""
    return RedditMCPIntegration(
        memory_manager=memory_manager,
        **kwargs
    )


async def quick_reddit_post(
    title: str,
    content: str,
    subreddit: str,
    **kwargs
) -> Dict[str, Any]:
    """Quick utility function to post to Reddit via MCP."""
    agent = await create_reddit_mcp_agent(**kwargs)
    
    result = await agent.execute_mcp_tool(
        "submit_post",
        {
            "title": title,
            "content": content,
            "subreddit": subreddit
        }
    )
    
    return {
        "success": result.success,
        "data": result.data,
        "error": result.error
    } 