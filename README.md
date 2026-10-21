# Audio Visualizer 3D (Three.js, WebGL2 / WebGPU)

Situs statis tanpa build. Tiga tema prosedural: **Orbital Energy**, **Neural Network**, **Liquid Wave Ring**, bereaksi pada audio lokal via Web Audio API.

## Jalankan lokal
ES modules butuh HTTP (bukan `file://`):
`python -m http.server 8080` lalu buka http://localhost:8080 (tambah `?debug` untuk FPS).

## Deploy
Unggah isi folder ini ke host statis mana pun (Netlify, Vercel, Cloudflare Pages, GitHub Pages, Nginx). Tidak ada langkah build. Perlu HTTPS agar WebGPU tersedia.

## Struktur
- `index.html`, `css/style.css`
- `js/main.js` — perakit
- `js/audio/AudioAnalyzer.js` — satu AudioContext/source; bass, mid, treble, energy, waveform, spectrum
- `js/rendering/createRenderer.js` — pilih WebGL2/WebGPU + fallback + pesan
- `js/visualizers/` — `VisualizerManager` + 3 tema (kontrak: `build/update/dispose`)
- `js/ui/` — `Controls` (panel), `Player` (playlist, sleep timer), `icons`
- `js/config/` — preset, default, penyimpanan localStorage

## Catatan
- Three.js r172 dimuat dari jsDelivr (importmap di `index.html`). Untuk offline, unduh `three.module.js`, `three.core.js`, `three.webgpu.js`, `three.tsl.js` ke `vendor/` dan ubah importmap.
- Renderer default **WebGL2** (stabil). **WebGPU** opsional; jika gagal otomatis kembali ke WebGL2 dengan pesan. Backend aktif ditampilkan di panel (diverifikasi dari renderer yang benar-benar dibuat).
- Analisis audio hanya untuk file lokal (tidak ada CORS issue).
- Pintasan: `Spasi` putar/jeda, `H` sembunyikan pemutar.
