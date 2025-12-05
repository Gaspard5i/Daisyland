import * as PIXI from 'pixi.js';

export function createProgressBar(width = 160, height = 12, color = 0x4caf50) {
  const container = new PIXI.Container();

  const bg = new PIXI.Graphics();
  bg.beginFill(0x000000, 0.2);
  bg.drawRoundedRect(0, 0, width, height, height / 2);
  bg.endFill();

  const fill = new PIXI.Graphics();
  fill.beginFill(color);
  fill.drawRoundedRect(0, 0, width, height, height / 2);
  fill.endFill();

  container.addChild(bg, fill);

  let progress = 1;
  function setProgress(p) {
    progress = Math.max(0, Math.min(1, p));
    fill.width = width * progress;
  }
  setProgress(1);

  return { container, setProgress };
}
