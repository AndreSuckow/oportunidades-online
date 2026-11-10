import {useCallback,useEffect,useState} from 'react';
const views=['board','platforms','resumes','agenda','sharing'];
function read(){const p=new URLSearchParams(location.search);return {view:views.includes(p.get('view')||'')?p.get('view')!:'board',query:p.get('q')||'',platform:p.get('platform')||''};}
/** The application shell remains mounted; only the selected content changes. */
export function useNavigation(){
 const [route,setRoute]=useState(read);
 useEffect(()=>{const pop=()=>setRoute(read());window.addEventListener('popstate',pop);return()=>window.removeEventListener('popstate',pop);},[]);
 const update=useCallback((key:'view'|'query'|'platform',value:string)=>{
  if(key==='view'&&!views.includes(value))value='board';
  const next={...read(),[key]:value};
  const p=new URLSearchParams(location.search);
  for(const [key,value] of [['view',next.view==='board'?'':next.view],['q',next.query],['platform',next.platform]]){if(value)p.set(key,value);else p.delete(key);}
  const target=location.pathname+(p.size?'?'+p:'');
  if(target!==location.pathname+location.search){if(key==='view')history.pushState(null,'',target);else history.replaceState(null,'',target);}
  setRoute(next);
 },[]);
 return {view:route.view,query:route.query,platformFilter:route.platform,setView:useCallback((v:string)=>update('view',v),[update]),setQuery:useCallback((v:string)=>update('query',v),[update]),setPlatformFilter:useCallback((v:string)=>update('platform',v),[update])};
}
