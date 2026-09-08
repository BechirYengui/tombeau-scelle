/* ============================================================
   SALLE 1 · L'ANTICHAMBRE  (escape room)
   ============================================================ */
var AX=wx(14), AZ=wz(24.5);
// le tapis de roseaux
var rug=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2.6),
  new THREE.MeshStandardMaterial({color:0x7a4a2a, roughness:.95}));
rug.rotation.x=-Math.PI/2; rug.position.set(AX-0.6,0.012,AZ+0.6); rug.receiveShadow=true; scene.add(rug);
// La clé flotte, tourne et pose un halo au sol : posée à plat dans le noir,
// elle ne se lisait pas comme un objet à ramasser.
var keyObj=new THREE.Group(); keyObj.position.set(AX-2.1,0.46,AZ+0.4); keyObj.visible=false;
(function(){
  var b=new THREE.MeshStandardMaterial({color:0xe8b860,roughness:.26,metalness:.95,
    emissive:0xe8b860,emissiveIntensity:.45,envMapIntensity:1.4});
  var ring=new THREE.Mesh(new THREE.TorusGeometry(0.105,0.028,10,22), b);
  ring.position.x=-0.20; ring.rotation.y=Math.PI/2; keyObj.add(ring);
  var shaft=new THREE.Mesh(new THREE.CylinderGeometry(0.027,0.027,0.44,12), b);
  shaft.rotation.z=Math.PI/2; shaft.position.x=0.02; keyObj.add(shaft);
  var collar=new THREE.Mesh(new THREE.TorusGeometry(0.042,0.013,8,14), b);
  collar.position.x=0.10; collar.rotation.y=Math.PI/2; keyObj.add(collar);
  var t1=new THREE.Mesh(new THREE.BoxGeometry(0.030,0.115,0.026), b);
  t1.position.set(0.175,-0.062,0); keyObj.add(t1);
  var t2=new THREE.Mesh(new THREE.BoxGeometry(0.030,0.075,0.026), b);
  t2.position.set(0.235,-0.042,0); keyObj.add(t2);
  var t3=new THREE.Mesh(new THREE.BoxGeometry(0.026,0.048,0.026), b);
  t3.position.set(0.115,-0.030,0); keyObj.add(t3);
  keyObj.children.forEach(function(c){ c.castShadow=true; });
})();
var keyHalo=new THREE.Mesh(new THREE.CircleGeometry(0.55,24),
  new THREE.MeshBasicMaterial({color:0xe8b860,transparent:true,opacity:0,
    blending:THREE.AdditiveBlending,depthWrite:false}));
keyHalo.rotation.x=-Math.PI/2; keyHalo.position.set(AX-2.1,0.02,AZ+0.4); scene.add(keyHalo);
scene.add(keyObj);
var keyGlow=new THREE.PointLight(0xffcf87,0,3.4,2);
keyGlow.position.set(AX-2.1,0.75,AZ+0.4); scene.add(keyGlow);
var keyHit=new THREE.Mesh(new THREE.BoxGeometry(0.95,0.95,0.95), new THREE.MeshBasicMaterial({visible:false}));
keyHit.position.copy(keyObj.position); keyHit.visible=false; scene.add(keyHit);
act(keyHit,"la clé de bronze",function(){
  if(has("k1")) return;
  take("k1","⚿","la clé de bronze");
  keyObj.visible=false; keyHit.visible=false; keyGlow.intensity=0;
  keyHalo.material.opacity=0;
  say("Une clé de bronze, verte d’âge.");
});
act(rug,"la natte de roseaux",function(){
  if(rug.userData.m){ say(has("k1")?"Le dallage est nu.":"La clé est toujours là, sur la pierre."); return; }
  rug.userData.m=1; rug.rotation.z=0.5; rug.position.x+=2.4;
  keyObj.visible=true; keyHit.visible=true; keyGlow.intensity=3.2;
  keyHalo.material.opacity=0.16; ping(300,.25,.04);
  say("La natte se replie vers la droite. Une clé de bronze flotte au-dessus du dallage, à gauche.");
});

// la table d'offrandes et son coffret
var table=box(2.6,0.16,1.2, AX-4.0,1.02,AZ+3.0, matSand); solid(table,0.3);
box(0.16,1.0,0.16, AX-5.15,0.5,AZ+2.5,matSand); box(0.16,1.0,0.16, AX-2.85,0.5,AZ+2.5,matSand);
box(0.16,1.0,0.16, AX-5.15,0.5,AZ+3.5,matSand); box(0.16,1.0,0.16, AX-2.85,0.5,AZ+3.5,matSand);
var chest=box(1.4,0.42,0.9, AX-4.0,0.80,AZ+3.1, matDark);
act(chest,"le coffret de cèdre",function(){
  if(!has("k1")){ say("Fermé. Il manque la petite clé de bronze — cherchez sous la natte de roseaux."); return; }
  if(!has("pap")) take("pap","≡","le papyrus",openPap);
  openPap();
});
function openPap(){
  show('<div class="paper"><div class="k">Papyrus, coffret de cèdre</div><h2>Quatre nombres</h2>'+
   '<p>« Compte ce qui brûle,<br>ce qui saigne,<br>ce qui sonne,<br>ce qui veille.</p>'+
   '<p>Dans cet ordre, et la niche cède. »</p><div class="sig">— sans nom</div>'+
   '<button class="close" type="button">Refermer</button></div>');
}

// CE QUI BRÛLE — trois torches
(function(){
  var base=box(0.6,0.10,0.6, AX-4.0,1.15,AZ+2.6, matGold);
  for(var k=0;k<3;k++){
    var a=k*2.094, cx=AX-4.0+Math.cos(a)*0.18, cz=AZ+2.6+Math.sin(a)*0.18;
    box(0.08,0.5,0.08, cx,1.45,cz, matDark);
    var f=new THREE.Mesh(new THREE.SphereGeometry(0.05,8,8), new THREE.MeshBasicMaterial({color:0xffd9a0}));
    f.position.set(cx,1.74,cz); scene.add(f);
    if(k===0){ var l=new THREE.PointLight(0xffb765,2.4,4.6,2);   // une lampe pour les trois flammes
      l.position.set(AX-4.0,1.85,AZ+2.6); scene.add(l); }
  }
  act(base,"le trépied",function(){ say("Trois flammes. Elles n’ont pas faibli depuis des siècles."); });
})();

// CE QUI SAIGNE — sept scarabées de cornaline parmi d'autres
(function(){
  var ledge=box(0.5,0.14,4.4, wx(19)-1.2,1.25,AZ, matSand); solid(ledge,0.2);
  var g=new THREE.SphereGeometry(0.12,10,8);
  var red=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:0xa8503f,roughness:.45,metalness:.2}),7);
  var oth=new THREE.InstancedMesh(g,new THREE.MeshStandardMaterial({color:0x2f5488,roughness:.5,metalness:.2}),9);
  var m=new THREE.Matrix4(), RED=[0,2,3,6,9,12,15], nr=0,no=0;
  for(var k=0;k<16;k++){
    m.makeTranslation(wx(19)-1.2, 1.42, AZ-2.0+k*0.27);
    if(RED.indexOf(k)>=0) red.setMatrixAt(nr++,m); else oth.setMatrixAt(no++,m);
  }
  red.count=nr; oth.count=no; red.instanceMatrix.needsUpdate=true; oth.instanceMatrix.needsUpdate=true;
  red.castShadow=oth.castShadow=true; scene.add(red); scene.add(oth);
  act(red,"les scarabées",function(){ say("Seize scarabées alignés. Les uns de lapis, les autres de cornaline rouge sang."); });
})();

// CE QUI SONNE — le cadran, gnomon sur la cinquième encoche
(function(){
  var d=new THREE.Mesh(new THREE.CircleGeometry(0.70,40), new THREE.MeshStandardMaterial({map:texDial,roughness:.7}));
  d.position.set(AX+2.6,2.45,wz(28)+1.42); d.rotation.y=Math.PI; scene.add(d);
  act(d,"le cadran",function(){ say("Un cadran de pierre. Le gnomon doré s’est figé sur la cinquième encoche."); });
})();

// CE QUI VEILLE — deux Anubis gardent la porte scellée
(function(){
  [-2.2,2.2].forEach(function(dx){
    var g=new THREE.Group(); g.position.set(AX+dx,0,wz(21)-0.2); scene.add(g);
    var body=new THREE.Mesh(new THREE.BoxGeometry(0.5,1.0,0.8), matDark); body.position.y=0.5; g.add(body);
    var nk=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.7,0.34), matDark); nk.position.set(0,1.25,-0.1); g.add(nk);
    var hd=new THREE.Mesh(new THREE.BoxGeometry(0.32,0.3,0.62), matDark); hd.position.set(0,1.62,-0.22); g.add(hd);
    [-0.10,0.10].forEach(function(ex){
      var e=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.34,0.07), matDark); e.position.set(ex,1.9,-0.05); g.add(e); });
    var col=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.16,0.5), matGold); col.position.set(0,1.02,-0.06); g.add(col);
    g.children.forEach(function(c){c.castShadow=true;});
    act(body,"la statue d’Anubis",function(){ say("Anubis, assis, tourné vers la porte. Une seconde statue lui fait face."); });
  });
})();

// la stèle et la niche qu'elle dissimule
var stele=new THREE.Mesh(new THREE.PlaneGeometry(1.6,2.0),
  new THREE.MeshStandardMaterial({map:texGlyph, roughness:.8}));
stele.position.set(wx(9)-1.42,2.3,AZ-1.0); stele.rotation.y=Math.PI/2; scene.add(stele);
var niche=box(1.1,1.1,0.14, wx(9)-1.36,2.3,AZ-1.0, matGold); niche.visible=false;
act(stele,"la stèle gravée",function(){
  if(stele.userData.o){ openPad(); return; }
  stele.userData.o=1; stele.position.z-=1.7; stele.rotation.y=Math.PI/2.6; niche.visible=true;
  ping(220,.4,.05); say("La stèle glisse. Derrière : une niche d’or et son clavier à quatre chiffres.");
});
act(niche,"la niche",function(){ openPad(); });

var CODE="3752", buf="";
function openPad(){
  show('<div class="paper"><div class="k">Niche · quatre nombres — tapez-les ou cliquez</div>'+
    '<div id="code">····</div>'+
    '<div class="pad" id="pad"></div><button class="close" type="button">S’éloigner</button></div>');
  var p=panel.querySelector("#pad");
  ["1","2","3","4","5","6","7","8","9","←","0","✓"].forEach(function(t){
    var b=document.createElement("button"); b.type="button"; b.textContent=t;
    b.addEventListener("click",function(){ key(t); }); p.appendChild(b);
  });
  buf=""; draw();
  panelKey=function(e){
    if(/^[0-9]$/.test(e.key)) key(e.key);
    else if(e.code==="Backspace"){ e.preventDefault(); key("←"); }
    else if(e.code==="Enter") key("✓");
  };
}
function draw(){ var e=panel&&panel.querySelector("#code"); if(e) e.textContent=(buf+"····").slice(0,4).split("").join(" "); }
function key(t){
  var e=panel.querySelector("#code");
  if(t==="←"){ buf=buf.slice(0,-1); ping(240,.06,.03); }
  else if(t==="✓"){
    if(buf===CODE){
      take("k2","🜲","la clé de la dalle"); take("am","☥","l’amulette",openAmulet);
      ping(523,.5,.05); setTimeout(function(){ping(784,.7,.05);},110); shut(); openAmulet(); return;
    }
    e.classList.add("bad"); ping(150,.3,.05);
    setTimeout(function(){ e.classList.remove("bad"); buf=""; draw(); },420); return;
  } else if(buf.length<4){ buf+=t; ping(420+buf.length*40,.07,.03); }
  draw();
}
function openAmulet(){
  show('<div class="paper"><div class="k">Gravé au revers de l’amulette</div><h2>Le second tour</h2>'+
   '<p>« La dalle a deux tours.<br>Le premier est cette clé.</p>'+
   '<p>Le second demande quatre lettres :<br>celles que portent les vases,<br>rangées dans l’ordre de leurs chiffres. »</p>'+
   '<div class="sig">— la même main que le papyrus</div>'+
   '<button class="close" type="button">Refermer</button></div>');
}

// les quatre vases canopes — I·A  II·N  III·K  IV·H
(function(){
  var MK=[["I","A"],["II","N"],["III","K"],["IV","H"]];
  var shelf=box(3.6,0.14,0.5, AX+2.2,1.05,wz(28)+1.15, matSand); solid(shelf,0.2);
  for(var k=0;k<4;k++){
    (function(k){
      var px=AX+0.8+k*0.92, pz=wz(28)+1.15;
      var jar=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.13,0.5,14), matSand);
      jar.position.set(px,1.37,pz); jar.castShadow=true; scene.add(jar);
      var lid=new THREE.Mesh(new THREE.SphereGeometry(0.15,10,8), matDark);
      lid.position.set(px,1.66,pz); scene.add(lid);
      var tx=paint(128,128,function(g,w,h){
        g.fillStyle="#e0b352"; g.fillRect(0,0,w,h);
        g.fillStyle="#2a2118"; g.textAlign="center";
        g.font="bold 54px Georgia, serif"; g.fillText(MK[k][1],64,62);
        g.font="22px Georgia, serif"; g.fillText(MK[k][0],64,98);
      });
      var pl=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.2),
        new THREE.MeshStandardMaterial({map:tx,roughness:.5,metalness:.4}));
      pl.position.set(px,1.35,pz-0.18); pl.rotation.y=Math.PI; scene.add(pl);
      act(jar,"le vase canope",function(){
        say("Quatre vases canopes, gravés dans l’ordre : I·A, II·N, III·K, IV·H.");
      });
    })(k);
  }
})();

// la porte scellée
var seal=box(T*0.95,3.4,0.3, wx(14),1.7,wz(20), matGold);
seal.material=new THREE.MeshStandardMaterial({map:texGlyph, roughness:.75, color:0xd8b878});
var WORD="ANKH", dl=[0,0,0,0], opened=false;
function openLock(){
  var cols="";
  for(var k=0;k<4;k++) cols+='<div style="text-align:center">'+
    '<button class="dial" type="button" data-k="'+k+'" data-d="1">▲</button>'+
    '<div class="letter" id="d'+k+'">A</div>'+
    '<button class="dial" type="button" data-k="'+k+'" data-d="-1">▼</button></div>';
  show('<div class="paper"><div class="k">Dalle · second tour — tapez les quatre lettres</div>'+
    '<div style="display:flex;gap:18px;justify-content:center;margin:16px 0 4px">'+cols+'</div>'+
    '<div class="pad" style="grid-template-columns:1fr"><button type="button" id="lk">Tourner</button></div>'+
    '<button class="close" type="button">S’éloigner</button></div>');
  dl=[0,0,0,0]; var di=0;
  function paintDials(){
    for(var k=0;k<4;k++){
      var e2=panel.querySelector("#d"+k);
      e2.textContent=String.fromCharCode(65+dl[k]);
      e2.style.borderBottom=(k===di)?"2px solid var(--gold)":"2px solid transparent";
      e2.style.opacity=(k===di)?"1":".62";
    }
  }
  function tryWord(){
    var w=dl.map(function(d){return String.fromCharCode(65+d);}).join("");
    if(w===WORD){
      opened=true; shut(); flash(); ping(523,.6,.05);
      say("La dalle s’enfonce dans le sol. Le tombeau s’ouvre.");
      setTimeout(wake,2600); return;
    }
    ping(150,.3,.05);
    var p2=panel.querySelector(".paper"); p2.style.animation="shake .4s";
    setTimeout(function(){ if(p2) p2.style.animation=""; },420);
  }
  panel.querySelectorAll(".dial").forEach(function(b){
    b.addEventListener("click",function(){
      var k=+b.dataset.k; di=k;
      dl[k]=(dl[k]+ +b.dataset.d +26)%26; paintDials(); ping(360+k*50,.06,.03);
    });
  });
  panelKey=function(e){
    if(/^[a-zA-Z]$/.test(e.key)){
      dl[di]=e.key.toUpperCase().charCodeAt(0)-65;
      di=Math.min(3,di+1); paintDials(); ping(400+di*40,.06,.03);
    } else if(e.code==="Backspace"){ e.preventDefault(); di=Math.max(0,di-1); paintDials(); }
    else if(e.code==="ArrowRight"){ di=Math.min(3,di+1); paintDials(); }
    else if(e.code==="ArrowLeft"){ di=Math.max(0,di-1); paintDials(); }
    else if(e.code==="Enter") tryWord();
  };
  paintDials();
  panel.querySelector("#lk").addEventListener("click",function(){
    tryWord();
  });
}
act(seal,"la dalle scellée",function(){
  if(opened){ say("La dalle est descendue. Le passage est libre."); return; }
  if(has("k2")) openLock();
  else say("Scellée. Il manque la clé — celle que garde la niche, derrière la stèle du mur ouest.");
});
