/* ========================================== */
/* 🎮 GAMEENGINE.JS - HAUPTSPIEL-LOGIK       */
/* 🎯 Zweck: Lädt das GLB-Modell und zeigt es*/
/*          mit schwarzem Hintergrund an     */
/* ========================================== */

class GameEngine {
    constructor() {
        // Three.js Basis-Komponenten
        this.scene = null;           // 3D-Szene (wo alle Objekte leben)
        this.camera = null;          // Kamera (unsere Sicht)
        this.renderer = null;        // Renderer (zeichnet alles)
        this.model = null;           // Unser GLB-Modell
        this.isLoaded = false;       // Ist alles geladen?
        
        console.log("🚀 GameEngine erstellt");
    }

    // HAUPT-INITIALISIERUNG
    async initialize() {
        console.log("🔧 Initialisiere GameEngine...");
        
        try {
            // Schritt für Schritt Setup
            this.setupRenderer();       // Renderer erstellen
            this.setupScene();         // Szene erstellen  
            this.setupCamera();        // Kamera positionieren
            this.setupLighting();      // Beleuchtung hinzufügen
            
            // GLB-Modell laden
            await this.loadModel();
            
            // Game Loop starten
            this.startGameLoop();
            
            // Loading Screen verstecken
            this.hideLoadingScreen();
            
            this.isLoaded = true;
            console.log("✅ GameEngine erfolgreich initialisiert!");
            
        } catch (error) {
            console.error("❌ Fehler beim Initialisieren:", error);
            this.showError(error.message);
        }
    }

    // RENDERER SETUP - WO WIRD GEZEICHNET?
    setupRenderer() {
        console.log("🖼️ Erstelle Renderer...");
        
        // WebGL Renderer erstellen
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,           // Glatte Kanten
            alpha: true                // Transparenz möglich
        });
        
        // Größe setzen
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        // HORROR-HINTERGRUND: Fast schwarz mit minimalem Lila-Hauch
        this.renderer.setClearColor(0x0d0518, 1); // Sehr dunkles Lila-Schwarz - bedrohlich aber sichtbar
        
        // Schatten aktivieren
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Canvas zum HTML hinzufügen
        this.renderer.domElement.id = 'gameCanvas';
        document.body.appendChild(this.renderer.domElement);
        
        console.log("✅ Renderer erstellt");
    }

    // SZENE SETUP - DIE 3D-WELT
    setupScene() {
        console.log("🌍 Erstelle 3D-Szene...");
        
        this.scene = new THREE.Scene();
        
        // HORROR-NEBEL: Dicht und bedrohlich, aber nicht komplett verdeckend
        this.scene.fog = new THREE.Fog(0x0d0518, 50, 180); // Sehr dunkler Nebel, Horror-Atmosphäre
        
        console.log("✅ Szene erstellt");
    }

    // KAMERA SETUP - HORROR PERSPEKTIVE
    setupCamera() {
        console.log("📹 Positioniere Horror-Kamera...");
        
        // Weitwinkel-Kamera für DRAMATISCHEN Effekt
        this.camera = new THREE.PerspectiveCamera(
            90,                                    // BREITES FOV für Angst-Effekt
            window.innerWidth / window.innerHeight, // Seitenverhältnis
            0.01,                                  // SEHR NAH für Intensität
            10000                                  // SEHR WEIT für Riesigkeit
        );
        
        // DRAMA-KAMERA: Von unten nach oben blickend (macht alles RIESIG)
        this.camera.position.set(0, -20, 15);   // Tief unten positioniert
        this.camera.lookAt(0, 0, 0);            // Blickt nach oben zum schwarzen Loch
        
        console.log("✅ Horror-Kamera bereit - Weitwinkel für maximale Wirkung!");
    }

    // PERFEKTE HORROR-BALANCE: Sichtbar aber BEDROHLICH
    setupLighting() {
        console.log("💡 Erstelle BALANCE zwischen Sichtbarkeit und Horror...");
        
        // MINIMALE Ambient-Beleuchtung - nur damit es nicht komplett verschwindet
        const ambientLight = new THREE.AmbientLight(0x1a0033, 0.12); // Sehr schwach, dunkles Lila
        this.scene.add(ambientLight);
        
        // SUBTILES UNTEN-LICHT - nur gerade genug für Sichtbarkeit
        const bottomLight = new THREE.DirectionalLight(0x440088, 0.3); // Gedämpftes Lila
        bottomLight.position.set(0, -80, 10); // Von unten-schräg
        bottomLight.target.position.set(0, -10, 0); // Zielt auf unteren Teil
        this.scene.add(bottomLight);
        this.scene.add(bottomLight.target);
        
        // DRAMATISCHES RIM-LIGHT - erzeugt UNHEIMLICHE Silhouette
        const rimLight = new THREE.DirectionalLight(0x6600aa, 0.6); // Stärkeres Lila
        rimLight.position.set(0, 20, -100); // Von hinten-oben
        rimLight.target.position.set(0, 0, 0);
        this.scene.add(rimLight);
        this.scene.add(rimLight.target);
        
        // HORROR-SPOT von oben - DRAMATISCHER Schatten
        const horrorSpot = new THREE.SpotLight(0x0088cc, 0.8, 250, Math.PI / 3, 0.5); // Breiter Kegel
        horrorSpot.position.set(0, 100, 80); // Hoch oben
        horrorSpot.target.position.set(0, 0, 0); // Zielt ins Zentrum
        horrorSpot.castShadow = true;
        // Schatten-Qualität für DRAMATIK
        horrorSpot.shadow.mapSize.width = 2048;
        horrorSpot.shadow.mapSize.height = 2048;
        this.scene.add(horrorSpot);
        this.scene.add(horrorSpot.target);
        
        // BEDROHLICHES SEITENLICHT (nur eins, asymmetrisch für Unruhe)
        const threatLight = new THREE.PointLight(0xaa0044, 0.4, 100); // Rötliches Licht
        threatLight.position.set(-60, 10, 50); // Links-seitlich
        this.scene.add(threatLight);
        
        console.log("✅ HORROR-BALANCE erreicht - Sichtbar aber MAXIMAL bedrohlich!");
    }

    // GLB-MODELL LADEN
    async loadModel() {
        console.log("📦 Lade GLB-Modell...");
        
        // Loading Text aktualisieren
        this.updateLoadingText("Lade 3D-Modell...");
        
        return new Promise((resolve, reject) => {
            // GLTF Loader erstellen
            const loader = new THREE.GLTFLoader();
            
            // GLB-Datei laden
            loader.load(
                // Pfad zu deiner GLB-Datei
                '../../blender/need_some_space/need_some_space.glb',
                
                // Erfolg-Callback
                (gltf) => {
                    console.log("✅ GLB-Modell geladen!", gltf);
                    
                    // Modell zur Szene hinzufügen
                    this.model = gltf.scene;
                    
                    // MATERIAL-OPTIMIERUNG für bessere Sichtbarkeit
                    this.enhanceModelMaterials();
                    
                    this.scene.add(this.model);
                    
                    // Modell-Größe anpassen (falls nötig)
                    this.fitModelToView();
                    
                    resolve(gltf);
                },
                
                // Progress-Callback
                (progress) => {
                    const percent = (progress.loaded / progress.total * 100);
                    console.log(`📊 Loading: ${percent.toFixed(1)}%`);
                    this.updateProgress(percent);
                },
                
                // Fehler-Callback
                (error) => {
                    console.error("❌ Fehler beim Laden:", error);
                    reject(new Error("GLB-Modell konnte nicht geladen werden"));
                }
            );
        });
    }

    // MATERIAL-VERBESSERUNG für bessere Sichtbarkeit
    enhanceModelMaterials() {
        if (!this.model) return;
        
        this.model.traverse((child) => {
            if (child.isMesh && child.material) {
                const material = child.material;
                
                // SUBTILES Eigenleuchten - sichtbar aber NICHT hell
                if (material.emissive) {
                    // Minimales Eigenleuchten nur für Kontur-Sichtbarkeit
                    material.emissive.setHex(0x110022); // Sehr dunkles Lila-Leuchten
                    material.emissiveIntensity = 0.08; // Sehr schwach
                }
                
                // Erhöhe Metallic/Roughness für interessante Reflexionen
                if (material.metalness !== undefined) {
                    material.metalness = 0.8; // Mehr metallic
                }
                if (material.roughness !== undefined) {
                    material.roughness = 0.3; // Weniger rau = mehr Reflexion
                }
                
                // Material soll Licht besser empfangen
                material.needsUpdate = true;
            }
        });
        
        console.log("✅ Material-Enhancement aktiviert - bessere Sichtbarkeit!");
    }

    // HORROR-MODELL: RIESIG UND BEDROHLICH MACHEN
    fitModelToView() {
        if (!this.model) return;
        
        // Bounding Box berechnen
        const box = new THREE.Box3().setFromObject(this.model);
        const size = box.getSize(new THREE.Vector3()).length();
        const center = box.getCenter(new THREE.Vector3());
        
        // Modell zentrieren
        this.model.position.x += (this.model.position.x - center.x);
        this.model.position.y += (this.model.position.y - center.y);
        this.model.position.z += (this.model.position.z - center.z);
        
        // HORROR-EFFEKT: Modell RIESIG machen!
        const HORROR_SCALE = 8.0; // 8x größer = GIGANTISCH!
        this.model.scale.set(HORROR_SCALE, HORROR_SCALE, HORROR_SCALE);
        
        // Modell etwas nach oben verschieben für BEDROHLICHE Wirkung
        this.model.position.y += 15;
        
        // KAMERA BLEIBT UNTEN - macht das schwarze Loch ÜBERWÄLTIGEND
        // (Kamera-Position wird NICHT verändert - bleibt bei -20, 15)
        
        console.log("✅ HORROR-MODELL: 8x vergrößert und bedrohlich positioniert!");
        console.log(`🌌 Schwarzes Loch Größe: ${size * HORROR_SCALE} Einheiten`);
    }

    // HORROR GAME LOOP - BEDROHLICHE ANIMATION
    startGameLoop() {
        console.log("🔄 Starte HORROR Game Loop...");
        
        let time = 0; // Für Horror-Effekte
        
        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.016; // ~60fps timing
            
            if (this.model && this.isLoaded) {
                // LANGSAME, UNHEIMLICHE Rotation
                this.model.rotation.y += 0.002; // Noch langsamer für mehr SPANNUNG
                
                // BEDROHLICHES Pulsieren - unregelmäßiger
                const pulse = Math.sin(time * 0.3) * 0.15 + 1.0; // Langsameres, stärkeres Pulsieren
                this.model.scale.setScalar(8.0 * pulse);
                
                // VERSTÖRENDES Kamera-Wackeln
                this.camera.position.x = Math.sin(time * 0.08) * 0.8;
                this.camera.position.z = 15 + Math.cos(time * 0.12) * 1.5;
                this.camera.position.y = -20 + Math.sin(time * 0.05) * 0.5; // Leichtes Auf/Ab
                
                // HORROR-EFFEKT: Gelegentlich "Atmung" der Beleuchtung
                const breathe = Math.sin(time * 0.2) * 0.1 + 0.9; // 0.8 bis 1.0
                this.scene.traverse((object) => {
                    if (object.isLight && object.type !== 'AmbientLight') {
                        object.intensity *= breathe; // Lichter "atmen"
                    }
                });
                
                // KAMERA BLICKT IMMER ZUM SCHWARZEN LOCH (leicht versetzt für Unruhe)
                const lookOffset = Math.sin(time * 0.1) * 2;
                this.camera.lookAt(lookOffset, 0, 0);
            }
            
            // Alles rendern
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log("✅ HORROR Game Loop gestartet - Pulsierend und bedrohlich!");
    }

    // UI UPDATES
    updateLoadingText(text) {
        const element = document.getElementById('loadingText');
        if (element) {
            element.textContent = text;
        }
    }

    updateProgress(percent) {
        const bar = document.getElementById('loadingBar');
        if (bar) {
            bar.style.width = `${percent}%`;
        }
    }

    hideLoadingScreen() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 500);
        }
    }

    showError(message) {
        const errorDisplay = document.getElementById('errorDisplay');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = 'block';
        }
    }

    // FENSTER-RESIZE BEHANDELN
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

/* ========================================== */
/* 🎓 WAS MACHT DIESE DATEI?                 */
/* ========================================== */

/*
ZUSAMMENFASSUNG:

1. ERSTELLT 3D-SZENE:
   - Schwarzer Hintergrund
   - Kamera optimal positioniert
   - Beleuchtung für gute Sicht

2. LÄDT GLB-MODELL:
   - Von deinem blender/ Ordner
   - Mit Fortschrittsanzeige
   - Fehlerbehandlung

3. ZEIGT MODELL AN:
   - Zentriert und optimal skaliert
   - Dreht sich langsam (optional)
   - Läuft in Game Loop

4. UI INTEGRATION:
   - Versteckt Loading Screen
   - Zeigt Fehler an
   - Responsive bei Resize
*/