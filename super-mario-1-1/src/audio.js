// Web Audio API Synthesizer for Retro NES Sound Effects and BGM
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.3; // Default 30% volume
    
    // Music scheduler variables
    this.bgmSequence = null;
    this.bgmTimer = null;
    this.nextNoteTime = 0;
    this.noteIndex = 0;
    this.isPlayingBgm = false;
    
    // Mario Overworld Theme (Pitch & Duration in 16th notes)
    // Durations: 1 = 16th note, 2 = 8th note, 4 = quarter note, 8 = half note, etc.
    // 120 BPM means a 16th note is ~125ms
    this.tempo = 120;
    this.noteLength = 60 / this.tempo / 4; // duration of a 16th note in seconds (~125ms)
    
    this.initTheme();
  }

  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.muted ? 0 : this.volume;
    this.masterGain.connect(this.ctx.destination);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && !this.muted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  resumeContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Frequencies for Mario notes
  getFreq(note) {
    const freqs = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
      'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
    };
    return freqs[note] || 0;
  }

  initTheme() {
    // Sequence format: [noteName, durationIn16ths]
    // 'r' represents a rest.
    this.bgmSequence = [
      // Intro
      ['E5', 2], ['E5', 2], ['r', 2], ['E5', 2], ['r', 2], ['C5', 2], ['E5', 2], ['r', 2],
      ['G5', 2], ['r', 6], ['G4', 2], ['r', 6],
      
      // Part 1
      ['C5', 3], ['r', 1], ['G4', 3], ['r', 1], ['E4', 3], ['r', 1],
      ['A4', 2], ['r', 1], ['B4', 2], ['r', 1], ['A#4', 1], ['A4', 2],
      ['G4', 2], ['E5', 2], ['G5', 2], ['A5', 2], ['r', 1], ['F5', 1], ['G5', 2],
      ['r', 1], ['E5', 2], ['r', 1], ['C5', 1], ['D5', 1], ['B4', 3], ['r', 1],

      // Part 2
      ['C5', 3], ['r', 1], ['G4', 3], ['r', 1], ['E4', 3], ['r', 1],
      ['A4', 2], ['r', 1], ['B4', 2], ['r', 1], ['A#4', 1], ['A4', 2],
      ['G4', 2], ['E5', 2], ['G5', 2], ['A5', 2], ['r', 1], ['F5', 1], ['G5', 2],
      ['r', 1], ['E5', 2], ['r', 1], ['C5', 1], ['D5', 1], ['B4', 3], ['r', 1],
      
      // Part 3 (Bridge)
      ['r', 2], ['G5', 1], ['F#5', 1], ['F5', 1], ['D#5', 2], ['E5', 2],
      ['r', 1], ['G#4', 1], ['A4', 1], ['C5', 2], ['r', 1], ['A4', 1], ['C5', 1], ['D5', 1],
      ['r', 2], ['G5', 1], ['F#5', 1], ['F5', 1], ['D#5', 2], ['E5', 2],
      ['r', 1], ['C6', 2], ['r', 1], ['C6', 1], ['C6', 2], ['r', 4],
      
      ['r', 2], ['G5', 1], ['F#5', 1], ['F5', 1], ['D#5', 2], ['E5', 2],
      ['r', 1], ['G#4', 1], ['A4', 1], ['C5', 2], ['r', 1], ['A4', 1], ['C5', 1], ['D5', 1],
      ['r', 2], ['D#5', 2], ['r', 1], ['D5', 2], ['r', 1],
      ['C5', 4], ['r', 4],
      
      // Part 4
      ['C5', 2], ['C5', 2], ['r', 1], ['C5', 2], ['r', 1], ['C5', 1], ['D5', 2],
      ['E5', 2], ['C5', 2], ['r', 1], ['A4', 2], ['G4', 3], ['r', 1],
      
      ['C5', 2], ['C5', 2], ['r', 1], ['C5', 2], ['r', 1], ['C5', 1], ['D5', 1], ['E5', 1],
      ['r', 4],
      
      ['C5', 2], ['C5', 2], ['r', 1], ['C5', 2], ['r', 1], ['C5', 1], ['D5', 2],
      ['E5', 2], ['C5', 2], ['r', 1], ['A4', 2], ['G4', 3]
    ];
  }

  // Play a simple custom synth tone
  playTone(freq, type, duration, startTime, startVol = 0.1, endVol = 0.001) {
    if (!this.ctx) return null;
    
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = type; // 'square', 'triangle', 'sawtooth', 'sine'
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(startVol, startTime);
    gainNode.gain.exponentialRampToValueAtTime(endVol, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
    
    return osc;
  }

  // Sound Effects
  playJump() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Jump sound: quick upward frequency sweep
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'triangle'; // Tri wave represents Mario's low/warm jump sound
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.17);
    
    gainNode.gain.setValueAtTime(0.18, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.17);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.18);
  }

  playCoin() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Coin sound: Two short square-wave tones (B5 then E6)
    // Pulse-like sound (we simulate using square osc)
    this.playTone(this.getFreq('B5'), 'square', 0.07, now, 0.15, 0.05);
    this.playTone(this.getFreq('E6'), 'square', 0.25, now + 0.07, 0.12, 0.001);
  }

  playStomp() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Stomp: quick downwards pitch glide on square wave (noise-like)
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.1);
  }

  playBreak() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Brick Break: short noise burst (we simulate with low frequency sawtooth)
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.setValueAtTime(40, now + 0.05);
    osc.frequency.setValueAtTime(20, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.25, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playPowerupReveal() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Spawning powerup: rapid rising arpeggio
    const notes = ['G4', 'C5', 'E5', 'G5', 'C6', 'E6'];
    const dur = 0.05;
    for (let i = 0; i < notes.length; i++) {
      this.playTone(this.getFreq(notes[i]), 'triangle', dur * 2, now + i * dur, 0.15, 0.02);
    }
  }

  playPowerupCollect() {
    this.init();
    this.resumeContext();
    const now = this.ctx.currentTime;
    
    // Collect mushroom: G4 C5 G5 E5 G5 C6
    const notes = ['G4', 'C5', 'G5', 'E5', 'G5', 'C6'];
    const dur = 0.07;
    for (let i = 0; i < notes.length; i++) {
      this.playTone(this.getFreq(notes[i]), 'square', dur * 1.5, now + i * dur, 0.12, 0.02);
    }
  }

  playDeath() {
    this.init();
    this.resumeContext();
    this.stopBgm();
    const now = this.ctx.currentTime;
    
    // Death tune: B5 F6 rest F6 F6 E6 D6 C6 rest G5 E5 rest C5
    // Play on square wave
    const deathNotes = [
      ['B5', 1], ['F6', 1], ['r', 1], ['F6', 1], 
      ['F6', 1], ['E6', 1], ['D6', 1], ['C6', 1], 
      ['r', 1], ['G5', 1], ['E5', 1], ['r', 1], ['C5', 2]
    ];
    
    let playTime = now;
    deathNotes.forEach(([note, duration]) => {
      const freq = this.getFreq(note);
      const timeDur = duration * 0.11;
      if (freq > 0) {
        this.playTone(freq, 'square', timeDur, playTime, 0.15, 0.01);
      }
      playTime += timeDur;
    });
  }

  playFlagpole() {
    this.init();
    this.resumeContext();
    this.stopBgm();
    const now = this.ctx.currentTime;
    
    // Flagpole slide: sliding pitch down
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(100, now + 1.0);
    
    gainNode.gain.setValueAtTime(0.12, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 1.0);
    
    // Clear theme BGM starts playing 1 second after flag slide starts
    setTimeout(() => {
      this.playLevelClearBgm();
    }, 1000);
  }

  playLevelClearBgm() {
    const now = this.ctx.currentTime;
    // G4 C5 E5 G5 C6 E6 G6 G6 E6 C6 C5 E5 G5 C6 C6 C6 C6
    const clearNotes = [
      ['G4', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['E6', 1], ['G6', 2], ['G6', 2],
      ['E6', 1], ['C6', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['C6', 1], ['C6', 2], ['C6', 2],
      ['r', 1], ['A#5', 1], ['A5', 1], ['G5', 1], ['F5', 1], ['G5', 1], ['C6', 4]
    ];
    
    let playTime = now;
    clearNotes.forEach(([note, duration]) => {
      const freq = this.getFreq(note);
      const timeDur = duration * 0.12;
      if (freq > 0) {
        this.playTone(freq, 'square', timeDur, playTime, 0.15, 0.01);
      }
      playTime += timeDur;
    });
  }

  // Background Music Loop Scheduler
  startBgm() {
    this.init();
    this.resumeContext();
    if (this.isPlayingBgm) return;
    
    this.isPlayingBgm = true;
    this.noteIndex = 0;
    this.nextNoteTime = this.ctx.currentTime;
    
    this.schedulerLoop();
  }

  stopBgm() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  schedulerLoop() {
    if (!this.isPlayingBgm) return;
    
    const lookAhead = 0.1; // Check notes to schedule for the next 100ms
    const scheduleInterval = 30; // Run every 30ms
    
    const now = this.ctx.currentTime;
    
    while (this.nextNoteTime < now + lookAhead) {
      this.scheduleNote(this.noteIndex, this.nextNoteTime);
      
      // Advance note
      const currentNote = this.bgmSequence[this.noteIndex];
      const duration = currentNote[1] * this.noteLength;
      
      this.nextNoteTime += duration;
      this.noteIndex = (this.noteIndex + 1) % this.bgmSequence.length;
    }
    
    this.bgmTimer = setTimeout(() => this.schedulerLoop(), scheduleInterval);
  }

  scheduleNote(index, time) {
    const note = this.bgmSequence[index];
    const noteName = note[0];
    const duration = note[1] * this.noteLength;
    const freq = this.getFreq(noteName);
    
    if (freq > 0 && !this.muted) {
      // Use square wave oscillator with short staccato envelope
      // Pulse 1 channel style
      this.playTone(freq, 'square', duration * 0.9, time, 0.05, 0.005);
    }
  }
}

export const audio = new AudioEngine();
