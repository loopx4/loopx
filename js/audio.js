/**
 * LOOP X - Procedural Cinematic Audio Engine
 * Pure Web Audio API synthesis for high-end architectural sound design.
 * Zero external audio files required. Completely offline & responsive.
 */

export class LoopAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.analyser = null;
    this.subOsc = null;
    this.subGain = null;
    this.noiseNode = null;
    this.noiseFilter = null;
    this.shimmerOsc1 = null;
    this.shimmerOsc2 = null;
    this.shimmerGain = null;
    this.dataArray = new Uint8Array(32);
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master output with soft limiter/compressor
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.02, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain.connect(compressor);
      compressor.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // 1. Deep Sub-Bass Architectural Drone (48Hz with subtle low-pass)
      this.subOsc = this.ctx.createOscillator();
      this.subOsc.type = 'sine';
      this.subOsc.frequency.setValueAtTime(46.0, this.ctx.currentTime);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(110, this.ctx.currentTime);

      this.subGain = this.ctx.createGain();
      this.subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      this.subOsc.connect(subFilter);
      subFilter.connect(this.subGain);
      this.subGain.connect(this.masterGain);
      this.subOsc.start();

      // 2. Spatial Atmosphere Generator (Pink/Brown noise passed through resonant bandpass)
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.04;
        b6 = white * 0.115926;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      this.noiseFilter = this.ctx.createBiquadFilter();
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
      this.noiseFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      noiseSource.connect(this.noiseFilter);
      this.noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start();

      // 3. Shimmer Harmonic Layer (Resonant glass chord for Creative & Growth)
      this.shimmerOsc1 = this.ctx.createOscillator();
      this.shimmerOsc1.type = 'triangle';
      this.shimmerOsc1.frequency.setValueAtTime(277.18, this.ctx.currentTime); // C#4

      this.shimmerOsc2 = this.ctx.createOscillator();
      this.shimmerOsc2.type = 'sine';
      this.shimmerOsc2.frequency.setValueAtTime(415.30, this.ctx.currentTime); // G#4

      const shimmerFilter = this.ctx.createBiquadFilter();
      shimmerFilter.type = 'bandpass';
      shimmerFilter.frequency.setValueAtTime(600, this.ctx.currentTime);
      shimmerFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.shimmerGain = this.ctx.createGain();
      this.shimmerGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

      this.shimmerOsc1.connect(shimmerFilter);
      this.shimmerOsc2.connect(shimmerFilter);
      shimmerFilter.connect(this.shimmerGain);
      this.shimmerGain.connect(this.masterGain);
      this.shimmerOsc1.start();
      this.shimmerOsc2.start();

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio initialization deferred:', e);
    }
  }

  toggleMute() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      const targetGain = this.isMuted ? 0 : 0.65;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, now + 1.2);
    }
    return !this.isMuted;
  }

  updateStage(stageIndex, progress) {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Shift sub bass frequency subtly by stage
    // Stage 0: 44Hz (deep dormant)
    // Stage 1: 46Hz (ideas)
    // Stage 2: 52Hz (strategy precision)
    // Stage 3: 58Hz (creative tension)
    // Stage 4: 65Hz (growth expansion)
    // Stage 5: 48Hz (grounded authority)
    const baseFreqs = [44, 46, 52, 58, 65, 48];
    const targetFreq = baseFreqs[stageIndex] || 48;
    this.subOsc.frequency.setTargetAtTime(targetFreq, now, 0.4);

    // Filter sweep on noise for atmospheric breath
    const noiseFreq = 180 + progress * 260;
    this.noiseFilter.frequency.setTargetAtTime(noiseFreq, now, 0.3);

    // Shimmer intensity rises during Creative (2) and Growth (3, 4)
    let shimmerVal = 0.0;
    if (stageIndex === 3) {
      shimmerVal = 0.12; // Creative
    } else if (stageIndex === 4) {
      shimmerVal = 0.22; // Growth
    } else if (stageIndex === 5) {
      shimmerVal = 0.08; // Brand monolith
    }
    this.shimmerGain.gain.setTargetAtTime(shimmerVal, now, 0.5);
  }

  playTick() {
    if (!this.initialized || !this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (_) {}
  }

  getAudioLevels() {
    if (!this.analyser || this.isMuted) {
      return [0.08, 0.05, 0.12, 0.06];
    }
    this.analyser.getByteFrequencyData(this.dataArray);
    return [
      this.dataArray[1] / 255,
      this.dataArray[4] / 255,
      this.dataArray[8] / 255,
      this.dataArray[14] / 255,
    ];
  }
}
