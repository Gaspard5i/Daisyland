import * as PIXI from 'pixi.js';
import { InputManager } from './core/InputManager.js';

export function startGame(app) {
  // Configuration de la taille de la map (plus grande que l'écran pour permettre le scroll)
  const MAP_WIDTH = 2400;  // Largeur de la map
  const MAP_HEIGHT = 1800; // Hauteur de la map
  
  // Configuration des zones de la map
  const CLOUD_MARGIN = 100;  // Épaisseur des nuages (blanc)
  const WATER_MARGIN = 250;  // Épaisseur de l'eau (bleu) - agrandi
  
  // Zones calculées
  const WATER_X = CLOUD_MARGIN;
  const WATER_Y = CLOUD_MARGIN;
  const WATER_WIDTH = MAP_WIDTH - CLOUD_MARGIN * 2;
  const WATER_HEIGHT = MAP_HEIGHT - CLOUD_MARGIN * 2;
  
  const LAND_X = CLOUD_MARGIN + WATER_MARGIN;
  const LAND_Y = CLOUD_MARGIN + WATER_MARGIN;
  const LAND_WIDTH = MAP_WIDTH - (CLOUD_MARGIN + WATER_MARGIN) * 2;
  const LAND_HEIGHT = MAP_HEIGHT - (CLOUD_MARGIN + WATER_MARGIN) * 2;
  
  // Containers
  const mapContainer = new PIXI.Container();
  const uiContainer = new PIXI.Container();
  const miniGameContainer = new PIXI.Container();

  // Initialiser le gestionnaire d'entrées pour le drag de la map
  const inputManager = new InputManager(app, mapContainer);
  inputManager.setMapSize(MAP_WIDTH, MAP_HEIGHT);
  
  // Centrer la map au démarrage (vue au centre de la map)
  function centerMap() {
    const screenWidth = app.renderer.width;
    const screenHeight = app.renderer.height;
    mapContainer.x = (screenWidth - MAP_WIDTH) / 2;
    mapContainer.y = (screenHeight - MAP_HEIGHT) / 2;
  }
  centerMap();

  // Background (the "map") - avec couches nuages → eau → terre
  const bg = new PIXI.Graphics();
  function drawBackground() {
    bg.clear();
    
    // 1. Nuages (blanc) - Couche extérieure (limites de la map)
    bg.beginFill(0xf0f0f0);
    bg.drawRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    bg.endFill();
    
    // Dessiner des nuages décoratifs sur les bords
    bg.beginFill(0xffffff);
    const cloudPositions = [
      { x: 40, y: 40 }, { x: 120, y: 30 }, { x: 200, y: 50 },
      { x: MAP_WIDTH - 40, y: 40 }, { x: MAP_WIDTH - 120, y: 60 },
      { x: 40, y: MAP_HEIGHT - 40 }, { x: 150, y: MAP_HEIGHT - 50 },
      { x: MAP_WIDTH - 60, y: MAP_HEIGHT - 40 }, { x: MAP_WIDTH - 150, y: MAP_HEIGHT - 30 },
      { x: 30, y: 200 }, { x: 50, y: 400 }, { x: 40, y: 600 },
      { x: MAP_WIDTH - 30, y: 250 }, { x: MAP_WIDTH - 50, y: 500 }, { x: MAP_WIDTH - 40, y: 750 },
    ];
    cloudPositions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 25 + Math.random() * 15);
      bg.drawCircle(pos.x + 20, pos.y - 10, 20 + Math.random() * 10);
      bg.drawCircle(pos.x - 15, pos.y + 5, 18 + Math.random() * 10);
    });
    bg.endFill();
    
    // 2. Eau (bleu) - Couche intermédiaire
    bg.beginFill(0x4499dd);
    bg.drawRoundedRect(WATER_X, WATER_Y, WATER_WIDTH, WATER_HEIGHT, 20);
    bg.endFill();
    
    // Vagues décoratives sur l'eau
    bg.lineStyle(2, 0x66bbee, 0.5);
    for (let i = 0; i < 8; i++) {
      const waveY = WATER_Y + 30 + i * 40;
      if (waveY < LAND_Y - 10) {
        bg.moveTo(WATER_X + 20, waveY);
        for (let x = WATER_X + 20; x < WATER_X + WATER_WIDTH - 20; x += 30) {
          bg.quadraticCurveTo(x + 15, waveY - 8, x + 30, waveY);
        }
      }
    }
    // Vagues en bas
    for (let i = 0; i < 5; i++) {
      const waveY = LAND_Y + LAND_HEIGHT + 20 + i * 25;
      if (waveY < WATER_Y + WATER_HEIGHT - 10) {
        bg.moveTo(WATER_X + 20, waveY);
        for (let x = WATER_X + 20; x < WATER_X + WATER_WIDTH - 20; x += 30) {
          bg.quadraticCurveTo(x + 15, waveY - 8, x + 30, waveY);
        }
      }
    }
    bg.lineStyle(0);
    
    // 3. Terre (vert) - Couche centrale
    bg.beginFill(0x66cc66);
    bg.drawRoundedRect(LAND_X, LAND_Y, LAND_WIDTH, LAND_HEIGHT, 30);
    bg.endFill();
    
    // Herbe décorative sur la terre
    bg.beginFill(0x55aa55);
    for (let i = 0; i < 30; i++) {
      const gx = LAND_X + 50 + Math.random() * (LAND_WIDTH - 100);
      const gy = LAND_Y + 50 + Math.random() * (LAND_HEIGHT - 100);
      bg.drawCircle(gx, gy, 8 + Math.random() * 12);
    }
    bg.endFill();
    
    // Quelques arbres/buissons
    bg.beginFill(0x338833);
    const treePositions = [
      { x: LAND_X + 80, y: LAND_Y + 80 },
      { x: LAND_X + LAND_WIDTH - 80, y: LAND_Y + 100 },
      { x: LAND_X + 100, y: LAND_Y + LAND_HEIGHT - 100 },
      { x: LAND_X + LAND_WIDTH - 100, y: LAND_Y + LAND_HEIGHT - 80 },
      { x: LAND_X + LAND_WIDTH / 2, y: LAND_Y + 60 },
    ];
    treePositions.forEach(pos => {
      bg.drawCircle(pos.x, pos.y, 20);
      bg.drawCircle(pos.x + 15, pos.y + 8, 15);
      bg.drawCircle(pos.x - 12, pos.y + 5, 18);
    });
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

  // Créer les boutons répartis sur la terre et l'eau
  const buttons = [];
  
  // Boutons sur la TERRE (centre) - 6 boutons en grille 3x2
  const landMargin = 100;
  const landCols = 3;
  const landRows = 2;
  for (let r = 0; r < landRows; r++) {
    for (let c = 0; c < landCols; c++) {
      const x = LAND_X + landMargin + c * ((LAND_WIDTH - landMargin * 2) / (landCols - 1 || 1));
      const y = LAND_Y + landMargin + r * ((LAND_HEIGHT - landMargin * 2) / (landRows - 1 || 1));
      const index = r * landCols + c + 1;
      buttons.push(createMapButton(x, y, `Ferme ${index}`, `farm-${index}`));
    }
  }
  
  // Boutons sur l'EAU - 6 boutons autour de la terre
  const waterButtons = [
    // Haut
    { x: WATER_X + WATER_WIDTH * 0.3, y: WATER_Y + WATER_MARGIN / 2 + 20, name: 'Île Nord-Ouest', id: 'island-nw' },
    { x: WATER_X + WATER_WIDTH * 0.7, y: WATER_Y + WATER_MARGIN / 2 + 20, name: 'Île Nord-Est', id: 'island-ne' },
    // Gauche
    { x: WATER_X + WATER_MARGIN / 2, y: WATER_Y + WATER_HEIGHT * 0.5, name: 'Port Ouest', id: 'port-west' },
    // Droite
    { x: WATER_X + WATER_WIDTH - WATER_MARGIN / 2, y: WATER_Y + WATER_HEIGHT * 0.5, name: 'Port Est', id: 'port-east' },
    // Bas
    { x: WATER_X + WATER_WIDTH * 0.3, y: WATER_Y + WATER_HEIGHT - WATER_MARGIN / 2 - 20, name: 'Île Sud-Ouest', id: 'island-sw' },
    { x: WATER_X + WATER_WIDTH * 0.7, y: WATER_Y + WATER_HEIGHT - WATER_MARGIN / 2 - 20, name: 'Île Sud-Est', id: 'island-se' },
  ];
  
  waterButtons.forEach(wb => {
    buttons.push(createMapButton(wb.x, wb.y, wb.name, wb.id));
  });

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
    // Mettre à jour le zoom minimum et les limites selon la nouvelle taille d'écran
    // Cela ajustera automatiquement le zoom si nécessaire pour couvrir l'écran
    inputManager.setMapSize(MAP_WIDTH, MAP_HEIGHT);
    
    // Clamper la position actuelle aux nouvelles limites
    const screenWidth = app.renderer.width;
    const screenHeight = app.renderer.height;
    const scaledMapWidth = MAP_WIDTH * inputManager.getZoom();
    const scaledMapHeight = MAP_HEIGHT * inputManager.getZoom();
    
    mapContainer.x = Math.max(screenWidth - scaledMapWidth, Math.min(0, mapContainer.x));
    mapContainer.y = Math.max(screenHeight - scaledMapHeight, Math.min(0, mapContainer.y));
    
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
