import * as PIXI from 'pixi.js';

export function createBodyWrapper(width = 528, height = 300) {
  const container = new PIXI.Container();
  container.y = 56; // below header

  const bg = new PIXI.Graphics();
  bg.beginFill(0xffffff, 0.8);
  bg.drawRoundedRect(0, 0, width, height, 10);
  bg.endFill();

  container.addChild(bg);

  container.layout = (w, h) => {
    bg.width = w - 32; // match panel inner width
    bg.height = Math.max(140, h - 120);
  };

  return { container };
}
