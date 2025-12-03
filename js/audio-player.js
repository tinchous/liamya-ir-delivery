// ===== AUDIO PLAYER SYSTEM =====
class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('bg-music');
        this.playBtn = document.getElementById('play-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.volumeSlider = document.getElementById('volume-slider');

        if (!this.audio || !this.playBtn) {
            console.warn('⚠️ Audio player elements not found');
            return;
        }

        this.init();
    }

    init() {
        // Set default volume
        this.audio.volume = 0.3;
        if (this.volumeSlider) {
            this.volumeSlider.value = 0.3;
        }

        // Event listeners
        this.setupEventListeners();

        // Try autoplay
        this.tryAutoplay();
    }

    setupEventListeners() {
        // Play/Pause button
        this.playBtn.addEventListener('click', () => this.togglePlay());

        // Mute button
        if (this.muteBtn) {
            this.muteBtn.addEventListener('click', () => this.toggleMute());
        }

        // Volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
        }

        // Update UI on audio events
        this.audio.addEventListener('play', () => this.updatePlayButton(true));
        this.audio.addEventListener('pause', () => this.updatePlayButton(false));
        this.audio.addEventListener('volumechange', () => this.updateVolumeUI());

        // User interaction for autoplay
        document.addEventListener('click', () => {
            if (this.audio.paused) {
                this.tryAutoplay();
            }
        }, { once: true });
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play().catch(e => {
                console.log("Play prevented:", e);
            });
        } else {
            this.audio.pause();
        }
    }

    toggleMute() {
        this.audio.muted = !this.audio.muted;
        this.updateMuteButton();
    }

    setVolume(value) {
        this.audio.volume = value;
        this.audio.muted = false;
        this.updateMuteButton();
    }

    updatePlayButton(isPlaying) {
        if (isPlaying) {
            this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.playBtn.title = 'Pausar';
        } else {
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.playBtn.title = 'Reproducir';
        }
    }

    updateMuteButton() {
        if (!this.muteBtn) return;

        if (this.audio.muted || this.audio.volume === 0) {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.muteBtn.title = 'Activar sonido';
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.muteBtn.title = 'Silenciar';
        }
    }

    updateVolumeUI() {
        if (this.volumeSlider) {
            this.volumeSlider.value = this.audio.volume;
        }
        this.updateMuteButton();
    }

    tryAutoplay() {
        // Modern browsers require user interaction for autoplay
        const playPromise = this.audio.play();

        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('🎵 Audio playing');
            }).catch(error => {
                console.log('🔇 Autoplay prevented, waiting for user interaction');
                // Show play button as paused
                this.updatePlayButton(false);
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});
