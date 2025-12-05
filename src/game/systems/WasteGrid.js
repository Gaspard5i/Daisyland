/**
 * WasteGrid.js
 * Grille de collecte de déchets avec spawn par courant
 */

import * as PIXI from 'pixi.js';
import { WasteCell } from '../entities/WasteCell.js';
import { WasteManager } from '../systems/WasteManager.js';

export class WasteGrid extends PIXI.Container {
  /**
   * @param {Object} options - Options de configuration
   */
  constructor(options = {}) {
    super();
    
    this.cols = options.cols || 6;
    this.rows = options.rows || 5;
    this.cellSize = options.cellSize || 70;
    this.spawnInterval = options.spawnInterval || 2000; // ms entre chaque spawn
    this.maxWaste = options.maxWaste || 15; // Nombre max de déchets sur la grille
    
    // Directions du courant (pondérées)
    this.currentDirections = [
      { dir: 'left', weight: 40 },   // Courant venant de la gauche (principal)
      { dir: 'right', weight: 20 },  // Courant venant de la droite
      { dir: 'top', weight: 25 },    // Courant venant du haut
      { dir: 'bottom', weight: 15 }, // Courant venant du bas
    ];
    
    // Grille de cellules (null = vide, WasteCell = occupée)
    this.grid = [];
    this.wasteCells = [];
    
    // Timer de spawn
    this.spawnTimer = null;
    this.isActive = false;
    
    // Créer la grille visuelle
    this._createGrid();
  }
  
  /**
   * Crée la grille visuelle (fond d'eau)
   */
  _createGrid() {
    const width = this.cols * this.cellSize;
    const height = this.rows * this.cellSize;
    
    // Fond d'eau
    const bg = new PIXI.Graphics();
    
    // Eau de fond
    bg.beginFill(0x4A6670);
    bg.drawRoundedRect(0, 0, width, height, 15);
    bg.endFill();
    
    // Vagues décoratives
    bg.lineStyle(2, 0x5B7A8A, 0.5);
    for (let i = 0; i < 8; i++) {
      const waveY = 20 + i * (height / 8);
      bg.moveTo(10, waveY);
      for (let x = 10; x < width - 10; x += 25) {
        bg.quadraticCurveTo(x + 12, waveY - 5, x + 25, waveY);
      }
    }
    bg.lineStyle(0);
    
    // Grille légère
    bg.lineStyle(1, 0x5B7A8A, 0.3);
    for (let col = 1; col < this.cols; col++) {
      bg.moveTo(col * this.cellSize, 5);
      bg.lineTo(col * this.cellSize, height - 5);
    }
    for (let row = 1; row < this.rows; row++) {
      bg.moveTo(5, row * this.cellSize);
      bg.lineTo(width - 5, row * this.cellSize);
    }
    bg.lineStyle(0);
    
    this.addChild(bg);
    this.bg = bg;
    
    // Initialiser la grille logique
    for (let row = 0; row < this.rows; row++) {
      this.grid[row] = [];
      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = null;
      }
    }
    
    // Container pour les déchets (par-dessus le fond)
    this.wasteContainer = new PIXI.Container();
    this.addChild(this.wasteContainer);
    
    // Indicateurs de direction du courant
    this._createCurrentIndicators();
  }
  
  /**
   * Crée les indicateurs visuels de direction du courant
   */
  _createCurrentIndicators() {
    const width = this.cols * this.cellSize;
    const height = this.rows * this.cellSize;
    
    // Flèches de courant sur les bords
    const arrows = new PIXI.Graphics();
    arrows.alpha = 0.4;
    
    // Flèches gauche → droite (courant principal)
    arrows.beginFill(0x81D4FA);
    for (let i = 0; i < 3; i++) {
      const y = height * (0.25 + i * 0.25);
      this._drawArrow(arrows, -15, y, 'right');
    }
    
    // Flèches haut → bas
    for (let i = 0; i < 2; i++) {
      const x = width * (0.33 + i * 0.33);
      this._drawArrow(arrows, x, -15, 'down');
    }
    
    arrows.endFill();
    this.addChild(arrows);
    
    // Animation des flèches
    this._animateCurrentIndicators(arrows);
  }
  
  /**
   * Dessine une flèche
   */
  _drawArrow(graphics, x, y, direction) {
    const size = 12;
    graphics.moveTo(x, y);
    
    switch (direction) {
      case 'right':
        graphics.lineTo(x + size, y - size / 2);
        graphics.lineTo(x + size, y + size / 2);
        break;
      case 'down':
        graphics.lineTo(x - size / 2, y + size);
        graphics.lineTo(x + size / 2, y + size);
        break;
      case 'left':
        graphics.lineTo(x - size, y - size / 2);
        graphics.lineTo(x - size, y + size / 2);
        break;
      case 'up':
        graphics.lineTo(x - size / 2, y - size);
        graphics.lineTo(x + size / 2, y - size);
        break;
    }
    graphics.closePath();
  }
  
  /**
   * Animation des indicateurs de courant
   */
  _animateCurrentIndicators(arrows) {
    let time = 0;
    const animate = () => {
      if (this.destroyed) return;
      
      time += 0.02;
      arrows.alpha = 0.3 + Math.sin(time) * 0.15;
      
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }
  
  /**
   * Démarre le spawn automatique de déchets
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Spawn initial de quelques déchets
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this._spawnWaste(), i * 500);
    }
    
    // Spawn régulier
    this.spawnTimer = setInterval(() => {
      this._spawnWaste();
    }, this.spawnInterval);
  }
  
  /**
   * Arrête le spawn
   */
  stop() {
    this.isActive = false;
    
    if (this.spawnTimer) {
      clearInterval(this.spawnTimer);
      this.spawnTimer = null;
    }
  }
  
  /**
   * Fait apparaître un nouveau déchet
   */
  _spawnWaste() {
    if (!this.isActive) return;
    
    // Vérifier le nombre max
    if (this.wasteCells.length >= this.maxWaste) return;
    
    // Trouver une cellule vide
    const emptyCell = this._getRandomEmptyCell();
    if (!emptyCell) return;
    
    const { row, col } = emptyCell;
    
    // Déterminer la direction du courant
    const direction = this._getRandomDirection(col, row);
    
    // Créer le déchet
    const wasteType = WasteManager.getRandomWasteType();
    const waste = new WasteCell(
      wasteType,
      this.cellSize,
      direction,
      (cell) => this._onWasteCollected(cell, row, col)
    );
    
    // Positionner au centre de la cellule
    waste.x = col * this.cellSize + this.cellSize / 2;
    waste.y = row * this.cellSize + this.cellSize / 2;
    
    // Ajouter à la grille
    this.grid[row][col] = waste;
    this.wasteCells.push(waste);
    this.wasteContainer.addChild(waste);
  }
  
  /**
   * Trouve une cellule vide aléatoire
   */
  _getRandomEmptyCell() {
    const emptyCells = [];
    
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === null) {
          emptyCells.push({ row, col });
        }
      }
    }
    
    if (emptyCells.length === 0) return null;
    
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  /**
   * Détermine la direction du courant selon la position
   */
  _getRandomDirection(col, row) {
    // Les cellules sur les bords ont des directions préférentielles
    const dirs = [];
    
    // Côté gauche → vient de la gauche
    if (col <= 1) {
      dirs.push('left', 'left', 'left'); // Triple poids
    }
    // Côté droit → vient de la droite
    if (col >= this.cols - 2) {
      dirs.push('right', 'right');
    }
    // Côté haut → vient du haut
    if (row <= 1) {
      dirs.push('top', 'top');
    }
    // Côté bas → vient du bas
    if (row >= this.rows - 2) {
      dirs.push('bottom');
    }
    
    // Au centre, direction aléatoire avec poids
    if (dirs.length === 0) {
      const totalWeight = this.currentDirections.reduce((sum, d) => sum + d.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const { dir, weight } of this.currentDirections) {
        random -= weight;
        if (random <= 0) {
          return dir;
        }
      }
    }
    
    return dirs[Math.floor(Math.random() * dirs.length)] || 'left';
  }
  
  /**
   * Callback quand un déchet est collecté
   */
  _onWasteCollected(cell, row, col) {
    // Retirer de la grille
    this.grid[row][col] = null;
    this.wasteCells = this.wasteCells.filter(w => w !== cell);
  }
  
  /**
   * Retourne les dimensions de la grille
   */
  getSize() {
    return {
      width: this.cols * this.cellSize,
      height: this.rows * this.cellSize,
    };
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    this.stop();
    
    // Détruire tous les déchets
    this.wasteCells.forEach(waste => {
      if (!waste.destroyed) {
        waste.destroy();
      }
    });
    this.wasteCells = [];
    
    super.destroy({ children: true });
  }
}
