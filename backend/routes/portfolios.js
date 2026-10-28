const express=require('express');
const crypto=require('node:crypto');
const db=require('../supabase');
const router=express.Router();
const fields=['name','headline','bio','location','email','website','github','linkedin','skills','projects'];
const limits={name:100,headline:160,bio:1200,location:120,email:254,website:500,github:500,linkedin:500,skills:500,projects:5000};
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function validate(body){
 if(!body||typeof body!=='object'||Array.isArray(body))return 'Send a JSON object.';
 for(const key of fields)if(typeof body[key]!=='string'||body[key].length>limits[key])return 'Check each field and its maximum length.';
 if(!body.name.trim()||!body.headline.trim())return 'Name and headline are required.';
 if(body.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim()))return 'Enter a valid email address.';
 for(const key of ['website','github','linkedin'])if(body[key]){try{const u=new URL(body[key]);if(!['http:','https:'].includes(u.protocol))return 'Links must use http or https.'}catch{return 'Enter a valid website link.'}}
 return null
}
function clean(row){if(row)delete row.edit_token_hash;return row}
function report(res,error){console.error('Database operation failed:',error.message);return res.status(500).json({error:'Database request failed. Check your server setup.'})}
router.post('/',async(req,res)=>{
 const problem=validate(req.body);if(problem)return res.status(400).json({error:problem});
 try{const token=crypto.randomBytes(32).toString('base64url'),data=Object.fromEntries(fields.map(k=>[k,req.body[k].trim()]));data.slug=(data.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45)||'portfolio')+'-'+crypto.randomBytes(3).toString('hex');data.edit_token_hash=hash(token);
 const result=await db.from('forma_portfolios').insert(data).select('*').single();if(result.error)throw result.error;res.status(201).json({portfolio:clean(result.data),editToken:token})}catch(error){report(res,error)}
});
router.get('/:slug',async(req,res)=>{
 try{const result=await db.from('forma_portfolios').select('id,slug,name,headline,bio,location,email,website,github,linkedin,skills,projects,created_at,updated_at').eq('slug',req.params.slug).maybeSingle();if(result.error)throw result.error;if(!result.data)return res.status(404).json({error:'Portfolio not found.'});res.json({portfolio:result.data})}catch(error){report(res,error)}
});
router.put('/:slug',async(req,res)=>{
 const token=req.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token||token.length>200)return res.status(401).json({error:'A valid edit token is required.'});
 const problem=validate(req.body);if(problem)return res.status(400).json({error:problem});
 try{const changes=Object.fromEntries(fields.map(k=>[k,req.body[k].trim()]));const result=await db.from('forma_portfolios').update(changes).eq('slug',req.params.slug).eq('edit_token_hash',hash(token)).select('*').maybeSingle();if(result.error)throw result.error;if(!result.data)return res.status(403).json({error:'That edit token is not valid for this portfolio.'});res.json({portfolio:clean(result.data)})}catch(error){report(res,error)}
});
router.delete('/:slug',async(req,res)=>{
 const token=req.get('authorization')?.replace(/^Bearer\s+/i,'');if(!token||token.length>200)return res.status(401).json({error:'A valid edit token is required.'});
 try{const result=await db.from('forma_portfolios').delete().eq('slug',req.params.slug).eq('edit_token_hash',hash(token)).select('id').maybeSingle();if(result.error)throw result.error;if(!result.data)return res.status(403).json({error:'That edit token is not valid for this portfolio.'});res.status(204).end()}catch(error){report(res,error)}
});
module.exports=router;