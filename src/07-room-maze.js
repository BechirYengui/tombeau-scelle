/* ============================================================
   SALLE 4 · CHAMBRE EST — LE PASSAGE INVISIBLE
   ============================================================ */
var MAZE=[".....#.",".###.#.",".#.#.#.",".#.#.#.",".#.#.#.",".#.#.#.",".#...#.",".#####.","......."];
var MX=21, MZ=11;
function mazeAt(x,z){
  if(seals[2]) return false;
  var i=Math.round(x/T)-MX, j=Math.round(z/T)-MZ;
  if(i<0||j<0||j>=MAZE.length||i>=MAZE[0].length) return false;
  return MAZE[j].charAt(i)==="#";
}
var marks=[], mkGeo=new THREE.PlaneGeometry(T*0.94,WH*0.85);
function bump(x,z){
  if(seals[2]) return;
  var i=Math.round(x/T)-MX, j=Math.round(z/T)-MZ;
  if(i<0||j<0||j>=MAZE.length||i>=MAZE[0].length||MAZE[j].charAt(i)!=="#") return;
  var now=performance.now();
  for(var k=0;k<marks.length;k++) if(marks[k].gi===i&&marks[k].gj===j){ marks[k].t=now; return; }
  var mk=new THREE.Mesh(mkGeo, new THREE.MeshBasicMaterial({color:0xe0b352,transparent:true,
    opacity:.5,side:THREE.DoubleSide,depthWrite:false}));
  mk.position.set(wx(i+MX),WH/2,wz(j+MZ));
  if(Math.abs(camera.position.x-mk.position.x)>Math.abs(camera.position.z-mk.position.z)){
    mk.rotation.y=Math.PI/2; mk.position.x+=Math.sign(camera.position.x-mk.position.x)*T/2;
  } else mk.position.z+=Math.sign(camera.position.z-mk.position.z)*T/2;
  mk.gi=i; mk.gj=j; mk.t=now; scene.add(mk); marks.push(mk); ping(180,.07,.035);
}
var PED=new THREE.Vector3(wx(27),0,wz(15));
(function(){
  box(1.0,1.1,1.0, PED.x,0.55,PED.z, matSand);
  var o=new THREE.Mesh(new THREE.OctahedronGeometry(0.34),
    new THREE.MeshStandardMaterial({color:0xe0b352,emissive:0xe0b352,emissiveIntensity:.9,roughness:.3,metalness:.8}));
  o.position.set(PED.x,1.6,PED.z); scene.add(o); window.__orb=o;
})();
