"""
MetricsAgent - Specialized agent for engagement metrics and POS tracking.

Handles:
- Cross-platform engagement metrics collection
- Point-of-sale (POS) conversion tracking
- UTM parameter management
- Real-time analytics dashboard generation
- Performance trend analysis
"""

from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime, timezone, timedelta
import logging
import asyncio
import json
from urllib.parse import urlencode

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, Column, String, Integer, Float, DateTime, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import requests
from pydantic import BaseModel, Field

from langchain.tools import BaseTool
from langchain.schema import BaseMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

try:
    from ..memory_manager import MemoryManager
except ImportError:
    # Fallback for direct execution
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from memory_manager import MemoryManager


Base = declarative_base()


class MetricType(str, Enum):
    """Types of metrics collected."""
    ENGAGEMENT = "engagement"
    REACH = "reach"
    CONVERSION = "conversion"
    REVENUE = "revenue"
    GROWTH = "growth"


class PlatformMetric(str, Enum):
    """Platform-specific metrics."""
    # Universal
    LIKES = "likes"
    COMMENTS = "comments"
    SHARES = "shares"
    VIEWS = "views"
    CLICKS = "clicks"
    
    # Platform-specific
    RETWEETS = "retweets"          # X/Twitter
    UPVOTES = "upvotes"            # Reddit
    DOWNVOTES = "downvotes"        # Reddit
    SAVES = "saves"                # Instagram
    STORY_REPLIES = "story_replies" # Instagram/Snapchat
    SUBSCRIBERS = "subscribers"     # OnlyFans
    TIPS = "tips"                  # OnlyFans
    PURCHASES = "purchases"        # OnlyFans


@dataclass
class EngagementMetrics:
    """Engagement metrics data structure."""
    platform: str
    post_id: str
    timestamp: datetime
    likes: int = 0
    comments: int = 0
    shares: int = 0
    views: int = 0
    clicks: int = 0
    engagement_rate: float = 0.0
    reach: int = 0
    impressions: int = 0
    platform_specific: Dict[str, Any] = None


@dataclass
class ConversionMetrics:
    """Conversion and POS metrics."""
    platform: str
    post_id: str
    timestamp: datetime
    utm_source: str
    utm_medium: str
    utm_campaign: str
    clicks: int = 0
    conversions: int = 0
    revenue: float = 0.0
    conversion_rate: float = 0.0
    cost_per_acquisition: float = 0.0
    lifetime_value: float = 0.0


class MetricsDB(Base):
    """Database model for metrics storage."""
    __tablename__ = 'metrics'
    
    id = Column(Integer, primary_key=True)
    platform = Column(String(50), nullable=False)
    post_id = Column(String(255), nullable=False)
    metric_type = Column(String(50), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    data = Column(JSON, nullable=False)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MetricsAgent:
    """
    MetricsAgent handles engagement and POS tracking across all platforms.
    
    Features:
    - Real-time metrics collection
    - UTM campaign tracking
    - Cross-platform analytics
    - Revenue attribution
    - Performance optimization insights
    
    Rick's signature: Pure data, actionable insights ☠️
    """
    
    def __init__(
        self,
        database_url: str = "sqlite:///metrics.db",
        cache_ttl: int = 3600,  # PostgreSQL-based caching TTL
        collection_interval: int = 300,  # 5 minutes
        log_level: str = "INFO"
    ):
        """Initialize MetricsAgent with database and collection setup."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("📊 MetricsAgent initializing - Rick's data empire ☠️")
        
        # Database setup
        self.engine = create_engine(database_url, echo=False)
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        
        # Memory manager for caching
        self.memory_manager = MemoryManager()
        
        # Collection settings
        self.collection_interval = collection_interval
        self.is_collecting = False
        
        # Platform API configurations
        self.platform_configs = {}
        
        # UTM tracking setup
        self.utm_campaigns = {}
        
        # Revenue tracking
        self.revenue_sources = {}
        
        self.logger.info("✅ MetricsAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.Metrics")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ METRICS - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def configure_platform_api(
        self, 
        platform: str, 
        api_config: Dict[str, Any]
    ) -> bool:
        """Configure API access for a platform."""
        try:
            self.platform_configs[platform] = api_config
            self.logger.info(f"🔧 Configured API for {platform}")
            return True
        except Exception as e:
            self.logger.error(f"❌ API configuration failed for {platform}: {str(e)}")
            return False
    
    def start_real_time_collection(self) -> bool:
        """Start real-time metrics collection."""
        if self.is_collecting:
            self.logger.warning("⚠️ Collection already running")
            return False
        
        try:
            self.is_collecting = True
            asyncio.create_task(self._collection_loop())
            self.logger.info("🚀 Started real-time metrics collection")
            return True
        except Exception as e:
            self.logger.error(f"❌ Failed to start collection: {str(e)}")
            self.is_collecting = False
            return False
    
    def stop_real_time_collection(self) -> bool:
        """Stop real-time metrics collection."""
        self.is_collecting = False
        self.logger.info("⏹️ Stopped real-time metrics collection")
        return True
    
    async def _collection_loop(self):
        """Main collection loop for real-time metrics."""
        while self.is_collecting:
            try:
                await self._collect_all_platform_metrics()
                await asyncio.sleep(self.collection_interval)
            except Exception as e:
                self.logger.error(f"❌ Collection loop error: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _collect_all_platform_metrics(self):
        """Collect metrics from all configured platforms."""
        tasks = []
        
        for platform, config in self.platform_configs.items():
            task = asyncio.create_task(
                self._collect_platform_metrics(platform, config)
            )
            tasks.append(task)
        
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _collect_platform_metrics(self, platform: str, config: Dict[str, Any]):
        """Collect metrics for a specific platform."""
        try:
            self.logger.debug(f"📈 Collecting metrics for {platform}")
            
            if platform == "x":
                metrics = await self._collect_x_metrics(config)
            elif platform == "instagram":
                metrics = await self._collect_instagram_metrics(config)
            elif platform == "reddit":
                metrics = await self._collect_reddit_metrics(config)
            elif platform == "onlyfans":
                metrics = await self._collect_onlyfans_metrics(config)
            elif platform == "snapchat":
                metrics = await self._collect_snapchat_metrics(config)
            else:
                self.logger.warning(f"⚠️ Unsupported platform: {platform}")
                return
            
            # Store metrics in database
            for metric in metrics:
                self._store_metric(metric)
            
            self.logger.debug(f"✅ Collected {len(metrics)} metrics for {platform}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to collect metrics for {platform}: {str(e)}")
    
    async def _collect_x_metrics(self, config: Dict[str, Any]) -> List[EngagementMetrics]:
        """Collect metrics from X/Twitter."""
        metrics = []
        
        try:
            if not config:
                raise ValueError("No configuration provided for X/Twitter")
            
            # Verify API credentials
            required_keys = ["bearer_token", "api_key", "api_secret"]
            if not all(key in config for key in required_keys):
                raise ValueError("Missing required X API credentials")
            
            # Use Twitter API v2 to collect real metrics
            import tweepy
            
            client = tweepy.Client(
                bearer_token=config["bearer_token"],
                consumer_key=config["api_key"],
                consumer_secret=config["api_secret"],
                access_token=config.get("access_token"),
                access_token_secret=config.get("access_token_secret")
            )
            
            # Get recent tweets and their metrics
            tweets = client.get_users_tweets(
                id=config["user_id"],
                max_results=10,
                tweet_fields=["public_metrics", "created_at"]
            )
            
            if tweets.data:
                for tweet in tweets.data:
                    public_metrics = tweet.public_metrics
                    
                    # Calculate engagement rate
                    total_engagements = (
                        public_metrics["like_count"] +
                        public_metrics["retweet_count"] +
                        public_metrics["reply_count"] +
                        public_metrics["quote_count"]
                    )
                    engagement_rate = (total_engagements / public_metrics["impression_count"] * 100) if public_metrics["impression_count"] > 0 else 0
                    
                    metric = EngagementMetrics(
                        platform="x",
                        post_id=tweet.id,
                        timestamp=tweet.created_at,
                        likes=public_metrics["like_count"],
                        comments=public_metrics["reply_count"],
                        shares=public_metrics["retweet_count"],
                        views=public_metrics["impression_count"],
                        clicks=0,  # Not available in public metrics
                        engagement_rate=round(engagement_rate, 2),
                        reach=0,  # Not available in public metrics
                        impressions=public_metrics["impression_count"],
                        platform_specific={
                            "retweets": public_metrics["retweet_count"],
                            "quote_tweets": public_metrics["quote_count"]
                        }
                    )
                    metrics.append(metric)
            
        except Exception as e:
            self.logger.error(f"❌ X metrics collection failed: {str(e)}")
        
        return metrics
    
    async def _collect_instagram_metrics(self, config: Dict[str, Any]) -> List[EngagementMetrics]:
        """Collect metrics from Instagram."""
        metrics = []
        
        try:
            if not config.get("access_token"):
                raise ValueError("Instagram access token required for metrics collection")
            
            import requests
            
            access_token = config["access_token"]
            user_id = config.get("user_id", "me")
            
            # Get user media
            media_url = f"https://graph.instagram.com/{user_id}/media"
            media_params = {
                "fields": "id,media_type,media_url,caption,timestamp,like_count,comments_count",
                "access_token": access_token
            }
            
            media_response = requests.get(media_url, params=media_params)
            media_response.raise_for_status()
            
            for post in media_response.json().get("data", []):
                # Get detailed insights for each post
                insights_url = f"https://graph.instagram.com/{post['id']}/insights"
                insights_params = {
                    "metric": "impressions,reach,profile_visits,website_clicks",
                    "access_token": access_token
                }
                
                try:
                    insights_response = requests.get(insights_url, params=insights_params)
                    insights_data = insights_response.json().get("data", [])
                    
                    # Parse insights
                    insights = {item["name"]: item["values"][0]["value"] for item in insights_data}
                    
                    metric = EngagementMetrics(
                        platform="instagram",
                        post_id=post["id"],
                        timestamp=datetime.fromisoformat(post["timestamp"].replace("Z", "+00:00")),
                        likes=post.get("like_count", 0),
                        comments=post.get("comments_count", 0),
                        shares=0,  # Not available in basic API
                        views=insights.get("impressions", 0),
                        clicks=insights.get("website_clicks", 0),
                        engagement_rate=self._calculate_engagement_rate(
                            post.get("like_count", 0) + post.get("comments_count", 0),
                            insights.get("reach", 1)
                        ),
                        reach=insights.get("reach", 0),
                        impressions=insights.get("impressions", 0),
                        platform_specific={
                            "media_type": post.get("media_type"),
                            "profile_visits": insights.get("profile_visits", 0)
                        }
                    )
                    metrics.append(metric)
                    
                except Exception as e:
                    self.logger.warning(f"Failed to get insights for post {post['id']}: {e}")
                    continue
            
        except Exception as e:
            self.logger.error(f"❌ Instagram metrics collection failed: {str(e)}")
        
        return metrics
    
    async def _collect_reddit_metrics(self, config: Dict[str, Any]) -> List[EngagementMetrics]:
        """Collect metrics from Reddit."""
        metrics = []
        
        try:
            if not all(k in config for k in ["client_id", "client_secret", "username", "password"]):
                raise ValueError("Reddit API credentials required: client_id, client_secret, username, password")
            
            import praw
            
            reddit = praw.Reddit(
                client_id=config["client_id"],
                client_secret=config["client_secret"],
                username=config["username"],
                password=config["password"],
                user_agent="SocialMediaAgent/1.0"
            )
            
            # Get user's submissions
            for submission in reddit.user.me().submissions.new(limit=50):
                metric = EngagementMetrics(
                    platform="reddit",
                    post_id=submission.id,
                    timestamp=datetime.fromtimestamp(submission.created_utc, tz=timezone.utc),
                    likes=submission.score,  # Net upvotes
                    comments=submission.num_comments,
                    shares=0,  # Reddit doesn't track shares directly
                    views=0,  # Not available in API
                    clicks=0,  # Not available in API
                    engagement_rate=self._calculate_engagement_rate(
                        submission.score + submission.num_comments,
                        max(submission.score * 1.5, 100)  # Estimate reach
                    ),
                    reach=max(submission.score * 1.5, 100),  # Estimate
                    impressions=max(submission.score * 2, 100),  # Estimate
                    platform_specific={
                        "upvotes": submission.ups,
                        "downvotes": submission.downs,
                        "upvote_ratio": submission.upvote_ratio,
                        "subreddit": submission.subreddit.display_name,
                        "is_self": submission.is_self,
                        "num_crossposts": submission.num_crossposts
                    }
                )
                metrics.append(metric)
            
        except Exception as e:
            self.logger.error(f"❌ Reddit metrics collection failed: {str(e)}")
        
        return metrics
    
    async def _collect_onlyfans_metrics(self, config: Dict[str, Any]) -> List[EngagementMetrics]:
        """Collect metrics from OnlyFans via manual data entry or CSV import."""
        metrics = []
        
        try:
            # OnlyFans doesn't have a public API - check for manual data sources
            manual_data_path = config.get("manual_data_path")
            csv_import_path = config.get("csv_import_path")
            
            if csv_import_path and os.path.exists(csv_import_path):
                metrics = await self._import_onlyfans_csv(csv_import_path)
                self.logger.info(f"📊 Imported {len(metrics)} OnlyFans metrics from CSV")
            
            elif manual_data_path and os.path.exists(manual_data_path):
                metrics = await self._import_onlyfans_manual_data(manual_data_path)
                self.logger.info(f"📊 Imported {len(metrics)} OnlyFans metrics from manual data")
            
            else:
                # Create placeholder metrics with manual entry guidance
                self.logger.warning(
                    "⚠️ OnlyFans metrics require manual data entry. "
                    "Please provide CSV file path in config or use manual_data_path. "
                    "Expected CSV columns: post_id, likes, comments, tips, revenue, timestamp"
                )
                
                # Check if there's recent manual data in the database
                recent_metrics = self.session.query(MetricsDB).filter(
                    MetricsDB.platform == "onlyfans",
                    MetricsDB.timestamp >= datetime.now(timezone.utc) - timedelta(hours=24)
                ).all()
                
                if recent_metrics:
                    self.logger.info(f"📊 Found {len(recent_metrics)} recent OnlyFans metrics in database")
                    for db_metric in recent_metrics:
                        metric_data = db_metric.data
                        metric = EngagementMetrics(
                            platform="onlyfans",
                            post_id=metric_data.get("post_id", db_metric.post_id),
                            timestamp=db_metric.timestamp,
                            likes=metric_data.get("likes", 0),
                            comments=metric_data.get("comments", 0),
                            shares=0,  # Not applicable for OnlyFans
                            views=metric_data.get("views", 0),
                            clicks=metric_data.get("clicks", 0),
                            engagement_rate=metric_data.get("engagement_rate", 0.0),
                            reach=metric_data.get("reach", 0),
                            impressions=metric_data.get("impressions", 0),
                            platform_specific={
                                "tips": metric_data.get("tips", 0),
                                "revenue": metric_data.get("revenue", 0.0),
                                "subscribers": metric_data.get("subscribers", 0),
                                "purchases": metric_data.get("purchases", 0)
                            }
                        )
                        metrics.append(metric)
            
        except Exception as e:
            self.logger.error(f"❌ OnlyFans metrics collection failed: {str(e)}")
        
        return metrics
    
    async def _import_onlyfans_csv(self, csv_path: str) -> List[EngagementMetrics]:
        """Import OnlyFans metrics from CSV file."""
        metrics = []
        
        try:
            import pandas as pd
            
            df = pd.read_csv(csv_path)
            required_columns = ["post_id", "timestamp", "likes", "comments", "tips", "revenue"]
            
            if not all(col in df.columns for col in required_columns):
                raise ValueError(f"CSV must contain columns: {required_columns}")
            
            for _, row in df.iterrows():
                metric = EngagementMetrics(
                    platform="onlyfans",
                    post_id=str(row["post_id"]),
                    timestamp=pd.to_datetime(row["timestamp"]),
                    likes=int(row.get("likes", 0)),
                    comments=int(row.get("comments", 0)),
                    shares=0,  # Not applicable
                    views=int(row.get("views", 0)),
                    clicks=int(row.get("clicks", 0)),
                    engagement_rate=float(row.get("engagement_rate", 0.0)),
                    reach=int(row.get("reach", 0)),
                    impressions=int(row.get("impressions", 0)),
                    platform_specific={
                        "tips": float(row.get("tips", 0.0)),
                        "revenue": float(row.get("revenue", 0.0)),
                        "subscribers": int(row.get("subscribers", 0)),
                        "purchases": int(row.get("purchases", 0))
                    }
                )
                metrics.append(metric)
                
        except Exception as e:
            self.logger.error(f"❌ OnlyFans CSV import failed: {str(e)}")
        
        return metrics
    
    async def _import_onlyfans_manual_data(self, data_path: str) -> List[EngagementMetrics]:
        """Import OnlyFans metrics from manual JSON data file."""
        metrics = []
        
        try:
            import json
            
            with open(data_path, 'r') as f:
                data = json.load(f)
            
            for entry in data.get("metrics", []):
                metric = EngagementMetrics(
                    platform="onlyfans",
                    post_id=entry["post_id"],
                    timestamp=datetime.fromisoformat(entry["timestamp"]),
                    likes=entry.get("likes", 0),
                    comments=entry.get("comments", 0),
                    shares=0,
                    views=entry.get("views", 0),
                    clicks=entry.get("clicks", 0),
                    engagement_rate=entry.get("engagement_rate", 0.0),
                    reach=entry.get("reach", 0),
                    impressions=entry.get("impressions", 0),
                    platform_specific=entry.get("platform_specific", {})
                )
                metrics.append(metric)
                
        except Exception as e:
            self.logger.error(f"❌ OnlyFans manual data import failed: {str(e)}")
        
        return metrics
    
    async def _collect_snapchat_metrics(self, config: Dict[str, Any]) -> List[EngagementMetrics]:
        """Collect metrics from Snapchat."""
        metrics = []
        
        try:
            if not all(k in config for k in ["client_id", "client_secret", "refresh_token"]):
                raise ValueError("Snapchat Marketing API credentials required: client_id, client_secret, refresh_token")
            
            import requests
            
            # Get access token
            token_url = "https://accounts.snapchat.com/login/oauth2/access_token"
            token_data = {
                "refresh_token": config["refresh_token"],
                "client_id": config["client_id"],
                "client_secret": config["client_secret"],
                "grant_type": "refresh_token"
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            access_token = token_response.json()["access_token"]
            
            # Get ad account
            accounts_url = "https://adsapi.snapchat.com/v1/me/adaccounts"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            accounts_response = requests.get(accounts_url, headers=headers)
            accounts_response.raise_for_status()
            
            ad_accounts = accounts_response.json()["adaccounts"]
            if not ad_accounts:
                raise ValueError("No Snapchat ad accounts found")
            
            ad_account_id = ad_accounts[0]["id"]
            
            # Get campaign stats
            stats_url = f"https://adsapi.snapchat.com/v1/adaccounts/{ad_account_id}/campaigns/stats"
            stats_params = {
                "granularity": "DAY",
                "fields": "impressions,swipes,view_completion,spend",
                "start_time": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
                "end_time": datetime.now(timezone.utc).isoformat()
            }
            
            stats_response = requests.get(stats_url, headers=headers, params=stats_params)
            stats_response.raise_for_status()
            
            for stat in stats_response.json().get("timeseries_stats", []):
                stats_data = stat["timeseries_stat"]["stats"]
                
                metric = EngagementMetrics(
                    platform="snapchat",
                    post_id=stat["id"],
                    timestamp=datetime.fromisoformat(stat["timeseries_stat"]["start_time"]),
                    likes=0,  # Not available in Marketing API
                    comments=0,  # Not available in Marketing API  
                    shares=stats_data.get("swipes", 0),
                    views=stats_data.get("impressions", 0),
                    clicks=stats_data.get("swipes", 0),
                    engagement_rate=self._calculate_engagement_rate(
                        stats_data.get("swipes", 0),
                        stats_data.get("impressions", 1)
                    ),
                    reach=stats_data.get("impressions", 0),  # Approximation
                    impressions=stats_data.get("impressions", 0),
                    platform_specific={
                        "swipes": stats_data.get("swipes", 0),
                        "view_completion": stats_data.get("view_completion", 0),
                        "spend": stats_data.get("spend", 0)
                    }
                )
                metrics.append(metric)
            
        except Exception as e:
            self.logger.error(f"❌ Snapchat metrics collection failed: {str(e)}")
        
        return metrics
    
    def _calculate_engagement_rate(self, total_engagement: int, reach: int) -> float:
        """Calculate engagement rate percentage."""
        if reach == 0:
            return 0.0
        return round((total_engagement / reach) * 100, 2)
    
    def _store_metric(self, metric: EngagementMetrics):
        """Store metric in database."""
        try:
            db_metric = MetricsDB(
                platform=metric.platform,
                post_id=metric.post_id,
                metric_type=MetricType.ENGAGEMENT.value,
                timestamp=metric.timestamp,
                data=asdict(metric)
            )
            
            self.session.add(db_metric)
            self.session.commit()
            
        except Exception as e:
            self.logger.error(f"❌ Failed to store metric: {str(e)}")
            self.session.rollback()
    
    def collect_engagement_metrics(
        self, 
        platforms: List[str], 
        timeframe: str = "24h"
    ) -> Dict[str, Any]:
        """Collect engagement metrics for specified platforms and timeframe."""
        self.logger.info(f"📊 Collecting engagement metrics for {platforms} ({timeframe})")
        
        try:
            # Calculate time range
            end_time = datetime.now(timezone.utc)
            if timeframe == "1h":
                start_time = end_time - timedelta(hours=1)
            elif timeframe == "24h":
                start_time = end_time - timedelta(days=1)
            elif timeframe == "7d":
                start_time = end_time - timedelta(days=7)
            elif timeframe == "30d":
                start_time = end_time - timedelta(days=30)
            else:
                start_time = end_time - timedelta(days=1)
            
            # Query database for metrics
            metrics = self.session.query(MetricsDB).filter(
                MetricsDB.platform.in_(platforms),
                MetricsDB.timestamp >= start_time,
                MetricsDB.timestamp <= end_time,
                MetricsDB.metric_type == MetricType.ENGAGEMENT.value
            ).all()
            
            # Process and aggregate metrics
            aggregated_metrics = self._aggregate_metrics(metrics, platforms)
            
            self.logger.info(f"✅ Collected metrics for {len(aggregated_metrics)} platforms")
            return aggregated_metrics
            
        except Exception as e:
            self.logger.error(f"❌ Metrics collection failed: {str(e)}")
            return {"error": str(e)}
    
    def _aggregate_metrics(self, metrics: List[MetricsDB], platforms: List[str]) -> Dict[str, Any]:
        """Aggregate metrics by platform."""
        aggregated = {}
        
        for platform in platforms:
            platform_metrics = [m for m in metrics if m.platform == platform]
            
            if not platform_metrics:
                aggregated[platform] = {"error": "No data available"}
                continue
            
            # Calculate aggregations
            total_likes = sum(m.data.get('likes', 0) for m in platform_metrics)
            total_comments = sum(m.data.get('comments', 0) for m in platform_metrics)
            total_shares = sum(m.data.get('shares', 0) for m in platform_metrics)
            total_views = sum(m.data.get('views', 0) for m in platform_metrics)
            total_clicks = sum(m.data.get('clicks', 0) for m in platform_metrics)
            
            avg_engagement_rate = np.mean([m.data.get('engagement_rate', 0) for m in platform_metrics])
            
            aggregated[platform] = {
                "total_posts": len(platform_metrics),
                "total_likes": total_likes,
                "total_comments": total_comments,
                "total_shares": total_shares,
                "total_views": total_views,
                "total_clicks": total_clicks,
                "total_engagement": total_likes + total_comments + total_shares,
                "average_engagement_rate": round(avg_engagement_rate, 2),
                "click_through_rate": round((total_clicks / total_views * 100) if total_views > 0 else 0, 2),
                "engagement_per_post": round((total_likes + total_comments + total_shares) / len(platform_metrics), 2)
            }
        
        return aggregated
    
    def create_utm_campaign(
        self,
        campaign_name: str,
        source: str,
        medium: str,
        content: Optional[str] = None,
        term: Optional[str] = None
    ) -> str:
        """Create UTM tracking parameters for campaigns."""
        utm_params = {
            'utm_source': source,
            'utm_medium': medium,
            'utm_campaign': campaign_name
        }
        
        if content:
            utm_params['utm_content'] = content
        if term:
            utm_params['utm_term'] = term
        
        utm_string = urlencode(utm_params)
        
        # Store campaign for tracking
        self.utm_campaigns[campaign_name] = {
            'params': utm_params,
            'created_at': datetime.now(timezone.utc),
            'utm_string': utm_string
        }
        
        self.logger.info(f"🔗 Created UTM campaign: {campaign_name}")
        return utm_string
    
    def track_conversion(
        self,
        platform: str,
        post_id: str,
        utm_campaign: str,
        conversion_value: float = 0.0,
        conversion_type: str = "purchase"
    ) -> bool:
        """Track a conversion event."""
        try:
            conversion_metric = ConversionMetrics(
                platform=platform,
                post_id=post_id,
                timestamp=datetime.now(timezone.utc),
                utm_source=platform,
                utm_medium="social",
                utm_campaign=utm_campaign,
                conversions=1,
                revenue=conversion_value
            )
            
            # Store conversion metric
            db_metric = MetricsDB(
                platform=platform,
                post_id=post_id,
                metric_type=MetricType.CONVERSION.value,
                timestamp=conversion_metric.timestamp,
                data=asdict(conversion_metric)
            )
            
            self.session.add(db_metric)
            self.session.commit()
            
            self.logger.info(f"💰 Tracked conversion: {conversion_type} ${conversion_value}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Conversion tracking failed: {str(e)}")
            self.session.rollback()
            return False
    
    def generate_analytics_dashboard(
        self,
        platforms: List[str],
        timeframe: str = "7d"
    ) -> Dict[str, Any]:
        """Generate comprehensive analytics dashboard."""
        self.logger.info("📈 Generating analytics dashboard")
        
        try:
            # Collect engagement metrics
            engagement_data = self.collect_engagement_metrics(platforms, timeframe)
            
            # Calculate KPIs
            kpis = self._calculate_kpis(engagement_data)
            
            # Generate trends
            trends = self._analyze_trends(platforms, timeframe)
            
            # Top performing content
            top_content = self._get_top_performing_content(platforms, timeframe)
            
            # Revenue metrics
            revenue_data = self._collect_revenue_metrics(platforms, timeframe)
            
            dashboard = {
                "summary": {
                    "timeframe": timeframe,
                    "platforms": platforms,
                    "generated_at": datetime.now(timezone.utc).isoformat()
                },
                "kpis": kpis,
                "engagement_metrics": engagement_data,
                "trends": trends,
                "top_content": top_content,
                "revenue_metrics": revenue_data,
                "recommendations": self._generate_recommendations(engagement_data, revenue_data)
            }
            
            self.logger.info("✅ Analytics dashboard generated successfully")
            return dashboard
            
        except Exception as e:
            self.logger.error(f"❌ Dashboard generation failed: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_kpis(self, engagement_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate key performance indicators."""
        total_engagement = 0
        total_views = 0
        total_clicks = 0
        platform_count = 0
        
        for platform, data in engagement_data.items():
            if "error" not in data:
                total_engagement += data.get("total_engagement", 0)
                total_views += data.get("total_views", 0)
                total_clicks += data.get("total_clicks", 0)
                platform_count += 1
        
        avg_engagement_rate = np.mean([
            data.get("average_engagement_rate", 0) 
            for data in engagement_data.values() 
            if "error" not in data
        ]) if platform_count > 0 else 0
        
        return {
            "total_engagement": total_engagement,
            "total_views": total_views,
            "total_clicks": total_clicks,
            "average_engagement_rate": round(avg_engagement_rate, 2),
            "overall_ctr": round((total_clicks / total_views * 100) if total_views > 0 else 0, 2),
            "active_platforms": platform_count
        }
    
    def _analyze_trends(self, platforms: List[str], timeframe: str) -> Dict[str, Any]:
        """Analyze performance trends."""
        trend_data = {}
        
        try:
            for platform in platforms:
                # Get historical data for trend analysis
                end_time = datetime.now(timezone.utc)
                start_time = end_time - timedelta(days=30)  # 30 days for trend analysis
                
                metrics = self.session.query(MetricsDB).filter(
                    MetricsDB.platform == platform,
                    MetricsDB.timestamp >= start_time,
                    MetricsDB.timestamp <= end_time,
                    MetricsDB.metric_type == MetricType.ENGAGEMENT.value
                ).order_by(MetricsDB.timestamp).all()
                
                if metrics:
                    # Calculate daily averages
                    daily_engagement = {}
                    for metric in metrics:
                        day = metric.timestamp.date()
                        if day not in daily_engagement:
                            daily_engagement[day] = []
                        daily_engagement[day].append(metric.data.get('engagement_rate', 0))
                    
                    # Calculate trend
                    daily_averages = [(day, sum(rates)/len(rates)) for day, rates in daily_engagement.items()]
                    daily_averages.sort()
                    
                    if len(daily_averages) >= 2:
                        recent_avg = sum(rate for _, rate in daily_averages[-7:]) / min(7, len(daily_averages))
                        early_avg = sum(rate for _, rate in daily_averages[:7]) / min(7, len(daily_averages))
                        trend_direction = "increasing" if recent_avg > early_avg else "decreasing"
                        trend_percentage = ((recent_avg - early_avg) / early_avg * 100) if early_avg > 0 else 0
                    else:
                        trend_direction = "stable"
                        trend_percentage = 0
                        recent_avg = 0
                    
                    trend_data[platform] = {
                        "direction": trend_direction,
                        "percentage_change": round(trend_percentage, 2),
                        "recent_average": round(recent_avg, 2)
                    }
        
        except Exception as e:
            self.logger.error(f"❌ Trend analysis failed: {str(e)}")
        
        return trend_data
    
    def _get_top_performing_content(self, platforms: List[str], timeframe: str) -> List[Dict[str, Any]]:
        """Get top performing content across platforms."""
        try:
            # Calculate time range
            end_time = datetime.now(timezone.utc)
            if timeframe == "7d":
                start_time = end_time - timedelta(days=7)
            elif timeframe == "30d":
                start_time = end_time - timedelta(days=30)
            else:
                start_time = end_time - timedelta(days=7)
            
            # Get metrics for timeframe
            metrics = self.session.query(MetricsDB).filter(
                MetricsDB.platform.in_(platforms),
                MetricsDB.timestamp >= start_time,
                MetricsDB.timestamp <= end_time,
                MetricsDB.metric_type == MetricType.ENGAGEMENT.value
            ).all()
            
            # Sort by engagement rate and get top performers
            top_content = []
            for metric in metrics:
                engagement_rate = metric.data.get('engagement_rate', 0)
                if engagement_rate > 0:
                    top_content.append({
                        "platform": metric.platform,
                        "post_id": metric.post_id,
                        "engagement_rate": engagement_rate,
                        "likes": metric.data.get('likes', 0),
                        "comments": metric.data.get('comments', 0),
                        "shares": metric.data.get('shares', 0),
                        "timestamp": metric.timestamp.isoformat()
                    })
            
            # Sort by engagement rate and return top 10
            top_content.sort(key=lambda x: x['engagement_rate'], reverse=True)
            return top_content[:10]
            
        except Exception as e:
            self.logger.error(f"❌ Top content analysis failed: {str(e)}")
            return []
    
    def _collect_revenue_metrics(self, platforms: List[str], timeframe: str) -> Dict[str, Any]:
        """Collect revenue and conversion metrics."""
        # Query conversion metrics from database
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(days=7 if timeframe == "7d" else 1)
        
        conversion_metrics = self.session.query(MetricsDB).filter(
            MetricsDB.platform.in_(platforms),
            MetricsDB.timestamp >= start_time,
            MetricsDB.timestamp <= end_time,
            MetricsDB.metric_type == MetricType.CONVERSION.value
        ).all()
        
        total_revenue = sum(m.data.get('revenue', 0) for m in conversion_metrics)
        total_conversions = sum(m.data.get('conversions', 0) for m in conversion_metrics)
        
        return {
            "total_revenue": total_revenue,
            "total_conversions": total_conversions,
            "average_order_value": round(total_revenue / total_conversions, 2) if total_conversions > 0 else 0,
            "revenue_by_platform": self._revenue_by_platform(conversion_metrics)
        }
    
    def _revenue_by_platform(self, metrics: List[MetricsDB]) -> Dict[str, float]:
        """Calculate revenue by platform."""
        revenue_by_platform = {}
        
        for metric in metrics:
            platform = metric.platform
            revenue = metric.data.get('revenue', 0)
            
            if platform not in revenue_by_platform:
                revenue_by_platform[platform] = 0
            revenue_by_platform[platform] += revenue
        
        return revenue_by_platform
    
    def _generate_recommendations(
        self,
        engagement_data: Dict[str, Any],
        revenue_data: Dict[str, Any]
    ) -> List[str]:
        """Generate actionable recommendations based on data."""
        recommendations = []
        
        # Engagement-based recommendations
        best_platform = max(
            engagement_data.items(),
            key=lambda x: x[1].get("average_engagement_rate", 0) if "error" not in x[1] else 0
        )[0] if engagement_data else None
        
        if best_platform:
            recommendations.append(f"Focus more content on {best_platform} - highest engagement rate")
        
        # Revenue-based recommendations
        if revenue_data.get("total_revenue", 0) > 0:
            top_revenue_platform = max(
                revenue_data.get("revenue_by_platform", {}).items(),
                key=lambda x: x[1],
                default=(None, 0)
            )[0]
            
            if top_revenue_platform:
                recommendations.append(f"Increase monetization efforts on {top_revenue_platform}")
        
        # General recommendations
        recommendations.extend([
            "Post during peak engagement hours (18:00-21:00)",
            "Use more interactive content formats (polls, Q&A)",
            "Implement cross-platform promotion strategy"
        ])
        
        return recommendations
    
    def export_metrics(
        self,
        platforms: List[str],
        timeframe: str = "30d",
        format: str = "csv"
    ) -> str:
        """Export metrics data to file."""
        try:
            # Collect metrics data
            dashboard_data = self.generate_analytics_dashboard(platforms, timeframe)
            
            if format.lower() == "csv":
                # Convert to DataFrame and export as CSV
                df_data = []
                for platform, metrics in dashboard_data.get("engagement_metrics", {}).items():
                    if "error" not in metrics:
                        df_data.append({
                            "platform": platform,
                            **metrics
                        })
                
                df = pd.DataFrame(df_data)
                filename = f"metrics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                df.to_csv(filename, index=False)
                
                self.logger.info(f"📁 Exported metrics to {filename}")
                return filename
            
            elif format.lower() == "json":
                filename = f"metrics_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                with open(filename, 'w') as f:
                    json.dump(dashboard_data, f, indent=2, default=str)
                
                self.logger.info(f"📁 Exported metrics to {filename}")
                return filename
            
        except Exception as e:
            self.logger.error(f"❌ Export failed: {str(e)}")
            return ""
    
    def __repr__(self) -> str:
        platform_count = len(self.platform_configs)
        collection_status = "🟢" if self.is_collecting else "🔴"
        return f"MetricsAgent(Platforms: {platform_count}, Collection: {collection_status}) ☠️" 