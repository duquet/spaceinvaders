class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.initialize();
    }

    async initialize() {
        await this.createSound('shoot', [0, 0.1, 0.2, 0], 0.1, 'square');
        await this.createSound('explosion', [0, 0.1, 0.2, 0], 0.3, 'sawtooth');
        await this.createSound('playerDeath', [0, 0.2, 0.3, 0], 0.4, 'triangle');
    }

    async createSound(name, envelope, duration, type) {
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = type;
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);
        
        const startTime = this.context.currentTime;
        envelope.forEach((value, index) => {
            gainNode.gain.setValueAtTime(value, startTime + (duration * (index / (envelope.length - 1))));
        });
        
        this.sounds[name] = {
            play: () => {
                oscillator.start(startTime);
                oscillator.stop(startTime + duration);
            }
        };
    }

    playSound(name) {
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }
}
