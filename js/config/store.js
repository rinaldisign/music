import { DEFAULT_STATE } from './presets.js';
const KEY = 'av.settings.v1';
export function loadState() {
  const s = structuredClone(DEFAULT_STATE);
  s.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  try {
    const o = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (o) {
      for (const k in s) if (k !== 'params' && k !== 'paused' && typeof o[k] === typeof s[k]) s[k] = o[k];
      (o.params || []).forEach((p, i) => { if (s.params[i]) for (const k in s.params[i]) if (typeof p[k] === 'number') s.params[i][k] = p[k]; });
    }
  } catch (e) {}
  s.paused = false;
  return s;
}
export function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
