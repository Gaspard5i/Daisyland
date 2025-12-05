/**
 * Constants.js
 * Constantes globales du jeu (tailles, couleurs, configuration)
 */

// ==================== MAP ====================
export const MAP = {
  WIDTH: 2400,
  HEIGHT: 1800,
};

// Marges des différentes zones
export const MARGINS = {
  CLOUD: 100,   // Épaisseur des nuages (blanc) - limite de la map
  WATER: 250,   // Épaisseur de l'eau (bleu)
};

// Zones calculées automatiquement
export const ZONES = {
  // Zone d'eau
  WATER: {
    X: MARGINS.CLOUD,
    Y: MARGINS.CLOUD,
    WIDTH: MAP.WIDTH - MARGINS.CLOUD * 2,
    HEIGHT: MAP.HEIGHT - MARGINS.CLOUD * 2,
  },
  // Zone de terre
  LAND: {
    X: MARGINS.CLOUD + MARGINS.WATER,
    Y: MARGINS.CLOUD + MARGINS.WATER,
    WIDTH: MAP.WIDTH - (MARGINS.CLOUD + MARGINS.WATER) * 2,
    HEIGHT: MAP.HEIGHT - (MARGINS.CLOUD + MARGINS.WATER) * 2,
  },
};

// ==================== COULEURS ====================
export const COLORS = {
  // Map
  CLOUDS: 0xf0f0f0,
  CLOUDS_HIGHLIGHT: 0xffffff,
  WATER: 0x4499dd,
  WATER_WAVES: 0x66bbee,
  LAND: 0x66cc66,
  GRASS: 0x55aa55,
  TREES: 0x338833,
  
  // UI
  BUTTON_BG: 0xffffff,
  BUTTON_TEXT: 0x000000,
  MARKER: 0xffdd00,
  
  // Mini-jeux
  MINIGAME_BG: 0x333366,
  
  // Général
  BACKGROUND: 0x1099bb,
};

// ==================== UI ====================
export const UI = {
  BUTTON: {
    WIDTH: 160,
    HEIGHT: 48,
    RADIUS: 8,
  },
  MARKER: {
    RADIUS: 6,
    OFFSET_Y: 40,
  },
};

// ==================== FONTS ====================
export const FONTS = {
  DEFAULT: 'Arial',
  SIZES: {
    TITLE: 36,
    SUBTITLE: 30,
    BODY: 18,
    BUTTON: 16,
    SMALL: 14,
  },
};

// ==================== ZOOM ====================
export const ZOOM = {
  MIN_MARGIN: 1.2,  // Marge ajoutée au zoom minimum (20%)
  MAX: 2,
  STEP: 0.1,
};
