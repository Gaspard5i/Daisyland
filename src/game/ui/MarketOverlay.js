import * as PIXI from 'pixi.js';
import { createInterfaceContainer } from './InterfaceContainer.js';
import { createInterfaceHeader } from './InterfaceHeader.js';
import { createBodyWrapper } from './BodyWrapper.js';

export function createMarketOverlay(app, onClose) {
  const { root, content } = createInterfaceContainer({ app, style: 'crate' });

  const { container: header } = createInterfaceHeader('Shop', () => onClose && onClose());
  content.addChild(header);

  const { container: body } = createBodyWrapper();
  content.addChild(body);

  // Placeholder offers grid (actual logic will be added later)
  const offers = new PIXI.Container();
  offers.x = 24; offers.y = 72;
  const cols = 3;
  for (let i = 0; i < 6; i++) {
    const card = new PIXI.Graphics();
    card.beginFill(0xffffff);
    card.lineStyle({ width: 2, color: 0x8b5a2b });
    card.drawRoundedRect(0, 0, 150, 80, 10);
    card.endFill();
    const cx = i % cols;
    const cy = Math.floor(i / cols);
    card.x = cx * 168;
    card.y = cy * 96;

    const label = new PIXI.Text(`Offer ${i + 1}`, { fontFamily: 'Arial', fontSize: 14, fill: 0x333333 });
    label.x = 12; label.y = 12;
    card.addChild(label);

    offers.addChild(card);
  }
  body.addChild(offers);

  function resize(w, h) {
    root.resize(w, h);
    header.layout(w);
    body.layout(w, h);
  }

  return { root, resize, destroy: () => root.destroy({ children: true }) };
}
