// Advanced Sound System
class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEnabled') !== 'false';
        this.volume = parseFloat(localStorage.getItem('soundVolume')) || 0.3;
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
            this.addSoundControls();
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    createSounds() {
        // Create different sound frequencies for different actions
        this.sounds = {
            click: () => this.createTone(800, 0.1, 'sine'),
            success: () => this.createChord([523, 659, 784], 0.3, 'sine'),
            error: () => this.createTone(200, 0.4, 'sawtooth'),
            notification: () => this.createSequence([440, 554, 659], 0.15),
            hover: () => this.createTone(1000, 0.05, 'sine'),
            whoosh: () => this.createSweep(200, 800, 0.2),
            pop: () => this.createPop(),
            chime: () => this.createChime(),
            typing: () => this.createTone(600 + Math.random() * 200, 0.05, 'square')
        };
    }

    createTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createChord(frequencies, duration, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, duration, type);
            }, index * 50);
        });
    }

    createSequence(frequencies, duration) {
        if (!this.enabled || !this.audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, duration, 'sine');
            }, index * duration * 1000);
        });
    }

    createSweep(startFreq, endFreq, duration) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createPop() {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(this.volume * 0.8, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    createChime() {
        if (!this.enabled || !this.audioContext) return;

        const frequencies = [523, 659, 784, 1047];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, 0.5, 'sine');
            }, index * 100);
        });
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }

    addSoundControls() {
        // Create sound control panel
        const controlPanel = document.createElement('div');
        controlPanel.className = 'sound-controls';
        controlPanel.innerHTML = `
            <style>
                .sound-controls {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 10px;
                    border-radius: 10px;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12px;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                    opacity: 0.7;
                }
                .sound-controls:hover {
                    opacity: 1;
                    transform: scale(1.05);
                }
                .sound-toggle {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 5px;
                    border-radius: 5px;
                    transition: all 0.2s ease;
                }
                .sound-toggle:hover {
                    background: rgba(255,255,255,0.2);
                }
                .volume-slider {
                    width: 60px;
                    height: 4px;
                    background: #333;
                    border-radius: 2px;
                    outline: none;
                    cursor: pointer;
                }
                .volume-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    background: #4ecdc4;
                    border-radius: 50%;
                    cursor: pointer;
                }
            </style>
            <button class="sound-toggle" onclick="soundSystem.toggle()">
                <i class="fas fa-${this.enabled ? 'volume-up' : 'volume-mute'}"></i>
            </button>
            <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="${this.volume}" 
                   onchange="soundSystem.setVolume(this.value)">
            <span>🔊</span>
        `;
        document.body.appendChild(controlPanel);
    }

    toggle() {
        this.enabled = !this.enabled;
        localStorage.setItem('soundEnabled', this.enabled);
        
        const icon = document.querySelector('.sound-toggle i');
        icon.className = `fas fa-${this.enabled ? 'volume-up' : 'volume-mute'}`;
        
        if (this.enabled) {
            this.play('chime');
        }
    }

    setVolume(value) {
        this.volume = parseFloat(value);
        localStorage.setItem('soundVolume', this.volume);
        this.play('click');
    }

    bindEvents() {
        // Add sound effects to common interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, input[type="submit"], a')) {
                this.play('click');
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .btn, input[type="submit"], a, .product-card')) {
                this.play('hover');
            }
        });

        // Add typing sounds to inputs
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('input[type="text"], input[type="email"], input[type="password"], textarea')) {
                this.play('typing');
            }
        });

        // Add whoosh sound to page transitions
        document.addEventListener('beforeunload', () => {
            this.play('whoosh');
        });
    }
}

// Initialize sound system
document.addEventListener('DOMContentLoaded', () => {
    window.soundSystem = new SoundSystem();
    
    // Bind events after a short delay to ensure all elements are loaded
    setTimeout(() => {
        window.soundSystem.bindEvents();
    }, 1000);
    
    // Override notification sounds
    if (window.notify) {
        const originalSuccess = window.notify.success;
        const originalError = window.notify.error;
        
        window.notify.success = function(...args) {
            window.soundSystem.play('success');
            return originalSuccess.apply(this, args);
        };
        
        window.notify.error = function(...args) {
            window.soundSystem.play('error');
            return originalError.apply(this, args);
        };
    }
});