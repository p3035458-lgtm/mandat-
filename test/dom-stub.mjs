export const store={};
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
