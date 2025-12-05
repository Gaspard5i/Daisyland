/**
 * GameMetrics.js
 * Gestionnaire centralisé des métriques du jeu
 */

export class GameMetrics {
  constructor() {
    this.metrics = {
      electricity: {
        name: 'Électricité',
        description: 'Énergie électrique disponible',
        maxValue: 100,
        actualValue: 0,
        level: 1
      },
      food: {
        name: 'Nourriture',
        description: 'Réserves alimentaires',
        maxValue: 100,
        actualValue: 0,
        level: 1
      },
      waste: {
        name: 'Déchets',
        description: 'Quantité de déchets à traiter',
        maxValue: 5000,
        actualValue: 0,
        level: 1
      },
      wood: {
        name: 'Bois',
        description: 'Ressources en bois disponibles',
        maxValue: 100,
        actualValue: 0,
        level: 1
      }
    };

    this.listeners = [];
  }

  /**
   * Ajoute un écouteur pour les changements de métriques
   * @param {Function} callback - Fonction appelée lors des changements
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Supprime un écouteur
   * @param {Function} callback - Fonction à supprimer
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notifie tous les écouteurs des changements
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.metrics);
    });
  }

  /**
   * Met à jour une métrique
   * @param {string} metricKey - Clé de la métrique
   * @param {number} value - Nouvelle valeur actuelle
   */
  setMetric(metricKey, value) {
    if (this.metrics.hasOwnProperty(metricKey)) {
      this.metrics[metricKey].actualValue = Math.max(0, Math.min(this.metrics[metricKey].maxValue || 100, value));
      this.notifyListeners();
    }
  }

  /**
   * Met à jour une métrique complète
   * @param {string} metricKey - Clé de la métrique
   * @param {Object} metricValue - Objet MetricValue
   */
  setMetricValue(metricKey, metricValue) {
    if (this.metrics.hasOwnProperty(metricKey)) {
      this.metrics[metricKey] = {
        ...this.metrics[metricKey],
        ...metricValue
      };
      this.notifyListeners();
    }
  }

  /**
   * Ajoute une valeur à une métrique
   * @param {string} metricKey - Clé de la métrique
   * @param {number} amount - Montant à ajouter (peut être négatif)
   */
  addToMetric(metricKey, amount) {
    if (this.metrics.hasOwnProperty(metricKey)) {
      this.setMetric(metricKey, this.metrics[metricKey].actualValue + amount);
    }
  }

  /**
   * Met à jour plusieurs métriques
   * @param {Object} updates - Objet contenant les mises à jour {metricKey: MetricValue}
   */
  setMetrics(updates) {
    let changed = false;
    Object.keys(updates).forEach(key => {
      if (this.metrics.hasOwnProperty(key)) {
        this.metrics[key] = {
          ...this.metrics[key],
          ...updates[key]
        };
        changed = true;
      }
    });
    if (changed) {
      this.notifyListeners();
    }
  }

  /**
   * Ajoute des valeurs à plusieurs métriques
   * @param {Object} changes - Objet contenant les changements {metricKey: amount}
   */
  addToMetrics(changes) {
    let changed = false;
    Object.keys(changes).forEach(key => {
      if (this.metrics.hasOwnProperty(key)) {
        this.metrics[key].actualValue = Math.max(0, Math.min(this.metrics[key].maxValue || 100, this.metrics[key].actualValue + changes[key]));
        changed = true;
      }
    });
    if (changed) {
      this.notifyListeners();
    }
  }

  /**
   * Obtient la valeur actuelle d'une métrique
   * @param {string} metricKey - Clé de la métrique
   * @returns {number} Valeur actuelle de la métrique
   */
  getMetric(metricKey) {
    return this.metrics[metricKey]?.actualValue || 0;
  }

  /**
   * Obtient une métrique complète
   * @param {string} metricKey - Clé de la métrique
   * @returns {Object|null} Objet MetricValue ou null
   */
  getMetricValue(metricKey) {
    return this.metrics[metricKey] ? { ...this.metrics[metricKey] } : null;
  }

  /**
   * Obtient toutes les métriques
   * @returns {Object} Copie de l'objet des métriques
   */
  getAllMetrics() {
    return { ...this.metrics };
  }

  /**
   * Vérifie si une métrique a atteint sa valeur maximale
   * @param {string} metricKey - Clé de la métrique
   * @returns {boolean} True si la métrique est au maximum
   */
  isMetricAtMax(metricKey) {
    const metric = this.metrics[metricKey];
    return metric && metric.actualValue >= (metric.maxValue || 100);
  }

  /**
   * Vérifie si une métrique est à zéro
   * @param {string} metricKey - Clé de la métrique
   * @returns {boolean} True si la métrique est à zéro
   */
  isMetricEmpty(metricKey) {
    const metric = this.metrics[metricKey];
    return metric && metric.actualValue <= 0;
  }

  /**
   * Réinitialise toutes les métriques aux valeurs par défaut
   */
  reset() {
    this.metrics = {
      electricity: {
        name: 'Électricité',
        description: 'Énergie électrique disponible',
        maxValue: 100,
        actualValue: 0,
        level: 1
      },
      food: {
        name: 'Nourriture',
        description: 'Réserves alimentaires',
        maxValue: 100,
        actualValue: 0,
        level: 1
      },
      waste: {
        name: 'Déchets',
        description: 'Quantité de déchets à traiter',
        maxValue: 100,
        actualValue: 0,
        level: 1
      },
      wood: {
        name: 'Bois',
        description: 'Ressources en bois disponibles',
        maxValue: 100,
        actualValue: 0,
        level: 1
      }
    };
    this.notifyListeners();
  }
}
