#!/usr/bin/env python3
"""
🎨 Example Usage: Replicate FLUX.1 Content Creation
Demonstrates the integrated Replicate-based content creation system.

Rick's signature: Real examples, real results ☠️
"""

import asyncio
import os
from dotenv import load_dotenv

from supervisor_agent.duelcore import DuelCoreAgent, TaskType, AgentState
from agents.content_agent.content_factory import (
    ContentRequest, 
    ContentType, 
    PlatformSpec, 
    ImageGenRequest, 
    ImageStyle,
    LoraTrainingRequest
)
from langchain.schema import HumanMessage


async def example_basic_image_generation():
    """Example: Basic image generation with Replicate FLUX.1."""
    print("🎨 Example: Basic Image Generation")
    
    # Initialize DuelCore with API keys
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        replicate_api_token=os.getenv("REPLICATE_API_TOKEN"),
        log_level="INFO"
    )
    
    # Create image generation request
    image_request = ImageGenRequest(
        prompt="Professional fitness model doing workout in modern gym, energetic lighting, brand style",
        style=ImageStyle.BRAND_CONSISTENT,
        aspect_ratio="4:5",
        platform=PlatformSpec.INSTAGRAM,
        lora_strength=0.8,
        guidance=3.5,
        num_inference_steps=30,
        source="Example"
    )
    
    # Generate image
    result = await duel_core.content_factory.image_gen_agent.generate_image(image_request)
    
    if result["success"]:
        print(f"✅ Generated: {result['image_url']}")
        print(f"🤖 Using: {result['generator']} - {result.get('model', 'N/A')}")
    else:
        print(f"❌ Failed: {result['error']}")
    
    return result


async def example_multi_platform_generation():
    """Example: Multi-platform content generation."""
    print("\n🌐 Example: Multi-Platform Generation")
    
    duel_core = DuelCoreAgent(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        replicate_api_token=os.getenv("REPLICATE_API_TOKEN")
    )
    
    # Generate content for multiple platforms
    platforms = [PlatformSpec.INSTAGRAM, PlatformSpec.X_TWITTER, PlatformSpec.ONLYFANS]
    
    content = await duel_core.content_factory.generate_image_content(
        prompt="Motivational Monday fitness content, professional brand aesthetic",
        platforms=platforms,
        style=ImageStyle.PHOTOREALISTIC,
        guidance=4.0,
        lora_strength=0.9,
        source="MultiPlatform"
    )
    
    print(f"📊 Generated for {len(content.platform_variants)} platforms:")
    for platform, variant in content.platform_variants.items():
        print(f"  {platform}: {variant['aspect_ratio']} via {variant['generator']}")
    
    return content


def example_lora_training_setup():
    """Example: Setting up LoRA training."""
    print("\n🎓 Example: LoRA Training Setup")
    
    training_request = LoraTrainingRequest(
        zip_path="./brand_training_images.zip",
        trigger_word="BRANDCORE",
        steps=1000,
        huggingface_token=os.getenv("HF_TOKEN"),
        huggingface_repo_id="yourusername/flux-brandcore"
    )
    
    print("📝 LoRA Training Configuration:")
    print(f"  Trigger word: {training_request.trigger_word}")
    print(f"  Training steps: {training_request.steps}")
    print(f"  Destination: {training_request.huggingface_repo_id}")
    
    return training_request


async def main():
    """Run all examples."""
    load_dotenv()
    
    print("🔥 Replicate FLUX.1 Content Creation Examples ☠️")
    print("=" * 60)
    
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ OPENAI_API_KEY required")
        return
    
    if not os.getenv("REPLICATE_API_TOKEN"):
        print("⚠️ REPLICATE_API_TOKEN not found - will fallback to DALL-E")
    
    try:
        await example_basic_image_generation()
        await example_multi_platform_generation()
        example_lora_training_setup()
        
        print("\n🎉 All examples completed successfully!")
        print("🚀 Ready to create amazing content with FLUX.1!")
        
    except Exception as e:
        print(f"\n❌ Example failed: {e}")


if __name__ == "__main__":
    asyncio.run(main()) 