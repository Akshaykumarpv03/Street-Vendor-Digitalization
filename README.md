# Street Vendor Digitalization Agent

**Problem Statement No. 29** — IBM watsonx internship/hackathon project
**Mandatory tech:** IBM Cloud Lite services / IBM Granite

---

## 1. Problem Statement (verbatim)

> A Street Vendor Digitalization Agent, powered by RAG (Retrieval-Augmented Generation), helps
> local hawkers and micro-entrepreneurs become digitally visible by generating business profiles,
> UPI setup guides, local SEO strategies, and customer engagement tips. It retrieves real-time
> policies, MSME schemes, geolocation of business data, digital onboarding steps, and consumer
> behavior insights from government portals, fintech apps, and commerce platforms. Vendors can
> simply say, "I sell fruit in Pune's Camp area," and the agent will suggest pricing tips, online
> listing platforms, QR code setup, and promotional materials in their local language. This
> AI-driven assistant empowers informal businesses to grow digitally, unlock access to credit, and
> boost visibility in the hyperlocal economy.

## 2. Build Strategy

Two-phase, dual-build approach:

1. **Prototype** — built and validated in IBM watsonx Orchestrate's no-code agent builder (5
   specialist agents + 1 orchestrator, each with its own knowledge base / instructions). This
   validated the architecture and routing logic cheaply before writing code.
2. **Final deliverable** — this repository: a Flask backend + React frontend that reimplements
   the same 5-agent architecture as real code, so it (a) doesn't expire with the Orchestrate free
   trial, and (b) gives evaluators an actual codebase to review.

---

## 3. Multi-Agent Architecture

One orchestrator routes to five specialist agents, each with a distinct knowledge domain. This
mapping is intentional — every clause in the problem statement maps to exactly one agent.

| # | Agent | Responsibility | RAG? | Knowledge base docs |
|---|-------|----------------|------|---------------------|
| 1 | **Policy & Scheme Agent** | MSME/Udyam registration, PM SVANidhi, credit access, state vending frameworks | Yes | `PM_SVANidhi_Scheme.pdf`, `Udyam_MSME_Registration.pdf`, `Maharashtra_Vendor_Framework.pdf`, `Kerala_Kudumbashree_Framework.pdf` |
| 2 | **Market Insights Agent** | Pricing strategy, hyperlocal demand patterns, live produce pricing | Yes | `Pricing_Strategy_Framework.pdf`, `Hyperlocal_Demand_Patterns.pdf`, `Live_Market_Price_Data_Agmarknet.pdf` |
| 3 | **UPI Guide Agent** | UPI/QR payment setup, online marketplace listing (Google Business, ONDC) | Yes | `UPI_QR_Merchant_Setup.pdf`, `Digital_Marketplace_Listing.pdf` |
| 4 | **Marketing Agent** | Business profile generation, promo captions/posters, local SEO copy, customer engagement | Yes | `Business_Profile_Writing_Guide.pdf`, `Promotional_Content_Local_SEO.pdf`, `Customer_Engagement_Retention.pdf` |
| 5 | **Language Translation Agent** | Localizes the combined final response into the vendor's regional language | No | — (pure Granite generation) |
| — | **Orchestrator** | Extracts intent/category/location/language from free text, delegates to the right agent(s), merges responses, calls the Translation Agent last | No | — |

### Request flow

```mermaid
flowchart TD
    U[Vendor input: "I sell fruit in Pune's Camp area"] --> O[Orchestrator]
    O -->|scheme / credit questions| A1[Policy & Scheme Agent]
    O -->|pricing / demand questions| A2[Market Insights Agent]
    O -->|payments / listings| A3[UPI Guide Agent]
    O -->|profile / promo content| A4[Marketing Agent]
    A1 --> M[Merge responses]
    A2 --> M
    A3 --> M
    A4 --> M
    M --> T[Language Translation Agent]
    T --> R[Final response to vendor]
```

All 12 knowledge-base PDFs already exist (generated and reviewed during the Orchestrate
prototype phase) — see **Section 6.3** for where to place them in this repo.

---

## 4. Tech Stack

| Layer | Choice |
|---|---|
| Backend | Python, Flask |
| Frontend | React (Vite), Tailwind CSS, lucide-react icons |
| LLM | IBM Granite via watsonx.ai Runtime |
| Embeddings | watsonx.ai embedding model (check current model IDs in your watsonx.ai Studio project — these change) |
| Vector store | Milvus via watsonx.data Lite plan (fallback: local Chroma for offline dev) |
| Document storage | IBM Cloud Object Storage Lite (fallback: local filesystem for dev) |
| Live data (roadmap) | Agmarknet produce prices via data.gov.in API (see Market Insights Agent notes) |

> **Free-tier note:** watsonx Orchestrate is a 30-day trial only, not a permanent free tier.
> watsonx.ai Runtime/Studio Lite plans, Cloud Object Storage Lite, and watsonx.data Lite are the
> ones that stay free long-term (with capped usage) — this backend is built against those, not
> against Orchestrate, so it keeps working after the 30-day trial window closes.

---

## 5. Backend Design

### 5.1 Folder structure

```
backend/
  app.py                       # Flask entrypoint
  config.py                    # env var loading
  requirements.txt
  .env.example
  agents/
    __init__.py
    base_agent.py               # shared Granite call wrapper + RAG retrieval helper
    policy_scheme_agent.py
    market_insights_agent.py
    upi_guide_agent.py
    marketing_agent.py
    translation_agent.py
    orchestrator.py             # intent extraction + routing + merge
  rag/
    __init__.py
    embeddings.py               # embedding client wrapper
    vector_store.py             # Milvus / Chroma wrapper (swappable via config)
    ingest.py                   # one-time script: chunk + embed + upsert all KB PDFs
  knowledge_base/
    policy_scheme/               # <- place the 4 policy PDFs here
    market_insights/               # <- place the 3 market insight PDFs here
    upi_guide/                       # <- place the 2 UPI/listing PDFs here
    marketing/                        # <- place the 3 marketing PDFs here
  utils/
    watsonx_client.py            # thin wrapper around watsonx.ai Runtime API
    extraction.py                # pulls category / location / language from free text
```

### 5.2 API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/query` | Main orchestrator endpoint — vendor free text in, combined structured response out |
| POST | `/api/agents/policy-scheme` | Direct call to a single agent (useful for isolated testing) |
| POST | `/api/agents/market-insights` | ″ |
| POST | `/api/agents/upi-guide` | ″ |
| POST | `/api/agents/marketing` | ″ |
| POST | `/api/agents/translate` | ″ |
| GET | `/api/health` | Basic liveness check |

`POST /api/query` request/response shape:

```json
// request
{ "message": "I sell fruit in Pune's Camp area", "language": "mr" }

// response
{
  "category": "fruit vendor",
  "location": "Pune, Camp area",
  "sections": {
    "policy_scheme": "...",
    "market_insights": "...",
    "upi_guide": "...",
    "marketing": "..."
  },
  "translated": true
}
```

### 5.3 Environment variables (`.env.example`)

```
WATSONX_API_KEY=
WATSONX_PROJECT_ID=
WATSONX_URL=
GRANITE_MODEL_ID=            # verify current Granite model id in your watsonx.ai Studio project
EMBEDDING_MODEL_ID=          # verify current embedding model id in your watsonx.ai Studio project
VECTOR_DB_PROVIDER=chroma    # chroma for local dev, milvus for watsonx.data
MILVUS_HOST=
MILVUS_PORT=
FLASK_ENV=development
```

Never commit a real `.env` — only `.env.example` with blank values.

---

## 6. Frontend Design

### 6.1 Screens

1. **Hero / Onboarding** — big voice-mic + text input, language selector chips
2. **Business Profile Card** — shareable digital visiting card
3. **UPI / QR Setup Panel** — numbered steps, QR preview, "Download QR"
4. **Local SEO & Listing Suggestions** — card grid (Google Business, ONDC, etc.)
5. **Promotional Material** — generated poster/caption preview, "Share to WhatsApp"
6. **Pricing & Scheme Tips** — accordion/tabs for scheme eligibility + pricing guidance

### 6.2 Color palette

| Role | Name | Hex |
|---|---|---|
| Primary | Deep Teal | `#0F5C57` |
| Secondary | Warm Amber | `#E8A33D` |
| Text (primary) | Charcoal Ink | `#1F2937` |
| Text (secondary) | Slate Gray | `#6B7280` |
| Background | Soft Cream | `#FAF7F2` |
| Surface | Warm White | `#FFFFFF` |
| Divider | Light Sand | `#F0EBE1` |
| Accent | Terracotta | `#C4623E` |
| Success | Muted Green | `#4B8B6F` |
| Error | Muted Rust Red | `#B84C3E` |
| Info | Dusty Blue | `#5A7A8C` |

Deep Teal + Warm Amber are the two dominant colors; everything else is neutral support. Avoid
saturated primary colors (bright red, pure blue) — the palette should read as calm and premium,
not like a discount app. Mobile-first (390px baseline), large tap targets, rounded/legible
typography (e.g. Poppins).

### 6.3 Folder structure

```
frontend/
  src/
    components/
      Hero.jsx
      LanguageSelector.jsx
      VoiceInput.jsx
      BusinessProfileCard.jsx
      UPISetupPanel.jsx
      ListingSuggestions.jsx
      PromoMaterial.jsx
      SchemeTips.jsx
    api.js                    # fetch wrapper for the Flask backend
    App.jsx
    index.css                 # Tailwind entrypoint
  tailwind.config.js
  package.json
```

---

## 7. Setup Instructions

### Quick demo (no credentials needed)

```bash
# 1. Clone and enter the repo
git clone <repo-url>
cd street-vendor-agent

# 2. Backend — mock mode (no watsonx credentials required)
cd backend
python3 -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows PowerShell
pip install -r requirements.txt
cp .env.example .env
# .env already has USE_MOCK=false — set USE_MOCK=true for demo without credentials:
echo "USE_MOCK=true" >> .env
python app.py                     # → http://localhost:5000

# 3. Run backend tests (no credentials needed — uses mock mode)
python -m pytest tests/ -v

# 4. Frontend (new terminal)
cd frontend
npm install
# frontend/.env already sets VITE_USE_MOCK=true for demo mode
npm run dev                       # → http://localhost:5173
```

### Production setup (with watsonx credentials)

```bash
# Fill in your watsonx.ai credentials in backend/.env:
#   WATSONX_API_KEY=<your-key>
#   WATSONX_PROJECT_ID=<your-project-id>
#   WATSONX_URL=https://us-south.ml.cloud.ibm.com
#   GRANITE_MODEL_ID=<verify in watsonx.ai Studio>
#   EMBEDDING_MODEL_ID=<verify in watsonx.ai Studio>
#   USE_MOCK=false

# Place the 12 knowledge-base PDFs (see Section 3 table) into:
#   backend/knowledge_base/policy_scheme/    (4 PDFs)
#   backend/knowledge_base/market_insights/  (3 PDFs)
#   backend/knowledge_base/upi_guide/        (2 PDFs)
#   backend/knowledge_base/marketing/        (3 PDFs)

cd backend
python rag/ingest.py              # chunk + embed + upsert all PDFs
python app.py                     # → http://localhost:5000

# In frontend/.env.local, set:
#   VITE_USE_MOCK=false
#   VITE_API_BASE_URL=http://localhost:5000
cd frontend && npm run dev
```

---

## 8. Git Workflow

Conventional Commits, one logical change per commit — no single giant "initial commit" dump.
Suggested commit sequence:

```
chore: init repo structure and .gitignore
feat(backend): add Flask app skeleton and config loader
feat(backend): add watsonx.ai client wrapper
feat(backend): add RAG ingestion pipeline and vector store wrapper
feat(backend): add Policy & Scheme Agent
feat(backend): add Market Insights Agent
feat(backend): add UPI Guide Agent
feat(backend): add Marketing Agent
feat(backend): add Language Translation Agent
feat(backend): add orchestrator routing and /api/query endpoint
test(backend): add basic endpoint tests
feat(frontend): scaffold React + Tailwind project
feat(frontend): build Hero/Onboarding screen with voice input
feat(frontend): build Business Profile Card
feat(frontend): build UPI/QR Setup Panel
feat(frontend): build Listing Suggestions and Promo Material screens
feat(frontend): connect frontend to backend /api/query
docs: add README
chore: add environment variable examples
```

`.gitignore` must exclude: `venv/`, `node_modules/`, `.env`, `__pycache__/`, `*.pyc`,
`dist/`, `.DS_Store`.

---

## 9. Roadmap / Known Simplifications

- **Live produce pricing:** Market Insights Agent currently gives pricing *methodology*, not live
  numbers. Wiring the Agmarknet API (data.gov.in) for same-day mandi prices is the documented next
  step (see `Live_Market_Price_Data_Agmarknet.pdf`).
- **Geolocation:** location is extracted from free text (NER via Granite), not GPS — acceptable
  for the "I sell fruit in Pune's Camp area" style input the problem statement specifies.
- **Government data sources:** since live scraping of government portals isn't realistic or
  compliant, the Policy & Scheme Agent runs on a curated, periodically-refreshed document corpus
  instead — each knowledge doc includes a "currency of information" note for exactly this reason.
