import * as PIXI from 'pixi.js';

function drawCrateBorder(g, w, h) {
  const r = 14;
  g.lineStyle({ width: 4, color: 0x5c3b1e, alignment: 0, cap: 'round', join: 'round' });
  g.beginFill(0xf4e3c1);
  g.drawRoundedRect(0, 0, w, h, r);
  g.endFill();
  // Planks style lines
  g.lineStyle({ width: 2, color: 0x8b5a2b, alignment: 0 });
  g.moveTo(10, 40); g.lineTo(w - 10, 30);
  g.moveTo(12, h - 40); g.lineTo(w - 14, h - 28);
}

function drawRockBorder(g, w, h) {
  const r = 18;
  g.lineStyle({ width: 5, color: 0x3b3b3b, alignment: 0, cap: 'round', join: 'round' });
  g.beginFill(0xd8d8d8);
  g.drawRoundedRect(0, 0, w, h, r);
  g.endFill();
  // Pebble accents
  g.lineStyle({ width: 0 });
  g.beginFill(0xbfbfbf);
  g.drawCircle(24, 22, 4); g.drawCircle(w - 34, 18, 6); g.drawCircle(w - 28, h - 26, 5); g.drawCircle(22, h - 20, 3);
  g.endFill();
}

export function createInterfaceContainer(options = {}) {
  const { width = 560, height = 380, style = 'crate', app } = options;
  const root = new PIXI.Container();
  root.name = 'InterfaceContainer';

  // center root
  root.x = (app?.renderer?.width || 800) / 2;
  root.y = (app?.renderer?.height || 600) / 2;
  root.pivot.set(width / 2, height / 2);

  // shadow
  const shadow = new PIXI.Graphics();
  shadow.beginFill(0x000000, 0.25);
  shadow.drawRoundedRect(8, 12, width, height, 16);
  shadow.endFill();
  shadow.blur = 2;

  // panel
  const panel = new PIXI.Graphics();
  if (style === 'rock') drawRockBorder(panel, width, height); else drawCrateBorder(panel, width, height);

  const content = new PIXI.Container();
  content.x = 16; // inner padding
  content.y = 16;

  root.addChild(shadow);
  root.addChild(panel);
  root.addChild(content);

  root.resize = (w, h) => {
    root.x = w / 2; root.y = h / 2;
  };

  return { root, content, panel, shadow };
}
