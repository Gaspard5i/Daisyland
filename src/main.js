import { createApp, mountApp } from './core/App.js';
import { FarmScene } from './game/scenes/FarmScene.js';
import { MiniGameScene } from './game/scenes/MiniGameScene.js';

(async () => {
    // Créer et initialiser l'application PixiJS
    const app = await createApp();
    mountApp(app, 'app');

    console.log('Pixi app started');

    // Créer les scènes
    const miniGameScene = new MiniGameScene(app, () => {
      // Callback retour : fermer mini-jeu, afficher carte
      miniGameScene.close();
      farmScene.show();
    });
    
    const farmScene = new FarmScene(app, (id, name) => {
      // Callback ouverture lieu : cacher carte, ouvrir mini-jeu
      farmScene.hide();
      miniGameScene.open(id, name);
    });

    // Ajouter les scènes au stage
    app.stage.addChild(farmScene);
    app.stage.addChild(miniGameScene);

    console.log('Daisyland initialisé !');

    // Exposer pour le debug
    window.app = app;
    window.farmScene = farmScene;
    window.miniGameScene = miniGameScene;
})();
