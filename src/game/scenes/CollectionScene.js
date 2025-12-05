/**
 * CollectionScene.js
 * Scène de collecte de déchets - affiche les déchets accumulés dans une zone
 */

import * as PIXI from 'pixi.js';
import { WasteManager } from '../systems/WasteManager.js';
import { CollectionZoneManager } from '../systems/CollectionZoneManager.js';
import { Button } from '../../ui/Button.js';

export class CollectionScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Function} onClose - Callback pour fermer la scène
   */
  constructor(app, onClose) {
    super();
    
    this.app = app;
    this.onClose = onClose;
    this.visible = false;
    
    // Zone actuelle
    this.currentZoneId = null;
    this.currentZoneName = '';
    
    // Éléments UI
    this.wasteItems = [];
    
    // Créer les éléments de base
    this._createBackground();
    this._createUI();
    
    // Resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }
  
  /**
   * Crée le fond
   */
  _createBackground() {
    this.overlay = new PIXI.Graphics();
    this.addChild(this.overlay);
    
    this.panel = new PIXI.Container();
    this.addChild(this.panel);
    
    this.panelBg = new PIXI.Graphics();
    this.panel.addChild(this.panelBg);
    
    this._drawBackground();
  }
  
  /**
   * Dessine le fond
   */
  _drawBackground() {
    const width = this.app.renderer.width;
    const height = this.app.renderer.height;
    
    // Overlay sombre
    this.overlay.clear();
    this.overlay.beginFill(0x1a1a2e, 0.85);
    this.overlay.drawRect(0, 0, width, height);
    this.overlay.endFill();
    
    // Panel central
    const panelWidth = Math.min(650, width - 40);
    const panelHeight = Math.min(500, height - 40);
    
    this.panelBg.clear();
    
    // Fond du panel (style océan)
    this.panelBg.beginFill(0x2C3E50);
    this.panelBg.drawRoundedRect(0, 0, panelWidth, panelHeight, 20);
    this.panelBg.endFill();
    
    // Bordure
    this.panelBg.lineStyle(3, 0x5B7A8A);
    this.panelBg.drawRoundedRect(0, 0, panelWidth, panelHeight, 20);
    this.panelBg.lineStyle(0);
    
    // Header
    this.panelBg.beginFill(0x34495E);
    this.panelBg.drawRoundedRect(0, 0, panelWidth, 60, 20);
    this.panelBg.drawRect(0, 40, panelWidth, 20);
    this.panelBg.endFill();
    
    // Zone de collecte (eau)
    this.panelBg.beginFill(0x4A6670);
    this.panelBg.drawRoundedRect(20, 100, panelWidth - 40, panelHeight - 180, 15);
    this.panelBg.endFill();
    
    // Vagues décoratives
    this.panelBg.lineStyle(1, 0x5B7A8A, 0.5);
    for (let i = 0; i < 6; i++) {
      const waveY = 120 + i * 40;
      if (waveY < panelHeight - 100) {
        this.panelBg.moveTo(30, waveY);
        for (let x = 30; x < panelWidth - 30; x += 30) {
          this.panelBg.quadraticCurveTo(x + 15, waveY - 5, x + 30, waveY);
        }
      }
    }
    this.panelBg.lineStyle(0);
    
    // Centrer
    this.panel.x = (width - panelWidth) / 2;
    this.panel.y = (height - panelHeight) / 2;
    
    this.panelWidth = panelWidth;
    this.panelHeight = panelHeight;
  }
  
  /**
   * Crée les éléments UI
   */
  _createUI() {
    // Titre
    this.titleText = new PIXI.Text('🌊 Zone de Collecte', {
      fontSize: 22,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    this.titleText.x = 20;
    this.titleText.y = 17;
    this.panel.addChild(this.titleText);
    
    // Compteur de déchets dans la zone
    this.zoneCountText = new PIXI.Text('0 / 20', {
      fontSize: 18,
      fill: 0x81C784,
      fontWeight: 'bold',
    });
    this.zoneCountText.anchor.set(1, 0);
    this.panel.addChild(this.zoneCountText);
    
    // Instructions
    this.instructionText = new PIXI.Text('Clique sur les déchets pour les collecter !', {
      fontSize: 14,
      fill: 0xBBBBBB,
      fontStyle: 'italic',
    });
    this.instructionText.anchor.set(0.5, 0);
    this.panel.addChild(this.instructionText);
    
    // Message zone vide
    this.emptyText = new PIXI.Text('🌊 Zone vide ! Reviens plus tard...', {
      fontSize: 18,
      fill: 0x888888,
      fontStyle: 'italic',
    });
    this.emptyText.anchor.set(0.5, 0.5);
    this.emptyText.visible = false;
    this.panel.addChild(this.emptyText);
    
    // Container pour les déchets
    this.wasteContainer = new PIXI.Container();
    this.panel.addChild(this.wasteContainer);
    
    // Bouton "Tout collecter"
    this.collectAllBtn = new Button({
      label: '♻️ Tout collecter',
      x: 0,
      y: 0,
      onClick: () => this._collectAll(),
      showMarker: false,
    });
    this.panel.addChild(this.collectAllBtn);
    
    // Bouton retour
    this.backBtn = new Button({
      label: '← Retour',
      x: 0,
      y: 0,
      onClick: () => this.close(),
      showMarker: false,
    });
    this.panel.addChild(this.backBtn);
  }
  
  /**
   * Positionne les éléments UI
   */
  _positionUI() {
    this.zoneCountText.x = this.panelWidth - 20;
    this.zoneCountText.y = 20;
    
    this.instructionText.x = this.panelWidth / 2;
    this.instructionText.y = 70;
    
    this.emptyText.x = this.panelWidth / 2;
    this.emptyText.y = (100 + this.panelHeight - 80) / 2 + 30;
    
    // Boutons en bas
    this.collectAllBtn.x = this.panelWidth / 2 - 80;
    this.collectAllBtn.y = this.panelHeight - 40;
    
    this.backBtn.x = this.panelWidth / 2 + 80;
    this.backBtn.y = this.panelHeight - 40;
  }
  
  /**
   * Ouvre la scène pour une zone donnée
   */
  open(zoneId, zoneName) {
    this.currentZoneId = zoneId;
    this.currentZoneName = zoneName;
    this.visible = true;
    
    // Mettre à jour le titre
    this.titleText.text = `🌊 ${zoneName}`;
    
    // Redessiner
    this._drawBackground();
    this._positionUI();
    
    // Afficher les déchets de la zone
    this._displayWaste();
  }
  
  /**
   * Affiche les déchets accumulés dans la zone
   */
  _displayWaste() {
    // Nettoyer les anciens
    this._clearWasteDisplay();
    
    // Récupérer les infos de la zone
    const zoneInfo = CollectionZoneManager.getZoneInfo(this.currentZoneId);
    if (!zoneInfo) return;
    
    // Mettre à jour le compteur
    this.zoneCountText.text = `${zoneInfo.currentWaste} / ${zoneInfo.maxCapacity}`;
    
    // Zone vide ?
    if (zoneInfo.isEmpty) {
      this.emptyText.visible = true;
      this.collectAllBtn.visible = false;
      return;
    }
    
    this.emptyText.visible = false;
    this.collectAllBtn.visible = true;
    
    // Zone d'affichage des déchets
    const areaX = 30;
    const areaY = 110;
    const areaWidth = this.panelWidth - 60;
    const areaHeight = this.panelHeight - 200;
    
    // Créer les visuels des déchets
    zoneInfo.wasteItems.forEach((item, index) => {
      const wasteVisual = this._createWasteVisual(item, index, areaX, areaY, areaWidth, areaHeight);
      this.wasteContainer.addChild(wasteVisual);
      this.wasteItems.push(wasteVisual);
    });
  }
  
  /**
   * Crée un visuel de déchet cliquable
   */
  _createWasteVisual(item, index, areaX, areaY, areaWidth, areaHeight) {
    const container = new PIXI.Container();
    container.wasteItem = item;
    
    // Position aléatoire dans la zone (mais avec un pattern pour éviter les superpositions)
    const cols = 6;
    const rows = 4;
    const cellW = areaWidth / cols;
    const cellH = areaHeight / rows;
    
    const col = index % cols;
    const row = Math.floor(index / cols) % rows;
    
    // Ajouter un peu d'aléatoire dans la cellule
    const x = areaX + col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.5;
    const y = areaY + row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.5;
    
    container.x = x;
    container.y = y;
    container.baseY = y; // Stocker pour l'animation
    
    // Fond du déchet
    const bg = new PIXI.Graphics();
    bg.beginFill(item.type.color, 0.7);
    bg.drawCircle(0, 0, 25);
    bg.endFill();
    bg.beginFill(0xFFFFFF, 0.2);
    bg.drawCircle(-8, -8, 8);
    bg.endFill();
    container.addChild(bg);
    
    // Emoji
    const emoji = new PIXI.Text(item.type.emoji, {
      fontSize: 28,
    });
    emoji.anchor.set(0.5);
    container.addChild(emoji);
    
    // Valeur (cachée)
    const valueText = new PIXI.Text(`+${item.value}`, {
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    valueText.anchor.set(0.5);
    valueText.y = -35;
    valueText.visible = false;
    container.addChild(valueText);
    container.valueText = valueText;
    
    // Interactivité
    container.eventMode = 'static';
    container.cursor = 'pointer';
    
    container.on('pointerover', () => {
      container.scale.set(1.15);
      valueText.visible = true;
    });
    
    container.on('pointerout', () => {
      container.scale.set(1);
      valueText.visible = false;
    });
    
    container.on('pointerdown', () => {
      this._collectOne(container);
    });
    
    // Animation de flottement
    const startTime = Date.now() + Math.random() * 1000;
    const floatSpeed = 0.002 + Math.random() * 0.001;
    const floatAmount = 3 + Math.random() * 2;
    
    const float = () => {
      if (container.destroyed) return;
      
      const elapsed = Date.now() - startTime;
      container.y = container.baseY + Math.sin(elapsed * floatSpeed) * floatAmount;
      container.rotation = Math.sin(elapsed * floatSpeed * 0.7) * 0.05;
      
      requestAnimationFrame(float);
    };
    requestAnimationFrame(float);
    
    return container;
  }
  
  /**
   * Collecte un seul déchet
   */
  _collectOne(wasteVisual) {
    if (wasteVisual.destroyed) return;
    
    const item = wasteVisual.wasteItem;
    
    // Ajouter à la jauge globale
    WasteManager.addWaste(item.type, item.value);
    
    // Retirer de la zone
    CollectionZoneManager.collectOneFromZone(this.currentZoneId);
    
    // Animation de collecte
    this._animateCollect(wasteVisual);
    
    // Mettre à jour le compteur
    const zoneInfo = CollectionZoneManager.getZoneInfo(this.currentZoneId);
    if (zoneInfo) {
      this.zoneCountText.text = `${zoneInfo.currentWaste} / ${zoneInfo.maxCapacity}`;
      
      if (zoneInfo.isEmpty) {
        this.emptyText.visible = true;
        this.collectAllBtn.visible = false;
      }
    }
  }
  
  /**
   * Animation de collecte
   */
  _animateCollect(wasteVisual) {
    const duration = 300;
    const startTime = Date.now();
    const startY = wasteVisual.y;
    
    wasteVisual.valueText.visible = true;
    wasteVisual.eventMode = 'none';
    
    const animate = () => {
      if (wasteVisual.destroyed) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Scale qui diminue
      wasteVisual.scale.set(1 - progress * 0.8);
      
      // Monte légèrement
      wasteVisual.y = startY - progress * 20;
      
      // Valeur qui monte et fade
      wasteVisual.valueText.y = -35 - progress * 30;
      wasteVisual.valueText.alpha = 1 - progress;
      
      // Rotation
      wasteVisual.rotation += 0.15;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Retirer de la liste et détruire
        this.wasteItems = this.wasteItems.filter(w => w !== wasteVisual);
        wasteVisual.destroy();
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  /**
   * Collecte tous les déchets de la zone
   */
  _collectAll() {
    const zoneInfo = CollectionZoneManager.getZoneInfo(this.currentZoneId);
    if (!zoneInfo || zoneInfo.isEmpty) return;
    
    // Collecter tous les items et ajouter à la jauge
    const collected = CollectionZoneManager.collectFromZone(this.currentZoneId);
    
    collected.forEach(item => {
      WasteManager.addWaste(item.type, item.value);
    });
    
    // Animer tous les déchets
    this.wasteItems.forEach((wasteVisual, i) => {
      setTimeout(() => {
        if (!wasteVisual.destroyed) {
          this._animateCollect(wasteVisual);
        }
      }, i * 50); // Décalage pour effet cascade
    });
    
    // Mettre à jour UI
    this.zoneCountText.text = `0 / ${zoneInfo.maxCapacity}`;
    this.collectAllBtn.visible = false;
    
    // Afficher le message vide après les animations
    setTimeout(() => {
      this.emptyText.visible = true;
    }, this.wasteItems.length * 50 + 300);
  }
  
  /**
   * Nettoie l'affichage des déchets
   */
  _clearWasteDisplay() {
    this.wasteItems.forEach(w => {
      if (!w.destroyed) w.destroy();
    });
    this.wasteItems = [];
  }
  
  /**
   * Ferme la scène
   */
  close() {
    this._clearWasteDisplay();
    this.visible = false;
    
    if (this.onClose) {
      this.onClose();
    }
  }
  
  /**
   * Gère le resize
   */
  _onResize() {
    if (!this.visible) return;
    
    this._drawBackground();
    this._positionUI();
    this._displayWaste();
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
    this._clearWasteDisplay();
    super.destroy({ children: true });
  }
}
