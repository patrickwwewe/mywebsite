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

// DEBUG: Portal-Probleme diagnostizieren
let lastClickTime = 0;
let interactionStats = {
  clicks: 0,
  successful: 0,
  failed: 0,
  lastError: null
};

/**
 * 🔧 PORTAL DEBUG-FUNKTION - Diagnose aller möglichen Probleme
 */
function diagnosPortalProblems() {
  console.log('\n🔧 === PORTAL DIAGNOSE GESTARTET ===');
  
  const issues = [];
  
  // 1. Portal-Mesh vorhanden?
  if (!portal) {
    issues.push('❌ Portal-Mesh ist NULL - wurde initializePortalInteraction() aufgerufen?');
  } else {
    console.log('✅ Portal-Mesh gefunden:', portal.constructor.name);
  }
  
  // 2. Kamera vorhanden?
  if (!camera) {
    issues.push('❌ Kamera ist NULL - wurde initializePortalInteraction() aufgerufen?');
  } else {
    console.log('✅ Kamera gefunden:', camera.constructor.name, 'Position:', camera.position);
  }
  
  // 3. Szene vorhanden?
  if (!mainScene) {
    issues.push('❌ MainScene ist NULL - wurde initializePortalInteraction() aufgerufen?');
  } else {
    console.log('✅ MainScene gefunden mit', mainScene.children.length, 'Objekten');
  }
  
  // 4. Portal-Zustand
  console.log('🎯 Portal-Zustand:');
  console.log('   portalActivated:', portalActivated);
  console.log('   isAnimating:', isAnimating);
  console.log('   entering:', entering);
  console.log('   isHovering:', isHovering);
  
  // 5. Interaktions-Statistiken
  console.log('📊 Interaktions-Stats:', interactionStats);
  
  // 6. Kamera-Position überprüfen
  if (camera) {
    const distance = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    if (distance > 100) {
      issues.push(`⚠️ Kamera zu weit weg (${distance.toFixed(1)} Einheiten) - Portal schwer klickbar`);
    } else if (distance < 2) {
      issues.push(`⚠️ Kamera zu nah (${distance.toFixed(1)} Einheiten) - Portal außerhalb Sichtfeld`);
    }
  }
  
  // 7. Tunnel-Status
  if (typeof activateTunnel === 'function') {
    console.log('✅ Tunnel-Funktion verfügbar');
  } else {
    issues.push('❌ Tunnel-Funktion nicht verfügbar');
  }
  
  if (issues.length > 0) {
    console.log('\n🚨 GEFUNDENE PROBLEME:');
    issues.forEach(issue => console.log(issue));
  } else {
    console.log('\n✅ Alle Basis-Komponenten OK!');
  }
  
  console.log('🔧 === DIAGNOSE BEENDET ===\n');
  return issues;
}

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
    const currentTime = performance.now();
    interactionStats.clicks++;
    
    console.log('\n🖱️ === PORTAL-KLICK ERKANNT ===');
    console.log('Zeit seit letztem Klick:', (currentTime - lastClickTime).toFixed(0), 'ms');
    
    // Debugging: Aktueller Zustand
    console.log('Zustand: isAnimating=', isAnimating, 'portalActivated=', portalActivated);
    
    if (isAnimating) {
      console.log('⚠️ Klick ignoriert - Animation läuft bereits');
      interactionStats.failed++;
      interactionStats.lastError = 'Animation läuft bereits';
      return;
    }
    
    // Maus-Koordinaten berechnen
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    console.log('Maus-Position:', mouse.x.toFixed(3), mouse.y.toFixed(3));
    
    // Raycaster konfigurieren
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(portalMesh);
    
    console.log('Raycaster-Treffer:', intersects.length);
    if (intersects.length > 0) {
      console.log('Portal getroffen! Distanz:', intersects[0].distance.toFixed(2));
    }
    
    // Portal getroffen und bereit?
    if (intersects.length > 0 && !portalActivated) {
      console.log('✅ PORTAL AKTIVIERUNG GESTARTET!');
      interactionStats.successful++;
      lastClickTime = currentTime;
      
      activatePortal(camera, portalUniforms, bloomPass);
    } else if (intersects.length === 0) {
      console.log('❌ Portal NICHT getroffen - Klick daneben');
      interactionStats.failed++;
      interactionStats.lastError = 'Portal nicht getroffen';
      diagnosPortalProblems(); // Auto-Diagnose bei Fehlschlag
    } else if (portalActivated) {
      console.log('❌ Portal bereits aktiviert');
      interactionStats.failed++;
      interactionStats.lastError = 'Portal bereits aktiviert';
    }
    
    console.log('🖱️ === KLICK-VERARBEITUNG ENDE ===\n');
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
  
  // Failsafe: Falls Animation hängen bleibt
  setTimeout(() => {
    if (entering) {
      console.log('⚠️ FAILSAFE: Animation timeout - forciere Rückkehr');
      camera.position.copy(startPos);
      camera.fov = 75;
      camera.updateProjectionMatrix();
      entering = false;
      isAnimating = false;
      portalActivated = false;
    }
  }, duration + 2000); // 2 Sekunden nach geplanter Animation
  
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
      console.log('🎬 Hyperspace-Flug BEENDET - starte Rückkehr-Sequenz');
      
      // MINI-BLITZ! ⚡ (Kaum sichtbar!)
      setTimeout(() => {
        if (flashEl) {
          console.log('⚡ MINI-BLITZ weg!');
          flashEl.style.transition = 'opacity 5ms ease'; // EXTREM schnell!
          flashEl.style.opacity = '0';
        }
      }, 1); // Blitz nur 1ms!
      
      // Portal SOFORT zurückbringen ohne extra Animation!
      setTimeout(() => {
        console.log('🔄 Starte sofortige Portal-Rückkehr...');
        
        // ⚡ Tunnel weg, Portal sofort zurück!
        try {
          activateTunnel(false, 1.0, mainScene);
          console.log('✅ Tunnel deaktiviert');
        } catch (e) {
          console.log('⚠️ Tunnel-Deaktivierung fehlgeschlagen:', e);
        }
        
        // Kamera sanft zurück zur Startposition
        console.log('📷 Kamera zurück zur Startposition:', startPos);
        const currentPos = camera.position.clone();
        const returnDuration = 800; // 0.8 Sekunden für Kamera-Rückkehr
        const returnStartTime = performance.now();
        
        function animateCameraReturn(time) {
          const elapsed = time - returnStartTime;
          const progress = Math.min(1, elapsed / returnDuration);
          const eased = 1 - Math.pow(1 - progress, 3);
          
          camera.position.lerpVectors(currentPos, startPos, eased);
          camera.fov = 75; // FOV zurücksetzen
          camera.updateProjectionMatrix();
          
          if (progress < 1) {
            requestAnimationFrame(animateCameraReturn);
          } else {
            console.log('✅ Kamera-Rückkehr abgeschlossen');
            // KEIN Portal-Animation mehr - Portal ist bereits da!
            resetPortalToFullVisibility();
          }
        }
        
        requestAnimationFrame(animateCameraReturn);
        entering = false;
      }, 4); // Portal kommt SOFORT nach micro-Blitz ohne weitere Animation!
    }
  }
  
  requestAnimationFrame(animateFrame);
}

// ====================================================================
//                    PORTAL SOFORT SICHTBAR MACHEN
// ====================================================================

/**
 * Setzt das Portal sofort auf vollständige Sichtbarkeit ohne Animation
 */
function resetPortalToFullVisibility() {
  console.log('🌟 Setze Portal sofort auf volle Sichtbarkeit...');
  
  // Finde das Portal-Mesh in der Szene - ROBUSTERE SUCHE!
  let portalMesh = null;
  
  // Mehrere Suchstrategien
  portalMesh = mainScene.children.find(child => 
    child.type === 'Mesh' && 
    child.geometry && 
    child.geometry.type === 'PlaneGeometry' &&
    child.renderOrder === 1000
  );
  
  // Alternative Suche falls erste nicht funktioniert
  if (!portalMesh) {
    portalMesh = mainScene.children.find(child => 
      child.type === 'Mesh' && 
      child.material && 
      child.material.type === 'ShaderMaterial'
    );
  }
  
  // Letzte Option: Erstes Mesh mit PlaneGeometry
  if (!portalMesh) {
    portalMesh = mainScene.children.find(child => 
      child.type === 'Mesh' && child.geometry && child.geometry.type === 'PlaneGeometry'
    );
  }
  
  if (!portalMesh) {
    console.log('❌ Portal-Mesh nicht gefunden - alle Suchstrategien fehlgeschlagen');
    console.log('🔍 Verfügbare Scene-Children:', mainScene.children.map(c => ({type: c.type, geometry: c.geometry?.type})));
    return;
  }
  
  console.log('✅ Portal-Mesh gefunden:', portalMesh);
  
  // Portal SOFORT auf normale Größe und Sichtbarkeit setzen
  portalMesh.scale.set(1, 1, 1);
  portalMesh.rotation.z = 0;
  
  // Portal VOLLSTÄNDIG SICHTBAR machen (ohne Animation)
  if (portalMesh.material.uniforms && portalMesh.material.uniforms.opacity) {
    portalMesh.material.uniforms.opacity.value = 1; // Shader Uniform - HAUPTWEG!
    console.log('✅ Portal sofort vollständig sichtbar via Shader Uniform');
  } else if (portalMesh.material.opacity !== undefined) {
    portalMesh.material.opacity = 1; // Fallback
  }
  portalMesh.material.transparent = true; // Blending aktiviert lassen
  
  console.log('✅ Portal sofort komplett sichtbar - keine Animation!');
  
  //Menü mit Icons
  showPortalMenu();

  // WICHTIG: System für neue Interaktion zurücksetzen
  setTimeout(() => {
    console.log('🔄 System für neue Interaktion bereit');
    isAnimating = false;
    portalActivated = false;
    entering = false;
  }, 200); // Kurzer Puffer
}

// ====================================================================
//                             MENÜ
// ====================================================================

/**
 * Erstellt ein rundes Menü mit 4 Icons nach Portal-Öffnung
 * Responsive Design für optimale Mobile-Erfahrung
 */
function createPortalMenu() {
  console.log('🎯 Portal-Menü wird erstellt...');
  
  // Bildschirm-Dimensionen analysieren
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const aspectRatio = screenWidth / screenHeight;
  const isMobile = screenWidth < 768;
  const isPortrait = aspectRatio < 1;
  const isNarrowPortrait = aspectRatio < 0.6; // Sehr schmale Hochformat-Handys
  
  console.log(`📱 Screen: ${screenWidth}x${screenHeight}, Ratio: ${aspectRatio.toFixed(2)}, Mobile: ${isMobile}, Portrait: ${isPortrait}, Narrow: ${isNarrowPortrait}`);
  
  // Intelligente Größenberechnung mit Mindestabstand zum Portal
  let containerSize;
  let itemSize;
  let itemOffset;
  let fontSize;
  let textSize;
  
  if (isNarrowPortrait) {
    // Sehr schmale Handys: Etwas kleiner aber nicht dramatisch
    const vmin = Math.min(screenWidth, screenHeight);
    containerSize = vmin * 0.35;
    itemSize = vmin * 0.08;
    itemOffset = vmin * 0.12;
    fontSize = Math.max(vmin * 0.03, 16);
    textSize = Math.max(vmin * 0.012, 9);
  } else if (isMobile) {
    // Mobile: Näher am Original vmin-Ansatz
    const vmin = Math.min(screenWidth, screenHeight);
    containerSize = vmin * 0.4;
    itemSize = Math.max(vmin * 0.09, 45); // Mindestens 45px für Touch
    itemOffset = vmin * 0.13;
    fontSize = Math.max(vmin * 0.032, 14);
    textSize = Math.max(vmin * 0.013, 8);
  } else {
    // Desktop: Berücksichtigt Portal-Breite bei schmalen Fenstern
    const vmin = Math.min(screenWidth, screenHeight);
    const aspectRatio = screenWidth / screenHeight;
    
    // Portal-Größe berechnen (2.5 Einheiten * Skalierung)
    const portalSize = 2.5;
    const portalPixelSize = vmin * 0.25; // Ungefähre Portal-Größe in Pixeln
    
    // Bei schmalen Fenstern wird Portal breiter durch Aspect-Ratio-Korrektur
    const portalEffectiveWidth = aspectRatio < 1.0 ? portalPixelSize / aspectRatio : portalPixelSize;
    
    // Container-Größe basierend auf Portal + notwendigem Abstand
    const safeDistance = portalEffectiveWidth * 0.6; // 60% der Portal-Breite als Sicherheitsabstand
    const baseContainerSize = vmin * 0.3;
    const minContainerSize = portalEffectiveWidth + safeDistance * 2; // Portal + Abstand auf beiden Seiten
    
    containerSize = Math.max(baseContainerSize, minContainerSize);
    
    // Items und Offset proportional zur Container-Größe
    const scale = containerSize / baseContainerSize;
    itemSize = vmin * 0.07 * Math.min(scale, 1.5);
    itemOffset = containerSize * 0.33; // 33% der Container-Größe für konstanten relativen Abstand
    fontSize = Math.max(vmin * 0.022, 16);
    textSize = Math.max(vmin * 0.01, 8);
  }
  
  console.log(`🎯 Berechnete Größen: Container: ${containerSize}px, Item: ${itemSize}px, Offset: ${itemOffset}px`);
  
  // Menü-Container erstellen
  const menuContainer = document.createElement('div');
  menuContainer.id = 'portal-menu';
  menuContainer.className = 'portal-menu-container';
  
  // CSS-Styling mit berechneten Pixelwerten für bessere Kontrolle
  menuContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: ${containerSize}px;
    height: ${containerSize}px;
    z-index: 1000;
    opacity: 0;
    transition: all 0.8s ease;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // 4 Menüpunkte definieren - Positionen als Faktoren (werden mit itemOffset multipliziert)
  const menuItems = [
    { icon: '🚀', text: 'Play', x: -1, y: -0.67, id: 'play' },       // Top Left
    { icon: '👨‍💻', text: 'Über mich', x: 1, y: -0.67, id: 'überMich' }, // Top Right
    { icon: '📋', text: 'Impressum', x: 1, y: 0.67, id: 'impressum' }, // Bottom Right
    { icon: '🔐', text: 'Anmelden', x: -1, y: 0.67, id: 'andmelden' } // Bottom Left
  ]
  
  // Menüpunkte erstellen
  menuItems.forEach((item, index) => {
    const menuItem = document.createElement('div');
    menuItem.className = `menu-item menu-item-${item.id}`;
    
    // Berechnete Positionen
    const xPos = containerSize / 2 + (item.x * itemOffset) - itemSize / 2;
    const yPos = containerSize / 2 + (item.y * itemOffset) - itemSize / 2;
    
    menuItem.style.cssText = `
      position: absolute;
      width: ${itemSize}px;
      height: ${itemSize}px;
      border-radius: 50%;
      background: rgba(0, 255, 255, 0.2);
      border: 2px solid rgba(0, 255, 255, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.4s ease;
      backdrop-filter: blur(5px);
      left: ${xPos}px;
      top: ${yPos}px;
      opacity: 0;
      box-shadow: 0 0 ${itemSize * 0.15}px rgba(0, 255, 255, 0.2);
    `;
    
    // Icon
    const iconElement = document.createElement('div');
    iconElement.style.cssText = `
      font-size: ${fontSize}px;
      margin-bottom: 2px;
      filter: drop-shadow(0 0 ${fontSize * 0.2}px rgba(0, 255, 255, 0.5));
    `;
    iconElement.textContent = item.icon;
    
    // Text
    const textElement = document.createElement('div');
    textElement.style.cssText = `
      font-size: ${textSize}px;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
      font-weight: bold;
      text-shadow: 0 0 ${textSize * 0.3}px rgba(0, 255, 255, 0.3);
      font-family: 'Orbitron', monospace;
      line-height: 1;
    `;
    textElement.textContent = item.text;
    
    // Hover-Effekte (responsive mit berechneten Werten)
    menuItem.addEventListener('mouseenter', () => {
      menuItem.style.transform = 'scale(1.15)';
      menuItem.style.boxShadow = `0 0 ${itemSize * 0.3}px rgba(0, 255, 255, 0.6), 0 0 ${itemSize * 0.5}px rgba(0, 255, 255, 0.3)`;
      menuItem.style.background = 'rgba(0, 255, 255, 0.3)';
      menuItem.style.borderColor = 'rgba(0, 255, 255, 0.8)';
    });
    
    menuItem.addEventListener('mouseleave', () => {
      menuItem.style.transform = 'scale(1)';
      menuItem.style.boxShadow = `0 0 ${itemSize * 0.15}px rgba(0, 255, 255, 0.2)`;
      menuItem.style.background = 'rgba(0, 255, 255, 0.2)';
      menuItem.style.borderColor = 'rgba(0, 255, 255, 0.5)';
    });
    
    // Click-Handler
    menuItem.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 Menüpunkt "${item.text}" geklickt!`);
      handleMenuClick(item.id, item.text);
    });
    
    menuItem.appendChild(iconElement);
    menuItem.appendChild(textElement);
    menuContainer.appendChild(menuItem);
  });
  
  // Fade-in Animation für alle Items
  menuItems.forEach((item, index) => {
    const menuItem = menuContainer.querySelector(`.menu-item-${item.id}`);
    if (menuItem) {
      setTimeout(() => {
        menuItem.style.opacity = '1';
        console.log(`✨ Item ${item.text} wird sichtbar`);
      }, index * 150); // 150ms Verzögerung pro Item
    }
  });
  
  // Menü zu DOM hinzufügen
  document.body.appendChild(menuContainer);
  
  console.log('✅ Portal-Menü mit 4 Punkten erstellt');
  return menuContainer;
}

/**
 * Zeigt das Portal-Menü an
 */
function showPortalMenu() {
  console.log('🎯 showPortalMenu aufgerufen');
  
  // Altes Menü komplett entfernen falls vorhanden
  const oldMenu = document.getElementById('portal-menu');
  if (oldMenu) {
    console.log('🗑️ Entferne altes Menü');
    oldMenu.remove();
  }
  
  // Neues Menü erstellen
  const menu = createPortalMenu();
  console.log('✅ Neues Menü erstellt:', menu);
  
  // Menü sofort sichtbar machen (ohne setTimeout für Test)
  menu.style.opacity = '1';
  menu.style.pointerEvents = 'all';
  console.log('✨ Portal-Menü angezeigt!');
  
  // Debug: Alle Menü-Items prüfen
  const menuItems = menu.querySelectorAll('.menu-item');
  console.log('🔍 Gefundene Menü-Items:', menuItems.length);
  menuItems.forEach((item, index) => {
    console.log(`  Item ${index}:`, item.className, 'Transform:', item.style.transform);
  });
}

/**
 * Verarbeitet Menü-Klicks
 */
function handleMenuClick(itemId, itemText) {
  console.log(`🎯 Menü-Aktion für "${itemText}" (ID: ${itemId})`);
  
  // Klick-Effekt
  const clickedItem = document.querySelector(`.menu-item-${itemId}`);
  if (clickedItem) {
    clickedItem.style.transform = clickedItem.style.transform + ' scale(0.9)';
    setTimeout(() => {
      clickedItem.style.transform = clickedItem.style.transform.replace(' scale(0.9)', '');
    }, 150);
  }
  
  // Navigation basierend auf Menüpunkt
  switch(itemId) {
    case 'play':
      console.log('🚀 Navigiere zu Play-Sektion...');
       window.open('pages/play/01_index.html', '_blank');
      break;
      break;
      
    case 'überMich':
      console.log('👨‍💻 Navigiere zu Über mich-Sektion...');
      // TODO: Navigation zu Über mich implementieren
      break;
      
    case 'impressum':
      console.log('📋 Navigiere zu Impressum-Sektion...');
      window.open('pages/impressum.html', '_blank');
      break;
      
    case 'andmelden':
      console.log('� Navigiere zu Anmelden-Sektion...');
      // TODO: Navigation zu Anmelden implementieren
      break;
      
    default:
      console.log('❓ Unbekannter Menüpunkt:', itemId);
  }
}

/**
 * Versteckt das Portal-Menü
 */
function hidePortalMenu() {
  const menu = document.getElementById('portal-menu');
  if (menu) {
    menu.style.opacity = '0';
    menu.style.pointerEvents = 'none';
    setTimeout(() => {
      menu.remove();
      console.log('🔸 Portal-Menü entfernt');
    }, 800);
  }
}

/**
 * Aktualisiert das Portal-Menü bei Viewport-Änderungen
 */
function refreshPortalMenuOnResize() {
  const menu = document.getElementById('portal-menu');
  if (menu) {
    console.log('🔄 Portal-Menü bei Resize aktualisieren');
    // Menü ist sichtbar, also neu erstellen mit neuen Dimensionen
    showPortalMenu();
  }
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

/**
 * 🔧 DEBUG: Portal-Zustand zurücksetzen (Notfall-Funktion)
 */
window.resetPortalState = function() {
  console.log('🔧 NOTFALL-RESET: Portal-Zustand zurücksetzen');
  isAnimating = false;
  portalActivated = false;
  entering = false;
  isHovering = false;
  
  interactionStats = {
    clicks: 0,
    successful: 0,
    failed: 0,
    lastError: null
  };
  
  console.log('✅ Portal-Zustand zurückgesetzt - bereit für neue Interaktionen');
};

/**
 * 🔧 DEBUG: Portal-Diagnose manuell starten
 */
window.diagnosPortal = diagnosPortalProblems;

// Export für Resize-Funktionalität
export { refreshPortalMenuOnResize };