"""
🔴 Reddit Agent - Community-focused content management and engagement.

Features:
- Subreddit-specific content posting and management
- Community guideline compliance checking
- Karma optimization strategies
- Real-time discussion monitoring
- Cross-community engagement analytics

Rick's signature: Pure community value, zero spam ☠️
"""

import asyncio
import logging
import json
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from enum import Enum

import praw
from praw.models import Submission, Comment, Subreddit
from langchain.tools import BaseTool
from langchain.schema import BaseMessage
from pydantic import BaseModel, Field

# Import tools with correct path
try:
    from memory_manager import MemoryManager
    from mcp_tools import MCPToolWrapper
except ImportError:
    # Fallback for different import contexts
    import sys
    import os
    # Add root directory to path
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)
    from memory_manager import MemoryManager
    from mcp_tools import MCPToolWrapper


class RedditContentType(str, Enum):
    """Reddit content types."""
    TEXT = "text"
    LINK = "link"
    IMAGE = "image"
    VIDEO = "video"
    POLL = "poll"


class PostingStrategy(str, Enum):
    """Reddit posting strategies."""
    DISCUSSION = "discussion"
    TUTORIAL = "tutorial"
    AMA = "ama"
    NEWS = "news"
    MEME = "meme"
    SUPPORT = "support"


@dataclass
class RedditPost:
    """Reddit post structure."""
    title: str
    content: str
    subreddit: str
    content_type: RedditContentType
    flair: Optional[str] = None
    nsfw: bool = False
    spoiler: bool = False
    original_content: bool = False
    url: Optional[str] = None
    post_id: Optional[str] = None
    created_at: Optional[datetime] = None
    score: int = 0
    upvote_ratio: float = 0.0
    num_comments: int = 0


@dataclass
class SubredditRule:
    """Subreddit rule structure."""
    rule_name: str
    description: str
    violation_penalty: str
    priority: int = 1


@dataclass
class SubredditProfile:
    """Subreddit profile for optimized posting."""
    name: str
    subscribers: int
    active_users: int
    description: str
    rules: List[SubredditRule]
    post_guidelines: Dict[str, Any]
    optimal_posting_times: List[str]
    popular_flairs: List[str]
    content_preferences: Dict[str, float]


class RedditAgent:
    """
    Reddit Agent for comprehensive community management and engagement.
    
    Features:
    - Multi-subreddit content management
    - Community guideline compliance
    - Karma optimization strategies
    - Real-time engagement monitoring
    - Cross-community analytics
    
    Rick's signature: Community-first, value-driven engagement ☠️
    """
    
    def __init__(
        self,
        reddit_config: Optional[Dict[str, Any]] = None,
        auto_compliance_check: bool = True,
        karma_optimization: bool = True,
        community_guidelines: bool = True,
        log_level: str = "INFO"
    ):
        """Initialize Reddit Agent."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🔴 RedditAgent initializing - Community empire mode ☠️")
        
        # Reddit API configuration
        self.reddit_config = reddit_config or {}
        
        # Initialize Reddit client
        self.reddit = None
        if self.reddit_config and self._validate_reddit_config():
            self._initialize_reddit_client()
        
        # MCP tool wrapper
        self.mcp_wrapper = MCPToolWrapper("reddit")
        
        # Configuration
        self.auto_compliance_check = auto_compliance_check
        self.karma_optimization = karma_optimization
        self.community_guidelines = community_guidelines
        
        # Content tracking
        self.posted_content = {}
        self.monitored_subreddits = {}
        self.subreddit_profiles = {}
        
        # Community engagement tracking
        self.karma_history = []
        self.comment_engagement = {}
        self.community_standing = {}
        
        # Memory manager for context
        self.memory_manager = MemoryManager()
        
        self.logger.info("✅ RedditAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.Reddit")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ REDDIT - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _validate_reddit_config(self) -> bool:
        """Validate Reddit API configuration."""
        required_keys = ["client_id", "client_secret", "username", "password", "user_agent"]
        return all(key in self.reddit_config for key in required_keys)
    
    def _initialize_reddit_client(self):
        """Initialize Reddit (PRAW) client."""
        try:
            self.reddit = praw.Reddit(
                client_id=self.reddit_config["client_id"],
                client_secret=self.reddit_config["client_secret"],
                username=self.reddit_config["username"],
                password=self.reddit_config["password"],
                user_agent=self.reddit_config.get("user_agent", "SocialMediaAgent/1.0")
            )
            
            # Test connection
            self.reddit.user.me()
            
            self.logger.info("🔐 Reddit client initialized successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Reddit client initialization failed: {str(e)}")
            self.reddit = None
    
    def publish_content(
        self,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Publish content to Reddit with community compliance."""
        try:
            if not self.reddit:
                raise ValueError("Reddit client not initialized. Check API credentials.")
            
            self.logger.info("📝 Starting Reddit content publishing...")
            
            # Extract content data
            title = content.get("title", "")
            text_content = content.get("content", "")
            subreddit_name = content.get("subreddit", "")
            content_type = RedditContentType(content.get("type", "text"))
            
            if not all([title, text_content, subreddit_name]):
                raise ValueError("Missing required content: title, content, or subreddit")
            
            # Create Reddit post object
            reddit_post = RedditPost(
                title=title,
                content=text_content,
                subreddit=subreddit_name,
                content_type=content_type,
                flair=content.get("flair"),
                nsfw=content.get("nsfw", False),
                spoiler=content.get("spoiler", False),
                original_content=content.get("original_content", False),
                url=content.get("url")
            )
            
            # Compliance check
            if self.auto_compliance_check:
                compliance_result = self._check_content_compliance(reddit_post)
                if not compliance_result["compliant"]:
                    self.logger.warning(f"⚠️ Compliance issues: {compliance_result['issues']}")
                    return {
                        "success": False,
                        "error": "Content compliance failed",
                        "compliance_issues": compliance_result["issues"]
                    }
            
            # Optimize for karma if enabled
            if self.karma_optimization:
                reddit_post = self._optimize_for_karma(reddit_post)
            
            # Submit to Reddit
            submission_result = self._submit_to_reddit(reddit_post)
            
            if submission_result["success"]:
                # Store in content library
                post_id = submission_result["post_id"]
                reddit_post.post_id = post_id
                reddit_post.created_at = datetime.now(timezone.utc)
                self.posted_content[post_id] = reddit_post
                
                # Start monitoring if enabled
                self._start_post_monitoring(post_id)
                
                self.logger.info(f"✅ Reddit content published successfully: {post_id}")
                
                return {
                    "success": True,
                    "post_id": post_id,
                    "post_url": f"https://reddit.com/r/{subreddit_name}/comments/{post_id}",
                    "subreddit": subreddit_name,
                    "compliance_passed": True,
                    "karma_optimized": self.karma_optimization,
                    "published_at": reddit_post.created_at.isoformat()
                }
            else:
                self.logger.error(f"❌ Reddit submission failed: {submission_result['error']}")
                return {
                    "success": False,
                    "error": submission_result["error"]
                }
                
        except Exception as e:
            self.logger.error(f"❌ Reddit publishing failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _check_content_compliance(self, post: RedditPost) -> Dict[str, Any]:
        """Check content compliance with Reddit and subreddit rules."""
        issues = []
        
        # Get subreddit rules
        try:
            subreddit = self.reddit.subreddit(post.subreddit)
            subreddit_rules = list(subreddit.rules)
        except Exception as e:
            self.logger.warning(f"Could not fetch subreddit rules: {e}")
            subreddit_rules = []
        
        # Check title length
        if len(post.title) > 300:
            issues.append("Title exceeds 300 characters")
        
        # Check for spam indicators
        spam_indicators = ["upvote", "like", "subscribe", "follow", "click here", "buy now"]
        spam_count = sum(1 for indicator in spam_indicators if indicator.lower() in post.content.lower())
        if spam_count > 2:
            issues.append("Content contains multiple spam indicators")
        
        # Check for self-promotion limits
        promo_indicators = ["my website", "my channel", "check out my", "visit my"]
        if any(indicator in post.content.lower() for indicator in promo_indicators):
            issues.append("Content may violate self-promotion guidelines")
        
        # Check NSFW compliance
        nsfw_keywords = ["nsfw", "adult", "18+", "explicit"]
        contains_nsfw = any(keyword in post.content.lower() for keyword in nsfw_keywords)
        if contains_nsfw and not post.nsfw:
            issues.append("Content should be marked as NSFW")
        
        return {
            "compliant": len(issues) == 0,
            "issues": issues,
            "subreddit_rules_checked": len(subreddit_rules) > 0
        }
    
    def _optimize_for_karma(self, post: RedditPost) -> RedditPost:
        """Optimize post for maximum karma potential."""
        # Get subreddit profile for optimization
        subreddit_profile = self._get_subreddit_profile(post.subreddit)
        
        # Optimize title if needed
        if subreddit_profile:
            optimal_length = subreddit_profile.post_guidelines.get("optimal_title_length", 60)
            if len(post.title) > optimal_length:
                post.title = post.title[:optimal_length-3] + "..."
        
        # Add engaging elements
        if post.content_type == RedditContentType.TEXT:
            # Add engagement hooks
            engagement_hooks = [
                "What do you think?",
                "Has anyone else experienced this?",
                "I'd love to hear your thoughts!",
                "What's your opinion on this?"
            ]
            
            if not any(hook.lower() in post.content.lower() for hook in engagement_hooks):
                post.content += "\n\nWhat are your thoughts on this?"
        
        return post
    
    def _submit_to_reddit(self, post: RedditPost) -> Dict[str, Any]:
        """Submit post to Reddit."""
        try:
            subreddit = self.reddit.subreddit(post.subreddit)
            
            if post.content_type == RedditContentType.TEXT:
                submission = subreddit.submit(
                    title=post.title,
                    selftext=post.content,
                    flair_id=post.flair,
                    nsfw=post.nsfw,
                    spoiler=post.spoiler
                )
            elif post.content_type == RedditContentType.LINK:
                submission = subreddit.submit(
                    title=post.title,
                    url=post.url,
                    flair_id=post.flair,
                    nsfw=post.nsfw,
                    spoiler=post.spoiler
                )
            else:
                return {
                    "success": False,
                    "error": f"Content type {post.content_type} not yet supported"
                }
            
            return {
                "success": True,
                "post_id": submission.id,
                "submission": submission
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_subreddit_profile(self, subreddit_name: str) -> Optional[SubredditProfile]:
        """Get or create subreddit profile for optimization."""
        if subreddit_name in self.subreddit_profiles:
            return self.subreddit_profiles[subreddit_name]
        
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Extract basic info
            profile = SubredditProfile(
                name=subreddit_name,
                subscribers=subreddit.subscribers,
                active_users=subreddit.active_user_count or 0,
                description=subreddit.public_description,
                rules=[],
                post_guidelines={},
                optimal_posting_times=[],
                popular_flairs=[],
                content_preferences={}
            )
            
            # Extract rules
            for rule in subreddit.rules:
                profile.rules.append(SubredditRule(
                    rule_name=rule.short_name,
                    description=rule.description,
                    violation_penalty=rule.violation_reason,
                    priority=rule.priority if hasattr(rule, 'priority') else 1
                ))
            
            # Cache profile
            self.subreddit_profiles[subreddit_name] = profile
            
            return profile
            
        except Exception as e:
            self.logger.warning(f"Could not create subreddit profile for {subreddit_name}: {e}")
            return None
    
    def _start_post_monitoring(self, post_id: str):
        """Start monitoring post performance."""
        # This would start a background task to monitor the post
        # For now, just log the intention
        self.logger.info(f"📊 Started monitoring post: {post_id}")
    
    def get_engagement_metrics(
        self, 
        post_id: Optional[str] = None,
        timeframe: str = "24h"
    ) -> Dict[str, Any]:
        """Get engagement metrics for posts."""
        try:
            if not self.reddit:
                raise ValueError("Reddit client not initialized")
            
            metrics = {}
            
            if post_id:
                # Get metrics for specific post
                submission = self.reddit.submission(id=post_id)
                metrics[post_id] = {
                    "score": submission.score,
                    "upvote_ratio": submission.upvote_ratio,
                    "num_comments": submission.num_comments,
                    "created_utc": submission.created_utc,
                    "url": submission.url,
                    "subreddit": submission.subreddit.display_name
                }
            else:
                # Get metrics for all recent posts
                for submission in self.reddit.user.me().submissions.new(limit=50):
                    metrics[submission.id] = {
                        "score": submission.score,
                        "upvote_ratio": submission.upvote_ratio,
                        "num_comments": submission.num_comments,
                        "created_utc": submission.created_utc,
                        "title": submission.title,
                        "subreddit": submission.subreddit.display_name
                    }
            
            return {
                "success": True,
                "metrics": metrics,
                "collected_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get engagement metrics: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def analyze_subreddit_trends(self, subreddit_name: str, limit: int = 100) -> Dict[str, Any]:
        """Analyze trending content in a subreddit."""
        try:
            if not self.reddit:
                raise ValueError("Reddit client not initialized")
            
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Analyze hot posts
            hot_posts = []
            for submission in subreddit.hot(limit=limit):
                hot_posts.append({
                    "id": submission.id,
                    "title": submission.title,
                    "score": submission.score,
                    "upvote_ratio": submission.upvote_ratio,
                    "num_comments": submission.num_comments,
                    "created_utc": submission.created_utc,
                    "flair": submission.link_flair_text,
                    "author": str(submission.author) if submission.author else "[deleted]"
                })
            
            # Extract trends
            total_posts = len(hot_posts)
            avg_score = sum(post["score"] for post in hot_posts) / total_posts if total_posts > 0 else 0
            avg_comments = sum(post["num_comments"] for post in hot_posts) / total_posts if total_posts > 0 else 0
            
            # Popular flairs
            flair_counts = {}
            for post in hot_posts:
                flair = post["flair"] or "No Flair"
                flair_counts[flair] = flair_counts.get(flair, 0) + 1
            
            popular_flairs = sorted(flair_counts.items(), key=lambda x: x[1], reverse=True)[:5]
            
            return {
                "success": True,
                "subreddit": subreddit_name,
                "analysis": {
                    "total_posts_analyzed": total_posts,
                    "average_score": avg_score,
                    "average_comments": avg_comments,
                    "popular_flairs": popular_flairs,
                    "top_posts": hot_posts[:10]
                },
                "analyzed_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Subreddit trend analysis failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def optimize_posting_schedule(self, subreddit_name: str) -> Dict[str, Any]:
        """Analyze optimal posting times for a subreddit."""
        try:
            # This would analyze historical data to find optimal posting times
            # For now, provide general recommendations
            
            general_optimal_times = {
                "weekdays": ["9:00", "12:00", "18:00", "21:00"],
                "weekends": ["10:00", "14:00", "19:00", "22:00"],
                "timezone": "UTC"
            }
            
            return {
                "success": True,
                "subreddit": subreddit_name,
                "optimal_times": general_optimal_times,
                "recommendation": "Post during peak activity hours when users are most active",
                "generated_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"❌ Posting schedule optimization failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def __repr__(self) -> str:
        """String representation of RedditAgent."""
        client_status = "🟢" if self.reddit else "🔴"
        posts_count = len(self.posted_content)
        return f"RedditAgent(Client: {client_status}, Posts: {posts_count}) ☠️"