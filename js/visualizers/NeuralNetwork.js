import * as THREE from 'three';
import { rnd, AB, PM, BA, colorAt, clamp } from './helpers.js';
const PN = ['#ffffff', '#ffb3d1', '#d6f5b8', '#b8e6ff', '#ffd6a8', '#f7a6c8'];

export class NeuralNetwork {
  constructor(cam) { this.cam = cam; this.g = new THREE.Group(); this.ph = 0; this.ct = 0; }
  build(c, qs) {
    const g = this.g, N = Math.max(60, Math.round(c.nodeCount * qs)), K = Math.min(Math.round(c.clusterCount), N - 1), gs = () => rnd() + rnd() + rnd() - 1.5;
    const base = new Float32Array(N * 3), ph = new Float32Array(N * 3), cur = new Float32Array(N * 3), nc = new Float32Array(N * 3), cid = [], cen = [];
    for (let k = 0; k < K; k++) cen.push([(rnd() - .5) * 260, (rnd() - .5) * 170, (rnd() - .5) * 220]);
    for (let i = 0; i < N; i++) {
      const k = i < K ? i : Math.floor(rnd() * K), s = i < K ? 0 : 42; cid[i] = k;
      base.set([cen[k][0] + gs() * s, cen[k][1] + gs() * s, cen[k][2] + gs() * s], i * 3); ph.set([rnd() * 6.28, rnd() * 6.28, rnd() * 6.28], i * 3);
      const col = i < K ? new THREE.Color(0xffffff) : colorAt(rnd(), PN); nc.set([col.r, col.g, col.b], i * 3);
    }
    const E = [], sc = N / 380, d = c.connectionDensity, rn = () => K + Math.floor(rnd() * (N - K));
    for (let i = K; i < N; i++) E.push(i, cid[i]);
    for (let j = 0, n = Math.round(70 * d * sc); j < n; j++) E.push(Math.floor(rnd() * K), rn());
    for (let j = 0, n = Math.round(40 * d * sc); j < n; j++) E.push(rn(), rn());
    const lp = new Float32Array(E.length * 3), lc = new Float32Array(E.length * 3);
    E.forEach((n, v) => lc.set([nc[n * 3] * .8, nc[n * 3 + 1] * .8, nc[n * 3 + 2] * .8], v * 3));
    const lg = new THREE.BufferGeometry(); lg.setAttribute('position', BA(lp, 1)); lg.setAttribute('color', BA(lc));
    this.lm = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: .3, blending: AB, depthWrite: false })); g.add(this.lm);
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', BA(cur, 1)); ng.setAttribute('color', BA(nc)); this.np = new THREE.Points(ng, PM(3.2)); g.add(this.np);
    const hp = new Float32Array(K * 3), hg = new THREE.BufferGeometry(); hg.setAttribute('position', BA(hp, 1)); hg.setAttribute('color', BA(nc.slice(0, K * 3)));
    this.hn = new THREE.Points(hg, PM(16)); g.add(this.hn);
    Object.assign(this, { N, K, base, ph3: ph, cur, E, lp, hp, ng, hg, lg });
  }
  update(dt, A, c, f) {
    const m = f.mo, { N, K, base, ph3: ph, cur, E, lp, hp } = this;
    this.ph += dt * c.driftSpeed * m; this.ct += dt * m;
    const t = this.ph, ex = 1 + A.bass * .12 * m, dr = 3 + A.mid * 5 * m;
    for (let i = 0; i < N; i++) {
      const j = i * 3;
      cur[j] = base[j] * ex + Math.sin(t * .4 + ph[j]) * dr; cur[j + 1] = base[j + 1] * ex + Math.sin(t * .35 + ph[j + 1]) * dr; cur[j + 2] = base[j + 2] * ex + Math.sin(t * .3 + ph[j + 2]) * dr;
    }
    hp.set(cur.subarray(0, K * 3));
    for (let v = 0; v < E.length; v++) { const n = E[v] * 3, o = v * 3; lp[o] = cur[n]; lp[o + 1] = cur[n + 1]; lp[o + 2] = cur[n + 2]; }
    this.ng.attributes.position.needsUpdate = this.hg.attributes.position.needsUpdate = this.lg.attributes.position.needsUpdate = true;
    const gl = Math.sqrt(f.glow);
    this.hn.material.size = (14 + A.bass * 18 * m) * c.nodeGlow * gl; this.np.material.size = (3 + A.treble * 3 * m) * gl;
    this.lm.material.opacity = clamp((.22 + A.mid * .5 * m) * f.glow);
    const a = this.ct * .05; this.cam.position.set(Math.cos(a) * 110, Math.sin(this.ct * .07) * 30, Math.sin(a) * 110); this.cam.lookAt(0, 0, 0);
  }
}
