// Layanan audio bersama: satu AudioContext + satu MediaElementSource seumur aplikasi.
export class AudioAnalyzer {
  constructor(cfg) {
    this.cfg = cfg; this.ctx = null; this.an = null; this.playing = false; this.error = null;
    this.bass = 0; this.mid = 0; this.treble = 0; this.energy = 0; this.gain = 1;
    this.spectrum = new Uint8Array(512); this.waveform = new Uint8Array(1024).fill(128);
    this.r = [[0, 6], [6, 90], [90, 330]];
  }
  attach(el) {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC(); this.an = this.ctx.createAnalyser();
      this.an.fftSize = 1024; this.an.smoothingTimeConstant = .6;
      this.ctx.createMediaElementSource(el).connect(this.an); this.an.connect(this.ctx.destination);
      this.spectrum = new Uint8Array(this.an.frequencyBinCount); this.waveform = new Uint8Array(this.an.fftSize).fill(128);
      const f = this.ctx.sampleRate / this.an.fftSize, n = this.an.frequencyBinCount - 1;
      const b = hz => Math.max(0, Math.min(n, Math.round(hz / f)));
      this.r = [[b(20), Math.max(b(250), b(20) + 1)], [b(250), b(4000)], [b(4000), b(14000)]];
    } catch (e) { this.error = e; this.ctx = this.an = null; }
  }
  resume() { return this.ctx && this.ctx.state === 'suspended' ? this.ctx.resume().catch(() => {}) : Promise.resolve(); }
  avg(a, z) { let s = 0; for (let i = a; i < z; i++) s += this.spectrum[i]; return s / Math.max(1, z - a) / 255; }
  update() {
    const c = this.cfg, g = this.gain = c.sensitivity;
    if (this.an && this.playing) { this.an.getByteFrequencyData(this.spectrum); this.an.getByteTimeDomainData(this.waveform); }
    else { for (let i = 0; i < this.spectrum.length; i++) this.spectrum[i] *= .9; this.waveform.fill(128); }
    const r = this.r, v = [
      Math.min(1, Math.pow(this.avg(r[0][0], r[0][1]), 1.6) * 1.3 * g),
      Math.min(1, this.avg(r[1][0], r[1][1]) * 1.6 * g),
      Math.min(1, this.avg(r[2][0], r[2][1]) * 3.5 * g)];
    const rel = .04 + (1 - c.smoothing) * .3;
    ['bass', 'mid', 'treble'].forEach((k, i) => { this[k] += (v[i] - this[k]) * (v[i] > this[k] ? .5 : rel); });
    this.energy = (this.bass + this.mid + this.treble) / 3;
  }
}
