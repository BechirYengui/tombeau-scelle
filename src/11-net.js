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
  var coat=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.31,1.05,10),
    new THREE.MeshStandardMaterial({color:0x2c2418,roughness:.92}));
  coat.position.y=0.60; coat.castShadow=true; g.add(coat);
  var head=new THREE.Mesh(new THREE.SphereGeometry(0.145,10,8),
    new THREE.MeshStandardMaterial({color:0xcb9a72,roughness:.7}));
  head.position.y=1.28; g.add(head);
  var hat=new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.035,14),
    new THREE.MeshStandardMaterial({color:0x3a2c1a,roughness:.95}));
  hat.position.y=1.40; g.add(hat);
  var fl=new THREE.Mesh(new THREE.SphereGeometry(0.065,8,8),
    new THREE.MeshBasicMaterial({color:c})); fl.position.set(0.30,1.02,0.16); g.add(fl);
  var lt=new THREE.PointLight(c.getHex(),3.4,10,2); lt.position.set(0.30,1.12,0.16); g.add(lt);
  var tg=nameTag(name,col); tg.position.y=1.86; g.add(tg);
  scene.add(g); return g;
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
var net={peer:null,conn:null,mic:null,code:null,host:false,voice:false}, mate=null;
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
function playRemote(stream){
  var a=document.createElement("audio");
  a.autoplay=true; a.playsInline=true; a.srcObject=stream; a.style.display="none";
  document.body.appendChild(a);
  a.play().catch(function(){});
  net.voice=true; stat("Voix connectée — vous vous entendez.");
}
// on appelle dès qu’on a À LA FOIS une connexion et un micro, quel que soit le côté
function tryCall(){
  if(!net.peer||!net.conn||!net.mic) return;
  try{
    var c=net.peer.call(net.conn.peer, net.mic);
    if(c) c.on("stream",playRemote);
  }catch(e){}
}
function wire(c){
  net.conn=c;
  c.on("open",function(){
    if(!net.host) netSend({k:"hello",code:net.code});   // le visiteur prouve qu'il detient le code
    else setTimeout(function(){ if(!c.__ok){ stat("Pair non identifié — rejeté."); try{c.close();}catch(e){} } },6000);
    stat("Coéquipier connecté" + (net.mic?" — ouverture de la voix…":" — activez le micro pour parler."));
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
    stat("Partie ouverte. Code : "+net.code+" — en attente du coéquipier.");
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
  return true;
}
function toggleMic(){
  var b=$("#bMic");
  if(net.mic){
    net.mic.getTracks().forEach(function(t){ t.stop(); });
    net.mic=null; b.classList.remove("live"); b.textContent="🎙 Activer le micro";
    stat("Micro coupé."); return;
  }
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    stat("Micro indisponible : la page doit être servie en HTTPS."); return;
  }
  navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})
    .then(function(st){
      net.mic=st; b.classList.add("live"); b.textContent="🎙 Micro actif";
      stat(net.conn?"Micro actif — ouverture de la voix…":"Micro actif. Créez ou rejoignez une partie.");
      tryCall();
    })
    .catch(function(err){ stat("Micro refusé ("+err.name+"). Autorisez-le dans la barre d’adresse."); });
}
(function(){
  var h=$("#bHost"), j=$("#bJoin"), m=$("#bMic"), jc=$("#jcode");
  if(!h) return;
  h.addEventListener("click",function(){ jc.classList.remove("on"); netHost(); startGame(); });
  j.addEventListener("click",function(){
    jc.classList.add("on"); jc.focus();
    stat("Entrez les 6 lettres du code, puis Entrée.");
  });
  jc.addEventListener("keydown",function(e){ if(e.key==="Enter"){ if(netJoin()) startGame(); } });
  m.addEventListener("click",toggleMic);
  setInterval(function(){
    if(!started) return;
    netSend({k:"pos",x:+camera.position.x.toFixed(2),z:+camera.position.z.toFixed(2),
      y:+yaw.toFixed(2),n:myName,c:myCol});
  },70);
})();
