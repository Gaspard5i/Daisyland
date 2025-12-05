/**
 * Parcel.js
 * Parcelle de ferme qui génère passivement des tomates
 * Similaire au système d'élixir de Clash of Clans
 */

import * as PIXI from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

export class Parcel extends PIXI.Container {
  /**
   * @param {Object} options - Options de la parcelle
   * @param {number} options.x - Position X
   * @param {number} options.y - Position Y
   * @param {Object} options.gameMetrics - Instance de GameMetrics
   * @param {number} options.maxStorage - Stockage max de tomates (défaut: 100)
   * @param {number} options.generationInterval - Intervalle de génération en ms (défaut: 3000)
   */
  constructor(options = {}) {
    super();

    this.gameMetrics = options.gameMetrics || null;
    this.maxStorage = options.maxStorage || 100;
    this.generationInterval = options.generationInterval || 3000; // 3 secondes

    // Stock de tomates dans la parcelle
    this.storedTomatoes = 0;

    // Position
    this.x = options.x || 0;
    this.y = options.y || 0;

    // Taille de la parcelle
    this.parcelWidth = 80;
    this.parcelHeight = 80;

    // Créer les éléments visuels
    this._createVisuals();

    // Démarrer la génération passive
    this._startGeneration();

    // Mettre à jour l'affichage
    this._updateDisplay();
  }

  /**
   * Définit l'instance GameMetrics
   */
  setGameMetrics(gameMetrics) {
    this.gameMetrics = gameMetrics;
  }

  /**
   * Crée les éléments visuels de la parcelle
   */
  _createVisuals() {
    // Conteneur principal centré
    this.pivot.set(this.parcelWidth / 2, this.parcelHeight / 2);

    // Fond de la parcelle (terre)
    this.background = new PIXI.Graphics();
    this._drawBackground();
    this.addChild(this.background);

    // Icône de la parcelle/tomates
    this.parcelIcon = new PIXI.Text('🍅', {
      fontSize: 40,
    });
    this.parcelIcon.anchor.set(0.5);
    this.parcelIcon.x = this.parcelWidth / 2;
    this.parcelIcon.y = this.parcelHeight / 2 - 5;
    this.addChild(this.parcelIcon);

    // Compteur de tomates stockées
    this.counterBg = new PIXI.Graphics();
    this.addChild(this.counterBg);

    this.counterText = new PIXI.Text('0', {
      fontFamily: FONTS.DEFAULT,
      fontSize: 14,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    this.counterText.anchor.set(0.5);
    this.counterText.x = this.parcelWidth / 2;
    this.counterText.y = this.parcelHeight - 8;
    this.addChild(this.counterText);

    // Bouton de collecte (apparaît quand il y a des tomates)
    this.collectButton = new PIXI.Container();
    this.collectButton.x = this.parcelWidth / 2;
    this.collectButton.y = -15;
    this.collectButton.visible = false;

    const collectBg = new PIXI.Graphics();
    collectBg.beginFill(0xff6347); // Tomate color
    collectBg.drawRoundedRect(-30, -12, 60, 24, 8);
    collectBg.endFill();
    this.collectButton.addChild(collectBg);

    const collectLabel = new PIXI.Text('🍅 Récolter', {
      fontFamily: FONTS.DEFAULT,
      fontSize: 10,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    collectLabel.anchor.set(0.5);
    this.collectButton.addChild(collectLabel);

    this.collectButton.eventMode = 'static';
    this.collectButton.cursor = 'pointer';
    this.collectButton.on('pointerdown', (e) => {
      e.stopPropagation();
      this._collectTomatoes();
    });
    this.collectButton.on('pointerover', () => { collectBg.alpha = 0.8; });
    this.collectButton.on('pointerout', () => { collectBg.alpha = 1; });

    this.addChild(this.collectButton);

    // Rendre la parcelle interactive
    this.eventMode = 'static';
    this.cursor = 'pointer';
    this.on('pointerdown', () => {
      if (this.storedTomatoes > 0) {
        this._collectTomatoes();
      }
    });
  }

  /**
   * Dessine le fond de la parcelle
   */
  _drawBackground() {
    this.background.clear();

    // Ombre
    this.background.beginFill(0x3E2723, 0.5);
    this.background.drawRoundedRect(3, 5, this.parcelWidth, this.parcelHeight, 10);
    this.background.endFill();

    // Fond principal (terre)
    this.background.beginFill(0x8D6E63);
    this.background.lineStyle(2, 0x5D4037);
    this.background.drawRoundedRect(0, 0, this.parcelWidth, this.parcelHeight, 10);
    this.background.endFill();

    // Terre intérieure
    this.background.beginFill(0x4E342E);
    this.background.drawRoundedRect(8, 8, this.parcelWidth - 16, this.parcelHeight - 16, 6);
    this.background.endFill();

    // Lignes de culture
    this.background.lineStyle(1, 0x3E2723, 0.3);
    for (let i = 1; i < 4; i++) {
      const y = 8 + i * ((this.parcelHeight - 16) / 4);
      this.background.moveTo(10, y);
      this.background.lineTo(this.parcelWidth - 10, y);
    }
  }

  /**
   * Démarre la génération passive de tomates
   */
  _startGeneration() {
    this.generationTimer = setInterval(() => {
      this._generateTomato();
    }, this.generationInterval);
  }

  /**
   * Génère une tomate si possible
   */
  _generateTomato() {
    if (this.storedTomatoes < this.maxStorage) {
      this.storedTomatoes++;
      this._updateDisplay();
      console.log(`🍅 Tomate générée ! Stock: ${this.storedTomatoes}/${this.maxStorage}`);
    }
  }

  /**
   * Met à jour l'affichage de la parcelle
   */
  _updateDisplay() {
    // Mettre à jour le compteur
    this.counterText.text = this.storedTomatoes.toString();

    // Fond du compteur
    this.counterBg.clear();
    if (this.storedTomatoes > 0) {
      const bgWidth = Math.max(30, this.counterText.width + 10);
      this.counterBg.beginFill(0x333333, 0.8);
      this.counterBg.drawRoundedRect(
        this.parcelWidth / 2 - bgWidth / 2,
        this.parcelHeight - 18,
        bgWidth,
        18,
        4
      );
      this.counterBg.endFill();
    }

    // Afficher/masquer le bouton de collecte
    this.collectButton.visible = this.storedTomatoes > 0;

    // Animation de l'icône selon le stock
    const fillRatio = this.storedTomatoes / this.maxStorage;
    if (fillRatio >= 0.8) {
      // Parcelle presque pleine - animation de pulsation
      this.parcelIcon.scale.set(1.1 + Math.sin(Date.now() / 200) * 0.05);
    } else if (fillRatio >= 0.5) {
      this.parcelIcon.scale.set(1.05);
    } else {
      this.parcelIcon.scale.set(1);
    }

    // Changer la couleur du fond selon le remplissage
    if (fillRatio >= 0.9) {
      this.counterBg.tint = 0xff4444; // Rouge si presque plein
    } else if (fillRatio >= 0.5) {
      this.counterBg.tint = 0xffaa44; // Orange
    } else {
      this.counterBg.tint = 0xffffff; // Normal
    }
  }

  /**
   * Collecte les tomates et les ajoute à l'inventaire
   */
  _collectTomatoes() {
    if (!this.gameMetrics || this.storedTomatoes <= 0) {
      return;
    }

    const currentFood = this.gameMetrics.getMetric('food');
    const maxFood = 100; // Maximum de nourriture dans l'inventaire

    // Calculer combien on peut prendre
    const spaceAvailable = Math.max(0, maxFood - currentFood);
    const toCollect = Math.min(this.storedTomatoes, spaceAvailable);

    if (toCollect > 0) {
      // Ajouter à l'inventaire
      this.gameMetrics.addToMetric('food', toCollect);

      // Retirer du stock de la parcelle
      this.storedTomatoes -= toCollect;

      console.log(`✅ Récolté ${toCollect} 🍅 ! Reste dans parcelle: ${this.storedTomatoes}`);

      // Animation de collecte
      this._playCollectAnimation(toCollect);
    }

    if (this.storedTomatoes > 0 && toCollect === 0) {
      // Inventaire plein
      console.log(`⚠️ Inventaire plein ! ${this.storedTomatoes} 🍅 restent dans la parcelle.`);
      this._showFullInventoryMessage();
    }

    this._updateDisplay();
  }

  /**
   * Animation de collecte
   */
  _playCollectAnimation(amount) {
    // Texte flottant "+X 🍅"
    const floatingText = new PIXI.Text(`+${amount} 🍅`, {
      fontFamily: FONTS.DEFAULT,
      fontSize: 18,
      fill: 0x66ff66,
      fontWeight: 'bold',
      stroke: 0x000000,
      strokeThickness: 2,
    });
    floatingText.anchor.set(0.5);
    floatingText.x = this.parcelWidth / 2;
    floatingText.y = this.parcelHeight / 2;
    this.addChild(floatingText);

    // Animation
    let elapsed = 0;
    const animate = () => {
      elapsed += 16;
      floatingText.y -= 1.5;
      floatingText.alpha = 1 - elapsed / 1000;

      if (elapsed < 1000) {
        requestAnimationFrame(animate);
      } else {
        this.removeChild(floatingText);
        floatingText.destroy();
      }
    };
    animate();
  }

  /**
   * Affiche un message "Inventaire plein"
   */
  _showFullInventoryMessage() {
    const msg = new PIXI.Text('Inventaire plein !', {
      fontFamily: FONTS.DEFAULT,
      fontSize: 12,
      fill: 0xff6666,
      fontWeight: 'bold',
    });
    msg.anchor.set(0.5);
    msg.x = this.parcelWidth / 2;
    msg.y = -30;
    this.addChild(msg);

    setTimeout(() => {
      this.removeChild(msg);
      msg.destroy();
    }, 2000);
  }

  /**
   * Retourne le nombre de tomates stockées
   */
  getStoredTomatoes() {
    return this.storedTomatoes;
  }

  /**
   * Nettoyage
   */
  destroy() {
    if (this.generationTimer) {
      clearInterval(this.generationTimer);
    }
    super.destroy({ children: true });
  }
}

