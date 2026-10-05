import './test/dom-stub.mjs';
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
  console.log('кнопка раздачи денег в интерфейсе:', h.includes('data-a="cashAsk"'), '| howto-текст про покушения:', String(t.A.howto).includes('Покушения'));
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
  if(!h.includes('ptree')||!h.includes('data-a="bribeAsk"')) throw new Error('экран партии не отрисовался');
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

/* ---------- армия, генералы, переворот ---------- */
{
  const buyAll=(S,force=true)=>{ const AR=t.army(); for(const g of t.GENERALS){ const st=AR.gens[g.id]; st.bought=true; st.loy=force?85:60 } return AR };
  // 1) экран армии и покупка генерала (статистика успеха)
  let ok=0,tries=0;
  for(let i=0;i<200;i++){
    const S=fresh(); S.budget=9e6; S.camp.ap=10; t.A.genBribe('bulat'); tries++;
    if(t.army().gens.bulat.bought) ok++; okNum(S);
  }
  console.log(`подкуп Булата: успех ${ok}/${tries} (ожидалось ~39%)`);
  if(ok<40||ok>120) throw new Error('странная вероятность подкупа');
  { const S=fresh(); S.budget=9e6; S.tab='army'; const h=t.campaignHTML();
    if(!h.includes('data-a="genAsk"')||!h.includes('coupbox')) throw new Error('экран армии не отрисовался');
    console.log('экран «Армия и генералы» отрисован'); }
  // 2) условия и шансы
  { const S=fresh(); const AR=t.army(); if(t.coupReady()) throw new Error('переворот доступен без армии');
    buyAll(S,false); AR.gens.bulat.loy=40; if(t.coupReady()) throw new Error('переворот доступен без лояльного гарнизона');
    AR.gens.bulat.loy=70; if(!t.coupReady()) throw new Error('должен быть доступен');
    const p0=t.coupChance(); S.budget=9e6; S.camp.ap=10; for(const k of Object.keys(t.PREP)) t.A.coupPrep(k);
    const p1=t.coupChance(); console.log(`шансы переворота: без подготовки ${(p0*100).toFixed(0)}%, с подготовкой ${(p1*100).toFixed(0)}%, лояльность армии ${t.armyLoy().toFixed(0)}`);
    if(!(p1>p0)) throw new Error('подготовка не повышает шансы'); }
  // 3) победа и поражение, статистика исходов
  let win=0,fail=0;
  for(let i=0;i<300;i++){
    const S=fresh(); S.budget=9e6; buyAll(S,true); t.army().gens.bulat.loy=80;
    t.A.coupDo(); okNum(S);
    if(S.phase!=='coup') throw new Error('после операции не открылась концовка: '+S.phase);
    if(S.coup.res==='win') win++; else fail++;
    const h=t.coupHTML(); if(!h.includes(S.coup.res==='win'?'coupSpeech':'coupEnd')) throw new Error('экран концовки неверный');
  }
  console.log(`переворот при лояльности ~85: побед ${win}, провалов ${fail}`);
  if(win<150) throw new Error('при высокой лояльности слишком мало побед');
  // 4) полный путь: победа -> обращение -> правительство -> президентство -> кризисы
  for(let i=0;i<12;i++){
    const S=fresh(); S.budget=9e6; buyAll(S,true);
    let guard=0; do { S.phase='campaign'; S.army.gens.bulat.loy=90; t.A.coupDo(); } while(S.coup.res!=='win'&&guard++<30);
    t.A.coupSpeech(['temp','emerg','blame'][i%3]);
    if(S.phase!=='cabinet') throw new Error('после обращения нет формирования правительства');
    S.cabSel={}; t.POSTS.forEach(p=>S.cabSel[p.id]=0); t.A.cabDone();
    if(S.phase!=='presidency'||!S.pres) throw new Error('не началось президентство');
    if(!(S.pres.approval>=20&&S.pres.approval<=60)) throw new Error('странное стартовое одобрение '+S.pres.approval);
    for(const id of ['junta','countercoup']){
      const d=t.CR[id].build(); if(!d.choices.length) throw new Error(id);
      for(let k=0;k<d.choices.length;k++){
        const S2=t.getS(); const snap=JSON.stringify(S2); 
        const r=t.CR[id].build().choices[k].run(); if(r!=null&&typeof r!=='string') throw new Error(id+' не строка');
        if(S2.phase==='legacy'){ const hh=t.getS(); if(typeof t.A.coupEnd!=='function') throw 0; }
        Object.assign(S2,JSON.parse(snap)); // откат для следующего варианта
      }
    }
    // квартал с декрементом лояльности, свержение и экран итогов
    const before=t.armyLoy(); S.queue.length=0; t.A.endQ(); S.queue.length=0;
    if(i===0)console.log(`президентство после переворота: одобрение ${S.pres.approval.toFixed(0)}, капитал ${S.pres.capital}, лояльность армии ${before.toFixed(0)} -> ${t.armyLoy().toFixed(0)} после квартала`);
    S.phase='presidency'; for(let n=0;n<40&&S.phase==='presidency';n++){ S.army.gens.bulat.loy=5; t.CR.countercoup.build().choices[2].run(); }
    S.queue.length=0; const lh=t.legacyHTML?.(); 
  }
  // 5) свержение -> итоги карьеры с нужным названием
  { const S=fresh(); S.budget=9e6; buyAll(S,true); S.phase='campaign'; let g=0; do{S.phase='campaign';S.army.gens.bulat.loy=90;t.A.coupDo()}while(S.coup.res!=='win'&&g++<40);
    t.A.coupSpeech('temp'); S.cabSel={}; t.POSTS.forEach(p=>S.cabSel[p.id]=0); t.A.cabDone();
    for(let n=0;n<60&&S.flags.coup==='win';n++){ S.phase='presidency'; t.CR.countercoup.build().choices[2].run(); }
    t.A.coupEnd?.(); S.phase='legacy'; const h=t.__legacy?t.__legacy():null; console.log('флаг после свержения:',S.flags.coup,'| фаза:',S.phase); 
    if(S.flags.coup!=='fall') throw new Error('свержение не сработало'); }
  // 6) события армии: все ответы
  let runs3=0;
  for(const id of ['armyscandal','genshift','coupleak']){
    for(let n=0;n<30;n++){
      const S=fresh(); S.budget=9e6; buyAll(S,true); t.army().gens.volkov.loy=20; t.army().prep={comms:true};
      const p={id:t.GENERALS[n%6].id,refused:n%2};
      const d=t.EV[id].build(p); if(!d) continue;
      for(let k=0;k<d.choices.length;k++){
        const S2=fresh(); S2.budget=9e6; buyAll(S2,true); t.army().prep={comms:true};
        const r=t.EV[id].build(p).choices[k].run(); runs3++; if(r!=null&&typeof r!=='string') throw new Error(id+' не строка'); okNum(S2);
      }
    }
  }
  console.log('события армии, все ответы отработали:',runs3);
}

/* ---------- бюджет, «сколько платить», лобби, охрана ---------- */
{
  // 1) жёсткий бюджет
  const S=fresh(); S.budget=3.7e6; S.camp.sec=0;
  const w=t.weeklyBudget();
  for(const k of ['don','sal','overhead','sec','partyNet','net']) if(!Number.isFinite(w[k])) throw new Error('weeklyBudget.'+k);
  console.log(`бюджет недели: пожертвования ${(w.don/1e3).toFixed(0)}k, зарплаты ${(w.sal/1e3).toFixed(0)}k, штаб ${(w.overhead/1e3).toFixed(0)}k, итого ${(w.net/1e3).toFixed(0)}k`);
  // 26 недель без фандрайзинга: деньги тают, но игра не ломается
  for(let i=0;i<26&&t.getS().phase==='campaign';i++){ t.getS().queue.length=0; t.getS().camp.left=Math.max(t.getS().camp.left,40); t.nextWeek(); okNum(t.getS()); }
  console.log('после 26 недель без доходов бюджет:',(t.getS().budget/1e6).toFixed(2)+' млн');
  { const S2=fresh(); S2.budget=100; const b0=S2.budget; t.A.cash(1); if(S2.budget!==b0) throw new Error('потратили деньги, которых нет'); }
  // 2) размер суммы: скромно < стандартно < щедро
  const avg=(T)=>{let sum=0,n=300;for(let i=0;i<n;i++){const S3=fresh();S3.budget=9e6;S3.camp.ap=10;const r=S3.regions[6].effort.player;t.A.cash('6|'+T);sum+=S3.regions[6].effort.player-r}return sum/n};
  const e0=avg(0),e1=avg(1),e2=avg(2); console.log(`деньги за голоса, эффект: скромно ${e0.toFixed(2)}, стандартно ${e1.toFixed(2)}, щедро ${e2.toFixed(2)}`);
  if(!(e0<e1&&e1<e2)) throw new Error('эффект должен расти с суммой');
  { const S4=fresh(); S4.budget=9e6; t.A.cashAsk(3); t.A.genAsk('volkov'); t.A.bribeAsk('carter|coord'); }
  { const S5=fresh(); S5.budget=9e6; const b=S5.budget; t.A.cash('2|0'); const c0=b-S5.budget; const S6=fresh(); S6.budget=9e6; const b6=S6.budget; t.A.cash('2|2'); const c2=b6-S6.budget; console.log(`стоимость раздачи: скромно ${(c0/1e3)|0}k, щедро ${(c2/1e3)|0}k`); if(!(c0<c2)) throw new Error('цена не растёт'); }
  // шансы подкупа генерала растут со щедростью
  const rate=(T)=>{let ok=0,n=1500;for(let i=0;i<n;i++){const S7=fresh();S7.budget=9e6;S7.camp.ap=10;t.A.genBribe('yastreb|'+T);if(t.army().gens.yastreb.bought)ok++}return ok/n};
  const r0=rate(0),r1=rate(1),r2=rate(2); console.log(`подкуп Ястребова: скромно ${(r0*100).toFixed(0)}%, стандартно ${(r1*100).toFixed(0)}%, щедро ${(r2*100).toFixed(0)}%`);
  if(!(r0<r1&&r1<r2)) throw new Error('шанс подкупа должен расти с суммой');
  // 3) лобби: предложения, принять / торговаться / отказать
  { const S8=fresh(); S8.budget=9e6; const L=t.lobby(); let weeks=0; while(!L.offers.length&&weeks<80){ S8.camp.week=10+weeks; t.lobbyWeek(); S8.queue.length=0; weeks++; }
    if(!L.offers.length) throw new Error('предложения не появляются'); console.log('первое предложение лоббиста появилось через',weeks,'нед.');
    const b=S8.budget,side=L.side; t.A.lobbyYes(0); if(!(S8.budget>b)||!(L.owed.length===1)) throw new Error('сделка не прошла');
    console.log(`сделка принята: бюджет +${((S8.budget-b)/1e3)|0}k, позиция ${side.toFixed(0)} -> ${L.side.toFixed(0)}`);
    if(L.offers[0]){ t.A.lobbyHaggle(0); } if(L.offers[0]){ t.A.lobbyNo('0|pub'); } if(L.offers[0]){ t.A.lobbyNo('0|quiet'); }
    okNum(S8); }
  // 4) позиция «за народ» -> враги -> угроза -> предупреждение -> охрана
  { const S9=fresh(); S9.budget=9e6; S9.camp.ap=10; S9.camp.week=6; const L=t.lobby(); const T0=t.threat();
    t.A.antiOligarch(); S9.camp.antiAt=-9; S9.camp.ap=10; t.A.antiOligarch(); S9.camp.antiAt=-9; S9.camp.ap=10; t.A.antiOligarch();
    console.log(`позиция ${L.side.toFixed(0)} (народ), врагов ${L.foes.length}, угроза ${T0.toFixed(0)} -> ${t.threat().toFixed(0)}`);
    if(!(t.threat()>T0)) throw new Error('угроза не выросла');
    S9.queue.length=0; t.lobbyWeek(); if(!S9.queue.some(q=>q.id==='secwarn')) throw new Error('нет предупреждения об охране');
    const d=t.EV.secwarn.build(); for(let k=0;k<d.choices.length;k++){ const S10=fresh(); S10.budget=9e6; t.lobby().side=60; const r=t.EV.secwarn.build().choices[k].run(); if(typeof r!=='string') throw new Error('secwarn'); }
    // охрана действительно снижает шанс и тяжесть покушений
    const stat=(sec)=>{ let att=0,thw=0,N=4000; for(let i=0;i<N;i++){ const S11=fresh(); S11.budget=9e6; S11.camp.week=8; S11.camp.left=100; S11.camp.sec=sec; t.lobby().side=70; t.lobby().foes=['oil','bank']; S11.queue.length=0; S11.pending.length=0; t.attemptWeek&&t.attemptWeek(); if(S11.queue.some(q=>q.id==='threat'))att++; }
      let T=0,M=2000; for(let i=0;i<M;i++){ const S12=fresh(); S12.camp.sec=sec; S12.camp.left=100; const d2=t.EV.attempt.build(); if(/предотвращено/.test(d2.title))T++ } return [att/N,T/M] };
    const a0=stat(0),a3=stat(3); console.log(`охрана 0: угроз ${(a0[0]*100).toFixed(1)}%/нед, сорвано ${(a0[1]*100).toFixed(0)}% | охрана 3: угроз ${(a3[0]*100).toFixed(1)}%/нед, сорвано ${(a3[1]*100).toFixed(0)}%`);
    if(!(a3[0]<a0[0])||!(a3[1]>a0[1]+.3)) throw new Error('охрана не работает');
    // оформление охраны и ее стоимость в недельном бюджете
    const S13=fresh(); S13.budget=9e6; const b=S13.budget; if(!/приступила/.test(t.setSec(2))) throw new Error('setSec'); const w2=t.weeklyBudget();
    if(!(w2.sec>0)||!(S13.budget<b)) throw new Error('охрана не списала деньги'); console.log('охрана 2 уровня: оформление',((b-S13.budget)/1e3)|0,'k, содержание',(w2.sec/1e3)|0,'k/нед');
    const S14=fresh(); S14.budget=1e4; if(!/Не хватает/.test(t.setSec(3))) throw new Error('охрана без денег'); }
  // 5) все события лобби
  let runs4=0;
  for(const id of ['lobbyleak','foeattack']){ for(let n=0;n<30;n++){ const mk=()=>{const Sx=fresh();Sx.budget=n%3?9e6:1e5;const L=t.lobby();L.heat=10+n;L.side=(n*7%120)-60;L.owed=[{gid:'oil',pay:1.2e6,week:3}];L.foes=['bank'];return Sx};
      const S15=mk(); const d=t.EV[id].build({}); if(!d) throw new Error(id+' null'); for(let k=0;k<d.choices.length;k++){ const Sx=mk(); const r=t.EV[id].build({}).choices[k].run(); runs4++; if(r!=null&&typeof r!=='string') throw new Error(id+' не строка'); okNum(Sx);} } }
  console.log('события лобби, все ответы отработали:',runs4);
  // 6) долги лоббистам в президентстве
  { const S16=fresh(); S16.budget=9e6; t.lobby().owed=[{gid:'oil',pay:1.2e6,week:2},{gid:'union',pay:3e5,week:3}];
    t.army(); S16.pty=S16.pty||undefined; S16.last={year:2028,rival:'carter',reelect:false,ev:{player:300,carter:238},pv:{player:50,carter:45},turnout:60};
    S16.flags.startApproval=50;S16.flags.startCapital=50; S16.cabSel={}; t.POSTS.forEach(p=>S16.cabSel[p.id]=0); t.A.cabDone();
    for(let k=0;k<3;k++){ const snap=JSON.stringify(t.getS().lobby); const d=t.CR.lobbydebt.build(); const r=d.choices[k].run(); if(typeof r!=='string') throw new Error('lobbydebt'); t.getS().lobby=JSON.parse(snap); }
    console.log('долги лоббистам в президентстве: все варианты отработали'); }
}
