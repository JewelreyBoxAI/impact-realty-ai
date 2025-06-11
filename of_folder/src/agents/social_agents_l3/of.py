"""
OnlyFans Agent - Specialized agent for OnlyFans platform management.

Handles:
- Pay-wall content publishing
- Subscriber notifications and engagement
- Revenue tracking and analytics
- Content compliance and age verification
- Tier-based content distribution
"""

from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timezone
import logging
import json
import asyncio
from decimal import Decimal

from pydantic import BaseModel, Field
import requests

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


class ContentTier(str, Enum):
    """Content access tiers for OnlyFans."""
    FREE = "free"
    SUBSCRIBER = "subscriber"
    PREMIUM = "premium"
    PPV = "pay_per_view"  # Pay-per-view
    CUSTOM = "custom"


class NotificationType(str, Enum):
    """Types of notifications to subscribers."""
    NEW_POST = "new_post"
    LIVE_STREAM = "live_stream"
    PROMOTION = "promotion"
    PERSONAL_MESSAGE = "personal_message"
    TIP_REQUEST = "tip_request"


@dataclass
class OFContent:
    """OnlyFans content structure."""
    content_id: Optional[str]
    title: str
    description: str
    content_type: str  # photo, video, text, live
    tier: ContentTier
    price: Optional[Decimal] = None
    media_urls: List[str] = None
    tags: List[str] = None
    is_archived: bool = False
    created_at: Optional[datetime] = None


@dataclass 
class Subscriber:
    """Subscriber information."""
    user_id: str
    username: str
    subscription_tier: str
    subscription_start: datetime
    total_spent: Decimal
    last_interaction: datetime
    is_active: bool = True
    preferences: Dict[str, Any] = None


class OFAgent:
    """
    OnlyFans Agent for managing pay-wall content and subscriber engagement.
    
    Features:
    - Content publishing with tier restrictions
    - Subscriber management and notifications
    - Revenue tracking and analytics
    - Compliance monitoring
    - Custom content requests handling
    
    Rick's signature: Premium content, premium results ☠️
    """
    
    def __init__(
        self,
        api_config: Optional[Dict[str, Any]] = None,
        compliance_level: str = "strict",
        auto_notifications: bool = True,
        brand_config: Optional[Dict[str, Any]] = None,
        watermark_style: str = "professional",
        log_level: str = "INFO"
    ):
        """Initialize OnlyFans agent."""
        
        # Setup logging with premium styling
        self.logger = self._setup_logging(log_level)
        self.logger.info("✨ OFAgent initializing - Premium content mastery ☠️")
        
        # Configuration management
        self.api_config = api_config or {}
        self.brand_config = brand_config or self._default_brand_config()
        self.watermark_style = watermark_style
        
        # MCP tool wrapper for API calls
        self.mcp_wrapper = MCPToolWrapper("onlyfans")
        
        # Professional compliance settings
        self.compliance_level = compliance_level
        self.auto_notifications = auto_notifications
        
        # Subscriber management
        self.subscribers = {}
        self.subscriber_tiers = {}
        
        # Content management
        self.content_library = {}
        self.scheduled_content = []
        
        # Revenue tracking
        self.revenue_metrics = {
            "subscriptions": Decimal("0.00"),
            "tips": Decimal("0.00"),
            "ppv_sales": Decimal("0.00"),
            "custom_content": Decimal("0.00")
        }
        
        # Professional compliance rules
        self.compliance_rules = self._initialize_compliance_rules()
        
        # Content quality metrics
        self.content_performance = {}
        self.subscriber_engagement = {}
        
        self.logger.info("✨ OFAgent initialized - Ready for premium content excellence ✨")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup professional logging with premium styling."""
        logger = logging.getLogger(f"{__name__}.OF")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ✨ OF PREMIUM - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _default_brand_config(self) -> Dict[str, Any]:
        """Default professional brand configuration."""
        return {
            "brand_name": "Premium Content",
            "watermark_text": "© EXCLUSIVE",
            "watermark_position": "bottom_right",
            "watermark_opacity": 0.7,
            "brand_colors": {
                "primary": "#FF69B4",    # Hot pink
                "secondary": "#9932CC",  # Dark orchid
                "accent": "#FFD700"      # Gold
            },
            "font_style": "professional",
            "logo_url": None
        }
    
    def _initialize_compliance_rules(self) -> Dict[str, Any]:
        """Initialize OnlyFans compliance rules."""
        return {
            "age_verification": {
                "required": True,
                "keywords": ["18+", "adult", "mature"],
                "verification_text": "18+ Adult Content - Age Verification Required"
            },
            "content_restrictions": {
                "prohibited_activities": ["violence", "illegal_substances", "non_consensual"],
                "required_disclaimers": ["All content is consensual", "Adults only"],
                "watermark_required": True
            },
            "financial_compliance": {
                "tax_reporting": True,
                "transaction_logging": True,
                "payment_verification": True
            },
            "privacy_protection": {
                "no_real_names": True,
                "location_privacy": True,
                "data_encryption": True
            }
        }
    
    def publish_content(
        self,
        content: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Publish content to OnlyFans with appropriate tier restrictions.
        
        Args:
            content: Content data from ContentGenAgent
            metadata: Additional metadata including tier, pricing, etc.
            
        Returns:
            Publication result with content ID and metrics
        """
        self.logger.info("🎨 Publishing premium content - Professional excellence ✨")
        
        try:
            # Extract content details
            content_text = content.get("content", "")
            content_type = content.get("content_type", "text")
            
            # Determine content tier and pricing
            tier = ContentTier(metadata.get("tier", ContentTier.SUBSCRIBER))
            price = metadata.get("price")
            
            # Create OF content object
            of_content = OFContent(
                content_id=None,  # Will be set after upload
                title=metadata.get("title", "New Content"),
                description=content_text,
                content_type=content_type,
                tier=tier,
                price=Decimal(str(price)) if price else None,
                media_urls=metadata.get("media_urls", []),
                tags=metadata.get("tags", []),
                created_at=datetime.now(timezone.utc)
            )
            
            # Compliance check
            compliance_result = self._check_content_compliance(of_content)
            if not compliance_result["is_compliant"]:
                self.logger.error(f"❌ Content failed compliance: {compliance_result['issues']}")
                return {
                    "success": False,
                    "error": "Content compliance failed",
                    "issues": compliance_result["issues"]
                }
            
            # Apply watermark and age verification
            processed_content = self._process_content_for_publishing(of_content)
            
            # OnlyFans requires manual posting or browser automation
            publication_result = self._handle_onlyfans_publishing(processed_content)
            
            if publication_result["success"]:
                # Store in content library
                content_id = publication_result["content_id"]
                processed_content.content_id = content_id
                self.content_library[content_id] = processed_content
                
                # Send notifications if enabled
                if self.auto_notifications:
                    self._notify_subscribers(processed_content)
                
                # Update revenue tracking for PPV content
                if tier == ContentTier.PPV and price:
                    self._track_ppv_content(content_id, price)
                
                self.logger.info(f"✨ Premium content published successfully: {content_id} 💎")
                
                return {
                    "success": True,
                    "content_id": content_id,
                    "tier": tier.value,
                    "price": float(price) if price else None,
                    "compliance_score": compliance_result["score"],
                    "notification_sent": self.auto_notifications,
                    "published_at": processed_content.created_at.isoformat(),
                    "brand_applied": True,
                    "quality_rating": "premium"
                }
            else:
                self.logger.error(f"❌ Publication failed: {publication_result['error']}")
                return {
                    "success": False,
                    "error": publication_result["error"]
                }
        
        except Exception as e:
            self.logger.error(f"❌ Content publication failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _check_content_compliance(self, content: OFContent) -> Dict[str, Any]:
        """Check content against OnlyFans compliance rules."""
        compliance_issues = []
        compliance_score = 1.0
        
        # Age verification check
        age_keywords = self.compliance_rules["age_verification"]["keywords"]
        if not any(keyword in content.description.lower() for keyword in age_keywords):
            compliance_issues.append("Missing age verification indicators")
            compliance_score -= 0.3
        
        # Content restriction check
        prohibited = self.compliance_rules["content_restrictions"]["prohibited_activities"]
        for activity in prohibited:
            if activity in content.description.lower():
                compliance_issues.append(f"Contains prohibited content: {activity}")
                compliance_score -= 0.5
        
        # Watermark requirement (for media content)
        if content.media_urls and self.compliance_rules["content_restrictions"]["watermark_required"]:
            if not self._check_watermark_presence(content.media_urls[0]):
                compliance_issues.append("Media content missing required watermark")
                compliance_score -= 0.3
        
        # Privacy protection
        if self.compliance_rules["privacy_protection"]["no_real_names"]:
            if self._check_for_real_names(content.description):
                compliance_issues.append("Content may contain real names or personal information")
                compliance_score -= 0.4
        
        return {
            "is_compliant": len(compliance_issues) == 0,
            "issues": compliance_issues,
            "score": max(0.0, compliance_score),
            "recommendations": self._generate_compliance_recommendations(compliance_issues)
        }
    
    def _generate_compliance_recommendations(self, issues: List[str]) -> List[str]:
        """Generate recommendations to fix compliance issues."""
        recommendations = []
        
        for issue in issues:
            if "age verification" in issue:
                recommendations.append("Add '18+ Adult Content' disclaimer to description")
            elif "prohibited content" in issue:
                recommendations.append("Remove or rephrase prohibited content references")
            elif "watermark" in issue:
                recommendations.append("Add branded watermark to all media content")
        
        return recommendations
    
    def _process_content_for_publishing(self, content: OFContent) -> OFContent:
        """Process content for OnlyFans publishing (watermarks, disclaimers, etc.)."""
        
        # Add age verification disclaimer
        age_disclaimer = self.compliance_rules["age_verification"]["verification_text"]
        if age_disclaimer not in content.description:
            content.description = f"{age_disclaimer}\n\n{content.description}"
        
        # Add required disclaimers
        disclaimers = self.compliance_rules["content_restrictions"]["required_disclaimers"]
        for disclaimer in disclaimers:
            if disclaimer not in content.description:
                content.description += f"\n\n{disclaimer}"
        
        # Add watermark to media
        if content.media_urls:
            content.media_urls = self._apply_watermarks(content.media_urls)
        
        return content
    
    def _check_watermark_presence(self, media_url: str) -> bool:
        """Check if media content has watermark."""
        try:
            import cv2
            import numpy as np
            import requests
            
            # Download and check media file for watermark
            response = requests.get(media_url)
            response.raise_for_status()
            
            # Convert to OpenCV format
            nparr = np.frombuffer(response.content, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                return False
            
            # Check corners for watermark (low variance indicates text/logo)
            height, width = img.shape[:2]
            corner_regions = [
                img[0:50, 0:50],  # top-left
                img[0:50, width-50:width],  # top-right
                img[height-50:height, 0:50],  # bottom-left
                img[height-50:height, width-50:width]  # bottom-right
            ]
            
            for region in corner_regions:
                if region.var() < 100:  # Low variance suggests watermark
                    return True
            
            return False
            
        except Exception as e:
            self.logger.warning(f"⚠️ Watermark check failed: {str(e)}")
            return False
    
    def _check_for_real_names(self, text: str) -> bool:
        """Check if text contains potential real names."""
        import re
        
        # Common name patterns (simplified)
        name_patterns = [
            r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # First Last
            r'\b(Mr|Mrs|Ms|Dr)\.? [A-Z][a-z]+\b',  # Title Name
        ]
        
        for pattern in name_patterns:
            if re.search(pattern, text):
                return True
        
        # Check for common personal identifiers
        personal_identifiers = ["real name", "actual name", "legal name", "birth name"]
        return any(identifier in text.lower() for identifier in personal_identifiers)
    
    def _apply_watermarks(self, media_urls: List[str]) -> List[str]:
        """Apply professional brand watermarks to media files."""
        watermarked_urls = []
        
        try:
            import cv2
            import numpy as np
            import requests
            import tempfile
            import os
            
            for url in media_urls:
                try:
                    self.logger.info(f"🎨 Applying professional watermark to media...")
                    
                    # Download original
                    response = requests.get(url)
                    response.raise_for_status()
                    
                    # Save to temp file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                        temp_file.write(response.content)
                        temp_path = temp_file.name
                    
                    # Load image
                    img = cv2.imread(temp_path)
                    if img is None:
                        watermarked_urls.append(url)  # Skip if can't process
                        continue
                    
                    # Apply professional watermark based on style
                    img = self._apply_brand_watermark(img)
                    
                    # Save watermarked image
                    watermarked_path = temp_path.replace('.jpg', '_premium.jpg')
                    cv2.imwrite(watermarked_path, img)
                    
                    # In production, would upload to CDN and return new URL
                    watermarked_urls.append(f"premium_{url}")
                    
                    # Cleanup
                    os.unlink(temp_path)
                    os.unlink(watermarked_path)
                    
                    self.logger.info("✨ Professional watermark applied successfully 💎")
                    
                except Exception as e:
                    self.logger.error(f"❌ Watermark application failed for {url}: {str(e)}")
                    watermarked_urls.append(url)  # Use original if watermarking fails
            
            return watermarked_urls
            
        except ImportError:
            self.logger.warning("⚠️ OpenCV not available for professional watermarking")
            return media_urls  # Return original URLs
        except Exception as e:
            self.logger.error(f"❌ Professional watermarking process failed: {str(e)}")
            return media_urls
    
    def _apply_brand_watermark(self, img):
        """Apply branded watermark based on configured style."""
        import cv2
        height, width = img.shape[:2]
        
        # Get brand configuration
        watermark_text = self.brand_config.get("watermark_text", "© PREMIUM")
        position = self.brand_config.get("watermark_position", "bottom_right")
        opacity = self.brand_config.get("watermark_opacity", 0.7)
        
        # Professional styling based on watermark_style
        if self.watermark_style == "professional":
            font = cv2.FONT_HERSHEY_SIMPLEX
            font_scale = 0.8
            thickness = 2
            color = (255, 255, 255)  # White
            bg_color = (0, 0, 0)     # Black background
        elif self.watermark_style == "elegant":
            font = cv2.FONT_HERSHEY_SCRIPT_SIMPLEX
            font_scale = 1.0
            thickness = 2
            color = (255, 215, 0)    # Gold
            bg_color = (0, 0, 0)     # Black background
        else:  # minimal
            font = cv2.FONT_HERSHEY_PLAIN
            font_scale = 1.2
            thickness = 1
            color = (200, 200, 200)  # Light gray
            bg_color = None          # No background
        
        # Calculate text size and position
        text_size = cv2.getTextSize(watermark_text, font, font_scale, thickness)[0]
        
        if position == "bottom_right":
            text_x = width - text_size[0] - 20
            text_y = height - 20
        elif position == "bottom_left":
            text_x = 20
            text_y = height - 20
        elif position == "top_right":
            text_x = width - text_size[0] - 20
            text_y = text_size[1] + 20
        else:  # top_left
            text_x = 20
            text_y = text_size[1] + 20
        
        # Add background if specified
        if bg_color:
            cv2.rectangle(img, 
                         (text_x-10, text_y-text_size[1]-10), 
                         (text_x+text_size[0]+10, text_y+10), 
                         bg_color, -1)
        
        # Add text with opacity
        overlay = img.copy()
        cv2.putText(overlay, watermark_text, (text_x, text_y), 
                   font, font_scale, color, thickness, cv2.LINE_AA)
        
        # Blend with original image for opacity effect
        cv2.addWeighted(overlay, opacity, img, 1 - opacity, 0, img)
        
        return img
    
    def _handle_onlyfans_publishing(self, content: OFContent) -> Dict[str, Any]:
        """Handle OnlyFans publishing through available methods."""
        try:
            content_id = str(uuid.uuid4()) if not content.content_id else content.content_id
            
            # Prepare content package for publishing
            publication_package = {
                "content_id": content_id,
                "tier": content.tier.value,
                "price": float(content.price) if content.price else None,
                "text": content.text_content if hasattr(content, 'text_content') else content.description,
                "media_files": content.media_urls or [],
                "watermark_applied": True,  # Applied in processing step
                "age_verification": "18+" in (content.text_content if hasattr(content, 'text_content') else content.description),
                "scheduled_time": content.created_at.isoformat() if content.created_at else datetime.now(timezone.utc).isoformat(),
                "publishing_instructions": self._generate_publishing_instructions(content)
            }
            
            # Save to publishing queue for manual processing
            self._save_to_publishing_queue(publication_package)
            
            self.logger.info(f"💎 Content queued for OF publishing: {content_id}")
            
            return {
                "success": True,
                "content_id": content_id,
                "method": "queued_for_manual_publishing",
                "publication_package": publication_package
            }
            
        except Exception as e:
            self.logger.error(f"❌ Content publishing preparation failed: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _generate_publishing_instructions(self, content: OFContent) -> List[str]:
        """Generate step-by-step publishing instructions."""
        content_text = content.text_content if hasattr(content, 'text_content') else content.description
        
        instructions = [
            "1. Log into OnlyFans Creator Dashboard",
            "2. Navigate to 'New Post' section",
            f"3. Upload media files: {', '.join(content.media_urls) if content.media_urls else 'Text only'}",
            f"4. Set content tier: {content.tier.value}",
            f"5. Add caption: {content_text[:100]}..." if len(content_text) > 100 else f"5. Add caption: {content_text}",
        ]
        
        if content.price and content.price > 0:
            instructions.append(f"6. Set PPV price: ${content.price}")
        
        instructions.extend([
            "7. Verify age verification warning is present",
            "8. Review watermarks on media",
            "9. Schedule or publish immediately",
            "10. Copy post URL for tracking"
        ])
        
        return instructions
    
    def _save_to_publishing_queue(self, package: Dict[str, Any]) -> None:
        """Save content to publishing queue for manual processing."""
        import json
        import os
        
        queue_dir = "publishing_queue"
        os.makedirs(queue_dir, exist_ok=True)
        
        queue_file = os.path.join(queue_dir, f"of_{package['content_id']}.json")
        
        with open(queue_file, 'w') as f:
            json.dump(package, f, indent=2, default=str)
        
        self.logger.info(f"📁 Content saved to publishing queue: {queue_file}")
    
    def _notify_subscribers(self, content: OFContent) -> bool:
        """Send elegant notifications to relevant subscribers based on content tier."""
        try:
            self.logger.info(f"💌 Crafting premium notifications for {content.tier.value} content...")
            
            # Get subscribers eligible for this content tier
            eligible_subscribers = self._get_eligible_subscribers(content.tier)
            
            # Create personalized notification message
            notification_msg = self._create_notification_message(content)
            
            # Send elegant notifications
            successful_notifications = 0
            for subscriber in eligible_subscribers:
                if self._send_notification(subscriber, notification_msg, NotificationType.NEW_POST):
                    successful_notifications += 1
            
            self.logger.info(f"✨ Sent premium notifications to {successful_notifications}/{len(eligible_subscribers)} subscribers 💎")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Premium notification delivery failed: {str(e)}")
            return False
    
    def _get_eligible_subscribers(self, content_tier: ContentTier) -> List[Subscriber]:
        """Get subscribers eligible to see content based on tier."""
        eligible = []
        
        for subscriber in self.subscribers.values():
            if self._can_access_content(subscriber, content_tier):
                eligible.append(subscriber)
        
        return eligible
    
    def _can_access_content(self, subscriber: Subscriber, content_tier: ContentTier) -> bool:
        """Check if subscriber can access content of given tier."""
        if content_tier == ContentTier.FREE:
            return True
        elif content_tier == ContentTier.SUBSCRIBER:
            return subscriber.is_active
        elif content_tier == ContentTier.PREMIUM:
            return subscriber.subscription_tier in ["premium", "vip"]
        elif content_tier == ContentTier.PPV:
            return subscriber.is_active  # PPV requires separate purchase
        else:
            return False
    
    def _create_notification_message(self, content: OFContent) -> str:
        """Create elegant, personalized notification message for subscribers."""
        if content.tier == ContentTier.PPV:
            return f"✨ Exclusive premium content just for you! 💎 '{content.title}' - ${content.price} ✨"
        elif content.tier == ContentTier.PREMIUM:
            return f"🌟 Premium exclusive content has arrived: '{content.title}' 🌟"
        elif content.tier == ContentTier.SUBSCRIBER:
            return f"💕 New content created especially for my subscribers: '{content.title}' 💕"
        else:
            return f"🎀 Fresh content posted: '{content.title}' 🎀"
    
    def _send_notification(
        self, 
        subscriber: Subscriber, 
        message: str, 
        notification_type: NotificationType
    ) -> bool:
        """Send notification to individual subscriber."""
        try:
            # OnlyFans messaging would require browser automation or unofficial API
            self.logger.debug(f"💌 Premium notification queued for {subscriber.username}: {message}")
            # In production, would integrate with elegant messaging service or automation
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to notify {subscriber.username}: {str(e)}")
            return False
    
    def _track_ppv_content(self, content_id: str, price: Decimal):
        """Track pay-per-view content for revenue analytics."""
        # Store PPV content tracking
        # This would be used to calculate revenue when purchases occur
        pass
    
    def manage_subscriber(
        self,
        action: str,
        subscriber_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Manage subscriber actions (add, update, remove)."""
        try:
            if action == "add":
                return self._add_subscriber(subscriber_data)
            elif action == "update":
                return self._update_subscriber(subscriber_data)
            elif action == "remove":
                return self._remove_subscriber(subscriber_data["user_id"])
            else:
                return {"success": False, "error": "Unknown action"}
                
        except Exception as e:
            self.logger.error(f"❌ Subscriber management failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _add_subscriber(self, subscriber_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add new subscriber."""
        subscriber = Subscriber(
            user_id=subscriber_data["user_id"],
            username=subscriber_data["username"],
            subscription_tier=subscriber_data.get("tier", "basic"),
            subscription_start=datetime.now(timezone.utc),
            total_spent=Decimal("0.00"),
            last_interaction=datetime.now(timezone.utc),
            preferences=subscriber_data.get("preferences", {})
        )
        
        self.subscribers[subscriber.user_id] = subscriber
        self.logger.info(f"👤 Added subscriber: {subscriber.username}")
        
        return {
            "success": True,
            "subscriber_id": subscriber.user_id,
            "tier": subscriber.subscription_tier
        }
    
    def _update_subscriber(self, subscriber_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update existing subscriber."""
        user_id = subscriber_data["user_id"]
        
        if user_id not in self.subscribers:
            return {"success": False, "error": "Subscriber not found"}
        
        subscriber = self.subscribers[user_id]
        
        # Update fields
        if "tier" in subscriber_data:
            subscriber.subscription_tier = subscriber_data["tier"]
        if "total_spent" in subscriber_data:
            subscriber.total_spent = Decimal(str(subscriber_data["total_spent"]))
        if "is_active" in subscriber_data:
            subscriber.is_active = subscriber_data["is_active"]
        
        subscriber.last_interaction = datetime.now(timezone.utc)
        
        self.logger.info(f"👤 Updated subscriber: {subscriber.username}")
        return {"success": True, "subscriber_id": user_id}
    
    def _remove_subscriber(self, user_id: str) -> Dict[str, Any]:
        """Remove subscriber."""
        if user_id in self.subscribers:
            subscriber = self.subscribers.pop(user_id)
            self.logger.info(f"👤 Removed subscriber: {subscriber.username}")
            return {"success": True, "subscriber_id": user_id}
        else:
            return {"success": False, "error": "Subscriber not found"}
    
    def get_revenue_analytics(self, timeframe: str = "30d") -> Dict[str, Any]:
        """Get revenue analytics and subscriber metrics."""
        try:
            # Calculate revenue metrics
            total_revenue = sum(self.revenue_metrics.values())
            
            # Subscriber metrics
            active_subscribers = sum(1 for s in self.subscribers.values() if s.is_active)
            total_subscribers = len(self.subscribers)
            
            # Average revenue per user
            arpu = total_revenue / total_subscribers if total_subscribers > 0 else Decimal("0.00")
            
            return {
                "revenue_breakdown": {
                    "subscriptions": float(self.revenue_metrics["subscriptions"]),
                    "tips": float(self.revenue_metrics["tips"]),
                    "ppv_sales": float(self.revenue_metrics["ppv_sales"]),
                    "custom_content": float(self.revenue_metrics["custom_content"])
                },
                "total_revenue": float(total_revenue),
                "subscriber_metrics": {
                    "total_subscribers": total_subscribers,
                    "active_subscribers": active_subscribers,
                    "retention_rate": (active_subscribers / total_subscribers * 100) if total_subscribers > 0 else 0
                },
                "arpu": float(arpu),
                "content_metrics": {
                    "total_content": len(self.content_library),
                    "ppv_content": len([c for c in self.content_library.values() if c.tier == ContentTier.PPV])
                }
            }
            
        except Exception as e:
            self.logger.error(f"❌ Revenue analytics failed: {str(e)}")
            return {"error": str(e)}
    
    def schedule_content(
        self,
        content: OFContent,
        scheduled_time: datetime
    ) -> Dict[str, Any]:
        """Schedule content for future publication."""
        try:
            scheduled_item = {
                "content": content,
                "scheduled_time": scheduled_time,
                "status": "scheduled",
                "created_at": datetime.now(timezone.utc)
            }
            
            self.scheduled_content.append(scheduled_item)
            
            self.logger.info(f"📅 Content scheduled for {scheduled_time}")
            return {
                "success": True,
                "scheduled_time": scheduled_time.isoformat(),
                "content_title": content.title
            }
            
        except Exception as e:
            self.logger.error(f"❌ Content scheduling failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def process_scheduled_content(self) -> List[Dict[str, Any]]:
        """Process any scheduled content that's ready to publish."""
        results = []
        current_time = datetime.now(timezone.utc)
        
        for i, scheduled_item in enumerate(self.scheduled_content):
            if (scheduled_item["status"] == "scheduled" and 
                scheduled_item["scheduled_time"] <= current_time):
                
                # Publish the content
                result = self.publish_content(
                    content={"content": scheduled_item["content"].description},
                    metadata={
                        "title": scheduled_item["content"].title,
                        "tier": scheduled_item["content"].tier.value,
                        "price": float(scheduled_item["content"].price) if scheduled_item["content"].price else None
                    }
                )
                
                # Update status
                scheduled_item["status"] = "published" if result["success"] else "failed"
                scheduled_item["published_at"] = current_time
                
                results.append({
                    "content_title": scheduled_item["content"].title,
                    "result": result
                })
        
        # Remove published/failed items
        self.scheduled_content = [
            item for item in self.scheduled_content 
            if item["status"] == "scheduled"
        ]
        
        return results
    
    def __repr__(self) -> str:
        subscriber_count = len(self.subscribers)
        content_count = len(self.content_library)
        total_revenue = sum(self.revenue_metrics.values())
        return f"✨ OFAgent Premium (VIP Subscribers: {subscriber_count}, Content: {content_count}, Revenue: ${total_revenue}) 💎☠️" 