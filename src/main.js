import { Application, Assets, Sprite } from 'pixi.js';
import { startGame } from './game.js';


(async () =>
{
    // Create the Pixi application
    const app = new Application();

    await app.init({ background: '#1099bb', resizeTo: window });

    // Append view to the DOM
    const container = document.getElementById('app') || document.body;
    container.appendChild(app.view);

    console.log('Pixi app started');

    // Start the game
    startGame(app);

    // Expose for debugging
    window.app = app;
})();
