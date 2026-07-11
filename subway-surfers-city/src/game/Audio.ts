export class AudioController {
    private ctx: AudioContext | null = null;
    private musicNode: AudioWorkletNode | ScriptProcessorNode | null = null; // We will use a scheduler instead for reliability
    private isMusicEnabled = true;
    private isSfxEnabled = true;
    
    // Music state
    private isMusicPlaying = false;
    private musicIntervalId: any = null;
    private bpm = 120;
    private beatDuration = 60 / this.bpm;
    private subBeatDuration = this.beatDuration / 4; // 16th notes
    private currentTick = 0;
    private lastScheduleTime = 0;

    constructor() {
        // AudioContext is initialized on first user interaction
    }

    private initContext() {
        if (!this.ctx) {
            // @ts-ignore
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    public setMusicEnabled(enabled: boolean) {
        this.isMusicEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        } else if (this.isMusicPlaying) {
            this.startMusic();
        }
    }

    public setSfxEnabled(enabled: boolean) {
        this.isSfxEnabled = enabled;
    }

    public toggleMusic() {
        this.setMusicEnabled(!this.isMusicEnabled);
        return this.isMusicEnabled;
    }

    public toggleSfx() {
        this.setSfxEnabled(!this.isSfxEnabled);
        return this.isSfxEnabled;
    }

    public start() {
        this.initContext();
        if (this.isMusicEnabled) {
            this.startMusic();
        }
    }

    // Synthesize Sound Effects
    public playCoin() {
        if (!this.isSfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Quick two-note synth bell
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
        
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now);
        osc.stop(now + 0.4);
    }

    public playJump() {
        if (!this.isSfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.15);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    public playSlide() {
        if (!this.isSfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // Slide sound is simulated with filtered noise-like square sweep
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(5, now);
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    public playBeep() {
        if (!this.isSfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    public playCrash() {
        if (!this.isSfxEnabled) return;
        this.initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        
        // 1. Bass drum boom
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.3);
        
        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);

        // 2. White noise burst
        const bufferSize = this.ctx.sampleRate * 0.4; // 0.4s
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        
        noise.start(now);
        noise.stop(now + 0.4);
    }

    // Procedural Music Scheduler
    private startMusic() {
        if (this.isMusicPlaying) return;
        this.isMusicPlaying = true;
        this.initContext();
        if (!this.ctx) return;
        
        this.currentTick = 0;
        this.lastScheduleTime = this.ctx.currentTime;
        
        // Check and queue notes every 50ms
        this.musicIntervalId = setInterval(() => {
            this.scheduleNextNotes();
        }, 50);
    }

    private stopMusic() {
        this.isMusicPlaying = false;
        if (this.musicIntervalId) {
            clearInterval(this.musicIntervalId);
            this.musicIntervalId = null;
        }
    }

    private scheduleNextNotes() {
        if (!this.ctx || !this.isMusicPlaying) return;
        
        const scheduleAheadTime = 0.15; // Schedule 150ms in advance
        const lookaheadTime = this.ctx.currentTime + scheduleAheadTime;
        
        while (this.lastScheduleTime < lookaheadTime) {
            this.playStep(this.currentTick, this.lastScheduleTime);
            
            // Advance state
            this.currentTick = (this.currentTick + 1) % 32; // 32 16th notes per cycle (2 bars)
            this.lastScheduleTime += this.subBeatDuration;
        }
    }

    private playStep(tick: number, time: number) {
        if (!this.ctx || !this.isMusicEnabled) return;

        // 1. Bassline (Synthwave rolling eighth-note bassline)
        // Plays on eighth notes: ticks 0, 2, 4, 6...
        if (tick % 2 === 0) {
            // Bassline chords progression (Am, F, C, G)
            let rootFreq = 55.0; // A1
            if (tick >= 8 && tick < 16) {
                rootFreq = 43.65; // F1
            } else if (tick >= 16 && tick < 24) {
                rootFreq = 65.41; // C2
            } else if (tick >= 24) {
                rootFreq = 49.00; // G1
            }

            // Rolling eighth pattern rhythm (Root, Octave, Root, Octave)
            const isOctave = (tick % 4 === 2);
            const freq = isOctave ? rootFreq * 2 : rootFreq;
            this.synthesizeBassNote(freq, time, this.subBeatDuration * 1.8);
        }

        // 2. Drums
        // Kick on beats 1, 2, 3, 4 (ticks 0, 8, 16, 24)
        if (tick % 8 === 0) {
            this.synthesizeKick(time);
        }
        
        // Snare on beats 2 and 4 (ticks 8, 24)
        if (tick === 8 || tick === 24) {
            this.synthesizeSnare(time);
        }

        // Closed Hi-hat on off-beats (ticks 4, 12, 20, 28)
        if (tick % 4 === 2) {
            this.synthesizeHihat(time);
        }

        // 3. Arpeggio / Melody (Simple retro melody)
        // Plays on some 16th ticks for variety
        const melodyPattern = [
            0, -1, 4, -1, 7, -1, 12, -1, // Bar 1
            11, -1, 7, -1, 4, -1, 7, -1, // Bar 2
            9, -1, 5, -1, 9, -1, 12, -1, // Bar 3
            14, -1, 11, -1, 7, -1, 11, -1 // Bar 4
        ];
        
        const noteIndex = melodyPattern[tick];
        if (noteIndex !== -1) {
            // Map index to A minor frequencies
            const scale = [55.00, 61.74, 65.41, 73.42, 82.41, 87.31, 98.00]; // A, B, C, D, E, F, G
            // Root pitch base for lead is A4 (440Hz)
            const am4Scale = [440.0, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.0];
            
            let freq = am4Scale[noteIndex % am4Scale.length];
            if (noteIndex >= am4Scale.length) freq *= 2;
            
            // Adjust melody key based on bass chord
            if (tick >= 8 && tick < 16) {
                // F Major context (shift G->A, E->F, C->C)
                freq *= 0.95; // rough translation
            } else if (tick >= 16 && tick < 24) {
                // C Major context
                freq *= 1.05;
            } else if (tick >= 24) {
                // G Major context
                freq *= 0.9;
            }

            this.synthesizeLeadNote(freq, time, this.subBeatDuration * 0.9);
        }
    }

    private synthesizeBassNote(freq: number, time: number, duration: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, time);
        filter.frequency.exponentialRampToValueAtTime(90, time + duration);

        gain.gain.setValueAtTime(0.0, time);
        gain.gain.linearRampToValueAtTime(0.06, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
    }

    private synthesizeLeadNote(freq: number, time: number, duration: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        
        // Add a slight vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 6; // 6 Hz vibrato
        lfoGain.gain.value = 5; // Pitch variation
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start(time);
        lfo.stop(time + duration);

        gain.gain.setValueAtTime(0.0, time);
        gain.gain.linearRampToValueAtTime(0.035, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
    }

    private synthesizeKick(time: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, time);
        osc.frequency.exponentialRampToValueAtTime(35, time + 0.12);

        gain.gain.setValueAtTime(0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.15);
    }

    private synthesizeSnare(time: number) {
        if (!this.ctx) return;
        
        const now = time;
        
        // Snare Tone
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
        oscGain.gain.setValueAtTime(0.07, now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
        osc.connect(oscGain);
        oscGain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);

        // Snare Noise Crackle
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.06, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.15);
    }

    private synthesizeHihat(time: number) {
        if (!this.ctx) return;
        
        const bufferSize = this.ctx.sampleRate * 0.04; // Very short
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, time);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.02, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.035);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(time);
        noise.stop(time + 0.04);
    }
}
