import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDB,id,token,hash,reserveInvite,acceptInvite,canRead } from '../server/db.js';
import { createApp } from '../server/app.js';
import { publicAddress,fetchJobPage } from '../server/importer.js';
import { jobSchema } from '../server/validation.js';
import { auditJob } from '../server/job-audit.js';
import { googlePicture } from '../server/profile.js';

let db,server,base;const accounts={};
before(async()=>{db=openDB(':memory:');for(const name of ['owner','guest','stranger']){const user={id:id(),email:`${name}@gmail.com`,name,csrf:token(),raw:token()};accounts[name]=user;db.prepare('INSERT INTO users(id,google_sub,email,name,demo) VALUES(?,?,?,?,0)').run(user.id,name,user.email,name);db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(user.raw),user.id,user.csrf,Date.now()+60000);}const app=createApp(db,{url:'http://localhost:3000',production:false,demo:false});server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;});
after(async()=>{await new Promise(r=>server.close(r));db.close();});
async function request(path,{user='owner',method='GET',body,csrf=true,origin='http://localhost:3000'}={}){const a=accounts[user];const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Origin:origin,...(a?{Cookie:`oo_session=${a.raw}`,...(csrf?{'X-CSRF-Token':a.csrf}:{})}:{})},body:body?JSON.stringify(body):undefined,redirect:'manual'});const data=await response.json();return {status:response.status,data};}
test('anonymous users cannot read workspaces',async()=>{assert.equal((await request('/api/workspace',{user:'anonymous'})).status,401);});
test('profile pictures are exposed only through authorized profile and workspace responses',async()=>{
 const picture='https://lh3.googleusercontent.com/a/example';
 db.prepare('UPDATE users SET picture=? WHERE id=?').run(picture,accounts.owner.id);
 assert.equal((await request('/api/me')).data.user.picture,picture);
 assert.equal((await request('/api/workspace')).data.owner.picture,picture);
 assert.equal((await request('/api/workspace?owner='+accounts.owner.id,{user:'stranger'})).status,403);
 const created=await request('/api/records/jobs',{method:'POST',body:{title:'Perfil',company:'Teste',createdBy:{picture:'https://evil.example'}}});
 assert.equal(created.data.createdBy.picture,picture);
});
test('Google picture normalization rejects unsafe and unrelated image origins',()=>{
 assert.equal(googlePicture('https://lh3.googleusercontent.com/a/photo'),'https://lh3.googleusercontent.com/a/photo');
 for(const url of [undefined,'','javascript:alert(1)','data:image/png;base64,AAAA','http://lh3.googleusercontent.com/a','https://googleusercontent.com.evil.example/a','https://evil.example/a','https://user:pass@lh3.googleusercontent.com/a','https://lh3.googleusercontent.com:8443/a'])assert.equal(googlePicture(url),'');
});
test('CSRF and origin are enforced on writes',async()=>{assert.equal((await request('/api/records/jobs',{method:'POST',csrf:false,body:{}})).status,403);assert.equal((await request('/api/records/jobs',{method:'POST',origin:'https://evil.example',body:{}})).status,403);});
test('Google state callback rejects absent or mismatched state',async()=>{const response=await fetch(base+'/auth/google/callback?state=bogus&code=bogus',{redirect:'manual'});assert.equal(response.status,302);assert.equal(response.headers.get('location'),'/?authError=failed');});
test('job create/edit, history and stale-write protection',async()=>{const created=await request('/api/records/jobs',{method:'POST',body:{title:'Frontend',company:'Empresa'}});assert.equal(created.status,201);assert.equal(created.data.stage,'saved');const update=await request('/api/records/jobs/'+created.data.id,{method:'PUT',body:{...created.data,stage:'interview'}});assert.equal(update.status,200);assert.equal(update.data.history.length,2);assert.equal(update.data.version,2);assert.equal((await request('/api/records/jobs/'+created.data.id,{method:'PUT',body:created.data})).status,409);assert.equal((await request('/api/records/jobs/'+created.data.id,{method:'PUT',user:'stranger',body:update.data})).status,404);});
test('invite limit, duplicate, wrong email, accept, read-only and revoke',async()=>{const a=accounts.owner,b=accounts.guest;const first=reserveInvite(db,a.id,b.email);db.prepare("UPDATE invites SET status='pending' WHERE id=?").run(first.id);assert.equal(canRead(db,b.id,a.id),false);assert.throws(()=>reserveInvite(db,a.id,b.email),/já está convidado/);assert.throws(()=>acceptInvite(db,first.raw,accounts.stranger),/conta Google/);reserveInvite(db,a.id,'two@gmail.com');reserveInvite(db,a.id,'three@gmail.com');assert.throws(()=>reserveInvite(db,a.id,'four@gmail.com'),/três convites/);acceptInvite(db,first.raw,b);assert.equal(canRead(db,b.id,a.id),true);assert.equal((await request('/api/workspace?owner='+a.id,{user:'guest'})).status,200);assert.equal((await request('/api/records/jobs?owner='+a.id,{user:'guest',method:'POST',body:{title:'Forbidden',company:'X'}})).status,403);assert.equal((await request('/api/workspace?owner='+a.id,{user:'stranger'})).status,403);assert.equal((await request('/api/invites/'+first.id+'/revoke',{method:'POST',body:{}})).status,200);assert.equal(canRead(db,b.id,a.id),false);assert.throws(()=>acceptInvite(db,first.raw,b),/expirado ou revogado/);assert.equal((await request('/api/workspace?owner='+a.id,{user:'guest'})).status,403);});
test('expired invitations cannot be accepted and free a slot',()=>{const expired=reserveInvite(db,accounts.owner.id,'expired@gmail.com');db.prepare("UPDATE invites SET status='pending',expires=? WHERE id=?").run(Date.now()-1000,expired.id);assert.throws(()=>acceptInvite(db,expired.raw,{id:accounts.guest.id,email:'expired@gmail.com'}),/expirado/);assert.doesNotThrow(()=>reserveInvite(db,accounts.owner.id,'replacement@gmail.com'));});
test('file content validation and cross-user file access',async()=>{const fake=await request('/api/files',{method:'POST',body:{name:'test.pdf',mime:'application/pdf',base64:Buffer.from('not a real pdf file').toString('base64')}});assert.equal(fake.status,400);const file=await request('/api/files',{method:'POST',body:{name:'test.pdf',mime:'application/pdf',base64:Buffer.from('%PDF-1.4\n%%EOF\n').toString('base64')}});assert.equal(file.status,201);assert.equal((await request('/api/files/'+file.data.id,{user:'stranger'})).status,404);const badReference=await request('/api/records/resumes',{user:'stranger',method:'POST',body:{name:'Stolen',fileId:file.data.id}});assert.equal(badReference.status,400);});
test('missing providers return honest configuration errors',async()=>{assert.equal((await request('/api/import',{method:'POST',body:{text:'vaga'}})).status,503);assert.equal((await request('/api/invites',{method:'POST',body:{email:'new@gmail.com'}})).status,503);assert.equal((await request('/auth/demo',{method:'POST',body:{}})).status,403);});
test('SSRF rejects private, loopback, link-local, mapped and non-HTTPS addresses',async()=>{for(const address of ['127.0.0.1','10.1.2.3','192.168.1.1','172.16.0.1','169.254.169.254','::1','::ffff:127.0.0.1','fe80::1','fc00::1'])assert.equal(publicAddress(address),false,address);assert.equal(publicAddress('8.8.8.8'),true);await assert.rejects(fetchJobPage('http://example.com'),/HTTPS/);await assert.rejects(fetchJobPage('https://user:pass@example.com'),/HTTPS/);});
test('schema rejects script links, invalid stages, dates, and excessive text',()=>{const base={title:'Developer',company:'Company'};assert.equal(jobSchema.safeParse({...base,url:'javascript:alert(1)'}).success,false);assert.equal(jobSchema.safeParse({...base,stage:'admin'}).success,false);assert.equal(jobSchema.safeParse({...base,deadline:'2026-02-31'}).success,false);assert.equal(jobSchema.safeParse({...base,notes:'x'.repeat(12001)}).success,false);});

test('contributors add scoped opportunities, upload prints, track submissions; owner controls roles',async()=>{
 for(const name of ['teamOwner','contributor','viewer']){const user={id:id(),email:`${name.toLowerCase()}@gmail.com`,name,csrf:token(),raw:token()};accounts[name]=user;db.prepare('INSERT INTO users(id,google_sub,email,name,demo) VALUES(?,?,?,?,0)').run(user.id,name,user.email,name);db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(user.raw),user.id,user.csrf,Date.now()+60000);}
 const own=accounts.teamOwner,con=accounts.contributor;
 const invitation=reserveInvite(db,own.id,con.email,'contributor');
 const viewerInvite=reserveInvite(db,own.id,accounts.viewer.email);
 for(const [invite,user] of [[invitation,con],[viewerInvite,accounts.viewer]]){db.prepare("UPDATE invites SET status='pending' WHERE id=?").run(invite.id);acceptInvite(db,invite.raw,user);}
 const scope='?owner='+own.id;
 assert.equal((await request('/api/workspace'+scope,{user:'contributor'})).data.role,'contributor');
 assert.equal((await request('/api/workspace'+scope,{user:'viewer'})).data.readOnly,true);
 const image={name:'vaga.png',mime:'image/png',base64:Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0]).toString('base64')};
 assert.equal((await request('/api/files'+scope,{user:'viewer',method:'POST',body:image})).status,403);
 const uploaded=await request('/api/files'+scope,{user:'contributor',method:'POST',body:image});assert.equal(uploaded.status,201);
 assert.equal(db.prepare('SELECT owner FROM files WHERE id=?').get(uploaded.data.id).owner,own.id);
 const created=await request('/api/records/jobs'+scope,{user:'contributor',method:'POST',body:{title:'Vaga indicada',company:'Equipe',url:'https://example.com/vaga',attachmentId:uploaded.data.id,createdBy:{id:own.id,name:'spoofed'}}});
 assert.equal(created.status,201);assert.equal(created.data.createdBy.id,con.id);assert.equal(created.data.resumeSent,false);
 assert.equal((await request('/api/workspace',{user:'contributor'})).data.jobs.length,0);
 const path='/api/records/jobs/'+created.data.id+scope;
 const sent=await request(path,{user:'contributor',method:'PUT',body:{...created.data,resumeSent:true,resumeSentBy:'contributor',appliedAt:'2026-11-10',submissionRecordedBy:{id:own.id}}});
 assert.equal(sent.status,200);assert.equal(sent.data.stage,'applied');assert.equal(sent.data.submissionRecordedBy.id,con.id);assert.equal(sent.data.history.at(-1).actor.id,con.id);
 const stage=await request(path,{user:'teamOwner',method:'PUT',body:{...sent.data,stage:'interview'}});assert.equal(stage.status,200);assert.equal(stage.data.createdBy.id,con.id);assert.equal(stage.data.updatedBy.id,own.id);
 assert.equal((await request(path,{user:'contributor',method:'PUT',body:{...stage.data,archived:true}})).status,403);
 for(const kind of ['platforms','resumes'])assert.equal((await request('/api/records/'+kind+scope,{user:'contributor',method:'POST',body:{name:'Forbidden'}})).status,403);
 assert.equal((await request('/api/files'+scope,{user:'contributor',method:'POST',body:{name:'cv.pdf',mime:'application/pdf',base64:Buffer.from('%PDF-1.4\n%%EOF\n').toString('base64')}})).status,403);
 assert.equal((await request('/api/import'+scope,{user:'viewer',method:'POST',body:{text:'vaga'}})).status,403);
 assert.equal((await request('/api/import'+scope,{user:'contributor',method:'POST',body:{text:'vaga'}})).status,503);
 assert.equal((await request('/api/invites/'+invitation.id+'/role',{user:'contributor',method:'PUT',body:{role:'viewer'}})).status,404);
 assert.equal((await request('/api/invites/'+invitation.id+'/role',{user:'teamOwner',method:'PUT',body:{role:'administrator'}})).status,400);
 assert.equal((await request('/api/invites/'+invitation.id+'/role',{user:'teamOwner',method:'PUT',body:{role:'viewer'}})).status,200);
 assert.equal((await request(path,{user:'contributor',method:'PUT',body:stage.data})).status,403);
 assert.equal((await request('/api/files'+scope,{user:'contributor',method:'POST',body:image})).status,403);
 assert.equal((await request('/api/workspace'+scope,{user:'contributor'})).data.readOnly,true);
 assert.equal((await request('/api/invites/'+invitation.id+'/role',{user:'teamOwner',method:'PUT',body:{role:'contributor'}})).status,200);
 assert.equal((await request('/api/invites/'+invitation.id+'/revoke',{user:'teamOwner',method:'POST',body:{}})).status,200);
 assert.equal((await request('/api/files/'+uploaded.data.id,{user:'contributor'})).status,404);
 assert.equal((await request(path,{user:'contributor',method:'PUT',body:stage.data})).status,403);
 assert.equal((await request('/api/invites/'+invitation.id+'/role',{user:'teamOwner',method:'PUT',body:{role:'contributor'}})).status,404);
});

test('submission can be recorded by either role and undone with an attributed history',()=>{
 const user={id:'owner',name:'Titular'},original=jobSchema.parse({title:'A',company:'B',resumeSent:true,resumeSentBy:'contributor',appliedAt:'2026-11-10'});
 auditJob(original,null,user,'owner');assert.equal(original.stage,'applied');assert.equal(original.resumeSentBy,'contributor');assert.equal(original.submissionRecordedBy.id,'owner');
 const undone=jobSchema.parse({...original,resumeSent:false});auditJob(undone,original,user,'owner');assert.equal(undone.stage,'saved');assert.equal(undone.appliedAt,'');assert.equal(undone.resumeSentBy,'');assert.match(undone.history.at(-1).note,/removida/);
 const legacy={title:'A',company:'B',stage:'interview',appliedAt:'2026-11-01'};const updated=jobSchema.parse(legacy);auditJob(updated,legacy,user,'owner');assert.equal(updated.resumeSent,true);assert.equal(updated.appliedAt,'2026-11-01');
});
