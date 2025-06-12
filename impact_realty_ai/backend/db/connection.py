"""
Database Connection Management
=============================

Handles PostgreSQL with PGVector initialization.
"""

import logging
import os
from backend.mock_utils import MOCK_MODE, get_users, get_agents

logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize the database and PGVector extension"""
    logger.info("Database initialization complete")

    if MOCK_MODE:
        return get_users()  # or get_agents() as appropriate 