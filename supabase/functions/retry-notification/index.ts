/**
 * ADMIN-ONLY EMAIL RETRY EDGE FUNCTION
 * Attempts to resend a previously saved contact message notification.
 * Auth/admin checks happen server-side; NEVER authorize based on React alone.
 */
// Deploy as an authenticated Edge Function (JWT verification enabled by default).
import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const url=Deno.env.get('SUPABASE_URL')||'';
const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const publicKey=Deno.env.get('SUPABASE_ANON_KEY')||'';
const origins=(Deno.env.get('ALLOWED_ORIGINS')||'http://localhost:5173').split(',').map(s=>s.trim());
const db=createClient(url,serviceKey);
function cors(origin:string){return {'Access-Control-Allow-Origin':origins.includes(origin)?origin:'null','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};}
function answer(data:unknown,status=200,origin=''){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...cors(origin)}});}
Deno.serve(async(req)=>{
  const origin=req.headers.get('Origin')||'';
  if(req.method==='OPTIONS')return new Response('',{status:204,headers:cors(origin)});
  if(req.method!=='POST')return answer({ok:false,error:'Method not allowed'},405,origin);
  if(!origins.includes(origin))return answer({ok:false,error:'Origin not allowed'},403,origin);
  const jwt=req.headers.get('Authorization')?.replace(/^Bearer\s+/i,'');
  if(!jwt)return answer({ok:false,error:'Not authenticated'},401,origin);
  const client=createClient(url,publicKey);
  const {data:{user},error:userError}=await client.auth.getUser(jwt);
  if(userError||!user)return answer({ok:false,error:'Not authenticated'},401,origin);
  const {data:allow,error:allowError}=await db.from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
  if(allowError||!allow)return answer({ok:false,error:'Forbidden'},403,origin);
  try{
    const {messageId}=await req.json();
    if(typeof messageId!=='string'||! /^[0-9a-f-]{36}$/i.test(messageId))return answer({ok:false,error:'Invalid ID'},400,origin);
    const {data:record,error}=await db.from('contact_messages').select('*').eq('id',messageId).single();
    if(error||!record)return answer({ok:false,error:'Message not found'},404,origin);
    if(record.notification_status==='sent')return answer({ok:true,alreadySent:true},200,origin);
    const apiKey=Deno.env.get('RESEND_API_KEY');const to=Deno.env.get('NOTIFY_ADMIN_EMAIL');const from=Deno.env.get('NOTIFY_FROM_EMAIL');
    if(!apiKey||!to||!from)return answer({ok:false,error:'Email provider not configured'},503,origin);
    const content=`New portfolio enquiry\nName: ${record.name}\nEmail: ${record.email}\nSubject: ${record.subject}\nTime: ${record.created_at}\n\n${record.message}`;
    const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify({from,to:[to],subject:'Portfolio enquiry (retry)',text:content,reply_to:record.email})});
    if(!response.ok)throw new Error(`Email API returned ${response.status}`);
    await db.from('contact_messages').update({notification_status:'sent',notification_sent_at:new Date().toISOString(),notification_attempts:record.notification_attempts+1,notification_error:null}).eq('id',messageId);
    return answer({ok:true},200,origin);
  }catch(e){return answer({ok:false,error:String(e).slice(0,200)},500,origin);}
});
