/**
 * MarketWindow.js
 * Interface du marché - Échange de ressources
 */

import * as PIXI from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

export class MarketWindow extends PIXI.Container {
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

    // Échanges déjà effectués (chaque échange n'est disponible qu'une fois)
    this.usedTrades = new Set();

    // Configuration de la fenêtre
    this.windowWidth = 550;
    this.windowHeight = 450;
    this.padding = 20;

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
    this.title = new PIXI.Text('🏪 Marché', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.TITLE,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    this.title.x = this.padding;
    this.title.y = this.padding;
    this.windowContainer.addChild(this.title);

    // Description
    this.description = new PIXI.Text('Offres exclusives ! Chaque échange n\'est disponible qu\'une seule fois.', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: this.windowWidth - this.padding * 2,
    });
    this.description.x = this.padding;
    this.description.y = this.title.y + this.title.height + 10;
    this.windowContainer.addChild(this.description);

    // Conteneur pour les échanges
    this.tradesContainer = new PIXI.Container();
    this.tradesContainer.x = this.padding;
    this.tradesContainer.y = this.description.y + this.description.height + 20;
    this.windowContainer.addChild(this.tradesContainer);

    // Créer les options d'échange
    this._createTradeOptions();

    // Bouton fermer
    this._createCloseButton();

    // Resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);

    this._draw();

    this.visible = false;
  }

  /**
   * Définit l'instance GameMetrics
   */
  setGameMetrics(gameMetrics) {
    this.gameMetrics = gameMetrics;
  }

  /**
   * Définition des échanges disponibles (pas d'électricité à vendre !)
   * Chaque échange n'est disponible qu'une seule fois mais donne beaucoup !
   */
  _getTradesDefinition() {
    return [
      {
        id: 'trash-wood-to-food',
        name: '🍽️ Festin Royal',
        give: [
          { resource: 'waste', amount: 15, emoji: '🗑️' },
          { resource: 'wood', amount: 15, emoji: '🪵' }
        ],
        receive: { resource: 'food', amount: 100, emoji: '🥕' },
        description: 'Un énorme stock de nourriture !'
      },
      {
        id: 'food-waste-to-wood',
        name: '🪵 Forêt Entière',
        give: [
          { resource: 'food', amount: 15, emoji: '🥕' },
          { resource: 'waste', amount: 15, emoji: '🗑️' }
        ],
        receive: { resource: 'wood', amount: 100, emoji: '🪵' },
        description: 'Assez de bois pour construire un village !'
      },
      {
        id: 'food-wood-to-waste',
        name: '🗑️ Montagne de Déchets',
        give: [
          { resource: 'food', amount: 15, emoji: '🥕' },
          { resource: 'wood', amount: 15, emoji: '🪵' }
        ],
        receive: { resource: 'waste', amount: 120, emoji: '🗑️' },
        description: 'Des tonnes de matériaux recyclables !'
      },
    ];
  }

  /**
   * Crée les options d'échange
   */
  _createTradeOptions() {
    this.tradesContainer.removeChildren();

    const trades = this._getTradesDefinition();

    trades.forEach((trade, index) => {
      const isUsed = this.usedTrades.has(trade.id);
      const itemContainer = new PIXI.Container();
      itemContainer.y = index * 85;

      // Fond de l'item (grisé si épuisé)
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(isUsed ? 0x333333 : 0x3a4a3a, 0.9);
      itemBg.drawRoundedRect(0, 0, this.windowWidth - this.padding * 2, 78, 8);
      itemBg.endFill();
      itemContainer.addChild(itemBg);

      // Nom de l'échange
      const nameText = new PIXI.Text(trade.name + (isUsed ? ' ❌ ÉPUISÉ' : ' ⭐'), {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.BODY,
        fill: isUsed ? 0x666666 : 0xffffff,
        fontWeight: 'bold',
      });
      nameText.x = 15;
      nameText.y = 8;
      itemContainer.addChild(nameText);

      // Ce qu'on donne
      const giveText = trade.give.map(g => `${g.amount} ${g.emoji}`).join(' + ');
      const tradeText = new PIXI.Text(`Donner: ${giveText}`, {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: isUsed ? 0x555555 : 0xff9999,
      });
      tradeText.x = 15;
      tradeText.y = 32;
      itemContainer.addChild(tradeText);

      // Ce qu'on reçoit
      const receiveText = new PIXI.Text(`Recevoir: ${trade.receive.amount} ${trade.receive.emoji}`, {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: isUsed ? 0x555555 : 0x99ff99,
      });
      receiveText.x = 15;
      receiveText.y = 52;
      itemContainer.addChild(receiveText);

      // Bouton échanger (désactivé si épuisé)
      const tradeBtn = new PIXI.Container();
      tradeBtn.x = this.windowWidth - this.padding * 2 - 110;
      tradeBtn.y = 20;

      const btnBg = new PIXI.Graphics();
      btnBg.beginFill(isUsed ? 0x444444 : 0x6688aa);
      btnBg.drawRoundedRect(0, 0, 95, 38, 6);
      btnBg.endFill();
      tradeBtn.addChild(btnBg);

      const btnLabel = new PIXI.Text(isUsed ? 'Épuisé' : 'Échanger', {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: isUsed ? 0x666666 : 0xffffff,
      });
      btnLabel.anchor.set(0.5);
      btnLabel.x = 47;
      btnLabel.y = 19;
      tradeBtn.addChild(btnLabel);

      // Activer les interactions seulement si pas épuisé
      if (!isUsed) {
        tradeBtn.eventMode = 'static';
        tradeBtn.cursor = 'pointer';
        tradeBtn.on('pointerdown', () => this._onTrade(trade));
        tradeBtn.on('pointerover', () => { btnBg.alpha = 0.8; });
        tradeBtn.on('pointerout', () => { btnBg.alpha = 1; });
      }

      itemContainer.addChild(tradeBtn);
      this.tradesContainer.addChild(itemContainer);
    });
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
    this.windowBg.beginFill(0x2a3a2a);
    this.windowBg.drawRoundedRect(0, 0, this.windowWidth, this.windowHeight, 12);
    this.windowBg.endFill();
    this.windowBg.lineStyle(2, 0x66aa66);
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
   * Callback d'échange
   * @param {Object} trade - Objet de l'échange
   */
  _onTrade(trade) {
    if (!this.gameMetrics) {
      console.warn('GameMetrics non disponible');
      return;
    }

    // Vérifier si on a assez de ressources
    let canTrade = true;
    for (const give of trade.give) {
      const current = this.gameMetrics.getMetric(give.resource);
      if (current < give.amount) {
        canTrade = false;
        break;
      }
    }

    if (canTrade) {
      // Effectuer l'échange
      const changes = {};

      // Déduire ce qu'on donne
      for (const give of trade.give) {
        changes[give.resource] = -give.amount;
      }

      // Ajouter ce qu'on reçoit
      changes[trade.receive.resource] = (changes[trade.receive.resource] || 0) + trade.receive.amount;

      this.gameMetrics.addToMetrics(changes);

      // Marquer l'échange comme utilisé
      this.usedTrades.add(trade.id);

      console.log(`✅ Échange effectué : ${trade.name}`);

      // Feedback visuel
      this.description.text = `✅ Échange réussi ! +${trade.receive.amount} ${trade.receive.emoji}`;
      this.description.style.fill = 0x66ff66;

      // Rafraîchir l'affichage pour montrer l'échange épuisé
      this._createTradeOptions();

      setTimeout(() => {
        this.description.text = 'Échangez vos ressources ! (Offres limitées)';
        this.description.style.fill = 0xcccccc;
      }, 1500);
    } else {
      // Pas assez de ressources
      const needed = trade.give.map(g => `${this.gameMetrics.getMetric(g.resource)}/${g.amount} ${g.emoji}`).join(', ');
      console.log(`❌ Ressources insuffisantes pour ${trade.name}`);
      this.description.text = `❌ Ressources insuffisantes ! (${needed})`;
      this.description.style.fill = 0xff6666;

      setTimeout(() => {
        this.description.text = 'Échangez vos ressources !';
        this.description.style.fill = 0xcccccc;
      }, 2000);
    }
  }

  /**
   * Ouvre la fenêtre
   */
  open() {
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
    window.removeEventListener('resize', this._onResize);
    super.destroy({ children: true });
  }
}

