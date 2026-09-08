/* ============================================================
   JEU À DEUX  —  capacité "room" : tous ceux qui ont la page ouverte
   ============================================================ */
var coop=null, avatars={}, chatting=false;
var myName="Explorateur "+(10+Math.floor(Math.random()*90));
var myCol=["#e8b860","#4a7ec4","#8fc98a","#d98cc8"][Math.floor(Math.random()*4)];
function nameTag(txt,col){
  var t=paint(256,64,function(g,w,h){
    g.clearRect(0,0,w,h);
    g.font="bold 30px Manrope, Arial, sans-serif"; g.textAlign="center"; g.textBaseline="middle";
    g.fillStyle="rgba(0,0,0,.55)"; g.fillText(txt,w/2+2,h/2+2);
    g.fillStyle=col; g.fillText(txt,w/2,h/2);
  });
  var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
  sp.scale.set(1.9,0.48,1); return sp;
}
function makeAvatar(name,col){
  var g=new THREE.Group(), c=new THREE.Color(col);
  var coat =new THREE.MeshStandardMaterial({color:0x37301f,roughness:.92,envMapIntensity:.3});
  var dark =new THREE.MeshStandardMaterial({color:0x241d13,roughness:.95});
  var flesh=new THREE.MeshStandardMaterial({color:0xc79a72,roughness:.7});
  var metal=new THREE.MeshStandardMaterial({color:0xb8933f,roughness:.35,metalness:.9,envMapIntensity:1.2});
  function seg(par,len,r1,r2,mat,x,y,z){
    var q=new THREE.Group(); q.position.set(x,y,z); par.add(q);
    var m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,9), mat);
    m.position.y=-len/2; m.castShadow=true; q.add(m);
    var j=new THREE.Mesh(new THREE.SphereGeometry(r2,8,6), mat); j.position.y=-len; q.add(j);
    return q;
  }
  // jambes
  var ll=seg(g,0.44,0.088,0.070,dark,-0.115,0.86,0), llf=seg(ll,0.42,0.068,0.060,dark,0,-0.44,0);
  var rl=seg(g,0.44,0.088,0.070,dark, 0.115,0.86,0), rlf=seg(rl,0.42,0.068,0.060,dark,0,-0.44,0);
  [llf,rlf].forEach(function(f){
    var boot=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.09,0.24), dark);
    boot.position.set(0,-0.44,0.05); boot.castShadow=true; f.add(boot);
  });
  // buste, ceinture, épaules
  var torso=new THREE.Mesh(new THREE.CylinderGeometry(0.205,0.165,0.56,12), coat);
  torso.position.y=1.16; torso.castShadow=true; g.add(torso);
  var belt=new THREE.Mesh(new THREE.CylinderGeometry(0.172,0.172,0.07,12), dark);
  belt.position.y=0.90; g.add(belt);
  var buckle=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.055,0.02), metal);
  buckle.position.set(0,0.90,0.17); g.add(buckle);
  var shoul=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.075,0.44,10), coat);
  shoul.rotation.z=Math.PI/2; shoul.position.y=1.40; shoul.castShadow=true; g.add(shoul);
  // bras
  var la=seg(g,0.32,0.070,0.058,coat,-0.225,1.38,0), laf=seg(la,0.30,0.056,0.048,coat,0,-0.32,0);
  var ra=seg(g,0.32,0.070,0.058,coat, 0.225,1.38,0), raf=seg(ra,0.30,0.056,0.048,coat,0,-0.32,0);
  [laf,raf].forEach(function(f){
    var h=new THREE.Mesh(new THREE.SphereGeometry(0.052,8,6), flesh);
    h.position.y=-0.30; h.scale.set(1,1.15,.8); f.add(h);
  });
  la.rotation.x=0.12; ra.rotation.x=-0.55; raf.rotation.x=-0.75;   // le bras droit tient la lanterne
  // cou, tête, foulard
  var neck=new THREE.Mesh(new THREE.CylinderGeometry(0.058,0.070,0.10,9), flesh);
  neck.position.y=1.47; g.add(neck);
  var head=new THREE.Mesh(new THREE.SphereGeometry(0.135,14,11), flesh);
  head.position.y=1.60; head.scale.set(.92,1.08,.98); head.castShadow=true; g.add(head);
  var scarf=new THREE.Mesh(new THREE.TorusGeometry(0.085,0.036,7,14), new THREE.MeshStandardMaterial({color:c,roughness:.9}));
  scarf.rotation.x=Math.PI/2; scarf.position.y=1.475; g.add(scarf);
  // chapeau à large bord
  var brim=new THREE.Mesh(new THREE.CylinderGeometry(0.255,0.275,0.022,18), dark);
  brim.position.y=1.695; brim.castShadow=true; g.add(brim);
  var crown=new THREE.Mesh(new THREE.CylinderGeometry(0.128,0.145,0.155,14), dark);
  crown.position.y=1.775; crown.castShadow=true; g.add(crown);
  var band=new THREE.Mesh(new THREE.TorusGeometry(0.140,0.017,6,16), new THREE.MeshStandardMaterial({color:c,roughness:.85}));
  band.rotation.x=Math.PI/2; band.position.y=1.712; g.add(band);
  // besace
  var bag=new THREE.Mesh(new THREE.BoxGeometry(0.20,0.17,0.11), dark);
  bag.position.set(-0.20,1.00,-0.06); bag.rotation.z=0.18; bag.castShadow=true; g.add(bag);
  // lanterne dans la main droite, avec sa vraie lumière
  var lant=new THREE.Group(); lant.position.set(0.30,0.98,0.22); g.add(lant);
  lant.add(new THREE.Mesh(new THREE.TorusGeometry(0.045,0.008,6,12), metal));
  var cage=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.062,0.14,8), metal);
  cage.position.y=-0.10; lant.add(cage);
  var fl=new THREE.Mesh(new THREE.SphereGeometry(0.040,9,9), new THREE.MeshBasicMaterial({color:c}));
  fl.position.y=-0.10; lant.add(fl);
  var lt=new THREE.PointLight(c.getHex(),3.6,11,2); lt.position.set(0.30,0.90,0.22); g.add(lt);
  var tg=nameTag(name,col); tg.position.y=2.10; g.add(tg);
  g.userData={ll:ll,rl:rl,la:la,ra:ra,lant:lant,fl:fl,t:0,px:0,pz:0,spd:0};
  scene.add(g); return g;
}
// la démarche : sans elle l’explorateur glisse au sol comme un carton
function stepMate(dt){
  if(!mate) return;
  var u=mate.userData;
  var d=Math.hypot(mate.position.x-u.px, mate.position.z-u.pz);
  u.px=mate.position.x; u.pz=mate.position.z;
  u.spd += (Math.min(1,d/(dt*3.4))-u.spd)*Math.min(1,dt*7);
  u.t += dt*(2.2+u.spd*8.5);
  var sw=Math.sin(u.t)*0.42*u.spd;
  u.ll.rotation.x= sw; u.rl.rotation.x=-sw;
  u.la.rotation.x=0.12-sw*0.55;
  mate.position.y=Math.abs(Math.sin(u.t))*0.035*u.spd;
  u.lant.rotation.z=Math.sin(u.t*0.9)*0.22*(0.3+u.spd);
  u.fl.scale.setScalar(0.85+Math.sin(performance.now()*0.012)*0.18);
}
function syncPeers(list){
  var seen={}, n=0;
  for(var i=0;i<list.length;i++){
    var pr=list[i]; n++;
    if(pr.isMe) continue;
    var pz=pr.presence||{};
    if(typeof pz.x!=="number"||typeof pz.z!=="number") continue;
    seen[pr.peer]=1;
    var a=avatars[pr.peer];
    if(!a){ a=avatars[pr.peer]=makeAvatar(String(pz.n||"Explorateur").slice(0,18), String(pz.c||"#e8b860")); }
    a.position.set(pz.x,0,pz.z);
    if(typeof pz.y==="number") a.rotation.y=pz.y;
  }
  for(var k in avatars) if(!seen[k]){ scene.remove(avatars[k]); delete avatars[k]; }
  var box=$("#coop");
  if(n>1){ box.classList.add("on"); $("#coopn").textContent=n+" explorateurs"; }
  else box.classList.remove("on");
}
function chatLine(who,txt,mine){
  var d=document.createElement("div");
  if(mine) d.className="me";
  var b=document.createElement("b"); b.textContent=who+" ";
  d.appendChild(b); d.appendChild(document.createTextNode(txt));   // jamais d'HTML : entrée non fiable
  var lg=$("#log"); lg.appendChild(d);
  while(lg.children.length>5) lg.removeChild(lg.firstChild);
  setTimeout(function(){ if(d.parentNode) d.parentNode.removeChild(d); },26000);
}
function openChat(){
  if(!net.conn) { say("Personne d’autre n’est connecté. Créez une partie depuis l’accueil."); return; }
  chatting=true; release();
  var m=$("#msg"); m.classList.add("on"); m.value=""; m.focus();
}
function closeChat(){ chatting=false; $("#msg").classList.remove("on"); $("#msg").blur(); grab(); }
$("#msg").addEventListener("keydown",function(e){
  e.stopPropagation();
  if(e.key==="Escape"){ closeChat(); return; }
  if(e.key!=="Enter") return;
  var t=this.value.trim().slice(0,120);
  if(t){ netSend({k:"chat",t:t,n:myName}); chatLine(myName,t,true); }
  closeChat();
});
/* ---------- réseau : PeerJS (annuaire) puis WebRTC pair-à-pair ----------
   Tout état est affiché à l’écran : une connexion qui échoue en silence
   est impossible à diagnostiquer pour le joueur.                        */
var net={peer:null,conn:null,mic:null,code:null,host:false,voice:false,
         called:false,needCall:false}, mate=null;
var ALPHA="ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode(){ var c=""; for(var i=0;i<6;i++) c+=ALPHA[(Math.random()*ALPHA.length)|0]; return c; }
function stat(t){
  var e=document.getElementById("lstat"); if(e) e.textContent=t;
  var h=document.getElementById("nstat");
  if(h){ h.textContent=t; h.parentNode.classList.add("on"); }
}
/* --- tout ce qui arrive du reseau est hostile jusqu a preuve du contraire --- */
var WMIN=-6, WMAX=GW*T+6;
function num(v,lo,hi){ return (typeof v==="number"&&isFinite(v)&&v>=lo&&v<=hi)?v:null; }
var HEX=/^#[0-9a-fA-F]{6}$/;
function clean(v,max){                       // ni HTML, ni caracteres de controle
  return String(v==null?"":v).replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u2028\u2029\ufeff]/g,"").slice(0,max);
}
var flood={t:0,n:0}, chatF={t:0,n:0};
function underRate(b,perSec){                // un pair ne peut pas noyer la boucle
  var now=performance.now();
  if(now-b.t>1000){ b.t=now; b.n=0; }
  return (++b.n)<=perSec;
}
function armEnter(txt){
  var b=document.getElementById("enter");
  if(b){ b.textContent=txt||"Descendre dans le tombeau"; b.classList.add("ready"); }
}
function netSend(o){ if(net.conn&&net.conn.open){ try{ net.conn.send(o); }catch(e){} } }
function onPacket(d,conn){
  if(!underRate(flood,80)) return;                    // 80 paquets/s au plus
  if(!d||typeof d!=="object"||Array.isArray(d)) return;
  if(d.k==="hello"){                                  // poignée de main : le code doit correspondre
    if(clean(d.code,12)===net.code) conn.__ok=true;
    else { stat("Connexion refusée : code invalide."); try{ conn.close(); }catch(e){} }
    return;
  }
  if(net.host && !conn.__ok) return;                  // rien n'est écouté avant la poignée de main
  if(d.k==="pos"){
    var x=num(d.x,WMIN,WMAX), z=num(d.z,WMIN,WMAX), ry=num(d.y,-1e4,1e4);
    if(x===null||z===null) return;                    // NaN, Infini, hors monde : rejeté
    if(!mate){
      mate=makeAvatar(clean(d.n,18)||"Explorateur", HEX.test(d.c)?d.c:"#e8b860");
      stat("Coéquipier visible dans le tombeau.");
    }
    mate.position.set(x,0,z);
    if(ry!==null) mate.rotation.y=ry;
    $("#coop").classList.add("on"); $("#coopn").textContent="2 explorateurs";
  } else if(d.k==="chat"){
    if(!underRate(chatF,2)) return;                   // deux messages par seconde au plus
    var txt=clean(d.t,120); if(!txt) return;
    chatLine(clean(d.n,18)||"?", txt, false);
  } else if(d.k==="shot"){ noise(0.16,900,0.045); }
}
/* --- vumetres : une voix qui ne passe pas doit se VOIR, pas se deviner --- */
var vuA=null, vuB=null, vuCtx=null;
function meter(stream,which){
  try{
    if(!vuCtx) vuCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(vuCtx.state==="suspended") vuCtx.resume();
    var src=vuCtx.createMediaStreamSource(stream);
    var an=vuCtx.createAnalyser(); an.fftSize=256; an.smoothingTimeConstant=0.75;
    src.connect(an);
    var buf=new Uint8Array(an.frequencyBinCount);
    var bar=document.getElementById(which);
    (function tick(){
      an.getByteFrequencyData(buf);
      var sum=0; for(var i=0;i<buf.length;i++) sum+=buf[i];
      var lvl=Math.min(100,(sum/buf.length)*2.6);
      if(bar) bar.style.width=lvl.toFixed(0)+"%";
      requestAnimationFrame(tick);
    })();
    if(which==="vuMe") vuA=an; else vuB=an;
  }catch(e){}
}
function playRemote(stream){
  var a=document.getElementById("remoteAudio");
  if(!a){
    a=document.createElement("audio"); a.id="remoteAudio";
    a.style.cssText="position:fixed;width:1px;height:1px;opacity:0;pointer-events:none";
    document.body.appendChild(a);
  }
  a.autoplay=true; a.playsInline=true; a.volume=1; a.srcObject=stream;
  a.play().catch(function(){ stat("Le navigateur bloque le son : cliquez une fois dans la page."); });
  meter(stream,"vuThem");
  var vb=document.getElementById("vubox"); if(vb) vb.classList.add("on");
  net.voice=true; stat("Voix connectée — vous vous entendez.");
}
// on appelle dès qu’on a À LA FOIS une connexion et un micro, quel que soit le côté
// Un seul sens d'appel. Quand les deux cotes appelaient, les deux flux
// entraient en collision et le son ne passait ni dans un sens ni dans l'autre.
function tryCall(){
  if(!net.peer||!net.conn||!net.mic) return;
  if(net.host && !net.needCall) return;      // l'hote se contente de repondre
  if(net.called) return;
  try{
    var c=net.peer.call(net.conn.peer, net.mic);
    if(c){ net.called=true; c.on("stream",playRemote);
           c.on("close",function(){ net.called=false; }); }
  }catch(e){}
}
function wire(c){
  net.conn=c;
  c.on("open",function(){
    if(!net.host) netSend({k:"hello",code:net.code});   // le visiteur prouve qu'il detient le code
    else setTimeout(function(){ if(!c.__ok){ stat("Pair non identifié — rejeté."); try{c.close();}catch(e){} } },6000);
    stat("Coéquipier connecté" + (net.mic?" — voix en cours d’ouverture. Vous pouvez descendre."
                                          :" — activez le micro, puis descendez."));
    armEnter("Descendre dans le tombeau");
    tryCall();
  });
  c.on("data",function(d){ onPacket(d,c); });
  c.on("error",function(e){ stat("Erreur de liaison : "+(e&&e.type||e)); });
  c.on("close",function(){
    stat("Coéquipier déconnecté.");
    if(mate){ scene.remove(mate); mate=null; }
    $("#coop").classList.remove("on"); net.conn=null;
  });
}
function attachPeer(){
  net.peer.on("connection",wire);
  net.peer.on("call",function(c){
    c.answer(net.mic||undefined);          // on répond même sans micro : on écoute
    c.on("stream",playRemote);
    if(!net.mic) net.needCall=true;        // sans micro à cet instant, on rappellera
  });
  net.peer.on("disconnected",function(){ stat("Annuaire perdu — tentative de reconnexion…");
    try{ net.peer.reconnect(); }catch(e){} });
  net.peer.on("error",function(e){
    var t=(e&&e.type)||"inconnue";
    if(t==="peer-unavailable") stat("Aucune partie à ce code. Vérifiez les 6 lettres.");
    else if(t==="unavailable-id"){ stat("Code déjà pris, nouveau tirage…"); net.peer.destroy(); netHost(); }
    else if(t==="browser-incompatible") stat("Ce navigateur ne gère pas WebRTC.");
    else stat("Erreur réseau : "+t);
  });
}
function netHost(){
  if(!window.Peer){ stat("PeerJS n’a pas pu être chargé (réseau ?)."); return; }
  net.host=true; net.code=newCode();
  net.peer=new Peer("tombeau-"+net.code,{debug:0});
  net.peer.on("open",function(){
    var e=$("#lcode"); e.textContent=net.code; e.classList.add("on");
    $("#gcodev").textContent=net.code; $("#gcode").classList.add("on");
    stat("Partie ouverte. Transmettez le code, attendez votre coéquipier, puis descendez.");
    armEnter("Descendre dans le tombeau");
  });
  attachPeer();
}
function netJoin(){
  if(!window.Peer){ stat("PeerJS n’a pas pu être chargé (réseau ?)."); return; }
  var code=($("#jcode").value||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"");
  if(code.length!==6){ stat("Le code fait exactement 6 caractères."); return false; }
  net.host=false; net.code=code;
  net.peer=new Peer({debug:0});
  net.peer.on("open",function(){
    stat("Connexion à "+code+"…");
    wire(net.peer.connect("tombeau-"+code,{reliable:true}));
    setTimeout(function(){                        // une seconde tentative si rien ne vient
      if(!net.conn||!net.conn.open){ stat("Pas de réponse, nouvelle tentative…");
        wire(net.peer.connect("tombeau-"+code,{reliable:true})); }
    },3500);
  });
  attachPeer();
  $("#gcodev").textContent=code; $("#gcode").classList.add("on");
  armEnter("Descendre dans le tombeau");
  return true;
}
function micUI(){
  var on=!!net.mic;
  var b=document.getElementById("bMic");
  if(b){ b.classList.toggle("live",on); b.textContent=on?"🎙 Micro actif":"🎙 Activer le micro"; }
  var h=document.getElementById("micind");
  if(h){ h.classList.add("on"); h.classList.toggle("live",on);
         h.textContent=on?"🎙 Micro actif":"🔇 Micro coupé — cliquez ou M"; }
}
// Demandee des qu une partie s ouvre : le joueur n a pas a y penser.
function askMic(){ if(!net.mic) toggleMic(); else micUI(); }
function toggleMic(){
  var b=$("#bMic");
  if(net.mic){
    net.mic.getTracks().forEach(function(t){ t.stop(); });
    net.mic=null; micUI();
    stat("Micro coupé. Cliquez l’indicateur ou pressez M pour le rouvrir."); return;
  }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    stat("Micro indisponible : la page doit être servie en HTTPS."); return;
  }
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})
    .then(function(st){
      net.mic=st; micUI();
      st.getAudioTracks().forEach(function(t){        // le navigateur ou l’OS peut le couper
        t.onended=function(){ net.mic=null; micUI(); stat("Micro perdu. Pressez M pour le rouvrir."); };
      });
      meter(st,"vuMe");
      var vb=document.getElementById("vubox"); if(vb) vb.classList.add("on");
      if(net.host && net.conn) net.needCall=true;   // l'hôte n'avait pas de micro à la réponse
      stat(net.conn?"Micro actif — ouverture de la voix…":"Micro actif. Créez ou rejoignez une partie.");
      tryCall();
    })
    .catch(function(err){
      micUI();
      stat(err.name==="NotAllowedError"
        ? "Micro refusé. Cliquez le cadenas 🔒 à gauche de l’adresse, autorisez le microphone, puis pressez M."
        : (err.name==="NotFoundError" ? "Aucun micro détecté sur cet ordinateur."
                                      : "Micro indisponible ("+err.name+")."));
    });
}
(function(){
  var h=$("#bHost"), j=$("#bJoin"), m=$("#bMic"), jc=$("#jcode");
  if(!h) return;
  h.addEventListener("click",function(){ jc.classList.remove("on"); askMic(); netHost(); });
  j.addEventListener("click",function(){
    jc.classList.add("on"); jc.focus();
    stat("Entrez les 6 lettres du code, puis Entrée.");
  });
  jc.addEventListener("keydown",function(e){ if(e.key==="Enter"){ askMic(); netJoin(); } });
  m.addEventListener("click",toggleMic);
  var ind=document.getElementById("micind");
  if(ind) ind.addEventListener("click",toggleMic);
  document.getElementById("enter").addEventListener("click",function(){
    if(net.peer && !net.mic) askMic();          // dernier rappel avant de descendre
  });
  setInterval(function(){
    if(!started) return;
    netSend({k:"pos",x:+camera.position.x.toFixed(2),z:+camera.position.z.toFixed(2),
      y:+yaw.toFixed(2),n:myName,c:myCol});
  },70);
})();
