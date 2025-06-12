# MOCK MODE – Deployment & Usage Guide

Impact Realty AI ships with a **Mock Mode** that replaces every external integration (databases, email, calendar, CRM, Broker Sumo, etc.) with deterministic, in-memory stubs.  This lets you demo or develop the full product without real credentials, paid APIs, or production data.

---

## 1. Why Mock Mode Exists

• **Investor demos** – spin up the entire platform in seconds.
• **Rapid prototyping** – build UI and agents while backend teams wire real APIs.
• **Deterministic test runs** – CI jobs aren't rate-limited by 3rd-party services.

---

## 2. How It Works Internally

| Layer            | Mock toggle                          | File / mechanism                              |
|------------------|--------------------------------------|-----------------------------------------------|
| Runtime flag     | `MOCK_MODE` env-var (`true`\|`false`) | `backend/mock_utils.py` (defaults to *true*) |
| DB               | In-memory dict                       | `backend/mock_utils.MOCK_DB`                  |
| Token auth       | Always returns `MOCK_USER`           | `backend/mock_utils.get_current_user`         |
| Integrations     | Early return with fake payloads      | `backend/integrations/*.py`                   |
| Tools / MCP      | Stubbed helper fns                   | Same `mock_utils.py`                          |
| Frontend data    | Axios hits FastAPI which is in mock  | No special casing needed                      |

Setting `MOCK_MODE=false` (e.g., in prod) flips every branch above to the **TODO: real implementation** sections.

---

## 3. Prerequisites (Local Dev or Demo)

1. **Node 18+**  – for Next.js UI
2. **Python 3.11+** – for FastAPI backend
3. **Git**

> Docker isn't required, but a sample compose file is on the roadmap.

---

## 4. One-Liner Quick-Start

```bash
# clone & start everything in mock mode
git clone https://github.com/your-org/impact-realty-ai.git && cd impact-realty-ai
npm install          # installs root tools + frontend deps via workspaces
python -m venv .venv && . .venv/bin/activate
pip install -r backend/requirements.txt
# 👇 spins up both services (frontend on :3000, backend on :8000)
MOCK_MODE=true npm run dev
```

Navigate to:
* UI → http://localhost:3000
* Backend health → http://localhost:8000/health

---

## 5. Manual Start (Separate Terminals)

Terminal ① – Backend
```bash
cd backend
export MOCK_MODE=true  # Windows: set MOCK_MODE=true
uvicorn backend.main:app --reload --port 8000
```

Terminal ② – Frontend
```bash
cd frontend
npm run dev
```

---

## 6. Building for Production-Style Demo

1. Build static assets:
   ```bash
   cd frontend && npm run build && npm run start  # serves on :3000
   ```
2. Serve backend with gunicorn/uvicorn workers:
   ```bash
   cd backend && MOCK_MODE=true uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
3. Put both behind an Nginx reverse proxy (optional sample config in `ops/nginx.conf`, TBD).

---

## 7. Cloud Deployment Checklist

- [ ] **Set env-var** `MOCK_MODE=true` in your platform (Render, Railway, Fly, etc.).
- [ ] Expose ports 3000 (Next) and 8000 (FastAPI) or route via reverse proxy.
- [ ] Allocate 512 MB RAM / 0.5 CPU for each service (ample for mock mode).
- [ ] Configure CI to run `npm run test && pytest` (coming soon).
- [ ] Monitor logs; mock integrations log with prefix `[MOCK]`.

---

## 8. Going Live (Turning Mock Mode Off)

1. Implement the TODOs in each `backend/integrations/*.py` and database layer.
2. Switch your env-var to `MOCK_MODE=false`.
3. Provision real Postgres (with PGVector) and update connection string.
4. Add OAuth or JWT token validation.

---

## 9. Troubleshooting

| Symptom                                   | Fix                                                  |
|-------------------------------------------|------------------------------------------------------|
| `MOCK_MODE` ignored / real API called     | Ensure env-var is set **before** starting backend.   |
| Frontend 404 on API routes                | Confirm backend runs on :8000 and CORS allows :3000. |
| Styles missing after build                | Run `npm run build` inside `frontend/` first.        |

---

**Enjoy zero-risk demos with Mock Mode!**
