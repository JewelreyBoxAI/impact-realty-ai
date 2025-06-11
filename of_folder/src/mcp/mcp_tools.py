"""
MCP Tools - Model Context Protocol tool wrapper for standardized API integration.

Handles:
- MCP connector standardization across platforms
- OAuth flow management and token refresh
- Rate limiting and retry logic with exponential backoff
- Webhook endpoint management
- API response normalization
- Error handling and logging
"""

from typing import Dict, List, Optional, Any, Union, Callable
from dataclasses import dataclass
from enum import Enum
import logging
import asyncio
import time
from datetime import datetime, timezone, timedelta
import json
import hashlib
import hmac
from urllib.parse import urlencode
import base64

import httpx
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from pydantic import BaseModel, Field
import jwt


class MCPProtocol(str, Enum):
    """MCP protocol types."""
    HTTP = "http"
    WEBSOCKET = "websocket"
    GRPC = "grpc"


class AuthType(str, Enum):
    """Authentication types."""
    OAUTH2 = "oauth2"
    API_KEY = "api_key"
    BEARER_TOKEN = "bearer_token"
    BASIC_AUTH = "basic_auth"
    CUSTOM = "custom"


class RateLimitStrategy(str, Enum):
    """Rate limiting strategies."""
    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"
    EXPONENTIAL_BACKOFF = "exponential_backoff"


@dataclass
class MCPConfig:
    """MCP connector configuration."""
    name: str
    protocol: MCPProtocol
    base_url: str
    auth_type: AuthType
    auth_config: Dict[str, Any]
    rate_limits: Dict[str, int]
    timeout: int = 30
    retry_config: Dict[str, Any] = None
    webhook_config: Optional[Dict[str, Any]] = None


@dataclass
class APICall:
    """API call tracking structure."""
    call_id: str
    platform: str
    endpoint: str
    method: str
    timestamp: datetime
    response_time: float
    status_code: int
    success: bool
    rate_limited: bool
    retry_count: int


@dataclass
class RateLimitState:
    """Rate limit tracking state."""
    requests_made: int
    reset_time: datetime
    window_start: datetime
    tokens_available: int
    last_request: datetime


class MCPToolWrapper:
    """
    MCP Tool Wrapper for standardized API integration across platforms.
    
    Features:
    - Unified API interface across all social platforms
    - OAuth 2.0 flow management with automatic token refresh
    - Intelligent rate limiting with multiple strategies
    - Exponential backoff retry logic
    - Webhook endpoint management
    - Request/response normalization
    - Comprehensive error handling and logging
    
    Rick's signature: API mastery, zero friction ☠️
    """
    
    def __init__(
        self,
        platform_name: str,
        config: Optional[MCPConfig] = None,
        default_timeout: int = 30,
        max_retries: int = 3,
        log_level: str = "INFO"
    ):
        """Initialize MCP Tool Wrapper for a specific platform."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level, platform_name)
        self.logger.info(f"🔧 MCPToolWrapper initializing for {platform_name} ☠️")
        
        self.platform_name = platform_name
        self.config = config or self._get_default_config(platform_name)
        self.default_timeout = default_timeout
        self.max_retries = max_retries
        
        # Authentication state
        self.auth_tokens = {}
        self.token_expires_at = None
        
        # Rate limiting state
        self.rate_limit_state = RateLimitState(
            requests_made=0,
            reset_time=datetime.now(timezone.utc),
            window_start=datetime.now(timezone.utc),
            tokens_available=1000,
            last_request=datetime.now(timezone.utc)
        )
        
        # Request tracking
        self.api_calls = []
        self.total_calls = 0
        self.failed_calls = 0
        
        # HTTP session with retry logic
        self.session = self._create_session()
        
        # Async HTTP client
        self.async_client = None
        
        # Webhook state
        self.webhook_handlers = {}
        
        self.logger.info(f"✅ MCPToolWrapper initialized for {platform_name}")
    
    def _setup_logging(self, level: str, platform: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.{platform.upper()}")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            f'%(asctime)s - ☠️ MCP-{platform.upper()} - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _get_default_config(self, platform_name: str) -> MCPConfig:
        """Get default configuration for known platforms."""
        
        configs = {
            "x": MCPConfig(
                name="X (Twitter)",
                protocol=MCPProtocol.HTTP,
                base_url="https://api.twitter.com/2",
                auth_type=AuthType.OAUTH2,
                auth_config={
                    "client_id": "",
                    "client_secret": "",
                    "redirect_uri": "http://localhost:8080/callback",
                    "scope": "tweet.read tweet.write users.read"
                },
                rate_limits={
                    "tweets": 300,  # per 15 minutes
                    "users": 75,
                    "default": 100
                },
                retry_config={
                    "max_retries": 3,
                    "backoff_factor": 1,
                    "status_codes": [429, 500, 502, 503, 504]
                }
            ),
            
            "instagram": MCPConfig(
                name="Instagram",
                protocol=MCPProtocol.HTTP,
                base_url="https://graph.instagram.com",
                auth_type=AuthType.OAUTH2,
                auth_config={
                    "client_id": "",
                    "client_secret": "",
                    "redirect_uri": "http://localhost:8080/callback",
                    "scope": "instagram_basic,instagram_content_publish"
                },
                rate_limits={
                    "media": 200,  # per hour
                    "publishing": 25,  # per day
                    "default": 200
                }
            ),
            
            "reddit": MCPConfig(
                name="Reddit",
                protocol=MCPProtocol.HTTP,
                base_url="https://oauth.reddit.com",
                auth_type=AuthType.OAUTH2,
                auth_config={
                    "client_id": "",
                    "client_secret": "",
                    "redirect_uri": "http://localhost:8080/callback",
                    "scope": "submit read identity"
                },
                rate_limits={
                    "default": 60  # per minute
                }
            ),
            
            "onlyfans": MCPConfig(
                name="OnlyFans",
                protocol=MCPProtocol.HTTP,
                base_url="https://onlyfans.com/api2/v2",
                auth_type=AuthType.CUSTOM,
                auth_config={
                    "session_id": "",
                    "user_agent": "",
                    "x_bc": ""
                },
                rate_limits={
                    "default": 30  # per minute (estimated)
                }
            ),
            
            "snapchat": MCPConfig(
                name="Snapchat",
                protocol=MCPProtocol.HTTP,
                base_url="https://adsapi.snapchat.com/v1",
                auth_type=AuthType.OAUTH2,
                auth_config={
                    "client_id": "",
                    "client_secret": "",
                    "redirect_uri": "http://localhost:8080/callback",
                    "scope": "snapchat-marketing-api"
                },
                rate_limits={
                    "default": 1000  # per hour
                }
            )
        }
        
        return configs.get(platform_name, MCPConfig(
            name=platform_name.title(),
            protocol=MCPProtocol.HTTP,
            base_url="https://api.example.com",
            auth_type=AuthType.API_KEY,
            auth_config={"api_key": ""},
            rate_limits={"default": 100}
        ))
    
    def _create_session(self) -> requests.Session:
        """Create HTTP session with retry logic."""
        session = requests.Session()
        
        # Configure retry strategy
        retry_config = self.config.retry_config or {}
        retry_strategy = Retry(
            total=retry_config.get("max_retries", self.max_retries),
            backoff_factor=retry_config.get("backoff_factor", 1),
            status_forcelist=retry_config.get("status_codes", [429, 500, 502, 503, 504]),
            allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set default timeout
        session.timeout = self.config.timeout
        
        return session
    
    async def _get_async_client(self) -> httpx.AsyncClient:
        """Get or create async HTTP client."""
        if not self.async_client:
            self.async_client = httpx.AsyncClient(
                timeout=self.config.timeout,
                limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
            )
        return self.async_client
    
    async def authenticate(self, credentials: Optional[Dict[str, str]] = None) -> bool:
        """Authenticate with the platform API."""
        try:
            self.logger.info(f"🔐 Authenticating with {self.config.name}")
            
            if self.config.auth_type == AuthType.OAUTH2:
                return await self._oauth2_flow(credentials)
            elif self.config.auth_type == AuthType.API_KEY:
                return self._api_key_auth(credentials)
            elif self.config.auth_type == AuthType.BEARER_TOKEN:
                return self._bearer_token_auth(credentials)
            elif self.config.auth_type == AuthType.BASIC_AUTH:
                return self._basic_auth(credentials)
            elif self.config.auth_type == AuthType.CUSTOM:
                return self._custom_auth(credentials)
            else:
                self.logger.error(f"❌ Unsupported auth type: {self.config.auth_type}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Authentication failed: {str(e)}")
            return False
    
    async def _oauth2_flow(self, credentials: Optional[Dict[str, str]]) -> bool:
        """Handle OAuth 2.0 authentication flow."""
        try:
            # Check if we have valid tokens
            if self._has_valid_tokens():
                return True
            
            # Check for refresh token
            if "refresh_token" in self.auth_tokens:
                return await self._refresh_oauth_token()
            
            # Need to start new OAuth flow
            if not credentials or "authorization_code" not in credentials:
                auth_url = self._generate_auth_url()
                self.logger.info(f"🌐 OAuth URL: {auth_url}")
                return False  # User needs to complete OAuth flow
            
            # Exchange authorization code for tokens
            return await self._exchange_auth_code(credentials["authorization_code"])
            
        except Exception as e:
            self.logger.error(f"❌ OAuth flow failed: {str(e)}")
            return False
    
    def _generate_auth_url(self) -> str:
        """Generate OAuth authorization URL."""
        auth_config = self.config.auth_config
        
        params = {
            "response_type": "code",
            "client_id": auth_config["client_id"],
            "redirect_uri": auth_config["redirect_uri"],
            "scope": auth_config["scope"],
            "state": self._generate_state()
        }
        
        if self.platform_name == "x":
            auth_base = "https://twitter.com/i/oauth2/authorize"
            params["code_challenge"] = self._generate_code_challenge()
            params["code_challenge_method"] = "S256"
        elif self.platform_name == "instagram":
            auth_base = "https://api.instagram.com/oauth/authorize"
        elif self.platform_name == "reddit":
            auth_base = "https://www.reddit.com/api/v1/authorize"
            params["duration"] = "permanent"
        else:
            auth_base = f"{self.config.base_url}/oauth/authorize"
        
        return f"{auth_base}?{urlencode(params)}"
    
    def _generate_state(self) -> str:
        """Generate OAuth state parameter."""
        import secrets
        return secrets.token_urlsafe(32)
    
    def _generate_code_challenge(self) -> str:
        """Generate PKCE code challenge."""
        import secrets
        import base64
        import hashlib
        
        code_verifier = secrets.token_urlsafe(96)
        code_challenge = base64.urlsafe_b64encode(
            hashlib.sha256(code_verifier.encode()).digest()
        ).decode().rstrip('=')
        
        # Store code verifier for token exchange
        self.auth_tokens["code_verifier"] = code_verifier
        
        return code_challenge
    
    async def _exchange_auth_code(self, auth_code: str) -> bool:
        """Exchange authorization code for access tokens."""
        auth_config = self.config.auth_config
        
        data = {
            "grant_type": "authorization_code",
            "code": auth_code,
            "redirect_uri": auth_config["redirect_uri"],
            "client_id": auth_config["client_id"],
            "client_secret": auth_config["client_secret"]
        }
        
        # Add platform-specific parameters
        if self.platform_name == "x" and "code_verifier" in self.auth_tokens:
            data["code_verifier"] = self.auth_tokens["code_verifier"]
        
        token_url = f"{self.config.base_url}/oauth2/token"
        if self.platform_name == "reddit":
            token_url = "https://www.reddit.com/api/v1/access_token"
        elif self.platform_name == "instagram":
            token_url = "https://api.instagram.com/oauth/access_token"
        
        client = await self._get_async_client()
        response = await client.post(token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.auth_tokens.update(token_data)
            
            # Calculate token expiry
            if "expires_in" in token_data:
                self.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_data["expires_in"])
            
            self.logger.info("✅ OAuth tokens obtained successfully")
            return True
        else:
            self.logger.error(f"❌ Token exchange failed: {response.status_code} - {response.text}")
            return False
    
    async def _refresh_oauth_token(self) -> bool:
        """Refresh OAuth access token."""
        if "refresh_token" not in self.auth_tokens:
            return False
        
        auth_config = self.config.auth_config
        
        data = {
            "grant_type": "refresh_token",
            "refresh_token": self.auth_tokens["refresh_token"],
            "client_id": auth_config["client_id"],
            "client_secret": auth_config["client_secret"]
        }
        
        token_url = f"{self.config.base_url}/oauth2/token"
        
        client = await self._get_async_client()
        response = await client.post(token_url, data=data)
        
        if response.status_code == 200:
            token_data = response.json()
            self.auth_tokens.update(token_data)
            
            if "expires_in" in token_data:
                self.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_data["expires_in"])
            
            self.logger.info("✅ OAuth tokens refreshed successfully")
            return True
        else:
            self.logger.error(f"❌ Token refresh failed: {response.status_code}")
            return False
    
    def _has_valid_tokens(self) -> bool:
        """Check if we have valid access tokens."""
        if "access_token" not in self.auth_tokens:
            return False
        
        if self.token_expires_at and datetime.now(timezone.utc) >= self.token_expires_at:
            return False
        
        return True
    
    def _api_key_auth(self, credentials: Optional[Dict[str, str]]) -> bool:
        """Handle API key authentication."""
        if not credentials or "api_key" not in credentials:
            self.logger.error("❌ API key not provided")
            return False
        
        self.auth_tokens["api_key"] = credentials["api_key"]
        self.logger.info("✅ API key authentication configured")
        return True
    
    def _bearer_token_auth(self, credentials: Optional[Dict[str, str]]) -> bool:
        """Handle Bearer token authentication."""
        if not credentials or "bearer_token" not in credentials:
            self.logger.error("❌ Bearer token not provided")
            return False
        
        self.auth_tokens["bearer_token"] = credentials["bearer_token"]
        self.logger.info("✅ Bearer token authentication configured")
        return True
    
    def _basic_auth(self, credentials: Optional[Dict[str, str]]) -> bool:
        """Handle Basic authentication."""
        if not credentials or "username" not in credentials or "password" not in credentials:
            self.logger.error("❌ Username/password not provided")
            return False
        
        auth_string = base64.b64encode(
            f"{credentials['username']}:{credentials['password']}".encode()
        ).decode()
        
        self.auth_tokens["basic_auth"] = auth_string
        self.logger.info("✅ Basic authentication configured")
        return True
    
    def _custom_auth(self, credentials: Optional[Dict[str, str]]) -> bool:
        """Handle custom authentication (platform-specific)."""
        if not credentials:
            self.logger.error("❌ Custom credentials not provided")
            return False
        
        # Store all provided credentials for custom auth
        self.auth_tokens.update(credentials)
        self.logger.info("✅ Custom authentication configured")
        return True
    
    def _get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for requests."""
        headers = {}
        
        if self.config.auth_type == AuthType.OAUTH2 and "access_token" in self.auth_tokens:
            headers["Authorization"] = f"Bearer {self.auth_tokens['access_token']}"
        elif self.config.auth_type == AuthType.API_KEY and "api_key" in self.auth_tokens:
            headers["X-API-Key"] = self.auth_tokens["api_key"]
        elif self.config.auth_type == AuthType.BEARER_TOKEN and "bearer_token" in self.auth_tokens:
            headers["Authorization"] = f"Bearer {self.auth_tokens['bearer_token']}"
        elif self.config.auth_type == AuthType.BASIC_AUTH and "basic_auth" in self.auth_tokens:
            headers["Authorization"] = f"Basic {self.auth_tokens['basic_auth']}"
        elif self.config.auth_type == AuthType.CUSTOM:
            # Platform-specific custom headers
            if self.platform_name == "onlyfans":
                headers.update({
                    "Cookie": f"sess={self.auth_tokens.get('session_id', '')}",
                    "User-Agent": self.auth_tokens.get("user_agent", ""),
                    "x-bc": self.auth_tokens.get("x_bc", "")
                })
        
        return headers
    
    async def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Make authenticated API request with rate limiting and retries."""
        
        # Check rate limits
        if not await self._check_rate_limits(endpoint):
            return {"error": "Rate limit exceeded", "retry_after": self._get_retry_after()}
        
        # Ensure authentication
        if not await self._ensure_authenticated():
            return {"error": "Authentication failed"}
        
        # Prepare request
        url = f"{self.config.base_url}/{endpoint.lstrip('/')}"
        request_headers = self._get_auth_headers()
        if headers:
            request_headers.update(headers)
        
        # Add platform-specific headers
        request_headers.update(self._get_platform_headers())
        
        # Track API call
        call_id = f"{self.platform_name}_{int(time.time() * 1000)}"
        start_time = time.time()
        
        try:
            client = await self._get_async_client()
            
            # Make request
            if method.upper() == "GET":
                response = await client.get(url, params=params, headers=request_headers)
            elif method.upper() == "POST":
                if files:
                    response = await client.post(url, data=data, files=files, headers=request_headers)
                else:
                    response = await client.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = await client.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = await client.delete(url, headers=request_headers)
            else:
                return {"error": f"Unsupported HTTP method: {method}"}
            
            # Calculate response time
            response_time = time.time() - start_time
            
            # Track the call
            api_call = APICall(
                call_id=call_id,
                platform=self.platform_name,
                endpoint=endpoint,
                method=method.upper(),
                timestamp=datetime.now(timezone.utc),
                response_time=response_time,
                status_code=response.status_code,
                success=response.status_code < 400,
                rate_limited=response.status_code == 429,
                retry_count=0
            )
            
            self._track_api_call(api_call)
            
            # Handle response
            if response.status_code == 429:
                # Rate limited
                self.logger.warning(f"⚠️ Rate limited on {endpoint}")
                return {"error": "Rate limited", "retry_after": self._parse_retry_after(response)}
            elif response.status_code >= 400:
                # Error response
                self.logger.error(f"❌ API error {response.status_code} on {endpoint}: {response.text}")
                return {"error": f"API error {response.status_code}", "details": response.text}
            else:
                # Success
                self.logger.info(f"✅ API call successful: {method} {endpoint} ({response_time:.2f}s)")
                
                try:
                    return response.json()
                except:
                    return {"success": True, "text": response.text}
                    
        except Exception as e:
            # Track failed call
            api_call = APICall(
                call_id=call_id,
                platform=self.platform_name,
                endpoint=endpoint,
                method=method.upper(),
                timestamp=datetime.now(timezone.utc),
                response_time=time.time() - start_time,
                status_code=0,
                success=False,
                rate_limited=False,
                retry_count=0
            )
            
            self._track_api_call(api_call)
            
            self.logger.error(f"❌ Request failed: {str(e)}")
            return {"error": str(e)}
    
    async def _check_rate_limits(self, endpoint: str) -> bool:
        """Check if request is within rate limits."""
        now = datetime.now(timezone.utc)
        
        # Get rate limit for endpoint
        endpoint_key = self._get_rate_limit_key(endpoint)
        rate_limit = self.config.rate_limits.get(endpoint_key, self.config.rate_limits.get("default", 100))
        
        # Simple fixed window rate limiting
        if now >= self.rate_limit_state.reset_time:
            # Reset window
            self.rate_limit_state.requests_made = 0
            self.rate_limit_state.reset_time = now + timedelta(minutes=15)  # Standard 15-minute window
            self.rate_limit_state.window_start = now
        
        # Check if under limit
        if self.rate_limit_state.requests_made >= rate_limit:
            return False
        
        # Increment counter
        self.rate_limit_state.requests_made += 1
        self.rate_limit_state.last_request = now
        
        return True
    
    def _get_rate_limit_key(self, endpoint: str) -> str:
        """Get rate limit key for endpoint."""
        # Extract key from endpoint path
        if "tweets" in endpoint or "statuses" in endpoint:
            return "tweets"
        elif "users" in endpoint:
            return "users"
        elif "media" in endpoint:
            return "media"
        else:
            return "default"
    
    def _get_retry_after(self) -> int:
        """Get retry after seconds for rate limiting."""
        now = datetime.now(timezone.utc)
        return int((self.rate_limit_state.reset_time - now).total_seconds())
    
    def _parse_retry_after(self, response) -> int:
        """Parse retry-after header from response."""
        retry_after = response.headers.get("Retry-After")
        if retry_after:
            try:
                return int(retry_after)
            except:
                pass
        
        # Default to window reset time
        return self._get_retry_after()
    
    async def _ensure_authenticated(self) -> bool:
        """Ensure we have valid authentication."""
        if self.config.auth_type == AuthType.OAUTH2:
            if not self._has_valid_tokens():
                return await self._refresh_oauth_token()
        
        return bool(self.auth_tokens)
    
    def _get_platform_headers(self) -> Dict[str, str]:
        """Get platform-specific headers."""
        headers = {}
        
        if self.platform_name == "x":
            headers["User-Agent"] = "AgenticSocialMediaBot/1.0"
        elif self.platform_name == "reddit":
            headers["User-Agent"] = "AgenticSocialMedia:1.0 (by /u/RickAI)"
        elif self.platform_name == "instagram":
            headers["User-Agent"] = "Instagram/1.0"
        
        return headers
    
    def _track_api_call(self, api_call: APICall):
        """Track API call for analytics."""
        self.api_calls.append(api_call)
        self.total_calls += 1
        
        if not api_call.success:
            self.failed_calls += 1
        
        # Keep only recent calls (last 1000)
        if len(self.api_calls) > 1000:
            self.api_calls = self.api_calls[-1000:]
    
    def setup_webhook(
        self,
        event_type: str,
        callback_url: str,
        secret: Optional[str] = None
    ) -> Dict[str, Any]:
        """Setup webhook for real-time events."""
        try:
            webhook_config = {
                "event_type": event_type,
                "callback_url": callback_url,
                "secret": secret or self._generate_webhook_secret(),
                "created_at": datetime.now(timezone.utc)
            }
            
            # Platform-specific webhook setup
            if self.platform_name == "x":
                # Twitter webhook setup
                webhook_config["challenge_response_check"] = True
            elif self.platform_name == "instagram":
                # Instagram webhook setup
                webhook_config["verify_token"] = secret
            
            self.webhook_handlers[event_type] = webhook_config
            
            self.logger.info(f"🎣 Webhook setup for {event_type}: {callback_url}")
            return {"success": True, "webhook_config": webhook_config}
            
        except Exception as e:
            self.logger.error(f"❌ Webhook setup failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _generate_webhook_secret(self) -> str:
        """Generate webhook secret."""
        import secrets
        return secrets.token_urlsafe(32)
    
    def verify_webhook_signature(
        self,
        payload: str,
        signature: str,
        event_type: str
    ) -> bool:
        """Verify webhook signature."""
        try:
            webhook_config = self.webhook_handlers.get(event_type)
            if not webhook_config or not webhook_config.get("secret"):
                return False
            
            secret = webhook_config["secret"]
            
            # Platform-specific signature verification
            if self.platform_name == "x":
                # Twitter uses SHA256 HMAC
                expected_signature = hmac.new(
                    secret.encode(),
                    payload.encode(),
                    hashlib.sha256
                ).hexdigest()
                return hmac.compare_digest(f"sha256={expected_signature}", signature)
            elif self.platform_name == "instagram":
                # Instagram uses SHA1 HMAC
                expected_signature = hmac.new(
                    secret.encode(),
                    payload.encode(),
                    hashlib.sha1
                ).hexdigest()
                return hmac.compare_digest(expected_signature, signature)
            else:
                # Generic HMAC verification
                expected_signature = hmac.new(
                    secret.encode(),
                    payload.encode(),
                    hashlib.sha256
                ).hexdigest()
                return hmac.compare_digest(expected_signature, signature)
                
        except Exception as e:
            self.logger.error(f"❌ Webhook signature verification failed: {str(e)}")
            return False
    
    def get_api_stats(self) -> Dict[str, Any]:
        """Get API usage statistics."""
        if not self.api_calls:
            return {"message": "No API calls recorded"}
        
        recent_calls = [call for call in self.api_calls if 
                       (datetime.now(timezone.utc) - call.timestamp).total_seconds() < 3600]
        
        successful_calls = [call for call in recent_calls if call.success]
        failed_calls = [call for call in recent_calls if not call.success]
        
        avg_response_time = 0
        if recent_calls:
            avg_response_time = sum(call.response_time for call in recent_calls) / len(recent_calls)
        
        return {
            "total_calls": self.total_calls,
            "recent_calls_1h": len(recent_calls),
            "success_rate": len(successful_calls) / len(recent_calls) if recent_calls else 0,
            "average_response_time": round(avg_response_time, 3),
            "rate_limit_state": {
                "requests_made": self.rate_limit_state.requests_made,
                "reset_time": self.rate_limit_state.reset_time.isoformat(),
                "requests_remaining": max(0, self.config.rate_limits.get("default", 100) - self.rate_limit_state.requests_made)
            },
            "authentication_status": "valid" if self._has_valid_tokens() else "invalid",
            "webhooks_configured": len(self.webhook_handlers)
        }
    
    async def close(self):
        """Close HTTP clients and cleanup."""
        if self.async_client:
            await self.async_client.aclose()
        
        if hasattr(self.session, 'close'):
            self.session.close()
        
        self.logger.info(f"🔐 MCPToolWrapper closed for {self.platform_name}")
    
    def __repr__(self) -> str:
        auth_status = "🟢" if self._has_valid_tokens() else "🔴"
        calls = len(self.api_calls)
        return f"MCPToolWrapper({self.platform_name}, Auth: {auth_status}, Calls: {calls}) ☠️" 