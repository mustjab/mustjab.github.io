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

test('PROTECTED_SPAN_RE matches numbers, URLs, relative query paths, and emails while excluding prose percentages', () => {
  const { PROTECTED_SPAN_RE, PAGE_SIM_SEGMENTS } = createSpeedHarness();

  assert.equal(PROTECTED_SPAN_RE.test('Version 3.2.1'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Docs: https://example.com/docs/2.8.15?id=676'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Release path: /docs/release/2.8.15?id=676'), true);
  assert.equal(PROTECTED_SPAN_RE.test('Support: support@example.com'), true);

  // Pure prose percentages should not be counted as protected spans
  assert.equal(PROTECTED_SPAN_RE.test('Material: 100% organic cotton'), false);
  assert.equal(PROTECTED_SPAN_RE.test('Uptime: 99.9% guaranteed'), false);
  assert.equal(PROTECTED_SPAN_RE.test('Welcome to Our Platform'), false);

  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('https://example.com/docs/2.8.15?id=676')));
  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('/docs/release/2.8.15?id=676')));
  assert.ok(PAGE_SIM_SEGMENTS.short.some(s => s.includes('support@example.com')));
});

test('measurePageSimulation computes per-type timings and normalized protected-span tax', async () => {
  let harness;
  const translator = {
    async translate(text) {
      // Simulate protected spans costing 2x per character vs plain prose
      const perCharMs = harness.PROTECTED_SPAN_RE.test(text) ? 0.4 : 0.2;
      harness.advanceTime(text.length * perCharMs);
      return text;
    },
  };
  harness = createSpeedHarness(translator);

  await harness.bench.measurePageSimulation();

  assert.equal(harness.getElement('simSpanTax').textContent, '2.00×');
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
