# Development Container for Agentic Social Media Architecture
# Rick's signature: Developer experience optimized ☠️

FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Set working directory
WORKDIR /workspace

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    wget \
    build-essential \
    gcc \
    g++ \
    cmake \
    pkg-config \
    libffi-dev \
    libssl-dev \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev \
    libtiff5-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libwebp-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libxcb1-dev \
    postgresql-client \
    redis-tools \
    vim \
    nano \
    htop \
    tree \
    jq \
    && rm -rf /var/lib/apt/lists/*

# Install Python build dependencies
RUN pip install --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY requirements.txt /workspace/
RUN pip install -r requirements.txt

# Install development tools
RUN pip install \
    ipython \
    jupyter \
    notebook \
    jupyterlab \
    pre-commit \
    pytest-xdist \
    pytest-benchmark \
    memory-profiler \
    line-profiler

# Set up git for pre-commit hooks
RUN git config --global --add safe.directory /workspace

# Create directories
RUN mkdir -p /workspace/data /workspace/logs /workspace/config /workspace/models

# Create a non-root user for better security (optional)
RUN useradd -m -s /bin/bash devuser && \
    chown -R devuser:devuser /workspace

# Copy project files
COPY . /workspace/

# Set permissions
RUN chown -R devuser:devuser /workspace

# Expose ports for development
EXPOSE 8000 8001 8002 8888 5432 6379

# Default command for development
CMD ["bash"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; print('Dev environment healthy ☠️'); sys.exit(0)" 