import { openDB } from './db.js';
import { createApp } from './app.js';
import express from 'express';
import { resolve } from 'node:path';
const production=process.argv.includes('--production')||process.env.NODE_ENV==='production';
const port=Number(process.env.PORT||3000);
const url=(process.env.APP_URL||`http://localhost:${port}`).replace(/\/$/,'');
if(production&&process.env.ALLOW_DEMO==='true')throw new Error('Desative ALLOW_DEMO antes de iniciar em produção.');
const config={production,url,demo:!production&&process.env.ALLOW_DEMO==='true',googleId:process.env.GOOGLE_CLIENT_ID,googleSecret:process.env.GOOGLE_CLIENT_SECRET,emailKey:process.env.RESEND_API_KEY,emailFrom:process.env.EMAIL_FROM,aiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4.1-mini'};
const db=openDB(process.env.DATABASE_PATH||'./data/opportunities.sqlite');
const app=createApp(db,config);
if(production){app.use(express.static(resolve('dist')));app.get('/{*path}',(_req,res)=>res.sendFile(resolve('dist/index.html')));}
else {const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
const server=app.listen(port,production?'0.0.0.0':'127.0.0.1',()=>console.log(`Oportunidades Online: ${url}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
