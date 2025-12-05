import { createApp, mountApp } from './core/App.js';
import { SceneManager } from './core/SceneManager.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { ContinentScene } from './game/scenes/ContinentScene.js';
import { MiniGameScene } from './game/scenes/MiniGameScene.js';
import { GameMetrics } from './core/GameMetrics.js';
import { MetricsBar } from './ui/MetricsBar.js';
import { CollectionScene } from './game/scenes/CollectionScene.js';
import { CollectionZoneManager } from './game/systems/CollectionZoneManager.js';

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


    // Démarrer le système de remplissage passif des zones de collecte
    CollectionZoneManager.start();
    console.log('♻️ Zones de collecte actives - remplissage passif démarré');

    // Créer le gestionnaire de scènes
    const sceneManager = new SceneManager(app);

    // Créer la scène mini-jeu (overlay)
    const miniGameScene = new MiniGameScene(app, () => {
      // Callback retour : fermer mini-jeu
      miniGameScene.close();
      const currentScene = sceneManager.getCurrentScene();
      if (currentScene) {
        currentScene.show();
      }
    });

    // Créer la scène de collecte de déchets (overlay)
    const collectionScene = new CollectionScene(app, () => {
      // Callback retour : fermer collecte, revenir à la scène courante
      const currentScene = sceneManager.getCurrentScene();
      if (currentScene) {
        currentScene.show();
      }
    });

    // Créer la scène principale (ferme/île)
    const farmScene = new FarmScene(app, (id, name) => {
      // Callback ouverture lieu : cacher carte, ouvrir mini-jeu
      farmScene.hide();
      miniGameScene.open(id, name);
    });

    // Ajouter les scènes au stage
    app.stage.addChild(farmScene);
    app.stage.addChild(miniGameScene);
    app.stage.addChild(collectionScene);

    // Afficher la scène de départ
    sceneManager.showImmediate('farm');

    console.log('Daisyland initialisé !');

    // Exposer pour le debug
    window.app = app;
    window.farmScene = farmScene;
    window.miniGameScene = miniGameScene;
})();
