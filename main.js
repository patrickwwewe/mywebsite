// ====================================================================
//                      3D PORTFOLIO PORTAL - MAIN MODULE
// ====================================================================
// ZWECK DIESER DATEI:
// Diese Datei ist der "Dirigent eines Orchesters" - sie koordiniert alle
// anderen Module und bringt sie in der richtigen Reihenfolge zusammen,
// um das komplette 3D-Portal zu erstellen.
//
// WAS PASSIERT HIER:
// 1. Alle Module werden importiert (wie Instrumentengruppen im Orchester)
// 2. Initialisierungs-Sequenz startet alle Systeme in der richtigen Reihenfolge
// 3. Render-Schleife läuft kontinuierlich und aktualisiert alle Animationen
// 4. Error-Handling falls etwas schiefgeht
//
// MODULE-ORCHESTRIERUNG:
// • scene.js → Bühne aufbauen (Renderer, Kamera, Szene)
// • portal.js → Hauptdarsteller erstellen (das magische Portal)
// • decorations.js → Bühnenbild hinzufügen (Ringe, Säulen, Partikel)
// • interactions.js → Publikum einbeziehen (Klick-Events, Menü)
// • loading.js → Vorhang-Management (Loading-Screen)
// • camera.js → Kameramann-Arbeit (Bewegungen, Übergänge)
//
// WARUM DIESE STRUKTUR:
// • Trennung der Verantwortlichkeiten (jedes Module hat einen klaren Zweck)
// • Wartbarkeit (Bugs sind in spezifischen Modulen lokalisiert)
// • Skalierbarkeit (neue Features können als neue Module hinzugefügt werden)
// • Teamwork (verschiedene Entwickler können an verschiedenen Modulen arbeiten)
//
// ANALOGIE:
// Diese Datei ist wie der Regisseur eines Films:
// • Koordiniert alle Abteilungen (Kamera, Beleuchtung, Spezialeffekte)
// • Stellt sicher dass alles zur richtigen Zeit passiert
// • Behält den Überblick über das große Ganze
// • Sorgt für einen smooth Ablauf vom Start bis zum Ende
// ====================================================================

// ====================================================================
//                          MODULE IMPORTS
// ====================================================================

// Szenen-Grundlagen
import { 
  initializeScene, 
  setupLighting, 
  setupPostProcessing, 
  setupResizeHandler 
} from './js/modules/scene.js';

// Portal-System  
import { 
  createPortalMaterial, 
  createPortalGeometry, 
  updatePortalAnimation 
} from './js/modules/portal.js';

// Dekorationen
import { 
  createTorusRings, 
  createBackgroundColumns, 
  createParticleSystem, 
  updateDecorations 
} from './js/modules/decorations.js';

// Interaktionen
import { 
  initializePortalInteraction, 
  initializeMenuEvents 
} from './js/modules/interactions.js';

// Loading-System
import { 
  setLoadingProgress, 
  hideLoading, 
  checkAutoHide, 
  enableAutoHide 
} from './js/modules/loading.js';

// Kamera-System
import { 
  updateCameraMovement 
} from './js/modules/camera.js';

// ====================================================================
//                        GLOBALE VARIABLEN
// ====================================================================

let scene, camera, renderer, composer, bloomPass;
let portalMesh, portalUniforms;
let torusGroup, particles;
let startTime;

// ====================================================================
//                      INITIALISIERUNG
// ====================================================================

/**
 * Hauptinitialisierung - erstellt die komplette 3D-Szene
 */
async function initialize() {
  console.log('🚀 Starte 3D-Portal Initialisierung...');
  
  try {
    // ================================================================
    // SCHRITT 1: SZENEN-GRUNDLAGEN
    // ================================================================
    setLoadingProgress(5, 'Erstelle Renderer');
    const sceneData = initializeScene();
    scene = sceneData.scene;
    camera = sceneData.camera;
    renderer = sceneData.renderer;
    
    setLoadingProgress(18, 'Renderer bereit');
    
    // ================================================================
    // SCHRITT 2: BELEUCHTUNG
    // ================================================================
    setupLighting(scene);
    
    // ================================================================
    // SCHRITT 3: POST-PROCESSING (BLOOM)
    // ================================================================
    setLoadingProgress(36, 'Post-Processing geladen');
    const postProcessing = setupPostProcessing(renderer, scene, camera);
    composer = postProcessing.composer;
    bloomPass = postProcessing.bloomPass;
    
    // ================================================================
    // SCHRITT 4: PORTAL ERSTELLEN
    // ================================================================
    setLoadingProgress(64, 'Shader kompiliert');
    const portalData = createPortalMaterial();
    portalUniforms = portalData.portalUniforms;
    
    setLoadingProgress(78, 'Portal erstellt');
    portalMesh = createPortalGeometry(scene, portalData.portalMaterial);
    
    // ================================================================
    // SCHRITT 5: DEKORATIONEN HINZUFÜGEN
    // ================================================================
    setLoadingProgress(88, 'Partikel bereit');
    torusGroup = createTorusRings(scene);
    createBackgroundColumns(scene);
    particles = createParticleSystem(scene);
    
    // ================================================================
    // SCHRITT 6: INTERAKTIONEN EINRICHTEN
    // ================================================================
    initializePortalInteraction(portalMesh, camera, portalUniforms, bloomPass);
    initializeMenuEvents();
    
    // ================================================================
    // SCHRITT 7: EVENT-LISTENER
    // ================================================================
    setupResizeHandler(camera, renderer, composer, portalUniforms);
    
    // ================================================================
    // SCHRITT 8: FINALE KONFIGURATION
    // ================================================================
    configureFinalSettings();
    
    setLoadingProgress(100, 'Fertig — Szene bereit');
    
    // ================================================================
    // SCHRITT 9: RENDER-SCHLEIFE STARTEN
    // ================================================================
    startTime = performance.now();
    enableAutoHide(); // Auto-Hide nach ersten Frames
    animate();
    
    console.log('✅ 3D-Portal erfolgreich initialisiert!');
    
  } catch (error) {
    console.error('❌ Fehler bei Initialisierung:', error);
    setLoadingError('Initialisierung fehlgeschlagen');
  }
}

// ====================================================================
//                      FINALE KONFIGURATION
// ====================================================================

/**
 * Setzt finale Einstellungen für optimale Darstellung
 */
function configureFinalSettings() {
  console.log('⚙️ Konfiguriere finale Einstellungen...');
  
  // Portal-Einstellungen (locked für konsistentes Design)
  portalUniforms.glow.value = 0.3;     // Subtiler Glow
  portalUniforms.speed.value = 1.6;    // Mittlere Geschwindigkeit
  bloomPass.strength = 2.9;            // Starker Bloom-Effekt
  
  // UI-Kontrollen synchronisieren (auch wenn versteckt)
  const glowCtrl = document.getElementById('ctrl-glow');
  const speedCtrl = document.getElementById('ctrl-speed');
  const bloomCtrl = document.getElementById('ctrl-bloom');
  
  if (glowCtrl) glowCtrl.value = portalUniforms.glow.value.toString();
  if (speedCtrl) speedCtrl.value = portalUniforms.speed.value.toString();
  if (bloomCtrl) bloomCtrl.value = bloomPass.strength.toString();
  
  console.log('🎯 Finale Konfiguration abgeschlossen');
}

// ====================================================================
//                        RENDER-SCHLEIFE
// ====================================================================

/**
 * Hauptanimations-Schleife - läuft 60fps
 */
function animate() {
  // Aktuelle Zeit berechnen
  const currentTime = (performance.now() - startTime) * 0.001; // In Sekunden
  
  // ================================================================
  // PORTAL ANIMATIONEN
  // ================================================================
  updatePortalAnimation(portalUniforms, currentTime);
  
  // ================================================================
  // DEKORATIONS ANIMATIONEN  
  // ================================================================
  updateDecorations(torusGroup, particles, currentTime, portalUniforms.speed.value);
  
  // ================================================================
  // KAMERA BEWEGUNGEN
  // ================================================================
  updateCameraMovement(camera, currentTime);
  
  // ================================================================
  // RENDERN
  // ================================================================
  composer.render();
  
  // ================================================================
  // LOADING AUTO-HIDE CHECK
  // ================================================================
  checkAutoHide();
  
  // Nächsten Frame anfordern
  requestAnimationFrame(animate);
}

// ====================================================================
//                          STARTUP
// ====================================================================

// Entwickler-Info in Konsole
console.log(`
🌀 3D Portfolio Portal
━━━━━━━━━━━━━━━━━━━━━━━
✨ Interaktives WebGL-Portal
🎯 Klicke ins Portal für Navigation
🔧 Powered by Three.js

💡 Tipp: Verwende einen lokalen HTTP-Server
   für optimale Performance!
`);

// Initialisierung starten
initialize();