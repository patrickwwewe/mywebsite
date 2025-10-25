// ====================================================================
//                           PORTAL SYSTEM
// ====================================================================
// Diese Datei erstellt das magische Portal mit animierten Shader-Effekten
// - Portal-Geometrie und Material mit GLSL-Shadern
// - Farbübergänge und Animationen
// - Portal-Aktivierung und Interaktion
// ====================================================================

import * as THREE from 'three';

// ====================================================================
//                        PORTAL KONFIGURATION
// ====================================================================

// Farb-Presets für verschiedene Portal-Stile
export const PORTAL_PRESETS = {
  magentaGold: { 
    col1: '#ff00c8',  // Magenta
    col2: '#ffd166',  // Gold
    label: 'Magenta → Gold' 
  },
  cyanPurple: { 
    col1: '#00f0ff',  // Cyan
    col2: '#9b00ff',  // Purple  
    label: 'Cyan → Purple' 
  },
  aquaBlue: { 
    col1: '#00ffcc',  // Aqua
    col2: '#0077ff',  // Blue
    label: 'Aqua → Blue' 
  }
};

// Standardmäßig aktives Preset (Gold-Design)
const SELECTED_PRESET = PORTAL_PRESETS.magentaGold;

// ====================================================================
//                        PORTAL SHADER MATERIAL
// ====================================================================

/**
 * Erstellt das Portal-Material mit animierten GLSL-Shadern
 * @returns {Object} Material und Uniforms für weitere Kontrolle
 */
export function createPortalMaterial() {
  console.log('🌀 Erstelle Portal-Shader Material...');
  
  // Shader-Uniforms - Variablen die an den GPU-Shader gesendet werden
  const portalUniforms = {
    time: { value: 0 },                    // Animationszeit für bewegende Effekte
    resolution: { value: new THREE.Vector2(innerWidth, innerHeight) }, // Bildschirmauflösung
    colorA: { value: new THREE.Color(SELECTED_PRESET.col1) },          // Erste Portal-Farbe
    colorB: { value: new THREE.Color(SELECTED_PRESET.col2) },          // Zweite Portal-Farbe
    glow: { value: 1.0 },                 // Glow-Intensität
    speed: { value: 1.0 }                 // Animations-Geschwindigkeit
  };

  // Shader-Material mit Custom GLSL-Code
  const portalMaterial = new THREE.ShaderMaterial({
    uniforms: portalUniforms,
    
    // ================================================================
    // VERTEX SHADER - läuft pro Eckpunkt der Geometrie
    // Berechnet finale Position jedes Vertex auf dem Bildschirm
    // ================================================================
    vertexShader: `
      varying vec2 vUv;
      
      void main() {
        // UV-Koordinaten an Fragment Shader weiterleiten
        vUv = uv;
        
        // Standard-Transformation: 3D-Position → Bildschirmkoordinaten
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    
    // ================================================================
    // FRAGMENT SHADER - läuft pro Pixel
    // Berechnet die finale Farbe jedes Pixels
    // ================================================================
    fragmentShader: `
      precision highp float;
      
      // Eingaben vom Vertex Shader
      varying vec2 vUv;
      
      // Uniforms (Variablen von JavaScript)
      uniform float time;
      uniform vec2 resolution;
      uniform vec3 colorA;
      uniform vec3 colorB;
      uniform float glow;
      uniform float speed;

      // ============================================================
      // NOISE FUNKTION - erzeugt pseudo-zufällige Werte
      // ============================================================
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }    

      void main() {
        // UV-Koordinaten zentrieren (-1 bis 1) und Seitenverhältnis korrigieren
        vec2 uv = vUv * 2.0 - 1.0;
        uv.x *= resolution.x / resolution.y;
        
        // Entfernung vom Zentrum berechnen
        float dist = length(uv);

        // ========================================================
        // ANIMIERTE RINGE - das Hauptmuster des Portals
        // ========================================================
        float t = time * 0.6 * speed;
        float rings = sin((dist * 12.0 - t) * 6.0);
        rings = smoothstep(0.0, 0.9, rings);

        // ========================================================
        // ZENTRALER SCHIMMER - weicher Glanz in der Mitte
        // ========================================================
        float center = 1.0 - smoothstep(0.0, 0.8, dist);

        // ========================================================
        // FARBMISCHUNG - kombiniert beide Portal-Farben
        // ========================================================
        vec3 col = mix(colorA, colorB, pow(rings + 0.2 * center, 1.2));

        // ========================================================
        // RIM GLOW - leuchtender Rand um das Portal
        // ========================================================
        float rim = smoothstep(0.5, 0.48, dist) * glow;

        // ========================================================
        // FLICKER NOISE - subtiles Flackern für Lebendigkeit
        // ========================================================
        float n = (hash(uv * 10.0 + floor(time * 10.0)) - 0.5) * 0.12;
        col += rim * 1.6 * vec3(1.0) + n;

        // ========================================================
        // ALPHA FALLOFF - weicher Übergang zu transparent am Rand
        // ========================================================
        float alpha = 1.0 - smoothstep(0.3, 1.0, dist);
        alpha = clamp(alpha, 0.0, 1.0);

        // Finale Farbe mit Transparenz
        gl_FragColor = vec4(col * alpha, alpha);
      }
    `,
    transparent: true,  // Transparenz aktivieren
    depthWrite: false   // Keine Tiefenwerte schreiben (für Blending)
  });

  return { portalMaterial, portalUniforms };
}

// ====================================================================
//                        PORTAL GEOMETRIE
// ====================================================================

/**
 * Erstellt die Portal-Geometrie und fügt sie zur Szene hinzu
 * @param {THREE.Scene} scene - Die 3D-Szene
 * @param {THREE.ShaderMaterial} portalMaterial - Das Portal-Material
 * @returns {THREE.Mesh} Das Portal-Mesh für Interaktionen
 */
export function createPortalGeometry(scene, portalMaterial) {
  console.log('🔷 Erstelle Portal-Geometrie...');
  
  // Plane Geometry - flache Rechteck-Fläche für das Portal
  // Parameter: Breite (4), Höhe (4), Segmente (1x1 = einfach)
  const portalGeo = new THREE.PlaneGeometry(4, 4, 1, 1);
  
  // Mesh erstellen - verbindet Geometrie mit Material
  const portalMesh = new THREE.Mesh(portalGeo, portalMaterial);
  portalMesh.rotation.x = 0; // Fläche steht aufrecht und zeigt nach vorne
  
  scene.add(portalMesh);
  return portalMesh;
}

// ====================================================================
//                      PORTAL ANIMATION UPDATE
// ====================================================================

/**
 * Aktualisiert Portal-Animationen in der Render-Schleife
 * @param {Object} portalUniforms - Die Shader-Uniforms
 * @param {number} time - Aktuelle Zeit in Sekunden
 */
export function updatePortalAnimation(portalUniforms, time) {
  // Zeit an Shader weiterleiten für animierte Effekte
  portalUniforms.time.value = time;
}

// ====================================================================
//                      PORTAL FARBEN ÄNDERN
// ====================================================================

/**
 * Ändert die Portal-Farben mit smooth Übergang
 * @param {Object} portalUniforms - Die Shader-Uniforms  
 * @param {string} presetName - Name des Farb-Presets
 * @param {number} duration - Übergangs-Dauer in ms
 */
export function changePortalColors(portalUniforms, presetName, duration = 2000) {
  const preset = PORTAL_PRESETS[presetName];
  if (!preset) {
    console.warn(`❌ Farb-Preset '${presetName}' nicht gefunden!`);
    return;
  }
  
  console.log(`🎨 Ändere Portal-Farben zu: ${preset.label}`);
  
  // Aktuelle Farben speichern
  const startColors = {
    a: portalUniforms.colorA.value.clone(),
    b: portalUniforms.colorB.value.clone()
  };
  
  // Ziel-Farben setzen
  const targetColors = {
    a: new THREE.Color(preset.col1),
    b: new THREE.Color(preset.col2)
  };
  
  // Animierte Farbübergänge
  const startTime = performance.now();
  
  function animateColors() {
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Smooth easing
    
    // Farben interpolieren
    portalUniforms.colorA.value.lerpColors(startColors.a, targetColors.a, eased);
    portalUniforms.colorB.value.lerpColors(startColors.b, targetColors.b, eased);
    
    if (progress < 1) {
      requestAnimationFrame(animateColors);
    }
  }
  
  animateColors();
}