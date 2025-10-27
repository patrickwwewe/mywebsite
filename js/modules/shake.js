// ====================================================================
//                          SCREEN SHAKE MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Erstellt ein dynamisches Screen-Shake-System für intensive Portal-Effekte!
// Kamera-Vibrationen, Rotations-Shake und CSS-basierte Bildschirm-Erschütterungen
// für maximale Impact-Wirkung bei Portal-Aktivierung und Hyperspace-Flug!
//
// SHAKE-ARTEN:
// 1. Camera Shake (3D-Kamera Position/Rotation)
// 2. Screen Shake (CSS Transform des Renderers)
// 3. Intensity-Based (Verschiedene Stärken)
// 4. Directional Shake (Richtungsbasiert)
//
// TECHNISCHE UMSETZUNG:
// • THREE.js Camera: Position und Rotation Offsets
// • CSS Transforms: transform: translate() für Renderer
// • Easing Functions: Für smooth Shake-Abklingen
// • Random Vectors: Für natürliche Shake-Bewegung
//
// WARUM MULTI-LAYER SHAKE:
// • Camera Shake: Für 3D-Immersion im Portal
// • Screen Shake: Für UI-Impact beim Flash
// • Kombiniert: Maximale Wirkung ohne Übertreibung
// • Performance: Optimiert für 60fps
//
// ZUSAMMENHANG MIT ANDEREN MODULEN:
// → interactions.js: Triggert Shake bei Portal-Aktivierung
// → tunnel.js: Kontinuierlicher Shake während Hyperspace
// → camera.js: Nutzt Kamera-Referenz für 3D-Shake
// → main.js: Renderer-Referenz für Screen-Shake
// ====================================================================

// Shake-State
let isShaking = false;
let shakeData = {
  intensity: 0,
  duration: 0,
  elapsed: 0,
  originalPosition: null,
  originalRotation: null,
  type: 'both' // 'camera', 'screen', 'both'
};

// Referenzen (werden von main.js gesetzt)
let camera = null;
let renderer = null;
let rendererElement = null;

// ====================================================================
//                        INITIALISIERUNG
// ====================================================================

/**
 * Initialisiert das Shake-System
 * @param {THREE.Camera} cameraRef - Kamera-Referenz
 * @param {THREE.WebGLRenderer} rendererRef - Renderer-Referenz
 */
export function initializeShakeSystem(cameraRef, rendererRef) {
  camera = cameraRef;
  renderer = rendererRef;
  rendererElement = renderer.domElement;
  
  // Original-Position speichern
  if (camera) {
    shakeData.originalPosition = camera.position.clone();
    shakeData.originalRotation = camera.rotation.clone();
  }
  
  console.log('📳 Screen-Shake-System initialisiert');
}

// ====================================================================
//                        SHAKE AKTIVIERUNG
// ====================================================================

/**
 * Startet Portal-Aktivierungs-Shake
 * Kurzer, intensiver Shake beim Portal-Klick
 */
export function startPortalActivationShake() {
  startShake({
    intensity: 0.8,
    duration: 600,
    type: 'both',
    pattern: 'impact'
  });
  console.log('💥 Portal-Aktivierungs-Shake gestartet');
}

/**
 * Startet Hyperspace-Entry-Shake
 * Mittlerer Shake beim Tunnel-Eintritt
 */
export function startHyperspaceEntryShake() {
  startShake({
    intensity: 1.2,
    duration: 800,
    type: 'both',
    pattern: 'acceleration'
  });
  console.log('🚀 Hyperspace-Entry-Shake gestartet');
}

/**
 * Startet kontinuierlichen Hyperspace-Shake
 * Leichter, dauerhafter Shake während Tunnel-Flug
 */
export function startHyperspaceContinuousShake() {
  startShake({
    intensity: 0.4,
    duration: 1800, // Während Tunnel-Dauer
    type: 'camera',
    pattern: 'continuous'
  });
  console.log('🌪️ Hyperspace-Kontinuierlich-Shake gestartet');
}

/**
 * Startet Flash-Impact-Shake
 * Sehr kurzer, scharfer Shake beim weißen Flash
 */
export function startFlashImpactShake() {
  startShake({
    intensity: 1.5,
    duration: 150,
    type: 'screen',
    pattern: 'flash'
  });
  console.log('⚡ Flash-Impact-Shake gestartet');
}

// ====================================================================
//                        SHAKE CORE-SYSTEM
// ====================================================================

/**
 * Startet Shake mit gegebenen Parametern
 * @param {Object} config - Shake-Konfiguration
 */
function startShake(config) {
  // Aktuellen Shake stoppen
  stopShake();
  
  // Neue Shake-Daten
  shakeData = {
    intensity: config.intensity || 1.0,
    duration: config.duration || 500,
    elapsed: 0,
    type: config.type || 'both',
    pattern: config.pattern || 'impact',
    originalPosition: camera ? camera.position.clone() : null,
    originalRotation: camera ? camera.rotation.clone() : null
  };
  
  isShaking = true;
}

/**
 * Stoppt aktuellen Shake und resettet Positionen
 */
export function stopShake() {
  if (!isShaking) return;
  
  isShaking = false;
  
  // Kamera zurücksetzen
  if (camera && shakeData.originalPosition) {
    camera.position.copy(shakeData.originalPosition);
    camera.rotation.copy(shakeData.originalRotation);
  }
  
  // Screen-Shake zurücksetzen
  if (rendererElement) {
    rendererElement.style.transform = '';
  }
  
  console.log('🛑 Shake gestoppt und zurückgesetzt');
}

/**
 * Update-Funktion für Shake (wird von main.js aufgerufen)
 * @param {number} deltaTime - Zeit seit letztem Frame
 */
export function updateShake(deltaTime) {
  if (!isShaking) return;
  
  shakeData.elapsed += deltaTime * 1000; // deltaTime in ms
  
  // Shake beenden wenn Duration erreicht
  if (shakeData.elapsed >= shakeData.duration) {
    stopShake();
    return;
  }
  
  // Progress berechnen (0-1)
  const progress = shakeData.elapsed / shakeData.duration;
  
  // Intensität basierend auf Pattern
  const currentIntensity = calculateIntensity(progress, shakeData.pattern) * shakeData.intensity;
  
  // Shake anwenden
  if (shakeData.type === 'camera' || shakeData.type === 'both') {
    applyCameraShake(currentIntensity);
  }
  
  if (shakeData.type === 'screen' || shakeData.type === 'both') {
    applyScreenShake(currentIntensity);
  }
}

// ====================================================================
//                        SHAKE PATTERNS
// ====================================================================

/**
 * Berechnet Intensität basierend auf Shake-Pattern
 * @param {number} progress - Progress (0-1)
 * @param {string} pattern - Shake-Pattern
 * @returns {number} Intensity-Multiplier
 */
function calculateIntensity(progress, pattern) {
  switch (pattern) {
    case 'impact':
      // Starker Start, schnelles Abklingen
      return Math.pow(1 - progress, 2);
      
    case 'acceleration':
      // Langsamer Start, dann stark, dann Abklingen
      if (progress < 0.3) {
        return progress / 0.3 * 0.5;
      } else if (progress < 0.7) {
        return 0.5 + (progress - 0.3) / 0.4 * 0.5;
      } else {
        return Math.pow(1 - (progress - 0.7) / 0.3, 1.5);
      }
      
    case 'continuous':
      // Konstante leichte Intensität mit kleinen Variationen
      return 0.6 + Math.sin(progress * Math.PI * 8) * 0.4;
      
    case 'flash':
      // Instant maximum, sehr schnelles Abklingen
      return Math.pow(1 - progress, 4);
      
    default:
      return 1 - progress;
  }
}

// ====================================================================
//                        CAMERA SHAKE
// ====================================================================

/**
 * Wendet Shake auf 3D-Kamera an
 * @param {number} intensity - Shake-Intensität
 */
function applyCameraShake(intensity) {
  if (!camera || !shakeData.originalPosition) return;
  
  // Random-Offsets für natürliche Bewegung
  const shakeRange = intensity * 0.5;
  const rotationRange = intensity * 0.02;
  
  // Position-Shake
  const offsetX = (Math.random() - 0.5) * shakeRange;
  const offsetY = (Math.random() - 0.5) * shakeRange;
  const offsetZ = (Math.random() - 0.5) * shakeRange * 0.3; // Weniger Z-Shake
  
  camera.position.x = shakeData.originalPosition.x + offsetX;
  camera.position.y = shakeData.originalPosition.y + offsetY;
  camera.position.z = shakeData.originalPosition.z + offsetZ;
  
  // Rotation-Shake
  const rotOffsetX = (Math.random() - 0.5) * rotationRange;
  const rotOffsetY = (Math.random() - 0.5) * rotationRange;
  const rotOffsetZ = (Math.random() - 0.5) * rotationRange;
  
  camera.rotation.x = shakeData.originalRotation.x + rotOffsetX;
  camera.rotation.y = shakeData.originalRotation.y + rotOffsetY;
  camera.rotation.z = shakeData.originalRotation.z + rotOffsetZ;
}

// ====================================================================
//                        SCREEN SHAKE
// ====================================================================

/**
 * Wendet Shake auf Bildschirm/Renderer an
 * @param {number} intensity - Shake-Intensität
 */
function applyScreenShake(intensity) {
  if (!rendererElement) return;
  
  // Pixel-Shake für Screen-Effect
  const shakePixels = intensity * 8;
  
  const offsetX = (Math.random() - 0.5) * shakePixels;
  const offsetY = (Math.random() - 0.5) * shakePixels;
  
  // CSS Transform anwenden
  rendererElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
}

// ====================================================================
//                        UTILITY FUNCTIONS
// ====================================================================

/**
 * Prüft ob gerade Shake aktiv ist
 * @returns {boolean}
 */
export function isCurrentlyShaking() {
  return isShaking;
}

/**
 * Setzt globale Shake-Intensität
 * @param {number} multiplier - Intensitäts-Multiplier (0-2)
 */
export function setShakeIntensity(multiplier) {
  if (isShaking) {
    shakeData.intensity *= multiplier;
  }
}

/**
 * Erweiterte Shake-Funktion mit custom Parametern
 * @param {number} intensity - Shake-Intensität (0-2)
 * @param {number} duration - Duration in ms
 * @param {string} type - 'camera', 'screen', 'both'
 * @param {string} pattern - Shake-Pattern
 */
export function customShake(intensity, duration, type = 'both', pattern = 'impact') {
  startShake({ intensity, duration, type, pattern });
}