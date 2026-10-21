import * as THREE from 'three';
export const rnd = Math.random, AB = THREE.AdditiveBlending;
export const fx = { custom: null }; // warna custom (hex) atau null
let tex;
export function softTex() {
  if (tex) return tex;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  return (tex = new THREE.CanvasTexture(c));
}
export const PM = (size, o = {}) => new THREE.PointsMaterial({ size, map: softTex(), vertexColors: true, transparent: true, blending: AB, depthWrite: false, ...o });
export const LM = (color, op) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: op, blending: AB, depthWrite: false });
export const BA = (a, dyn) => { const b = new THREE.BufferAttribute(a, 3); if (dyn) b.setUsage(THREE.DynamicDrawUsage); return b; };
export function colorAt(r, pal) {
  const c = new THREE.Color();
  if (fx.custom) { const h = {}; c.set(fx.custom).getHSL(h); c.setHSL((h.h + Math.sin(r * 6.283) * .07 + 1) % 1, Math.max(h.s, .55), Math.min(Math.max(h.l, .5), .68)); }
  else if (pal) c.set(pal[Math.floor(r * pal.length) % pal.length]);
  else c.setHSL(r % 1, 1, .55);
  return c;
}
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export function disposeObj(o) { o.traverse(x => { if (x.geometry) x.geometry.dispose(); if (x.material) x.material.dispose(); }); }
