'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createPromptSpeedHarness({ gpuAdapters = {}, webglByPref = {} } = {}) {
  const elements = new Map();
  const storage = new Map();
  let clipboardText = '';

  const getElement = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        textContent: '0',
        innerHTML: '',
        disabled: false,
        style: { display: 'none', width: '0%' },
        handlers: {},
        addEventListener(type, fn) {
          this.handlers[type] = fn;
        },
      });
    }
    return elements.get(id);
  };

  let domReadyHandler = null;
  const context = vm.createContext({
    document: {
      addEventListener(type, fn) {
        if (type === 'DOMContentLoaded') domReadyHandler = fn;
      },
      getElementById: getElement,
      createElement(tag) {
        if (tag === 'canvas') {
          return {
            getContext(_kind, attrs) {
              const pref = attrs?.powerPreference || 'default';
              const renderer = webglByPref[pref] ?? webglByPref.default ?? null;
              if (!renderer) return null;
              return {
                UNMASKED_RENDERER_WEBGL: 0x9246,
                getExtension(name) {
                  if (name === 'WEBGL_debug_renderer_info') return { UNMASKED_RENDERER_WEBGL: 0x9246 };
                  if (name === 'WEBGL_lose_context') return { loseContext() {} };
                  return null;
                },
                getParameter(param) {
                  return param === 0x9246 ? renderer : null;
                },
              };
            },
          };
        }
        return {};
      },
    },
    window: {},
    localStorage: {
      getItem(k) { return storage.get(k) ?? null; },
      setItem(k, v) { storage.set(k, String(v)); },
      removeItem(k) { storage.delete(k); },
    },
    navigator: {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/160.0.0.0 Safari/537.36 Edg/160.0.0.0',
      gpu: gpuAdapters
        ? {
            async requestAdapter(opts) {
              const key = opts?.powerPreference || 'default';
              const info = gpuAdapters[key] ?? gpuAdapters.default ?? null;
              return info ? { info } : null;
            },
          }
        : undefined,
      clipboard: {
        async writeText(text) {
          clipboardText = text;
        },
      },
    },
    performance: { now: () => 1000 },
    AbortController,
    setTimeout,
    clearTimeout,
    module: { exports: {} },
  });

  const code = fs.readFileSync(path.join(__dirname, 'speed.js'), 'utf8');
  vm.runInContext(code, context);

  return {
    exports: context.module.exports,
    getElement,
    storage,
    triggerDomReady() {
      if (domReadyHandler) domReadyHandler();
    },
    getClipboard() {
      return clipboardText;
    },
  };
}

test('Linux hybrid Optimus selects WebGPU high-performance adapter instead of WebGL display iGPU', async () => {
  const harness = createPromptSpeedHarness({
    gpuAdapters: {
      'high-performance': { vendor: 'nvidia', architecture: 'lovelace', device: '', description: '', isFallbackAdapter: false },
      'low-power': { vendor: 'intel', architecture: 'gen-12lp', device: '', description: '', isFallbackAdapter: false },
    },
    webglByPref: {
      default: 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)',
    },
  });

  harness.getElement('time-to-first-token').textContent = '1176.00';
  harness.getElement('time-to-prefill-1k').textContent = '246.52';
  harness.getElement('tps-result').textContent = '86.47';
  harness.getElement('tool-call-ms').textContent = 'N/A';

  await harness.exports.initHardwareField();
  assert.equal(harness.getElement('hardwareLabel').value, 'WebGPU (NVIDIA, lovelace)');

  await harness.exports.saveResultsToClipboard();
  assert.match(harness.getClipboard(), /\tEdge\t160\.0\.0\.0\tWebGPU \(NVIDIA, lovelace\)\t1176\.00\t246\.52\t86\.47\tN\/A$/);
});

test('Same-vendor dual-GPU stuck on WebGL display adapter falls back to WebGPU high-performance architecture', async () => {
  const harness = createPromptSpeedHarness({
    gpuAdapters: {
      'high-performance': { vendor: 'intel', architecture: 'xe-hpg', device: '', description: '', isFallbackAdapter: false },
      'low-power': { vendor: 'intel', architecture: 'gen-12lp', device: '', description: '', isFallbackAdapter: false },
    },
    webglByPref: {
      'high-performance': 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)',
      'low-power': 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)',
    },
  });

  const details = await harness.exports.detectHardwareDetails();
  assert.equal(details.primary, 'WebGPU (Intel, xe-hpg)');
});

test('Unmasked WebGPU adapter description is preferred directly when available', async () => {
  const harness = createPromptSpeedHarness({
    gpuAdapters: {
      'high-performance': {
        vendor: 'nvidia',
        architecture: 'lovelace',
        device: '0x28a1',
        description: 'NVIDIA GeForce RTX 4050 Laptop GPU',
        isFallbackAdapter: false,
      },
    },
    webglByPref: {
      default: 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)',
    },
  });

  const details = await harness.exports.detectHardwareDetails();
  assert.equal(details.primary, 'WebGPU (NVIDIA GeForce RTX 4050 Laptop GPU)');
});

test('Manual CPU/NPU override in hardwareLabel is preserved and recorded in TSV and baseline table', async () => {
  let resolveAdapter;
  const harness = createPromptSpeedHarness({
    gpuAdapters: null,
    webglByPref: { default: 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)' },
  });
  harness.triggerDomReady();

  // User types CPU override
  const input = harness.getElement('hardwareLabel');
  input.value = 'CPU';
  if (input.handlers.input) input.handlers.input();

  harness.getElement('time-to-first-token').textContent = '2400.00';
  harness.getElement('time-to-prefill-1k').textContent = '1850.00';
  harness.getElement('tps-result').textContent = '14.20';
  harness.getElement('tool-call-ms').textContent = '510.0';

  await harness.exports.saveResultsToClipboard();
  assert.match(harness.getClipboard(), /\tEdge\t160\.0\.0\.0\tCPU\t2400\.00\t1850\.00\t14\.20\t510\.0$/);

  await harness.exports.saveBaselineSlot();
  assert.match(harness.getElement('baselineComparisonTable').innerHTML, /<td>CPU<\/td>/);
  void resolveAdapter;
});

test('Background tab timeout falls back without hanging and upgrades to WebGPU adapter when tab becomes visible', async () => {
  let visibilityState = 'hidden';
  const listeners = {};
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) {
      elements.set(id, { id, value: '', textContent: '0', innerHTML: '', style: {}, addEventListener() {} });
    }
    return elements.get(id);
  };

  const context = vm.createContext({
    document: {
      get visibilityState() { return visibilityState; },
      addEventListener(type, fn) { listeners[type] = fn; },
      removeEventListener(type, fn) { if (listeners[type] === fn) delete listeners[type]; },
      getElementById: getElement,
      createElement() {
        return {
          getContext() {
            return {
              UNMASKED_RENDERER_WEBGL: 0x9246,
              getExtension: (n) => (n === 'WEBGL_debug_renderer_info' ? { UNMASKED_RENDERER_WEBGL: 0x9246 } : null),
              getParameter: () => 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)',
            };
          },
        };
      },
    },
    window: {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    navigator: {
      userAgent: 'Mozilla/5.0 Edg/160.0.0.0',
      gpu: {
        requestAdapter(opts) {
          if (visibilityState === 'hidden') return new Promise(() => {}); // Hung while hidden
          return Promise.resolve({
            info: opts?.powerPreference === 'low-power'
              ? { vendor: 'intel', architecture: 'gen-12lp', device: '', description: '', isFallbackAdapter: false }
              : { vendor: 'nvidia', architecture: 'lovelace', device: '', description: '', isFallbackAdapter: false },
          });
        },
      },
      clipboard: { async writeText() {} },
    },
    performance: { now: () => 0 },
    AbortController,
    setTimeout: (fn, _ms) => setTimeout(fn, 10),
    clearTimeout,
    module: { exports: {} },
  });

  vm.runInContext(fs.readFileSync(path.join(__dirname, 'speed.js'), 'utf8'), context);

  await context.module.exports.initHardwareField();
  assert.equal(getElement('hardwareLabel').value, 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)');

  // Now bring tab to foreground — auto-upgrades to WebGPU high-performance adapter
  visibilityState = 'visible';
  listeners.visibilitychange();
  await new Promise(r => setTimeout(r, 25));
  assert.equal(getElement('hardwareLabel').value, 'WebGPU (NVIDIA, lovelace)');
});

