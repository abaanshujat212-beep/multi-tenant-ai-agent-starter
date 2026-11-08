# AI Reporting & Monitoring Checklist

## Business metrics
- Leads by source, qualification rate, response time, appointments booked, conversion to sale, paid revenue, assisted revenue.
- Follow-up completion, missed leads, human handoffs and resolved cases.
- Compare baseline vs automation pilot; attribute revenue carefully, not every AI-influenced sale is incremental revenue.

## AI quality
- Answer correctness from reviewed samples, groundedness, hallucination/error categories, escalation success, user satisfaction.
- AI model/provider version and prompt version per run; regression eval suite before changes.

## Reliability
- Chat/voice/workflow success and error rate, median and p95 latency, webhook failure/retry/duplicate count, job queue age.
- Failed CRM writes, timeout count, stale leads and unassigned conversations.

## Spend
- Tokens consumed, model cost estimate from current provider price sheet, cost per resolved conversation, telephony minutes, cost per qualified lead.
- Per-tenant quotas and overspend alerts.

## Security and compliance
- Redacted structured logs, request ID, tenant ID, event ID, timestamps, retention policies, role-restricted dashboards.
- Avoid recording plaintext API keys, secrets or full customer messages in application logs.

## Alert ideas (illustrative thresholds)
- 5+ provider errors in 10 minutes, lead sync delay >5 minutes, webhook failure >2%, daily estimated AI spend above approved budget.
- Thresholds should be tuned against real traffic and expected service levels.

## Starter endpoints
- `GET /api/tenants/:tenantId/metrics`: tenant-scoped counters, last 20 events, lead count.
- `GET /health`: process status.

### Before interview
Explain how you would combine **CRM business metrics + LLM observability + workflow execution logs** into one dashboard; how to set alerts, who receives alerts, how to diagnose failures, and how to prove the pilot improved outcomes.
