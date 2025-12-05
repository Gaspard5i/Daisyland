/**
 * AudioManager.js
 * Gestionnaire audio pour la musique de fond en boucle
 */

class AudioManagerClass {
  constructor() {
    this.tracks = [];
    this.currentTrackIndex = 0;
    this.currentAudio = null;
    this.volume = 0.3; // Volume par défaut (30%)
    this.isPlaying = false;
    this.isMuted = false;
  }

  /**
   * Initialise le gestionnaire avec les pistes audio
   * @param {string[]} trackPaths - Chemins vers les fichiers audio
   */
  init(trackPaths) {
    this.tracks = trackPaths.map(path => {
      const audio = new Audio(path);
      audio.volume = this.volume;
      audio.addEventListener('ended', () => this.playNext());
      return audio;
    });
    
    console.log(`🎵 AudioManager initialisé avec ${this.tracks.length} pistes`);
  }

  /**
   * Démarre la lecture (nécessite une interaction utilisateur)
   */
  play() {
    if (this.tracks.length === 0) return;
    
    this.isPlaying = true;
    this.currentAudio = this.tracks[this.currentTrackIndex];
    
    this.currentAudio.play().catch(err => {
      console.log('🎵 En attente d\'interaction utilisateur pour démarrer l\'audio...');
    });
  }

  /**
   * Passe à la piste suivante
   */
  playNext() {
    if (!this.isPlaying) return;
    
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length;
    this.currentAudio = this.tracks[this.currentTrackIndex];
    
    console.log(`🎵 Piste ${this.currentTrackIndex + 1}/${this.tracks.length}`);
    
    this.currentAudio.play().catch(err => {
      console.warn('Erreur lecture audio:', err);
    });
  }

  /**
   * Met en pause
   */
  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Reprend la lecture
   */
  resume() {
    if (this.currentAudio && !this.isPlaying) {
      this.isPlaying = true;
      this.currentAudio.play();
    }
  }

  /**
   * Active/désactive le son
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.tracks.forEach(track => {
      track.muted = this.isMuted;
    });
    return this.isMuted;
  }

  /**
   * Définit le volume (0.0 à 1.0)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.tracks.forEach(track => {
      track.volume = this.volume;
    });
  }

  /**
   * Démarre la lecture au premier clic utilisateur
   */
  enableOnInteraction() {
    const startAudio = () => {
      if (!this.isPlaying) {
        this.play();
      }
      // Retirer les listeners après le premier clic
      document.removeEventListener('click', startAudio);
      document.removeEventListener('keydown', startAudio);
      document.removeEventListener('touchstart', startAudio);
    };

    document.addEventListener('click', startAudio);
    document.addEventListener('keydown', startAudio);
    document.addEventListener('touchstart', startAudio);
    
    console.log('🎵 Audio démarrera à la première interaction');
  }
}

// Singleton
export const AudioManager = new AudioManagerClass();
