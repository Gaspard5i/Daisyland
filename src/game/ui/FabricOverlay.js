import * as PIXI from 'pixi.js';
import { createInterfaceContainer } from './InterfaceContainer.js';
import { createInterfaceHeader } from './InterfaceHeader.js';
import { createBodyWrapper } from './BodyWrapper.js';

export function createFabricOverlay(app, onClose) {
  const { root, content } = createInterfaceContainer({ app, style: 'crate' });

  const { container: header } = createInterfaceHeader('Fabric', () => onClose && onClose());
  content.addChild(header);

  const { container: body } = createBodyWrapper();
  content.addChild(body);

  // Placeholder list for upgrades and craftable items
  const list = new PIXI.Container();
  list.x = 24; list.y = 72;

  for (let i = 0; i < 8; i++) {
    const row = new PIXI.Container();
    row.y = i * 42;

    const icon = new PIXI.Graphics();
    icon.beginFill(0x8b5a2b);
    icon.drawCircle(0, 0, 12);
    icon.endFill();
    icon.x = 12; icon.y = 12;

    const label = new PIXI.Text(`Item ${i + 1}`, { fontFamily: 'Arial', fontSize: 16, fill: 0x333333 });
    label.x = 36; label.y = 2;

    const btn = new PIXI.Graphics();
    btn.beginFill(0xffffff);
    btn.lineStyle({ width: 2, color: 0x8b5a2b });
    btn.drawRoundedRect(0, 0, 80, 28, 8);
    btn.endFill();
    btn.x = 380; btn.y = -2;
    btn.eventMode = 'static'; btn.cursor = 'pointer';

    const txt = new PIXI.Text('Craft', { fontFamily: 'Arial', fontSize: 12, fill: 0x333333 });
    txt.anchor.set(0.5); txt.x = btn.x + 40; txt.y = btn.y + 14;

    row.addChild(icon, label, btn, txt);
    list.addChild(row);
  }

  body.addChild(list);

  function resize(w, h) {
    root.resize(w, h);
    header.layout(w);
    body.layout(w, h);
  }

  return { root, resize, destroy: () => root.destroy({ children: true }) };
}
