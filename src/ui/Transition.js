/**
 * Transition.js
 * Composant d'animation de transition entre les scènes (effet nuages)
 */

import * as PIXI from 'pixi.js';
import { COLORS } from '../utils/Constants.js';

export class Transition extends PIXI.Container {
  /**
   * @param {PIXI.Application} app - L'application PixiJS
   */
  constructor(app) {
    super();
    
    this.app = app;
    this.clouds = [];
    this.isAnimating = false;
    
    // Créer les nuages
    this._createClouds();
    
    // Masquer par défaut
    this.visible = false;
    
    // Resize handler
    this._onResize = this._onResize.bind(this);
    window.addEventListener('resize', this._onResize);
  }
  
  /**
   * Crée les éléments de nuages pour l'animation
   */
  _createClouds() {
    const numClouds = 20;
    
    for (let i = 0; i < numClouds; i++) {
      const cloud = new PIXI.Graphics();
      this._drawCloud(cloud);
      cloud.alpha = 0;
      this.addChild(cloud);
      this.clouds.push(cloud);
    }
  }
  
  /**
   * Dessine un nuage
   */
  _drawCloud(cloud) {
    cloud.clear();
    cloud.beginFill(COLORS.CLOUDS_HIGHLIGHT);
    
    // Forme de nuage avec plusieurs cercles
    const baseSize = 40 + Math.random() * 60;
    cloud.drawCircle(0, 0, baseSize);
    cloud.drawCircle(baseSize * 0.7, -baseSize * 0.2, baseSize * 0.8);
    cloud.drawCircle(-baseSize * 0.6, baseSize * 0.1, baseSize * 0.7);
    cloud.drawCircle(baseSize * 0.3, baseSize * 0.3, baseSize * 0.6);
    cloud.drawCircle(-baseSize * 0.4, -baseSize * 0.3, baseSize * 0.5);
    
    cloud.endFill();
  }
  
  /**
   * Positionne les nuages aléatoirement
   */
  _positionClouds() {
    const screenWidth = this.app.renderer.width;
    const screenHeight = this.app.renderer.height;
    
    this.clouds.forEach((cloud, i) => {
      // Répartir les nuages sur l'écran
      cloud.x = Math.random() * screenWidth;
      cloud.y = Math.random() * screenHeight;
      cloud.scale.set(0.5 + Math.random() * 1.5);
    });
  }
  
  /**
   * Lance l'animation de transition (entrée des nuages)
   * @param {Function} onComplete - Callback quand l'écran est couvert
   * @returns {Promise}
   */
  fadeIn(onComplete) {
    return new Promise((resolve) => {
      if (this.isAnimating) return resolve();
      
      this.isAnimating = true;
      this.visible = true;
      this._positionClouds();
      
      // Fond qui s'opacifie
      const bg = new PIXI.Graphics();
      bg.beginFill(COLORS.CLOUDS);
      bg.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
      bg.endFill();
      bg.alpha = 0;
      this.addChildAt(bg, 0);
      this.bg = bg;
      
      let progress = 0;
      const duration = 60; // frames (~1 seconde à 60fps)
      
      const animate = () => {
        progress++;
        const t = progress / duration;
        const easeOut = 1 - Math.pow(1 - t, 3);
        
        // Fade in du fond
        bg.alpha = easeOut;
        
        // Faire apparaître les nuages progressivement
        this.clouds.forEach((cloud, i) => {
          const delay = i * 0.05;
          const cloudT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
          cloud.alpha = cloudT;
          
          // Légère animation de mouvement
          cloud.x += Math.sin(progress * 0.1 + i) * 0.5;
          cloud.y += Math.cos(progress * 0.1 + i) * 0.3;
        });
        
        if (progress < duration) {
          requestAnimationFrame(animate);
        } else {
          if (onComplete) onComplete();
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Lance l'animation de sortie (disparition des nuages)
   * @returns {Promise}
   */
  fadeOut() {
    return new Promise((resolve) => {
      let progress = 0;
      const duration = 60;
      
      const animate = () => {
        progress++;
        const t = progress / duration;
        const easeIn = Math.pow(t, 2);
        
        // Fade out du fond
        if (this.bg) {
          this.bg.alpha = 1 - easeIn;
        }
        
        // Faire disparaître les nuages
        this.clouds.forEach((cloud, i) => {
          const delay = i * 0.03;
          const cloudT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
          cloud.alpha = 1 - cloudT;
          
          // Animation de sortie vers l'extérieur
          const centerX = this.app.renderer.width / 2;
          const centerY = this.app.renderer.height / 2;
          const dirX = cloud.x - centerX;
          const dirY = cloud.y - centerY;
          cloud.x += dirX * 0.02;
          cloud.y += dirY * 0.02;
        });
        
        if (progress < duration) {
          requestAnimationFrame(animate);
        } else {
          this.visible = false;
          this.isAnimating = false;
          
          // Nettoyer le fond
          if (this.bg) {
            this.removeChild(this.bg);
            this.bg.destroy();
            this.bg = null;
          }
          
          // Reset les nuages
          this.clouds.forEach(cloud => {
            cloud.alpha = 0;
          });
          
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Transition complète : fadeIn -> callback -> fadeOut
   * @param {Function} duringTransition - Callback exécuté pendant que l'écran est couvert
   * @returns {Promise}
   */
  async play(duringTransition) {
    await this.fadeIn();
    
    if (duringTransition) {
      await duringTransition();
    }
    
    // Petit délai pour laisser le temps de voir les nuages
    await new Promise(r => setTimeout(r, 200));
    
    await this.fadeOut();
  }
  
  /**
   * Gère le resize
   */
  _onResize() {
    if (this.bg) {
      this.bg.clear();
      this.bg.beginFill(COLORS.CLOUDS);
      this.bg.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
      this.bg.endFill();
    }
  }
  
  /**
   * Nettoie les ressources
   */
  destroy() {
    window.removeEventListener('resize', this._onResize);
    super.destroy({ children: true });
  }
}
