// ====================================================================
//                       PARTICLE EXPLOSION MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Erstellt spektakuläre Partikel-Explosionen für Portal-Effekte!
// Energy-Bursts, Portal-Aktivierungs-Explosionen und Hyperspace-Particles
// für maximale visuelle Impact-Wirkung bei allen Portal-Interaktionen!
//
// EXPLOSION-ARTEN:
// 1. Portal-Activation-Burst (Energie-Ring-Explosion beim Klick)
// 2. Hyperspace-Entry-Explosion (Massive Partikel beim Tunnel-Eintritt)
// 3. Flash-Spark-Explosion (Kleine Funken beim weißen Flash)
// 4. Portal-Energy-Particles (Kontinuierliche Energie um Portal)
//
// TECHNISCHE UMSETZUNG:
// • THREE.js Points: Für Performance bei vielen Partikeln
// • BufferGeometry: Optimierte Vertex-Daten
// • ShaderMaterial: Custom Shaders für Glow-Effekte
// • Velocity-System: Physik-basierte Partikel-Bewegung
//
// WARUM PARTICLE-EXPLOSIONEN:
// • Visuelle Feedback: Macht Portal-Aktivierung spürbar
// • Sci-Fi-Atmosphäre: Energy-Bursts wie in Filmen
// • Performance: Optimiert für Hunderte von Partikeln
// • Kombinierbar: Mit anderen Effekten stackbar
//
// ZUSAMMENHANG MIT ANDEREN MODULEN:
// → interactions.js: Triggert Explosionen bei Portal-Events
// → scene.js: Fügt Particles zur 3D-Szene hinzu
// → portal.js: Energy-Particles um Portal-Geometrie
// → tunnel.js: Entry-Explosion beim Tunnel-Start
// ====================================================================

import * as THREE from 'https://unpkg.com/three@0.152.0/build/three.module.js';

// Particle-System-Container
let particleSystems = [];
let scene = null;

// Shader für Glow-Particles
const particleVertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float alpha;
  
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    vColor = color;
    vAlpha = alpha;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  
  void main() {
    float r = length(gl_PointCoord - vec2(0.5));
    
    if (r > 0.5) discard;
    
    float alpha = (1.0 - r * 2.0) * vAlpha;
    alpha = pow(alpha, 2.0);
    
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ====================================================================
//                        INITIALISIERUNG
// ====================================================================

/**
 * Initialisiert das Particle-Explosion-System
 * @param {THREE.Scene} sceneRef - Scene-Referenz
 */
export function initializeParticleExplosions(sceneRef) {
  scene = sceneRef;
  console.log('💥 Particle-Explosion-System initialisiert');
}

// ====================================================================
//                        PORTAL-ACTIVATION-BURST
// ====================================================================

/**
 * Erstellt Portal-Aktivierungs-Explosion
 * Ring-förmige Energie-Explosion beim Portal-Klick
 */
export function createPortalActivationBurst(portalPosition) {
  const particleCount = 150;
  
  // Geometry und Attribute
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const alphas = new Float32Array(particleCount);
  
  // Ring-förmige Verteilung
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Ring-Position (um Portal)
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.5 + Math.random() * 0.3;
    const height = (Math.random() - 0.5) * 0.2;
    
    // Start-Position
    positions[i3] = portalPosition.x + Math.cos(angle) * radius;
    positions[i3 + 1] = portalPosition.y + height;
    positions[i3 + 2] = portalPosition.z + Math.sin(angle) * radius;
    
    // Velocity (nach außen + nach oben)
    const speed = 3 + Math.random() * 2;
    velocities[i3] = Math.cos(angle) * speed;
    velocities[i3 + 1] = (0.5 + Math.random() * 0.5) * speed;
    velocities[i3 + 2] = Math.sin(angle) * speed;
    
    // Farbe (Cyan-Blau Energy)
    colors[i3] = 0.2 + Math.random() * 0.3; // R
    colors[i3 + 1] = 0.8 + Math.random() * 0.2; // G
    colors[i3 + 2] = 1.0; // B
    
    // Größe und Alpha
    sizes[i] = 15 + Math.random() * 10;
    alphas[i] = 1.0;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  
  // Material
  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  // Points-System
  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  // System-Daten
  const systemData = {
    mesh: particleSystem,
    geometry: geometry,
    life: 0,
    maxLife: 2000, // 2 Sekunden
    type: 'activation_burst'
  };
  
  particleSystems.push(systemData);
  
  console.log('🌟 Portal-Activation-Burst erstellt');
}

// ====================================================================
//                        HYPERSPACE-ENTRY-EXPLOSION
// ====================================================================

/**
 * Erstellt massive Hyperspace-Entry-Explosion
 * Große Partikel-Explosion beim Tunnel-Eintritt
 */
export function createHyperspaceEntryExplosion(portalPosition) {
  const particleCount = 300;
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const alphas = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Sphärische Explosion
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const radius = Math.random() * 0.8;
    
    // Start-Position (Portal-Zentrum)
    positions[i3] = portalPosition.x + Math.sin(phi) * Math.cos(theta) * radius;
    positions[i3 + 1] = portalPosition.y + Math.cos(phi) * radius;
    positions[i3 + 2] = portalPosition.z + Math.sin(phi) * Math.sin(theta) * radius;
    
    // Explosive Velocity
    const speed = 8 + Math.random() * 5;
    velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
    velocities[i3 + 1] = Math.cos(phi) * speed;
    velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    
    // Farbe (Weiß-Blau Energy)
    const colorIntensity = 0.7 + Math.random() * 0.3;
    colors[i3] = colorIntensity;
    colors[i3 + 1] = colorIntensity;
    colors[i3 + 2] = 1.0;
    
    sizes[i] = 20 + Math.random() * 15;
    alphas[i] = 1.0;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  
  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  const systemData = {
    mesh: particleSystem,
    geometry: geometry,
    life: 0,
    maxLife: 1500,
    type: 'hyperspace_entry'
  };
  
  particleSystems.push(systemData);
  
  console.log('🚀 Hyperspace-Entry-Explosion erstellt');
}

// ====================================================================
//                        FLASH-SPARK-EXPLOSION
// ====================================================================

/**
 * Erstellt Flash-Spark-Explosion
 * Kleine, schnelle Funken beim weißen Flash
 */
export function createFlashSparkExplosion(position) {
  const particleCount = 80;
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const alphas = new Float32Array(particleCount);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Zufällige Richtung
    const direction = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
    
    // Start-Position
    positions[i3] = position.x;
    positions[i3 + 1] = position.y;
    positions[i3 + 2] = position.z;
    
    // Schnelle Velocity
    const speed = 12 + Math.random() * 8;
    velocities[i3] = direction.x * speed;
    velocities[i3 + 1] = direction.y * speed;
    velocities[i3 + 2] = direction.z * speed;
    
    // Weiß-Gelbe Sparks
    colors[i3] = 1.0;
    colors[i3 + 1] = 1.0;
    colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    
    sizes[i] = 8 + Math.random() * 5;
    alphas[i] = 1.0;
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  
  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  const systemData = {
    mesh: particleSystem,
    geometry: geometry,
    life: 0,
    maxLife: 400, // Sehr kurz
    type: 'flash_sparks'
  };
  
  particleSystems.push(systemData);
  
  console.log('⚡ Flash-Spark-Explosion erstellt');
}

// ====================================================================
//                        PORTAL-ENERGY-PARTICLES
// ====================================================================

/**
 * Erstellt kontinuierliche Portal-Energy-Particles
 * Schwebende Energie-Partikel um das Portal
 */
export function createPortalEnergyParticles(portalPosition) {
  const particleCount = 100;
  
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const alphas = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount); // Für Animation
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Zufällige Position um Portal
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.5 + Math.random() * 2;
    const height = (Math.random() - 0.5) * 3;
    
    positions[i3] = portalPosition.x + Math.cos(angle) * radius;
    positions[i3 + 1] = portalPosition.y + height;
    positions[i3 + 2] = portalPosition.z + Math.sin(angle) * radius;
    
    // Langsame, schwebende Bewegung
    velocities[i3] = (Math.random() - 0.5) * 0.5;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.3;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    
    // Cyan-Energy-Farben
    colors[i3] = 0.1 + Math.random() * 0.2;
    colors[i3 + 1] = 0.7 + Math.random() * 0.3;
    colors[i3 + 2] = 1.0;
    
    sizes[i] = 5 + Math.random() * 8;
    alphas[i] = 0.3 + Math.random() * 0.4;
    phases[i] = Math.random() * Math.PI * 2; // Für Flimmern
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
  
  const material = new THREE.ShaderMaterial({
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  const particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);
  
  const systemData = {
    mesh: particleSystem,
    geometry: geometry,
    life: 0,
    maxLife: -1, // Endlos
    type: 'portal_energy',
    baseAlphas: [...alphas] // Original-Alphas speichern
  };
  
  particleSystems.push(systemData);
  
  console.log('✨ Portal-Energy-Particles erstellt');
  return systemData; // Für spätere Referenz
}

// ====================================================================
//                        UPDATE-SYSTEM
// ====================================================================

/**
 * Update aller Particle-Systeme (wird von main.js aufgerufen)
 * @param {number} deltaTime - Zeit seit letztem Frame
 */
export function updateParticleExplosions(deltaTime) {
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    const system = particleSystems[i];
    
    if (system.maxLife > 0) {
      system.life += deltaTime * 1000;
      
      // System entfernen wenn Lebensdauer erreicht
      if (system.life >= system.maxLife) {
        scene.remove(system.mesh);
        system.geometry.dispose();
        system.mesh.material.dispose();
        particleSystems.splice(i, 1);
        continue;
      }
    }
    
    // Partikel updaten basierend auf Typ
    updateParticleSystem(system, deltaTime);
  }
}

/**
 * Updatet ein einzelnes Particle-System
 */
function updateParticleSystem(system, deltaTime) {
  const positions = system.geometry.attributes.position.array;
  const velocities = system.geometry.attributes.velocity.array;
  const alphas = system.geometry.attributes.alpha.array;
  const particleCount = positions.length / 3;
  
  const progress = system.maxLife > 0 ? system.life / system.maxLife : 0;
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Position updaten
    positions[i3] += velocities[i3] * deltaTime;
    positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
    positions[i3 + 2] += velocities[i3 + 2] * deltaTime;
    
    // Typ-spezifische Updates
    switch (system.type) {
      case 'activation_burst':
        // Fade-Out mit Gravity
        velocities[i3 + 1] -= 2 * deltaTime; // Gravity
        alphas[i] = Math.max(0, 1 - progress * 1.5);
        break;
        
      case 'hyperspace_entry':
        // Schnelles Fade-Out, keine Gravity
        alphas[i] = Math.max(0, 1 - progress * 2);
        break;
        
      case 'flash_sparks':
        // Sehr schnelles Fade-Out
        alphas[i] = Math.max(0, 1 - progress * 3);
        break;
        
      case 'portal_energy':
        // Kontinuierliches Flimmern
        if (system.baseAlphas) {
          const phase = system.geometry.attributes.phase.array[i];
          const flicker = Math.sin((Date.now() * 0.001 + phase) * 3) * 0.3 + 0.7;
          alphas[i] = system.baseAlphas[i] * flicker;
        }
        break;
    }
  }
  
  // Attribute als dirty markieren
  system.geometry.attributes.position.needsUpdate = true;
  system.geometry.attributes.alpha.needsUpdate = true;
  
  if (system.type === 'activation_burst' || system.type === 'hyperspace_entry') {
    system.geometry.attributes.velocity.needsUpdate = true;
  }
}

// ====================================================================
//                        UTILITY FUNCTIONS
// ====================================================================

/**
 * Entfernt alle aktiven Particle-Systeme
 */
export function clearAllParticleExplosions() {
  for (const system of particleSystems) {
    scene.remove(system.mesh);
    system.geometry.dispose();
    system.mesh.material.dispose();
  }
  particleSystems = [];
  console.log('🧹 Alle Particle-Explosionen entfernt');
}

/**
 * Entfernt spezifische Particle-Systeme nach Typ
 * @param {string} type - Typ der zu entfernenden Systeme
 */
export function removeParticleSystemsByType(type) {
  for (let i = particleSystems.length - 1; i >= 0; i--) {
    const system = particleSystems[i];
    if (system.type === type) {
      scene.remove(system.mesh);
      system.geometry.dispose();
      system.mesh.material.dispose();
      particleSystems.splice(i, 1);
    }
  }
}

/**
 * Gibt Anzahl aktiver Particle-Systeme zurück
 * @returns {number}
 */
export function getActiveParticleSystemCount() {
  return particleSystems.length;
}