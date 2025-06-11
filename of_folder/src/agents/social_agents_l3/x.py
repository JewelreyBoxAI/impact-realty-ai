"""
X (Twitter) Agent - Specialized agent for X/Twitter platform management.

Handles:
- Tweet posting and thread creation
- Hashtag optimization and trending topic integration
- Real-time engagement tracking
- Poll creation and management
- Direct message automation
- Space participation
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timezone
import logging
import re
import asyncio

import tweepy
from pydantic import BaseModel, Field

# Import MCP tools with correct path
try:
    from mcp_tools import MCPToolWrapper
except ImportError:
    # Fallback for different import contexts
    import sys
    import os
    # Add root directory to path
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)
    from mcp_tools import MCPToolWrapper


class TweetType(str, Enum):
    """Types of tweets."""
    REGULAR = "regular"
    THREAD = "thread"
    REPLY = "reply"
    QUOTE = "quote"
    RETWEET = "retweet"
    POLL = "poll"


class EngagementAction(str, Enum):
    """Engagement actions."""
    LIKE = "like"
    RETWEET = "retweet"
    REPLY = "reply"
    QUOTE = "quote"
    FOLLOW = "follow"
    BOOKMARK = "bookmark"


@dataclass
class Tweet:
    """Tweet data structure."""
    tweet_id: Optional[str]
    content: str
    tweet_type: TweetType
    media_urls: List[str] = None
    hashtags: List[str] = None
    mentions: List[str] = None
    poll_options: List[str] = None
    poll_duration: int = 1440  # minutes (24 hours default)
    thread_position: Optional[int] = None
    parent_tweet_id: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    posted_at: Optional[datetime] = None


@dataclass
class XMetrics:
    """X/Twitter metrics structure."""
    tweet_id: str
    impressions: int
    engagements: int
    likes: int
    retweets: int
    replies: int
    quotes: int
    bookmarks: int
    profile_clicks: int
    url_clicks: int
    hashtag_clicks: int
    detail_expands: int
    engagement_rate: float


class XAgent:
    """
    X (Twitter) Agent for comprehensive Twitter/X platform management.
    
    Features:
    - Tweet and thread publishing
    - Hashtag optimization
    - Real-time engagement monitoring
    - Trending topic integration
    - Poll creation and management
    - Auto-engagement based on rules
    
    Rick's signature: Tweet fire, engage harder ☠️
    """
    
    def __init__(
        self,
        api_config: Optional[Dict[str, Any]] = None,
        auto_hashtags: bool = True,
        max_hashtags: int = 2,
        engagement_rules: Optional[Dict[str, Any]] = None,
        log_level: str = "INFO"
    ):
        """Initialize X Agent."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🐦 XAgent initializing - Twitter domination mode ☠️")
        
        # API configuration
        self.api_config = api_config or {}
        
        # Initialize Tweepy client
        self.client = None
        self.api = None
        if self.api_config:
            self._initialize_twitter_client()
        
        # MCP tool wrapper
        self.mcp_wrapper = MCPToolWrapper("x")
        
        # Configuration
        self.auto_hashtags = auto_hashtags
        self.max_hashtags = max_hashtags
        
        # Engagement rules
        self.engagement_rules = engagement_rules or self._default_engagement_rules()
        
        # Content tracking
        self.posted_tweets = {}
        self.scheduled_tweets = []
        self.threads = {}
        
        # Trending topics cache
        self.trending_topics = []
        self.trending_hashtags = []
        
        # Character limits
        self.CHARACTER_LIMIT = 280
        self.THREAD_LIMIT = 25
        
        self.logger.info("✅ XAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.X")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ X - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _initialize_twitter_client(self):
        """Initialize Twitter API client."""
        try:
            # Twitter API v2 client
            self.client = tweepy.Client(
                bearer_token=self.api_config.get("bearer_token"),
                consumer_key=self.api_config.get("consumer_key"),
                consumer_secret=self.api_config.get("consumer_secret"),
                access_token=self.api_config.get("access_token"),
                access_token_secret=self.api_config.get("access_token_secret"),
                wait_on_rate_limit=True
            )
            
            # Twitter API v1.1 for media upload
            auth = tweepy.OAuth1UserHandler(
                self.api_config.get("consumer_key"),
                self.api_config.get("consumer_secret"),
                self.api_config.get("access_token"),
                self.api_config.get("access_token_secret")
            )
            self.api = tweepy.API(auth, wait_on_rate_limit=True)
            
            # Test authentication
            user = self.client.get_me()
            self.logger.info(f"🔐 Authenticated as @{user.data.username}")
            
        except Exception as e:
            self.logger.error(f"❌ Twitter authentication failed: {str(e)}")
            self.client = None
            self.api = None
    
    def _default_engagement_rules(self) -> Dict[str, Any]:
        """Default engagement automation rules."""
        return {
            "auto_like": {
                "enabled": True,
                "keywords": ["great", "awesome", "love", "thank"],
                "mentions_only": True,
                "rate_limit": 50  # per hour
            },
            "auto_retweet": {
                "enabled": False,
                "keywords": [],
                "verified_only": True,
                "rate_limit": 10
            },
            "auto_reply": {
                "enabled": True,
                "triggers": ["@username"],
                "response_templates": [
                    "Thanks for the mention! 🔥",
                    "Appreciate the support! 🙏",
                    "Let's connect! 💪"
                ],
                "rate_limit": 20
            },
            "auto_follow": {
                "enabled": False,
                "criteria": ["verified", "high_followers"],
                "rate_limit": 5
            }
        }
    
    def publish_content(
        self,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Publish content to X/Twitter platform.
        
        Args:
            content: Content data from ContentGenAgent
            metadata: Additional metadata (thread_data, poll_data, etc.)
            
        Returns:
            Publication result with tweet ID and metrics
        """
        self.logger.info("📤 Publishing content to X/Twitter")
        
        try:
            # Extract content
            content_text = content.get("content", "")
            content_type = metadata.get("content_type", TweetType.REGULAR)
            
            # Determine if content needs to be a thread
            if len(content_text) > self.CHARACTER_LIMIT or content_type == TweetType.THREAD:
                return self._publish_thread(content_text, metadata)
            elif metadata.get("poll_options"):
                return self._publish_poll(content_text, metadata)
            else:
                return self._publish_single_tweet(content_text, metadata)
                
        except Exception as e:
            self.logger.error(f"❌ Content publication failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _publish_single_tweet(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Publish a single tweet."""
        try:
            # Optimize content for Twitter
            optimized_content = self._optimize_for_twitter(content, metadata)
            
            # Upload media if provided
            media_ids = []
            if metadata and metadata.get("media_urls"):
                media_ids = self._upload_media(metadata["media_urls"])
            
            # Post tweet
            if self.client:
                response = self.client.create_tweet(
                    text=optimized_content,
                    media_ids=media_ids if media_ids else None
                )
                
                tweet_id = response.data["id"]
                
                # Store tweet data
                tweet = Tweet(
                    tweet_id=tweet_id,
                    content=optimized_content,
                    tweet_type=TweetType.REGULAR,
                    media_urls=metadata.get("media_urls", []),
                    hashtags=self._extract_hashtags(optimized_content),
                    mentions=self._extract_mentions(optimized_content),
                    posted_at=datetime.now(timezone.utc)
                )
                
                self.posted_tweets[tweet_id] = tweet
                
                self.logger.info(f"✅ Tweet published: {tweet_id}")
                
                return {
                    "success": True,
                    "tweet_id": tweet_id,
                    "content": optimized_content,
                    "character_count": len(optimized_content),
                    "hashtags": tweet.hashtags,
                    "mentions": tweet.mentions,
                    "media_count": len(media_ids),
                    "url": f"https://twitter.com/x/status/{tweet_id}"
                }
            else:
                raise ValueError("X API client not configured. Use configure_x_api() first.")
                
        except Exception as e:
            self.logger.error(f"❌ Single tweet publication failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _publish_thread(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Publish a Twitter thread."""
        try:
            self.logger.info("🧵 Publishing Twitter thread")
            
            # Split content into thread parts
            thread_parts = self._split_into_thread(content)
            
            if len(thread_parts) > self.THREAD_LIMIT:
                return {
                    "success": False,
                    "error": f"Thread too long: {len(thread_parts)} tweets (max: {self.THREAD_LIMIT})"
                }
            
            thread_tweets = []
            previous_tweet_id = None
            
            for i, part in enumerate(thread_parts):
                # Add thread numbering
                if len(thread_parts) > 1:
                    part = f"{part} ({i+1}/{len(thread_parts)})"
                
                # Optimize each part
                optimized_part = self._optimize_for_twitter(part, metadata)
                
                # Post tweet
                if self.client:
                    response = self.client.create_tweet(
                        text=optimized_part,
                        in_reply_to_tweet_id=previous_tweet_id
                    )
                    
                    tweet_id = response.data["id"]
                    previous_tweet_id = tweet_id
                else:
                    raise ValueError("X API client not configured for thread posting")
                
                # Store tweet data
                tweet = Tweet(
                    tweet_id=tweet_id,
                    content=optimized_part,
                    tweet_type=TweetType.THREAD,
                    thread_position=i + 1,
                    parent_tweet_id=previous_tweet_id if i > 0 else None,
                    posted_at=datetime.now(timezone.utc)
                )
                
                thread_tweets.append(tweet)
                self.posted_tweets[tweet_id] = tweet
            
            # Store thread data
            main_tweet_id = thread_tweets[0].tweet_id
            self.threads[main_tweet_id] = {
                "tweets": thread_tweets,
                "total_parts": len(thread_tweets),
                "created_at": datetime.now(timezone.utc)
            }
            
            self.logger.info(f"✅ Thread published: {len(thread_tweets)} tweets")
            
            return {
                "success": True,
                "thread_id": main_tweet_id,
                "tweet_count": len(thread_tweets),
                "tweet_ids": [t.tweet_id for t in thread_tweets],
                "total_characters": sum(len(t.content) for t in thread_tweets),
                "url": f"https://twitter.com/x/status/{main_tweet_id}"
            }
            
        except Exception as e:
            self.logger.error(f"❌ Thread publication failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _publish_poll(
        self,
        content: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a poll tweet."""
        try:
            poll_options = metadata.get("poll_options", [])
            poll_duration = metadata.get("poll_duration", 1440)  # 24 hours
            
            if len(poll_options) < 2 or len(poll_options) > 4:
                return {
                    "success": False,
                    "error": "Poll must have 2-4 options"
                }
            
            # Optimize content
            optimized_content = self._optimize_for_twitter(content, metadata)
            
            if self.client:
                response = self.client.create_tweet(
                    text=optimized_content,
                    poll_options=poll_options,
                    poll_duration_minutes=poll_duration  
                )
                
                tweet_id = response.data["id"]
                
                # Store tweet data
                tweet = Tweet(
                    tweet_id=tweet_id,
                    content=optimized_content,
                    tweet_type=TweetType.POLL,
                    poll_options=poll_options,
                    poll_duration=poll_duration,
                    posted_at=datetime.now(timezone.utc)
                )
                
                self.posted_tweets[tweet_id] = tweet
                
                self.logger.info(f"📊 Poll published: {tweet_id}")
                
                return {
                    "success": True,
                    "tweet_id": tweet_id,
                    "content": optimized_content,
                    "poll_options": poll_options,
                    "poll_duration": poll_duration,
                    "url": f"https://twitter.com/x/status/{tweet_id}"
                }
            else:
                raise ValueError("X API client not configured for poll posting")
                
        except Exception as e:
            self.logger.error(f"❌ Poll publication failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _optimize_for_twitter(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Optimize content for Twitter platform."""
        
        # Add hashtags if enabled
        if self.auto_hashtags:
            content = self._add_optimal_hashtags(content, metadata)
        
        # Ensure character limit
        if len(content) > self.CHARACTER_LIMIT:
            # Truncate while preserving hashtags
            hashtags = self._extract_hashtags(content)
            hashtag_text = " ".join(hashtags) if hashtags else ""
            
            available_chars = self.CHARACTER_LIMIT - len(hashtag_text) - 1
            if available_chars > 0:
                content = content[:available_chars].rsplit(' ', 1)[0] + " " + hashtag_text
            else:
                content = content[:self.CHARACTER_LIMIT-3] + "..."
        
        # Add engagement hooks
        content = self._add_engagement_hooks(content)
        
        return content.strip()
    
    def _add_optimal_hashtags(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Add optimal hashtags to content."""
        existing_hashtags = self._extract_hashtags(content)
        
        if len(existing_hashtags) >= self.max_hashtags:
            return content
        
        # Get suggested hashtags
        suggested_hashtags = self._get_suggested_hashtags(content, metadata)
        
        # Add hashtags up to limit
        hashtags_to_add = []
        for hashtag in suggested_hashtags:
            if hashtag not in existing_hashtags and len(existing_hashtags) + len(hashtags_to_add) < self.max_hashtags:
                hashtags_to_add.append(hashtag)
        
        if hashtags_to_add:
            content += " " + " ".join(hashtags_to_add)
        
        return content
    
    def _get_suggested_hashtags(
        self,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> List[str]:
        """Get suggested hashtags based on content and trends."""
        suggestions = []
        
        # Keywords-based hashtags
        keywords = content.lower().split()
        hashtag_map = {
            "fitness": "#fitness",
            "workout": "#workout", 
            "motivation": "#motivation",
            "success": "#success",
            "business": "#business",
            "entrepreneur": "#entrepreneur",
            "lifestyle": "#lifestyle",
            "health": "#health"
        }
        
        for keyword, hashtag in hashtag_map.items():
            if keyword in keywords:
                suggestions.append(hashtag)
        
        # Add trending hashtags if relevant
        for trending in self.trending_hashtags[:2]:
            if trending.lower() in content.lower():
                suggestions.append(trending)
        
        # Persona-based hashtags from metadata
        if metadata and metadata.get("persona_hashtags"):
            suggestions.extend(metadata["persona_hashtags"])
        
        return suggestions[:self.max_hashtags]
    
    def _add_engagement_hooks(self, content: str) -> str:
        """Add engagement hooks to increase interaction."""
        # Don't add hooks if content already has questions or calls to action
        if any(hook in content for hook in ["?", "What do you think", "Let me know", "Comment below"]):
            return content
        
        # Add a simple engagement hook
        hooks = [
            "What do you think?",
            "Let me know your thoughts!",
            "Drop a 🔥 if you agree!",
            "Your take?",
            "Thoughts?"
        ]
        
        # Random selection could be implemented here
        # For now, just use the first one
        if len(content) + len(hooks[0]) + 1 <= self.CHARACTER_LIMIT:
            content += f" {hooks[0]}"
        
        return content
    
    def _split_into_thread(self, content: str) -> List[str]:
        """Split long content into thread parts."""
        parts = []
        sentences = content.split('. ')
        current_part = ""
        
        for sentence in sentences:
            # Check if adding this sentence would exceed character limit
            test_part = current_part + sentence + ". "
            
            if len(test_part) <= self.CHARACTER_LIMIT - 20:  # Leave room for thread numbering
                current_part = test_part
            else:
                # Start new part
                if current_part:
                    parts.append(current_part.strip())
                current_part = sentence + ". "
        
        # Add the last part
        if current_part:
            parts.append(current_part.strip())
        
        return parts
    
    def _upload_media(self, media_urls: List[str]) -> List[str]:
        """Upload media files and return media IDs."""
        if not self.api:
            raise ValueError("X API client not configured for media upload")
        
        media_ids = []
        
        try:
            import requests
            import tempfile
            import os
            
            for url in media_urls[:4]:  # Twitter allows max 4 media items
                # Download media file
                response = requests.get(url)
                response.raise_for_status()
                
                # Save to temporary file
                with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                    temp_file.write(response.content)
                    temp_path = temp_file.name
                
                try:
                    # Upload to Twitter
                    media_id = self.api.media_upload(filename=temp_path)
                    media_ids.append(media_id.media_id)
                finally:
                    # Clean up temporary file
                    os.unlink(temp_path)
                
        except Exception as e:
            self.logger.error(f"❌ Media upload failed: {str(e)}")
        
        return media_ids
    
    def _extract_hashtags(self, content: str) -> List[str]:
        """Extract hashtags from content."""
        return re.findall(r'#\w+', content)
    
    def _extract_mentions(self, content: str) -> List[str]:
        """Extract mentions from content."""
        return re.findall(r'@\w+', content)
    
    def get_tweet_metrics(self, tweet_id: str) -> Dict[str, Any]:
        """Get metrics for a specific tweet."""
        try:
            if self.client:
                tweet = self.client.get_tweet(
                    tweet_id,
                    tweet_fields=["public_metrics", "created_at", "context_annotations"]
                )
                
                metrics = tweet.data.public_metrics
                
                return {
                    "tweet_id": tweet_id,
                    "impressions": metrics.get("impression_count", 0),
                    "likes": metrics.get("like_count", 0),
                    "retweets": metrics.get("retweet_count", 0),
                    "replies": metrics.get("reply_count", 0),
                    "quotes": metrics.get("quote_count", 0),
                    "bookmarks": metrics.get("bookmark_count", 0),
                    "engagement_rate": self._calculate_engagement_rate(metrics),
                    "created_at": tweet.data.created_at.isoformat() if tweet.data.created_at else None
                }
            else:
                raise ValueError("X API client not configured for metrics retrieval")
                
        except Exception as e:
            self.logger.error(f"❌ Failed to get metrics for tweet {tweet_id}: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_engagement_rate(self, metrics: Dict[str, int]) -> float:
        """Calculate engagement rate from metrics."""
        impressions = metrics.get("impression_count", 0)
        if impressions == 0:
            return 0.0
        
        engagements = (
            metrics.get("like_count", 0) +
            metrics.get("retweet_count", 0) +
            metrics.get("reply_count", 0) +
            metrics.get("quote_count", 0)
        )
        
        return round((engagements / impressions) * 100, 2)
    
    def update_trending_topics(self) -> bool:
        """Update trending topics and hashtags."""
        try:
            if self.client:
                # Get trending topics for worldwide
                trends = self.client.get_trending_topics(1)  # WOEID 1 = worldwide
                
                self.trending_topics = [trend.name for trend in trends if not trend.name.startswith('#')]
                self.trending_hashtags = [trend.name for trend in trends if trend.name.startswith('#')]
                
                self.logger.info(f"📈 Updated trending topics: {len(self.trending_topics)} topics, {len(self.trending_hashtags)} hashtags")
                return True
            else:
                self.logger.warning("⚠️ X API client not configured - cannot fetch trending topics")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Failed to update trending topics: {str(e)}")
            return False
    
    def schedule_tweet(
        self,
        content: str,
        scheduled_time: datetime,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Schedule a tweet for future posting."""
        try:
            scheduled_tweet = {
                "content": content,
                "scheduled_time": scheduled_time,
                "metadata": metadata or {},
                "status": "scheduled",
                "created_at": datetime.now(timezone.utc)
            }
            
            self.scheduled_tweets.append(scheduled_tweet)
            
            self.logger.info(f"📅 Tweet scheduled for {scheduled_time}")
            return {
                "success": True,
                "scheduled_time": scheduled_time.isoformat(),
                "content_preview": content[:50] + "..." if len(content) > 50 else content
            }
            
        except Exception as e:
            self.logger.error(f"❌ Tweet scheduling failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_scheduled_tweets(self) -> List[Dict[str, Any]]:
        """Process any scheduled tweets that are ready to post."""
        results = []
        current_time = datetime.now(timezone.utc)
        
        for i, scheduled_tweet in enumerate(self.scheduled_tweets):
            if (scheduled_tweet["status"] == "scheduled" and 
                scheduled_tweet["scheduled_time"] <= current_time):
                
                # Publish the tweet
                result = self.publish_content(
                    content={"content": scheduled_tweet["content"]},
                    metadata=scheduled_tweet["metadata"]
                )
                
                # Update status
                scheduled_tweet["status"] = "published" if result["success"] else "failed"
                scheduled_tweet["published_at"] = current_time
                
                results.append({
                    "content_preview": scheduled_tweet["content"][:50] + "...",
                    "result": result
                })
        
        # Remove published/failed tweets
        self.scheduled_tweets = [
            tweet for tweet in self.scheduled_tweets 
            if tweet["status"] == "scheduled"
        ]
        
        return results
    
    def __repr__(self) -> str:
        api_status = "🟢" if self.client else "🔴"
        tweet_count = len(self.posted_tweets)
        return f"XAgent(API: {api_status}, Tweets: {tweet_count}) ☠️" 