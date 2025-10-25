// ====================================================================
//                           AUDIO MODULE
// ====================================================================
// ZWECK DIESES MODULS:
// Erstellt ein immersives Audio-Erlebnis für das Portal mit Web Audio API!
// Hyperspace-Sounds, Portal-Aktivierung und Ambient Space-Musik für
// maximale Sci-Fi-Atmosphäre ohne externe Dateien!
//
// AUDIO-KOMPONENTEN:
// 1. Hyperspace-Whoosh (Synthesized Noise + Filter Sweep)
// 2. Portal-Aktivierungs-Klang (Resonant Frequency + Reverb)
// 3. Ambient Space-Drone (Low Frequency Oscillator)
// 4. Flash-Zap (High Frequency Burst)
//
// TECHNISCHE UMSETZUNG:
// • Web Audio API: Für synthesized sounds ohne externe Files
// • OscillatorNode: Für Töne und Frequenz-Sweeps  
// • GainNode: Für Lautstärke-Kontrolle und Fades
// • BiquadFilterNode: Für Frequency-Filtering-Effekte
// • ConvolverNode: Für Hall/Reverb-Effekte
//
// WARUM SYNTHESIZED SOUNDS:
// • Keine externe Audio-Dateien nötig
// • Perfekte Synchronisation mit Animationen
// • Anpassbare Parameter in Echtzeit
// • Kleine Dateigröße und schnelles Laden
//
// ZUSAMMENHANG MIT ANDEREN MODULEN:
// → interactions.js: Triggert Sounds bei Portal-Aktivierung
// → tunnel.js: Spielt Hyperspace-Sound während Tunnel
// → main.js: Initialisiert Audio-Context beim Start
// ====================================================================

// Audio-Context für Web Audio API
let audioContext = null;
let masterGain = null;
let isAudioEnabled = false;

// Audio-Nodes für verschiedene Effekte
let ambientOscillator = null;
let hyperspaceNodes = {};

// ====================================================================
//                        AUDIO INITIALISIERUNG
// ====================================================================

/**
 * Initialisiert das Audio-System
 */
export function initializeAudio() {
  try {
    // Web Audio API Context erstellen
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Master Gain für Gesamtlautstärke
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.3, audioContext.currentTime); // 30% Lautstärke
    masterGain.connect(audioContext.destination);
    
    console.log('🔊 Audio-System initialisiert');
    
    // Ambient Space-Drone starten
    startAmbientDrone();
    
    isAudioEnabled = true;
    return true;
  } catch (error) {
    console.warn('⚠️ Audio nicht verfügbar:', error);
    return false;
  }
}

/**
 * Aktiviert Audio nach User-Interaktion (Browser-Requirement)
 */
export function enableAudio() {
  if (!audioContext) return;
  
  if (audioContext.state === 'suspended') {
    audioContext.resume().then(() => {
      console.log('🔊 Audio aktiviert nach User-Interaktion');
      isAudioEnabled = true;
    });
  }
}

// ====================================================================
//                        AMBIENT SPACE-DRONE
// ====================================================================

/**
 * Startet kontinuierlichen Space-Ambient-Sound
 */
function startAmbientDrone() {
  if (!audioContext) return;
  
  // Tieffrequenter Oszillator für Space-Atmosphäre
  ambientOscillator = audioContext.createOscillator();
  ambientOscillator.type = 'sawtooth';
  ambientOscillator.frequency.setValueAtTime(30, audioContext.currentTime); // Sehr tief
  
  // LFO für leichte Frequenz-Modulation
  const lfo = audioContext.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.1, audioContext.currentTime); // Sehr langsam
  
  const lfoGain = audioContext.createGain();
  lfoGain.gain.setValueAtTime(5, audioContext.currentTime); // Leichte Modulation
  
  lfo.connect(lfoGain);
  lfoGain.connect(ambientOscillator.frequency);
  
  // Filter für warmen Klang
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(200, audioContext.currentTime);
  filter.Q.setValueAtTime(1, audioContext.currentTime);
  
  // Gain für Ambient-Lautstärke
  const ambientGain = audioContext.createGain();
  ambientGain.gain.setValueAtTime(0.1, audioContext.currentTime); // Sehr leise
  
  // Verbindung: Oscillator → Filter → Gain → Master
  ambientOscillator.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(masterGain);
  
  // Start
  ambientOscillator.start();
  lfo.start();
  
  console.log('🌌 Ambient Space-Drone gestartet');
}

// ====================================================================
//                        PORTAL-AKTIVIERUNGS-SOUND
// ====================================================================

/**
 * Spielt Portal-Aktivierungs-Sound
 */
export function playPortalActivationSound() {
  if (!audioContext || !isAudioEnabled) return;
  
  const now = audioContext.currentTime;
  const duration = 1.5; // 1.5 Sekunden
  
  // Resonanter Oszillator für magischen Klang
  const osc = audioContext.createOscillator();
  osc.type = 'sine';
  
  // Frequenz-Sweep: 200Hz → 800Hz → 400Hz (magisches Ansteigen)
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  osc.frequency.exponentialRampToValueAtTime(400, now + duration);
  
  // Resonanter Filter für Sci-Fi-Klang
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, now);
  filter.Q.setValueAtTime(15, now); // Hohe Resonanz
  
  // Filter-Frequency folgt Oszillator
  filter.frequency.setValueAtTime(200, now);
  filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
  filter.frequency.exponentialRampToValueAtTime(400, now + duration);
  
  // Gain mit Fade-In und Fade-Out
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.4, now + 0.1); // Fade-In
  gain.gain.linearRampToValueAtTime(0.3, now + 0.8); // Sustain
  gain.gain.linearRampToValueAtTime(0, now + duration); // Fade-Out
  
  // Verbindung
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  // Start und Stop
  osc.start(now);
  osc.stop(now + duration);
  
  console.log('🌟 Portal-Aktivierungs-Sound gespielt');
}

// ====================================================================
//                        HYPERSPACE-SOUND
// ====================================================================

/**
 * Startet Hyperspace-Whoosh-Sound für Tunnel
 */
export function startHyperspaceSound() {
  if (!audioContext || !isAudioEnabled) return;
  
  const now = audioContext.currentTime;
  const duration = 2.5; // Tunnel-Duration
  
  // White Noise für Whoosh-Basis
  const bufferSize = audioContext.sampleRate * 2;
  const noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  // White Noise generieren
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  
  // High-Pass Filter für Whoosh-Charakter
  const highPass = audioContext.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.setValueAtTime(1000, now);
  highPass.frequency.exponentialRampToValueAtTime(5000, now + duration); // Ansteigend
  
  // Low-Pass Filter für Sweep-Effekt
  const lowPass = audioContext.createBiquadFilter();
  lowPass.type = 'lowpass';
  lowPass.frequency.setValueAtTime(8000, now);
  lowPass.frequency.exponentialRampToValueAtTime(2000, now + duration); // Abfallend
  lowPass.Q.setValueAtTime(5, now);
  
  // Doppler-Effekt Oszillator
  const dopplerOsc = audioContext.createOscillator();
  dopplerOsc.type = 'sine';
  dopplerOsc.frequency.setValueAtTime(400, now);
  dopplerOsc.frequency.exponentialRampToValueAtTime(1200, now + duration * 0.7);
  dopplerOsc.frequency.exponentialRampToValueAtTime(200, now + duration);
  
  // Gains
  const noiseGain = audioContext.createGain();
  noiseGain.gain.setValueAtTime(0, now);
  noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
  noiseGain.gain.linearRampToValueAtTime(0.5, now + duration * 0.8);
  noiseGain.gain.linearRampToValueAtTime(0, now + duration);
  
  const dopplerGain = audioContext.createGain();
  dopplerGain.gain.setValueAtTime(0, now);
  dopplerGain.gain.linearRampToValueAtTime(0.2, now + 0.2);
  dopplerGain.gain.linearRampToValueAtTime(0, now + duration);
  
  // Verbindungen
  noiseSource.connect(highPass);
  highPass.connect(lowPass);
  lowPass.connect(noiseGain);
  noiseGain.connect(masterGain);
  
  dopplerOsc.connect(dopplerGain);
  dopplerGain.connect(masterGain);
  
  // Start
  noiseSource.start(now);
  dopplerOsc.start(now);
  
  // Stop nach Duration
  noiseSource.stop(now + duration);
  dopplerOsc.stop(now + duration);
  
  // Referenz speichern für vorzeitiges Stoppen
  hyperspaceNodes = { noiseSource, dopplerOsc };
  
  console.log('🌪️ Hyperspace-Sound gestartet');
}

/**
 * Stoppt Hyperspace-Sound
 */
export function stopHyperspaceSound() {
  if (hyperspaceNodes.noiseSource) {
    try {
      hyperspaceNodes.noiseSource.stop();
      hyperspaceNodes.dopplerOsc.stop();
      console.log('🌙 Hyperspace-Sound gestoppt');
    } catch (e) {
      // Bereits gestoppt
    }
    hyperspaceNodes = {};
  }
}

// ====================================================================
//                        FLASH-ZAP-SOUND
// ====================================================================

/**
 * Spielt Flash-Zap-Sound beim Blitz
 */
export function playFlashZapSound() {
  if (!audioContext || !isAudioEnabled) return;
  
  const now = audioContext.currentTime;
  const duration = 0.1; // Sehr kurz wie der Flash
  
  // High-Frequency Burst
  const osc = audioContext.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(2000, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + duration);
  
  // Sharp Filter
  const filter = audioContext.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1500, now);
  filter.Q.setValueAtTime(20, now);
  
  // Quick Gain
  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  
  // Verbindung
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  
  // Start und Stop
  osc.start(now);
  osc.stop(now + duration);
  
  console.log('⚡ Flash-Zap-Sound gespielt');
}

// ====================================================================
//                        UTILITY FUNCTIONS
// ====================================================================

/**
 * Setzt Master-Lautstärke
 * @param {number} volume - Lautstärke (0-1)
 */
export function setMasterVolume(volume) {
  if (!masterGain) return;
  masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), audioContext.currentTime);
}

/**
 * Gibt zurück ob Audio verfügbar ist
 */
export function isAudioAvailable() {
  return isAudioEnabled && audioContext && audioContext.state === 'running';
}