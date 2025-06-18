"""
MCP Zoho CRM Integration
=======================

Handles Zoho CRM API connections via MCP protocol.
"""

import os
from backend.mock_utils import MOCK_MODE, fetch_mcp_data

class ZohoCRMMCP:
    """MCP integration for Zoho CRM"""
    pass 

    def fetch_mcp_data(self):
        if MOCK_MODE:
            return fetch_mcp_data() 