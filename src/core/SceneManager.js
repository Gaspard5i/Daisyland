/**
 * SceneManager.js
 * Gestionnaire de scènes avec transitions animées
 */

import * as PIXI from 'pixi.js';
import { Transition } from '../ui/Transition.js';

export class SceneManager {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   */
  constructor(app) {
    this.app = app;
    this.scenes = new Map();
    this.currentScene = null;
    this.currentSceneId = null;
    
    // Container principal pour les scènes
    this.sceneContainer = new PIXI.Container();
    app.stage.addChild(this.sceneContainer);
    
    // Transition overlay (par-dessus les scènes)
    this.transition = new Transition(app);
    app.stage.addChild(this.transition);
    
    // État de transition
    this.isTransitioning = false;
  }
  
  /**
   * Enregistre une scène
   * @param {string} id - Identifiant unique de la scène
   * @param {PIXI.Container} scene - La scène à enregistrer
   */
  register(id, scene) {
    this.scenes.set(id, scene);
    scene.visible = false;
    this.sceneContainer.addChild(scene);
  }
  
  /**
   * Affiche une scène immédiatement (sans transition)
   * @param {string} id - L'identifiant de la scène
   */
  showImmediate(id) {
    const scene = this.scenes.get(id);
    if (!scene) {
      console.error(`Scene "${id}" not found`);
      return;
    }
    
    // Cache la scène actuelle
    if (this.currentScene) {
      this.currentScene.hide();
    }
    
    // Affiche la nouvelle scène
    this.currentScene = scene;
    this.currentSceneId = id;
    scene.show();
  }
  
  /**
   * Navigue vers une scène avec transition
   * @param {string} id - L'identifiant de la scène cible
   * @param {Object} options - Options de transition
   * @returns {Promise<void>}
   */
  async goTo(id, options = {}) {
    // Empêche les transitions multiples
    if (this.isTransitioning) {
      console.warn('Transition already in progress');
      return;
    }
    
    const scene = this.scenes.get(id);
    if (!scene) {
      console.error(`Scene "${id}" not found`);
      return;
    }
    
    // Si c'est la même scène, on ne fait rien
    if (id === this.currentSceneId) {
      return;
    }
    
    this.isTransitioning = true;
    
    return new Promise((resolve) => {
      this.transition.play(() => {
        // Pendant la transition (écran couvert)
        // Cache l'ancienne scène
        if (this.currentScene) {
          this.currentScene.hide();
        }
        
        // Affiche la nouvelle scène
        this.currentScene = scene;
        this.currentSceneId = id;
        scene.show();
      }).then(() => {
        // Transition terminée
        this.isTransitioning = false;
        resolve();
      });
    });
  }
  
  /**
   * Retourne l'identifiant de la scène actuelle
   * @returns {string|null}
   */
  getCurrentSceneId() {
    return this.currentSceneId;
  }
  
  /**
   * Retourne la scène actuelle
   * @returns {PIXI.Container|null}
   */
  getCurrentScene() {
    return this.currentScene;
  }
  
  /**
   * Vérifie si une transition est en cours
   * @returns {boolean}
   */
  isInTransition() {
    return this.isTransitioning;
  }
  
  /**
   * Récupère une scène par son ID
   * @param {string} id - L'identifiant de la scène
   * @returns {PIXI.Container|undefined}
   */
  getScene(id) {
    return this.scenes.get(id);
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    this.scenes.forEach(scene => {
      if (scene.destroy) {
        scene.destroy();
      }
    });
    this.scenes.clear();
    this.transition.destroy();
    this.sceneContainer.destroy({ children: true });
  }
}
