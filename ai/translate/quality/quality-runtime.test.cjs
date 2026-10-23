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
      if (!elements.has(id)) elements.set(id, { value: 'es', style: {}, handlers: {},
        replaceChildren() {}, addEventListener(type, handler) { this.handlers[type] = handler; } });
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
    TextEncoder,
    QualityChecks: require('./checks.js'),
    QualityRegressions: require('./regressions.js'),
    crypto: require('node:crypto').webcrypto,
    navigator: { userAgent: 'Synthetic harness; no model execution' },
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

test('standard failure still attempts streaming and preserves partial streaming failure', async () => {
  const { bench } = createHarness(async () => null);
  bench.run.compareStreaming = true;
  bench.getDefectCases = () => [{ id: 'case', caseId: 'one', source: 'Hello', lang: 'es' }];
  bench.ensureTranslators = async () => true;
  const calls = [];
  bench.translator = {
    async translate() { calls.push('standard'); throw new Error('generation failed'); },
    async *translateStreaming() { calls.push('streaming'); yield '<partial>'; throw new Error('decode failed'); },
  };
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.renderDefectResults = () => {};
  bench.results = [];
  await bench.runDefectTests();
  assert.deepEqual(calls, ['standard', 'streaming']);
  const result = bench.defectResults[0];
  assert.equal(result.error, 'generation failed');
  assert.equal(result.streaming.error, 'decode failed');
  assert.equal(result.streaming.partialOutput, '<partial>');
  assert.equal(result.streaming.chunks[0], '<partial>');
  assert.equal(result.streaming.identical, undefined);
  assert.equal(result.streaming.output, '');
  assert.equal(bench.run.requests.length, 2);
});

test('stopping a run records streaming as unattempted without issuing a request', async () => {
  const { bench } = createHarness(async () => null);
  bench.runController.abort(new Error('Run cancelled'));
  bench.translateText = () => { throw new Error('must not run'); };
  const result = await bench.runDefectRequest({ source: 'Hello' }, 'streaming');
  assert.equal(result.status, 'not_run');
  assert.equal(result.reason, 'Run cancelled');
  assert.equal(result.pass, false);
  assert.equal(bench.run.requests.length, 0);
});

test('incomplete snapshots can be saved, imported and exported without losing errors or corpus', async () => {
  const { bench, storage } = createHarness(async () => null);
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.results = [];
  bench.defectResults = [{ caseId: 'one', source: 'Hello', error: 'failed', output: '', pass: false }];
  bench.run = { complete: false, source: 'en', target: 'es', corpusHash: 'test',
    corpus: [{ caseId: 'one', source: 'Hello' }, { caseId: 'two', source: 'World' }], requests: [] };
  bench.saveSnapshot();
  const serialized = storage.get(bench.snapshotKey());
  assert.ok(serialized);
  bench.baseline = null;
  await bench.importSnapshot({ size: serialized.length, text: async () => serialized });
  assert.equal(bench.baseline.complete, false);
  assert.equal(bench.baseline.corpus.length, 2);
  assert.equal(bench.baseline.defects[0].error, 'failed');
  const exported = bench.buildSnapshot();
  assert.equal(exported.complete, false);
  assert.equal(exported.defects[0].error, 'failed');
  assert.equal(exported.corpus.length, 2);
});

test('summary retains the planned denominator after early stop or initialization failure', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.escapeHtml = value => value;
  bench.run.compareStreaming = true;
  bench.run.corpus = [{ id: 'test', caseId: 'one' }, { id: 'test', caseId: 'two' }];
  bench.defectResults = [{ id: 'test', pass: false, error: 'failed', failures: [],
    streaming: { status: 'not_run', pass: false } }];
  bench.renderDefectResults();
  let html = elements.get('defectResults').innerHTML.replace(/\s+/g, ' ');
  assert.ok(html.includes('Standard checks clear:</strong> 0 / 2'));
  assert.ok(html.includes('Streaming checks clear:</strong> 0 / 2'));
  assert.ok(html.includes('Execution errors: 1.'));
  assert.ok(html.includes('Not run: 1.'));
  assert.ok(html.includes('Streaming not run: 2.'));
  bench.defectResults = [];
  bench.run.initializationError = 'model unavailable';
  bench.renderDefectResults();
  html = elements.get('defectResults').innerHTML.replace(/\s+/g, ' ');
  assert.ok(html.includes('Initialization error: model unavailable'));
  assert.ok(html.includes('Not run: 2.'));
});

test('focused selection runs only twenty-five defect pairs and exports a compatible new baseline', async () => {
  const { bench, elements } = createHarness(async () => null);
  elements.set('sourceLanguage', { value: 'en' });
  elements.set('targetLanguage', { value: 'es' });
  elements.set('corpusSelection', { value: 'focused' });
  elements.set('requestTimeout', { value: '60' });
  elements.set('compareStreaming', { checked: true });
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.targetSelect = { close() {} };
  bench.importWarnings = [];
  bench.clearAllResults = () => { bench.run = null; };
  bench.runTests = async () => assert.fail('Focused mode must not run reference tests');
  bench.runDefectTests = async () => {
    const cases = bench.getDefectCases();
    bench.defectResults = cases.map(spec => ({ ...spec, output: 'synthetic fixture', pass: true,
      humanVerdict: 'unreviewed', failures: [],
      streaming: { output: 'synthetic fixture', pass: true, humanVerdict: 'unreviewed', failures: [] } }));
    bench.run.requests = cases.flatMap(spec => ['standard', 'streaming'].map(api =>
      ({ input: spec.source, api, output: 'synthetic fixture' })));
  };
  await bench.runAllTests();
  assert.equal(bench.run.complete, true);
  assert.equal(bench.run.qualityCorpus.length, 0);
  assert.equal(bench.run.corpus.length, 28);
  assert.equal(bench.run.requests.length, 56);
  assert.equal(bench.run.harnessVersion, '8');
  assert.equal(bench.run.validatorVersion, require('./checks.js').VERSION);
  assert.equal(elements.get('overallScore').textContent, 'N/A');
  const snapshot = bench.buildSnapshot();
  assert.equal(snapshot.schemaVersion, 2);
  assert.equal(snapshot.defects[0].humanVerdict, 'unreviewed');
  assert.equal(snapshot.defects[0].streaming.humanVerdict, 'unreviewed');
});

test('standard and streaming semantic verdict controls update only their own API result', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.renderDefectResults = () => {};
  bench.defectResults = [{ humanVerdict: 'unreviewed', streaming: { humanVerdict: 'unreviewed' } }];
  bench.setupEventListeners();
  const change = elements.get('testLog').handlers.change;
  change({ target: { dataset: { verdict: '0', api: 'standard' }, value: 'defect' } });
  assert.equal(bench.defectResults[0].humanVerdict, 'defect');
  assert.equal(bench.defectResults[0].streaming.humanVerdict, 'unreviewed');
  change({ target: { dataset: { verdict: '0', api: 'streaming' }, value: 'acceptable' } });
  assert.equal(bench.defectResults[0].streaming.humanVerdict, 'acceptable');
  assert.equal(bench.defectResults[0].humanVerdict, 'defect');
});

test('focused selection supports any non-English target language', async () => {
  const { bench, elements } = createHarness(async () => null);
  elements.set('sourceLanguage', { value: 'en' });
  elements.set('targetLanguage', { value: 'fr' });
  elements.set('corpusSelection', { value: 'focused' });
  elements.set('requestTimeout', { value: '60' });
  elements.set('compareStreaming', { checked: false });
  elements.set('compareConcurrent', { checked: false });
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.targetSelect = { close() {} };
  bench.importWarnings = [];
  bench.clearAllResults = () => { bench.run = null; };
  assert.equal(bench.getDefectCases().length, 28);
  assert.ok(bench.getDefectCases().every(row => row.lang === 'fr'));
  bench.runTests = () => assert.fail('Focused mode must not run references');
  bench.runDefectTests = async () => {
    bench.defectResults = bench.getDefectCases().map(spec => ({ ...spec, output: 'fixture', pass: true,
      humanVerdict: 'unreviewed', failures: [] }));
  };
  await bench.runAllTests();
  assert.equal(bench.run.complete, true);
  assert.equal(bench.run.target, 'fr');
  assert.equal(bench.run.corpus.length, 28);

  elements.set('corpusSelection', { value: 'builtin' });
  elements.set('targetLanguage', { value: 'ar' });
  const builtinAr = bench.getDefectCases();
  assert.ok(builtinAr.length >= 45);
  assert.ok(builtinAr.every(row => row.lang === 'ar'));
});
test('summary separates completed execution, coverage flags and semantic verdicts with missing APIs retained', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.escapeHtml = value => value;
  bench.run.compareStreaming = true;
  bench.run.corpus = [{ id: 'coverage', caseId: 'one', regressionRule: 'departments' },
    { id: 'coverage', caseId: 'two', regressionRule: 'passages' }];
  bench.defectResults = [{ id: 'coverage', output: 'synthetic', pass: false,
    humanVerdict: 'defect', failures: ['department_clause_1: 0'], coverage: { pass: false },
    streaming: { output: 'synthetic', pass: true, humanVerdict: 'acceptable', coverage: { pass: true } } }];
  bench.renderDefectResults();
  const html = elements.get('defectResults').innerHTML.replace(/\s+/g, ' ');
  assert.ok(html.includes('Execution completed: 1 / 2'));
  assert.ok(html.includes('Coverage checks clear: 0 / 2'));
  assert.ok(html.includes('Coverage checks clear: 1 / 2'));
  assert.ok(html.includes('0 acceptable, 1 defects, 0 uncertain; 1 unreviewed or not run'));
  assert.ok(html.includes('1 acceptable, 0 defects, 0 uncertain; 1 unreviewed or not run'));
  assert.ok(html.includes('It does not mean the translation is semantically correct'));
});
test('concurrent comparison overlaps requests in waves and records parity per case', async () => {
  const { bench } = createHarness(async () => null);
  bench.log = () => {};
  bench.escapeHtml = value => value;
  bench.renderDefectResults = () => {};
  bench.run.concurrency = 2;
  let inFlight = 0;
  let maxInFlight = 0;
  bench.translator = {
    async translate(input) {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise(resolve => queueMicrotask(resolve));
      inFlight--;
      return input === 'Two' ? 'batched two' : `out ${input}`;
    },
  };
  bench.defectResults = ['One', 'Two', 'Three'].map(source =>
    ({ caseId: source, source, output: `out ${source}`, pass: true, failures: [] }));
  bench.defectResults.push({ caseId: 'Four', source: 'Four', output: '', error: 'failed', pass: false, failures: [] });
  await bench.runConcurrentDefectTests();
  assert.equal(maxInFlight, 2);
  assert.equal(bench.run.concurrentWaves.length, 2);
  assert.equal(JSON.stringify(bench.run.concurrentWaves.map(wave => wave.size)), '[2,2]');
  assert.equal(bench.defectResults[0].concurrent.identical, true);
  assert.equal(bench.defectResults[1].concurrent.identical, false);
  assert.equal(bench.defectResults[1].concurrent.output, 'batched two');
  assert.equal(bench.defectResults[1].concurrent.humanVerdict, 'unreviewed');
  assert.equal(bench.defectResults[3].concurrent.identical, undefined,
    'A sequential failure leaves concurrent parity unevaluated');
  assert.equal(bench.run.requests.length, 4);
  assert.ok(bench.run.requests.every(request => request.phase === 'concurrent' && request.api === 'standard'));
});

test('concurrent summary reports differences, errors and unattempted requests', () => {
  const { bench, elements } = createHarness(async () => null);
  bench.escapeHtml = value => value;
  bench.run.compareConcurrent = true;
  bench.run.concurrency = 8;
  bench.run.concurrentWaves = [{ start: 0, size: 3, ms: 30, attempted: 2 }];
  bench.run.corpus = [{ id: 'test', caseId: 'one' }, { id: 'test', caseId: 'two' }, { id: 'test', caseId: 'three' }];
  bench.defectResults = [
    { id: 'test', pass: true, failures: [], output: 'a', concurrent: { pass: true, output: 'a', identical: true } },
    { id: 'test', pass: true, failures: [], output: 'b', concurrent: { pass: false, output: 'c', identical: false } },
    { id: 'test', pass: true, failures: [], output: 'd', concurrent: { status: 'not_run', pass: false } },
  ];
  bench.renderDefectResults();
  const html = elements.get('defectResults').innerHTML.replace(/\s+/g, ' ');
  assert.ok(html.includes('Concurrent checks clear:</strong> 1 / 3'));
  assert.ok(html.includes('Concurrent not run: 1.'));
  assert.ok(html.includes('Differences from sequential standard output: 1 (needs review).'));
  assert.ok(html.includes('Waves: 1 of up to 8 requests; mean 30 ms, max 30 ms.'));
  assert.equal(elements.get('concurrentParityScore').textContent, '1 / 3');
  assert.equal(elements.get('concurrentParitySub').textContent, '1 diff vs sequential · 30ms/wave');
});

test('concurrent comparison is opt-in and keeps sequential snapshots comparable', async () => {
  for (const enabled of [false, true]) {
    const { bench, elements } = createHarness(async () => null);
    elements.set('sourceLanguage', { value: 'en' });
    elements.set('targetLanguage', { value: 'es' });
    elements.set('corpusSelection', { value: 'focused' });
    elements.set('requestTimeout', { value: '60' });
    elements.set('compareStreaming', { checked: false });
    elements.set('compareConcurrent', { checked: enabled });
    elements.set('concurrency', { value: '4' });
    bench.log = () => {};
    bench.escapeHtml = value => value;
    bench.targetSelect = { close() {} };
    bench.importWarnings = [];
    bench.clearAllResults = () => { bench.run = null; };
    bench.runDefectTests = async () => {
      bench.defectResults = bench.getDefectCases().map(spec => ({ ...spec, output: 'fixture', pass: true,
        humanVerdict: 'unreviewed', failures: [] }));
    };
    let concurrentRuns = 0;
    bench.runConcurrentDefectTests = async () => {
      concurrentRuns++;
      bench.defectResults.forEach(result => { result.concurrent = { output: 'fixture', pass: true, identical: true }; });
    };
    await bench.runAllTests();
    assert.equal(concurrentRuns, enabled ? 1 : 0);
    assert.equal(bench.run.harnessVersion, '8');
    assert.equal(bench.run.compareConcurrent, enabled ? true : undefined);
    assert.equal(bench.run.concurrentHarnessVersion, enabled ? '1' : undefined);
    assert.equal(bench.run.complete, true);
  }
});

test('invalid concurrent wave width does not start a run', async () => {
  const { bench, elements } = createHarness(async () => null);
  elements.set('targetLanguage', { value: 'es' });
  elements.set('corpusSelection', { value: 'focused' });
  elements.set('requestTimeout', { value: '60' });
  elements.set('compareConcurrent', { checked: true });
  elements.set('concurrency', { value: '1' });
  const messages = [];
  bench.log = message => messages.push(message);
  bench.clearAllResults = () => assert.fail('An invalid configuration must not start a run');
  await bench.runAllTests();
  assert.equal(bench.runningAll, undefined);
  assert.ok(messages.some(message => message.includes('2 to 32')));
});
