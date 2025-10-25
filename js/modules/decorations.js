// ====================================================================
//                        SZENEN DEKORATION
// ====================================================================
// Diese Datei erstellt alle dekorativen 3D-Objekte um das Portal herum
// - Rotierende Torus-Ringe um das Portal
// - Säulen im Hintergrund  
// - Schwebende Partikel für Atmosphäre
// ====================================================================

import * as THREE from 'three';

// ====================================================================
//                        TORUS RINGE (Portal-Umrandung)
// ====================================================================

/**
 * Erstellt rotierende Torus-Ringe um das Portal
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @returns {THREE.Group} Gruppe mit allen Torus-Ringen
 */
export function createTorusRings(scene) {
  console.log('🍩 Erstelle rotierende Torus-Ringe...');
  
  // Group Container - alle Ringe zusammen verwalten
  const torusGroup = new THREE.Group();
  
  // 3 konzentrische Ringe mit unterschiedlichen Größen erstellen
  for (let i = 0; i < 3; i++) {
    const radius = 1.6 + i * 0.35;          // Größer werdende Radien: 1.6, 1.95, 2.3
    const tubeRadius = 0.03 + i * 0.01;     // Dickere Rohre: 0.03, 0.04, 0.05
    
    // Torus Geometry - Donut-Form
    // Parameter: Haupt-Radius, Rohr-Radius, Rohr-Segmente, Ring-Segmente
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 120);
    
    // Material mit Farbverlauf (Blau-Töne)
    const hue = 0.6 - i * 0.05;           // Farbton wird pro Ring leicht verschoben
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.9, 0.6), // HSL: Farbton, Sättigung, Helligkeit
      transparent: true,
      opacity: 0.85                       // Leicht transparent
    });
    
    // Mesh erstellen und positionieren
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI * 0.5;      // Um 90° drehen (steht aufrecht)
    mesh.receiveShadow = false;           // Keine Schatten empfangen
    mesh.castShadow = false;              // Keine Schatten werfen
    
    torusGroup.add(mesh);
  }
  
  scene.add(torusGroup);
  return torusGroup;
}

// ====================================================================
//                        HINTERGRUND SÄULEN
// ====================================================================

/**
 * Erstellt schwebende Säulen als Hintergrund-Dekoration
 * @param {THREE.Scene} scene - Die 3D-Szene
 */
export function createBackgroundColumns(scene) {
  console.log('🏛️ Erstelle Hintergrund-Säulen...');
  
  // Zylinder-Geometrie für Säulen
  // Parameter: Radius-Oben, Radius-Unten, Höhe, Segmente
  const columnGeometry = new THREE.CylinderGeometry(0.06, 0.06, 3, 18);
  
  // Dunkles, leicht leuchtende Material
  const columnMaterial = new THREE.MeshStandardMaterial({
    color: 0x09202b,           // Dunkelblaue Grundfarbe
    emissive: 0x00303f,        // Schwaches bläuliches Leuchten
    metalness: 0.2,            // Leicht metallisch
    roughness: 0.4,            // Mittlere Oberflächenrauhigkeit
    emissiveIntensity: 0.8     // Leuchtstärke
  });
  
  // 6 Säulen im Kreis um das Portal verteilen
  for (let i = 0; i < 6; i++) {
    const mesh = new THREE.Mesh(columnGeometry, columnMaterial);
    
    // Position im Kreis berechnen
    const angle = (i / 6) * Math.PI * 2;  // 60° Abstände
    mesh.position.set(
      Math.cos(angle) * 6.5,               // X: Kreis mit Radius 6.5
      -0.6 + Math.sin(i) * 0.3,           // Y: Leicht variierte Höhe
      Math.sin(angle) * 5.0 - 1.5          // Z: Kreis versetzt nach hinten
    );
    
    // Rotation für natürlichere Verteilung
    mesh.rotation.y = angle + Math.PI * 0.2;
    
    // Höhe leicht variieren (abwechselnd)
    mesh.scale.y = 0.9 + (i % 2) * 0.3;
    
    scene.add(mesh);
  }
}

// ====================================================================
//                        PARTIKEL SYSTEM
// ====================================================================

/**
 * Erstellt schwebende Partikel um das Portal
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @returns {THREE.Points} Partikel-System für Animationen
 */
export function createParticleSystem(scene) {
  console.log('✨ Erstelle Partikel-System...');
  
  const particleCount = 600;
  
  // Float32Array für optimale GPU-Performance
  // Jeder Partikel hat 3 Werte (x, y, z) → 600 × 3 = 1800 Werte
  const positions = new Float32Array(particleCount * 3);
  
  // Zufällige Positionen in 3D-Raum generieren
  for (let i = 0; i < particleCount; i++) {
    // Sphärische Koordinaten für gleichmäßige Verteilung
    const radius = 2.6 + Math.random() * 10.0;     // Entfernung vom Zentrum
    const theta = Math.random() * Math.PI * 2;      // Winkel horizontal (0-360°)
    const phi = (Math.random() - 0.5) * Math.PI;    // Winkel vertikal (-90° bis 90°)
    
    // Sphärische → Kartesische Koordinaten umwandeln
    positions[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;        // X
    positions[i * 3 + 1] = Math.sin(phi) * radius * 0.4;               // Y (flacher)
    positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius;    // Z
  }
  
  // Buffer Geometry - effiziente Geometrie für viele Punkte
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Point Material - für einzelne Punkte/Partikel
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xaaffff,          // Hellblau
    size: 0.03,               // Kleine Partikel
    transparent: true,
    opacity: 0.9              // Leicht transparent
  });
  
  // Points Objekt erstellen
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
  
  return particles;
}

// ====================================================================
//                      DEKORATION ANIMATIONEN
// ====================================================================

/**
 * Aktualisiert alle dekorativen Animationen
 * @param {THREE.Group} torusGroup - Die Torus-Ringe Gruppe
 * @param {THREE.Points} particles - Das Partikel-System
 * @param {number} time - Aktuelle Zeit in Sekunden
 * @param {number} speed - Animations-Geschwindigkeit
 */
export function updateDecorations(torusGroup, particles, time, speed) {
  // Torus-Ringe rotieren (jeder Ring unterschiedlich schnell)
  if (torusGroup) {
    torusGroup.children.forEach((mesh, i) => {
      mesh.rotation.z += 0.0025 * (1 + i * 0.6) * speed;
    });
  }
  
  // Partikel langsam um Y-Achse rotieren
  if (particles) {
    particles.rotation.y = time * 0.02;
  }
}