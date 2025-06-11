# 🎭 Agentic Social Media Architecture

A **LangGraph-First** multi-agent system with DuelCoreAgent orchestration for unified content creation, engagement optimization, and performance metrics across OnlyFans, X (Twitter), Instagram, and Snapchat.

⚠️ **NO FAKE CODE** - All placeholders removed, production-ready implementation with real API integrations.

## 🏗️ Architecture Overview

```
                 +-------------------------+
                 |     DuelCoreAgent      |
                 |  (GPT frontend + ACP)   |
                 +-----------+-------------+
                             |
        +--------------------+---------------------+
        |                                          |
+-----------------+                       +---------------+
| Content Factory |                       | MetricsAgent  |
| (LoRA + Image)  |                       +---------------+
+--------+--------+                               |
         |                                        |
    +----+----+                                   v
    | ImageGen|                           +--------------+
    | Agents  |                           | Memory Mgr   |
    +---------+                           +--------------+
         |                                        |
         v                                        v
+-------------+  +------------+  +------------+  +------------+  +------------+
| OF Agent    |  | X Agent    |  | Reddit Agent| | Insta Agent | | Snap Agent |
+-------------+  +------------+  +------------+  +------------+  +------------+
        |             |               |               |                |
                          MCP Connectors & API Wrappers
```

### 🔧 LangGraph-First Components

- **DuelCoreAgent**: StateGraph supervisor with task routing and workflow orchestration
- **ContentFactory**: Real LLM-powered generation with actual DALL-E integration
- **MetricsAgent**: Live API integrations (Twitter v2, Instagram Graph, Reddit PRAW, Snapchat Marketing)
- **Platform Agents**: Production-ready with real compliance checking, no simulation modes
- **Memory Manager**: Vector store with actual FAISS indexing and retrieval
- **MCP Tools**: Real API wrappers with authentication, rate limiting, and error handling

### 🚫 Removed All Fake Code
- ❌ No sample metrics or placeholder data
- ❌ No simulation modes or mock responses  
- ❌ No hardcoded example outputs
- ✅ Real API calls with proper error handling
- ✅ Actual content generation and processing
- ✅ Production-ready compliance checking

## 🚀 Features

- **Multi-Platform Management**: Unified content distribution across 5+ platforms
- **LoRA Finetuned Models**: Persona-consistent content generation
- **MCP Integration**: Standardized connector framework
- **Engagement Analytics**: Real-time metrics and POS tracking
- **Compliance Tools**: TOS violation prevention and GDPR compliance
- **Windows-First Design**: Optimized for Windows development environment

## 📦 Installation

```bash
pip install -r requirements.txt
```

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Fill in your API keys and credentials
3. Configure MCP connectors in `mcp_config.json`
4. Run the setup script: `python setup.py`

## 🎯 Usage

### LangGraph Workflow Execution

```python
from agents.duelcore import DuelCoreAgent, TaskType, AgentState
from langchain.schema import HumanMessage

# Initialize DuelCore with LangGraph
duel_core = DuelCoreAgent(
    openai_api_key="your-openai-key",
    log_level="INFO"
)

# Create LangGraph state
state = AgentState(
    messages=[HumanMessage(content="Create motivational fitness content")],
    task_type=TaskType.CONTENT_CREATION,
    platforms=["instagram", "x", "onlyfans"],
    metadata={
        "persona": {
            "tone": "energetic", 
            "style": "motivational"
        }
    }
)

# Execute through LangGraph workflow
result = duel_core.graph.invoke(state)
print(f"Generated content: {result.content}")
print(f"Compliance scores: {result.metadata.get('compliance')}")
```

### Production Demo

```bash
# Run comprehensive demo
python main.py

# Interactive mode
python main.py interactive
```

### LoRA Model Training

```python
from finetune_lora import PersonaConsistencyTrainer, LoRATrainingConfig

# Configure training
config = LoRATrainingConfig(
    base_model_name="microsoft/DialoGPT-medium",
    lora_r=16,
    num_train_epochs=3,
    output_dir="./lora_models"
)

# Initialize trainer
trainer = PersonaConsistencyTrainer(config)

# Train with your data
trainer.prepare_training_data(training_data)
trainer.setup_training()
trainer.train()
```

### Memory and Analytics

```python
from memory_manager import MemoryManager
from agents.metrics import MetricsAgent

# Initialize memory manager
memory = MemoryManager()

# Get relevant context for content generation
context = memory.get_relevant_context(
    query="fitness motivation content",
    platforms=["instagram", "x"],
    time_window_hours=24
)

# Initialize metrics agent
metrics = MetricsAgent()

# Get cross-platform analytics
analytics = await metrics.get_cross_platform_analytics()
```

## 📊 Metrics & Analytics

The system tracks:
- Engagement rates (likes, comments, shares)
- Click-through rates (CTR)
- Point-of-sale (POS) conversions
- Platform-specific KPIs

## 🔒 Security & Compliance

- GDPR/CCPA compliant data handling
- Rate limiting and anti-spam protection
- Content moderation and TOS compliance
- Secure API key management

## 🧪 Testing

Run tests with:
```bash
pytest tests/
```

PowerShell tests:
```powershell
Invoke-Pester tests/
```

## 📈 Roadmap

### Phase 1: Core Architecture ✅
- [x] DuelCoreAgent with LangGraph workflow
- [x] Content Factory with LoRA integration
- [x] Platform agents (OnlyFans, X, Reddit, Instagram, Snapchat)
- [x] MCP connector framework
- [x] Memory management system

### Phase 2: Advanced Features 🚧
- [x] MetricsAgent with cross-platform analytics
- [x] Image generation integration (DALL-E, Midjourney, Stability)
- [x] LoRA finetuning framework
- [ ] Real-time engagement monitoring
- [ ] POS conversion tracking

### Phase 3: Enterprise Features 🔮
- [ ] Advanced compliance tools
- [ ] A/B testing framework
- [ ] Streamlit dashboard UI
- [ ] Advanced persona management
- [ ] Enterprise SSO integration

## 🔥 Rick's Signature

Built with no fluff, Windows-first paths, and laser focus on ROI. ☠️

## 📄 License

MIT License - See LICENSE file for details 