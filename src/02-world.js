/* ============================================================
   LE LIEU
   ============================================================ */
var T=3, GW=29, GH=31, WH=4.4, EYE=1.7, WALLS=null;
var grid=[]; for(var z=0;z<GH;z++){ var r=[]; for(var x=0;x<GW;x++) r.push(1); grid.push(r); }
function carve(x0,z0,w,h){ for(var j=z0;j<z0+h;j++) for(var i=x0;i<x0+w;i++) grid[j][i]=0; }
carve( 9,21,11,8);  // antichambre  (escape room)
carve(14,20, 1,1);  // la porte scellée
carve( 9,11,11,9);  // grande salle
carve( 9, 1,11,8);  // chambre nord — les Éclats
carve(14, 9, 1,2);  //   couloir nord
carve( 1,11, 7,9);  // chambre ouest — les Deux Ombres
carve( 7,15, 3,1);  //   couloir ouest
carve(21,11, 7,9);  // chambre est — le Passage
carve(19,15, 2,1);  //   couloir est
function tile(i,j){ return (i<0||j<0||i>=GW||j>=GH)?1:grid[j][i]; }
function wx(i){ return i*T; } function wz(j){ return j*T; }
camera.position.set(wx(14),EYE,wz(25));

(function build(){
  var cells=[];
  for(var j=0;j<GH;j++) for(var i=0;i<GW;i++){
    if(!tile(i,j)) continue;
    if(!tile(i+1,j)||!tile(i-1,j)||!tile(i,j+1)||!tile(i,j-1)) cells.push([i,j]);
  }
  var im=new THREE.InstancedMesh(new THREE.BoxGeometry(T,WH,T), matSand, cells.length);
  im.receiveShadow=true; var m=new THREE.Matrix4();
  for(var k=0;k<cells.length;k++){ m.makeTranslation(wx(cells[k][0]),WH/2,wz(cells[k][1])); im.setMatrixAt(k,m); }
  im.instanceMatrix.needsUpdate=true; scene.add(im); WALLS=im;
  // bandeau de hiéroglyphes à mi-hauteur, en anneau autour des salles
  var band=new THREE.InstancedMesh(new THREE.BoxGeometry(T*0.99,1.15,T*0.99), matGlyph, cells.length);
  var m2=new THREE.Matrix4();
  for(var q=0;q<cells.length;q++){ m2.makeTranslation(wx(cells[q][0]),2.35,wz(cells[q][1])); band.setMatrixAt(q,m2); }
  band.instanceMatrix.needsUpdate=true; band.scale.set(1.008,1,1.008); scene.add(band);

  var fl=new THREE.Mesh(new THREE.PlaneGeometry(GW*T+30,GH*T+30),
    new THREE.MeshStandardMaterial({map:texSand.clone(), roughness:1}));
  fl.material.map.wrapS=fl.material.map.wrapT=THREE.RepeatWrapping;
  fl.material.map.repeat.set(22,24);
  fl.rotation.x=-Math.PI/2; fl.position.set(wx(14),0,wz(15)); fl.receiveShadow=true; scene.add(fl);
  var ce=fl.clone(); ce.rotation.x=Math.PI/2; ce.position.y=WH;
  ce.material=new THREE.MeshStandardMaterial({color:0x120e09, roughness:1}); scene.add(ce);
})();
scene.add(new THREE.AmbientLight(0x3a3020, 0.55));
function torch(x,z,i,d){ var l=new THREE.PointLight(0xffa94d, i||4, d||13, 2); l.position.set(x,2.9,z); scene.add(l); return l; }
var lampsA=[torch(wx(11),wz(23)),torch(wx(17),wz(26)),torch(wx(14),wz(21),3.5,12)];
torch(wx(14),wz(15),7,26); torch(wx(11),wz(12),3,12); torch(wx(17),wz(18),3,12);
torch(wx(14),wz(4),4.5,20); torch(wx(24),wz(15),4,18); torch(wx(3),wz(12),2.2,11);
