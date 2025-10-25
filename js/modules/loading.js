// ====================================================================
//                        LOADING SYSTEM
// ====================================================================
// Diese Datei verwaltet das Ladesystem und den Ladebalken
// - Ladefortschritt anzeigen während Szenen-Initialisierung  
// - Smooth Ein-/Ausblenden des Loading-Overlays
// - Benutzer-Feedback während des Ladevorgangs
// ====================================================================

// ====================================================================
//                      LOADING UI ELEMENTE
// ====================================================================

// DOM-Elemente für Loading-Interface
const loadingEl = document.getElementById('loading');           // Haupt-Overlay
const loadingBar = document.getElementById('loading-bar');       // Fortschrittsbalken
const loadingText = document.getElementById('loading-text');     // Status-Text

// ====================================================================
//                      LOADING FUNKTIONEN
// ====================================================================

/**
 * Setzt Ladefortschritt und optional Status-Text
 * @param {number|null} percentage - Fortschritt in Prozent (0-100)
 * @param {string} [text] - Optional: Status-Text anzeigen
 */
export function setLoadingProgress(percentage, text) {
  // Ladebalken aktualisieren (falls Prozentsatz gegeben)
  if (percentage !== null && loadingBar) {
    // Wert zwischen 0 und 100 begrenzen
    const clampedPct = Math.max(0, Math.min(100, percentage));
    loadingBar.style.width = clampedPct + '%';
    
    console.log(`⏳ Ladefortschritt: ${clampedPct}%`);
  }
  
  // Status-Text aktualisieren (falls gegeben)
  if (text && loadingText) {
    loadingText.textContent = text;
    console.log(`📝 Loading-Status: ${text}`);
  }
}

/**
 * Versteckt das Loading-Overlay mit smooth Fade-Out Animation
 */
export function hideLoading() {
  if (!loadingEl) {
    console.warn('⚠️ Loading-Element nicht gefunden!');
    return;
  }
  
  console.log('✅ Verstecke Loading-Overlay...');
  
  // Fade-Out Animation starten
  loadingEl.style.opacity = '0';
  
  // Nach Animation: Element komplett ausblenden
  setTimeout(() => {
    loadingEl.style.display = 'none';
    console.log('✨ Loading-Overlay komplett versteckt');
  }, 350); // Wartet auf CSS-Transition (300ms + Buffer)
}

/**
 * Zeigt das Loading-Overlay wieder an (falls benötigt)
 * @param {string} [text] - Optional: Initial-Text
 */
export function showLoading(text = 'Lädt...') {
  if (!loadingEl) {
    console.warn('⚠️ Loading-Element nicht gefunden!');
    return;
  }
  
  console.log('⏳ Zeige Loading-Overlay...');
  
  // Element wieder sichtbar machen
  loadingEl.style.display = 'flex';
  loadingEl.style.opacity = '1';
  
  // Initial-Werte setzen
  setLoadingProgress(0, text);
}

// ====================================================================
//                      LOADING SEQUENZ
// ====================================================================

/**
 * Simuliert typische Ladesequenz für 3D-Szene
 * @param {Function} callback - Wird nach Abschluss aufgerufen
 */
export function runLoadingSequence(callback) {
  console.log('🎬 Starte Ladesequenz...');
  
  // Lade-Schritte mit realistischen Pausen
  const steps = [
    { progress: 5, text: 'Erstelle Renderer', delay: 100 },
    { progress: 18, text: 'Renderer bereit', delay: 200 },
    { progress: 36, text: 'Post-Processing geladen', delay: 150 },
    { progress: 64, text: 'Shader kompiliert', delay: 300 },
    { progress: 78, text: 'Portal erstellt', delay: 100 },
    { progress: 88, text: 'Partikel bereit', delay: 150 },
    { progress: 100, text: 'Fertig — Szene bereit', delay: 100 }
  ];
  
  let stepIndex = 0;
  
  function executeStep() {
    if (stepIndex >= steps.length) {
      // Sequenz abgeschlossen
      setTimeout(() => {
        hideLoading();
        if (callback) callback();
      }, 200);
      return;
    }
    
    const step = steps[stepIndex];
    setLoadingProgress(step.progress, step.text);
    
    stepIndex++;
    setTimeout(executeStep, step.delay);
  }
  
  executeStep();
}

// ====================================================================
//                      AUTO-HIDE NACH RENDER
// ====================================================================

let startTime = null;
let autoHideEnabled = true;

/**
 * Aktiviert automatisches Verstecken nach ersten Render-Frames
 * @param {number} [delay=80] - Verzögerung in ms nach erstem Frame
 */
export function enableAutoHide(delay = 80) {
  startTime = performance.now();
  autoHideEnabled = true;
  
  console.log(`⚡ Auto-Hide aktiviert (${delay}ms Verzögerung)`);
}

/**
 * Prüft ob Auto-Hide ausgeführt werden soll (in Render-Loop aufrufen)
 */
export function checkAutoHide() {
  if (!autoHideEnabled || !startTime) return;
  
  // Nach erstem Frame und Wartezeit
  if (performance.now() - startTime > 80) {
    setLoadingProgress(100, 'Fertig — Szene bereit');
    hideLoading();
    autoHideEnabled = false;
  }
}

// ====================================================================
//                      UTILITY FUNKTIONEN
// ====================================================================

/**
 * Setzt Loading auf Fehler-Zustand
 * @param {string} errorMessage - Fehlernachricht
 */
export function setLoadingError(errorMessage) {
  console.error('❌ Loading-Fehler:', errorMessage);
  
  if (loadingText) {
    loadingText.textContent = `Fehler: ${errorMessage}`;
    loadingText.style.color = '#ff6b6b'; // Rot für Fehler
  }
  
  if (loadingBar) {
    loadingBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff9999)';
  }
}

/**
 * Reset Loading auf Standard-Design
 */
export function resetLoadingStyle() {
  if (loadingText) {
    loadingText.style.color = ''; // Zurück zu CSS-Standard
  }
  
  if (loadingBar) {
    loadingBar.style.background = 'linear-gradient(90deg, var(--neon), var(--neon-2))';
  }
}