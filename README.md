# Smart Intake Triage & Grounded Knowledge Assistant

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.18-blue.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL + pgvector](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-4169E1.svg)](https://github.com/pgvector/pgvector)
[![Ollama](https://img.shields.io/badge/Ollama-self--hosted-000000.svg)](https://ollama.com/)

Two AI features built on **one self-hosted, open-source LLM** — **no hosted or commercial APIs**
(no OpenAI, Anthropic, Gemini). Everything runs on free resources.

1. **Smart Intake Triage** — classifies unstructured support messages into **validated,
   structured JSON** (category, priority, sentiment, affected module, suggested reply,
   confidence) and shows them in a filterable dashboard. Malformed model output is handled
   gracefully.
2. **Grounded Knowledge Assistant (RAG)** — answers questions from a small knowledge base,
   **grounded with citations**, and clearly says when the answer **isn't in the knowledge base**.

> **Design thesis:** the model is small and quantized; the system is made reliable by the
> engineering around it — schema-constrained decoding, runtime validation with a graceful
> fallback, retrieval grounding with citations, and an explicit "I don't know."

---

## Submission artifacts

| Artifact | Where |
| --- | --- |
| GitHub repository + this README | this repo |
| 5-minute screen recording | _[add your Loom/video link here]_ |
| 1-page decision memo | [`DECISION_MEMO`](https://github.com/KIRENGA-Remy/smart_intake_triage/blob/main/DECISION_MEMO) |
| deployed link | https://smart-intake-triage.vercel.app |

---

## Architecture

```
        Frontend — React + Vite + Tailwind  (dev :5173)
                       │  fetch JSON
                       ▼
        Express API — Node, CommonJS  (dev :4321 · container :7860)
          ├── /api/triage   POST classify + store   · GET list + filter
          ├── /api/ingest   POST add · GET list · DELETE :id
          ├── /api/ask      POST grounded answer     · GET /health
          └── /health
                       │
        ┌──────────────┴───────────────┐
        ▼                              ▼
  Ollama (:11434)              PostgreSQL + pgvector  (Supabase)
   ├ qwen2.5:3b   (chat)         ├ tickets     (UC1 triage results)
   └ nomic-embed  (embeddings)   └ documents + chunks(vector 768)  (UC2 KB)
```

**Triage flow:** text → Ollama chat (JSON-Schema-constrained, temp 0) → Zod validation →
(retry once → fallback flagged `needsReview`) → Postgres → dashboard.

**RAG flow:** question → embed → pgvector cosine search → similarity-threshold gate →
(if relevant) strict grounding prompt → answer + citations; otherwise "not in the knowledge base."

## Tech stack

| Layer | Technology |
| --- | --- |
| LLM serving | **Ollama** — `qwen2.5:3b-instruct-q3_K_S` (chat) + `nomic-embed-text` (embeddings, 768-dim) |
| Backend | **Node.js + Express** (CommonJS) |
| Database | **PostgreSQL + pgvector** (Supabase free tier) |
| ORM | **Prisma 6** |
| Validation | **Zod** |
| Frontend | **React + Vite + TailwindCSS** (plain JS) |

## Repository structure

```
smart_intake_triage/
├── backend/
│   ├── src/
│   │   ├── lib/{db,ollama,rag,schemas}.js
│   │   ├── routes/{triage,ingest,ask}.js
│   │   └── server.js
│   ├── prisma/schema.prisma
│   ├── prisma.config.ts        # Prisma 6/7 config (loads .env via dotenv)
│   ├── scripts/seed-kb.js
│   └── package.json
├── frontend/                    
│   ├── src/
│   │   ├── lib/{db,ollama,rag,schemas}.js
│   │   ├── routes/{triage,ingest,ask}.js
│   │   └── server.js
|   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js        # Tailwind CSS configuration file
│   ├── vite.config.js            # Vite configuration file
│   └── package.json
└── deploy/                      
    ├── Dockerfile                # Dockerfile
    └── start.sh                  # start.sh for Hugging Face Spaces
```

---

## Run it end-to-end (local)

### Prerequisites
- Node.js **18.18+**
- [Ollama](https://ollama.com) installed
- A PostgreSQL database with **pgvector** (free Supabase project, or local Postgres)

### 1. The self-hosted model (Ollama)
```bash
ollama pull qwen2.5:3b-instruct-q3_K_S
ollama pull nomic-embed-text
ollama list                                   # confirm both are present
# health check (server must be running):
curl http://127.0.0.1:11434/api/tags
```

### 2. The database (Supabase + pgvector)
Create a free Supabase project. In **Database → Extensions**, enable **`vector`**. Then grab the
connection strings (you need two — see note below).

### 3. Backend
```bash
cd backend
npm install
```
Create `backend/.env` (use **`127.0.0.1`**, not `localhost`, so Node doesn't try IPv6 first):
```dotenv
# Server
PORT=4321
CLIENT_ORIGIN="http://localhost:5173"

# Database — DATABASE_URL = runtime (transaction pooler 6543),
#            DIRECT_URL   = migrations (session pooler 5432)
DATABASE_URL="postgresql://postgres.<ref>:<url-encoded-password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres.<ref>:<url-encoded-password>@aws-0-<region>.pooler.supabase.com:5432/postgres?sslmode=require"

# Ollama (self-hosted)
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_CHAT_MODEL="qwen2.5:3b-instruct-q3_K_S"
OLLAMA_EMBED_MODEL="nomic-embed-text"

# RAG tuning
RAG_SIMILARITY_THRESHOLD="0.7"
RAG_TOP_K="2"
RAG_CHUNK_SIZE="180"
RAG_CHUNK_OVERLAP="40"
```
> **Two URLs are required for Supabase.** The transaction pooler (`6543`, `pgbouncer=true`) is
> for app runtime; Prisma migrations/`db push` need the direct **session pooler** (`5432`). Any
> special characters in the password must be URL-encoded.

Then create the tables and seed the knowledge base:
```bash
npm run db:generate
npm run db:push          # uses DIRECT_URL (5432) to create tables + vector column
npm run seed             # node scripts/seed-kb.js --reseed  to reset
npm run dev              # API on http://localhost:4321
```

### 4. Frontend
```bash
cd ../frontend
npm install
# create frontend/.env  ->  VITE_API_BASE="http://localhost:4321"
npm run dev              # http://localhost:5173
```

---

## API reference

### `POST /api/triage` — classify + store a message
```bash
curl -X POST http://localhost:4321/api/triage \
  -H "Content-Type: application/json" \
  -d '{"text":"The crusher at Site B stopped mid-shift, production is halted."}'
```
```json
{
  "id": "cmq8j041d00009ttb4287ij0f",
  "rawText": "The crusher at Site B stopped mid-shift, production is halted.",
  "category": "Equipment Failure",
  "priority": "Urgent",
  "summary": "A crusher has stopped mid-shift and production is halted.",
  "sentiment": "Negative",
  "affectedModule": "Crusher & Milling",
  "suggestedReply": "Thanks for flagging this — we're dispatching a technician now.",
  "confidence": 0.86,
  "needsReview": false,
  "createdAt": "2026-06-12T09:33:18.191Z"
}
```
`needsReview: true` means the model output failed validation twice and a safe fallback was stored.

### `GET /api/triage?category=&priority=` — dashboard data (filterable)

### `POST /api/ask` — grounded question answering
```bash
curl -X POST http://localhost:4321/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"How does payroll handle overtime?"}'
```
```json
{
  "answer": "Overtime and shift allowances are calculated automatically from rostered hours [1].",
  "grounded": true,
  "topSimilarity": 0.83,
  "citations": [{ "n": 1, "source": "payroll-overview.md", "title": "Payroll Module Overview", "similarity": 0.83 }]
}
```
Out-of-scope questions return `"grounded": false` with the not-in-knowledge-base message.

### Document management
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/ingest` | Add a document to the knowledge base |
| `GET` | `/api/ingest` | List documents (with chunk counts) |
| `DELETE` | `/api/ingest/:id` | Delete a document |
| `GET` | `/api/ask/health` | RAG readiness / document count |

---

## Design decisions (the deliberately under-specified points)

Full reasoning is in [`DECISION_MEMO`](https://github.com/KIRENGA-Remy/smart_intake_triage/blob/main/DECISION_MEMO); in brief:

- **Triage schema (ambiguous point #1).** Categories and modules are deliberately shaped to a
  **mining operator's real support taxonomy** (Equipment Failure, Safety Incident, Production
  Issue, Logistics, Environmental Compliance, etc.). **No PII is extracted** — names, emails and
  phone numbers are intentionally kept out of the pipeline (privacy by design).
- **"Not in the knowledge base" (ambiguous point #2).** Two independent gates: (1) a retrieval
  **similarity threshold** (`0.7`) rejects off-topic questions before the model runs; (2) a
  **strict grounding prompt** lets the model decline when the retrieved text doesn't answer. The
  threshold is corpus-dependent and exposed via env var.
- **Malformed output handling.** Ollama's `format` parameter constrains generation to a JSON
  Schema; the result is re-validated with **Zod**; on failure it **retries once**, then stores a
  **fallback record flagged `needsReview`** with the raw text preserved. Nothing crashes and
  nothing is silently wrong.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `OLLAMA_CHAT_MODEL` | `qwen2.5:3b-instruct-q3_K_S` | Generation model |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Embedding model (768-dim) |
| `OLLAMA_URL` | `http://127.0.0.1:11434` | Ollama endpoint |
| `RAG_SIMILARITY_THRESHOLD` | `0.7` | Min cosine similarity for a relevant chunk |
| `RAG_TOP_K` | `2` | Chunks retrieved per query |
| `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP` | `180` / `40` | Chunking (words) |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Allowed CORS origin (the frontend) |

---

## Deployment (free, optional)

A 100% free path that yields a shareable link. Note: a free CPU host runs the model **slowly**,
and a free Hugging Face Space **sleeps after idle** (first request after sleep takes a minute or
two to wake and load the model).

| Piece | Free host |
| --- | --- |
| Frontend | **Vercel** (`VITE_API_BASE` = your Space URL) |
| Backend + Ollama | **Hugging Face Docker Space** (2 vCPU / 16 GB RAM; listens on `:7860`) — see `deploy/` |
| Database | **Supabase** (Postgres + pgvector) |

On the Space, set these as **secrets**: `DATABASE_URL`, `CLIENT_ORIGIN` (your Vercel URL),
`OLLAMA_CHAT_MODEL`, `OLLAMA_EMBED_MODEL`, `RAG_SIMILARITY_THRESHOLD`, `RAG_TOP_K`.
The schema and knowledge base are created **once from your machine** (`db push` + `seed`), not
from the container.

## Limitations & future work

- A 3-bit-quantized 3B model on CPU is **slow** and occasionally needs review on triage — the
  guardrails contain this, they don't eliminate it. A `q4` quant or GPU would improve quality.
- Retrieval is intentionally simple (fixed-size chunks, single threshold, no reranker) — fine
  for a small KB; an HNSW index + cross-encoder reranker is the scale path.
- No streaming, auth, conversation memory, or automated eval harness yet — all are natural next
  steps and are discussed in the decision memo.

## Security

- **Never commit `.env`** or real connection strings — they belong only in local `.env`
  (gitignored) and in your host's secret manager. If a credential is ever committed, rotate it.

## License & contact

MIT © KIRENGA-Remy · Issues and contributions welcome via [GitHub](https://github.com/KIRENGA-Remy/smart_intake_triage).
