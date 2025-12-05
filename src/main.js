import { Application } from 'pixi.js';
import { startGame } from './game.js';


(async () => {
    // Create the Pixi application
    const app = new Application();

    await app.init({
        resizeTo: window,    // Redimensionne automatiquement à la taille de la fenêtre
        backgroundColor: 0x1099bb, // Background color
        antialias: true,     // Enable antialiasing
        resolution: window.devicePixelRatio || 1, // Meilleure résolution sur écrans HiDPI
        autoDensity: true,   // Ajuste automatiquement la densité
        preference: 'webgl', // or 'webgpu' // Renderer preference
    });

    // Append view to the DOM
    const container = document.getElementById('app') || document.body;
    container.appendChild(app.canvas);

    console.log('Pixi app started');

    // Start the game and keep the API (stop/getter) for future use
    const gameApi = startGame(app);
    // expose for debugging or later control
    window.gameApi = gameApi;

    // Expose app too
    window.app = app;
})();
