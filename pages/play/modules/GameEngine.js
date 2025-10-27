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
        
        // SCHWARZER HINTERGRUND
        this.renderer.setClearColor(0x000000, 1); // Schwarz, 100% Deckkraft
        
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
        
        // Optional: Nebel für Tiefe
        this.scene.fog = new THREE.Fog(0x000000, 10, 50);
        
        console.log("✅ Szene erstellt");
    }

    // KAMERA SETUP - UNSERE SICHT
    setupCamera() {
        console.log("📹 Positioniere Kamera...");
        
        // Perspektiv-Kamera (wie unsere Augen)
        this.camera = new THREE.PerspectiveCamera(
            75,                                    // FOV (Sichtfeld)
            window.innerWidth / window.innerHeight, // Seitenverhältnis
            0.1,                                   // Nahebene
            1000                                   // Fernebene
        );
        
        // Kamera-Position - so dass wir alles sehen
        this.camera.position.set(0, 5, 10);    // x=0, y=5 (oben), z=10 (zurück)
        this.camera.lookAt(0, 0, 0);           // Schaut zum Zentrum
        
        console.log("✅ Kamera positioniert");
    }

    // BELEUCHTUNG SETUP
    setupLighting() {
        console.log("💡 Füge Beleuchtung hinzu...");
        
        // Ambiente Beleuchtung (überall gleich hell)
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Direktionale Beleuchtung (wie Sonne)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        console.log("✅ Beleuchtung hinzugefügt");
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

    // MODELL AN BILDSCHIRM ANPASSEN
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
        
        // Kamera optimal positionieren
        const distance = size * 1.5; // 1.5x der Modell-Größe
        this.camera.position.set(0, distance * 0.5, distance);
        this.camera.lookAt(0, 0, 0);
        
        console.log("✅ Modell an Sicht angepasst");
    }

    // GAME LOOP - ANIMATION
    startGameLoop() {
        console.log("🔄 Starte Game Loop...");
        
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Modell langsam drehen (optional)
            if (this.model && this.isLoaded) {
                this.model.rotation.y += 0.005; // Langssam um Y-Achse drehen
            }
            
            // Alles rendern
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
        console.log("✅ Game Loop gestartet");
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