/**
 * ContinentScene.js
 * Scène du 8ème Continent - L'île de plastique/pollution
 */

import * as PIXI from 'pixi.js';
import { InputManager } from '../../core/InputManager.js';
import { Button } from '../../ui/Button.js';
import { MAP, MARGINS, COLORS } from '../../utils/Constants.js';

// Couleurs spécifiques au 8ème Continent (ambiance polluée)
const CONTINENT_COLORS = {
  SKY: 0x9CA3AF,          // Ciel gris
  SKY_CLOUDS: 0xB8BCC4,   // Nuages gris clair
  OCEAN: 0x5B7A8A,        // Eau polluée gris-bleu
  OCEAN_DARK: 0x4A6670,   // Vagues sombres
  LAND: 0xA39171,         // Sol beige/sableux
  LAND_DARK: 0x8B7355,    // Sol plus sombre
  PLASTIC: 0xE5E5E5,      // Déchets plastiques
  PLASTIC_COLORS: [0xE57373, 0x64B5F6, 0x81C784, 0xFFD54F, 0xBA68C8], // Plastiques colorés
  STRUCTURE: 0x757575,    // Structures métalliques
};

// Dimensions de la carte du continent
const CONTINENT_MAP = {
  WIDTH: 2000,
  HEIGHT: 1500,
};

// Zones du continent
const CONTINENT_ZONES = {
  OCEAN: {
    X: MARGINS.CLOUD,
    Y: MARGINS.CLOUD,
    WIDTH: CONTINENT_MAP.WIDTH - MARGINS.CLOUD * 2,
    HEIGHT: CONTINENT_MAP.HEIGHT - MARGINS.CLOUD * 2,
  },
  LAND: {
    X: MARGINS.CLOUD + 200,
    Y: MARGINS.CLOUD + 200,
    WIDTH: CONTINENT_MAP.WIDTH - MARGINS.CLOUD * 2 - 400,
    HEIGHT: CONTINENT_MAP.HEIGHT - MARGINS.CLOUD * 2 - 400,
  },
};

export class ContinentScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Function} onOpenLocation - Callback quand on clique sur un lieu
   * @param {Function} onNavigate - Callback pour naviguer vers une autre scène
   */
  constructor(app, onOpenLocation, onNavigate) {
    super();
    
    this.app = app;
    this.onOpenLocation = onOpenLocation;
    this.onNavigate = onNavigate;
    
    // Conteneurs
    this.mapContainer = new PIXI.Container();
    this.addChild(this.mapContainer);
    
    // Input manager pour le drag/zoom
    this.inputManager = new InputManager(app, this.mapContainer);
    this.inputManager.setMapSize(CONTINENT_MAP.WIDTH, CONTINENT_MAP.HEIGHT);
    
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
    const scaledMapWidth = CONTINENT_MAP.WIDTH * zoom;
    const scaledMapHeight = CONTINENT_MAP.HEIGHT * zoom;
    
    this.mapContainer.x = (screenWidth - scaledMapWidth) / 2;
    this.mapContainer.y = (screenHeight - scaledMapHeight) / 2;
  }
  
  /**
   * Crée le fond de la map (ciel pollué, océan, île de plastique)
   */
  _createBackground() {
    const bg = new PIXI.Graphics();
    
    // 1. Ciel gris (couche extérieure)
    bg.beginFill(CONTINENT_COLORS.SKY);
    bg.drawRect(0, 0, CONTINENT_MAP.WIDTH, CONTINENT_MAP.HEIGHT);
    bg.endFill();
    
    // Nuages gris
    this._drawGreyClouds(bg);
    
    // 2. Océan pollué
    bg.beginFill(CONTINENT_COLORS.OCEAN);
    bg.drawRoundedRect(
      CONTINENT_ZONES.OCEAN.X, CONTINENT_ZONES.OCEAN.Y,
      CONTINENT_ZONES.OCEAN.WIDTH, CONTINENT_ZONES.OCEAN.HEIGHT, 20
    );
    bg.endFill();
    
    // Déchets flottants dans l'eau
    this._drawFloatingDebris(bg);
    
    // 3. Île de plastique (terre)
    bg.beginFill(CONTINENT_COLORS.LAND);
    bg.drawRoundedRect(
      CONTINENT_ZONES.LAND.X, CONTINENT_ZONES.LAND.Y,
      CONTINENT_ZONES.LAND.WIDTH, CONTINENT_ZONES.LAND.HEIGHT, 40
    );
    bg.endFill();
    
    // Texture du sol
    bg.beginFill(CONTINENT_COLORS.LAND_DARK);
    for (let i = 0; i < 40; i++) {
      const px = CONTINENT_ZONES.LAND.X + 30 + Math.random() * (CONTINENT_ZONES.LAND.WIDTH - 60);
      const py = CONTINENT_ZONES.LAND.Y + 30 + Math.random() * (CONTINENT_ZONES.LAND.HEIGHT - 60);
      bg.drawEllipse(px, py, 15 + Math.random() * 20, 8 + Math.random() * 10);
    }
    bg.endFill();
    
    // Tas de plastique sur l'île
    this._drawPlasticPiles(bg);
    
    // Structures/bâtiments abandonnés
    this._drawStructures(bg);
    
    this.mapContainer.addChild(bg);
  }
  
  /**
   * Dessine les nuages gris
   */
  _drawGreyClouds(bg) {
    bg.beginFill(CONTINENT_COLORS.SKY_CLOUDS);
    
    const cloudPositions = [
      { x: 50, y: 40 }, { x: 150, y: 30 },
      { x: CONTINENT_MAP.WIDTH - 50, y: 50 }, { x: CONTINENT_MAP.WIDTH - 130, y: 35 },
      { x: 60, y: CONTINENT_MAP.HEIGHT - 45 }, { x: 180, y: CONTINENT_MAP.HEIGHT - 35 },
      { x: CONTINENT_MAP.WIDTH - 60, y: CONTINENT_MAP.HEIGHT - 40 },
      { x: 40, y: 300 }, { x: 55, y: 500 },
      { x: CONTINENT_MAP.WIDTH - 45, y: 350 }, { x: CONTINENT_MAP.WIDTH - 50, y: 600 },
    ];
    
    cloudPositions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 20 + Math.random() * 15);
      bg.drawCircle(pos.x + 18, pos.y - 8, 15 + Math.random() * 10);
      bg.drawCircle(pos.x - 12, pos.y + 5, 14 + Math.random() * 8);
    });
    bg.endFill();
  }
  
  /**
   * Dessine les déchets flottants dans l'eau
   */
  _drawFloatingDebris(bg) {
    // Zones autour de l'île (dans l'eau)
    const debrisAreas = [
      { x: CONTINENT_ZONES.OCEAN.X + 40, y: CONTINENT_ZONES.OCEAN.Y + 40, w: 150, h: 150 },
      { x: CONTINENT_ZONES.OCEAN.X + CONTINENT_ZONES.OCEAN.WIDTH - 190, y: CONTINENT_ZONES.OCEAN.Y + 50, w: 140, h: 140 },
      { x: CONTINENT_ZONES.OCEAN.X + 50, y: CONTINENT_ZONES.OCEAN.Y + CONTINENT_ZONES.OCEAN.HEIGHT - 180, w: 130, h: 130 },
      { x: CONTINENT_ZONES.OCEAN.X + CONTINENT_ZONES.OCEAN.WIDTH - 180, y: CONTINENT_ZONES.OCEAN.Y + CONTINENT_ZONES.OCEAN.HEIGHT - 170, w: 130, h: 130 },
    ];
    
    debrisAreas.forEach(area => {
      // Déchets colorés
      for (let i = 0; i < 15; i++) {
        const color = CONTINENT_COLORS.PLASTIC_COLORS[Math.floor(Math.random() * CONTINENT_COLORS.PLASTIC_COLORS.length)];
        bg.beginFill(color, 0.7);
        const dx = area.x + Math.random() * area.w;
        const dy = area.y + Math.random() * area.h;
        const size = 3 + Math.random() * 8;
        
        // Formes variées
        if (Math.random() > 0.5) {
          bg.drawRect(dx, dy, size, size * 0.6);
        } else {
          bg.drawCircle(dx, dy, size / 2);
        }
        bg.endFill();
      }
    });
    
    // Vagues polluées
    bg.lineStyle(2, CONTINENT_COLORS.OCEAN_DARK, 0.4);
    for (let i = 0; i < 6; i++) {
      const waveY = CONTINENT_ZONES.OCEAN.Y + 40 + i * 35;
      if (waveY < CONTINENT_ZONES.LAND.Y - 20) {
        bg.moveTo(CONTINENT_ZONES.OCEAN.X + 30, waveY);
        for (let x = CONTINENT_ZONES.OCEAN.X + 30; x < CONTINENT_ZONES.OCEAN.X + CONTINENT_ZONES.OCEAN.WIDTH - 30; x += 40) {
          bg.quadraticCurveTo(x + 20, waveY - 6, x + 40, waveY);
        }
      }
    }
    bg.lineStyle(0);
  }
  
  /**
   * Dessine les tas de plastique sur l'île
   */
  _drawPlasticPiles(bg) {
    const piles = [
      { x: CONTINENT_ZONES.LAND.X + 80, y: CONTINENT_ZONES.LAND.Y + 80, size: 60 },
      { x: CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH - 100, y: CONTINENT_ZONES.LAND.Y + 100, size: 50 },
      { x: CONTINENT_ZONES.LAND.X + 100, y: CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT - 120, size: 55 },
      { x: CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH - 90, y: CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT - 100, size: 45 },
      { x: CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH / 2, y: CONTINENT_ZONES.LAND.Y + 70, size: 40 },
    ];
    
    piles.forEach(pile => {
      // Base du tas (gris)
      bg.beginFill(CONTINENT_COLORS.PLASTIC);
      bg.drawEllipse(pile.x, pile.y, pile.size, pile.size * 0.6);
      bg.endFill();
      
      // Plastiques colorés sur le tas
      for (let i = 0; i < 12; i++) {
        const color = CONTINENT_COLORS.PLASTIC_COLORS[Math.floor(Math.random() * CONTINENT_COLORS.PLASTIC_COLORS.length)];
        bg.beginFill(color, 0.8);
        const px = pile.x + (Math.random() - 0.5) * pile.size * 1.5;
        const py = pile.y + (Math.random() - 0.5) * pile.size * 0.8;
        const size = 4 + Math.random() * 10;
        bg.drawRect(px, py, size, size * 0.7);
        bg.endFill();
      }
    });
  }
  
  /**
   * Dessine les structures abandonnées
   */
  _drawStructures(bg) {
    bg.beginFill(CONTINENT_COLORS.STRUCTURE);
    
    // Structure centrale (centre de tri)
    const cx = CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH / 2;
    const cy = CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT / 2;
    bg.drawRect(cx - 40, cy - 30, 80, 60);
    
    // Petites structures
    bg.drawRect(cx - 150, cy - 20, 40, 35);
    bg.drawRect(cx + 120, cy - 15, 35, 30);
    
    bg.endFill();
  }
  
  /**
   * Crée les boutons/lieux sur la carte
   */
  _createLocations() {
    this.buttons = [];
    
    // Bateau retour à l'île principale (à droite, sens inverse)
    const boatX = CONTINENT_ZONES.OCEAN.X + CONTINENT_ZONES.OCEAN.WIDTH - MARGINS.WATER / 2;
    const boatY = CONTINENT_ZONES.OCEAN.Y + CONTINENT_ZONES.OCEAN.HEIGHT * 0.5;
    this._createBoatToMainIsland(boatX, boatY);
    
    // Zones de collecte uniquement
    const collectionZones = [
      { 
        x: CONTINENT_ZONES.LAND.X + 150, 
        y: CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT / 2 - 80, 
        name: 'Zone Nord', 
        id: 'collection-north' 
      },
      { 
        x: CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH - 150, 
        y: CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT / 2 - 80, 
        name: 'Zone Est', 
        id: 'collection-east' 
      },
      { 
        x: CONTINENT_ZONES.LAND.X + CONTINENT_ZONES.LAND.WIDTH / 2, 
        y: CONTINENT_ZONES.LAND.Y + CONTINENT_ZONES.LAND.HEIGHT - 120, 
        name: 'Zone Sud', 
        id: 'collection-south' 
      },
    ];
    
    collectionZones.forEach(loc => {
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
   * Ouvre un lieu
   */
  _openLocation(id, name) {
    if (this.onOpenLocation) {
      this.onOpenLocation(id, name);
    }
  }
  
  /**
   * Retourne à la scène principale
   */
  _navigateBack() {
    if (this.onNavigate) {
      this.onNavigate('farm');
    }
  }

  /**
   * Crée le bateau pour retourner à l'île principale (sens inverse)
   */
  async _createBoatToMainIsland(x, y) {
    try {
      const texture = await PIXI.Assets.load('/assets/svg/Boat.svg');
      const boat = new PIXI.Sprite(texture);
      
      // Taille et position
      const targetSize = 150;
      const scaleX = targetSize / texture.width;
      const scaleY = targetSize / texture.height;
      boat.scale.set(-scaleX, scaleY); // Négatif en X pour retourner le bateau
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
        boat.scale.set(-baseScale * 1.15, baseScale * 1.15);
      });
      
      boat.on('pointerleave', () => {
        boat.scale.set(-baseScale, baseScale);
      });
      
      // Clic = retour à l'île principale
      boat.on('pointerdown', () => {
        this._navigateBack();
      });
      
      this.mapContainer.addChild(boat);
      console.log('🚤 Bateau retour créé');
    } catch (err) {
      console.error('Erreur chargement Boat.svg:', err);
    }
  }
  
  /**
   * Gère le resize de la fenêtre
   */
  _onResize() {
    this.inputManager.setMapSize(CONTINENT_MAP.WIDTH, CONTINENT_MAP.HEIGHT);
    
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const scaledMapWidth = CONTINENT_MAP.WIDTH * this.inputManager.getZoom();
    const scaledMapHeight = CONTINENT_MAP.HEIGHT * this.inputManager.getZoom();
    
    this.mapContainer.x = Math.max(screenWidth - scaledMapWidth, Math.min(0, this.mapContainer.x));
    this.mapContainer.y = Math.max(screenHeight - scaledMapHeight, Math.min(0, this.mapContainer.y));
  }
  
  /**
   * Affiche la scène
   */
  show() {
    this.visible = true;
    this._centerMap();
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
