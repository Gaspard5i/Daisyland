import * as PIXI from 'pixi.js';
import { createBackButton } from './BackButton.js';

export function createInterfaceHeader(title, onBack) {
  const container = new PIXI.Container();
  const h = 48;
  const bg = new PIXI.Graphics();
  bg.beginFill(0x000000, 0.06);
  bg.drawRoundedRect(0, 0, 528, h, 10);
  bg.endFill();

  const back = createBackButton(onBack);
  back.x = 8; back.y = 8;

  const label = new PIXI.Text(title, { fontFamily: 'Arial', fontSize: 22, fill: 0x2f2f2f, fontWeight: 'bold' });
  label.x = 48; label.y = 12;

  const rightSlot = new PIXI.Container();
  rightSlot.x = 528 - 8; // anchor right manually by pivoting items we attach later
  rightSlot.y = 8;

  container.addChild(bg, back, label, rightSlot);

  container.layout = (width) => {
    bg.width = width - 32; // account for InterfaceContainer padding
    rightSlot.x = bg.width - 8;
  };

  return { container, rightSlot };
}
