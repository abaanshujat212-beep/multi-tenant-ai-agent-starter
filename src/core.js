import { randomUUID } from 'node:crypto';

const tenants = new Map();
const metrics = new Map();
const leads = new Map();
const events = [];
const MAX_EVENTS = 10000;

export function loadTenants() {
  const json = process.env.TENANTS_JSON || '{"demo":{"name":"Demo Customer","systemPrompt":"You are a helpful sales assistant. Only discuss the customer business and clearly say when you do not know an answer."}}';
  const data = JSON.parse(json);
  for (const [id, config] of Object.entries(data)) {
    if (!/^[a-zA-Z0-9_-]{2,64}$/.test(id) || !config?.name || !config?.systemPrompt) throw new Error(`Invalid tenant configuration: ${id}`);
    tenants.set(id, { name: String(config.name), systemPrompt: String(config.systemPrompt), model: config.model || process.env.OPENAI_MODEL || 'gpt-4.1-mini' });
  }
}

export function tenantFor(id) { return tenants.get(id); }
export function tenantIds() { return [...tenants.keys()]; }
export function recordEvent(tenantId, kind, data = {}) {
  const entry = {id:randomUUID(), tenantId,kind,at:new Date().toISOString(), ...data};
  events.push(entry); if (events.length > MAX_EVENTS) events.shift();
  const key = `${tenantId}:${kind}`; metrics.set(key,(metrics.get(key)||0)+1);
  return entry;
}
export function createLead(tenantId, {name, contact, source}) {
  const lead = {id:randomUUID(), tenantId,name,contact,source:source||'api',createdAt:new Date().toISOString(),status:'new'};
  leads.set(lead.id,lead); recordEvent(tenantId,'lead_created'); return lead;
}
export function summary(tenantId) {
  const prefix = `${tenantId}:`;
  const counters = Object.fromEntries([...metrics].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k.slice(prefix.length),v]));
  const recent = events.filter(e=>e.tenantId===tenantId).slice(-20).reverse();
  return {tenantId,counters,leadCount:[...leads.values()].filter(x=>x.tenantId===tenantId).length,recent};
}
export function checkAuthorized(req, tenantId) {
  const expected = process.env.API_KEY;
  if (!expected) return false;
  return req.headers['x-api-key'] === expected && tenants.has(tenantId);
}
export async function generateReply(tenant, message) {
  if (!process.env.OPENAI_API_KEY) return {reply:'Demo mode: connect an OpenAI API key to enable AI responses.',usage:null,mode:'demo'};
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},
    body:JSON.stringify({model:tenant.model,messages:[{role:'system',content:tenant.systemPrompt},{role:'user',content:message}],max_tokens:350})
  });
  if (!res.ok) throw new Error(`AI provider HTTP ${res.status}`);
  const json = await res.json();
  return {reply:json.choices?.[0]?.message?.content||'No reply generated.',usage:json.usage||null,mode:'live'};
}
