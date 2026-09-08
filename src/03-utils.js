/* ============================================================
   OUTILS
   ============================================================ */
var IT=[], BLOCK=[];
function box(w,h,d,x,y,z,mat){ var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat||matDark);
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; scene.add(m); return m; }
function solid(m,p){ var b=new THREE.Box3().setFromObject(m); b.expandByScalar(p||0.25); BLOCK.push(b); return m; }
function act(m,label,fn){ m.userData.label=label; m.userData.act=fn; IT.push(m); return m; }
function say(t){ var e=$("#say"); if(!t){e.classList.remove("on");return;}
  e.textContent=t; e.classList.add("on"); clearTimeout(say._t);
  say._t=setTimeout(function(){e.classList.remove("on");},7000); }
function ping(f,d,g){ try{ if(!ping._c) ping._c=new (window.AudioContext||window.webkitAudioContext)();
  var c=ping._c,o=c.createOscillator(),a=c.createGain(); o.frequency.value=f;o.type="sine";
  a.gain.setValueAtTime(0,c.currentTime); a.gain.linearRampToValueAtTime(g||.04,c.currentTime+.01);
  a.gain.exponentialRampToValueAtTime(.0001,c.currentTime+d);
  o.connect(a);a.connect(c.destination);o.start();o.stop(c.currentTime+d+.02);}catch(e){} }
function flash(){ var f=$("#flash"); f.classList.add("on"); setTimeout(function(){f.classList.remove("on");},90); }

var bag={};
function has(k){ return !!bag[k]; }
function take(k,g,l,onclick){
  if(bag[k]) return; bag[k]=1;
  var d=document.createElement("div"); d.className="item";
  d.innerHTML=g+'<span class="t">'+l+'</span>';
  if(onclick) d.addEventListener("click",onclick);
  $("#bag").appendChild(d); d.classList.add("fresh");
  setTimeout(function(){d.classList.remove("fresh");},1600); ping(659,.4,.05);
}
var panel=null, panelKey=null;
function shut(){ if(panel){panel.remove();panel=null;} panelKey=null; grab(); }
function show(html){ release(); panel=document.createElement("div"); panel.className="panel";
  panel.innerHTML=html; document.body.appendChild(panel);
  var c=panel.querySelector(".close"); if(c) c.addEventListener("click",shut);
  panel.addEventListener("click",function(e){ if(e.target===panel) shut(); }); }
