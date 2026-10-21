import * as THREE from 'three';
import { rnd, AB, PM, LM, BA, softTex, colorAt, clamp } from './helpers.js';
const PA = ['#00e5ff', '#39ff88', '#ffe14d', '#ff3df2', '#8a4dff', '#ff8a2a'];

export class OrbitalEnergy {
  constructor(cam) { this.cam = cam; this.g = new THREE.Group(); this.ph = 0; }
  build(c, qs) {
    const g = this.g;
    const mk = (col, o) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: col, blending: AB, transparent: true, depthWrite: false, opacity: o })); g.add(s); return s; };
    this.c1 = mk(colorAt(.65, PA), .9); this.c2 = mk(0xffffff, 1);
    const cloud = (N, size, r0, r1) => {
      const p = new Float32Array(N * 3), cl = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = r0 + Math.pow(rnd(), .8) * (r1 - r0), a = rnd() * 6.283, b = Math.acos(2 * rnd() - 1), col = colorAt(rnd(), PA);
        p.set([r * Math.sin(b) * Math.cos(a), r * Math.cos(b) * .9, r * Math.sin(b) * Math.sin(a)], i * 3); cl.set([col.r, col.g, col.b], i * 3);
      }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', BA(p)); geo.setAttribute('color', BA(cl));
      const pt = new THREE.Points(geo, PM(size)); g.add(pt); return pt;
    };
    const N = Math.max(100, Math.round(c.particleCount * qs));
    this.cl = cloud(N, 1.8, 8, 95); this.big = cloud(Math.max(12, Math.round(N / 46)), 7, 10, 90);
    this.orbG = new THREE.Group(); g.add(this.orbG); this.os = []; this.spk = [];
    const no = Math.max(3, Math.round(c.orbitCount * qs)), ch = c.orbitChaos;
    for (let i = 0; i < no; i++) {
      const a = 30 + rnd() * 70, b = a * (.35 + rnd() * .6), n = 140, p = new Float32Array(n * 3), v = rnd() * 20 * ch, k2 = 2 + i % 5;
      for (let k = 0; k < n; k++) { const th = k / n * 6.283, rr = 1 + Math.sin(th * k2) * .14 * ch; p.set([Math.cos(th) * a * rr, Math.sin(th * 3 + i) * v, Math.sin(th) * b * rr], k * 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', BA(p));
      const l = new THREE.LineLoop(geo, LM(colorAt(rnd(), PA), .6)); l.rotation.set(rnd() * 3.14, rnd() * 3.14, rnd() * 3.14); l.userData.s = (rnd() - .5) * .5;
      this.orbG.add(l); this.os.push(l);
    }
    const ns = Math.round(no * 1.4);
    for (let i = 0; i < ns; i++) {
      const n = 9, p = new Float32Array(n * 3), d = new THREE.Vector3(rnd() - .5, rnd() - .5, rnd() - .5).normalize(); let r = 6;
      for (let k = 0; k < n; k++) { r += 8 + rnd() * 14; const j = (rnd() - .5) * (k % 2 ? 14 : 3) * ch * 2; p.set([d.x * r + j, d.y * r + (rnd() - .5) * 6, d.z * r + j * .6], k * 3); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', BA(p));
      const l = new THREE.Line(geo, LM(colorAt(rnd(), PA), .5)); g.add(l); this.spk.push(l);
    }
  }
  update(dt, A, c, f) {
    const m = f.mo, gl = f.glow; this.ph += dt * m;
    this.g.rotation.y += dt * .15 * m; this.g.rotation.x = Math.sin(this.ph * .2) * .3;
    const ci = c.coreIntensity;
    this.c1.scale.setScalar((55 + A.bass * 80 * m) * ci); this.c1.material.opacity = clamp(.9 * gl);
    this.c2.scale.setScalar((18 + A.bass * 30 * m + A.energy * 10 * m) * ci); this.c2.material.opacity = clamp(gl * .9);
    this.orbG.scale.setScalar(c.orbitRadius);
    const sp = c.orbitSpeed * dt * m * (1 + A.mid * 3);
    this.os.forEach((l, i) => { l.rotation.y += l.userData.s * sp; l.scale.setScalar(1 + A.bass * .3 * m + Math.sin(this.ph + i) * .03); l.material.opacity = clamp((.35 + A.mid * .6 * m) * gl); });
    this.spk.forEach(l => { l.scale.setScalar(.6 + (A.treble * 1.2 + A.bass * .4) * m); l.material.opacity = clamp((.15 + A.treble * .85) * gl); });
    this.cl.material.size = (1.6 + A.treble * 2 * m) * Math.sqrt(gl); this.big.material.size = (6 + A.bass * 8 * m) * Math.sqrt(gl);
    this.cam.position.set(0, 0, 190 - A.bass * 10 * m); this.cam.lookAt(0, 0, 0);
  }
}
