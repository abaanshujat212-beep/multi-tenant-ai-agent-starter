import http from 'node:http';
import { loadTenants, tenantFor, tenantIds, recordEvent, createLead, summary, checkAuthorized, generateReply } from './core.js';
loadTenants();
const port = Number(process.env.PORT || 3000);
const LIMIT = 32_768;
function reply(res, status, data) {res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));}
async function body(req) {
  let text=''; for await(const chunk of req){text += chunk.toString();if(text.length>LIMIT) throw new Error('Request too large');}
  return JSON.parse(text||'{}');
}
const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&url.pathname==='/health') return reply(res,200,{status:'ok',tenants:tenantIds().length});
  const match=url.pathname.match(/^\/api\/tenants\/([a-zA-Z0-9_-]+)\/(chat|leads|metrics)$/);
  if(!match) return reply(res,404,{error:'Not found'});
  const [,tenantId,action]=match;
  if(!checkAuthorized(req,tenantId)) return reply(res,401,{error:'Unauthorized'});
  if(action==='metrics' && req.method==='GET') return reply(res,200,summary(tenantId));
  if(req.method!=='POST'||!['chat','leads'].includes(action)) return reply(res,405,{error:'Method not allowed'});
  try {
    const data=await body(req);
    if(action==='leads') {
      const name=String(data.name||'').trim(); const contact=String(data.contact||'').trim();
      if(!name||!contact||name.length>200||contact.length>250) return reply(res,400,{error:'Valid name and contact are required'});
      return reply(res,201,{lead:createLead(tenantId,{name,contact,source:String(data.source||'api').slice(0,100)})});
    }
    const message=String(data.message||'').trim();
    if(!message||message.length>4000) return reply(res,400,{error:'message must be 1–4000 characters'});
    const started=Date.now();
    try {
      const result=await generateReply(tenantFor(tenantId),message);
      recordEvent(tenantId,'chat_success',{latencyMs:Date.now()-started,mode:result.mode,usage:result.usage});
      return reply(res,200,{tenantId,...result});
    } catch(err) {recordEvent(tenantId,'chat_error',{latencyMs:Date.now()-started,error:err.message}); return reply(res,502,{error:'AI provider failure'});}
  } catch(err){return reply(res,400,{error:err.message==='Request too large'?err.message:'Invalid request body'});}
});
server.listen(port,()=>console.log(`AI agent starter on :${port}`));
