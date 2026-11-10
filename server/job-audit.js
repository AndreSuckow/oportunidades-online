export function resumeSent(job) { return job.resumeSent ?? Boolean(job.appliedAt || job.stage==='applied'); }
export function auditJob(data, previous, user, owner) {
 const now=new Date().toISOString(), actor={id:user.id,name:user.name,picture:user.picture||''};
 if(data.resumeSent===undefined)data.resumeSent=resumeSent(previous||data);
 if(data.stage==='applied' && previous?.stage!=='applied')data.resumeSent=true;
 if(!data.resumeSent){data.resumeSentBy='';data.appliedAt='';if(data.stage==='applied')data.stage='saved';}
 else {
  data.resumeSentBy ||= previous?.resumeSentBy || (user.id===owner?'owner':'contributor');
  data.appliedAt ||= new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  if(data.stage==='saved')data.stage='applied';
 }
 data.createdBy=previous?.createdBy || (previous?null:actor);
 data.updatedBy=actor;
 data.history=[...(previous?.history||[])];
 const event=note=>data.history.push({at:now,stage:data.stage,note,actor});
 if(!previous)event('Vaga adicionada');
 else if(data.stage!==previous.stage)event('Etapa atualizada');
 const changed= data.resumeSent!==resumeSent(previous||{}) || data.resumeSentBy!==(previous?.resumeSentBy||'') || data.appliedAt!==(previous?.appliedAt||'');
 data.submissionRecordedBy=previous?.submissionRecordedBy||null;
 if(changed){data.submissionRecordedBy=actor;event(data.resumeSent?`Currículo enviado pelo ${data.resumeSentBy==='owner'?'titular':'contribuinte'} · ${data.appliedAt}`:'Marcação de currículo enviado removida');}
}
