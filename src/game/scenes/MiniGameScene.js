/**
 * MiniGameScene.js
 * Scène de mini-jeu placeholder
 */

import * as PIXI from 'pixi.js';
import { COLORS, FONTS } from '../../utils/Constants.js';

export class MiniGameScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Function} onBack - Callback pour retourner à la carte
   * @param {GameMetrics} gameMetrics - Instance des métriques du jeu
   */
  constructor(app, onBack, gameMetrics) {
    super();
    
    this.app = app;
    this.onBack = onBack;
    this.gameMetrics = gameMetrics;

    // Fond
    this.bg = new PIXI.Graphics();
    this.addChild(this.bg);
    
    // Titre
    this.title = new PIXI.Text('', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.SUBTITLE,
      fill: 0xffffff,
    });
    this.title.x = 20;
    this.title.y = 20;
    this.addChild(this.title);

    // Description
    this.description = new PIXI.Text('Ceci est un mini-jeu placeholder. Cliquez sur RETOUR pour revenir à la carte.', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xffffff,
      wordWrap: true,
      wordWrapWidth: 400,
    });
    this.description.x = 20;
    this.description.y = 70;
    this.addChild(this.description);
    
    // Conteneur pour le contenu du mini-jeu
    this.gameContent = new PIXI.Container();
    this.gameContent.y = this.description.y + 60;
    this.addChild(this.gameContent);
    
    // Bouton retour
    this._createBackButton();
    
    // Resize
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
    
    this._drawBackground();
    
    this.visible = false;
  }
  
  /**
   * Dessine le fond
   */
  _drawBackground() {
    this.bg.clear();
    this.bg.beginFill(COLORS.MINIGAME_BG);
    this.bg.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    this.bg.endFill();
    
    // Repositionner le bouton retour
    if (this.backBtn) {
      this.backBtn.y = this.app.renderer.height - 60;
    }
  }
  
  /**
   * Crée le bouton retour
   */
  _createBackButton() {
    this.backBtn = new PIXI.Container();
    this.backBtn.x = 20;
    this.backBtn.y = this.app.renderer.height - 60;
    
    const btnBg = new PIXI.Graphics();
    btnBg.beginFill(0xffffff);
    btnBg.drawRoundedRect(0, 0, 120, 40, 8);
    btnBg.endFill();
    this.backBtn.addChild(btnBg);
    
    const label = new PIXI.Text('RETOUR', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BUTTON,
      fill: 0x000000,
    });
    label.anchor.set(0.5);
    label.x = 60;
    label.y = 20;
    this.backBtn.addChild(label);
    
    this.backBtn.eventMode = 'static';
    this.backBtn.cursor = 'pointer';
    this.backBtn.on('pointerdown', () => {
      if (this.onBack) {
        this.onBack();
      }
    });
    
    this.addChild(this.backBtn);
  }
  
  /**
   * Ouvre le mini-jeu avec un lieu spécifique
   * @param {string} id - ID du lieu
   * @param {string} name - Nom du lieu
   */
  open(id, name) {
    this.title.text = name;
    this.gameContent.removeChildren();
    
    // Ajouter du contenu spécifique selon l'ID
    if (id === 'farm-1') {
      this._createGuessNumberGame();
    } else if (id === 'farm-2') {
      this._createElectricityGame();
    }
    
    this._drawBackground();
    this.visible = true;
  }
  
  /**
   * Ferme le mini-jeu
   */
  close() {
    this.visible = false;
    this.gameContent.removeChildren();
  }
  
  /**
   * Crée le jeu "Devine un nombre"
   */
  _createGuessNumberGame() {
    const infoText = new PIXI.Text('Devinez un nombre entre 1 et 10', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xffffff,
    });
    infoText.x = 20;
    this.gameContent.addChild(infoText);
    
    const feedback = new PIXI.Text('', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0xffff00,
    });
    feedback.x = 20;
    feedback.y = 30;
    this.gameContent.addChild(feedback);
    
    let target = Math.floor(Math.random() * 10) + 1;
    
    // Boutons 1-10
    for (let i = 1; i <= 10; i++) {
      const col = (i - 1) % 5;
      const row = Math.floor((i - 1) / 5);
      
      const btn = new PIXI.Container();
      btn.x = 20 + col * 56;
      btn.y = 70 + row * 56;
      
      const bg = new PIXI.Graphics();
      bg.beginFill(0xffffff);
      bg.drawRoundedRect(0, 0, 40, 40, 6);
      bg.endFill();
      btn.addChild(bg);
      
      const lbl = new PIXI.Text(String(i), {
        fontFamily: FONTS.DEFAULT,
        fontSize: FONTS.SIZES.BODY,
        fill: 0x000000,
      });
      lbl.anchor.set(0.5);
      lbl.x = 20;
      lbl.y = 20;
      btn.addChild(lbl);
      
      btn.eventMode = 'static';
      btn.cursor = 'pointer';
      
      const num = i;
      btn.on('pointerdown', () => {
        if (num === target) {
          feedback.text = `Bravo ! ${num} est correct.`;
          feedback.style.fill = 0x00ff00;
        } else if (num < target) {
          feedback.text = `${num} est trop petit.`;
          feedback.style.fill = 0xffcc00;
        } else {
          feedback.text = `${num} est trop grand.`;
          feedback.style.fill = 0xffcc00;
        }
      });
      
      this.gameContent.addChild(btn);
    }
    
    // Bouton rejouer
    const replayBtn = new PIXI.Container();
    replayBtn.x = 20;
    replayBtn.y = 70 + 2 * 56;
    
    const replayBg = new PIXI.Graphics();
    replayBg.beginFill(0xffffff);
    replayBg.drawRoundedRect(0, 0, 120, 40, 8);
    replayBg.endFill();
    replayBtn.addChild(replayBg);
    
    const replayLabel = new PIXI.Text('REJOUER', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.SMALL,
      fill: 0x000000,
    });
    replayLabel.anchor.set(0.5);
    replayLabel.x = 60;
    replayLabel.y = 20;
    replayBtn.addChild(replayLabel);
    
    replayBtn.eventMode = 'static';
    replayBtn.cursor = 'pointer';
    replayBtn.on('pointerdown', () => {
      target = Math.floor(Math.random() * 10) + 1;
      feedback.text = '';
    });
    
    this.gameContent.addChild(replayBtn);
  }
  
  /**
   * Crée le mini-jeu d'électricité - cliquer pour générer de l'énergie
   */
  _createElectricityGame() {
    // Variables du jeu - utiliser les métriques existantes
    let electricityLevel = this.gameMetrics ? this.gameMetrics.getMetric('electricity') : 0;
    let clickPower = 1;
    let isGenerating = false;

    // Titre du jeu
    const gameTitle = new PIXI.Text('🔋 Générateur d\'Électricité', {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.SUBTITLE,
      fill: 0xffff00,
    });
    gameTitle.x = 20;
    this.gameContent.addChild(gameTitle);

    // Compteur d'électricité
    const electricityCounter = new PIXI.Text(`⚡ Électricité: ${electricityLevel} kWh`, {
      fontFamily: FONTS.DEFAULT,
      fontSize: FONTS.SIZES.BODY,
      fill: 0x00ff00,
    });
    electricityCounter.x = 20;
    electricityCounter.y = 40;
    this.gameContent.addChild(electricityCounter);

    // Créer l'icône de générateur (éclair dans un cercle)
    const generatorIcon = new PIXI.Container();
    generatorIcon.x = this.app.renderer.width / 2 - 60;
    generatorIcon.y = 150;

    // Fond du générateur
    const iconBg = new PIXI.Graphics();
    iconBg.beginFill(0x2c3e50);
    iconBg.lineStyle(4, 0xffff00, 1);
    iconBg.drawCircle(60, 60, 50);
    iconBg.endFill();
    generatorIcon.addChild(iconBg);

    // Éclair ⚡
    const lightning = new PIXI.Text('⚡', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xffff00,
    });
    lightning.anchor.set(0.5);
    lightning.x = 60;
    lightning.y = 60;
    generatorIcon.addChild(lightning);

    // Effet de clic (cercle qui s'agrandit)
    const clickEffect = new PIXI.Graphics();
    generatorIcon.addChild(clickEffect);

    generatorIcon.eventMode = 'static';
    generatorIcon.cursor = 'pointer';

    // Animation de l'effet de clic
    const animateClick = () => {
      clickEffect.clear();
      clickEffect.beginFill(0xffff00, 0.3);
      clickEffect.drawCircle(60, 60, 50);
      clickEffect.endFill();

      // Animation d'expansion et de fade
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / 300; // 300ms d'animation

        if (progress < 1) {
          const scale = 1 + progress * 0.5;
          const alpha = 1 - progress;

          clickEffect.scale.set(scale);
          clickEffect.alpha = alpha;

          requestAnimationFrame(animate);
        } else {
          clickEffect.clear();
          clickEffect.scale.set(1);
          clickEffect.alpha = 1;
        }
      };
      animate();
    };

    // Gestionnaire de clic
    generatorIcon.on('pointerdown', () => {
      if (!isGenerating) {
        isGenerating = true;

        // Générer de l'électricité
        electricityLevel += clickPower;

        // Mettre à jour les métriques du jeu
        if (this.gameMetrics) {
          this.gameMetrics.addToMetric('electricity', clickPower);
          electricityLevel = this.gameMetrics.getMetric('electricity');
        }

        electricityCounter.text = `⚡ Électricité: ${electricityLevel} kWh`;

        // Animation de l'icône
        animateClick();

        // Animation de l'éclair
        lightning.scale.set(1.2);
        setTimeout(() => {
          lightning.scale.set(1);
          isGenerating = false;
        }, 100);
      }
    });

    this.gameContent.addChild(generatorIcon);
  }

  /**
   * Gère le resize
   */
  _onResize() {
    this._drawBackground();
    this.description.style.wordWrapWidth = this.app.renderer.width - 40;
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    super.destroy({ children: true });
  }
}
