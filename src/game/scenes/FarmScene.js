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
   * @param {Object} gameMetrics - Instance de GameMetrics pour modifier les métriques
   */
  constructor(app, onOpenLocation, gameMetrics) {
    super();
    
    this.app = app;
    this.onOpenLocation = onOpenLocation;
    this.gameMetrics = gameMetrics;
    
    // Conteneurs
    this.mapContainer = new PIXI.Container();
    this.addChild(this.mapContainer);
    
    // Input manager pour le drag/zoom
    this.inputManager = new InputManager(app, this.mapContainer);
    this.inputManager.setMapSize(MAP.WIDTH, MAP.HEIGHT);
    
    // Dessiner le fond
    this._createBackground();
    
    // Charger et ajouter l'île SVG
    this._loadIslandSVG();
    
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
   * Crée le fond de la map (nuages uniquement, l'océan est un SVG)
   */
  _createBackground() {
    const bg = new PIXI.Graphics();
    
    // Nuages (blanc) - Couche extérieure
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
    
    this.mapContainer.addChild(bg);
    
    // Charger l'océan SVG en arrière-plan
    this._loadOceanSVG();
  }

  /**
   * Charge et affiche le SVG de l'océan
   */
  async _loadOceanSVG() {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Ocean.svg');
      const ocean = new PIXI.Sprite(texture);
      
      // Positionner et dimensionner l'océan pour correspondre à la zone WATER
      ocean.x = ZONES.WATER.X;
      ocean.y = ZONES.WATER.Y;
      ocean.width = ZONES.WATER.WIDTH;
      ocean.height = ZONES.WATER.HEIGHT;
      
      // Ajouter l'océan après le background (index 1)
      this.mapContainer.addChildAt(ocean, 1);
      
      console.log('🌊 Océan SVG chargé');
    } catch (err) {
      console.error('Erreur chargement Ocean.svg:', err);
    }
  }

  /**
   * Charge et affiche le SVG de l'île
   */
  async _loadIslandSVG() {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Island.svg');
      const island = new PIXI.Sprite(texture);
      
      // Positionner et dimensionner l'île pour correspondre à la zone LAND
      island.x = ZONES.LAND.X;
      island.y = ZONES.LAND.Y;
      island.width = ZONES.LAND.WIDTH;
      island.height = ZONES.LAND.HEIGHT;
      
      // Ajouter l'île au container (après l'océan, index 2)
      this.mapContainer.addChildAt(island, 2);
      
      console.log('🏝️ Île SVG chargée');
    } catch (err) {
      console.error('Erreur chargement Island.svg:', err);
    }
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
        
        // Ferme 2 = Vélo (action directe électricité)
        if (index === 2) {
          this._createBikeButton(x, y);
          continue;
        }
        
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
    
    // Boutons sur l'EAU (sans 8ème continent qui est remplacé par le bateau)
    const waterLocations = [
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.3, y: ZONES.WATER.Y + MARGINS.WATER / 2 + 20, name: 'Île Nord-Ouest', id: 'island-nw' },
      { x: ZONES.WATER.X + ZONES.WATER.WIDTH * 0.7, y: ZONES.WATER.Y + MARGINS.WATER / 2 + 20, name: 'Île Nord-Est', id: 'island-ne' },
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
    
    // Bateau pour aller au 8ème continent (à la place du bouton)
    const boatX = ZONES.WATER.X + MARGINS.WATER / 2;
    const boatY = ZONES.WATER.Y + ZONES.WATER.HEIGHT * 0.5;
    this._createBoatTo8eContinent(boatX, boatY);
    
    // Ajouter le pont (bridge) en bas milieu-droite de l'île
    this._createBridgeButton();
  }

  /**
   * Crée le bouton vélo qui génère de l'électricité au clic
   */
  async _createBikeButton(x, y) {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/bike.svg');
      const bike = new PIXI.Sprite(texture);
      
      // Taille et position - centré sur l'île
      const targetSize = 50;
      const scaleX = targetSize / texture.width;
      const scaleY = targetSize / texture.height;
      bike.scale.set(scaleX, scaleY);
      bike.anchor.set(0.5, 0.5);
      bike.x = ZONES.LAND.X + ZONES.LAND.WIDTH / 2;
      bike.y = ZONES.LAND.Y + ZONES.LAND.HEIGHT / 2;
      
      // Sauvegarder l'échelle de base
      const baseScale = scaleX;
      
      // Interactivité
      bike.eventMode = 'static';
      bike.cursor = 'pointer';
      
      // Animation au survol
      bike.on('pointerenter', () => {
        bike.scale.set(baseScale * 1.15);
      });
      
      bike.on('pointerleave', () => {
        bike.scale.set(baseScale);
      });
      
      // Clic = ajouter électricité
      bike.on('pointerdown', () => {
        if (this.gameMetrics) {
          this.gameMetrics.addToMetric('electricity', 5);
          console.log('⚡ +5 électricité !');
          
          // Animation de feedback
          bike.scale.set(baseScale * 0.9);
          setTimeout(() => bike.scale.set(baseScale * 1.15), 100);
        }
      });
      
      this.mapContainer.addChild(bike);
      console.log('🚲 Vélo créé');
    } catch (err) {
      console.error('Erreur chargement bike.svg:', err);
    }
  }

  /**
   * Crée le bateau pour aller au 8ème continent
   */
  async _createBoatTo8eContinent(x, y) {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Boat.svg');
      const boat = new PIXI.Sprite(texture);
      
      // Taille et position
      const targetSize = 150;
      const scaleX = targetSize / texture.width;
      const scaleY = targetSize / texture.height;
      boat.scale.set(scaleX, scaleY);
      boat.anchor.set(0.5, 0.5);
      boat.x = x;
      boat.y = y;
      
      // Sauvegarder l'échelle de base
      const baseScale = scaleX;
      
      // Interactivité
      boat.eventMode = 'static';
      boat.cursor = 'pointer';
      
      // Animation au survol
      boat.on('pointerenter', () => {
        boat.scale.set(baseScale * 1.15);
      });
      
      boat.on('pointerleave', () => {
        boat.scale.set(baseScale);
      });
      
      // Clic = aller au 8ème continent
      boat.on('pointerdown', () => {
        this._openLocation('8eme-continent', '8ème Continent');
      });
      
      this.mapContainer.addChild(boat);
      console.log('🚤 Bateau vers 8ème Continent créé');
    } catch (err) {
      console.error('Erreur chargement Boat.svg:', err);
    }
  }

  /**
   * Crée le pont (bridge) - élément décoratif non cliquable
   */
  async _createBridgeButton() {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Bridge.svg');
      const bridge = new PIXI.Sprite(texture);
      
      // Taille et position - plus grand, plus à droite et plus haut
      const targetSize = 150;
      const scaleX = targetSize / texture.width;
      const scaleY = targetSize / texture.height;
      bridge.scale.set(scaleX, scaleY);
      bridge.anchor.set(0.5, 0.5);
      
      // Position: droite de l'île, plus haut
      const bridgeX = ZONES.LAND.X + ZONES.LAND.WIDTH * 0.8;
      const bridgeY = ZONES.LAND.Y + ZONES.LAND.HEIGHT * 0.6;
      bridge.x = bridgeX;
      bridge.y = bridgeY;
      
      this.mapContainer.addChild(bridge);
      console.log('🌉 Pont créé');
      
      // Ajouter le pêcheur sur le pont
      this._createFishermanButton(bridgeX, bridgeY);
    } catch (err) {
      console.error('Erreur chargement Bridge.svg:', err);
    }
  }

  /**
   * Crée le pêcheur (fisherman) cliquable sur le pont
   */
  async _createFishermanButton(bridgeX, bridgeY) {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Fisherman.svg');
      const fisherman = new PIXI.Sprite(texture);
      
      // Taille
      const targetSize = 50;
      const scaleX = targetSize / texture.width;
      const scaleY = targetSize / texture.height;
      fisherman.scale.set(scaleX, scaleY);
      fisherman.anchor.set(0.3, 0.9);
      
      // Position: sur le pont
      fisherman.x = bridgeX;
      fisherman.y = bridgeY;
      
      // Sauvegarder l'échelle de base
      const baseScale = scaleX;
      
      // Interactivité
      fisherman.eventMode = 'static';
      fisherman.cursor = 'pointer';
      
      // Animation au survol
      fisherman.on('pointerenter', () => {
        fisherman.scale.set(baseScale * 1.15);
      });
      
      fisherman.on('pointerleave', () => {
        fisherman.scale.set(baseScale);
      });
      
      // Clic = ouvrir le lieu pêcheur
      fisherman.on('pointerdown', () => {
        this._openLocation('fisherman', 'Pêcheur');
      });
      
      this.mapContainer.addChild(fisherman);
      console.log('🎣 Pêcheur créé');
    } catch (err) {
      console.error('Erreur chargement Fisherman.svg:', err);
    }
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
