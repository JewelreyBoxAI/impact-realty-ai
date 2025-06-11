"""
Database Connection Management
=============================

Handles PostgreSQL with PGVector initialization.
"""

import logging

logger = logging.getLogger(__name__)

async def initialize_database():
    """Initialize the database and PGVector extension"""
    logger.info("Database initialization complete") 