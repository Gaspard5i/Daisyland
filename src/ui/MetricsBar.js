/**
 * MetricsBar.js
 * Barre de métriques affichant les 4 valeurs du jeu (électricité, nourriture, déchets, bois)
 */

import { Container, Graphics, Text } from 'pixi.js';
import { createWoodPanel } from './WoodStyle.js';
import { addTooltip } from './Tooltip.js';

export class MetricsBar extends Container {
  constructor() {
    super();

    // Configuration des couleurs et icônes pour chaque métrique
    this.metricConfig = {
      electricity: {
        name: 'Électricité',
        color: 0xffdd00,
        icon: '⚡'
      },
      food: {
        name: 'Nourriture',
        color: 0x00cc66,
        icon: '🥕'
      },
      waste: {
        name: 'Déchets',
        color: 0xcc3333,
        icon: '🗑️'
      },
      wood: {
        name: 'Bois',
        color: 0x8b4513,
        icon: '🪵'
      },
      water: {
        name: 'Eau',
        color: 0x3399ff,
        icon: '💧'
      }
    };

    // Les métriques seront initialisées par updateMetrics()
    this.metrics = {};

    this.iconSize = 28;
    this.barWidth = 170;
    this.barHeight = 26;
    this.paddingH = 22;  // Padding horizontal (gauche/droite)
    this.paddingV = 32;  // Padding vertical (haut/bas)
    this.spacing = 50;
    this.iconBarGap = 12; // Espace entre icône et barre

    // Position sera mise à jour dans updatePosition()
    this._updatePosition();
    
    // Écouter le resize pour repositionner
    window.addEventListener('resize', () => this._updatePosition());
  }

  _updatePosition() {
    // Position en haut à droite
    const screenWidth = window.innerWidth;
    this.position.set(screenWidth - this.iconSize - this.iconBarGap - this.barWidth - this.paddingH - 20, 50);
  }

  createBackground() {
    // Supprimer l'ancien background s'il existe
    if (this.background) {
      this.removeChild(this.background);
    }

    // Calculer les dimensions basées sur le nombre de métriques
    const metricsCount = Object.keys(this.metrics).length || 4;
    const backgroundHeight = metricsCount * this.spacing + this.paddingV * 2 - (this.spacing - this.barHeight);
    const backgroundWidth = this.iconSize + this.iconBarGap + this.barWidth + this.paddingH * 2;

    // Créer le fond en bois avec le composant partagé
    this.background = createWoodPanel(backgroundWidth, backgroundHeight, {
      showNails: true,
      borderRadius: 10,
      borderWidth: 4,
    });
    
    // Positionner le background
    this.background.position.set(-this.paddingH, -this.paddingV);

    // Ajouter le background en premier pour qu'il soit derrière les barres
    this.addChildAt(this.background, 0);
  }

  createBars() {
    // Supprimer les anciennes barres si elles existent
    if (this.bars) {
      Object.values(this.bars).forEach(bar => {
        this.removeChild(bar.container);
      });
    }

    this.bars = {};

    Object.keys(this.metrics).forEach((key, index) => {
      const metric = this.metrics[key];
      const config = this.metricConfig[key] || { color: 0xffffff, icon: '?' };
      const y = index * this.spacing;

      // Container pour cette ligne (icône + barre)
      const barContainer = new Container();
      barContainer.position.set(0, y);

      // Fond circulaire derrière l'icône pour la lisibilité
      const iconBg = new Graphics();
      const iconRadius = this.iconSize * 0.7;
      iconBg.circle(this.iconSize / 2, this.barHeight / 2, iconRadius);
      iconBg.fill({ color: 0x1a1a1a, alpha: 0.6 });
      iconBg.stroke({ color: config.color, width: 2, alpha: 0.4 });
      barContainer.addChild(iconBg);

      // Icône à gauche
      const iconText = new Text({
        text: config.icon,
        style: {
          fontSize: this.iconSize * 0.75,
        }
      });
      iconText.anchor.set(0.5, 0.5);
      iconText.position.set(this.iconSize / 2, this.barHeight / 2);
      barContainer.addChild(iconText);

      // Position X de la barre (après l'icône)
      const barX = this.iconSize + this.iconBarGap;

      // Fond de la barre
      const barBg = new Graphics();
      barBg.roundRect(barX, 0, this.barWidth, this.barHeight, 4);
      barBg.fill({ color: 0x222222 });
      barBg.stroke({ color: 0x555555, width: 1 });
      barContainer.addChild(barBg);

      // Barre de progression
      const progressBar = new Graphics();
      barContainer.addChild(progressBar);

      // Ajouter tooltip au survol
      addTooltip(barContainer, () => `${config.name}: ${this.metrics[key].actualValue}/${this.metrics[key].maxValue}`);

      this.bars[key] = {
        container: barContainer,
        progressBar: progressBar,
        barX: barX,
      };

      this.addChild(barContainer);
    });

    this.updateBars();
  }

  updateBars() {
    if (!this.bars) return;

    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key];
      const config = this.metricConfig[key] || { color: 0xffffff, icon: '?' };
      const bar = this.bars[key];

      if (!bar) return;

      // Calculer le pourcentage
      const percentage = Math.max(0, Math.min(1, metric.actualValue / metric.maxValue));
      const fillWidth = this.barWidth * percentage;

      // Mettre à jour la barre de progression
      bar.progressBar.clear();

      if (fillWidth > 0) {
        // Couleur de remplissage basée sur le pourcentage
        let fillColor = config.color;
        if (percentage < 0.25) {
          fillColor = 0xff4444; // Rouge pour valeurs basses
        } else if (percentage < 0.5) {
          fillColor = 0xffaa44; // Orange pour valeurs moyennes-basses
        }

        // Barre de progression principale (position après l'icône)
        bar.progressBar.roundRect(bar.barX, 0, fillWidth, this.barHeight, 4);
        bar.progressBar.fill({ color: fillColor, alpha: 0.9 });

        // Effet de brillance
        bar.progressBar.roundRect(bar.barX, 0, fillWidth, this.barHeight / 3, 4);
        bar.progressBar.fill({ color: 0xffffff, alpha: 0.2 });
      }
    });
  }

  /**
   * Met à jour une métrique en utilisant l'interface MetricValue
   * @param {string} metricKey - Clé de la métrique (electricity, food, waste, wood)
   * @param {Object} metricValue - Objet conforme à l'interface MetricValue
   */
  updateMetric(metricKey, metricValue) {
    if (this.metrics[metricKey]) {
      // Mise à jour des propriétés depuis l'interface MetricValue
      if (metricValue.name !== undefined) {
        this.metrics[metricKey].name = metricValue.name;
      }
      if (metricValue.description !== undefined) {
        this.metrics[metricKey].description = metricValue.description;
      }
      if (metricValue.maxValue !== undefined) {
        this.metrics[metricKey].maxValue = metricValue.maxValue;
      }
      if (metricValue.actualValue !== undefined) {
        this.metrics[metricKey].actualValue = Math.max(0, Math.min(this.metrics[metricKey].maxValue, metricValue.actualValue));
      }
      if (metricValue.level !== undefined) {
        this.metrics[metricKey].level = metricValue.level;
      }

      this.updateBars();
    }
  }

  /**
   * Met à jour plusieurs métriques
   * @param {Object} updates - Objet contenant les mises à jour {metricKey: MetricValue}
   */
  updateMetrics(updates) {
    const hadMetrics = Object.keys(this.metrics).length > 0;

    // Mettre à jour les métriques
    this.metrics = { ...updates };

    // Si c'est la première fois, créer les barres et le background
    if (!hadMetrics && Object.keys(this.metrics).length > 0) {
      this.createBars();
      // Recréer le background avec les bonnes dimensions maintenant qu'on a les métriques
      this.createBackground();
    } else if (hadMetrics && this.bars) {
      // Si les métriques ont changé de nombre, recréer tout
      const newMetricsCount = Object.keys(this.metrics).length;
      const oldMetricsCount = Object.keys(this.bars || {}).length;

      if (newMetricsCount !== oldMetricsCount) {
        this.createBars();
        this.createBackground();
      } else {
        this.updateBars();
      }
    }
  }

  /**
   * Met à jour seulement la valeur actuelle d'une métrique
   * @param {string} metricKey - Clé de la métrique
   * @param {number} actualValue - Nouvelle valeur actuelle
   */
  updateActualValue(metricKey, actualValue) {
    if (this.metrics[metricKey]) {
      this.metrics[metricKey].actualValue = Math.max(0, Math.min(this.metrics[metricKey].maxValue, actualValue));
      this.updateBars();
    }
  }

  /**
   * Obtient une métrique sous forme d'objet MetricValue
   * @param {string} metricKey - Clé de la métrique
   * @returns {Object|null} Objet MetricValue ou null si non trouvé
   */
  getMetric(metricKey) {
    const metric = this.metrics[metricKey];
    if (!metric) return null;

    return {
      name: metric.name,
      description: metric.description,
      maxValue: metric.maxValue,
      actualValue: metric.actualValue,
      level: metric.level
    };
  }

  /**
   * Obtient toutes les métriques
   * @returns {Object} Objet contenant toutes les métriques au format MetricValue
   */
  getAllMetrics() {
    const result = {};
    Object.keys(this.metrics).forEach(key => {
      result[key] = this.getMetric(key);
    });
    return result;
  }

  /**
   * Ajoute une valeur à une métrique existante
   * @param {string} metricKey - Clé de la métrique
   * @param {number} amount - Montant à ajouter (peut être négatif)
   */
  addToMetric(metricKey, amount) {
    if (this.metrics[metricKey]) {
      const newValue = this.metrics[metricKey].actualValue + amount;
      this.updateActualValue(metricKey, newValue);
    }
  }

  /**
   * Réinitialise toutes les métriques aux valeurs par défaut
   */
  reset() {
    Object.keys(this.metrics).forEach(key => {
      const metric = this.metrics[key];
      switch(key) {
        case 'electricity':
          metric.actualValue = 50;
          break;
        case 'food':
          metric.actualValue = 75;
          break;
        case 'waste':
          metric.actualValue = 25;
          break;
        case 'wood':
          metric.actualValue = 60;
          break;
      }
      metric.level = 1;
    });
    this.updateBars();
  }
}
