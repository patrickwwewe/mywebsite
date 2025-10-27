// ====================================================================
//                     CHROMATIC ABERRATION MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Erstellt Chromatic Aberration Post-Processing-Effekte für Portal-System!
// RGB-Kanal-Verschiebung, Lens-Distortion und Color-Fringing für intensive
// Sci-Fi-Portal-Effekte die wie Hyperspace-Verzerrungen aussehen!
//
// ABERRATION-EFFEKTE:
// 1. Portal-Activation-Aberration (Beim Klick auf Portal)
// 2. Hyperspace-Aberration (Während Tunnel-Flug)
// 3. Flash-Aberration (Beim weißen Blitz)
// 4. Continuous-Aberration (Leichte Hintergrund-Verzerrung)
//
// TECHNISCHE UMSETZUNG:
// • Custom GLSL Shader: Für RGB-Kanal-Verschiebung
// • Pass-Integration: In Post-Processing-Pipeline
// • Dynamic Intensity: Basierend auf Portal-Events
// • Performance-Optimiert: Minimale GPU-Last
//
// WARUM CHROMATIC ABERRATION:
// • Sci-Fi-Look: Wie in Star Trek/Wars Hyperspace-Szenen
// • Visual Feedback: Verstärkt Portal-Aktivierung
// • Immersion: Gefühl von dimensionaler Verzerrung
// • Cinematic: Professioneller Film-Look
//
// ZUSAMMENHANG MIT ANDEREN MODULEN:
// → scene.js: Integration in Post-Processing-Chain
// → interactions.js: Triggert Aberration bei Portal-Events
// → tunnel.js: Aberration-Intensität während Hyperspace
// → main.js: Update-Loop für dynamische Intensität
// ====================================================================

import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';

// ====================================================================
//                        CHROMATIC ABERRATION SHADER
// ====================================================================

const ChromaticAberrationShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'amount': { value: 0.005 },
    'direction': { value: new THREE.Vector2(1, 0) },
    'center': { value: new THREE.Vector2(0.5, 0.5) }
  },

  vertexShader: `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform vec2 direction;
    uniform vec2 center;
    
    varying vec2 vUv;
    
    void main() {
      vec2 offset = direction * amount;
      vec2 distanceFromCenter = vUv - center;
      float distanceFactor = length(distanceFromCenter);
      
      // Radiale Verzerrung (stärker am Rand)
      vec2 radialOffset = offset * distanceFactor;
      
      // RGB-Kanäle versetzt sampeln
      float r = texture2D(tDiffuse, vUv - radialOffset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + radialOffset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `
};

// ====================================================================
//                        CHROMATIC ABERRATION PASS
// ====================================================================

class ChromaticAberrationPass {
  constructor(amount = 0.005) {
    // Einfache Pass-Implementation ohne Vererbung
    this.material = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(ChromaticAberrationShader.uniforms),
      vertexShader: ChromaticAberrationShader.vertexShader,
      fragmentShader: ChromaticAberrationShader.fragmentShader
    });

    // Einfaches Quad für Fullscreen-Pass
    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    this.amount = amount;
    this.enabled = true;
    this.renderToScreen = false;
    this.clear = true;
  }

  render(renderer, writeBuffer, readBuffer) {
    if (!this.enabled) return;
    
    this.material.uniforms['tDiffuse'].value = readBuffer.texture;
    this.material.uniforms['amount'].value = this.amount;

    // Einfaches Rendering
    const currentRenderTarget = renderer.getRenderTarget();
    
    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
    }
    
    // Fullscreen Quad rendern
    renderer.render(new THREE.Scene().add(this.mesh), new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));
    
    renderer.setRenderTarget(currentRenderTarget);
  }

  setAmount(amount) {
    this.amount = amount;
  }

  setDirection(x, y) {
    this.material.uniforms['direction'].value.set(x, y);
  }

  setCenter(x, y) {
    this.material.uniforms['center'].value.set(x, y);
  }
}

// ====================================================================
//                        ABERRATION SYSTEM
// ====================================================================

// Aberration-State
let chromaticAberrationPass = null;
let composer = null;
let aberrationData = {
  baseAmount: 0.002,
  currentAmount: 0.002,
  targetAmount: 0.002,
  direction: { x: 1, y: 0 },
  center: { x: 0.5, y: 0.5 },
  isAnimating: false
};

// ====================================================================
//                        INITIALISIERUNG
// ====================================================================

/**
 * Initialisiert Chromatic Aberration System
 * @param {EffectComposer} composerRef - Composer-Referenz aus scene.js
 */
export function initializeChromaticAberration(composerRef) {
  composer = composerRef;
  
  // Chromatic Aberration Pass erstellen
  chromaticAberrationPass = new ChromaticAberrationPass(aberrationData.baseAmount);
  
  // Pass zur Composer-Chain hinzufügen (vor dem letzten Pass)
  const passes = composer.passes;
  if (passes.length > 1) {
    // Vor dem letzten Pass einfügen (meist Output-Pass)
    composer.insertPass(chromaticAberrationPass, passes.length - 1);
  } else {
    composer.addPass(chromaticAberrationPass);
  }
  
  console.log('🌈 Chromatic Aberration System initialisiert');
}

// ====================================================================
//                        ABERRATION AKTIVIERUNG
// ====================================================================

/**
 * Startet Portal-Activation-Aberration
 * Kurze, intensive Aberration beim Portal-Klick
 */
export function startPortalActivationAberration() {
  animateAberration({
    targetAmount: 0.02,
    duration: 800,
    direction: { x: 1, y: 0.3 },
    easing: 'impact'
  });
  console.log('🌟 Portal-Activation-Aberration gestartet');
}

/**
 * Startet Hyperspace-Aberration
 * Kontinuierliche Aberration während Tunnel-Flug
 */
export function startHyperspaceAberration() {
  animateAberration({
    targetAmount: 0.015,
    duration: 2500, // Tunnel-Duration
    direction: { x: 0.8, y: 0.2 },
    easing: 'continuous'
  });
  console.log('🚀 Hyperspace-Aberration gestartet');
}

/**
 * Startet Flash-Aberration
 * Sehr kurze, extreme Aberration beim weißen Flash
 */
export function startFlashAberration() {
  animateAberration({
    targetAmount: 0.035,
    duration: 150,
    direction: { x: 1.5, y: 0.5 },
    easing: 'flash'
  });
  console.log('⚡ Flash-Aberration gestartet');
}

/**
 * Setzt kontinuierliche Portal-Aberration
 * Leichte Aberration um Portal herum
 */
export function setPortalAberration(intensity = 0.008) {
  aberrationData.baseAmount = intensity;
  aberrationData.targetAmount = intensity;
  
  if (chromaticAberrationPass) {
    chromaticAberrationPass.setAmount(intensity);
  }
  
  console.log('✨ Portal-Aberration gesetzt:', intensity);
}

// ====================================================================
//                        ABERRATION ANIMATION
// ====================================================================

/**
 * Animiert Chromatic Aberration zu Zielwerten
 * @param {Object} config - Animation-Konfiguration
 */
function animateAberration(config) {
  const startAmount = aberrationData.currentAmount;
  const startDirection = { ...aberrationData.direction };
  
  aberrationData.isAnimating = true;
  aberrationData.targetAmount = config.targetAmount;
  
  const startTime = Date.now();
  const duration = config.duration;
  
  function animate() {
    if (!aberrationData.isAnimating) return;
    
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing basierend auf Typ
    let easedProgress = progress;
    switch (config.easing) {
      case 'impact':
        easedProgress = 1 - Math.pow(1 - progress, 3);
        break;
      case 'continuous':
        easedProgress = 0.5 + Math.sin((progress - 0.5) * Math.PI) * 0.5;
        break;
      case 'flash':
        easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        break;
    }
    
    // Amount interpolieren
    aberrationData.currentAmount = startAmount + (config.targetAmount - startAmount) * easedProgress;
    
    // Direction interpolieren
    if (config.direction) {
      aberrationData.direction.x = startDirection.x + (config.direction.x - startDirection.x) * easedProgress;
      aberrationData.direction.y = startDirection.y + (config.direction.y - startDirection.y) * easedProgress;
    }
    
    // Pass updaten
    if (chromaticAberrationPass) {
      chromaticAberrationPass.setAmount(aberrationData.currentAmount);
      chromaticAberrationPass.setDirection(aberrationData.direction.x, aberrationData.direction.y);
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Animation beendet - zurück zu Base-Amount
      setTimeout(() => {
        returnToBaseAberration();
      }, 100);
    }
  }
  
  animate();
}

/**
 * Kehrt zur Base-Aberration zurück
 */
function returnToBaseAberration() {
  animateAberration({
    targetAmount: aberrationData.baseAmount,
    duration: 1000,
    direction: { x: 1, y: 0 },
    easing: 'continuous'
  });
  
  setTimeout(() => {
    aberrationData.isAnimating = false;
  }, 1000);
}

// ====================================================================
//                        UPDATE-SYSTEM
// ====================================================================

/**
 * Update-Funktion für Chromatic Aberration (wird von main.js aufgerufen)
 * @param {number} deltaTime - Zeit seit letztem Frame
 */
export function updateChromaticAberration(deltaTime) {
  if (!chromaticAberrationPass) return;
  
  // Dynamische Effekte hier hinzufügen wenn nötig
  // z.B. leichte Oszillation der Aberration
  
  const time = Date.now() * 0.001;
  const oscillation = Math.sin(time * 0.5) * 0.001;
  
  if (!aberrationData.isAnimating) {
    const finalAmount = aberrationData.baseAmount + oscillation;
    chromaticAberrationPass.setAmount(finalAmount);
  }
}

// ====================================================================
//                        UTILITY FUNCTIONS
// ====================================================================

/**
 * Stoppt aktuelle Aberration-Animation
 */
export function stopAberration() {
  aberrationData.isAnimating = false;
  
  if (chromaticAberrationPass) {
    chromaticAberrationPass.setAmount(aberrationData.baseAmount);
    chromaticAberrationPass.setDirection(1, 0);
  }
  
  console.log('🛑 Aberration gestoppt');
}

/**
 * Setzt Aberration-Zentrum (für radiale Effekte)
 * @param {number} x - X-Position (0-1)
 * @param {number} y - Y-Position (0-1)
 */
export function setAberrationCenter(x, y) {
  aberrationData.center.x = x;
  aberrationData.center.y = y;
  
  if (chromaticAberrationPass) {
    chromaticAberrationPass.setCenter(x, y);
  }
}

/**
 * Setzt Aberration-Richtung
 * @param {number} x - X-Richtung
 * @param {number} y - Y-Richtung
 */
export function setAberrationDirection(x, y) {
  aberrationData.direction.x = x;
  aberrationData.direction.y = y;
  
  if (chromaticAberrationPass) {
    chromaticAberrationPass.setDirection(x, y);
  }
}

/**
 * Gibt aktuellen Aberration-Status zurück
 */
export function getAberrationStatus() {
  return {
    isActive: aberrationData.isAnimating,
    currentAmount: aberrationData.currentAmount,
    baseAmount: aberrationData.baseAmount
  };
}

// Export der Pass-Klasse für externe Nutzung
export { ChromaticAberrationPass };