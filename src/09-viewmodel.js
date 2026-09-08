/* ============================================================
   LES MAINS  —  scène et caméra séparées : le modèle de vue ne
   peut alors traverser aucun mur, quelle que soit la distance.
   ============================================================ */
renderer.autoClear=false;
var vmScene=new THREE.Scene();
var vmCam=new THREE.PerspectiveCamera(52, innerWidth/innerHeight, 0.01, 6);
vmScene.add(new THREE.AmbientLight(0xffe0c0,0.75));
var vmLight=new THREE.PointLight(0xffc98a,2.0,3.2); vmLight.position.set(-0.35,0.35,0.35); vmScene.add(vmLight);
var rig=new THREE.Group(); vmScene.add(rig);

/* ---------- carte d’environnement : sans réflexion, un métal est un aplat ---------- */
(function(){
  var pm=new THREE.PMREMGenerator(renderer);
  var es=new THREE.Scene();
  var dome=new THREE.Mesh(new THREE.SphereGeometry(12,20,14),
    new THREE.MeshBasicMaterial({side:THREE.BackSide, map:paint(64,64,function(g,w,h){
      var gr=g.createLinearGradient(0,0,0,h);
      gr.addColorStop(0,"#100c07"); gr.addColorStop(.55,"#3a2a17"); gr.addColorStop(1,"#0a0705");
      g.fillStyle=gr; g.fillRect(0,0,w,h);
    })}));
  es.add(dome);
  [[6,3,0],[-6,3,2],[0,4,-6]].forEach(function(pp){
    var q=new THREE.Mesh(new THREE.PlaneGeometry(3,3),
      new THREE.MeshBasicMaterial({color:0xffb877}));
    q.position.set(pp[0],pp[1],pp[2]); q.lookAt(0,1,0); es.add(q);
  });
  var rt=pm.fromScene(es,0.05);
  scene.environment=rt.texture; vmScene.environment=rt.texture;
  pm.dispose();
})();

var nSkin=relief(256,function(g,w,h){                       // pores et plis
  g.fillStyle="#808080"; g.fillRect(0,0,w,h);
  for(var i=0;i<5200;i++){ var v=118+Math.random()*22;
    g.fillStyle="rgb("+v+","+v+","+v+")";
    g.beginPath(); g.arc(Math.random()*w,Math.random()*h,0.6+Math.random()*1.5,0,6.2832); g.fill(); }
  for(var k=0;k<40;k++){ g.strokeStyle="rgba(60,60,60,.5)"; g.lineWidth=1+Math.random()*2;
    g.beginPath(); var y=Math.random()*h; g.moveTo(0,y);
    g.bezierCurveTo(w*.3,y+20,w*.7,y-20,w,y+Math.random()*16-8); g.stroke(); }
},2.4);
var nSteel=relief(256,function(g,w,h){                      // stries d'usinage
  g.fillStyle="#8a8a8a"; g.fillRect(0,0,w,h);
  for(var i=0;i<300;i++){ var v=110+Math.random()*60;
    g.strokeStyle="rgb("+v+","+v+","+v+")"; g.lineWidth=0.6+Math.random();
    var y=Math.random()*h; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y+Math.random()*2-1); g.stroke(); }
  for(var k=0;k<180;k++){ g.fillStyle="rgba(40,40,40,.35)";
    g.beginPath(); g.arc(Math.random()*w,Math.random()*h,0.7+Math.random()*2,0,6.2832); g.fill(); }
},1.6);
var nWrap=relief(256,function(g,w,h){                       // tissage des bandelettes
  g.fillStyle="#7a7a7a"; g.fillRect(0,0,w,h);
  for(var i=-h;i<w+h;i+=14){
    g.strokeStyle="rgb("+(150+Math.random()*50)+","+(150)+","+(150)+")";
    g.lineWidth=9; g.beginPath(); g.moveTo(i,0); g.lineTo(i+h*.42,h); g.stroke();
    g.strokeStyle="rgb(55,55,55)"; g.lineWidth=2.4;
    g.beginPath(); g.moveTo(i+5,0); g.lineTo(i+5+h*.42,h); g.stroke();
  }
  for(var k=0;k<900;k++){ var v=110+Math.random()*70; g.fillStyle="rgb("+v+","+v+","+v+")";
    g.fillRect(Math.random()*w,Math.random()*h,2,2); }
},2.9);
var skin=new THREE.MeshStandardMaterial({color:0xcb9a72, roughness:.60, metalness:.03,
  envMapIntensity:.62, normalMap:nSkin, normalScale:new THREE.Vector2(.55,.55)});
nSkin.repeat.set(3,3);
var nail=new THREE.MeshStandardMaterial({color:0xe0b8a0, roughness:.35, envMapIntensity:.8});
var steel=new THREE.MeshStandardMaterial({normalMap:nSteel,normalScale:new THREE.Vector2(.7,.7),color:0x1e2126, roughness:.28, metalness:.95, envMapIntensity:1.5});
var steel2=new THREE.MeshStandardMaterial({normalMap:nSteel,normalScale:new THREE.Vector2(.5,.5),color:0x33383f, roughness:.42, metalness:.9, envMapIntensity:1.2});
var grip=new THREE.MeshStandardMaterial({color:0x2b2119, roughness:.88, metalness:.05, envMapIntensity:.4});
var brass=new THREE.MeshStandardMaterial({normalMap:nSteel,normalScale:new THREE.Vector2(.35,.35),color:0xc9a227, roughness:.30, metalness:1, envMapIntensity:1.7});

function part(par,w,h,d,x,y,z,mat){
  var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); par.add(m); return m;
}
// profil 2D extrudé et biseauté : c’est ce qui distingue une forme d’un cube
function slab(pts, thick, bev, mat){
  var sh=new THREE.Shape();
  sh.moveTo(pts[0][0],pts[0][1]);
  for(var i=1;i<pts.length;i++) sh.lineTo(pts[i][0],pts[i][1]);
  sh.closePath();
  var g=new THREE.ExtrudeGeometry(sh,{depth:thick,bevelEnabled:true,bevelThickness:bev,
    bevelSize:bev,bevelSegments:3,curveSegments:6});
  g.center();
  return new THREE.Mesh(g,mat);
}
/* ------------------------------------------------------------------
   Repère : la caméra regarde -Z. TOUT est donc construit vers -Z,
   sans aucune rotation de rattrapage — c'est elle qui miroitait
   les inclinaisons et cassait les poignets.
   ------------------------------------------------------------------ */
function bone(par,len,r1,r2,mat){
  var m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,10), mat);
  m.rotation.x=-Math.PI/2; m.position.z=-len/2; par.add(m);
  var j=new THREE.Mesh(new THREE.SphereGeometry(r2,8,7), mat); j.position.z=-len; par.add(j);
  return m;
}
function finger(par,x,y,z,curl,sc){
  var g1=new THREE.Group(); g1.position.set(x,y,z); par.add(g1);
  bone(g1,0.052*sc,0.0125*sc,0.0115*sc,skin);
  var g2=new THREE.Group(); g2.position.z=-0.052*sc; g2.rotation.x=-curl; g1.add(g2);
  bone(g2,0.036*sc,0.0115*sc,0.0105*sc,skin);
  var g3=new THREE.Group(); g3.position.z=-0.036*sc; g3.rotation.x=-curl*0.85; g2.add(g3);
  bone(g3,0.026*sc,0.0105*sc,0.0092*sc,skin);
  var n=new THREE.Mesh(new THREE.SphereGeometry(0.0085*sc,7,6), nail);
  n.position.set(0,0.007*sc,-0.021*sc); n.scale.set(1,.5,1.4); g3.add(n);
  return g1;
}
var cloth=new THREE.MeshStandardMaterial({color:0x3d3120,roughness:.95,envMapIntensity:.25});
var leathr=new THREE.MeshStandardMaterial({color:0x54402a,roughness:.85,envMapIntensity:.35});
function makeHand(sign,curl){
  var g=new THREE.Group();
  var palm=slab([[-0.050,-0.062],[0.050,-0.062],[0.058,0.030],[0.040,0.068],
                 [-0.040,0.068],[-0.058,0.030]], 0.038, 0.010, skin);
  palm.rotation.x=-Math.PI/2; palm.position.set(0,0,-0.055); g.add(palm);
  // l’avant-bras manquait : la main flottait, détachée du corps
  var wrist=new THREE.Mesh(new THREE.CylinderGeometry(0.042,0.048,0.09,12), skin);
  wrist.rotation.x=Math.PI/2; wrist.position.z=0.035; g.add(wrist);
  var cuff=new THREE.Mesh(new THREE.CylinderGeometry(0.064,0.058,0.09,12), leathr);
  cuff.rotation.x=Math.PI/2; cuff.position.z=0.105; g.add(cuff);
  var fore=new THREE.Mesh(new THREE.CylinderGeometry(0.068,0.082,0.52,12), cloth);
  fore.rotation.x=Math.PI/2; fore.position.z=0.40; g.add(fore);
  for(var f=0;f<4;f++)
    finger(g,(-0.036+f*0.024)*sign, -0.004-f*0.003, -0.100, curl, 1-f*0.07);
  var th=finger(g,-0.052*sign,-0.012,-0.042,curl*0.70,1.12);
  th.rotation.set(0.22,0.50*sign,0);
  return g;
}

/* ---------- main gauche : la torche ---------- */
var lHand=makeHand(-1,0.55); lHand.position.set(-0.30,-0.26,-0.48);
lHand.rotation.set(0.26,0.30,0.16); rig.add(lHand);
(function(){
  var st=new THREE.Mesh(new THREE.CylinderGeometry(0.024,0.030,0.58,10), leathr);
  st.rotation.x=Math.PI/2; st.position.set(0,0.01,-0.22); lHand.add(st);
  var wr=new THREE.Mesh(new THREE.CylinderGeometry(0.056,0.040,0.16,10),
    new THREE.MeshStandardMaterial({color:0x6a5535,roughness:.98}));
  wr.rotation.x=Math.PI/2; wr.position.set(0,0.03,-0.50); lHand.add(wr);
  var fl=new THREE.Mesh(new THREE.SphereGeometry(0.072,10,10),
    new THREE.MeshBasicMaterial({color:0xffd08a,transparent:true,opacity:.94}));
  fl.position.set(0,0.09,-0.60); fl.scale.set(1,1.5,1); lHand.add(fl);
  lHand.userData.flame=fl;
})();
var torchLight=new THREE.PointLight(0xffb265, 7.5, 16, 2);
torchLight.position.set(-0.55,-0.15,-0.3); camera.add(torchLight); scene.add(camera);

/* ---------- main droite : le pistolet ----------
   Les profils sont dessinés de PROFIL : X vers l’avant, Y vers le haut,
   Z = épaisseur. Le groupe entier pivote ensuite pour que X devienne -Z.
   slab() recentre chaque géométrie sur zéro : chaque pièce est donc
   replacée à son propre centre, calculé depuis ses points.           */
var rHand=makeHand(1,1.05); rHand.position.set(0.28,-0.29,-0.46);
rHand.rotation.set(0.14,-0.20,-0.08); rig.add(rHand);
var gun=new THREE.Group(); gun.position.set(0.010,0.052,-0.050); rHand.add(gun);
var body=new THREE.Group(); body.rotation.y=Math.PI/2; gun.add(body);
(function(){
  var slide=slab([[-0.115,0.012],[0.125,0.012],[0.125,0.062],[0.108,0.070],
                  [-0.100,0.070],[-0.115,0.058]], 0.052, 0.005, steel);
  slide.position.set(0.005,0.041,0); body.add(slide); gun.userData.slide=slide;
  var frame=slab([[-0.100,-0.006],[0.072,-0.006],[0.072,0.014],[-0.100,0.014]], 0.050, 0.004, steel2);
  frame.position.set(-0.014,0.004,0); body.add(frame);
  var gp=slab([[-0.030,-0.150],[0.032,-0.120],[0.042,0.004],[-0.042,0.004]], 0.046, 0.006, grip);
  gp.position.set(0,-0.073,0); body.add(gp);
  var tg=new THREE.Mesh(new THREE.TorusGeometry(0.030,0.0062,7,16,Math.PI*1.2), steel2);
  tg.position.set(0.018,-0.030,0); tg.rotation.z=-0.55; body.add(tg);
  var tr=new THREE.Mesh(new THREE.BoxGeometry(0.009,0.030,0.010), steel2);
  tr.position.set(0.012,-0.018,0); body.add(tr);
  var br=new THREE.Mesh(new THREE.CylinderGeometry(0.0102,0.0102,0.028,12), steel);
  br.rotation.z=Math.PI/2; br.position.set(0.136,0.042,0); body.add(br);
  var hole=new THREE.Mesh(new THREE.CylinderGeometry(0.0062,0.0062,0.030,10),
    new THREE.MeshBasicMaterial({color:0x05060a}));
  hole.rotation.z=Math.PI/2; hole.position.set(0.140,0.042,0); body.add(hole);
  var fs=new THREE.Mesh(new THREE.BoxGeometry(0.008,0.011,0.008), steel2);
  fs.position.set(0.112,0.076,0); body.add(fs);
  var rs=new THREE.Mesh(new THREE.BoxGeometry(0.014,0.010,0.030), steel2);
  rs.position.set(-0.092,0.076,0); body.add(rs);
  var fl2=new THREE.Mesh(new THREE.ConeGeometry(0.072,0.19,9),
    new THREE.MeshBasicMaterial({color:0xffeab4,transparent:true,opacity:0}));
  fl2.rotation.z=-Math.PI/2; fl2.position.set(0.24,0.042,0); body.add(fl2);
  gun.userData.flash=fl2;
})();
var muzzle=new THREE.PointLight(0xffe0a0,0,10,2); muzzle.position.set(0.35,-0.1,-0.75); camera.add(muzzle);

/* ---------- douilles éjectées ---------- */
var shells=[], shellGeo=new THREE.CylinderGeometry(0.0055,0.0055,0.019,8);
function ejectShell(){
  var m=new THREE.Mesh(shellGeo, brass);
  var d=new THREE.Vector3(); camera.getWorldDirection(d);
  var right=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,1,0)).normalize();
  m.position.copy(camera.position).addScaledVector(d,0.42).addScaledVector(right,0.20).setY(camera.position.y-0.12);
  m.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);
  scene.add(m);
  shells.push({m:m, v:new THREE.Vector3(right.x*2.1+(Math.random()-.5),1.9,right.z*2.1+(Math.random()-.5)),
    w:new THREE.Vector3((Math.random()-.5)*14,(Math.random()-.5)*14,(Math.random()-.5)*14), life:0});
  if(shells.length>22){ scene.remove(shells[0].m); shells.shift(); }
}
function stepShells(dt){
  for(var i=shells.length-1;i>=0;i--){
    var S=shells[i]; S.life+=dt;
    S.v.y-=9.4*dt;
    S.m.position.addScaledVector(S.v,dt);
    S.m.rotation.x+=S.w.x*dt; S.m.rotation.y+=S.w.y*dt; S.m.rotation.z+=S.w.z*dt;
    if(S.m.position.y<0.012){ S.m.position.y=0.012; S.v.y*=-0.32; S.v.x*=0.55; S.v.z*=0.55;
      S.w.multiplyScalar(0.5); if(Math.abs(S.v.y)<0.3){ S.v.set(0,0,0); S.w.set(0,0,0); } }
    if(S.life>14){ scene.remove(S.m); shells.splice(i,1); }
  }
}

var bob=0, sway={x:0,y:0}, kick=0, hasGun=false, slideBack=0;
function viewmodel(dt,moving){
  bob += dt*(moving?(running?13:9.2):1.8);
  var amp=moving?0.020:0.005;
  rig.position.y = Math.sin(bob*2)*amp*0.6 - kick*0.055 + Math.sin(bob)*amp*0.3;
  rig.position.x = Math.cos(bob)*amp*0.9 + sway.x;
  rig.position.z = -kick*0.17 - (reloading>0?0.10:0);
  rig.rotation.x = kick*0.36 + sway.y*0.55 + (reloading>0?0.55:0);
  rig.rotation.z = sway.x*0.7 + Math.sin(bob)*0.012;
  kick += (0-kick)*Math.min(1,dt*11);
  sway.x += (0-sway.x)*Math.min(1,dt*5.5);
  sway.y += (0-sway.y)*Math.min(1,dt*5.5);
  // recul de culasse
  slideBack += (0-slideBack)*Math.min(1,dt*16);
  if(gun.userData.slide) gun.userData.slide.position.x=0.005-slideBack*0.042;
  var f=lHand.userData.flame;
  var t=performance.now();
  f.scale.set(0.9+Math.sin(t*0.013)*0.14, 1.5+Math.sin(t*0.021)*0.22, 0.9+Math.cos(t*0.017)*0.14);
  torchLight.intensity=7.5+Math.sin(t*0.009)*1.3;
  muzzle.intensity += (0-muzzle.intensity)*Math.min(1,dt*13);
  var fm=gun.userData.flash.material; fm.opacity += (0-fm.opacity)*Math.min(1,dt*17);
}
