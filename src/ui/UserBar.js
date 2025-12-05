/**
 * UserBar.js
 * Barre utilisateur affichant l'avatar, le pseudo et les points (fleur)
 * Deux pancartes distinctes empilées verticalement
 */

import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { FONTS } from '../utils/Constants.js';

// Liste des avatars disponibles
const AVATARS = [
  '/assets/svg/avatars/avatar-boy-svgrepo-com.svg',
  '/assets/svg/avatars/avatar-girl-svgrepo-com.svg',
];

// Liste de pseudos aléatoires pour le moment
const RANDOM_USERNAMES = [
  'Daisy42Daisy42',
  'FarmMasterFarmMaster',
  'GreenThumbGreenThumb',
  'EcoWarriorEcoWarrior',
  'PlantLoverPlantLover',
  'NatureFanNatureFan',
  'SunFlowerSunFlower',
  'LeafyGreenLeafyGreen',
  'BloomBuddyBloomBuddy',
  'GardenHeroGardenHero',
];

export class UserBar extends Container {
  constructor() {
    super();

    // Données utilisateur (aléatoires pour le moment)
    this.username = RANDOM_USERNAMES[Math.floor(Math.random() * RANDOM_USERNAMES.length)];
    this.points = Math.floor(Math.random() * 9999) + 10000;
    this.avatarPath = AVATARS[Math.floor(Math.random() * AVATARS.length)];

    // Dimensions ligne 1 (Avatar + Pseudo) - Plus grande
    this.avatarSize = 85;
    this.row1Height = 75;
    this.sign1Height = 52;
    this.usernameFontSize = 24;

    // Dimensions ligne 2 (Fleur + Points) - Plus petite
    this.flowerSize = 60;
    this.row2Height = 55;
    this.sign2Height = 40;
    this.pointsFontSize = 18;

    this.padding = 12;
    this.spacing = 8;

    // Position en haut à gauche
    this.position.set(20, 50);

    // Créer les éléments
    this._createElements();
  }

  /**
   * Crée une pancarte en bois
   */
  _createWoodSign(width, height) {
    const woodSign = new Container();

    // Fond principal bois
    const woodBase = new Graphics();
    woodBase.roundRect(0, 0, width, height, 8);
    woodBase.fill({ color: 0xC4A35A });
    woodSign.addChild(woodBase);

    // Planches horizontales
    const plankLines = new Graphics();
    const plankColors = [0xD4B76A, 0xB89545, 0xC4A35A, 0xA8883A];
    const plankHeight = height / 4;
    for (let i = 0; i < 4; i++) {
      plankLines.roundRect(2, i * plankHeight + 1, width - 4, plankHeight - 2, 3);
      plankLines.fill({ color: plankColors[i] });
    }
    woodSign.addChild(plankLines);

    // Lignes de grain
    const grainLines = new Graphics();
    for (let i = 0; i < 5; i++) {
      const y = 6 + i * (height / 5);
      grainLines.moveTo(8, y);
      grainLines.lineTo(width - 8, y + (i % 2 === 0 ? 2 : -2));
      grainLines.stroke({ color: 0x8B7340, width: 1, alpha: 0.3 });
    }
    woodSign.addChild(grainLines);

    // Bordure
    const woodBorder = new Graphics();
    woodBorder.roundRect(0, 0, width, height, 8);
    woodBorder.stroke({ color: 0x7A6030, width: 4 });
    woodSign.addChild(woodBorder);

    // Clous
    const nailPositions = [
      { x: 10, y: 10 },
      { x: width - 10, y: 10 },
      { x: 10, y: height - 10 },
      { x: width - 10, y: height - 10 },
    ];
    nailPositions.forEach(pos => {
      const nail = new Graphics();
      nail.circle(pos.x, pos.y, 4);
      nail.fill({ color: 0x3D3D3D });
      nail.circle(pos.x - 1, pos.y - 1, 2);
      nail.fill({ color: 0x6D6D6D });
      woodSign.addChild(nail);
    });

    return woodSign;
  }

  /**
   * Crée tous les éléments visuels
   */
  async _createElements() {
    // La partie de l'icône qui chevauche la pancarte (moitié de l'icône)
    const iconOverlap1 = this.avatarSize / 2;
    const iconOverlap2 = this.flowerSize / 2;
    
    // Marges internes du texte (gauche et droite séparées)
    const textMarginLeft = 15;
    const textMarginRight = 30;

    // ===== LIGNE 1 : Avatar + Pseudo (plus grande) =====
    const row1CenterY = this.row1Height / 2;

    // Créer le texte du pseudo d'abord pour mesurer sa largeur
    this.usernameText = new Text({
      text: this.username,
      style: {
        fontFamily: FONTS.DEFAULT,
        fontSize: this.usernameFontSize,
        fill: 0xffffff,
        fontWeight: 'bold',
      }
    });
    this.usernameText.anchor.set(0.5, 0.5);

    // Largeur de la zone visible = largeur texte + marges (gauche + droite)
    // Largeur totale pancarte = zone visible + partie sous l'icône
    const visibleWidth1 = this.usernameText.width + textMarginLeft + textMarginRight;
    const sign1Width = iconOverlap1 + visibleWidth1;
    
    // Position de la pancarte : commence au centre de l'avatar
    const sign1X = this.padding + iconOverlap1;
    const sign1 = this._createWoodSign(sign1Width, this.sign1Height);
    sign1.position.set(sign1X, row1CenterY - this.sign1Height / 2);
    this.addChild(sign1);

    // Avatar (par-dessus la pancarte)
    this.avatarContainer = new Container();
    this.avatarContainer.position.set(this.padding, row1CenterY - this.avatarSize / 2);
    this.addChild(this.avatarContainer);

    try {
      const avatarTexture = await Assets.load(this.avatarPath);
      const avatarSprite = new Sprite(avatarTexture);
      avatarSprite.width = this.avatarSize;
      avatarSprite.height = this.avatarSize;
      this.avatarContainer.addChild(avatarSprite);
    } catch (e) {
      const fallbackText = new Text({ text: '👤', style: { fontSize: 42 } });
      fallbackText.anchor.set(0.5);
      fallbackText.position.set(this.avatarSize / 2, this.avatarSize / 2);
      this.avatarContainer.addChild(fallbackText);
    }

    // Le texte est centré sur la zone visible (décalé légèrement à gauche car marge droite > marge gauche)
    // Position X = début zone visible + marge gauche + demi-largeur texte
    this.usernameText.position.set(
      sign1X + iconOverlap1 + textMarginLeft + this.usernameText.width / 2,
      row1CenterY
    );
    this.addChild(this.usernameText);

    // ===== LIGNE 2 : Fleur + Points (plus petite) =====
    const row2Y = this.row1Height + this.spacing;
    const row2CenterY = row2Y + this.row2Height / 2;

    // Créer le texte des points d'abord pour mesurer sa largeur
    this.pointsText = new Text({
      text: this._formatPoints(this.points),
      style: {
        fontFamily: FONTS.DEFAULT,
        fontSize: this.pointsFontSize,
        fill: 0xffffff,
        fontWeight: 'bold',
      }
    });
    this.pointsText.anchor.set(0.5, 0.5);

    // Largeur de la zone visible = largeur texte + marges (gauche + droite)
    // Largeur totale pancarte = zone visible + partie sous l'icône
    const visibleWidth2 = this.pointsText.width + textMarginLeft + textMarginRight;
    const sign2Width = iconOverlap2 + visibleWidth2;
    
    // Position de la pancarte : commence au centre de la fleur
    const sign2X = this.padding + iconOverlap2;
    const sign2 = this._createWoodSign(sign2Width, this.sign2Height);
    sign2.position.set(sign2X, row2CenterY - this.sign2Height / 2);
    this.addChild(sign2);

    // Fleur (par-dessus la pancarte)
    this.flowerContainer = new Container();
    this.flowerContainer.position.set(this.padding, row2CenterY - this.flowerSize / 2);
    this.addChild(this.flowerContainer);

    try {
      const flowerTexture = await Assets.load('/assets/svg/logo/logo_no_face.svg');
      const flowerSprite = new Sprite(flowerTexture);
      flowerSprite.width = this.flowerSize;
      flowerSprite.height = this.flowerSize;
      this.flowerContainer.addChild(flowerSprite);
    } catch (e) {
      const fallbackFlower = new Text({ text: '🌸', style: { fontSize: 28 } });
      fallbackFlower.anchor.set(0.5);
      fallbackFlower.position.set(this.flowerSize / 2, this.flowerSize / 2);
      this.flowerContainer.addChild(fallbackFlower);
    }

    // Le texte est positionné avec marge gauche puis centré
    this.pointsText.position.set(
      sign2X + iconOverlap2 + textMarginLeft + this.pointsText.width / 2,
      row2CenterY
    );
    this.addChild(this.pointsText);
  }

  /**
   * Formate les points pour l'affichage
   */
  _formatPoints(points) {
    if (points >= 10000) {
      return Math.floor(points / 1000) + 'k';
    }
    return points.toString();
  }

  /**
   * Met à jour le pseudo
   */
  setUsername(username) {
    this.username = username;
    if (this.usernameText) {
      this.usernameText.text = username;
    }
  }

  /**
   * Met à jour les points
   */
  setPoints(points) {
    this.points = points;
    if (this.pointsText) {
      this.pointsText.text = this._formatPoints(points);
    }
  }

  /**
   * Ajoute des points
   */
  addPoints(amount) {
    this.setPoints(this.points + amount);
  }

  /**
   * Nettoie les ressources
   */
  destroy() {
    super.destroy({ children: true });
  }
}
