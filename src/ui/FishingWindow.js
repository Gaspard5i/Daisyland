/**
 * FishingWindow.js
 * Interface pour le pêcheur de déchets (Fisher)
 * Le fisher pêche des déchets passivement si on lui donne de la nourriture
 */

import * as PIXI from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

export class FishingWindow extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Function} onClose - Callback pour fermer la fenêtre
   * @param {Object} gameMetrics - Instance de GameMetrics
   */
  constructor(app, onClose, gameMetrics = null) {
    super();

    this.app = app;
    this.onClose = onClose;
    this.gameMetrics = gameMetrics;

    // Configuration de la fenêtre
    this.windowWidth = 450;
    this.windowHeight = 400;
    this.padding = 20;

    // État du fisher
    this.fishingTimeLeft = 0; // Temps restant de pêche en secondes
    this.fishingInterval = null; // Intervalle de pêche

    // Créer l'overlay sombre
    this.overlay = new PIXI.Graphics();
    this.addChild(this.overlay);

    // Conteneur de la fenêtre (centré)
    this.windowContainer = new PIXI.Container();
    this.addChild(this.windowContainer);

    // Fond de la fenêtre
    this.windowBg = new PIXI.Graphics();
    this.windowContainer.addChild(this.windowBg);

    // Titre
    this.title = new PIXI.Text('🎣 Pêcheur de Déchets', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.TITLE,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    this.title.x = this.padding;
    this.title.y = this.padding;
    this.windowContainer.addChild(this.title);

    // Dialogue du pêcheur
    this.dialogue = new PIXI.Text('', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: this.windowWidth - this.padding * 2,
    });
    this.dialogue.x = this.padding;
    this.dialogue.y = this.title.y + this.title.height + 15;
    this.windowContainer.addChild(this.dialogue);

    // Zone d'interface
    this.contentArea = new PIXI.Container();
    this.contentArea.x = this.padding;
    this.contentArea.y = this.dialogue.y + 60;
    this.windowContainer.addChild(this.contentArea);

    // Créer l'interface
    this._createInterface();

    // Bouton fermer
    this._createCloseButton();

    // Resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    this._draw();
    this._updateDialogue();

    this.visible = false;

    // Démarrer le système de pêche passive
    this._startFishingSystem();
  }

  /**
   * Définit l'instance GameMetrics
   */
  setGameMetrics(gameMetrics) {
    this.gameMetrics = gameMetrics;
  }

  /**
   * Démarre le système de pêche passive (tourne en arrière-plan)
   */
  _startFishingSystem() {
    // Intervalle principal : chaque seconde, décompter le temps
    this.fishingInterval = setInterval(() => {
      if (this.fishingTimeLeft > 0) {
        this.fishingTimeLeft--;

        // Toutes les 5 secondes, pêcher 1 déchet
        if (this.fishingTimeLeft % 5 === 0 && this.fishingTimeLeft > 0) {
          this._catchWaste();
        }

        // Mettre à jour l'interface si visible
        if (this.visible) {
          this._updateInterface();
        }
      }
    }, 1000);
  }

  /**
   * Pêche un déchet
   */
  _catchWaste() {
    if (this.gameMetrics) {
      this.gameMetrics.addToMetric('waste', 1);
      console.log('🎣 Le pêcheur a récupéré 1 déchet !');
    }
  }

  /**
   * Ajoute de la nourriture pour prolonger la pêche
   * @param {number} amount - Quantité de nourriture à donner
   */
  _feedFisher(amount) {
    if (!this.gameMetrics) {
      console.warn('GameMetrics non disponible');
      return false;
    }

    const currentFood = this.gameMetrics.getMetric('food');

    if (currentFood >= amount) {
      // Déduire la nourriture
      this.gameMetrics.addToMetric('food', -amount);

      // Ajouter du temps de pêche (5 secondes par nourriture)
      this.fishingTimeLeft += amount * 5;

      console.log(`🥕 Fisher nourri ! +${amount * 5}s de pêche. Temps total: ${this.fishingTimeLeft}s`);

      this._updateDialogue();
      this._updateInterface();
      return true;
    } else {
      console.log('❌ Pas assez de nourriture !');
      return false;
    }
  }

  /**
   * Met à jour le dialogue du pêcheur
   */
  _updateDialogue() {
    if (this.fishingTimeLeft > 0) {
      this.dialogue.text = `🧔 "Je pêche les déchets pour toi ! Encore ${this.fishingTimeLeft}s de travail."`;
      this.dialogue.style.fill = 0x99ff99;
    } else {
      this.dialogue.text = '🧔 "Donne-moi de la nourriture et je pêcherai les déchets pour toi !"';
      this.dialogue.style.fill = 0xcccccc;
    }
  }

  /**
   * Crée l'interface principale
   */
  _createInterface() {
    this.contentArea.removeChildren();

    // Zone de statut
    const statusBg = new PIXI.Graphics();
    statusBg.beginFill(0x2a4a5a, 0.9);
    statusBg.drawRoundedRect(0, 0, this.windowWidth - this.padding * 2, 100, 8);
    statusBg.endFill();
    this.contentArea.addChild(statusBg);

    // Icône du pêcheur
    const fisherIcon = new PIXI.Text('🧔🎣', {
      fontFamily: FONTS.DEFAULT,
      fontSize: 40,
    });
    fisherIcon.x = 20;
    fisherIcon.y = 25;
    this.contentArea.addChild(fisherIcon);

    // Texte de statut
    this.statusText = new PIXI.Text('', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xffffff,
      wordWrap: true,
      wordWrapWidth: this.windowWidth - this.padding * 4 - 100,
    });
    this.statusText.x = 100;
    this.statusText.y = 20;
    this.contentArea.addChild(this.statusText);

    // Barre de progression du temps
    this.progressBarBg = new PIXI.Graphics();
    this.progressBarBg.beginFill(0x333333);
    this.progressBarBg.drawRoundedRect(100, 70, this.windowWidth - this.padding * 4 - 100, 15, 4);
    this.progressBarBg.endFill();
    this.contentArea.addChild(this.progressBarBg);

    this.progressBar = new PIXI.Graphics();
    this.contentArea.addChild(this.progressBar);

    // Explication
    const infoText = new PIXI.Text('📋 Comment ça marche:\n• Donne de la nourriture au pêcheur\n• Il pêche 1 🗑️ toutes les 5 secondes\n• 1 🥕 = 5 secondes de pêche\n• Il travaille même si tu fermes cette fenêtre !', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.SMALL,
      fill: 0xaaaaaa,
      wordWrap: true,
      wordWrapWidth: this.windowWidth - this.padding * 2,
    });
    infoText.x = 0;
    infoText.y = 115;
    this.contentArea.addChild(infoText);

    // Boutons pour donner de la nourriture
    const buttonsY = 230;

    // Bouton +1 nourriture
    this._createFeedButton('+1 🥕', 1, 0, buttonsY);

    // Bouton +5 nourriture
    this._createFeedButton('+5 🥕', 5, 110, buttonsY);

    // Bouton +10 nourriture
    this._createFeedButton('+10 🥕', 10, 220, buttonsY);

    this._updateInterface();
  }

  /**
   * Crée un bouton pour donner de la nourriture
   */
  _createFeedButton(label, amount, x, y) {
    const btn = new PIXI.Container();
    btn.x = x;
    btn.y = y;

    const btnBg = new PIXI.Graphics();
    btnBg.beginFill(0x66aa66);
    btnBg.drawRoundedRect(0, 0, 100, 45, 8);
    btnBg.endFill();
    btn.addChild(btnBg);

    const btnLabel = new PIXI.Text(label, {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BUTTON,
      fill: 0xffffff,
    });
    btnLabel.anchor.set(0.5);
    btnLabel.x = 50;
    btnLabel.y = 22;
    btn.addChild(btnLabel);

    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', () => {
      const success = this._feedFisher(amount);
      if (!success) {
        // Feedback d'erreur
        btnBg.tint = 0xff6666;
        setTimeout(() => { btnBg.tint = 0xffffff; }, 300);
      } else {
        // Feedback de succès
        btnBg.tint = 0x88ff88;
        setTimeout(() => { btnBg.tint = 0xffffff; }, 300);
      }
    });
    btn.on('pointerover', () => { btnBg.alpha = 0.8; });
    btn.on('pointerout', () => { btnBg.alpha = 1; });

    this.contentArea.addChild(btn);
  }

  /**
   * Met à jour l'interface
   */
  _updateInterface() {
    if (!this.statusText) return;

    if (this.fishingTimeLeft > 0) {
      const minutes = Math.floor(this.fishingTimeLeft / 60);
      const seconds = this.fishingTimeLeft % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      this.statusText.text = `⏱️ Temps restant: ${timeStr}\n🗑️ Pêche 1 déchet / 5s`;
      this.statusText.style.fill = 0x99ff99;
    } else {
      this.statusText.text = '😴 En attente...\nDonne-moi à manger !';
      this.statusText.style.fill = 0xffaa66;
    }

    // Mettre à jour la barre de progression
    this.progressBar.clear();
    if (this.fishingTimeLeft > 0) {
      const maxDisplay = 60; // Afficher max 60s sur la barre
      const progress = Math.min(this.fishingTimeLeft / maxDisplay, 1);
      const barWidth = (this.windowWidth - this.padding * 4 - 100) * progress;

      this.progressBar.beginFill(0x66aa66);
      this.progressBar.drawRoundedRect(100, 70, barWidth, 15, 4);
      this.progressBar.endFill();
    }

    this._updateDialogue();
  }

  /**
   * Crée le bouton fermer
   */
  _createCloseButton() {
    this.closeBtn = new PIXI.Container();

    const btnBg = new PIXI.Graphics();
    btnBg.beginFill(0xcc4444);
    btnBg.drawRoundedRect(0, 0, 40, 40, 8);
    btnBg.endFill();
    this.closeBtn.addChild(btnBg);

    const closeX = new PIXI.Text('✕', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xffffff,
    });
    closeX.anchor.set(0.5);
    closeX.x = 20;
    closeX.y = 20;
    this.closeBtn.addChild(closeX);

    this.closeBtn.eventMode = 'static';
    this.closeBtn.cursor = 'pointer';
    this.closeBtn.on('pointerdown', () => this.close());
    this.closeBtn.on('pointerover', () => { btnBg.alpha = 0.8; });
    this.closeBtn.on('pointerout', () => { btnBg.alpha = 1; });

    this.windowContainer.addChild(this.closeBtn);
  }

  /**
   * Dessine la fenêtre
   */
  _draw() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;

    // Overlay sombre
    this.overlay.clear();
    this.overlay.beginFill(0x000000, 0.7);
    this.overlay.drawRect(0, 0, screenWidth, screenHeight);
    this.overlay.endFill();
    this.overlay.eventMode = 'static';

    // Fond de la fenêtre
    this.windowBg.clear();
    this.windowBg.beginFill(0x2a3a5a);
    this.windowBg.drawRoundedRect(0, 0, this.windowWidth, this.windowHeight, 12);
    this.windowBg.endFill();
    this.windowBg.lineStyle(2, 0x66aacc);
    this.windowBg.drawRoundedRect(0, 0, this.windowWidth, this.windowHeight, 12);

    // Centrer la fenêtre
    this.windowContainer.x = (screenWidth - this.windowWidth) / 2;
    this.windowContainer.y = (screenHeight - this.windowHeight) / 2;

    // Position du bouton fermer
    this.closeBtn.x = this.windowWidth - 50;
    this.closeBtn.y = 10;
  }

  /**
   * Gestion du resize
   */
  _onResize() {
    if (this.visible) {
      this._draw();
    }
  }

  /**
   * Retourne le temps de pêche restant
   */
  getFishingTimeLeft() {
    return this.fishingTimeLeft;
  }

  /**
   * Vérifie si le pêcheur est actif
   */
  isFishing() {
    return this.fishingTimeLeft > 0;
  }

  /**
   * Ouvre la fenêtre
   */
  open() {
    this._updateInterface();
    this._draw();
    this.visible = true;
  }

  /**
   * Ferme la fenêtre
   */
  close() {
    this.visible = false;
    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Nettoyage
   */
  destroy() {
    if (this.fishingInterval) {
      clearInterval(this.fishingInterval);
    }
    window.removeEventListener('resize', this._onResize);
    super.destroy({ children: true });
  }
}

