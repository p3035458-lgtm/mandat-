import { IMG, CHARS, CHAR_HQ } from './assets.js';
import { burst, floatText, flash, shake, anchor, eventFx } from './fx.js';
/* ================= utils ================= */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const gauss=()=>{let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)};
const f1=v=>(Math.round(v*10)/10).toFixed(1).replace('.',',');
const pct=v=>f1(v)+'%';
const num=v=>Math.round(v).toLocaleString('ru-RU');
const sgn=v=>(v>=0.05?'+':v<=-0.05?'−':'')+f1(Math.abs(v));
function money(v){const a=Math.abs(v),s=v<0?'−':'';if(a>=1e9)return s+'$'+f1(a/1e9)+' млрд';if(a>=1e6)return s+'$'+f1(a/1e6)+' млн';if(a>=1e3)return s+'$'+num(a/1e3)+' тыс.';return s+'$'+num(a)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MON=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const DAY=864e5;
function dstr(ms){const d=new Date(ms);return d.getUTCDate()+' '+MON[d.getUTCMonth()]+' '+d.getUTCFullYear()}
function plural(n,a,b,c){n=Math.abs(Math.round(n))%100;const n1=n%10;if(n>10&&n<20)return c;if(n1>1&&n1<5)return b;if(n1==1)return a;return c}
function arrow(d){return d>0.05?'<span class="up">↑'+f1(d)+'</span>':d<-0.05?'<span class="down">↓'+f1(-d)+'</span>':'<span class="flat">→0</span>'}
const surname=n=>{const p=String(n).trim().split(/\s+/);return p[p.length-1]||n};
const initials=n=>String(n).split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();

/* ================= issues & regions ================= */
const ISSUES={prices:'Цены',health:'Медицина',jobs:'Рабочие места',security:'Безопасность',ecology:'Экология',education:'Образование',corruption:'Коррупция'};
const ISS=Object.keys(ISSUES);
// map art is 433x250 units (cropped from the concept); hot = clickable outline, box = label box
const REG=[
 {id:'north',name:'Север',pop:4.6,ev:52,turn:64,undec:13,youth:.22,report:2,gdpc:11800,un:5.4,desc:'Промышленность и леса',box:[83,24,72,42],hot:[[40,30],[85,8],[140,10],[165,30],[155,70],[130,80],[80,70],[40,55]],
  sal:{prices:.22,health:.14,jobs:.24,security:.1,ecology:.08,education:.08,corruption:.14},lean:{player:26,carter:22,miller:13,wilson:9}},
 {id:'central',name:'Центральный',pop:5.2,ev:60,turn:68,undec:14,youth:.22,report:4,gdpc:12400,un:6.1,desc:'Главный колеблющийся регион',box:[192,24,74,42],hot:[[160,15],[200,5],[260,10],[285,30],[270,80],[230,85],[170,75],[160,40]],
  sal:{prices:.34,health:.25,jobs:.18,security:.08,ecology:.04,education:.05,corruption:.06},lean:{player:24,carter:27,miller:14,wilson:9}},
 {id:'east',name:'Восток',pop:4.8,ev:56,turn:60,undec:13,youth:.19,report:0,gdpc:10900,un:6.8,desc:'Граница, заводы, армия',box:[328,30,70,42],hot:[[275,30],[320,10],[400,15],[425,40],[410,80],[330,85],[270,75]],
  sal:{prices:.2,health:.14,jobs:.2,security:.24,ecology:.06,education:.06,corruption:.1},lean:{player:19,carter:32,miller:11,wilson:9}},
 {id:'west',name:'Запад',pop:4.7,ev:54,turn:66,undec:15,youth:.23,report:12,gdpc:11500,un:5.6,desc:'Туризм и малый бизнес',box:[40,76,76,42],hot:[[10,80],[35,55],[80,70],[130,85],[130,120],[100,130],[40,125],[10,110]],
  sal:{prices:.25,health:.18,jobs:.2,security:.12,ecology:.07,education:.08,corruption:.1},lean:{player:24,carter:23,miller:14,wilson:10}},
 {id:'capital',name:'Столица',pop:6.0,ev:70,turn:69,undec:12,youth:.3,report:3,gdpc:19800,un:4.2,desc:'Столица Арданы',box:[166,86,80,42],hot:[[135,85],[170,75],[270,80],[270,135],[220,140],[180,135],[135,125]],
  sal:{prices:.16,health:.14,jobs:.1,security:.1,ecology:.14,education:.16,corruption:.2},lean:{player:22,carter:24,miller:18,wilson:11}},
 {id:'tech',name:'Технологический',pop:4.1,ev:50,turn:67,undec:12,youth:.31,report:5,gdpc:17600,un:3.9,desc:'IT-парки и университеты',box:[284,95,90,42],hot:[[270,80],[330,85],[410,80],[395,140],[330,150],[275,140]],
  sal:{prices:.14,health:.08,jobs:.18,security:.06,ecology:.16,education:.22,corruption:.16},lean:{player:29,carter:17,miller:16,wilson:10}},
 {id:'rural',name:'Сельский',pop:3.8,ev:44,turn:58,undec:15,youth:.17,report:10,gdpc:8600,un:7.2,desc:'Фермы и малые города',box:[28,150,84,43],hot:[[10,125],[40,125],[100,130],[120,145],[115,200],[80,225],[30,200],[5,170]],
  sal:{prices:.3,health:.18,jobs:.22,security:.1,ecology:.08,education:.06,corruption:.06},lean:{player:21,carter:25,miller:11,wilson:11}},
 {id:'mountain',name:'Горный',pop:3.5,ev:42,turn:57,undec:15,youth:.18,report:9,gdpc:9100,un:7.6,desc:'Рудники и курорты',box:[138,160,72,43],hot:[[110,135],[180,135],[210,150],[210,200],[170,235],[130,230],[110,200]],
  sal:{prices:.2,health:.16,jobs:.22,security:.18,ecology:.12,education:.05,corruption:.07},lean:{player:17,carter:29,miller:12,wilson:11}},
 {id:'south',name:'Южный',pop:4.8,ev:56,turn:61,undec:14,youth:.2,report:7,gdpc:9800,un:6.9,desc:'Агрохолдинги и пенсионеры',box:[226,170,78,43],hot:[[205,145],[275,140],[330,150],[320,200],[280,245],[240,245],[180,230],[210,200]],
  sal:{prices:.28,health:.2,jobs:.22,security:.12,ecology:.04,education:.08,corruption:.06},lean:{player:16,carter:29,miller:11,wilson:10}},
 {id:'coast',name:'Прибрежный',pop:4.6,ev:54,turn:63,undec:14,youth:.25,report:6,gdpc:13900,un:5.8,desc:'Порты и верфи',box:[313,170,84,43],hot:[[300,140],[395,140],[420,175],[410,230],[360,240],[290,240],[320,200]],
  sal:{prices:.2,health:.14,jobs:.2,security:.1,ecology:.14,education:.06,corruption:.16},lean:{player:27,carter:20,miller:12,wilson:12}},
];
const REGI=id=>REG.findIndex(r=>r.id===id);
const COUNTRY='Ардания';

/* ================= candidates ================= */
const RIVALS={
 carter:{name:'Дэниел Картер',party:'Национальный союз',color:'#ff5a4e',trust:57,rec:88,power:2,deal:'police',
   issues:{prices:45,health:35,jobs:62,security:72,ecology:12,education:30,corruption:22},
   blurb:'Ветеран парламента. Ставка на порядок, армию и промышленность.'},
 miller:{name:'Ольга Миллер',party:'Зелёная платформа',color:'#2fbfa0',trust:63,rec:56,power:1,deal:'green',
   issues:{prices:30,health:52,jobs:26,security:15,ecology:88,education:62,corruption:40},
   blurb:'Экоактивистка и бывший мэр Озёрска. Сильна среди молодёжи.'},
 wilson:{name:'Марк Уилсон',party:'Партия свободы',color:'#a77bff',trust:49,rec:44,power:1,deal:'anticorr',
   issues:{prices:55,health:22,jobs:48,security:40,ecology:10,education:20,corruption:74},
   blurb:'Популист-антисистемщик. Обещает «вычистить элиты».'},
};
const BIOS=[
 {id:'biz',cha:62,comp:70,name:'Предприниматель',desc:'Построил логистическую компанию с нуля. Свои деньги и понятный язык экономики, но бизнес-прошлое проверят под лупой.',budget:6.2e6,trust:54,rec:52,issues:{jobs:40,prices:34},skeleton:.55,skel:'офшорная компания, через которую 8 лет назад прошли $12 млн'},
 {id:'gov',cha:58,comp:72,name:'Губернатор',desc:'Два срока руководил Озёрным регионом. Узнаваем и опытен, но отвечает за решения прошлых лет.',budget:4.7e6,trust:58,rec:61,issues:{health:30,education:32,jobs:26},skeleton:.4,bonus:{north:6},skel:'контракт на строительство моста, подписанный в бытность губернатором'},
 {id:'jour',cha:68,comp:60,name:'Журналист-расследователь',desc:'Разоблачил схему в министерстве транспорта. Высокое доверие, мало денег.',budget:3.6e6,trust:68,rec:50,issues:{corruption:50},skeleton:.2,skel:'источник в старом расследовании, который получал деньги'},
 {id:'mil',cha:55,comp:64,name:'Генерал в отставке',desc:'Командовал миротворческой миссией. Сильная тема безопасности, слабая экономическая повестка.',budget:4.4e6,trust:65,rec:48,issues:{security:52},skeleton:.3,skel:'закупка бронежилетов по завышенной цене в бытность командующим'},
 {id:'doc',cha:60,comp:70,name:'Главврач',desc:'Руководил крупнейшей больницей страны во время эпидемии. Люди доверяют, но знают мало.',budget:4.0e6,trust:70,rec:40,issues:{health:54,education:24},skeleton:.25,skel:'контракт больницы с фармкомпанией, где работала ваша сестра'},
];

/* ================= staff ================= */
const STAFF=[
 {id:'mgr_k',role:'Руководитель кампании',name:'Андрей Ковальчук',salary:42000,exp:5,perks:['+2 часа кандидата в неделю','Эффективность штаба +10%'],fx:{ap:2,eff:.1},risk:0,img:'th1',cat:'pt'},
 {id:'mgr_s',role:'Руководитель кампании',name:'Виктор Шульц',salary:26000,exp:3,perks:['+2 часа кандидата в неделю','Любит рискованные ходы'],fx:{ap:2},risk:3,img:'th4',cat:'pt'},
 {id:'analyst',role:'Аналитик',name:'Дмитрий Савчук',salary:22000,exp:4,perks:['Точность опросов +18%','Анализ регионов +12%'],fx:{poll:1},risk:0,img:'p_dmytro',cat:'an'},
 {id:'press',role:'Пресс-секретарь',name:'Елена Кравчук',salary:28000,exp:4,perks:['Уменьшает последствия скандалов +15%','Эффективность интервью +10%'],fx:{dmg:.4},risk:0,img:'p_olena',cat:'pr'},
 {id:'smm',role:'SMM-команда',name:'Студия «Пиксель», 6 человек',salary:25000,exp:3,perks:['Узнаваемость +0,5 в неделю','Охват в соцсетях +60%'],fx:{smm:1},risk:2,img:'th2',cat:'smm'},
 {id:'fund',role:'Фандрайзер',name:'Ричард Хейл',salary:30000,exp:5,perks:['Пожертвования +40%','Связи с крупными донорами'],fx:{fund:.4},risk:4,img:'th5',cat:'pt'},
 {id:'morgan',role:'Политтехнолог',name:'Алекс Морган',salary:35000,exp:5,perks:['Эффективность рекламы +12%','Негативная реклама +20%'],fx:{ad:.12,neg:.2},risk:5,img:'p_morgan',cat:'pt'},
 {id:'orlova',role:'Политтехнолог',name:'Олег Орлов',salary:24000,exp:3,perks:['Эффективность рекламы +8%'],fx:{ad:.08},risk:0,img:'th3',cat:'pt'},
 {id:'research',role:'Юрист-исследователь',name:'Марк Левин',salary:20000,exp:3,perks:['Открывает оппо-исследования соперников','Защита в судах'],fx:{oppo:1},risk:1,img:'th0',cat:'law'},
 {id:'field',role:'Полевая сеть',name:'Иван Петренко, 40 координаторов',salary:16000,exp:4,perks:['Волонтёрские выезды вдвое сильнее'],fx:{gotv:1},risk:0,img:'th_c',cat:'an'},
];
const STAFF_BY=Object.fromEntries(STAFF.map(s=>[s.id,s]));

/* ================= promises ================= */
const PROMISES=[
 {id:'infl3',iss:'prices',text:'Снизить инфляцию до 3%',type:'target',cost:0,costT:'без прямых затрат',term:'4 года',pop:2.2,str:14},
 {id:'tariffs',iss:'prices',text:'Заморозить тарифы на энергию',type:'law',law:'tariffs',cost:24,costT:'$6 млрд в год',term:'1 год',pop:3.0,str:16},
 {id:'nodebt',iss:'prices',text:'Не повышать государственный долг',type:'pledge',cost:0,costT:'ограничивает расходы',term:'4 года',pop:1.4,str:8},
 {id:'hosp20',iss:'health',text:'Построить 20 новых больниц',type:'project',proj:'hospitals',cost:2.4,costT:'$2,4 млрд',term:'4 года',pop:3.1,str:18},
 {id:'drugs',iss:'health',text:'Бесплатные лекарства для пенсионеров',type:'law',law:'drugs',cost:16,costT:'$4 млрд в год',term:'2 года',pop:2.8,str:15},
 {id:'jobs500',iss:'jobs',text:'Создать 500 000 рабочих мест',type:'target',cost:28,costT:'около $7 млрд в год',term:'4 года',pop:3.0,str:16},
 {id:'smallbiz',iss:'jobs',text:'Снизить налог для малого бизнеса',type:'law',law:'smallbiz',cost:12,costT:'−$3 млрд доходов в год',term:'1 год',pop:2.0,str:12},
 {id:'notax',iss:'jobs',text:'Не повышать налоги',type:'pledge',cost:0,costT:'ограничивает доходы',term:'4 года',pop:1.8,str:6},
 {id:'police',iss:'security',text:'Увеличить финансирование полиции на 30%',type:'law',law:'police',cost:12,costT:'$3 млрд в год',term:'2 года',pop:2.3,str:16},
 {id:'army',iss:'security',text:'Модернизировать армию',type:'law',law:'defense',cost:20,costT:'$5 млрд в год',term:'4 года',pop:1.9,str:14},
 {id:'green',iss:'ecology',text:'Принять закон о зелёной энергетике',type:'law',law:'green',cost:8,costT:'$8 млрд',term:'2 года',pop:2.1,str:18},
 {id:'coal',iss:'ecology',text:'Закрыть все угольные станции',type:'law',law:'coal',cost:5,costT:'$5 млрд',term:'4 года',pop:1.6,str:16},
 {id:'teachers',iss:'education',text:'Повысить зарплаты учителей на 25%',type:'law',law:'teachers',cost:20,costT:'$5 млрд в год',term:'2 года',pop:2.6,str:16},
 {id:'schools',iss:'education',text:'Построить 100 новых школ',type:'project',proj:'schools',cost:2.5,costT:'$2,5 млрд',term:'4 года',pop:2.2,str:14},
 {id:'anticorr',iss:'corruption',text:'Принять антикоррупционный закон',type:'law',law:'anticorr',cost:.2,costT:'$0,2 млрд',term:'1 год',pop:2.4,str:18},
 {id:'richtax',iss:'prices',text:'Повысить налоги для богатых',type:'law',law:'richtax',cost:0,costT:'+$11 млрд доходов в год',term:'1 год',pop:1.8,str:10},
 {id:'pension',iss:'health',text:'Индексировать пенсии выше инфляции',type:'law',law:'pension',cost:24,costT:'$6 млрд в год',term:'1 год',pop:2.6,str:12},
 {id:'transport',iss:'jobs',text:'Модернизировать транспорт',type:'project',proj:'roads',cost:2,costT:'$2 млрд',term:'4 года',pop:1.9,str:10},
 {id:'trade',iss:'jobs',text:'Подписать соглашение о свободной торговле',type:'law',law:'trade',cost:0,costT:'без прямых затрат',term:'2 года',pop:1.5,str:10},
 {id:'contracts',iss:'corruption',text:'Опубликовать все госконтракты',type:'decree',cost:.1,costT:'$0,1 млрд',term:'100 дней',pop:1.7,str:12},
];
const PROM_BY=Object.fromEntries(PROMISES.map(p=>[p.id,p]));

/* ================= laws ================= */
const LAWS=[
 {id:'taxcut',name:'Налоговая реформа',sub:'Налог на прибыль бизнеса: 20% → 17%',sup:{pres:.9,opp:.55,cen:.5},fx:{trend:.4,revenue:-8e9,approval:-.5},extra:['Поддержка бизнеса: +11','Поддержка левых избирателей: −7']},
 {id:'smallbiz',name:'Налоговые каникулы для малого бизнеса',sub:'Ставка для оборота до $2 млн: 15% → 10%',sup:{pres:.93,opp:.5,cen:.68},fx:{revenue:-3e9,unemp:-.3,trend:.15,approval:2}},
 {id:'tariffs',name:'Заморозка тарифов на энергию',sub:'Цены на свет и газ фиксируются на 2 года',sup:{pres:.92,opp:.35,cen:.55},fx:{infl:-.7,spending:6e9,approval:3}},
 {id:'drugs',name:'Бесплатные лекарства для пенсионеров',sub:'1 800 препаратов в бесплатном списке',sup:{pres:.93,opp:.3,cen:.6},fx:{spending:4e9,approval:2.5}},
 {id:'teachers',name:'Повышение зарплат учителей',sub:'Средняя ставка учителя: $2 400 → $3 000',sup:{pres:.92,opp:.3,cen:.62},fx:{spending:5e9,approval:2,trend:.1}},
 {id:'police',name:'Финансирование полиции +30%',sub:'Новые патрульные машины и 12 000 ставок',sup:{pres:.88,opp:.8,cen:.5},fx:{spending:3e9,approval:1.5}},
 {id:'defense',name:'Модернизация армии',sub:'Оборонный бюджет: 1,6% → 2,0% ВВП',sup:{pres:.88,opp:.82,cen:.4},fx:{spending:5e9,approval:1,trend:.05}},
 {id:'green',name:'Закон о зелёной энергетике',sub:'40% электроэнергии из ВИЭ к 2035 году',sup:{pres:.85,opp:.15,cen:.55},fx:{oneoff:8e9,trend:-.1,energy:5,approval:1.5}},
 {id:'coal',name:'Закрытие угольных станций',sub:'Все 11 станций выводятся до конца срока',sup:{pres:.8,opp:.08,cen:.38},fx:{oneoff:5e9,unemp:.3,approval:-1,energy:8}},
 {id:'anticorr',name:'Антикоррупционный закон',sub:'Независимое бюро и декларации для 40 000 чиновников',sup:{pres:.84,opp:.3,cen:.72},fx:{approval:3,capital:-8,trend:.1}},
 {id:'jobsprog',name:'Национальная программа занятости',sub:'Переобучение и общественные работы для 300 000 человек',sup:{pres:.92,opp:.25,cen:.6},fx:{spending:7e9,unemp:-.7,approval:2}},
 {id:'pension',name:'Индексация пенсий',sub:'Пенсии растут на инфляцию плюс 2%',sup:{pres:.92,opp:.45,cen:.55},fx:{spending:6e9,approval:3,infl:.1}},
 {id:'austerity',name:'Сокращение госрасходов',sub:'Бюджеты министерств: −8%',sup:{pres:.78,opp:.6,cen:.5},fx:{spending:-14e9,trend:-.2,approval:-3,unemp:.2}},
 {id:'richtax',name:'Налог на сверхдоходы',sub:'Ставка для доходов выше $500 тыс.: 35% → 42%',raisesTax:true,sup:{pres:.84,opp:.1,cen:.4},fx:{revenue:11e9,approval:1.5,trend:-.1}},
 {id:'trade',name:'Соглашение о свободной торговле',sub:'Отмена пошлин с тремя соседями',sup:{pres:.88,opp:.6,cen:.6},fx:{trend:.3,unemp:.1,approval:.5}},
 {id:'vat',name:'Повышение НДС',sub:'НДС: 18% → 20%',raisesTax:true,sup:{pres:.7,opp:.2,cen:.35},fx:{revenue:22e9,infl:.6,approval:-5}},
];
const LAW_BY=Object.fromEntries(LAWS.map(l=>[l.id,l]));
const PROJECTS={
 hospitals:{name:'Строительство больниц',unit:'больниц',target:20,cost:120e6,rate:[1,2],post:'health'},
 schools:{name:'Строительство школ',unit:'школ',target:100,cost:25e6,rate:[5,8],post:'edu'},
 roads:{name:'Модернизация транспорта',unit:'км дорог',target:500,cost:4e6,rate:[25,40],post:'eco'},
};

/* ================= cabinet ================= */
const POSTS=[
 {id:'eco',name:'Министр экономики',skill:'Экономика'},
 {id:'fin',name:'Министр финансов',skill:'Финансы'},
 {id:'def',name:'Министр обороны',skill:'Оборона'},
 {id:'health',name:'Министр здравоохранения',skill:'Медицина'},
 {id:'edu',name:'Министр образования',skill:'Образование'},
 {id:'energy',name:'Министр энергетики',skill:'Энергетика'},
 {id:'int',name:'Министр внутренних дел',skill:'Порядок'},
];
const MINISTERS={
 eco:[{name:'Анна Браун',comp:92,pop:61,loy:48,rep:87,note:'Великолепный экономист, но может конфликтовать с президентом.'},{name:'Игорь Мельник',comp:67,pop:55,loy:94,rep:70,note:'Соратник по кампании. Сделает всё, что скажете.'},{name:'Лора Чен',comp:80,pop:72,loy:70,rep:64,note:'Бывший банкир, любимица бизнеса.'}],
 fin:[{name:'Пётр Гаврилов',comp:88,pop:40,loy:60,rep:82,note:'Жёсткий сторонник экономии. Не даст раздуть дефицит.'},{name:'Марта Левицкая',comp:74,pop:63,loy:85,rep:75,note:'Надёжный бюджетник без сюрпризов.'},{name:'Остап Ярош',comp:61,pop:70,loy:90,rep:58,note:'Популярен на телевидении, слаб в цифрах.',risk:1}],
 def:[{name:'Генерал Роман Сокол',comp:85,pop:68,loy:58,rep:80,note:'Уважаем в армии, имеет собственные амбиции.'},{name:'Андрей Белый',comp:70,pop:52,loy:92,rep:66,note:'Лоялен, но генералы его не любят.'},{name:'Дана Ирвин',comp:78,pop:60,loy:74,rep:71,note:'Реформатор оборонных закупок.'}],
 health:[{name:'Софья Рейн',comp:90,pop:74,loy:62,rep:88,note:'Лучший эпидемиолог страны.'},{name:'Борис Кравец',comp:64,pop:58,loy:95,rep:60,note:'Ваш старый друг, хозяйственник.'},{name:'Лиана Мур',comp:76,pop:80,loy:70,rep:72,note:'Звезда медицинских ток-шоу.'}],
 edu:[{name:'Вера Ткач',comp:82,pop:66,loy:72,rep:79,note:'Директор лучшего лицея страны.'},{name:'Глеб Носов',comp:60,pop:71,loy:93,rep:62,note:'Бывший депутат вашей партии.'},{name:'Ирина Холл',comp:88,pop:55,loy:57,rep:84,note:'Ректор, принципиальный критик реформ.'}],
 energy:[{name:'Тимофей Грин',comp:86,pop:50,loy:60,rep:77,note:'Сильный менеджер. Связан с газовыми компаниями.',risk:1},{name:'Катерина Олейник',comp:72,pop:62,loy:88,rep:70,note:'Инженер, спокойная и аккуратная.'},{name:'Нил Брэдли',comp:79,pop:59,loy:71,rep:74,note:'Сторонник атомной энергетики.'}],
 int:[{name:'Сергей Волков',comp:83,pop:57,loy:61,rep:76,note:'Жёсткий профессионал из полиции.'},{name:'Алина Шевчук',comp:69,pop:73,loy:90,rep:68,note:'Мягкий стиль, популярна у горожан.'},{name:'Дэвид Росс',comp:77,pop:62,loy:73,rep:70,note:'Специалист по кибербезопасности.'}],
};

/* ================= debate content ================= */
const QUESTIONS={
 prices:'Цены растут быстрее зарплат. Что конкретно вы сделаете в первый год?',
 health:'В регионах закрываются больницы. Как вы это остановите?',
 jobs:'Заводы сокращают персонал. Где люди найдут работу?',
 security:'Уличная преступность выросла на 9%. Ваш ответ?',
 ecology:'Как совместить защиту природы и рабочие места в шахтёрских городах?',
 education:'Учителя уходят из профессии. Что вы предложите?',
 corruption:'Как вы будете бороться с коррупцией в собственном окружении?',
};
const RIVAL_LINES={
 prices:'Мой оппонент обещает дешёвую жизнь, не объясняя, кто за неё заплатит.',
 health:'Больницы закрывались при всех правительствах. Нужны не обещания, а управленцы.',
 jobs:'Я двадцать лет защищаю промышленность. Мой оппонент видел завод только на фото.',
 security:'Порядок — это не лозунг. Это полиция на улицах, а не речи на митингах.',
 ecology:'Экология — роскошь, когда людям нечем платить за отопление.',
 education:'Деньги в образование уходят в отчёты, а не в классы.',
 corruption:'Кандидат, финансируемый крупными донорами, не может бороться с коррупцией.',
};

const STAFF_ORDER=['morgan','press','analyst','mgr_k','smm','fund','orlova','mgr_s','research','field'];STAFF.sort((a,b)=>STAFF_ORDER.indexOf(a.id)-STAFF_ORDER.indexOf(b.id));

/* ================= state ================= */
let S=null, CUR=null;
const KEY='mandat-save-v1';
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function loadSave(){try{const t=localStorage.getItem(KEY);return t?JSON.parse(t):null}catch(e){return null}}
function wipeSave(){try{localStorage.removeItem(KEY)}catch(e){}}

const has=id=>S.staff.includes(id);
function fx(k){let v=0;for(const id of S.staff){const s=STAFF_BY[id];if(s&&s.fx[k])v+=s.fx[k]}return v+partyFx(k)}
const PL=()=>S.c.player;
function hurt(v,mit=1){const d=v*(1-fx('dmg')*mit);PL().trust=clamp(PL().trust-d,5,95);return d}
function gain(v){PL().trust=clamp(PL().trust+v,5,95);return v}
function recUp(v){PL().rec=clamp(PL().rec+v,5,99)}
function news(t,tag){S.news.unshift({t,tag:tag||'',d:nowLabel()});if(S.news.length>90)S.news.length=90}
function nowLabel(){if(S.pres&&(S.phase==='presidency'||S.phase==='cabinet'))return qLabel(S.pres.q);if(S.camp)return dstr(curDate());return ''}
function curDate(){return S.camp.date-S.camp.left*DAY}
function later(days,id,p){S.pending.push({left:S.camp.left-days,id,p:p||{}})}
function active(){return S.order.filter(c=>!S.c[c].out)}
function rivalsActive(){return active().filter(c=>c!=='player')}

function newGame(o){
  const bio=BIOS.find(b=>b.id===o.bio);
  S={ver:1,phase:'campaign',cycle:1,name:o.name,party:o.party,bio:o.bio,budget:bio.budget,
    staff:[],promises:[],news:[],queue:[],pending:[],used:{},flags:{},tab:'actions',sel:2,
    econ:{gdp:1.2e12,growth:1.8,trend:2.0,infl:4.2,unemp:5.1,wage:3200,debt:744e9,revenue:310e9,spending:340e9,energy:100,rate:4.5,recession:false},
    career:{elections:[],terms:[],laws:[],crises:[]}};
  S.econ0=Object.assign({},S.econ);
  S.flags.recWeek=Math.random()<.65?ri(5,13):-1;
  const issues={};ISS.forEach(i=>issues[i]=18);Object.assign(issues,bio.issues);
  S.look=o.look||0;S.age=o.age||48;
  const ag=S.age;
  S.c={player:{id:'player',cha:clamp(bio.cha+(ag<45?5:ag>60?-5:0),20,95),comp:clamp(bio.comp+(ag>50?5:ag<36?-6:0),20,95),name:o.name,short:surname(o.name),party:o.party,color:'#4a90ff',trust:bio.trust,trust0:bio.trust,rec:bio.rec,issues,bonus:bio.bonus||{},out:false}};
  for(const k in RIVALS){const r=RIVALS[k];S.c[k]={id:k,name:r.name,short:surname(r.name),party:r.party,color:r.color,trust:r.trust,trust0:r.trust,rec:r.rec,issues:{...r.issues},power:r.power,deal:r.deal,blurb:r.blurb,out:false,dirt:0,fem:k==='miller',lean0:0}}
  if(o.stats){const P=S.c.player,t=o.stats;P.trust=P.trust0=t.trust;P.rec=t.pop;P.cha=t.cha;P.comp=t.comp;S.scan=t.scan/100}
  S.order=['player','carter','miller','wilson'];
  initCampaign(o.days,false);
  news(`${o.name} объявил о выдвижении в президенты Арданы`,'camp');
  news('Безработица в Ардании: 5,1%. Инфляция: 4,2%','econ');
}

function initCampaign(days,reelect){
  const elDate=S.cycle===1?Date.UTC(2028,10,7):Date.UTC(2032,10,2);
  S.regions=REG.map(R=>({id:R.id,effort:{player:0,carter:0,miller:0,wilson:0},und:0,gotv:0,flood:false}));
  S.sel=REGI('central');
  const deb=days>200?[150,80,21]:[80,21];
  S.camp={total:days,left:days,week:0,ap:10+fx('ap'),apMax:10+fx('ap'),date:elDate,reelect,precise:false,noise:[],natNoise:{},
    debates:deb.map((at,n)=>({at,n:n+1,done:false})),hist:[],lastIncome:0,lastSalary:0,costWarned:false};
  S.phase='campaign';S.tab='actions';
  regenNoise();recordHist();
}

/* ================= voter model ================= */
function econBoost(){const e=S.econ;return{jobs:Math.max(0,(e.unemp-5)*.35),prices:Math.max(0,(e.infl-3)*.18)+Math.max(0,(e.energy-110)/100),security:S.flags.secBoost||0,health:S.flags.healthBoost||0}}
function salMap(R){const b=econBoost();let t=0;const m={};for(const i of ISS){m[i]=R.sal[i]*(1+(b[i]||0));t+=m[i]}for(const i of ISS)m[i]/=t;return m}
function factor(k){return (.7+k.trust/100*.6)*(.55+k.rec/100*.5)}
function appeal(i,c){
  const R=REG[i],st=S.regions[i],k=S.c[c];if(k.out)return 0;
  const sm=salMap(R);let fit=0;for(const x of ISS)fit+=sm[x]*k.issues[x];
  let a=R.lean[c]+(k.leanMod||0)+((k.bonus&&k.bonus[R.id])||0)+st.effort[c]+fit*.14;
  return Math.max(1,a*factor(k));
}
function shares(i){
  const st=S.regions[i],R=REG[i],cp=S.camp;
  const u=Math.max(1,(R.undec+st.und)*(.4+.6*Math.max(0,cp.left)/cp.total));
  const o={};let t=u;for(const c of S.order){o[c]=appeal(i,c);t+=o[c]}
  for(const c of S.order)o[c]=o[c]/t*100;o.und=u/t*100;return o;
}
function pollErr(){return S.camp.precise?.6:has('analyst')?1.5:3.5}
function regenNoise(){const e=pollErr();S.camp.noise=REG.map(()=>{const n={};S.order.forEach(c=>n[c]=gauss()*e/2);return n});S.camp.natNoise={};S.order.forEach(c=>S.camp.natNoise[c]=gauss()*e/4)}
function polled(i){const s=shares(i),n=S.camp.noise[i];const o={};let t=0;for(const c of S.order){o[c]=S.c[c].out?0:Math.max(.3,s[c]+n[c]);t+=o[c]}o.und=s.und;t+=o.und;for(const k in o)o[k]=o[k]/t*100;return o}
function national(poll){let P=0;const o={und:0};S.order.forEach(c=>o[c]=0);
  REG.forEach((R,i)=>{const s=poll?polled(i):shares(i);P+=R.pop;for(const k in o)o[k]+=s[k]*R.pop});
  for(const k in o)o[k]/=P;
  if(poll)S.order.forEach(c=>{if(!S.c[c].out)o[c]=Math.max(.3,o[c]+S.camp.natNoise[c])});
  return o}
function mainRival(){const n=national();return rivalsActive().sort((a,b)=>n[b]-n[a])[0]}
function evProjection(poll){const o={};S.order.forEach(c=>o[c]=0);
  REG.forEach((R,i)=>{const s=poll?polled(i):shares(i);let best=null;for(const c of active())if(!best||s[c]>s[best])best=c;o[best]+=R.ev});return o}
function topIssues(n){const tot={};ISS.forEach(i=>tot[i]=0);REG.forEach(R=>{const m=salMap(R);ISS.forEach(i=>tot[i]+=m[i]*R.pop)});return ISS.slice().sort((a,b)=>tot[b]-tot[a]).slice(0,n)}
function recordHist(){const n=national(true);const h={w:S.camp.week};S.order.forEach(c=>h[c]=S.c[c].out?null:n[c]);h.und=n.und;S.camp.hist.push(h)}
function addEffortAll(c,v,iss){REG.forEach((R,i)=>{const w=iss?(.5+3*salMap(R)[iss]):1;S.regions[i].effort[c]+=v*w})}

/* ================= campaign actions ================= */
const COST={rally:120e3,ad:450e3,neg:400e3,natad:1.6e6,poll:80e3,gotv:300e3,oppo:150e3,fund:0,interview:0,speech:60e3};
function spend(ap,cost){
  if(S.camp.ap<ap){toast(`Не хватает времени кандидата: нужно ${ap} ч, осталось ${S.camp.ap} ч. Подтвердите план недели.`);return false}
  if(S.budget<cost){toast('Не хватает денег. Проведите фандрайзинг.');return false}
  S.camp.ap-=ap;S.budget-=cost;return true}
const A={};
A.rally=v=>{const i=+v,R=REG[i];if(!spend(3,COST.rally))return;
  let g=rnd(2.8,3.8)*(1+fx('eff'))*(.8+(PL().cha||60)/250);const st=S.regions[i];if(st.flood){g+=2.5;gain(1)}
  st.effort.player+=g;recUp(.6);let msg=`Митинг в регионе ${R.name}: +${f1(g)} к поддержке.`;
  if(Math.random()<(has('mgr_s')?.14:.1)){const d=hurt(2.5);msg+=` Неудачная фраза со сцены разошлась по соцсетям: доверие −${f1(d)}.`;news(`${PL().short} допустил оговорку на митинге в регионе ${R.name}`,'gaffe')}
  else news(`${PL().short} провёл митинг в регионе ${R.name}. Собралось ${num(ri(4,26)*1000)} человек`,'camp');
  toast(msg);after()};
A.ad=v=>{const i=+v,R=REG[i];if(!spend(0,COST.ad))return;const g=rnd(3.6,4.6)*(1+fx('ad'))*(1+fx('eff')/2);S.regions[i].effort.player+=g;recUp(.3);
  news(`Штаб ${PL().short} запустил рекламную кампанию в регионе ${R.name}`,'camp');toast(`Реклама в регионе ${R.name}: +${f1(g)} к поддержке.`);after()};
A.neg=v=>{const i=+v,R=REG[i];const s=shares(i);const tg=rivalsActive().sort((a,b)=>s[b]-s[a])[0];if(!tg)return;if(!spend(0,COST.neg))return;
  const g=rnd(2.6,3.6)*(1+fx('neg'));S.regions[i].effort[tg]-=g;S.c[tg].trust=clamp(S.c[tg].trust-.8,10,90);const d=hurt(1,.5);
  news(`В регионе ${R.name} вышли жёсткие ролики против ${S.c[tg].short}`,'camp');toast(`Негативная реклама против ${S.c[tg].short}: −${f1(g)} ему в регионе ${R.name}. Ваше доверие −${f1(d)}.`);after()};
A.gotv=v=>{const i=+v,R=REG[i];const st=S.regions[i];if(st.gotv>=3){toast('Мобилизация в этом регионе уже на максимуме.');return}if(!spend(2,COST.gotv))return;
  st.gotv+=1*(1+fx('gotv'));st.gotv=Math.min(st.gotv,4);toast(`Волонтёры обходят квартиры в регионе ${R.name}. Мобилизация: ${f1(st.gotv)}.`);after()};
A.natad=()=>{if(!spend(0,COST.natad))return;const g=1.3*(1+fx('ad'));addEffortAll('player',g);recUp(1.5);news(`Национальный ролик ${PL().short} показали на всех каналах`,'camp');toast(`Национальная реклама: +${f1(g)} во всех регионах.`);after()};
A.fund=()=>{if(!spend(1,0))return;const g=rnd(.55,.95)*1e6*(1+fx('fund'))*(.6+PL().rec/150);S.budget+=g;
  if(has('fund'))S.flags.donorRisk=(S.flags.donorRisk||0)+1;
  news(`Ужин сторонников ${PL().short} собрал ${money(g)}`,'money');toast(`Фандрайзинг: +${money(g)}.`);after()};
A.poll=()=>{if(S.camp.precise){toast('Свежий опрос уже заказан на этой неделе.');return}if(!spend(0,COST.poll))return;S.camp.precise=true;regenNoise();toast('Опрос на 12 000 респондентов готов: погрешность ±0,6%.');after()};
A.oppo=()=>{if(!has('research')){toast('Нужна исследовательская команда. Наймите её в штабе.');return}openOppo()};
A.leak=v=>{const c=v,k=S.c[c];if(!k.dirt){return}if(!spend(1,100e3))return;k.dirt--;const d=rnd(5,9);k.trust=clamp(k.trust-d,10,90);addEffortAll(c,-1.5);const h=hurt(1,.5);
  news(`СМИ опубликовали компромат на ${k.short}`,'scandal');toast(`Компромат опубликован: доверие к ${k.short} −${f1(d)}. Ваше доверие −${f1(h)}.`);after()};
A.interview=()=>{if(S.camp.ap<2){toast('Не хватает времени кандидата на этой неделе.');return}openInterview()};
A.speech=()=>{if(S.camp.ap<2){toast('Не хватает времени кандидата на этой неделе.');return}openSpeech()};
A.hire=v=>{const s=STAFF_BY[v];const same=S.staff.find(id=>STAFF_BY[id].role===s.role);if(same){toast(`Позиция «${s.role}» занята. Сначала уволите ${STAFF_BY[same].name}.`);return}
  if(S.budget<s.salary){toast('Не хватает денег даже на первую зарплату.');return}
  S.staff.push(v);S.budget-=s.salary/4.33;if(s.fx.ap&&S.phase==='campaign'){S.camp.apMax=10+fx('ap');S.camp.ap+=s.fx.ap}
  news(`${s.name} присоединяется к штабу ${PL().short}`,'camp');toast(`${s.name} в команде. ${s.perks[0]}.`);after()};
A.fireStaff=v=>{fire(v);toast(`${STAFF_BY[v].name} покидает штаб.`);after()};
function fire(v){const s=STAFF_BY[v];S.staff=S.staff.filter(x=>x!==v);if(s.fx.ap&&S.camp){S.camp.apMax=10+fx('ap');S.camp.ap=Math.min(S.camp.ap,S.camp.apMax)}}
A.sel=v=>{S.sel=+v;render()};
A.tab=v=>{S.tab=v;render()};
A.week=()=>nextWeek();

/* ---- interview ---- */
function openInterview(){
  const iss=pick(topIssues(4));const st=PL().issues[iss];
  const outlets=['«Вечер с Марком Стоуном»','«Ардания-24»','подкаст «Без цензуры»','«Утро Арданы»','газета «Курьер»'];
  const o=pick(outlets);
  CUR={kicker:'Интервью',kc:'blue',title:`${o}: вопрос про «${ISSUES[iss].toLowerCase()}»`,text:`Ведущий: «${QUESTIONS[iss]}»<br><span class="muted">Ваша сила в теме: ${Math.round(st)}/100</span>`,choices:[
    {label:'Детальный план с цифрами',hint:'Сильный эффект, если тема ваша. Иначе — разбор ошибок экспертами',run(){S.camp.ap-=2;const p=.3+st/140+((PL().comp||60)-60)/200;if(Math.random()<p){gain(2);PL().issues[iss]=Math.min(100,st+4);addEffortAll('player',.8,iss);news(`Эксперты высоко оценили план ${PL().short} по теме «${ISSUES[iss]}»`,'camp');return `Убедительно. Доверие +2, позиция в теме «${ISSUES[iss]}» укрепилась.`}const d=hurt(2.5);news(`Экономисты нашли ошибки в цифрах ${PL().short}`,'gaffe');return `Эксперты разобрали ваши цифры и нашли ошибки. Доверие −${f1(d)}.`}},
    {label:'Эмоциональный ответ, личная история',hint:'Надёжно поднимает узнаваемость',run(){S.camp.ap-=2;recUp(2.5);gain(.5);return 'Отрывок интервью набрал 2 млн просмотров. Узнаваемость +2,5.'}},
    {label:'Обвинить действующее правительство',hint:'Работает, когда экономика плохая',run(){S.camp.ap-=2;const bad=S.econ.unemp>5.6||S.econ.infl>4.5;if(bad){addEffortAll('player',1.2);recUp(1);return 'Вы попали в настроение: людям надоело. +1,2 к поддержке во всех регионах.'}const d=hurt(1.5);return `Ведущий напомнил, что экономика растёт. Выглядело как перекладывание вины. Доверие −${f1(d)}.`}},
    {label:'Уйти от ответа',hint:'Безопасно, но скучно',run(){S.camp.ap-=2;recUp(.6);const d=hurt(.8);return `Интервью прошло без скандала и без пользы. Доверие −${f1(d)}.`}},
  ]};
  if(Math.random()<.12&&!has('press'))CUR.choices.forEach(c=>{const r=c.run;c.run=()=>{const t=r();const d=hurt(2);news(`Оговорка ${PL().short} в эфире стала мемом`,'gaffe');return t+` В конце эфира вы оговорились — фраза стала мемом. Доверие −${f1(d)}.`}});
  showChoice();
}

/* ---- speech / promises ---- */
function cyclePromises(cy){return S.promises.filter(p=>p.cycle===(cy||S.cycle))}
function promisedCost(){return cyclePromises().reduce((a,p)=>a+PROM_BY[p.id].cost,0)}
function openSpeech(){
  const made=new Set(cyclePromises().map(p=>p.id));
  const iss=topIssues(7);
  let html=`<p>Выберите обещание для программной речи. Оно сразу добавит голоса, но после победы его придётся выполнять. Уже обещано на <b>$${f1(promisedCost())} млрд</b>.</p><div class="list">`;
  for(const i of iss){const ps=PROMISES.filter(p=>p.iss===i&&!made.has(p.id));if(!ps.length)continue;
    html+=`<div class="eyebrow" style="margin-top:6px">${ISSUES[i]}</div>`;
    for(const p of ps)html+=`<button class="btn act" data-a="promise" data-v="${p.id}"><b>«${esc(p.text)}»</b><span class="c">+${f1(p.pop*promiseMult())}%</span><span class="d">Стоимость: ${p.costT} · Срок: ${p.term}</span></button>`}
  html+='</div>';
  modal(`<div class="mhead"><span class="kicker amber">Программная речь</span><h2>Что вы пообещаете стране?</h2></div><div class="mbody">${html}<button class="btn ghost" data-a="close">Отмена</button></div>`);
}
function promiseMult(){const n=cyclePromises().length;return Math.max(.35,1-.08*n)}
A.promise=v=>{if(!spend(2,COST.speech))return;makePromise(v,false);closeModal()};
function makePromise(id,deal){
  const p=PROM_BY[id];const m=deal?.6:promiseMult();
  S.promises.push({id,cycle:S.cycle,deal:!!deal,day:S.camp?S.camp.left:0,n:cyclePromises().length+1});
  PL().issues[p.iss]=Math.min(100,PL().issues[p.iss]+p.str);
  addEffortAll('player',p.pop*m*.9,p.iss);
  const n=cyclePromises().length;
  news(`${PL().short}: «${p.text}»`,'promise');
  const tc=promisedCost();
  let warn='';
  if(tc>40&&!deal){const d=hurt(1.5,0);warn=`<p class="down">Экономисты: обещания ${PL().short} уже стоят $${f1(tc)} млрд. Доверие −${f1(d)}.</p>`;news(`Эксперты: программа ${PL().short} стоит $${f1(tc)} млрд — бюджет этого не выдержит`,'econ')}
  if(!deal){save();modal(`<div class="mhead"><span class="kicker amber">Записано</span><h2>Предвыборное обещание №${n}</h2></div><div class="mbody"><p class="outcome">«${esc(p.text)}»</p><div class="kv"><span>Стоимость: <b>${p.costT}</b></span><span>Срок: <b>${p.term}</b></span><span>Популярность: <b>+${f1(p.pop*m)}%</b></span></div>${warn}<p class="muted">После победы обещание появится в президентском интерфейсе. Его нельзя забрать назад.</p><button class="btn primary" data-a="closeR">Продолжить</button></div>`)}
}

/* ---- opposition research ---- */
function openOppo(){
  const rs=rivalsActive();
  modal(`<div class="mhead"><span class="kicker">Оппо-исследование</span><h2>На кого копать?</h2></div><div class="mbody"><p>Юрист-исследователь изучит архивы, суды и декларации. Шанс найти что-то серьёзное — около 60%. Стоимость ${money(COST.oppo)} и 1 час.</p><div class="choices">${rs.map(c=>`<button class="btn act" data-a="dig" data-v="${c}"><b>${esc(S.c[c].name)}</b><span class="c">${S.c[c].dirt?'компромат: '+S.c[c].dirt:''}</span><span class="d">${esc(S.c[c].party)}</span></button>`).join('')}</div><button class="btn ghost" data-a="close">Отмена</button></div>`)}
A.dig=v=>{if(!spend(1,COST.oppo))return;const k=S.c[v];let t;
  if(Math.random()<.6){k.dirt=(k.dirt||0)+1;t=pick([`Найдено: фирма брата ${k.short} получила подряды без тендера.`,`Найдено: ${k.short} не задекларировал квартиру на побережье.`,`Найдено: старые высказывания ${k.short}, которые противоречат его программе.`])+' Компромат можно опубликовать или использовать на дебатах.'}
  else t='Ничего существенного. Деньги потрачены.';
  modal(`<div class="mhead"><span class="kicker">Оппо-исследование</span><h2>Отчёт «Архива»</h2></div><div class="mbody"><p class="outcome">${t}</p><button class="btn primary" data-a="closeR">Продолжить</button></div>`);save()};

/* ================= weekly simulation ================= */
function nextWeek(){
  if(S.queue.length)return pump();
  const cp=S.camp;cp.left-=7;cp.week++;
  const sal=S.staff.reduce((a,id)=>a+STAFF_BY[id].salary,0)*12/52;
  const don=(90e3+PL().rec*5e3+PL().trust*2e3)*(1+fx('fund'))*(cp.reelect?1.3:1);
  S.budget+=don-sal;cp.lastIncome=don;cp.lastSalary=sal;
  if(S.budget<0){hurt(1,0);news(`Кампания ${PL().short} задерживает оплату подрядчикам`,'money')}
  if(fx('smm'))recUp(.5);
  PL().trust+=(PL().trust0-PL().trust)*.01;
  S.regions.forEach(r=>{for(const c in r.effort)r.effort[c]*=.98;r.flood=false});
  rivalsAct();
  cashWeek();attemptWeek();partyWeek();bribeWeek();
  econWeek();
  S.pending=S.pending.filter(x=>{if(x.left>=cp.left){S.queue.push({id:x.id,p:x.p});return false}return true});
  if(cp.left>7&&Math.random()<.42)randomEvent();
  for(const d of cp.debates){if(!d.done&&cp.left<=d.at){d.done=true;S.queue.push({id:'debate',p:{n:d.n}})}}
  checkDropouts();
  cp.apMax=10+fx('ap')-apCutNow();cp.ap=cp.apMax;cp.precise=false;regenNoise();recordHist();
  if(cp.week%2===0)pollNews();
  genOffers();if(S.gmod)for(const k in S.gmod)S.gmod[k]*=.96;
  if(cp.left<=0){cp.left=0;S.queue.push({id:'eday_go'})}
  save();render();pump();
}
function rivalsAct(){
  for(const c of rivalsActive()){
    const k=S.c[c];if(k.pause>0){k.pause--;continue}const n=k.power+(S.camp.left<=56?1:0);
    for(let j=0;j<n;j++){
      let best=-1,bi=0;
      REG.forEach((R,i)=>{const s=shares(i);const others=active().filter(x=>x!==c);const lead=Math.max(...others.map(x=>s[x]));const w=R.ev/(1+Math.abs(s[c]-lead)/4)*rnd(.6,1.4);if(w>best){best=w;bi=i}});
      S.regions[bi].effort[c]+=rnd(2.7,3.8);
      if(j===0&&Math.random()<.5)news(`${k.short} провёл митинг в регионе ${REG[bi].name}`,'rival');
    }
    if(Math.random()<.22){addEffortAll(c,1);news(`${k.short} запустил национальную рекламную кампанию`,'rival')}
    k.trust+=(k.trust0-k.trust)*.06;
    if(c===mainRival()&&Math.random()<.14){const d=hurt(1.5);addEffortAll('player',-.6);news(`${k.short} выпустил атакующий ролик против ${PL().short}`,'rival')}
  }
}
function econWeek(){
  const e=S.econ;const u0=e.unemp;
  if(!S.camp.reelect&&S.flags.recWeek===S.camp.week){e.recession=true;S.queue.push({id:'recession'})}
  if(e.recession){e.growth=Math.max(-1.6,e.growth-rnd(.1,.25));e.unemp=Math.min(e.unemp+rnd(.06,.16),7.6)}
  else{e.growth=clamp(e.growth+gauss()*.05,-3,5);e.unemp=clamp(e.unemp+gauss()*.03,2.5,14)}
  e.energy=clamp(e.energy+gauss()*1.5,70,190);e.infl=clamp(e.infl+gauss()*.05+(e.energy-100)/3000,0.5,14);
  if(Math.floor(e.unemp*2)!==Math.floor(u0*2))news(`Безработица ${e.unemp>u0?'выросла':'снизилась'} до ${pct(e.unemp)}`,'econ');
}
function pollNews(){const n=national(true);const a=active().sort((x,y)=>n[y]-n[x]);news('Новый опрос: '+a.map(c=>`${S.c[c].short} ${pct(n[c])}`).join(', ')+`, не определились ${pct(n.und)}`,'poll')}
function checkDropouts(){
  const rs=rivalsActive();if(rs.length<=1)return;if(S.queue.some(q=>q.id==='dropout'))return;
  const prog=1-S.camp.left/S.camp.total;const n=national();let cand=null;
  const sorted=rs.slice().sort((a,b)=>n[a]-n[b]);
  if(S.camp.left<=35)cand=sorted[0];
  else if(prog>.35&&n[sorted[0]]<9.5)cand=sorted[0];
  if(cand)S.queue.push({id:'dropout',p:{c:cand}});
}
function similarity(a,b){let d=0;for(const i of ISS)d+=Math.abs(S.c[a].issues[i]-S.c[b].issues[i]);return 1/(1+d/150)}
function dropRival(c,fracP,fracO,other){
  REG.forEach((R,i)=>{const a=appeal(i,c);const st=S.regions[i];
    st.effort.player+=a*fracP/factor(PL());if(other)st.effort[other]+=a*fracO/factor(S.c[other]);st.und+=a*(1-fracP-fracO)});
  S.c[c].out=true;
}

/* ================= events ================= */
const EV={};
function randomEvent(){
  const list=Object.entries(EV).filter(([id,e])=>e.w&&(!e.once||!S.used[id])&&(!e.cond||e.cond()));
  let t=list.reduce((a,[,e])=>a+(typeof e.w==='function'?e.w():e.w),0),r=Math.random()*t;
  for(const [id,e] of list){r-=typeof e.w==='function'?e.w():e.w;if(r<=0){S.used[id]=1;S.queue.push({id,p:e.params?e.params():{}});return}}
}
const choice=(label,hint,run)=>({label,hint,run});
EV.donor={w:()=>2+(S.flags.donorRisk||0)*.6,once:true,cond:()=>S.camp.week>=3,build(){
  const truth=Math.random()<(.35+(has('fund')?.3:0));const donor=pick(['строительная группа «Магистраль»','холдинг «Северинвест»','фонд «Прогресс-21»']);
  return{kicker:'Журналистское расследование',title:'Донор кампании и государственные контракты',text:`Издание «Ардания сегодня» утверждает, что ${donor}, один из крупнейших доноров вашей кампании, получила государственные контракты на $340 млн${has('fund')?'. Сделку якобы организовал ваш фандрайзер Ричард Хейл':''}.`,choices:[
    has('fund')&&choice('Уволить фандрайзера','Пожертвования упадут',()=>{fire('fund');const d=hurt(truth?3:2);return truth?`Хейл уходит. История быстро затихает. Доверие −${f1(d)}.`:`Хейл уходит, хотя позже обвинения не подтвердились. Доверие −${f1(d)}.`}),
    choice('Опубликовать документы','Больно сейчас, но без сюрпризов потом',()=>{if(truth){const d=hurt(6);later(14,'honesty');return `Документы подтверждают связь. Удар болезненный (доверие −${f1(d)}), но вы первыми сказали правду.`}gain(4);return 'Документы показывают: контракты выиграны на открытом тендере. История разваливается. Доверие +4.'}),
    choice('Отрицать обвинения','Если это правда, всплывёт позже',()=>{if(truth){later(ri(10,16),'docs');gain(.5);return 'Вы заявляете, что обвинения ложны. Пока что история затихает…'}gain(1.5);return 'Вы опровергаете слухи. Журналисты не находят подтверждений. Доверие +1,5.'}),
    choice('Атаковать журналистов','Сторонникам понравится, остальным — нет',()=>{const d=hurt(3);recUp(2);if(truth)later(ri(10,16),'docs',{extra:4});return `Вы называете публикацию заказной. Ядро сторонников довольно, нейтральные избиратели насторожились. Доверие −${f1(d)}.`}),
    choice('Ничего не делать','',()=>{if(truth){const d=hurt(6);return `Молчание восприняли как признание. Доверие −${f1(d)}.`}const d=hurt(1.5);return `История пожила несколько дней и исчезла. Доверие −${f1(d)}.`}),
  ].filter(Boolean)}}};
EV.docs={build(p){return{kicker:'Срочно',title:'Опубликованы документы',text:'Издание выложило переписку и платёжные поручения. Ваше предыдущее заявление оказалось ложным.',choices:[choice('Принять удар','',()=>{const d=hurt(14+(p.extra||0),.5);addEffortAll('player',-1.5);news(`Документы опровергли заявление ${PL().short}`,'scandal');return `Доверие −${f1(d)}. Оппоненты повторяют слово «лжец» в каждом эфире.`})]}}};
EV.honesty={build(){return{kicker:'Опрос',title:'Избиратели оценили честность',text:'Социологи фиксируют: история с донором забыта быстрее, чем ожидалось. Многие запомнили, что вы сами раскрыли документы.',choices:[choice('Отлично','',()=>{gain(3);return 'Доверие +3.'})]}}};
EV.skeleton={w:()=>(S.scan!=null?S.scan:BIOS.find(b=>b.id===S.bio).skeleton)*2.4,once:true,cond:()=>S.camp.week>=4&&!S.camp.reelect,build(){
  const b=BIOS.find(x=>x.id===S.bio);const truth=Math.random()<(S.scan!=null?S.scan:b.skeleton)+.25;
  return{kicker:'Журналистское расследование',title:'Прошлое кандидата',text:`Телеканал «Ардания-24» готовит сюжет: ${b.skel}. Редакция просит комментарий до вечера.`,choices:[
    choice('Дать подробное интервью','Если правда — честность смягчит удар',()=>{if(truth){const d=hurt(5);return `Вы признаёте ошибку и объясняете контекст. Доверие −${f1(d)}, но история не получит продолжения.`}gain(3);return 'Вы спокойно разбираете все детали. Сюжет выходит в ваш пользу. Доверие +3.'}),
    choice('Отрицать всё','',()=>{if(truth){later(ri(9,15),'docs');return 'Вы называете сюжет ложью. Редакция обещает новые материалы…'}gain(1);return 'Сюжет выходит без доказательств и быстро забывается.'}),
    choice('Пригрозить судом','Узнаваемость растёт, доверие — нет',()=>{recUp(2);const d=hurt(truth?4:1.5);return `Иск привлекает ещё больше внимания. Доверие −${f1(d)}.`}),
  ]}}};
EV.tweet={w:()=>has('smm')||has('morgan')?1.6:.6,once:true,build(){
  const who=has('smm')?'сотрудник SMM-команды':'волонтёр штаба';
  return{kicker:'Скандал в соцсетях',title:'Оскорбительный пост из вашего штаба',text:`${who[0].toUpperCase()+who.slice(1)} назвал жителей Горного региона «деревенщиной». Скриншоты повсюду.`,choices:[
    choice('Немедленно уволить и извиниться','',()=>{const d=hurt(1);S.regions[REGI('mountain')].effort.player-=1;return `Быстрая реакция погасила пожар. Доверие −${f1(d)}.`}),
    choice('Защитить сотрудника','',()=>{const d=hurt(3.5);S.regions[REGI('mountain')].effort.player-=4;return `Горный регион запомнит. −4 там, доверие −${f1(d)}.`}),
    choice('Поехать в Горный регион с извинениями','1 действие на следующей неделе не потеряется, но $150 тыс.',()=>{S.budget-=150e3;S.regions[REGI('mountain')].effort.player+=2;gain(.5);return 'Вы приезжаете в шахтёрский город и говорите с людьми. Регион оценил: +2 к поддержке.'}),
  ]}}};
EV.factory={w:()=>1.4+(S.econ.recession?1.5:0),params:()=>({r:pick([0,5,6,8])}),build(p){
  const R=REG[p.r];const n=ri(12,31)*100;
  return{kicker:'Экономика',title:`Завод в регионе ${R.name} закрывается`,text:`Компания объявила о закрытии предприятия. Без работы останутся ${num(n)} человек. Люди ждут, что скажут кандидаты.`,choices:[
    choice('Приехать к проходной','$200 тыс.',()=>{S.budget-=200e3;S.regions[p.r].effort.player+=4;PL().issues.jobs=Math.min(100,PL().issues.jobs+4);return `Вы стоите среди рабочих под дождём. Кадры облетели все каналы. +4 в регионе ${R.name}.`}),
    choice('Пообещать спасти рабочие места','Новое обязательство',()=>{if(!cyclePromises().some(x=>x.id==='jobs500'))makePromise('jobs500',true);S.regions[p.r].effort.player+=3;return 'Обещание «Создать 500 000 рабочих мест» внесено в программу. +3 в регионе.'}),
    choice('Заявление в соцсетях','',()=>{S.regions[p.r].effort.player+=1;return '+1 в регионе. Многие сочли реакцию дежурной.'}),
    choice('Промолчать','',()=>{S.regions[p.r].effort.player-=2;return `${mainRival()?S.c[mainRival()].short:'Соперник'} приехал к заводу первым. −2 в регионе.`}),
  ]}}};
EV.union={w:1,once:true,cond:()=>S.camp.week>=4,build(){return{kicker:'Переговоры',title:'Профсоюз учителей предлагает поддержку',text:'Лидер профсоюза: «Мы мобилизуем 300 000 членов, если вы включите в программу повышение зарплат учителей на 25%».',choices:[
  choice('Согласиться','Новое обязательство: $5 млрд в год',()=>{if(!cyclePromises().some(x=>x.id==='teachers'))makePromise('teachers',true);REG.forEach((R,i)=>S.regions[i].effort.player+=1.5);return 'Профсоюз официально поддерживает вас. +1,5 во всех регионах. Обещание записано.'}),
  choice('Отказаться','',()=>{gain(.5);return 'Профсоюз остаётся нейтральным. Экономисты отметили вашу сдержанность.'})]}}};
EV.celebrity={w:1,once:true,build(){const truth=Math.random()<.3;return{kicker:'Шоу-бизнес',title:'Звезда хочет поддержать вас',text:'Певица Мира Лайт (14 млн подписчиков) готова выступить на вашем митинге.',choices:[
  choice('Принять поддержку','',()=>{recUp(4);REG.forEach((R,i)=>S.regions[i].effort.player+=R.youth*4);if(truth)later(ri(14,25),'celebfall');return 'Концерт-митинг собрал 40 000 человек. Узнаваемость +4, молодёжь заинтересовалась.'}),
  choice('Вежливо отказаться','',()=>{gain(.5);return 'Вы остаётесь «серьёзным кандидатом».'})]}}};
EV.celebfall={build(){return{kicker:'Скандал',title:'Мира Лайт попала в скандал',text:'Певица оказалась замешана в истории с уклонением от налогов. Её фото с вами — на первых полосах.',choices:[
  choice('Дистанцироваться','',()=>{const d=hurt(1.5);return `Доверие −${f1(d)}.`}),choice('Защитить её','',()=>{const d=hurt(4);recUp(1);return `Доверие −${f1(d)}.`})]}}};
EV.health={w:.8,once:true,build(){return{kicker:'Слухи',title:'«Кандидат серьёзно болен»',text:'Анонимный канал утверждает, что вы скрываете болезнь. Хештег в трендах.',choices:[
  choice('Опубликовать медицинскую карту','$50 тыс.',()=>{S.budget-=50e3;gain(2);return 'Обследование показывает: вы здоровы. Доверие +2.'}),
  choice('Пробежать полумарафон на камеру','',()=>{recUp(2);gain(1);return 'Вы финишируете за 1:52. Лучший ответ слухам. Узнаваемость +2.'}),
  choice('Игнорировать','',()=>{const d=hurt(2);return `Слухи живут неделю. Доверие −${f1(d)}.`})]}}};
EV.deepfake={w:.9,once:true,cond:()=>S.camp.week>=5,build(){return{kicker:'Дезинформация',title:'Дипфейк-видео',text:'В сети разошлось видео, где «вы» обещаете поднять пенсионный возраст до 70 лет. Это подделка, но её посмотрели 3 млн человек.',choices:[
  choice('Быстрое опровержение в соцсетях','Работает лучше с SMM-командой',()=>{if(has('smm')){gain(1);return 'Команда «Пиксель» за два часа разобрала подделку по кадрам. Доверие +1.'}const d=hurt(2.5);return `Опровержение вышло поздно. Доверие −${f1(d)}.`}),
  choice('Подать в суд и пресс-конференция','$200 тыс.',()=>{S.budget-=200e3;const d=hurt(1);return `Шум стихает через несколько дней. Доверие −${f1(d)}.`}),
  choice('Игнорировать','',()=>{const d=hurt(3.5);addEffortAll('player',-.8);return `Пенсионеры поверили. Доверие −${f1(d)}.`})]}}};
EV.rivalgaffe={w:1.4,build(){const c=mainRival();if(!c)return null;const k=S.c[c];return{kicker:'Оговорка соперника',title:`${k.name}: «Минимальной зарплаты хватает на жизнь»`,text:'Фраза прозвучала на закрытом ужине с донорами, но кто-то снимал на телефон.',choices:[
  choice('Сделать ролик','$300 тыс.',()=>{S.budget-=300e3;k.trust=clamp(k.trust-4,10,90);addEffortAll(c,-1);const d=hurt(.5);return `Ролик набрал 6 млн просмотров. Доверие к ${k.short} −4.`}),
  choice('Остаться выше этого','',()=>{gain(1.2);k.trust=clamp(k.trust-2,10,90);return 'Вы отказались комментировать. СМИ сделали всё сами. Ваше доверие +1,2.'})]}}};
EV.flood={w:1,params:()=>({r:pick([0,1,6,8])}),build(p){const R=REG[p.r];S.regions[p.r].flood=true;return{kicker:'Стихийное бедствие',title:`Наводнение в регионе ${R.name}`,text:'Вода затопила 40 населённых пунктов. Эвакуированы 18 000 человек.',choices:[
  choice('Приехать на место','В этом месяце митинг в регионе даст больше',()=>{S.budget-=100e3;S.regions[p.r].effort.player+=4;gain(2);return `Вы с волонтёрами носите мешки с песком. +4 в регионе ${R.name}, доверие +2.`}),
  choice('Перечислить $500 тыс. из фонда кампании','',()=>{S.budget-=500e3;S.regions[p.r].effort.player+=2;gain(1);return '+2 в регионе, доверие +1.'}),
  choice('Не прерывать график','',()=>{S.regions[p.r].effort.player-=3;return `Жители региона ${R.name} это заметили. −3 в регионе.`})]}}};
EV.leak={w:()=>has('morgan')?2.2:0,once:true,build(){return{kicker:'Утечка',title:'Запись разговора Алекса Моргана',text:'На записи ваш специалист по рекламе говорит: «Избиратели — стадо, им нужен страх». Запись слил бывший сотрудник.',choices:[
  choice('Уволить Моргана','',()=>{fire('morgan');const d=hurt(1.5);return `Морган уходит. Доверие −${f1(d)}.`}),
  choice('Оставить, извиниться','',()=>{const d=hurt(5);return `Доверие −${f1(d)}. Журналисты будут возвращаться к этой записи.`}),
  choice('Заявить, что запись смонтирована','',()=>{if(Math.random()<.6){later(ri(8,14),'docs');return 'Пока что работает…'}gain(.5);return 'Эксперты не смогли подтвердить подлинность. Пронесло.'})]}}};
EV.paper={w:()=>PL().trust>60?1:0,once:true,build(){return{kicker:'Поддержка',title:'«Курьер Арданы» поддерживает вашу кандидатуру',text:'Крупнейшая газета страны впервые за 12 лет публично поддерживает кандидата.',choices:[choice('Поблагодарить редакцию','',()=>{recUp(2);addEffortAll('player',1);return 'Узнаваемость +2, +1 во всех регионах.'})]}}};
EV.students={w:.9,once:true,build(){return{kicker:'Протест',title:'Студенты вышли на улицы столицы',text:'Тысячи студентов протестуют против повышения платы за обучение. Они ждут позиции кандидатов.',choices:[
  choice('Выйти к студентам','',()=>{S.regions[REGI('capital')].effort.player+=3;PL().issues.education+=5;S.regions[REGI('south')].effort.player-=1;return '+3 в Столичном регионе. Консервативный юг недоволен (−1).'}),
  choice('Призвать к порядку','',()=>{PL().issues.security+=4;S.regions[REGI('capital')].effort.player-=2;S.regions[REGI('east')].effort.player+=1.5;return 'Восток оценил (+1,5), столица — нет (−2).'}),
  choice('Промолчать','',()=>'Протест проходит без вас.')]}}};
EV.recession={build(){return{kicker:'Экономика',title:'Ардания входит в спад',text:`Безработица растёт уже третий месяц: ${pct(S.econ.unemp)}. Экономика автоматически стала главной темой для избирателей. Если ваша кампания про другое, придётся перестраиваться.`,choices:[
  choice('Перестроить кампанию на экономику','Сила в темах «Рабочие места» и «Цены» +8',()=>{PL().issues.jobs=Math.min(100,PL().issues.jobs+8);PL().issues.prices=Math.min(100,PL().issues.prices+8);return 'Штаб переписал речи за выходные. Теперь каждая из них — про работу и цены.'}),
  choice('Обвинить правительство','',()=>{recUp(2);addEffortAll('player',1);return 'Узнаваемость +2, +1 во всех регионах.'}),
  choice('Держаться своей программы','',()=>{gain(1);return 'Последовательность ценят: доверие +1. Но тема экономики работает не на вас.'})]}}};
EV.eday_go={build(){return{kicker:'Финал кампании',title:'Кампания окончена',text:'Агитация запрещена. Завтра страна выбирает президента. В штабе пахнет кофе и нервами.',choices:[choice('Наступает день выборов','',()=>{S.phase='eday';return null})]}}};
EV.dropout={build(p){
  const c=p.c,k=S.c[c];const n=national();const others=rivalsActive().filter(x=>x!==c);const other=others.sort((a,b)=>n[b]-n[a])[0];
  const deal=PROM_BY[k.deal];const already=cyclePromises().some(x=>x.id===k.deal);
  const sp=similarity('player',c),so=other?similarity(other,c):0;const baseP=.75*sp/(sp+so||1);
  const title=`${k.short} снимается с выборов`;
  const text=`${k.name} (${pct(n[c])}) заявляет о выходе из гонки. ${k.id==='miller'?'Её':'Его'} избиратели не переходят автоматически никому.`+(already?`<br><br>«Вы уже обещали — ${esc(deal.text.toLowerCase())}. Я призову своих сторонников голосовать за вас».`:`<br><br>${k.short} звонит вам лично: «Я поддержу вас, если вы включите в программу: <b>${esc(deal.text)}</b>».`);
  if(already)return{kicker:'Снятие кандидата',title,text,choices:[choice('Принять поддержку','',()=>{dropRival(c,.6,.12,other);news(`${k.short} снялся и поддержал ${PL().short}`,'camp');return `Большая часть сторонников ${k.short} переходит к вам.`})]};
  return{kicker:'Переговоры',title,text,choices:[
    choice('Согласиться','Его поддержка, но новое обязательство',()=>{makePromise(k.deal,true);dropRival(c,.6,.12,other);news(`${k.short} снялся и поддержал ${PL().short}`,'camp');return `Договорились. Обещание «${deal.text}» добавлено в программу. Около 60% сторонников ${k.short} переходят к вам.`}),
    choice('Отказаться и бороться за его избирателей','',()=>{const endorse=other&&Math.random()<.5;const ob=k.id==='miller'?'Обиженная':'Обиженный';dropRival(c,endorse?baseP*.7:baseP,endorse?(.75-baseP)+.15:.75-baseP,other);news(`${k.short} выбыл из гонки${endorse?' и поддержал '+S.c[other].short:''}`,'camp');return endorse?`${ob} ${k.short} поддержал ${S.c[other].short}. Вам достаётся около ${Math.round(baseP*70)}% его избирателей.`:`${k.short} никого не поддерживает. Вам достаётся около ${Math.round(baseP*100)}% его избирателей.`})]};
}};

/* ================= UI infra ================= */
function modal(html,wide){$('#modal').innerHTML=`<div class="mback" role="dialog" aria-modal="true"><div class="modal${wide?' wide':''}">${html}</div></div>`;const b=$('#modal .modal button');if(b)b.focus({preventScroll:true})}
function closeModal(){$('#modal').innerHTML='';CUR=null}
const modalOpen=()=>!!$('#modal').innerHTML;
let toastT=0;
function toast(t){$('#toastbox').innerHTML=`<div class="toast" role="status">${t}</div>`;clearTimeout(toastT);toastT=setTimeout(()=>$('#toastbox').innerHTML='',4200)}
function after(){save();render()}
A.close=()=>closeModal();
A.closeR=()=>{closeModal();render();pump()};

function pump(){
  if(modalOpen()||!S)return;
  while(S.queue.length){
    const q=S.queue[0];
    if(q.id==='debate'){startDebate(q.p);return}
    const ev=EV[q.id]||(typeof CR!=='undefined'&&CR[q.id]);
    const d=ev&&ev.build(q.p||{});
    if(!d){S.queue.shift();continue}
    CUR=d;CUR.fromQueue=true;showChoice();return;
  }
  render();
}

A.choose=v=>{
  const d=CUR;if(!d)return;const res=d.choices[+v].run();
  if(d.fromQueue)S.queue.shift();
  save();
  if(res===null||res===undefined){closeModal();render();pump();return}
  modal(`<div class="mhead"><span class="kicker ${d.kc||''}">${esc(d.kicker)}</span><h2>${esc(d.title)}</h2></div><div class="mbody"><p class="outcome">${res}</p><button class="btn primary" data-a="closeR">Продолжить</button></div>`);
};

if(!window.__mandateBound){window.__mandateBound=1;document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(!t||t.disabled)return;const f=A[t.dataset.a];if(f){e.preventDefault();f(t.dataset.v,t,e)}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&CUR&&CUR.cancel)closeModal()});}

/* ================= render dispatcher ================= */
/* ---- React bridge: render() publishes a "view"; <App/> draws it ---- */
export const SCREENS={};                       // phase key -> React component (migrated screens)
export const registerScreen=(key,Comp)=>{SCREENS[key]=Comp};
let VIEW=null,REV=0;const SUBS=new Set();
export const subscribe=cb=>{SUBS.add(cb);return()=>SUBS.delete(cb)};
export const getView=()=>VIEW;
function render(){
  const key=!S?'menu':S.phase;
  let html=null,post=null;
  if(!SCREENS[key]){            // screen not migrated yet -> legacy HTML string
    switch(key){
      case 'menu':html=menuHTML();break;
      case 'campaign':html=campaignHTML();break;
      case 'eday':html=edayHTML();post=startEday;break;
      case 'night':html=nightHTML();post=startNight;break;
      case 'victory':html=victoryHTML();break;
      case 'defeat':html=defeatHTML();break;
      case 'cabinet':html=cabinetHTML();break;
      case 'presidency':html=presHTML();break;
      case 'legacy':html=legacyHTML();break;
    }
  }
  VIEW={key,html,post,rev:++REV};
  SUBS.forEach(f=>f());
  if(S)tickerFill();   // как в оригинале: в меню бегущая строка не трогается
}
function topBar(tag,date,stats){
  return `<header class="top"><div class="top-row"><div class="brand"><span class="seal" aria-hidden="true">★</span>Mandate</div><span class="phase-tag">${tag}</span><span class="top-date">${date}</span><button class="btn ghost" data-a="menu" style="padding:4px 10px;font-size:13px">Меню</button></div>${stats?`<div class="statbar">${stats}</div>`:''}</header>`}
const stat=(k,v,cls)=>`<div class="stat ${cls||''}"><div class="k">${k}</div><div class="v">${v}</div></div>`;
function tickerFill(){
  let el=$('#ticker');
  if(!S||!S.news.length||S.phase==='night'||S.phase==='eday'){if(el)el.remove();return}
  if(!el){el=document.createElement('footer');el.id='ticker';el.className='ticker';document.body.appendChild(el)}
  const items=S.news.slice(0,7).map(n=>esc(n.t)).join('<em>◆</em>');
  const sig=S.news.length+'|'+S.news[0].t;
  if(el.dataset.sig===sig)return;el.dataset.sig=sig;
  el.innerHTML=`<b>Breaking news</b><div class="crawl"><span style="animation-duration:${Math.max(28,items.length/9)}s">${items}</span></div>`;
}
A.menu=()=>{modal(`<div class="mhead"><span class="kicker amber">Пауза</span><h2>Меню</h2></div><div class="mbody"><p>Игра сохраняется автоматически после каждого хода.</p><div class="choices"><button class="btn" data-a="close">Вернуться к игре</button><button class="btn danger" data-a="restartAsk">Начать заново</button></div></div>`)};
A.restartAsk=()=>{modal(`<div class="mhead"><span class="kicker">Внимание</span><h2>Удалить текущую карьеру?</h2></div><div class="mbody"><p>Прогресс будет потерян без возможности восстановления.</p><div class="row"><button class="btn danger" data-a="restart">Да, начать заново</button><button class="btn" data-a="close">Отмена</button></div></div>`)};
A.restart=()=>{stopTimers();wipeSave();S=null;closeModal();render()};

/* ================= menu / setup ================= */
const SETUP={name:'Илья Руденко',party:'Новый курс',bio:'biz',days:182,age:34,look:0};
A.start=()=>{grabSetup();newGame(SETUP);save();render();setTimeout(()=>toast('Начните со штаба: наймите руководителя кампании и аналитика. Затем — митинги в колеблющихся регионах.'),300)};
A.continue=()=>{S=loadSave();if(!S)return;if(S.phase==='night')S.phase='night';render();pump()};

/* ================= campaign screen ================= */

function hexA(hex,a){const n=parseInt(hex.slice(1),16);return `rgba(${n>>16},${(n>>8)&255},${n&255},${a})`}
function leadColor(s){let best=null,sec=null;for(const c of active()){if(!best||s[c]>s[best]){sec=best;best=c}else if(!sec||s[c]>s[sec])sec=c}
  const m=s[best]-(sec?s[sec]:0);return hexA(S.c[best].color,clamp(.28+m/22,.28,.95))}
function trendChart(){
  const h=S.camp.hist;if(h.length<2)return `<p class="muted">График рейтинга появится через неделю. Совет: начните с найма команды, затем митинги в колеблющихся регионах.</p>`;
  const W=560,H=150,pad=28;const xs=i=>pad+i*(W-pad-8)/Math.max(1,h.length-1);
  let lo=100,hi=0;h.forEach(p=>S.order.forEach(c=>{if(p[c]!=null){lo=Math.min(lo,p[c]);hi=Math.max(hi,p[c])}}));lo=Math.max(0,Math.floor(lo/5)*5-5);hi=Math.min(100,Math.ceil(hi/5)*5+5);
  const ys=v=>H-20-(v-lo)/(hi-lo)*(H-34);
  let s=`<svg class="spark chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика рейтинга">`;
  for(let v=lo;v<=hi;v+=5){s+=`<line x1="${pad}" x2="${W-8}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)" stroke-width="1"/>`;if(v%10===0)s+=`<text x="2" y="${ys(v)+4}">${v}%</text>`}
  for(const c of S.order){const pts=h.map((p,i)=>p[c]==null?null:[xs(i),ys(p[c])]).filter(Boolean);if(pts.length<2)continue;
    s+=`<polyline fill="none" stroke="${S.c[c].color}" stroke-width="${c==='player'?3:2}" points="${pts.map(p=>p.join(',')).join(' ')}" opacity="${S.c[c].out?.35:1}"/>`;
    const e=pts[pts.length-1];if(!S.c[c].out)s+=`<circle cx="${e[0]}" cy="${e[1]}" r="4" fill="${S.c[c].color}"/>`}
  return s+`</svg>`}
function hqSVG(){
  const n=S.staff.length;const lvl=n<=1?0:n<=3?1:n<=6?2:3;
  const desks=Math.min(16,2+n*2);let s=`<svg viewBox="0 0 560 190" class="spark" role="img" aria-label="Штаб кампании">`;
  s+=`<rect x="0" y="0" width="560" height="110" fill="var(--panel-3)"/><rect x="0" y="110" width="560" height="80" fill="var(--panel-2)"/>`;
  const wins=lvl+1;for(let w=0;w<wins;w++)s+=`<rect x="${20+w*70}" y="20" width="50" height="60" fill="#0d2a4a" stroke="var(--line-2)"/>`;
  if(lvl>=1)for(let t=0;t<lvl+(has('smm')?1:0);t++)s+=`<rect x="${300+t*62}" y="22" width="54" height="34" fill="#071224" stroke="var(--line-2)"/><rect x="${304+t*62}" y="26" width="46" height="5" fill="var(--bad)"/><rect x="${304+t*62}" y="35" width="${20+t*7}" height="3" fill="var(--muted)"/>`;
  if(has('analyst'))s+=`<g transform="translate(300 62) scale(.09)">${REG.map(R=>`<polygon points="${R.poly.split('').map(k=>VX[k].join(',')).join(' ')}" fill="${Math.random()<.5?'#4a90ff':'#ff5a4e'}" opacity=".8"/>`).join('')}</g>`;
  for(let d=0;d<desks;d++){const col=d%8,row=Math.floor(d/8);const x=24+col*66,y=122+row*34;s+=`<rect x="${x}" y="${y+10}" width="48" height="10" fill="var(--line-2)"/><circle cx="${x+24}" cy="${y+4}" r="7" fill="${d<n*2?'var(--amber)':'var(--dim)'}"/><rect x="${x+16}" y="${y-1}" width="16" height="3" fill="#9fc3ff" opacity=".6"/>`}
  return s+'</svg>'}
function promisesTab(){
  const ps=cyclePromises();const tc=promisedCost();
  if(!ps.length)return `<p class="muted">Вы ещё ничего не обещали. Обещания — самый быстрый способ получить голоса. И самый надёжный способ получить проблемы после победы.</p><button class="btn primary" data-a="speech">Программная речь</button>`;
  return `<div class="kv" style="margin-bottom:10px"><span>Обещаний: <b>${ps.length}</b></span><span>Суммарная стоимость: <b class="${tc>40?'down':''}">$${f1(tc)} млрд</b></span><span>Порог доверия экспертов: <b>$40 млрд</b></span></div>
  <div class="list">${ps.map(p=>{const d=PROM_BY[p.id];return `<div class="item promise"><span class="pnum">№${p.n}</span><div><b>«${esc(d.text)}»</b>${p.deal?' <span class="pill warn">Сделка</span>':''}<div class="kv"><span>Стоимость: <b>${d.costT}</b></span><span>Срок: <b>${d.term}</b></span><span>Тема: <b>${ISSUES[d.iss]}</b></span></div></div></div>`}).join('')}</div>`}
function rivalsTab(){
  const n=national(true);
  return `<div class="list">${S.order.slice().sort((a,b)=>(S.c[a].out-S.c[b].out)||n[b]-n[a]).map(c=>{const k=S.c[c];
    return `<div class="item" style="${k.out?'opacity:.5':''}"><div class="row between"><div><b style="color:${k.color};font-family:var(--f-display);font-size:20px">${esc(k.name)}</b>${c==='player'?' <span class="pill you">Вы</span>':''}${k.out?' <span class="pill">Снялся</span>':''}<div class="eyebrow">${esc(k.party)}</div></div><div class="big" style="font-size:34px;color:${k.color}">${k.out?'—':pct(n[c])}</div></div>
    ${k.blurb?`<p class="muted" style="margin:4px 0">${esc(k.blurb)}</p>`:''}
    <div class="kv"><span>Доверие: <b>${Math.round(k.trust)}</b></span><span>Узнаваемость: <b>${Math.round(k.rec)}</b></span>${k.dirt?`<span class="up">Компромат: ${k.dirt}</span>`:''}</div>
    <div class="issues" style="margin-top:8px">${ISS.map(x=>`<div class="iss"><span>${ISSUES[x]}</span><span class="bar"><i style="width:${k.issues[x]}%;background:${k.color}"></i></span><span class="p">${Math.round(k.issues[x])}</span></div>`).join('')}</div></div>`}).join('')}</div>`}
function econTab(){
  const e=S.econ,e0=S.econ0;const row=(k,v,v0,u,bad)=>{const d=v-v0;const cls=Math.abs(d)<.05?'flat':(d>0)===!bad?'up':'down';return `<tr><td>${k}</td><td class="r">${f1(v0)}${u}</td><td class="r"><b>${f1(v)}${u}</b></td><td class="r ${cls}">${sgn(d)}</td></tr>`};
  const tops=topIssues(7);const tot={};ISS.forEach(i=>tot[i]=0);REG.forEach(R=>{const m=salMap(R);ISS.forEach(i=>tot[i]+=m[i]*R.pop)});const P=REG.reduce((a,R)=>a+R.pop,0);
  return `<div class="stack"><div class="tblwrap"><table class="tbl"><tr><th>Показатель</th><th class="r">Старт</th><th class="r">Сейчас</th><th class="r">Δ</th></tr>
  ${row('Рост ВВП',e.growth,e0.growth,'%',false)}${row('Инфляция',e.infl,e0.infl,'%',true)}${row('Безработица',e.unemp,e0.unemp,'%',true)}${row('Цены на энергию (индекс)',e.energy,e0.energy,'',true)}${row('Госдолг, % ВВП',e.debt/e.gdp*100,e0.debt/e0.gdp*100,'%',true)}${row('Ключевая ставка',e.rate,e0.rate,'%',true)}</table></div>
  <div><div class="eyebrow" style="margin-bottom:6px">Что волнует страну сейчас</div><div class="issues">${tops.map(x=>`<div class="iss"><span>${ISSUES[x]}</span><span class="bar"><i style="width:${tot[x]/P*250}%"></i></span><span class="p">${Math.round(tot[x]/P*100)}%</span></div>`).join('')}</div>
  <p class="muted" style="margin-top:8px">Когда растут безработица или цены, эти темы автоматически становятся важнее для избирателей.</p></div></div>`}
/* ================= debates ================= */
let DB=null;
function startDebate(p){
  const r=mainRival();if(!r){S.queue.shift();pump();return}
  const rounds=topIssues(3).map(iss=>({iss}));
  if(S.camp.reelect){const br=brokenPromises(S.cycle-1);if(br.length)rounds[0]={attack:br[0]}}
  DB={n:p.n,r,rounds,i:0,score:0,log:[]};debRound();
}
A.debPick=v=>{
  clearInterval(DBT);if(!DB)return;const rd=DB.rounds[DB.i],k=S.c[DB.r];let sc=0,txt='';
  if(v==='facts'){const ps=PL().issues[rd.iss],rs=k.issues[rd.iss];sc=(ps-rs)/100*1.3+.15+((PL().comp||60)-60)/200+rnd(-.25,.25);txt=sc>0?'Вы приводите точные цифры. Модератор кивает.':'Цифры звучат неуверенно, соперник ловит вас на неточности.'}
  else if(v==='attack'){if(k.dirt){k.dirt--;sc=.7+rnd(0,.4);k.trust=clamp(k.trust-3,10,90);txt=`Вы достаёте документы о ${k.short}. Зал замирает.`}else{sc=rnd(-.6,.6);txt=sc>0?'Атака попала в цель.':'Атака выглядела как грубость.'}hurt(.8,.5)}
  else if(v==='story'){sc=(PL().rec>60?.25:.1)+(PL().trust-55)/90+((PL().cha||60)-60)/150+rnd(-.25,.25);txt=sc>0?'История про отца-шахтёра трогает зрителей.':'История звучит заученно.'}
  else if(v==='evade'){sc=rnd(-.3,.1);hurt(.8);txt='Вы говорите о «важности вопроса». Зрители скучают.'}
  else if(v==='admit'){sc=.15+rnd(-.1,.2);gain(1);txt='«Да, мы не успели. Вот почему…» Честность оценили.'}
  else if(v==='achieve'){const kr=keptRatio(S.cycle-1);sc=kr*1.4-.45+rnd(-.2,.2);txt=sc>0?'Вы перечисляете выполненные обещания — список внушительный.':'Список достижений оказался коротким.'}
  else if(v==='deny'){sc=-.9;hurt(4,.3);txt='Фактчекеры опровергают вас прямо в эфире.'}
  else if(v==='counter'){sc=rnd(-.5,.5);txt=sc>0?'Вы напоминаете о провалах соперника. Счёт сравнялся.':'Ответная атака не сработала.'}
  DB.score+=sc;DB.log.push(txt);DB.i++;
  if(DB.i<DB.rounds.length){modal(debHead()+`<div class="mbody"><p class="outcome">${txt}</p><button class="btn primary" data-a="debNext">Следующий вопрос</button></div>`,true);return}
  const sc2=clamp(DB.score,-2,2);const win=clamp(50+sc2*9,24,76);
  addEffortAll('player',sc2*2.2);addEffortAll(DB.r,-sc2*1.2);if(sc2>0)gain(sc2*1.5);else hurt(-sc2*1.5,.3);recUp(2);
  news(`Опрос после дебатов: ${Math.round(win)}% считают, что победил ${win>=50?PL().short:k.short}`,'poll');
  S.queue.shift();save();
  modal(debHead()+`<div class="mbody"><p class="outcome">${txt}</p><div class="sep"></div><div class="eyebrow">Опрос сразу после эфира</div><div class="big" style="color:${win>=50?'var(--you)':k.color}">${Math.round(win)}%</div><p>считают, что победил <b>${win>=50?esc(PL().name):esc(k.name)}</b>. ${sc2>0?'Ваш рейтинг растёт.':'Это будет стоить голосов.'}</p><button class="btn primary" data-a="closeR">Вернуться в штаб</button></div>`,true);
  DB=null;
};
A.debNext=()=>{if(DB)debRound()};

/* ================= menu (redesign) ================= */
function sceneSVG(){
  let cols='';for(let i=0;i<12;i++)cols+=`<rect x="${238+i*14}" y="236" width="6" height="74" fill="#d9c7a6" opacity=".9"/>`;
  let wins='';for(let r=0;r<5;r++)for(let c=0;c<14;c++){if(Math.random()<.55)wins+=`<rect x="${560+c*13}" y="${210+r*18}" width="5" height="8" fill="#ffd58a" opacity="${rnd(.4,.95).toFixed(2)}"/>`}
  return `<svg class="scene" viewBox="0 0 1200 420" preserveAspectRatio="xMaxYMid slice" aria-hidden="true"><defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1a36"/><stop offset=".55" stop-color="#3a3f6b"/><stop offset=".8" stop-color="#c9734a"/><stop offset="1" stop-color="#f2b25c"/></linearGradient>
  <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#060d1a" stop-opacity=".95"/><stop offset=".4" stop-color="#060d1a" stop-opacity=".55"/><stop offset=".62" stop-color="#060d1a" stop-opacity=".1"/><stop offset="1" stop-color="#070f1d" stop-opacity="0"/></linearGradient>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe2a8"/><stop offset="1" stop-color="#ffb25c" stop-opacity="0"/></radialGradient></defs>
  <rect width="1200" height="420" fill="url(#sky)"/><g transform="translate(400 0)"><circle cx="470" cy="300" r="120" fill="url(#sun)" opacity=".7"/>
  <path d="M0 330 L60 300 L110 310 L170 280 L230 300 L260 330 Z" fill="#1a2140" opacity=".8"/>
  <rect x="540" y="196" width="200" height="140" fill="#141a33"/>${wins}
  <rect x="200" y="300" width="260" height="40" fill="#bfae8e"/><rect x="225" y="226" width="210" height="14" fill="#cdbb98"/>${cols}
  <rect x="255" y="190" width="150" height="40" fill="#cdbb98"/><path d="M262 192 Q330 92 398 192 Z" fill="#d8c7a3"/><rect x="322" y="96" width="16" height="28" fill="#d8c7a3"/><circle cx="330" cy="92" r="7" fill="#e6d6b4"/>
  <line x1="390" y1="40" x2="390" y2="150" stroke="#cfd6e4" stroke-width="2"/><path d="M391 42 Q420 36 448 44 L448 62 Q420 54 391 60 Z" fill="#2f6fe0"/><path d="M391 60 Q420 54 448 62 L448 80 Q420 72 391 78 Z" fill="#f2c230"/>
  <rect x="-400" y="336" width="1200" height="84" fill="#0a1222"/>
  <path d="M590 420 L600 300 Q606 262 640 252 L660 246 Q668 222 690 222 Q714 222 718 248 L738 254 Q770 266 774 300 L786 420 Z" fill="#0b0f18"/>
  <ellipse cx="690" cy="236" rx="22" ry="27" fill="#0b0f18"/><path d="M670 230 Q672 206 692 206 Q712 206 712 228 Q704 216 690 216 Q676 218 670 230 Z" fill="#16110d"/>
  </g><rect width="1200" height="420" fill="url(#fade)"/></svg>`}



function grabSetup(){const n=$('#f-name'),p=$('#f-party'),a=$('#f-age');if(n)SETUP.name=n.value.trim()||'Илья Руденко';if(p)SETUP.party=p.value.trim()||'Новый курс';if(a)SETUP.age=clamp(+a.value||48,35,75)}
function setupRefresh(){const el=$('#setup');if(el){const y=scrollY;el.innerHTML=setupInner();scrollTo(0,y)}}
A.bio=v=>{grabSetup();SETUP.bio=v;setupRefresh()};
A.days=v=>{grabSetup();SETUP.days=+v;setupRefresh()};
A.look=v=>{grabSetup();SETUP.look=+v;setupRefresh()};
A.goSetup=()=>{const el=$('#setup');if(el)el.scrollIntoView({behavior:'smooth'})};
A.howto=()=>modal(`<div class="mhead"><span class="kicker blue">Как играть</span><h2>Четыре стадии карьеры</h2></div><div class="mbody">
 <p><b>Кампания.</b> Каждую неделю у кандидата 3 часа (больше с руководителем кампании). Митинги и реклама работают в регионах, речи дают обещания, интервью и соцсети — узнаваемость.</p>
 <p><b>Деньги за голоса.</b> Раздача денег избирателям даёт быстрый прирост, особенно в бедных регионах. Каждая раздача копит риск огласки и скандала, повторные в том же регионе работают слабее.</p>
 <p><b>Партия.</b> Должности в древе фракции дают лояльность элиты и бонусы. Лояльность можно тратить на мобилизацию отделений. Во вкладке «Партия» можно подкупать людей из окружения соперников, но риск огласки растёт.</p>
 <p><b>Покушения.</b> Угрозы и нападения случаются редко. Охрана снижает последствия, а удачное решение превращает событие в сочувствие избирателей.</p>
 <p><b>Выборы.</b> 9 регионов, 538 выборщиков, для победы нужно 270. Ночью голоса подсчитываются вживую, лидер в регионе может смениться.</p>
 <p><b>Президентство.</b> 16 кварталов. Законы проходят через парламент (251 из 500), кризисы требуют решений, обещания отслеживаются.</p>
 <p><b>Вторые выборы.</b> Соперник процитирует каждое невыполненное обещание.</p>
 <p class="muted">Сохранение автоматическое.</p><button class="btn primary" data-a="close">Понятно</button></div>`);
document.addEventListener('change',e=>{if(e.target.id==='f-age'){grabSetup();setupRefresh()}});

/* ================= map (redesign) ================= */
const REG_COL=['#3f6fd8','#2c9a8a','#d9b23a','#8a4fd0','#5a8de6','#d0473f','#7a5bbf','#df7a2e','#2f8fcf'];
function mapSVG(colorFn,selIdx,act,labelFn){
  let s=`<svg class="map" viewBox="0 0 600 420" role="img" aria-label="Карта регионов Арданы"><defs><filter id="rsh" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".5"/></filter></defs>`;
  s+=`<text x="560" y="410" text-anchor="end" style="font:italic 13px var(--f-serif);fill:var(--dim)">Южное море</text>`;
  REG.forEach((R,i)=>{const pts=R.poly.split('').map(k=>VX[k].join(',')).join(' ');
    s+=`<polygon class="region ${i===selIdx?'sel':''}" points="${pts}" fill="${colorFn(i)}" filter="url(#rsh)" data-a="${act||'sel'}" data-v="${i}" tabindex="0"><title>${R.name}</title></polygon>`});
  REG.forEach((R,i)=>{const p=R.poly.split('').map(k=>VX[k]);const cx=p.reduce((a,b)=>a+b[0],0)/p.length,cy=p.reduce((a,b)=>a+b[1],0)/p.length;
    const lab=labelFn?labelFn(i):`<tspan class="ev">${R.ev} выб.</tspan>`;
    s+=`<g class="mlab" transform="translate(${cx} ${cy})"><rect x="-52" y="-26" width="104" height="44" rx="5" fill="rgba(6,12,24,.62)"/><text class="maplabel" y="-8">${R.name}</text><text class="maplabel sm" y="11">${lab}</text></g>`});
  return s+'</svg>'}
A.mapMode=v=>{S.mapMode=v;render()};
function mapBlock(){
  const i=S.sel,R=REG[i],s=polled(i),st=S.regions[i];
  const sm=salMap(R);const top=ISS.slice().sort((a,b)=>sm[b]-sm[a]);
  const acts=active().sort((a,b)=>s[b]-s[a]);const r=mainRival();
  const margin=s[acts[0]]-s[acts[1]];const lead=acts[0];
  const status=margin<3?'<span class="pill warn">Колеблется</span>':lead==='player'?'<span class="pill you">За вас</span>':`<span class="pill bad">За ${esc(S.c[lead].short)}</span>`;
  const mode=S.mapMode||'reg';
  const col=mode==='reg'?(j=>REG_COL[j]):(j=>leadColor(polled(j)));
  const lab=j=>{const q=polled(j);return `<tspan style="fill:#7fb2ff">${Math.round(q.player)}%</tspan>  <tspan style="fill:#ff7b70">${r?Math.round(q[r]):0}%</tspan>`};
  const icons={prices:'₴',health:'✚',jobs:'⚒',security:'⛨',ecology:'❦',education:'✎',corruption:'⚖'};
  return `<div class="row between"><h2>Карта страны</h2><div class="seg">${[['reg','Регионы'],['lead','Лидеры']].map(([k,l])=>`<button class="btn mini ${mode===k?'on':''}" data-a="mapMode" data-v="${k}">${l}</button>`).join('')}</div></div>
  <div class="legend" style="margin-top:6px"><span><i class="dot" style="background:#7fb2ff"></i>Вы</span>${r?`<span><i class="dot" style="background:#ff7b70"></i>${esc(S.c[r].short)}</span>`:''}${mode==='lead'?'<span class="dim">Цвет — лидер, насыщенность — отрыв</span>':''}</div>
  <div class="map-row"><div class="mapwrap">${mapSVG(col,i,'sel',lab)}</div>
  <aside class="rpanel"><div class="rp-head"><div class="eyebrow">${esc(R.desc)}</div><h3>${R.name}</h3>${status}</div>
   <div class="rp-list">
    <div><span>Население</span><b>${f1(R.pop)} млн</b></div><div><span>Выборщиков</span><b>${R.ev}</b></div><div><span>Явка (прогноз)</span><b>${R.turn}%</b></div><div><span>Ваши усилия</span><b>${f1(st.effort.player)}</b></div>
   </div>
   <div class="shares" style="margin-top:8px">${acts.map(c=>`<div class="sh"><span>${c==='player'?'<b>Вы</b>':esc(S.c[c].short)}</span><span class="bar"><i style="width:${s[c]}%;background:${S.c[c].color}"></i></span><span class="p">${pct(s[c])}</span></div>`).join('')}<div class="sh"><span class="muted">Не опр.</span><span class="bar"><i style="width:${s.und}%;background:var(--dim)"></i></span><span class="p">${pct(s.und)}</span></div></div>
   <div class="eyebrow" style="margin-top:10px">Главные проблемы</div>
   <div class="rp-list">${top.slice(0,5).map(x=>`<div><span><i class="ic">${icons[x]}</i>${ISSUES[x]}</span><b>${Math.round(sm[x]*100)}%</b></div>`).join('')}</div>
   <button class="btn primary" style="width:100%;text-align:center;margin-top:10px" data-a="rally" data-v="${i}">Провести митинг · ${money(COST.rally)}</button>
   <div class="rp-acts"><button class="btn mini" data-a="ad" data-v="${i}">Реклама ${money(COST.ad)}</button><button class="btn mini" data-a="neg" data-v="${i}">Негатив ${money(COST.neg)}</button>${S.camp.left<=35?`<button class="btn mini" data-a="gotv" data-v="${i}">Мобилизация ${f1(st.gotv)}</button>`:''}</div>
   ${st.flood?'<p class="up" style="font-size:12.5px;margin:6px 0 0">Регион ждёт вас после наводнения: митинг сильнее.</p>':''}
  </aside></div>`}

/* ================= campaign tabs (redesign) ================= */
function campTabs(){
  const t=S.tab;const tabs=[['actions','План недели'],['polls','Опросы'],['social','Соцсети'],['finance','Финансы'],['hq','Штаб'],['promises','Программа'],['econ','Экономика'],['news','Новости']];
  const f={actions:actionsTab,polls:pollsTab,social:socialTab,finance:financeTab,hq:hqTab,promises:promisesTab,econ:econTab,news:newsTab}[t]||actionsTab;
  return `<nav class="tabs" role="tablist">${tabs.map(([k,l])=>`<button class="tab ${t===k?'on':''}" data-a="tab" data-v="${k}" role="tab">${l}${k==='promises'&&cyclePromises().length?` <span class="badge">${cyclePromises().length}</span>`:''}${k==='finance'&&S.camp.offers&&S.camp.offers.length?` <span class="badge">${S.camp.offers.length}</span>`:''}</button>`).join('')}</nav>${f()}`}
function actionsTab(){
  const cp=S.camp;const deb=cp.debates.find(d=>!d.done);
  const dots=Array.from({length:cp.apMax},(_,i)=>`<i class="${i<cp.ap?'on':''}"></i>`).join('');
  const row=(a,label,cost,desc,dis,v)=>`<button class="plan-row" data-a="${a}" ${v!=null?`data-v="${v}"`:''} ${dis?'disabled':''}><span class="pr-l"><b>${label}</b><span>${desc}</span></span><span class="pr-c">${cost}</span></button>`;
  return `<div class="row between"><div><div class="eyebrow">Неделя ${cp.week+1}</div><h3>План на неделю</h3></div><div class="ap"><span class="muted">Время кандидата</span><span class="apdots">${dots}</span><b>${cp.ap}/${cp.apMax}</b></div></div>
  <div class="kv" style="margin:6px 0 10px"><span>Бюджет: <b>${money(S.budget)}</b></span>${deb?`<span>Дебаты №${deb.n}: <b>через ${Math.max(0,cp.left-deb.at)} дн.</b></span>`:''}<span>Регион выбран на карте: <b>${REG[S.sel].name}</b></span></div>
  <div class="plan">
   ${row('speech','Программная речь',money(COST.speech)+' · 1 ч','Обещание: голоса сейчас, обязательство потом')}
   ${row('interview','Интервью на ТВ','бесплатно · 1 ч','Вопрос о главной теме недели. Риск оговорки')}
   ${row('natad','Национальная ТВ-реклама',money(COST.natad)+' · 1 ч','+1,3 во всех регионах, узнаваемость +1,5')}
   ${row('tab','Публикация в соцсетях','$50 тыс. · 1 ч','TikTok, Instagram, YouTube, X','', 'social')}
   ${row('pollTabGo','Встреча с соцгруппой','$100 тыс. · 1 ч','Рабочие, пенсионеры, бизнес, студенты…')}
   ${row('fund','Ужин со сторонниками','· 1 ч','$0,5–1,3 млн в фонд кампании')}
   ${row('poll','Заказать опрос',money(COST.poll)+' · 0 ч','Точные данные по регионам на эту неделю')}
   ${row('oppo','Оппо-исследование',money(COST.oppo)+' · 1 ч',has('research')?'Найти компромат на соперника':'Нужна исследовательская команда',!has('research'))}
   ${rivalsActive().filter(c=>S.c[c].dirt).map(c=>row('leak','Слить компромат на '+esc(S.c[c].short),'$100 тыс. · 1 ч','Доверие к нему −5…9, или сохраните для дебатов','',c)).join('')}
  </div>
  <button class="btn primary big" style="width:100%;text-align:center;margin-top:12px" data-a="week">Подтвердить план · следующая неделя →</button>`}
A.pollTabGo=()=>{S.tab='polls';S.pollTab='grp';render()};
function hqTab(){
  const n=S.staff.length;const lvl=['Арендованная комната','Офис на этаже','Штаб-квартира','Штаб с ситуационным центром'][n<=1?0:n<=3?1:n<=6?2:3];
  const pay=S.staff.reduce((a,id)=>a+STAFF_BY[id].salary,0);const eff=clamp(35+n*6+(has('mgr_k')?12:has('mgr_s')?7:0),0,99);
  const filt=S.hqf||'all';const roles=[['all','Все'],['Руководитель кампании','Менеджмент'],['Специалист по рекламе','Реклама'],['SMM-команда','SMM'],['Политический аналитик','Аналитика']];
  const list=STAFF.filter(s=>filt==='all'||s.role===filt||(filt==='Политический аналитик'&&['Исследовательская команда','Пресс-секретарь','Полевая сеть','Фандрайзер'].includes(s.role)));
  return `<div class="hq-top"><div class="hq-pic">${hqSVG()}</div><div class="hq-stats"><div><span>Сотрудники</span><b>${n}/${STAFF.length}</b></div><div><span>Месячные расходы</span><b>${money(pay)}</b></div><div><span>Эффективность штаба</span><b>${eff}%</b></div><div><span>Помещение</span><b style="font-size:14px">${lvl}</b></div></div></div>
  <div class="tabs sub" style="margin-top:12px">${roles.map(([k,l])=>`<button class="tab ${filt===k?'on':''}" data-a="hqf" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="list">${list.map(s=>{const h=has(s.id);const taken=!h&&S.staff.some(id=>STAFF_BY[id].role===s.role);
    return `<div class="staff ${h?'hired':''}">${avatar(s.name,64,true)}<div style="min-width:0"><div class="row between"><b class="sname">${esc(s.name)}</b><span class="mono">${money(s.salary)}/мес</span></div><div class="eyebrow">${s.role} · опыт ${'●'.repeat(s.exp)}${'○'.repeat(5-s.exp)}</div>
    <div class="perks">${s.perks.map(p=>`<span class="up">${p}</span>`).join('')}${s.risk?`<span class="down">Риск скандалов +${s.risk}%</span>`:''}</div></div>
    ${h?`<button class="btn danger" data-a="fireStaff" data-v="${s.id}">Уволить</button>`:`<button class="btn ${taken?'':'primary'}" data-a="hire" data-v="${s.id}" ${taken?'disabled':''}>${taken?'Занято':'Нанять'}</button>`}</div>`}).join('')}</div>`}
A.hqf=v=>{S.hqf=v;render()};

/* ================= debate (redesign) ================= */



/* ================= vote result bar ================= */


/* ================= portraits ================= */
function hashStr(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const FEM=/^(Анна|Ольга|Елена|Сара|Нина|Кира|Лора|Марта|Вера|Ирина|Дана|Софья|Лиана|Катерина|Алина|Мира|Грета)/;
function avatar(name,size,big,look){
  const h=hashStr(name+(look!=null?'#'+look:''));const fem=look!=null?look>=4:FEM.test(name);
  const skins=['#f1c8a5','#e6b48f','#d39a72','#b97c56','#f5d3b8'],hairs=['#2a1d16','#4a3222','#6b4a2f','#1b1b1f','#8a8f99','#a8743f'];
  const sk=skins[h%5],hr=hairs[(h>>3)%6],suit=['#1d2b45','#25324a','#2e2e38','#1f3550'][(h>>6)%4],tie=['#c0392b','#2f6fe0','#7a1f3d','#d4a12a'][(h>>8)%4];
  const id='av'+h+(size||0);
  let s=`<svg width="${size}" height="${size}" viewBox="0 0 100 100" class="avatar-svg" aria-hidden="true" style="flex:0 0 auto;border-radius:${big?'10px':'50%'}"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4c7e"/><stop offset="1" stop-color="#0d1a30"/></linearGradient></defs><rect width="100" height="100" fill="url(#${id})"/>`;
  if(fem)s+=`<path d="M27 50 Q26 18 50 16 Q74 18 73 50 L76 78 L24 78 Z" fill="${hr}"/>`;
  s+=`<path d="M12 100 Q14 72 50 68 Q86 72 88 100 Z" fill="${suit}"/>`;
  s+=fem?`<path d="M40 70 L50 86 L60 70 Z" fill="#e9edf3"/>`:`<path d="M42 69 L50 84 L58 69 Z" fill="#f4f6fa"/><path d="M48 72 L52 72 L54 92 L50 96 L46 92 Z" fill="${tie}"/>`;
  s+=`<rect x="43" y="56" width="14" height="14" rx="4" fill="${sk}"/><ellipse cx="50" cy="42" rx="17" ry="20" fill="${sk}"/>`;
  s+=fem?`<path d="M32 40 Q34 20 52 21 Q68 22 68 40 Q60 30 46 30 Q38 31 32 40 Z" fill="${hr}"/>`:`<path d="M32 38 Q31 20 50 20 Q69 20 68 38 Q66 28 50 28 Q36 28 32 38 Z" fill="${hr}"/>`;
  s+=`<circle cx="43" cy="43" r="1.8" fill="#1a1a1a"/><circle cx="57" cy="43" r="1.8" fill="#1a1a1a"/><path d="M45 53 Q50 55.5 55 53" stroke="#8a4b3a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  return s+'</svg>'}

/* ================= social groups ================= */
const GROUPS=[
 {id:'youth',name:'Молодёжь (18–25)',w:{ecology:.3,education:.25,jobs:.2,prices:.15,corruption:.1},reg:{capital:1.4,tech:1.4,coast:1.1}},
 {id:'students',name:'Студенты',w:{education:.4,ecology:.25,prices:.15,corruption:.2},reg:{capital:1.5,tech:1.5}},
 {id:'biz',name:'Предприниматели',w:{prices:.25,jobs:.3,corruption:.3,security:.15},reg:{capital:1.2,coast:1.3,tech:1.2}},
 {id:'workers',name:'Рабочие',w:{jobs:.45,prices:.3,health:.15,security:.1},reg:{north:1.5,east:1.3,coast:1.1}},
 {id:'civil',name:'Госслужащие',w:{education:.2,health:.25,prices:.3,security:.25},reg:{capital:1.4,central:1.1}},
 {id:'pens',name:'Пенсионеры',w:{health:.45,prices:.4,security:.15},reg:{south:1.4,mountain:1.2,rural:1.2}},
 {id:'farm',name:'Фермеры',w:{prices:.35,jobs:.25,ecology:.2,security:.2},reg:{rural:1.7,south:1.4}},
 {id:'fam',name:'Семьи с детьми',w:{education:.35,health:.35,prices:.3},reg:{central:1.3,west:1.2}},
];
function groupSupport(g){
  const r=mainRival();const n=national(true);const gm=(S.gmod&&S.gmod[g.id])||0;
  let fp=0,fr=0;for(const i in g.w){fp+=g.w[i]*PL().issues[i];if(r)fr+=g.w[i]*S.c[r].issues[i]}
  const d=(fp-fr)*.22+gm;const p=clamp(n.player+d,0,100);return{p,r:r?clamp(n[r]-d*.8,0,100-p):0}}
A.meet=v=>{const g=GROUPS.find(x=>x.id===v);if(!spend(2,100e3))return;S.gmod=S.gmod||{};S.gmod[v]=(S.gmod[v]||0)+2.2;
  REG.forEach((R,i)=>S.regions[i].effort.player+=(g.reg[R.id]?1.2*g.reg[R.id]:.35));
  const top=Object.entries(g.w).sort((a,b)=>b[1]-a[1])[0][0];PL().issues[top]=Math.min(100,PL().issues[top]+2);
  news(`${PL().short} встретился с группой «${g.name}»`,'camp');toast(`Встреча: «${g.name}» +2,2. Сила в теме «${ISSUES[top]}» +2.`);after()};
function groupsTab(){
  const r=mainRival();
  return `<div class="row between"><h3>Социальные группы</h3><span class="muted">Встреча: $100 тыс. · 1 час</span></div>
  <div class="grp-head"><span></span><span>Ваша поддержка</span><span class="r">${r?esc(S.c[r].short):''}</span><span></span></div>
  <div class="list" style="gap:4px">${GROUPS.map(g=>{const s=groupSupport(g);return `<div class="grp"><span>${g.name}</span><span class="bar"><i style="width:${s.p}%"></i></span><span class="r num"><b class="${s.p>=s.r?'up':''}">${pct(s.p)}</b> <span class="down">${pct(s.r)}</span></span><button class="btn mini" data-a="meet" data-v="${g.id}">Встреча</button></div>`}).join('')}</div>
  <p class="muted" style="font-size:13px">Поддержка зависит от того, насколько ваши темы совпадают с интересами группы. Обещания и встречи сдвигают её.</p>`}

/* ================= social networks ================= */
const PLATS={tiktok:{name:'TikTok',youth:.85,reach:1.3,fit:{short:1.4,meme:1.3,serious:.6,interview:.7}},insta:{name:'Instagram',youth:.6,reach:1,fit:{short:1.2,qa:1.2}},yt:{name:'YouTube',youth:.45,reach:.9,fit:{interview:1.4,serious:1.2,meme:.8}},x:{name:'X (Twitter)',youth:.3,reach:.6,fit:{attack:1.3,serious:1.1,short:.7}}};
const CONTENT={short:{name:'Короткое видео',rec:1.6,trust:0,eff:.6},interview:{name:'Интервью',rec:.6,trust:.8,eff:.5},serious:{name:'Серьёзное обращение',rec:.4,trust:1.2,eff:.5},meme:{name:'Мем',rec:2.2,trust:-.3,eff:.7,risk:.2},attack:{name:'Атака на оппонента',rec:.8,trust:-.8,eff:0,attack:1},qa:{name:'Ответы на вопросы',rec:.8,trust:1,eff:.6}};
const kfmt=v=>v>=1e6?f1(v/1e6)+'M':v>=1e3?Math.round(v/1e3)+'K':String(Math.round(v));
function snState(){S.sn=S.sn||{plat:'tiktok',type:'short',last:null};return S.sn}
A.snPlat=v=>{snState().plat=v;render()};A.snType=v=>{snState().type=v;render()};
A.snPost=()=>{const sn=snState(),P=PLATS[sn.plat],C=CONTENT[sn.type];if(!spend(1,50e3))return;
  const fit=P.fit[sn.type]||1,sm=1+fx('smm')*.6;const q=rnd(.6,1.4);
  const views=rnd(40,140)*1e3*P.reach*fit*sm*q*(PL().rec/60);
  recUp(C.rec*fit*sm*.8);if(C.trust>0)gain(C.trust*fit*.8);else if(C.trust<0)hurt(-C.trust*fit,.5);
  REG.forEach((R,i)=>S.regions[i].effort.player+=C.eff*fit*sm*(.6+R.youth*P.youth*3));
  S.gmod=S.gmod||{};S.gmod.youth=(S.gmod.youth||0)+P.youth*1.4*fit;S.gmod.students=(S.gmod.students||0)+P.youth*fit;
  let note='';const r=mainRival();
  if(C.attack&&r){addEffortAll(r,-1*fit);S.c[r].trust=clamp(S.c[r].trust-1.5*fit,10,90);note=`Ролик про ${S.c[r].short} разошёлся. `}
  if(C.risk&&Math.random()<C.risk*(has('smm')?.5:1)){const d=hurt(2.5);note+=`Мем поняли не так: доверие −${f1(d)}. `;news(`Мем из аккаунта ${PL().short} вызвал скандал`,'gaffe')}
  sn.last={scene:(typeof snScene==='function'?snScene(sn.type,sn.plat):null),ph:ri(0,16),views,likes:views*rnd(.025,.07),shares:views*rnd(.004,.012),plat:sn.plat,type:sn.type,good:q>1};sn.hist=[sn.last,...(sn.hist||[])].slice(0,5);
  news(`${C.name} ${PL().short} в ${P.name}: ${kfmt(views)} просмотров`,'camp');toast(note+`${kfmt(views)} просмотров в ${P.name}.`);after()};
function socialTab(){
  const sn=snState(),P=PLATS[sn.plat],L=sn.last;
  return `<div class="tabs sub">${Object.entries(PLATS).map(([k,p])=>`<button class="tab ${sn.plat===k?'on':''}" data-a="snPlat" data-v="${k}">${p.name}</button>`).join('')}</div>
  <div class="sn-grid"><div class="post">
    <div class="post-frame">${avatar(S.name,150,true,S.look)}<div class="post-side"><span>♥ ${L?kfmt(L.likes):'—'}</span><span>✉ ${L?kfmt(L.likes/9):'—'}</span><span>↗ ${L?kfmt(L.shares):'—'}</span></div>
    <div class="post-cap">${L?`${CONTENT[L.type].name} · ${PLATS[L.plat].name} · <b>${kfmt(L.views)}</b> просмотров`:'Последняя публикация появится здесь'}</div></div></div>
  <div><div class="eyebrow" style="margin-bottom:6px">Тип контента</div><div class="radios">${Object.entries(CONTENT).map(([k,c])=>{const f=P.fit[k]||1;return `<button class="radio ${sn.type===k?'on':''}" data-a="snType" data-v="${k}"><i></i>${c.name}${f>1?' <span class="up">▲</span>':f<1?' <span class="down">▼</span>':''}</button>`}).join('')}</div>
   <button class="btn primary" style="width:100%;text-align:center;margin-top:10px" data-a="snPost">Опубликовать · $50 тыс. · 1 час</button>
   <p class="muted" style="font-size:12.5px;margin:8px 0 0">▲ формат хорошо работает на этой платформе. ${P.name}: доля молодёжи ${Math.round(P.youth*100)}%.${has('smm')?' SMM-команда увеличивает охват на 60%.':' Наймите SMM-команду, чтобы увеличить охват.'}</p></div></div>`}

/* ================= financing ================= */
const DONORS=[
 {name:'Корпорация «GlobalTech»',kind:'Крупные доноры',amt:2e6,tag:'Риск скандала',risk:2},
 {name:'Холдинг «Магистраль»',kind:'Крупные доноры',amt:1.5e6,tag:'Риск скандала',risk:3},
 {name:'Банк «Приморский»',kind:'Крупные доноры',amt:1.8e6,tag:'Риск скандала',risk:2},
 {name:'Ассоциация «Ардания-Экспорт»',kind:'Бизнес',amt:.5e6,tag:'Нейтрально',risk:0,g:{biz:1}},
 {name:'Агрохолдинг «Южный колос»',kind:'Бизнес',amt:1e6,tag:'Фермеры +1, небольшой риск',risk:1,g:{farm:1}},
 {name:'Частные доноры, 12 400 человек',kind:'Граждане',amt:.25e6,tag:'+ Доверие',risk:0,trust:.6},
 {name:'Профсоюз металлургов',kind:'Граждане',amt:.4e6,tag:'Рабочие +1,5, бизнес −1',risk:0,g:{workers:1.5,biz:-1}},
 {name:'Фонд «Зелёное будущее»',kind:'Граждане',amt:.6e6,tag:'Молодёжь +1',risk:0,g:{youth:1}},
];
function genOffers(){const pool=DONORS.slice().sort(()=>Math.random()-.5).slice(0,3);S.camp.offers=pool.map(d=>Object.assign({},d,{amt:Math.round(d.amt*rnd(.8,1.25)/1e4)*1e4}));S.camp.refused=false}
A.offer=v=>{const o=S.camp.offers[+v];if(!o)return;S.budget+=o.amt;if(o.risk)S.flags.donorRisk=(S.flags.donorRisk||0)+o.risk;if(o.trust)gain(o.trust);
  if(o.g){S.gmod=S.gmod||{};for(const k in o.g)S.gmod[k]=(S.gmod[k]||0)+o.g[k]}
  S.camp.offers.splice(+v,1);news(`${o.name} перечислил${o.kind==='Граждане'?'и':''} ${money(o.amt)} в фонд кампании ${PL().short}`,'money');toast(`+${money(o.amt)}.`);after()};
A.refuseAll=()=>{if(S.camp.refused)return;S.camp.refused=true;const big=S.camp.offers.some(o=>o.risk);S.camp.offers=[];gain(big?1.2:.4);toast(`Вы отказались от всех предложений. Доверие +${big?'1,2':'0,4'}.`);after()};
function financeTab(){
  const cp=S.camp;if(!cp.offers)genOffers();
  return `<div class="row between"><h3>Финансирование</h3><span class="muted">Бюджет: <b style="color:var(--text)">${money(S.budget)}</b></span></div>
  <div class="kv" style="margin:4px 0 10px"><span>Доходы за неделю: <b>${money(cp.lastIncome)}</b></span><span>Зарплаты: <b>${money(cp.lastSalary)}</b></span><span>Накопленный риск доноров: <b class="${(S.flags.donorRisk||0)>3?'down':''}">${S.flags.donorRisk||0}</b></span></div>
  <div class="list">${cp.offers.length?cp.offers.map((o,i)=>`<div class="item row between"><div><b>${esc(o.name)}</b><div class="eyebrow">${o.kind}</div><span class="${o.risk?'down':'up'}" style="font-size:13px">${o.tag}</span></div><div class="row"><b class="num" style="font-size:18px">${money(o.amt)}</b><button class="btn good" data-a="offer" data-v="${i}">Принять</button></div></div>`).join(''):'<p class="muted">Новые предложения появятся на следующей неделе.</p>'}</div>
  <div class="row between" style="margin-top:10px"><button class="btn act" data-a="fund" style="width:auto"><b>Ужин со сторонниками</b><span class="c">1 час</span></button>${cp.offers.length&&!cp.refused?'<button class="btn ghost" data-a="refuseAll">Отказаться от всех предложений · + репутация</button>':''}</div>`}

/* ================= polls tab ================= */
function pollsTab(){
  const sub=S.pollTab||'nat';const n=national(true);const h=S.camp.hist;const prev=h.length>1?h[h.length-2]:h[0];
  let body='';
  if(sub==='nat')body=`<div class="poll-grid">${trendChart()}<div class="list" style="gap:6px">${active().sort((a,b)=>n[b]-n[a]).map(c=>`<div class="row between"><span><i class="dot" style="background:${S.c[c].color}"></i>${esc(S.c[c].short)}</span><b class="num">${pct(n[c])} ${arrow(n[c]-(prev[c]||0))}</b></div>`).join('')}<div class="row between muted"><span><i class="dot" style="background:var(--dim)"></i>Не определились</span><b class="num">${pct(n.und)}</b></div><div class="muted" style="font-size:12px">Погрешность ±${f1(pollErr())}%</div></div></div>`+rivalsTab();
  else if(sub==='reg'){const r=mainRival();body=`<div class="tblwrap"><table class="tbl"><tr><th>Регион</th><th class="r">Выб.</th><th class="r">Вы</th><th class="r">${r?esc(S.c[r].short):''}</th><th class="r">Не опр.</th><th></th></tr>${REG.map((R,i)=>{const s=polled(i);const m=s.player-(r?s[r]:0);return `<tr><td><button class="linkbtn" data-a="sel" data-v="${i}">${R.name}</button></td><td class="r">${R.ev}</td><td class="r" style="color:var(--you)">${pct(s.player)}</td><td class="r" style="color:var(--rival)">${r?pct(s[r]):''}</td><td class="r">${pct(s.und)}</td><td>${Math.abs(m)<3?'<span class="pill warn">колеблется</span>':m>0?'<span class="pill you">ваш</span>':'<span class="pill bad">чужой</span>'}</td></tr>`}).join('')}</table></div>`}
  else body=groupsTab();
  return `<div class="tabs sub">${[['nat','Национальный'],['reg','Регионы'],['grp','Соцгруппы']].map(([k,l])=>`<button class="tab ${sub===k?'on':''}" data-a="pollTab" data-v="${k}">${l}</button>`).join('')}</div>${body}`}
A.pollTab=v=>{S.pollTab=v;render()};

/* ================= news tab (broadcast) ================= */

const tagName=t=>({econ:'Экономика',scandal:'Скандал',gaffe:'Скандал',poll:'Опросы',pres:'Власть',rival:'Соперники',camp:'Кампания',promise:'Обещания',money:'Финансы'}[t]||'Новости');

/* ================= debate timer ================= */
let DBT=0;
function debTimerStart(def){clearInterval(DBT);let t=20;const el=()=>$('#deb-t');if(el())el().textContent='00:'+String(t).padStart(2,'0');
  DBT=setInterval(()=>{t--;if(!el()){clearInterval(DBT);return}el().textContent='00:'+String(Math.max(0,t)).padStart(2,'0');if(t<=5)el().classList.add('urgent');if(t<=0){clearInterval(DBT);A.debPick(def,null,null,true)}},1000)}
document.addEventListener('keydown',e=>{if(!DB||!$('#deb-t'))return;const n=+e.key;if(n>=1&&n<=4){const b=document.querySelectorAll('[data-a="debPick"]')[n-1];if(b)b.click()}});

/* ================= election day & night ================= */
let TIMERS=[];
function stopTimers(){TIMERS.forEach(t=>{clearInterval(t);clearTimeout(t)});TIMERS=[];confettiStop()}
function computeResults(){
  const act=active();const natErr=gauss()*1.1;const smm=has('smm')?1:0;
  const youthPull=(PL().issues.ecology+PL().issues.education)/2>40?1:0;
  const regions=REG.map((R,i)=>{
    const s=shares(i);const v={};let t=0;
    act.forEach(c=>{v[c]=s[c]*(1+gauss()*.025);if(c==='player')v[c]*=1+natErr/100+S.regions[i].gotv*.007+smm*R.youth*.03;t+=v[c]});
    act.forEach(c=>v[c]=v[c]/t*100);
    const turnout=clamp(R.turn+S.regions[i].gotv*.8+(smm+youthPull)*R.youth*5+rnd(-3,3),45,84);
    const votes=Math.round(R.pop*1e6*.77*turnout/100);
    const winner=act.reduce((a,b)=>v[a]>=v[b]?a:b);
    return{share:v,turnout,votes,winner,bias:rnd(-3.4,3.4),start:R.report*2+ri(0,2),spd:rnd(1.3,3.1)};
  });
  const youthT=smm+youthPull;
  return{regions,youthT,act};
}
/* ---- election day ---- */
let ED=null;

function startEday(){
  stopTimers();
  if(!S.result){S.result=computeResults();save()}
  const r=S.result;let V=0,T=0;r.regions.forEach((x,i)=>{T+=x.votes;V+=REG[i].pop*1e6*.77});const fin=T/V*100;
  const ys=r.youthT>=1;const pYouth=(PL().issues.ecology+PL().issues.education)/2>=(S.c[r.act.find(c=>c!=='player')]?.issues.ecology||0);
  const steps=[['07:00',0,'Избирательные участки открылись. Штаб пьёт третий кофе.'],['10:00',.2,`Явка ${pct(fin*.2)}. Пенсионеры пришли первыми, как всегда.`],['13:00',.46,ys?'Высокая явка среди молодёжи. Аналитик: «Это наши люди».':'Молодёжь пока не спешит. Аналитик нервничает.'],['16:00',.74,`Явка ${pct(fin*.74)}. В Вестленде очереди у участков.`],['19:00',.97,'Последний час. Волонтёры звонят тем, кто ещё не проголосовал.'],['20:00',1,`Участки закрыты. Итоговая явка — ${pct(fin)}. Начинается подсчёт.`]];
  if(ys&&!pYouth)steps[2][2]='Высокая явка среди молодёжи. Аналитик хмурится: молодёжь больше любит соперника.';
  ED={i:0,steps,fin};
  const yt=clamp(48+r.youthT*9+rnd(-4,4),35,80);const grp=[['Молодёжь',yt],['Старшие',clamp(fin+10+rnd(-3,3),40,85)],['Города',clamp(fin+3+rnd(-3,3),40,85)],['Сельская местность',clamp(fin-6+rnd(-3,3),35,80)]];
  ED.grp=grp;
  const tick=()=>{if(!$('#ed-turn'))return;const st=ED.steps[ED.i];$('#ed-clock').textContent=st[0];
    $('#ed-turn').innerHTML=ED.steps.slice(1).map(s=>`<div class="tline"><span class="mono">${s[0]}</span><span class="bar"><i style="width:${ED.steps.indexOf(s)<=ED.i?s[1]*ED.fin:0}%"></i></span><span class="mono">${ED.steps.indexOf(s)<=ED.i?pct(s[1]*ED.fin):'—'}</span></div>`).join('');
    $('#ed-feed').insertAdjacentHTML('afterbegin',`<div class="${ED.i===ED.steps.length-1?'call':''}"><b class="mono">${st[0]}</b> ${st[2]}</div>`);
    const fr=ED.steps[Math.min(ED.i,ED.steps.length-1)][1];$('#ed-grp').innerHTML=ED.grp.map(g=>`<div class="tline"><span style="font-size:12.5px">${g[0]}</span><span class="bar"><i style="width:${g[1]*fr}%;background:var(--you)"></i></span><span class="mono">${pct(g[1]*fr)}</span></div>`).join('');
    ED.i++;if(ED.i>=ED.steps.length){TIMERS.forEach(clearInterval);$('#ed-btns').innerHTML='<button class="btn primary big" data-a="toNight">Ночь выборов →</button>'}};
  tick();TIMERS.push(setInterval(tick,1500));
}
A.edSkip=()=>{if(!ED)return;while(ED.i<ED.steps.length){const st=ED.steps[ED.i];$('#ed-feed').insertAdjacentHTML('afterbegin',`<div><b class="mono">${st[0]}</b> ${st[2]}</div>`);ED.i++}stopTimers();$('#ed-clock').textContent='20:00';
  $('#ed-turn').innerHTML=ED.steps.slice(1).map(s=>`<div class="tline"><span class="mono">${s[0]}</span><span class="bar"><i style="width:${s[1]*ED.fin}%"></i></span><span class="mono">${pct(s[1]*ED.fin)}</span></div>`).join('');$('#ed-btns').innerHTML='<button class="btn primary big" data-a="toNight">Ночь выборов →</button>';
  $('#ed-grp').innerHTML=ED.grp.map(g=>`<div class="tline"><span style="font-size:12.5px">${g[0]}</span><span class="bar"><i style="width:${g[1]}%;background:var(--you)"></i></span><span class="mono">${pct(g[1])}</span></div>`).join('')};
A.toNight=()=>{stopTimers();S.phase='night';save();render()};

/* ---- election night ---- */
let NT=null;

function startNight(){
  stopTimers();
  const r=S.result;
  NT={t:0,speed:1,acc:0,rep:r.regions.map(()=>0),called:r.regions.map(()=>null),lead:r.regions.map(()=>null),sel:REGI('west'),done:false,announced:false,ev:{}};
  r.act.forEach(c=>NT.ev[c]=0);
  feed('20:00 · Участки закрыты. Добро пожаловать в студию «Ардания-24».',true);
  feed(`Для победы нужно 270 голосов выборщиков из 538.`);
  drawNight();
  TIMERS.push(setInterval(()=>{if(!NT||NT.done&&NT.announced)return;NT.acc+=NT.speed;while(NT.acc>=1){NT.acc-=1;nightTick()}drawNight()},700));
}
function feed(t,call){const f=$('#nt-feed');if(f)f.insertAdjacentHTML('afterbegin',`<div class="${call?'call':''}">${t}</div>`)}
function ntClock(){const m=20*60+NT.t*5;const h=Math.floor(m/60)%24,mm=m%60;return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0')}
function dispShare(i){
  const x=S.result.regions[i],rep=NT.rep[i]/100;const o={};const b=x.bias*(1-rep);
  const others=S.result.act.filter(c=>c!=='player');const ot=others.reduce((a,c)=>a+x.share[c],0)||1;
  o.player=x.share.player+b;others.forEach(c=>o[c]=x.share[c]-b*x.share[c]/ot);return o}
function nightTick(){
  if(NT.done)return;NT.t++;
  const r=S.result;
  r.regions.forEach((x,i)=>{
    if(NT.t<x.start||NT.rep[i]>=100)return;
    if(NT.rep[i]===0)feed(`${ntClock()} · ${REG[i].name}: пошли первые данные.`);
    NT.rep[i]=Math.min(100,NT.rep[i]+x.spd*rnd(.5,1.5));
    const d=dispShare(i);const ord=r.act.slice().sort((a,b)=>d[b]-d[a]);const lead=ord[0];
    if(NT.lead[i]&&NT.lead[i]!==lead&&NT.rep[i]>30&&!NT.called[i])feed(`${ntClock()} · <b>${REG[i].name}</b>: подсчитано ${Math.round(NT.rep[i])}% — ${esc(S.c[lead].short)} выходит вперёд!`,true);
    NT.lead[i]=lead;
    if(!NT.called[i]&&NT.rep[i]>=15){const m=d[ord[0]]-d[ord[1]];if(m>7.5*(1-NT.rep[i]/100)+.3||NT.rep[i]>=100){NT.called[i]=lead;NT.ev[lead]+=REG[i].ev;
      feed(`${ntClock()} · <b>«Ардания-24» объявляет: ${REG[i].name} — ${esc(S.c[lead].name)}</b> (+${REG[i].ev})`,true)}}
  });
  const win=r.act.find(c=>NT.ev[c]>=270);
  if(win&&!NT.announced){NT.announced=true;NT.winner=win;announce(win)}
  if(NT.called.every(Boolean)){NT.done=true;if(!NT.announced){const w=r.act.reduce((a,b)=>NT.ev[a]>=NT.ev[b]?a:b);NT.announced=true;NT.winner=w;announce(w,true)}}
}
function announce(w,noMaj){
  const k=S.c[w];const won=w==='player';
  feed(`${ntClock()} · <b>${esc(k.name.toUpperCase())} ${S.camp.reelect&&won?'ПЕРЕИЗБРАН':'ИЗБРАН'}${k.fem?'А':''} ПРЕЗИДЕНТОМ</b>`,true);
  $('#nt-banner').innerHTML=`<div class="banner ${won?'win':''}"><small>Ардания-24 · ${noMaj?'по большинству выборщиков':'прогноз'}</small>${esc(k.name)} ${won&&S.camp.reelect?(k.fem?'переизбрана':'переизбран'):(k.fem?'избрана':'избран')} президентом</div><div class="row" style="margin-top:10px;justify-content:center"><button class="btn primary big" data-a="nightEnd">${won?'В штаб, к сторонникам →':'Признать результат →'}</button></div>`;
  if(won)confettiStart();
}

A.ntSel=v=>{if(NT){NT.sel=+v;drawNight()}};
A.ntSpeed=(v,el)=>{if(!NT)return;NT.speed=+v;document.querySelectorAll('#nt-speed .btn').forEach(b=>b.classList.toggle('on',b===el))};
A.nightEnd=()=>{
  const r=S.result,w=NT.winner;stopTimers();
  // finish counting
  let T=0;const pv={};r.act.forEach(c=>pv[c]=0);const ev={};r.act.forEach(c=>ev[c]=0);
  r.regions.forEach((x,i)=>{T+=x.votes;r.act.forEach(c=>pv[c]+=x.votes*x.share[c]/100);ev[x.winner]+=REG[i].ev});
  r.act.forEach(c=>pv[c]=pv[c]/T*100);
  const rival=r.act.filter(c=>c!=='player').sort((a,b)=>ev[b]-ev[a]||pv[b]-pv[a])[0];
  const won=w==='player';
  S.last={won,ev,pv,rival,rivalName:S.c[rival].name,year:new Date(S.camp.date).getUTCFullYear(),turnout:T/REG.reduce((a,R)=>a+R.pop*1e6*.77,0)*100,reelect:S.camp.reelect};
  S.career.elections.push({year:S.last.year,won,evP:ev.player,evR:ev[rival],pvP:pv.player,pvR:pv[rival],rival:S.c[rival].name,reelect:S.camp.reelect});
  S.phase=won?'victory':'defeat';S.result=null;NT=null;save();render();if(won)confettiStart();
};

/* ---- confetti ---- */
let CF=null;
function confettiStart(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const cv=$('#confetti');cv.hidden=false;const ctx=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;
  const cols=['#4a90ff','#f4b740','#ffffff','#41c98b'];const ps=Array.from({length:180},()=>({x:Math.random()*cv.width,y:-Math.random()*cv.height,vx:rnd(-1,1),vy:rnd(2,5),r:rnd(4,8),c:pick(cols),a:rnd(0,6)}));
  let n=0;cancelAnimationFrame(CF);
  const f=()=>{ctx.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.a+=.1;if(p.y>cv.height&&n<400)p.y=-10;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.a);ctx.fillStyle=p.c;ctx.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);ctx.restore()});n++;if(n<700)CF=requestAnimationFrame(f);else confettiStop()};f();
}
function confettiStop(){cancelAnimationFrame(CF);const cv=$('#confetti');if(cv){cv.hidden=true}}

/* ---- victory / speech ---- */

A.speechV=v=>{
  confettiStop();const L=S.last;const m=L.pv.player-L.pv[L.rival];
  const ap={unity:4,aggr:-2,reform:1}[v],cap={unity:0,aggr:12,reform:6}[v];
  S.flags.speech=v;S.flags.startApproval=clamp(50+m*.45+ap+rnd(-2,2),35,72);S.flags.startCapital=50+cap;
  news(`${S.name} ${L.reelect?'переизбран':'избран'} президентом Арданы`,'pres');
  news({unity:'Президент в победной речи: «Сегодня победила вся страна»',aggr:'Президент: «Народ отверг старую систему»',reform:'Президент: «Завтра начинается новая эпоха реформ»'}[v],'pres');
  if(L.reelect){startTerm(2);S.phase='presidency'}else{S.phase='cabinet';S.cabSel={}}
  save();render();
};

A.concede=v=>{S.flags.concede=v;if(S.pres&&S.pres.termNo)finalizeTerm(true);S.phase='legacy';save();render()};

/* ---- cabinet ---- */

A.cab=v=>{const [p,j]=v.split(':');S.cabSel[p]=+j;const y=scrollY;render();scrollTo(0,y)};
A.cabDone=()=>{const mins={};POSTS.forEach(p=>{const m=MINISTERS[p.id][S.cabSel[p.id]];mins[p.id]=Object.assign({},m,{post:p.id})});S.ministers=mins;startTerm(1);S.phase='presidency';save();render();scrollTo(0,0)};

/* ================= presidency ================= */
const CR={};
const QN=['I','II','III','IV'];
function qLabel(q){const base=S.pres&&S.pres.termNo===2?2033:2029;return QN[q%4]+' кв. '+(base+Math.floor(q/4))}
const MIN=p=>S.ministers[p];
const adv=(post,say)=>({role:POSTS.find(x=>x.id===post).name,who:MIN(post).name,say});
const POLLSTER=say=>({role:'Советник по рейтингу',who:'Кира Вайс',say});
function approve(v){const G=S.pres;G.approval=clamp(G.approval+v,12,88);G.goodwill+=v*.6}
function capital(v){const G=S.pres;G.capital=clamp(G.capital+v,0,100)}
function debtAdd(v){S.econ.debt+=v}
function debtPct(){return S.econ.debt/S.econ.gdp*100}

function startTerm(n){
  const L=S.last;const pvP=L.pv.player,pvR=L.pv[L.rival];
  const pres=clamp(Math.round(500*pvP/100*.86+gauss()*8),150,300);
  const opp=clamp(Math.round(500*pvR/100*.8+gauss()*8),120,280);
  const a0=S.flags.startApproval;
  S.pres={termNo:n,cycle:S.cycle,q:0,approval:a0,capital:S.flags.startCapital,ap:2,goodwill:a0-50,
    hist:[{v:a0,note:'Инаугурация'}],parl:{pres,opp,cen:500-pres-opp},oppParty:S.c[L.rival].party,oppColor:S.c[L.rival].color,
    passed:[],failed:[],attempts:{},projects:Object.fromEntries(Object.keys(PROJECTS).map(k=>[k,{built:0,funded:false}])),decrees:[],crises:[],pending:[],
    econStart:Object.assign({},S.econ),debtStart:S.econ.debt/S.econ.gdp*100,rerun:null,addrQ:-1,tripQ:-1,qnote:'',finalized:false,tab:'overview',scandal:0};
  S.flags.taxRaised=false;S.econ.recession=false;S.econ.shock=0;
  news(`Инаугурация: ${S.name} вступил в должность президента`,'pres');
  news(`Новый парламент: партия «${S.party}» — ${pres} мест, «${S.pres.oppParty}» — ${opp}, центристы — ${500-pres-opp}`,'pres');
}

/* ---- promise evaluation ---- */
function promStatus(p,final){
  const d=PROM_BY[p.id],G=S.pres,e=S.econ;
  if(!G)return{s:'wait',t:'ждёт победы'};
  if(d.type==='law'){if(G.passed.includes(d.law))return{s:'done',t:'закон принят'};if(G.attempts[d.law])return{s:final?'fail':'prog',t:'закон провален в парламенте',line:'Закон так и не принят.'};return{s:final?'fail':'wait',t:'закон не внесён',line:'Закон даже не вносился в парламент.'}}
  if(d.type==='project'){const pr=G.projects[d.proj],tg=PROJECTS[d.proj].target;if(pr.built>=tg)return{s:'done',t:`${tg}/${tg}`};return{s:final?'fail':pr.built?'prog':'wait',t:`${pr.built}/${tg}`,line:`Построено только ${pr.built}.`}}
  if(d.type==='target'){
    if(p.id==='infl3'){const ok=e.infl<=3.05;return{s:ok?'done':final?'fail':'prog',t:`сейчас ${pct(e.infl)}`,line:`Инфляция сейчас ${pct(e.infl)}.`}}
    if(p.id==='jobs500'){const goal=G.econStart.unemp-1.2;const ok=e.unemp<=goal;const jobs=Math.max(0,Math.round((G.econStart.unemp-e.unemp)*400))*1000;return{s:ok?'done':final?'fail':'prog',t:`создано ~${num(jobs)}`,line:`Создано около ${num(jobs)} рабочих мест.`}}}
  if(d.type==='pledge'){
    if(p.id==='nodebt'){const ok=debtPct()<=G.debtStart+.5;return{s:ok?'done':'fail',t:`долг ${pct(debtPct())} ВВП`,line:`Долг вырос до ${pct(debtPct())} ВВП.`}}
    if(p.id==='notax'){return S.flags.taxRaised?{s:'fail',t:'налоги повышены',line:'Налоги были повышены.'}:{s:'done',t:'налоги не повышались'}}}
  if(d.type==='decree')return G.decrees.includes(p.id)?{s:'done',t:'указ подписан'}:{s:final?'fail':'wait',t:'указ не подписан',line:'Указ так и не подписан.'};
  return{s:'wait',t:''};
}
function termPromises(){return S.pres?cyclePromises(S.pres.cycle):[]}
function keptNow(){return termPromises().filter(p=>promStatus(p).s==='done').length}
function termRec(cy){return S.career.terms.find(t=>t.cycle===cy)}
function brokenPromises(cy){const t=termRec(cy);return t?t.promises.filter(p=>p.s!=='done'):[]}
function keptRatio(cy){const t=termRec(cy);return t&&t.promises.length?t.kept/t.promises.length:.5}
function promiseLine(p){return p.line||'Обещание не выполнено.'}
const ST_MARK={done:'✓',prog:'…',fail:'✕',wait:'·'};
const stMark=s=>`<span class="st ${s}">${ST_MARK[s]}</span>`;

/* ---- quarter simulation ---- */
function econQuarter(){
  const e=S.econ;const ec=MIN('eco').comp,fc=MIN('fin').comp;
  const target=e.trend+(ec-75)/60+(e.shock||0);
  e.growth=clamp(e.growth+(target-e.growth)*.5+gauss()*.25,-5,6);e.shock=(e.shock||0)*.5;
  e.unemp=clamp(e.unemp-(e.growth-1.8)*.18+gauss()*.08,2.5,15);
  e.energy=clamp(e.energy+(100-e.energy)*.15+gauss()*3,60,220);
  e.infl=clamp(e.infl+(2.6+(e.energy-100)/25+(e.growth-2)*.3-(e.rate-4)*.35-e.infl)*.3+gauss()*.15,-1,15);
  e.rate=clamp(e.rate+(e.infl-2.5)*.15,.5,12);
  const nom=(e.growth+e.infl)/400;e.gdp*=1+nom;e.revenue*=1+nom;e.spending*=1+e.infl/400;
  const spend=e.spending*(1-(fc-75)/2000);e.debt+=(spend-e.revenue)/4;
}
function projectsQuarter(){
  const G=S.pres;for(const k in PROJECTS){const P=PROJECTS[k],pr=G.projects[k];if(!pr.funded)continue;
    let b=ri(P.rate[0],P.rate[1])+(MIN(P.post).comp>82?1:0);b=Math.min(b,P.target-pr.built);pr.built+=b;debtAdd(b*P.cost);
    if(pr.built>=P.target){pr.funded=false;news(`Завершено: ${P.name.toLowerCase()} — ${P.target} ${P.unit}`,'pres');approve(2);G.qnote=G.qnote||`${P.target} ${P.unit}`}}
}
function approvalQuarter(){
  const G=S.pres,e=S.econ;const reps=POSTS.map(p=>MIN(p.id).rep);const avg=reps.reduce((a,b)=>a+b,0)/reps.length;
  const target=48+(e.growth-1.5)*2.5-(e.unemp-5.5)*2.2-(e.infl-3)*1.6+G.goodwill+(avg-72)/4+keptNow()*.7-G.scandal;
  G.approval=clamp(G.approval+(target-G.approval)*.35+gauss(),12,88);
  G.goodwill*=.82;G.scandal*=.7;
  capital((G.approval-45)/4+2);
}
function endQuarter(){
  if(S.queue.length)return pump();
  const G=S.pres;
  econQuarter();projectsQuarter();approvalQuarter();
  if(G.q===0&&!G.qnote)G.qnote='100 дней';
  G.hist.push({v:G.approval,note:G.qnote});G.qnote='';
  G.q++;G.ap=2;
  news(`Опрос: деятельность президента одобряют ${pct(G.approval)}`,'poll');
  G.pending=G.pending.filter(x=>{if(x.q<=G.q){S.queue.push({id:x.id,p:x.p});return false}return true});
  // transitions
  if(G.termNo===1&&G.rerun&&G.q===14){S.queue.push({id:'camp2'});save();render();pump();return}
  if(G.q>=16){S.queue.push({id:'termEnd'});save();render();pump();return}
  if(G.termNo===1&&G.q===12&&G.rerun===null)S.queue.push({id:'rerun'});
  if(Math.random()<.42){const pool=Object.keys(CR).filter(k=>CR[k].w&&(!CR[k].cond||CR[k].cond())&&G.lastCrisis!==k);
    let t=pool.reduce((a,k)=>a+CR[k].w,0),r=Math.random()*t;for(const k of pool){r-=CR[k].w;if(r<=0){G.lastCrisis=k;S.queue.push({id:k,p:CR[k].params?CR[k].params():{}});break}}}
  const disloyal=POSTS.filter(p=>MIN(p.id).loy<60);if(disloyal.length&&Math.random()<.18)S.queue.push({id:'mconflict',p:{post:pick(disloyal).id}});
  const risky=POSTS.filter(p=>MIN(p.id).risk&&!MIN(p.id).exposed);if(risky.length&&Math.random()<.14)S.queue.push({id:'mscandal',p:{post:pick(risky).id}});
  save();render();pump();
}

/* ---- presidency actions ---- */
A.ptab=v=>{S.pres.tab=v;render()};
A.endQ=()=>endQuarter();
function useAP(){if(S.pres.ap<1){toast('В этом квартале действий больше нет. Завершите квартал.');return false}S.pres.ap--;return true}
A.address=()=>{const G=S.pres;if(G.addrQ===G.q){toast('Вы уже обращались к нации в этом квартале.');return}if(!useAP())return;G.addrQ=G.q;const v=rnd(1,3);approve(v);news('Президент обратился к нации','pres');toast(`Обращение к нации: одобрение +${f1(v)}.`);after()};
A.trip=()=>{const G=S.pres;if(G.tripQ===G.q){toast('Поездка в этом квартале уже была.');return}if(!useAP())return;G.tripQ=G.q;const R=pick(REG);capital(6);approve(.8);news(`Президент посетил регион ${R.name}`,'pres');toast(`Поездка в регион ${R.name}: капитал +6, одобрение +0,8.`);after()};
A.decree=()=>{const G=S.pres;if(G.decrees.includes('contracts'))return;if(!useAP())return;G.decrees.push('contracts');approve(2);capital(-5);debtAdd(.1e9);news('Указ президента: все госконтракты будут опубликованы онлайн','pres');G.qnote=G.qnote||'Указ о прозрачности';toast('Указ подписан: одобрение +2, капитал −5.');after()};
A.proj=v=>{const pr=S.pres.projects[v];pr.funded=!pr.funded;after()};

/* ---- laws & parliament ---- */
let LW=null;
function lawSupport(L){
  const G=S.pres;const m=LW&&LW.id===L.id?LW:{amend:false,mods:{opp:0,cen:0}};
  const amend=m.amend?{opp:.08,cen:.2}:{opp:0,cen:0};
  return{pres:clamp(L.sup.pres+(G.capital-50)/400,.5,.99),
    opp:clamp(L.sup.opp+(G.approval-50)/250+(S.flags.speech==='unity'?.05:0)+amend.opp+m.mods.opp,.01,.97),
    cen:clamp(L.sup.cen+(G.approval-50)/200+amend.cen+m.mods.cen,.02,.98)}}
function lawForecast(L,mult){mult=mult||1;const f=L.fx,o=[];
  if(f.trend)o.push([`ВВП: ${sgn(f.trend*mult)}%`,f.trend>0]);
  if(f.revenue)o.push([`Доходы бюджета: ${f.revenue>0?'+':'−'}${money(Math.abs(f.revenue*mult))} в год`,f.revenue>0]);
  if(f.spending)o.push([`Расходы: ${f.spending>0?'+':'−'}${money(Math.abs(f.spending*mult))} в год`,f.spending<0]);
  if(f.oneoff)o.push([`Единовременно: ${money(f.oneoff*mult)}`,false]);
  if(f.unemp)o.push([`Безработица: ${sgn(f.unemp*mult)} п.п.`,f.unemp<0]);
  if(f.infl)o.push([`Инфляция: ${sgn(f.infl*mult)} п.п.`,f.infl<0]);
  if(f.energy)o.push([`Цены на энергию: +${Math.round(f.energy)}`,false]);
  if(f.approval)o.push([`Одобрение: ${sgn(f.approval*mult)}`,f.approval>0]);
  if(f.capital)o.push([`Политический капитал: ${f.capital}`,false]);
  (L.extra||[]).forEach(x=>o.push([x,!x.includes('−')]));
  if(L.raisesTax)o.push(['Повышение налогов',false]);
  return o.map(([t,g])=>`<span class="${g?'up':'down'}">${t}</span>`).join('')}
A.law=v=>{if(S.pres.ap<1){toast('В этом квартале действий больше нет.');return}LW={id:v,amend:false,deal:false,press:false,mods:{opp:0,cen:0}};lawModal()};
function lawModal(){
  const L=LAW_BY[LW.id],G=S.pres,P=G.parl,s=lawSupport(L);
  const exp=Math.round(P.pres*s.pres+P.opp*s.opp+P.cen*s.cen);
  const row=(n,seats,p,col)=>`<tr><td><i class="dot" style="background:${col}"></i>${n}</td><td class="r">${seats}</td><td class="r">${Math.round(p*100)}%</td><td class="r">~${Math.round(seats*p)}</td></tr>`;
  modal(`<div class="mhead"><span class="kicker blue">Законопроект</span><h2>${esc(L.name)}</h2><p class="muted" style="margin:4px 0 0">${esc(L.sub)}</p></div><div class="mbody">
  <div><div class="eyebrow">Прогноз</div><div class="kv" style="margin-top:4px;font-size:14px">${lawForecast(L,LW.amend?.6:1)}</div></div>
  <div class="tblwrap"><table class="tbl"><tr><th>Фракция</th><th class="r">Мест</th><th class="r">Поддержка</th><th class="r">Голосов</th></tr>
  ${row('Партия «'+esc(S.party)+'»',P.pres,s.pres,'var(--you)')}${row(esc(G.oppParty),P.opp,s.opp,G.oppColor)}${row('Центристы',P.cen,s.cen,'var(--cen)')}</table></div>
  <div class="row between"><div>Нужно <b>251</b> голос. Прогноз: <b class="${exp>=251?'up':'down'}">~${exp} за</b></div><div class="muted">Капитал: ${Math.round(G.capital)} · Одобрение: ${pct(G.approval)}</div></div>
  <div class="eyebrow">Переговоры</div><div class="choices">
   <button class="btn act" data-a="lwAmend" ${LW.amend?'disabled':''}><b>Смягчить закон</b><span class="c">эффект ×0,6</span><span class="d">Центристы +20%, оппозиция +8%</span></button>
   <button class="btn act" data-a="lwDeal" ${LW.deal||G.capital<10?'disabled':''}><b>Сделка с центристами</b><span class="c">$2 млрд · капитал −10</span><span class="d">Деньги на их округа. Центристы +25%</span></button>
   <button class="btn act" data-a="lwPress" ${LW.press||G.capital<15?'disabled':''}><b>Давление через общественное мнение</b><span class="c">капитал −15</span><span class="d">${G.approval>=50?'Оппозиция +10%, центристы +10%':'При одобрении ниже 50% эффект вдвое слабее'}</span></button>
  </div>
  <div class="row"><button class="btn primary big" data-a="lwVote">Начать голосование</button><button class="btn ghost" data-a="close">Отозвать</button></div></div>`,true)}
A.lwAmend=()=>{LW.amend=true;lawModal()};
A.lwDeal=()=>{LW.deal=true;LW.mods.cen+=.25;capital(-10);debtAdd(2e9);lawModal()};
A.lwPress=()=>{LW.press=true;const k=S.pres.approval>=50?1:.5;LW.mods.opp+=.1*k;LW.mods.cen+=.1*k;capital(-15);lawModal()};
function hemiSeats(){
  const rows=11,r0=80,r1=232;const radii=[];for(let i=0;i<rows;i++)radii.push(r0+(r1-r0)*i/(rows-1));
  const tl=radii.reduce((a,b)=>a+b,0);const cnt=radii.map(r=>Math.round(500*r/tl));cnt[rows-1]+=500-cnt.reduce((a,b)=>a+b,0);
  const seats=[];radii.forEach((r,i)=>{const n=cnt[i];for(let j=0;j<n;j++){const a=Math.PI*(1-j/(n-1));seats.push({x:250+r*Math.cos(a),y:246-r*Math.sin(a),a})}});
  seats.sort((p,q)=>q.a-p.a);return seats}
function factionOf(i){const P=S.pres.parl;return i<P.opp?'opp':i<P.opp+P.cen?'cen':'pres'}
const FCOL=f=>f==='pres'?'var(--you)':f==='opp'?S.pres.oppColor:'var(--cen)';
function hemiSVG(fill){const seats=hemiSeats();return `<svg class="hemi" viewBox="0 0 500 256" role="img" aria-label="Парламент">${seats.map((s,i)=>`<circle id="seat${i}" cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="4.2" fill="${fill?fill(i):FCOL(factionOf(i))}" stroke="${FCOL(factionOf(i))}" stroke-width="1.4"/>`).join('')}</svg>`}
A.lwVote=()=>{
  if(!useAP())return;
  const L=LAW_BY[LW.id],G=S.pres,s=lawSupport(L);
  const votes=[];for(let i=0;i<500;i++)votes.push(Math.random()<s[factionOf(i)]);
  const order=[...Array(500).keys()].sort(()=>Math.random()-.5);
  modal(`<div class="mhead"><span class="kicker blue">Голосование</span><h2>${esc(L.name)}</h2></div><div class="mbody">${hemiSVG(()=>'var(--panel-3)')}
  <div class="votecount"><div class="up">За<b id="v-y">0</b></div><div class="down">Против<b id="v-n">0</b></div><div class="muted">Осталось<b id="v-r">500</b></div></div><div id="v-res" style="text-align:center"></div></div>`,true);
  let k=0,y=0,n=0;
  const step=()=>{const batch=k<460?12:1;for(let b=0;b<batch&&k<500;b++,k++){const i=order[k];const el=document.getElementById('seat'+i);if(votes[i])y++;else n++;if(el)el.setAttribute('fill',votes[i]?'var(--good)':'var(--bad)')}
    const Y=$('#v-y');if(!Y){stopTimers();return}Y.textContent=y;$('#v-n').textContent=n;$('#v-r').textContent=500-k;
    if(k<500){TIMERS.push(setTimeout(step,k<460?45:140))}else finishVote(L,y,n)};
  step();
};
function finishVote(L,y,n){
  const G=S.pres;G.attempts[L.id]=(G.attempts[L.id]||0)+1;const ok=y>=251;
  if(ok){const mult=LW.amend?.6:1;applyLaw(L,mult);G.passed.push(L.id);S.career.laws.push(L.name);G.qnote=G.qnote||L.name;news(`Парламент принял закон «${L.name}»: ${y} за, ${n} против`,'pres')}
  else{G.failed.push(L.id);approve(-1.5);capital(-5);news(`Парламент провалил закон «${L.name}»: ${y} за, ${n} против`,'pres')}
  LW=null;save();
  $('#v-res').innerHTML=`<div class="banner ${ok?'win':''}" style="font-size:30px;margin-top:8px">${ok?'Закон принят':'Закон провален'}</div><button class="btn primary" style="margin-top:12px" data-a="closeR">Продолжить</button>`;
}
function applyLaw(L,m){const f=L.fx,e=S.econ;const ec=(.7+MIN('eco').comp/300);
  e.trend+=(f.trend||0)*m*(f.trend>0?ec:1);e.unemp=clamp(e.unemp+(f.unemp||0)*m,2.5,15);e.infl+=(f.infl||0)*m;
  e.revenue+=(f.revenue||0)*m;e.spending+=(f.spending||0)*m;e.debt+=(f.oneoff||0)*m;e.energy+=(f.energy||0);
  if(f.approval)approve(f.approval*m);if(f.capital)capital(f.capital);if(L.raisesTax)S.flags.taxRaised=true}

/* ---- reshuffle ---- */
A.reshuffle=v=>{const cur=MIN(v);const pool=MINISTERS[v].filter(m=>m.name!==cur.name);
  modal(`<div class="mhead"><span class="kicker blue">Кадровые решения</span><h2>${POSTS.find(p=>p.id===v).name}</h2></div><div class="mbody"><p>Сейчас: <b>${esc(cur.name)}</b>. Отставка стоит 1 действие и 5 капитала.</p><div class="cands3">${pool.map((m,j)=>`<button class="mcard" data-a="swapMin" data-v="${v}:${MINISTERS[v].indexOf(m)}">${avatar(m.name,44)}<b style="font-family:var(--f-display);font-size:19px">${esc(m.name)}</b><div class="mstats"><span><b>${m.comp}</b>Комп.</span><span><b>${m.pop}</b>Попул.</span><span><b>${m.loy}</b>Лоял.</span><span><b>${m.rep}</b>Репут.</span></div><span class="muted" style="font-size:13px">${esc(m.note)}</span></button>`).join('')}</div><button class="btn ghost" data-a="close">Отмена</button></div>`,true)};
A.swapMin=v=>{const [p,j]=v.split(':');if(!useAP())return;const old=MIN(p).name;S.ministers[p]=Object.assign({},MINISTERS[p][+j],{post:p});capital(-5);news(`${old} отправлен в отставку. Новый ${POSTS.find(x=>x.id===p).name.toLowerCase()} — ${S.ministers[p].name}`,'pres');closeModal();after()};
function replaceMin(p){const cur=MIN(p);const alt=MINISTERS[p].filter(m=>m.name!==cur.name).sort((a,b)=>b.loy-a.loy)[0];S.ministers[p]=Object.assign({},alt,{post:p});return alt.name}

/* ---- crises ---- */
const ch=(label,hint,run)=>({label,hint,run});
CR.bank={w:1,build(){const fc=MIN('fin').comp;const k=1.2-fc/250;return{kicker:'Экстренное совещание',title:'Банковский кризис',text:'Крупнейший частный банк страны «Ардбанк» на грани краха. У отделений очереди. Там хранят сбережения 4 миллиона семей.',
 advisors:[adv('fin',`Нельзя увеличивать расходы. Долг уже ${f1(debtPct())}% ВВП.`),adv('eco','Без государственной помощи начнут закрываться предприятия.'),POLLSTER('Если ничего не сделать, мы потеряем около 6% поддержки.')],
 choices:[ch('Спасти банк',`Долг +${money(25e9*k)} · одобрение −1`,()=>{debtAdd(25e9*k);S.econ.shock-=.3;approve(-1);return 'Банк спасён. Люди злятся, что спасли банкиров, но паники нет.'}),
  ch('Национализировать',`Долг +${money(12e9*k)} · капитал −12`,()=>{debtAdd(12e9*k);capital(-12);S.econ.shock-=.5;approve(1);return 'Государство забирает банк. Бизнес насторожен, избиратели довольны.'}),
  ch('Гарантировать только вклады',`Долг +${money(6e9*k)} · рост −1 · одобрение −2`,()=>{debtAdd(6e9*k);S.econ.shock-=1;S.econ.unemp+=.3;approve(-2);return 'Вкладчики спокойны, но банк закрылся. 14 000 сотрудников ищут работу.'}),
  ch('Не вмешиваться','Рост −2 · безработица +0,8 · одобрение −6',()=>{S.econ.shock-=2;S.econ.unemp+=.8;approve(-6);S.pres.pending.push({q:S.pres.q+1,id:'bankrun'});return 'Банк рухнул. Паника перекинулась на два других банка.'})]}}};
CR.bankrun={build(){return{kicker:'Последствия',title:'Цепная реакция в банках',text:'После краха «Ардбанка» вкладчики забирают деньги из всех частных банков.',choices:[ch('Срочно гарантировать все вклады','Долг +$9 млрд',()=>{debtAdd(9e9);approve(-1);return 'Паника остановлена, но поздно и дороже.'}),ch('Ждать','',()=>{S.econ.shock-=1;approve(-4);return 'Рецессия углубляется. Одобрение −4.'})]}}};
CR.flood={w:1,params:()=>({r:ri(0,8)}),build(p){const R=REG[p.r];return{kicker:'Экстренное совещание',title:`Наводнение в регионе ${R.name}`,text:'Прорвана дамба. Затоплены 60 населённых пунктов, эвакуированы 30 000 человек.',
 advisors:[adv('int','Спасатели работают, но нужны деньги на восстановление.'),adv('fin','Резервный фонд позволяет выделить $1,5 млрд без нового долга.'),POLLSTER('Люди хотят видеть президента на месте.')],
 choices:[ch('Вылететь на место и выделить $3 млрд','Одобрение +3 · капитал +3',()=>{debtAdd(3e9);approve(3);capital(3);S.pres.qnote=S.pres.qnote||'Наводнение';return 'Вы стоите в резиновых сапогах среди спасателей. Кадры облетают страну.'}),
  ch('Отправить министра и $1,5 млрд','',()=>{debtAdd(1.5e9);approve(.5);return 'Помощь идёт, но местные жители спрашивают, где президент.'}),
  ch('Ограничиться заявлением','Одобрение −5',()=>{approve(-5);S.pres.qnote=S.pres.qnote||'Наводнение';return '«Президент в отпуске?» — главный заголовок недели.'})]}}};
CR.energy={w:1,build(){const ec=MIN('energy').comp;S.econ.energy+=40-(ec-70)/3;const green=S.pres.passed.includes('green');return{kicker:'Экстренное совещание',title:'Энергетический кризис',text:`Поставщик газа сократил поставки. Цены на энергию выросли на ${Math.round(40-(ec-70)/3)}%. Зима через два месяца.`,
 advisors:[adv('energy','Можно ограничить цены, но тогда начнётся дефицит топлива.'),adv('fin','Субсидии обойдутся в $8 млрд.'),POLLSTER('Счета за отопление — тема номер один в каждом регионе.')],
 choices:[ch('Субсидии населению','Долг +$8 млрд · инфляция −0,4',()=>{debtAdd(8e9);S.econ.infl-=.4;approve(1);return 'Счета остались прежними. Минфин в ужасе.'}),
  ch('Заморозить цены указом','Инфляция −0,8, риск дефицита',()=>{S.econ.infl-=.8;approve(2);if(Math.random()<.55)S.pres.pending.push({q:S.pres.q+1,id:'shortage'});return 'Цены зафиксированы. Компании предупреждают о проблемах с поставками.'}),
  green?ch('Ускорить зелёную программу','Закон о ВИЭ уже принят: энергия −15',()=>{S.econ.energy-=15;approve(2);return 'Новые станции заработали раньше срока. Решение выглядит дальновидным.'}):ch('Срочные закупки у других поставщиков','Долг +$5 млрд · энергия −15',()=>{debtAdd(5e9);S.econ.energy-=15;return 'Танкеры с газом идут в Портовый. Дорого, но надёжно.'}),
  ch('Ничего не делать','Инфляция +1,2 · одобрение −4',()=>{S.econ.infl+=1.2;approve(-4);return 'Счета выросли вдвое. Люди запомнят эту зиму.'})].filter(Boolean)}}};
CR.shortage={build(){return{kicker:'Последствия',title:'Дефицит топлива',text:'После заморозки цен поставщики сокращают продажи. Очереди на заправках.',choices:[ch('Отменить заморозку','',()=>{S.econ.infl+=.6;approve(-2);return 'Цены выросли, очереди исчезли.'}),ch('Держать курс','',()=>{approve(-4);S.econ.shock-=.4;return 'Очереди растут. Одобрение −4.'})]}}};
CR.protest={w:1,build(){const ic=MIN('int').comp;const cause=S.econ.infl>4?'роста цен':S.econ.unemp>6?'безработицы':'коррупции в министерствах';return{kicker:'Экстренное совещание',title:'Массовые протесты',text:`Около 120 000 человек вышли на площади столицы из-за ${cause}. Протестующие требуют встречи с президентом.`,
 advisors:[adv('int','Ситуацию можно взять под контроль силой, но последствия непредсказуемы.'),adv('eco','Уступки стоят денег, но снимут напряжение.'),POLLSTER('Большинство сочувствует протестующим.')],
 choices:[ch('Выйти к протестующим','Капитал −6 · одобрение +1',()=>{capital(-6);approve(1);return 'Вы говорите с людьми без охраны. Часть разошлась по домам.'}),
  ch('Пойти на уступки','Расходы +$4 млрд в год · одобрение +3',()=>{S.econ.spending+=4e9;approve(3);return 'Требования частично выполнены. Протест закончился.'}),
  ch('Разогнать полицией','Одобрение −3, риск эскалации',()=>{approve(-3);if(Math.random()<.6-ic/300)S.pres.pending.push({q:S.pres.q+1,id:'escalation'});return 'Площадь очищена. Видео с дубинками в соцсетях.'}),
  ch('Игнорировать','Одобрение −4',()=>{approve(-4);return 'Протест длится три недели и затухает. Осадок остался.'})]}}};
CR.escalation={build(){return{kicker:'Последствия',title:'Протесты охватили страну',text:'После разгона протесты прошли в семи регионах.',choices:[ch('Отправить министра внутренних дел в отставку','',()=>{const n=replaceMin('int');approve(2);capital(-6);return `Новый министр — ${n}. Напряжение спадает.`}),ch('Не уступать','',()=>{approve(-6);S.pres.scandal+=3;return 'Одобрение −6.'})]}}};
CR.recession={w:.9,build(){S.econ.shock-=2.2;return{kicker:'Экстренное совещание',title:'Рецессия',text:'ВВП падает второй квартал подряд. Экспортёры сокращают производство.',
 advisors:[adv('eco','Нужен пакет стимулов, иначе потеряем полмиллиона рабочих мест.'),adv('fin','Стимулы — это долг. Лучше сократить расходы.'),POLLSTER('Экономика снова главная тема.')],
 choices:[ch('Пакет стимулов $30 млрд','Рост +1,4 · долг',()=>{debtAdd(30e9);S.econ.shock+=1.4;approve(1);return 'Деньги пошли в стройки и малый бизнес.'}),
  ch('Снизить налоги','Доходы −$15 млрд в год · рост +1',()=>{S.econ.revenue-=15e9;S.econ.shock+=1;S.flags.taxCut=true;return 'Бизнес доволен, дефицит растёт.'}),
  ch('Сократить расходы','Рост −0,5 · одобрение −3',()=>{S.econ.spending-=10e9;S.econ.shock-=.5;approve(-3);return 'Бюджет в порядке. Людям хуже.'}),
  ch('Ждать восстановления','Одобрение −2',()=>{approve(-2);return 'Экономика восстанавливается сама, но медленно.'})]}}};
CR.conflict={w:.8,build(){const dc=MIN('def').comp;return{kicker:'Экстренное совещание',title:'Международный конфликт',text:'Корвенская республика стянула войска к восточной границе и перекрыла морской путь к Портовому.',
 advisors:[adv('def','Армия готова, но нам нужна модернизация.'),adv('eco','Санкции ударят и по нашим экспортёрам.'),POLLSTER('Страна ждёт твёрдости, но не войны.')],
 choices:[ch('Санкции','Рост −0,4 · одобрение +2',()=>{S.econ.shock-=.4;approve(2);return 'Союзники поддержали санкции. Корвения отводит часть войск.'}),
  ch('Переговоры','Капитал −6, исход неясен',()=>{capital(-6);if(Math.random()<.45+dc/300){approve(4);S.pres.qnote=S.pres.qnote||'Мирное соглашение';return 'Соглашение подписано. Вас называют миротворцем.'}approve(-2);return 'Переговоры сорвались. Вас обвиняют в слабости.'}),
  ch('Усилить армию у границы','Долг +$10 млрд · одобрение +3',()=>{debtAdd(10e9);approve(3);return 'Колонны техники идут на восток. Рейтинг растёт.'}),
  ch('Не реагировать','Одобрение −4',()=>{approve(-4);return 'Корвения продолжает давление.'})]}}};
CR.strike={w:1,cond:()=>!S.pres.passed.includes('teachers'),build(){const promised=termPromises().some(p=>p.id==='teachers');return{kicker:'Экстренное совещание',title:'Забастовка учителей',text:`80 000 учителей не вышли на работу.${promised?' Они требуют выполнить ваше предвыборное обещание о повышении зарплат на 25%.':''}`,
 advisors:[adv('edu','Учителя на грани. Нужно хотя бы частичное повышение.'),adv('fin','Каждый процент — $200 млн в год.'),POLLSTER('Родители на стороне учителей.')],
 choices:[ch('Внести закон о зарплатах учителей','Откроет голосование в парламенте',()=>{S.pres.ap=Math.max(S.pres.ap,1);setTimeout(()=>A.law('teachers'),50);return null}),
  ch('Временная надбавка 10%','Расходы +$2 млрд в год',()=>{S.econ.spending+=2e9;approve(1);return 'Школы снова открыты. Учителя ждут большего.'}),
  ch('Ждать','Одобрение −4',()=>{approve(-4);return 'Забастовка длится две недели.'})]}}};
CR.cyber={w:.8,build(){const ic=MIN('int').comp;return{kicker:'Экстренное совещание',title:'Утечка данных 12 млн граждан',text:'Хакеры выложили паспортные данные из государственного реестра.',
 advisors:[adv('int','Атака шла из-за рубежа.'),POLLSTER('Люди злятся на правительство, а не на хакеров.')],
 choices:[ch('Признать ошибку и компенсировать','Долг +$1 млрд · одобрение +1',()=>{debtAdd(1e9);approve(1);return 'Честность оценили.'}),
  ch('Создать агентство кибербезопасности','Расходы +$1,5 млрд в год',()=>{S.econ.spending+=1.5e9;approve(ic>75?2:.5);return 'Новое агентство начинает работу.'}),
  ch('Обвинить иностранные спецслужбы','',()=>{if(Math.random()<.5){approve(1);return 'Версия убедила большинство.'}approve(-3);return 'Журналисты выяснили, что пароль к реестру был «admin123».'})]}}};
CR.mconflict={build(p){const m=MIN(p.post);return{kicker:'Конфликт в правительстве',title:`${m.name} публично критикует президента`,text:`${POSTS.find(x=>x.id===p.post).name} в интервью назвал${m.name.match(/а\s|а$/)?'а':''} ваш курс «опасным популизмом».`,
 choices:[ch('Уволить','Капитал −5',()=>{const n=replaceMin(p.post);capital(-5);approve(-1);return `Новый министр — ${n}. Оппозиция говорит о «чистках».`}),
  ch('Помириться за закрытыми дверями','Лояльность +15 · капитал −5',()=>{m.loy+=15;capital(-5);return 'Конфликт исчерпан. Пока.'}),
  ch('Игнорировать','Одобрение −2',()=>{approve(-2);m.loy-=5;return 'Журналисты пишут о расколе в правительстве.'})]}}};
CR.mscandal={build(p){const m=MIN(p.post);m.exposed=true;return{kicker:'Правительственный скандал',title:`${m.name} обвиняется в конфликте интересов`,text:'Журналисты нашли контракты министерства с компаниями родственников.',
 advisors:[POLLSTER('Чем дольше мы тянем, тем хуже.')],
 choices:[ch('Отправить в отставку','Одобрение +1',()=>{const n=replaceMin(p.post);approve(1);return `Министр уходит. Новый министр — ${n}.`}),
  ch('Защитить министра','',()=>{S.pres.pending.push({q:S.pres.q+1,id:'mscandal2',p:{post:p.post}});return 'Вы называете обвинения политическими.'}),
  ch('Независимое расследование','Капитал −5',()=>{capital(-5);approve(.5);return 'Расследование займёт полгода. Пресса ждёт.'})]}}};
CR.mscandal2={build(p){return{kicker:'Скандал',title:'Новые документы по делу министра',text:'Опубликованы платёжки. Защита министра выглядит соучастием.',choices:[ch('Отставка','',()=>{replaceMin(p.post);approve(-4);S.pres.scandal+=3;S.pres.qnote=S.pres.qnote||'Скандал';return 'Одобрение −4. Скандал ударил по президенту лично.'})]}}};
CR.rerun={build(){const G=S.pres;return{kicker:'365 дней до выборов',title:'Баллотироваться на второй срок?',text:`Одобрение: <b>${pct(G.approval)}</b>. Выполнено обещаний: <b>${keptNow()}/${termPromises().length}</b>. Соперники уже готовят кампании.`,
 choices:[ch('Да, идём на второй срок','Кампания начнётся через полгода',()=>{G.rerun=true;news(`${S.name} объявил, что будет баллотироваться на второй срок`,'pres');return 'Решение принято. Последние два квартала до кампании покажут, с чем вы придёте к избирателям.'}),
  ch('Нет, завершу срок','',()=>{G.rerun=false;news(`${S.name} не будет баллотироваться на второй срок`,'pres');return 'Вы доработаете до конца срока и войдёте в историю.'})]}}};
CR.camp2={build(){const k=keptNow(),t=termPromises().length;return{kicker:'Выборы-'+(new Date(Date.UTC(2032,0,1)).getUTCFullYear()),title:'Начинается кампания за второй срок',text:`СМИ подводят итоги: президент выполнил ${k} из ${t} обещаний. Одобрение — ${pct(S.pres.approval)}. Соперники будут напоминать о каждом невыполненном слове.`,
 choices:[ch('Начать кампанию','',()=>{beginReelection();return null})]}}};
CR.termEnd={build(){return{kicker:'Конец срока',title:'Полномочия завершены',text:`Через несколько дней новый президент принесёт присягу. Ваше одобрение на финише — ${pct(S.pres.approval)}.`,choices:[ch('Подвести итоги карьеры','',()=>{finalizeTerm();S.phase='legacy';return null})]}}};

function finalizeTerm(){
  const G=S.pres;if(!G||G.finalized)return;G.finalized=true;
  const ps=termPromises().map(p=>{const s=promStatus(p,true);return{id:p.id,s:s.s,t:s.t,line:s.line,deal:p.deal}});
  const kept=ps.filter(p=>p.s==='done').length;
  const avg=G.hist.reduce((a,h)=>a+h.v,0)/G.hist.length;
  S.career.terms.push({n:G.termNo,cycle:G.cycle,promises:ps,kept,avg,last:G.approval,laws:G.passed.map(id=>LAW_BY[id].name),crises:G.crises.slice(),econStart:G.econStart,econEnd:Object.assign({},S.econ),debtStart:G.debtStart,debtEnd:debtPct(),hist:G.hist.map(h=>h.v)});
}
function beginReelection(){
  finalizeTerm();const G=S.pres,t=S.career.terms[S.career.terms.length-1];
  const pl=PL();pl.trust=clamp(30+G.approval*.36+t.kept/(t.promises.length||1)*18-(t.promises.length-t.kept)*.8,18,85);pl.trust0=pl.trust;pl.rec=96;pl.leanMod=(G.approval-50)*.4;
  const lost=S.last.rival;
  for(const k in RIVALS){const r=RIVALS[k],c=S.c[k];Object.assign(c,{out:false,dirt:0,trust:r.trust,trust0:r.trust,rec:r.rec,leanMod:0})}
  if(lost==='carter'){Object.assign(S.c.carter,{name:'Сэмюэл Грант',short:'Грант',blurb:'Новый лидер Национального союза. Молод, агрессивен, без багажа.',rec:70,trust:60,trust0:60})}
  S.c.carter.leanMod=(50-G.approval)*.2;
  S.cycle++;S.budget=Math.max(S.budget,0)+7e6;S.pending=[];
  initCampaign(182,true);
  news(`Президент выполнил ${t.kept} из ${t.promises.length} обещаний`,'pres');
  news(`${S.c.carter.name} выдвинут кандидатом от партии «${S.c.carter.party}»`,'rival');
}
// override crisis tracking: record crisis names when chosen
const _choose=A.choose;A.choose=v=>{if(CUR&&CUR.kicker==='Экстренное совещание'&&S.pres)S.pres.crises.push(CUR.title);if(CUR&&CUR.kicker==='Экстренное совещание')S.pres.qnote=S.pres.qnote||CUR.title;_choose(v)};

/* ---- presidency screen ---- */

function approvalChart(){
  const G=S.pres;const h=G.hist;const W=640,H=220,pl=34,pr=10;const n=17;
  const xs=i=>pl+i*(W-pl-pr)/(n-1);const ys=v=>H-24-(v-20)/60*(H-40);
  let s=`<svg class="spark chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Рейтинг одобрения за срок">`;
  [20,40,60,80].forEach(v=>{s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)"/><text x="2" y="${ys(v)+4}">${v}%</text>`});
  s+=`<line x1="${pl}" x2="${W-pr}" y1="${ys(50)}" y2="${ys(50)}" stroke="var(--line-2)" stroke-dasharray="4 4"/>`;
  for(let y=0;y<4;y++)s+=`<text x="${xs(y*4)+4}" y="${H-6}">${(G.termNo===1?2029:2033)+y}</text>`;
  const pts=h.map((p,i)=>[xs(i),ys(p.v)]);
  s+=`<polygon points="${pl},${ys(20)} ${pts.map(p=>p.join(',')).join(' ')} ${pts[pts.length-1][0]},${ys(20)}" fill="var(--you)" opacity=".14"/>`;
  s+=`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--you)" stroke-width="3"/>`;
  h.forEach((p,i)=>{if(p.note||i===h.length-1){s+=`<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="${i===h.length-1?5:3.5}" fill="${i===h.length-1?'var(--you)':'var(--text)'}"/>`;if(p.note)s+=`<text x="${pts[i][0]+5}" y="${pts[i][1]-8}" style="fill:var(--text)">${esc(p.note.slice(0,22))} · ${Math.round(p.v)}%</text>`}});
  return s+'</svg>'}
function presOverview(){
  const G=S.pres,und=clamp(14-G.q*.4,6,14);const dis=100-G.approval-und;
  const hasContracts=termPromises().some(p=>p.id==='contracts')||true;
  return `<div class="stack"><div class="row between"><div><div class="eyebrow">Approval rating</div><h2>Рейтинг одобрения</h2></div><div class="kv"><span>Одобряют <b class="up">${pct(G.approval)}</b></span><span>Не одобряют <b class="down">${pct(dis)}</b></span><span>Не определились <b>${pct(und)}</b></span></div></div>
  ${approvalChart()}
  <div class="actgrid">
   <button class="btn act" data-a="address" ${G.addrQ===G.q?'disabled':''}><b>Обращение к нации</b><span class="c">1 действие</span><span class="d">Одобрение +1…3. Раз в квартал</span></button>
   <button class="btn act" data-a="trip" ${G.tripQ===G.q?'disabled':''}><b>Поездка по регионам</b><span class="c">1 действие</span><span class="d">Политический капитал +6</span></button>
   ${!G.decrees.includes('contracts')&&hasContracts?`<button class="btn act" data-a="decree"><b>Указ: опубликовать госконтракты</b><span class="c">1 действие</span><span class="d">Одобрение +2, капитал −5</span></button>`:''}
   <button class="btn act" data-a="ptab" data-v="laws"><b>Внести закон</b><span class="c">1 действие</span><span class="d">Нужно 251 голос из 500</span></button>
  </div>
  <div class="grid2"><div><div class="eyebrow" style="margin-bottom:6px">Обещания срока</div>${termPromises().slice(0,5).map(p=>{const s=promStatus(p);return `<div class="prow">${stMark(s.s)}<div><b>${esc(PROM_BY[p.id].text)}</b><div class="muted" style="font-size:13px">${s.t}</div></div></div>`}).join('')||'<p class="muted">Вы ничего не обещали.</p>'}</div>
  <div><div class="eyebrow" style="margin-bottom:6px">Последние новости</div><div class="feed">${S.news.slice(0,6).map(n=>`<div>${esc(n.t)}</div>`).join('')}</div></div></div></div>`}
function presLaws(){
  const G=S.pres;const promised=new Set(termPromises().filter(p=>PROM_BY[p.id].type==='law').map(p=>PROM_BY[p.id].law));
  return `<h2>Законы</h2><p class="muted" style="margin:4px 0 12px">Внесение закона — 1 действие. Парламент: ${G.parl.pres} ваших, ${G.parl.opp} оппозиция, ${G.parl.cen} центристов. Нужно 251.</p>
  <div class="list">${LAWS.map(L=>{const done=G.passed.includes(L.id);const s=lawSupport(L);const exp=Math.round(G.parl.pres*s.pres+G.parl.opp*s.opp+G.parl.cen*s.cen);
   return `<div class="item ${done?'hired':''}"><div class="row between"><div><b style="font-size:16px">${esc(L.name)}</b>${promised.has(L.id)?' <span class="pill warn">Обещание</span>':''}${done?' <span class="pill good">Принят</span>':G.attempts[L.id]?' <span class="pill bad">Провален</span>':''}<div class="muted" style="font-size:13px">${esc(L.sub)}</div></div>${done?'':`<button class="btn primary" data-a="law" data-v="${L.id}" ${G.ap<1?'disabled':''}>Внести · ~${exp} за</button>`}</div><div class="kv" style="margin-top:6px">${lawForecast(L)}</div></div>`}).join('')}</div>`}
function presParl(){const G=S.pres,P=G.parl;return `<h2>Парламент</h2>${hemiSVG()}<div class="grid3" style="margin-top:10px">
  <div class="item"><div class="eyebrow"><i class="dot" style="background:var(--you)"></i>Партия «${esc(S.party)}»</div><div class="big" style="font-size:40px">${P.pres}</div><div class="muted">${pct(P.pres/5)} мест · лояльна</div></div>
  <div class="item"><div class="eyebrow"><i class="dot" style="background:${G.oppColor}"></i>${esc(G.oppParty)}</div><div class="big" style="font-size:40px">${P.opp}</div><div class="muted">${pct(P.opp/5)} · оппозиция</div></div>
  <div class="item"><div class="eyebrow"><i class="dot" style="background:var(--cen)"></i>Центристы</div><div class="big" style="font-size:40px">${P.cen}</div><div class="muted">${pct(P.cen/5)} · торгуются</div></div></div>
  <p class="muted">${P.pres>=251?'У вас собственное большинство, но дисциплина фракции зависит от вашего капитала.':`Самостоятельного большинства нет: не хватает ${251-P.pres} голосов. Договаривайтесь с центристами или давите через общественное мнение.`}</p>`}

function presPromises(){const ps=termPromises();const k=keptNow();
  return `<div class="row between"><h2>Мои обещания</h2><span class="big" style="font-size:34px">${k}/${ps.length}</span></div><p class="muted" style="margin:4px 0 8px">Перед следующими выборами СМИ покажут эту статистику. Соперник процитирует каждое невыполненное обещание.</p>
  ${ps.map(p=>{const s=promStatus(p),d=PROM_BY[p.id];return `<div class="prow">${stMark(s.s)}<div style="flex:1"><b>${esc(d.text)}</b>${p.deal?' <span class="pill warn">Сделка</span>':''}<div class="muted" style="font-size:13px">${s.t} · ${d.type==='law'?'нужен закон':d.type==='project'?'финансируйте во вкладке «Бюджет»':d.type==='decree'?'указ на вкладке «Обзор»':d.type==='pledge'?'нельзя нарушить':'зависит от экономики'}</div></div>${d.type==='law'&&s.s!=='done'?`<button class="btn" data-a="law" data-v="${d.law}" ${S.pres.ap<1?'disabled':''}>Внести закон</button>`:''}</div>`}).join('')||'<p class="muted">Вы не дали ни одного обещания.</p>'}`}
function presBudget(){const e=S.econ,G=S.pres;const def=(e.spending-e.revenue)/e.gdp*100;
  return `<h2>Бюджет и программы</h2><div class="grid3" style="margin-top:10px">
   <div class="item"><div class="eyebrow">Доходы</div><div class="big" style="font-size:30px">${money(e.revenue)}</div><div class="muted">в год</div></div>
   <div class="item"><div class="eyebrow">Расходы</div><div class="big" style="font-size:30px">${money(e.spending)}</div><div class="muted">в год</div></div>
   <div class="item"><div class="eyebrow">Дефицит</div><div class="big ${def>3?'down':''}" style="font-size:30px">${pct(def)}</div><div class="muted">ВВП</div></div>
   <div class="item"><div class="eyebrow">Госдолг</div><div class="big" style="font-size:30px">${pct(debtPct())}</div><div class="muted">на старте срока ${pct(G.debtStart)}</div></div></div>
  <div class="eyebrow" style="margin-top:16px">Национальные программы</div><div class="list" style="margin-top:6px">${Object.entries(PROJECTS).map(([k,P])=>{const pr=G.projects[k];return `<div class="item"><div class="row between"><div><b>${P.name}</b><div class="muted" style="font-size:13px">${pr.built}/${P.target} ${P.unit} · ${money(P.cost)} за объект · курирует ${esc(MIN(P.post).name)}</div></div>${pr.built>=P.target?'<span class="pill good">Завершено</span>':`<button class="toggle btn ghost" data-a="proj" data-v="${k}"><span class="sw ${pr.funded?'on':''}"></span>${pr.funded?'Финансируется':'Не финансируется'}</button>`}</div>
   <div class="evbar" style="height:8px;margin-top:8px"><i style="width:${pr.built/P.target*100}%;background:var(--good)"></i></div></div>`}).join('')}</div>`}

/* ================= legacy ================= */
function legacyHTML(){
  const C=S.career;const terms=C.terms;const allP=terms.flatMap(t=>t.promises);const kept=allP.filter(p=>p.s==='done').length;
  const avg=terms.length?terms.reduce((a,t)=>a+t.avg,0)/terms.length:null;
  const laws=terms.flatMap(t=>t.laws);const crises=terms.flatMap(t=>t.crises);
  let title,epi;
  if(!terms.length){title='Кандидат, который почти смог';epi='История помнит победителей. Но ваша кампания изменила повестку страны.'}
  else if(allP.length&&kept/allP.length<.4){title='Популист';epi='Вы умели побеждать на выборах лучше, чем выполнять обещанное.'}
  else if(avg>58&&(!allP.length||kept/allP.length>=.7)){title='Президент, который держал слово';epi='Через десятилетия ваш срок будут ставить в пример.'}
  else if(laws.length>=7){title='Реформатор';epi='Вы изменили законы страны сильнее, чем кто-либо за последние 30 лет.'}
  else if(crises.length>=5){title='Кризисный менеджер';epi='Ваше президентство прошло в штормах, и страна их пережила.'}
  else{title='Осторожный управленец';epi='Без громких побед и без громких провалов.'}
  if(S.flags.concede==='c')epi+=' Отказ признать поражение стал тёмным пятном в биографии.';
  const e0=S.econ0,e1=terms.length?terms[terms.length-1].econEnd:S.econ;
  return topBar('Итоги карьеры',esc(S.name),'')+`<section class="stack" style="margin-top:18px;max-width:1000px;margin-inline:auto">
  <div class="card" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">${avatar(S.name,96,true,S.look)}<div><div class="eyebrow">Политическое наследие · ${esc(S.name)}</div><div class="legacy-title">${title}</div><p style="font-family:var(--f-serif);font-size:18px;margin:6px 0 0;max-width:60ch">${epi}</p></div></div>
  <div class="grid3">
   <div class="card"><div class="eyebrow">Кампаний</div><div class="big">${C.elections.length}</div></div>
   <div class="card"><div class="eyebrow">Президентских сроков</div><div class="big">${terms.length}</div></div>
   <div class="card"><div class="eyebrow">Законов принято</div><div class="big">${laws.length}</div></div>
   <div class="card"><div class="eyebrow">Обещаний выполнено</div><div class="big">${kept}<span class="muted" style="font-size:28px">/${allP.length}</span></div></div>
   <div class="card"><div class="eyebrow">Средний рейтинг</div><div class="big">${avg==null?'—':pct(avg)}</div></div>
   <div class="card"><div class="eyebrow">Кризисов</div><div class="big">${crises.length}</div></div></div>
  <div class="card"><h2>Выборы</h2><div class="tblwrap"><table class="tbl"><tr><th>Год</th><th>Соперник</th><th class="r">Выборщики</th><th class="r">Голоса</th><th>Итог</th></tr>${C.elections.map(x=>`<tr><td>${x.year}</td><td>${esc(x.rival)}</td><td class="r">${x.evP} : ${x.evR}</td><td class="r">${pct(x.pvP)} : ${pct(x.pvR)}</td><td>${x.won?'<span class="pill good">Победа</span>':'<span class="pill bad">Поражение</span>'}</td></tr>`).join('')}</table></div></div>
  ${terms.length?`<div class="card"><h2>Экономика: старт → финиш</h2><div class="tblwrap"><table class="tbl"><tr><th>Показатель</th><th class="r">Было</th><th class="r">Стало</th></tr>
   <tr><td>Рост ВВП</td><td class="r">${pct(e0.growth)}</td><td class="r">${pct(e1.growth)}</td></tr><tr><td>Инфляция</td><td class="r">${pct(e0.infl)}</td><td class="r">${pct(e1.infl)}</td></tr><tr><td>Безработица</td><td class="r">${pct(e0.unemp)}</td><td class="r">${pct(e1.unemp)}</td></tr><tr><td>Госдолг, % ВВП</td><td class="r">${pct(e0.debt/e0.gdp*100)}</td><td class="r">${pct(e1.debt/e1.gdp*100)}</td></tr></table></div></div>
  <div class="grid2"><div class="card"><h2>Обещания</h2>${allP.map(p=>`<div class="prow">${stMark(p.s)}<div><b>${esc(PROM_BY[p.id].text)}</b><div class="muted" style="font-size:13px">${esc(p.t)}</div></div></div>`).join('')||'<p class="muted">Обещаний не было.</p>'}</div>
  <div class="card"><h2>Законы и кризисы</h2>${laws.map(l=>`<div class="prow">${stMark('done')}<div>${esc(l)}</div></div>`).join('')}${crises.map(c=>`<div class="prow"><span class="st fail">!</span><div>${esc(c)}</div></div>`).join('')}</div></div>`:''}
  <div><button class="btn primary big" data-a="restart">Новая карьера</button></div></section>`}

/* =====================================================================
   SCREENS — layout follows the 18-panel concept one to one
   ===================================================================== */
const PH=(k,cls,alt)=>`<img class="${cls||''}" src="${IMG[k]}" alt="${esc(alt||'')}" loading="lazy">`;
const CH_KEYS=['m0','m1','m2','m3','m4','f0','f1','f2','f3','f4'];CH_KEYS.forEach(k=>IMG['ch_'+k]=CHARS[k][0]);const LOOK_IMG=CH_KEYS.map(k=>'ch_'+k);
Object.keys(CHAR_HQ).forEach(k=>IMG['ch_'+k]=CHAR_HQ[k].portrait);
function playerVariant(i){if(!S||S.photo)return S&&S.photo;const key=CH_KEYS[S.look||0];const hq=CHAR_HQ[key];const v=hq?Object.values(hq):CHARS[key].slice(1);return v[((i%v.length)+v.length)%v.length]}
function playerScene(name,i){if(S&&!S.photo){const hq=CHAR_HQ[CH_KEYS[S.look||0]];if(hq&&hq[name])return hq[name]}return playerVariant(i)}
const SN_SCENE={short:['wave','outdoor','portrait','phone'],interview:['tv','press','desk','podium'],serious:['podium','desk','tv','docs'],meme:['portrait','phone','outdoor','wave'],attack:['press','podium','docs','tv'],qa:['phone','tv','press','outdoor']};
const SN_PLAT_I={tiktok:0,insta:1,yt:2,x:3};
function snScene(type,plat){const a=SN_SCENE[type]||['portrait'];return a[(SN_PLAT_I[plat]||0)%a.length]}
function psImg(name,i,cls){const src=playerScene(name,i);return src?`<img class="${cls||''}" src="${src}" alt="">`:playerPhoto(cls)}
function pvImg(i,cls){const src=playerVariant(i);return src?`<img class="${cls||''}" src="${src}" alt="">`:playerPhoto(cls)}const LOOK_F=i=>i>=5;
function playerPhoto(cls){if(S&&S.photo)return `<img class="${cls||''}" src="${S.photo}" alt="${esc(S.name)}">`;return PH(LOOK_IMG[(S&&S.look)||0],cls,S?S.name:'')}
function personPhoto(name,cls){
  if(S&&name===S.name)return playerPhoto(cls);
  if(/Картер/.test(name))return PH('carter',cls,name);
  const st=STAFF.find(x=>x.name===name);if(st&&st.img)return PH(st.img,cls,name);
  return avatar(name,64,true).replace('<svg ','<svg class="'+(cls||'')+'" ')}
function effColor(t){return String(t).split(/\s*[·,]\s*/).filter(Boolean).map(p=>`<span class="${/\+/.test(p)&&!/риск/i.test(p)?'up':/−|-\d|риск/i.test(p)?'down':'muted'}">${esc(p)}</span>`).join('<span class="dim"> · </span>')}

/* ---------- shared shell ---------- */
function gameShell(o){
  return `<header class="top"><div class="top-row"><div class="brand"><span class="seal" aria-hidden="true">★</span>Mandate</div><span class="phase-tag">${o.tag}</span><span class="top-date">${o.date}</span><button class="btn ghost mini" data-a="menu">Меню</button></div>${o.stats?`<div class="statbar">${o.stats}</div>`:''}</header>
  <div class="pgrid"><nav class="side-nav card" aria-label="Разделы">${o.nav.map(([k,l,ic,badge])=>`<button class="snav ${o.active===k?'on':''}" data-a="${o.act}" data-v="${k}"><span class="ic">${ic}</span><span class="lbl">${l}</span>${badge?`<span class="nbadge">${badge}</span>`:''}</button>`).join('')}
  ${o.navFoot||''}</nav><section class="card screen" style="min-width:0"><h2 class="scr-title">${o.title}</h2>${o.body}</section></div>`}

/* ---------- campaign ---------- */
const CNAV=[['map','Карта страны','▦'],['plan','План на неделю','☑'],['program','Политическая программа','≡'],['hq','Штаб кандидата','⌂'],['party','Партия и подкуп','♛'],['hire','Найм сотрудников','+'],['groups','Социальные группы','☺'],['social','Социальные сети','▶'],['polls','Опросы','∿'],['finance','Финансирование','$'],['news','Новости','▤']];
const CTITLE={map:'Карта страны (регионы)',plan:'План на неделю',program:'Политическая программа',hq:'Штаб кандидата',party:'Партия: должности и теневые операции',hire:'Найм сотрудников',groups:'Социальные группы',social:'Социальные сети',polls:'Опросы',finance:'Финансирование',news:'Новости',econ:'Экономика'};
function campaignHTML(){
  const cp=S.camp,n=national(true),pl=PL();const h=cp.hist,prev=h.length>1?h[h.length-2]:h[h.length-1];const mr=mainRival();const evp=evProjection(true);
  if(!CTITLE[S.tab])S.tab='map';
  const stats=stat('До выборов',`${cp.left} <small>${plural(cp.left,'день','дня','дней')}</small>`,'hot')+stat('Рейтинг',`${pct(n.player)} <small>${arrow(n.player-(prev.player||0))}</small>`,'you')
   +(mr?stat(`Соперник · ${esc(S.c[mr].short)}`,`${pct(n[mr])} <small>${arrow(n[mr]-(prev[mr]||0))}</small>`,'riv'):'')+stat('Не определились',pct(n.und))+stat('Бюджет',money(S.budget))
   +stat('Доверие',`${Math.round(pl.trust)}<small>/100</small>`)+stat('Узнаваемость',`${Math.round(pl.rec)}<small>/100</small>`)+stat('Время кандидата',`${cp.ap}<small>/${cp.apMax} ч</small>`)+stat('Выборщики',`${evp.player}<small>/270</small>`);
  const nav=CNAV.map(x=>{const b=x[0]==='program'?`${cyclePromises().length}/15`:x[0]==='finance'&&cp.offers&&cp.offers.length?cp.offers.length:'';return [x[0],x[1],x[2],b]});
  const f={map:mapScreen,plan:planScreen,program:programScreen,hq:hqScreen,party:partyScreen,hire:hireScreen,groups:groupsScreen,social:socialScreen,polls:pollsScreen,finance:financeScreen,news:newsScreen,econ:econTab}[S.tab];
  return gameShell({tag:cp.reelect?'Кампания за второй срок':'Предвыборная кампания',date:dstr(curDate())+' · неделя '+(cp.week+1),stats,nav,active:S.tab,act:'tab',title:CTITLE[S.tab],body:f(),
    navFoot:`<div class="sep"></div><button class="snav ${S.tab==='econ'?'on':''}" data-a="tab" data-v="econ"><span class="ic">%</span><span class="lbl">Экономика страны</span></button><button class="btn primary big navbtn" data-a="week">Подтвердить план →</button><div class="muted navnote">Завершить неделю ${cp.week+1}</div>`})}

/* ---------- 5. map ---------- */
function regionCenter(R){return [R.box[0]+R.box[2]/2,R.box[1]+R.box[3]/2]}
function mapArt(selIdx,act){
  const r=mainRival();
  let s=`<div class="mapart"><img src="${IMG.map}" alt="Карта Арданы"><svg viewBox="0 0 433 250" role="img" aria-label="Регионы">`;
  REG.forEach((R,i)=>{s+=`<polygon class="hot ${i===selIdx?'sel':''}" points="${R.hot.map(p=>p.join(',')).join(' ')}" data-a="${act}" data-v="${i}" tabindex="0"><title>${R.name}</title></polygon>`});
  REG.forEach((R,i)=>{const [x,y,w,h]=R.box;const q=polled(i);const p=q.player,c=r?q[r]:0;const bw=w-10;const pw=bw*p/(p+c||1)*.85;
    s+=`<g class="rlab ${i===selIdx?'sel':''}" data-a="${act}" data-v="${i}"><rect x="${x-7}" y="${y-3}" width="${w+14}" height="${h+6}" rx="3"/><text x="${x+w/2}" y="${y+13}" class="rn">${R.name}</text>
    <text x="${x+6}" y="${y+28}" class="rp">${Math.round(p)}%</text><text x="${x+w-6}" y="${y+28}" class="rr">${Math.round(c)}%</text>
    <rect x="${x+5}" y="${y+33}" width="${bw}" height="3.2" rx="1.6" fill="#3a4560"/><rect x="${x+5}" y="${y+33}" width="${pw}" height="3.2" rx="1.6" fill="#3d84ff"/><rect x="${x+5+pw}" y="${y+33}" width="${bw*c/(p+c||1)*.85}" height="3.2" fill="#ff5a4e"/></g>`});
  return s+'</svg></div>'}
function regionZoom(R){const cx=R.box[0]+R.box[2]/2;const cy=R.box[1]+R.box[3]+20>238?R.box[1]-16:R.box[1]+R.box[3]+20;const W=260,H=86,k=3.2;const bw=W*k,bh=bw*250/433;
  const px=clamp(cx/433*bw-W/2,0,bw-W),py=clamp(cy/250*bh-H/2,0,bh-H);
  return `<div class="rzoom" style="background-image:url(${IMG.map});background-size:${bw}px ${bh}px;background-position:-${px}px -${py}px"></div>`}
const ISS_IC={prices:'₴',health:'✚',jobs:'⚒',security:'⛨',ecology:'❦',education:'✎',corruption:'⚖'};
function mapScreen(){
  const i=S.sel,R=REG[i],s=polled(i),st=S.regions[i];const sm=salMap(R);const top=ISS.slice().sort((a,b)=>sm[b]-sm[a]);
  const acts=active().sort((a,b)=>s[b]-s[a]);const margin=s[acts[0]]-s[acts[1]];const lead=acts[0];
  const status=margin<3?'<span class="pill warn">Колеблется</span>':lead==='player'?'<span class="pill you">За вас</span>':`<span class="pill bad">За ${esc(S.c[lead].short)}</span>`;
  const un=R.un+(S.econ.unemp-S.econ0.unemp);
  return `<div class="map-row">${mapArt(i,'sel')}
  <aside class="rpanel"><div class="rp-title">${R.name} регион</div>${regionZoom(R)}
   <div class="rp-list">
    <div><span><i class="ic">☺</i>Население</span><b>${f1(R.pop)} млн</b></div>
    <div><span><i class="ic">☑</i>Явка (прогноз)</span><b>${Math.round(R.turn+st.gotv)}%</b></div>
    <div><span><i class="ic">$</i>ВВП на душу</span><b>$${num(R.gdpc)}</b></div>
    <div><span><i class="ic">⚒</i>Безработица</span><b>${pct(un)}</b></div>
    <div><span><i class="ic">★</i>Выборщиков</span><b>${R.ev}</b></div>
   </div>
   <div class="rp-sub">Главные проблемы:</div>
   <div class="rp-list">${top.slice(0,5).map(x=>`<div><span><i class="ic">${ISS_IC[x]}</i>${ISSUES[x]}</span><b>${Math.round(sm[x]*100)}%</b></div>`).join('')}</div>
   <div class="row between" style="margin-top:8px"><span class="eyebrow">Опрос ±${f1(pollErr())}%</span>${status}</div>
   <div class="shares" style="margin-top:4px">${acts.map(c=>`<div class="sh"><span>${c==='player'?'<b>Вы</b>':esc(S.c[c].short)}</span><span class="bar"><i style="width:${s[c]}%;background:${S.c[c].color}"></i></span><span class="p">${pct(s[c])}</span></div>`).join('')}</div>
   <button class="btn primary wide" data-a="rally" data-v="${i}">Провести митинг</button>
   <div class="muted" style="font-size:12px;text-align:center;margin-top:3px">${money(COST.rally)} · 3 часа${st.flood?' · после наводнения эффект сильнее':''}</div>
   <div class="rp-acts"><button class="btn mini" data-a="ad" data-v="${i}">Реклама · ${money(COST.ad)}</button><button class="btn mini" data-a="neg" data-v="${i}">Негатив · ${money(COST.neg)}</button></div>${cashInfo(i)}
  </aside></div>`}

/* ---------- 6. weekly plan ---------- */
const PLAN=[
 {id:'ads',name:'Реклама',amt:300e3,col:'#1f6fff',d:'+1,2 к поддержке в трёх самых спорных регионах'},
 {id:'social',name:'Соцсети',amt:150e3,col:'#3fcf7f',d:'Узнаваемость +0,8, молодёжь +0,6'},
 {id:'rallies',name:'Митинги',amt:200e3,col:'#ff5a4e',d:'+1,5 в регионах, где вы провели митинг на этой неделе'},
 {id:'vol',name:'Волонтёры',amt:100e3,col:'#9aa7bd',d:'Мобилизация +0,15 во всех регионах'},
 {id:'research',name:'Исследования',amt:50e3,col:'#8fb4ff',d:'Точный опрос на следующей неделе'},
 {id:'reserve',name:'Резерв',amt:200e3,col:'#f4b740',d:'Не тратится. Ущерб от скандалов −15%'},
];
function planState(){S.camp.plan=S.camp.plan||{ads:true,social:true,rallies:false,vol:true,research:false,reserve:true};return S.camp.plan}
A.planT=v=>{const p=planState();p[v]=!p[v];render()};
function applyPlan(){
  const p=planState(),cp=S.camp;let cost=0;
  if(p.ads&&S.budget>=300e3){cost+=300e3;const order=REG.map((R,i)=>{const s=shares(i);const r=mainRival();return[i,Math.abs(s.player-(r?s[r]:0))]}).sort((a,b)=>a[1]-b[1]).slice(0,3);order.forEach(([i])=>S.regions[i].effort.player+=1.2*(1+fx('ad')))}
  if(p.social&&S.budget-cost>=150e3){cost+=150e3;recUp(.8);S.gmod=S.gmod||{};S.gmod.youth=(S.gmod.youth||0)+.6}
  if(p.rallies&&S.budget-cost>=200e3){cost+=200e3;(cp.rallied||[]).forEach(i=>S.regions[i].effort.player+=1.5)}
  if(p.vol&&S.budget-cost>=100e3){cost+=100e3;S.regions.forEach(r=>r.gotv=Math.min(4,r.gotv+.15*(1+fx('gotv'))))}
  if(p.research&&S.budget-cost>=50e3){cost+=50e3;cp.researchNext=true}
  S.flags.reserve=!!p.reserve&&S.budget-cost>=200e3;
  S.budget-=cost;cp.rallied=[];cp.planCost=cost;
}
const _nextWeek=nextWeek;
A.week=()=>{if(S.queue.length)return pump();applyPlan();_nextWeek();if(S.camp&&S.camp.researchNext){S.camp.researchNext=false;S.camp.precise=true;regenNoise()}};
const _hurt=hurt;hurt=function(v,mit=1){return _hurt(v*(S&&S.flags.reserve?.85:1),mit)};
const _rally=A.rally;A.rally=v=>{const before=S.camp.ap;_rally(v);if(S.camp.ap<before){S.camp.rallied=S.camp.rallied||[];S.camp.rallied.push(+v)}};
let DEBPREP=0;A.prep=()=>{if(!spend(4,0))return;S.camp.prep=(S.camp.prep||0)+.35;toast('Штаб устроил репетицию дебатов: +0,35 к результату ближайших дебатов.');after()};
function planScreen(){
  const p=planState(),cp=S.camp;const tot=PLAN.reduce((a,x)=>a+(p[x.id]?x.amt:0),0);
  const R=REG[S.sel];
  const hrow=(a,ic,name,h,v,dis)=>`<button class="hrow" data-a="${a}" ${v!=null?`data-v="${v}"`:''} ${dis||cp.ap<h?'disabled':''}><span class="hic">${ic}</span><span class="hn">${name}</span><b>${h}</b></button>`;
  return `<div class="plan2">
   <div class="pbox"><div class="pbox-h"><span>Бюджет:</span><b>${money(S.budget)}</b></div>
    ${PLAN.map(x=>`<button class="prow2" data-a="planT" data-v="${x.id}"><span class="cb ${p[x.id]?'on':''}" style="--c:${x.col}">${p[x.id]?'✓':''}</span><span class="pn"><b>${x.name}</b><small>${x.d}</small></span><b class="num">${money(x.amt)}</b></button>`).join('')}
    <div class="pbox-f"><span>Расходы недели</span><b>${money(tot-(p.reserve?200e3:0))}</b></div></div>
   <div class="pbox"><div class="pbox-h"><span>Время кандидата:</span><b>${cp.ap}/${cp.apMax}</b></div>
    <div class="eyebrow" style="padding:8px 12px 2px">Действия кандидата</div>
    ${hrow('rally','⌖',`Поездка в регион · ${R.name}`,3,S.sel)}
    ${hrow('interview','▣','ТВ интервью',2)}
    ${hrow('prep','◎','Подготовка к дебатам',4,null,!cp.debates.some(d=>!d.done))}
    ${hrow('meet','☺','Встреча с бизнесом',2,'biz')}
    ${hrow('fund','✦','Вечернее собрание с донорами',1)}
    ${hrow('gotv','⚑',`Волонтёрский выезд · ${R.name}`,2,S.sel)}
    ${hrow('speech','≡','Программная речь',2)}
    ${hrow('oppo','⌕','Оппо-исследование',1,null,!has('research'))}
    ${rivalsActive().filter(c=>S.c[c].dirt).map(c=>hrow('leak','!',`Слить компромат на ${S.c[c].short}`,1,c)).join('')}
    <div class="eyebrow" style="padding:10px 12px 2px">Без участия кандидата</div>
    <button class="hrow" data-a="natad"><span class="hic">▶</span><span class="hn">Национальная ТВ-реклама</span><b class="mono">${money(COST.natad)}</b></button>
    <button class="hrow" data-a="poll"><span class="hic">∿</span><span class="hn">Заказать опрос</span><b class="mono">${money(COST.poll)}</b></button>
   </div></div>
  <button class="btn primary big wide" data-a="week">Подтвердить план</button>
  <p class="muted" style="font-size:12.5px;text-align:center;margin:6px 0 0">Отмеченные статьи бюджета спишутся при подтверждении. Регион для поездки выбирается на карте.</p>`}

/* ---------- 7. program ---------- */
const POLICY=[
 {cat:'Экономика',topic:'Экономическая политика',opts:[{p:'jobs500',e:'Рабочие +6% · Бюджет −7%'},{p:'infl3',e:'Пенсионеры +4% · Бизнес +2%'},{p:null,e:'Минимальные изменения'}],g:{jobs500:{workers:3},infl3:{pens:2,biz:1}}},
 {cat:'Налоги',topic:'Налоговая политика',opts:[{p:'smallbiz',t:'Снизить налоги для бизнеса',e:'Бизнес +5% · Бюджет −8% · Бюджетники −3%'},{p:'richtax',e:'Молодёжь +4% · Бюджет +5% · Богатые −6%'},{p:'notax',t:'Оставить без изменений',e:'Бизнес +2% · ограничивает бюджет'}],g:{smallbiz:{biz:2.5,civil:-1.5},richtax:{youth:2,biz:-3},notax:{biz:1}}},
 {cat:'Медицина',topic:'Здравоохранение',opts:[{p:'hosp20',e:'Пенсионеры +5% · Семьи +3% · Бюджет −2%'},{p:'drugs',e:'Пенсионеры +7% · Бюджет −4%'},{p:null,e:'Минимальные изменения'}],g:{hosp20:{pens:2.5,fam:1.5},drugs:{pens:3.5}}},
 {cat:'Образование',topic:'Школы и учителя',opts:[{p:'teachers',e:'Бюджетники +6% · Семьи +3% · Бюджет −5%'},{p:'schools',e:'Семьи +5% · Бюджет −2%'},{p:null,e:'Минимальные изменения'}],g:{teachers:{civil:3,fam:1.5},schools:{fam:2.5}}},
 {cat:'Экология',topic:'Энергетика и природа',opts:[{p:'green',e:'Молодёжь +6% · Студенты +4% · Рабочие −2%'},{p:'coal',e:'Молодёжь +5% · Рабочие −6%'},{p:null,e:'Рабочие +1%'}],g:{green:{youth:3,students:2,workers:-1},coal:{youth:2.5,workers:-3}}},
 {cat:'Безопасность',topic:'Полиция и армия',opts:[{p:'police',e:'Пенсионеры +3% · Госслужащие +2% · Бюджет −3%'},{p:'army',e:'Рабочие +2% · Бюджет −5%'},{p:null,e:'Минимальные изменения'}],g:{police:{pens:1.5,civil:1},army:{workers:1}}},
 {cat:'Пенсии',topic:'Пенсионная политика',opts:[{p:'pension',e:'Пенсионеры +8% · Бюджет −6%'},{p:'nodebt',t:'Не повышать государственный долг',e:'Бизнес +3% · ограничивает расходы'},{p:null,e:'Минимальные изменения'}],g:{pension:{pens:4},nodebt:{biz:1.5}}},
 {cat:'Инфраструктура',topic:'Дороги и транспорт',opts:[{p:'transport',e:'Фермеры +4% · Рабочие +3% · Бюджет −2%'},{p:null,e:'Минимальные изменения'}],g:{transport:{farm:2,workers:1.5}}},
 {cat:'Внешняя политика',topic:'Торговля и соседи',opts:[{p:'trade',e:'Бизнес +5% · Фермеры −2%'},{p:null,e:'Минимальные изменения'}],g:{trade:{biz:2.5,farm:-1}}},
 {cat:'Антикоррупция',topic:'Чистое государство',opts:[{p:'anticorr',e:'Молодёжь +4% · Бизнес +2% · Доверие +'},{p:'contracts',e:'Студенты +3% · Доверие +'},{p:null,e:'Минимальные изменения'}],g:{anticorr:{youth:2,biz:1},contracts:{students:1.5}}},
 {cat:'Цены',topic:'Тарифы и цены',opts:[{p:'tariffs',e:'Пенсионеры +5% · Семьи +4% · Бюджет −6%'},{p:null,e:'Минимальные изменения'}],g:{tariffs:{pens:2.5,fam:2}}},
];
function progState(){S.prog=S.prog||{cat:1,opt:0};return S.prog}
A.progCat=v=>{const p=progState();p.cat=+v;p.opt=0;render()};
A.progOpt=v=>{progState().opt=+v;render()};
A.progAdd=()=>{const p=progState(),P=POLICY[p.cat],o=P.opts[p.opt];if(!o.p){toast('Этот вариант ничего не меняет в программе.');return}
  if(cyclePromises().some(x=>x.id===o.p)){toast('Это уже есть в вашей программе.');return}
  if(cyclePromises().length>=15){toast('В программе максимум 15 обещаний.');return}
  if(!spend(2,COST.speech))return;S.gmod=S.gmod||{};const g=P.g[o.p]||{};for(const k in g)S.gmod[k]=(S.gmod[k]||0)+g[k];makePromise(o.p,false)};
A.progMore=()=>{const ps=cyclePromises();modal(`<div class="mhead"><span class="kicker blue">Программа</span><h2>Мои обещания (${ps.length}/15)</h2></div><div class="mbody"><div class="kv"><span>Суммарная стоимость: <b class="${promisedCost()>40?'down':''}">$${f1(promisedCost())} млрд</b></span><span>Порог доверия экспертов: <b>$40 млрд</b></span></div>
  <div class="list">${ps.map(p=>{const d=PROM_BY[p.id];return `<div class="item promise"><span class="pnum">№${p.n}</span><div><b>«${esc(d.text)}»</b>${p.deal?' <span class="pill warn">Сделка</span>':''}<div class="kv"><span>Стоимость: <b>${d.costT}</b></span><span>Срок: <b>${d.term}</b></span><span>Популярность: <b>+${f1(d.pop)}%</b></span></div></div></div>`}).join('')||'<p class="muted">Программа пока пуста.</p>'}</div><button class="btn primary" data-a="close">Закрыть</button></div>`)};
function programScreen(){
  const p=progState(),P=POLICY[p.cat];const made=new Set(cyclePromises().map(x=>x.id));
  const all=[];POLICY.forEach(c=>c.opts.forEach(o=>{if(o.p&&!all.includes(o.p))all.push(o.p)}));
  const list=[...cyclePromises().map(x=>x.id),...all.filter(x=>!made.has(x))].slice(0,15);
  return `<div class="prog">
   <div class="pcats">${POLICY.map((c,i)=>`<button class="pcat ${p.cat===i?'on':''}" data-a="progCat" data-v="${i}">${c.cat}${c.opts.some(o=>o.p&&made.has(o.p))?' <span class="up">✓</span>':''}</button>`).join('')}</div>
   <div class="ptopic"><div class="pt-h">${P.topic}</div>
    ${P.opts.map((o,j)=>{const d=o.p?PROM_BY[o.p]:null;const isMade=o.p&&made.has(o.p);return `<button class="popt ${p.opt===j?'on':''}" data-a="progOpt" data-v="${j}"><span class="rad"></span><span><b>${esc(o.t||(d?d.text:'Оставить без изменений'))}</b>${isMade?' <span class="pill good">в программе</span>':''}<span class="peff">${effColor(o.e)}</span>${d?`<small class="muted">Стоимость: ${d.costT} · срок: ${d.term}</small>`:''}</span></button>`}).join('')}
    <button class="btn primary wide" data-a="progAdd">Добавить в программу</button><div class="muted" style="font-size:12px;text-align:center;margin-top:4px">Программная речь: 2 часа и ${money(COST.speech)}. Обещание придётся выполнять после победы.</div></div>
   <div class="pmine"><div class="pt-h">Мои обещания (${made.size}/15)</div>
    ${list.map(id=>`<div class="pchk"><span class="cb ${made.has(id)?'on':''}" style="--c:#1f6fff">${made.has(id)?'✓':''}</span>${esc(PROM_BY[id].text)}</div>`).join('')}
    <button class="btn wide" data-a="progMore">Подробнее</button></div></div>`}

/* ---------- 3. HQ ---------- */
function hqScreen(){
  const n=S.staff.length;const pay=S.staff.reduce((a,id)=>a+STAFF_BY[id].salary,0);const eff=clamp(40+n*5+(has('mgr_k')?12:has('mgr_s')?7:0)+(has('analyst')?4:0),0,99);
  const lvl=['Арендованная комната','Офис на этаже','Штаб-квартира','Штаб с ситуационным центром'][n<=1?0:n<=3?1:n<=6?2:3];
  return `<div class="hq-photo">${PH('hq','','Штаб кандидата')}<div class="hq-ov"><div><span>Работники</span><b>${n}/${STAFF.length}</b></div><div><span>Месячные расходы</span><b>${money(pay)}</b></div><div><span>Эффективность штаба</span><b>${eff}%</b></div></div><div class="hq-lvl">${lvl}</div></div>
  <div class="hq-links">${[['hire','☺','Сотрудники',`${n} в команде`],['finance','$','Бюджет',money(S.budget)],['plan','☑','План кампании',`${S.camp.ap}/${S.camp.apMax} ч свободно`],['polls','∿','Исследования',`погрешность ±${f1(pollErr())}%`],['news','▤','PR / СМИ',`${S.news.length} публикаций`],['social','▶','Соцсети',has('smm')?'команда «Пиксель»':'нет команды'],['groups','⚑','Волонтёры',has('field')?'40 координаторов':'не организованы'],['econ','⌂','Логистика',`неделя ${S.camp.week+1}`]].map(([t,ic,l,v])=>`<button class="hql" data-a="tab" data-v="${t}"><span class="hic">${ic}</span><span><b>${l}</b><small>${v}</small></span></button>`).join('')}</div>
  <div class="eyebrow" style="margin-top:12px">Команда</div><div class="team">${S.staff.length?S.staff.map(id=>{const s=STAFF_BY[id];return `<div class="tm">${PH(s.img,'tm-ph',s.name)}<b>${esc(s.name)}</b><small>${s.role}</small></div>`}).join(''):'<p class="muted">Вы работаете в одиночку. Наймите первых сотрудников.</p>'}</div>`}

/* ---------- 4. hiring ---------- */
function hireScreen(){
  const f=S.hqf||'all';const tabs=[['all','Все'],['pt','Политтехнологи'],['an','Аналитики'],['smm','SMM'],['law','Юристы'],['pr','PR']];
  const list=STAFF.filter(s=>f==='all'||s.cat===f);
  const perk=p=>{const m=p.match(/^(.*?)\s([+−-][\d,]+%?.*)$/);return m?`<div class="pk"><span>${esc(m[1])}</span><b class="up">${esc(m[2])}</b></div>`:`<div class="pk"><span>${esc(p)}</span></div>`};
  return `<div class="tabs sub">${tabs.map(([k,l])=>`<button class="tab ${f===k?'on':''}" data-a="hqf" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="list">${list.map(s=>{const h=has(s.id);const taken=!h&&S.staff.some(id=>STAFF_BY[id].role===s.role);
   return `<div class="hire ${h?'hired':''}">${PH(s.img,'hire-ph',s.name)}<div class="hire-b"><div class="row between"><b class="sname">${esc(s.name)}</b><span class="hire-sal">${money(s.salary).replace(' тыс.',' 000')}/мес</span></div><div class="muted" style="font-size:13px">${s.role} · опыт ${'●'.repeat(s.exp)}${'○'.repeat(5-s.exp)}</div>
   <div class="pks">${s.perks.map(perk).join('')}${s.risk?`<div class="pk"><span>Риск скандалов</span><b class="down">+${s.risk}%</b></div>`:''}</div></div>
   <div>${h?`<button class="btn danger" data-a="fireStaff" data-v="${s.id}">Уволить</button>`:`<button class="btn ${taken?'':'primary'}" data-a="hire" data-v="${s.id}" ${taken?'disabled':''}>${taken?'Занято':'Нанять'}</button>`}</div></div>`}).join('')}</div>`}

/* ---------- 8. social groups ---------- */
const GROUP_META={youth:{ic:'☺',tags:['18-25']},students:{ic:'✎',tags:['18-25','students']},biz:{ic:'$',tags:['26-40','41-60','biz']},workers:{ic:'⚒',tags:['26-40','41-60','work']},civil:{ic:'▣',tags:['41-60']},pens:{ic:'♥',tags:['60+']},farm:{ic:'❦',tags:['41-60','work']},fam:{ic:'⌂',tags:['26-40']}};
function groupsScreen(){
  const f=S.gf||'all';const r=mainRival();const tabs=[['all','Все'],['18-25','18–25'],['26-40','26–40'],['41-60','41–60'],['60+','60+'],['students','Студенты'],['biz','Бизнес'],['work','Рабочие']];
  const gs=GROUPS.filter(g=>f==='all'||GROUP_META[g.id].tags.includes(f));
  return `<div class="tabs sub">${tabs.map(([k,l])=>`<button class="tab ${f===k?'on':''}" data-a="gf" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="grp-head"><span></span><span>Ваша поддержка</span><span class="r">Вы</span><span class="r">${r?esc(S.c[r].short):'Соперник'}</span><span></span></div>
  <div class="list" style="gap:4px">${gs.map(g=>{const s=groupSupport(g);return `<div class="grp"><span><i class="gic">${GROUP_META[g.id].ic}</i>${g.name}</span><span class="bar"><i style="width:${s.p}%"></i></span><b class="r up num">${pct(s.p)}</b><b class="r down num">${pct(s.r)}</b><button class="btn mini" data-a="meet" data-v="${g.id}">Встреча · 2 ч</button></div>`}).join('')}</div>
  <p class="muted" style="font-size:13px">Встреча стоит $100 тыс. и 2 часа. Поддержка групп растёт от обещаний, которые совпадают с их интересами.</p>`}
A.gf=v=>{S.gf=v;render()};

/* ---------- 9. social networks ---------- */
function socialScreen(){
  const sn=snState(),P=PLATS[sn.plat],L=sn.last;
  return `<div class="tabs sub">${Object.entries(PLATS).map(([k,p])=>`<button class="tab ${sn.plat===k?'on':''}" data-a="snPlat" data-v="${k}">${p.name}</button>`).join('')}</div>
  <div class="sn-grid"><div>
   <div class="vid">${psImg(snScene(sn.type,sn.plat),SN_PLAT_I[sn.plat]*6+Object.keys(CONTENT).indexOf(sn.type),'vid-bg')}${psImg(snScene(sn.type,sn.plat),SN_PLAT_I[sn.plat]*6+Object.keys(CONTENT).indexOf(sn.type),'vid-fg')}<span class="vid-plat">Предпросмотр · ${P.name}</span><div class="vid-side"><span><i style="color:#ff4d6d">♥</i>${L?kfmt(L.likes):'—'}</span><span><i>✉</i>${L?kfmt(L.likes/9):'—'}</span><span><i>↗</i>${L?kfmt(L.shares):'—'}</span></div>
   <div class="vid-cap"><b>${CONTENT[sn.type].name}</b> · ${P.name}${L?` <span class="muted">· последний пост: ${kfmt(L.views)} просмотров</span>`:''}</div></div>
   <div class="eyebrow" style="margin-top:10px">Ваши публикации</div>
   <div class="vposts">${(sn.hist||[]).length?sn.hist.slice(0,5).map((h,i)=>`<div class="vpost">${h.scene?psImg(h.scene,i,''):pvImg(h.ph!=null?h.ph:i*3+1,'')}<div class="vp-ov"><b>${kfmt(h.views)}</b><small>${PLATS[h.plat].name} · ${CONTENT[h.type].name}</small></div></div>`).join(''):'<p class="muted" style="font-size:13px;margin:4px 0 0">Пока ничего не опубликовано.</p>'}</div></div>
  <div class="snbox"><div class="pt-h">Тип контента</div><div class="radios">${Object.entries(CONTENT).map(([k,c])=>{const f=P.fit[k]||1;return `<button class="radio ${sn.type===k?'on':''}" data-a="snType" data-v="${k}"><i></i>${c.name}${f>1?' <span class="up">▲</span>':f<1?' <span class="down">▼</span>':''}</button>`}).join('')}</div>
   <button class="btn primary wide" data-a="snPost">Опубликовать</button>
   <p class="muted" style="font-size:12px;margin:6px 0 0">$50 тыс. · 1 час. ▲ формат хорошо работает в ${P.name}. Доля молодёжи: ${Math.round(P.youth*100)}%.${has('smm')?' SMM-команда: охват +60%.':''}</p></div></div>`}

/* ---------- 13. polls ---------- */
function pollChart(){
  const h=S.camp.hist;const W=520,H=200,pl=36;const n=Math.max(h.length,2);const xs=i=>pl+i*(W-pl-10)/(n-1);const ys=v=>H-22-v/60*(H-34);
  let s=`<svg class="spark chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика рейтинга">`;
  [0,20,40,60].forEach(v=>{s+=`<line x1="${pl}" x2="${W-10}" y1="${ys(v)}" y2="${ys(v)}" stroke="var(--line)"/><text x="2" y="${ys(v)+4}">${v}%</text>`});
  for(let w=4;w<n;w+=4)s+=`<text x="${xs(w)-20}" y="${H-4}">${w} ${plural(w,'неделя','недели','недель')}</text>`;
  const order=[...S.order];
  for(const c of order){const pts=h.map((p,i)=>p[c]==null?null:[xs(i),ys(p[c])]).filter(Boolean);if(!pts.length)continue;
    s+=`<polyline fill="none" stroke="${S.c[c].color}" stroke-width="${c==='player'?2.6:1.8}" points="${pts.map(p=>p.join(',')).join(' ')}" opacity="${S.c[c].out?.35:1}"/>`;pts.forEach((p,j)=>{if(j%2===0||j===pts.length-1)s+=`<circle cx="${p[0]}" cy="${p[1]}" r="2.6" fill="${S.c[c].color}"/>`})}
  const und=h.map((p,i)=>[xs(i),ys(p.und)]);s+=`<polyline fill="none" stroke="#c9d2e3" stroke-width="1.6" stroke-dasharray="4 3" points="${und.map(p=>p.join(',')).join(' ')}"/>`;
  return s+'</svg>'}
function pollsScreen(){
  const sub=S.pollTab||'nat';const n=national(true);const h=S.camp.hist;const prev=h.length>1?h[h.length-2]:h[0];let body='';
  if(sub==='nat'){const act=S.order.slice().sort((a,b)=>(S.c[a].out-S.c[b].out)||n[b]-n[a]);
    body=`<div class="poll-grid">${pollChart()}<div class="leg">${act.map(c=>`<div><span><i class="dot" style="background:${S.c[c].color}"></i>${esc(S.c[c].short)}</span><b class="num">${S.c[c].out?'снялся':pct(n[c])}</b>${S.c[c].out?'':`<small class="${n[c]-(prev[c]||0)>=0?'up':'down'}">(${sgn(n[c]-(prev[c]||0))})</small>`}</div>`).join('')}<div><span><i class="dot" style="background:#c9d2e3"></i>Не определились</span><b class="num">${pct(n.und)}</b><small></small></div></div></div>
    <div class="muted" style="font-size:12.5px">Погрешность ±${f1(pollErr())}%. Точнее — с аналитиком в штабе или после заказа опроса.</div>
    <div class="grid3" style="margin-top:12px">${S.order.filter(c=>c!=='player').map(c=>{const k=S.c[c];return `<div class="item" style="${k.out?'opacity:.5':''}"><div class="row" style="gap:10px">${personPhoto(k.name,'mini-ph')}<div><b style="color:${k.color}">${esc(k.name)}</b><div class="eyebrow">${esc(k.party)}</div></div></div><div class="kv" style="margin-top:6px"><span>Доверие <b>${Math.round(k.trust)}</b></span><span>Узнаваемость <b>${Math.round(k.rec)}</b></span>${k.dirt?`<span class="up">компромат: ${k.dirt}</span>`:''}</div></div>`}).join('')}</div>`}
  else if(sub==='reg'){const r=mainRival();body=`<div class="tblwrap"><table class="tbl"><tr><th>Регион</th><th class="r">Выб.</th><th class="r">Вы</th><th class="r">${r?esc(S.c[r].short):''}</th><th class="r">Не опр.</th><th></th></tr>${REG.map((R,i)=>{const s=polled(i);const m=s.player-(r?s[r]:0);return `<tr><td><button class="linkbtn" data-a="selMap" data-v="${i}">${R.name}</button></td><td class="r">${R.ev}</td><td class="r" style="color:var(--you)">${pct(s.player)}</td><td class="r" style="color:var(--rival)">${r?pct(s[r]):''}</td><td class="r">${pct(s.und)}</td><td>${Math.abs(m)<3?'<span class="pill warn">колеблется</span>':m>0?'<span class="pill you">ваш</span>':'<span class="pill bad">соперника</span>'}</td></tr>`}).join('')}</table></div>`}
  else body=groupsScreen();
  return `<div class="tabs sub">${[['nat','Национальный'],['reg','Регионы'],['grp','Соц. группы']].map(([k,l])=>`<button class="tab ${sub===k?'on':''}" data-a="pollTab" data-v="${k}">${l}</button>`).join('')}</div>${body}`}
A.selMap=v=>{S.sel=+v;S.tab='map';render()};

/* ---------- 14. finance ---------- */
function financeScreen(){
  const cp=S.camp;if(!cp.offers)genOffers();const f=S.ff||'all';const tabs=[['all','Все'],['Крупные доноры','Крупные доноры'],['Бизнес','Бизнес'],['Граждане','Граждане']];
  const offs=cp.offers.map((o,i)=>[o,i]).filter(([o])=>f==='all'||o.kind===f);
  return `<div class="tabs sub">${tabs.map(([k,l])=>`<button class="tab ${f===k?'on':''}" data-a="ff" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="kv" style="margin-bottom:8px"><span>Бюджет: <b>${money(S.budget)}</b></span><span>Пожертвования за неделю: <b>${money(cp.lastIncome)}</b></span><span>Зарплаты: <b>${money(cp.lastSalary)}</b></span><span>Риск доноров: <b class="${(S.flags.donorRisk||0)>3?'down':''}">${S.flags.donorRisk||0}</b></span></div>
  <div class="list" style="gap:4px">${offs.length?offs.map(([o,i])=>`<div class="fin"><div><b>${esc(o.name)}</b><div style="font-size:12.5px"><span class="up">+ Бюджет</span>${o.risk?' · <span class="down">Риск скандала</span>':''}${o.tag&&!/Риск|Нейтрально/.test(o.tag)?` · ${effColor(o.tag)}`:o.tag==='Нейтрально'?' · <span class="muted">Нейтрально</span>':''}</div></div><b class="num fin-amt">${money(o.amt)}</b><button class="btn good" data-a="offer" data-v="${i}">Принять</button></div>`).join(''):'<p class="muted">Новых предложений нет. Они появятся на следующей неделе.</p>'}</div>
  <div class="fin" style="margin-top:8px"><div><b>Отказаться от всех предложений</b><div style="font-size:12.5px"><span class="up">+ Репутация</span></div></div><span></span><button class="btn" data-a="refuseAll" ${!cp.offers.length||cp.refused?'disabled':''}>Отказаться</button></div>`}
A.ff=v=>{S.ff=v;render()};

/* ---------- 10. news ---------- */
function newsScreen(){
  const ns=S.news;if(!ns.length)return '<p class="muted">Новостей пока нет.</p>';
  const top=ns.find(n=>['econ','scandal','gaffe','poll','pres'].includes(n.tag))||ns[0];const rest=ns.filter(n=>n!==top);
  const ago=i=>['2 часа назад','5 часов назад','8 часов назад'][i];
  return `<div class="tv2">${PH('anchor','','Ведущая')}<span class="tv-brk2">Breaking news</span><span class="tv-live2">● LIVE</span><div class="tv-ch"><div class="tv-head">${esc(top.t)}</div><div class="tv-sub">${esc(top.d)} · «Ардания-24»</div></div></div>
  <div class="ncards">${rest.slice(0,3).map((n,i)=>`<div class="ncard">${S&&PL()&&n.t.includes(PL().short)?pvImg(hashStr(n.t),''):PH(['result','eday','scandal'][i],'','')}<div class="nc-b"><div style="font-size:13.5px;line-height:1.3">${esc(n.t)}</div><small class="muted">${ago(i)}</small></div></div>`).join('')}</div>
  <div class="feed" style="max-height:320px;margin-top:10px">${rest.slice(3,50).map(n=>`<div class="${n.tag==='scandal'||n.tag==='gaffe'?'call':''}"><span class="dim mono" style="font-size:11px">${esc(n.d)}</span> · ${esc(n.t)}</div>`).join('')}</div>`}
function newsTab(){return newsScreen()}

/* ---------- 11. scandals & events modal ---------- */
function eventPhoto(d){const k=d.kicker||'';if(/расслед|Скандал|Утечка|Слухи|Дезинф|Срочно|Оговорка|скандал|Угроза|Покушение/i.test(k))return 'scandal';if(/Экстренное|Последствия|Конфликт в прав/.test(k))return 'office';if(/Интервью/.test(k))return 'anchor';if(/Переговоры|Снятие|Поддержка/.test(k))return 'debate';if(/Финал|Протест/.test(k))return 'eday';if(/Экономика|Стихийное|Опрос/.test(k))return 'n2';return null}
function showChoice(){
  const d=CUR;const ph=eventPhoto(d);setTimeout(()=>eventFx(d),60);
  const adv=d.advisors?`<div class="stack">${d.advisors.map(a=>`<div class="advisor"><div class="avatar">${initials(a.who)}</div><div><div class="eyebrow">${esc(a.role)} · ${esc(a.who)}</div><div class="quote">«${esc(a.say)}»</div></div></div>`).join('')}</div>`:'';
  modal(`${ph?`<div class="ev-photo">${PH(ph,'','')}</div>`:''}<div class="mhead"><span class="kicker ${d.kc||''}">${esc(d.kicker)}</span><h2>${esc(d.title)}</h2></div><div class="mbody"><div class="ev-text">${d.text}</div>${adv}
  <div class="evch">${d.choices.map((c,i)=>`<button class="evrow" data-a="choose" data-v="${i}"><span class="evn">${i+1}</span><b>${esc(c.label)}</b><span class="eve">${c.hint?effColor(c.hint):''}</span></button>`).join('')}</div>${d.cancel?'<button class="btn ghost" data-a="close">Закрыть</button>':''}</div>`,!!d.advisors);
}

/* ---------- 12. debate ---------- */
function debHead(){const k=S.c[DB.r];return `<div class="deb-photo"><div class="deb-split">${psImg(DB.i%2?'podium':'tv',DB.n*3+DB.i,'')}${personPhoto(k.name,'')}</div><span id="deb-t" class="deb-t">00:20</span><span class="deb-tag">Дебаты №${DB.n} · вопрос ${DB.i+1}/${DB.rounds.length}</span>
  <div class="deb-meter"><span>${esc(PL().short)}</span><div class="evbar" style="height:8px;flex:1"><i style="width:${clamp(50+DB.score*12,5,95)}%;background:var(--you)"></i><i style="flex:1;background:${k.color}"></i><span class="mid"></span></div><span style="color:${k.color}">${esc(k.short)}</span></div></div>`}
function debRound(){
  const rd=DB.rounds[DB.i],k=S.c[DB.r];let q,line,opts,topic;
  if(rd.attack){topic='Обещания';q=`${k.short}: «Четыре года назад президент обещал: ${PROM_BY[rd.attack.id].text.toLowerCase()}. ${promiseLine(rd.attack)}» Как вы это объясните?`;
    opts=[['admit','Признать и объяснить','Честно, но без блеска'],['achieve','Перевести на достижения','Если достижений много'],['deny','Отрицать','Факт легко проверить'],['counter','Атаковать в ответ','Лотерея']];}
  else{topic=ISSUES[rd.iss];q=`${QUESTIONS[rd.iss]} ${k.short} уже ответил: «${RIVAL_LINES[rd.iss]}»`;
    opts=[['facts','Навести конкретные цифры',`Сила в теме ${Math.round(PL().issues[rd.iss])} · компетентность ${Math.round(PL().comp||60)}`],['attack','Атаковать оппонента',k.dirt?'Есть компромат':'Без компромата рискованно'],['evade','Уйти от ответа','Безопасно и бесполезно'],['story','Пошутить',`Харизма ${Math.round(PL().cha||60)}`]];}
  modal(debHead()+`<div class="mbody"><div class="deb-topic">${topic}</div><p class="deb-q">${esc(q)}</p>
  <div class="deb-grid">${opts.map((o,i)=>`<button class="deb-opt" data-a="debPick" data-v="${o[0]}"><span class="n">${i+1}</span><span><b>${o[1]}</b><span class="h">${o[2]}</span></span></button>`).join('')}</div><p class="muted" style="font-size:12px;margin:0">20 секунд на ответ. Молчание засчитывается как уход от ответа. Клавиши 1–4.</p></div>`,true);
  debTimerStart(rd.attack?'admit':'evade');
}
const _debPick=A.debPick;A.debPick=(v,a,b,c)=>{if(DB&&DB.i===DB.rounds.length-1&&S.camp&&S.camp.prep){DB.score+=S.camp.prep;S.camp.prep=0}_debPick(v,a,b,c)};

/* ---------- 1. main menu ---------- */
function menuHTML(){
  const sv=loadSave();
  return `<section class="menu1">${PH('menu','menu-bg','')}<div class="menu-shade"></div><div class="menu-in">
   <div class="logo">Mandate</div>
   <nav class="menu-nav">
    <button class="mbtn" data-a="goSetup"><span class="ic">⌂</span>Новая игра</button>
    <button class="mbtn" data-a="continue" ${sv&&sv.phase?'':'disabled'}><span class="ic">↻</span>Продолжить${sv&&sv.phase?`<small>${esc(sv.name)}</small>`:''}</button>
    <button class="mbtn" data-a="settings"><span class="ic">⚙</span>Настройки</button>
    <button class="mbtn" data-a="achievements"><span class="ic">★</span>Достижения</button>
    <button class="mbtn" data-a="howto"><span class="ic">?</span>Как играть</button>
   </nav></div></section>
  <section id="setup" class="card setup2">${setupInner()}</section>`}
A.goSetup=()=>{const el=$('#setup');if(el)el.scrollIntoView({behavior:'smooth'})};
function settingsGet(){try{return JSON.parse(localStorage.getItem('mandat-settings')||'{}')}catch(e){return {}}}
function settingsSet(o){try{localStorage.setItem('mandat-settings',JSON.stringify(o))}catch(e){}}
A.settings=()=>{const st=settingsGet();modal(`<div class="mhead"><span class="kicker blue">Настройки</span><h2>Настройки игры</h2></div><div class="mbody">
  <button class="toggle btn ghost" data-a="setT" data-v="fastNight"><span class="sw ${st.fastNight?'on':''}"></span>Быстрая ночь выборов (сразу ×3)</button>
  <button class="toggle btn ghost" data-a="setT" data-v="noTimer"><span class="sw ${st.noTimer?'on':''}"></span>Без таймера на дебатах</button>
  <button class="btn danger" data-a="restartAsk">Удалить сохранение</button><button class="btn primary" data-a="close">Готово</button></div>`)};
A.setT=v=>{const st=settingsGet();st[v]=!st[v];settingsSet(st);A.settings()};
const ACH=[['first','Первая победа','Выиграть президентские выборы',C=>C.elections.some(e=>e.won)],['two','Два срока','Переизбраться на второй срок',C=>C.elections.filter(e=>e.won).length>=2],['word','Человек слова','Выполнить не меньше 80% обещаний за срок',C=>C.terms.some(t=>t.promises.length>=3&&t.kept/t.promises.length>=.8)],['land','Разгром','Набрать 400+ выборщиков',C=>C.elections.some(e=>e.evP>=400)],['photo','Фотофиниш','Победить с перевесом меньше 2% голосов',C=>C.elections.some(e=>e.won&&e.pvP-e.pvR<2)],['laws','Законодатель','Принять 8 законов',C=>C.laws.length>=8],['pop','Любимец нации','Закончить срок с одобрением выше 60%',C=>C.terms.some(t=>t.last>60)],['pop2','Популист','Нарушить больше половины обещаний',C=>C.terms.some(t=>t.promises.length>=4&&t.kept/t.promises.length<.5)]];
function achGet(){try{return JSON.parse(localStorage.getItem('mandat-ach')||'[]')}catch(e){return []}}
function achCheck(){if(!S)return;const got=new Set(achGet());let nw=[];ACH.forEach(a=>{if(!got.has(a[0])&&a[3](S.career)){got.add(a[0]);nw.push(a[1])}});if(nw.length){try{localStorage.setItem('mandat-ach',JSON.stringify([...got]))}catch(e){}toast('Достижение: '+nw.join(', '))}}
A.achievements=()=>{const got=new Set(achGet());modal(`<div class="mhead"><span class="kicker blue">Достижения</span><h2>${got.size}/${ACH.length} открыто</h2></div><div class="mbody"><div class="list">${ACH.map(a=>`<div class="item row" style="gap:12px;${got.has(a[0])?'':'opacity:.55'}"><span class="st ${got.has(a[0])?'done':'wait'}">${got.has(a[0])?'★':'·'}</span><div><b>${a[1]}</b><div class="muted" style="font-size:13px">${a[2]}</div></div></div>`).join('')}</div><button class="btn primary" data-a="close">Закрыть</button></div>`)};

/* ---------- 2. candidate creation ---------- */
const SETUP_TABS=[['look','Внешность'],['bio','Биография'],['party','Партия'],['stats','Характеристики']];
function setupInner(){
  const t=SETUP.tab||'look';const st=bioCalc();const b=BIOS.find(x=>x.id===SETUP.bio);
  const bar=(l,v,col)=>`<div class="sbar"><span>${l}</span><b>${v}</b><span class="bar"><i style="width:${v}%;background:${col}"></i></span></div>`;
  let mid='';
  if(t==='look')mid=`<div class="cinfo"><div><span>Имя</span><input id="f-name" value="${esc(SETUP.name)}" maxlength="40"></div><div><span>Возраст</span><input id="f-age" type="number" min="35" max="75" value="${SETUP.age}"></div><div><span>Пол</span><b>${SETUP.fem?'Женщина':'Мужчина'}</b></div><div><span>Биография</span><b>${b.name}</b></div><div class="cparty"><span class="star">★</span><span>${esc(SETUP.party)}</span></div></div>`;
  else if(t==='bio')mid=`<div class="bios1">${BIOS.map(x=>`<button class="bio ${SETUP.bio===x.id?'on':''}" data-a="bio" data-v="${x.id}"><b>${x.name}</b><span>${x.desc}</span><span class="kv"><span>Бюджет <b>${money(x.budget)}</b></span></span></button>`).join('')}</div>`;
  else if(t==='party')mid=`<div class="cinfo"><div><span>Партия</span><input id="f-party" value="${esc(SETUP.party)}" maxlength="40"></div><div><span>Старт кампании</span><span class="seg"><button class="btn mini ${SETUP.days===182?'on':''}" data-a="days" data-v="182">6 месяцев</button><button class="btn mini ${SETUP.days===273?'on':''}" data-a="days" data-v="273">9 месяцев</button></span></div><p class="muted" style="font-size:13px;margin:0">9 месяцев: больше времени и трое дебатов вместо двух.</p></div>`;
  else mid=`<div class="cinfo"><div><span>Кандидат</span><b>${esc(SETUP.name)}, ${SETUP.age}</b></div><div><span>Биография</span><b>${b.name}</b></div><div><span>Партия</span><b>${esc(SETUP.party)}</b></div><div><span>Стартовый бюджет</span><b>${money(b.budget)}</b></div><div><span>Кампания</span><b>${SETUP.days===182?'6':'9'} месяцев</b></div></div>`;
  const ti=SETUP_TABS.findIndex(x=>x[0]===t);
  return `<h2 class="scr-title">Создание кандидата</h2>
  <div class="tabs sub">${SETUP_TABS.map(([k,l])=>`<button class="tab ${t===k?'on':''}" data-a="stab" data-v="${k}">${l}</button>`).join('')}</div>
  <div class="create2"><div class="looks">${LOOK_IMG.map((k,i)=>`<button class="look ${SETUP.look===i&&!SETUP.photo?'on':''}" data-a="look" data-v="${i}" aria-label="Внешность ${i+1}">${PH(k,'','')}</button>`).join('')}
    ${SETUP.photo?`<button class="look on" data-a="look" data-v="photo" aria-label="Своё фото"><img src="${SETUP.photo}" alt=""></button>`:''}
    <label class="look upl" title="Загрузить своё фото"><input type="file" id="f-photo" accept="image/*" hidden><span>+</span><small>Фото</small></label></div>
   <div class="portrait">${SETUP.photo?`<img src="${SETUP.photo}" alt="Портрет кандидата">`:PH(LOOK_IMG[SETUP.look||0],'','Портрет кандидата')}</div>
   ${mid}
   <div class="statcol">${bar('Популярность',st.pop,'linear-gradient(90deg,#f4b740,#ffcf6b)')}${bar('Доверие',st.trust,'linear-gradient(90deg,#f4b740,#ffcf6b)')}${bar('Харизма',st.cha,'linear-gradient(90deg,#f4b740,#ffcf6b)')}${bar('Компетентность',st.comp,'linear-gradient(90deg,#f4b740,#ffcf6b)')}${bar('Скандальность',st.scan,'var(--bad)')}</div></div>
  <div class="cnav"><button class="btn" data-a="stabStep" data-v="-1" ${ti===0?'disabled':''}>Назад</button>${t==='stats'?'<button class="btn primary" data-a="start">Начать кампанию</button>':'<button class="btn primary" data-a="stabStep" data-v="1">Далее</button>'}</div>`}
A.stab=v=>{grabSetup();SETUP.tab=v;setupRefresh()};
A.stabStep=v=>{grabSetup();const i=SETUP_TABS.findIndex(x=>x[0]===(SETUP.tab||'look'));SETUP.tab=SETUP_TABS[clamp(i+ +v,0,3)][0];setupRefresh()};

/* ---------- 15. election day ---------- */
function edayHTML(){
  return topBarSimple('День выборов')+`<section class="card eday2"><div class="row between"><h2 class="scr-title" style="margin:0">День выборов</h2><span class="mono muted">${dstr(S.camp.date)}</span></div>
  <div class="eday-photo">${PH('eday','','Избирательный участок')}<span class="clock" id="ed-clock">07:00</span></div>
  <div class="grid2"><div><h3>Явка</h3><div class="turnout" id="ed-turn" style="margin-top:8px"></div></div><div><h3>Активность групп</h3><div class="turnout" id="ed-grp" style="margin-top:8px"></div></div></div>
  <div class="sep"></div><h3>Штаб</h3><div class="feed" id="ed-feed" style="margin-top:6px;max-height:200px"></div><div class="row" style="margin-top:12px" id="ed-btns"><button class="btn" data-a="edSkip">Пропустить</button></div></section>`}
function topBarSimple(tag){return `<header class="top"><div class="top-row"><div class="brand"><span class="seal" aria-hidden="true">★</span>Mandate</div><span class="phase-tag">${tag}</span><span class="top-date">${esc(S.name)}</span><button class="btn ghost mini" data-a="menu">Меню</button></div></header>`}

/* ---------- 16. election night ---------- */
function nightHTML(){
  return topBarSimple('Ночь выборов')+`<div class="board">
   <aside class="card night-left"><div class="row between"><span class="clock" id="nt-clock">20:00</span><span class="live">● LIVE</span></div><div class="tally" id="nt-tally" style="margin-top:10px"></div>
   <div class="row speed" id="nt-speed" style="margin-top:12px">${[['0','Пауза'],['1','×1'],['3','×3'],['10','×10']].map(s=>`<button class="btn mini" data-a="ntSpeed" data-v="${s[0]}">${s[1]}</button>`).join('')}</div></aside>
   <section class="card" style="display:grid;gap:10px;min-width:0"><div id="nt-banner"></div><div id="nt-map"></div><div id="nt-reg"></div></section>
   <aside class="card"><h2>Эфир «Ардания-24»</h2><div class="feed" id="nt-feed" style="margin-top:8px;max-height:560px"></div></aside></div>`}
function nightMapSVG(colorFn,sel){
  let s=`<svg class="nmap" viewBox="0 0 433 250" role="img" aria-label="Карта подсчёта"><defs><filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter></defs><g filter="url(#rough)">`;
  REG.forEach((R,i)=>{s+=`<polygon points="${R.hot.map(p=>p.join(',')).join(' ')}" fill="${colorFn(i)}" stroke="#0b1530" stroke-width="2.4" class="nreg ${i===sel?'sel':''}" data-a="ntSel" data-v="${i}"/>`});
  s+='</g>';
  REG.forEach((R,i)=>{const [x,y,w,h]=R.box;s+=`<text x="${x+w/2}" y="${y+h/2+3}" class="nlab">${R.name}</text>`});
  return s+'</svg>'}
function drawNight(){
  if(!NT||!$('#nt-tally'))return;const r=S.result;$('#nt-clock').textContent=ntClock();
  const act=r.act.slice().sort((a,b)=>(a==='player'?-1:b==='player'?1:NT.ev[b]-NT.ev[a]));
  const main=act.slice(0,2);const other=act.slice(2).reduce((a,c)=>a+NT.ev[c],0);
  $('#nt-tally').innerHTML=main.map(c=>`<div class="tc2"><span class="tstar" style="background:${S.c[c].color}">★</span><div><div class="tn">${esc(S.c[c].short)}</div><div class="tev" style="color:${S.c[c].color}">${NT.ev[c]}</div></div></div>`).join('')+`<div class="tc2"><span class="tstar" style="background:#9aa7bd">★</span><div><div class="tn">Не объявлено</div><div class="tev">${538-Object.values(NT.ev).reduce((a,b)=>a+b,0)+(other?0:0)}</div></div></div>`+
   `<div class="need2">Нужно для победы: <b>270</b></div><div class="evbar">${main.map(c=>`<i style="width:${NT.ev[c]/538*100}%;background:${S.c[c].color}"></i>`).join('')}<span class="mid"></span></div>`;
  document.querySelectorAll('#nt-speed .btn').forEach(b=>b.classList.toggle('on',+b.dataset.v===NT.speed));
  $('#nt-map').innerHTML=nightMapSVG(i=>{if(NT.called[i])return S.c[NT.called[i]].color;if(NT.rep[i]>0){const d=dispShare(i);const l=r.act.reduce((a,b)=>d[a]>=d[b]?a:b);return hexA(S.c[l].color,.45)}return '#3a4560'},NT.sel);
  const i=NT.sel,x=r.regions[i],d=dispShare(i);const ord=r.act.slice().sort((a,b)=>d[b]-d[a]);
  const counted=x.votes*NT.rep[i]/100;const plDiff=ord[0]==='player'?(d.player-d[ord[1]])/100*counted:-((d[ord[0]]-d.player)/100*counted);
  $('#nt-reg').innerHTML=`<div class="item"><div class="row between"><h3 style="text-transform:uppercase;font-size:22px">${REG[i].name}</h3>${NT.called[i]?`<span class="pill" style="background:${hexA(S.c[NT.called[i]].color,.2)};color:${S.c[NT.called[i]].color}">Объявлено: ${esc(S.c[NT.called[i]].short)}</span>`:NT.rep[i]>0?'<span class="pill warn">Слишком близко</span>':'<span class="pill">Ждём данных</span>'}</div>
   <div class="kv"><span>Подсчитано: <b>${Math.round(NT.rep[i])}%</b></span><span>Выборщиков: <b>${REG[i].ev}</b></span><span>Явка: <b>${pct(x.turnout)}</b></span></div>
   ${NT.rep[i]>0?`<div class="shares" style="margin-top:8px">${ord.map(c=>`<div class="sh"><span>${esc(S.c[c].short)}</span><span class="bar"><i style="width:${d[c]}%;background:${S.c[c].color}"></i></span><span class="p">${pct(d[c])}</span></div>`).join('')}</div><p style="margin:8px 0 0">Разница: <b class="${plDiff>=0?'up':'down'} num">${plDiff>=0?'+':'−'}${num(Math.abs(plDiff))} ${plural(Math.abs(plDiff),'голос','голоса','голосов')}</b></p>`:''}</div>`;
}
const _startNight=startNight;startNight=function(){_startNight();if(settingsGet().fastNight&&NT)NT.speed=3};
const _dts=debTimerStart;debTimerStart=function(d){if(settingsGet().noTimer){const el=$('#deb-t');if(el)el.textContent='∞';return}_dts(d)};

/* ---------- 17. result ---------- */
function victoryHTML(){
  const L=S.last;const rv=S.c[L.rival];
  return topBarSimple('Результат')+`<section class="res">
  <div class="res-photo res-split">${PH('result','res-bg','')}${psImg('wave',9,'res-fg')}<div class="res-name">${esc(S.name)}<br>${L.reelect?(S.fem?'переизбрана':'переизбран')+' на второй срок':(S.fem?'избрана':'избран')+' президентом'}</div></div>
  ${voteBar(L)}
  <div class="grid3"><div class="card"><div class="eyebrow">Выборщики</div><div class="big" style="color:var(--you)">${L.ev.player}</div><div class="muted">против ${L.ev[L.rival]} у ${esc(rv.short)}</div></div><div class="card"><div class="eyebrow">Явка</div><div class="big">${pct(L.turnout)}</div></div><div class="card"><div class="eyebrow">Соперник</div><div class="big" style="font-size:30px;color:${rv.color}">${esc(rv.name)}</div></div></div>
  <div class="card"><h3>Победная речь</h3><p class="muted" style="margin:4px 0 10px">От речи зависит стартовый рейтинг президента.</p>
  <div class="evch">
   <button class="evrow" data-a="speechV" data-v="unity"><span class="evn">1</span><b>Объединительная: «Сегодня победила вся страна»</b><span class="eve"><span class="up">Одобрение +4</span></span></button>
   <button class="evrow" data-a="speechV" data-v="aggr"><span class="evn">2</span><b>Агрессивная: «Народ отверг старую систему»</b><span class="eve"><span class="down">Одобрение −2</span> · <span class="up">Капитал +12</span></span></button>
   <button class="evrow" data-a="speechV" data-v="reform"><span class="evn">3</span><b>Реформаторская: «Завтра начинается новая эпоха реформ»</b><span class="eve"><span class="up">Одобрение +1 · Капитал +6</span></span></button></div></div></section>`}
function defeatHTML(){
  const L=S.last;const rv=S.c[L.rival];
  return topBarSimple('Результат')+`<section class="res">
  <div class="res-photo">${PH('eday','','')}<div class="res-name" style="background:rgba(160,20,20,.85)">${esc(rv.name)}<br>${rv.fem?'избрана':'избран'} президентом</div></div>${voteBar(L)}
  <div class="grid3"><div class="card"><div class="eyebrow">Ваши выборщики</div><div class="big">${L.ev.player}</div><div class="muted">против ${L.ev[L.rival]}</div></div><div class="card"><div class="eyebrow">Явка</div><div class="big">${pct(L.turnout)}</div></div></div>
  <div class="card"><h3>Пора выйти к сторонникам</h3><div class="evch" style="margin-top:8px"><button class="evrow" data-a="concede" data-v="g"><span class="evn">1</span><b>Поздравить победителя</b><span class="eve"><span class="up">Наследие +</span></span></button><button class="evrow" data-a="concede" data-v="c"><span class="evn">2</span><b>Не признавать результаты до пересчёта</b><span class="eve"><span class="down">Наследие −</span></span></button></div></div></section>`}
function voteBar(L){const r=L.rival;const t=L.pv.player+L.pv[r];return `<div class="votebar"><div style="width:${L.pv.player/t*100}%;background:var(--you)">${pct(L.pv.player)}</div><div style="width:${L.pv[r]/t*100}%;background:${S.c[r].color}">${pct(L.pv[r])}</div></div>`}
const _nightEnd=A.nightEnd;A.nightEnd=()=>{_nightEnd();achCheck()};

/* ---------- cabinet ---------- */
function cabinetHTML(){
  const sel=S.cabSel||{};const done=POSTS.every(p=>sel[p.id]!=null);
  return topBarSimple('Формирование правительства')+`<section class="card" style="margin-top:14px"><h2 class="scr-title">Формирование правительства</h2><p class="muted" style="margin:0 0 12px;max-width:70ch">Профессионал или верный союзник? Компетентность усиливает законы и помогает в кризисах. Низкая лояльность ведёт к публичным конфликтам. Репутация влияет на рейтинг.</p>
  <div class="posts">${POSTS.map(p=>`<div><div class="pt-h">${p.name}</div><div class="cands3" style="margin-top:6px">${MINISTERS[p.id].map((m,j)=>`<button class="mcard ${sel[p.id]===j?'on':''}" data-a="cab" data-v="${p.id}:${j}"><b style="font-family:var(--f-display);font-size:19px">${esc(m.name)}</b>
   <div class="mlines"><div><span>${p.skill}</span><b>${m.comp}</b></div><div><span>Популярность</span><b>${m.pop}</b></div><div><span>Лояльность</span><b class="${m.loy<60?'down':''}">${m.loy}</b></div><div><span>Репутация</span><b>${m.rep}</b></div></div><span class="muted" style="font-size:12.5px">${esc(m.note)}</span></button>`).join('')}</div></div>`).join('')}</div>
  <div class="row" style="margin-top:14px"><button class="btn primary big" data-a="cabDone" ${done?'':'disabled'}>Сформировать правительство</button><span class="muted">${POSTS.filter(p=>sel[p.id]!=null).length}/${POSTS.length} назначено</span></div></section>`}

/* ---------- 18. presidency ---------- */
const PNAV=[['overview','Кабинет президента','★'],['gov','Правительство','☺'],['parl','Парламент','◖'],['laws','Законы','§'],['econ','Экономика','∿'],['promises','Выполнение обещаний','✓'],['crises','Кризисы','!'],['intl','Международные отношения','◎'],['rating','Рейтинг','▲'],['next','Следующие выборы','⚑']];
const PTITLE={overview:'Президентство',gov:'Правительство',parl:'Парламент',laws:'Законы',econ:'Экономика',promises:'Выполнение обещаний',crises:'Кризисы',intl:'Международные отношения',rating:'Рейтинг одобрения',next:'Следующие выборы',budget:'Бюджет и программы',news:'Новости'};
function presHTML(){
  const G=S.pres,e=S.econ;if(!PTITLE[G.tab])G.tab='overview';const und=clamp(14-G.q*.4,6,14);const dis=100-G.approval-und;
  const left=G.termNo===1?Math.max(0,Math.round((14-G.q)*91.25+184)):Math.round((16-G.q)*91.25);
  const stats=stat('Квартал',qLabel(G.q),'hot')+stat('Рейтинг',pct(G.approval),'you')+stat('Не одобряют',pct(dis))+stat('Капитал',`${Math.round(G.capital)}<small>/100</small>`)+stat('Действия',`${G.ap}<small>/2</small>`)+stat('ВВП',`<span class="${e.growth>=0?'up':'down'}">${sgn(e.growth)}%</span>`)+stat('Инфляция',pct(e.infl))+stat('Безработица',pct(e.unemp))+stat('Госдолг',pct(debtPct()))+stat(G.termNo===1?'До выборов':'До конца срока',`${left} <small>дн.</small>`);
  const f={overview:presOffice,gov:presGov,parl:presParl,laws:presLaws,econ:presEcon,promises:presPromises,crises:presCrises,intl:presIntl,rating:presRating,next:presNext,budget:presBudget,news:newsScreen}[G.tab];
  return gameShell({tag:G.termNo===1?'Президентство · первый срок':'Президентство · второй срок',date:`${esc(S.name)} · ${qLabel(G.q)}`,stats,nav:PNAV.map(x=>[x[0],x[1],x[2],x[0]==='promises'?`${keptNow()}/${termPromises().length}`:'']),active:G.tab,act:'ptab',title:PTITLE[G.tab],body:f(),
   navFoot:`<div class="sep"></div><button class="snav ${G.tab==='budget'?'on':''}" data-a="ptab" data-v="budget"><span class="ic">$</span><span class="lbl">Бюджет и программы</span></button><button class="snav ${G.tab==='news'?'on':''}" data-a="ptab" data-v="news"><span class="ic">▤</span><span class="lbl">Новости</span></button><button class="btn primary big navbtn" data-a="endQ">Завершить квартал →</button>`})}
function presOffice(){
  const G=S.pres,e=S.econ;
  return `<div class="office-wrap"><div class="office">${PH('office','off-bg','')}${psImg('desk',5+(S.pres?S.pres.q:0),'off-fg')}<div class="off-stats"><div><span>Рейтинг</span><b>${pct(G.approval)}</b></div><div><span>ВВП</span><b class="${e.growth>=0?'up':'down'}">${sgn(e.growth)}%</b></div><div><span>Инфляция</span><b class="${e.infl>4?'down':''}">${pct(e.infl)}</b></div><div><span>Безработица</span><b class="${e.unemp>6?'down':''}">${pct(e.unemp)}</b></div></div></div>
  <div class="actgrid office-acts">
   <button class="btn act" data-a="address" ${G.addrQ===G.q||G.ap<1?'disabled':''}><b>Обращение к нации</b><span class="c">1 действие</span><span class="d">Одобрение +1…3. Раз в квартал</span></button>
   <button class="btn act" data-a="trip" ${G.tripQ===G.q||G.ap<1?'disabled':''}><b>Поездка по регионам</b><span class="c">1 действие</span><span class="d">Политический капитал +6</span></button>
   ${!G.decrees.includes('contracts')?`<button class="btn act" data-a="decree" ${G.ap<1?'disabled':''}><b>Указ: опубликовать госконтракты</b><span class="c">1 действие</span><span class="d">Одобрение +2, капитал −5</span></button>`:''}
   <button class="btn act" data-a="ptab" data-v="laws"><b>Внести закон</b><span class="c">1 действие</span><span class="d">Нужно 251 голос из 500</span></button></div></div>
  <div class="grid2" style="margin-top:12px"><div><div class="pt-h">Обещания срока · ${keptNow()}/${termPromises().length}</div>${termPromises().slice(0,5).map(p=>{const s=promStatus(p);return `<div class="prow">${stMark(s.s)}<div><b>${esc(PROM_BY[p.id].text)}</b><div class="muted" style="font-size:13px">${s.t}</div></div></div>`}).join('')||'<p class="muted">Вы ничего не обещали.</p>'}</div>
  <div><div class="pt-h">Последние новости</div><div class="feed">${S.news.slice(0,6).map(n=>`<div>${esc(n.t)}</div>`).join('')}</div></div></div>`}
function presRating(){const G=S.pres,und=clamp(14-G.q*.4,6,14);const dis=100-G.approval-und;
  return `<div class="row between"><div class="eyebrow">Approval rating</div><div class="kv"><span>Одобряют <b class="up">${pct(G.approval)}</b></span><span>Не одобряют <b class="down">${pct(dis)}</b></span><span>Не определились <b>${pct(und)}</b></span></div></div>${approvalChart()}
  <div class="tblwrap"><table class="tbl"><tr><th>Период</th><th class="r">Одобрение</th><th>Событие</th></tr>${G.hist.map((h,i)=>`<tr><td>${i===0?'Начало':qLabel(i-1)}</td><td class="r">${pct(h.v)}</td><td>${esc(h.note||'')}</td></tr>`).join('')}</table></div>`}
function presEcon(){const e=S.econ,e0=S.pres.econStart;const row=(k,v,v0,u,bad)=>{const d=v-v0;const cls=Math.abs(d)<.05?'flat':(d>0)===!bad?'up':'down';return `<tr><td>${k}</td><td class="r">${f1(v0)}${u}</td><td class="r"><b>${f1(v)}${u}</b></td><td class="r ${cls}">${sgn(d)}</td></tr>`};
  return `<div class="tblwrap"><table class="tbl"><tr><th>Показатель</th><th class="r">Начало срока</th><th class="r">Сейчас</th><th class="r">Δ</th></tr>${row('Рост ВВП',e.growth,e0.growth,'%')}${row('Инфляция',e.infl,e0.infl,'%',1)}${row('Безработица',e.unemp,e0.unemp,'%',1)}${row('Ключевая ставка',e.rate,e0.rate,'%',1)}${row('Цены на энергию',e.energy,e0.energy,'',1)}${row('Госдолг, % ВВП',debtPct(),S.pres.debtStart,'%',1)}</table></div>
  <p class="muted">Средняя зарплата: $${num(e.wage*(1+(e.gdp/e0.gdp-1)*.6))}. Компетентность министра экономики (${MIN('eco').comp}) влияет на долгосрочный рост, министра финансов (${MIN('fin').comp}) — на дефицит.</p>${presBudget()}`}
function presCrises(){const G=S.pres;return G.crises.length?`<div class="list">${G.crises.map(c=>`<div class="prow"><span class="st fail">!</span><div><b>${esc(c)}</b></div></div>`).join('')}</div>`:'<p class="muted">Кризисов пока не было. Они случаются примерно в 4 кварталах из 10.</p>'}
const COUNTRIES=[['korv','Корвенская республика','Сосед на востоке. Напряжённость на границе.'],['lind','Линдмарк','Крупнейший торговый партнёр.'],['eu','Северный союз','Союз 12 государств. Инвестиции и кредиты.']];
function presIntl(){const G=S.pres;G.rel=G.rel||{korv:30,lind:60,eu:55};
  return `<div class="list">${COUNTRIES.map(([k,n,d])=>`<div class="item"><div class="row between"><div><b>${n}</b><div class="muted" style="font-size:13px">${d}</div></div><button class="btn primary" data-a="visit" data-v="${k}" ${G.ap<1||G.visitQ===G.q?'disabled':''}>Визит · 1 действие</button></div><div class="row" style="margin-top:6px"><span class="eyebrow">Отношения</span><div class="evbar" style="height:8px;flex:1"><i style="width:${G.rel[k]}%;background:${G.rel[k]>60?'var(--good)':G.rel[k]<35?'var(--bad)':'var(--warn)'}"></i></div><b class="num">${Math.round(G.rel[k])}</b></div></div>`).join('')}</div><p class="muted" style="font-size:13px">Хорошие отношения (выше 70) с Линдмарком и Северным союзом ускоряют рост экономики. Плохие отношения с Корвенией повышают риск конфликта.</p>`}
A.visit=v=>{const G=S.pres;if(!useAP())return;G.visitQ=G.q;G.rel=G.rel||{korv:30,lind:60,eu:55};const g=rnd(8,15);G.rel[v]=clamp(G.rel[v]+g,0,100);approve(.5);if(v!=='korv'&&G.rel[v]>70&&!G['bonus_'+v]){G['bonus_'+v]=1;S.econ.trend+=.15;news('Подписано торговое соглашение — экономика получит импульс','pres')}
  const n=COUNTRIES.find(c=>c[0]===v)[1];news(`Президент с визитом: ${n}`,'pres');toast(`Визит: отношения +${Math.round(g)}.`);after()};
function presNext(){const G=S.pres;const ps=termPromises();
  if(G.termNo===2)return `<p>Это ваш второй срок. Конституция Арданы не позволяет баллотироваться в третий раз. Срок закончится через ${16-G.q} ${plural(16-G.q,'квартал','квартала','кварталов')}.</p>${presPromises()}`;
  return `<div class="grid3"><div class="item"><div class="eyebrow">До выборов</div><div class="big" style="font-size:40px">${Math.max(0,Math.round((14-G.q)*91.25+184))}</div><div class="muted">дней</div></div><div class="item"><div class="eyebrow">Выполнено обещаний</div><div class="big" style="font-size:40px">${keptNow()}/${ps.length}</div></div><div class="item"><div class="eyebrow">Решение</div><div class="big" style="font-size:24px">${G.rerun===true?'Баллотируюсь':G.rerun===false?'Не иду':'Ещё не принято'}</div><div class="muted">вопрос встанет за 365 дней до выборов</div></div></div>
  <p class="muted">На дебатах соперник процитирует каждое невыполненное обещание. Чем выше одобрение и больше выполненных обещаний, тем выше стартовое доверие во второй кампании.</p>`}
function presGov(){return `<div class="cands3">${POSTS.map(p=>{const m=MIN(p.id);return `<div class="mcard" style="cursor:default"><div class="eyebrow">${p.name}</div><b style="font-family:var(--f-display);font-size:19px">${esc(m.name)}</b><div class="mlines"><div><span>${p.skill}</span><b>${m.comp}</b></div><div><span>Популярность</span><b>${m.pop}</b></div><div><span>Лояльность</span><b class="${m.loy<60?'down':''}">${Math.round(m.loy)}</b></div><div><span>Репутация</span><b>${m.rep}</b></div></div><button class="btn" data-a="reshuffle" data-v="${p.id}" ${S.pres.ap<1?'disabled':''}>Отправить в отставку</button></div>`}).join('')}</div>`}
A.reshuffle=v=>{const cur=MIN(v);const pool=MINISTERS[v].filter(m=>m.name!==cur.name);const P=POSTS.find(p=>p.id===v);
  modal(`<div class="mhead"><span class="kicker blue">Кадровые решения</span><h2>${P.name}</h2></div><div class="mbody"><p>Сейчас: <b>${esc(cur.name)}</b>. Отставка стоит 1 действие и 5 капитала.</p><div class="cands3">${pool.map(m=>`<button class="mcard" data-a="swapMin" data-v="${v}:${MINISTERS[v].indexOf(m)}"><b style="font-family:var(--f-display);font-size:19px">${esc(m.name)}</b><div class="mlines"><div><span>${P.skill}</span><b>${m.comp}</b></div><div><span>Популярность</span><b>${m.pop}</b></div><div><span>Лояльность</span><b>${m.loy}</b></div><div><span>Репутация</span><b>${m.rep}</b></div></div><span class="muted" style="font-size:12.5px">${esc(m.note)}</span></button>`).join('')}</div><button class="btn ghost" data-a="close">Отмена</button></div>`,true)};
const _endQ=endQuarter;endQuarter=function(){_endQ();achCheck()};
const _legacy=legacyHTML;legacyHTML=function(){achCheck();return _legacy().replace('<header class="top">','<header class="top">')};

/* ---------- adjustable candidate stats (point-buy) ---------- */
const STAT_POOL=12,STAT_KEYS=[['pop','Популярность'],['trust','Доверие'],['cha','Харизма'],['comp','Компетентность'],['scan','Скандальность']];
function allocState(){SETUP.alloc=SETUP.alloc||{pop:0,trust:0,cha:0,comp:0,scan:0};return SETUP.alloc}
function baseCalc(){const b=BIOS.find(x=>x.id===SETUP.bio);const a=SETUP.age;return{pop:b.rec,trust:b.trust,cha:clamp(b.cha+(a<45?5:a>60?-5:0),20,95),comp:clamp(b.comp+(a>50?5:a<36?-6:0),20,95),scan:Math.round(b.skeleton*100*(a>55?1.1:1))}}
function pointsLeft(){const al=allocState();return STAT_POOL-(al.pop+al.trust+al.cha+al.comp-al.scan)/3}
function bioCalc(){const b=baseCalc(),al=allocState();const o={};for(const [k] of STAT_KEYS)o[k]=clamp(b[k]+al[k],k==='scan'?0:10,k==='scan'?100:95);return o}
A.statAdj=v=>{grabSetup();const [k,d]=v.split(':');const al=allocState();const step=+d;const b=baseCalc();
  // raising a good stat or lowering scandal costs a point
  const cost=k==='scan'?-step:step;
  if(cost>0&&pointsLeft()<cost){toast('Свободные очки закончились. Уменьшите другую характеристику или поднимите скандальность.');return}
  const nv=al[k]+step*3;const val=b[k]+nv;
  if(nv<-15||nv>24||val<(k==='scan'?0:10)||val>(k==='scan'?100:95)){toast('Дальше эту характеристику изменить нельзя.');return}
  al[k]=nv;const left=pointsLeft();if(left<0){al[k]-=step*3;return}setupRefresh()};
A.statReset=()=>{SETUP.alloc={pop:0,trust:0,cha:0,comp:0,scan:0};setupRefresh()};
function statEditor(){
  const st=bioCalc(),b=baseCalc(),al=allocState();const left=pointsLeft();
  const hint={pop:'Узнаваемость на старте',trust:'Доверие избирателей',cha:'Сила митингов и личных историй на дебатах',comp:'Точность цифр в интервью и на дебатах',scan:'Шанс, что журналисты раскопают ваше прошлое'};
  return `<div class="statcol"><div class="row between" style="margin-bottom:4px"><span class="eyebrow">Характеристики</span><span class="pts ${left?'':'zero'}">Очки: <b>${left}</b></span></div>
  ${STAT_KEYS.map(([k,l])=>{const v=st[k],d=al[k];const bad=k==='scan';return `<div class="sedit"><div class="row between"><span>${l}</span><span class="sval"><button class="sbtn" data-a="statAdj" data-v="${k}:-1" aria-label="Уменьшить: ${l}">−</button><b>${v}</b><button class="sbtn" data-a="statAdj" data-v="${k}:1" aria-label="Увеличить: ${l}">+</button></span></div>
   <span class="bar"><i style="width:${v}%;background:${bad?'var(--bad)':'linear-gradient(90deg,#f4b740,#ffcf6b)'}"></i></span><small class="muted">${hint[k]}${d?` · <span class="${(bad?-d:d)>0?'up':'down'}">${d>0?'+':'−'}${Math.abs(d)} от базы</span>`:''}</small></div>`}).join('')}
  <p class="muted" style="font-size:12px;margin:6px 0 0">Каждый шаг +3 стоит 1 очко. Снижение скандальности тоже стоит очко, а повышение — даёт. Очки можно вернуть, уменьшив характеристику.</p>
  <button class="btn mini" data-a="statReset" style="margin-top:6px">Сбросить</button></div>`}
const _setupInner=setupInner;setupInner=function(){return _setupInner().replace(/<div class="statcol">[\s\S]*?<\/div><\/div>\s*<div class="cnav">/,()=>statEditor()+'</div>\n  <div class="cnav">')};
const _start=A.start;A.start=()=>{grabSetup();if(pointsLeft()>0&&!SETUP.ptsOk){SETUP.ptsOk=1;toast(`У вас осталось ${pointsLeft()} свободных очков. Распределите их или нажмите ещё раз, чтобы начать.`);return}SETUP.stats=bioCalc();_start()};
A.bio=v=>{grabSetup();SETUP.bio=v;setupRefresh()};

A.look=v=>{grabSetup();if(v==='photo')return;SETUP.look=+v;SETUP.photo=null;const f=LOOK_F(+v);
  if(f&&SETUP.name==='Илья Руденко')SETUP.name='Ирина Руденко';if(!f&&SETUP.name==='Ирина Руденко')SETUP.name='Илья Руденко';SETUP.fem=f;setupRefresh()};
document.addEventListener('change',e=>{if(e.target.id!=='f-photo')return;const f=e.target.files&&e.target.files[0];if(!f)return;
  const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const H=420,W=Math.round(H*116/202);const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d');
    const k=Math.max(W/img.width,H/img.height);const w=img.width*k,h=img.height*k;cx.drawImage(img,(W-w)/2,Math.max(H-h,(H-h)*.15),w,h);
    grabSetup();SETUP.photo=cv.toDataURL('image/jpeg',.85);setupRefresh()};img.onerror=()=>toast('Не удалось открыть этот файл. Выберите JPG или PNG.');img.src=rd.result};rd.readAsDataURL(f)});
const _start2=A.start;A.start=()=>{_start2();if(S&&S.phase){S.fem=!!SETUP.fem;S.c.player.fem=S.fem;if(SETUP.photo)S.photo=SETUP.photo;
  if(S.fem)S.news.forEach(n=>n.t=femText(n.t));save();render()}};
const FEM_MAP=[['провёл','провела'],['допустил','допустила'],['встретился','встретилась'],['объявил','объявила'],['вступил','вступила'],['переизбран','переизбрана'],['избран ','избрана '],['снялся','снялась'],['поддержал','поддержала'],['обратился','обратилась'],['посетил','посетила']];
function femText(t){if(!S||!S.fem||!PL()||!t.includes(PL().short)&&!t.includes('Президент')&&!t.includes(S.name))return t;let o=t;FEM_MAP.forEach(([a,b])=>o=o.split(a).join(b));return o}
const _news=news;news=function(t,tag){_news(femText(t),tag)};



/* =====================================================================
   МЕХАНИКИ: деньги за голоса и покушения
   ===================================================================== */
COST.cash=320e3;

/* ---------- деньги за голоса ---------- */
function cashState(){const cp=S.camp;cp.cash=cp.cash||{heat:0,n:0,caught:0,reg:{}};return cp.cash}
function cashRiskLabel(h){return h<18?'низкий':h<40?'средний':'высокий'}
function cashInfo(i){
  const B=(S.camp&&S.camp.cash)||{heat:0,reg:{}};const n=B.reg[i]||0;
  return `<div class="rp-acts"><button class="btn mini" data-a="cash" data-v="${i}">💵 Раздать деньги · ${money(COST.cash)}</button></div>
  <div class="muted" style="font-size:12px;text-align:center;margin-top:3px">2 часа · риск огласки: ${cashRiskLabel(B.heat)}${n?` · раздач здесь: ${n}`:''}</div>`;
}
A.cash=(v,btn,ev)=>{
  const i=+v,R=REG[i],B=cashState(),st=S.regions[i];
  if(!spend(2,COST.cash))return;
  const used=B.reg[i]||0;
  // сильнее всего работает в бедных регионах с высокой безработицей; в столице и IT-регионе почти не работает
  const need=clamp((16000-R.gdpc)/9000+R.un/10,.25,1.25);
  const g=rnd(4.3,5.8)*need*Math.pow(.72,used)*(1+fx('eff')/2);
  st.effort.player+=g;st.und-=g*.3;
  B.reg[i]=used+1;B.n++;B.heat+=rnd(15,22)*(R.youth>.27?1.4:1)*(partyHas('r_'+R.id)?.75:1);
  recUp(.4);
  news(`В регионе ${R.name} волонтёры ${PL().short} раздают жителям конверты с деньгами`,'camp');
  toast(`Деньги розданы в регионе ${R.name}: +${f1(g)} к поддержке${used?' (повторная раздача слабее)':''}. Риск огласки: ${cashRiskLabel(B.heat)}.`);
  {const a=anchor(btn,ev);burst(a.x,a.y,{emoji:'💵',n:12+Math.round(g*2)});floatText(a.x,a.y-18,'+'+f1(g),'good');floatText(a.x+70,a.y+6,'−'+money(COST.cash),'bad');if(cashRiskLabel(B.heat)==='высокий')flash('warn')}
  after()};
function cashBacklash(sev){
  const B=cashState();let hit=0;
  for(const k in B.reg){const m=Math.min(B.reg[k],3);const d=rnd(.9,1.6)*sev*m*(REG[k].youth>.27?1.5:1);S.regions[k].effort.player-=d;hit+=d}
  B.caught++;B.heat*=.35;B.reg={};return hit}
function cashWeek(){
  const cp=S.camp,B=cp.cash;
  if(B){
    B.heat*=.92;
    if(B.heat>16&&!S.queue.some(q=>q.id==='cashscandal')&&Math.random()<Math.min(.6,(B.heat-10)/80))S.queue.push({id:'cashscandal',p:{}});
  }
  if(cp.week>=4&&cp.left>14&&(cp.rcash||0)<2&&Math.random()<.05){
    const pool=rivalsActive().filter(c=>c!=='miller');if(!pool.length)return;
    const c=pick(pool),r=ri(0,REG.length-1);cp.rcash=(cp.rcash||0)+1;
    S.regions[r].effort[c]+=rnd(3,4);
    S.queue.push({id:'rivalcash',p:{c,r}});
  }
}
EV.cashscandal={build(){
  const B=cashState(),sev=clamp(B.heat/28,.8,2.2)*(1+B.caught*.35)*legalMit();
  return{kicker:'Скандал',title:'Деньги за голоса',text:`Наблюдатели и местные журналисты сняли, как волонтёры вашего штаба раздают конверты с деньгами и просят «правильно проголосовать». Видео набрало ${ri(1,5)} млн просмотров, Центризбирком запросил объяснения.${B.caught?' Это не первый эпизод, и о прошлых тоже вспоминают.':''}`,choices:[
  choice('Свалить на волонтёров','Доверие −, риск документов',()=>{const hit=cashBacklash(sev);const d=hurt(3.2*sev);news(`Штаб ${PL().short} объяснил раздачу денег самодеятельностью волонтёров`,'scandal');
    if(Math.random()<.4){later(ri(8,14),'docs');return `Доверие −${f1(d)}, в регионах раздач потеряно ${f1(hit)} очка поддержки. Но один из волонтёров готов дать показания…`}
    return `Доверие −${f1(d)}, в регионах раздач потеряно ${f1(hit)} очка поддержки.`}),
  choice('Признать и заплатить штраф','$300 тыс.',()=>{S.budget-=300e3;const hit=cashBacklash(sev*.6);const d=hurt(2*sev);cashState().heat*=.6;news(`${PL().short} признал раздачу денег и оплатил штраф`,'scandal');
    return `Штраф оплачен. Доверие −${f1(d)}, в регионах раздач потеряно ${f1(hit)} очка поддержки. История закрыта.`}),
  choice('Назвать это материальной помощью','Риск',()=>{
    if(Math.random()<.4){recUp(1.5);gain(.8);cashBacklash(sev*.3);news(`${PL().short}: «Помощь нуждающимся — не подкуп»`,'camp');return 'Часть избирателей приняла объяснение, а узнаваемость выросла. Доверие +0,8.'}
    const hit=cashBacklash(sev*1.2);const d=hurt(6.5*sev);S.budget-=250e3;news(`ЦИК оштрафовал штаб ${PL().short} за раздачу денег избирателям`,'scandal');
    return `Объяснение не сработало. Доверие −${f1(d)}, штраф $250 тыс., в регионах раздач потеряно ${f1(hit)} очка поддержки.`}),
  choice('Обвинить соперников в провокации','Доверие −, риск',()=>{
    const mr=mainRival();
    if(mr&&Math.random()<.35){S.c[mr].trust=clamp(S.c[mr].trust-6,10,90);const hit=cashBacklash(sev*.7);const d=hurt(2*sev);news(`Штаб ${S.c[mr].short} заподозрили в постановочной съёмке`,'rival');return `Версия о провокации прижилась: доверие к ${S.c[mr].short} −6. Ваше доверие −${f1(d)}, потеряно ${f1(hit)} очка поддержки.`}
    const hit=cashBacklash(sev*1.1);const d=hurt(5*sev);return `Доказательств провокации нет. Доверие −${f1(d)}, потеряно ${f1(hit)} очка поддержки.`}),
  ]}}};
EV.rivalcash={build(p){
  const k=S.c[p.c],R=REG[p.r];if(!k||k.out)return null;
  return{kicker:'Скандал',title:`Деньги в регионе ${R.name}`,text:`Наблюдатели зафиксировали: в регионе <b>${esc(R.name)}</b> штаб ${esc(k.short)} раздаёт жителям конверты с деньгами и листовки с призывом голосовать «правильно».`,choices:[
  choice('Обнародовать видео','$150 тыс.',()=>{S.budget-=150e3;k.trust=clamp(k.trust-5,10,90);S.regions[p.r].effort[p.c]-=2.4;gain(.8);news(`Видео раздачи денег штабом ${k.short} разошлось по сети`,'rival');return `Ролик набрал 3 млн просмотров. Доверие к ${k.short} −5, его позиции в регионе ${R.name} ослабли. Ваше доверие +0,8.`}),
  choice('Подать жалобу в Центризбирком','Бесплатно',()=>{k.trust=clamp(k.trust-2.5,10,90);gain(1.2);return `Жалоба принята к рассмотрению. Доверие к ${k.short} −2,5, ваше +1,2.`}),
  choice('Ответить тем же','$320 тыс., риск',()=>{const B=cashState();S.budget-=COST.cash;const g=rnd(2.6,3.6);S.regions[p.r].effort.player+=g;B.heat+=12;B.reg[p.r]=(B.reg[p.r]||0)+1;B.n++;return `Вы не стали отставать: +${f1(g)} к поддержке в регионе ${R.name}. Риск огласки вырос.`}),
  choice('Промолчать','',()=>`Вы не стали вмешиваться. Раздача прошла без последствий для ${k.short}.`),
  ]}}};

/* ---------- покушения ---------- */
// bite: потеря часов кандидата: сразу и на несколько недель вперёд
function hurtTime(h,weeks){const cp=S.camp;cp.ap=Math.max(2,cp.ap-h);cp.apCut=h;cp.apCutWeeks=Math.max(0,weeks-1)}
function apCutNow(){const cp=S.camp;if(!(cp.apCutWeeks>0))return 0;cp.apCutWeeks--;return Math.min(cp.apCut||0,Math.max(0,10+fx('ap')-3))}
function sympathy(a,b,c){gain(a);recUp(b);addEffortAll('player',c)}
function attemptWeek(){
  const cp=S.camp;
  if(cp.week<3||cp.left<=14)return;
  if(S.queue.some(q=>/^(threat|attempt|rivalattempt|rumor)$/.test(q.id))||S.pending.some(x=>/^(threat|attempt|rumor)$/.test(x.id)))return;
  if((cp.att||0)<2&&(cp.thr||0)<3){
    const nat=national(),mr=mainRival(),lead=mr?nat.player-nat[mr]:0;
    const p=(partyHas('guard')?.7:1)*(.014+Math.max(0,PL().rec-50)/2500+Math.max(0,lead)/1500+((cp.cash&&cp.cash.caught)||0)*.015);
    if(Math.random()<p){cp.thr=(cp.thr||0)+1;S.queue.push({id:'threat',p:{}});return}
  }
  if(!cp.ratt&&rivalsActive().length&&Math.random()<.012){cp.ratt=1;S.queue.push({id:'rivalattempt',p:{c:pick(rivalsActive())}})}
}
EV.threat={build(){
  const cp=S.camp;
  const plan=(level,prob)=>{cp.guard=level;if(Math.random()<prob)later(Math.max(3,Math.min(ri(6,22),cp.left-9)),'attempt')};
  return{kicker:'Угроза',title:'Письмо с угрозами',text:'В штаб поступило письмо с угрозами в ваш адрес. Служба безопасности считает угрозу серьёзной: в письме названы место и время вашего ближайшего выступления.',choices:[
  choice('Нанять частную охрану','$350 тыс.',()=>{const pay=Math.min(Math.max(0,S.budget),350e3);S.budget-=pay;plan(pay>=350e3?2:1,.3);return pay>=350e3?'Охрана нанята, маршруты выступлений засекречены. Теперь остаётся ждать и работать.':'Денег на полную охрану не хватило: нанят усиленный наряд на часть выездов.'}),
  choice('Сообщить в полицию и продолжить','Доверие +0,5',()=>{gain(.5);plan(1,.5);return 'Полиция берёт письмо в разработку и выделяет наряд на крупные выступления.'}),
  choice('Отменить публичные выступления на неделю','−4 часа кандидата',()=>{hurtTime(4,1);plan(1,.2);return 'Штаб переводит выступления в закрытый формат. Вы теряете часть недели, зато риск ниже.'}),
  choice('Проигнорировать угрозу','Риск',()=>{plan(0,.7);return 'Вы решили не поддаваться запугиванию. Штаб нервничает.'}),
  ]}}};
EV.attempt={build(){
  const cp=S.camp,g=Math.max(cp.guard||0,partyHas('guard')?1:0),R=pick(REG);cp.att=(cp.att||0)+1;cp.guard=0;
  const thwart=Math.random()<[.35,.68,.92][g],serious=Math.random()<.3;
  const rivalsPause=()=>rivalsActive().forEach(c=>S.c[c].pause=1);
  if(thwart)return{kicker:'Покушение',fx:'good',title:'Нападение на кандидата предотвращено',text:`Во время визита в регион <b>${esc(R.name)}</b> ${g?'охрана':'местные полицейские'} задержали вооружённого человека до начала выступления. Никто не пострадал. Страна обсуждает случившееся, а ваш штаб завален звонками журналистов.`,choices:[
    choice('Выступить с обращением к стране','Доверие +, узнаваемость +',()=>{sympathy(3.2,3,.8);news(`${PL().short} обратился к стране после предотвращённого нападения`,'scandal');return 'Обращение смотрели миллионы. Доверие +3,2, узнаваемость растёт.'}),
    choice('Продолжить график без заявлений','Доверие +1,2',()=>{sympathy(1.2,1,.2);news(`На ${PL().short} готовилось нападение, задержан подозреваемый`,'scandal');return 'Вы вышли на сцену в назначенное время. Доверие +1,2.'}),
    choice('Обвинить в организации соперника','Риск',()=>{const mr=mainRival();
      if(mr&&Math.random()<.35){S.c[mr].trust=clamp(S.c[mr].trust-10,10,90);sympathy(1.5,1,.4);news(`Следствие нашло связи задержанного со штабом ${S.c[mr].short}`,'rival');return `Следствие подтвердило связи с окружением ${S.c[mr].short}. Его доверие −10, ваше +1,5.`}
      const d=hurt(4);news(`${PL().short} обвинён в использовании покушения в кампании`,'scandal');return `Следствие не нашло связи, вас обвиняют в политической эксплуатации. Доверие −${f1(d)}.`}),
  ]};
  if(!serious)return{kicker:'Покушение',title:'Покушение на кандидата',text:`После митинга в регионе <b>${esc(R.name)}</b> на вас напали. Вы получили лёгкую травму, помощь оказана на месте, нападавший задержан. Врачи рекомендуют несколько дней покоя.`,choices:[
    choice('Вернуться к графику с повязкой','Узнаваемость +, −1 час',()=>{sympathy(3.5,3.5,1.0);hurtTime(1,1);news(`${PL().short} вернулся к графику после нападения`,'scandal');return 'Фото с повязкой разошлись по всем каналам. Доверие +3,5, узнаваемость растёт.'}),
    choice('Взять паузу на лечение','−5 часов на 2 недели',()=>{sympathy(4,3,1.1);hurtTime(5,2);return 'Вы выпали из графика, но сочувствие избирателей растёт. Доверие +4.'}),
    choice('Потребовать открытого расследования','Доверие +',()=>{sympathy(3.8,3,.9);hurtTime(2,1);news(`${PL().short} требует открытого расследования нападения`,'scandal');return 'Вы потребовали публичного отчёта следствия. Доверие +3,8.'}),
  ]};
  return{kicker:'Покушение',title:'Покушение на кандидата',text:`После выступления в регионе <b>${esc(R.name)}</b> на вас совершено нападение. Вы госпитализированы, состояние стабильное. Врачи требуют не менее трёх недель покоя. Штаб растерян, соперники приостанавливают кампании.`,choices:[
    choice('Вести кампанию из палаты','−5 часов на 3 недели',()=>{sympathy(5,4,1.6);hurtTime(5,3);rivalsPause();news(`${PL().short} ведёт кампанию из больницы`,'scandal');return 'Видеообращения из палаты набирают миллионы просмотров. Доверие +5, соперники берут паузу на неделю.'}),
    choice('Передать кампанию штабу','−7 часов на 3 недели',()=>{sympathy(5.5,3.5,1.4);hurtTime(7,3);rivalsPause();news(`Штаб ${PL().short} продолжает кампанию, пока кандидат лечится`,'scandal');return 'Штаб работает без вас, но поддержка растёт. Доверие +5,5, соперники берут паузу на неделю.'}),
    choice('Записать обращение к стране','Узнаваемость +',()=>{sympathy(4.5,5,1.8);hurtTime(6,3);rivalsPause();news(`Обращение ${PL().short} к стране из больницы посмотрели миллионы`,'scandal');return 'Короткое обращение стало главным видео недели. Доверие +4,5, узнаваемость +5.'}),
  ]}}};
EV.rivalattempt={build(p){
  const k=S.c[p.c];if(!k||k.out)return null;const R=pick(REG);
  return{kicker:'Покушение',title:`Нападение на ${k.short}`,text:`${esc(k.name)} госпитализирован после нападения во время визита в регион <b>${esc(R.name)}</b>. Врачи говорят о лёгкой травме. Страна обсуждает безопасность кандидатов, а рейтинг пострадавшего растёт.`,choices:[
  choice('Выразить соболезнования, приостановить кампанию','−6 часов, доверие +',()=>{k.trust=clamp(k.trust+6,10,90);addEffortAll(p.c,1.2);k.pause=1;hurtTime(6,1);gain(2.5);news(`${PL().short} приостановил кампанию после нападения на ${k.short}`,'camp');return `Вы потеряли часть недели, зато выглядите достойно. Доверие +2,5. У ${k.short} доверие +6.`}),
  choice('Осудить насилие, но продолжить','Доверие +1',()=>{k.trust=clamp(k.trust+6,10,90);addEffortAll(p.c,1.2);k.pause=1;gain(1);return `Вы осудили насилие и продолжили работу. Доверие +1. У ${k.short} доверие +6.`}),
  choice('Потребовать охрану для всех кандидатов','$120 тыс.',()=>{S.budget-=120e3;k.trust=clamp(k.trust+6,10,90);addEffortAll(p.c,1.2);k.pause=1;gain(1.8);S.camp.guard=Math.max(S.camp.guard||0,1);return `Инициатива поддержана. Доверие +1,8, вам выделен наряд охраны. У ${k.short} доверие +6.`}),
  choice('Промолчать','Риск слухов',()=>{k.trust=clamp(k.trust+6,10,90);addEffortAll(p.c,1.2);k.pause=1;if(Math.random()<.25){later(ri(7,12),'rumor',{c:p.c});return 'Вы не комментировали. Пока тихо.'}return 'Вы не комментировали, но обошлось без последствий.'}),
  ]}}};
EV.rumor={build(p){
  const k=S.c[p.c];if(!k)return null;
  return{kicker:'Слухи',title:'«Кому выгодно?»',text:`В соцсетях и на ряде каналов утверждают, что нападение на ${esc(k.short)} выгодно вашему штабу. Доказательств нет, но вопрос «кому выгодно» набирает просмотры.`,choices:[
  choice('Потребовать независимого расследования','Доверие +',()=>{gain(1.2);return 'Вы публично поддержали независимое расследование. Слухи затихают. Доверие +1,2.'}),
  choice('Подать в суд за клевету','$200 тыс.',()=>{S.budget-=200e3;if(Math.random()<.6){gain(2);news(`Суд встал на сторону ${PL().short} в деле о клевете`,'camp');return 'Суд обязал распространителей слухов извиниться. Доверие +2.'}const d=hurt(2);return `Суд затянулся, слухи только разрослись. Доверие −${f1(d)}.`}),
  choice('Не комментировать','Риск',()=>{const d=hurt(3.5);return `Молчание сочли признанием. Доверие −${f1(d)}.`}),
  ]}}};


/* =====================================================================
   ПАРТИЯ: древо должностей, лояльность элиты, подкуп чиновников соперников
   Состояние хранится в S.pty (S.party в движке — это название партии).
   ===================================================================== */
const PARTY_TREE=[
 {id:'sec',name:'Секретарь партии',parent:null,lv:1,fx:{gotv:.25},d:'Открывает региональных глав. Мобилизация волонтёров +25%.'},
 {id:'treas',name:'Казначей',parent:null,lv:1,fx:{fund:.2},d:'Пожертвования +20%.'},
 {id:'pr',name:'Руководитель пресс-службы',parent:null,lv:1,fx:{dmg:.12},d:'Ущерб от скандалов −12%.'},
 {id:'council',name:'Председатель политсовета',parent:null,lv:1,fx:{eff:.05},d:'Открывает молодёжное крыло, юротдел и службу безопасности. Эффективность кампании +5%.'},
 {id:'youth',name:'Лидер молодёжного крыла',parent:'council',lv:2,fx:{},d:'Каждую неделю: узнаваемость +0,12 и рост среди молодёжи.'},
 {id:'legal',name:'Глава юридического отдела',parent:'council',lv:2,fx:{},d:'Ущерб от дел о подкупе и раздаче денег −30%.'},
 {id:'guard',name:'Начальник службы безопасности',parent:'council',lv:2,fx:{},d:'Охрана на выездах: покушения реже и мягче.'},
 ...REG.map(R=>({id:'r_'+R.id,name:'Глава отделения · '+R.name,parent:'sec',lv:3,region:REGI(R.id),fx:{},d:'Бесплатная поддержка в регионе каждую неделю; раздача денег там менее заметна.'})),
];
const POST_BY=Object.fromEntries(PARTY_TREE.map(p=>[p.id,p]));
const PN={m:{f:['Александр','Игорь','Сергей','Виктор','Павел','Роман','Константин','Богдан','Артём','Максим'],l:['Громов','Левченко','Власенко','Корнеев','Мельник','Рябов','Данилов','Тарасов','Лукин','Шевчук']},
          w:{f:['Марина','Татьяна','Наталья','Ирина','Леся','Оксана','Вера','Алина','Ольга','Яна'],l:['Зорина','Павленко','Остапенко','Беляева','Ковальова','Дорош','Савчук','Лысенко','Руденко','Мартынова']}};
function party(){if(!S.pty)S.pty={loy:35,posts:{},cands:{}};return S.pty}
const partyHas=id=>!!(S&&S.pty&&S.pty.posts[id]);
const legalMit=()=>partyHas('legal')?.7:1;
const kidsOf=id=>PARTY_TREE.filter(p=>p.parent===id);
const unlocked=pd=>!pd.parent||partyHas(pd.parent);
function subtree(id){return [id,...kidsOf(id).flatMap(k=>subtree(k.id))]}
function removePost(id){const P=party();let n=0;for(const x of subtree(id)){if(P.posts[x]){delete P.posts[x];n++}}return n}
function partyFx(k){const P=S&&S.pty;if(!P)return 0;let v=0;for(const id in P.posts){const pd=POST_BY[id],m=P.posts[id];if(pd&&pd.fx[k])v+=pd.fx[k]*(.75+m.comp/200)}return v}
const partyFees=P=>Math.max(0,P.loy-30)*1200;
const partyPay=P=>Object.keys(P.posts).reduce((a,id)=>a+({1:12e3,2:8e3,3:4e3}[POST_BY[id]?POST_BY[id].lv:3]),0);
function loyGain(pd,c){return (pd.lv===1?10:pd.lv===2?6.5:4.5)*(.65+c.amb*.35)}
function genCand(){const w=Math.random()<.35,g=w?PN.w:PN.m;return{name:pick(g.f)+' '+pick(g.l),comp:ri(48,88),amb:ri(1,3)}}
function candsFor(id){const P=party(),wk=S.camp?S.camp.week:0,c=P.cands[id];if(c&&wk-c.week<6)return c.list;
  const list=[genCand(),genCand(),genCand()];list[0].amb=1;list[2].amb=3;P.cands[id]={week:wk,list};return list}
const ptInit=n=>String(n).split(' ').map(x=>x[0]).join('').slice(0,2);
const ambDots=a=>'●'.repeat(a)+'○'.repeat(3-a);

A.post=v=>{
  const pd=POST_BY[v];if(!pd||!unlocked(pd)||party().posts[v])return;
  const list=candsFor(v);
  modal(`<div class="mhead"><span class="kicker blue">Назначение</span><h2>${esc(pd.name)}</h2></div><div class="mbody"><p class="muted">${pd.d}</p>
  <p class="muted" style="font-size:13px">Чем выше амбиции, тем больше лояльности вы получите, но тем выше риск предательства.</p>
  <div class="stack">${list.map((c,i)=>`<div class="item cand"><div><b>${esc(c.name)}</b><div class="muted">Компетентность ${c.comp} · амбиции ${ambDots(c.amb)}</div><div class="muted" style="font-size:12px">${c.amb===3?'Рвётся вверх: много лояльности, склонен к предательству.':c.amb===1?'Скромный профессионал: надёжен, но лояльности даёт мало.':'Рассудительный партиец без лишних претензий.'}${c.comp>=80?' Сильный управленец.':''}</div></div>
  <button class="btn primary" data-a="appoint" data-v="${v}|${i}">Назначить<small style="display:block">Лояльность +${f1(loyGain(pd,c))}</small></button></div>`).join('')}</div>
  <div class="mfoot"><button class="btn ghost" data-a="close">Закрыть</button></div></div>`);
};
A.appoint=v=>{
  const [id,ix]=String(v).split('|'),pd=POST_BY[id],P=party();
  if(!pd||P.posts[id]||!unlocked(pd))return;
  const c=candsFor(id)[+ix];if(!c)return;
  const g=loyGain(pd,c);
  P.posts[id]={name:c.name,comp:c.comp,amb:c.amb,week:S.camp.week};P.cands[id]=null;P.loy=clamp(P.loy+g,0,100);
  closeModal();
  const a=anchor();burst(a.x,a.y-40,{emoji:'⭐',n:12});floatText(a.x,a.y-40,'Лояльность +'+f1(g),'good');
  toast(`${c.name} назначен: ${pd.name}. Лояльность +${f1(g)}.`);after()};
A.dismiss=v=>{
  const pd=POST_BY[v],P=party(),m=P.posts[v];if(!m)return;
  const n=subtree(v).filter(x=>P.posts[x]).length;
  modal(`<div class="mhead"><span class="kicker bad">Увольнение</span><h2>Снять ${esc(m.name)}?</h2></div><div class="mbody"><p>Должность: ${esc(pd.name)}. ${n>1?`Вместе с ним уйдут подчинённые (${n-1}). `:''}Лояльность элиты −${5*n}, а обиженные могут заговорить с журналистами.</p>
  <div class="mfoot"><button class="btn danger" data-a="dismissDo" data-v="${v}">Снять</button><button class="btn ghost" data-a="close">Отмена</button></div></div>`)};
A.dismissDo=v=>{
  const P=party(),n=removePost(v);closeModal();if(!n)return;
  P.loy=clamp(P.loy-5*n,0,100);
  if(Math.random()<.2*n)later(ri(5,12),'betray',{post:null});
  toast(`Должность освобождена${n>1?` (вместе с подчинёнными: ${n-1})`:''}. Лояльность −${5*n}.`);after()};
A.mobilize=(v,btn,ev)=>{
  const P=party(),i=S.sel,R=REG[i];
  if(P.loy<10){toast('Не хватает лояльности: нужно 10.');return}
  if(!spend(1,0))return;
  const head=P.posts['r_'+R.id],g=rnd(3,4.2)*(head?1.3:1);
  S.regions[i].effort.player+=g;S.regions[i].gotv=Math.min(4,S.regions[i].gotv+.4);P.loy-=10;
  const a=anchor(btn,ev);burst(a.x,a.y,{emoji:'🚩',n:10});floatText(a.x,a.y-16,'+'+f1(g),'good');
  toast(`Партийный аппарат поднят в регионе ${R.name}: +${f1(g)} к поддержке${head?' (местный глава помог)':''}. Лояльность −10.`);after()};
A.shield=(v,btn,ev)=>{
  const P=party();
  if(P.loy<12){toast('Не хватает лояльности: нужно 12.');return}
  P.loy-=12;cashState().heat*=.4;bribeState().heat*=.4;
  const a=anchor(btn,ev);flash('good');floatText(a.x,a.y-16,'Риск −60%','good');
  toast('Партийные связи закрыли вопросы: риск огласки снижен на 60%. Лояльность −12.');after()};

function partyWeek(){
  const P=party(),cp=S.camp,ids=Object.keys(P.posts);
  P.loy=clamp(P.loy-1.8+ids.length*.17,0,100);
  S.budget+=partyFees(P)-partyPay(P);            // взносы лояльной элиты минус содержание аппарата
  for(const id of ids){
    const pd=POST_BY[id],m=P.posts[id];if(!pd)continue;
    if(pd.region!=null)S.regions[pd.region].effort.player+=.45*(m.comp/70)*(.6+.4*P.loy/100);
    if(id==='youth'){S.gmod=S.gmod||{};S.gmod.youth=(S.gmod.youth||0)+.15;recUp(.12)}
  }
  if(ids.length&&!S.queue.some(q=>q.id==='betray')&&!S.pending.some(x=>x.id==='betray')){
    const risk=P.loy<40?2.2:P.loy>65?.4:1;
    for(const id of ids){const m=P.posts[id];if(Math.random()<.0035*m.amb*risk*(m.defector?1.5:1)){S.queue.push({id:'betray',p:{post:id}});break}}
  }
}
EV.betray={build(p){
  const P=party(),m=p.post&&P.posts[p.post],pd=p.post&&POST_BY[p.post],mr=mainRival();
  if(p.post&&!m)return null;
  if(!m)return{kicker:'Слухи',title:'Обиженный бывший соратник',text:'Снятый с должности партиец дал интервью: рассказывает о закулисных договорённостях и называет вас «человеком, который раздаёт должности за преданность».',choices:[
    choice('Подать в суд за клевету','$150 тыс.',()=>{S.budget-=150e3;if(Math.random()<.5){gain(1);return 'Суд обязал опровергнуть часть слов. Доверие +1.'}const d=hurt(2*legalMit());return `Суд затянулся. Доверие −${f1(d)}.`}),
    choice('Не реагировать','',()=>{const d=hurt(2.2);return `История обсуждается неделю. Доверие −${f1(d)}.`}),
  ]};
  return{kicker:'Слухи',title:`${m.name} встречается с людьми соперника`,text:`${esc(pd.name)} ${esc(m.name)} замечен на встречах с представителями ${mr?esc(S.c[mr].short):'соперников'}. Говорят, он недоволен тем, что его «недооценили».`,choices:[
    choice('Снять с должности','Лояльность −',()=>{const n=removePost(p.post);P.loy=clamp(P.loy-4*n,0,100);if(mr)addEffortAll(mr,.5);news(`${m.name} вышел из руководства партии «${S.party}»`,'rival');return `${m.name} снят${n>1?` вместе с подчинёнными (${n-1})`:''}. Лояльность −${4*n}.`}),
    choice('Удержать: повысить содержание','$300 тыс.',()=>{S.budget-=300e3;m.amb=1;P.loy=clamp(P.loy+3,0,100);return `${m.name} остаётся и больше не рвётся вверх. Лояльность +3.`}),
    choice('Сделать вид, что не заметили','Риск',()=>{if(Math.random()<.5){const d=hurt(3);if(mr)addEffortAll(mr,.8);removePost(p.post);return `Он ушёл к сопернику и вынес внутренние документы. Доверие −${f1(d)}.`}return 'Он остался, но осадок есть.'}),
  ]}}};
EV.defect={build(p){
  const k=S.c[p.c],R=REG[p.i],P=party(),pd=R&&POST_BY['r_'+R.id];
  if(!k||k.out||!pd||!partyHas('sec')||P.posts[pd.id])return null;
  return{kicker:'Поддержка',title:`Перебежчик из штаба ${k.short}`,text:`Координатор ${esc(k.short)} в регионе <b>${esc(R.name)}</b> готов перейти на вашу сторону. Он требует должность главы местного отделения и обещает привести людей.`,choices:[
    choice('Назначить главой отделения','Лояльность +, соперник −',()=>{P.posts[pd.id]={name:pick(PN.m.f)+' '+pick(PN.m.l),comp:ri(72,86),amb:3,defector:true,week:S.camp.week};P.loy=clamp(P.loy+4.5,0,100);S.regions[p.i].effort[p.c]-=2;S.regions[p.i].effort.player+=2.5;k.trust=clamp(k.trust-2,10,90);return `Перебежчик возглавил отделение в регионе ${R.name}. Вам +2,5, ${k.short} −2. Лояльность +4,5. Он амбициозен, следите за ним.`}),
    choice('Заплатить и отпустить','$200 тыс.',()=>{S.budget-=200e3;S.regions[p.i].effort[p.c]-=1.5;return `Он уходит из политики с деньгами. ${k.short} −1,5 в регионе ${R.name}.`}),
    choice('Отказаться','',()=>'Вы не стали рисковать: слишком похоже на ловушку.'),
  ]}}};

/* ---------- подкуп людей из окружения соперников ---------- */
const BRIBE={
 coord:{name:'Региональный координатор',cost:260e3,ap:1,heat:[12,18],p:.72,d:'Соперник −3…4,5 в выбранном регионе, вам +1…1,8. Иногда готов перейти к вам.'},
 staff:{name:'Человек из штаба',cost:380e3,ap:1,heat:[14,20],p:.65,d:'Компромат на соперника (для дебатов и утечек) и точный опрос на следующей неделе.'},
 official:{name:'Чиновник администрации региона',cost:520e3,ap:2,heat:[20,28],p:.6,d:'Админресурс в выбранном регионе: соперник −2…3,2, мобилизация у вас +0,8.'},
};
function bribeState(){const cp=S.camp;cp.bribe=cp.bribe||{heat:0,n:0,caught:0,last:null};return cp.bribe}
A.bribe=(v,btn,ev)=>{
  const [c,type]=String(v).split('|'),op=BRIBE[type],k=S.c[c];
  if(!op||!k||k.out)return;
  const i=S.sel,R=REG[i],B=bribeState();
  if(!spend(op.ap,op.cost))return;
  const a=anchor(btn,ev);
  B.n++;B.last=c;B.heat+=rnd(op.heat[0],op.heat[1])*(partyHas('legal')?.85:1);
  floatText(a.x,a.y-14,'−'+money(op.cost),'bad');
  if(Math.random()>=op.p){
    B.heat+=9;flash('warn');
    toast(`${op.name} отказался брать деньги. Деньги потеряны, риск огласки: ${cashRiskLabel(B.heat)}.`);
    if(Math.random()<.4)S.queue.push({id:'bribecaught',p:{c,refused:1}});
    after();return}
  burst(a.x,a.y,{emoji:'💼',n:10});
  let msg;
  if(type==='coord'){
    const d=rnd(3,4.5),u=rnd(1,1.8);S.regions[i].effort[c]-=d;S.regions[i].effort.player+=u;
    msg=`Координатор ${k.short} в регионе ${R.name} «потерял» часть работы: ему −${f1(d)}, вам +${f1(u)}.`;
    const pd=POST_BY['r_'+R.id];
    if(Math.random()<.5&&partyHas('sec')&&!party().posts[pd.id])later(ri(2,5),'defect',{c,i});
  }else if(type==='staff'){
    k.dirt=(k.dirt||0)+1;S.camp.researchNext=true;
    msg=`Получен компромат на ${k.short} (всего ${k.dirt}). Следующий опрос будет точным.`;
  }else{
    const d=rnd(2,3.2);S.regions[i].effort[c]-=d;S.regions[i].gotv=Math.min(4,S.regions[i].gotv+.8);S.regions[i].effort.player+=1;
    msg=`Администрация региона ${R.name} «помогает» вам: ${k.short} −${f1(d)}, мобилизация выросла.`;
  }
  toast(`${msg} Риск огласки: ${cashRiskLabel(B.heat)}.`);after()};
function bribeWeek(){
  const B=S.camp.bribe;if(!B)return;
  B.heat*=.9;
  if(B.heat>14&&!S.queue.some(q=>q.id==='bribecaught')&&Math.random()<Math.min(.5,(B.heat-9)/75))S.queue.push({id:'bribecaught',p:{c:B.last}});
}
EV.bribecaught={build(p){
  const B=bribeState(),k=S.c[p.c]||S.c[mainRival()];if(!k)return null;
  const sev=clamp(B.heat/22,.8,2)*(1+B.caught*.3)*legalMit();
  const after_=()=>{B.caught++;B.heat*=.3;k.trust=clamp(k.trust+3,10,90)};
  return{kicker:'Скандал',title:'Дело о подкупе',text:p.refused?`Чиновник из окружения ${esc(k.short)} заявил, что ему предлагали деньги за «правильные» решения, и передал запись в прокуратуру. Следователи ищут заказчика.`:`Задержан посредник, передававший деньги людям из окружения ${esc(k.short)}. На допросе он назвал вашу фамилию. Прокуратура запрашивает документы штаба.`,choices:[
    choice('Нанять адвокатов','$400 тыс.',()=>{S.budget-=400e3;after_();const d=hurt(3.5*sev);news(`Штаб ${PL().short} отрицает причастность к делу о подкупе`,'scandal');return `Адвокаты разобрали обвинение на части, но осадок остался. Доверие −${f1(d)}.`}),
    choice('Откреститься от посредника','Лояльность −',()=>{after_();const P=party();P.loy=clamp(P.loy-8,0,100);const d=hurt(5*sev);news(`${PL().short} заявил, что не знает задержанного`,'scandal');return `Вы объявили посредника самозванцем. Доверие −${f1(d)}, партийная элита недовольна: лояльность −8.`}),
    choice('Принести жертву: уволить сотрудника','Доверие −',()=>{after_();const pool=S.staff.filter(id=>id!=='mgr_k'&&id!=='mgr_s');
      if(pool.length){const id=pick(pool),nm=STAFF_BY[id].name;fire(id);const d=hurt(2.5*sev);news(`Из штаба ${PL().short} уволен ${nm}`,'scandal');return `${nm} уволен «за самодеятельность». Доверие −${f1(d)}.`}
      const d=hurt(5.5*sev);return `Жертвовать некем. Доверие −${f1(d)}.`}),
    choice('Заявить о провокации соперника','Риск',()=>{after_();if(Math.random()<.35){k.trust=clamp(k.trust-5,10,90);news(`Запись против ${k.short} оказалась с признаками монтажа`,'rival');return `Версия о провокации сработала: доверие к ${k.short} −5.`}const d=hurt(7*sev);return `Версию никто не купил. Доверие −${f1(d)}.`}),
  ]}}};

/* ---------- вкладка «Партия и подкуп» ---------- */
function partyScreen(){
  const P=party(),L=P.loy,R=REG[S.sel];
  const tier=L<25?['Раскол близко','down']:L<50?['Напряжённо','warn']:L<75?['Стабильно','flat']:['Монолит','up'];
  const filled=Object.keys(P.posts).length;
  const node=pd=>{
    const m=P.posts[pd.id],open=unlocked(pd),kids=kidsOf(pd.id);
    const body=m?`<span class="pt-av">${esc(ptInit(m.name))}</span><div class="pt-body"><b>${esc(pd.name)}</b><small>${esc(m.name)} · комп. ${m.comp} · амбиции ${ambDots(m.amb)}${m.defector?' · перебежчик':''}</small><small class="muted">${pd.d}</small></div><button class="btn mini" data-a="dismiss" data-v="${pd.id}">Снять</button>`
      :open?`<span class="pt-av empty">+</span><div class="pt-body"><b>${esc(pd.name)}</b><small class="muted">Вакантно. ${pd.d}</small></div><button class="btn mini primary" data-a="post" data-v="${pd.id}">Назначить</button>`
      :`<span class="pt-av empty">🔒</span><div class="pt-body"><b>${esc(pd.name)}</b><small class="muted">Нужен: ${esc(POST_BY[pd.parent].name)}</small></div>`;
    const sub=kids.length?(m?`<ul>${kids.map(node).join('')}</ul>`:`<div class="pt-hint">Откроет ещё ${kids.length} ${plural(kids.length,'должность','должности','должностей')}</div>`):'';
    return `<li class="pt-node ${m?'filled':open?'vacant':'locked'}"><div class="pt-card">${body}</div>${sub}</li>`};
  const roots=PARTY_TREE.filter(p=>!p.parent);
  const tree=`<ul class="ptree"><li class="pt-node filled root"><div class="pt-card"><span class="pt-av">${esc(ptInit(S.name||'Л'))}</span><div class="pt-body"><b>Лидер партии «${esc(S.party)}»</b><small>${esc(S.name||'')}</small></div></div><ul>${roots.map(node).join('')}</ul></li></ul>`;
  const rs=rivalsActive(),B=bribeState();
  const chips=REG.map((r,i)=>`<button class="btn mini ${i===S.sel?'primary':''}" data-a="sel" data-v="${i}">${esc(r.name)}</button>`).join('');
  const rivals=rs.map(c=>{const k=S.c[c];return `<div class="item"><div class="row" style="justify-content:space-between;gap:10px"><b style="color:${k.color}">${esc(k.name)}</b><span class="muted">${esc(k.party)}${k.dirt?` · <span class="up">компромат: ${k.dirt}</span>`:''}</span></div>
   <div class="stack" style="margin-top:8px;gap:6px">${Object.entries(BRIBE).map(([t,op])=>`<button class="btn" style="text-align:left" data-a="bribe" data-v="${c}|${t}"><b>${op.name}</b> · ${money(op.cost)} · ${op.ap} ч · успех ~${Math.round(op.p*100)}%<br><small class="muted">${op.d}</small></button>`).join('')}</div></div>`}).join('');
  return `<div class="loyalty card-in">
    <div class="row" style="justify-content:space-between;align-items:flex-end;gap:10px"><div><div class="eyebrow">Лояльность партийной элиты</div><div class="loy-num">${Math.round(L)}<small>/100</small> <span class="chip ${tier[1]}">${tier[0]}</span></div></div>
    <div class="muted" style="text-align:right;font-size:13px">Должностей занято: ${filled}/${PARTY_TREE.length}<br>Взносы элиты: +${money(partyFees(P))} · содержание аппарата: −${money(partyPay(P))} в неделю</div></div>
    <div class="lbar"><i style="width:${clamp(L,0,100)}%"></i></div>
    <p class="muted" style="font-size:13px;margin:8px 0">Лояльность растёт, когда вы раздаёте должности, и медленно падает сама. Её можно тратить, пока она есть. Чем она выше, тем реже предают назначенцы.</p>
    <div class="row" style="gap:8px;flex-wrap:wrap">
     <button class="btn" data-a="mobilize" ${L<10?'disabled':''}>🚩 Поднять аппарат · ${esc(R.name)}<small style="display:block" class="muted">−10 лояльности · 1 ч · +3…4 поддержки</small></button>
     <button class="btn" data-a="shield" ${L<12?'disabled':''}>🛡 Закрыть вопросы связями<small style="display:block" class="muted">−12 лояльности · риск огласки −60%</small></button></div></div>
  <div class="eyebrow" style="margin-top:16px">Древо должностей фракции</div>${tree}
  <div class="eyebrow" style="margin-top:16px">Подкуп людей из окружения соперников</div>
  <p class="muted" style="font-size:13px;margin:4px 0 8px">Выберите регион цели. Операции тайные, но риск огласки копится: сейчас он <b>${cashRiskLabel(B.heat)}</b>. Если дело всплывёт, пострадает доверие.</p>
  <div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${chips}</div>
  <div class="grid3">${rivals||'<p class="muted">Нет активных соперников.</p>'}</div>`}

/* ================= boot ================= */
export function boot(){
  try{const sv=loadSave();if(sv&&sv.phase&&sv.phase!=='night'&&sv.phase!=='eday')S=null}catch(e){}
  render();
  if(S)pump();
}
export { A, S as _S, loadSave, setupInner, esc, IMG, save, toast, modal, closeModal };
export const getS=()=>S;
export const __t={EV,COST,PARTY_TREE,REG,partyScreen,newGame,render,pump,nextWeek,SETUP,A,getS:()=>S,menuHTML,campaignHTML};
