"""
Social Media Platform Agents - Layer 3 Implementation

This package contains specialized agents for individual social media platforms:
- InstagramAgent: Instagram feed, stories, reels management
- XAgent: X/Twitter posts, threads, engagement
- RedditAgent: Community-focused content and engagement
- SnapchatAgent: Ephemeral content and AR features
- OFAgent: Premium content and subscriber management

Rick's signature: Platform-specific mastery ☠️
"""

# Import agents with proper error handling
try:
    from .insta import InstagramAgent
    from .x import XAgent
    from .reddit import RedditAgent
    from .snap import SnapchatAgent
    from .of import OFAgent
except ImportError as e:
    # Fallback imports for when package is imported from different context
    import sys
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)
    
    try:
        from insta import InstagramAgent
        from x import XAgent  
        from reddit import RedditAgent
        from snap import SnapchatAgent
        from of import OFAgent
    except ImportError:
        # Last resort - import without instantiation
        InstagramAgent = None
        XAgent = None
        RedditAgent = None
        SnapchatAgent = None
        OFAgent = None

__all__ = [
    "InstagramAgent",
    "XAgent", 
    "RedditAgent",
    "SnapchatAgent",
    "OFAgent"
]

__version__ = "1.0.0" 