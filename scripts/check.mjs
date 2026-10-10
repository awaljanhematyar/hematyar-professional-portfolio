import {readFileSync,existsSync} from 'node:fs';
const paths=['src/main.jsx','src/App.jsx','src/pages/Portfolio.jsx','src/pages/Admin.jsx','src/lib/supabase.js','src/lib/api.js','supabase/migrations/20261009_initial.sql'];
for(const path of paths){if(!existsSync(path))throw new Error(`Missing file: ${path}`);const content=readFileSync(path,'utf8');if(content.length<10)throw new Error(`Empty file: ${path}`);console.log(`OK ${path}`);}
console.log('Scaffold content check complete. This is NOT a compilation or security test.');
