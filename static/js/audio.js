class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.soundParameters = {
            'shoot': { envelope: [0, 0.1, 0.2, 0], duration: 0.1, type: 'square' },
            'explosion': { envelope: [0, 0.1, 0.2, 0], duration: 0.3, type: 'sawtooth' },
            'playerDeath': { envelope: [0, 0.2, 0.3, 0], duration: 0.4, type: 'triangle' }
        };
    }

    async initialize() {
        // No need to pre-create sounds, we'll create them on demand
    }

    createSound(type) {
        const params = this.soundParameters[type];
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = params.type;
        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        const startTime = this.context.currentTime;
        params.envelope.forEach((value, index) => {
            gainNode.gain.setValueAtTime(
                value,
                startTime + (params.duration * (index / (params.envelope.length - 1)))
            );
        });

        return { oscillator, startTime, duration: params.duration };
    }

    playSound(name) {
        if (this.soundParameters[name]) {
            const sound = this.createSound(name);
            sound.oscillator.start(sound.startTime);
            sound.oscillator.stop(sound.startTime + sound.duration);
        }
    }
}