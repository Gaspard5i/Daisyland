/**
 * App.js
 * Initialisation et configuration de l'application PixiJS
 */

import { Application } from 'pixi.js';
import { COLORS } from '../utils/Constants.js';

/**
 * Crée et initialise l'application PixiJS
 * @returns {Promise<Application>} L'application PixiJS initialisée
 */
export async function createApp() {
  const app = new Application();

  await app.init({
    resizeTo: window,
    backgroundColor: COLORS.BACKGROUND,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    preference: 'webgl',
  });

  return app;
}

/**
 * Monte l'application dans le DOM
 * @param {Application} app - L'application PixiJS
 * @param {string} containerId - L'ID du conteneur DOM (par défaut 'app')
 */
export function mountApp(app, containerId = 'app') {
  const container = document.getElementById(containerId) || document.body;
  container.appendChild(app.canvas);
}
