const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createHarness(translatorFactory) {
  const elements = new Map();
  const storage = new Map();
  const timers = new Map();
  let timerId = 0;
  const schedule = callback => {
    timers.set(++timerId, callback);
    return timerId;
  };
  const context = vm.createContext({
    document: { addEventListener() {}, getElementById(id) {
      if (!elements.has(id)) elements.set(id, { value: 'es', style: {}, replaceChildren() {} });
      return elements.get(id);
    } },
    localStorage: {
      get length() { return storage.size; },
      key(index) { return [...storage.keys()][index] ?? null; },
      setItem(key, value) { storage.set(key, value); },
      getItem(key) { return storage.get(key) ?? null; },
      removeItem(key) { storage.delete(key); },
    },
    structuredClone,
    Translator: { create: translatorFactory },
    AbortController, DOMException, performance,
    AbortSignal: {
      any: AbortSignal.any.bind(AbortSignal),
      timeout() {
        const controller = new AbortController();
        schedule(() => controller.abort(new DOMException('signal timed out', 'TimeoutError')));
        return controller.signal;
      },
    },
    setTimeout: schedule,
    clearTimeout: id => timers.delete(id),
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'quality.js'), 'utf8') +
    '\nglobalThis.Benchmark = TranslationQualityBenchmark;', context);
  const bench = Object.create(context.Benchmark.prototype);
  bench.runController = new AbortController();
  bench.run = { timeoutSeconds: 60, requests: [] };
  return {
    bench, timers, elements, storage,
    expireTimers() {
      for (const [id, callback] of [...timers]) {
        timers.delete(id);
        callback();
      }
    },
  };
}

test('successful initialization cannot time out or abort on a later run', async () => {
  let creationSignal;
  const translator = { destroy() {} };
  const harness = createHarness(async options => {
    creationSignal = options.signal;
    return translator;
  });
  assert.equal(await harness.bench.createTranslator({}), translator);
  harness.expireTimers();
  assert.equal(creationSignal.aborted, false);
  harness.bench.runController.abort();
  assert.equal(creationSignal.aborted, false);
  assert.equal(harness.timers.size, 0);
});

test('successful translation disposes its timeout and abort subscription', async () => {
  const harness = createHarness(async () => null);
  let requestSignal;
  const translator = { translate: async (input, options) => {
    requestSignal = options.signal;
    return 'hola';
  } };
  assert.equal(await harness.bench.translateText(translator, 'hello'), 'hola');
  harness.expireTimers();
  harness.bench.runController.abort();
  assert.equal(requestSignal.aborted, false);
  assert.equal(harness.timers.size, 0);
});

test('a real pending request timeout stops the run and destroys the translator', async () => {
  const harness = createHarness(async () => null);
  let destroyed = false;
  const translator = { translate: () => new Promise(() => {}), destroy() { destroyed = true; } };
  harness.bench.translator = translator;
  const pending = harness.bench.translateText(translator, 'hello');
  harness.expireTimers();
  await assert.rejects(pending, { name: 'TimeoutError' });
  assert.equal(destroyed, true);
  assert.equal(harness.bench.translator, null);
  assert.equal(harness.bench.runController.signal.aborted, true);
  assert.equal(harness.bench.run.requests.length, 1);
});

test('translator resolving after initialization timeout is destroyed', async () => {
  let finishCreation;
  const harness = createHarness(() => new Promise(resolve => { finishCreation = resolve; }));
  let destroyed = false;
  const pending = harness.bench.createTranslator({});
  harness.expireTimers();
  await assert.rejects(pending, { name: 'TimeoutError' });
  finishCreation({ destroy() { destroyed = true; } });
  await Promise.resolve();
  assert.equal(destroyed, true);
});

test('failed defect requests cannot retain imported output or findings', async () => {
  const { bench } = createHarness(async () => null);
  bench.getDefectCases = () => [{ id: 'imported', caseId: 'case1', source: 'hello', lang: 'es',
    output: 'stale baseline', failures: ['old finding'], review: ['old review'], pass: true }];
  bench.ensureTranslators = async () => true;
  bench.translateText = async () => { throw new Error('generation failed'); };
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.renderDefectResults = () => {};
  bench.results = [];
  await bench.runDefectTests();
  assert.equal(bench.defectResults.length, 1);
  const result = bench.defectResults[0];
  assert.equal(result.output, '');
  assert.equal(result.pass, false);
  assert.equal(result.status, 'error');
  assert.equal(result.error, 'generation failed');
  assert.equal(result.failures.length, 0);
  assert.equal(result.review.length, 0);
});

test('streaming collects delta chunks and disposes timeout subscriptions', async () => {
  const harness = createHarness(async () => null);
  const translator = { async *translateStreaming() { yield 'Hola'; yield ' mundo'; } };
  assert.equal(await harness.bench.translateText(translator, 'Hello world', 'streaming'), 'Hola mundo');
  const request = harness.bench.run.requests[0];
  assert.equal(request.api, 'streaming');
  assert.equal(request.chunks.length, 2);
  assert.ok(request.firstChunkMs >= 0);
  assert.equal(harness.timers.size, 0);
});

test('streaming failure records partial text as an error, not an output', async () => {
  const harness = createHarness(async () => null);
  const translator = { async *translateStreaming() { yield 'Partial'; throw new Error('decode failed'); } };
  await assert.rejects(harness.bench.translateText(translator, 'Hello', 'streaming'), /decode failed/);
  const request = harness.bench.run.requests[0];
  assert.equal(request.partialOutput, 'Partial');
  assert.equal(request.output, undefined);
  assert.equal(request.error, 'decode failed');
  assert.equal(harness.timers.size, 0);
});

test('paired summary cannot hide streaming defects behind standard success', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.run.compareStreaming = true;
  bench.escapeHtml = value => value;
  bench.defectResults = [{ id: 'url', pass: true, failures: [],
    streaming: { pass: false, identical: false, failures: ['required_token_missing'] } }];
  bench.renderDefectResults();
  const html = elements.get('defectResults').innerHTML.replace(/\s+/g, ' ');
  assert.ok(html.includes('Standard checks clear:</strong> 1 / 1'));
  assert.ok(html.includes('Streaming checks clear:</strong> 0 / 1'));
  assert.ok(html.includes('API output differences: 1'));
});

test('saved baselines can be cleared after clearing results or reloading', () => {
  const { bench, storage } = createHarness(async () => null);
  bench.log = () => {};
  bench.updateTestMode = () => {};
  bench.results = [];
  bench.defectResults = [];
  bench.run = { complete: true, source: 'en', target: 'es', corpusHash: 'test' };
  bench.saveSnapshot();
  const savedKey = bench.snapshotKey();
  storage.set('unrelated-site-setting', 'keep');
  storage.set('quality-defect-snapshot-es', '{}');
  bench.clearAllResults();
  bench.clearSnapshot();
  assert.equal(storage.has(savedKey), false);
  assert.equal(storage.has('quality-defect-snapshot-es'), false);
  assert.equal(storage.get('unrelated-site-setting'), 'keep');
  storage.set(savedKey, '{}');
  bench.run = null;
  bench.baseline = null;
  bench.clearSnapshot();
  assert.equal(storage.has(savedKey), false);
});

test('imported category names cannot collide with object prototype properties', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.escapeHtml = value => value;
  bench.defectResults = ['__proto__', 'constructor'].map(id => ({ id, pass: true, failures: [] }));
  bench.renderDefectResults();
  const html = elements.get('defectResults').innerHTML;
  assert.ok(html.includes('<code>__proto__</code>'));
  assert.ok(html.includes('<code>constructor</code>'));
  assert.equal(html.includes('NaN'), false);
});