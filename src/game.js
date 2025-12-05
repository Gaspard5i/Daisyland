import * as PIXI from 'pixi.js';
import { createMarketOverlay } from './game/ui/MarketOverlay.js';
import { createFabricOverlay } from './game/ui/FabricOverlay.js';
import { createFishingOverlay } from './game/ui/FishingOverlay.js';

export function startGame(app) {
  // Containers
  const mapContainer = new PIXI.Container();
  const uiContainer = new PIXI.Container();
  const miniGameContainer = new PIXI.Container();

  // Background (the "map")
  const bg = new PIXI.Graphics();
  function drawBackground() {
    bg.clear();
    bg.beginFill(0x66cc66); // greenish map
    bg.drawRect(0, 0, app.renderer.width, app.renderer.height);
    bg.endFill();
  }
  drawBackground();
  mapContainer.addChild(bg);

  // Title
  const titleStyle = { fontFamily: 'Arial', fontSize: 36, fill: 0xffffff };
  const title = new PIXI.Text('Carte de Daisyland', titleStyle);
  title.x = 20;
  title.y = 20;
  uiContainer.addChild(title);

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
    btn.on('pointerover', () => btn.alpha = 0.85);
    btn.on('pointerout', () => btn.alpha = 1);

    btn.on('pointerdown', () => {
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

  // Create several buttons spread across the screen
  const buttons = [];
  const margin = 80;
  const cols = 3;
  const rows = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = margin + c * ((app.renderer.width - margin * 2) / (cols - 1 || 1));
      const y = 140 + r * ((app.renderer.height - 200) / (rows - 1 || 1));
      const index = r * cols + c + 1;
      buttons.push(createMapButton(x, y, `Mini-jeu ${index}`, `minigame-${index}`));
    }
  }

  // mini-game launcher
  function openMiniGame(id, name) {
    // Special routing:
    if (id === 'minigame-2') { openInterface('fabric'); return; }
    if (id === 'minigame-3') { openInterface('shop'); return; }
    if (id === 'minigame-6') { openInterface('fishing'); return; }

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

    // Generic placeholder for mini-games (Trash Island logic removed)
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

  // Interfaces overlay (Shop/Fabric/Fishing)
  let currentInterface = null;
  function openInterface(kind) {
    // hide map and ui
    mapContainer.visible = false;
    uiContainer.visible = false;

    // clear container
    miniGameContainer.removeChildren();

    // dim background
    const dim = new PIXI.Graphics();
    dim.beginFill(0x000000, 0.4);
    dim.drawRect(0, 0, app.renderer.width, app.renderer.height);
    dim.endFill();
    miniGameContainer.addChild(dim);

    const close = () => {
      if (currentInterface && currentInterface.destroy) currentInterface.destroy();
      currentInterface = null;
      miniGameContainer.visible = false;
      mapContainer.visible = true;
      uiContainer.visible = true;
    };

    // create overlay (GUI)
    if (kind === 'shop') currentInterface = createMarketOverlay(app, close);
    else if (kind === 'fabric') currentInterface = createFabricOverlay(app, close);
    else if (kind === 'fishing') currentInterface = createFishingOverlay(app, close);

    if (currentInterface) {
      miniGameContainer.addChild(currentInterface.root);
      miniGameContainer.visible = true;
      // initial layout
      currentInterface.resize(app.renderer.width, app.renderer.height);
    }
  }

  // Add containers to stage
  app.stage.addChild(mapContainer);
  app.stage.addChild(uiContainer);
  app.stage.addChild(miniGameContainer);
  miniGameContainer.visible = false;

  // Resize handler
  function onResize() {
    drawBackground();
    // remove previous interactive map elements then recreate (keep bg)
    mapContainer.removeChildren();
    mapContainer.addChild(bg);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = margin + c * ((app.renderer.width - margin * 2) / (cols - 1 || 1));
        const y = 140 + r * ((app.renderer.height - 200) / (rows - 1 || 1));
        const index = r * cols + c + 1;
        createMapButton(x, y, `Mini-jeu ${index}`, `minigame-${index}`);
      }
    }

    // Update mini-game/overlay size if visible
    if (miniGameContainer.visible && miniGameContainer.children.length > 0) {
      const first = miniGameContainer.getChildAt(0);
      if (first && first.clear) {
        // It is either dim background for interfaces or mg background
        first.clear();
        // If we have an active interface, keep it dim; else, color
        const isDim = !!currentInterface;
        if (isDim) {
          first.beginFill(0x000000, 0.4);
        } else {
          first.beginFill(0x333366);
        }
        first.drawRect(0, 0, app.renderer.width, app.renderer.height);
        first.endFill();
      }
      if (currentInterface && currentInterface.resize) {
        currentInterface.resize(app.renderer.width, app.renderer.height);
      }
    }
  }

  window.addEventListener('resize', onResize);

  console.log('Carte initialisée avec', buttons.length, 'boutons.');

  return {
    stop() {
      window.removeEventListener('resize', onResize);
      if (mapContainer.parent) mapContainer.parent.removeChild(mapContainer);
      if (uiContainer.parent) uiContainer.parent.removeChild(uiContainer);
      if (miniGameContainer.parent) miniGameContainer.parent.removeChild(miniGameContainer);
    }
  };
}
