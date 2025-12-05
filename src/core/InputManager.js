/**
 * InputManager.js
 * Gestionnaire des entrées utilisateur (souris/touch) pour le déplacement de la carte
 */

export class InputManager {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {PIXI.Container} targetContainer - Le conteneur à déplacer (la map)
   */
  constructor(app, targetContainer) {
    this.app = app;
    this.target = targetContainer;
    
    // État du drag
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.containerStart = { x: 0, y: 0 };
    
    // Limites de déplacement (optionnel)
    this.bounds = null;
    
    // Référence au canvas
    this.canvas = app.canvas || app.view;
    
    // Bind des méthodes pour pouvoir les retirer plus tard
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    
    this._setupEvents();
  }
  
  /**
   * Configure les événements d'entrée
   */
  _setupEvents() {
    // Utiliser le stage pour capturer les événements globalement
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    
    this.app.stage.on('pointerdown', this._onPointerDown);
    this.app.stage.on('pointermove', this._onPointerMove);
    this.app.stage.on('pointerup', this._onPointerUp);
    this.app.stage.on('pointerupoutside', this._onPointerUp);
    this.app.stage.on('pointerleave', this._onPointerLeave);
  }
  
  /**
   * Définit les limites de déplacement de la carte
   * @param {Object} bounds - { minX, maxX, minY, maxY }
   */
  setBounds(bounds) {
    this.bounds = bounds;
  }
  
  /**
   * Calcule les limites automatiquement basées sur la taille de la map
   * @param {number} mapWidth - Largeur totale de la map
   * @param {number} mapHeight - Hauteur totale de la map
   */
  setMapSize(mapWidth, mapHeight) {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    
    this.bounds = {
      minX: screenWidth - mapWidth,
      maxX: 0,
      minY: screenHeight - mapHeight,
      maxY: 0
    };
  }
  
  /**
   * Événement de début de clic/touch
   */
  _onPointerDown(event) {
    // Ne pas démarrer le drag si on clique sur un élément interactif
    if (event.target !== this.app.stage) {
      return;
    }
    
    this.isDragging = true;
    this.dragStart.x = event.global.x;
    this.dragStart.y = event.global.y;
    this.containerStart.x = this.target.x;
    this.containerStart.y = this.target.y;
    
    // Changer le curseur en "grabbing"
    this.canvas.style.cursor = 'grabbing';
  }
  
  /**
   * Événement de déplacement de la souris/touch
   */
  _onPointerMove(event) {
    if (!this.isDragging) {
      return;
    }
    
    // Calculer le delta de déplacement
    const deltaX = event.global.x - this.dragStart.x;
    const deltaY = event.global.y - this.dragStart.y;
    
    // Nouvelle position
    let newX = this.containerStart.x + deltaX;
    let newY = this.containerStart.y + deltaY;
    
    // Appliquer les limites si définies
    if (this.bounds) {
      newX = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, newX));
      newY = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, newY));
    }
    
    // Appliquer la nouvelle position
    this.target.x = newX;
    this.target.y = newY;
  }
  
  /**
   * Événement de fin de clic/touch
   */
  _onPointerUp() {
    if (this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    }
  }
  
  /**
   * Événement quand le pointeur quitte le canvas
   */
  _onPointerLeave() {
    if (this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    }
  }
  
  /**
   * Active/désactive le drag
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this._enabled = enabled;
    if (!enabled && this.isDragging) {
      this.isDragging = false;
      this.canvas.style.cursor = 'default';
    }
  }
  
  /**
   * Vérifie si on est en train de drag
   * @returns {boolean}
   */
  isDraggingMap() {
    return this.isDragging;
  }
  
  /**
   * Nettoie les événements
   */
  destroy() {
    this.app.stage.off('pointerdown', this._onPointerDown);
    this.app.stage.off('pointermove', this._onPointerMove);
    this.app.stage.off('pointerup', this._onPointerUp);
    this.app.stage.off('pointerupoutside', this._onPointerUp);
    this.app.stage.off('pointerleave', this._onPointerLeave);
    
    this.canvas.style.cursor = 'default';
  }
}
