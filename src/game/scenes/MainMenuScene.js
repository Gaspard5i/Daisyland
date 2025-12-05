import * as PIXI from 'pixi.js';
import { Button } from '../../ui/Button.js';
import { COLORS, FONTS } from '../../utils/Constants.js';
import { SaveManager } from '../../core/SaveManager.js';

export class MainMenuScene extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   * @param {Object} callbacks - Callbacks pour les actions du menu
   * @param {Function} callbacks.onNewGame - Callback pour nouvelle partie
   * @param {Function} callbacks.onLoadGame - Callback pour charger une partie (reçoit les métriques)
   */
  constructor(app, callbacks) {
    super();

    this.app = app;
    this.callbacks = callbacks;
    this.saveManager = new SaveManager();

    this._createBackground();
    this._createUI();
  }

  _createBackground() {
    const bg = new PIXI.Graphics();
    bg.beginFill(COLORS.CLOUDS);
    bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
    bg.endFill();
    this.addChild(bg);
    
    // Resize handler
    window.addEventListener('resize', () => {
       bg.clear();
       bg.beginFill(COLORS.CLOUDS);
       bg.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
       bg.endFill();
       this._centerUI();
    });
  }

  _createUI() {
    this.uiContainer = new PIXI.Container();
    this.addChild(this.uiContainer);

    // Titre
    const titleStyle = {
      fontFamily: FONTS.DEFAULT,
      fontSize: 64,
      fill: COLORS.TEXT_DARK,
      fontWeight: 'bold',
      align: 'center',
    };
    this.title = new PIXI.Text('DAISYLAND', titleStyle);
    this.title.anchor.set(0.5);
    this.uiContainer.addChild(this.title);

    // Bouton Nouvelle Partie
    this.btnNewGame = new Button({
      label: 'Nouvelle Partie',
      onClick: () => this._onNewGame(),
      width: 250,
      height: 60,
    });
    this.uiContainer.addChild(this.btnNewGame);

    // Bouton Charger Partie
    this.btnLoadGame = new Button({
      label: 'Charger Partie',
      onClick: () => this._onLoadGame(),
      width: 250,
      height: 60,
    });
    this.uiContainer.addChild(this.btnLoadGame);

    // Input file caché pour le chargement
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = '.daisyland'; // Ou .json, ou .bin
    this.fileInput.style.display = 'none';
    document.body.appendChild(this.fileInput);

    this.fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        this._processFile(file);
      }
      // Reset input value to allow reloading same file if needed
      this.fileInput.value = '';
    });

    this._centerUI();
  }

  _centerUI() {
    const cx = this.app.screen.width / 2;
    const cy = this.app.screen.height / 2;

    this.title.position.set(cx, cy - 150);
    this.btnNewGame.position.set(cx, cy);
    this.btnLoadGame.position.set(cx, cy + 80);
  }

  _onNewGame() {
    if (this.callbacks.onNewGame) {
      this.callbacks.onNewGame();
    }
  }

  _onLoadGame() {
    this.fileInput.click();
  }

  _processFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Utiliser SaveManager pour désérialiser
        // Note: deserializegameMetrics attend (binary, gameMetrics)
        // Mais ici on veut juste récupérer les data, on passera gameMetrics plus tard ou on laisse SaveManager faire
        // SaveManager.deserializegameMetrics retourne les metrics.
        
        const metrics = this.saveManager.deserializegameMetrics(uint8Array);
        
        if (metrics && this.callbacks.onLoadGame) {
          this.callbacks.onLoadGame(metrics);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la sauvegarde:', error);
        alert('Fichier de sauvegarde invalide.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  show() {
    this.visible = true;
  }

  hide() {
    this.visible = false;
  }
  
  destroy() {
    if (this.fileInput && this.fileInput.parentNode) {
      this.fileInput.parentNode.removeChild(this.fileInput);
    }
    super.destroy({ children: true });
  }
}
