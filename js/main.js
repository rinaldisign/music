import { loadState, saveState } from './config/store.js';
import { AudioAnalyzer } from './audio/AudioAnalyzer.js';
import { VisualizerManager } from './visualizers/VisualizerManager.js';
import { Player } from './ui/Player.js';
import { Controls } from './ui/Controls.js';
import { ic, initIcons } from './ui/icons.js';
const $ = s => document.querySelector(s);

let tt; const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('o'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('o'), 4500); };
initIcons();
const state = loadState(), save = () => saveState(state);
const analyzer = new AudioAnalyzer(state);
let controls;
const manager = new VisualizerManager({ stage: $('#stage'), analyzer, state, toast,
  onStatus: s => controls && controls.setRenderer(s), onQuality: q => controls && controls.setQuality(q), onFps: f => controls && controls.setFps(f) });
controls = new Controls({ root: $('#menu'), state, manager, save, debug: /[?&]debug/.test(location.search) });
new Player(analyzer, { onState: t => controls.setAudio(t), toast });

$('#fs').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) {} };
$('#dots').onclick = e => { e.stopPropagation(); $('#menu').classList.toggle('o'); };
const ap = $('#ap'); ap.onclick = () => { state.paused = !state.paused; ap.innerHTML = ic(state.paused ? 'play' : 'pause'); ap.classList.toggle('on', state.paused); };
document.addEventListener('click', e => { const p = e.composedPath(); if (!p.some(n => n.id === 'menu' || (n.classList && n.classList.contains('pop')))) document.querySelectorAll('.pop,#menu').forEach(x => x.classList.remove('o')); });

manager.start().catch(e => { console.error(e); $('#err').textContent = 'Gagal memulai grafis: ' + (e.message || e) + '. Pastikan browser mendukung WebGL2 dan koneksi internet aktif (Three.js dimuat dari CDN).'; $('#err').hidden = false; });
