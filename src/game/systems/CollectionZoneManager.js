/**
 * CollectionZoneManager.js
 * Gère le remplissage passif des zones de collecte
 */

import { WasteManager } from './WasteManager.js';

// Configuration des zones
const ZONE_CONFIG = {
  maxCapacity: 20,           // Capacité max d'une zone
  fillInterval: 10000,       // Intervalle d'ajout de déchets (10 secondes)
  fillAmount: 1,             // Nombre de déchets ajoutés par tick
  minFillAmount: 1,
  maxFillAmount: 3,          // Variation aléatoire
};

class CollectionZone {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.currentWaste = 0;
    this.maxCapacity = ZONE_CONFIG.maxCapacity;
    this.wasteItems = []; // Liste des déchets accumulés avec leurs types
    this.lastCollectTime = Date.now();
  }
  
  /**
   * Ajoute des déchets à la zone (appelé par le timer)
   */
  addWaste() {
    if (this.currentWaste >= this.maxCapacity) return false;
    
    // Ajouter entre min et max déchets
    const amount = Math.floor(
      ZONE_CONFIG.minFillAmount + 
      Math.random() * (ZONE_CONFIG.maxFillAmount - ZONE_CONFIG.minFillAmount + 1)
    );
    
    for (let i = 0; i < amount; i++) {
      if (this.currentWaste >= this.maxCapacity) break;
      
      // Générer un type de déchet aléatoire
      const wasteType = WasteManager.getRandomWasteType();
      const value = WasteManager.calculateValue(wasteType);
      
      this.wasteItems.push({
        type: wasteType,
        value: value,
      });
      this.currentWaste++;
    }
    
    return true;
  }
  
  /**
   * Collecte tous les déchets de la zone
   * @returns {Array} Les déchets collectés
   */
  collectAll() {
    const collected = [...this.wasteItems];
    this.wasteItems = [];
    this.currentWaste = 0;
    this.lastCollectTime = Date.now();
    return collected;
  }
  
  /**
   * Collecte un seul déchet
   * @returns {Object|null} Le déchet collecté
   */
  collectOne() {
    if (this.wasteItems.length === 0) return null;
    
    this.currentWaste--;
    return this.wasteItems.pop();
  }
  
  /**
   * Retourne le taux de remplissage (0-1)
   */
  getFillRate() {
    return this.currentWaste / this.maxCapacity;
  }
  
  /**
   * Retourne si la zone est pleine
   */
  isFull() {
    return this.currentWaste >= this.maxCapacity;
  }
  
  /**
   * Retourne si la zone est vide
   */
  isEmpty() {
    return this.currentWaste === 0;
  }
}

class CollectionZoneManagerSingleton {
  constructor() {
    this.zones = new Map();
    this.fillTimer = null;
    this.listeners = [];
    this.isRunning = false;
    
    // Créer les zones par défaut
    this._initZones();
  }
  
  /**
   * Initialise les zones de collecte
   */
  _initZones() {
    const defaultZones = [
      { id: 'collection-north', name: 'Zone Nord' },
      { id: 'collection-east', name: 'Zone Est' },
      { id: 'collection-south', name: 'Zone Sud' },
    ];
    
    defaultZones.forEach(z => {
      this.zones.set(z.id, new CollectionZone(z.id, z.name));
    });
  }
  
  /**
   * Démarre le remplissage automatique
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Remplir immédiatement un peu au démarrage
    this.zones.forEach(zone => {
      for (let i = 0; i < 5; i++) {
        zone.addWaste();
      }
    });
    this._notifyListeners();
    
    // Timer de remplissage
    this.fillTimer = setInterval(() => {
      this._fillAllZones();
    }, ZONE_CONFIG.fillInterval);
  }
  
  /**
   * Arrête le remplissage
   */
  stop() {
    this.isRunning = false;
    if (this.fillTimer) {
      clearInterval(this.fillTimer);
      this.fillTimer = null;
    }
  }
  
  /**
   * Remplit toutes les zones
   */
  _fillAllZones() {
    let changed = false;
    
    this.zones.forEach(zone => {
      if (zone.addWaste()) {
        changed = true;
      }
    });
    
    if (changed) {
      this._notifyListeners();
    }
  }
  
  /**
   * Récupère une zone par son ID
   */
  getZone(zoneId) {
    return this.zones.get(zoneId);
  }
  
  /**
   * Récupère toutes les zones
   */
  getAllZones() {
    return Array.from(this.zones.values());
  }
  
  /**
   * Collecte tous les déchets d'une zone
   */
  collectFromZone(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return [];
    
    const collected = zone.collectAll();
    this._notifyListeners();
    return collected;
  }
  
  /**
   * Collecte un déchet d'une zone
   */
  collectOneFromZone(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;
    
    const item = zone.collectOne();
    if (item) {
      this._notifyListeners();
    }
    return item;
  }
  
  /**
   * Ajoute un listener
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
   * Notifie les listeners
   */
  _notifyListeners() {
    const zonesData = {};
    this.zones.forEach((zone, id) => {
      zonesData[id] = {
        currentWaste: zone.currentWaste,
        maxCapacity: zone.maxCapacity,
        fillRate: zone.getFillRate(),
        isFull: zone.isFull(),
      };
    });
    
    this.listeners.forEach(callback => callback(zonesData));
  }
  
  /**
   * Retourne les infos d'une zone pour l'affichage
   */
  getZoneInfo(zoneId) {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;
    
    return {
      id: zone.id,
      name: zone.name,
      currentWaste: zone.currentWaste,
      maxCapacity: zone.maxCapacity,
      fillRate: zone.getFillRate(),
      isFull: zone.isFull(),
      isEmpty: zone.isEmpty(),
      wasteItems: zone.wasteItems,
    };
  }
}

// Singleton
export const CollectionZoneManager = new CollectionZoneManagerSingleton();
