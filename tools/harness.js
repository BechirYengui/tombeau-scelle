// Banc d'essai : exécute le script du jeu avec un THREE et un DOM factices.
// But unique : faire remonter toute exception levée AU CHARGEMENT.
const mk = (name) => new Proxy(function(){}, {
  get(t,k){
    if(k==='then') return undefined;
    if(k==='data') return new Uint8ClampedArray(256*256*4);
    if(k===Symbol.toPrimitive) return ()=>1;
    if(k==='length') return 0;
    if(typeof k==='symbol') return undefined;
    return mk(name+'.'+String(k));
  },
  apply(){ return mk(name+'()'); },
  construct(){ return mk('new '+name); },
  set(){ return true; }
});
const ctx2d = {
  fillRect(){}, fillText(){}, beginPath(){}, arc(){}, ellipse(){}, fill(){}, stroke(){},
  moveTo(){}, lineTo(){}, quadraticCurveTo(){}, bezierCurveTo(){}, strokeRect(){}, closePath(){},
  createLinearGradient(){ return {addColorStop(){}}; },
  getImageData(x,y,w,h){ return {data:new Uint8ClampedArray(w*h*4), width:w, height:h}; },
  createImageData(w,h){ return {data:new Uint8ClampedArray(w*h*4), width:w, height:h}; },
  putImageData(){}, save(){}, restore(){}, translate(){}, rotate(){},
  set fillStyle(v){}, set strokeStyle(v){}, set lineWidth(v){}, set font(v){},
  set textAlign(v){}, set textBaseline(v){}, set lineCap(v){}
};
function el(tag){
  const n = {
    tagName:tag, width:0, height:0, style:{}, dataset:{}, children:[],
    classList:{add(){},remove(){},toggle(){},contains(){return false}},
    getContext(){ return ctx2d; },
    appendChild(c){ n.children.push(c); return c; },
    insertBefore(c){ n.children.push(c); return c; },
    removeChild(){}, remove(){}, addEventListener(){}, removeEventListener(){},
    querySelector(){ return el('div'); },
    querySelectorAll(){ return { forEach(){}, length:0 }; },
    setAttribute(){}, getAttribute(){ return null; },
    focus(){}, click(){}, set textContent(v){}, get textContent(){return ''},
    set innerHTML(v){}, get innerHTML(){return ''},
    get firstElementChild(){ return el('div'); },
    get firstChild(){ return null; },
    requestPointerLock(){}, setPointerCapture(){}, getBoundingClientRect(){
      return {left:0,top:0,width:100,height:100,right:100,bottom:100}; }
  };
  return n;
}
global.window = global;
global.document = {
  createElement: el, body: el('body'), documentElement: el('html'),
  querySelector(){ return el('div'); }, getElementById(){ return el('div'); },
  addEventListener(){}, exitPointerLock(){}, pointerLockElement:null
};
global.navigator = {userAgent:'node'};
global.performance = { now: () => Date.now() };
global.requestAnimationFrame = () => 0;
global.cancelAnimationFrame = () => {};
global.addEventListener = () => {};
global.devicePixelRatio = 1;
global.innerWidth = 1280; global.innerHeight = 720;
global.setTimeout = (f,t)=>0; global.setInterval = ()=>0; global.clearTimeout=()=>{};
global.AudioContext = function(){ return mk('audio'); };
global.THREE = mk('THREE');
global.location = { reload(){} };

try {
  require('../game.js');
  console.log('CHARGEMENT OK — aucune exception au démarrage');
} catch (e) {
  console.log('EXCEPTION AU CHARGEMENT :');
  console.log('  ' + e.message);
  const line = (e.stack||'').split('\n').find(l=>l.includes('game.js'));
  if (line) console.log('  ' + line.trim());
}
