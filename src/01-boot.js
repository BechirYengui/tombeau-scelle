var $=function(s){ return document.querySelector(s); };
/* Une exception levée pendant le jeu ne doit plus être invisible :
   le banc d'essai ne couvre que le chargement. */
function oops(where,e){
  var box=document.getElementById("errbar");
  if(!box){
    box=document.createElement("div"); box.id="errbar";
    box.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:999;background:#8a1f16;"+
      "color:#fff;font:12px/1.5 ui-monospace,monospace;padding:9px 14px;white-space:pre-wrap";
    document.body.appendChild(box);
  }
  box.textContent="Erreur ["+where+"] : "+((e&&e.message)||e)+
    (e&&e.lineno?"  ligne "+e.lineno:"");
}
window.addEventListener("error",function(ev){ oops("exécution",ev); });
window.addEventListener("unhandledrejection",function(ev){ oops("promesse",ev.reason); });
function halt(t,c){ $("#intro").innerHTML='<div style="max-width:44em"><div class="kicker">La dalle ne bouge pas</div><h1>'+t+'</h1><div id="fail">'+c+'</div></div>'; }
if(!window.THREE){ halt("Moteur 3D absent","<p>three.js n’a pas pu être chargé. Vérifiez le réseau et rechargez.</p>"); return; }

var scene=new THREE.Scene();
scene.background=new THREE.Color(0x0a0806);
scene.fog=new THREE.FogExp2(0x0a0806, 0.030);
var camera=new THREE.PerspectiveCamera(74, innerWidth/innerHeight, 0.05, 140);
var renderer;
try{ renderer=new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"}); }
catch(err){ halt("Pas de contexte 3D","<p>Le navigateur refuse la 3D. Fermez les autres onglets du jeu et rechargez, ou ouvrez la page dans Firefox.</p>"); throw err; }
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));   // au-delà, coût x1,3 pour un gain invisible
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.06;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;   // rafraîchi une image sur trois depuis la boucle
document.body.appendChild(renderer.domElement);
/* Un contexte WebGL perdu fige la dernière image sans lever d'erreur :
   c'est indiscernable d'un plantage si on ne l'écoute pas. */
renderer.domElement.addEventListener("webglcontextlost",function(e){
  e.preventDefault();
  oops("GPU","contexte WebGL perdu — le pilote graphique a redémarré. Rechargez la page.");
},false);
renderer.domElement.addEventListener("webglcontextrestored",function(){
  oops("GPU","contexte rétabli — rechargez la page (F5).");
},false);

/* ---------- textures peintes ---------- */
// carte de relief dérivée d'une carte de hauteur peinte : le pixel devient une normale
function relief(size,draw,strength){
  var c=document.createElement("canvas"); c.width=c.height=size;
  var x=c.getContext("2d"); draw(x,size,size);
  var src=x.getImageData(0,0,size,size).data;
  var out=x.createImageData(size,size), d=out.data;
  function H(i,j){ i=(i+size)%size; j=(j+size)%size; return src[(j*size+i)*4]/255; }
  for(var j=0;j<size;j++) for(var i=0;i<size;i++){
    var dx=(H(i+1,j)-H(i-1,j))*strength, dy=(H(i,j+1)-H(i,j-1))*strength;
    var L=Math.sqrt(dx*dx+dy*dy+1), k=(j*size+i)*4;
    d[k]=(-dx/L*.5+.5)*255; d[k+1]=(-dy/L*.5+.5)*255; d[k+2]=(1/L*.5+.5)*255; d[k+3]=255;
  }
  x.putImageData(out,0,0);
  var t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;
}
function paint(w,h,fn){ var c=document.createElement("canvas"); c.width=w;c.height=h;
  fn(c.getContext("2d"),w,h); var t=new THREE.CanvasTexture(c); t.anisotropy=4; return t; }
function glyphRow(g,x0,y0,cell,n,seed){
  // hiéroglyphes stylisés : traits, disques, chevrons, ondes
  for(var i=0;i<n;i++){
    var k=(seed+i*7)%6, x=x0, y=y0+i*cell;
    g.strokeStyle="rgba(48,34,18,.75)"; g.fillStyle="rgba(48,34,18,.65)"; g.lineWidth=3;
    if(k===0){ g.beginPath(); g.arc(x+cell/2,y+cell/2,cell*0.22,0,6.2832); g.stroke(); }
    else if(k===1){ g.fillRect(x+cell*0.34,y+cell*0.18,cell*0.14,cell*0.64); }
    else if(k===2){ g.beginPath(); g.moveTo(x+cell*0.22,y+cell*0.7); g.lineTo(x+cell*0.5,y+cell*0.25);
                    g.lineTo(x+cell*0.78,y+cell*0.7); g.stroke(); }
    else if(k===3){ g.beginPath(); for(var w=0;w<3;w++){ g.moveTo(x+cell*0.2,y+cell*(0.3+w*0.2));
                    g.quadraticCurveTo(x+cell*0.5,y+cell*(0.22+w*0.2),x+cell*0.8,y+cell*(0.3+w*0.2)); } g.stroke(); }
    else if(k===4){ g.beginPath(); g.ellipse(x+cell/2,y+cell/2,cell*0.3,cell*0.16,0,0,6.2832); g.stroke(); }
    else { g.fillRect(x+cell*0.24,y+cell*0.42,cell*0.52,cell*0.12);
           g.fillRect(x+cell*0.44,y+cell*0.2,cell*0.12,cell*0.56); }
  }
}
var texSand=paint(512,512,function(g,w,h){
  g.fillStyle="#a8895c"; g.fillRect(0,0,w,h);
  for(var i=0;i<5200;i++){ var v=Math.random()*40-20;
    g.fillStyle="rgba("+(168+v)+","+(137+v)+","+(92+v)+",.5)";
    g.fillRect(Math.random()*w,Math.random()*h,2,2); }
  g.strokeStyle="rgba(60,44,24,.35)"; g.lineWidth=3;
  for(var r=1;r<5;r++){ var y=r*h/5; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); }
  g.fillStyle="rgba(210,180,120,.16)"; g.fillRect(0,0,w,26);
});
texSand.wrapS=texSand.wrapT=THREE.RepeatWrapping;
var texGlyph=paint(256,512,function(g,w,h){
  g.fillStyle="#b8955f"; g.fillRect(0,0,w,h);
  g.strokeStyle="rgba(60,44,24,.5)"; g.lineWidth=4;
  g.strokeRect(26,10,w-52,h-20);
  glyphRow(g,44,26,72,6,2); glyphRow(g,132,26,72,6,5);
});
texGlyph.wrapS=texGlyph.wrapT=THREE.RepeatWrapping;
// cadran solaire : le gnomon désigne la cinquième encoche
var texDial=paint(512,512,function(g,w,h){
  g.fillStyle="#c2a06a"; g.beginPath(); g.arc(256,256,248,0,6.2832); g.fill();
  g.strokeStyle="#4a3517"; g.lineWidth=7; g.beginPath(); g.arc(256,256,232,0,6.2832); g.stroke();
  for(var i=0;i<12;i++){
    var a=i*Math.PI/6-Math.PI/2;
    g.strokeStyle=(i===5)?"#e0b352":"#4a3517"; g.lineWidth=(i===5)?14:6;
    g.beginPath();
    g.moveTo(256+Math.cos(a)*196,256+Math.sin(a)*196);
    g.lineTo(256+Math.cos(a)*228,256+Math.sin(a)*228); g.stroke();
    // encoches en bâtons égyptiens : i traits
    g.fillStyle="#4a3517";
    for(var t=0;t<=i;t++){
      if(i>6) break;
      var rr=168, aa=a+(t-i/2)*0.035;
      g.fillRect(256+Math.cos(aa)*rr-2,256+Math.sin(aa)*rr-9,4,18);
    }
  }
  g.strokeStyle="#e0b352"; g.lineWidth=17; g.lineCap="round";
  g.beginPath(); g.moveTo(256,256);
  g.lineTo(256+Math.cos(5*Math.PI/6-Math.PI/2)*150, 256+Math.sin(5*Math.PI/6-Math.PI/2)*150); g.stroke();
  g.fillStyle="#4a3517"; g.beginPath(); g.arc(256,256,15,0,6.2832); g.fill();
});
var matSand =new THREE.MeshStandardMaterial({map:texSand, roughness:.96, metalness:.02});
matSand.normalMap=relief(256,function(g,w,h){ g.fillStyle="#808080"; g.fillRect(0,0,w,h);
  for(var i=0;i<6000;i++){ var v=105+Math.random()*55; g.fillStyle="rgb("+v+","+v+","+v+")";
    g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*3,2+Math.random()*3); }
  for(var r=1;r<5;r++){ g.fillStyle="rgb(45,45,45)"; g.fillRect(0,r*h/5,w,3); } },2.2);
matSand.normalMap.repeat.set(2,2); matSand.normalScale=new THREE.Vector2(.9,.9);
var matGlyph=new THREE.MeshStandardMaterial({map:texGlyph, roughness:.9, metalness:.03});
var matGold =new THREE.MeshStandardMaterial({color:0xe0b352, roughness:.3, metalness:.9,
  emissive:0xe0b352, emissiveIntensity:.10});
var matDark =new THREE.MeshStandardMaterial({color:0x2a2118, roughness:.85});
var matLapis=new THREE.MeshStandardMaterial({color:0x2f5488, roughness:.4, metalness:.4});
