import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startDemo,demoApi,demoSession,demoFileUrl} from '../src/pagesDemo.ts';

test('Pages preview runs without backend and keeps mutations only in this page session',async()=>{
 assert.equal(demoSession(),null);
 assert.deepEqual(await demoApi('/config'),{google:false,email:false,ai:false,demo:true});
 startDemo();assert.equal(demoSession().user.demo,true);
 const original=await demoApi('/workspace');assert.equal(original.jobs.length,6);
 original.jobs[0].title='Mutated response';assert.notEqual((await demoApi('/workspace')).jobs[0].title,'Mutated response');
 const created=await demoApi('/records/jobs','POST',{...original.jobs[0],id:undefined,title:'Teste Pages',company:'Empresa',stage:'saved',resumeSent:false});
 const sent=await demoApi('/records/jobs/'+created.id,'PUT',{...created,resumeSent:true,resumeSentBy:'contributor'});
 assert.equal(sent.stage,'applied');assert.equal(sent.resumeSentBy,'contributor');assert.equal((await demoApi('/workspace')).jobs.length,7);
 await assert.rejects(demoApi('/invites','POST',{email:'nobody@example.invalid'}),/servidor/);
 await assert.rejects(demoApi('/import','POST',{text:'vaga'}),/servidor/);
 const image=await demoApi('/files','POST',{name:'print.png',mime:'image/png',base64:'iVBORw0KGgoAAAAA'});
 assert.match(demoFileUrl(image.id),/^blob:/);
 await demoApi('/logout','POST');assert.equal(demoSession(),null);assert.equal(demoFileUrl(image.id),'#');
 startDemo();assert.equal((await demoApi('/workspace')).jobs.length,6);
});
