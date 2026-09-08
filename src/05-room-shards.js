/* ============================================================
   SALLE 2 · CHAMBRE NORD — LES ÉCLATS (anamorphose : un ankh)
   ============================================================ */
var ANKH=["...#####...","..##...##..",".##.....##.",".##.....##.",".##.....##.",
          "..##...##..","...#####...","....###....","###########","###########",
          "....###....","....###....","....###....","....###....","....###...."];
var SWEET=new THREE.Vector3(wx(14),EYE,wz(7.4)), GAZE=new THREE.Vector3(0,0,-1);
var shards=[], shardMat=new THREE.MeshStandardMaterial({color:0xb08d57, roughness:.42, metalness:.55,
  emissive:0xe0b352, emissiveIntensity:0});
(function(){
  var D=9.4, px=0.40, R=new THREE.Vector3(1,0,0), U=new THREE.Vector3(0,1,0);
  for(var r=0;r<ANKH.length;r++) for(var c=0;c<ANKH[r].length;c++){
    if(ANKH[r].charAt(c)!=="#") continue;
    var ox=(c-5)*px, oy=(7-r)*px*0.92;
    var tgt=SWEET.clone().addScaledVector(GAZE,D).addScaledVector(R,ox).addScaledVector(U,oy);
    var dir=tgt.clone().sub(SWEET).normalize(), t=D*(0.30+Math.random()*0.66), s=(t/D)*px*0.92;
    var m=new THREE.Mesh(new THREE.BoxGeometry(s,s,s*(0.25+Math.random()*0.5)), shardMat);
    m.position.copy(SWEET).addScaledVector(dir,t);
    m.rotation.set(Math.random()*6.3,Math.random()*6.3,Math.random()*6.3);
    m.userData.s=(Math.random()-0.5)*0.13; scene.add(m); shards.push(m);
  }
})();
function anaScore(){
  var d=camera.position.distanceTo(SWEET), f=new THREE.Vector3(); camera.getWorldDirection(f);
  return Math.max(0,Math.min(1, Math.max(0,1-d/2.5)*Math.max(0,(f.dot(GAZE)-0.94)/0.06)));
}
