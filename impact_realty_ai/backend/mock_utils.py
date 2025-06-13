import os
import random

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

def get_current_user(token: str = ""):
    if MOCK_MODE and not SUPABASE_LIVE:
        return MOCK_USER
    # TODO: Implement real Supabase auth validation
    return None

# Mock tool integrations (always mocked except Supabase + AI)

def send_email(to, subject, body):
    if MOCK_MODE:
        return {"status": "mocked", "message": f"Email to {to} spoofed"}
    # TODO: Implement real email sending

def fetch_crm_data(query):
    if MOCK_MODE:
        return {"contacts": [{"name": "Jane Doe", "email": "jane@example.com"}]}
    # TODO: Implement real CRM fetch

def fetch_calendar_events(user_id):
    if MOCK_MODE:
        return [{"event": "Mock Meeting", "time": "2024-06-12T10:00:00Z"}]
    # TODO: Implement real calendar fetch

def store_document(doc):
    if MOCK_MODE:
        return {"status": "mocked", "doc_id": random.randint(1000, 9999)}
    # TODO: Implement real document storage

# Mock MCP integrations (always mocked)

def fetch_mcp_data():
    if MOCK_MODE:
        return {"data": [{"id": 1, "value": "mocked MCP data"}]}
    # TODO: Implement real MCP fetch

# Database functions - use Supabase when live
def get_users():
    if SUPABASE_LIVE:
        # Frontend will handle Supabase queries directly
        return {"message": "Use Supabase client in frontend"}
    return MOCK_DB["users"]

def get_agents():
    if SUPABASE_LIVE:
        # Frontend will handle Supabase queries directly  
        return {"message": "Use Supabase client in frontend"}
    return MOCK_DB["agents"]

# Mock database (fallback when Supabase not available)
MOCK_DB = {
    "users": [MOCK_USER],
    "agents": [
        {"id": "agent-1", "type": "recruitment", "status": "active"},
        {"id": "agent-2", "type": "compliance", "status": "active"}
    ]
} 