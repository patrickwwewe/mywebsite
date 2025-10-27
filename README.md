# 🌀 3D Portfolio Portal

Ein interaktives 3D-Portal gebaut mit Three.js für dein persönliches Portfolio.

## 📁 Projektstruktur

```
meine website/
├── index.html              # Haupt-HTML mit UI und Styling
├── main.js                 # Haupt-Orchestrator (verbindet alle Module)
├── main_backup.js          # Backup der ursprünglichen main.js
│
└── js/modules/             # Modulare Code-Organisation
    ├── scene.js            # 🎬 Szenen-Setup (Renderer, Kamera, Beleuchtung)
    ├── portal.js           # 🌀 Portal-System (Shader, Geometrie, Animationen)
    ├── decorations.js      # ✨ Dekorationen (Torus-Ringe, Säulen, Partikel)
    ├── interactions.js     # 🖱️ Interaktionen (Klicks, Portal-Aktivierung)
    ├── loading.js          # ⏳ Loading-System (Fortschritts-Anzeige)
    └── camera.js           # 📷 Kamera-System (Bewegungen, Übergänge)
```

## 🔧 Module im Detail

### 🎬 **scene.js** - Szenen-Grundlagen
- **Zweck**: Erstellt die grundlegende 3D-Szene
- **Funktionen**:
  - `initializeScene()` - Renderer, Kamera, Szene
  - `setupLighting()` - Ambient- und Point-Lights
  - `setupPostProcessing()` - Bloom-Effekte
  - `setupResizeHandler()` - Responsive Anpassung

### 🌀 **portal.js** - Portal-System  
- **Zweck**: Das magische Portal mit GLSL-Shadern
- **Funktionen**:
  - `createPortalMaterial()` - Shader mit animierten Ringen
  - `createPortalGeometry()` - Portal-Mesh erstellen
  - `updatePortalAnimation()` - Zeit-Updates für Animationen
  - `changePortalColors()` - Farbwechsel-Animationen

### ✨ **decorations.js** - Szenen-Dekoration
- **Zweck**: Alle dekorativen 3D-Objekte
- **Funktionen**:
  - `createTorusRings()` - Rotierende Ringe um Portal
  - `createBackgroundColumns()` - Säulen im Hintergrund
  - `createParticleSystem()` - Schwebende Partikel
  - `updateDecorations()` - Animationen aktualisieren

### 🖱️ **interactions.js** - Benutzer-Interaktion
- **Zweck**: Portal-Klicks und Menü-Navigation
- **Funktionen**:
  - `initializePortalInteraction()` - Klick-Events setup
  - `activatePortal()` - Portal-Aktivierung mit Effekten
  - `initializeMenuEvents()` - Radiales Menü
  - Portal-Status: `isPortalActivated()`, `isPortalAnimating()`

### ⏳ **loading.js** - Loading-System
- **Zweck**: Benutzer-Feedback während des Ladens
- **Funktionen**:
  - `setLoadingProgress()` - Fortschritt anzeigen
  - `hideLoading()` - Smooth ausblenden
  - `runLoadingSequence()` - Realistische Ladesequenz
  - `checkAutoHide()` - Auto-Hide nach erstem Frame

### 📷 **camera.js** - Kamera-System
- **Zweck**: Alle Kamera-Bewegungen und -Animationen
- **Funktionen**:
  - `updateCameraMovement()` - Subtile Parallax-Bewegung
  - `animateCameraTo()` - Smooth Übergänge
  - `setCameraPreset()` - Vordefinierte Positionen
  - `updateOrbitMovement()` - Orbit-Kamera um Objekt

## 🎯 Hauptfunktionen

### Portal-Interaktion
1. **Klick auf Portal** → `activatePortal()`
2. **Flug-Animation** durch Portal (`enterPortal()`)
3. **Farbwechsel** Magenta→Gold zu Cyan→Purple
4. **Radiales Menü** erscheint nach Animation

### Animationen
- **Portal**: Rotierende Ringe, Farbverläufe, Glow-Effekte
- **Dekorationen**: Rotierende Torus-Ringe, schwebende Partikel
- **Kamera**: Subtile Parallax-Bewegung für Lebendigkeit
- **Loading**: Realistische Fortschritts-Simulation

### Responsive Design
- Automatische Anpassung an Fenstergröße
- Optimiert für Desktop und Mobile
- High-DPI Display Support

## 🚀 Entwicklung

### Server starten
```bash
# Python HTTP Server
python -m http.server 8000

# Dann öffne: http://localhost:8000
```

### Module bearbeiten
- **Neue Dekorationen**: `decorations.js` erweitern
- **Portal-Effekte**: `portal.js` Shader anpassen  
- **Interaktionen**: `interactions.js` Events hinzufügen
- **Kamera-Presets**: `camera.js` neue Positionen definieren

### Debug-Modus
Öffne Browser-Konsole für detaillierte Logs:
```
🌀 3D Portal Portal
✨ Interaktives WebGL-Portal
🎯 Klicke ins Portal für Navigation
```

## 🎨 Anpassungen

### Portal-Farben ändern
```javascript
// In portal.js - neue Presets hinzufügen
export const PORTAL_PRESETS = {
  newPreset: { 
    col1: '#ff0000',  // Rot
    col2: '#00ff00',  // Grün  
    label: 'Rot → Grün' 
  }
};
```

### Kamera-Positionen
```javascript
// In camera.js - neue Presets definieren  
export const CAMERA_PRESETS = {
  dramatic: {
    position: new THREE.Vector3(3, 5, 10),
    lookAt: new THREE.Vector3(0, 0, 0)
  }
};
```

### Loading-Texte
```javascript
// In loading.js - Schritte anpassen
const steps = [
  { progress: 25, text: 'Lade Texturen', delay: 200 },
  { progress: 50, text: 'Erstelle Geometrie', delay: 300 },
  // ...
];
```

## 💡 Performance-Tipps

- **Module laden**: Moderne Browser cachen Module automatisch
- **Shader-Komplexität**: Portal-Shader ist GPU-optimiert
- **Partikel-Count**: In `decorations.js` anpassbar (Standard: 600)
- **Bloom-Qualität**: In `scene.js` konfigurierbar

## 🛠️ Troubleshooting

### CORS-Fehler
- **Problem**: `file://` Protocol blockiert Module
- **Lösung**: Lokalen HTTP-Server verwenden

### Performance-Probleme  
- **Problem**: Niedrige FPS auf schwächeren Geräten
- **Lösung**: `devicePixelRatio` in `scene.js` reduzieren

### Module nicht gefunden
- **Problem**: Import-Pfade incorrect
- **Lösung**: Relative Pfade von `main.js` aus prüfen

---

**🎯 Das Portal wartet auf deinen Klick! Viel Spaß mit deinem 3D-Portfolio!** ✨