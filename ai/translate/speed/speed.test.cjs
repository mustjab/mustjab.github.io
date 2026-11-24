'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createSpeedHarness(translatorImpl = {}) {
  const elements = new Map();
  const storage = new Map();
  let now = 1000;
  let clipboardText = '';

  const getElement = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: id === 'sourceLanguage' ? 'en' : id === 'targetLanguage' ? 'es' : '',
        textContent: '0',
        innerHTML: '',
        disabled: false,
        style: { display: 'none', width: '0%' },
        classList: {
          add() {},
          remove() {},
          toggle() {},
        },
        handlers: {},
        addEventListener(type, fn) {
          this.handlers[type] = fn;
        },
        querySelectorAll() { return []; },
        querySelector() { return null; },
        contains() { return false; },
        matches() { return false; },
        appendChild() {},
      });
    }
    return elements.get(id);
  };

  const context = vm.createContext({
    document: {
      addEventListener() {},
      getElementById: getElement,
      createDocumentFragment() {
        return { appendChild() {} };
      },
      createElement() {
        return {
          className: '',
          textContent: '',
          innerHTML: '',
          style: {},
          setAttribute() {},
          addEventListener() {},
          appendChild() {},
          getContext() { return null; },
          click() {},
        };
      },
    },
    localStorage: {
      get length() { return storage.size; },
      key(i) { return [...storage.keys()][i] ?? null; },
      getItem(k) { return storage.get(k) ?? null; },
      setItem(k, v) { storage.set(k, String(v)); },
      removeItem(k) { storage.delete(k); },
    },
    navigator: {
      userAgent: 'Mozilla/5.0 AppleWebKit/537.36 Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0',
      clipboard: {
        async writeText(text) {
          clipboardText = text;
        },
      },
    },
    performance: {
      now() { return now; },
    },
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {},
    console: { group() {}, groupEnd() {}, log() {} },
    Translator: {
      async create() {
        return translatorImpl;
      },
    },
    module: { exports: {} },
  });
  context.self = context;

  const code = fs.readFileSync(path.join(__dirname, 'speed.js'), 'utf8');
  vm.runInContext(code, context);

  const {
    TranslationSpeedBenchmark,
    BENCHMARK_TEXTS,
    PAGE_SIM_SEGMENTS,
    PROTECTED_SPAN_RE,
    DOM_TAG_SPAN_RE,
  } = context.module.exports;

  const bench = Object.create(TranslationSpeedBenchmark.prototype);
  bench.translator = translatorImpl;
  bench.baseline = null;

  return {
    bench,
    elements,
    storage,
    getElement,
    advanceTime(ms) { now += ms; },
    getClipboard() { return clipboardText; },
    TranslationSpeedBenchmark,
    BENCHMARK_TEXTS,
    PAGE_SIM_SEGMENTS,
    PROTECTED_SPAN_RE,
    DOM_TAG_SPAN_RE,
  };
}

test('measureBatch runs both sequential (1x15) and concurrent/batched (15x1 Promise.all) waves and computes speedup', async () => {
  let inFlight = 0;
  let maxInFlightPhase1 = 0;
  let maxInFlightPhase2 = 0;
  let callCount = 0;

  let harness;
  const translator = {
    async translate(text) {
      callCount++;
      const isPhase1 = callCount <= 15;
      inFlight++;
      if (isPhase1) {
        maxInFlightPhase1 = Math.max(maxInFlightPhase1, inFlight);
      } else {
        maxInFlightPhase2 = Math.max(maxInFlightPhase2, inFlight);
      }
      await Promise.resolve();
      // In sequential phase each call takes 20ms (total 300ms); in batched phase all 15 overlap and take 10ms each (total 150ms).
      harness.advanceTime(isPhase1 ? 20 : 10);
      inFlight--;
      return text;
    },
  };
  harness = createSpeedHarness(translator);

  await harness.bench.measureBatch();

  assert.equal(callCount, 30);
  assert.equal(maxInFlightPhase1, 1, 'Sequential phase must have at most 1 request in flight at a time');
  assert.equal(maxInFlightPhase2, 15, 'Batched phase must overlap all 15 requests concurrently via Promise.all');
  assert.equal(harness.getElement('batchTotalTime').textContent, '300.0');
  assert.equal(harness.getElement('batchConcTime').textContent, '150.0');
  assert.equal(harness.getElement('batchSpeedup').textContent, '2.00×');
  assert.equal(harness.bench.batchResult.speedup, 2);
});

test('PROTECTED_SPAN_RE matches inline <bN> DOM tags, numbers, URLs, relative query paths, and emails while excluding prose percentages', () => {
  const { PROTECTED_SPAN_RE, DOM_TAG_SPAN_RE, PAGE_SIM_SEGMENTS, BENCHMARK_TEXTS } = createSpeedHarness();

  assert.equal(PROTECTED_SPAN_RE.test('Version 3.2.1'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Timestamp: 6/16/2026 2:11:58 AM'), true);
  assert.equal(PROTECTED_SPAN_RE.test('The product code is \u0500.'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Docs: https://example.com/docs/2.8.15?id=676'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Release path: /docs/release/2.8.15?id=676'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Support: support@example.com'), true);
  assert.equal(PROTECTED_SPAN_RE.test('The <b10>James Webb Space Telescope</b10>'), true);
  assert.equal(DOM_TAG_SPAN_RE.test('The <b10>James Webb Space Telescope</b10>'), true);
  assert.equal(DOM_TAG_SPAN_RE.test('Version 3.2.1'), false);

  // Pure prose percentages should not be counted as protected spans
  assert.equal(PROTECTED_SPAN_RE.test('Material: 100% organic cotton'), false);
  assert.equal(PROTECTED_SPAN_RE.test('Uptime: 99.9% guaranteed'), false);
  assert.equal(PROTECTED_SPAN_RE.test('Welcome to Our Platform'), false);

  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('https://example.com/docs/2.8.15?id=676')));
  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('/docs/release/2.8.15?id=676')));
  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('support@example.com')));
  assert.equal(BENCHMARK_TEXTS.filter(s => DOM_TAG_SPAN_RE.test(s)).length, 5);
  assert.equal(PAGE_SIM_SEGMENTS.paragraphs.filter(s => DOM_TAG_SPAN_RE.test(s)).length, 8);
});

test('measurePageSimulation computes per-type timings and normalized protected-span and DOM-tag tax', async () => {
  let harness;
  const translator = {
    async translate(text) {
      // Simulate DOM tags costing 3x and other protected spans costing 2x per character vs plain prose
      const perCharMs = harness.DOM_TAG_SPAN_RE.test(text)
        ? 0.6
        : harness.PROTECTED_SPAN_RE.test(text) ? 0.4 : 0.2;
      harness.advanceTime(text.length * perCharMs);
      return text;
    },
  };
  harness = createSpeedHarness(translator);

  await harness.bench.measurePageSimulation();

  assert.equal(harness.getElement('simDomTagTax').textContent, '3.00×');
  assert.equal(harness.getElement('simDomTagCount').textContent, '8');
  assert.ok(Number(harness.getElement('simSpanCount').textContent) > 0);
  assert.ok(Number(harness.getElement('simNoSpanCount').textContent) > 0);
});

test('measurePageSimulation propagates segment failure and restores replay icon cleanly', async () => {
  let harness;
  const translator = {
    async translate(text) {
      if (text === 'Cart (0)') {
        throw new Error('Other generic failures occurred.');
      }
      harness.advanceTime(10);
      return text;
    },
  };
  harness = createSpeedHarness(translator);

  await assert.rejects(() => harness.bench.measurePageSimulation(), /Other generic failures occurred\./);
  assert.equal(harness.getElement('runPageSim').textContent, '↻');
  assert.equal(harness.getElement('simProgressText').textContent, '14 / 187');
});

test('measureConcurrency evaluates 1, 2, 4, and 8 parallel workers and reports speedup verdict', async () => {
  let currentLevel = 1;
  let harness;
  const origPool = createSpeedHarness().TranslationSpeedBenchmark.prototype.runConcurrentPool;

  harness = createSpeedHarness({
    async translate(text) {
      return text;
    },
  });
  harness.bench.runConcurrentPool = async (_texts, concurrency) => {
    currentLevel = concurrency;
    const simulatedMs = 1000 / Math.min(concurrency, 4);
    harness.advanceTime(simulatedMs);
    return simulatedMs;
  };

  await harness.bench.measureConcurrency();

  assert.equal(currentLevel, 8);
  assert.equal(harness.getElement('conc1Speedup').textContent, '1.00×');
  assert.equal(harness.getElement('conc2Speedup').textContent, '2.00×');
  assert.equal(harness.getElement('conc4Speedup').textContent, '4.00×');
  assert.equal(harness.getElement('concBestSpeedup').textContent, '4.00×');
  assert.match(harness.getElement('concVerdict').textContent, /Calls overlap/);
  assert.equal(typeof origPool, 'function');
});

test('speed baseline snapshot saves, imports, and compares Edge Canary vs Local Build', async () => {
  const harness = createSpeedHarness();
  harness.getElement('speedBuildLabel').value = 'Edge Canary';
  harness.getElement('initTime').textContent = '120';
  harness.getElement('singleLatency').textContent = '200';
  harness.getElement('avgThroughput').textContent = '1000';
  harness.getElement('batchTotalTime').textContent = '3000';
  harness.getElement('batchThroughput').textContent = '1800';
  harness.getElement('batchConcTime').textContent = '2800';
  harness.getElement('batchConcThroughput').textContent = '1950';
  harness.getElement('batchSpeedup').textContent = '1.07×';
  harness.getElement('simSpanTax').textContent = '1.60×';

  harness.bench.saveSnapshot();
  const savedJson = harness.storage.get('speed-run-v1-en-es');
  assert.ok(savedJson);

  // Simulate Local Build run with faster batching and lower span tax
  harness.getElement('speedBuildLabel').value = 'Local NPF+HPF Build';
  harness.getElement('singleLatency').textContent = '180';
  harness.getElement('avgThroughput').textContent = '1150';
  harness.getElement('batchTotalTime').textContent = '2700';
  harness.getElement('batchThroughput').textContent = '2000';
  harness.getElement('batchConcTime').textContent = '1500';
  harness.getElement('batchConcThroughput').textContent = '3600';
  harness.getElement('batchSpeedup').textContent = '1.80×';
  harness.getElement('simSpanTax').textContent = '1.20×';

  harness.bench.compareSnapshot();
  const html = harness.getElement('speedSnapshotComparison').innerHTML;
  assert.match(html, /Local NPF\+HPF Build vs\. Edge Canary/);
  assert.match(html, /Batched 15× Total Time \(ms\)/);

  const rows = harness.TranslationSpeedBenchmark.compareSnapshots(
    harness.bench.buildSnapshot(),
    JSON.parse(savedJson)
  );
  const batchConcRow = rows.find(r => r.key === 'batchConcTotalMs');
  assert.equal(batchConcRow.status, 'improved');
  const spanTaxRow = rows.find(r => r.key === 'spanTax');
  assert.equal(spanTaxRow.status, 'improved');
});

test('detectHardwareDetails prefers high-performance WebGPU when hybrid WebGL reports display iGPU and respects manual CPU override', async () => {
  const harness = createSpeedHarness();
  harness.bench.queryWebGpuAdapter = async (pref) => (
    pref === 'low-power'
      ? { vendor: 'intel', architecture: 'gen-12lp', device: '', description: '', isFallbackAdapter: false }
      : { vendor: 'nvidia', architecture: 'lovelace', device: '', description: '', isFallbackAdapter: false }
  );
  harness.bench.getWebGlRenderer = () => 'ANGLE (Intel, Mesa Intel(R) Iris(R) Xe Graphics (RPL-P), OpenGL ES 3.2)';

  const details = await harness.bench.initHardwareField();
  assert.equal(details.primary, 'WebGPU (NVIDIA, lovelace)');
  assert.equal(harness.getElement('speedHardwareLabel').value, 'WebGPU (NVIDIA, lovelace)');
  assert.equal(harness.bench.buildSnapshot().gpu, 'WebGPU (NVIDIA, lovelace)');
  assert.ok(details.presets.includes('CPU'));
  assert.ok(details.presets.includes('NPU'));

  // Manual override (e.g. CPU) takes precedence in snapshots and TSV copy
  harness.getElement('speedHardwareLabel').value = 'CPU';
  assert.equal(harness.bench.buildSnapshot().gpu, 'CPU');
  harness.bench.saveResults();
  assert.match(harness.getClipboard(), /GPU:\s+CPU/);
});

test('detectHardwareDetails retains unmasked WebGL model name when WebGL matches high-performance WebGPU vendor', async () => {
  const harness = createSpeedHarness();
  harness.bench.queryWebGpuAdapter = async () => ({
    vendor: 'nvidia',
    architecture: 'lovelace',
    device: '',
    description: '',
    isFallbackAdapter: false,
  });
  harness.bench.getWebGlRenderer = () => 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)';

  const details = await harness.bench.detectHardwareDetails();
  assert.equal(details.primary, 'ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0, D3D11)');
});

test('TranslationSpeedBenchmark omits powerPreference on Windows when calling requestAdapter()', async () => {
  const adapterArgs = [];
  const vmCtx = vm.createContext({
    document: {
      addEventListener() {},
      getElementById: () => ({ value: '', textContent: '0', style: {}, addEventListener() {} }),
      createElement: () => ({ getContext: () => null }),
    },
    localStorage: { length: 0, key: () => null, getItem: () => null, setItem() {}, removeItem() {} },
    navigator: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/160.0.0.0 Safari/537.36 Edg/160.0.0.0',
      gpu: {
        async requestAdapter(opts) {
          adapterArgs.push(opts);
          return { info: { vendor: 'nvidia', architecture: 'lovelace', device: '', description: 'NVIDIA GeForce RTX 4070', isFallbackAdapter: false } };
        },
      },
    },
    performance: { now: () => 0 },
    setTimeout,
    clearTimeout,
    module: { exports: {} },
  });
  vmCtx.self = vmCtx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'speed.js'), 'utf8'), vmCtx);
  const Bench = vmCtx.module.exports.TranslationSpeedBenchmark;
  const inst = Object.create(Bench.prototype);
  const details = await inst.detectHardwareDetails();
  assert.deepEqual(adapterArgs, [undefined]);
  assert.equal(details.primary, 'WebGPU (NVIDIA GeForce RTX 4070)');
});

test('ensureTranslator separates download provisioning from setup time and destroys prior translator on re-init', async () => {
  let availabilityState = 'downloadable';
  let destroyedProvisioning = 0;
  let destroyedActive = 0;
  let createCalls = 0;
  let harness;

  const customTranslatorApi = {
    async availability() {
      harness.advanceTime(5);
      return availabilityState;
    },
    async create(opts) {
      createCalls++;
      if (availabilityState !== 'available') {
        if (typeof opts.monitor === 'function') {
          opts.monitor({
            addEventListener(_type, cb) {
              cb({ loaded: 0.5 });
              cb({ loaded: 1.0 });
            },
          });
        }
        harness.advanceTime(800);
        availabilityState = 'available';
        return {
          destroy() { destroyedProvisioning++; },
        };
      }
      harness.advanceTime(45);
      return {
        async translate(t) { return t; },
        destroy() { destroyedActive++; },
      };
    },
  };

  harness = createSpeedHarness(null);
  harness.bench.translator = null;
  // Inject custom Translator constructor onto global context via prototype check
  const vmCtx = vm.createContext({
    document: {
      addEventListener() {},
      getElementById: harness.getElement,
      createDocumentFragment() { return { appendChild() {} }; },
      createElement() { return { style: {}, setAttribute() {}, addEventListener() {}, appendChild() {}, getContext() { return null; } }; },
    },
    localStorage: { length: 0, key() { return null; }, getItem() { return null; }, setItem() {}, removeItem() {} },
    navigator: { userAgent: 'Edg/160.0.0.0', clipboard: { async writeText() {} } },
    performance: { now: () => 0 },
    setTimeout(fn) { fn(); return 1; },
    clearTimeout() {},
    console: { group() {}, groupEnd() {}, log() {} },
    Translator: customTranslatorApi,
    module: { exports: {} },
  });
  let clock = 1000;
  vmCtx.performance.now = () => clock;
  harness.advanceTime = (ms) => { clock += ms; };
  vmCtx.self = vmCtx;
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'speed.js'), 'utf8'), vmCtx);
  const BenchClass = vmCtx.module.exports.TranslationSpeedBenchmark;
  const bench = Object.create(BenchClass.prototype);
  bench.translator = null;

  const ok = await bench.ensureTranslator();
  assert.equal(ok, true);
  assert.equal(createCalls, 2, 'First create() provisions download, second create() measures clean setup');
  assert.equal(destroyedProvisioning, 1);
  assert.equal(bench.downloadMs, 800);
  // setupMs = availabilityMs (5) + clean createMs (45) = 50.00 (excludes 800ms download!)
  assert.equal(harness.getElement('initTime').textContent, '50.00');

  // Re-running measureInitTime disposes the previous active translator first
  await bench.measureInitTime();
  assert.equal(destroyedActive, 1);
});

test('measureStreamingComparison records first non-empty chunk latency and code-point Output CPS, and Page Mix records concurrent wave', async () => {
  let harness;
  let phase = 'seq';
  let pageCalls = 0;
  const translator = {
    async translate(text) {
      if (phase === 'stream-sync') {
        harness.advanceTime(200);
        return '你好'.repeat(100);
      }
      pageCalls++;
      // Sequential 187 calls take 2ms each (374ms); concurrent 187 calls overlap in 100ms total
      if (pageCalls <= 187) {
        harness.advanceTime(2);
      } else if (pageCalls === 188) {
        harness.advanceTime(100);
      }
      return '译';
    },
    async *translateStreaming() {
      harness.advanceTime(15);
      yield ''; // empty leading chunk must be ignored for first-chunk latency
      harness.advanceTime(25);
      yield '你好世界';
      harness.advanceTime(160);
      yield '，人工智能翻译测试。';
    },
  };
  harness = createSpeedHarness(translator);

  phase = 'stream-sync';
  await harness.bench.measureStreamingComparison();
  // First non-empty chunk arrived at 15 + 25 = 40.0 ms, total stream = 200.0 ms, 14 CJK code points => 70 out c/s
  assert.equal(harness.getElement('cmpFirstChunk').textContent, '40.0');
  assert.equal(harness.getElement('cmpStreamOutCps').textContent, '70');

  phase = 'page';
  await harness.bench.measurePageSimulation();
  assert.equal(pageCalls, 374);
  assert.equal(harness.getElement('simTotalTime').textContent, '374');
  assert.equal(harness.getElement('simConcTime').textContent, '100');
  assert.equal(harness.getElement('simConcSpeedup').textContent, '3.74×');
  assert.ok(Number(harness.getElement('simConcCps').textContent) > Number(harness.getElement('simScoreCps').textContent));
});


