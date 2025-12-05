import * as PIXI from 'pixi.js';
import { createInterfaceContainer } from './InterfaceContainer.js';
import { createInterfaceHeader } from './InterfaceHeader.js';
import { createBodyWrapper } from './BodyWrapper.js';

export function createFishingOverlay(app, onClose) {
  const { root, content } = createInterfaceContainer({ app, style: 'crate' });

  const { container: header } = createInterfaceHeader('Fishing', () => onClose && onClose());
  content.addChild(header);

  const { container: body } = createBodyWrapper();
  content.addChild(body);

  // Placeholder trade UI: players exchange food for trash collection time
  const ui = new PIXI.Container();
  ui.x = 24; ui.y = 72;

  const desc = new PIXI.Text('Trade food to let the fisherman collect trash. More food = longer time.', {
    fontFamily: 'Arial', fontSize: 14, fill: 0x333333, wordWrap: true, wordWrapWidth: 480
  });
  ui.addChild(desc);

  const sliderBg = new PIXI.Graphics();
  sliderBg.beginFill(0xeeeeee); sliderBg.drawRoundedRect(0, 0, 360, 12, 6); sliderBg.endFill();
  sliderBg.x = 8; sliderBg.y = 56;

  const knob = new PIXI.Graphics();
  knob.beginFill(0x8b5a2b); knob.drawCircle(0, 0, 10); knob.endFill();
  knob.x = sliderBg.x; knob.y = sliderBg.y + 6;
  knob.eventMode = 'static'; knob.cursor = 'pointer';

  let amount = 0;
  function updateAmountFromX() {
    const t = Math.max(0, Math.min(1, (knob.x - sliderBg.x) / 360));
    amount = Math.round(t * 100);
    amountText.text = `Food: ${amount}`;
  }

  knob.on('pointerdown', (e) => {
    knob.dragging = true;
    e.stopPropagation();
  });
  app.stage.on('pointerup', () => (knob.dragging = false));
  app.stage.on('pointerupoutside', () => (knob.dragging = false));
  app.stage.on('pointermove', (e) => {
    if (!knob.dragging) return;
    const pos = e.global;
    const local = knob.parent.toLocal(pos);
    knob.x = Math.max(sliderBg.x, Math.min(sliderBg.x + 360, local.x));
    updateAmountFromX();
  });

  const amountText = new PIXI.Text('Food: 0', { fontFamily: 'Arial', fontSize: 16, fill: 0x333333 });
  amountText.x = sliderBg.x + 372; amountText.y = sliderBg.y - 8;

  const startBtn = new PIXI.Graphics();
  startBtn.beginFill(0xffffff); startBtn.lineStyle({ width: 2, color: 0x8b5a2b });
  startBtn.drawRoundedRect(0, 0, 120, 36, 10); startBtn.endFill();
  startBtn.x = 8; startBtn.y = 86; startBtn.eventMode = 'static'; startBtn.cursor = 'pointer';
  const startLbl = new PIXI.Text('Start', { fontFamily: 'Arial', fontSize: 14, fill: 0x333333 });
  startLbl.anchor.set(0.5); startLbl.x = startBtn.x + 60; startLbl.y = startBtn.y + 18;

  ui.addChild(sliderBg, knob, amountText, startBtn, startLbl);
  body.addChild(ui);

  function resize(w, h) {
    root.resize(w, h);
    header.layout(w);
    body.layout(w, h);
  }

  return { root, resize, destroy: () => root.destroy({ children: true }) };
}
