/**
 * FabricWindow.js
 * Interface de création de générateurs d'électricité
 */

import * as PIXI from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

export class FabricWindow extends PIXI.Container {
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
    this.windowWidth = 500;
    this.windowHeight = 350;
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
    this.title = new PIXI.Text('🏭 Atelier de Fabrication', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.TITLE,
      fill: 0xffffff,
      fontWeight: 'bold',
    });
    this.title.x = this.padding;
    this.title.y = this.padding;
    this.windowContainer.addChild(this.title);

    // Description
    this.description = new PIXI.Text('Créez des générateurs d\'électricité !', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xcccccc,
      wordWrap: true,
      wordWrapWidth: this.windowWidth - this.padding * 2,
    });
    this.description.x = this.padding;
    this.description.y = this.title.y + this.title.height + 10;
    this.windowContainer.addChild(this.description);

    // Conteneur pour les options de construction
    this.optionsContainer = new PIXI.Container();
    this.optionsContainer.x = this.padding;
    this.optionsContainer.y = this.description.y + this.description.height + 20;
    this.windowContainer.addChild(this.optionsContainer);

    // Créer les options de bâtiments
    this._createBuildingOptions();

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
   * Crée les options de construction
   */
  _createBuildingOptions() {
    this.optionsContainer.removeChildren();

    const buildings = [
      {
        id: 'windmill',
        name: '🌬️ Éolienne',
        costWood: 50,
        costWaste: 50,
        description: 'Génère +10 ⚡/min',
        electricityBonus: 10
      },
      {
        id: 'bike',
        name: '🚴 Vélo Générateur',
        costWood: 5,
        costWaste: 5,
        description: 'Génère +2 ⚡/min',
        electricityBonus: 2
      },
    ];

    buildings.forEach((building, index) => {
      const itemContainer = new PIXI.Container();
      itemContainer.y = index * 100;

      // Fond de l'item
      const itemBg = new PIXI.Graphics();
      itemBg.beginFill(0x444466, 0.8);
      itemBg.drawRoundedRect(0, 0, this.windowWidth - this.padding * 2, 90, 8);
      itemBg.endFill();
      itemContainer.addChild(itemBg);

      // Nom du bâtiment
      const nameText = new PIXI.Text(building.name, {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.BODY,
        fill: 0xffffff,
        fontWeight: 'bold',
      });
      nameText.x = 15;
      nameText.y = 10;
      itemContainer.addChild(nameText);

      // Description
      const descText = new PIXI.Text(building.description, {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: 0xaaaaaa,
      });
      descText.x = 15;
      descText.y = 35;
      itemContainer.addChild(descText);

      // Coût
      const costText = new PIXI.Text(`Coût: ${building.costWood} 🪵 + ${building.costWaste} 🗑️`, {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: 0xffdd00,
      });
      costText.x = 15;
      costText.y = 55;
      itemContainer.addChild(costText);

      // Bouton construire
      const buildBtn = new PIXI.Container();
      buildBtn.x = this.windowWidth - this.padding * 2 - 120;
      buildBtn.y = 25;

      const btnBg = new PIXI.Graphics();
      btnBg.beginFill(0x66aa66);
      btnBg.drawRoundedRect(0, 0, 100, 40, 6);
      btnBg.endFill();
      buildBtn.addChild(btnBg);

      const btnLabel = new PIXI.Text('Construire', {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.SMALL,
        fill: 0xffffff,
      });
      btnLabel.anchor.set(0.5);
      btnLabel.x = 50;
      btnLabel.y = 20;
      buildBtn.addChild(btnLabel);

      buildBtn.eventMode = 'static';
      buildBtn.cursor = 'pointer';
      buildBtn.on('pointerdown', () => this._onBuild(building));
      buildBtn.on('pointerover', () => { btnBg.alpha = 0.8; });
      buildBtn.on('pointerout', () => { btnBg.alpha = 1; });

      itemContainer.addChild(buildBtn);
      this.optionsContainer.addChild(itemContainer);
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
    this.windowBg.beginFill(0x2a2a4a);
    this.windowBg.drawRoundedRect(0, 0, this.windowWidth, this.windowHeight, 12);
    this.windowBg.endFill();
    this.windowBg.lineStyle(2, 0x6666aa);
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
   * Callback de construction
   * @param {Object} building - Objet du bâtiment à construire
   */
  _onBuild(building) {
    if (!this.gameMetrics) {
      console.warn('GameMetrics non disponible');
      return;
    }

    const currentWood = this.gameMetrics.getMetric('wood');
    const currentWaste = this.gameMetrics.getMetric('waste');

    // Vérifier si on a assez de ressources
    if (currentWood >= building.costWood && currentWaste >= building.costWaste) {
      // Déduire les coûts
      this.gameMetrics.addToMetrics({
        wood: -building.costWood,
        waste: -building.costWaste,
        electricity: building.electricityBonus
      });

      console.log(`✅ ${building.name} construit ! +${building.electricityBonus} ⚡`);

      // Feedback visuel
      this.description.text = `✅ ${building.name} construit !`;
      this.description.style.fill = 0x66ff66;

      setTimeout(() => {
        this.description.text = 'Créez des générateurs d\'électricité !';
        this.description.style.fill = 0xcccccc;
      }, 2000);
    } else {
      // Pas assez de ressources
      console.log(`❌ Ressources insuffisantes pour ${building.name}`);
      this.description.text = `❌ Ressources insuffisantes ! (${currentWood}/${building.costWood} 🪵, ${currentWaste}/${building.costWaste} 🗑️)`;
      this.description.style.fill = 0xff6666;

      setTimeout(() => {
        this.description.text = 'Créez des générateurs d\'électricité !';
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

