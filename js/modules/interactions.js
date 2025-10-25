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

// ====================================================================
//                        INTERAKTIONS-SETUP
// ====================================================================

// Globale Variablen für Portal-Status
let portalActivated = false;     // Wurde das Portal bereits aktiviert?
let isAnimating = false;         // Läuft gerade eine Animation?
let entering = false;            // Läuft gerade die Flug-Animation?

// Raycasting für Maus-Interaktionen
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * Initialisiert Portal-Interaktionen und Event-Listener
 * @param {THREE.Mesh} portalMesh - Das Portal-Mesh zum Klicken
 * @param {THREE.PerspectiveCamera} camera - Die Szenen-Kamera
 * @param {Object} portalUniforms - Portal-Shader Uniforms
 * @param {Object} bloomPass - Bloom Post-Processing Pass
 */
export function initializePortalInteraction(portalMesh, camera, portalUniforms, bloomPass) {
  console.log('🖱️ Initialisiere Portal-Interaktionen...');
  
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
  
  console.log('🌀 Aktiviere Portal...');
  
  isAnimating = true;
  portalActivated = true;

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
      // Animation beendet - zeige Menü nach Flash-Effekt
      setTimeout(() => {
        showRadialMenu();
        isAnimating = false;
      }, 1000); // Längere Wartezeit damit Flash-Effekt komplett abgeschlossen ist
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
  
  console.log('🚀 Starte Flug durch Portal...');
  
  const startPos = camera.position.clone();          // Startposition merken
  const targetPos = new THREE.Vector3(0, 0, -6);     // Ziel: Durch Portal hindurch
  const duration = 900;                              // Animation dauert 900ms
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
    
    //TUNEL-EFFEKT zwischen 60& und 78% der Animation
    if (progress >=0.6 && progress <0.78) {
      //TunnelProgress wird berrechnet
      const  tunnelProgress = (progress - 0.6) / 0.18; //0.6 (60%) -0.6 =0--> also startet bei null bis 0.18
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

    // FLASH-EFFEKT bei 78% der Animation 
    if (progress >= 0.78 && flashEl && (flashEl.style.opacity === '0' || flashEl.style.opacity === '')) {
      console.log('⚡ Flash wird aktiviert bei Progress:', progress);
      console.log('⚡ Aktuelle Flash-Opacity:', flashEl.style.opacity);
      flashEl.style.transition = 'opacity 120ms ease';
      flashEl.style.opacity = '1';  // Flash wird sichtbar
      console.log('⚡ Flash-Opacity nach Änderung:', flashEl.style.opacity);
    }
    
    // Animation fortsetzen oder beenden
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // Animation beendet - Flash ausblenden und Kamera zurücksetzen
      setTimeout(() => {
        if (flashEl) {
          console.log('🌙 Flash wird ausgeblendet');
          flashEl.style.opacity = '0';  // Flash ausblenden
        }
        camera.position.copy(startPos);  // Kamera zu Startposition zurück
        entering = false;
      }, 50); // Verkürzt von 180ms auf 50ms - schnelles Ausblenden
    }
  }
  
  requestAnimationFrame(animateFrame);
}

// ====================================================================
//                      MENÜ VERWALTUNG
// ====================================================================

/**
 * Zeigt das radiale Menü nach Portal-Aktivierung
 */
function showRadialMenu() {
  console.log('📋 Zeige radiales Menü...');
  
  const radialMenu = document.getElementById('radialMenu');
  if (radialMenu) {
    radialMenu.classList.add('active');
  }
}

/**
 * Versteckt das radiale Menü
 */
export function hideRadialMenu() {
  console.log('❌ Verstecke radiales Menü...');
  
  const radialMenu = document.getElementById('radialMenu');
  if (radialMenu) {
    radialMenu.classList.remove('active');
  }
}

// ====================================================================
//                      MENÜ EVENT-LISTENER
// ====================================================================

/**
 * Initialisiert Event-Listener für das radiale Menü
 */
export function initializeMenuEvents() {
  console.log('🎯 Initialisiere Menü-Events...');
  
  // Navigation zu verschiedenen Sektionen
  document.querySelectorAll('.radial-item').forEach(item => {
    item.addEventListener('click', (event) => {
      const section = item.dataset.section;
      if (section) {
        event.preventDefault();
        console.log(`🧭 Navigation zu Sektion: ${section}`);
        // Hier später Seiten-Navigation implementieren
      }
    });
  });
  
  // Zentraler Hub - Menü schließen
  const radialCenter = document.getElementById('radialCenter');
  if (radialCenter) {
    radialCenter.addEventListener('click', () => {
      hideRadialMenu();
    });
  }
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