import { Graphics, Text } from 'pixi.js';
export function startGame(app) {
  // Create a simple graphic as a placeholder
  const g = new Graphics();
  g.fill(0xffcc00);
  g.rect(0, 0, 200, 100);
  g.x = (app.renderer.width - 200) / 2;
  g.y = (app.renderer.height - 100) / 2;

  app.stage.addChild(g);

  // Simple text
  const text = new Text('Daisyland', {fontFamily: 'Arial', fontSize: 24, fill: 0xffffff});
  text.x = g.x + 10;
  text.y = g.y + 35;
  app.stage.addChild(text);

  console.log('Game started: placeholder graphic added.');
}

