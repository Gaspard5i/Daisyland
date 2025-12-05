import { createApp, mountApp } from './core/App.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { MiniGameScene } from './game/scenes/MiniGameScene.js';
import { GameMetrics } from './core/GameMetrics.js';
import { MetricsBar } from './ui/MetricsBar.js';
import { FabricWindow } from './ui/FabricWindow.js';
import { MarketWindow } from './ui/MarketWindow.js';
import { FishingWindow } from './ui/FishingWindow.js';

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


    // Fenêtres UI (modales) - créées en premier pour être disponibles dans les callbacks
    const fabricWindow = new FabricWindow(app, () => {
      console.log('Fabric window closed');
    }, gameMetrics);

    const marketWindow = new MarketWindow(app, () => {
      console.log('Market window closed');
    }, gameMetrics);

    const fishingWindow = new FishingWindow(app, () => {
      console.log('Fishing window closed');
    }, gameMetrics);

    // Créer les scènes
    const miniGameScene = new MiniGameScene(app, () => {
      // Callback retour : fermer mini-jeu, afficher carte
      miniGameScene.close();
      farmScene.show();
    });
    
    const farmScene = new FarmScene(app, (id, name) => {

        if (id === 'port-east') {
            marketWindow.open();
            return;
        }
        if (id === 'farm-3') {
            fabricWindow.open();
            return;
        }
        if (id === 'farm-6'){
            fishingWindow.open();
            return;
        }

      farmScene.hide();
      miniGameScene.open(id, name);
    });

    app.stage.addChild(farmScene);
    app.stage.addChild(miniGameScene);

    app.stage.addChild(metricsBar);


    app.stage.addChild(fabricWindow);
    app.stage.addChild(marketWindow);
    app.stage.addChild(fishingWindow);

    // Exposer les fenêtres globalement pour le debug (optionnel)
    window.gameWindows = {
      fabric: fabricWindow,
      market: marketWindow,
      fishing: fishingWindow,
    };

})();
