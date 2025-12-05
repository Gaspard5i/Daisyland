/**
 * InputManager.js
 * Gestionnaire des entrées utilisateur (souris/touch) pour le déplacement et zoom de la carte
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
    
    // Configuration du zoom
    this.zoomLevel = 1;
    this.minZoom = 0.5;  // Sera recalculé dynamiquement
    this.maxZoom = 2;
    this.zoomStep = 0.1;
    
    // Taille de la map
    this.mapWidth = 0;
    this.mapHeight = 0;
    
    // Limites de déplacement (optionnel)
    this.bounds = null;
    
    // Référence au canvas
    this.canvas = app.canvas || app.view;
    
    // Bind des méthodes pour pouvoir les retirer plus tard
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._onWheel = this._onWheel.bind(this);
    
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
    
    // Événement de la molette pour le zoom
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
  }
  
  /**
   * Définit les limites de déplacement de la carte
   * @param {Object} bounds - { minX, maxX, minY, maxY }
   */
  setBounds(bounds) {
    this.bounds = bounds;
  }
  
  /**
   * Calcule les limites automatiquement basées sur la taille de la map et le zoom
   * @param {number} mapWidth - Largeur totale de la map
   * @param {number} mapHeight - Hauteur totale de la map
   */
  setMapSize(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    
    // Calculer le zoom minimum pour que la map couvre toujours tout l'écran
    this._updateMinZoom();
    this._updateBounds();
  }
  
  /**
   * Calcule le zoom minimum pour que la map remplisse toujours l'écran
   * (on ne peut pas voir derrière les nuages)
   */
  _updateMinZoom() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    
    // Le zoom minimum est celui qui permet à la map de couvrir tout l'écran
    const minZoomX = screenWidth / this.mapWidth;
    const minZoomY = screenHeight / this.mapHeight;
    
    // Prendre le plus grand des deux pour couvrir les deux dimensions
    this.minZoom = Math.max(minZoomX, minZoomY);
    
    // Si le zoom actuel est en dessous du nouveau minimum, l'ajuster
    if (this.zoomLevel < this.minZoom) {
      this.zoomLevel = this.minZoom;
      this.target.scale.set(this.zoomLevel);
    }
  }
  
  /**
   * Met à jour les limites en fonction du zoom actuel
   * La map doit toujours couvrir tout l'écran (pas de vide visible)
   */
  _updateBounds() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    const scaledMapWidth = this.mapWidth * this.zoomLevel;
    const scaledMapHeight = this.mapHeight * this.zoomLevel;
    
    // Les limites empêchent de voir au-delà des bords de la map
    // minX/minY = position max vers la gauche/haut (valeurs négatives)
    // maxX/maxY = position max vers la droite/bas (0 = bord gauche/haut de la map au bord de l'écran)
    this.bounds = {
      minX: screenWidth - scaledMapWidth,
      maxX: 0,
      minY: screenHeight - scaledMapHeight,
      maxY: 0
    };
  }
  
  /**
   * Applique les limites à la position actuelle
   */
  _clampPosition() {
    if (this.bounds) {
      this.target.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.target.x));
      this.target.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.target.y));
    }
  }
  
  /**
   * Événement de la molette de souris pour le zoom
   */
  _onWheel(event) {
    event.preventDefault();
    
    // Position de la souris relative au canvas
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Position de la souris dans le monde (avant zoom)
    const worldX = (mouseX - this.target.x) / this.zoomLevel;
    const worldY = (mouseY - this.target.y) / this.zoomLevel;
    
    // Calculer le nouveau niveau de zoom
    const oldZoom = this.zoomLevel;
    if (event.deltaY < 0) {
      // Zoom in (molette vers le haut)
      this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + this.zoomStep);
    } else {
      // Zoom out (molette vers le bas)
      this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - this.zoomStep);
    }
    
    // Appliquer le zoom
    this.target.scale.set(this.zoomLevel);
    
    // Ajuster la position pour zoomer vers le curseur
    this.target.x = mouseX - worldX * this.zoomLevel;
    this.target.y = mouseY - worldY * this.zoomLevel;
    
    // Mettre à jour les limites et clamper la position
    this._updateBounds();
    this._clampPosition();
  }
  
  /**
   * Définit le niveau de zoom programmatiquement
   * @param {number} zoom - Niveau de zoom (entre minZoom et maxZoom)
   */
  setZoom(zoom) {
    this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
    this.target.scale.set(this.zoomLevel);
    this._updateBounds();
    this._clampPosition();
  }
  
  /**
   * Retourne le niveau de zoom actuel
   * @returns {number}
   */
  getZoom() {
    return this.zoomLevel;
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
    
    this.canvas.removeEventListener('wheel', this._onWheel);
    
    this.canvas.style.cursor = 'default';
  }
}
