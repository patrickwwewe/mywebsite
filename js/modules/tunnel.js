// ====================================================================
//                           TUNNEL MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Erstellt einen spektakulären 3D-Tunnel für Portal-Durchflüge im
// Star Wars Hyperspace-Stil! Kombiniert leuchtende Röhren mit
// wirbelnden Partikeln für maximalen cinematischen Effekt.
//
// TUNNEL-KOMPONENTEN:
// 1. Leuchtende Tunnel-Röhre (Tron-Style mit Glow)
// 2. Wirbelnde Partikel-Streams (Hyperspace-Effekt)
// 3. Pulsende Energie-Ringe (ohne Wireframe)
// 4. Dynamische Farbwechsel (sync mit Portal)
//
// TECHNISCHE UMSETZUNG:
// • CylinderGeometry: Für die Haupt-Tunnel-Röhre
// • PointsMaterial: Für Partikel-Effekte
// • ShaderMaterial: Für Glow und Energie-Effekte
// • Animation Loop: Partikel bewegen sich durch den Tunnel
//
// STAR WARS INSPIRATION:
// • Millennium Falcon Hyperspace-Sprung
// • Lichtgeschwindigkeits-Streifen
// • Blaue/Weiße Energie-Ströme
// • Wirbelnde Partikel-Trails
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Importiert createTunnel() beim Start
// → interactions.js: Aktiviert Tunnel bei Portal-Durchflug
// → portal.js: Tunnel-Farben sync mit Portal-Farben
// → scene.js: Tunnel wird zur Hauptszene hinzugefügt
// ====================================================================

import * as THREE from 'three';

// Tunnel-Objekte für Export
let tunnelGroup = null;
let tunnelParticles = null;
let tunnelTube = null;
let energyRings = [];

// Animation-Variablen
let tunnelActive = false;
let animationSpeed = 1.0;

// ====================================================================
//                        TUNNEL ERSTELLUNG
// ====================================================================

/**
 * Erstellt den kompletten Star Wars Hyperspace-Tunnel
 * @param {THREE.Scene} scene - Die Hauptszene
 * @returns {THREE.Group} - Tunnel-Gruppe für Animationen
 */
export function createTunnel(scene) {
  console.log('🌪️ Erstelle Star Wars Hyperspace-Tunnel...');
  
  // Haupt-Tunnel-Gruppe
  tunnelGroup = new THREE.Group();
  tunnelGroup.name = 'HyperspaceTunnel';
  
  // 1. LEUCHTENDE TUNNEL-RÖHRE (Tron-Style)
  createTunnelTube();
  
  // 2. WIRBELNDE PARTIKEL-STREAMS (Hyperspace)
  createParticleStreams();
  
  // 3. ENERGIE-RINGE (Pulsierend)
  createEnergyRings();
  
  // Tunnel zur Szene hinzufügen
  scene.add(tunnelGroup);
  
  // Initial unsichtbar - wird bei Portal-Aktivierung gezeigt
  tunnelGroup.visible = false;
  
  console.log('✨ Hyperspace-Tunnel bereit für Aktivierung!');
  return tunnelGroup;
}

// ====================================================================
//                      TUNNEL-RÖHRE (TRON-STYLE)
// ====================================================================

/**
 * Erstellt die leuchtende Haupt-Tunnel-Röhre
 */
function createTunnelTube() {
  console.log('💫 Erstelle leuchtende Tunnel-Röhre...');
  
  // Zylinder-Geometrie für den Tunnel
  const tubeGeometry = new THREE.CylinderGeometry(
    8,    // Radius oben
    8,    // Radius unten  
    50,   // Höhe (Länge des Tunnels)
    32,   // Radial-Segmente
    1,    // Höhen-Segmente
    true  // Open ended (beide Enden offen)
  );
  
  // Glow-Material für Tron-Effekt
  const tubeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aaff,        // Cyan-Blau
    transparent: true,
    opacity: 0.3,           // Durchscheinend
    side: THREE.BackSide,   // Von innen sichtbar
    blending: THREE.AdditiveBlending  // Glow-Effekt
  });
  
  tunnelTube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  
  // Tunnel richtig ausrichten - KEIN rotate! Zylinder liegt schon richtig (vertikal = Z-Achse)
  // tunnelTube.rotation.z = Math.PI / 2; // ← Das war das Problem!
  tunnelTube.rotation.x = Math.PI / 2; // Zylinder zeigt in Z-Richtung (Kamera-Flugrichtung)
  tunnelTube.position.z = -10; // Näher zum Portal, damit Kamera durchfliegt
  
  tunnelGroup.add(tunnelTube);
  console.log('🔵 Tunnel-Röhre erstellt');
}

// ====================================================================
//                    PARTIKEL-STREAMS (HYPERSPACE)
// ====================================================================

/**
 * Erstellt wirbelnde Partikel-Streams wie im Hyperspace
 */
function createParticleStreams() {
  console.log('✨ Erstelle Hyperspace-Partikel...');
  
  const particleCount = 2000; // Viele Partikel für dichten Effekt
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  
  // Partikel in Spiralen um den Tunnel verteilen
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Spiral-Position um Kamera-Flugbahn (Z-Achse)
    const angle = (i / particleCount) * Math.PI * 12; // Mehrere Spiralen
    const radius = 2 + Math.random() * 4; // Radius kleiner (Kamera fliegt durch!)
    const z = 5 - Math.random() * 30; // Von Z=5 bis Z=-25 (Kamera-Route!)
    
    positions[i3] = Math.cos(angle) * radius;     // X
    positions[i3 + 1] = Math.sin(angle) * radius; // Y  
    positions[i3 + 2] = z;                        // Z - entlang Kamera-Route!
    
    // Geschwindigkeit für Bewegung durch Tunnel
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0.5 + Math.random() * 0.5; // Z-Geschwindigkeit
    
    // Hyperspace-Farben (Blau-Weiß-Cyan)
    const colorChoice = Math.random();
    if (colorChoice < 0.4) {
      // Cyan
      colors[i3] = 0;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1;
    } else if (colorChoice < 0.7) {
      // Weiß
      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    } else {
      // Blau
      colors[i3] = 0.2;
      colors[i3 + 1] = 0.4;
      colors[i3 + 2] = 1;
    }
  }
  
  // Partikel-Geometrie
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Partikel-Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 0.8,
    transparent: true,
    opacity: 0.8,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false
  });
  
  tunnelParticles = new THREE.Points(particleGeometry, particleMaterial);
  tunnelParticles.userData = { velocities }; // Geschwindigkeiten speichern
  
  tunnelGroup.add(tunnelParticles);
  console.log('💫 Hyperspace-Partikel erstellt');
}

// ====================================================================
//                      ENERGIE-RINGE (PULSIEREND)
// ====================================================================

/**
 * Erstellt pulsierende Energie-Ringe entlang des Tunnels
 */
function createEnergyRings() {
  console.log('⚡ Erstelle Energie-Ringe...');
  
  energyRings = [];
  const ringCount = 20; // Anzahl Ringe
  
  for (let i = 0; i < ringCount; i++) {
    // Ring-Geometrie
    const ringGeometry = new THREE.RingGeometry(6, 7, 32);
    
    // Energie-Material
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffaa,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Ringe entlang Kamera-Flugbahn verteilen (von 0 bis -20)
    ring.position.z = 5 - (i / ringCount) * 25; // Von Z=5 bis Z=-20 
    // ring.rotation.y = Math.PI / 2; // ← Weg damit! Ringe bleiben flach (XY-Ebene)
    
    // Pulsier-Animation vorbereiten
    ring.userData = {
      originalScale: 1,
      pulsePhase: (i / ringCount) * Math.PI * 2
    };
    
    energyRings.push(ring);
    tunnelGroup.add(ring);
  }
  
  console.log('🔮 Energie-Ringe erstellt');
}

// ====================================================================
//                        TUNNEL AKTIVIERUNG
// ====================================================================

/**
 * Aktiviert den Tunnel für Portal-Durchflug
 * @param {boolean} active - Tunnel aktiv/inaktiv
 * @param {number} speed - Animations-Geschwindigkeit (default: 1.0)
 */
export function activateTunnel(active, speed = 1.0) {
  tunnelActive = active;
  animationSpeed = speed;
  
  if (tunnelGroup) {
    tunnelGroup.visible = active;
    console.log(active ? '🌪️ Hyperspace-Tunnel AKTIVIERT!' : '🌙 Hyperspace-Tunnel deaktiviert');
  }
}

/**
 * Ändert Tunnel-Farben (sync mit Portal)
 * @param {THREE.Color} colorA - Erste Farbe
 * @param {THREE.Color} colorB - Zweite Farbe  
 */
export function changeTunnelColors(colorA, colorB) {
  if (tunnelTube) {
    tunnelTube.material.color = colorA;
  }
  
  energyRings.forEach((ring, index) => {
    if (ring.material) {
      // Farben abwechseln
      ring.material.color = index % 2 === 0 ? colorA : colorB;
    }
  });
}

// ====================================================================
//                        TUNNEL ANIMATION
// ====================================================================

/**
 * Animiert alle Tunnel-Komponenten (wird von main.js aufgerufen)
 * @param {number} deltaTime - Zeit seit letztem Frame
 */
export function updateTunnel(deltaTime) {
  if (!tunnelActive || !tunnelGroup) return;
  
  // 1. PARTIKEL-ANIMATION (Hyperspace-Bewegung)
  updateParticleStreams(deltaTime);
  
  // 2. ENERGIE-RINGE (Pulsieren)
  updateEnergyRings(deltaTime);
  
  // 3. TUNNEL-RÖHRE (Leichtes Drehen)
  if (tunnelTube) {
    tunnelTube.rotation.x += deltaTime * 0.2 * animationSpeed;
  }
}

/**
 * Animiert die Hyperspace-Partikel
 */
function updateParticleStreams(deltaTime) {
  if (!tunnelParticles) return;
  
  const positions = tunnelParticles.geometry.attributes.position.array;
  const velocities = tunnelParticles.userData.velocities;
  
  for (let i = 0; i < positions.length; i += 3) {
    // Partikel bewegen sich IN RICHTUNG KAMERA (entgegen Z-Achse)
    positions[i + 2] -= velocities[i + 2] * deltaTime * 15 * animationSpeed;
    
    // Reset Partikel wenn sie zu weit vorne sind 
    if (positions[i + 2] > 5) {
      positions[i + 2] = -25; // Reset nach hinten
      
      // Neue Spiral-Position (kleinerer Radius!)
      const angle = Math.random() * Math.PI * 2;
      const radius = 2 + Math.random() * 4; // Kleiner = Kamera fliegt durch!
      positions[i] = Math.cos(angle) * radius;
      positions[i + 1] = Math.sin(angle) * radius;
    }
  }
  
  tunnelParticles.geometry.attributes.position.needsUpdate = true;
}

/**
 * Animiert die pulsierenden Energie-Ringe
 */
function updateEnergyRings(deltaTime) {
  const time = performance.now() * 0.001;
  
  energyRings.forEach(ring => {
    // Pulsier-Effekt
    const pulseScale = 1 + Math.sin(time * 3 + ring.userData.pulsePhase) * 0.1;
    ring.scale.set(pulseScale, pulseScale, 1);
    
    // Opacity-Animation
    ring.material.opacity = 0.2 + Math.sin(time * 2 + ring.userData.pulsePhase) * 0.2;
    
    // Ringe bewegen sich AUF KAMERA ZU (entgegen Z-Achse)
    ring.position.z += deltaTime * 8 * animationSpeed;
    
    // Reset wenn Ring zu weit vorne
    if (ring.position.z > 10) {
      ring.position.z = -25; // Reset nach hinten
    }
  });
}

// ====================================================================
//                        EXPORT FUNCTIONS
// ====================================================================

/**
 * Gibt die Tunnel-Gruppe zurück (für externe Manipulation)
 */
export function getTunnelGroup() {
  return tunnelGroup;
}

/**
 * Gibt zurück ob der Tunnel aktiv ist
 */
export function isTunnelActive() {
  return tunnelActive;
}