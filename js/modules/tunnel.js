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
  
  // KEINE RÖHRE MEHR! Stattdessen: Hyperspace-Streifen wie Star Wars!
  
  // Erstelle viele leuchtende Linien statt einer Röhre
  const lineCount = 60;  // Anzahl Hyperspace-Streifen
  const tunnelRadius = 6;
  
  for (let i = 0; i < lineCount; i++) {
    // Zufällige Position um den Kreis
    const angle = (i / lineCount) * Math.PI * 2;
    const radiusVariation = tunnelRadius + (Math.random() - 0.5) * 2;
    
    const x = Math.cos(angle) * radiusVariation;
    const y = Math.sin(angle) * radiusVariation;
    
    // Linie-Geometrie (EXTRA lange Hyperspace-Streifen)
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, 15),  // Vorne (weiter weg)
      new THREE.Vector3(x, y, -70)  // Hinten (VIEL länger!)
    ]);
    
    // Glühendes Line-Material
    const lineMaterial = new THREE.LineBasicMaterial({
      color: Math.random() < 0.3 ? 0xffffff : (Math.random() < 0.6 ? 0x00aaff : 0x0088ff),
      transparent: true,
      opacity: 0.4 + Math.random() * 0.4, // Verschiedene Helligkeiten
      linewidth: 2
    });
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    tunnelGroup.add(line);
  }
  
  console.log('⚡ Hyperspace-Streifen erstellt (wie Star Wars!)');
  
  // Alte Röhre wurde durch Hyperspace-Streifen ersetzt!
}

// ====================================================================
//                    PARTIKEL-STREAMS (HYPERSPACE)
// ====================================================================

/**
 * Erstellt wirbelnde Partikel-Streams wie im Hyperspace
 */
function createParticleStreams() {
  console.log('✨ Erstelle Hyperspace-Partikel...');
  
  const particleCount = 3000; // NOCH MEHR Partikel!
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount); // Größen-Array
  
  // Partikel wie STERNE in Hyperspace
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Zufällige Position im großen Radius (wie Sterne)
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 15; // Größerer Radius für Sterne-Effekt  
    const z = 15 - Math.random() * 80; // VIEL LÄNGERER Tunnel! (von 15 bis -65)
    
    positions[i3] = Math.cos(angle) * radius;     // X
    positions[i3 + 1] = Math.sin(angle) * radius; // Y  
    positions[i3 + 2] = z;                        // Z
    
    // Geschwindigkeit für HYPERSPACE-Effekt
    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 1 + Math.random() * 2; // Schneller!
    
    // Stern-Größe (manche groß, manche klein)
    sizes[i] = Math.random() < 0.1 ? 4 + Math.random() * 3 : 1 + Math.random() * 2;
    
    // REALISTISCHE Hyperspace-Farben
    const colorChoice = Math.random();
    if (colorChoice < 0.6) {
      // Helles Weiß/Blau (wie echte Sterne)
      colors[i3] = 0.8 + Math.random() * 0.2;     // R
      colors[i3 + 1] = 0.9 + Math.random() * 0.1; // G  
      colors[i3 + 2] = 1;                         // B
    } else if (colorChoice < 0.8) {
      // Cyan-Streifen
      colors[i3] = 0.3;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 1;
    } else {
      // Goldene Sterne (wie Star Wars)
      colors[i3] = 1;
      colors[i3 + 1] = 0.8;
      colors[i3 + 2] = 0.3;
    }
  }
  
  // Partikel-Geometrie mit Größen
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  // REALISTISCHES Stern-Material
  const particleMaterial = new THREE.PointsMaterial({
    size: 2.5,              // Größer für Stern-Effekt  
    transparent: true,
    opacity: 0.9,           // Heller
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true   // Sterne werden kleiner mit Entfernung
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
  const ringCount = 30; // MEHR Ringe für dichten Effekt
  
  for (let i = 0; i < ringCount; i++) {
    // Dünnere, elegantere Ringe
    const innerRadius = 8 + Math.random() * 2;  
    const outerRadius = innerRadius + 0.3; // Sehr dünne Ringe
    const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 64); // Mehr Segmente = smoother
    
    // Subtile Energie-Farben
    const colors = [0x00aaff, 0x0088ff, 0xffffff, 0x4466ff];
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 0.15 + Math.random() * 0.2, // Sehr subtil
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    
    // Ringe über VIEL längere Distanz verteilen  
    ring.position.z = 15 - (i / ringCount) * 80; // VIEL längerer Tunnel! (von 15 bis -65)
    
    // Leichte Rotation für Dynamik
    ring.rotation.z = Math.random() * Math.PI * 2;
    
    // Animation-Daten
    ring.userData = {
      originalScale: 1,
      pulsePhase: (i / ringCount) * Math.PI * 4, // Schnellerer Puls
      rotSpeed: (Math.random() - 0.5) * 0.02     // Langsame Rotation
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
 * Aktiviert den Tunnel für Portal-Durchflug und versteckt normale Szene
 * @param {boolean} active - Tunnel aktiv/inaktiv
 * @param {number} speed - Animations-Geschwindigkeit (default: 1.0)
 * @param {THREE.Scene} scene - Die Hauptszene (optional)
 */
export function activateTunnel(active, speed = 1.0, scene = null) {
  tunnelActive = active;
  animationSpeed = speed;
  
  if (tunnelGroup) {
    tunnelGroup.visible = active;
    
    // RADIKALER ANSATZ: Alles außer Tunnel verstecken!
    if (scene) {
      scene.children.forEach(child => {
        console.log(`🔍 Objekt: "${child.name}" (Type: ${child.type})`);
        
        if (active) {
          // TUNNEL MODUS: Nur Tunnel-Gruppe sichtbar
          if (child.name === 'HyperspaceTunnel') {
            child.visible = true;
            console.log(`✅ TUNNEL SICHTBAR: ${child.name}`);
          } else if (child.type.includes('Light')) {
            child.visible = true; // Licht behalten
            console.log(`💡 Licht behalten: ${child.type}`);
          } else {
            child.visible = false; // ALLES andere weg!
            console.log(`❌ VERSTECKT: ${child.name || 'Unnamed'}`);
          }
        } else {
          // NORMALER MODUS: Tunnel weg, alles andere zurück
          if (child.name === 'HyperspaceTunnel') {
            child.visible = false;
          } else {
            child.visible = true;
            console.log(`✅ ZURÜCK: ${child.name || 'Unnamed'}`);
          }
        }
      });
    }
    
    console.log(active ? '🌪️ Hyperspace-Tunnel AKTIVIERT! Normale Szene ausgeblendet!' : '🌙 Hyperspace-Tunnel deaktiviert - Normale Szene wieder da!');
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
  
  // 2. ENERGIE-RINGE (Pulsieren + Rotieren)
  updateEnergyRings(deltaTime);
  
  // 3. HYPERSPACE-LINIEN (Flimmern) 
  updateHyperspaceLines(deltaTime);
}

/**
 * Animiert die Hyperspace-Partikel
 */
function updateParticleStreams(deltaTime) {
  if (!tunnelParticles) return;
  
  const positions = tunnelParticles.geometry.attributes.position.array;
  const velocities = tunnelParticles.userData.velocities;
  
  for (let i = 0; i < positions.length; i += 3) {
    // Partikel bewegen sich VIEL SCHNELLER IN RICHTUNG KAMERA
    positions[i + 2] -= velocities[i + 2] * deltaTime * 35 * animationSpeed; // Viel schneller! (15 → 35)
    
    // Reset Partikel wenn sie zu weit vorne sind 
    if (positions[i + 2] > 15) {
      positions[i + 2] = -65; // Reset nach hinten (weiter weg)
      
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
    // Subtiler Pulsier-Effekt
    const pulseScale = 1 + Math.sin(time * 2 + ring.userData.pulsePhase) * 0.05;
    ring.scale.set(pulseScale, pulseScale, 1);
    
    // Sanfte Opacity-Animation
    const baseOpacity = 0.1;
    ring.material.opacity = baseOpacity + Math.sin(time * 1.5 + ring.userData.pulsePhase) * 0.15;
    
    // Langsame Rotation für Dynamik
    ring.rotation.z += ring.userData.rotSpeed * deltaTime * 60;
    
    // Ringe bewegen sich SCHNELLER AUF KAMERA ZU
    ring.position.z += deltaTime * 25 * animationSpeed; // Viel schneller! (12 → 25)
    
    // Reset wenn Ring zu weit vorne
    if (ring.position.z > 15) {
      ring.position.z = -65; // Reset nach hinten (weiter weg wegen längerem Tunnel)
    }
  });
}

/**
 * Animiert die Hyperspace-Linien (Flimmern)
 */
function updateHyperspaceLines(deltaTime) {
  const time = performance.now() * 0.001;
  
  // Finde alle Line-Objekte in der Tunnel-Gruppe
  tunnelGroup.children.forEach(child => {
    if (child.type === 'Line') {
      // Sanftes Flimmern der Linien
      const flicker = 0.3 + Math.sin(time * 8 + Math.random() * 10) * 0.2;
      child.material.opacity = Math.max(0.2, Math.min(0.8, flicker));
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