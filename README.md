# � Space Adventure - Interactive 3D Website

Eine interaktive 3D-Website mit Portfolio-Bereich und Space Adventure Spiel, gebaut mit Three.js.

## 🚀 Live Demo
- **Website**: [https://patrickwwewe.github.io/mywebsite/](https://patrickwwewe.github.io/mywebsite/)
- **Space Adventure**: [https://patrickwwewe.github.io/mywebsite/pages/play/01_index.html](https://patrickwwewe.github.io/mywebsite/pages/play/01_index.html)

## 📁 Projektstruktur

```
meine website/
├── index.html              # 🏠 Haupt-Website mit 3D Portal
├── main.js                 # 🎯 Portal-Orchestrator (verbindet alle Module)
├── main_backup.js          # 💾 Backup der ursprünglichen main.js
├── styles.css              # 🎨 Website-Styling
│
├── js/                     # 🎮 Portfolio-Website Module
│   ├── config.js           # ⚙️ Website-Konfiguration
│   └── modules/
│       ├── scene.js        # 🎬 3D-Szenen-Setup (Renderer, Kamera, Beleuchtung)
│       ├── portal.js       # 🌀 Portal-System (Shader, Geometrie, Animationen)
│       ├── decorations.js  # ✨ Dekorationen (Torus-Ringe, Säulen, Partikel)
│       ├── interactions.js # 🖱️ Portal-Interaktionen (Klicks, Navigation)
│       ├── loading.js      # ⏳ Loading-System (Fortschritts-Anzeige)
│       ├── camera.js       # 📷 Kamera-System (Bewegungen, Übergänge)
│       ├── particles.js    # ⭐ Partikel-Effekte
│       ├── tunnel.js       # 🕳️ Tunnel-Effekte
│       ├── shake.js        # 📳 Kamera-Shake Effekte
│       ├── aberration.js   # 🌈 Farbverzerrung-Effekte
│       └── audio.js        # 🔊 Audio-System
│
├── pages/                  # 📄 Website-Seiten
│   ├── about.html          # ℹ️ Über mich
│   ├── contact.html        # 📧 Kontakt
│   ├── credits.html        # 🎭 Credits
│   ├── impressum.html      # ⚖️ Impressum
│   ├── projekte.html       # 🛠️ Projekte
│   └── play/               # 🎮 SPACE ADVENTURE SPIEL
│       ├── 01_index.html   # 🚀 Spiel-HTML
│       ├── 01_index.css    # 🎨 Spiel-Styling
│       └── modules/
│           └── GameEngine.js # 🎯 Spiel-Engine (3D schwarzes Loch)
│
└── blender/                # 🎨 3D-Assets
    └── need_some_space/
        ├── need_some_space.glb     # 🌌 Schwarzes Loch 3D-Modell
        └── credits schwarzes loch mit sterne.txt
```

## 🏠 Portfolio-Website Module

### 🎬 **scene.js** - 3D-Szenen-Grundlagen
- **Zweck**: Erstellt die grundlegende 3D-Szene für das Portfolio-Portal
- **Funktionen**:
  - `initializeScene()` - Renderer, Kamera, Szene
  - `setupLighting()` - Ambient- und Point-Lights
  - `setupPostProcessing()` - Bloom-Effekte für magisches Portal
  - `setupResizeHandler()` - Responsive Anpassung

### 🌀 **portal.js** - Magisches Portal-System  
- **Zweck**: Das zentrale 3D-Portal mit GLSL-Shadern
- **Funktionen**:
  - `createPortalMaterial()` - Shader mit animierten Ringen
  - `createPortalGeometry()` - Portal-Mesh erstellen
  - `updatePortalAnimation()` - Zeit-Updates für Animationen
  - `changePortalColors()` - Dynamische Farbwechsel-Animationen

### ✨ **decorations.js** - Portal-Dekoration
- **Zweck**: Alle dekorativen 3D-Objekte um das Portal
- **Funktionen**:
  - `createTorusRings()` - Rotierende Ringe um Portal
  - `createBackgroundColumns()` - Säulen im Hintergrund
  - `createParticleSystem()` - Schwebende Partikel-Effekte
  - `updateDecorations()` - Animationen aktualisieren

### 🖱️ **interactions.js** - Portal-Interaktion
- **Zweck**: Portal-Klicks und Navigation zu Unterseiten
- **Funktionen**:
  - `initializePortalInteraction()` - Klick-Events setup
  - `activatePortal()` - Portal-Aktivierung mit Effekten
  - `initializeMenuEvents()` - Navigation zu About, Projekte, etc.
  - Portal-Status: `isPortalActivated()`, `isPortalAnimating()`

## 🎮 Space Adventure Spiel

### 🎯 **GameEngine.js** - Haupt-Spiel-Engine
- **Zweck**: Lädt und rendert das 3D schwarze Loch aus Blender
- **Features**:
  - **3D-Modell Loading**: Lädt `need_some_space.glb` mit GLTFLoader
  - **Horror-Atmosphäre**: Dunkler Hintergrund, dramatische Beleuchtung
  - **Ultra-Sharp Rendering**: Hochauflösende Darstellung (bis 6x Scale)
  - **Cinematic Kamera**: Weitwinkel-Perspektive von unten nach oben
  - **Horror-Animationen**: Langsame Rotation, Pulsieren, Kamera-Wackeln
  - **Responsive Design**: Passt sich an alle Bildschirmgrößen an

### 🌌 **3D-Asset Pipeline**
- **Blender**: 3D-Modell Creation (`need_some_space.blend`)
- **Export**: GLB-Format für optimale Web-Performance
- **Loading**: Robuste Pfad-Erkennung für verschiedene Server-Umgebungen
- **Fallback**: Multiple Pfad-Strategien für GitHub Pages Kompatibilität

## 🎯 Hauptfunktionen

### 🏠 Portfolio-Website
#### Portal-Interaktion
1. **Klick auf Portal** → `activatePortal()`
2. **Flug-Animation** durch Portal (`enterPortal()`)
3. **Farbwechsel** Magenta→Gold zu Cyan→Purple
4. **Navigation** zu verschiedenen Seiten (About, Projekte, Contact)

#### Animationen
- **Portal**: Rotierende Ringe, Farbverläufe, Glow-Effekte
- **Dekorationen**: Rotierende Torus-Ringe, schwebende Partikel
- **Kamera**: Subtile Parallax-Bewegung für Lebendigkeit
- **Loading**: Realistische Fortschritts-Simulation

### 🎮 Space Adventure Spiel
#### 3D Black Hole Experience
1. **Dramatic Loading** → Ultra-hochauflösende Darstellung
2. **Horror Atmosphere** → Dunkler Hintergrund, dramatische Beleuchtung
3. **Cinematic View** → Weitwinkel-Kamera von unten nach oben
4. **Smooth Animations** → Langsame Rotation, Pulsieren, Kamera-Shake

#### Performance Features
- **Ultra-Sharp Rendering**: Bis zu 6x Render-Scale für perfekte Schärfe
- **Smart Fallbacks**: Robuste GLB-Loading mit mehreren Pfad-Strategien
- **Responsive Scaling**: Dynamische Auflösung basierend auf Fenstergröße
- **GitHub Pages Ready**: Optimiert für GitHub Pages Deployment

### 🌐 Cross-Platform Design
- Automatische Anpassung an Fenstergröße
- Optimiert für Desktop und Mobile
- High-DPI Display Support
- PWA-Ready (Progressive Web App)

## 🚀 Entwicklung

### Server starten
```bash
# Python HTTP Server (für lokale Entwicklung)
cd "meine website"
python -m http.server 8000

# Dann öffne:
# - Portfolio: http://localhost:8000
# - Spiel: http://localhost:8000/pages/play/01_index.html
```

### 🏠 Portfolio-Website bearbeiten
- **Neue Portal-Effekte**: `js/modules/portal.js` Shader anpassen  
- **Interaktionen**: `js/modules/interactions.js` Events hinzufügen
- **Kamera-Presets**: `js/modules/camera.js` neue Positionen definieren
- **Partikel-Systeme**: `js/modules/particles.js` erweitern

### 🎮 Space Adventure entwickeln
- **Game Logic**: `pages/play/modules/GameEngine.js` bearbeiten
- **3D Assets**: Neue GLB-Dateien in `blender/` hinzufügen
- **UI Styling**: `pages/play/01_index.css` anpassen
- **Horror Effects**: Beleuchtung und Animationen in GameEngine

### 🎨 3D-Asset Pipeline
```bash
# Blender Workflow:
1. Modell in Blender erstellen/bearbeiten
2. Export als GLB (File → Export → glTF 2.0)
3. In blender/ Ordner speichern
4. Pfad in GameEngine.js aktualisieren
```

### Debug-Modi
**Portfolio-Website** - Browser-Konsole:
```
🌀 3D Portal Portal
✨ Interaktives WebGL-Portal
🎯 Klicke ins Portal für Navigation
```

**Space Adventure** - Browser-Konsole:
```
🚀 GameEngine erstellt
🔧 Initialisiere GameEngine...
📦 Lade GLB-Modell...
✅ GameEngine erfolgreich initialisiert!
```

## 🎨 Anpassungen

### 🏠 Portfolio-Website Customization

#### Portal-Farben ändern
```javascript
// In js/modules/portal.js - neue Presets hinzufügen
export const PORTAL_PRESETS = {
  newPreset: { 
    col1: '#ff0000',  // Rot
    col2: '#00ff00',  // Grün  
    label: 'Rot → Grün' 
  }
};
```

#### Kamera-Positionen
```javascript
// In js/modules/camera.js - neue Presets definieren  
export const CAMERA_PRESETS = {
  dramatic: {
    position: new THREE.Vector3(3, 5, 10),
    lookAt: new THREE.Vector3(0, 0, 0)
  }
};
```

### 🎮 Space Adventure Customization

#### Horror-Atmosphäre anpassen
```javascript
// In pages/play/modules/GameEngine.js - setupLighting()
this.renderer.setClearColor(0x0d0518, 1); // Hintergrundfarbe ändern
const ambientLight = new THREE.AmbientLight(0x1a0033, 0.12); // Ambient-Licht
```

#### Kamera-Position ändern
```javascript
// In GameEngine.js - setupCamera()
this.camera.position.set(0, -20, 15);   // X, Y, Z Position
this.camera.lookAt(0, 0, 0);            // Blickrichtung
```

#### Render-Qualität anpassen
```javascript
// In GameEngine.js - setupRenderer()
let renderScale = 3.0; // Niedrigerer Wert = bessere Performance
                       // Höherer Wert = schärfere Darstellung
```

#### Animation-Speed ändern
```javascript
// In GameEngine.js - startGameLoop()
this.model.rotation.y += 0.002; // Rotationsgeschwindigkeit
const pulse = Math.sin(time * 0.3) * 0.15 + 1.0; // Pulsier-Speed
```

## 💡 Performance-Tipps

### 🏠 Portfolio-Website
- **Module laden**: Moderne Browser cachen Module automatisch
- **Shader-Komplexität**: Portal-Shader ist GPU-optimiert
- **Partikel-Count**: In `decorations.js` anpassbar (Standard: 600)
- **Bloom-Qualität**: In `scene.js` konfigurierbar

### 🎮 Space Adventure
- **Ultra-Sharp Rendering**: Render-Scale von 6.0 auf 2.0-3.0 reduzieren für bessere Performance
- **GLB-Optimierung**: Blender-Export mit niedrigerer Polygon-Zahl für schwächere Geräte
- **Schatten-Qualität**: Shadow-Map Size von 2048 auf 1024 reduzieren
- **Animation-Throttling**: requestAnimationFrame nutzt automatisch 60fps/120fps je nach Display

## 🛠️ Troubleshooting

### CORS-Fehler
- **Problem**: `file://` Protocol blockiert Module/GLB-Dateien
- **Lösung**: Lokalen HTTP-Server verwenden (`python -m http.server 8000`)

### Performance-Probleme  
- **Portfolio**: `devicePixelRatio` in `scene.js` reduzieren
- **Space Adventure**: `renderScale` in `GameEngine.js` von 6.0 auf 2.0 setzen

### GLB-Modell lädt nicht (Space Adventure)
- **Problem**: `need_some_space.glb` nicht gefunden
- **Check**: Browser Network-Tab öffnen, 404-Fehler prüfen
- **Lösung**: Pfad in `GameEngine.js` → `getModelPath()` anpassen

### Module nicht gefunden
- **Problem**: Import-Pfade incorrect
- **Portfolio**: Relative Pfade von `main.js` aus prüfen
- **Space Adventure**: Three.js CDN-Links in `01_index.html` prüfen

### GitHub Pages Deployment
- **Problem**: Paths funktionieren lokal aber nicht auf GitHub Pages
- **Lösung**: Repository-Name in URLs berücksichtigen (`/mywebsite/...`)
- **Check**: Base-URL in Browser Developer Tools prüfen

## 🚀 Deployment

### GitHub Pages Setup
1. **Repository Settings** → Pages → Source: Deploy from branch
2. **Branch**: `main` / `master` auswählen
3. **Folder**: `/ (root)` auswählen
4. **Custom Domain** (optional): `your-domain.com`

### Build & Deploy Workflow
```bash
# Lokaler Test
cd "meine website"
python -m http.server 8000

# Git Commands
git add .
git commit -m "Update Space Adventure + Portfolio"
git push origin main

# GitHub Pages URL (automatisch):
# https://patrickwwewe.github.io/mywebsite/
```

## � Credits

- **3D Engine**: [Three.js](https://threejs.org/) - WebGL 3D Library
- **3D Modeling**: [Blender](https://www.blender.org/) - Open Source 3D Creation Suite
- **Hosting**: [GitHub Pages](https://pages.github.com/) - Free Static Site Hosting
- **Horror Inspiration**: Space/Cosmic Horror Aesthetics

## 🏆 Features Übersicht

| Feature | Portfolio 🏠 | Space Adventure 🎮 |
|---------|-------------|-------------------|
| **3D Engine** | Three.js | Three.js |
| **Main Asset** | Shader Portal | Blender GLB Model |
| **Atmosphere** | Magical/Colorful | Horror/Dark |
| **Interaction** | Click → Navigation | Cinematic Experience |
| **Performance** | Optimized Shaders | Ultra-Sharp Rendering |
| **Responsive** | ✅ Mobile Ready | ✅ All Screen Sizes |
| **Loading** | Progress Animation | GLB Loading Screen |

---

**🌌 Explore the cosmos through the portal and experience the black hole! Viel Spaß mit deiner 3D-Website!** ✨🚀