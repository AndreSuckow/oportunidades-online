import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X, LoaderCircle, Upload } from 'lucide-react';
export function Avatar({name,picture,className=''}:{name:string;picture?:string|null;className?:string}) {
 const [failed,setFailed]=useState('');
 const initials=name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>Array.from(part)[0]).join('').toLocaleUpperCase('pt-BR')||'?';
 return <span className={`avatar ${className}`} aria-hidden="true">{picture&&failed!==picture?<img src={picture} alt="" width="36" height="36" referrerPolicy="no-referrer" onError={()=>setFailed(picture)}/>:initials}</span>;
}
export function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}) {
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const active=document.activeElement as HTMLElement;ref.current?.showModal();const old=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=old;active?.focus();};},[]);
 return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose();}}><header className="dialog-head"><h2 id="dialog-title">{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20}/></button></header>{children}</dialog>;
}
export function Field({label,children,wide=false}:{label:string;children:ReactNode;wide?:boolean}) {return <label className={`field ${wide?'wide':''}`}><span>{label}</span>{children}</label>;}
export function ErrorBox({message}:{message:string}) {return message?<p className="error-box" role="alert">{message}</p>:null;}
export function Busy(){return <LoaderCircle className="spin" size={18} aria-label="Carregando"/>;}
export function Empty({title,detail,children}:{title:string;detail:string;children?:ReactNode}){return <div className="empty"><div className="empty-symbol">↗</div><h3>{title}</h3><p>{detail}</p>{children}</div>;}
export async function readFile(file:File){if(file.size>5*1024*1024)throw Error('Envie um arquivo de até 5 MB.');return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=()=>reject(Error('Não foi possível ler o arquivo.'));reader.readAsDataURL(file);});}
export function UploadField({label,accept,onFile,busy}:{label:string;accept:string;onFile:(f:File)=>void;busy:boolean}){return <label className={`upload ${busy?'disabled':''}`}><Upload size={22}/><strong>{busy?'Enviando arquivo…':label}</strong><span>Até 5 MB · {accept.includes('pdf')?'PDF':'PNG, JPEG ou WebP'}</span><input type="file" accept={accept} disabled={busy} onChange={e=>{const file=e.target.files?.[0];if(file)onFile(file);e.target.value='';}}/></label>;}
