#!/usr/bin/env python3
"""
Reddit MCP Integration - Example Usage
Demonstrates how to use the Reddit MCP integration for automated Reddit management.

Rick's signature: Real examples, real results ☠️
"""

import asyncio
import os

from reddit_mcp_integration import RedditMCPIntegration


async def example_basic_reddit_posting():
    """Example: Basic Reddit posting with MCP integration."""
    print("🚀 Example: Basic Reddit Posting")
    
    reddit_mcp = RedditMCPIntegration(log_level="INFO")
    
    if not reddit_mcp.reddit_client:
        print("⚠️ Reddit client not configured. Please set environment variables.")
        return
    
    response = await reddit_mcp.submit_post(
        title="Test Post from Reddit MCP Integration",
        content="This is a test post created using the Reddit MCP integration system.",
        subreddit="test"
    )
    
    if response.success:
        print(f"✅ Post created successfully!")
        print(f"📝 Post ID: {response.data['post_id']}")
        print(f"🔗 URL: {response.data['url']}")
    else:
        print(f"❌ Post creation failed: {response.error}")
    
    return response


async def example_get_hot_posts():
    """Example: Getting hot posts from a subreddit."""
    print("\n📈 Example: Getting Hot Posts")
    
    reddit_mcp = RedditMCPIntegration()
    
    if not reddit_mcp.reddit_client:
        print("⚠️ Reddit client not configured")
        return
    
    response = await reddit_mcp.get_hot_posts(
        subreddit="programming",
        limit=5
    )
    
    if response.success:
        posts = response.data['posts']
        print(f"✅ Retrieved {len(posts)} hot posts from r/programming:")
        
        for i, post in enumerate(posts, 1):
            print(f"\n{i}. {post['title']}")
            print(f"   Score: {post['score']} | Comments: {post['num_comments']}")
    else:
        print(f"❌ Failed to get posts: {response.error}")
    
    return response


async def main():
    """Run all Reddit MCP integration examples."""
    print("🔥 Reddit MCP Integration Examples ☠️")
    print("=" * 60)
    
    required_vars = ["REDDIT_CLIENT_ID", "REDDIT_CLIENT_SECRET", "REDDIT_USERNAME", "REDDIT_PASSWORD"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in a .env file")
        return
    
    try:
        await example_get_hot_posts()
        
        response = input("Run posting examples? This will create test posts (y/N): ")
        if response.lower().startswith('y'):
            await example_basic_reddit_posting()
        
        print("\n🎉 All examples completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Example failed: {e}")


if __name__ == "__main__":
    asyncio.run(main()) 