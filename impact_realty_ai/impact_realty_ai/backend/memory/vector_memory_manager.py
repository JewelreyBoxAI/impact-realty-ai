"""
Vector Memory Manager
====================

Manages PGVector storage for embeddings and semantic search.
"""

import os
import asyncpg
import numpy as np
from typing import Dict, Any, List
from datetime import datetime
from langchain.embeddings.openai import OpenAIEmbeddings

class VectorMemoryManager:
    def __init__(self):
        self.database_url = os.getenv("DATABASE_URL")
        self.embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
        self.pool = None
        
    async def _get_connection_pool(self):
        """Get database connection pool"""
        if not self.pool:
            self.pool = await asyncpg.create_pool(
                self.database_url,
                min_size=1,
                max_size=10,
                command_timeout=60
            )
        return self.pool
    
    async def _create_tables(self):
        """Create necessary tables if they don't exist"""
        pool = await self._get_connection_pool()
        
        async with pool.acquire() as conn:
            # Enable pgvector extension
            await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
            
            # Create candidates table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS candidates (
                    id SERIAL PRIMARY KEY,
                    candidate_id VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    email VARCHAR(255),
                    phone VARCHAR(255),
                    location VARCHAR(255),
                    experience_years INTEGER,
                    license_number VARCHAR(255),
                    license_status VARCHAR(100),
                    skills TEXT[],
                    embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create qualifications table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS qualifications (
                    id SERIAL PRIMARY KEY,
                    candidate_id VARCHAR(255) NOT NULL,
                    qualification_data JSONB,
                    score FLOAT,
                    status VARCHAR(100),
                    embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create documents table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    document_id VARCHAR(255) UNIQUE NOT NULL,
                    document_type VARCHAR(100),
                    content TEXT,
                    metadata JSONB,
                    embedding vector(1536),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create indexes for vector similarity search
            await conn.execute("CREATE INDEX IF NOT EXISTS candidates_embedding_idx ON candidates USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)")
            await conn.execute("CREATE INDEX IF NOT EXISTS qualifications_embedding_idx ON qualifications USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)")
            await conn.execute("CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)")
    
    async def store_candidates(self, candidates: List[Dict[str, Any]]) -> None:
        """Store candidate data in vector database with embeddings"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        async with pool.acquire() as conn:
            for candidate in candidates:
                try:
                    # Create text representation for embedding
                    candidate_text = self._candidate_to_text(candidate)
                    
                    # Generate embedding
                    embedding = await self.embeddings.aembed_query(candidate_text)
                    embedding_array = np.array(embedding, dtype=np.float32)
                    
                    # Insert or update candidate
                    await conn.execute("""
                        INSERT INTO candidates (
                            candidate_id, name, email, phone, location, 
                            experience_years, license_number, license_status, 
                            skills, embedding, updated_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                        ON CONFLICT (candidate_id) 
                        DO UPDATE SET 
                            name = EXCLUDED.name,
                            email = EXCLUDED.email,
                            phone = EXCLUDED.phone,
                            location = EXCLUDED.location,
                            experience_years = EXCLUDED.experience_years,
                            license_number = EXCLUDED.license_number,
                            license_status = EXCLUDED.license_status,
                            skills = EXCLUDED.skills,
                            embedding = EXCLUDED.embedding,
                            updated_at = EXCLUDED.updated_at
                    """, 
                    candidate.get("id", ""),
                    candidate.get("name", ""),
                    candidate.get("email", ""),
                    candidate.get("phone", ""),
                    candidate.get("location", ""),
                    candidate.get("experience_years", 0),
                    candidate.get("license_number", ""),
                    candidate.get("license_status", ""),
                    candidate.get("skills", []),
                    embedding_array.tolist(),
                    datetime.now()
                    )
                    
                except Exception as e:
                    print(f"Error storing candidate {candidate.get('id')}: {e}")
    
    async def store_qualification(self, qualification: Dict[str, Any]) -> None:
        """Store qualification results with embeddings"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        async with pool.acquire() as conn:
            try:
                # Create text representation for embedding
                qual_text = self._qualification_to_text(qualification)
                
                # Generate embedding
                embedding = await self.embeddings.aembed_query(qual_text)
                embedding_array = np.array(embedding, dtype=np.float32)
                
                # Insert qualification
                await conn.execute("""
                    INSERT INTO qualifications (
                        candidate_id, qualification_data, score, status, embedding
                    ) VALUES ($1, $2, $3, $4, $5)
                """,
                qualification.get("candidate_id", ""),
                qualification,
                qualification.get("score", 0.0),
                qualification.get("status", ""),
                embedding_array.tolist()
                )
                
            except Exception as e:
                print(f"Error storing qualification: {e}")
    
    async def store_document_embeddings(self, document_id: str, text: str, document_type: str = "unknown", metadata: Dict = None) -> None:
        """Store document embeddings for semantic search"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        async with pool.acquire() as conn:
            try:
                # Generate embedding for document text
                embedding = await self.embeddings.aembed_query(text)
                embedding_array = np.array(embedding, dtype=np.float32)
                
                # Insert or update document
                await conn.execute("""
                    INSERT INTO documents (
                        document_id, document_type, content, metadata, embedding
                    ) VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (document_id)
                    DO UPDATE SET
                        document_type = EXCLUDED.document_type,
                        content = EXCLUDED.content,
                        metadata = EXCLUDED.metadata,
                        embedding = EXCLUDED.embedding
                """,
                document_id,
                document_type,
                text[:10000],  # Limit text length
                metadata or {},
                embedding_array.tolist()
                )
                
            except Exception as e:
                print(f"Error storing document embedding: {e}")
    
    async def search_similar_candidates(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search for similar candidates using vector similarity"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        try:
            # Generate embedding for query
            query_embedding = await self.embeddings.aembed_query(query)
            query_array = np.array(query_embedding, dtype=np.float32)
            
            async with pool.acquire() as conn:
                rows = await conn.fetch("""
                    SELECT 
                        candidate_id, name, email, phone, location,
                        experience_years, license_number, license_status,
                        skills, created_at,
                        1 - (embedding <=> $1) as similarity_score
                    FROM candidates
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> $1
                    LIMIT $2
                """, query_array.tolist(), limit)
                
                return [
                    {
                        "candidate_id": row["candidate_id"],
                        "name": row["name"],
                        "email": row["email"],
                        "phone": row["phone"],
                        "location": row["location"],
                        "experience_years": row["experience_years"],
                        "license_number": row["license_number"],
                        "license_status": row["license_status"],
                        "skills": row["skills"],
                        "similarity_score": float(row["similarity_score"]),
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None
                    }
                    for row in rows
                ]
                
        except Exception as e:
            print(f"Error searching candidates: {e}")
            return []
    
    async def search_documents(self, query: str, document_type: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Search documents using semantic similarity"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        try:
            # Generate embedding for query
            query_embedding = await self.embeddings.aembed_query(query)
            query_array = np.array(query_embedding, dtype=np.float32)
            
            async with pool.acquire() as conn:
                if document_type:
                    rows = await conn.fetch("""
                        SELECT 
                            document_id, document_type, content, metadata, created_at,
                            1 - (embedding <=> $1) as similarity_score
                        FROM documents
                        WHERE embedding IS NOT NULL AND document_type = $3
                        ORDER BY embedding <=> $1
                        LIMIT $2
                    """, query_array.tolist(), limit, document_type)
                else:
                    rows = await conn.fetch("""
                        SELECT 
                            document_id, document_type, content, metadata, created_at,
                            1 - (embedding <=> $1) as similarity_score
                        FROM documents
                        WHERE embedding IS NOT NULL
                        ORDER BY embedding <=> $1
                        LIMIT $2
                    """, query_array.tolist(), limit)
                
                return [
                    {
                        "document_id": row["document_id"],
                        "document_type": row["document_type"],
                        "content": row["content"][:500] + "..." if len(row["content"]) > 500 else row["content"],
                        "metadata": row["metadata"],
                        "similarity_score": float(row["similarity_score"]),
                        "created_at": row["created_at"].isoformat() if row["created_at"] else None
                    }
                    for row in rows
                ]
                
        except Exception as e:
            print(f"Error searching documents: {e}")
            return []
    
    def _candidate_to_text(self, candidate: Dict[str, Any]) -> str:
        """Convert candidate data to text for embedding"""
        parts = []
        
        if candidate.get("name"):
            parts.append(f"Name: {candidate['name']}")
        if candidate.get("location"):
            parts.append(f"Location: {candidate['location']}")
        if candidate.get("experience_years"):
            parts.append(f"Experience: {candidate['experience_years']} years")
        if candidate.get("license_status"):
            parts.append(f"License Status: {candidate['license_status']}")
        if candidate.get("skills"):
            parts.append(f"Skills: {', '.join(candidate['skills'])}")
            
        return " | ".join(parts)
    
    def _qualification_to_text(self, qualification: Dict[str, Any]) -> str:
        """Convert qualification data to text for embedding"""
        parts = []
        
        if qualification.get("candidate_id"):
            parts.append(f"Candidate: {qualification['candidate_id']}")
        if qualification.get("score"):
            parts.append(f"Score: {qualification['score']}")
        if qualification.get("status"):
            parts.append(f"Status: {qualification['status']}")
        if qualification.get("notes"):
            parts.append(f"Notes: {qualification['notes']}")
            
        return " | ".join(parts)
    
    async def get_candidate_by_id(self, candidate_id: str) -> Dict[str, Any]:
        """Get candidate by ID"""
        await self._create_tables()
        pool = await self._get_connection_pool()
        
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM candidates WHERE candidate_id = $1
            """, candidate_id)
            
            if row:
                return {
                    "candidate_id": row["candidate_id"],
                    "name": row["name"],
                    "email": row["email"],
                    "phone": row["phone"],
                    "location": row["location"],
                    "experience_years": row["experience_years"],
                    "license_number": row["license_number"],
                    "license_status": row["license_status"],
                    "skills": row["skills"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else None,
                    "updated_at": row["updated_at"].isoformat() if row["updated_at"] else None
                }
            
            return {}
    
    async def close(self):
        """Close database connections"""
        if self.pool:
            await self.pool.close() 