import './dom-stub.mjs';
const g=await import('../src/game.js'); const t=g.__t; g.boot();
const N=4000; let ok=0, calc=0;
for(let i=0;i<N;i++){ t.A.start(); if(!t.getS()) t.A.start(); const S=t.getS(); S.budget=9e6; S.camp.ap=10; t.A.genBribe('bulat'); if(t.army().gens.bulat.bought) ok++; }
const b=t.GENERALS.find(x=>x.id==='bulat');
console.log('bulat success', (ok/N*100).toFixed(1)+'%', '| formula', (Math.max(.2,Math.min(.88,.2+.7*b.greed-.04*b.fame))*100).toFixed(1)+'%');
