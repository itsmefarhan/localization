# 🌐 AI-Powered Agentic Copy Localization Engine

A production-grade, multi-stage AI agent pipeline built using **LangGraph**, **FastAPI**, and **Next.js** that delivers authentic, culturally fluent marketing copy localization. 

Unlike standard literal translation tools (which blindly swap vocabulary), this system executes a sophisticated agentic loop to audit regional friction, perform live web search validation, adapt colloquial slang, and enforce contextual economic safety constraints (such as realistic currency normalization).

---

## 🚀 Core Features

* **Multi-Model Cascading Architecture:** Orchestrates tasks dynamically between a fast, mechanical model (`llama-3.1-8b-instant`) for structural JSON parsing and a deep-reasoning model (`llama-3.3-70b-versatile`) for nuanced copywriting.
* **Structured JSON Output Constraints:** Leverages Groq's high-speed native `json_mode` wrapped with **Pydantic** type validation to ensure deterministic state transitions.
* **Asynchronous REST Infrastructure:** Uses `httpx.AsyncClient` inside specialized Graph execution threads to safeguard FastAPI's event loop from blocking during real-time network interactions.
* **Live Web Verification (Tavily AI):** Real-time web-scraping layer that dynamically pulls hyper-local current social trends, seasonal milestones, or regional slang to enrich the agent's contextual knowledge base.
* **Persistent Session Memory:** Integrated LangGraph `MemorySaver` checkpoint layer to maintain state across independent execution turns via specific `thread_id` markers (enabling contextual follow-up edits like *"make it shorter and rewrite for a TikTok caption"*).
* **Real-time Streaming Interface:** Asynchronous backend execution events stream natively into a modern Next.js 15 dashboard layout for live multi-column comparison.

---

## 📁 System Architecture & Directory Layout

The backend decouples state schemas, validation rules, and atomic agent functions into a highly modular layout stationed directly at the root level:

backend/
├── nodes/
│   ├── translation.py      # Node 1: Direct translation & linguistic friction extraction
│   ├── verification.py     # Node 2: Asynchronous Tavily REST web context retrieval
│   └── adaptation.py       # Node 3: High-level 70B cultural copywriting & currency safety
├── state.py                # Graph state schema definitions (TypedDict)
├── schemas.py              # Pydantic validation structures for structured JSON parsing
├── graph.py                # StateGraph orchestrator compilation and memory checkpointer
├── main.py                 # FastAPI system entry point & asynchronous stream router
├── .env                    # System infrastructure secret variables
└── pyproject.toml          # Python dependency specifications (managed via uv)

## ⚙️ Environment Variables Configuration
To spin up the system core pipelines, configure a .env file at the root level of your backend project directory containing the following active API credentials:

### Groq Cloud API Key - Critical for Llama-3.1-8B and Llama-3.3-70B model execution
GROQ_API_KEY=gsk_your_production_groq_key_here

### Tavily AI Search API Key - Powers real-time cultural web verification steps
TAVILY_API_KEY=tvly-your_production_tavily_key_here

## ⚡ Agentic Pipeline Workflow Engine Explained
[Input Text] 
       │
       ▼
┌───────────────────────────────┐
│     Node 1: Translation       │ ──► Llama 3.1 8B (json_mode)
│  - Generates Base Text        │     Extracts raw string wrappers precisely
│  - Audits Friction Areas      │     Outputs structured Pydantic array
└───────────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│     Node 2: Verification      │ ──► HTTPX Async REST Client
│  - Queries Tavily Web Engine  │     Fetches live 2026 local context
│  - Pulls Current Social Data  │     Prevents execution blocking
└───────────────────────────────┘
       │
       ▼
┌───────────────────────────────┐
│      Node 3: Adaptation       │ ──► Llama 3.3 70B (Creative Copy)
│  - Enforces Currency Safety   │     Protects exchange metrics ($1,200 USD stays USD)
│  - Applies Native Voice/Slang │     Outputs flawless localized marketing copy
└───────────────────────────────┘
       │
       ▼
  [Next.js Dynamic UI Panels]

### Strategic Component Deep-Dive:
1. Linguistic Friction Auditing: Instead of standard word swaps, Node 1 maps complex jargon, temporal tags (like timezone identifiers like EST), and idiomatic phrases into a structural friction list.

2. Context-Aware Slicing Logic: To combat text mutation edge cases where JSON modes inadvertently return leading quotes or syntax elements (";), the translation parser applies defensive string array boundary condition checks to protect regional character accents (like ¡Échale).

3. The Financial Guardrail Filter: Node 3 implements a strict evaluation condition regarding asset numerical properties. If a currency amount matches a product entity but lacks verified conversion parity values in the web scraper payload, it overrides blind adaptation rules to preserve the financial integrity of the pricing metrics (e.g., locking it as $1.200 USD rather than outputting a deceptive figure like 1.200 pesos).