// Main Three.js scene for the neon portal
import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.0/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

//VAriabeln erstellen
const canvas = document.getElementById('c');
const loadingEl = document.getElementById('loading');
const loadingBar = document.getElementById('loading-bar');
const loadingText = document.getElementById('loading-text');
//variabeln für das Menü bzw nach das Raufklicken des Portals
const radialMenu = document.getElementById('radialMenu');
const radialCenter = document.getElementById('radialCenter');

//portal Status
let portalActivated = false;
let isAnimating = false;

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
//---------------------------//
//------PortalFarben---------//
//---------------------------//
// Farb-Presets (alle aufbewahren für später, aber nur Gold aktiv)
const PRESETS = {
  magentaGold: { col1: '#ff00c8', col2: '#ffd166', label: 'Magenta → Gold' },
  // Andere Presets auskommentiert aber gespeichert für später:
  // cyanPurple:  { col1: '#00f0ff', col2: '#9b00ff', label: 'Cyan → Purple' },
  // aquaBlue:    { col1: '#00ffcc', col2: '#0077ff', label: 'Aqua → Blue' }
};

// Nur aktive Presets (momentan nur Gold)
const ACTIVE_PRESETS = {
  magentaGold: PRESETS.magentaGold
};

//Preset-Ebene (App-Logik): PRESETS ist nur deine eigene Datenstruktur. Die Keys wie magentaGold, cyanPurple, aquaBlue sind frei wählbare Bezeichner für Farb-Presets. Jedes Preset hat Werte, z. B. col1 und col2.
//Shader-Ebene (GPU-Interface): portalUniforms muss exakt die Namen benutzen, die im GLSL-Shader definiert sind, nämlich colorA und colorB. Diese Namen sind ans Shader-Programm gebunden und können nicht beliebig heißen, sonst kompiliert/arbeitet der Shader nicht wie erwartet.
// Erzwinge Magenta → Gold (Standard-Preset)
const SELECTED_PRESET = PRESETS.magentaGold;
// Portal shader material
 //Ein Shader ist ein kleines Programm, das auf der Grafikkarte (GPU) läuft
const portalUniforms = { //hier wird ein Objekt erstellt das alle Shader-Variabeln ernthält
  time: { value: 0 },
  resolution: { value: new THREE.Vector2(innerWidth, innerHeight) }, //um den Shader die Seitenbreite und Höhe weiterzugeben
 //Hie eventuell einfügen dass das Portal dann immer die gleiche vorm hat egal vom Sietenverhältniss her?
 //uv.x *= resolution.x / resolution.y;
  colorA: { value: new THREE.Color(SELECTED_PRESET.col1) }, //Farbe zum auswählen
  colorB: { value: new THREE.Color(SELECTED_PRESET.col2) }, //Farbe zum auswählen
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

const flashEl = document.getElementById('flash');




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




//---------------------------//
//---Portal Animation-------//
//---------------------------// 
function activatePortal(){
  if (isAnimating || portalActivated) return; // Wenn bereits animiert oder aktiviert, nichts tun
  isAnimating = true; // Animation läuft
  portalActivated = true; // Portal ist jetzt aktiviert

  //Verstecke Hint-Text
  const portalHint = document.querySelector('.hint');
  if (portalHint) {
    portalHint.style.opacity = '0';
  }

  // Starte Flug-Animation durch das Portal
  enterPortal();

  //-----------------------------//
  //Animation Portal Aktivierung//
  //----------------------------//

  const startColors={
    a: portalUniforms.colorA.value.clone(), //erstelle eine unabhängige Kopie der Farbe
    b: portalUniforms.colorB.value.clone()
  };

  const targetColors = {
    a: new THREE.Color('#00f0ff'), // Cyan
    b: new THREE.Color('#9b00ff')  // Purple
  };

  // Animation der Portal-Aktivierung (parallel zur Flug-Animation)
  const activationDuration = 2000;
  const startTime = performance.now();

  function animateActivation() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / activationDuration, 1);
    
    // Smooth easing
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Farbübergang
    portalUniforms.colorA.value.lerpColors(startColors.a, targetColors.a, eased);
    portalUniforms.colorB.value.lerpColors(startColors.b, targetColors.b, eased);
    
    // Bloom verstärken
    bloomPass.strength = 2.9 + eased * 1.0;
    
    if (progress < 1) {
      requestAnimationFrame(animateActivation);
    } else {
      // Animation beendet - zeige radiales Menü nach der Flug-Animation
      setTimeout(() => {
        showRadialMenu();
        isAnimating = false;
      }, 400); // Verkürzt von 800ms auf 400ms für schnellere Reaktion
    }
  }

  animateActivation();
}

// Radiales Menü Funktionen
function showRadialMenu() {
  if (radialMenu) {
    radialMenu.classList.add('active');
  }
}

function hideRadialMenu() {
  if (radialMenu) {
    radialMenu.classList.remove('active');
  }
}

// Portal-Klick Handler
window.addEventListener('pointerdown', (ev) => {
  if (isAnimating) return;
  
  mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  
  ray.setFromCamera(mouse, camera);
  const intersects = ray.intersectObject(portalMesh);
  
  if (intersects.length > 0 && !portalActivated) {
    activatePortal();
  }
});

// Radiales Menü Navigation
document.querySelectorAll('.radial-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const section = item.dataset.section;
    if (section) {
      e.preventDefault();
      console.log(`Navigation zu: ${section}`);
    }
  });
});

// Zentraler Hub Klick (Menü schließen)
if (radialCenter) {
  radialCenter.addEventListener('click', () => {
    hideRadialMenu();
  });
}

// Klick auf Portal
window.addEventListener('pointerdown', (ev) => {
  if (isAnimating) return;
  
  mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(ev.clientY / window.innerHeight) * 2 + 1;
  
  ray.setFromCamera(mouse, camera);
  const intersects = ray.intersectObject(portalMesh);
  
  if (intersects.length > 0 && !portalActivated) {
    activatePortal();
  }
});

// Radiales Menü Navigation
document.querySelectorAll('.radial-item').forEach(item => {
  item.addEventListener('click', (e) => {
    const section = item.dataset.section;
    if (section) {
      e.preventDefault();
      console.log(`Navigation zu: ${section}`);
      // Hier würdest du später zu den Sektionen navigieren
    }
  });
});

// Zentraler Hub Klick (Menü schließen)
if (radialCenter) {
  radialCenter.addEventListener('click', () => {
    hideRadialMenu();
  });
}


// Enter portal animation: camera fly + flash
//bewegt Kamera von der momentanen Position (startPos) zu einer Zielposition (targetPos) 
let entering = false; //somit kann sie nicht mehrfach gleichzeitig starten 
function enterPortal(){
  if(entering) return; 
  entering = true;
  
  const startPos = camera.position.clone();
  const targetPos = new THREE.Vector3(0, 0, -6);
  const duration = 900; // stoppt automatisch nach 900 ms
  const start = performance.now();

  // flash in middle
  function frame(time){
    const t = Math.min(1, (time - start)/duration);
    camera.position.lerpVectors(startPos, targetPos, t);
    camera.lookAt(0,0,0);
    if(t >= 0.78 && flashEl.style.opacity == '0'){
      flashEl.style.transition = 'opacity 120ms ease'; // Verkürzt von 220ms auf 120ms
      flashEl.style.opacity = '1';
    }
    if(t < 1) requestAnimationFrame(frame);
    else {
      // after finished, fade flash out and reset camera much faster
      setTimeout(()=>{ 
        flashEl.style.opacity = '0'; 
        camera.position.copy(startPos); 
        entering = false; 
        // Nach der Flug-Animation ist das Portal bereit für das Menü
      }, 50); // Verkürzt von 180ms auf 50ms
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
