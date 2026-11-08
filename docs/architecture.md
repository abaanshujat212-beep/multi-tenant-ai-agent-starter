# Architecture & customer rollout

## Reusable agent template

One codebase; each customer receives a tenant ID, brand instructions, permitted knowledge sources, connected channels, approved agent actions, escalation rules and usage limits. Separate data and permissions by tenant.

## Workflow

1. Capture lead from form, WhatsApp or CRM webhook.
2. Verify webhook and deduplicate event; look up tenant.
3. Load tenant-specific business facts and allowed tools.
4. Run conversation agent; require human approval for payments/refunds/sensitive actions.
5. Write events, lead state, response latency and token usage.
6. Route to CRM and assign human follow-up where required.
7. Aggregate KPIs in dashboard and send alerts.

## Proposed production components

- UI: Next.js for tenant setup, agent prompt management and dashboard.
- API: Node.js / TypeScript (Fastify/Express) or Python (FastAPI).
- Database: PostgreSQL, tenant_id on every business record and row-level security.
- Workflow engine: n8n for CRM, WhatsApp and email orchestration.
- AI agent runtime: LLM provider SDK, tool calling and optionally LangGraph for complex stateful execution.
- Queue: Redis/BullMQ or managed equivalent for durable async jobs.
- Observability: OpenTelemetry traces, Prometheus/Grafana or hosted equivalents, structured logs and alerts.

## Customer intake questionnaire

Current CRM? Channels? Daily lead/call volume? Allowed automated actions? Consent and privacy needs? Escalation ownership? Business hours? Languages? Budget? Historical KPI baselines?

## Rollout

Demo -> one sandbox customer -> pilot with real integrations and human handoff -> load/security testing -> production with monitoring.
