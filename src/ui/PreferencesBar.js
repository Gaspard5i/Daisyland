import { Container } from 'pixi.js';
import { Button } from './Button.js';
import { SaveManager } from '../core/SaveManager.js';

export class PreferencesBar extends Container {
    /**
     * @param {GameMetrics} gameMetrics - Référence au gestionnaire de métriques pour la sauvegarde
     */
    constructor(gameMetrics) {
        super();

        this.gameMetrics = gameMetrics;
        this.saveManager = new SaveManager();

        this._createSaveButton();
        this._updatePosition();

        window.addEventListener('resize', () => this._updatePosition());
    }

    _updatePosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Positionner le conteneur en bas à droite
        // On laisse une marge de 20px par rapport aux bords
        this.position.set(screenWidth - 20, screenHeight - 50);
    }

    _createSaveButton() {
        this.saveBtn = new Button({
            label: 'Sauvegarder',
            x: 0,
            y: 0,
            width: 160,
            onClick: () => this._onSave(),
            showMarker: false
        });

        this.saveBtn.x = -this.saveBtn.width / 2;
        
        this.addChild(this.saveBtn);
    }

    _onSave() {
        try {
            const binary = this.saveManager.serializegameMetrics(this.gameMetrics);
            const blob = new Blob([binary], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'savegame.daisyland';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Partie sauvegardée !');
        } catch (e) {
            console.error('Erreur lors de la sauvegarde :', e);
        }
    }
}
