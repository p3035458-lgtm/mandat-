import './dom-stub.mjs';
const g=await import('../src/game.js'); const t=g.__t; g.boot();
function run(label,policy,N=40){
  let end=[],broke=0,minB=[],lowest=1e12;
  for(let n=0;n<N;n++){
    t.A.start(); if(!t.getS()) t.A.start(); const S=t.getS();
    policy.setup&&policy.setup(S);
    let b0=S.budget, minv=S.budget;
    for(let w=0;w<26&&S.phase==='campaign';w++){
      S.queue.length=0; S.camp.left=Math.max(S.camp.left,40);
      policy.week(S,w); minv=Math.min(minv,S.budget);
      t.nextWeek(); minv=Math.min(minv,S.budget);
    }
    end.push(S.budget); if(minv<0)broke++; lowest=Math.min(lowest,minv);
  }
  const avg=end.reduce((a,b)=>a+b,0)/N;
  console.log(`${label.padEnd(44)} старт ${(b0_()/1e6).toFixed(1)}M → в среднем ${(avg/1e6).toFixed(2)}M | уходили в минус: ${broke}/${N}`);
}
let b0v=0; const b0_=()=>b0v;
const hire=(S)=>{ b0v=S.budget; };
run('без найма и без действий',{setup:hire,week:()=>{}});
run('3 сотрудника, без фандрайзинга',{setup:(S)=>{ for(const id of S.staff.slice()) {}; t.A.hire&&['mgr_k','analyst','press'].forEach(id=>{try{t.A.hire(id)}catch(e){}}); b0v=S.budget; },week:()=>{}});
run('3 сотрудника + фандрайзинг 1×/нед',{setup:(S)=>{ ['mgr_k','analyst','press'].forEach(id=>{try{t.A.hire(id)}catch(e){}}); b0v=S.budget; },week:(S)=>{S.camp.ap=10;t.A.fund()}});
run('3 сотрудника + фандрайзинг 2×/нед',{setup:(S)=>{ ['mgr_k','analyst','press'].forEach(id=>{try{t.A.hire(id)}catch(e){}}); b0v=S.budget; },week:(S)=>{S.camp.ap=10;t.A.fund();t.A.fund()}});
run('штаб + 1 митинг в нед + деньги за голоса 1×/2 нед',{setup:(S)=>{ ['mgr_k','analyst','press'].forEach(id=>{try{t.A.hire(id)}catch(e){}}); b0v=S.budget; },week:(S,w)=>{S.camp.ap=10;t.A.fund();t.A.rally(4); if(w%2===0)t.A.cash(6)}});
const S=t.getS(); console.log('штат:',JSON.stringify(S.staff));
