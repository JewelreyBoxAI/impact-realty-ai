FROM python:3.12-slim

# Set Rick's signature
LABEL maintainer="Rick ☠️ <rick@agentic-social.dev>"
LABEL description="Agentic Social Media Architecture - LangGraph Multi-Agent System"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive
ENV APP_HOME=/app
ENV PYTHONPATH="${PYTHONPATH}:${APP_HOME}"

# Create app directory
WORKDIR $APP_HOME

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    unzip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgcc-s1 \
    libc6-dev \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories for data persistence
RUN mkdir -p /app/data/metrics \
    /app/data/memory \
    /app/data/content \
    /app/data/models \
    /app/logs \
    /app/config

# Set proper permissions
RUN chmod -R 755 /app

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Expose ports
EXPOSE 8000 8001 8002

# Default command
CMD ["python", "main.py"] 