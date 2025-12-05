/**
 * Tooltip.js
 * Composant réutilisable pour afficher une bulle d'info au survol
 */

import { Container, Graphics, Text } from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

// Instance unique du tooltip (singleton)
let tooltipInstance = null;

/**
 * Classe Tooltip - Bulle d'information au survol
 */
export class Tooltip extends Container {
  constructor() {
    super();
    
    this.padding = 14;
    this.maxWidth = 250;
    this.visible = false;
    this.zIndex = 9999;
    
    // Fond de la bulle
    this.background = new Graphics();
    this.addChild(this.background);
    
    // Texte
    this.textContent = new Text({
      text: '',
      style: {
        fontFamily: FONTS.DEFAULT,
        fontSize: 18,
        fill: 0xffffff,
        wordWrap: true,
        wordWrapWidth: this.maxWidth - this.padding * 2,
      }
    });
    this.textContent.position.set(this.padding, this.padding);
    this.addChild(this.textContent);
  }

  /**
   * Affiche le tooltip avec le texte donné
   * @param {string} text - Texte à afficher
   * @param {number} x - Position X globale
   * @param {number} y - Position Y globale
   */
  show(text, x, y) {
    this.textContent.text = text;
    
    // Calculer les dimensions
    const width = Math.min(this.textContent.width + this.padding * 2, this.maxWidth);
    const height = this.textContent.height + this.padding * 2;
    
    // Dessiner le fond
    this.background.clear();
    
    // Fond principal
    this.background.roundRect(0, 0, width, height, 8);
    this.background.fill({ color: 0x2a2a2a, alpha: 0.95 });
    
    // Bordure
    this.background.roundRect(0, 0, width, height, 8);
    this.background.stroke({ color: 0x555555, width: 2 });
    
    // Positionner le tooltip (éviter de sortir de l'écran)
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Par défaut, afficher en dessous à droite
    let posX = x + 15;
    let posY = y + 15;
    
    // Ajuster si sort de l'écran à droite
    if (posX + width > screenWidth - 10) {
      posX = x - width - 10;
    }
    
    // Ajuster si sort de l'écran en bas
    if (posY + height > screenHeight - 10) {
      posY = y - height - 10;
    }
    
    this.position.set(posX, posY);
    this.visible = true;
  }

  /**
   * Cache le tooltip
   */
  hide() {
    this.visible = false;
  }
}

/**
 * Récupère l'instance unique du Tooltip
 * @param {Container} stage - Stage PixiJS pour ajouter le tooltip
 * @returns {Tooltip}
 */
export function getTooltip(stage) {
  if (!tooltipInstance) {
    tooltipInstance = new Tooltip();
    if (stage) {
      stage.addChild(tooltipInstance);
    }
  }
  return tooltipInstance;
}

/**
 * Initialise le système de tooltips avec le stage
 * @param {Container} stage - Stage PixiJS principal
 */
export function initTooltip(stage) {
  if (!tooltipInstance) {
    tooltipInstance = new Tooltip();
  }
  if (stage && !tooltipInstance.parent) {
    stage.addChild(tooltipInstance);
  }
  return tooltipInstance;
}

/**
 * Ajoute un tooltip à un élément interactif
 * @param {Container} element - Élément PixiJS
 * @param {string|Function} text - Texte du tooltip ou fonction retournant le texte
 */
export function addTooltip(element, text) {
  element.eventMode = 'static';
  element.cursor = 'pointer';
  
  element.on('pointerenter', (event) => {
    // S'assurer que le tooltip existe
    if (!tooltipInstance) return;
    
    const tooltipText = typeof text === 'function' ? text() : text;
    const globalPos = event.global;
    tooltipInstance.show(tooltipText, globalPos.x, globalPos.y);
    
    // Remettre le tooltip au premier plan
    if (tooltipInstance.parent) {
      const parent = tooltipInstance.parent;
      parent.removeChild(tooltipInstance);
      parent.addChild(tooltipInstance);
    }
  });
  
  element.on('pointermove', (event) => {
    if (tooltipInstance && tooltipInstance.visible) {
      const tooltipText = typeof text === 'function' ? text() : text;
      tooltipInstance.show(tooltipText, event.global.x, event.global.y);
    }
  });
  
  element.on('pointerleave', () => {
    if (tooltipInstance) {
      tooltipInstance.hide();
    }
  });
}
