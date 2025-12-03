// ===== AUDIO PLAYER SYSTEM =====
class AudioPlayer {
    constructor() {
        this.audio = document.getElementById('bg-music');
        this.playBtn = document.getElementById('play-btn');
        this.muteBtn = document.getElementById('mute-btn');
        this.volumeSlider = document.getElementById('volume-slider');

        if (!this.audio || !this.playBtn) return;
        this.init();
    }

    init() {
        this.audio.volume = 0.3;
        this.volumeSlider.value = 0.3;

        this.setupEventListeners();
        this.tryAutoplay();
    }

    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));

        this.audio.addEventListener('play', () => this.updatePlayButton(true));
        this.audio.addEventListener('pause', () => this.updatePlayButton(false));
        this.audio.addEventListener('volumechange', () => this.updateVolumeUI());

        document.addEventListener('click', () => {
            if (this.audio.paused) this.tryAutoplay();
        }, { once: true });
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play().catch(() => {});
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
        this.playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }

    updateMuteButton() {
        if (this.audio.muted || this.audio.volume === 0) {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    updateVolumeUI() {
        this.volumeSlider.value = this.audio.volume;
        this.updateMuteButton();
    }

    tryAutoplay() {
        this.audio.play().catch(() => {
            this.updatePlayButton(false);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AudioPlayer();
});
