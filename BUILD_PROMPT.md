# Build Prompt — Street Vendor Digitalization Agent

Paste everything below into Claude Code (or another agentic coding tool) at the root of an empty
project folder that also contains `README.md` (already generated) and the 12 knowledge-base PDFs
sorted into `backend/knowledge_base/<agent>/` subfolders as described in the README.

---

## Prompt

You are building the full-stack implementation of the project described in `README.md` in this
repo. Read that file completely before writing any code — it is the single source of truth for
architecture, agent responsibilities, folder structure, API shape, color palette, and commit
conventions. Do not deviate from the structure it defines unless something in it is technically
impossible, in which case stop and explain why before improvising.

### Scope

Build both the `backend/` (Flask) and `frontend/` (React + Tailwind) projects exactly as laid out
in README sections 5 and 6. Implement all 5 specialist agents plus the orchestrator as real code —
each agent is a Python module with its own prompt template and, where the README marks it as
RAG-backed, its own retrieval step against the knowledge base PDFs I've already placed in
`backend/knowledge_base/`.

### Build order

1. Backend project skeleton, config loading, `.env.example`, `requirements.txt`, `.gitignore`.
2. `utils/watsonx_client.py` — a thin wrapper around the watsonx.ai Runtime API for both text
   generation (Granite) and embeddings. Make the model IDs configurable via environment variables
   rather than hardcoded, since I'll need to verify the current model IDs in my own watsonx.ai
   Studio project.
3. `rag/` — embeddings, vector store wrapper (support both a local Chroma backend for offline dev
   and a Milvus backend behind the same interface, selected via `VECTOR_DB_PROVIDER`), and an
   `ingest.py` script that walks `knowledge_base/<agent>/*.pdf`, chunks each PDF (reasonable
   chunk size with overlap), embeds the chunks, and upserts them into a per-agent collection/
   namespace so agents only ever retrieve from their own knowledge base.
4. Each specialist agent module (`agents/policy_scheme_agent.py`, etc.) — implement using the
   Name/Description/Instructions/Guidelines for that agent as defined in README section 3.
   RAG-backed agents retrieve top-k relevant chunks from their own collection before calling
   Granite; the Translation Agent has no retrieval step.
5. `agents/orchestrator.py` and the `/api/query` endpoint — extract category/location/language
   from the vendor's free-text input, delegate to the relevant specialist agent(s), merge their
   outputs into the structured JSON shape shown in README 5.2, and run the result through the
   Translation Agent last if a non-English language was requested or detected.
6. The remaining direct per-agent endpoints listed in README 5.2, for isolated testing.
7. A couple of basic tests (e.g. `pytest`) hitting `/api/health` and `/api/query` with a mocked
   watsonx client, so the suite can run without live credentials.
8. Frontend: scaffold with Vite + React + Tailwind, apply the color palette and screen list from
   README section 6 exactly (component names, palette hex values). Wire `src/api.js` to call
   `POST /api/query` on the Flask backend. Use mock/placeholder response data behind a flag so the
   UI is viewable and demoable before the backend has real credentials wired in.
9. Final pass: make sure `README.md` setup instructions actually work end-to-end from a clean
   clone (adjust the README if you had to deviate from anything).

### Credentials

I have not given you real watsonx.ai API keys. Build everything so it runs and is demoable without
them — the backend should fail gracefully with a clear message if `WATSONX_API_KEY` is unset, and
the frontend should be able to run against mock data. Never invent or hardcode a placeholder that
looks like a real key.

### Git requirements — this matters as much as the code

- Git is already initialized in this repo — do NOT run `git init`. Just commit into the existing
  repository as you go.
- Commit **incrementally, after each logical unit of work** — not one giant commit at the end.
  Follow the commit sequence in README section 8 as a guide (you can split further if a step turns
  out to be larger than expected, but don't collapse multiple steps into one commit).
- Use **Conventional Commits** format: `type(scope): short description`, types limited to
  `feat`, `fix`, `chore`, `docs`, `test`, `refactor`. Scope is `backend` or `frontend` where it
  applies.
- Write commit messages that describe *what changed and why*, not just "update files."
- Check whether `.gitignore` already exists; if not, add it in your first commit, before anything
  that should be excluded gets a chance to be tracked (`venv/`, `node_modules/`, `.env`,
  `__pycache__/`, `dist/`, `.DS_Store`). If it already exists, verify it covers these and extend it
  if needed rather than overwriting it.
- Never commit `.env` — only `.env.example` with blank values.
- At the end, show me `git log --oneline` so I can review the commit history reads cleanly, like a
  real incremental build rather than a single dump.

### When you're done

Give me a short summary of: what's implemented, what's stubbed/mocked pending real credentials,
and the exact commands to run both servers locally.
