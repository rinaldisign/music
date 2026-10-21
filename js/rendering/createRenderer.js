import * as THREE from 'three';
THREE.ColorManagement.enabled = false; // warna neon tetap seperti desain asli

// Satu canvas per renderer (konteks WebGL/WebGPU tidak bisa dipakai ulang antar backend).
export async function createRenderer(stage, pref, hooks = {}) {
  const mk = () => { const c = document.createElement('canvas'); stage.replaceChildren(c); return c; };
  let note = '';
  const finish = (renderer, canvas, backend) => {
    renderer.setClearColor(0x000000, 1); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); hooks.onLost && hooks.onLost(canvas); });
    canvas.addEventListener('webglcontextrestored', () => hooks.onRestored && hooks.onRestored(canvas));
    return { renderer, canvas, backend, note };
  };
  if (pref === 'webgpu') {
    if (!navigator.gpu) note = 'WebGPU tidak didukung browser ini — memakai WebGL2.';
    else {
      try {
        const canvas = mk(), { WebGPURenderer } = await import('three/webgpu');
        const r = new WebGPURenderer({ canvas, antialias: true });
        await r.init();
        if (r.backend && r.backend.isWebGPUBackend) return finish(r, canvas, 'webgpu');
        r.dispose(); note = 'WebGPU tidak tersedia pada perangkat ini — memakai WebGL2.';
      } catch (e) { note = 'WebGPU gagal (' + (e.message || e) + ') — memakai WebGL2.'; }
    }
  }
  const canvas = mk();
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  if (!r.capabilities.isWebGL2) { r.dispose(); throw new Error('WebGL2 tidak tersedia'); }
  return finish(r, canvas, 'webgl2');
}
