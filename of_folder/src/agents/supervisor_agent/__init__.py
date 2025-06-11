"""
Agentic Social Media Architecture - Agent Package

This package contains all specialized agents for platform management:
- DuelCoreAgent: Main supervisor orchestrating all operations
- ContentFactory: LoRA-powered content generation with integrated image generation
- MetricsAgent: Cross-platform analytics and performance tracking
- OFAgent: Adult content platform management with elegant branding
- XAgent: X (Twitter) content and engagement management
- RedditAgent: Community-focused content management and engagement
- InstaAgent: Instagram multi-format content management
- SnapchatAgent: Snapchat ephemeral content and Spotlight optimization
"""

from ..supervisor_agent.duelcore import DuelCoreAgent
from .content_agent.content_factory import ContentFactory
from .exec_agents.metrics import MetricsAgent
from .social_agents_l3.of import OFAgent
from .social_agents_l3.x import XAgent
from .social_agents_l3.reddit import RedditAgent
from .social_agents_l3.insta import InstagramAgent as InstaAgent
from .social_agents_l3.snap import SnapchatAgent

__version__ = "1.0.0"
__author__ = "Rick ☠️"

__all__ = [
    "DuelCoreAgent",
    "ContentFactory", 
    "MetricsAgent",
    "OFAgent",
    "XAgent",
    "RedditAgent",
    "InstaAgent",
    "SnapchatAgent"
] 