/**
 * WasteManager.js
 * Gestionnaire global de la jauge de déchets collectés
 */

// Types de déchets avec leurs propriétés
export const WASTE_TYPES = {
  PLASTIC: {
    id: 'plastic',
    name: 'Plastique',
    emoji: '🥤',
    color: 0x64B5F6,
    minValue: 2,
    maxValue: 5,
    weight: 40, // Probabilité d'apparition (sur 100)
  },
  METAL: {
    id: 'metal',
    name: 'Métal',
    emoji: '🥫',
    color: 0xB0BEC5,
    minValue: 5,
    maxValue: 10,
    weight: 20,
  },
  CARDBOARD: {
    id: 'cardboard',
    name: 'Carton',
    emoji: '📦',
    color: 0xBCAAA4,
    minValue: 1,
    maxValue: 3,
    weight: 25,
  },
  ELECTRONIC: {
    id: 'electronic',
    name: 'Électronique',
    emoji: '📱',
    color: 0x9575CD,
    minValue: 10,
    maxValue: 20,
    weight: 10,
  },
  TOXIC: {
    id: 'toxic',
    name: 'Toxique',
    emoji: '🛢️',
    color: 0x66BB6A,
    minValue: 15,
    maxValue: 30,
    weight: 5,
  },
};

class WasteManagerSingleton {
  constructor() {
    this.totalCollected = 0;
    this.wasteByType = {};
    this.listeners = [];
    
    // Initialiser les compteurs par type
    Object.values(WASTE_TYPES).forEach(type => {
      this.wasteByType[type.id] = 0;
    });
  }
  
  /**
   * Ajoute des déchets collectés
   * @param {Object} wasteType - Le type de déchet (de WASTE_TYPES)
   * @param {number} amount - La quantité à ajouter
   */
  addWaste(wasteType, amount) {
    this.totalCollected += amount;
    this.wasteByType[wasteType.id] = (this.wasteByType[wasteType.id] || 0) + amount;
    
    // Notifier les listeners
    this._notifyListeners();
    
    console.log(`♻️ +${amount} ${wasteType.name} | Total: ${this.totalCollected}`);
  }
  
  /**
   * Retourne le total collecté
   */
  getTotal() {
    return this.totalCollected;
  }
  
  /**
   * Retourne les déchets par type
   */
  getByType(typeId) {
    return this.wasteByType[typeId] || 0;
  }
  
  /**
   * Ajoute un listener pour les changements
   */
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  /**
   * Retire un listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }
  
  /**
   * Notifie tous les listeners
   */
  _notifyListeners() {
    this.listeners.forEach(callback => {
      callback(this.totalCollected, this.wasteByType);
    });
  }
  
  /**
   * Sélectionne un type de déchet aléatoire basé sur les poids
   */
  getRandomWasteType() {
    const types = Object.values(WASTE_TYPES);
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const type of types) {
      random -= type.weight;
      if (random <= 0) {
        return type;
      }
    }
    
    return types[0]; // Fallback
  }
  
  /**
   * Calcule la valeur d'un déchet
   */
  calculateValue(wasteType) {
    return Math.floor(
      wasteType.minValue + Math.random() * (wasteType.maxValue - wasteType.minValue + 1)
    );
  }
}

// Singleton
export const WasteManager = new WasteManagerSingleton();
