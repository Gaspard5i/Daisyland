/**
 * FarmScene.js
 * Scène principale du jeu - La carte avec la terre, l'eau et les nuages
 */

import * as PIXI from 'pixi.js';
import { InputManager } from '../../core/InputManager.js';
import { Button } from '../../ui/Button.js';
import { MAP, ZONES, COLORS, MARGINS } from '../../utils/Constants.js';

export class FarmScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Function} onOpenLocation - Callback quand on clique sur un lieu
   */
  constructor(app, onOpenLocation) {
    super();
    
    this.app = app;
    this.onOpenLocation = onOpenLocation;
    
    // Conteneurs
    this.mapContainer = new PIXI.Container();
    this.addChild(this.mapContainer);
    
    // Input manager pour le drag/zoom
    this.inputManager = new InputManager(app, this.mapContainer);
    this.inputManager.setMapSize(MAP.WIDTH, MAP.HEIGHT);
    
    // Dessiner le fond
    this._createBackground();
    
    // Créer les boutons/lieux
    this._createLocations();
    
    // Centrer la map
    this._centerMap();
    
    // Resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }
  
  /**
   * Centre la map au milieu de l'écran
   */
  _centerMap() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const zoom = this.inputManager.getZoom();
    const scaledMapWidth = MAP.WIDTH * zoom;
    const scaledMapHeight = MAP.HEIGHT * zoom;
    
    // Centrer la vue sur le milieu de la map
    this.mapContainer.x = (screenWidth - scaledMapWidth) / 2;
    this.mapContainer.y = (screenHeight - scaledMapHeight) / 2;
  }
  
  /**
   * Crée le fond de la map (nuages, eau, terre)
   */
  _createBackground() {
    const bg = new PIXI.Graphics();
    
    // 1. Nuages (blanc) - Couche extérieure
    bg.beginFill(COLORS.CLOUDS);
    bg.drawRect(0, 0, MAP.WIDTH, MAP.HEIGHT);
    bg.endFill();
    
    // Nuages décoratifs
    bg.beginFill(COLORS.CLOUDS_HIGHLIGHT);
    const cloudPositions = this._getCloudPositions();
    cloudPositions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 25 + Math.random() * 15);
      bg.drawCircle(pos.x + 20, pos.y - 10, 20 + Math.random() * 10);
      bg.drawCircle(pos.x - 15, pos.y + 5, 18 + Math.random() * 10);
    });
    bg.endFill();
    
    // 2. Eau (bleu)
    bg.beginFill(COLORS.WATER);
    bg.drawRoundedRect(
      ZONES.WATER.X, ZONES.WATER.Y,
      ZONES.WATER.WIDTH, ZONES.WATER.HEIGHT, 20
    );
    bg.endFill();
    
    // Vagues décoratives
    this._drawWaves(bg);
    
    // 3. Terre (vert)
    bg.beginFill(COLORS.LAND);
    bg.drawRoundedRect(
      ZONES.LAND.X, ZONES.LAND.Y,
      ZONES.LAND.WIDTH, ZONES.LAND.HEIGHT, 30
    );
    bg.endFill();
    
    // Herbe décorative
    bg.beginFill(COLORS.GRASS);
    for (let i = 0; i < 30; i++) {
      const gx = ZONES.LAND.X + 50 + Math.random() * (ZONES.LAND.WIDTH - 100);
      const gy = ZONES.LAND.Y + 50 + Math.random() * (ZONES.LAND.HEIGHT - 100);
      bg.drawCircle(gx, gy, 8 + Math.random() * 12);
    }
    bg.endFill();
    
    // Arbres
    bg.beginFill(COLORS.TREES);
    const treePositions = this._getTreePositions();
    treePositions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 20);
      bg.drawCircle(pos.x + 15, pos.y + 8, 15);
      bg.drawCircle(pos.x - 12, pos.y + 5, 18);
    });
    bg.endFill();
    
    this.mapContainer.addChild(bg);
  }
  
  /**
   * Positions des nuages décoratifs
   */
  _getCloudPositions() {
    return [
      { x: 40, y: 40 }, { x: 120, y: 30 }, { x: 200, y: 50 },
      { x: MAP.WIDTH - 40, y: 40 }, { x: MAP.WIDTH - 120, y: 60 },
      { x: 40, y: MAP.HEIGHT - 40 }, { x: 150, y: MAP.HEIGHT - 50 },
      { x: MAP.WIDTH - 60, y: MAP.HEIGHT - 40 }, { x: MAP.WIDTH - 150, y: MAP.HEIGHT - 30 },
      { x: 30, y: 200 }, { x: 50, y: 400 }, { x: 40, y: 600 },
      { x: MAP.WIDTH - 30, y: 250 }, { x: MAP.WIDTH - 50, y: 500 }, { x: MAP.WIDTH - 40, y: 750 },
    ];
  }
  
  /**
   * Positions des arbres
   */
  _getTreePositions() {
    return [
      { x: ZONES.LAND.X + 80, y: ZONES.LAND.Y + 80 },
      { x: ZONES.LAND.X + ZONES.LAND.WIDTH - 80, y: ZONES.LAND.Y + 100 },
      { x: ZONES.LAND.X + 100, y: ZONES.LAND.Y + ZONES.LAND.HEIGHT - 100 },
      { x: ZONES.LAND.X + ZONES.LAND.WIDTH - 100, y: ZONES.LAND.Y + ZONES.LAND.HEIGHT - 80 },
      { x: ZONES.LAND.X + ZONES.LAND.WIDTH / 2, y: ZONES.LAND.Y + 60 },
    ];
  }
  
  /**
   * Dessine les vagues sur l'eau
   */
  _drawWaves(bg) {
    bg.lineStyle(2, COLORS.WATER_WAVES, 0.5);
    
    // Vagues en haut
    for (let i = 0; i < 8; i++) {
      const waveY = ZONES.WATER.Y + 30 + i * 40;
      if (waveY < ZONES.LAND.Y - 10) {
        bg.moveTo(ZONES.WATER.X + 20, waveY);
        for (let x = ZONES.WATER.X + 20; x < ZONES.WATER.X + ZONES.WATER.WIDTH - 20; x += 30) {
          bg.quadraticCurveTo(x + 15, waveY - 8, x + 30, waveY);
        }
      }
    }
    
    // Vagues en bas
    for (let i = 0; i < 5; i++) {
      const waveY = ZONES.LAND.Y + ZONES.LAND.HEIGHT + 20 + i * 25;
      if (waveY < ZONES.WATER.Y + ZONES.WATER.HEIGHT - 10) {
        bg.moveTo(ZONES.WATER.X + 20, waveY);
        for (let x = ZONES.WATER.X + 20; x < ZONES.WATER.X + ZONES.WATER.WIDTH - 20; x += 30) {
          bg.quadraticCurveTo(x + 15, waveY - 8, x + 30, waveY);
        }
      }
    }
    
    bg.lineStyle(0);
  }
  
  /**
   * Crée les boutons/lieux sur la carte
   */
  _createLocations() {
    this.buttons = [];
    
    // Boutons sur la TERRE
    const landMargin = 100;
    const landCols = 3;
    const landRows = 2;
    
    for (let r = 0; r < landRows; r++) {
      for (let c = 0; c < landCols; c++) {
        const x = ZONES.LAND.X + landMargin + c * ((ZONES.LAND.WIDTH - landMargin * 2) / (landCols - 1 || 1));
        const y = ZONES.LAND.Y + landMargin + r * ((ZONES.LAND.HEIGHT - landMargin * 2) / (landRows - 1 || 1));
        const index = r * landCols + c + 1;
        
        const btn = new Button({
          label: `Ferme ${index}`,
          x, y,
          onClick: () => this._openLocation(`farm-${index}`, `Ferme ${index}`),
          showMarker: true,
        });
        
        this.mapContainer.addChild(btn);
        this.buttons.push(btn);
      }
    }
    
    // Boutons sur l'EAU
    const waterLocations = [
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.3, y: ZONES.WATER.Y + MARGINS.WATER / 2 + 20, name: 'Île Nord-Ouest', id: 'island-nw' },
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.7, y: ZONES.WATER.Y + MARGINS.WATER / 2 + 20, name: 'Île Nord-Est', id: 'island-ne' },
      { x: ZONES.WATER.X + MARGINS.WATER / 2, y: ZONES.WATER.Y + ZONES.WATER.HEIGHT * 0.5, name: 'Port Ouest', id: 'port-west' },
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH - MARGINS.WATER / 2, y: ZONES.WATER.Y + ZONES.WATER.HEIGHT * 0.5, name: 'Port Est', id: 'port-east' },
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.3, y: ZONES.WATER.Y + ZONES.WATER.HEIGHT - MARGINS.WATER / 2 - 20, name: 'Île Sud-Ouest', id: 'island-sw' },
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.7, y: ZONES.WATER.Y + ZONES.WATER.HEIGHT - MARGINS.WATER / 2 - 20, name: 'Île Sud-Est', id: 'island-se' },
    ];
    
    waterLocations.forEach(loc => {
      const btn = new Button({
        label: loc.name,
        x: loc.x,
        y: loc.y,
        onClick: () => this._openLocation(loc.id, loc.name),
        showMarker: true,
      });
      
      this.mapContainer.addChild(btn);
      this.buttons.push(btn);
    });
  }
  
  /**
   * Ouvre un lieu (appelle le callback)
   */
  _openLocation(id, name) {
    if (this.onOpenLocation) {
      this.onOpenLocation(id, name);
    }
  }
  
  /**
   * Gère le resize de la fenêtre
   */
  _onResize() {
    this.inputManager.setMapSize(MAP.WIDTH, MAP.HEIGHT);
    
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const scaledMapWidth = MAP.WIDTH * this.inputManager.getZoom();
    const scaledMapHeight = MAP.HEIGHT * this.inputManager.getZoom();
    
    this.mapContainer.x = Math.max(screenWidth - scaledMapWidth, Math.min(0, this.mapContainer.x));
    this.mapContainer.y = Math.max(screenHeight - scaledMapHeight, Math.min(0, this.mapContainer.y));
  }
  
  /**
   * Affiche la scène
   */
  show() {
    this.visible = true;
  }
  
  /**
   * Cache la scène
   */
  hide() {
    this.visible = false;
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    this.inputManager.destroy();
    super.destroy({ children: true });
  }
}
