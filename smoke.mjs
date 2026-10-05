const store={};
const mk=()=>({innerHTML:'',textContent:'',hidden:false,style:{},dataset:{},value:'',disabled:false,
  classList:{add(){},remove(){},toggle(){},contains(){return false}},
  focus(){},remove(){},appendChild(){},insertAdjacentHTML(_,h){this.innerHTML=h+this.innerHTML},addEventListener(){},
  getContext(){return new Proxy({}, {get:()=>()=>{}})},getBoundingClientRect(){return{width:800,height:600,left:0,top:0}},
  querySelector(){return null},querySelectorAll(){return[]},closest(){return null},scrollIntoView(){},setAttribute(){},removeAttribute(){}});
const els={};
globalThis.window=globalThis;
globalThis.document={querySelector:s=>els[s]??=mk(),querySelectorAll:()=>[],addEventListener(){},getElementById:s=>els['#'+s]??=mk(),createElement:()=>mk(),body:mk(),documentElement:mk()};
globalThis.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v,removeItem:k=>delete store[k]};
globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
globalThis.scrollTo=()=>{};globalThis.scrollY=0;globalThis.innerWidth=1200;globalThis.innerHeight=800;
globalThis.matchMedia=()=>({matches:false,addEventListener(){}});
const g=await import('./src/game.js');
g.boot();
console.log('menu rendered:',(g.getView()?.html||'').length,'chars');
const {__t:t}=g;
t.A.start(); if(!t.getS()) t.A.start();
let S=t.getS();
console.log('phase after start:',S&&S.phase);
for(let i=0;i<6;i++){ while(t.getS().queue.length){t.getS().queue.shift()} t.A.week(); }
S=t.getS();
console.log('phase:',S.phase,'week:',S.camp&&S.camp.week,'campaign html:',(g.getView()?.html||'').length);

/* ---------- тесты новых механик ---------- */
const {EV}=t;
const fresh=()=>{ t.A.start(); if(!t.getS()) t.A.start(); const S=t.getS(); S.queue.length=0; S.camp.week=6; return S };
const okNum=(S)=>{ const p=S.c.player; if(!Number.isFinite(p.trust)||!Number.isFinite(p.rec)||!Number.isFinite(S.budget)) throw new Error('NaN в состоянии') };
let runs=0;
// 1) деньги: действие, повторная раздача слабее, скандал, все варианты ответа
{
  const S=fresh(); S.budget=5e6;
  const before=S.regions[6].effort.player; t.A.cash(6); const g1=S.regions[6].effort.player-before;
  const mid=S.regions[6].effort.player; t.A.cash(6); const g2=S.regions[6].effort.player-mid;
  console.log('деньги: первая раздача +'+g1.toFixed(2)+', повторная +'+g2.toFixed(2)+', heat='+S.camp.cash.heat.toFixed(1));
  if(!(g1>0&&g2<g1*1.01)) throw new Error('эффект гречки неверен');
  const rich=S.regions[4].effort.player; t.A.cash(4); console.log('столица (богатый регион): +'+(S.regions[4].effort.player-rich).toFixed(2));
}
for(const id of ['cashscandal','rivalcash','threat','attempt','rivalattempt','rumor']){
  for(let n=0;n<40;n++){
    const S=fresh(); S.budget=5e6; t.A.cash(n%9); t.A.cash((n+3)%9);
    S.camp.guard=n%3;
    const p= id==='rivalcash'?{c:'carter',r:2}: id==='rivalattempt'||id==='rumor'?{c:'carter'}:{};
    const d=EV[id].build(p); if(!d) throw new Error(id+': build вернул null');
    for(let k=0;k<d.choices.length;k++){
      const S2=fresh(); S2.budget=5e6; t.A.cash(n%9); S2.camp.guard=n%3;
      const d2=EV[id].build(p); const res=d2.choices[k].run(); runs++;
      if(res!=null&&typeof res!=='string') throw new Error(id+': run вернул не строку');
      okNum(S2);
    }
  }
}
console.log('все варианты ответов отработали без ошибок:',runs);
// 2) полная симуляция кампании: события сами появляются, выбираем случайные ответы
const seen={};
for(let game=0;game<60;game++){
  t.A.start(); if(!t.getS()) t.A.start(); let S=t.getS(); S.budget=3e6;
  for(let w=0;w<24&&S.phase==='campaign';w++){
    if(w%2===0) t.A.cash(ri(0,8));
    let guard=0;
    while(S.queue.length&&guard++<12){
      const q=S.queue.shift();
      if(q.id==='debate'||q.id==='eday_go'||q.id==='dropout') continue;
      const ev=EV[q.id]; const d=ev&&ev.build(q.p||{}); if(!d) continue;
      seen[q.id]=(seen[q.id]||0)+1;
      d.choices[Math.floor(Math.random()*d.choices.length)].run();
    }
    S.camp.left=Math.max(S.camp.left,30);
    t.nextWeek(); okNum(S);
    if(S.camp.apMax<3) throw new Error('apMax слишком мал');
  }
}
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
console.log('события за 60 симулированных кампаний:',JSON.stringify(Object.fromEntries(Object.entries(seen).filter(([k])=>/cash|threat|attempt|rumor/.test(k)))));
{
  const S=fresh(); const h=t.campaignHTML();
  console.log('кнопка раздачи денег в интерфейсе:', h.includes('data-a="cash"'), '| howto-текст про покушения:', String(t.A.howto).includes('Покушения'));
}

/* ---------- анимации/эффекты не ломают игру ---------- */
{
  const S=fresh(); S.budget=5e6;
  t.A.cash(3,{getBoundingClientRect:()=>({left:100,top:200,width:80,height:30})},null);
  for(const id of ['attempt','threat','cashscandal']){
    S.queue.length=0; S.queue.push({id,p:{}}); t.A.close&&t.A.close(); t.pump();
  }
  await new Promise(r=>setTimeout(r,150));
  console.log('эффекты и окна событий отработали без ошибок');
}

/* ---------- партия: дерево должностей, лояльность, подкуп ---------- */
{
  const P0=()=>t.getS().pty;
  const S=fresh(); S.budget=9e6;
  const html0=t.partyScreen?t.partyScreen():null;
  // назначить всех, кого можно, в порядке дерева
  const before=S.regions[0].effort.player;
  let n=0, lastLoy=-1;
  for(let round=0;round<4;round++){
    for(const id of t.PARTY_TREE.map(x=>x.id)){
      t.A.post(id); t.A.appoint(id+'|'+(n%3)); n++;
    }
  }
  const P=t.getS().pty;
  console.log('назначено должностей:',Object.keys(P.posts).length,'из',t.PARTY_TREE.length,'| лояльность',P.loy.toFixed(1));
  if(Object.keys(P.posts).length!==t.PARTY_TREE.length) throw new Error('дерево заполнилось не полностью');
  if(!(P.loy>35)) throw new Error('лояльность не выросла');
  // дерево закрывает вложенность: нельзя назначить главу отделения без секретаря
  const S2=fresh(); t.A.post('r_'+t.REG[0].id); t.A.appoint('r_'+t.REG[0].id+'|0');
  if(S2.pty&&S2.pty.posts['r_'+t.REG[0].id]) throw new Error('обход дерева');
  console.log('дерево: нельзя назначить подчинённого без начальника — OK');
  // экран партии
  const S3=fresh(); S3.tab='party'; const h=t.campaignHTML();
  if(!h.includes('ptree')||!h.includes('data-a="bribe"')) throw new Error('экран партии не отрисовался');
  console.log('экран «Партия и подкуп» отрисован, длина',h.length);
  // трата лояльности
  const S4=fresh(); S4.budget=9e6; S4.pty={loy:50,posts:{},cands:{}};
  const e0=S4.regions[S4.sel].effort.player; t.A.mobilize(); 
  console.log('мобилизация: поддержка +'+(S4.regions[S4.sel].effort.player-e0).toFixed(2)+', лояльность 50 ->',S4.pty.loy);
  S4.camp.cash={heat:30,n:2,caught:0,reg:{}}; t.A.shield(); console.log('щит: heat 30 ->',S4.camp.cash.heat.toFixed(1));
  // подкуп: все типы, все соперники, много раз
  let ok=0,fail=0;
  for(let i=0;i<300;i++){
    const S5=fresh(); S5.budget=9e6; S5.sel=i%9; S5.camp.ap=10;
    S5.pty={loy:60,posts:{sec:{name:'Тест Тестов',comp:70,amb:2,week:0}},cands:{}};
    const rivals=Object.keys(S5.c).filter(c=>c!=='player'&&!S5.c[c].out);
    const c=rivals[i%rivals.length], type=['coord','staff','official'][i%3];
    const d0=S5.c[c].dirt||0; t.A.bribe(c+'|'+type);
    if(type==='staff'&&(S5.c[c].dirt||0)>d0) ok++; 
    okNum(S5); if(!Number.isFinite(S5.camp.bribe.heat)) throw new Error('heat NaN');
  }
  console.log('300 попыток подкупа без ошибок; успешных «человек из штаба» (компромат):',ok);
  // события партии и подкупа: все варианты ответов
  let runs2=0;
  for(const id of ['bribecaught','betray','defect']){
    for(let n2=0;n2<30;n2++){
      const S6=fresh(); S6.budget=9e6; S6.sel=n2%9;
      S6.pty={loy:30+n2,posts:{sec:{name:'А Б',comp:70,amb:2,week:0},council:{name:'В Г',comp:60,amb:3,week:0}},cands:{}};
      const p= id==='betray'? {post:n2%2?'council':null} : id==='defect'? {c:'carter',i:n2%9} : {c:'carter',refused:n2%2};
      const d=EV[id].build(p); if(!d) continue;
      for(let k=0;k<d.choices.length;k++){
        const S7=fresh(); S7.budget=9e6; S7.pty={loy:30+n2,posts:{sec:{name:'А Б',comp:70,amb:2,week:0},council:{name:'В Г',comp:60,amb:3,week:0}},cands:{}};
        const d2=EV[id].build(p); const r=d2.choices[k].run(); runs2++;
        if(r!=null&&typeof r!=='string') throw new Error(id+' run не строка'); okNum(S7);
      }
    }
  }
  console.log('события партии/подкупа, все ответы отработали:',runs2);
}
// длинная симуляция с партией и подкупом
{
  const seen2={};
  for(let game=0;game<40;game++){
    t.A.start(); if(!t.getS()) t.A.start(); let S=t.getS(); S.budget=4e6;
    for(let w=0;w<24&&S.phase==='campaign';w++){
      if(w%3===0){ const free=t.PARTY_TREE.find(x=>!S.pty?.posts[x.id]&&(!x.parent||S.pty?.posts[x.parent])); if(free){t.A.post(free.id);t.A.appoint(free.id+'|'+(w%3))} }
      if(w%4===1) t.A.mobilize();
      if(w%3===2){ const rv=Object.keys(S.c).filter(c=>c!=='player'&&!S.c[c].out); if(rv.length) t.A.bribe(rv[w%rv.length]+'|'+['coord','staff','official'][w%3]) }
      if(w%2===0) t.A.cash(w%9);
      let guard=0;
      while(S.queue.length&&guard++<12){
        const q=S.queue.shift(); if(['debate','eday_go','dropout'].includes(q.id)) continue;
        const ev=EV[q.id]; const d=ev&&ev.build(q.p||{}); if(!d) continue;
        seen2[q.id]=(seen2[q.id]||0)+1; d.choices[Math.floor(Math.random()*d.choices.length)].run();
      }
      S.camp.left=Math.max(S.camp.left,30);
      t.nextWeek(); okNum(S);
    }
  }
  console.log('события за 40 кампаний с партией:',JSON.stringify(Object.fromEntries(Object.entries(seen2).filter(([k])=>/cash|bribe|betray|defect|threat|attempt/.test(k)))));
}
