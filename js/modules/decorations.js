// ====================================================================
//                        SZENEN DEKORATION MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Diese Datei erstellt alle dekorativen 3D-Objekte, die das Portal umgeben
// und der Szene Leben und Atmosphäre verleihen. Ohne diese Dekorationen
// wäre das Portal alleine in einem leeren, schwarzen Raum.
//
// WAS WIRD ERSTELLT:
// • Torus-Ringe: 3 rotierende Donut-förmige Ringe um das Portal
// • Hintergrund-Säulen: 6 Säulen die im Kreis um die Szene stehen
// • Partikel-System: 600 schwebende Lichtpunkte für Weltraum-Atmosphäre
//
// WARUM DIESE OBJEKTE:
// • Torus-Ringe: Verstärken die Portal-Magie, leiten Blick zum Zentrum
// • Säulen: Geben räumliche Orientierung, wie Säulen in einem Tempel
// • Partikel: Erzeugen Tiefe und Bewegung, wie Sterne im Weltraum
//
// TECHNISCHE UMSETZUNG:
// • THREE.Group: Container um mehrere Objekte zusammen zu verwalten
// • BufferGeometry: Effiziente Geometrie für viele Partikel
// • Float32Array: Optimierte Arrays für GPU-Performance
// • HSL-Farben: Farbton/Sättigung/Helligkeit für schöne Farbverläufe
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Ruft alle create-Funktionen auf und startet Animationen
// → scene.js: Alle Dekorationen werden in die dortige Szene eingefügt
// → camera.js: Kamera-Bewegungen berücksichtigen die Objektpositionen
//
// PERFORMANCE-HINWEISE:
// • Partikel-Anzahl ist konfigurierbar (Standard: 600)
// • BufferGeometry ist GPU-optimiert für viele Objekte
// • Animationen verwenden requestAnimationFrame für 60 FPS
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
  
  // Torus-Ringe sollen hinter dem Portal sein, aber sichtbar
  torusGroup.renderOrder = 100;   // Sichtbar, aber weniger als Portal (1000)
  torusGroup.position.z = -0.05;  // Nur minimal nach hinten
  
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
    
    // Säulen hinter Portal rendern
    mesh.renderOrder = -200;
    
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
    const radius = 15.0 + Math.random() * 25.0;    // SEHR WEIT WEG! (8.0→15.0, 15.0→25.0)
    const theta = Math.random() * Math.PI * 2;      // Winkel horizontal (0-360°)
    const phi = (Math.random() - 0.5) * Math.PI;    // Winkel vertikal (-90° bis 90°)
    
    // Sphärische → Kartesische Koordinaten umwandeln
    positions[i * 3] = Math.cos(theta) * Math.cos(phi) * radius;        // X
    positions[i * 3 + 1] = Math.sin(phi) * radius * 0.4;               // Y (flacher)
    positions[i * 3 + 2] = Math.sin(theta) * Math.cos(phi) * radius - 10; // Z: VIEL WEITER HINTEN! (-10)
  }
  
  // Buffer Geometry - effiziente Geometrie für viele Punkte
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Point Material - für einzelne Punkte/Partikel
  const particleMaterial = new THREE.PointsMaterial({
    color: 0xaaffff,          // Hellblau
    size: 0.012,              // GRÖßER aber nicht zu groß! (0.002 → 0.012)
    transparent: true,
    opacity: 0.7              // Sichtbarer (0.3 → 0.7)
  });
  
  // Points Objekt erstellen
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  
  // WICHTIG: Partikel im Hintergrund rendern!
  particles.renderOrder = -1000;  // Sehr niedrige Priorität = im Hintergrund
  particles.position.z = -2;      // Zusätzlich nach hinten verschieben
  
  scene.add(particles);
  
  // ================================================================
  // SPEZIELLE VORDER-STERNE (10 Stück im Kreis um Portal)
  // ================================================================
  const foregroundStars = createForegroundStars(scene);
  
  // ================================================================
  // PULSIERENDE HINTERGRUND-STERNE
  // ================================================================
  const pulsingBackgroundStars = createPulsingBackgroundStars(scene);
  
  // ================================================================
  // GROSSE VORDERGRUND-STERNE (3 Stück)
  // ================================================================
  const bigForegroundStars = createBigForegroundStars(scene);
  
  return { particles, foregroundStars, pulsingBackgroundStars, bigForegroundStars };
}

// ====================================================================
//                      VORDERGRUND-STERNE (KREISEND UM PORTAL)
// ====================================================================

/**
 * Erstellt 10 spezielle Sterne die näher zur Kamera sind und sich drehen
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @returns {THREE.Group} Gruppe mit den rotierenden Sternen
 */
function createForegroundStars(scene) {
  console.log('⭐ Erstelle rotierende Vordergrund-Sterne...');
  
  const starCount = 10;
  const starGroup = new THREE.Group();
  
  // Positions-Arrays für 10 Sterne
  const positions = new Float32Array(starCount * 3);
  
  // 10 Sterne im Kreis um das Portal verteilen
  for (let i = 0; i < starCount; i++) {
    const angle = (i / starCount) * Math.PI * 2; // Gleichmäßig verteilt im Kreis
    const radius = 3.0 + Math.random() * 1.0;    // Radius 3-4 (näher als Hintergrund-Partikel)
    const height = (Math.random() - 0.5) * 2.0;  // Etwas Höhen-Variation
    
    // Position im Kreis
    positions[i * 3] = Math.cos(angle) * radius;     // X
    positions[i * 3 + 1] = height;                   // Y
    positions[i * 3 + 2] = Math.sin(angle) * radius + 2; // Z (vor dem Portal!)
  }
  
  // Geometrie für die Vordergrund-Sterne
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Material für hellere, größere Sterne
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,          // Reinweiß
    size: 0.025,              // Etwas größer als normale Partikel
    transparent: true,
    opacity: 0.9,             // Gut sichtbar
    sizeAttenuation: true     // Größe hängt von Entfernung ab
  });
  
  // Points-Objekt erstellen
  const foregroundStars = new THREE.Points(starGeometry, starMaterial);
  
  // Render-Order: Zwischen Hintergrund und Portal
  foregroundStars.renderOrder = -50;
  
  starGroup.add(foregroundStars);
  scene.add(starGroup);
  
  console.log('⭐ 10 rotierende Vordergrund-Sterne erstellt!');
  return starGroup;
}

// ====================================================================
//                    PULSIERENDE HINTERGRUND-STERNE
// ====================================================================

/**
 * Erstellt pulsierende Sterne weit im Hintergrund
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @returns {THREE.Group} Gruppe mit pulsierenden Sternen
 */
function createPulsingBackgroundStars(scene) {
  console.log('💫 Erstelle pulsierende Hintergrund-Sterne...');
  
  const starCount = 15; // Mehr pulsierende Sterne
  const starGroup = new THREE.Group();
  
  for (let i = 0; i < starCount; i++) {
    // Einzelne Sterne als separate Meshes für individuelle Animation
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0]); // Ein einzelner Punkt
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Zufällige Position weit hinten
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30; // 20-50 Einheiten weit weg
    const height = (Math.random() - 0.5) * 20;
    
    const starMaterial = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(0.6 + Math.random() * 0.4, 1.0, 0.8), // Blau-Weiße Töne
      size: 0.02 + Math.random() * 0.03, // 0.02-0.05 Größe
      transparent: true,
      opacity: 0.8
    });
    
    const star = new THREE.Points(starGeometry, starMaterial);
    star.position.set(
      Math.cos(angle) * distance,
      height,
      Math.sin(angle) * distance - 15 // Weit hinten
    );
    
    // Pulsing-Daten speichern
    star.userData = {
      originalSize: starMaterial.size,
      pulseSpeed: 0.5 + Math.random() * 1.0, // Verschiedene Puls-Geschwindigkeiten
      pulsePhase: Math.random() * Math.PI * 2 // Zufällige Start-Phase
    };
    
    star.renderOrder = -2000; // Ganz hinten
    starGroup.add(star);
  }
  
  scene.add(starGroup);
  console.log('💫 15 pulsierende Hintergrund-Sterne erstellt!');
  return starGroup;
}

// ====================================================================
//                    GROSSE VORDERGRUND-STERNE
// ====================================================================

/**
 * Erstellt 3 große, rotierende Sterne im Vordergrund
 * @param {THREE.Scene} scene - Die 3D-Szene  
 * @returns {THREE.Group} Gruppe mit großen Sternen
 */
function createBigForegroundStars(scene) {
  console.log('🌟 Erstelle große Vordergrund-Sterne...');
  
  const starGroup = new THREE.Group();
  
  for (let i = 0; i < 3; i++) {
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0]);
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Große, helle Sterne
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff, // Reinweiß
      size: 0.08 + i * 0.02, // Verschiedene Größen: 0.08, 0.10, 0.12
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });
    
    // Position im weiten Kreis um Portal
    const angle = (i / 3) * Math.PI * 2; // 120° Abstände
    const radius = 5.5 + Math.random() * 1.5; // 5.5-7 Einheiten
    
    const star = new THREE.Points(starGeometry, starMaterial);
    star.position.set(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 3, // Höhen-Variation
      Math.sin(angle) * radius + 3 // Etwas vor dem Portal
    );
    
    star.renderOrder = 100; // Im Vordergrund aber hinter Portal
    starGroup.add(star);
  }
  
  scene.add(starGroup);
  console.log('🌟 3 große Vordergrund-Sterne erstellt!');
  return starGroup;
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