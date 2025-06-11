#!/usr/bin/env python3
"""
Setup script for Agentic Social Media Architecture
Rick's signature: Proper packaging, professional deployment ☠️
"""

from setuptools import setup, find_packages
import os

# Read README for long description
def read_readme():
    readme_path = os.path.join(os.path.dirname(__file__), 'README.md')
    if os.path.exists(readme_path):
        with open(readme_path, 'r', encoding='utf-8') as f:
            return f.read()
    return "Agentic Social Media Architecture - LangGraph-First Multi-Agent System"

# Read requirements
def read_requirements():
    req_path = os.path.join(os.path.dirname(__file__), 'requirements.txt')
    requirements = []
    if os.path.exists(req_path):
        with open(req_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and not line.startswith('-'):
                    # Handle Windows-specific requirements
                    if '; sys_platform' in line:
                        requirements.append(line)
                    else:
                        requirements.append(line.split('==')[0])  # Just package name for flexibility
    return requirements

setup(
    name="agentic-social-media",
    version="1.0.0",
    description="LangGraph-First Multi-Agent System for Social Media Management with Replicate FLUX.1",
    long_description=read_readme(),
    long_description_content_type="text/markdown",
    author="Rick",
    author_email="rick@agenticsocial.dev",
    url="https://github.com/rick/agentic-social-media",
    
    # Package configuration
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    
    # Python version requirement
    python_requires=">=3.9",
    
    # Dependencies
    install_requires=read_requirements(),
    
    # Optional dependencies
    extras_require={
        'dev': [
            'pytest>=7.4.4',
            'pytest-asyncio>=0.23.2',
            'pytest-mock>=3.12.0',
            'pytest-cov>=4.1.0',
            'black>=23.12.1',
            'flake8>=7.0.0',
            'mypy>=1.8.0',
            'pre-commit>=3.6.0',
            'jupyter>=1.0.0',
            'ipython>=8.0.0',
            'memory-profiler>=0.60.0',
            'line-profiler>=4.0.0',
        ],
        'docker': [
            'psycopg2-binary>=2.9.9',
            'prometheus-client>=0.20.0',
            'jaeger-client>=4.8.0',
        ],
        'all': [
            'pytest>=7.4.4',
            'pytest-asyncio>=0.23.2', 
            'black>=23.12.1',
            'psycopg2-binary>=2.9.9',
            'prometheus-client>=0.20.0',
            'jupyter>=1.0.0',
        ]
    },
    
    # Entry points
    entry_points={
        'console_scripts': [
            'agentic-social=main:main',
            'agentic-example=example_usage:main',
        ],
    },
    
    # Package data
    package_data={
        'agentic_social': [
            'config/*.yml',
            'config/*.yaml', 
            'config/*.json',
            'data/*.csv',
            'data/*.json',
        ],
    },
    
    # Classifiers
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Multimedia :: Graphics :: Graphics Conversion",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    
    # Keywords
    keywords=[
        "langchain", "langgraph", "ai", "agents", "social-media", 
        "content-generation", "replicate", "flux", "lora", "multi-agent"
    ],
    
    # Project URLs
    project_urls={
        "Bug Reports": "https://github.com/rick/agentic-social-media/issues",
        "Source": "https://github.com/rick/agentic-social-media",
        "Documentation": "https://github.com/rick/agentic-social-media/blob/main/README.md",
    },
) 