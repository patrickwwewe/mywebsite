// ====================================================================
//                           SZENE SETUP MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Diese Datei erstellt die grundlegende 3D-Szene mit Three.js und ist
// das Fundament für alle anderen 3D-Objekte im Portal.
// 
// WAS PASSIERT HIER:
// • Renderer-Setup: Wandelt 3D-Geometrie in 2D-Pixel für den Bildschirm
// • Kamera-Erstellung: Definiert den Blickwinkel in die 3D-Welt
// • Szenen-Container: Ein leerer 3D-Raum, in den Objekte eingefügt werden
// • Beleuchtung: Lichtquellen, damit 3D-Objekte sichtbar und schattiert werden
// • Post-Processing: Nachbearbeitung für Glow- und Bloom-Effekte
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Importiert diese Funktionen und ruft sie beim Start auf
// → portal.js: Das Portal wird in die hier erstellte Szene eingefügt
// → decorations.js: Torus-Ringe und Partikel werden hier hinzugefügt
// → interactions.js: Verwendet die Kamera für Raycasting (Klick-Erkennung)
//
// ANALOGIE:
// Stell dir vor, du baust eine Filmszene:
// • Scene = leeres Filmstudio
// • Camera = Filmkamera
// • Renderer = entwickelt den Film
// • Lights = Studiobeleuchtung
// ====================================================================

import * as THREE from 'three';
import { EffectComposer } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.152.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// ====================================================================
//                        SZENE INITIALISIERUNG
// ====================================================================

/**
 * Erstellt und konfiguriert die grundlegende 3D-Szene
 * @returns {Object} Objekt mit scene, camera, renderer, composer
 */
export function initializeScene() {
  console.log('🎬 Initialisiere 3D-Szene...');
  
  // Canvas-Element holen
  const canvas = document.getElementById('c');
  
  // Szene erstellen - das ist die 3D-Welt
  const scene = new THREE.Scene();
  
  // Kamera erstellen - das ist unser Blickwinkel
  // Parameter: FOV (50°), Seitenverhältnis, Near-Plane, Far-Plane
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
  camera.position.set(0, 0, 6); // Kamera 6 Einheiten vor dem Portal positionieren
  
  // Renderer erstellen - wandelt 3D in 2D-Pixel um
  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    antialias: true,    // Glättet scharfe Kanten
    alpha: true         // Transparenter Hintergrund möglich
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Hochauflösende Displays
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMappingExposure = 1; // Helligkeit anpassen

  return { scene, camera, renderer };
}

// ====================================================================
//                           BELEUCHTUNG
// ====================================================================

/**
 * Fügt Lichtquellen zur Szene hinzu
 * @param {THREE.Scene} scene - Die 3D-Szene
 */
export function setupLighting(scene) {
  console.log('💡 Richte Beleuchtung ein...');
  
  // Ambient Light - gleichmäßiges Grundlicht von überall
  // Parameter: Farbe (weiß), Intensität (12% = subtil)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambientLight);

  // Point Light - Punktlichtquelle mit Falloff
  // Parameter: Farbe (weiß), Intensität (80%), Reichweite (40 Einheiten)
  const pointLight = new THREE.PointLight(0xffffff, 0.8, 40);
  pointLight.position.set(0, 5, 8); // Oberhalb und leicht vor dem Portal
  scene.add(pointLight);
}

// ====================================================================
//                        POST-PROCESSING
// ====================================================================

/**
 * Richtet Post-Processing-Effekte ein (Bloom-Glow)
 * @param {THREE.WebGLRenderer} renderer - Der WebGL Renderer
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @returns {Object} Composer und Bloom-Pass für weitere Kontrolle
 */
export function setupPostProcessing(renderer, scene, camera) {
  console.log('✨ Konfiguriere Post-Processing (Bloom)...');
  
  // Effect Composer - Pipeline für Nachbearbeitung
  const composer = new EffectComposer(renderer);
  
  // Render Pass - rendert die normale Szene
  composer.addPass(new RenderPass(scene, camera));
  
  // Bloom Pass - erzeugt Glow-Effekte um helle Objekte (REDUZIERT!)
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight), // Auflösung
    0.8,    // Bloom-Stärke (reduziert: 1.2 → 0.8)
    0.8,    // Radius (reduziert: 1 → 0.8)
    0.3     // Schwellenwert (erhöht: 0.2 → 0.3, weniger Bloom)
  );
  bloomPass.threshold = 0.2; // Höherer Schwellenwert = weniger Bloom (0.1 → 0.2)
  composer.addPass(bloomPass);

  return { composer, bloomPass };
}

// ====================================================================
//                      FENSTER RESIZE HANDLER
// ====================================================================

/**
 * Passt Szene bei Fenstergröße-Änderung an
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @param {THREE.WebGLRenderer} renderer - Der Renderer
 * @param {EffectComposer} composer - Der Post-Processing Composer
 * @param {Object} portalUniforms - Portal Shader Uniforms für Auflösung
 */
export function setupResizeHandler(camera, renderer, composer, portalUniforms) {
  window.addEventListener('resize', () => {
    console.log('📱 Passe Szene an neue Fenstergröße an...');
    
    const w = innerWidth;
    const h = innerHeight;
    
    // Kamera-Seitenverhältnis anpassen
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    
    // Renderer-Größe anpassen
    renderer.setSize(w, h);
    composer.setSize(w, h);
    
    // Portal-Shader über neue Auflösung informieren
    if (portalUniforms?.resolution) {
      portalUniforms.resolution.value.set(w, h);
    }
  });
}