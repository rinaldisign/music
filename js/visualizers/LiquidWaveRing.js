import * as THREE from 'three';
import { AB, BA, colorAt, clamp } from './helpers.js';
const S = 180, HN = 80, HB = 160;

export class LiquidWaveRing {
  constructor(cam) { this.cam = cam; this.g = new THREE.Group(); this.ph = 0; this.hd = 0; }
  build(c) {
    const NR = Math.round(c.ringCount); this.NR = NR; this.rs = []; this.lines = [];
    this.H = Array.from({ length: HN }, () => new Uint8Array(HB));
    this.mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .9, blending: AB, depthWrite: false });
    for (let i = 0; i < NR; i++) {
      const p = new Float32Array(S * 3), cl = new Float32Array(S * 3), f = 1 - i / NR * .7;
      for (let k = 0; k < S; k++) { const col = colorAt(k / S); cl.set([col.r * f, col.g * f, col.b * f], k * 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', BA(p, 1)); geo.setAttribute('color', BA(cl));
      const l = new THREE.LineLoop(geo, this.mat); l.frustumCulled = false; this.g.add(l); this.rs.push(p); this.lines.push(l);
    }
  }
  update(dt, A, c, f) {
    const m = f.mo, { NR, H, rs, lines } = this, amp = c.amplitude, wf = Math.round(c.waveFreq), sp = c.ringSpacing;
    this.ph += dt * m; const t = this.ph;
    this.g.rotation.y += dt * .15 * m;
    this.hd = (this.hd + 1) % HN; H[this.hd].set(A.spectrum.subarray(0, HB));
    for (let i = 0; i < NR; i++) {
      const h = H[(this.hd - (i * 2) % HN + HN) % HN], p = rs[i], r0 = 30 + i * 1.5 * sp, fd = 1 - i / NR * .5;
      for (let k = 0; k < S; k++) {
        const an = k / S * 6.283, u = Math.abs(k / S * 2 - 1), v = Math.min(1, h[Math.min(HB - 1, Math.floor(u * u * 110) + 1)] / 255 * A.gain) * m;
        const r = r0 + v * 14 * amp + Math.sin(an * wf + t * 1.2 + i * .25) * (1.5 + A.bass * 5 * m) * amp,
          y = (v * 26 * amp + Math.sin(an * Math.max(1, wf - 1) - t * 1.5 + i * .2) * (1 + A.mid * 6 * m) * amp) * fd;
        p[k * 3] = Math.cos(an) * r; p[k * 3 + 1] = y; p[k * 3 + 2] = Math.sin(an) * r;
      }
      lines[i].geometry.attributes.position.needsUpdate = true;
    }
    this.mat.opacity = clamp(.9 * f.glow);
    const outer = 30 + NR * 1.5 * sp + 20, dist = outer * 1.1, tl = c.tilt * Math.PI / 180;
    this.cam.position.set(0, Math.sin(tl) * dist + A.bass * 4 * m, Math.cos(tl) * dist); this.cam.lookAt(0, 4, 0);
  }
}
