export const QUALITY = {
  low: { qs: .4, pr: 1, label: 'Rendah' },
  balanced: { qs: 1, pr: 1.5, label: 'Seimbang' },
  high: { qs: 1.5, pr: 2, label: 'Tinggi' }
};
// [key, label, min, max, step, rebuild?]
export const GLOBAL_SLIDERS = [
  ['sensitivity', 'Sensitivitas', .2, 3, .05],
  ['smoothing', 'Smoothing', 0, .95, .01],
  ['motion', 'Intensitas gerak', 0, 2, .05],
  ['glow', 'Brightness / Glow', .2, 2, .05]
];
export const THEMES = [
  { id: 'orbital', name: 'Orbital Energy',
    defaults: { particleCount: 3200, orbitCount: 26, orbitRadius: 1, orbitChaos: .5, coreIntensity: 1, orbitSpeed: 1 },
    schema: [['particleCount', 'Jumlah partikel', 500, 8000, 100, 1], ['orbitCount', 'Jumlah orbit', 4, 60, 1, 1],
      ['orbitRadius', 'Radius orbit', .5, 2, .05], ['orbitChaos', 'Chaos', 0, 1, .05, 1],
      ['coreIntensity', 'Intensitas inti', .3, 2, .05], ['orbitSpeed', 'Kecepatan orbit', 0, 3, .05]] },
  { id: 'neural', name: 'Neural Network',
    defaults: { nodeCount: 380, connectionDensity: 1, clusterCount: 7, driftSpeed: 1, nodeGlow: 1 },
    schema: [['nodeCount', 'Jumlah node', 100, 1500, 20, 1], ['connectionDensity', 'Kepadatan koneksi', .2, 2.5, .1, 1],
      ['clusterCount', 'Jumlah klaster', 2, 14, 1, 1], ['driftSpeed', 'Kecepatan drift', 0, 3, .05],
      ['nodeGlow', 'Intensitas glow', .3, 2, .05]] },
  { id: 'ring', name: 'Liquid Wave Ring',
    defaults: { ringCount: 34, amplitude: 1, waveFreq: 4, ringSpacing: 1, tilt: 13 },
    schema: [['ringCount', 'Jumlah cincin', 8, 80, 1, 1], ['amplitude', 'Amplitudo', .2, 2, .05],
      ['waveFreq', 'Frekuensi gelombang', 1, 10, 1], ['ringSpacing', 'Jarak cincin', .5, 3, .05],
      ['tilt', 'Kemiringan kamera (°)', 3, 60, 1]] }
];
export const DEFAULT_STATE = {
  theme: 0, backend: 'webgl2', quality: 'balanced', adaptive: true, reduced: false,
  customColor: false, color: '#00e5ff', sensitivity: 1, smoothing: .75, motion: 1, glow: 1,
  paused: false, params: THEMES.map(t => ({ ...t.defaults }))
};
