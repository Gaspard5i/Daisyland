/**
 * WasteCell.js
 * Représente un déchet sur la grille avec animation d'arrivée par le courant
 */

import * as PIXI from 'pixi.js';
import { WasteManager } from '../systems/WasteManager.js';

export class WasteCell extends PIXI.Container {
  /**
   * @param {Object} wasteType - Type de déchet (de WASTE_TYPES)
   * @param {number} cellSize - Taille de la cellule
   * @param {string} direction - Direction d'arrivée ('left', 'right', 'top', 'bottom')
   * @param {Function} onCollect - Callback quand le déchet est collecté
   */
  constructor(wasteType, cellSize, direction = 'left', onCollect = null) {
    super();
    
    this.wasteType = wasteType;
    this.cellSize = cellSize;
    this.direction = direction;
    this.onCollect = onCollect;
    this.value = WasteManager.calculateValue(wasteType);
    this.isCollected = false;
    this.isAnimating = true;
    
    // Position de départ (hors écran selon la direction)
    this._setStartPosition();
    
    // Créer les éléments visuels
    this._createVisuals();
    
    // Rendre interactif
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', this._onCollect.bind(this));
    this.on('pointerover', this._onHover.bind(this));
    this.on('pointerout', this._onHoverEnd.bind(this));
    
    // Animation d'arrivée
    this._animateIn();
  }
  
  /**
   * Définit la position de départ selon la direction
   */
  _setStartPosition() {
    const offset = this.cellSize * 3; // Distance de départ
    
    switch (this.direction) {
      case 'left':
        this.startX = -offset;
        this.startY = 0;
        break;
      case 'right':
        this.startX = offset;
        this.startY = 0;
        break;
      case 'top':
        this.startX = 0;
        this.startY = -offset;
        break;
      case 'bottom':
        this.startX = 0;
        this.startY = offset;
        break;
      default:
        this.startX = -offset;
        this.startY = 0;
    }
    
    this.targetX = 0;
    this.targetY = 0;
  }
  
  /**
   * Crée les éléments visuels du déchet
   */
  _createVisuals() {
    // Fond de la cellule (eau)
    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0x5B7A8A, 0.3);
    this.bg.drawRoundedRect(
      -this.cellSize / 2 + 2,
      -this.cellSize / 2 + 2,
      this.cellSize - 4,
      this.cellSize - 4,
      8
    );
    this.bg.endFill();
    this.addChild(this.bg);
    
    // Déchet (forme colorée)
    this.waste = new PIXI.Graphics();
    this._drawWaste();
    this.addChild(this.waste);
    
    // Emoji/texte du déchet
    this.emoji = new PIXI.Text(this.wasteType.emoji, {
      fontSize: this.cellSize * 0.5,
    });
    this.emoji.anchor.set(0.5);
    this.addChild(this.emoji);
    
    // Valeur (cachée par défaut)
    this.valueText = new PIXI.Text(`+${this.value}`, {
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    this.valueText.anchor.set(0.5);
    this.valueText.y = -this.cellSize / 2 - 10;
    this.valueText.visible = false;
    this.addChild(this.valueText);
    
    // Position initiale (hors écran)
    this.waste.x = this.startX;
    this.waste.y = this.startY;
    this.emoji.x = this.startX;
    this.emoji.y = this.startY;
  }
  
  /**
   * Dessine la forme du déchet
   */
  _drawWaste() {
    this.waste.clear();
    this.waste.beginFill(this.wasteType.color, 0.8);
    
    // Forme légèrement aléatoire pour varier
    const size = this.cellSize * 0.35;
    const variation = Math.random() * 0.2 + 0.9;
    
    this.waste.drawEllipse(0, 0, size * variation, size / variation);
    this.waste.endFill();
    
    // Petit reflet
    this.waste.beginFill(0xFFFFFF, 0.3);
    this.waste.drawCircle(-size * 0.3, -size * 0.3, size * 0.2);
    this.waste.endFill();
  }
  
  /**
   * Animation d'arrivée par le courant
   */
  _animateIn() {
    const duration = 800 + Math.random() * 400; // 800-1200ms
    const startTime = Date.now();
    
    // Légère rotation pendant l'animation
    const startRotation = (Math.random() - 0.5) * 0.5;
    this.waste.rotation = startRotation;
    this.emoji.rotation = startRotation;
    
    const animate = () => {
      if (this.isCollected || this.destroyed) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      
      // Position avec léger mouvement de vague
      const waveOffset = Math.sin(elapsed * 0.005) * 3 * (1 - progress);
      const currentX = this.startX + (this.targetX - this.startX) * eased;
      const currentY = this.startY + (this.targetY - this.startY) * eased + waveOffset;
      
      this.waste.x = currentX;
      this.waste.y = currentY;
      this.emoji.x = currentX;
      this.emoji.y = currentY;
      
      // Rotation qui se stabilise
      const currentRotation = startRotation * (1 - eased);
      this.waste.rotation = currentRotation;
      this.emoji.rotation = currentRotation;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isAnimating = false;
        // Petite animation de flottement continue
        this._startFloating();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Animation de flottement continu (une fois arrivé)
   */
  _startFloating() {
    const floatSpeed = 0.002 + Math.random() * 0.001;
    const floatAmount = 2 + Math.random() * 2;
    const rotationAmount = 0.05;
    const startTime = Date.now();
    
    const float = () => {
      if (this.isCollected || this.destroyed) return;
      
      const elapsed = Date.now() - startTime;
      const offset = Math.sin(elapsed * floatSpeed) * floatAmount;
      const rotation = Math.sin(elapsed * floatSpeed * 0.7) * rotationAmount;
      
      this.waste.y = offset;
      this.emoji.y = offset;
      this.waste.rotation = rotation;
      this.emoji.rotation = rotation;
      
      requestAnimationFrame(float);
    };
    
    requestAnimationFrame(float);
  }
  
  /**
   * Hover sur le déchet
   */
  _onHover() {
    if (this.isCollected || this.isAnimating) return;
    
    this.valueText.visible = true;
    this.scale.set(1.1);
    this.bg.tint = 0xCCFFCC;
  }
  
  /**
   * Fin du hover
   */
  _onHoverEnd() {
    if (this.isCollected) return;
    
    this.valueText.visible = false;
    this.scale.set(1);
    this.bg.tint = 0xFFFFFF;
  }
  
  /**
   * Collecte le déchet
   */
  _onCollect() {
    if (this.isCollected || this.isAnimating) return;
    
    this.isCollected = true;
    this.eventMode = 'none';
    
    // Ajouter à la jauge (sera implémenté plus tard)
    WasteManager.addWaste(this.wasteType, this.value);
    
    // Animation de collecte
    this._animateCollect();
    
    // Callback
    if (this.onCollect) {
      this.onCollect(this);
    }
  }
  
  /**
   * Animation de collecte
   */
  _animateCollect() {
    const duration = 300;
    const startTime = Date.now();
    const startScale = this.scale.x;
    
    // Afficher la valeur
    this.valueText.visible = true;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale qui diminue
      const scale = startScale * (1 - progress);
      this.waste.scale.set(scale);
      this.emoji.scale.set(scale);
      
      // Valeur qui monte
      this.valueText.y = -this.cellSize / 2 - 10 - progress * 30;
      this.valueText.alpha = 1 - progress;
      
      // Rotation rapide
      this.waste.rotation += 0.2;
      this.emoji.rotation += 0.2;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Détruire après animation
        this.destroy();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    this.isCollected = true;
    super.destroy({ children: true });
  }
}
