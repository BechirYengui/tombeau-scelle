/* ============================================================
   JOUEUR
   ============================================================ */
var yaw=0,pitch=0,locked=false,started=false,fb=false,lx=null,ly=null,keysD={};
function grab(){ if(!started) return; var e=renderer.domElement;
  if(e.requestPointerLock){ try{ e.requestPointerLock(); }catch(x){ fb=true; } } else fb=true; }
function release(){ if(document.exitPointerLock) document.exitPointerLock(); }
document.addEventListener("pointerlockchange",function(){
  locked=(document.pointerLockElement===renderer.domElement);
  if(!locked&&started&&!panel) fb=true; });
document.addEventListener("pointerlockerror",function(){ fb=true; });
window.addEventListener("mousemove",function(e){
  if(!started||panel) return;
  var dx,dy;
  if(locked){ dx=e.movementX||0; dy=e.movementY||0; }
  else if(fb){ if(lx===null){lx=e.clientX;ly=e.clientY;return;} dx=e.clientX-lx; dy=e.clientY-ly; lx=e.clientX; ly=e.clientY; }
  else return;
  if(grabbed){ turn(dx,dy); return; }
  yaw-=dx*0.0022; pitch=Math.max(-1.3,Math.min(1.3,pitch-dy*0.0022));
  sway.x=Math.max(-0.05,Math.min(0.05,sway.x-dx*0.0004));
  sway.y=Math.max(-0.05,Math.min(0.05,sway.y-dy*0.0004));
});
window.addEventListener("keydown",function(e){
  if(chatting) return;
  keysD[e.code]=true;
  if(panel){
    if(e.code==="Escape"){ shut(); return; }
    if(panelKey){ panelKey(e); return; }     // la serrure prend la main sur le clavier
    if(e.code==="KeyE") shut();
    return;
  }
  if(e.code==="KeyE") use();
  if(e.code==="KeyI") hint();
  if(e.code==="KeyT") openChat();
  if(e.code==="KeyM" && typeof toggleMic==="function") toggleMic();
  if(e.code==="KeyR") askReset();
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code)>=0) e.preventDefault();
});
window.addEventListener("keyup",function(e){ keysD[e.code]=false; });
renderer.domElement.addEventListener("click",function(){ if(!panel) grab(); });
renderer.domElement.addEventListener("mousedown",function(e){
  if(panel||over||e.button!==0) return;
  if(locked||fb) shoot();
});

var pv=new THREE.Vector3();
function free(x,z){
  var R=0.5;
  var pts=[[x-R,z-R],[x+R,z-R],[x-R,z+R],[x+R,z+R]];
  for(var i=0;i<4;i++){
    var px=pts[i][0], pz=pts[i][1];
    if(tile(Math.round(px/T),Math.round(pz/T))) return false;
    if(mazeAt(px,pz)) return false;
    if(!opened && pz<wz(20.6) && pz>wz(19.4)) return false;   // la dalle scellée
    pv.set(px,1.0,pz);
    for(var b=0;b<BLOCK.length;b++) if(BLOCK[b].containsPoint(pv)) return false;
  }
  return true;
}
var moving=false, running=false;
function walk(dt){
  moving=false; running=false;
  if(panel||grabbed) return;
  var f=0,s=0;
  if(keysD.KeyW||keysD.KeyZ||keysD.ArrowUp) f+=1;
  if(keysD.KeyS||keysD.ArrowDown) f-=1;
  if(keysD.KeyA||keysD.KeyQ||keysD.ArrowLeft) s-=1;
  if(keysD.KeyD||keysD.ArrowRight) s+=1;
  if(!f&&!s) return;
  moving=true; running=!!(keysD.ShiftLeft||keysD.ShiftRight);
  var n=Math.hypot(f,s); f/=n; s/=n;
  var run=(keysD.ShiftLeft||keysD.ShiftRight)?1.62:1;
  var v=3.6*run*dt, p=camera.position;
  var dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*v, dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*v;
  if(free(p.x+dx,p.z)) p.x+=dx; else bump(p.x+Math.sign(dx)*T*0.9,p.z);
  if(free(p.x,p.z+dz)) p.z+=dz; else bump(p.x,p.z+Math.sign(dz)*T*0.9);
}
var ray=new THREE.Raycaster(); ray.far=3.6;
var aim=null, fr=0, ndc=new THREE.Vector2(0,0);
function scan(){
  ray.setFromCamera(ndc,camera);
  var h=ray.intersectObjects(IT,false);
  aim=null;
  for(var q=0;q<h.length;q++){
    var ob=h[q].object;
    if(ob.visible!==false && ob.userData.act){ aim=ob; break; }
  }
  var t=elTip;
  if(aim){ t.textContent="E · "+aim.userData.label; t.classList.add("on"); elDot.classList.add("hot"); }
  else{ t.classList.remove("on"); elDot.classList.remove("hot"); }
  var foe=false;
  if(hasGun && hits.length){
    shootRay.setFromCamera(ndc,camera); shootRay.far=45;
    var tg=hits.slice(); if(WALLS) tg.push(WALLS);
    var hh=shootRay.intersectObjects(tg,false);
    foe=!!(hh.length && hh[0].object.userData.mummy && !hh[0].object.userData.mummy.dead);
  }
  elDot.classList.toggle("foe",foe);
}
function use(){ if(aim&&aim.userData.act) aim.userData.act(); }

/* ---------- où suis-je ---------- */
function goal(){
  if(!started||over) return "";
  if(!has("k1"))  return "Fouiller le sol de l’antichambre.";
  if(!has("pap")) return "Ouvrir le coffret de cèdre, sur la table d’offrandes.";
  if(!has("k2"))  return "Compter ce qui brûle, saigne, sonne et veille — puis la niche, derrière la stèle du mur ouest.";
  if(!opened)     return "Composer sur la dalle les quatre lettres que portent les vases canopes.";
  var n=seals.filter(Boolean).length;
  if(n<3)         return "Trois chambres, trois sceaux — "+n+" sur 3.";
  return "Le sarcophage, au centre de la grande salle.";
}
function room(){
  var i=Math.round(camera.position.x/T), j=Math.round(camera.position.z/T);
  if(j>=21) return 0; if(j<=9) return 1; if(i<=8) return 2; if(i>=20) return 3; return 4;
}
var RN=["Antichambre","Chambre du Nord · les Éclats","Chambre de l’Ouest · les Deux Ombres",
        "Chambre de l’Est · le Passage","Grande Salle"];
var HINTS=[
  ["Rien n’est décoratif. Commencez par ce que vous foulez.",
   "Le papyrus veut quatre nombres : ce qui brûle, ce qui saigne, ce qui sonne, ce qui veille.",
   "« Ce qui sonne » n’est pas un compte d’objets : c’est ce que le gnomon désigne.",
   "Une stèle, ça se déplace. Et l’amulette du coffre renvoie aux vases canopes."],
  ["Ces éclats ne sont pas en désordre : ils le sont pour tous les yeux sauf un.",
   "Reculez vers l’entrée de la chambre, au centre, et regardez droit vers le fond."],
  ["Deux projecteurs, deux murs, deux silhouettes gravées. Il faut satisfaire les deux à la fois.",
   "Visez le solide, pressez E, puis glissez : chaque glissement le tourne d’un quart de tour."],
  ["Les murs sont là. Ils s’allument une seconde quand vous les heurtez.",
   "Longez le bord de la chambre plutôt que de couper au centre : le seul passage contourne."],
  ["Trois chambres, trois sceaux. Le sarcophage ne s’ouvre qu’après."]
];
var hi=[0,0,0,0,0];
function hint(){ if(over) return; var r=room(); var h=HINTS[r];
  say(h[Math.min(hi[r],h.length-1)]); hi[r]++; ping(330,.4,.03); }
var armed=0;
function askReset(){ if(Date.now()-armed<3000){ location.reload(); return; }
  armed=Date.now(); ping(200,.2,.04); say("Appuyez encore sur R pour tout recommencer."); }
$("#bHint").addEventListener("click",hint);
$("#bReset").addEventListener("click",askReset);

/* ---------- chrono ---------- */
var LIMIT=20*60, left=LIMIT, over=false;
function chrono(dt){
  if(!started||over||panel) return;
  left-=dt; if(left<=0){ left=0; lose(); }
  var m=Math.floor(left/60), s=Math.floor(left%60);
  $("#clock").textContent=String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
  $("#clock").classList.toggle("warn",left<180);
  var d=left<180?0.4+0.6*(left/180):1;
  for(var i=0;i<lampsA.length;i++) lampsA[i].intensity=(i===2?3.5:4)*d;
}

/* ---------- boucle ---------- */
var clk=new THREE.Clock();
var elWhere=$("#where"), elGoal=$("#goal"), elTip=$("#tip"),
    elDot=$("#dot"), elClock=$("#clock"), elFps=$("#fps");
var fpsAcc=0, fpsN=0;
function loop(){
  requestAnimationFrame(loop);
  var dt=Math.min(clk.getDelta(),0.05);
  walk(dt); camera.rotation.set(pitch,yaw,0,"YXZ");
  if((fr++ & 3)===0 && started && !panel) scan();

  var sc=seals[0]?1:anaScore();
  shardMat.emissiveIntensity=Math.pow(sc,3)*2.0;
  if(!seals[0]){ for(var i=0;i<shards.length;i++) shards[i].rotation.y+=shards[i].userData.s*dt*(1-sc*0.97);
    if(sc>0.50) grant(0); }

  var now=performance.now();
  for(var k=marks.length-1;k>=0;k--){ var a=(now-marks[k].t)/5200;
    if(a>=1){ scene.remove(marks[k]); marks.splice(k,1); } else marks[k].material.opacity=.5*(1-a); }
  if(!seals[2] && Math.hypot(camera.position.x-PED.x,camera.position.z-PED.z)<2.6) grant(2);
  if(keyObj.visible){
    keyObj.rotation.y+=dt*0.9;
    keyObj.position.y=0.46+Math.sin(now*0.0021)*0.055;
    keyHit.position.y=keyObj.position.y;
    keyHalo.material.opacity=0.13+Math.sin(now*0.0021)*0.05;
  }
  if(window.__orb){ window.__orb.rotation.y+=dt*0.8;
    var dp=Math.hypot(camera.position.x-PED.x,camera.position.z-PED.z);
    var nr=Math.max(0,Math.min(1,1-(dp-2.6)/9));
    window.__orb.material.emissiveIntensity=0.9+nr*2.6;
    window.__orb.scale.setScalar(1+nr*0.3); }

  seal.position.y += ((opened?-2.2:1.7)-seal.position.y)*Math.min(1,dt*1.2);
  var all=seals[0]&&seals[1]&&seals[2];
  var L=sarc.userData.lid;
  L.position.z += ((all?2.4:0)-L.position.z)*Math.min(1,dt*0.9);
  if(all && !over && Math.hypot(camera.position.x-wx(14),camera.position.z-wz(15))<2.2) win();

  // gardiens
  for(var mi=0;mi<mummies.length;mi++) mummies[mi].step(dt,camera.position.x,camera.position.z);
  // gerbes de poussière
  for(var bi=bursts.length-1;bi>=0;bi--){
    var B=bursts[bi]; B.life+=dt;
    var pa=B.p.geometry.attributes.position;
    for(var vi=0;vi<B.v.length;vi++){
      B.v[vi][1]-=4.6*dt;
      pa.array[vi*3  ]+=B.v[vi][0]*dt;
      pa.array[vi*3+1]+=B.v[vi][1]*dt;
      pa.array[vi*3+2]+=B.v[vi][2]*dt;
    }
    pa.needsUpdate=true;
    B.p.material.opacity=Math.max(0,.95-B.life/1.5);
    if(B.life>1.5){ scene.remove(B.p); bursts.splice(bi,1); }
  }
  motes.position.y=Math.sin(now*0.00016)*0.4;
  stepShells(dt); footsteps(dt); ambientGroans(dt);
  if(reloading>0){ reloading-=dt;
    if(reloading<=0){ reloading=0; mag=MAG; updAmmo(); ping(520,.09,.04); } }
  viewmodel(dt,moving);

  elWhere.textContent=RN[room()];
  if((fr&31)===0) elGoal.textContent=goal();
  chrono(dt);
  if((fr%3)===0) renderer.shadowMap.needsUpdate=true;   // ombres : 20 Hz au lieu de 60
  fpsAcc+=dt; fpsN++;
  if(fpsAcc>=0.5){ elFps.textContent=Math.round(fpsN/fpsAcc)+" ips"; fpsAcc=0; fpsN=0; }
  renderer.clear();
  renderer.render(scene,camera);
  renderer.clearDepth();          // les mains ne peuvent traverser aucun mur
  renderer.render(vmScene,vmCam);
}
loop();
addEventListener("resize",function(){
  camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  vmCam.aspect=innerWidth/innerHeight; vmCam.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

function startGame(){
  if(started) return;
  var iv=document.getElementById("intro"); if(iv) iv.remove();
  started=true; clk.getDelta(); grab(); ping(440,.3,.04);
  hasGun=true; updAmmo(); ambience();
  setTimeout(function(){ $("#bar").classList.add("faded"); },12000);
  new Mummy(wx(11),   wz(22.5));
  new Mummy(wx(18),   wz(27.0));
  new Mummy(wx(11.5), wz(27.5));
  groan(camera.position);
  say("La dalle est retombée. Vingt minutes — et vous n’êtes pas seul ici.");
}
$("#enter").addEventListener("click",startGame);

function end(k,t,b){
  over=true; release();
  var v=document.createElement("div"); v.className="veil";
  v.innerHTML='<div><div class="kicker">'+k+'</div><h1>'+t+'</h1><p>'+b+'</p>'+
    '<button class="go" type="button" id="ag">Recommencer</button></div>';
  document.body.appendChild(v);
  v.querySelector("#ag").addEventListener("click",function(){ location.reload(); });
}
function win(){ if(over) return;
  var u=LIMIT-left, m=Math.floor(u/60), s=Math.floor(u%60);
  ping(523,.5,.05); setTimeout(function(){ping(659,.5,.05);},150); setTimeout(function(){ping(784,1,.05);},300);
  end("Le sarcophage est ouvert","Remonté au jour",
    "Quatre salles, trois sceaux, deux serrures et une natte de roseaux — en "+m+" min "+s+" s.");
}
function fell(){ if(over) return;
  end("Les bandelettes se sont refermées","Vous restez",
    "Le tombeau garde ceux qui le réveillent. Vous montez la garde, désormais, avec les autres.");
}
function lose(){ if(over) return;
  end("Les torches se sont éteintes","Le temps",
    "Vingt minutes ne suffisaient pas. Le tombeau n’a pas bougé : il vous attend, exactement pareil."); }
