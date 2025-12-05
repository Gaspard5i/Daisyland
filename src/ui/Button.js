/**
 * Button.js
 * Composant de bouton réutilisable pour PixiJS
 */

import * as PIXI from 'pixi.js';
import { COLORS, UI, FONTS } from '../utils/Constants.js';

/**
 * Crée un bouton interactif avec label et marker
 */
export class Button extends PIXI.Container {
  /**
   * @param {Object} options - Options du bouton
   * @param {string} options.label - Texte du bouton
   * @param {number} options.x - Position X
   * @param {number} options.y - Position Y
   * @param {number} [options.width] - Largeur (défaut: UI.BUTTON.WIDTH)
   * @param {number} [options.height] - Hauteur (défaut: UI.BUTTON.HEIGHT)
   * @param {Function} [options.onClick] - Callback au clic
   * @param {boolean} [options.showMarker] - Afficher un marqueur sous le bouton
   */
  constructor(options) {
    super();
    
    const {
      label,
      x = 0,
      y = 0,
      width = UI.BUTTON.WIDTH,
      height = UI.BUTTON.HEIGHT,
      onClick = null,
      showMarker = false,
    } = options;
    
    this.x = x;
    this.y = y;
    this._onClick = onClick;
    
    // Fond du bouton
    this.bg = new PIXI.Graphics();
    this.bg.beginFill(COLORS.BUTTON_BG);
    this.bg.drawRoundedRect(-width / 2, -height / 2, width, height, UI.BUTTON.RADIUS);
    this.bg.endFill();
    this.addChild(this.bg);
    
    // Label
    const labelStyle = {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BUTTON,
      fill: COLORS.BUTTON_TEXT,
    };
    this.label = new PIXI.Text(label, labelStyle);
    this.label.anchor.set(0.5);
    this.addChild(this.label);
    
    // Marker optionnel
    if (showMarker) {
      this.marker = new PIXI.Graphics();
      this.marker.beginFill(COLORS.MARKER);
      this.marker.drawCircle(0, 0, UI.MARKER.RADIUS);
      this.marker.endFill();
      this.marker.y = UI.MARKER.OFFSET_Y;
      this.addChild(this.marker);
    }
    
    // Interactivité
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    this._setupEvents();
  }
  
  /**
   * Configure les événements du bouton
   */
  _setupEvents() {
    this.on('pointerover', this._onPointerOver.bind(this));
    this.on('pointerout', this._onPointerOut.bind(this));
    this.on('pointerdown', this._onPointerDown.bind(this));
  }
  
  _onPointerOver() {
    this.alpha = 0.85;
  }
  
  _onPointerOut() {
    this.alpha = 1;
  }
  
  _onPointerDown(event) {
    event.stopPropagation();
    if (this._onClick) {
      this._onClick();
    }
  }
  
  /**
   * Met à jour le texte du bouton
   * @param {string} text - Nouveau texte
   */
  setLabel(text) {
    this.label.text = text;
  }
  
  /**
   * Définit le callback de clic
   * @param {Function} callback - Fonction à appeler au clic
   */
  setOnClick(callback) {
    this._onClick = callback;
  }
  
  /**
   * Active/désactive le bouton
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.eventMode = enabled ? 'static' : 'none';
    this.alpha = enabled ? 1 : 0.5;
  }
}

/**
 * Fonction helper pour créer un bouton rapidement
 */
export function createButton(label, x, y, onClick, showMarker = true) {
  return new Button({ label, x, y, onClick, showMarker });
}
