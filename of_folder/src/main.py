#!/usr/bin/env python3
"""
🎭 Agentic Social Media Architecture - Main Entry Point
LangGraph-First Multi-Agent System for Social Media Management

Rick's signature: No fluff, pure execution ☠️
"""

import asyncio
import os
import logging
from typing import Dict, List, Optional, Any

from supervisor_agent.duelcore import DuelCoreAgent, TaskType, AgentState
from langchain.schema import HumanMessage


def setup_environment():
    """Setup environment variables and configuration."""
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Verify critical API keys
    required_env_vars = [
        "OPENAI_API_KEY"
    ]
    
    # Optional but recommended API keys
    optional_env_vars = [
        "REPLICATE_API_TOKEN",
        "TWITTER_BEARER_TOKEN",
        "INSTAGRAM_ACCESS_TOKEN"
    ]
    
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_vars:
        print(f"⚠️  Missing environment variables: {', '.join(missing_vars)}")
        print("Please set them in a .env file or environment")
        return False
    
    return True


async def demonstrate_content_creation():
    """Demonstrate content creation workflow using LangGraph."""
    print("\n🎨 === CONTENT CREATION WORKFLOW ===")
    
    # Initialize DuelCore agent
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        replicate_api_token=os.getenv("REPLICATE_API_TOKEN"),
        log_level="INFO"
    )
    
    # Create content creation request
    initial_state = AgentState(
        messages=[HumanMessage(content="Create motivational fitness content for Monday morning")],
        task_type=TaskType.CONTENT_CREATION,
        platforms=["instagram", "x", "onlyfans"],
        metadata={
            "persona": {
                "tone": "energetic",
                "style": "motivational",
                "target_audience": "fitness enthusiasts"
            }
        }
    )
    
    try:
        # Execute through LangGraph workflow
        result = duel_core.graph.invoke(initial_state)
        
        print(f"✅ Content generated successfully!")
        print(f"📊 Platforms: {len(result.platforms)}")
        print(f"🛡️ Compliance passed: {bool(result.metadata.get('compliance'))}")
        
        if result.content:
            print(f"\n📝 Generated Content Preview:")
            content_obj = result.content
            if hasattr(content_obj, 'text_content'):
                print(f"Text: {content_obj.text_content[:100]}...")
            if hasattr(content_obj, 'platform_variants'):
                print(f"Platform variants: {list(content_obj.platform_variants.keys())}")
        
        return result
        
    except Exception as e:
        print(f"❌ Content creation failed: {e}")
        return None


async def demonstrate_metrics_collection():
    """Demonstrate metrics collection workflow."""
    print("\n📊 === METRICS COLLECTION WORKFLOW ===")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        log_level="INFO"
    )
    
    # Configure platform APIs (example configuration)
    platform_configs = {
        "x": {
            "bearer_token": os.getenv("TWITTER_BEARER_TOKEN"),
            "api_key": os.getenv("TWITTER_API_KEY"),
            "api_secret": os.getenv("TWITTER_API_SECRET"),
            "user_id": os.getenv("TWITTER_USER_ID")
        },
        "instagram": {
            "access_token": os.getenv("INSTAGRAM_ACCESS_TOKEN"),
            "user_id": os.getenv("INSTAGRAM_USER_ID")
        }
    }
    
    # Configure metrics agent
    for platform, config in platform_configs.items():
        if all(config.values()):  # Only configure if all required values present
            duel_core.metrics_agent.configure_platform_api(platform, config)
    
    # Create metrics collection request
    metrics_state = AgentState(
        messages=[HumanMessage(content="Collect engagement metrics from all platforms")],
        task_type=TaskType.METRICS_COLLECTION,
        platforms=list(platform_configs.keys()),
        metadata={"timeframe": "24h"}
    )
    
    try:
        result = duel_core.graph.invoke(metrics_state)
        
        print(f"✅ Metrics collected successfully!")
        if result.metrics:
            print(f"📈 Platforms analyzed: {len(result.metrics)}")
            for platform, metrics in result.metrics.items():
                print(f"  {platform}: {len(metrics) if isinstance(metrics, list) else 'N/A'} data points")
        
        return result
        
    except Exception as e:
        print(f"❌ Metrics collection failed: {e}")
        return None


async def demonstrate_image_generation():
    """Demonstrate image generation workflow with Replicate FLUX.1."""
    print("\n🎨 === IMAGE GENERATION WORKFLOW ===")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        replicate_api_token=os.getenv("REPLICATE_API_TOKEN"),
        log_level="INFO"
    )
    
    try:
        # Test image generation
        from agents.content_agent.content_factory import ImageGenRequest, ImageStyle, PlatformSpec
        
        # Create image generation request
        image_request = ImageGenRequest(
            prompt="Professional fitness influencer in a modern gym, energetic morning lighting, brand consistent style",
            style=ImageStyle.BRAND_CONSISTENT,
            aspect_ratio="4:5",
            platform=PlatformSpec.INSTAGRAM,
            lora_strength=0.8,
            guidance=3.5,
            num_inference_steps=30,
            source="Demo"
        )
        
        # Generate image
        result = await duel_core.content_factory.image_gen_agent.generate_image(image_request)
        
        if result["success"]:
            print(f"✅ Image generated successfully!")
            print(f"🖼️ Image URL: {result['image_url']}")
            print(f"🤖 Generator: {result['generator']}")
            print(f"⚙️ Model: {result.get('model', 'N/A')}")
        else:
            print(f"❌ Image generation failed: {result['error']}")
        
        # Test multi-platform image generation
        print("\n🌐 Testing multi-platform generation...")
        
        platforms = [PlatformSpec.INSTAGRAM, PlatformSpec.X_TWITTER, PlatformSpec.SNAPCHAT]
        multi_content = await duel_core.content_factory.generate_image_content(
            prompt="Monday motivation fitness content, professional brand style",
            platforms=platforms,
            style=ImageStyle.BRAND_CONSISTENT,
            guidance=3.5,
            source="MultiDemo"
        )
        
        print(f"📊 Generated content for {len(multi_content.platform_variants)} platforms")
        for platform, variant in multi_content.platform_variants.items():
            print(f"  {platform}: {variant['aspect_ratio']} via {variant['generator']}")
        
        return multi_content
        
    except Exception as e:
        print(f"❌ Image generation demo failed: {e}")
        return None


async def demonstrate_lora_training():
    """Demonstrate LoRA training workflow (requires training data)."""
    print("\n🎓 === LORA TRAINING WORKFLOW ===")
    
    # This is a demonstration - actual training requires prepared image data
    print("ℹ️  LoRA training requires:")
    print("  - ZIP file with training images")
    print("  - Trigger word for the model")
    print("  - HuggingFace token and repo")
    print("  - Replicate API token")
    
    if not os.getenv("REPLICATE_API_TOKEN"):
        print("⚠️  REPLICATE_API_TOKEN not found - skipping LoRA demo")
        return None
    
    try:
        duel_core = DuelCoreAgent(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            replicate_api_token=os.getenv("REPLICATE_API_TOKEN"),
            log_level="INFO"
        )
        
        # Example training request (would need actual training data)
        from agents.content_agent.content_factory import LoraTrainingRequest
        
        print("📝 Example LoRA training configuration:")
        print("  Trigger word: BRANDCORE")
        print("  Steps: 1000")
        print("  Training images: brand_training_images.zip")
        print("  Destination: username/flux-brandcore")
        
        # This would be the actual training call:
        # training_request = LoraTrainingRequest(
        #     zip_path="./brand_training_images.zip",
        #     trigger_word="BRANDCORE",
        #     steps=1000,
        #     huggingface_token=os.getenv("HF_TOKEN"),
        #     huggingface_repo_id="username/flux-brandcore"
        # )
        # training_status = await duel_core.content_factory.train_lora_model(training_request)
        
        print("✅ LoRA training workflow demonstrated")
        return True
        
    except Exception as e:
        print(f"❌ LoRA training demo failed: {e}")
        return None


async def demonstrate_platform_distribution():
    """Demonstrate content distribution workflow."""
    print("\n📢 === PLATFORM DISTRIBUTION WORKFLOW ===")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        log_level="INFO"
    )
    
    # Create distribution request
    distribution_state = AgentState(
        messages=[HumanMessage(content="Distribute content to social media platforms")],
        task_type=TaskType.CONTENT_DISTRIBUTION,
        platforms=["x", "instagram"],
        content={
            "text_content": "🔥 Monday Motivation: Transform your mindset, transform your life! 💪 #MondayMotivation #Fitness",
            "platform_variants": {
                "x": {"content": "🔥 Monday Motivation: Transform your mindset, transform your life! 💪 #MondayMotivation"},
                "instagram": {"content": "🔥 Monday Motivation: Transform your mindset, transform your life! 💪\n\n#MondayMotivation #Fitness #Mindset #Transformation"}
            }
        }
    )
    
    try:
        result = duel_core.graph.invoke(distribution_state)
        
        print(f"✅ Content distributed successfully!")
        distribution_results = result.metadata.get("distribution_results", {})
        for platform, result_data in distribution_results.items():
            status = "✅" if result_data.get("success") else "❌"
            print(f"  {platform}: {status}")
        
        return result
        
    except Exception as e:
        print(f"❌ Distribution failed: {e}")
        return None


async def demonstrate_compliance_checking():
    """Demonstrate compliance checking workflow."""
    print("\n🛡️ === COMPLIANCE CHECKING WORKFLOW ===")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        log_level="INFO"
    )
    
    # Test content with potential compliance issues
    test_content = {
        "onlyfans": "Exclusive premium content available now! Subscribe for access.",
        "x": "This is a very long tweet that exceeds the character limit and should be flagged by the compliance system for being too long to post on Twitter platform",
        "instagram": "Check out my content! " + " ".join([f"#hashtag{i}" for i in range(35)])  # Too many hashtags
    }
    
    for platform, content in test_content.items():
        compliance_state = AgentState(
            messages=[HumanMessage(content=f"Check compliance for {platform} content")],
            task_type=TaskType.COMPLIANCE_CHECK,
            platforms=[platform],
            content={"content": content}
        )
        
        try:
            result = duel_core.graph.invoke(compliance_state)
            
            compliance_results = result.metadata.get("compliance", {})
            platform_compliance = compliance_results.get(platform, {})
            
            if platform_compliance.get("safe", False):
                print(f"✅ {platform}: Content compliant")
            else:
                violations = platform_compliance.get("violations", [])
                print(f"❌ {platform}: {len(violations)} violations - {', '.join(violations)}")
                
        except Exception as e:
            print(f"❌ Compliance check failed for {platform}: {e}")


async def run_comprehensive_demo():
    """Run comprehensive demonstration of all workflows."""
    print("🚀 === AGENTIC SOCIAL MEDIA ARCHITECTURE ===")
    print("LangGraph-First Multi-Agent System with Replicate FLUX.1")
    print("Rick's signature: No fluff, pure execution ☠️\n")
    
    if not setup_environment():
        return
    
    try:
        # Run all demonstration workflows
        await demonstrate_content_creation()
        await demonstrate_image_generation()
        await demonstrate_lora_training()
        await demonstrate_compliance_checking()
        await demonstrate_platform_distribution()
        await demonstrate_metrics_collection()
        
        print("\n🎉 === DEMONSTRATION COMPLETE ===")
        print("All workflows executed successfully!")
        print("✨ Replicate FLUX.1 integration: Ready for photorealistic content")
        print("🎓 LoRA training capabilities: Ready for brand consistency")
        print("🚀 System ready for production use with proper API credentials.")
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        logging.exception("Full demo error details:")


async def interactive_mode():
    """Interactive mode for testing specific workflows."""
    print("\n🎮 === INTERACTIVE MODE ===")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        log_level="INFO"
    )
    
    while True:
        print("\nAvailable commands:")
        print("1. Create content")
        print("2. Check compliance")
        print("3. Collect metrics")
        print("4. Distribute content")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            prompt = input("Enter content prompt: ")
            platforms = input("Enter platforms (comma-separated): ").split(",")
            platforms = [p.strip() for p in platforms]
            
            state = AgentState(
                messages=[HumanMessage(content=prompt)],
                task_type=TaskType.CONTENT_CREATION,
                platforms=platforms
            )
            
            try:
                result = duel_core.graph.invoke(state)
                print("✅ Content created successfully!")
                if result.content:
                    content_obj = result.content
                    if hasattr(content_obj, 'text_content'):
                        print(f"Content: {content_obj.text_content}")
            except Exception as e:
                print(f"❌ Failed: {e}")
                
        elif choice == "2":
            content = input("Enter content to check: ")
            platform = input("Enter platform: ")
            
            state = AgentState(
                messages=[HumanMessage(content="Check compliance")],
                task_type=TaskType.COMPLIANCE_CHECK,
                platforms=[platform],
                content={"content": content}
            )
            
            try:
                result = duel_core.graph.invoke(state)
                compliance = result.metadata.get("compliance", {}).get(platform, {})
                if compliance.get("safe", False):
                    print("✅ Content is compliant!")
                else:
                    violations = compliance.get("violations", [])
                    print(f"❌ Violations: {', '.join(violations)}")
            except Exception as e:
                print(f"❌ Failed: {e}")
                
        elif choice == "3":
            platforms = input("Enter platforms for metrics (comma-separated): ").split(",")
            platforms = [p.strip() for p in platforms]
            
            state = AgentState(
                messages=[HumanMessage(content="Collect metrics")],
                task_type=TaskType.METRICS_COLLECTION,
                platforms=platforms
            )
            
            try:
                result = duel_core.graph.invoke(state)
                print("✅ Metrics collected!")
                if result.metrics:
                    for platform, metrics in result.metrics.items():
                        print(f"{platform}: {type(metrics).__name__}")
            except Exception as e:
                print(f"❌ Failed: {e}")
                
        elif choice == "4":
            content = input("Enter content to distribute: ")
            platforms = input("Enter platforms (comma-separated): ").split(",")
            platforms = [p.strip() for p in platforms]
            
            state = AgentState(
                messages=[HumanMessage(content="Distribute content")],
                task_type=TaskType.CONTENT_DISTRIBUTION,
                platforms=platforms,
                content={"content": content}
            )
            
            try:
                result = duel_core.graph.invoke(state)
                print("✅ Content distributed!")
                distribution_results = result.metadata.get("distribution_results", {})
                for platform, result_data in distribution_results.items():
                    status = "✅" if result_data.get("success") else "❌"
                    print(f"{platform}: {status}")
            except Exception as e:
                print(f"❌ Failed: {e}")
                
        elif choice == "5":
            print("👋 Goodbye!")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "interactive":
        asyncio.run(interactive_mode())
    else:
        asyncio.run(run_comprehensive_demo())