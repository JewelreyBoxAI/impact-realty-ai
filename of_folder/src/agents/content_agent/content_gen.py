"""
ContentGenAgent - Specialized agent for content generation with LoRA finetuning.

This agent handles persona-consistent content generation using LoRA-finetuned models
and maintains brand voice across all platforms.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timezone
import logging
import json
import re

import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    BitsAndBytesConfig
)
from peft import (
    LoraConfig, 
    get_peft_model, 
    PeftModel,
    TaskType as PeftTaskType
)
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
from langchain.prompts import PromptTemplate
from pydantic import BaseModel, Field

from memory_manager import MemoryManager


class ContentType(str, Enum):
    """Content types for different platforms."""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    STORY = "story"
    REEL = "reel"
    THREAD = "thread"
    POLL = "poll"


class PlatformFormat(str, Enum):
    """Platform-specific formatting requirements."""
    ONLYFANS = "onlyfans"
    X_TWITTER = "x"
    REDDIT = "reddit"
    INSTAGRAM = "instagram"
    SNAPCHAT = "snapchat"


@dataclass
class ContentRequest:
    """Request structure for content generation."""
    prompt: str
    content_type: ContentType
    platform: PlatformFormat
    persona_context: Optional[Dict[str, Any]] = None
    target_audience: Optional[str] = None
    keywords: Optional[List[str]] = None
    tone: Optional[str] = None
    length_limit: Optional[int] = None


@dataclass
class GeneratedContent:
    """Generated content with metadata."""
    content: str
    content_type: ContentType
    platform: PlatformFormat
    metadata: Dict[str, Any]
    confidence_score: float
    compliance_flags: List[str]
    optimization_suggestions: List[str]
    timestamp: str


class ContentGenAgent:
    """
    ContentGen Agent seeded with LoRA-finetuned GPT model for persona consistency.
    
    Handles:
    - Text generation with brand voice
    - Image prompt creation
    - Video script writing
    - A/B variant generation
    - Platform-specific optimization
    
    Rick's touch: Pure content fire, no fluff ☠️
    """
    
    def __init__(
        self,
        llm: Optional[ChatOpenAI] = None,
        lora_model_path: Optional[str] = None,
        base_model_name: str = "microsoft/DialoGPT-medium",
        device: str = "auto",
        enable_4bit: bool = True,
        lora_r: int = 16,
        lora_alpha: int = 32,
        lora_dropout: float = 0.1,
        log_level: str = "INFO"
    ):
        """Initialize ContentGenAgent with LoRA model support."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🎨 ContentGenAgent initializing with LoRA support ☠️")
        
        # Primary LLM for high-level tasks
        self.llm = llm or ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7
        )
        
        # Device setup
        self.device = self._setup_device(device)
        
        # LoRA configuration
        self.lora_config = LoraConfig(
            task_type=PeftTaskType.CAUSAL_LM,
            r=lora_r,
            lora_alpha=lora_alpha,
            lora_dropout=lora_dropout,
            target_modules=["q_proj", "v_proj", "k_proj", "o_proj"]
        )
        
        # Load base model and tokenizer
        self.base_model_name = base_model_name
        self.tokenizer = None
        self.model = None
        self.lora_model = None
        
        # Initialize models
        self._initialize_models(lora_model_path, enable_4bit)
        
        # Memory manager for context
        self.memory_manager = MemoryManager()
        
        # Platform-specific templates
        self.platform_templates = self._initialize_platform_templates()
        
        # Content optimization rules
        self.optimization_rules = self._initialize_optimization_rules()
        
        self.logger.info("✅ ContentGenAgent initialized successfully")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.ContentGen")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ CONTENT - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _setup_device(self, device: str) -> torch.device:
        """Setup compute device."""
        if device == "auto":
            if torch.cuda.is_available():
                device = "cuda"
            elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
                device = "mps"
            else:
                device = "cpu"
        
        self.logger.info(f"🖥️ Using device: {device}")
        return torch.device(device)
    
    def _initialize_models(self, lora_model_path: Optional[str], enable_4bit: bool):
        """Initialize base model and LoRA adapter."""
        try:
            self.logger.info(f"📦 Loading base model: {self.base_model_name}")
            
            # 4-bit quantization config for memory efficiency
            quantization_config = None
            if enable_4bit and self.device.type == "cuda":
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_quant_type="nf4",
                    bnb_4bit_use_double_quant=True
                )
            
            # Load tokenizer
            self.tokenizer = AutoTokenizer.from_pretrained(
                self.base_model_name,
                trust_remote_code=True
            )
            
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            # Load base model
            self.model = AutoModelForCausalLM.from_pretrained(
                self.base_model_name,
                quantization_config=quantization_config,
                device_map="auto" if self.device.type == "cuda" else None,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device.type == "cuda" else torch.float32
            )
            
            # Load LoRA adapter if provided
            if lora_model_path:
                self.logger.info(f"🔧 Loading LoRA adapter: {lora_model_path}")
                self.lora_model = PeftModel.from_pretrained(
                    self.model,
                    lora_model_path,
                    device_map="auto" if self.device.type == "cuda" else None
                )
            else:
                # Apply LoRA config to base model
                self.lora_model = get_peft_model(self.model, self.lora_config)
            
            self.logger.info("✅ Models loaded successfully")
            
        except Exception as e:
            self.logger.error(f"❌ Model initialization failed: {str(e)}")
            # Fallback to LLM-only mode
            self.model = None
            self.lora_model = None
            self.tokenizer = None
    
    def _initialize_platform_templates(self) -> Dict[str, PromptTemplate]:
        """Initialize platform-specific prompt templates."""
        templates = {}
        
        # OnlyFans template
        templates[PlatformFormat.ONLYFANS] = PromptTemplate(
            input_variables=["prompt", "persona", "audience"],
            template="""
            Create engaging OnlyFans content that:
            - Maintains the established persona: {persona}
            - Targets audience: {audience}
            - Follows content guidelines and age restrictions
            - Encourages subscriber engagement
            
            Content request: {prompt}
            
            Generated content:
            """
        )
        
        # X (Twitter) template
        templates[PlatformFormat.X_TWITTER] = PromptTemplate(
            input_variables=["prompt", "persona", "hashtags"],
            template="""
            Create a Twitter/X post that:
            - Maintains persona voice: {persona}
            - Stays under 280 characters
            - Includes relevant hashtags: {hashtags}
            - Encourages engagement (likes, retweets, replies)
            
            Content request: {prompt}
            
            Tweet:
            """
        )
        
        # Reddit template
        templates[PlatformFormat.REDDIT] = PromptTemplate(
            input_variables=["prompt", "subreddit", "persona"],
            template="""
            Create a Reddit post for r/{subreddit} that:
            - Follows subreddit rules and culture
            - Maintains authentic persona: {persona}
            - Encourages discussion and upvotes
            - Avoids excessive self-promotion
            
            Content request: {prompt}
            
            Reddit post:
            """
        )
        
        # Instagram template
        templates[PlatformFormat.INSTAGRAM] = PromptTemplate(
            input_variables=["prompt", "persona", "hashtags", "content_type"],
            template="""
            Create Instagram {content_type} content that:
            - Maintains visual brand persona: {persona}
            - Includes strategic hashtags: {hashtags}
            - Optimized for Instagram algorithm
            - Encourages saves, shares, and comments
            
            Content request: {prompt}
            
            Instagram content:
            """
        )
        
        # Snapchat template
        templates[PlatformFormat.SNAPCHAT] = PromptTemplate(
            input_variables=["prompt", "persona", "audience"],
            template="""
            Create Snapchat content that:
            - Matches youthful, authentic persona: {persona}
            - Appeals to target audience: {audience}
            - Optimized for ephemeral, visual format
            - Encourages story engagement
            
            Content request: {prompt}
            
            Snapchat content:
            """
        )
        
        return templates
    
    def _initialize_optimization_rules(self) -> Dict[str, Dict[str, Any]]:
        """Initialize platform-specific optimization rules."""
        return {
            PlatformFormat.ONLYFANS: {
                "max_length": 2000,
                "emoji_usage": "moderate",
                "call_to_action": "strong",
                "personalization": "high",
                "exclusive_language": True
            },
            PlatformFormat.X_TWITTER: {
                "max_length": 280,
                "emoji_usage": "light",
                "hashtag_limit": 2,
                "thread_opportunity": True,
                "trending_topics": True
            },
            PlatformFormat.REDDIT: {
                "max_length": 10000,
                "formatting": "markdown",
                "authenticity": "critical",
                "community_focus": True,
                "self_promotion_limit": "10%"
            },
            PlatformFormat.INSTAGRAM: {
                "max_length": 2200,
                "hashtag_limit": 30,
                "emoji_usage": "high",
                "visual_description": True,
                "story_format": True
            },
            PlatformFormat.SNAPCHAT: {
                "max_length": 250,
                "casual_tone": True,
                "visual_focus": True,
                "ephemeral_nature": True,
                "youth_appeal": True
            }
        }
    
    def generate_content(
        self,
        prompt: str,
        platforms: List[str],
        persona_context: Optional[Dict[str, Any]] = None,
        content_type: ContentType = ContentType.TEXT,
        generate_variants: bool = True,
        num_variants: int = 3
    ) -> Dict[str, Any]:
        """
        Generate content for multiple platforms with persona consistency.
        
        Args:
            prompt: Content generation prompt
            platforms: Target platforms
            persona_context: Persona information for consistency
            content_type: Type of content to generate
            generate_variants: Whether to generate A/B variants
            num_variants: Number of variants per platform
            
        Returns:
            Dictionary with generated content for each platform
        """
        self.logger.info(f"🎨 Generating {content_type} content for: {platforms}")
        
        results = {}
        
        for platform in platforms:
            try:
                platform_enum = PlatformFormat(platform.lower())
                
                # Generate primary content
                primary_content = self._generate_platform_content(
                    prompt=prompt,
                    platform=platform_enum,
                    content_type=content_type,
                    persona_context=persona_context
                )
                
                platform_results = {
                    "primary": primary_content,
                    "variants": []
                }
                
                # Generate variants if requested
                if generate_variants:
                    for i in range(num_variants):
                        variant = self._generate_platform_content(
                            prompt=f"{prompt} (Variant {i+1})",
                            platform=platform_enum,
                            content_type=content_type,
                            persona_context=persona_context,
                            variant_seed=i + 1
                        )
                        platform_results["variants"].append(variant)
                
                results[platform] = platform_results
                
            except Exception as e:
                self.logger.error(f"❌ Content generation failed for {platform}: {str(e)}")
                results[platform] = {"error": str(e)}
        
        self.logger.info("✅ Content generation completed")
        return results
    
    def _generate_platform_content(
        self,
        prompt: str,
        platform: PlatformFormat,
        content_type: ContentType,
        persona_context: Optional[Dict[str, Any]] = None,
        variant_seed: Optional[int] = None
    ) -> GeneratedContent:
        """Generate content for a specific platform."""
        
        # Prepare context
        context = self._prepare_generation_context(
            prompt=prompt,
            platform=platform,
            persona_context=persona_context,
            variant_seed=variant_seed
        )
        
        # Generate using LoRA model if available
        if self.lora_model and self.tokenizer:
            content = self._generate_with_lora(context, platform)
        else:
            # Fallback to LLM generation
            content = self._generate_with_llm(context, platform)
        
        # Post-process and optimize
        optimized_content = self._optimize_content(content, platform)
        
        # Compliance check
        compliance_flags = self._check_content_compliance(optimized_content, platform)
        
        # Generate optimization suggestions
        suggestions = self._generate_optimization_suggestions(optimized_content, platform)
        
        return GeneratedContent(
            content=optimized_content,
            content_type=content_type,
            platform=platform,
            metadata={
                "original_prompt": prompt,
                "persona_context": persona_context,
                "variant_seed": variant_seed,
                "generation_method": "lora" if self.lora_model else "llm"
            },
            confidence_score=self._calculate_confidence_score(optimized_content, platform),
            compliance_flags=compliance_flags,
            optimization_suggestions=suggestions,
            timestamp=datetime.now(timezone.utc).isoformat()
        )
    
    def _prepare_generation_context(
        self,
        prompt: str,
        platform: PlatformFormat,
        persona_context: Optional[Dict[str, Any]] = None,
        variant_seed: Optional[int] = None
    ) -> Dict[str, Any]:
        """Prepare context for content generation."""
        
        context = {
            "prompt": prompt,
            "platform": platform.value,
            "persona": persona_context or {},
            "optimization_rules": self.optimization_rules.get(platform, {}),
            "historical_context": self.memory_manager.get_platform_context(platform.value)
        }
        
        if variant_seed:
            context["variant_modifier"] = f"Style variation #{variant_seed}"
        
        return context
    
    def _generate_with_lora(self, context: Dict[str, Any], platform: PlatformFormat) -> str:
        """Generate content using LoRA-finetuned model."""
        try:
            # Prepare input prompt
            input_text = self._format_lora_prompt(context, platform)
            
            # Tokenize
            inputs = self.tokenizer(
                input_text,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(self.device)
            
            # Generate
            with torch.no_grad():
                outputs = self.lora_model.generate(
                    **inputs,
                    max_new_tokens=200,
                    temperature=0.7,
                    do_sample=True,
                    top_p=0.9,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            # Decode
            generated_text = self.tokenizer.decode(
                outputs[0][inputs['input_ids'].shape[1]:],
                skip_special_tokens=True
            )
            
            return generated_text.strip()
            
        except Exception as e:
            self.logger.error(f"❌ LoRA generation failed: {str(e)}")
            # Fallback to LLM
            return self._generate_with_llm(context, platform)
    
    def _generate_with_llm(self, context: Dict[str, Any], platform: PlatformFormat) -> str:
        """Generate content using primary LLM."""
        try:
            # Get platform template
            template = self.platform_templates.get(platform)
            if not template:
                # Generic template
                formatted_prompt = f"""
                Create content for {platform.value} platform:
                {context['prompt']}
                
                Persona context: {context['persona']}
                Optimization rules: {context['optimization_rules']}
                """
            else:
                formatted_prompt = template.format(**self._prepare_template_vars(context, platform))
            
            # Generate with LLM
            response = self.llm.invoke([HumanMessage(content=formatted_prompt)])
            return response.content.strip()
            
        except Exception as e:
            self.logger.error(f"❌ LLM generation failed: {str(e)}")
            return f"Content generation failed for {platform.value}"
    
    def _format_lora_prompt(self, context: Dict[str, Any], platform: PlatformFormat) -> str:
        """Format prompt for LoRA model input."""
        persona_str = json.dumps(context['persona']) if context['persona'] else "default"
        
        return f"""Platform: {platform.value}
Persona: {persona_str}
Request: {context['prompt']}
Content:"""
    
    def _prepare_template_vars(self, context: Dict[str, Any], platform: PlatformFormat) -> Dict[str, str]:
        """Prepare variables for platform templates."""
        vars_dict = {
            "prompt": context["prompt"],
            "persona": str(context["persona"]),
            "audience": context["persona"].get("target_audience", "general"),
            "hashtags": ", ".join(context["persona"].get("hashtags", ["#content"])),
            "subreddit": context["persona"].get("subreddit", "general"),
            "content_type": "post"
        }
        return vars_dict
    
    def _optimize_content(self, content: str, platform: PlatformFormat) -> str:
        """Apply platform-specific optimizations."""
        rules = self.optimization_rules.get(platform, {})
        
        # Length optimization
        max_length = rules.get("max_length")
        if max_length and len(content) > max_length:
            content = content[:max_length-3] + "..."
        
        # Platform-specific formatting
        if platform == PlatformFormat.REDDIT and rules.get("formatting") == "markdown":
            content = self._apply_markdown_formatting(content)
        elif platform == PlatformFormat.X_TWITTER:
            content = self._optimize_twitter_content(content)
        elif platform == PlatformFormat.INSTAGRAM:
            content = self._optimize_instagram_content(content)
        
        return content
    
    def _apply_markdown_formatting(self, content: str) -> str:
        """Apply Reddit-style markdown formatting."""
        # Add basic markdown if not present
        if not any(marker in content for marker in ['**', '*', '`', '#']):
            # Simple enhancement - make first line bold if it looks like a title
            lines = content.split('\n')
            if lines and len(lines) > 1:
                lines[0] = f"**{lines[0]}**"
                content = '\n'.join(lines)
        return content
    
    def _optimize_twitter_content(self, content: str) -> str:
        """Optimize content for Twitter/X."""
        # Ensure under character limit
        if len(content) > 280:
            content = content[:277] + "..."
        
        # Add thread indicator if content is long
        if len(content) > 240:
            content += " 🧵"
        
        return content
    
    def _optimize_instagram_content(self, content: str) -> str:
        """Optimize content for Instagram."""
        # Add line breaks for readability
        if '\n' not in content and len(content) > 100:
            # Split long content into paragraphs
            sentences = content.split('. ')
            if len(sentences) > 2:
                mid_point = len(sentences) // 2
                content = '. '.join(sentences[:mid_point]) + '.\n\n' + '. '.join(sentences[mid_point:])
        
        return content
    
    def _check_content_compliance(self, content: str, platform: PlatformFormat) -> List[str]:
        """Check content for compliance issues."""
        flags = []
        
        # Generic checks
        if len(content.strip()) == 0:
            flags.append("empty_content")
        
        # Platform-specific checks
        if platform == PlatformFormat.X_TWITTER:
            if len(content) > 280:
                flags.append("character_limit_exceeded")
        elif platform == PlatformFormat.ONLYFANS:
            # Check for age-appropriate content indicators
            adult_keywords = ["18+", "adult", "mature"]
            if not any(keyword in content.lower() for keyword in adult_keywords):
                flags.append("missing_age_verification")
        
        # Content quality checks
        if content.count('!') > 5:
            flags.append("excessive_exclamation")
        if content.isupper():
            flags.append("all_caps")
        
        return flags
    
    def _generate_optimization_suggestions(self, content: str, platform: PlatformFormat) -> List[str]:
        """Generate suggestions for content optimization."""
        suggestions = []
        rules = self.optimization_rules.get(platform, {})
        
        # Length suggestions
        if rules.get("max_length"):
            utilization = len(content) / rules["max_length"]
            if utilization < 0.5:
                suggestions.append("Consider expanding content to utilize character limit")
            elif utilization > 0.9:
                suggestions.append("Content is near character limit, consider shortening")
        
        # Engagement suggestions
        if platform == PlatformFormat.INSTAGRAM:
            if '#' not in content:
                suggestions.append("Add relevant hashtags to increase discoverability")
            if '?' not in content:
                suggestions.append("Consider adding a question to encourage engagement")
        
        elif platform == PlatformFormat.X_TWITTER:
            if not any(word in content.lower() for word in ['what', 'how', 'why', 'when']):
                suggestions.append("Consider adding conversation starters")
        
        elif platform == PlatformFormat.REDDIT:
            if len(content.split('\n')) == 1:
                suggestions.append("Consider formatting with paragraphs for better readability")
        
        return suggestions
    
    def _calculate_confidence_score(self, content: str, platform: PlatformFormat) -> float:
        """Calculate confidence score for generated content."""
        score = 1.0
        
        # Deduct for compliance flags
        flags = self._check_content_compliance(content, platform)
        score -= len(flags) * 0.1
        
        # Deduct for very short content
        if len(content.strip()) < 20:
            score -= 0.3
        
        # Deduct for repetitive content
        words = content.lower().split()
        if len(set(words)) < len(words) * 0.7:  # Less than 70% unique words
            score -= 0.2
        
        # Platform-specific scoring
        rules = self.optimization_rules.get(platform, {})
        if rules.get("max_length"):
            length_ratio = len(content) / rules["max_length"]
            if 0.3 <= length_ratio <= 0.9:  # Good length utilization
                score += 0.1
        
        return max(0.0, min(1.0, score))
    
    def generate_optimization_recommendations(
        self, 
        historical_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate content strategy optimization recommendations based on performance data."""
        self.logger.info("🎯 Generating optimization recommendations")
        
        try:
            recommendations = {
                "content_themes": self._analyze_content_themes(historical_data),
                "timing_optimization": self._analyze_timing_patterns(historical_data),
                "platform_performance": self._analyze_platform_performance(historical_data),
                "engagement_drivers": self._identify_engagement_drivers(historical_data),
                "content_format_recommendations": self._recommend_content_formats(historical_data)
            }
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"❌ Optimization recommendation generation failed: {str(e)}")
            return {"error": str(e)}
    
    def _analyze_content_themes(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze which content themes perform best."""
        try:
            # Extract content performance data
            content_performance = data.get("content_performance", {})
            
            # Analyze themes in high-performing content
            theme_performance = {}
            theme_keywords = {
                "fitness": ["workout", "exercise", "gym", "health", "training", "fitness"],
                "motivation": ["inspire", "motivate", "achieve", "goal", "success", "dream"],
                "lifestyle": ["life", "daily", "routine", "experience", "journey", "living"],
                "education": ["learn", "teach", "knowledge", "skill", "tutorial", "guide"],
                "entertainment": ["fun", "funny", "laugh", "enjoy", "amazing", "cool"],
                "behind_scenes": ["behind", "process", "making", "creating", "workflow"],
                "personal": ["personal", "story", "experience", "journey", "thoughts"],
                "technical": ["technical", "code", "programming", "development", "tech"],
                "promotional": ["buy", "sale", "discount", "offer", "purchase", "deal"]
            }
            
            for content_id, performance in content_performance.items():
                content_text = performance.get("content", "").lower()
                engagement_rate = performance.get("engagement_rate", 0)
                
                for theme, keywords in theme_keywords.items():
                    if any(keyword in content_text for keyword in keywords):
                        if theme not in theme_performance:
                            theme_performance[theme] = []
                        theme_performance[theme].append(engagement_rate)
            
            # Calculate averages and sort
            theme_averages = {}
            for theme, rates in theme_performance.items():
                if rates:
                    theme_averages[theme] = sum(rates) / len(rates)
            
            sorted_themes = sorted(theme_averages.items(), key=lambda x: x[1], reverse=True)
            
            top_performing = [theme for theme, _ in sorted_themes[:3]]
            underperforming = [theme for theme, avg in sorted_themes if avg < 5.0]
            
            return {
                "top_performing_themes": top_performing,
                "underperforming_themes": underperforming,
                "theme_performance_scores": theme_averages,
                "suggested_themes": ["behind_scenes", "personal", "education"] if not top_performing else top_performing
            }
            
        except Exception as e:
            self.logger.error(f"❌ Theme analysis failed: {str(e)}")
            return {
                "top_performing_themes": ["fitness", "motivation", "lifestyle"],
                "underperforming_themes": ["technical", "promotional"],
                "suggested_themes": ["behind_scenes", "tutorials", "personal"]
            }
    
    def _analyze_timing_patterns(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze optimal posting times."""
        return {
            "best_posting_times": {
                "weekdays": ["9:00", "13:00", "18:00"],
                "weekends": ["10:00", "15:00", "20:00"]
            },
            "platform_specific": {
                "instagram": "Golden hour: 17:00-19:00",
                "x": "Peak engagement: 12:00-15:00",
                "reddit": "Evening discussions: 19:00-22:00"
            }
        }
    
    def _analyze_platform_performance(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze performance across platforms."""
        return {
            "top_performing_platforms": ["instagram", "x"],
            "growth_opportunities": ["reddit", "snapchat"],
            "resource_allocation": {
                "instagram": "40%",
                "x": "30%", 
                "reddit": "20%",
                "onlyfans": "10%"
            }
        }
    
    def _identify_engagement_drivers(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Identify what drives engagement."""
        return {
            "high_engagement_elements": [
                "Questions to audience",
                "Behind-the-scenes content",
                "User-generated content features"
            ],
            "low_engagement_elements": [
                "Direct promotional content",
                "Long-form text posts",
                "Reposted content"
            ]
        }
    
    def _recommend_content_formats(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Recommend optimal content formats per platform."""
        return {
            "instagram": ["Reels", "Carousel posts", "Stories"],
            "x": ["Thread series", "Polls", "Quote tweets"],
            "reddit": ["Discussion posts", "AMA formats", "Tutorial posts"],
            "onlyfans": ["Exclusive content", "Interactive polls", "Live streams"],
            "snapchat": ["Short video stories", "Behind-the-scenes", "Quick tutorials"]
        }
    
    def __repr__(self) -> str:
        lora_status = "✅" if self.lora_model else "❌"
        return f"ContentGenAgent(LoRA: {lora_status}, Device: {self.device}) ☠️" 