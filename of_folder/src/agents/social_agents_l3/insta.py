"""
Instagram Agent - Specialized agent for Instagram platform management.

Handles:
- Feed posts, Reels, Stories, and IGTV content
- Hashtag optimization and trend integration
- Story highlights and archive management
- Instagram Shopping and product tags
- Influencer collaboration features
- Algorithm optimization strategies
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timezone, timedelta
import logging
import asyncio
import json
from pathlib import Path

from instagrapi import Client
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


class ContentFormat(str, Enum):
    """Instagram content formats."""
    FEED_POST = "feed_post"
    REEL = "reel"
    STORY = "story"
    IGTV = "igtv"
    CAROUSEL = "carousel"
    LIVE = "live"


class AspectRatio(str, Enum):
    """Instagram aspect ratios."""
    SQUARE = "1:1"          # Feed posts
    PORTRAIT = "4:5"        # Feed posts
    VERTICAL = "9:16"       # Stories, Reels
    LANDSCAPE = "16:9"      # IGTV, some feed posts


class HashtagStrategy(str, Enum):
    """Hashtag strategies."""
    TRENDING = "trending"
    NICHE = "niche"
    MIXED = "mixed"
    BRANDED = "branded"
    COMMUNITY = "community"


@dataclass
class InstagramContent:
    """Instagram content structure."""
    content_id: Optional[str]
    caption: str
    content_format: ContentFormat
    media_urls: List[str]
    hashtags: List[str]
    mentions: List[str] = None
    location: Optional[str] = None
    product_tags: List[str] = None
    scheduled_time: Optional[datetime] = None
    posted_at: Optional[datetime] = None
    story_highlights: List[str] = None


@dataclass
class InstagramMetrics:
    """Instagram engagement metrics."""
    content_id: str
    content_format: ContentFormat
    likes: int
    comments: int
    shares: int
    saves: int
    reach: int
    impressions: int
    profile_visits: int
    website_clicks: int
    engagement_rate: float
    hashtag_performance: Dict[str, int] = None


@dataclass
class HashtagAnalysis:
    """Hashtag performance analysis."""
    hashtag: str
    post_count: int
    engagement_average: float
    difficulty_score: float  # How hard to rank
    trend_status: str
    related_hashtags: List[str]


class InstagramAgent:
    """
    Instagram Agent for comprehensive Instagram platform management.
    
    Features:
    - Multi-format content publishing (Feed, Reels, Stories, IGTV)
    - Advanced hashtag optimization and trend analysis
    - Story highlights and archive management
    - Instagram Shopping integration
    - Algorithm optimization strategies
    - Real-time engagement monitoring
    
    Rick's signature: Instagram domination, visual storytelling ☠️
    """
    
    def __init__(
        self,
        instagram_config: Optional[Dict[str, Any]] = None,
        auto_hashtags: bool = True,
        hashtag_strategy: HashtagStrategy = HashtagStrategy.MIXED,
        max_hashtags: int = 30,
        story_highlights: bool = True,
        log_level: str = "INFO"
    ):
        """Initialize Instagram Agent."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("📸 InstagramAgent initializing - Visual empire mode ☠️")
        
        # Instagram API configuration
        self.instagram_config = instagram_config or {}
        
        # Initialize Instagram client
        self.client = None
        if self.instagram_config:
            self._initialize_instagram_client()
        
        # MCP tool wrapper
        self.mcp_wrapper = MCPToolWrapper("instagram")
        
        # Configuration
        self.auto_hashtags = auto_hashtags
        self.hashtag_strategy = hashtag_strategy
        self.max_hashtags = max_hashtags
        self.story_highlights = story_highlights
        
        # Content tracking
        self.posted_content = {}
        self.scheduled_content = []
        self.story_archive = {}
        self.highlights = {}
        
        # Hashtag intelligence
        self.hashtag_database = {}
        self.trending_hashtags = []
        self.branded_hashtags = []
        
        # Algorithm optimization
        self.posting_schedule = self._initialize_optimal_schedule()
        self.engagement_windows = []
        
        # Instagram Shopping
        self.product_catalog = {}
        
        self.logger.info("✅ InstagramAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.Instagram")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ INSTA - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _initialize_instagram_client(self):
        """Initialize Instagram API client."""
        try:
            self.client = Client()
            
            # Login using credentials
            username = self.instagram_config.get("username")
            password = self.instagram_config.get("password")
            
            if username and password:
                self.client.login(username, password)
                
                # Get account info
                user_info = self.client.user_info_by_username(username)
                self.logger.info(f"🔐 Authenticated as @{username}")
                self.logger.info(f"👥 Followers: {user_info.follower_count}")
            
        except Exception as e:
            self.logger.error(f"❌ Instagram authentication failed: {str(e)}")
            self.client = None
    
    def _initialize_optimal_schedule(self) -> Dict[str, List[int]]:
        """Initialize optimal posting schedule based on Instagram best practices."""
        return {
            "monday": [11, 13, 17],
            "tuesday": [11, 13, 17],
            "wednesday": [11, 13, 17],
            "thursday": [11, 13, 17],
            "friday": [11, 13, 17],
            "saturday": [10, 14, 16],
            "sunday": [10, 14, 16]
        }
    
    def publish_content(
        self,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Publish content to Instagram in various formats.
        
        Args:
            content: Content data from ContentFactory
            metadata: Additional metadata (format, media_urls, etc.)
            
        Returns:
            Publication result with content ID and metrics
        """
        self.logger.info("📤 Publishing content to Instagram")
        
        try:
            # Extract content details
            caption = content.get("content", "")
            content_format = ContentFormat(metadata.get("content_format", ContentFormat.FEED_POST))
            media_urls = metadata.get("media_urls", [])
            
            if not media_urls:
                return {"success": False, "error": "Instagram requires media content"}
            
            # Optimize caption for Instagram
            optimized_caption = self._optimize_caption(caption, metadata)
            
            # Generate hashtags
            hashtags = self._generate_hashtags(optimized_caption, metadata)
            
            # Add hashtags to caption
            final_caption = self._finalize_caption(optimized_caption, hashtags)
            
            # Publish based on content format
            if content_format == ContentFormat.FEED_POST:
                result = self._publish_feed_post(final_caption, media_urls, metadata)
            elif content_format == ContentFormat.REEL:
                result = self._publish_reel(final_caption, media_urls[0], metadata)
            elif content_format == ContentFormat.STORY:
                result = self._publish_story(media_urls[0], metadata)
            elif content_format == ContentFormat.CAROUSEL:
                result = self._publish_carousel(final_caption, media_urls, metadata)
            elif content_format == ContentFormat.IGTV:
                result = self._publish_igtv(final_caption, media_urls[0], metadata)
            else:
                return {"success": False, "error": f"Unsupported content format: {content_format}"}
            
            if result["success"]:
                content_id = result["content_id"]
                
                # Store content data
                instagram_content = InstagramContent(
                    content_id=content_id,
                    caption=final_caption,
                    content_format=content_format,
                    media_urls=media_urls,
                    hashtags=hashtags,
                    mentions=self._extract_mentions(final_caption),
                    location=metadata.get("location"),
                    product_tags=metadata.get("product_tags", []),
                    posted_at=datetime.now(timezone.utc)
                )
                
                self.posted_content[content_id] = instagram_content
                
                # Update hashtag performance tracking
                self._update_hashtag_tracking(hashtags, content_id)
                
                self.logger.info(f"✅ Instagram content published: {content_id}")
                
                return {
                    "success": True,
                    "content_id": content_id,
                    "content_format": content_format.value,
                    "caption": final_caption,
                    "hashtags": hashtags,
                    "media_count": len(media_urls),
                    "url": result.get("url", ""),
                    "estimated_reach": self._estimate_reach(hashtags)
                }
            else:
                return result
                
        except Exception as e:
            self.logger.error(f"❌ Instagram publication failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _optimize_caption(self, caption: str, metadata: Optional[Dict[str, Any]]) -> str:
        """Optimize caption for Instagram."""
        
        # Ensure proper length (Instagram allows up to 2200 characters)
        if len(caption) > 2200:
            caption = caption[:2197] + "..."
        
        # Add line breaks for readability
        if len(caption) > 100 and '\n' not in caption:
            sentences = caption.split('. ')
            if len(sentences) > 2:
                mid_point = len(sentences) // 2
                caption = '. '.join(sentences[:mid_point]) + '.\n\n' + '. '.join(sentences[mid_point:])
        
        # Add call-to-action if specified
        cta = metadata.get("cta") if metadata else None
        if cta:
            caption += f"\n\n{cta}"
        
        # Add engagement hooks
        if not any(hook in caption for hook in ["?", "What do you think", "Comment below"]):
            caption += "\n\n💭 What do you think? Let me know in the comments!"
        
        return caption
    
    def _generate_hashtags(self, caption: str, metadata: Optional[Dict[str, Any]]) -> List[str]:
        """Generate optimized hashtags based on strategy."""
        hashtags = []
        
        if not self.auto_hashtags:
            return hashtags
        
        # Extract existing hashtags from caption
        existing_hashtags = self._extract_hashtags(caption)
        
        if self.hashtag_strategy == HashtagStrategy.TRENDING:
            hashtags = self._get_trending_hashtags()
        elif self.hashtag_strategy == HashtagStrategy.NICHE:
            hashtags = self._get_niche_hashtags(caption, metadata)
        elif self.hashtag_strategy == HashtagStrategy.BRANDED:
            hashtags = self._get_branded_hashtags(metadata)
        elif self.hashtag_strategy == HashtagStrategy.COMMUNITY:
            hashtags = self._get_community_hashtags(caption, metadata)
        else:  # MIXED strategy
            hashtags = self._get_mixed_hashtags(caption, metadata)
        
        # Combine with existing hashtags and remove duplicates
        all_hashtags = list(set(existing_hashtags + hashtags))
        
        # Limit to max hashtags
        return all_hashtags[:self.max_hashtags]
    
    def _get_trending_hashtags(self) -> List[str]:
        """Get currently trending hashtags."""
        # In real implementation, would fetch from Instagram API or trending services
        return [
            "#trending", "#viral", "#explore", "#reels", "#instagram",
            "#love", "#instagood", "#photooftheday", "#beautiful", "#happy"
        ]
    
    def _get_niche_hashtags(self, caption: str, metadata: Optional[Dict[str, Any]]) -> List[str]:
        """Get niche-specific hashtags based on content."""
        niche_keywords = {
            "fitness": ["#fitness", "#workout", "#gym", "#health", "#fitlife", "#motivation"],
            "food": ["#food", "#foodie", "#delicious", "#yummy", "#cooking", "#recipe"],
            "travel": ["#travel", "#wanderlust", "#adventure", "#explore", "#vacation", "#trip"],
            "fashion": ["#fashion", "#style", "#outfit", "#ootd", "#fashionista", "#styleinspo"],
            "business": ["#business", "#entrepreneur", "#success", "#motivation", "#hustle", "#goals"]
        }
        
        caption_lower = caption.lower()
        niche_hashtags = []
        
        for niche, hashtags in niche_keywords.items():
            if niche in caption_lower:
                niche_hashtags.extend(hashtags)
                break
        
        return niche_hashtags[:15]
    
    def _get_branded_hashtags(self, metadata: Optional[Dict[str, Any]]) -> List[str]:
        """Get brand-specific hashtags."""
        if not metadata or not metadata.get("brand_hashtags"):
            return ["#brand", "#mybrand", "#brandedcontent"]
        
        return metadata["brand_hashtags"]
    
    def _get_community_hashtags(self, caption: str, metadata: Optional[Dict[str, Any]]) -> List[str]:
        """Get community-building hashtags."""
        return [
            "#community", "#engagement", "#connect", "#share", "#together",
            "#support", "#love", "#friendship", "#family", "#unity"
        ]
    
    def _get_mixed_hashtags(self, caption: str, metadata: Optional[Dict[str, Any]]) -> List[str]:
        """Get a mix of different hashtag types."""
        hashtags = []
        
        # 40% niche hashtags
        niche_hashtags = self._get_niche_hashtags(caption, metadata)
        hashtags.extend(niche_hashtags[:12])
        
        # 30% trending hashtags
        trending_hashtags = self._get_trending_hashtags()
        hashtags.extend(trending_hashtags[:9])
        
        # 20% community hashtags
        community_hashtags = self._get_community_hashtags(caption, metadata)
        hashtags.extend(community_hashtags[:6])
        
        # 10% branded hashtags
        branded_hashtags = self._get_branded_hashtags(metadata)
        hashtags.extend(branded_hashtags[:3])
        
        return list(set(hashtags))
    
    def _finalize_caption(self, caption: str, hashtags: List[str]) -> str:
        """Finalize caption with hashtags."""
        if not hashtags:
            return caption
        
        # Add hashtags at the end
        hashtag_text = " ".join(hashtags)
        
        # Add spacing
        final_caption = f"{caption}\n\n{hashtag_text}"
        
        # Ensure we don't exceed character limit
        if len(final_caption) > 2200:
            # Reduce hashtags
            while len(final_caption) > 2200 and hashtags:
                hashtags.pop()
                hashtag_text = " ".join(hashtags)
                final_caption = f"{caption}\n\n{hashtag_text}"
        
        return final_caption
    
    def _publish_feed_post(
        self,
        caption: str,
        media_urls: List[str],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a feed post."""
        try:
            if not self.client:
                raise ValueError("Instagram client not configured. Use configure_instagram() first.")
            
            # Upload single image or multiple images
            if len(media_urls) == 1:
                # Single image post
                media_path = self._download_media(media_urls[0])
                result = self.client.photo_upload(
                    path=media_path,
                    caption=caption,
                    location=metadata.get("location")
                )
            else:
                # Carousel post
                media_paths = [self._download_media(url) for url in media_urls]
                result = self.client.album_upload(
                    paths=media_paths,
                    caption=caption,
                    location=metadata.get("location")
                )
            
            return {
                "success": True,
                "content_id": result.id,
                "url": f"https://instagram.com/p/{result.code}"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _publish_reel(
        self,
        caption: str,
        video_url: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a Reel."""
        try:
            if not self.client:
                raise ValueError("Instagram client not configured for Reels")
            
            video_path = self._download_media(video_url)
            thumbnail_path = metadata.get("thumbnail_path")
            
            result = self.client.clip_upload(
                path=video_path,
                caption=caption,
                thumbnail=thumbnail_path
            )
            
            return {
                "success": True,
                "content_id": result.id,
                "url": f"https://instagram.com/reel/{result.code}"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _publish_story(
        self,
        media_url: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a Story."""
        try:
            if not self.client:
                raise ValueError("Instagram client not configured for Stories")
            
            media_path = self._download_media(media_url)
            
            # Determine if image or video
            if media_url.lower().endswith(('.mp4', '.mov', '.avi')):
                result = self.client.video_upload_to_story(
                    path=media_path,
                    caption=metadata.get("story_text", "")
                )
            else:
                result = self.client.photo_upload_to_story(
                    path=media_path,
                    caption=metadata.get("story_text", "")
                )
            
            # Add to highlights if specified
            if self.story_highlights and metadata.get("add_to_highlights"):
                self._add_to_highlights(result.id, metadata.get("highlight_name", "Recent"))
            
            return {
                "success": True,
                "content_id": result.id,
                "url": f"https://instagram.com/stories/{self.client.username}/{result.id}"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _publish_carousel(
        self,
        caption: str,
        media_urls: List[str],
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a carousel post."""
        return self._publish_feed_post(caption, media_urls, metadata)
    
    def _publish_igtv(
        self,
        caption: str,
        video_url: str,
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish an IGTV video."""
        try:
            if not self.client:
                raise ValueError("Instagram client not configured for IGTV")
            
            video_path = self._download_media(video_url)
            thumbnail_path = metadata.get("thumbnail_path")
            
            result = self.client.igtv_upload(
                path=video_path,
                title=metadata.get("title", caption[:100]),
                caption=caption,
                thumbnail=thumbnail_path
            )
            
            return {
                "success": True,
                "content_id": result.id,
                "url": f"https://instagram.com/tv/{result.code}"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _download_media(self, media_url: str) -> str:
        """Download media file from URL."""
        import requests
        import tempfile
        import os
        from urllib.parse import urlparse
        
        try:
            # Download media file
            response = requests.get(media_url)
            response.raise_for_status()
            
            # Determine file extension
            parsed_url = urlparse(media_url)
            file_ext = os.path.splitext(parsed_url.path)[1] or '.jpg'
            
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                temp_file.write(response.content)
                return temp_file.name
                
        except Exception as e:
            self.logger.error(f"❌ Media download failed: {str(e)}")
            raise
    
    def _extract_hashtags(self, text: str) -> List[str]:
        """Extract hashtags from text."""
        import re
        return re.findall(r'#\w+', text)
    
    def _extract_mentions(self, text: str) -> List[str]:
        """Extract mentions from text."""
        import re
        return re.findall(r'@\w+', text)
    
    def _update_hashtag_tracking(self, hashtags: List[str], content_id: str):
        """Update hashtag performance tracking."""
        for hashtag in hashtags:
            if hashtag not in self.hashtag_database:
                self.hashtag_database[hashtag] = {
                    "usage_count": 0,
                    "total_engagement": 0,
                    "posts": []
                }
            
            self.hashtag_database[hashtag]["usage_count"] += 1
            self.hashtag_database[hashtag]["posts"].append(content_id)
    
    def _estimate_reach(self, hashtags: List[str]) -> int:
        """Estimate potential reach based on hashtags."""
        # Simple estimation - in reality would be more sophisticated
        base_reach = 100
        hashtag_reach = len(hashtags) * 50
        return base_reach + hashtag_reach
    
    def _add_to_highlights(self, story_id: str, highlight_name: str):
        """Add story to highlights."""
        try:
            if highlight_name not in self.highlights:
                self.highlights[highlight_name] = []
            
            self.highlights[highlight_name].append(story_id)
            self.logger.info(f"📎 Added story to highlight: {highlight_name}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to add to highlights: {str(e)}")
    
    def get_content_metrics(self, content_id: str) -> Dict[str, Any]:
        """Get metrics for specific content."""
        try:
            if not self.client:
                raise ValueError("Instagram client not configured for metrics retrieval")
            
            media = self.client.media_info(content_id)
            
            # Calculate engagement rate
            total_engagement = media.like_count + media.comment_count
            engagement_rate = (total_engagement / media.view_count * 100) if media.view_count > 0 else 0
            
            return {
                "content_id": content_id,
                "likes": media.like_count,
                "comments": media.comment_count,
                "shares": getattr(media, 'share_count', 0),
                "saves": getattr(media, 'save_count', 0),
                "reach": getattr(media, 'reach', 0),
                "impressions": getattr(media, 'impression_count', 0),
                "engagement_rate": round(engagement_rate, 2),
                "created_at": media.taken_at.isoformat() if media.taken_at else None
            }
            
        except Exception as e:
            self.logger.error(f"❌ Failed to get metrics for {content_id}: {str(e)}")
            return {"error": str(e)}
    
    def analyze_hashtag_performance(self) -> Dict[str, Any]:
        """Analyze hashtag performance across all posts."""
        analysis = {}
        
        for hashtag, data in self.hashtag_database.items():
            if data["usage_count"] > 0:
                avg_engagement = data["total_engagement"] / data["usage_count"]
                
                analysis[hashtag] = {
                    "usage_count": data["usage_count"],
                    "average_engagement": round(avg_engagement, 2),
                    "total_posts": len(data["posts"]),
                    "performance_score": self._calculate_hashtag_score(data)
                }
        
        # Sort by performance score
        sorted_analysis = dict(sorted(analysis.items(), key=lambda x: x[1]["performance_score"], reverse=True))
        
        return {
            "top_performing_hashtags": list(sorted_analysis.keys())[:10],
            "detailed_analysis": sorted_analysis,
            "recommendations": self._generate_hashtag_recommendations(sorted_analysis)
        }
    
    def _calculate_hashtag_score(self, hashtag_data: Dict[str, Any]) -> float:
        """Calculate performance score for a hashtag."""
        usage_count = hashtag_data["usage_count"]
        avg_engagement = hashtag_data["total_engagement"] / usage_count if usage_count > 0 else 0
        
        # Simple scoring formula
        return (avg_engagement * 0.7) + (usage_count * 0.3)
    
    def _generate_hashtag_recommendations(self, analysis: Dict[str, Any]) -> List[str]:
        """Generate hashtag recommendations based on performance."""
        recommendations = []
        
        # Get top performers
        top_hashtags = list(analysis.keys())[:5]
        recommendations.append(f"Continue using top performers: {', '.join(top_hashtags)}")
        
        # Identify underperformers
        underperformers = [
            hashtag for hashtag, data in analysis.items() 
            if data["performance_score"] < 50
        ]
        
        if underperformers:
            recommendations.append(f"Consider replacing: {', '.join(underperformers[:3])}")
        
        recommendations.extend([
            "Mix trending and niche hashtags for best reach",
            "Test new hashtags regularly to find hidden gems",
            "Use all 30 hashtags for maximum visibility"
        ])
        
        return recommendations
    
    def schedule_content(
        self,
        content: InstagramContent,
        scheduled_time: datetime
    ) -> Dict[str, Any]:
        """Schedule Instagram content for future posting."""
        try:
            scheduled_item = {
                "content": content,
                "scheduled_time": scheduled_time,
                "status": "scheduled",
                "created_at": datetime.now(timezone.utc)
            }
            
            self.scheduled_content.append(scheduled_item)
            
            self.logger.info(f"📅 Instagram content scheduled for {scheduled_time}")
            return {
                "success": True,
                "scheduled_time": scheduled_time.isoformat(),
                "content_format": content.content_format.value,
                "caption_preview": content.caption[:50] + "..." if len(content.caption) > 50 else content.caption
            }
            
        except Exception as e:
            self.logger.error(f"❌ Instagram content scheduling failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_scheduled_content(self) -> List[Dict[str, Any]]:
        """Process any scheduled content that's ready to post."""
        results = []
        current_time = datetime.now(timezone.utc)
        
        for scheduled_item in self.scheduled_content:
            if (scheduled_item["status"] == "scheduled" and 
                scheduled_item["scheduled_time"] <= current_time):
                
                content = scheduled_item["content"]
                
                # Publish the content
                result = self.publish_content(
                    content={"content": content.caption},
                    metadata={
                        "content_format": content.content_format.value,
                        "media_urls": content.media_urls,
                        "location": content.location,
                        "product_tags": content.product_tags
                    }
                )
                
                # Update status
                scheduled_item["status"] = "published" if result["success"] else "failed"
                scheduled_item["published_at"] = current_time
                
                results.append({
                    "content_format": content.content_format.value,
                    "caption_preview": content.caption[:50] + "...",
                    "result": result
                })
        
        # Remove published/failed content
        self.scheduled_content = [
            item for item in self.scheduled_content 
            if item["status"] == "scheduled"
        ]
        
        return results
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """Get comprehensive Instagram analytics summary."""
        try:
            total_posts = len(self.posted_content)
            
            # Calculate averages (would get real data from API)
            avg_likes = 125
            avg_comments = 15
            avg_engagement_rate = 8.5
            
            content_format_breakdown = {}
            for content in self.posted_content.values():
                format_name = content.content_format.value
                if format_name not in content_format_breakdown:
                    content_format_breakdown[format_name] = 0
                content_format_breakdown[format_name] += 1
            
            return {
                "overview": {
                    "total_posts": total_posts,
                    "average_likes": avg_likes,
                    "average_comments": avg_comments,
                    "average_engagement_rate": avg_engagement_rate,
                    "total_hashtags_used": len(self.hashtag_database)
                },
                "content_breakdown": content_format_breakdown,
                "hashtag_performance": self.analyze_hashtag_performance(),
                "story_highlights": {
                    "total_highlights": len(self.highlights),
                    "stories_archived": sum(len(stories) for stories in self.highlights.values())
                },
                "recommendations": [
                    "Post during peak engagement hours (6-9 PM)",
                    "Use a mix of Reels and feed posts for better reach",
                    "Engage with comments within the first hour",
                    "Create Story highlights for evergreen content"
                ]
            }
            
        except Exception as e:
            self.logger.error(f"❌ Analytics summary failed: {str(e)}")
            return {"error": str(e)}
    
    def __repr__(self) -> str:
        api_status = "🟢" if self.client else "🔴"
        content_count = len(self.posted_content)
        hashtag_count = len(self.hashtag_database)
        return f"InstagramAgent(API: {api_status}, Content: {content_count}, Hashtags: {hashtag_count}) ☠️" 