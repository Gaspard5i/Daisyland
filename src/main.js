import { createApp, mountApp } from './core/App.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { MiniGameScene } from './game/scenes/MiniGameScene.js';
import { GameMetrics } from './core/GameMetrics.js';
import { MetricsBar } from './ui/MetricsBar.js';

(async () => {
    const app = await createApp();
    mountApp(app, 'app');

    console.log('Pixi app started');

    const gameMetrics = new GameMetrics();

    const metricsBar = new MetricsBar();

    gameMetrics.addListener((metrics) => {
      metricsBar.updateMetrics(metrics);
    });

    metricsBar.updateMetrics(gameMetrics.getAllMetrics());


    // Créer les scènes
    const miniGameScene = new MiniGameScene(app, () => {
      // Callback retour : fermer mini-jeu, afficher carte
      miniGameScene.close();
      farmScene.show();
    });
    
    const farmScene = new FarmScene(app, (id, name) => {
      farmScene.hide();
      miniGameScene.open(id, name);
    });

    app.stage.addChild(farmScene);
    app.stage.addChild(miniGameScene);

    app.stage.addChild(metricsBar);
})();
