"""
🎭 Content Factory Agent - Multi-Platform Content Generation
Generates platform-optimized content with LoRA fine-tuned models and image generation.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from dataclasses import dataclass, field

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import replicate


class ContentType(Enum):
    """Content type enumeration."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    MIXED = "mixed"


class PlatformSpec(Enum):
    """Platform specification enumeration."""
    ONLYFANS = "onlyfans"
    INSTAGRAM = "instagram"
    X_TWITTER = "x"
    REDDIT = "reddit"
    SNAPCHAT = "snapchat"


class ImageStyle(Enum):
    """Image style enumeration."""
    PHOTOREALISTIC = "photorealistic"
    ARTISTIC = "artistic"
    MINIMALIST = "minimalist"
    BRAND_CONSISTENT = "brand_consistent"


@dataclass
class ContentRequest:
    """Content generation request structure."""
    prompt: str
    platforms: List[PlatformSpec]
    content_type: ContentType
    persona_context: Optional[Dict[str, Any]] = None
    brand_guidelines: Optional[Dict[str, Any]] = None
    target_audience: Optional[str] = None
    cta_requirements: Optional[str] = None
    generate_variants: bool = False
    num_variants: int = 3
    image_requirements: Optional[Dict[str, Any]] = None


@dataclass
class ImageGenRequest:
    """Image generation request structure."""
    prompt: str
    style: ImageStyle
    aspect_ratio: str
    platform: PlatformSpec
    brand_elements: Optional[Dict[str, Any]] = None
    quality: str = "standard"
    lora_strength: float = 0.8
    num_inference_steps: int = 30
    guidance: float = 3.5
    seed: Optional[int] = None
    source: Optional[str] = None


@dataclass
class LoraTrainingRequest:
    """LoRA training request structure."""
    zip_path: str
    trigger_word: str
    steps: int = 1000
    huggingface_token: str = ""
    huggingface_repo_id: str = ""


@dataclass
class LoraTrainingStatus:
    """LoRA training status structure."""
    training_url: str
    status: str
    model_uri: str
    training_id: str


@dataclass
class GeneratedContent:
    """Generated content structure."""
    content_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    text_content: str = ""
    image_urls: List[str] = field(default_factory=list)
    platform_variants: Dict[str, Dict[str, Any]] = field(default_factory=dict)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class ImageGenAgent:
    """Image generation agent with multiple providers including Replicate FLUX.1."""
    
    def __init__(
        self, 
        openai_api_key: str = None, 
        replicate_api_token: str = None,
        default_style: ImageStyle = ImageStyle.BRAND_CONSISTENT
    ):
        self.openai_api_key = openai_api_key
        self.replicate_api_token = replicate_api_token
        self.default_style = default_style
        self.generators = ["dalle", "midjourney", "stability", "replicate"]
        self.logger = logging.getLogger("ImageGenAgent")
        
        # Initialize Replicate client
        if self.replicate_api_token:
            self.replicate_client = replicate.Client(api_token=self.replicate_api_token)
            self.flux_model_id = "xlabs-ai/flux-dev-realism:39b3434f194f87a900d1bc2b6d4b983e90f0dde1d5022c27b52c143d670758fa"
            self.lora_trainer_id = "ostris/flux-dev-lora-trainer:4ffd32160efd92e956d39c5338a9b8fbafca58e03f791f6d8011f3e20e8ea6fa"
        else:
            self.replicate_client = None
        
    def _select_generator(self, request: ImageGenRequest) -> str:
        """Select best generator for request."""
        # Prefer Replicate FLUX.1 for realism and brand consistency
        if self.replicate_client and request.style in [ImageStyle.PHOTOREALISTIC, ImageStyle.BRAND_CONSISTENT]:
            return "replicate"
        elif request.style == ImageStyle.PHOTOREALISTIC:
            return "dalle"
        elif request.style == ImageStyle.ARTISTIC:
            return "midjourney"
        else:
            return "stability"
    
    async def _generate_with_dalle(self, request: ImageGenRequest) -> Dict[str, Any]:
        """Generate image with DALL-E."""
        try:
            import openai
            client = openai.OpenAI(api_key=self.openai_api_key)
            
            optimized_prompt = self._optimize_dalle_prompt(request)
            
            # Map aspect ratios to DALL-E sizes
            size_map = {
                "1:1": "1024x1024",
                "16:9": "1792x1024", 
                "9:16": "1024x1792",
                "4:5": "1024x1280",
                "5:4": "1280x1024"
            }
            
            size = size_map.get(request.aspect_ratio, "1024x1024")
            
            response = client.images.generate(
                model="dall-e-3",
                prompt=optimized_prompt,
                size=size,
                quality="standard" if request.quality == "standard" else "hd",
                n=1
            )
            
            return {
                "success": True,
                "image_url": response.data[0].url,
                "generator": "dalle",
                "revised_prompt": response.data[0].revised_prompt
            }
            
        except Exception as e:
            self.logger.error(f"DALL-E generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "generator": "dalle"
            }
    
    def _optimize_dalle_prompt(self, request: ImageGenRequest) -> str:
        """Optimize prompt for DALL-E."""
        optimized = request.prompt
        
        if request.style == ImageStyle.MINIMALIST:
            optimized += ", minimalist style"
        
        if request.brand_elements and "colors" in request.brand_elements:
            colors = ", ".join(request.brand_elements["colors"])
            optimized += f", using colors: {colors}"
            
        return optimized
    
    async def _generate_with_replicate(self, request: ImageGenRequest) -> Dict[str, Any]:
        """Generate image with Replicate FLUX.1."""
        try:
            if not self.replicate_client:
                raise ValueError("Replicate client not initialized")
            
            optimized_prompt = self._optimize_replicate_prompt(request)
            
            replicate_input = {
                "prompt": optimized_prompt,
                "aspect_ratio": request.aspect_ratio,
                "num_outputs": 1,
                "num_inference_steps": request.num_inference_steps,
                "guidance": request.guidance,
                "lora_strength": request.lora_strength,
                "output_format": "webp",
                "output_quality": 100,
                "seed": request.seed
            }
            
            output_uris = self.replicate_client.run(self.flux_model_id, input=replicate_input)
            
            return {
                "success": True,
                "image_url": list(output_uris)[0] if output_uris else None,
                "image_urls": list(output_uris),
                "generator": "replicate",
                "model": "flux-dev-realism",
                "prompt_used": optimized_prompt,
                "metadata": {
                    "guidance": request.guidance,
                    "lora_strength": request.lora_strength,
                    "steps": request.num_inference_steps,
                    "source": request.source
                }
            }
            
        except Exception as e:
            self.logger.error(f"Replicate FLUX.1 generation failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "generator": "replicate"
            }
    
    def _optimize_replicate_prompt(self, request: ImageGenRequest) -> str:
        """Optimize prompt for Replicate FLUX.1."""
        optimized = request.prompt
        
        # Add style modifiers
        if request.style == ImageStyle.PHOTOREALISTIC:
            optimized += ", photorealistic, highly detailed, professional photography"
        elif request.style == ImageStyle.MINIMALIST:
            optimized += ", minimalist style, clean composition, simple background"
        elif request.style == ImageStyle.ARTISTIC:
            optimized += ", artistic style, creative composition"
        elif request.style == ImageStyle.BRAND_CONSISTENT:
            optimized += ", professional brand imagery, consistent style"
        
        # Add brand elements
        if request.brand_elements:
            if "colors" in request.brand_elements:
                colors = ", ".join(request.brand_elements["colors"])
                optimized += f", using brand colors: {colors}"
            
            if "style_keywords" in request.brand_elements:
                keywords = ", ".join(request.brand_elements["style_keywords"])
                optimized += f", {keywords}"
        
        return optimized
    
    async def train_lora_model(self, training_request: LoraTrainingRequest) -> LoraTrainingStatus:
        """Train a LoRA model using Replicate."""
        try:
            if not self.replicate_client:
                raise ValueError("Replicate client not initialized for LoRA training")
            
            # Prepare training input
            with open(training_request.zip_path, "rb") as zip_file:
                training = self.replicate_client.trainings.create(
                    version=self.lora_trainer_id,
                    input={
                        "input_images": zip_file,
                        "steps": training_request.steps,
                        "trigger_word": training_request.trigger_word,
                        "hf_token": training_request.huggingface_token,
                        "hf_repo_id": training_request.huggingface_repo_id
                    },
                    destination=training_request.huggingface_repo_id
                )
            
            self.logger.info(f"🎓 LoRA training started: {training.id}")
            
            return LoraTrainingStatus(
                training_url=f"https://replicate.com/p/{training.id}",
                status=training.status,
                model_uri=training_request.huggingface_repo_id,
                training_id=training.id
            )
            
        except Exception as e:
            self.logger.error(f"❌ LoRA training failed: {str(e)}")
            raise e
    
    async def generate_image(self, request: ImageGenRequest) -> Dict[str, Any]:
        """Generate image using selected provider."""
        generator = self._select_generator(request)
        
        self.logger.info(f"🎨 Generating image with {generator}")
        
        if generator == "dalle":
            return await self._generate_with_dalle(request)
        elif generator == "replicate":
            return await self._generate_with_replicate(request)
        else:
            # Fallback for other generators (placeholder for now)
            return {
                "success": False,
                "error": f"Generator {generator} not fully implemented",
                "generator": generator
            }


class ContentFactory:
    """Main content factory for multi-platform content generation with Replicate FLUX.1 integration."""
    
    def __init__(
        self, 
        lora_model_path: str = None, 
        enable_4bit: bool = True, 
        log_level: str = "INFO",
        openai_api_key: str = None,
        replicate_api_token: str = None
    ):
        self.logger = logging.getLogger("ContentFactory")
        self.logger.setLevel(getattr(logging, log_level))
        
        self.lora_model_path = lora_model_path
        self.enable_4bit = enable_4bit
        
        # Initialize LLM
        self.llm = ChatOpenAI(model="gpt-4", temperature=0.7, api_key=openai_api_key)
        
        # Initialize enhanced image generation agent with Replicate
        self.image_gen_agent = ImageGenAgent(
            openai_api_key=openai_api_key,
            replicate_api_token=replicate_api_token
        )
        
        # Brand guidelines
        self.brand_guidelines = {}
        
        # Generated content storage
        self.generated_content: Dict[str, GeneratedContent] = {}
        
        # LoRA training tracking
        self.lora_trainings: Dict[str, LoraTrainingStatus] = {}
        
        # Platform specifications
        self.platform_specs = {
            PlatformSpec.INSTAGRAM: {
                "max_caption_length": 2200,
                "hashtag_limit": 30,
                "image_ratios": ["1:1", "4:5", "9:16"]
            },
            PlatformSpec.X_TWITTER: {
                "max_caption_length": 280,
                "hashtag_limit": 2,
                "image_ratios": ["16:9", "1:1"]
            },
            PlatformSpec.ONLYFANS: {
                "max_caption_length": 1000,
                "age_verification_required": True,
                "adult_content_warnings": True
            },
            PlatformSpec.REDDIT: {
                "max_caption_length": 40000,
                "community_guidelines": True
            },
            PlatformSpec.SNAPCHAT: {
                "max_caption_length": 250,
                "ephemeral_content": True
            }
        }
        
        # Platform templates
        self.platform_templates = {
            PlatformSpec.INSTAGRAM: {
                "system_prompt": "Create engaging Instagram content optimized for visual storytelling. Include strategic hashtags, compelling captions that encourage engagement, and clear calls-to-action. Focus on aesthetic appeal and community building.",
                "format_guidelines": "Use emojis strategically, include 5-10 relevant hashtags, keep first sentence hook compelling for feed preview, break text into readable chunks.",
                "engagement_tactics": ["Ask questions", "Use trending hashtags", "Include story prompts", "Add location tags when relevant"]
            },
            PlatformSpec.X_TWITTER: {
                "system_prompt": "Create concise, impactful Twitter content that drives engagement and retweets. Focus on trending topics, witty observations, and conversation starters. Optimize for Twitter's algorithm.",
                "format_guidelines": "Max 280 characters, use 1-2 hashtags maximum, include compelling hook in first 10 words, utilize threads for longer content.",
                "engagement_tactics": ["Ask controversial questions", "Share hot takes", "Use trending hashtags", "Quote tweet worthy"]
            },
            PlatformSpec.ONLYFANS: {
                "system_prompt": "Create premium adult content that builds subscriber loyalty and drives conversions. Focus on exclusive experiences, personal connection, and value proposition. Maintain proper age verification.",
                "format_guidelines": "Include 🔞 18+ warning, emphasize exclusivity, use seductive but professional language, clear subscription incentives.",
                "engagement_tactics": ["Tease premium content", "Offer limited-time deals", "Personal messaging style", "Behind-scenes content"]
            },
            PlatformSpec.REDDIT: {
                "system_prompt": "Create authentic, community-focused content that provides value to specific subreddits. Focus on genuine discussion, helpful information, and community guidelines compliance.",
                "format_guidelines": "Lead with clear title, provide context, use proper formatting, include TL;DR for long posts, respect community rules.",
                "engagement_tactics": ["Ask for community input", "Share detailed experiences", "Provide helpful resources", "Engage in comments"]
            },
            PlatformSpec.SNAPCHAT: {
                "system_prompt": "Create ephemeral, authentic content that resonates with younger audiences. Focus on real-time moments, trends, and casual communication style.",
                "format_guidelines": "Keep casual and authentic, use youth slang appropriately, focus on visual-first content, embrace imperfection.",
                "engagement_tactics": ["Use trending filters", "Share behind-scenes moments", "Ask for snaps back", "Create story chains"]
            }
        }
    
    async def _generate_base_content(self, request: ContentRequest) -> str:
        """Generate base content using LLM with platform-aware prompting."""
        # Build comprehensive system prompt
        platform_guidance = []
        for platform in request.platforms:
            template = self.platform_templates[platform]
            platform_guidance.append(f"{platform.value.upper()}: {template['system_prompt']}")
        
        # Construct context from persona and brand guidelines
        context_parts = []
        if request.persona_context:
            context_parts.append(f"Persona Context: {request.persona_context}")
        if request.brand_guidelines or self.brand_guidelines:
            guidelines = request.brand_guidelines or self.brand_guidelines
            context_parts.append(f"Brand Guidelines: {guidelines}")
        if request.target_audience:
            context_parts.append(f"Target Audience: {request.target_audience}")
        
        system_content = f"""You are an expert content creator specializing in multi-platform social media.

PLATFORM REQUIREMENTS:
{chr(10).join(platform_guidance)}

CONTENT CONTEXT:
{chr(10).join(context_parts) if context_parts else 'No additional context provided.'}

Create engaging, platform-optimized content that:
1. Matches the specified tone and style
2. Incorporates brand voice consistently  
3. Drives engagement and conversions
4. Follows platform best practices
5. Maintains compliance with platform policies

Focus on creating authentic, valuable content that resonates with the target audience."""

        messages = [
            SystemMessage(content=system_content),
            HumanMessage(content=request.prompt)
        ]
        
        try:
            response = self.llm.invoke(messages)
            return response.content.strip()
        except Exception as e:
            self.logger.error(f"Content generation failed: {e}")
            return f"Content generation error: {str(e)}"
    
    def _optimize_for_platform(self, content: str, platform: PlatformSpec, specs: Dict[str, Any]) -> str:
        """Optimize content for specific platform."""
        optimized = content
        
        # Length optimization
        max_length = specs.get("max_caption_length", len(content))
        if len(optimized) > max_length:
            optimized = optimized[:max_length-3] + "..."
        
        # Platform-specific modifications
        if platform == PlatformSpec.ONLYFANS and specs.get("age_verification_required"):
            if "18+" not in optimized:
                optimized = "🔞 18+ " + optimized
        
        return optimized
    
    def _generate_platform_cta(self, platform: PlatformSpec, custom_cta: str = None) -> str:
        """Generate platform-specific call-to-action."""
        if custom_cta:
            return custom_cta
        
        cta_map = {
            PlatformSpec.INSTAGRAM: "Follow for more! 📸",
            PlatformSpec.X_TWITTER: "RT if you agree! 🔄",
            PlatformSpec.ONLYFANS: "Subscribe for exclusive content! 💎",
            PlatformSpec.REDDIT: "What do you think? Comment below! 💬",
            PlatformSpec.SNAPCHAT: "Swipe up for more! ⬆️"
        }
        
        return cta_map.get(platform, "Follow for more!")
    
    def _generate_platform_hashtags(self, platform: PlatformSpec, content: str, persona_context: Dict[str, Any] = None) -> List[str]:
        """Generate platform-specific hashtags using content analysis."""
        hashtags = []
        
        # Add custom hashtags from persona context
        if persona_context and "hashtags" in persona_context:
            hashtags.extend(persona_context["hashtags"])
        
        # Content analysis for relevant hashtags
        content_lower = content.lower()
        
        # Fitness/Health keywords
        fitness_keywords = ["fitness", "workout", "gym", "training", "health", "exercise", "muscle", "cardio", "strength"]
        if any(keyword in content_lower for keyword in fitness_keywords):
            hashtags.extend(["#fitness", "#workout", "#health"])
        
        # Motivation keywords  
        motivation_keywords = ["motivation", "inspire", "goals", "success", "mindset", "hustle", "grind"]
        if any(keyword in content_lower for keyword in motivation_keywords):
            hashtags.extend(["#motivation", "#mindset", "#goals"])
        
        # Lifestyle keywords
        lifestyle_keywords = ["lifestyle", "daily", "routine", "life", "living", "experience"]
        if any(keyword in content_lower for keyword in lifestyle_keywords):
            hashtags.extend(["#lifestyle", "#daily"])
        
        # Business keywords
        business_keywords = ["business", "entrepreneur", "startup", "money", "income", "success"]
        if any(keyword in content_lower for keyword in business_keywords):
            hashtags.extend(["#business", "#entrepreneur"])
        
        # Platform-specific hashtag strategies
        platform_hashtags = {
            PlatformSpec.INSTAGRAM: ["#instagood", "#photooftheday", "#follow4follow"],
            PlatformSpec.X_TWITTER: ["#trending", "#viral"],
            PlatformSpec.ONLYFANS: ["#exclusive", "#premium", "#subscribers"],
            PlatformSpec.REDDIT: [],  # Reddit doesn't use hashtags traditionally
            PlatformSpec.SNAPCHAT: ["#snapchat", "#story"]
        }
        
        if platform in platform_hashtags:
            hashtags.extend(platform_hashtags[platform])
        
        # Remove duplicates and respect platform limits
        hashtags = list(dict.fromkeys(hashtags))  # Remove duplicates while preserving order
        
        # Apply platform-specific limits
        if platform == PlatformSpec.X_TWITTER:
            hashtags = hashtags[:2]  # Twitter recommendation: max 2 hashtags
        elif platform == PlatformSpec.INSTAGRAM:
            hashtags = hashtags[:10]  # Keep reasonable for Instagram
        
        return hashtags
    
    def _calculate_compliance_score(self, content: str, platform: PlatformSpec) -> float:
        """Calculate comprehensive compliance score for platform."""
        score = 1.0
        content_lower = content.lower()
        
        if platform == PlatformSpec.ONLYFANS:
            # Age verification requirements
            age_indicators = ["18+", "🔞", "adult", "mature", "nsfw"]
            if not any(indicator in content_lower for indicator in age_indicators):
                score -= 0.4
            
            # Content quality indicators
            quality_indicators = ["exclusive", "premium", "vip", "private"]
            if any(indicator in content_lower for indicator in quality_indicators):
                score += 0.1
                
            # Avoid explicit language in previews
            explicit_terms = ["explicit", "hardcore", "xxx"]
            if any(term in content_lower for term in explicit_terms):
                score -= 0.2
        
        elif platform == PlatformSpec.X_TWITTER:
            # Character limit compliance
            if len(content) > 280:
                score -= 0.6
            elif len(content) > 250:
                score -= 0.2
                
            # Hashtag compliance
            hashtag_count = content.count('#')
            if hashtag_count > 3:
                score -= 0.2
        
        elif platform == PlatformSpec.INSTAGRAM:
            # Caption length optimization
            if len(content) > 2200:
                score -= 0.3
            
            # Hashtag strategy
            hashtag_count = content.count('#')
            if hashtag_count > 30:
                score -= 0.4
            elif hashtag_count < 5:
                score -= 0.1
        
        elif platform == PlatformSpec.REDDIT:
            # Community guidelines
            spam_indicators = ["subscribe", "follow me", "link in bio"]
            if any(indicator in content_lower for indicator in spam_indicators):
                score -= 0.3
                
            # Value-driven content
            value_indicators = ["help", "advice", "experience", "learn", "question"]
            if any(indicator in content_lower for indicator in value_indicators):
                score += 0.1
        
        elif platform == PlatformSpec.SNAPCHAT:
            # Length appropriate for ephemeral content
            if len(content) > 250:
                score -= 0.3
            
            # Youth-appropriate language
            inappropriate_terms = ["18+", "adult", "mature"]
            if any(term in content_lower for term in inappropriate_terms):
                score -= 0.5
        
        # General compliance checks
        spam_indicators = ["click here", "dm me", "swipe up"]
        spam_count = sum(1 for indicator in spam_indicators if indicator in content_lower)
        score -= spam_count * 0.1
        
        return max(0.0, min(1.0, score))
    
    def _calculate_optimization_score(self, content: str, platform_spec: Dict[str, Any]) -> float:
        """Calculate comprehensive optimization score."""
        score = 1.0
        content_lower = content.lower()
        
        # Length optimization
        max_length = platform_spec.get("max_caption_length", float('inf'))
        content_length = len(content)
        
        if content_length > max_length:
            score -= 0.4
        elif content_length > max_length * 0.9:
            score -= 0.1
        elif content_length < max_length * 0.3:
            score -= 0.2  # Too short might not be engaging
        
        # Engagement elements
        engagement_score = 0
        
        # Emojis boost engagement
        emoji_count = sum(1 for char in content if ord(char) > 127)
        if emoji_count > 0:
            engagement_score += min(0.15, emoji_count * 0.03)
        
        # Questions drive engagement
        question_words = ["?", "what", "how", "why", "when", "where", "who"]
        if any(word in content_lower for word in question_words):
            engagement_score += 0.1
        
        # Call-to-action elements
        cta_words = ["follow", "like", "share", "comment", "subscribe", "join", "click"]
        if any(word in content_lower for word in cta_words):
            engagement_score += 0.1
        
        # Power words that drive engagement
        power_words = ["amazing", "incredible", "secret", "proven", "ultimate", "exclusive", "limited"]
        if any(word in content_lower for word in power_words):
            engagement_score += 0.05
        
        # Action words
        action_words = ["discover", "learn", "transform", "achieve", "unlock", "master"]
        if any(word in content_lower for word in action_words):
            engagement_score += 0.05
        
        score += engagement_score
        
        # Readability factors
        sentences = content.split('.')
        if len(sentences) > 1:
            avg_sentence_length = sum(len(s.strip().split()) for s in sentences if s.strip()) / len([s for s in sentences if s.strip()])
            if 10 <= avg_sentence_length <= 20:  # Optimal sentence length
                score += 0.05
            elif avg_sentence_length > 30:
                score -= 0.1  # Too complex
        
        # Line breaks for readability
        if '\n' in content:
            score += 0.05
        
        return min(1.0, max(0.0, score))
    
    async def generate_content(self, request: ContentRequest) -> GeneratedContent:
        """Generate content for multiple platforms."""
        # Generate base content
        base_content = await self._generate_base_content(request)
        
        # Create generated content object
        generated = GeneratedContent(
            text_content=base_content,
            metadata={
                "request": request,
                "generation_method": "llm"
            }
        )
        
        # Generate platform variants
        for platform in request.platforms:
            platform_key = platform.value
            specs = self.platform_specs[platform]
            
            # Optimize for platform
            optimized_content = self._optimize_for_platform(base_content, platform, specs)
            
            # Generate hashtags
            hashtags = self._generate_platform_hashtags(platform, optimized_content, request.persona_context)
            
            # Calculate scores
            compliance_score = self._calculate_compliance_score(optimized_content, platform)
            optimization_score = self._calculate_optimization_score(optimized_content, specs)
            
            variant = {
                "content": optimized_content,
                "hashtags": hashtags,
                "character_count": len(optimized_content),
                "compliance_score": compliance_score,
                "optimization_score": optimization_score
            }
            
            # Generate variants if requested
            if request.generate_variants:
                variants = []
                for i in range(request.num_variants):
                    # Create meaningful variants by adjusting tone/style
                    variant_styles = [
                        "more conversational and personal",
                        "more professional and authoritative", 
                        "more energetic and motivational"
                    ]
                    style = variant_styles[i % len(variant_styles)]
                    
                    # Generate variant with different approach
                    variant_prompt = f"Rewrite this content with a {style} tone while maintaining the core message: {optimized_content}"
                    
                    try:
                        variant_response = self.llm.invoke([
                            SystemMessage(content=f"Rewrite content with {style} approach for {platform.value}"),
                            HumanMessage(content=variant_prompt)
                        ])
                        variant_content = self._optimize_for_platform(
                            variant_response.content.strip(), platform, specs
                        )
                    except Exception as e:
                        self.logger.warning(f"Variant generation failed: {e}")
                        variant_content = f"{optimized_content}\n\n[Variant {i+1}]"
                    
                    variants.append({
                        "content": variant_content,
                        "character_count": len(variant_content),
                        "style": style,
                        "compliance_score": self._calculate_compliance_score(variant_content, platform),
                        "optimization_score": self._calculate_optimization_score(variant_content, specs)
                    })
                variant["variants"] = variants
            
            generated.platform_variants[platform_key] = variant
        
        # Store generated content
        self.generated_content[generated.content_id] = generated
        
        return generated
    
    def set_brand_guidelines(self, guidelines: Dict[str, Any]) -> bool:
        """Set brand guidelines."""
        self.brand_guidelines = guidelines
        return True
    
    def get_content_analytics(self, content_id: str) -> Dict[str, Any]:
        """Get analytics for generated content."""
        if content_id not in self.generated_content:
            return {"error": "Content not found"}
        
        content = self.generated_content[content_id]
        
        return {
            "content_id": content_id,
            "platform_count": len(content.platform_variants),
            "platform_breakdown": {
                platform: {
                    "character_count": variant.get("character_count", 0),
                    "compliance_score": variant.get("compliance_score", 0),
                    "optimization_score": variant.get("optimization_score", 0)
                }
                for platform, variant in content.platform_variants.items()
            },
            "created_at": content.created_at.isoformat()
        }
    
    async def generate_image_content(
        self,
        prompt: str,
        platforms: List[PlatformSpec],
        style: ImageStyle = ImageStyle.BRAND_CONSISTENT,
        **kwargs
    ) -> GeneratedContent:
        """Generate image content using the enhanced image generation system."""
        
        self.logger.info(f"🎨 Generating image content for platforms: {[p.value for p in platforms]}")
        
        # Create content object
        content = GeneratedContent()
        
        # Generate images for each platform
        for platform in platforms:
            platform_spec = self.platform_specs.get(platform, {})
            
            # Select appropriate aspect ratio for platform
            aspect_ratio = "1:1"  # Default
            if platform == PlatformSpec.INSTAGRAM:
                aspect_ratio = "4:5"  # Instagram portrait
            elif platform == PlatformSpec.X_TWITTER:
                aspect_ratio = "16:9"  # Twitter landscape
            elif platform == PlatformSpec.SNAPCHAT:
                aspect_ratio = "9:16"  # Snapchat vertical
            
            # Create image generation request
            image_request = ImageGenRequest(
                prompt=prompt,
                style=style,
                aspect_ratio=aspect_ratio,
                platform=platform,
                brand_elements=self.brand_guidelines,
                lora_strength=kwargs.get("lora_strength", 0.8),
                num_inference_steps=kwargs.get("num_inference_steps", 30),
                guidance=kwargs.get("guidance", 3.5),
                seed=kwargs.get("seed"),
                source=kwargs.get("source", "ContentFactory")
            )
            
            # Generate image
            try:
                result = await self.image_gen_agent.generate_image(image_request)
                
                if result["success"]:
                    content.image_urls.extend(result["image_urls"])
                    
                    # Store platform-specific variant
                    content.platform_variants[platform.value] = {
                        "image_url": result["image_url"],
                        "aspect_ratio": aspect_ratio,
                        "generator": result["generator"],
                        "metadata": result.get("metadata", {})
                    }
                    
                    self.logger.info(f"✅ Generated image for {platform.value} using {result['generator']}")
                else:
                    self.logger.error(f"❌ Failed to generate image for {platform.value}: {result['error']}")
                    
            except Exception as e:
                self.logger.error(f"❌ Image generation failed for {platform.value}: {str(e)}")
        
        # Store generated content
        self.generated_content[content.content_id] = content
        
        return content
    
    async def train_lora_model(self, training_request: LoraTrainingRequest) -> LoraTrainingStatus:
        """Train a LoRA model for brand consistency."""
        
        self.logger.info(f"🎓 Starting LoRA training with trigger word: {training_request.trigger_word}")
        
        try:
            training_status = await self.image_gen_agent.train_lora_model(training_request)
            
            # Track training status
            self.lora_trainings[training_status.training_id] = training_status
            
            self.logger.info(f"✅ LoRA training initiated: {training_status.training_url}")
            
            return training_status
            
        except Exception as e:
            self.logger.error(f"❌ LoRA training failed: {str(e)}")
            raise e
    
    def get_lora_training_status(self, training_id: str) -> Optional[LoraTrainingStatus]:
        """Get the status of a LoRA training job."""
        return self.lora_trainings.get(training_id)
    
    def list_lora_trainings(self) -> List[LoraTrainingStatus]:
        """List all LoRA training jobs."""
        return list(self.lora_trainings.values())