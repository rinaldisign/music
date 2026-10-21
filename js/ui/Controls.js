import { THEMES, GLOBAL_SLIDERS, QUALITY, DEFAULT_STATE } from '../config/presets.js';
const $ = (s, r = document) => r.querySelector(s);
const BK = { webgl2: 'WebGL2', webgpu: 'WebGPU' };

export class Controls {
  constructor({ root, state, manager, save, debug }) {
    Object.assign(this, { root, state, manager, save, debug }); this.info = ''; this.audio = ''; this.fps = 0; this.render();
  }
  row(l, min, max, step, val, fn) {
    const d = document.createElement('label'), dec = step < 1 ? 2 : 0; d.className = 'sl';
    d.innerHTML = `<span>${l}</span><output></output><input type="range" min="${min}" max="${max}" step="${step}" aria-label="${l}">`;
    const i = $('input', d), o = $('output', d); i.value = val; o.textContent = (+val).toFixed(dec);
    i.oninput = () => { o.textContent = (+i.value).toFixed(dec); fn(+i.value); }; return d;
  }
  render() {
    const s = this.state, m = this.manager, r = this.root;
    r.innerHTML = `<b>Tema</b>${THEMES.map((t, i) => `<button class="t${i === s.theme ? ' on' : ''}" data-th="${i}">${t.name}</button>`).join('')}
<b>Renderer</b><select id="sb" aria-label="Backend"><option value="webgl2">WebGL2 (stabil)</option>${navigator.gpu ? '<option value="webgpu">WebGPU (eksperimental)</option>' : ''}</select>
<b>Kualitas</b><select id="sq" aria-label="Kualitas">${Object.entries(QUALITY).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}</select>
<label class="r ck"><input type="checkbox" id="ad2"> Kualitas adaptif (turun otomatis saat FPS rendah)</label>
<b>Umum</b><div id="gs"></div>
<label class="r ck"><input type="checkbox" id="rm"> Kurangi gerakan (reduced motion)</label>
<label class="r ck"><input type="checkbox" id="cc"> Warna custom <input type="color" id="cp" aria-label="Pilih warna"></label>
<b id="tn"></b><div id="ts"></div>
<div class="r"><button class="t" id="rt">Reset tema</button><button class="t" id="ra2">Reset semua</button></div>
<small id="st"></small>`;
    r.querySelectorAll('[data-th]').forEach(b => b.onclick = () => {
      m.setTheme(+b.dataset.th); this.save(); r.querySelectorAll('[data-th]').forEach(x => x.classList.toggle('on', x === b)); this.themeRows();
    });
    const sb = $('#sb', r), sq = $('#sq', r);
    sb.onchange = async () => { s.backend = sb.value; this.save(); try { await m.useBackend(sb.value); } catch (e) { this.manager.toast('Renderer gagal: ' + e.message); } sb.value = s.backend; this.save(); };
    sq.onchange = () => { s.quality = sq.value; this.save(); m.applyQuality(); };
    $('#ad2', r).onchange = e => { s.adaptive = e.target.checked; this.save(); };
    $('#rm', r).onchange = e => { s.reduced = e.target.checked; this.save(); };
    const col = () => { s.customColor = $('#cc', r).checked; s.color = $('#cp', r).value; this.save(); m.rebuild(); };
    $('#cc', r).onchange = col; $('#cp', r).oninput = () => { $('#cc', r).checked = true; col(); };
    $('#rt', r).onclick = () => { Object.assign(s.params[s.theme], THEMES[s.theme].defaults); this.save(); m.rebuild(true); this.themeRows(); };
    $('#ra2', r).onclick = async () => {
      const bk = s.backend, d = structuredClone(DEFAULT_STATE); d.reduced = s.reduced; Object.assign(s, d); this.save();
      if (bk !== s.backend) await m.useBackend(s.backend); else m.applyQuality(); this.render();
    };
    this.sync(); this.setStatus();
  }
  sync() {
    const s = this.state, r = this.root;
    $('#sb', r).value = s.backend; $('#sq', r).value = s.quality; $('#ad2', r).checked = s.adaptive; $('#rm', r).checked = s.reduced;
    $('#cc', r).checked = s.customColor; $('#cp', r).value = s.color;
    const gs = $('#gs', r); gs.replaceChildren(...GLOBAL_SLIDERS.map(([k, l, a, b, st]) => this.row(l, a, b, st, s[k], v => { s[k] = v; this.save(); })));
    this.themeRows();
  }
  themeRows() {
    const s = this.state, i = s.theme, t = THEMES[i], p = s.params[i], r = this.root;
    $('#tn', r).textContent = 'Pengaturan: ' + t.name;
    $('#ts', r).replaceChildren(...t.schema.map(([k, l, a, b, st, rb]) => this.row(l, a, b, st, p[k], v => { p[k] = v; this.save(); if (rb) this.manager.rebuild(); })));
  }
  setRenderer({ backend }) { this.info = 'Renderer aktif: ' + (BK[backend] || backend); const sb = $('#sb', this.root); if (sb) sb.value = backend; this.setStatus(); }
  setAudio(t) { this.audio = t; this.setStatus(); }
  setFps(f) { this.fps = f; if (this.debug) this.setStatus(); }
  setQuality(q) { const e = $('#sq', this.root); if (e) e.value = q; this.save(); }
  setStatus() { const e = $('#st', this.root); if (e) e.textContent = [this.info, this.audio, this.debug && this.fps ? Math.round(this.fps) + ' FPS' : ''].filter(Boolean).join(' · '); }
}
