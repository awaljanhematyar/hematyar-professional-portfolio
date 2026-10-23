import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { wordcraft, includeWordCraft, wordcraftFeatures, wordcraftChallenges } from './wordcraft.js';
test('appends WordCraft without mutating existing projects or their order',()=>{const p=[{slug:'existing'}];const r=includeWordCraft(p);assert.equal(r[0],p[0]);assert.equal(r[1],wordcraft);assert.equal(p.length,1);});
test('existing CMS WordCraft keeps ownership and is not duplicated',()=>{const p=[{...wordcraft,id:'cms',title:'CMS title'}];assert.equal(includeWordCraft(p),p);assert.equal(includeWordCraft(p)[0].title,'CMS title');});
test('handles missing data and retains a native JavaScript project stack',()=>{assert.deepEqual(includeWordCraft(null),[wordcraft]);assert.deepEqual(includeWordCraft(),[wordcraft]);assert.ok(wordcraft.technologies.includes('Vanilla JavaScript'));assert.ok(!wordcraft.technologies.includes('React'));});
test('uses the observed production and repository URLs',()=>{assert.equal(wordcraft.github_url,'https://github.com/awaljanhematyar/wordcraft');assert.equal(wordcraft.live_url,'https://wordcraft-mu-one.vercel.app/');});
test('case study includes real capture files and honest feature/limitation content',()=>{for(const n of ['desktop','mobile'])assert.ok(existsSync(`public/projects/wordcraft-${n}.jpg`));assert.equal(wordcraftFeatures.length,6);assert.equal(wordcraftChallenges.length,5);const jsx=readFileSync('src/components/WordCraftCaseStudy.jsx','utf8');assert.match(jsx,/not a paid client/);assert.match(jsx,/remain unverified/);assert.match(jsx,/258 automated tests/);});
