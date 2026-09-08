/* ============================================================
   SCEAUX + SARCOPHAGE
   ============================================================ */
var seals=[false,false,false], SG=["☥","◍","◐"];
(function(){ var b=$("#seals");
  for(var k=0;k<3;k++){ var d=document.createElement("div"); d.className="sl"; d.id="s"+k;
    d.textContent=SG[k]; b.appendChild(d); } })();
function grant(k){
  if(seals[k]) return; seals[k]=true;
  document.getElementById("s"+k).classList.add("lit"); flash();
  ping(523,.5,.05); setTimeout(function(){ping(784,.7,.05);},110);
  var n=seals.filter(Boolean).length;
  say(["L’ankh s’est refermé. Il tenait dans un seul point de vue.",
       "Les deux ombres coïncident. Une orientation sur vingt-quatre.",
       "Le passage est franchi — cartographié sans jamais être vu."][k]
      + (n<3?"  ·  Il reste "+(3-n)+" sceau"+(n<2?"x":"")+"." : ""));
  if(n<3) spawn(2, wx(14),wz(15), 8);
  if(n===3) setTimeout(function(){ say("Trois sceaux. Le sarcophage s’ouvre au centre de la grande salle."); },4000);
}
var sarc=new THREE.Group(); sarc.position.set(wx(14),0,wz(15)); scene.add(sarc);
(function(){
  var b=new THREE.Mesh(new THREE.BoxGeometry(1.3,0.9,3.0), matSand); b.position.y=0.45; b.castShadow=true; sarc.add(b);
  var lid=new THREE.Mesh(new THREE.BoxGeometry(1.36,0.28,3.06), matGold); lid.position.y=1.02; lid.castShadow=true;
  sarc.add(lid); sarc.userData.lid=lid;
  var f=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.12,1.1), matLapis); f.position.set(0,1.18,-0.75); sarc.add(f);
})();
solid(sarc,0.15);
