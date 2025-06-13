import os
import random
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Configuration: Allow Supabase + AI to be live, mock everything else
MOCK_MODE = os.environ.get("MOCK_MODE", "true").lower() == "true"
SUPABASE_LIVE = True  # Always use live Supabase database
AI_LIVE = True        # Always use live OpenAI/Claude APIs

# Mock user for authentication (when not using Supabase auth)
MOCK_USER = {
    "id": "test-user",
    "email": "test@example.com",
    "name": "Test User",
    "role": "admin"
}

def get_current_user(token: str = "") -> Optional[Dict[str, Any]]:
    """Get current user from Supabase auth or return mock user"""
    if MOCK_MODE and not SUPABASE_LIVE:
        return MOCK_USER
    
    # Production Supabase auth validation
    if not token:
        logger.warning("No auth token provided")
        return None
    
    try:
        # In production, this would validate the JWT token with Supabase
        # For now, return mock user since frontend handles Supabase auth directly
        return MOCK_USER
    except Exception as e:
        logger.error(f"Auth validation error: {e}")
        return None

# Mock tool integrations (always mocked except Supabase + AI)

def send_email(to: str, subject: str, body: str) -> Dict[str, Any]:
    """Mock email sending - Zoho Mail integration mocked"""
    if MOCK_MODE:
        logger.info(f"MOCK: Email sent to {to} with subject '{subject}'")
        return {"status": "mocked", "message": f"Email to {to} spoofed", "email_id": f"mock_{random.randint(1000, 9999)}"}
    
    # Real email implementation would go here
    raise NotImplementedError("Real email sending not implemented - use mock mode")

def fetch_crm_data(query: str) -> Dict[str, Any]:
    """Mock CRM data fetch - Zoho CRM integration mocked"""
    if MOCK_MODE:
        mock_contacts = [
            {"name": "Jane Doe", "email": "jane@example.com", "phone": "+1-555-0123", "status": "qualified"},
            {"name": "John Smith", "email": "john@example.com", "phone": "+1-555-0124", "status": "prospect"},
            {"name": "Sarah Wilson", "email": "sarah@example.com", "phone": "+1-555-0125", "status": "active"}
        ]
        logger.info(f"MOCK: CRM query '{query}' returned {len(mock_contacts)} contacts")
        return {"contacts": mock_contacts, "total": len(mock_contacts)}
    
    # Real CRM implementation would go here
    raise NotImplementedError("Real CRM integration not implemented - use mock mode")

def fetch_calendar_events(user_id: str) -> Dict[str, Any]:
    """Mock calendar events fetch - Google Calendar integration mocked"""
    if MOCK_MODE:
        mock_events = [
            {"event": "Client Meeting", "time": "2024-06-12T10:00:00Z", "duration": 60},
            {"event": "Property Showing", "time": "2024-06-12T14:00:00Z", "duration": 90},
            {"event": "Team Standup", "time": "2024-06-13T09:00:00Z", "duration": 30}
        ]
        logger.info(f"MOCK: Calendar events for user {user_id}: {len(mock_events)} events")
        return {"events": mock_events, "user_id": user_id}
    
    # Real calendar implementation would go here
    raise NotImplementedError("Real calendar integration not implemented - use mock mode")

def store_document(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Mock document storage - File storage integration mocked"""
    if MOCK_MODE:
        doc_id = random.randint(1000, 9999)
        logger.info(f"MOCK: Document stored with ID {doc_id}")
        return {"status": "mocked", "doc_id": doc_id, "filename": doc.get("filename", "unknown")}
    
    # Real document storage implementation would go here
    raise NotImplementedError("Real document storage not implemented - use mock mode")

# Mock MCP integrations (always mocked)

def fetch_mcp_data() -> Dict[str, Any]:
    """Mock MCP data fetch - MCP protocol integration mocked"""
    if MOCK_MODE:
        mock_data = [
            {"id": 1, "value": "mocked MCP data", "type": "recruitment"},
            {"id": 2, "value": "mocked compliance data", "type": "compliance"},
            {"id": 3, "value": "mocked assistant data", "type": "assistant"}
        ]
        logger.info(f"MOCK: MCP data fetch returned {len(mock_data)} items")
        return {"data": mock_data, "status": "success"}
    
    # Real MCP implementation would go here
    raise NotImplementedError("Real MCP integration not implemented - use mock mode")

# Database functions - use Supabase when live
def get_users() -> Dict[str, Any]:
    """Get users from Supabase or mock data"""
    if SUPABASE_LIVE:
        # Frontend handles Supabase queries directly via the client
        logger.info("Users should be fetched via Supabase client in frontend")
        return {"message": "Use Supabase client in frontend", "users": [MOCK_USER]}
    
    return {"users": MOCK_DB["users"]}

def get_agents() -> Dict[str, Any]:
    """Get agents from Supabase or mock data"""
    if SUPABASE_LIVE:
        # Frontend handles Supabase queries directly via the client
        logger.info("Agents should be fetched via Supabase client in frontend")
        return {"message": "Use Supabase client in frontend", "agents": MOCK_DB["agents"]}
    
    return {"agents": MOCK_DB["agents"]}

# Mock database (fallback when Supabase not available)
MOCK_DB = {
    "users": [MOCK_USER],
    "agents": [
        {"id": "agent-1", "type": "recruitment", "status": "active", "name": "Recruitment Agent"},
        {"id": "agent-2", "type": "compliance", "status": "active", "name": "Compliance Agent"},
        {"id": "agent-3", "type": "assistant", "status": "active", "name": "Kevin's Assistant"}
    ]
} 