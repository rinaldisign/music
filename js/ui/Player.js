import { ic } from './icons.js';
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const fmt = s => isFinite(s) ? (s / 60 | 0) + ':' + String(s % 60 | 0).padStart(2, '0') : '0:00';
const esc = s => s.replace(/[&<>"]/g, c => '&#' + c.charCodeAt(0) + ';');

export class Player {
  constructor(an, { onState = () => {}, toast = () => {} } = {}) {
    this.an = an; this.onState = onState; this.toast = toast; this.L = []; this.ix = -1;
    const au = this.au = new Audio(); au.preload = 'auto';
    this.bind(); this.drawL(); this.status();
  }
  status() { this.onState(!this.L.length ? 'Belum ada audio' : this.au.paused ? 'Audio: jeda' : 'Audio: memutar'); }
  drawL() {
    $('#p1').innerHTML = this.L.map((s, i) => `<button class="t${i == this.ix ? ' on' : ''}" data-p="${i}">${i + 1}. ${esc(s.n)}</button>`).join('') || '<span style="padding:8px">Playlist kosong</span>';
    $('#hint').style.display = this.L.length ? 'none' : '';
  }
  go(i) {
    const au = this.au; this.ix = i; au.src = this.L[i].u; this.an.attach(au); this.an.resume();
    if (this.an.error) this.toast('Analisis audio tidak tersedia di browser ini.');
    au.play().catch(() => {}); $('#nm').textContent = this.L[i].n; this.drawL();
  }
  add(files) {
    let n = 0;
    [...files].forEach(f => { if (f.type.startsWith('audio') || /\.(mp3|wav|ogg|m4a|flac|aac|opus)$/i.test(f.name)) { this.L.push({ n: f.name.replace(/\.[^.]+$/, ''), u: URL.createObjectURL(f) }); n++; } });
    this.drawL(); if (n && this.ix < 0) this.go(0); else this.status();
  }
  next(auto) {
    const L = this.L, au = this.au; if (!L.length) return; let i;
    if ($('#sh').classList.contains('on') && L.length > 1) { do i = Math.floor(Math.random() * L.length); while (i === this.ix); }
    else { i = this.ix + 1; if (i >= L.length) { if ($('#ra').classList.contains('on') || !auto) i = 0; else { au.pause(); au.currentTime = 0; return; } } }
    this.go(i);
  }
  prev() { if (this.au.currentTime > 3 || this.L.length < 2) this.au.currentTime = 0; else this.go((this.ix - 1 + this.L.length) % this.L.length); }
  bind() {
    const au = this.au, an = this.an, sk = $('#sk');
    $('#ad').onclick = () => $('#fi').click(); $('#fi').onchange = e => { this.add(e.target.files); e.target.value = ''; };
    addEventListener('dragover', e => e.preventDefault()); addEventListener('drop', e => { e.preventDefault(); this.add(e.dataTransfer.files); });
    $('#pp').onclick = () => { if (!this.L.length) return $('#fi').click(); if (au.paused) { an.attach(au); an.resume(); au.play(); } else au.pause(); };
    $('#nx').onclick = () => this.next(false); $('#pv').onclick = () => this.prev(); au.onended = () => this.next(true);
    au.onerror = () => this.toast('Gagal memutar file audio ini.');
    au.onplay = au.onpause = () => { an.playing = !au.paused; $('#pp').innerHTML = ic(au.paused ? 'play' : 'pause'); this.status(); };
    au.ontimeupdate = () => { if (!this.drag) sk.value = au.duration ? au.currentTime / au.duration * 1000 : 0; $('#tt').textContent = fmt(au.currentTime); $('#td').textContent = fmt(au.duration); };
    sk.oninput = () => { this.drag = 1; au.currentTime = sk.value / 1000 * (au.duration || 0); setTimeout(() => this.drag = 0, 200); };
    $('#vl').oninput = e => au.volume = +e.target.value;
    $('#sh').onclick = e => e.currentTarget.classList.toggle('on'); $('#ra').onclick = e => e.currentTarget.classList.toggle('on');
    $('#r1').onclick = e => { au.loop = e.currentTarget.classList.toggle('on'); };
    const pop = id => $$('.pop').forEach(p => p.classList.toggle('o', p.id === id && !p.classList.contains('o')));
    $('#pl').onclick = e => { e.stopPropagation(); pop('p1'); }; $('#sl').onclick = e => { e.stopPropagation(); pop('p2'); };
    $('#p1').onclick = e => { const b = e.target.closest('[data-p]'); if (b) this.go(+b.dataset.p); };
    $('#p2').onclick = e => { const b = e.target.closest('[data-s]'); if (b) { this.sleep(+b.dataset.s); pop(''); } };
    const hide = h => { $('#bar').classList.toggle('h', h); document.body.classList.toggle('hid', h); };
    $('#cl').onclick = () => { const c = $('#bar').classList.toggle('c'); $('#cl').innerHTML = ic(c ? 'up' : 'down'); $$('.pop').forEach(p => p.classList.remove('o')); };
    $('#hd').onclick = () => hide(true); $('#tab').onclick = () => hide(false);
    $('#stage').onclick = () => hide(!$('#bar').classList.contains('h'));
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' && e.target.type !== 'range') return; if (e.target.tagName === 'SELECT') return;
      if (e.code === 'Space' && e.target.tagName !== 'BUTTON') { e.preventDefault(); $('#pp').click(); }
      if (e.key === 'h') hide(!$('#bar').classList.contains('h'));
    });
  }
  sleep(m) {
    clearTimeout(this.st); clearInterval(this.si); const b = $('#sl'); b.classList.toggle('on', !!m); b.title = 'Sleep timer'; if (!m) return;
    const end = Date.now() + m * 6e4; this.st = setTimeout(() => this.fade(), m * 6e4);
    this.si = setInterval(() => { b.title = 'Sleep timer: ' + Math.ceil((end - Date.now()) / 6e4) + ' menit lagi'; }, 15000); b.title = 'Sleep timer: ' + m + ' menit';
  }
  fade() {
    const au = this.au, v = +$('#vl').value, iv = setInterval(() => { au.volume = Math.max(0, au.volume - .04); if (au.volume <= 0) { clearInterval(iv); au.pause(); au.volume = v; this.sleep(0); } }, 150);
  }
}
