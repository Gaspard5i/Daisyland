/**
 * WoodStyle.js
 * Composant partagé pour créer des éléments avec un style pancarte en bois
 */

import { Container, Graphics } from 'pixi.js';

// Couleurs du bois
export const WOOD_COLORS = {
  base: 0xC4A35A,
  planks: [0xD4B76A, 0xB89545, 0xC4A35A, 0xA8883A],
  grain: 0x8B7340,
  border: 0x7A6030,
  nailDark: 0x3D3D3D,
  nailLight: 0x6D6D6D,
};

/**
 * Crée une pancarte en bois
 * @param {number} width - Largeur de la pancarte
 * @param {number} height - Hauteur de la pancarte
 * @param {Object} options - Options de personnalisation
 * @param {boolean} options.showNails - Afficher les clous (défaut: true)
 * @param {number} options.borderRadius - Rayon des coins (défaut: 8)
 * @param {number} options.borderWidth - Épaisseur de la bordure (défaut: 4)
 * @param {number} options.planksCount - Nombre de planches (défaut: 4)
 * @returns {Container} Container PixiJS avec le style bois
 */
export function createWoodPanel(width, height, options = {}) {
  const {
    showNails = true,
    borderRadius = 8,
    borderWidth = 4,
    planksCount = 4,
  } = options;

  const woodPanel = new Container();

  // Fond principal bois
  const woodBase = new Graphics();
  woodBase.roundRect(0, 0, width, height, borderRadius);
  woodBase.fill({ color: WOOD_COLORS.base });
  woodPanel.addChild(woodBase);

  // Planches horizontales
  const plankLines = new Graphics();
  const plankHeight = height / planksCount;
  for (let i = 0; i < planksCount; i++) {
    const colorIndex = i % WOOD_COLORS.planks.length;
    plankLines.roundRect(2, i * plankHeight + 1, width - 4, plankHeight - 2, 3);
    plankLines.fill({ color: WOOD_COLORS.planks[colorIndex] });
  }
  woodPanel.addChild(plankLines);

  // Lignes de grain (proportionnel à la hauteur)
  const grainLines = new Graphics();
  const grainCount = Math.max(3, Math.floor(height / 12));
  for (let i = 0; i < grainCount; i++) {
    const y = 6 + i * ((height - 12) / (grainCount - 1));
    grainLines.moveTo(8, y);
    grainLines.lineTo(width - 8, y + (i % 2 === 0 ? 2 : -2));
    grainLines.stroke({ color: WOOD_COLORS.grain, width: 1, alpha: 0.3 });
  }
  woodPanel.addChild(grainLines);

  // Bordure
  const woodBorder = new Graphics();
  woodBorder.roundRect(0, 0, width, height, borderRadius);
  woodBorder.stroke({ color: WOOD_COLORS.border, width: borderWidth });
  woodPanel.addChild(woodBorder);

  // Clous aux coins (optionnel)
  if (showNails) {
    const nailOffset = Math.min(10, width * 0.08, height * 0.15);
    const nailRadius = Math.min(4, width * 0.03, height * 0.06);
    
    const nailPositions = [
      { x: nailOffset, y: nailOffset },
      { x: width - nailOffset, y: nailOffset },
      { x: nailOffset, y: height - nailOffset },
      { x: width - nailOffset, y: height - nailOffset },
    ];
    
    nailPositions.forEach(pos => {
      const nail = new Graphics();
      nail.circle(pos.x, pos.y, nailRadius);
      nail.fill({ color: WOOD_COLORS.nailDark });
      nail.circle(pos.x - 1, pos.y - 1, nailRadius / 2);
      nail.fill({ color: WOOD_COLORS.nailLight });
      woodPanel.addChild(nail);
    });
  }

  return woodPanel;
}
