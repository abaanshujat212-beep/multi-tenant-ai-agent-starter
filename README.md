# Multi-Tenant AI Agent Starter

An **interview/demo starter**, not a production SaaS. A minimal Node.js HTTP API with independent customer agent prompts, lead capture, chat responses, and tenant-scoped reporting. No external npm dependencies. No live channel integrations yet.

## Quick start

```bash
cp .env.example .env
# Set API_KEY and optionally OPENAI_API_KEY in .env
node --env-file=.env src/server.js
```

Node.js 20+ required. Run `npm test` for the basic unit test.

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/tenants/demo/chat -H 'content-type: application/json' -H 'x-api-key: replace-with-long-random-secret' -d '{"message":"What services do you provide?"}'
curl -X POST http://localhost:3000/api/tenants/demo/leads -H 'content-type: application/json' -H 'x-api-key: replace-with-long-random-secret' -d '{"name":"Demo Lead","contact":"lead@example.com","source":"website"}'
curl http://localhost:3000/api/tenants/demo/metrics -H 'x-api-key: replace-with-long-random-secret'
```

Without an OpenAI key, the chat endpoint uses **demo mode** (no artificial claim that AI responded). With a key, it calls the Chat Completions API and returns a response and token usage. Configure customer names, prompts and optional model in `TENANTS_JSON`. Do not use real customer personal information in this demonstration.

## Current architecture

```
Website / CRM / WhatsApp adapters (future)
               |
          HTTP API layer
               |
       Tenant auth + routing
         /       |       \
   AI provider  Leads   Observability
         \       |       /
       Tenant-scoped in-memory state
```

## What to build before real client deployment

- PostgreSQL with strict tenant-specific row-level access, migrations and encrypted secrets per customer.
- Tenant-specific API keys / OAuth, secret rotation, RBAC and rate limits (starter uses one global key).
- Conversation memory, retrieval-grounded company knowledge, tool calling, approvals and escalation to a human.
- WhatsApp Cloud API / GHL / email / voice adapters with webhook signature verification, consent checks and idempotency.
- Durable metrics/event store, dashboards, cost accounting, data retention, PII minimization, audit logs and alerting.
- Provider timeouts, retry policy, token budgets, concurrency limits, injection resistance, and safety tests.
- Container build, CI, monitoring and deployment.

**Important limitations:** In-memory data resets when process restarts; one global API key is for demo only; `TENANTS_JSON` is not a secure configuration store; no authentication UI and no cost estimation yet. Do not expose publicly or store real customer data.

See `docs/architecture.md` for the roadmap and `docs/reporting.md` for AI reporting and monitoring metrics.
