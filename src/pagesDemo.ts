import type {Job,Platform,Resume,User,Workspace} from './types';

// Static preview only. Never contacts an API or represents a real Google login.
const user:User={id:'pages-demo',name:'Pessoa de exemplo',email:'demo@example.invalid',demo:true,csrf:''};
let started=false;
let workspace:Workspace;
const files=new Map<string,{url:string}>();
export function startDemo(){
 for(const file of files.values())URL.revokeObjectURL(file.url);
 files.clear();
 const platforms:Platform[]=['LinkedIn','Gupy','Indeed','InfoJobs','Catho'].map((name,i)=>({id:'platform-'+i,version:1,name,url:['https://www.linkedin.com/jobs/','https://www.gupy.io/','https://br.indeed.com/','https://www.infojobs.com.br/','https://www.catho.com.br/'][i],registered:i<3,profileComplete:i===0,alertsEnabled:i===0,resumeId:'',notes:''}));
 const examples=[['Product Designer','Estúdio Aurora','saved',0,'Híbrido'],['Desenvolvedor Front-end','Horizonte Tech','saved',1,'Remoto'],['Analista de Marketing','Casa Verde','applied',0,'Remoto'],['UX/UI Designer','Nexo Digital','applied',2,'Híbrido'],['Desenvolvedor React','Ponto Digital','interview',0,'Remoto'],['Analista de Produto','Vértice','offer',1,'Remoto']] as const;
 const date=new Date().toISOString().slice(0,10);
 const jobs:Job[]=examples.map(([title,company,stage,p,mode],i)=>({id:'job-'+i,version:1,title,company,stage,platformId:platforms[p].id,mode,location:'São Paulo, SP',salary:'A combinar',contract:'',priority:stage==='interview'?'Alta':'Normal',url:'',description:'Vaga fictícia para explorar o Oportunidades Online. Não utilize dados pessoais nesta demonstração.',requirements:'',benefits:'',notes:'',contact:'',nextAction:stage==='interview'?'Preparar conversa com a equipe':'',deadline:'',appliedAt:stage==='saved'?'':date,resumeSent:stage!=='saved',resumeSentBy:stage==='saved'?'':'owner',followUp:stage==='interview'?date:'',resumeId:'',attachmentId:'',archived:false,createdBy:{id:user.id,name:user.name},createdAt:new Date().toISOString(),history:[{at:new Date().toISOString(),stage,note:'Exemplo da demonstração',actor:{id:user.id,name:user.name}}]}));
 workspace={owner:{id:user.id,name:user.name},role:'owner',readOnly:false,jobs,platforms,resumes:[]};started=true;
}
export function demoSession(){return started?{user,shared:[]}:null;}
export function demoFileUrl(id:string){return files.get(id)?.url||'#';}
export async function demoApi(path:string,method='GET',body?:any):Promise<any>{
 const url=new URL(path,'https://demo.invalid'),route=url.pathname;
 if(route==='/config')return {google:false,email:false,ai:false,demo:true};
 if(!started)throw Error('Abra a demonstração para continuar.');
 if(route==='/workspace')return structuredClone(workspace);
 if(route==='/logout'){started=false;for(const file of files.values())URL.revokeObjectURL(file.url);files.clear();return {ok:true};}
 if(route==='/invites'&&method==='GET')return [];
 if(route.startsWith('/invites')||route==='/import')throw Error('Este recurso exige o servidor e não está disponível no GitHub Pages.');
 if(route==='/files'&&method==='POST'){
  if(!['image/png','image/jpeg','image/webp','application/pdf'].includes(body?.mime))throw Error('Formato não suportado.');
  const bytes=Uint8Array.from(atob(body.base64),(c)=>c.charCodeAt(0));
  if(bytes.length>5*1024*1024)throw Error('Envie um arquivo de até 5 MB.');
  const id=crypto.randomUUID();files.set(id,{url:URL.createObjectURL(new Blob([bytes],{type:body.mime}))});return {id};
 }
 const match=route.match(/^\/records\/(jobs|platforms|resumes)(?:\/([^/]+))?$/);
 if(match&&['POST','PUT'].includes(method)){
  const kind=match[1] as 'jobs'|'platforms'|'resumes',rows=workspace[kind] as (Job|Platform|Resume)[],old=rows.find(r=>r.id===match[2]);
  if(method==='PUT'&&!old)throw Error('Registro não encontrado.');
  if(old&&old.version!==body.version)throw Error('Registro alterado. Atualize a página.');
  if(kind==='jobs'&&(!body.title?.trim()||!body.company?.trim()))throw Error('Preencha cargo e empresa.');
  if(kind!=='jobs'&&!body.name?.trim())throw Error('Informe um nome.');
  if(body.url&&!/^https?:\/\//i.test(body.url))throw Error('Use um link HTTP ou HTTPS.');
  const data={...body,id:old?.id||crypto.randomUUID(),version:(old?.version||0)+1};
  if(kind==='jobs'){
   const previous=old as Job|undefined,actor={id:user.id,name:user.name},now=new Date().toISOString();
   data.createdBy=previous?.createdBy||actor;data.history=[...(previous?.history||[])];
   if(data.stage==='applied'&&previous?.stage!=='applied')data.resumeSent=true;
   if(data.resumeSent){data.resumeSentBy||='owner';data.appliedAt||=now.slice(0,10);if(data.stage==='saved')data.stage='applied';}
   else {data.appliedAt='';data.resumeSentBy='';if(data.stage==='applied')data.stage='saved';}
   if(!previous||data.stage!==previous.stage)data.history.push({at:now,stage:data.stage,note:previous?'Etapa atualizada':'Vaga adicionada',actor});
   if(data.resumeSent!==previous?.resumeSent||data.resumeSentBy!==previous?.resumeSentBy){data.submissionRecordedBy=actor;data.history.push({at:now,stage:data.stage,note:data.resumeSent?'Currículo marcado como enviado':'Marcação de envio removida',actor});}
  }
  if(old)rows.splice(rows.indexOf(old),1,data);else rows.unshift(data);
  return structuredClone(data);
 }
 throw Error('Recurso não disponível nesta demonstração.');
}
