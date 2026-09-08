/* ============================================================
   LES GARDIENS
   ============================================================ */
var texWrap=paint(256,256,function(g,w,h){
  g.fillStyle="#171208"; g.fillRect(0,0,w,h);
  for(var i=-h;i<w+h;i+=14){
    g.strokeStyle="rgba("+(186+Math.random()*34)+","+(170+Math.random()*28)+","+(134+Math.random()*26)+",.93)";
    g.lineWidth=8+Math.random()*5; g.beginPath(); g.moveTo(i,0); g.lineTo(i+h*0.42,h); g.stroke();
  }
  for(var k=0;k<70;k++){ g.fillStyle="rgba(74,52,24,"+(0.10+Math.random()*0.26)+")";
    g.beginPath(); g.arc(Math.random()*w,Math.random()*h,4+Math.random()*17,0,6.2832); g.fill(); }
});
var matWrap=new THREE.MeshStandardMaterial({map:texWrap, roughness:.93, metalness:.02,
  normalMap:nWrap, normalScale:new THREE.Vector2(1.15,1.15), envMapIntensity:.5});
var ragMat=new THREE.MeshStandardMaterial({map:texWrap,roughness:1,side:THREE.DoubleSide,
  transparent:true,opacity:.93,envMapIntensity:.4});   // partagé : 7 par gardien auparavant
var mummies=[], hits=[];
var GEO={};
function gCyl(r1,r2,l,sg){ var k="c"+r1+r2+l+sg; return GEO[k]||(GEO[k]=new THREE.CylinderGeometry(r1,r2,l,sg)); }
function gSph(r,a,b){ var k="s"+r+a+b; return GEO[k]||(GEO[k]=new THREE.SphereGeometry(r,a,b)); }
function gPln(w,h){ var k="p"+w+h; return GEO[k]||(GEO[k]=new THREE.PlaneGeometry(w,h)); }
function gBox(w,h,d){ var k="b"+w+h+d; return GEO[k]||(GEO[k]=new THREE.BoxGeometry(w,h,d)); }
function limb(par,len,r1,r2,mat){
  var g=new THREE.Group(); par.add(g);
  var c=new THREE.Mesh(gCyl(r1,r2,len,9), mat);
  c.position.y=-len/2; c.castShadow=true; g.add(c);
  var j=new THREE.Mesh(gSph(r2*1.05,8,6), mat);
  j.position.y=-len; g.add(j);
  return g;
}
function Mummy(x,z){
  var g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  // buste fuselé
  var torso=new THREE.Mesh(gCyl(0.20,0.26,0.80,12), matWrap);
  torso.position.y=1.08; torso.castShadow=true; g.add(torso);
  var hips=new THREE.Mesh(gSph(0.23,10,8), matWrap);
  hips.position.y=0.72; hips.scale.set(1,.75,.9); g.add(hips);
  // crâne bandé, mâchoire noire entrouverte
  var head=new THREE.Mesh(gSph(0.165,12,10), matWrap);
  head.position.set(0,1.63,0.01); head.scale.set(.92,1.10,1); head.castShadow=true; g.add(head);
  var jaw=new THREE.Mesh(gSph(0.10,9,7),
    new THREE.MeshStandardMaterial({color:0x120c05,roughness:1}));
  jaw.position.set(0,1.50,0.075); jaw.scale.set(.9,.55,.8); g.add(jaw);
  var neck=new THREE.Mesh(gCyl(0.075,0.095,0.14,9), matWrap);
  neck.position.y=1.47; g.add(neck);
  // bras tendus vers l’avant
  var la=limb(g,0.34,0.075,0.062,matWrap); la.position.set(-0.245,1.36,0.02);
  var laf=limb(la,0.32,0.060,0.050,matWrap); laf.position.y=-0.34;
  var ra=limb(g,0.34,0.075,0.062,matWrap); ra.position.set( 0.245,1.36,0.02);
  var raf=limb(ra,0.32,0.060,0.050,matWrap); raf.position.y=-0.34;
  la.rotation.x=-1.15; ra.rotation.x=-1.15; laf.rotation.x=-0.35; raf.rotation.x=-0.35;
  // jambes
  var ll=limb(g,0.38,0.088,0.070,matWrap); ll.position.set(-0.115,0.72,0);
  var llf=limb(ll,0.36,0.068,0.058,matWrap); llf.position.y=-0.38;
  var rl=limb(g,0.38,0.088,0.070,matWrap); rl.position.set( 0.115,0.72,0);
  var rlf=limb(rl,0.36,0.068,0.058,matWrap); rlf.position.y=-0.38;
  // bandelettes défaites qui pendent et flottent
  var rags=[];
  for(var q=0;q<7;q++){
    var rg=new THREE.Mesh(gPln(0.055,0.36), ragMat);
    var an=Math.random()*6.2832;
    rg.position.set(Math.cos(an)*0.19, 0.80+Math.random()*0.60, Math.sin(an)*0.19);
    rg.rotation.y=an; rg.scale.y=0.8+Math.random()*0.7; g.add(rg); rags.push(rg);
  }
  var hit=new THREE.Mesh(gBox(0.78,1.95,0.78), new THREE.MeshBasicMaterial({visible:false}));
  hit.position.y=0.97; g.add(hit); hit.userData.mummy=this;
  this.g=g; this.hit=hit; this.la=la; this.ra=ra; this.ll=ll; this.rl=rl; this.rags=rags;
  this.hp=3; this.dead=false; this.t=Math.random()*6; this.cool=0; this.fall=0; this.stagger=0;
  mummies.push(this); hits.push(hit);
}
Mummy.prototype.hurt=function(){
  if(this.dead) return;
  this.hp--; groan(this.g.position); this.stagger=0.42;   // recul à l’impact
  var d=new THREE.Vector3().subVectors(this.g.position,camera.position).setY(0).normalize();
  this.g.position.addScaledVector(d,0.30);
  hitMark();
  if(this.hp<=0){ this.dead=true; this.fall=0.001; dust(this.g.position,26); }
};
Mummy.prototype.step=function(dt,px,pz){
  var g=this.g;
  if(this.dead){
    this.fall=Math.min(1,this.fall+dt*2.1);
    g.rotation.x=-this.fall*Math.PI/2*0.94; g.position.y=-this.fall*0.22;
    if(this.fall>=1 && this.hit.parent){ this.hit.parent.remove(this.hit);
      var ix=hits.indexOf(this.hit); if(ix>=0) hits.splice(ix,1); }
    return;
  }
  var dx=px-g.position.x, dz=pz-g.position.z, d=Math.hypot(dx,dz);
  this.t+=dt*(d<16?6.5:2.2);
  var sw=Math.sin(this.t)*0.36;
  this.ll.rotation.x= sw; this.rl.rotation.x=-sw;
  this.la.rotation.x=-1.15+Math.sin(this.t*0.6)*0.13;
  this.ra.rotation.x=-1.15-Math.sin(this.t*0.6)*0.13;
  for(var q=0;q<this.rags.length;q++) this.rags[q].rotation.z=Math.sin(this.t*0.8+q)*0.22;
  g.rotation.z=Math.sin(this.t*0.5)*0.05;
  if(d>18) return;
  if(this.stagger>0){ this.stagger-=dt; return; }        // encaisse avant de repartir
  g.rotation.y=Math.atan2(dx,dz);
  if(d>1.25){
    var v=1.55*dt, nx=g.position.x+dx/d*v, nz=g.position.z+dz/d*v, went=false;
    if(!tile(Math.round(nx/T),Math.round(g.position.z/T))){ g.position.x=nx; went=true; }
    if(!tile(Math.round(g.position.x/T),Math.round(nz/T))){ g.position.z=nz; went=true; }
    if(!went){                                            // coincé dans un angle : longer le mur
      var sx=g.position.x+(dz>0?v:-v), sz=g.position.z+(dx>0?v:-v);
      if(!tile(Math.round(sx/T),Math.round(g.position.z/T))) g.position.x=sx;
      else if(!tile(Math.round(g.position.x/T),Math.round(sz/T))) g.position.z=sz;
    }
  } else {
    this.cool-=dt;
    if(this.cool<=0){ this.cool=1.25; damage(11); }
  }
};
function spawn(n,cx,cz,rad){
  for(var i=0;i<n;i++){
    for(var tr=0;tr<24;tr++){
      var a=Math.random()*6.2832, r=1.5+Math.random()*rad;
      var x=cx+Math.cos(a)*r, z=cz+Math.sin(a)*r;
      if(!tile(Math.round(x/T),Math.round(z/T))){ new Mummy(x,z); break; }
    }
  }
}
function wake(){
  if(wake.done) return; wake.done=true;
  spawn(4, wx(14),wz(15), 9);
  spawn(1, wx(14),wz(5),  5);
  spawn(1, wx(24),wz(15), 4);
  $("#vit").classList.add("on");
  say("Quelque chose remue au-delà de la dalle. Les gardiens ne dorment plus.");
  groan(camera.position);
}

/* ---------- poussière et particules ---------- */
var motes=(function(){
  var n=520, pos=new Float32Array(n*3);
  for(var i=0;i<n;i++){
    pos[i*3]=Math.random()*GW*T; pos[i*3+1]=Math.random()*WH; pos[i*3+2]=Math.random()*GH*T;
  }
  var geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  var p=new THREE.Points(geo,new THREE.PointsMaterial({color:0xd9c39a,size:0.035,transparent:true,
    opacity:.42,depthWrite:false}));
  scene.add(p); return p;
})();
var bursts=[];
function dust(at,n){
  var pos=new Float32Array(n*3), vel=[];
  for(var i=0;i<n;i++){
    pos[i*3]=at.x; pos[i*3+1]=at.y+1.0; pos[i*3+2]=at.z;
    vel.push([(Math.random()-.5)*2.2,Math.random()*2.0,(Math.random()-.5)*2.2]);
  }
  var geo=new THREE.BufferGeometry(); geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  var pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xc9b184,size:0.09,transparent:true,
    opacity:.95,depthWrite:false}));
  scene.add(pts); bursts.push({p:pts,v:vel,life:0});
}

/* ---------- le pistolet, sur les restes d'un prédécesseur ---------- */
(function(){
  var bones=box(0.9,0.22,1.8, wx(11)+0.4,0.11,wz(27), matDark);
  bones.material=new THREE.MeshStandardMaterial({color:0x4a4436,roughness:.95});
  var pk=new THREE.Group(); pk.position.set(wx(11)+0.4,0.30,wz(27)); scene.add(pk);
  var leather=new THREE.MeshStandardMaterial({color:0x5c4326,roughness:.9,envMapIntensity:.3});
  var f1=new THREE.Mesh(new THREE.CylinderGeometry(0.10,0.11,0.19,14), leather);
  f1.rotation.z=1.35; pk.add(f1);
  var f2=new THREE.Mesh(new THREE.CylinderGeometry(0.032,0.032,0.07,10), leather);
  f2.position.set(0.12,0.03,0); f2.rotation.z=1.35; pk.add(f2);
  var f3=new THREE.Mesh(new THREE.TorusGeometry(0.075,0.010,6,14), leather);
  f3.rotation.y=Math.PI/2; pk.add(f3);
  pk.rotation.y=0.6;
  var gl=new THREE.PointLight(0xffcf87,0.9,2.2,2); gl.position.copy(pk.position).setY(0.6); scene.add(gl);
  var hb=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.9,1.9), new THREE.MeshBasicMaterial({visible:false}));
  hb.position.set(wx(11)+0.4,0.5,wz(27)); scene.add(hb);
  act(hb,"les restes d’un explorateur",function(){
    if(hb.userData.done){ say("Il n’est pas allé plus loin que cette salle. Vous, si."); return; }
    hb.userData.done=1; pk.visible=false; gl.intensity=0;
    hp=Math.min(100,hp+35); $("#vitfill").style.width=hp+"%";
    take("flask","⚱","la gourde de l’explorateur");
    ping(600,.4,.05);
    say("Sa gourde tient encore. Vous buvez ce qu’il n’a pas pu boire.");
  });
})();

/* ---------- tir ---------- */
var MAG=12, mag=MAG, res=48, RESMAX=120, reloading=0, shootRay=new THREE.Raycaster();
/* --- caisses de cartouches : sans réserve finie, tirer n'a aucun coût --- */
var crates=[];
var crateWood=new THREE.MeshStandardMaterial({color:0x4a3a22,roughness:.9,envMapIntensity:.3});
var crateBrass=new THREE.MeshStandardMaterial({color:0xc9a227,roughness:.3,metalness:1,
  emissive:0xc9a227,emissiveIntensity:.55,envMapIntensity:1.4});   // brille sans lampe
var crateBoxG=new THREE.BoxGeometry(0.42,0.26,0.30);
var crateBandG=new THREE.BoxGeometry(0.44,0.05,0.32);
var crateRndG=new THREE.CylinderGeometry(0.021,0.021,0.09,8);
function ammoCrate(x,z){
  var g=new THREE.Group(); g.position.set(x,0,z); scene.add(g);
  var w=new THREE.Mesh(crateBoxG, crateWood);
  w.position.y=0.13; w.castShadow=true; g.add(w);
  var band=new THREE.Mesh(crateBandG, crateBrass);
  band.position.y=0.20; g.add(band);
  for(var i=0;i<4;i++){                       // cartouches qui dépassent
    var c=new THREE.Mesh(crateRndG, crateBrass);
    c.position.set(-0.10+i*0.068,0.29,0); g.add(c);
  }
  var o={g:g,l:{intensity:0},x:x,z:z,ready:true,t:0};   // plus de lampe : l’émissif suffit
  crates.push(o); return o;
}
function stepCrates(dt){
  for(var i=0;i<crates.length;i++){
    var c=crates[i];
    c.g.rotation.y+=dt*0.5;
    if(!c.ready){
      c.t-=dt;
      if(c.t<=0){ c.ready=true; c.g.visible=true; c.l.intensity=1.1; }
      continue;
    }
    c.g.position.y=Math.sin(performance.now()*0.0018+i)*0.03;
    if(started && res<RESMAX &&
       Math.hypot(camera.position.x-c.x,camera.position.z-c.z)<1.5){
      res=Math.min(RESMAX,res+18); updAmmo(); ping(760,.18,.05);
      say("Dix-huit cartouches récupérées.");
      c.ready=false; c.t=40; c.g.visible=false; c.l.intensity=0;   // repousse en 40 s
    }
  }
}
function updAmmo(){
  $("#mag").textContent=reloading>0?"—":mag;
  var r=document.getElementById("res"); if(r) r.textContent=res;
  var box=document.getElementById("ammo");
  if(box) box.classList.toggle("low", mag+res<=8);
  var p=$("#pips"), h="";
  for(var i=0;i<MAG;i++) h+='<span class="'+(i<mag?"":"out")+'"></span>';
  p.innerHTML=h;
}
function reload(){
  if(reloading>0||mag>=MAG||res<=0) return;
  reloading=1.4; updAmmo();
}
function hitMark(){
  var d=$("#dot"); d.classList.add("mark");
  setTimeout(function(){ d.classList.remove("mark"); },110);
}
function shoot(){
  if(!hasGun||over||panel||reloading>0) return;
  if(mag<=0){
    if(res<=0){ ping(140,.10,.04); say("Plus une seule cartouche."); return; }
    reload(); ping(180,.12,.03); return;
  }
  mag--; updAmmo(); kick=1; slideBack=1; bang(); ejectShell();
  netSend({k:"shot"});
  muzzle.intensity=7; gun.userData.flash.material.opacity=0.95;
  shootRay.setFromCamera(new THREE.Vector2(0,0),camera); shootRay.far=60;
  var targets=hits.slice(); if(WALLS) targets.push(WALLS);
  var h=shootRay.intersectObjects(targets,false);
  if(h.length && h[0].object.userData.mummy) h[0].object.userData.mummy.hurt();
  else if(h.length) dust(h[0].point,7);
  if(mag<=0) reload();
}
var lastHit=0;
function damage(n){
  if(over||hp<=0) return;
  var t=performance.now();
  if(t-lastHit<700) return;      // cadence globale : une morsure à la fois
  lastHit=t;
  hp=Math.max(0,hp-n);
  $("#vitfill").style.width=hp+"%";
  var hu=$("#hurt"); hu.classList.add("on"); setTimeout(function(){ hu.classList.remove("on"); },90);
  ping(110,.25,.06);
  if(hp<=0) fell();
}
var hp=100;
function bang(){
  try{
    if(!ping._c) ping._c=new (window.AudioContext||window.webkitAudioContext)();
    var c=ping._c, n=c.sampleRate*0.22, buf=c.createBuffer(1,n,c.sampleRate), d=buf.getChannelData(0);
    for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2);
    var src=c.createBufferSource(); src.buffer=buf;
    var lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1500;
    var gn=c.createGain(); gn.gain.value=0.20;
    src.connect(lp); lp.connect(gn); gn.connect(c.destination); src.start();
  }catch(e){}
}
function noise(dur,cut,gain){
  try{
    if(!ping._c) ping._c=new (window.AudioContext||window.webkitAudioContext)();
    var c=ping._c, n=Math.floor(c.sampleRate*dur), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0);
    for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2.2);
    var sr=c.createBufferSource(); sr.buffer=b;
    var lp=c.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=cut;
    var g=c.createGain(); g.gain.value=gain;
    sr.connect(lp); lp.connect(g); g.connect(c.destination); sr.start();
  }catch(e){}
}
var stepPhase=0;
function footsteps(dt){
  if(!moving||over) return;
  stepPhase+=dt*(running?3.4:2.3);
  if(stepPhase>=1){ stepPhase=0; noise(0.10,340+Math.random()*140,0.030); }
}
function ambience(){
  try{
    if(!ping._c) ping._c=new (window.AudioContext||window.webkitAudioContext)();
    var c=ping._c;
    [46,69.5].forEach(function(f,i){
      var o=c.createOscillator(), g=c.createGain(), lf=c.createOscillator(), lg=c.createGain();
      o.type="sine"; o.frequency.value=f;
      lf.type="sine"; lf.frequency.value=0.06+i*0.037; lg.gain.value=0.010;
      lf.connect(lg); lg.connect(g.gain);
      g.gain.value=0.016; o.connect(g); g.connect(c.destination); o.start(); lf.start();
    });
  }catch(e){}
}
var groanT=6;
function ambientGroans(dt){
  if(over||!mummies.length) return;
  groanT-=dt;
  if(groanT<=0){
    groanT=5+Math.random()*9;
    var alive=mummies.filter(function(m){ return !m.dead; });
    if(alive.length) groan(alive[(Math.random()*alive.length)|0].g.position);
  }
}
function groan(at){
  var d=camera.position.distanceTo(at);
  if(d>22) return;
  var g=Math.max(0.008,0.06*(1-d/22));
  ping(70+Math.random()*26,.85,g);
}

/* ---------- les caisses, une fois tout déclaré ---------- */
ammoCrate(wx(10)+0.6, wz(26));
ammoCrate(wx(18)-0.4, wz(22));
ammoCrate(wx(11),      wz(13));
ammoCrate(wx(18),      wz(18));
ammoCrate(wx(14)+1.6,  wz(6));
ammoCrate(wx(24),      wz(18));
