// Konfiguration und Konstanten
export const CONFIG = {
  // Rendering
  CANVAS_ID: 'c',
  ANTIALIAS: true,
  PIXEL_RATIO: Math.min(window.devicePixelRatio, 2),
  
  // Camera
  FOV: 50,
  NEAR: 0.1,
  FAR: 200,
  INITIAL_POSITION: { x: 0, y: 0, z: 6 },
  
  // Portal
  PORTAL_SIZE: 4,
  PORTAL_RINGS: 3,
  
  // Particles
  PARTICLE_COUNT: 600,
  PARTICLE_SPREAD: { min: 2.6, max: 12.6 },
  
  // Animation
  ACTIVATION_DURATION: 2000,
  FLIGHT_DURATION: 900,
  FLASH_TRANSITION: 120,
  FLASH_FADEOUT: 50,
  MENU_DELAY: 400,
  
  // Torus
  TORUS_COUNT: 3,
  TORUS_BASE_RADIUS: 1.6,
  TORUS_RADIUS_INCREMENT: 0.35,
  
  // Columns
  COLUMN_COUNT: 6,
  COLUMN_RADIUS: 6.5,
  COLUMN_HEIGHT: 3
};

// Farb-Presets
export const COLOR_PRESETS = {
  magentaGold: { 
    col1: '#ff00c8', 
    col2: '#ffd166', 
    label: 'Magenta → Gold' 
  },
  cyanPurple: { 
    col1: '#00f0ff', 
    col2: '#9b00ff', 
    label: 'Cyan → Purple' 
  },
  aquaBlue: { 
    col1: '#00ffcc', 
    col2: '#0077ff', 
    label: 'Aqua → Blue' 
  }
};

// Standard-Preset
export const DEFAULT_PRESET = COLOR_PRESETS.magentaGold;
export const ACTIVATED_COLORS = COLOR_PRESETS.cyanPurple;

// Shader-Einstellungen
export const SHADER_DEFAULTS = {
  glow: 0.3,
  speed: 1.6,
  bloom: 2.9
};