# Impact Realty AI - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.9+
- PostgreSQL (optional - SQLite works for development)

### One-Command Setup
```bash
# From project root - installs everything
npm run install:all
```

### Development Commands

#### **Run Everything (Recommended)**
```bash
# Start both frontend and backend together
npm run dev
```
This starts:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

#### **Individual Services**
```bash
# Frontend only
npm run dev:frontend

# Backend only  
npm run dev:backend
```

#### **Production**
```bash
# Build and start production mode
npm run build
npm run start
```

---

## 📁 Project Structure

```
impact-realty-ai/
├── package.json          # Root workspace manager
├── env.example           # Environment template
├── frontend/             # Next.js React app
│   ├── package.json     
│   ├── app/             # Next.js 13 app directory
│   ├── components/      # React components
│   └── styles/          # CSS and theme files
├── backend/             # FastAPI Python app
│   ├── dev.py          # Development server
│   ├── main.py         # FastAPI app
│   ├── agents/         # LangGraph agents
│   ├── graphs/         # Workflow graphs
│   ├── tools/          # MCP tools
│   └── db/             # Database layer
└── requirements.txt    # Python dependencies
```

---

## 🎯 Architecture Standards

### **Frontend (Next.js React)**
- **Pure UI rendering** - no agent logic
- **REST API calls** to backend via fetch/axios
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Dark theme** with glassmorphism design

### **Backend (FastAPI Python)**
- **All agent orchestration** with LangGraph
- **All MCP integrations** for external tools
- **Pydantic models** for request/response schemas
- **Async endpoints** for non-blocking operations
- **Single API gateway** for frontend

### **Communication**
- **HTTP/REST** between frontend and backend
- **WebSockets** (via FastAPI) for real-time updates
- **No mixed concerns** - clean separation

---

## 🛠️ Development Workflow

### 1. Environment Setup
```bash
# Copy environment template
cp env.example .env

# Edit with your credentials
# See CREDENTIALS_REQUIRED.md for details
```

### 2. Database Setup (Optional)
```bash
# For development, SQLite is used automatically
# For production PostgreSQL:
createdb impact_realty_ai
# Update DATABASE_URL in .env
```

### 3. Start Development
```bash
npm run dev
```

### 4. API Testing
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

---

## 📝 Code Standards

### **Python (Backend)**
- **PEP 8** formatting
- **Type hints** everywhere
- **Async/await** for I/O operations
- **Docstrings** for all functions
- **Absolute imports** (no relative imports)

### **TypeScript/React (Frontend)**
- **ESLint + Prettier** formatting
- **Functional components** with hooks
- **No unnecessary React imports** (Next.js handles JSX)
- **Consistent naming** (camelCase for variables, PascalCase for components)

### **API Design**
- **RESTful endpoints** with proper HTTP methods
- **Pydantic models** for all request/response bodies
- **Consistent error handling** with proper status codes
- **API versioning** (/api/v1/)

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Start only Next.js frontend |
| `npm run dev:backend` | Start only FastAPI backend |
| `npm run build` | Build frontend for production |
| `npm run start` | Start production services |
| `npm run clean` | Clean build artifacts |
| `npm run install:all` | Install all dependencies |
| `npm run test` | Run frontend tests |
| `npm run lint` | Run linting |

---

## 🐛 Troubleshooting

### Common Issues

**"Missing script: dev" error**
- Make sure you're in the project root directory
- Run `npm install` to install dependencies

**Backend import errors**
- Make sure you're using absolute imports (not relative `.` imports)
- Run from the backend directory: `python dev.py`

**Frontend build errors**
- Check for TypeScript errors: `cd frontend && npm run lint`
- Clear Next.js cache: `cd frontend && rm -rf .next`

**Database connection issues**
- Check your `.env` file configuration
- For development, SQLite is used automatically

---

## 📚 Key Files

- **`package.json`** - Root workspace configuration
- **`backend/dev.py`** - Development server with hot reload
- **`backend/main.py`** - FastAPI application entry point
- **`frontend/app/layout.tsx`** - Next.js root layout
- **`env.example`** - Environment configuration template

---

**Rick's Architecture Rule**: *All multi-agent logic lives inside FastAPI. All frontend interaction with agents occurs through FastAPI REST endpoints. React never handles agent state directly.*

🚀 **Ready to build something epic!** 