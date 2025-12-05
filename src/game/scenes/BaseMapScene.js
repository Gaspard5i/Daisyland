/**
 * BaseMapScene.js
 * Classe de base pour les scènes de carte (réutilisable)
 */

import * as PIXI from 'pixi.js';
import { InputManager } from '../../core/InputManager.js';
import { Button } from '../../ui/Button.js';
import { MAP, COLORS } from '../../utils/Constants.js';

export class BaseMapScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Object} config - Configuration de la scène
   * @param {Function} onNavigate - Callback pour naviguer vers une autre scène
   */
  constructor(app, config = {}, onNavigate = null) {
    super();
    
    this.app = app;
    this.config = {
      mapWidth: config.mapWidth || MAP.WIDTH,
      mapHeight: config.mapHeight || MAP.HEIGHT,
      ...config,
    };
    this.onNavigate = onNavigate;
    
    // Conteneur de la map
    this.mapContainer = new PIXI.Container();
    this.addChild(this.mapContainer);
    
    // Input manager pour le drag/zoom
    this.inputManager = new InputManager(app, this.mapContainer);
    this.inputManager.setMapSize(this.config.mapWidth, this.config.mapHeight);
    
    // Liste des boutons
    this.buttons = [];
    
    // Resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }
  
  /**
   * Initialise la scène (à appeler après le constructeur)
   */
  init() {
    this._createBackground();
    this._createLocations();
    this._centerMap();
  }
  
  /**
   * Centre la map au milieu de l'écran
   */
  _centerMap() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const zoom = this.inputManager.getZoom();
    const scaledMapWidth = this.config.mapWidth * zoom;
    const scaledMapHeight = this.config.mapHeight * zoom;
    
    this.mapContainer.x = (screenWidth - scaledMapWidth) / 2;
    this.mapContainer.y = (screenHeight - scaledMapHeight) / 2;
  }
  
  /**
   * Crée le fond de la map (à surcharger)
   */
  _createBackground() {
    // À implémenter dans les classes enfants
  }
  
  /**
   * Crée les boutons/lieux (à surcharger)
   */
  _createLocations() {
    // À implémenter dans les classes enfants
  }
  
  /**
   * Crée un bouton sur la map
   */
  _createButton(label, x, y, onClick, showMarker = true) {
    const btn = new Button({
      label,
      x,
      y,
      onClick,
      showMarker,
    });
    
    this.mapContainer.addChild(btn);
    this.buttons.push(btn);
    return btn;
  }
  
  /**
   * Dessine des nuages décoratifs sur un Graphics
   */
  _drawDecorativeClouds(bg, positions) {
    bg.beginFill(COLORS.CLOUDS_HIGHLIGHT);
    positions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 25 + Math.random() * 15);
      bg.drawCircle(pos.x + 20, pos.y - 10, 20 + Math.random() * 10);
      bg.drawCircle(pos.x - 15, pos.y + 5, 18 + Math.random() * 10);
    });
    bg.endFill();
  }
  
  /**
   * Navigue vers une autre scène
   */
  navigateTo(sceneId, data = {}) {
    if (this.onNavigate) {
      this.onNavigate(sceneId, data);
    }
  }
  
  /**
   * Gère le resize de la fenêtre
   */
  _onResize() {
    this.inputManager.setMapSize(this.config.mapWidth, this.config.mapHeight);
    
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const scaledMapWidth = this.config.mapWidth * this.inputManager.getZoom();
    const scaledMapHeight = this.config.mapHeight * this.inputManager.getZoom();
    
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
