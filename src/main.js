import { createApp, mountApp } from './core/App.js';
import { SceneManager } from './core/SceneManager.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { ContinentScene } from './game/scenes/ContinentScene.js';
import { MiniGameScene } from './game/scenes/MiniGameScene.js';
import { GameMetrics } from './core/GameMetrics.js';
import { MetricsBar } from './ui/MetricsBar.js';
import { UserBar } from './ui/UserBar.js';
import { CollectionScene } from './game/scenes/CollectionScene.js';
import { CollectionZoneManager } from './game/systems/CollectionZoneManager.js';
import { WasteManager } from './game/systems/WasteManager.js';
import { initTooltip } from './ui/Tooltip.js';

(async () => {
    const app = await createApp();
    mountApp(app, 'app');

    console.log('Pixi app started');

    // Initialiser le système de tooltips en premier (nécessaire avant de créer les UI)
    initTooltip(app.stage);

    // Initialiser les métriques du jeu
    const gameMetrics = new GameMetrics();
    const metricsBar = new MetricsBar();

    gameMetrics.addListener((metrics) => {
      metricsBar.updateMetrics(metrics);
    });
    metricsBar.updateMetrics(gameMetrics.getAllMetrics());

    WasteManager.addListener((totalWaste, wasteByType) => {
      gameMetrics.setMetric('waste', totalWaste);
    });

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
    }, gameMetrics);

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
      // Si c'est le 8ème continent, naviguer vers cette scène
      if (id === '8eme-continent') {
        sceneManager.goTo('continent');
        return;
      }
      
      // Sinon, ouvrir le mini-jeu
      farmScene.hide();
      miniGameScene.open(id, name);
    });

    // Créer la scène du 8ème Continent
    const continentScene = new ContinentScene(
      app,
      (id, name) => {
        // Zones de collecte → ouvrir la scène de collecte
        if (id.startsWith('collection-')) {
          continentScene.hide();
          collectionScene.open(id, name);
          return;
        }
        
        // Autres lieux → ouvrir le mini-jeu générique
        continentScene.hide();
        miniGameScene.open(id, name);
      },
      (targetScene) => {
        // Naviguer vers une autre scène (retour à la ferme)
        if (targetScene === 'farm') {
          sceneManager.goTo('farm');
        }
      }
    );

    // Enregistrer les scènes dans le SceneManager
    sceneManager.register('farm', farmScene);
    sceneManager.register('continent', continentScene);

    // Ajouter les overlays par-dessus (mini-jeu et collecte)
    app.stage.addChild(miniGameScene);
    app.stage.addChild(collectionScene);

    // Ajouter la barre utilisateur en haut à gauche
    const userBar = new UserBar();
    app.stage.addChild(userBar);

    // Ajouter la barre de métriques tout en haut (toujours visible)
    app.stage.addChild(metricsBar);

    // Afficher la scène de départ
    sceneManager.showImmediate('farm');

    console.log('Daisyland initialisé !');

    // Exposer pour le debug
    window.app = app;
    window.sceneManager = sceneManager;
    window.gameMetrics = gameMetrics;
    window.userBar = userBar;
    window.farmScene = farmScene;
    window.continentScene = continentScene;
    window.miniGameScene = miniGameScene;
    window.collectionScene = collectionScene;
})();
