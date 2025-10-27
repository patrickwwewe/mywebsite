// ====================================================================
//                        KAMERA SYSTEM MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Diese Datei macht die Kamera "lebendig"! Statt einer statischen,
// langweiligen Kamera bewegt sie sich subtil und natürlich, als würde
// sie atmen oder leicht schweben.
//
// WARUM KAMERA-BEWEGUNGEN:
// • Statische Kameras wirken "tot" und uninteressant
// • Subtile Bewegungen erzeugen Immersion und Leben
// • Parallax-Effekte geben Tiefengefühl
// • Smooth Übergänge für professionelle Cinematik
//
// ARTEN VON BEWEGUNGEN:
// • Parallax: Sehr subtile hin-und-her Bewegung (wie Atmen)
// • Presets: Vordefinierte Kamera-Positionen für verschiedene Ansichten
// • Orbit: Kreisförmige Bewegung um einen Mittelpunkt
// • Animated Transitions: Smooth Übergang zwischen Positionen
//
// MATHEMATIK DAHINTER:
// • Sinus/Cosinus Funktionen für natürliche, wellenförmige Bewegungen
// • Lerp (Linear Interpolation) für smooth Übergänge
// • Easing Functions für natürliche Beschleunigung/Verzögerung
//
// PERFORMANCE-OPTIMIERUNG:
// • Bewegungen sind sehr subtil (< 0.2 Einheiten)
// • Nur bei Bedarf aktiviert (nicht permanent)
// • requestAnimationFrame für 60fps ohne CPU-Last
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Ruft updateCameraMovement() in der Render-Schleife auf
// → scene.js: Verwendet die dort erstellte Kamera
// → interactions.js: Könnte Kamera-Presets für Portal-Übergänge nutzen
//
// BENUTZER-ERFAHRUNG:
// • Unmerklich aber spürbar - Benutzer merken es nicht bewusst
// • Erweckt die Szene zum Leben
// • Professioneller, cinematischer Look
// • Nie störend oder ablenkend
//
// ANALOGIE:
// Die Kamera-Bewegungen sind wie der Herzschlag einer schlafenden Person:
// • Kaum sichtbar, aber lebendig
// • Rhythmisch und beruhigend  
// • Zeigt dass "Leben" in der Szene ist
// ====================================================================

import * as THREE from 'three';

// ====================================================================
//                      KAMERA KONFIGURATION
// ====================================================================

// Kamera-Bewegungs-Parameter
const CAMERA_CONFIG = {
  // Parallax-Bewegung (subtile Schwankung)
  parallax: {
    amplitude: {
      x: 0.12,    // Horizontale Schwankung
      y: 0.08     // Vertikale Schwankung
    },
    speed: {
      x: 0.2,     // Geschwindigkeit horizontal
      y: 0.12     // Geschwindigkeit vertikal
    }
  }
};

// ====================================================================
//                      KAMERA ANIMATIONEN
// ====================================================================

/**
 * Aktualisiert subtile Kamera-Bewegungen für lebendige Szene
 * @param {THREE.PerspectiveCamera} camera - Die zu animierende Kamera
 * @param {number} time - Aktuelle Zeit in Sekunden
 */
export function updateCameraMovement(camera, time) {
  // Subtile Parallax-Bewegung mit Sinus-Wellen
  // Erzeugt natürliche, atmende Bewegung
  camera.position.x = Math.sin(time * CAMERA_CONFIG.parallax.speed.x) * CAMERA_CONFIG.parallax.amplitude.x;
  camera.position.y = Math.sin(time * CAMERA_CONFIG.parallax.speed.y) * CAMERA_CONFIG.parallax.amplitude.y;
  
  // Immer zum Portal-Zentrum schauen
  camera.lookAt(0, 0, 0);
}

// ====================================================================
//                      KAMERA ÜBERGÄNGE
// ====================================================================

/**
 * Animiert Kamera zu neuer Position mit smooth Übergang
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @param {THREE.Vector3} targetPosition - Ziel-Position
 * @param {THREE.Vector3} targetLookAt - Ziel-Blickrichtung
 * @param {number} duration - Dauer in Millisekunden
 * @param {Function} [onComplete] - Callback nach Abschluss
 */
export function animateCameraTo(camera, targetPosition, targetLookAt, duration, onComplete) {
  const startPosition = camera.position.clone();
  const startTime = performance.now();
  
  console.log('📷 Animiere Kamera zu neuer Position...');
  
  function animateFrame(time) {
    const elapsed = time - startTime;
    const progress = Math.min(1, elapsed / duration);
    
    // Smooth Easing (Ease-Out)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Position interpolieren
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    
    // Blickrichtung anpassen
    if (targetLookAt) {
      camera.lookAt(targetLookAt);
    }
    
    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else if (onComplete) {
      onComplete();
    }
  }
  
  requestAnimationFrame(animateFrame);
}

// ====================================================================
//                      KAMERA PRESETS
// ====================================================================

/**
 * Vordefinierte Kamera-Positionen für verschiedene Szenen
 */
export const CAMERA_PRESETS = {
  // Standard-Position vor dem Portal
  default: {
    position: new THREE.Vector3(0, 0, 6),
    lookAt: new THREE.Vector3(0, 0, 0)
  },
  
  // Näher am Portal (für Details)
  close: {
    position: new THREE.Vector3(0, 0, 3),
    lookAt: new THREE.Vector3(0, 0, 0)
  },
  
  // Weiter entfernt (Übersicht)
  wide: {
    position: new THREE.Vector3(0, 2, 8),
    lookAt: new THREE.Vector3(0, 0, 0)
  },
  
  // Seitliche Ansicht
  side: {
    position: new THREE.Vector3(5, 1, 3),
    lookAt: new THREE.Vector3(0, 0, 0)
  }
};

/**
 * Setzt Kamera zu vordefiniertem Preset
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @param {string} presetName - Name des Presets
 * @param {boolean} [animated=true] - Animiert oder sofort
 * @param {number} [duration=1000] - Animations-Dauer
 */
export function setCameraPreset(camera, presetName, animated = true, duration = 1000) {
  const preset = CAMERA_PRESETS[presetName];
  
  if (!preset) {
    console.warn(`⚠️ Kamera-Preset '${presetName}' nicht gefunden!`);
    return;
  }
  
  console.log(`📷 Setze Kamera-Preset: ${presetName}`);
  
  if (animated) {
    animateCameraTo(camera, preset.position, preset.lookAt, duration);
  } else {
    camera.position.copy(preset.position);
    camera.lookAt(preset.lookAt);
  }
}

// ====================================================================
//                      KAMERA UTILITIES
// ====================================================================

/**
 * Berechnet ideale Kamera-Position um Objekt zu betrachten
 * @param {THREE.Box3} boundingBox - Bounding Box des Objekts
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @returns {THREE.Vector3} Empfohlene Kamera-Position
 */
export function calculateOptimalCameraPosition(boundingBox, camera) {
  const size = boundingBox.getSize(new THREE.Vector3());
  const center = boundingBox.getCenter(new THREE.Vector3());
  
  // Maximale Dimension des Objekts
  const maxDim = Math.max(size.x, size.y, size.z);
  
  // Berechne Entfernung basierend auf FOV
  const fov = camera.fov * (Math.PI / 180);
  const distance = maxDim / (2 * Math.tan(fov / 2));
  
  return new THREE.Vector3(center.x, center.y, center.z + distance * 1.5);
}

/**
 * Überprüft ob Kamera sich in Bewegung befindet
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @param {THREE.Vector3} lastPosition - Letzte bekannte Position
 * @param {number} [threshold=0.001] - Bewegungs-Schwellwert
 * @returns {boolean} True wenn Kamera sich bewegt
 */
export function isCameraMoving(camera, lastPosition, threshold = 0.001) {
  return camera.position.distanceTo(lastPosition) > threshold;
}

/**
 * Erstellt Orbit-Kamera-Bewegung um einen Punkt
 * @param {THREE.PerspectiveCamera} camera - Die Kamera
 * @param {THREE.Vector3} center - Zentrum der Rotation
 * @param {number} radius - Radius der Orbit-Bewegung
 * @param {number} time - Aktuelle Zeit
 * @param {number} speed - Rotations-Geschwindigkeit
 */
export function updateOrbitMovement(camera, center, radius, time, speed) {
  const angle = time * speed;
  
  camera.position.x = center.x + Math.cos(angle) * radius;
  camera.position.z = center.z + Math.sin(angle) * radius;
  camera.lookAt(center);
}