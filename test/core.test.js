import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTenants,tenantFor,createLead,summary,recordEvent} from '../src/core.js';
test('tenant isolation and lead metrics',()=>{
  process.env.TENANTS_JSON=JSON.stringify({alpha:{name:'A',systemPrompt:'A rules'},beta:{name:'B',systemPrompt:'B rules'}});
  loadTenants();
  assert.equal(tenantFor('alpha').name,'A');
  createLead('alpha',{name:'Test',contact:'test@example.com'});
  recordEvent('alpha','chat_success',{latencyMs:120});
  assert.equal(summary('alpha').leadCount,1);
  assert.equal(summary('beta').leadCount,0);
  assert.equal(summary('alpha').counters.chat_success,1);
});
