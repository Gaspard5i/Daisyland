import * as PIXI from 'pixi.js';
import { InputManager } from './core/InputManager.js';

export function startGame(app) {
  // Configuration de la taille de la map (plus grande que l'écran pour permettre le scroll)
  const MAP_WIDTH = 1600;  // Largeur de la map
  const MAP_HEIGHT = 1200; // Hauteur de la map
  
  // Containers
  const mapContainer = new PIXI.Container();
  const uiContainer = new PIXI.Container();
  const miniGameContainer = new PIXI.Container();

  // Initialiser le gestionnaire d'entrées pour le drag de la map
  const inputManager = new InputManager(app, mapContainer);
  inputManager.setMapSize(MAP_WIDTH, MAP_HEIGHT);

  // Background (the "map") - maintenant plus grand que l'écran
  const bg = new PIXI.Graphics();
  function drawBackground() {
    bg.clear();
    
    // Fond principal de la map
    bg.beginFill(0x66cc66); // greenish map
    bg.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    bg.endFill();
    
    // Dessiner une grille pour visualiser le déplacement
    bg.lineStyle(1, 0x55aa55, 0.5);
    const gridSize = 100;
    for (let x = 0; x <= MAP_WIDTH; x += gridSize) {
      bg.moveTo(x, 0);
      bg.lineTo(x, MAP_HEIGHT);
    }
    for (let y = 0; y <= MAP_HEIGHT; y += gridSize) {
      bg.moveTo(0, y);
      bg.lineTo(MAP_WIDTH, y);
    }
    
    // Ajouter quelques éléments décoratifs pour montrer l'étendue de la map
    bg.lineStyle(0);
    bg.beginFill(0x558855);
    // Coins de la map
    bg.drawCircle(50, 50, 30);
    bg.drawCircle(MAP_WIDTH - 50, 50, 30);
    bg.drawCircle(50, MAP_HEIGHT - 50, 30);
    bg.drawCircle(MAP_WIDTH - 50, MAP_HEIGHT - 50, 30);
    bg.endFill();
  }
  drawBackground();
  mapContainer.addChild(bg);

  // Helper to create a button on the map
  function createMapButton(x, y, labelText, id) {
    const btn = new PIXI.Graphics();
    const w = 160, h = 48, r = 8;
    btn.beginFill(0xffffff);
    btn.drawRoundedRect(-w/2, -h/2, w, h, r);
    btn.endFill();
    btn.x = x;
    btn.y = y;
    btn.interactive = true;
    btn.buttonMode = true;

    const labelStyle = { fontFamily: 'Arial', fontSize: 16, fill: 0x000000 };
    const label = new PIXI.Text(labelText, labelStyle);
    label.anchor.set(0.5);
    btn.addChild(label);

    // Simple hover effect
    btn.on('pointerover', () => {
      btn.alpha = 0.85;
      app.canvas.style.cursor = 'pointer';
    });
    btn.on('pointerout', () => {
      btn.alpha = 1;
      if (!inputManager.isDraggingMap()) {
        app.canvas.style.cursor = 'default';
      }
    });

    btn.on('pointerdown', (event) => {
      // Empêcher le drag de la map quand on clique sur un bouton
      event.stopPropagation();
      openMiniGame(id, labelText);
    });

    // place a small marker (circle) under the button for map feel
    const marker = new PIXI.Graphics();
    marker.beginFill(0xffdd00);
    marker.drawCircle(0, 0, 6);
    marker.endFill();
    marker.x = x;
    marker.y = y + 40;

    mapContainer.addChild(marker);
    mapContainer.addChild(btn);
    return btn;
  }

  // Create several buttons spread across the map (now using MAP dimensions)
  const buttons = [];
  const margin = 120;
  const cols = 4;  // Plus de colonnes pour une plus grande map
  const rows = 3;  // Plus de lignes
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * ((MAP_WIDTH - margin * 2) / (cols - 1 || 1));
      const y = 140 + r * ((MAP_HEIGHT - 200) / (rows - 1 || 1));
      const index = r * cols + c + 1;
      buttons.push(createMapButton(x, y, `Mini-jeu ${index}`, `minigame-${index}`));
    }
  }

  // mini-game launcher (placeholder)
  function openMiniGame(id, name) {
    // hide map and show miniGameContainer
    mapContainer.visible = false;
    uiContainer.visible = false;
    miniGameContainer.removeChildren();

    // background for mini-game
    const mgBg = new PIXI.Graphics();
    mgBg.beginFill(0x333366);
    mgBg.drawRect(0, 0, app.renderer.width, app.renderer.height);
    mgBg.endFill();
    miniGameContainer.addChild(mgBg);

    const mgTitleStyle = { fontFamily: 'Arial', fontSize: 30, fill: 0xffffff };
    const mgTitle = new PIXI.Text(`${name}`, mgTitleStyle);
    mgTitle.x = 20;
    mgTitle.y = 20;
    miniGameContainer.addChild(mgTitle);

    const mgDescStyle = { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff, wordWrap: true, wordWrapWidth: app.renderer.width - 40 };
    const mgDesc = new PIXI.Text('Ceci est un mini-jeu placeholder. Cliquez sur RETOUR pour revenir à la carte.', mgDescStyle);
    mgDesc.x = 20;
    mgDesc.y = 70;
    miniGameContainer.addChild(mgDesc);

    // If this is the first mini-game, add a small interactive demo: "Devine un nombre"
    if (id === 'minigame-1') {
      const guessContainer = new PIXI.Container();
      guessContainer.y = mgDesc.y + 60;

      const infoText = new PIXI.Text('Devinez un nombre entre 1 et 10', { fontFamily: 'Arial', fontSize: 18, fill: 0xffffff });
      infoText.x = 20;
      infoText.y = 0;
      guessContainer.addChild(infoText);

      const feedback = new PIXI.Text('', { fontFamily: 'Arial', fontSize: 18, fill: 0xffff00 });
      feedback.x = 20;
      feedback.y = 30;
      guessContainer.addChild(feedback);

      // generate target
      let target = Math.floor(Math.random() * 10) + 1;

      function createNumberButton(n, x, y) {
        const b = new PIXI.Graphics();
        const bw = 40, bh = 40, br = 6;
        b.beginFill(0xffffff);
        b.drawRoundedRect(0, 0, bw, bh, br);
        b.endFill();
        b.x = x;
        b.y = y;
        b.interactive = true;
        b.buttonMode = true;

        const lbl = new PIXI.Text(String(n), { fontFamily: 'Arial', fontSize: 18, fill: 0x000000 });
        lbl.anchor.set(0.5);
        lbl.x = b.x + bw / 2;
        lbl.y = b.y + bh / 2;

        b.on('pointerdown', () => {
          if (n === target) {
            feedback.text = `Bravo ! ${n} est correct.`;
            feedback.style.fill = 0x00ff00;
          } else if (n < target) {
            feedback.text = `${n} est trop petit.`;
            feedback.style.fill = 0xffcc00;
          } else {
            feedback.text = `${n} est trop grand.`;
            feedback.style.fill = 0xffcc00;
          }
        });

        guessContainer.addChild(b);
        guessContainer.addChild(lbl);
      }

      // create buttons 1..10 in two rows
      const colsN = 5;
      for (let i = 1; i <= 10; i++) {
        const col = (i - 1) % colsN;
        const row = Math.floor((i - 1) / colsN);
        const x = 20 + col * 56;
        const y = 70 + row * 56;
        createNumberButton(i, x, y);
      }

      // Rejouer button
      const replayBtn = new PIXI.Graphics();
      const rw = 120, rh = 40, rr = 8;
      replayBtn.beginFill(0xffffff);
      replayBtn.drawRoundedRect(0, 0, rw, rh, rr);
      replayBtn.endFill();
      replayBtn.x = 20;
      replayBtn.y = 70 + 2 * 56;
      replayBtn.interactive = true;
      replayBtn.buttonMode = true;

      const replayLabel = new PIXI.Text('REJOUER', { fontFamily: 'Arial', fontSize: 14, fill: 0x000000 });
      replayLabel.anchor.set(0.5);
      replayLabel.x = replayBtn.x + rw / 2;
      replayLabel.y = replayBtn.y + rh / 2;

      replayBtn.on('pointerdown', () => {
        target = Math.floor(Math.random() * 10) + 1;
        feedback.text = '';
      });

      guessContainer.addChild(replayBtn);
      guessContainer.addChild(replayLabel);

      miniGameContainer.addChild(guessContainer);
    }

    // Back button
    const backBtn = new PIXI.Graphics();
    const bw = 120, bh = 40, br = 8;
    backBtn.beginFill(0xffffff);
    backBtn.drawRoundedRect(0, 0, bw, bh, br);
    backBtn.endFill();
    backBtn.x = 20;
    backBtn.y = app.renderer.height - bh - 20;
    backBtn.interactive = true;
    backBtn.buttonMode = true;

    const backLabel = new PIXI.Text('RETOUR', { fontFamily: 'Arial', fontSize: 16, fill: 0x000000 });
    backLabel.anchor.set(0.5);
    backLabel.x = backBtn.x + bw / 2;
    backLabel.y = backBtn.y + bh / 2;

    backBtn.on('pointerdown', () => {
      miniGameContainer.visible = false;
      mapContainer.visible = true;
      uiContainer.visible = true;
    });

    miniGameContainer.addChild(backBtn);
    miniGameContainer.addChild(backLabel);

    miniGameContainer.visible = true;
  }

  // Add containers to stage
  app.stage.addChild(mapContainer);
  app.stage.addChild(uiContainer);
  app.stage.addChild(miniGameContainer);
  miniGameContainer.visible = false;

  // Resize handler
  function onResize() {
    // Mettre à jour les limites de déplacement selon la nouvelle taille d'écran
    inputManager.setMapSize(MAP_WIDTH, MAP_HEIGHT);
    
    // Update mini-game background size if visible
    if (miniGameContainer.visible && miniGameContainer.children.length > 0) {
      const mgBg = miniGameContainer.getChildAt(0);
      if (mgBg && mgBg.clear) {
        mgBg.clear();
        mgBg.beginFill(0x333366);
        mgBg.drawRect(0, 0, app.renderer.width, app.renderer.height);
        mgBg.endFill();
      }
      // reposition back button if present
      for (let i = 1; i < miniGameContainer.children.length; i++) {
        const ch = miniGameContainer.children[i];
        if (ch.x === 20 && ch.y >= app.renderer.height - 100) {
          ch.y = app.renderer.height - 60;
        }
      }
    }
  }

  window.addEventListener('resize', onResize);

  console.log('Carte initialisée avec', buttons.length, 'boutons. Maintenez clic pour déplacer la carte.');

  return {
    stop() {
      window.removeEventListener('resize', onResize);
      inputManager.destroy();
      if (mapContainer.parent) mapContainer.parent.removeChild(mapContainer);
      if (uiContainer.parent) uiContainer.parent.removeChild(uiContainer);
      if (miniGameContainer.parent) miniGameContainer.parent.removeChild(miniGameContainer);
    },
    // Exposer l'inputManager pour un contrôle externe si nécessaire
    inputManager
  };
}
