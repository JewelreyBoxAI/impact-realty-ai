"""
Memory Manager for Agentic Social Media Architecture

Enhanced with PostgreSQL + Azure Cognitive Search + Google Vertex AI hybrid solution.
Removes Redis and ChromaDB dependencies for enterprise-grade vector storage.

Rick's signature: Memory management, cloud-native excellence ☠️
"""

import asyncio
import json
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import openai
from psycopg2.extras import Json
from sqlalchemy import create_engine, text
from pydantic import BaseModel, Field

# Azure Cognitive Search
from azure.search.documents import SearchClient
from azure.search.documents.indexes import SearchIndexClient
from azure.search.documents.models import VectorizedQuery
from azure.core.credentials import AzureKeyCredential

# Google Vertex AI
from google.cloud import aiplatform


class MemoryType(str):
    """Types of memory storage."""
    SHORT_TERM = "short_term"       # PostgreSQL session storage
    LONG_TERM = "long_term"         # PostgreSQL persistent storage
    VECTOR_SEARCH = "vector_search" # Azure Cognitive Search
    SEMANTIC_CACHE = "semantic_cache" # Vertex AI embeddings


class MemoryEntry(BaseModel):
    """Memory entry structure."""
    memory_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content: str
    memory_type: MemoryType
    platform: Optional[str] = None
    persona_context: Optional[Dict[str, Any]] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    embeddings: Optional[List[float]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class PostgreSQLVectorStore:
    """PostgreSQL with pgvector extension for vector storage."""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = create_engine(database_url)
        self.logger = logging.getLogger(__name__)
        self._initialize_tables()
    
    def _initialize_tables(self):
        """Initialize PostgreSQL tables with vector support."""
        with self.engine.connect() as conn:
            # Enable pgvector extension
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            
            # Create memory table with vector column
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS memory_entries (
                    memory_id UUID PRIMARY KEY,
                    content TEXT NOT NULL,
                    memory_type VARCHAR(50) NOT NULL,
                    platform VARCHAR(50),
                    persona_context JSONB,
                    performance_metrics JSONB,
                    embeddings vector(1536),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    expires_at TIMESTAMP WITH TIME ZONE,
                    tags TEXT[],
                    metadata JSONB DEFAULT '{}'::jsonb
                )
            """))
            
            # Create indexes for performance
            conn.execute(text("""
                CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_entries(memory_type);
                CREATE INDEX IF NOT EXISTS idx_platform ON memory_entries(platform);
                CREATE INDEX IF NOT EXISTS idx_created_at ON memory_entries(created_at);
                CREATE INDEX IF NOT EXISTS idx_embeddings_cosine ON memory_entries 
                USING ivfflat (embeddings vector_cosine_ops) WITH (lists = 100);
            """))
            
            conn.commit()
            self.logger.info("✅ PostgreSQL vector tables initialized")


class AzureCognitiveSearchClient:
    """Azure Cognitive Search for hybrid vector + keyword search."""
    
    def __init__(self, endpoint: str, key: str):
        self.endpoint = endpoint
        self.credential = AzureKeyCredential(key)
        self.index_name = "agentic-social-memory"
        self.search_client = SearchClient(endpoint, self.index_name, self.credential)
        self.index_client = SearchIndexClient(endpoint, self.credential)
        self.logger = logging.getLogger(__name__)
    
    async def store_memory(self, memory: MemoryEntry) -> bool:
        """Store memory entry in Azure Cognitive Search."""
        try:
            document = {
                "memory_id": memory.memory_id,
                "content": memory.content,
                "memory_type": memory.memory_type,
                "platform": memory.platform,
                "created_at": memory.created_at.isoformat(),
                "tags": memory.tags,
                "metadata": json.dumps(memory.metadata),
                "content_vector": memory.embeddings
            }
            
            result = await self.search_client.upload_documents([document])
            self.logger.info(f"📊 Stored memory in Azure Search: {memory.memory_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Azure Search storage failed: {str(e)}")
            return False
    
    async def search_memories(
        self, 
        query: str, 
        query_vector: List[float], 
        limit: int = 10,
        filters: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Hybrid search combining vector and keyword search."""
        try:
            vector_query = VectorizedQuery(
                vector=query_vector,
                k_nearest_neighbors=limit,
                fields="content_vector"
            )
            
            results = await self.search_client.search(
                search_text=query,
                vector_queries=[vector_query],
                filter=filters,
                select=["memory_id", "content", "memory_type", "platform", "created_at", "tags"],
                top=limit
            )
            
            memories = []
            async for result in results:
                memories.append({
                    "memory_id": result["memory_id"],
                    "content": result["content"],
                    "memory_type": result["memory_type"],
                    "platform": result.get("platform"),
                    "score": result.get("@search.score", 0.0),
                    "created_at": result["created_at"]
                })
            
            return memories
            
        except Exception as e:
            self.logger.error(f"❌ Azure Search query failed: {str(e)}")
            return []


class VertexAIEmbeddings:
    """Google Vertex AI for embeddings and semantic operations."""
    
    def __init__(self, project_id: str, location: str = "us-central1"):
        self.project_id = project_id
        self.location = location
        aiplatform.init(project=project_id, location=location)
        self.logger = logging.getLogger(__name__)
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings using Vertex AI."""
        try:
            from vertexai.language_models import TextEmbeddingModel
            
            model = TextEmbeddingModel.from_pretrained("textembedding-gecko@003")
            embeddings = []
            
            for text in texts:
                embedding = model.get_embeddings([text])[0]
                embeddings.append(embedding.values)
            
            self.logger.info(f"🧠 Generated {len(embeddings)} embeddings via Vertex AI")
            return embeddings
            
        except Exception as e:
            self.logger.error(f"❌ Vertex AI embeddings failed: {str(e)}")
            # Fallback to OpenAI embeddings
            return await self._fallback_openai_embeddings(texts)
    
    async def _fallback_openai_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Fallback to OpenAI embeddings if Vertex AI fails."""
        try:
            client = openai.OpenAI()
            embeddings = []
            
            for text in texts:
                response = client.embeddings.create(
                    model="text-embedding-3-small",
                    input=text
                )
                embeddings.append(response.data[0].embedding)
            
            self.logger.info(f"🔄 Fallback: Generated {len(embeddings)} embeddings via OpenAI")
            return embeddings
            
        except Exception as e:
            self.logger.error(f"❌ Fallback embeddings failed: {str(e)}")
            return []


class MemoryManager:
    """
    Enhanced Memory Manager with PostgreSQL + Azure + Vertex AI hybrid architecture.
    
    Features:
    - PostgreSQL with pgvector for structured + vector storage
    - Azure Cognitive Search for hybrid search capabilities  
    - Google Vertex AI for advanced embeddings
    - No Redis or ChromaDB dependencies
    
    Rick's signature: Enterprise memory, cloud-native power ☠️
    """
    
    def __init__(
        self,
        database_url: Optional[str] = None,
        azure_search_endpoint: Optional[str] = None,
        azure_search_key: Optional[str] = None,
        vertex_project_id: Optional[str] = None,
        vertex_location: str = "us-central1",
        storage_path: Optional[str] = None,
        log_level: str = "INFO"
    ):
        """Initialize enhanced memory manager."""
        
        # Setup logging
        self.logger = self._setup_logging(log_level)
        self.logger.info("🧠 MemoryManager initializing - Cloud-native architecture ☠️")
        
        # Configuration
        self.database_url = database_url or os.getenv("DATABASE_URL")
        self.azure_search_endpoint = azure_search_endpoint or os.getenv("AZURE_COGNITIVE_SEARCH_ENDPOINT")
        self.azure_search_key = azure_search_key or os.getenv("AZURE_COGNITIVE_SEARCH_KEY")
        self.vertex_project_id = vertex_project_id or os.getenv("GOOGLE_CLOUD_PROJECT")
        self.vertex_location = vertex_location
        
        # Storage path for local caching
        self.storage_path = Path(storage_path or "data/memory")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        
        # Initialize storage backends
        self.postgres_store = None
        self.azure_search = None
        self.vertex_embeddings = None
        
        self._initialize_backends()
        
        self.logger.info("✅ MemoryManager initialized with cloud-native backends")
    
    def _setup_logging(self, level: str) -> logging.Logger:
        """Setup logging with Rick's signature."""
        logger = logging.getLogger(f"{__name__}.Memory")
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - ☠️ MEMORY - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(getattr(logging, level.upper()))
        return logger
    
    def _initialize_backends(self):
        """Initialize all storage backends."""
        
        # PostgreSQL Vector Store
        if self.database_url:
            try:
                self.postgres_store = PostgreSQLVectorStore(self.database_url)
                self.logger.info("🗄️ PostgreSQL vector store initialized")
            except Exception as e:
                self.logger.error(f"❌ PostgreSQL initialization failed: {str(e)}")
        
        # Azure Cognitive Search
        if self.azure_search_endpoint and self.azure_search_key:
            try:
                self.azure_search = AzureCognitiveSearchClient(
                    self.azure_search_endpoint, 
                    self.azure_search_key
                )
                self.logger.info("🔍 Azure Cognitive Search initialized")
            except Exception as e:
                self.logger.error(f"❌ Azure Search initialization failed: {str(e)}")
        
        # Vertex AI Embeddings
        if self.vertex_project_id:
            try:
                self.vertex_embeddings = VertexAIEmbeddings(
                    self.vertex_project_id, 
                    self.vertex_location
                )
                self.logger.info("🧠 Vertex AI embeddings initialized")
            except Exception as e:
                self.logger.error(f"❌ Vertex AI initialization failed: {str(e)}")
    
    async def store_content_context(
        self,
        content_id: str,
        content: str,
        platform: str,
        persona_context: Optional[Dict[str, Any]] = None,
        performance_metrics: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Store content context across all backends."""
        try:
            # Generate embeddings
            embeddings = None
            if self.vertex_embeddings:
                embedding_list = await self.vertex_embeddings.generate_embeddings([content])
                embeddings = embedding_list[0] if embedding_list else None
            
            # Create memory entry
            memory = MemoryEntry(
                memory_id=content_id,
                content=content,
                memory_type=MemoryType.LONG_TERM,
                platform=platform,
                persona_context=persona_context,
                performance_metrics=performance_metrics,
                embeddings=embeddings,
                tags=[platform, "content"],
                metadata={"content_id": content_id}
            )
            
            # Store in PostgreSQL
            success_postgres = await self._store_in_postgres(memory)
            
            # Store in Azure Search
            success_azure = False
            if self.azure_search:
                success_azure = await self.azure_search.store_memory(memory)
            
            self.logger.info(f"💾 Stored content context: {content_id} (PG: {success_postgres}, Azure: {success_azure})")
            return success_postgres or success_azure
            
        except Exception as e:
            self.logger.error(f"❌ Failed to store content context: {str(e)}")
            return False
    
    async def _store_in_postgres(self, memory: MemoryEntry) -> bool:
        """Store memory entry in PostgreSQL."""
        if not self.postgres_store:
            return False
        
        try:
            with self.postgres_store.engine.connect() as conn:
                conn.execute(text("""
                    INSERT INTO memory_entries (
                        memory_id, content, memory_type, platform, persona_context,
                        performance_metrics, embeddings, created_at, expires_at, tags, metadata
                    ) VALUES (
                        :memory_id, :content, :memory_type, :platform, :persona_context,
                        :performance_metrics, :embeddings, :created_at, :expires_at, :tags, :metadata
                    ) ON CONFLICT (memory_id) DO UPDATE SET
                        content = EXCLUDED.content,
                        persona_context = EXCLUDED.persona_context,
                        performance_metrics = EXCLUDED.performance_metrics,
                        embeddings = EXCLUDED.embeddings,
                        metadata = EXCLUDED.metadata
                """), {
                    "memory_id": memory.memory_id,
                    "content": memory.content,
                    "memory_type": memory.memory_type,
                    "platform": memory.platform,
                    "persona_context": Json(memory.persona_context) if memory.persona_context else None,
                    "performance_metrics": Json(memory.performance_metrics) if memory.performance_metrics else None,
                    "embeddings": memory.embeddings,
                    "created_at": memory.created_at,
                    "expires_at": memory.expires_at,
                    "tags": memory.tags,
                    "metadata": Json(memory.metadata)
                })
                conn.commit()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ PostgreSQL storage failed: {str(e)}")
            return False
    
    async def retrieve_similar_contexts(
        self,
        query: str,
        platform: Optional[str] = None,
        limit: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """Retrieve similar contexts using hybrid search."""
        try:
            contexts = []
            
            # Generate query embedding
            query_embedding = None
            if self.vertex_embeddings:
                embeddings = await self.vertex_embeddings.generate_embeddings([query])
                query_embedding = embeddings[0] if embeddings else None
            
            # Search Azure Cognitive Search (hybrid)
            if self.azure_search and query_embedding:
                azure_filter = f"platform eq '{platform}'" if platform else None
                azure_results = await self.azure_search.search_memories(
                    query, query_embedding, limit, azure_filter
                )
                contexts.extend(azure_results)
            
            # Search PostgreSQL (vector similarity)
            if self.postgres_store and query_embedding and len(contexts) < limit:
                postgres_results = await self._search_postgres_vectors(
                    query_embedding, platform, limit - len(contexts), similarity_threshold
                )
                contexts.extend(postgres_results)
            
            # Deduplicate and sort by relevance
            seen_ids = set()
            unique_contexts = []
            for context in contexts:
                if context["memory_id"] not in seen_ids:
                    seen_ids.add(context["memory_id"])
                    unique_contexts.append(context)
            
            return unique_contexts[:limit]
            
        except Exception as e:
            self.logger.error(f"❌ Context retrieval failed: {str(e)}")
            return []
    
    async def _search_postgres_vectors(
        self,
        query_vector: List[float],
        platform: Optional[str],
        limit: int,
        threshold: float
    ) -> List[Dict[str, Any]]:
        """Search PostgreSQL using vector similarity."""
        try:
            with self.postgres_store.engine.connect() as conn:
                platform_filter = "AND platform = :platform" if platform else ""
                
                result = conn.execute(text(f"""
                    SELECT memory_id, content, memory_type, platform, created_at,
                           (embeddings <=> :query_vector) as distance
                    FROM memory_entries 
                    WHERE embeddings IS NOT NULL 
                    {platform_filter}
                    ORDER BY embeddings <=> :query_vector
                    LIMIT :limit
                """), {
                    "query_vector": query_vector,
                    "platform": platform,
                    "limit": limit
                })
                
                contexts = []
                for row in result:
                    if (1 - row.distance) >= threshold:  # Convert distance to similarity
                        contexts.append({
                            "memory_id": row.memory_id,
                            "content": row.content,
                            "memory_type": row.memory_type,
                            "platform": row.platform,
                            "created_at": row.created_at.isoformat(),
                            "score": 1 - row.distance,
                            "source": "postgresql"
                        })
                
                return contexts
                
        except Exception as e:
            self.logger.error(f"❌ PostgreSQL vector search failed: {str(e)}")
            return []
    
    async def cleanup_expired_memories(self) -> int:
        """Clean up expired memories from all backends."""
        cleaned = 0
        
        if self.postgres_store:
            try:
                with self.postgres_store.engine.connect() as conn:
                    result = conn.execute(text("""
                        DELETE FROM memory_entries 
                        WHERE expires_at IS NOT NULL AND expires_at < NOW()
                    """))
                    cleaned += result.rowcount
                    conn.commit()
                
                self.logger.info(f"🧹 Cleaned {cleaned} expired memories from PostgreSQL")
                
            except Exception as e:
                self.logger.error(f"❌ PostgreSQL cleanup failed: {str(e)}")
        
        return cleaned
    
    def get_system_stats(self) -> Dict[str, Any]:
        """Get memory system statistics."""
        stats = {
            "postgres_available": self.postgres_store is not None,
            "azure_search_available": self.azure_search is not None,
            "vertex_ai_available": self.vertex_embeddings is not None,
            "storage_path": str(self.storage_path),
            "backend_count": sum([
                self.postgres_store is not None,
                self.azure_search is not None,
                self.vertex_embeddings is not None
            ])
        }
        
        # Get PostgreSQL stats
        if self.postgres_store:
            try:
                with self.postgres_store.engine.connect() as conn:
                    result = conn.execute(text("SELECT COUNT(*) as count FROM memory_entries"))
                    stats["total_memories"] = result.fetchone().count
            except:
                stats["total_memories"] = 0
        
        return stats 