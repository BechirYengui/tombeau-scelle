/* ============================================================
   SALLE 3 · CHAMBRE OUEST — LES DEUX OMBRES
   ============================================================ */
var PA=["11111","00100","00100","00100","00100"], PB=["10000","10000","10000","10000","11111"];
var OBJ=new THREE.Vector3(wx(4),2.1,wz(15)), V=0.28;
var solidG=new THREE.Group(); solidG.position.copy(OBJ); scene.add(solidG);
(function(){
  var cells=[];
  for(var y=0;y<5;y++) for(var z2=0;z2<5;z2++) for(var x2=0;x2<5;x2++)
    if(PA[y].charAt(z2)==="1" && PB[y].charAt(x2)==="1") cells.push([x2,y,z2]);
  var im=new THREE.InstancedMesh(new THREE.BoxGeometry(V,V,V),
    new THREE.MeshStandardMaterial({color:0x4a3f30,roughness:.75,metalness:.2}), cells.length);
  im.castShadow=true; var m=new THREE.Matrix4();
  for(var k=0;k<cells.length;k++){ m.makeTranslation((cells[k][0]-2)*V,(2-cells[k][1])*V,(cells[k][2]-2)*V); im.setMatrixAt(k,m); }
  im.instanceMatrix.needsUpdate=true; solidG.add(im);
})();
var WALLX=T*0.5, WALLZ=wz(10)+T*0.5;
var lA=new THREE.SpotLight(0xfff0d8,7,34,0.42,0.35,1.4);
lA.position.set(wx(6),2.1,wz(15)); lA.target.position.set(WALLX,2.1,wz(15));
lA.castShadow=true; lA.shadow.mapSize.set(1024,1024); scene.add(lA); scene.add(lA.target);
var lB=new THREE.SpotLight(0xfff0d8,7,34,0.42,0.35,1.4);
lB.position.set(wx(4),2.1,wz(18)); lB.target.position.set(wx(4),2.1,WALLZ);
lB.castShadow=true; lB.shadow.mapSize.set(1024,1024); scene.add(lB); scene.add(lB.target);
function engrave(g2,center,axis,sc){
  var grp=new THREE.Group(); grp.position.copy(center);
  var mt=new THREE.MeshBasicMaterial({color:0xe0b352,transparent:true,opacity:.32});
  var cs=V*sc;
  for(var y=0;y<5;y++) for(var c=0;c<5;c++){
    if(g2[y].charAt(c)!=="1") continue;
    var q=new THREE.Mesh(new THREE.PlaneGeometry(cs*.9,cs*.9), mt);
    var a=(c-2)*cs, b=(2-y)*cs;
    if(axis==="x"){ q.rotation.y=Math.PI/2; q.position.set(0,b,a); } else q.position.set(a,b,0);
    grp.add(q);
  }
  scene.add(grp);
}
engrave(PA,new THREE.Vector3(WALLX+0.06,2.1,wz(15)),"x",(wx(6)-WALLX)/(wx(6)-wx(4)));
engrave(PB,new THREE.Vector3(wx(4),2.1,WALLZ+0.06),"z",(wz(18)-WALLZ)/(wz(18)-wz(15)));
(function(){ var qx=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),Math.PI/2);
  var qy=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.PI/2);
  solidG.quaternion.premultiply(qy).premultiply(qx).premultiply(qy); })();
var grabbed=false, dacc={x:0,y:0};
var solidHit=new THREE.Mesh(new THREE.BoxGeometry(2,2,2), new THREE.MeshBasicMaterial({visible:false}));
solidHit.position.copy(OBJ); scene.add(solidHit);
act(solidHit,"le solide suspendu",function(){
  if(seals[1]) return;
  grabbed=!grabbed; dacc.x=0; dacc.y=0;
  say(grabbed?"Glissez la souris : le solide tourne d’un quart de tour. E pour le lâcher."
             :"Vous lâchez le solide.");
});
function turn(dx,dy){
  dacc.x+=dx; dacc.y+=dy;
  var ax=null,sg=1;
  if(Math.abs(dacc.x)>46){ ax=new THREE.Vector3(0,1,0); sg=Math.sign(dacc.x); dacc.x=0;dacc.y=0; }
  else if(Math.abs(dacc.y)>46){ ax=new THREE.Vector3(1,0,0); sg=Math.sign(dacc.y); dacc.x=0;dacc.y=0; }
  if(!ax) return;
  solidG.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,Math.PI/2*sg));
  ping(300,.05,.03);
  if(solidG.quaternion.angleTo(new THREE.Quaternion())<0.08){ grabbed=false; grant(1); }
}
