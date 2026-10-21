import * as THREE from 'three';
import { createRenderer } from '../rendering/createRenderer.js';
import { QUALITY } from '../config/presets.js';
import { fx, disposeObj } from './helpers.js';
import { OrbitalEnergy } from './OrbitalEnergy.js';
import { NeuralNetwork } from './NeuralNetwork.js';
import { LiquidWaveRing } from './LiquidWaveRing.js';
const CLS = [OrbitalEnergy, NeuralNetwork, LiquidWaveRing];

// Satu renderer, satu loop, satu tema aktif.
export class VisualizerManager {
  constructor({ stage, analyzer, state, onStatus = () => {}, onQuality = () => {}, onFps = () => {}, toast = () => {} }) {
    Object.assign(this, { stage, analyzer, state, onStatus, onQuality, onFps, toast });
    this.cam = new THREE.PerspectiveCamera(60, 1, .1, 2000); this.scene = new THREE.Scene();
    this.theme = null; this.R = null; this.canvas = null; this.backend = ''; this.lost = false;
    this.last = performance.now() / 1e3; this.fn = 0; this.ft = 0; this.slow = 0; this.warm = 0; this.q = Promise.resolve();
  }
  get Q() { return QUALITY[this.state.quality] || QUALITY.balanced; }
  async start() {
    await this.useBackend(this.state.backend);
    new ResizeObserver(() => this.resize()).observe(this.stage);
    addEventListener('resize', () => this.resize());
  }
  useBackend(pref) { return (this.q = this.q.then(() => this._use(pref))); }
  async _use(pref) {
    const old = this.R, oc = this.canvas;
    if (old) old.setAnimationLoop(null);
    const r = await createRenderer(this.stage, pref, {
      onLost: c => { if (c === this.canvas) { this.lost = true; this.toast('Konteks grafis hilang, mencoba memulihkan…'); } },
      onRestored: c => { if (c === this.canvas) { this.lost = false; this.toast('Konteks grafis pulih.'); } }
    });
    this.canvas = r.canvas; this.R = r.renderer; this.backend = r.backend; this.lost = false;
    if (old) { try { old.dispose(); if (old.forceContextLoss) old.forceContextLoss(); } catch (e) {} }
    this.state.backend = r.backend;
    if (r.note) this.toast(r.note);
    this.resize();
    this.setTheme(this.state.theme);
    this.last = performance.now() / 1e3; this.warm = this.last + 3;
    this.R.setAnimationLoop(() => this.tick());
    this.onStatus({ backend: r.backend, note: r.note });
  }
  resize() {
    if (!this.R) return;
    const w = this.stage.clientWidth, h = this.stage.clientHeight; if (!w || !h) return;
    this.R.setPixelRatio(Math.min(devicePixelRatio || 1, this.Q.pr)); this.R.setSize(w, h, false);
    this.cam.aspect = w / h; this.cam.updateProjectionMatrix();
  }
  setTheme(i) {
    if (this.theme) { this.scene.remove(this.theme.g); disposeObj(this.theme.g); }
    const s = this.state; s.theme = i; fx.custom = s.customColor ? s.color : null;
    this.theme = new CLS[i](this.cam); this.theme.build(s.params[i], this.Q.qs); this.scene.add(this.theme.g);
  }
  rebuild(now) { clearTimeout(this.rt); if (now) this.setTheme(this.state.theme); else this.rt = setTimeout(() => this.setTheme(this.state.theme), 150); }
  applyQuality() { this.resize(); this.rebuild(true); this.warm = performance.now() / 1e3 + 3; }
  tick() {
    const now = performance.now() / 1e3, raw = now - this.last, dt = Math.min(raw, .05); this.last = now;
    const s = this.state; if (s.paused || this.lost || !this.theme) return;
    this.analyzer.update(dt);
    const rd = s.reduced ? .25 : 1;
    this.theme.update(dt, this.analyzer, s.params[s.theme], { mo: s.motion * rd, glow: s.glow * (s.reduced ? .7 : 1) });
    this.R.render(this.scene, this.cam);
    this.fn++; this.ft += raw;
    if (this.ft >= 2) {
      const fps = this.fn / this.ft; this.fn = 0; this.ft = 0; this.onFps(fps);
      if (now > this.warm && s.adaptive && s.quality !== 'low') {
        this.slow = fps < 28 ? this.slow + 1 : 0;
        if (this.slow >= 2) { this.slow = 0; s.quality = s.quality === 'high' ? 'balanced' : 'low'; this.onQuality(s.quality); this.toast('FPS rendah — kualitas diturunkan ke ' + this.Q.label + '.'); this.applyQuality(); }
      }
    }
  }
  dispose() {
    if (this.R) { this.R.setAnimationLoop(null); this.R.dispose(); }
    if (this.theme) disposeObj(this.theme.g);
  }
}
