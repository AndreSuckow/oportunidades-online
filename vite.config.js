import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>({
 plugins: [react()],
 base: mode==='pages'?'/oportunidades-online/':'/',
 define: {'import.meta.env.VITE_PAGES_DEMO':JSON.stringify(mode==='pages')},
 build: {outDir:mode==='pages'?'dist-pages':'dist'}
}));
