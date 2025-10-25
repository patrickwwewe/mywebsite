// ====================================================================
//                        PORTAL INTERAKTION MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Diese Datei macht das Portal interaktiv! Sie erkennt wenn der Benutzer
// auf das Portal klickt und startet dann eine spektakuläre Aktivierungs-
// sequenz mit Flug-Animation und Menü-Anzeige.
//
// WAS PASSIERT BEI EINEM KLICK:
// 1. Raycasting erkennt Klick auf Portal-Geometrie
// 2. Portal-Aktivierung mit dramatischen Effekten startet
// 3. Kamera fliegt durch das Portal (enterPortal Animation)
// 4. Farben wechseln von Magenta→Gold zu Cyan→Purple
// 5. Bloom-Effekt wird verstärkt für dramatische Wirkung
// 6. Flash-Overlay erscheint in der Mitte der Animation
// 7. Radiales Navigationsmenü wird nach der Animation gezeigt
//
// TECHNISCHE UMSETZUNG:
// • Raycaster: "Schießt" einen Strahl von Kamera durch Mausposition
// • Intersection: Prüft ob der Strahl das Portal-Mesh trifft
// • requestAnimationFrame: Für smooth 60fps Animationen
// • CSS-Klassen: Steuert Sichtbarkeit von UI-Elementen
// • Event-Listener: Horcht auf Maus/Touch-Events
//
// BENUTZER-ERFAHRUNG:
// • Sofortiges Feedback auf Klick (keine Verzögerung)
// • Cinematic Portal-Durchflug für "Wow"-Effekt
// • Smooth Übergänge zwischen allen Zuständen
// • Mobile-Touch und Desktop-Maus funktionieren gleich
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Ruft initializePortalInteraction() beim Start auf
// → portal.js: Verwendet changePortalColors() für Farbwechsel
// → camera.js: Könnte Kamera-Presets für verschiedene Ansichten nutzen
// → styles.css: Manipuliert CSS-Klassen für UI-Sichtbarkeit (.active)
//
// ZUSTANDS-MANAGEMENT:
// • portalActivated: Verhindert Doppel-Aktivierung
// • isAnimating: Blockiert Interaktion während Animationen
// • entering: Verhindert mehrfache Flug-Animationen gleichzeitig
// ====================================================================

import * as THREE from 'three';
import { changePortalColors } from './portal.js';
import { activateTunnel } from './tunnel.js';

// Erweiterte Effekte werden dynamisch geladen (falls verfügbar)

// ====================================================================
//                        INTERAKTIONS-SETUP
// ====================================================================

// Globale Variablen für Portal-Status
let portalActivated = false;     // Wurde das Portal bereits aktiviert?
let isAnimating = false;         // Läuft gerade eine Animation?
let entering = false;            // Läuft gerade die Flug-Animation?
let mainScene = null;            // Referenz zur Hauptszene

// Raycasting für Maus-Interaktionen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Hover-State für Portal
let isHovering = false;
let hoverAnimationId = null;
let hoverStartTime = 0;
let portal = null;
let camera = null;

/**
 * Initialisiert Portal-Interaktionen und Event-Listener
 * @param {THREE.Mesh} portalMesh - Das Portal-Mesh zum Klicken
 * @param {THREE.PerspectiveCamera} camera - Die Szenen-Kamera
 * @param {Object} portalUniforms - Portal-Shader Uniforms
 * @param {Object} bloomPass - Bloom Post-Processing Pass
 * @param {THREE.Scene} scene - Die Hauptszene
 */
export function initializePortalInteraction(portalMesh, cameraRef, portalUniforms, bloomPass, scene) {
  console.log('🖱️ Initialisiere Portal-Interaktionen...');
  
  // Referenzen speichern
  portal = portalMesh;
  camera = cameraRef;
  mainScene = scene;
  
  // Event Listener für Maus-Movement (Hover-Effekte)
  window.addEventListener('pointermove', (event) => {
    if (isAnimating) return;
    
    // Maus-Position updaten
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting für Hover-Detection
    raycaster.setFromCamera(mouse, cameraRef);
    const intersects = raycaster.intersectObject(portalMesh);
    
    if (intersects.length > 0) {
      // Über Portal hovern
      if (!isHovering) {
        startHoverEffect();
      }
    } else {
      // Nicht über Portal
      if (isHovering) {
        stopHoverEffect();
      }
    }
  });
  
  // Event Listener für Maus/Touch-Klicks
  window.addEventListener('pointerdown', (event) => {
    if (isAnimating) return; // Keine Doppel-Aktivierung während Animation
    
    // Maus-Koordinaten in normalisierte Device Coordinates (-1 bis 1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycaster von Kamera durch Maus-Position
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(portalMesh);
    
    // Portal getroffen und noch nicht aktiviert?
    if (intersects.length > 0 && !portalActivated) {
      activatePortal(camera, portalUniforms, bloomPass);
    }
  });
}

// ====================================================================
//                      PORTAL AKTIVIERUNG
// ====================================================================

/**
 * Hauptfunktion für Portal-Aktivierung mit allen Effekten
 * @param {THREE.PerspectiveCamera} camera - Die Kamera für Flug-Animation
 * @param {Object} portalUniforms - Portal-Shader Uniforms
 * @param {Object} bloomPass - Bloom-Effekt Pass
 */
export function activatePortal(camera, portalUniforms, bloomPass) {
  if (isAnimating || portalActivated) return;
  
  console.log('🚀 AKTIVIERE ULTIMATIVES SCI-FI PORTAL MIT ALLEN EFFEKTEN!');
  
  isAnimating = true;
  portalActivated = true;

  // ================================================================
  // 🔊 ERWEITERTE EFFEKTE (FALLS VERFÜGBAR)
  // ================================================================
  
  // Audio-Effekte
  try {
    if (window.audioModule) {
      window.audioModule.playPortalActivationSound();
      console.log('🔊 Portal-Audio aktiviert!');
    }
  } catch (e) { console.log('⚠️ Audio übersprungen'); }
  
  // Screen-Shake
  try {
    if (window.shakeModule) {
      window.shakeModule.startPortalActivationShake();
      console.log('📳 Portal-Shake aktiviert!');
    }
  } catch (e) { console.log('⚠️ Shake übersprungen'); }
  
  // Particle-Explosion
  try {
    if (window.particleModule) {
      window.particleModule.createPortalActivationBurst(portal ? portal.position : new THREE.Vector3(0, 0, 0));
      console.log('💥 Portal-Explosion aktiviert!');
    }
  } catch (e) { console.log('⚠️ Partikel übersprungen'); }

  // ================================================================
  // UI-UPDATES - Hint ausblenden
  // ================================================================
  const portalHint = document.querySelector('.hint');
  if (portalHint) {
    portalHint.style.opacity = '0';
  }

  // ================================================================
  // FLUG-ANIMATION durch Portal starten
  // ================================================================
  enterPortal(camera);

  // ================================================================
  // PORTAL FARB-ANIMATION (parallel zur Flug-Animation)
  // ================================================================
  const activationDuration = 2000;
  const startTime = performance.now();
  
  // Ausgangfarben speichern
  const startColors = {
    a: portalUniforms.colorA.value.clone(),
    b: portalUniforms.colorB.value.clone()
  };

  // Zielfarben (Magenta→Gold zu Cyan→Purple)
  const targetColors = {
    a: new THREE.Color('#00f0ff'), // Cyan
    b: new THREE.Color('#9b00ff')  // Purple
  };

  function animateActivation() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / activationDuration, 1);
    
    // Smooth Easing für weiche Animation
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Farbübergänge
    portalUniforms.colorA.value.lerpColors(startColors.a, targetColors.a, eased);
    portalUniforms.colorB.value.lerpColors(startColors.b, targetColors.b, eased);
    
    // Bloom-Effekt verstärken für dramatischen Effekt
    bloomPass.strength = 2.9 + eased * 1.0;
    
    if (progress < 1) {
      requestAnimationFrame(animateActivation);
    } else {
      // Animation beendet - KEIN Menü mehr! Nur Portal-Animation
      console.log('🎯 Portal-Farb-Animation abgeschlossen');
      isAnimating = false;
    }
  }

  animateActivation();
}

// ====================================================================
//                        KAMERA FLUG-ANIMATION
// ====================================================================

/**
 * Animiert Kamera-Flug durch das Portal mit Flash-Effekt
 * @param {THREE.PerspectiveCamera} camera - Die zu animierende Kamera
 */
function enterPortal(camera) {
  if (entering) return;
  entering = true;
  
  console.log('🚀 Starte ULTIMATIVEN HYPERSPACE-FLUG!');
  
  // ================================================================
  // � HYPERSPACE-EFFEKTE (FALLS VERFÜGBAR)
  // ================================================================
  
  // Hyperspace-Audio
  try {
    if (window.audioModule) {
      window.audioModule.startHyperspaceSound();
      console.log('🔊 Hyperspace-Audio gestartet!');
    }
  } catch (e) { console.log('⚠️ Hyperspace-Audio übersprungen'); }
  
  // Hyperspace-Shake
  try {
    if (window.shakeModule) {
      window.shakeModule.startHyperspaceEntryShake();
      console.log('📳 Hyperspace-Shake gestartet!');
    }
  } catch (e) { console.log('⚠️ Hyperspace-Shake übersprungen'); }
  
  // Hyperspace-Explosion
  try {
    if (window.particleModule) {
      window.particleModule.createHyperspaceEntryExplosion(new THREE.Vector3(0, 0, 0));
      console.log('💥 Hyperspace-Explosion gestartet!');
    }
  } catch (e) { console.log('⚠️ Hyperspace-Explosion übersprungen'); }
  
  // ⚡ HYPERSPACE-TUNNEL AKTIVIEREN! (ULTRA-SCHNELL!)
  activateTunnel(true, 3.5, mainScene); // Aktiviert mit 3.5x Geschwindigkeit! (2.5 → 3.5)
  console.log('🌪️ ULTRA-SCHNELLER Hyperspace-Tunnel AKTIV!');
  
  const startPos = camera.position.clone();          // Startposition merken  
  const targetPos = new THREE.Vector3(0, 0, -50);    // Ziel: VIEL WEITER in die Ferne! (bleibt bei -50)
  const duration = 2500;                             // Animation dauert 2.5 SEKUNDEN! (noch schneller: 4s → 2.5s)
  const startTime = performance.now();
  
  // Flash-Element für dramatischen Effekt
  const flashEl = document.getElementById('flash');
  console.log('🔍 Flash-Element gefunden:', flashEl);
  
  function animateFrame(time) {
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Kamera-Position interpolieren (smooth)
    camera.position.lerpVectors(startPos, targetPos, progress);
    camera.lookAt(0, 0, 0); // Immer zum Portal schauen
    
    //TUNNEL-EFFEKT ULTRA-SCHNELL! Von 5% bis 85% (2 Sekunden!)
    if (progress >= 0.05 && progress < 0.85) {
      //TunnelProgress wird berechnet - ULTRA-SCHNELL!
      const tunnelProgress = (progress - 0.05) / 0.8; //0.05 (5%) bis 0.85 (85%) = 80% der 2.5s Animation!
      //Tunnel-VISION
      const baseFOV = 75; //Normal =75° sichtwinkel (breit)
      const tunnelFOV = baseFOV - (tunnelProgress * 30); //wird enger!
      camera.fov = tunnelFOV; //Kamera FOV setzen - DAS WAR'S!
      camera.updateProjectionMatrix(); //Matrix updaten - AUCH WICHTIG!
      
      //Kamera Shake
      const shakeIntensity = tunnelProgress * 0.02; //Stärke berrechnen
      camera.position.x += (Math.random() - 0.5) * shakeIntensity;  //zufällige Kamera bewegung x-Achse
      camera.position.y += (Math.random() - 0.5) * shakeIntensity;  //zufällige Kamera bewegung y-Achse  
      camera.position.z += (Math.random() - 0.5) * shakeIntensity;  //zufällige Kamera bewegung z-Achse
      
    
    }

    // MICRO-BLITZ bei 85% der Animation! ⚡ (früher weil schneller)
    if (progress >= 0.85 && flashEl && (flashEl.style.opacity === '0' || flashEl.style.opacity === '')) {
      console.log('⚡ ULTIMATIVER MICRO-BLITZ MIT ALLEN EFFEKTEN!');
      
      // ================================================================
      // ⚡ FLASH-EFFEKTE (FALLS VERFÜGBAR)
      // ================================================================
      
      // Flash-Audio
      try {
        if (window.audioModule) {
          window.audioModule.playFlashZapSound();
          console.log('🔊 Flash-Audio gespielt!');
        }
      } catch (e) { console.log('⚠️ Flash-Audio übersprungen'); }
      
      // Flash-Shake
      try {
        if (window.shakeModule) {
          window.shakeModule.startFlashImpactShake();
          console.log('📳 Flash-Shake gestartet!');
        }
      } catch (e) { console.log('⚠️ Flash-Shake übersprungen'); }
      
      // Flash-Explosion
      try {
        if (window.particleModule) {
          window.particleModule.createFlashSparkExplosion(new THREE.Vector3(0, 0, 0));
          console.log('💥 Flash-Explosion gespielt!');
        }
      } catch (e) { console.log('⚠️ Flash-Explosion übersprungen'); }
      
      // Visueller Flash
      flashEl.style.transition = 'opacity 2ms ease'; // INSTANT!
      flashEl.style.opacity = '1';  // Flash wird sichtbar
      console.log('⚡ ZACK! ALLE EFFEKTE GLEICHZEITIG!');
    }
    
    // Animation fortsetzen oder beenden
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // Animation beendet - STUFENWEISER ÜBERGANG für cinematischen Effekt!
      
      // MINI-BLITZ! ⚡ (Kaum sichtbar!)
      setTimeout(() => {
        if (flashEl) {
          console.log('⚡ MINI-BLITZ weg!');
          flashEl.style.transition = 'opacity 5ms ease'; // EXTREM schnell!
          flashEl.style.opacity = '0';
        }
      }, 1); // Blitz nur 1ms!
      
      // Portal mit Aufgeh-Animation zurückbringen!
      setTimeout(() => {
        // ⚡ Tunnel weg, Portal mit Animation zurück!
        activateTunnel(false, 1.0, mainScene);
        console.log('🌟 Portal geht auf mit Animation!');
        
        // Kamera zurück zur Startposition
        camera.position.copy(startPos);
        
        // PORTAL-AUFGEH-ANIMATION! 
        animatePortalReturn();
        
        entering = false;
      }, 4); // Portal kommt SOFORT nach micro-Blitz!
    }
  }
  
  requestAnimationFrame(animateFrame);
}

// ====================================================================
//                    PORTAL-AUFGEH-ANIMATION
// ====================================================================

/**
 * Animiert das Portal beim Zurückkehren aus dem Tunnel
 */
function animatePortalReturn() {
  console.log('🌟 Starte Portal-Aufgeh-Animation...');
  
  // Finde das Portal-Mesh in der Szene
  const portalMesh = mainScene.children.find(child => 
    child.type === 'Mesh' && child.geometry && child.geometry.type === 'PlaneGeometry'
  );
  
  if (!portalMesh) {
    console.log('❌ Portal-Mesh nicht gefunden');
    return;
  }
  
  // Portal startet unsichtbar und klein
  portalMesh.scale.set(0.1, 0.1, 1);
  portalMesh.material.opacity = 0;
  
  // Längere, cinematischere Animation
  const duration = 1200; // 1200ms = 1.2 Sekunden (viel länger!)
  const startTime = performance.now();
  
  function animateReturn(time) {
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Smooth Easing (Bounce-Effekt)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Portal wird größer und sichtbarer
    const scale = 0.1 + (eased * 0.9); // Von 0.1 zu 1.0
    portalMesh.scale.set(scale, scale, 1);
    portalMesh.material.opacity = eased; // Von 0 zu 1
    
    // Leichte Rotation für dramatischen Effekt
    portalMesh.rotation.z = (1 - eased) * Math.PI * 0.2;
    
    if (progress < 1) {
      requestAnimationFrame(animateReturn);
    } else {
      // Animation beendet
      portalMesh.scale.set(1, 1, 1);
      portalMesh.material.opacity = 1;
      portalMesh.rotation.z = 0;
      console.log('✅ Portal-Animation abgeschlossen!');
    }
  }
  
  requestAnimationFrame(animateReturn);
}

// ====================================================================
//                      PORTAL ZURÜCKSETZEN
// ====================================================================

/**
 * Portal ist zurück - keine weiteren Aktionen nötig (Menü entfernt!)
 */
function resetPortalState() {
  console.log('🎯 Portal-Status zurückgesetzt - bereit für nächste Aktivierung');
  // Portal kann wieder geklickt werden - kein Menü mehr!
}

// ====================================================================
//                      STATUS ABFRAGEN
// ====================================================================

/**
 * Gibt zurück, ob das Portal bereits aktiviert wurde
 * @returns {boolean} Portal-Status
 */
export function isPortalActivated() {
  return portalActivated;
}

/**
 * Gibt zurück, ob gerade eine Animation läuft
 * @returns {boolean} Animations-Status
 */
export function isPortalAnimating() {
  return isAnimating;
}

// ====================================================================
//                        HOVER-EFFEKTE
// ====================================================================

/**
 * Startet Hover-Effekt beim Portal
 */
function startHoverEffect() {
  isHovering = true;
  hoverStartTime = Date.now();
  
  // Cursor ändern
  document.body.style.cursor = 'pointer';
  
  // Portal-Pulsing Animation
  startHoverAnimation();
  
  console.log('✨ Portal-Hover gestartet');
}

/**
 * Stoppt Hover-Effekt
 */
function stopHoverEffect() {
  isHovering = false;
  
  // Cursor zurücksetzen
  document.body.style.cursor = 'default';
  
  // Animation stoppen
  if (hoverAnimationId) {
    cancelAnimationFrame(hoverAnimationId);
    hoverAnimationId = null;
  }
  
  // Portal zurücksetzen
  if (portal) {
    portal.scale.set(1, 1, 1);
    if (portal.material && portal.material.uniforms && portal.material.uniforms.glowIntensity) {
      portal.material.uniforms.glowIntensity.value = 1.0;
    }
  }
  
  console.log('🌙 Portal-Hover gestoppt');
}

/**
 * Hover-Animation Loop
 */
function startHoverAnimation() {
  if (!isHovering) return;
  
  const elapsedTime = (Date.now() - hoverStartTime) * 0.001;
  
  // Sanftes Pulsing des Portals
  if (portal && portal.material && portal.material.uniforms) {
    const pulseIntensity = 1.2 + Math.sin(elapsedTime * 3) * 0.3;
    
    // Portal-Helligkeit pulsieren lassen
    if (portal.material.uniforms.glowIntensity) {
      portal.material.uniforms.glowIntensity.value = pulseIntensity;
    }
    
    // Leichte Größen-Variation
    const scaleVariation = 1.0 + Math.sin(elapsedTime * 2) * 0.05;
    portal.scale.set(scaleVariation, scaleVariation, 1);
  }
  
  // Kontinuierliche Animation
  hoverAnimationId = requestAnimationFrame(() => startHoverAnimation());
}

/**
 * Exportierte Update-Funktion für Hover-Effekte
 */
export function updateHoverEffects() {
  // Falls nötig für zusätzliche Hover-Updates
  if (isHovering && portal) {
    // Zusätzliche Hover-Logik hier
  }
}