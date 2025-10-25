// ====================================================================
//                           PORTAL SYSTEM MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Diese Datei erstellt das magische Portal - das Herzstück der Website.
// Das Portal ist eine flache Ebene mit einem komplexen Shader-Material,
// das animierte Ringe und Farbverläufe erzeugt.
//
// WAS PASSIERT HIER:
// • Shader-Material: Spezielle GPU-Programme für realistische Effekte
// • Portal-Geometrie: Eine einfache rechteckige Fläche (PlaneGeometry)
// • Farb-Presets: Vordefinierte Farbkombinationen für verschiedene Stimmungen
// • Animationen: Zeit-basierte Bewegungen der Ringe und Effekte
//
// TECHNISCHE DETAILS:
// • GLSL-Shader: Programme die direkt auf der Grafikkarte (GPU) laufen
// • Fragment Shader: Berechnet die Farbe jedes einzelnen Pixels
// • Vertex Shader: Positioniert die Eckpunkte der Geometrie
// • Uniforms: Variablen die von JavaScript an den Shader gesendet werden
//
// ZUSAMMENHANG MIT ANDEREN DATEIEN:
// → main.js: Ruft createPortalMaterial() und createPortalGeometry() auf
// → scene.js: Das Portal wird in die dort erstellte Szene eingefügt
// → interactions.js: Erkennt Klicks auf das Portal für Aktivierung
// → loading.js: Zeigt Fortschritt beim Kompilieren der Shader an
//
// ANALOGIE:
// Das Portal ist wie ein magischer Spiegel:
// • Geometrie = der physische Spiegel-Rahmen
// • Shader = die magische Oberfläche mit bewegten Mustern
// • Uniforms = Regler um die Magie zu steuern (Farbe, Geschwindigkeit)
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
    glow: { value: 1.0 },                 // ORIGINAL GLOW ZURÜCK! (0.4 → 1.0)
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
        // ZENTRALER SCHIMMER - weicher Glanz in der Mitte (REDUZIERT!)
        // ========================================================
        float center = 1.0 - smoothstep(0.0, 0.6, dist); // Kleinerer Center (0.8 → 0.6)

        // ========================================================
        // FARBMISCHUNG - kombiniert beide Portal-Farben (WENIGER HELL!)
        // ========================================================
        vec3 col = mix(colorA, colorB, pow(rings + 0.1 * center, 1.0)); // Weniger Center-Einfluss (0.2 → 0.1) und Power (1.2 → 1.0)

        // ========================================================
        // RIM GLOW - leuchtender Rand um das Portal
        // ========================================================
        float rim = smoothstep(0.5, 0.48, dist) * glow;

        // ========================================================
        // FLICKER NOISE - subtiles Flackern für Lebendigkeit (REDUZIERT!)
        // ========================================================
        float n = (hash(uv * 10.0 + floor(time * 10.0)) - 0.5) * 0.06; // Weniger Flackern (0.12 → 0.06)
        col += rim * 0.8 * vec3(1.0) + n; // Weniger Helligkeit (1.6 → 0.8)

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
  // Parameter: Breite (2.5), Höhe (2.5), Segmente (1x1 = einfach) - KLEINER für weniger Weiß!
  const portalGeo = new THREE.PlaneGeometry(2.5, 2.5, 1, 1);
  
  // Mesh erstellen - verbindet Geometrie mit Material
  const portalMesh = new THREE.Mesh(portalGeo, portalMaterial);
  portalMesh.rotation.x = 0; // Fläche steht aufrecht und zeigt nach vorne
  
  // WICHTIG: Portal IMMER im Vordergrund rendern!
  portalMesh.renderOrder = 1000;  // Hohe Priorität = im Vordergrund
  portalMesh.position.z = 0.1;    // Leicht nach vorne
  
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