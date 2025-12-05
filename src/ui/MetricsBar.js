/**
 * MetricsBar.js
 * Barre de métriques affichant les 4 valeurs du jeu (électricité, nourriture, déchets, bois)
 */

import { Container, Graphics, Text } from 'pixi.js';
import { COLORS, FONTS } from '../utils/Constants.js';
import { SaveManager } from '../core/SaveManager.js';
import { Button } from './Button.js';

export class MetricsBar extends Container {
  constructor() {
    super();

    this.saveManager = new SaveManager();

    // Configuration des couleurs et icônes pour chaque métrique
    this.metricConfig = {
      electricity: {
        color: 0xffdd00,
        icon: '⚡'
      },
      food: {
        color: 0x00cc66,
        icon: '🥕'
      },
      waste: {
        color: 0xcc3333,
        icon: '🗑️'
      },
      wood: {
        color: 0x8b4513,
        icon: '🪵'
      }
    };

    // Les métriques seront initialisées par updateMetrics()
    this.metrics = {};

    this.barWidth = 220;
    this.barHeight = 28;
    this.padding = 18;
    this.spacing = 58;
    this.iconSize = 20;
    this.buttonHeight = 40;
    this.saveButtonTopMargin = 15; // Nouvelle marge au-dessus du bouton de sauvegarde
    this.buttonMargin = 10;

    // Position sera mise à jour dans updatePosition()
    this._updatePosition();
    
    // Écouter le resize pour repositionner
    window.addEventListener('resize', () => this._updatePosition());
  }

  _updatePosition() {
    // Position en haut à droite
    const screenWidth = window.innerWidth;
    this.position.set(screenWidth - this.barWidth - this.padding - 20, 20);
  }

  createBackground() {
    // Supprimer l'ancien background s'il existe
    if (this.background) {
      this.removeChild(this.background);
    }

    this.background = new Graphics();

    // Calculer la hauteur basée sur le nombre de métriques + bouton sauvegarde
    const metricsCount = Object.keys(this.metrics).length || 4;
    const contentHeight = metricsCount * this.spacing + this.saveButtonTopMargin + this.buttonHeight + this.buttonMargin;
    const backgroundHeight = contentHeight + this.padding; // Ajouter le padding pour le bas du background

    // Fond semi-transparent
    this.background.rect(
      -this.padding,
      -this.padding,
      this.barWidth + this.padding * 2,
      backgroundHeight
    );
    this.background.fill({ color: 0x000000, alpha: 0.8 });

    // Bordure
    this.background.rect(
      -this.padding,
      -this.padding,
      this.barWidth + this.padding * 2,
      backgroundHeight
    );
    this.background.stroke({ color: 0x444444, width: 2, alpha: 1 });

    // Ajouter le background en premier pour qu'il soit derrière les barres
    this.addChildAt(this.background, 0);
  }

  createSaveButton() {
      if (this.saveBtn) {
          this.removeChild(this.saveBtn);
      }

      const metricsCount = Object.keys(this.metrics).length;
      // Position Y du bouton : après les métriques, plus la marge supérieure
      const yPos = metricsCount * this.spacing + this.saveButtonTopMargin;

      this.saveBtn = new Button({
          label: 'Sauvegarder',
          x: this.barWidth / 2,
          y: yPos,
          width: 160,
          height: this.buttonHeight,
          onClick: () => this._onSave(),
          showMarker: false
      });

      this.addChild(this.saveBtn);
  }

  _onSave() {
      try {
          // On passe `this` (l'instance de MetricsBar) car elle a la méthode `getAllMetrics()`
          // nécessaire à SaveManager.serializegameMetrics
          const binary = this.saveManager.serializegameMetrics(this);
          const blob = new Blob([binary], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = 'savegame.daisyland'; // Changed to .save extension
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          console.log('Partie sauvegardée !');
      } catch (e) {
          console.error('Erreur lors de la sauvegarde :', e);
      }
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

      // Container pour cette barre
      const barContainer = new Container();
      barContainer.position.set(0, y);

      // Texte du nom avec icône
      const nameText = new Text({
        text: `${config.icon} ${metric.name}`,
        style: {
          fontFamily: FONTS.DEFAULT,
          fontSize: FONTS.SIZES.SMALL + 2,
          fill: 0xffffff,
          align: 'left',
          fontWeight: 'bold'
        }
      });
      nameText.position.set(0, 0);
      barContainer.addChild(nameText);

      // Conteneur de la barre
      const barBg = new Graphics();
      barBg.rect(0, 20, this.barWidth, this.barHeight);
      barBg.fill({ color: 0x222222 });
      barBg.stroke({ color: 0x555555, width: 1 });
      barContainer.addChild(barBg);

      // Barre de progression
      const progressBar = new Graphics();
      barContainer.addChild(progressBar);

      // Texte de la valeur (centré dans la barre)
      const valueText = new Text({
        text: '',
        style: {
          fontFamily: FONTS.DEFAULT,
          fontSize: FONTS.SIZES.SMALL,
          fill: 0xffffff,
          align: 'center',
          fontWeight: 'bold'
        }
      });
      valueText.anchor.set(0.5, 0.5);
      valueText.position.set(this.barWidth / 2, 20 + this.barHeight / 2);
      barContainer.addChild(valueText);

      this.bars[key] = {
        container: barContainer,
        progressBar: progressBar,
        valueText: valueText
      };

      this.addChild(barContainer);
    });

    this.createSaveButton();
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

        // Barre de progression principale
        bar.progressBar.rect(0, 20, fillWidth, this.barHeight);
        bar.progressBar.fill({ color: fillColor, alpha: 0.8 });

        // Effet de brillance
        bar.progressBar.rect(0, 20, fillWidth, this.barHeight / 3);
        bar.progressBar.fill({ color: fillColor, alpha: 0.3 });
      }

      // Mettre à jour le texte de valeur
      bar.valueText.text = `${Math.round(metric.actualValue)} / ${metric.maxValue}`;
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
