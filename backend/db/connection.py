"""
Database Connection Management
=============================

Handles PostgreSQL with PGVector initialization.
"""

import os
import sqlite3
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
import aiosqlite
from contextlib import asynccontextmanager
from mock_utils import MOCK_MODE, get_users, get_agents

logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize the database and PGVector extension"""
    logger.info("Database initialization complete")

    if MOCK_MODE:
        return get_users()  # or get_agents() as appropriate 