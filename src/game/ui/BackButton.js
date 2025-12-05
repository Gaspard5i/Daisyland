import * as PIXI from 'pixi.js';

export function createBackButton(onClick) {
  const btn = new PIXI.Container();

  const size = 32;
  const g = new PIXI.Graphics();
  g.lineStyle({ width: 2, color: 0x333333, alignment: 0 });
  g.beginFill(0xffffff);
  g.drawRoundedRect(0, 0, size, size, 8);
  g.endFill();

  // Arrow
  const arrow = new PIXI.Graphics();
  arrow.lineStyle({ width: 3, color: 0x333333 });
  arrow.moveTo(20, 8);
  arrow.lineTo(12, 16);
  arrow.lineTo(20, 24);

  btn.addChild(g);
  btn.addChild(arrow);

  btn.eventMode = 'static';
  btn.cursor = 'pointer';
  btn.on('pointertap', () => onClick && onClick());
  btn.on('pointerover', () => (g.alpha = 0.9));
  btn.on('pointerout', () => (g.alpha = 1));

  return btn;
}
