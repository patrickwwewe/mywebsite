// Main Three.js scene for the neon portal
import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const canvas = document.getElementById('c');
const loadingEl = document.getElementById('loading');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');

function setLoading(pct, text){
  if(pct!=null){ loadingBar.style.width = Math.max(0, Math.min(100, pct)) + '%'; }
  if(text) loadingText.textContent = text;
}

function hideLoading(){
  if(!loadingEl) return;
  loadingEl.style.opacity = '0';
  setTimeout(()=>{ loadingEl.style.display = 'none'; }, 350);
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 0, 6);

setLoading(5, 'Erstelle Renderer');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMappingExposure = 1;
setLoading(18, 'Renderer bereit');

// lights
scene.add(new THREE.AmbientLight(0xffffff, 0.12));
const p = new THREE.PointLight(0xffffff, 0.8, 40);
p.position.set(0, 5, 8);
scene.add(p);

// Post-processing composer + bloom
const composer = new EffectComposer(renderer); //post processing kette starten (rendern in Zwischentexturen)
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.2, 1, 0.2);
bloomPass.threshold = 0.1;
composer.addPass(bloomPass);
setLoading(36, 'Post-Processing geladen');

// Portal shader material
 //Ein Shader ist ein kleines Programm, das auf der Grafikkarte (GPU) läuft
const portalUniforms = { //hier wird ein Objekt erstellt das alle Shader-Variabeln ernthält
  time: { value: 0 },
  resolution: { value: new THREE.Vector2(innerWidth, innerHeight) }, //um den Shader die Seitenbreite und Höhe weiterzugeben
 //Hie eventuell einfügen dass das Portal dann immer die gleiche vorm hat egal vom Sietenverhältniss her?
 //uv.x *= resolution.x / resolution.y;
  colorA: { value: new THREE.Color('#00f0ff') }, //Farbe zum auswählen
  colorB: { value: new THREE.Color('#9b00ff') }, //Farbe zum auswählen
  glow: { value: 1.0 }, //wie stark es glühen soll
  speed: { value: 1.0 }
};

const portalMaterial = new THREE.ShaderMaterial({ //hier wird ein neues Material erstellt das ein eigenen Shader benutzt
  uniforms: portalUniforms, //uniform sinn die variabeln die ich davor deviniert habe (time, colorA, ColorB, etc)
  vertexShader: `//Der Vertex Shader läuft einmal pro Eckpunkt des Modells.
                //Er rechnet aus, wo auf dem Bildschirm dieser Punkt landen soll.

    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float time;
    uniform vec2 resolution;
    uniform vec3 colorA;
    uniform vec3 colorB;
    uniform float glow;
    uniform float speed;

    // Simple noise
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7))) * 43758.5453123);}    

    void main(){
      vec2 uv = vUv * 2.0 - 1.0;
      uv.x *= resolution.x / resolution.y;
      float dist = length(uv);

      // animated rings
      float t = time * 0.6 * speed;
      float rings = sin((dist * 12.0 - t) * 6.0);
      rings = smoothstep(0.0, 0.9, rings);

      // soft center shimmer
      float center = 1.0 - smoothstep(0.0, 0.8, dist);

      // color mixing
      vec3 col = mix(colorA, colorB, pow(rings + 0.2*center, 1.2));

      // rim glow
      float rim = smoothstep(0.5, 0.48, dist) * glow;

      // flicker noise
      float n = (hash(uv * 10.0 + floor(time * 10.0)) - 0.5) * 0.12;
      col += rim * 1.6 * vec3(1.0) + n;

  // final falloff (fade from center outwards)
  // correct smoothstep order: smoothstep(edge0, edge1, x) requires edge0 < edge1
  float alpha = 1.0 - smoothstep(0.3, 1.0, dist);
  alpha = clamp(alpha, 0.0, 1.0);

  // multiply color by alpha for intensity and use alpha channel for smooth blending
  gl_FragColor = vec4(col * alpha, alpha);
    }
  `,
  transparent: true,
  depthWrite: false
});
setLoading(64, 'Shader kompiliere');

// Portal mesh --> hier wird es tatsächlich sichtbar eingebaut
const portalGeo = new THREE.PlaneGeometry(4, 4, 1, 1);
const portalMesh = new THREE.Mesh(portalGeo, portalMaterial);
portalMesh.rotation.x = 0; //fläche steht flach und zeigt nach vorne
scene.add(portalMesh);
setLoading(78, 'Portal erstellt'); //Ladebalken auf 78% stellen

// Rotating torus frames
//in Torus (Plural: Tori) ist ein geometrischer Körper in Form eines Reifens oder Donuts 🍩.
//Three.js hat dafür eine eingebaute Form: THREE.TorusGeometry().
const torusGroup = new THREE.Group(); //eine Group ist ein unsichtbarere Container im 3D Braum, man kann mehrere Objekte hineinlegen und sie dann zusammen bewegen, drehen oder skalieren.
for(let i=0;i<3;i++){
  const r = 1.6 + i*0.35;
  const geo = new THREE.TorusGeometry(r, 0.03 + i*0.01, 16, 120);
  const mat = new THREE.MeshBasicMaterial({color: new THREE.Color().setHSL(0.6 - i*0.05, 0.9, 0.6), transparent:true, opacity:0.85});
  const m = new THREE.Mesh(geo, mat);
  m.rotation.x = Math.PI*0.5;
  m.receiveShadow = false;
  m.castShadow = false;
  torusGroup.add(m);
}
scene.add(torusGroup);

// floating columns (subtle)
const colGeo = new THREE.CylinderGeometry(0.06,0.06,3,18);
for(let i=0;i<6;i++){
  const m = new THREE.Mesh(colGeo, new THREE.MeshStandardMaterial({color:0x09202b, emissive:0x00303f, metalness:0.2, roughness:0.4, emissiveIntensity:0.8}));
  const ang = (i / 6) * Math.PI * 2;
  m.position.set(Math.cos(ang)*6.5, -0.6 + Math.sin(i)*0.3, Math.sin(ang)*5.0 - 1.5);
  m.rotation.y = ang + Math.PI*0.2;
  m.scale.y = 0.9 + (i%2)*0.3;
  scene.add(m);
}

// particles
const particleCount = 600; //einmal 600 Partikel bitte
const positions = new Float32Array(particleCount * 3); //Positions- Array vorbereiten; jeder Partikel hat drei werte--> x,y,z; 600 Punkte × 3 Werte = 1800 Zahlen, alle in einem schnellen Float32Array (für die GPU optimiert).
for(let i=0;i<particleCount;i++){ //position zufällig erzeugen
  const r = 2.6 + Math.random()*10.0; //abstand vom Zentrum von 2.6 bis 12.6
  const theta = Math.random()*Math.PI*2; //winkel um die y achse (kompletter kreis)
  const phi = (Math.random()-0.5)*Math.PI; //vertikaler winkel 
  positions[i*3] = Math.cos(theta)*Math.cos(phi)*r;
  positions[i*3+1] = Math.sin(phi)*r*0.4;
  positions[i*3+2] = Math.sin(theta)*Math.cos(phi)*r;
}
const pGeo = new THREE.BufferGeometry(); //THREE.BufferGeometry ist eine effiziente Geometrie, die mit Rohdaten arbeitet. „Ich habe eine Liste mit 600 Punkten, jeder hat 3 Koordinaten. Mach daraus eine Geometrie.“
pGeo.setAttribute('position', new THREE.BufferAttribute(positions,3));
const pMat = new THREE.PointsMaterial({color:0xaaffff, size:0.03, transparent:true, opacity:0.9});
const points = new THREE.Points(pGeo, pMat);
scene.add(points);
setLoading(88, 'Partikel bereit');

// Raycaster for clicks
const ray = new THREE.Raycaster(); //HTML Elemente Finden 
const mouse = new THREE.Vector2(); //HTML Elemente Finden

let menuOpen = false;
const menuEl = document.getElementById('menu');
const flashEl = document.getElementById('flash');

function setMenu(open){
  menuOpen = open;
  if(open){ menuEl.classList.add('show'); menuEl.setAttribute('aria-hidden','false'); }
  else { menuEl.classList.remove('show'); menuEl.setAttribute('aria-hidden','true'); }
}

// Controls: Hook UI controls
//Verbindet HTML Elemente mit Shader Werten und dem Bloom Effekt
//html Elemnte holen 
const glowCtrl = document.getElementById('ctrl-glow');
const speedCtrl = document.getElementById('ctrl-speed');
const bloomCtrl = document.getElementById('ctrl-bloom');
//Glow Regler
glowCtrl.addEventListener('input', e=>{ portalUniforms.glow.value = parseFloat(e.target.value); });
speedCtrl.addEventListener('input', e=>{ portalUniforms.speed.value = parseFloat(e.target.value); });
bloomCtrl.addEventListener('input', e=>{ bloomPass.strength = parseFloat(e.target.value); });

// Presets
document.querySelectorAll('.preset').forEach(p=>{
  p.addEventListener('click', ()=>{
    const c1 = p.dataset.col1;
    const c2 = p.dataset.col2;
    portalUniforms.colorA.value.set(c1);
    portalUniforms.colorB.value.set(c2);
    document.documentElement.style.setProperty('--neon', c1);
    document.documentElement.style.setProperty('--neon-2', c2);
  });
});

// Menu buttons
document.getElementById('closeBtn').addEventListener('click', ()=> setMenu(false));
document.getElementById('enterBtn').addEventListener('click', enterPortal);

// click on portal to toggle menu
window.addEventListener('pointerdown', (ev)=>{
  mouse.x = (ev.clientX / innerWidth) * 2 - 1;
  mouse.y = -(ev.clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObject(portalMesh, false);
  if(hits.length){ setMenu(!menuOpen); }
});

// Enter portal animation: camera fly + flash
let entering = false;
function enterPortal(){
  if(entering) return; entering = true; setMenu(false);
  const startPos = camera.position.clone();
  const targetPos = new THREE.Vector3(0, 0, -6);
  const duration = 900; // ms
  const start = performance.now();

  // flash in middle
  function frame(time){
    const t = Math.min(1, (time - start)/duration);
    camera.position.lerpVectors(startPos, targetPos, t);
    camera.lookAt(0,0,0);
    if(t >= 0.78 && flashEl.style.opacity == '0'){
      flashEl.style.transition = 'opacity 220ms ease'; flashEl.style.opacity = '1';
    }
    if(t < 1) requestAnimationFrame(frame);
    else {
      // after finished, fade flash out and reset camera
      setTimeout(()=>{ flashEl.style.opacity = '0'; camera.position.copy(startPos); entering = false; }, 180);
    }
  }
  requestAnimationFrame(frame);
}

// handle resize
onresize = () => {
  const w = innerWidth, h = innerHeight;
  camera.aspect = w/h; camera.updateProjectionMatrix();
  renderer.setSize(w,h);
  composer.setSize(w,h);
  portalUniforms.resolution.value.set(w,h);
};

// subtle camera motion variables
let t0 = performance.now();

function animate(){
  const t = (performance.now() - t0) * 0.001;
  portalUniforms.time.value = t;

  // rotate torus
  torusGroup.children.forEach((m,i)=>{ m.rotation.z += 0.0025*(1+i*0.6) * portalUniforms.speed.value; });

  // particles slight floating
  points.rotation.y = t * 0.02;

  // small parallax camera motion
  camera.position.x = Math.sin(t * 0.2) * 0.12;
  camera.position.y = Math.sin(t * 0.12) * 0.08;
  camera.lookAt(0,0,0);

  composer.render();
  // On the first few frames ensure loading UI hides once we have rendered a frame
  if(performance.now() - t0 > 80){
    // give a final progress bump then hide
    setLoading(100, 'Fertig — Szene bereit');
    hideLoading();
  }
  requestAnimationFrame(animate);
}

// initial values — locked to screenshot settings so users cannot change them
// Glow: small, Speed: medium-high, Bloom: high
portalUniforms.glow.value = 0.3;
portalUniforms.speed.value = 1.6;
bloomPass.strength = 2.9;

// Keep hidden input values in sync (script compatibility)
if(glowCtrl) glowCtrl.value = (portalUniforms.glow.value).toString();
if(speedCtrl) speedCtrl.value = (portalUniforms.speed.value).toString();
if(bloomCtrl) bloomCtrl.value = (bloomPass.strength).toString();

// small helper: if user opens file:// modules might be blocked; note in console
console.log('Portal scene loaded. Open this page via a local HTTP server for best results (see README or instructions).');

animate();
