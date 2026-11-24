(function (root) {
  'use strict';

  const VENDOR_DISPLAY_NAMES = {
    nvidia: 'NVIDIA',
    amd: 'AMD',
    intel: 'Intel',
    apple: 'Apple',
    qualcomm: 'Qualcomm',
    arm: 'ARM',
    microsoft: 'Microsoft',
    google: 'Google',
    mesa: 'Mesa',
    samsung: 'Samsung',
    broadcom: 'Broadcom',
    imgtec: 'Imagination',
  };

  const VENDOR_WEBGL_PATTERNS = {
    nvidia: /nvidia|geforce|quadro|\brtx\b|\bgtx\b|nouveau|\bnvk\b/i,
    amd: /\bamd\b|radeon|\bati\b|\bgfx\d+/i,
    intel: /intel|iris|\buhd\b|\barc\b/i,
    apple: /apple/i,
    qualcomm: /qualcomm|adreno/i,
    arm: /\barm\b|mali|immortalis/i,
    microsoft: /microsoft|basic render|warp/i,
    google: /swiftshader|google/i,
  };

  function escapeHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getWebGlRenderer(powerPreference = 'high-performance') {
    try {
      const canvas = document.createElement('canvas');
      const attrs = powerPreference ? { powerPreference } : undefined;
      const gl =
        canvas.getContext('webgl2', attrs) ||
        canvas.getContext('webgl', attrs) ||
        canvas.getContext('experimental-webgl', attrs) ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL unavailable';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'Standard WebGL';
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      if (loseCtx && typeof loseCtx.loseContext === 'function') loseCtx.loseContext();
      return renderer || 'Standard WebGL';
    } catch {
      return 'Unknown GPU';
    }
  }

  async function queryWebGpuAdapter(powerPreference, timeoutMs = 2500) {
    if (typeof navigator === 'undefined' || !navigator.gpu || typeof navigator.gpu.requestAdapter !== 'function') {
      return null;
    }
    let timer = null;
    try {
      const adapterPromise = navigator.gpu.requestAdapter(powerPreference ? { powerPreference } : undefined);
      const timeoutPromise = new Promise(resolve => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      });
      const adapter = await Promise.race([adapterPromise, timeoutPromise]);
      if (!adapter) return null;
      const info =
        adapter.info ||
        (typeof adapter.requestAdapterInfo === 'function' ? await adapter.requestAdapterInfo() : null);
      if (!info) return null;
      return {
        vendor: String(info.vendor || '').trim(),
        architecture: String(info.architecture || '').trim(),
        device: String(info.device || '').trim(),
        description: String(info.description || '').trim(),
        isFallbackAdapter: Boolean(info.isFallbackAdapter),
      };
    } catch {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function formatWebGpuAdapter(info) {
    if (!info) return null;
    const vendorKey = info.vendor.toLowerCase();
    const vendorLabel = VENDOR_DISPLAY_NAMES[vendorKey] || info.vendor;
    if (info.description) {
      const hasVendor = vendorKey && info.description.toLowerCase().includes(vendorKey);
      const parts = hasVendor || !vendorLabel ? [info.description] : [vendorLabel, info.description];
      return `WebGPU (${parts.join(', ')})`;
    }
    const parts = [vendorLabel, info.architecture, info.device].filter(Boolean);
    return parts.length ? `WebGPU (${parts.join(', ')})` : null;
  }

  function doesWebGlMatchWebGpu(webglRenderer, gpuInfo) {
    if (!webglRenderer || webglRenderer === 'WebGL unavailable' || webglRenderer === 'Standard WebGL' || webglRenderer === 'Unknown GPU') {
      return false;
    }
    if (!gpuInfo || !gpuInfo.vendor) return true;
    const vendorKey = gpuInfo.vendor.toLowerCase();
    const pattern = VENDOR_WEBGL_PATTERNS[vendorKey];
    return pattern ? pattern.test(webglRenderer) : webglRenderer.toLowerCase().includes(vendorKey);
  }

  function sameWebGpuAdapter(a, b) {
    return (
      Boolean(a && b) &&
      a.vendor === b.vendor &&
      a.architecture === b.architecture &&
      a.device === b.device &&
      a.description === b.description
    );
  }

  async function detectHardwareDetails() {
    const [highPerfGpu, lowPowerGpu] = await Promise.all([
      queryWebGpuAdapter('high-performance'),
      queryWebGpuAdapter('low-power'),
    ]);
    const webglHighPerf = getWebGlRenderer('high-performance');
    const webglLowPower = getWebGlRenderer('low-power');
    const webgpuLabel = formatWebGpuAdapter(highPerfGpu);

    let primary = webglHighPerf;
    if (highPerfGpu && !highPerfGpu.isFallbackAdapter && webgpuLabel) {
      if (highPerfGpu.description) {
        primary = webgpuLabel;
      } else {
        const vendorMatches = doesWebGlMatchWebGpu(webglHighPerf, highPerfGpu);
        const dualGpuStuckOnDisplayAdapter =
          Boolean(lowPowerGpu) && !sameWebGpuAdapter(highPerfGpu, lowPowerGpu) && webglHighPerf === webglLowPower;
        primary = vendorMatches && !dualGpuStuckOnDisplayAdapter ? webglHighPerf : webgpuLabel;
      }
    }

    const presets = [];
    for (const option of [primary, webgpuLabel, webglHighPerf, 'CPU', 'NPU']) {
      if (option && option !== 'WebGL unavailable' && option !== 'Unknown GPU' && !presets.includes(option)) {
        presets.push(option);
      }
    }
    if (!presets.includes('CPU')) presets.push('CPU');
    if (!presets.includes('NPU')) presets.push('NPU');

    return { primary: primary || 'Unknown GPU', presets };
  }

  function createHardwareController(inputId = 'hardwareLabel', datalistId = 'hardwarePresets') {
    let detectedGpuInfo = null;
    let lastAutoValue = '';
    let editedByUser = false;
    let initPromise = null;

    function apply(details) {
      detectedGpuInfo = details.primary;
      const input = document.getElementById(inputId);
      if (input && !editedByUser && (!input.value.trim() || input.value === lastAutoValue)) {
        input.value = details.primary;
        lastAutoValue = details.primary;
      }
      const datalist = document.getElementById(datalistId);
      if (datalist) {
        datalist.innerHTML = details.presets
          .map(opt => `<option value="${escapeHtml(opt)}"></option>`)
          .join('');
      }
      return details;
    }

    function bindInput() {
      const input = document.getElementById(inputId);
      if (input) {
        input.addEventListener('input', () => {
          editedByUser = true;
        });
      }
    }

    function init() {
      if (!initPromise) {
        bindInput();
        const startedHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
        initPromise = detectHardwareDetails().then(details => {
          apply(details);
          if (startedHidden && typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
            const onVisible = () => {
              if (document.visibilityState === 'visible') {
                document.removeEventListener('visibilitychange', onVisible);
                initPromise = detectHardwareDetails().then(apply);
              }
            };
            document.addEventListener('visibilitychange', onVisible);
          }
          return details;
        });
      }
      return initPromise;
    }

    function getGpuInfo() {
      const override = document.getElementById(inputId)?.value?.trim();
      if (override) return override;
      if (detectedGpuInfo) return detectedGpuInfo;
      return getWebGlRenderer('high-performance');
    }

    async function resolveGpuInfo() {
      const override = document.getElementById(inputId)?.value?.trim();
      if (override) return override;
      if (!detectedGpuInfo) await init();
      return getGpuInfo();
    }

    return { init, getGpuInfo, resolveGpuInfo, detectHardwareDetails };
  }

  const api = { escapeHtml, detectHardwareDetails, createHardwareController };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.AIHardwareDetect = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
