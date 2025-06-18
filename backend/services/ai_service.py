"""
Production AI Service for OpenAI and Claude Integration
======================================================

Handles all AI API calls for agent workflows with proper error handling,
rate limiting, and response formatting.
"""

import os
import asyncio
import logging
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
import openai
import anthropic
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

@dataclass
class AIResponse:
    """Standardized AI response format"""
    content: str
    model: str
    usage: Dict[str, int]
    success: bool
    error: Optional[str] = None

class AIService:
    """Production AI service for OpenAI and Claude integration"""
    
    def __init__(self):
        self.openai_client = None
        self.anthropic_client = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize AI clients with API keys"""
        # OpenAI client
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            self.openai_client = openai.AsyncOpenAI(api_key=openai_key)
            logger.info("OpenAI client initialized")
        else:
            logger.warning("OPENAI_API_KEY not found - OpenAI features disabled")
        
        # Anthropic client
        anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_key:
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=anthropic_key)
            logger.info("Anthropic client initialized")
        else:
            logger.warning("ANTHROPIC_API_KEY not found - Claude features disabled")
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def chat_completion_openai(
        self, 
        messages: List[Dict[str, str]], 
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> AIResponse:
        """OpenAI chat completion with retry logic"""
        if not self.openai_client:
            return AIResponse(
                content="", 
                model=model, 
                usage={}, 
                success=False, 
                error="OpenAI client not initialized"
            )
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return AIResponse(
                content=response.choices[0].message.content,
                model=model,
                usage={
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                success=True
            )
            
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return AIResponse(
                content="",
                model=model,
                usage={},
                success=False,
                error=str(e)
            )
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def chat_completion_claude(
        self,
        messages: List[Dict[str, str]],
        model: str = "claude-3-sonnet-20240229",
        temperature: float = 0.7,
        max_tokens: int = 1000
    ) -> AIResponse:
        """Claude chat completion with retry logic"""
        if not self.anthropic_client:
            return AIResponse(
                content="",
                model=model,
                usage={},
                success=False,
                error="Anthropic client not initialized"
            )
        
        try:
            # Convert messages to Claude format
            claude_messages = []
            system_message = ""
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                else:
                    claude_messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_message if system_message else None,
                messages=claude_messages
            )
            
            return AIResponse(
                content=response.content[0].text,
                model=model,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                },
                success=True
            )
            
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return AIResponse(
                content="",
                model=model,
                usage={},
                success=False,
                error=str(e)
            )
    
    async def generate_recruitment_content(self, candidate_data: Dict[str, Any]) -> AIResponse:
        """Generate recruitment content using AI"""
        messages = [
            {
                "role": "system",
                "content": "You are a professional real estate recruitment specialist. Generate personalized outreach content for potential real estate agents."
            },
            {
                "role": "user",
                "content": f"Generate a professional recruitment message for a candidate with the following profile: {candidate_data}"
            }
        ]
        
        # Use OpenAI by default, fallback to Claude
        response = await self.chat_completion_openai(messages, model="gpt-4", max_tokens=500)
        
        if not response.success and self.anthropic_client:
            logger.info("OpenAI failed, trying Claude...")
            response = await self.chat_completion_claude(messages, max_tokens=500)
        
        return response
    
    async def analyze_compliance_document(self, document_content: str) -> AIResponse:
        """Analyze compliance documents using AI"""
        messages = [
            {
                "role": "system",
                "content": "You are a real estate compliance expert. Analyze documents for compliance issues, missing signatures, and commission calculations."
            },
            {
                "role": "user",
                "content": f"Analyze this real estate document for compliance: {document_content[:2000]}..."
            }
        ]
        
        # Use Claude for document analysis (better at long text)
        response = await self.chat_completion_claude(messages, model="claude-3-sonnet-20240229", max_tokens=1000)
        
        if not response.success and self.openai_client:
            logger.info("Claude failed, trying OpenAI...")
            response = await self.chat_completion_openai(messages, model="gpt-4", max_tokens=1000)
        
        return response
    
    async def generate_kevin_assistant_response(self, request: str, context: Dict[str, Any]) -> AIResponse:
        """Generate Kevin's assistant responses"""
        messages = [
            {
                "role": "system",
                "content": "You are Kevin's AI assistant for Impact Realty. You help with email management, scheduling, and real estate operations. Be professional and concise."
            },
            {
                "role": "user",
                "content": f"Request: {request}\nContext: {context}"
            }
        ]
        
        # Use OpenAI for assistant tasks
        response = await self.chat_completion_openai(messages, model="gpt-4", max_tokens=800)
        
        if not response.success and self.anthropic_client:
            logger.info("OpenAI failed, trying Claude...")
            response = await self.chat_completion_claude(messages, max_tokens=800)
        
        return response
    
    async def batch_process_requests(self, requests: List[Dict[str, Any]]) -> List[AIResponse]:
        """Process multiple AI requests in parallel"""
        tasks = []
        
        for request in requests:
            request_type = request.get("type")
            
            if request_type == "recruitment":
                task = self.generate_recruitment_content(request.get("data", {}))
            elif request_type == "compliance":
                task = self.analyze_compliance_document(request.get("data", ""))
            elif request_type == "assistant":
                task = self.generate_kevin_assistant_response(
                    request.get("request", ""), 
                    request.get("context", {})
                )
            else:
                # Create a failed response for unknown types
                task = asyncio.create_task(asyncio.coroutine(lambda: AIResponse(
                    content="", 
                    model="unknown", 
                    usage={}, 
                    success=False, 
                    error=f"Unknown request type: {request_type}"
                ))())
            
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to failed responses
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                processed_results.append(AIResponse(
                    content="",
                    model="error",
                    usage={},
                    success=False,
                    error=str(result)
                ))
            else:
                processed_results.append(result)
        
        return processed_results
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get AI service status"""
        return {
            "openai_available": self.openai_client is not None,
            "claude_available": self.anthropic_client is not None,
            "service_ready": self.openai_client is not None or self.anthropic_client is not None
        }

# Global AI service instance
ai_service = AIService() 