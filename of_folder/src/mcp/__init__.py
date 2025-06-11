"""
MCP (Model Context Protocol) Integration Module

This module contains MCP protocol integrations for various platforms,
enabling seamless communication between our Python-based architecture
and external MCP servers.

Rick's signature: Protocol excellence ☠️
"""

from .reddit_mcp_integration import (
    RedditMCPIntegration,
    RedditMCPResponse,
    RedditRateLimit,
    MCPConnectionStatus,
    create_reddit_mcp_agent,
    quick_reddit_post
)

__all__ = [
    "RedditMCPIntegration",
    "RedditMCPResponse", 
    "RedditRateLimit",
    "MCPConnectionStatus",
    "create_reddit_mcp_agent",
    "quick_reddit_post"
]

__version__ = "1.0.0"
__author__ = "Rick's Engineering Team" 