"""
Production Supabase Service for Backend Database Operations
==========================================================

Handles all backend Supabase database operations for agent workflows
with proper error handling and connection management.
"""

import os
import logging
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
import asyncio
from supabase import create_client, Client
import asyncpg

logger = logging.getLogger(__name__)

@dataclass
class DatabaseResponse:
    """Standardized database response format"""
    data: Any
    success: bool
    error: Optional[str] = None
    count: Optional[int] = None

class SupabaseService:
    """Production Supabase service for backend operations"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self.db_pool: Optional[asyncpg.Pool] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Service role for backend
        
        if supabase_url and supabase_key:
            self.client = create_client(supabase_url, supabase_key)
            logger.info("Supabase client initialized")
        else:
            logger.warning("Supabase credentials not found - database features disabled")
    
    async def _get_db_pool(self) -> Optional[asyncpg.Pool]:
        """Get or create database connection pool"""
        if self.db_pool:
            return self.db_pool
        
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            logger.error("DATABASE_URL not found")
            return None
        
        try:
            self.db_pool = await asyncpg.create_pool(database_url)
            logger.info("Database connection pool created")
            return self.db_pool
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            return None
    
    # Agent Management Operations
    
    async def create_agent(self, agent_data: Dict[str, Any]) -> DatabaseResponse:
        """Create a new agent record"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            result = self.client.table("agents").insert(agent_data).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error creating agent: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    async def get_agents(self, filters: Optional[Dict[str, Any]] = None) -> DatabaseResponse:
        """Get agents with optional filters"""
        if not self.client:
            return DatabaseResponse(data=[], success=False, error="Supabase client not initialized")
        
        try:
            query = self.client.table("agents").select("*")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return DatabaseResponse(
                data=result.data,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error fetching agents: {e}")
            return DatabaseResponse(data=[], success=False, error=str(e))
    
    async def update_agent(self, agent_id: str, updates: Dict[str, Any]) -> DatabaseResponse:
        """Update agent record"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            result = self.client.table("agents").update(updates).eq("id", agent_id).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error updating agent {agent_id}: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    # Workflow Management Operations
    
    async def create_workflow_execution(self, workflow_data: Dict[str, Any]) -> DatabaseResponse:
        """Create workflow execution record"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            result = self.client.table("workflow_executions").insert(workflow_data).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error creating workflow execution: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    async def update_workflow_status(self, execution_id: str, status: str, results: Optional[Dict[str, Any]] = None) -> DatabaseResponse:
        """Update workflow execution status"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            updates = {"status": status}
            if results:
                updates["results"] = results
            
            result = self.client.table("workflow_executions").update(updates).eq("id", execution_id).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error updating workflow {execution_id}: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    # Recruitment Operations
    
    async def store_candidate(self, candidate_data: Dict[str, Any]) -> DatabaseResponse:
        """Store candidate information"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            result = self.client.table("candidates").insert(candidate_data).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error storing candidate: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    async def get_candidates(self, filters: Optional[Dict[str, Any]] = None) -> DatabaseResponse:
        """Get candidates with optional filters"""
        if not self.client:
            return DatabaseResponse(data=[], success=False, error="Supabase client not initialized")
        
        try:
            query = self.client.table("candidates").select("*")
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return DatabaseResponse(
                data=result.data,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error fetching candidates: {e}")
            return DatabaseResponse(data=[], success=False, error=str(e))
    
    async def update_candidate_status(self, candidate_id: str, status: str, notes: Optional[str] = None) -> DatabaseResponse:
        """Update candidate status"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            updates = {"status": status}
            if notes:
                updates["notes"] = notes
            
            result = self.client.table("candidates").update(updates).eq("id", candidate_id).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error updating candidate {candidate_id}: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    # Compliance Operations
    
    async def store_compliance_document(self, document_data: Dict[str, Any]) -> DatabaseResponse:
        """Store compliance document"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            result = self.client.table("compliance_documents").insert(document_data).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error storing compliance document: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    async def get_compliance_documents(self, deal_id: Optional[str] = None) -> DatabaseResponse:
        """Get compliance documents"""
        if not self.client:
            return DatabaseResponse(data=[], success=False, error="Supabase client not initialized")
        
        try:
            query = self.client.table("compliance_documents").select("*")
            
            if deal_id:
                query = query.eq("deal_id", deal_id)
            
            result = query.execute()
            return DatabaseResponse(
                data=result.data,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error fetching compliance documents: {e}")
            return DatabaseResponse(data=[], success=False, error=str(e))
    
    async def update_compliance_status(self, document_id: str, status: str, validation_results: Optional[Dict[str, Any]] = None) -> DatabaseResponse:
        """Update compliance document status"""
        if not self.client:
            return DatabaseResponse(data=None, success=False, error="Supabase client not initialized")
        
        try:
            updates = {"status": status}
            if validation_results:
                updates["validation_results"] = validation_results
            
            result = self.client.table("compliance_documents").update(updates).eq("id", document_id).execute()
            return DatabaseResponse(
                data=result.data[0] if result.data else None,
                success=True,
                count=len(result.data) if result.data else 0
            )
        except Exception as e:
            logger.error(f"Error updating compliance document {document_id}: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    # Analytics and Metrics
    
    async def get_system_metrics(self) -> DatabaseResponse:
        """Get system-wide metrics"""
        if not self.client:
            return DatabaseResponse(data={}, success=False, error="Supabase client not initialized")
        
        try:
            # Get counts from various tables
            agents_count = len(self.client.table("agents").select("id").execute().data)
            candidates_count = len(self.client.table("candidates").select("id").execute().data)
            workflows_count = len(self.client.table("workflow_executions").select("id").execute().data)
            
            metrics = {
                "agents_count": agents_count,
                "candidates_count": candidates_count,
                "workflows_count": workflows_count,
                "timestamp": "now()"
            }
            
            return DatabaseResponse(data=metrics, success=True)
        except Exception as e:
            logger.error(f"Error fetching system metrics: {e}")
            return DatabaseResponse(data={}, success=False, error=str(e))
    
    # Raw SQL Operations (for complex queries)
    
    async def execute_raw_query(self, query: str, params: Optional[List] = None) -> DatabaseResponse:
        """Execute raw SQL query"""
        pool = await self._get_db_pool()
        if not pool:
            return DatabaseResponse(data=None, success=False, error="Database pool not available")
        
        try:
            async with pool.acquire() as connection:
                if params:
                    result = await connection.fetch(query, *params)
                else:
                    result = await connection.fetch(query)
                
                # Convert asyncpg.Record to dict
                data = [dict(record) for record in result]
                
                return DatabaseResponse(
                    data=data,
                    success=True,
                    count=len(data)
                )
        except Exception as e:
            logger.error(f"Error executing raw query: {e}")
            return DatabaseResponse(data=None, success=False, error=str(e))
    
    def get_service_status(self) -> Dict[str, Any]:
        """Get Supabase service status"""
        return {
            "supabase_available": self.client is not None,
            "database_pool_available": self.db_pool is not None,
            "service_ready": self.client is not None
        }
    
    async def close(self):
        """Close database connections"""
        if self.db_pool:
            await self.db_pool.close()
            logger.info("Database pool closed")

# Global Supabase service instance
supabase_service = SupabaseService() 