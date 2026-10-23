const assert = require('node:assert/strict');
const { test } = require('node:test');
const checks = require('./checks.js');

test('rejects empty, punctuation-only, and leaked synthetic output', () => {
  const spec = { source: 'french 1k', lang: 'es', mustPreserve: ['1k'] };
  for (const output of ['', '...', 'Francés <B9000></B9000> 1k']) {
    assert.equal(checks.evaluate(spec, output).status, 'fail');
  }
});

test('checks token boundaries and multiplicity', () => {
  const spec = { source: 'See item 676.', mustPreserve: ['676'] };
  assert.equal(checks.evaluate(spec, 'Vea 1676.').pass, false);
  assert.equal(checks.evaluate(spec, 'Vea 676 y 676.').pass, false);
  assert.equal(checks.evaluate(spec, 'Vea 676.').pass, true);
});

test('detects crossed, duplicate, and reparented markers', () => {
  const spec = { source: '<b10>Rules</b10><b11>Policies</b11>' };
  assert.equal(checks.evaluate(spec, '<b10>Reglas</b10><b11>Políticas</b11>').pass, true);
  for (const output of ['<b10>Reglas<b11>Políticas</b10></b11>', '<b10>Reglas</b10><b11>Políticas</b11></b11>', '<b10>Reglas<b11>Políticas</b11></b10>']) {
    assert.equal(checks.evaluate(spec, output).pass, false);
  }
});

test('preserves literal high-ID source markers', () => {
  const source = 'Keep <b9000></b9000>.';
  assert.equal(checks.evaluate({ source }, 'Mantenga <b9000></b9000>.').pass, true);
});

test('does not confuse invariant success with semantic success', () => {
  const result = checks.evaluate({ source: '1 warning found' }, '1 se encontró una advertencia');
  assert.equal(result.status, 'needs_review');
  assert.ok(result.review.includes('numeric_value_and_role'));
  assert.ok(checks.evaluate({ source: 'Hello world' }, 'Hello world').review.includes('unchanged_source'));
});

test('retains incomplete CSV pairs with warnings and stable IDs', () => {
  const fields = ['outcome', 'segment_id', 'source_text', 'old_od_translation', 'july_2026_od_translation'];
  const row = { outcome: 'fix', segment_id: '1', source_text: 'hello', old_od_translation: 'hola', july_2026_od_translation: '' };
  const imported = checks.importRows([row, row], fields);
  assert.equal(imported.cases.length, 1);
  assert.equal(imported.cases[0].paired, false);
  assert.equal(imported.warnings.length, 2);
  assert.throws(() => checks.importRows([row], []), /Missing CSV/);
});

test('CSV imports discard unused metadata and identifiers', () => {
  const row = { outcome: 'fix', segment_id: 'internal-id', source_text: 'hello',
    old_od_translation: 'hola', july_2026_od_translation: 'hola',
    url_hash: 'private-url-hash', private_annotation: 'not-for-export',
    july_2026_od_reasoning: 'private-reason' };
  const imported = checks.importRows([row], Object.keys(row));
  const serialized = JSON.stringify(imported.cases);
  for (const value of ['internal-id', 'private-url-hash', 'not-for-export', 'private-reason']) {
    assert.equal(serialized.includes(value), false);
  }
  assert.equal(imported.cases[0].source, 'hello');
  assert.equal(imported.cases[0].oldOutput, 'hola');
});

test('snapshot comparison pairs cases rather than cancelling category changes', () => {
  const metadata = { source: 'en', target: 'es', corpusHash: 'abc', validatorVersion: checks.VERSION, complete: true };
  const prior = { ...metadata, defects: [{ caseId: 'one', source: 'One', pass: true, output: 'old one' }, { caseId: 'two', source: 'Two', pass: false, output: 'old two' }] };
  const current = { ...metadata, defects: [{ caseId: 'one', source: 'One', pass: false, output: 'new one' }, { caseId: 'two', source: 'Two', pass: true, output: 'new two' }] };
  assert.deepEqual(checks.compare(current, prior).map(row => row.state), ['check_regression', 'check_improvement']);
  assert.throws(() => checks.compare({ ...current, source: 'fr' }, prior), /differ/);
  assert.throws(() => checks.compare({ ...current, complete: false }, prior), /planned corpus/);
  assert.throws(() => checks.compare({ ...current, defects: [...current.defects, current.defects[0]] }, prior), /duplicate/);
  assert.equal(checks.compare(current, { ...prior, requests: [{ error: 'signal timed out' }] }).length, 2);
});

test('compares errors, recoveries, partial streams and unattempted cases without losing the denominator', () => {
  const corpus = ['error', 'recovery', 'both', 'stream', 'missing'].map(caseId => ({ caseId, source: caseId }));
  const metadata = { source: 'en', target: 'es', corpusHash: 'same', validatorVersion: checks.VERSION,
    harnessVersion: '7', compareStreaming: true, complete: false, corpus };
  const success = spec => ({ ...spec, pass: true, output: 'ok', streaming: { output: 'ok', pass: true } });
  const prior = { ...metadata, defects: corpus.map(success) };
  const current = { ...metadata, defects: corpus.slice(0, 4).map(success) };
  current.defects[0] = { ...corpus[0], output: '', error: 'generation failed', pass: false };
  prior.defects[1].error = 'timeout';
  prior.defects[2].error = 'old failure';
  current.defects[2].error = 'new failure';
  current.defects[3].streaming = { error: 'decode failed', partialOutput: 'part', chunks: ['pa', 'rt'], pass: false };
  const rows = checks.compare(current, prior);
  assert.equal(rows.length, 5);
  assert.deepEqual(rows.map(row => row.state), ['execution_regression', 'execution_recovery', 'execution_error', 'execution_regression', 'not_run']);
  assert.equal(rows[0].afterError, 'generation failed');
  assert.equal(rows[0].streaming.afterStatus, 'not_run');
  assert.equal(rows[2].beforeError, 'old failure');
  assert.equal(rows[2].afterError, 'new failure');
  assert.equal(rows[3].standard.state, 'unchanged_output');
  assert.equal(rows[3].streaming.afterPartialOutput, 'part');
  assert.deepEqual(rows[3].streaming.afterChunks, ['pa', 'rt']);
  assert.equal(rows[4].afterStatus, 'not_run');
  assert.equal(rows[4].beforeStatus, 'ok');
  assert.equal(checks.compare({ ...current, stopReason: 'Cancelled run' }, prior)[4].afterReason, 'Cancelled run');
  const initialization = checks.compare({ ...current, defects: [], initializationError: 'model unavailable' }, prior);
  assert.equal(initialization.length, 5);
  assert.equal(initialization[0].afterReason, 'model unavailable');
  assert.throws(() => checks.compare({ ...current, corpus: [...corpus, corpus[0]] }, prior), /duplicate/);
  assert.throws(() => checks.compare({ ...current, corpus: corpus.slice(1) }, prior), /Unexpected|different/);
  assert.throws(() => checks.compare({ ...current, defects: [{ ...corpus[0], source: 'changed' }] }, prior), /source changed/);
});

test('legacy streaming partial text is retained from request records', () => {
  const spec = { caseId: 'one', source: 'Hello' };
  const prior = { complete: true, source: 'en', target: 'es', corpusHash: 'one', compareStreaming: true,
    defects: [{ ...spec, output: 'Hola', pass: true, streaming: { output: 'Hola', pass: true } }] };
  const current = { ...prior, complete: false, corpus: [spec],
    defects: [{ ...spec, output: 'Hola', pass: true, streaming: { output: '', error: 'failure', pass: false } }],
    requests: [{ input: 'Hello', api: 'streaming', error: 'failure', partialOutput: 'partial', chunks: ['partial'] }] };
  assert.equal(checks.compare(current, prior)[0].streaming.afterPartialOutput, 'partial');
  const ambiguous = { ...current, requests: [...current.requests, { ...current.requests[0], partialOutput: 'other case' }] };
  assert.equal(checks.compare(ambiguous, prior)[0].streaming.afterPartialOutput, undefined);
});

test('checks source URLs and emails without manually authored expectations', () => {
  const spec = { source: 'Visit https://example.com or email user@example.com.' };
  assert.equal(checks.evaluate(spec, 'Visite https://example.com o escriba a user@example.com.').pass, true);
  assert.equal(checks.evaluate(spec, 'Visite https://ejemplo.com o escriba a user@example.com.').pass, false);
});

test('accepts tokens adjacent to CJK text and numbers adjacent to units', () => {
  assert.equal(checks.occurrences('API返回179.5MB的数据', 'API'), 1);
  assert.equal(checks.occurrences('API返回179.5MB的数据', '179.5'), 1);
  assert.equal(checks.occurrences('阿尔伯特·爱因斯坦曾在MIT工作', '阿尔伯特·爱因斯坦'), 1);
  assert.equal(checks.occurrences('MYAPI', 'API'), 0);
  assert.equal(checks.occurrences('1676', '676'), 0);
});

test('focused JSON imports only cases and never stale verdicts or timings', () => {
  const source = { schemaVersion: 1, kind: 'translation-quality-corpus', source: 'en', target: 'es',
    cases: [{ caseId: 'quick:one', id: 'numeric_roles', source: '1 warning found', sourceLanguage: 'en', lang: 'es',
      reviewTopics: ['count_agreement'], baselineOutput: '1 se encontro una advertencia', pass: true, time: 50 }] };
  const imported = checks.importCorpus(source);
  assert.equal(imported.cases.length, 1);
  assert.equal(imported.cases[0].caseId, 'quick:one');
  assert.equal(imported.cases[0].baselineOutput, source.cases[0].baselineOutput);
  assert.equal(imported.cases[0].pass, undefined);
  assert.equal(imported.cases[0].time, undefined);
  assert.throws(() => checks.importCorpus({ ...source, cases: [...source.cases, ...source.cases] }), /unique/);
  assert.throws(() => checks.importCorpus({ ...source, target: 'ja' }), /matching/);
  assert.throws(() => checks.importCorpus({ ...source, cases: [] }), /Expected/);
  assert.throws(() => checks.importCorpus({ ...source, cases: [{ ...source.cases[0], mustPreserve: '1' }] }), /mustPreserve/);
});

test('detects leaked brace and phrase-fix markers without rejecting literal source markers', () => {
  const spec = { source: 'Visit https://example.com.' };
  for (const output of [
    'Visite {0} https://example.com.',
    'Visite { 0 } https://example.com.',
    'Visite (phrasefix)(#0)(#1)(#phrasefix) https://example.com.',
    'Visite (#0)(#1) https://example.com.',
    'Visite <[>https://example.com<=>https://example.com<]>.',
    'Visite <[>https://example.com<]>.',
  ]) {
    assert.ok(checks.evaluate(spec, output).failures.includes('synthetic_placeholder_leak'));
  }
  assert.equal(checks.evaluate({ source: 'Keep {0}.' }, 'Mantenga {0}.').pass, true);
  assert.equal(checks.evaluate({ source: 'Keep <[>literal<]>.' }, 'Mantenga <[>literal<]>.').pass, true);
  assert.ok(checks.evaluate(spec, 'Visite \uFFFD https://example.com.').failures.includes('invalid_utf8_or_control_byte'));
  assert.ok(checks.evaluate(spec, 'Visite \u0090 https://example.com.').failures.includes('invalid_utf8_or_control_byte'));
});

test('detects partial and duplicated brace markers without rejecting literal incomplete source markers', () => {
  const spec = { source: 'The meeting starts at 2 PM.' };
  for (const output of ['La reunión empieza a {2 y 2.', 'La reunión empieza a 2} y 2.']) {
    assert.ok(checks.evaluate(spec, output).failures.includes('synthetic_placeholder_leak'));
  }
  const literal = { source: 'Keep the exact literal markers {2} and {3 in this example.' };
  assert.equal(checks.evaluate(literal, 'Mantenga los marcadores {2} y {3 en este ejemplo.').pass, true);
  assert.equal(checks.evaluate(literal, 'Mantenga {2} {2} y {3.').pass, false);
  assert.equal(checks.evaluate({ source: 'Keep {2}.' }, 'Mantenga {2.').pass, false);
});

test('focused imports retain trusted rule/invariant metadata but reject unknown rules', () => {
  const regressions = require('./regressions.js');
  const source = { schemaVersion: 1, kind: 'translation-quality-corpus',
    source: 'en', target: 'es', cases: regressions.getCases('es') };
  const imported = checks.importCorpus(source).cases;
  assert.equal(imported.length, 28);
  assert.ok(imported.every(row => row.regressionRule && row.expectedInvariant));
  assert.deepEqual(imported.map(row => row.regressionRule), source.cases.map(row => row.regressionRule));
  assert.throws(() => checks.importCorpus({ ...source,
    cases: [{ ...source.cases[0], regressionRule: 'unknown' }] }), /Invalid regression/);
  assert.throws(() => checks.importCorpus({ ...source,
    cases: [{ ...source.cases[0], expectedInvariant: '' }] }), /Invalid expected/);
});

test('semantic review improvements/regressions are tracked independently without inventing verdicts', () => {
  const spec = { caseId: 'one', source: 'One message.' };
  const metadata = { complete: true, source: 'en', target: 'es',
    corpusHash: 'same', validatorVersion: checks.VERSION, harnessVersion: '8', compareStreaming: true };
  const baseline = { ...metadata, defects: [{ ...spec, output: '1.', pass: true, humanVerdict: 'defect',
    streaming: { output: '1.', pass: true, humanVerdict: 'acceptable' } }] };
  const current = { ...metadata, defects: [{ ...spec, output: 'Un mensaje.', pass: true, humanVerdict: 'acceptable',
    streaming: { output: '1.', pass: true, humanVerdict: 'defect' } }] };
  const comparison = checks.compare(current, baseline)[0];
  assert.equal(comparison.standard.state, 'semantic_improvement');
  assert.equal(comparison.streaming.state, 'semantic_regression');
  assert.equal(comparison.state, 'semantic_regression');
  assert.equal(comparison.standard.beforeVerdict, 'defect');
  assert.equal(comparison.standard.afterVerdict, 'acceptable');
  const unreviewed = { ...current, defects: [{ ...current.defects[0], humanVerdict: 'unreviewed' }] };
  assert.equal(checks.compare(unreviewed, baseline)[0].standard.state, 'semantic_review_changed');
  assert.equal(checks.compare(unreviewed, baseline)[0].standard.afterVerdict, 'unreviewed');
});

test('recorded noun loss, discount meaning and tenfold budget errors no longer look checks-clear', () => {
  const regressions = require('./regressions.js');
  const spec = (lang, source) => {
    const row = regressions.getCases(lang).find(testCase => testCase.source === source);
    assert.ok(row, `Missing public regression: ${lang} / ${source}`);
    return row;
  };
  const message = spec('es', '1 message remains unread.');
  assert.equal(checks.evaluate(message, '1 permanece sin leer.').pass, false);
  assert.equal(checks.evaluate(message, '1 mensaje permanece sin leer.').pass, true);
  const discount = spec('es', 'Get 15% off the sample bundle.');
  assert.equal(checks.evaluate(discount, 'Obtenga 15% del paquete de muestra.').pass, false);
  assert.equal(checks.evaluate(discount, 'Obtenga un 15% de descuento en el paquete de muestra.').pass, true);
  const japanese = spec('ja', 'The budget is $42 billion.');
  assert.equal(checks.evaluate(japanese, '予算は42億ドル。').pass, false);
  assert.equal(checks.evaluate(japanese, '予算は420億ドルです。').pass, true);
  const chinese = spec('zh-hans', 'The budget is $42 billion.');
  assert.equal(checks.evaluate(chinese, '预算为42亿美元。').pass, false);
  assert.equal(checks.evaluate(chinese, '预算为420亿美元。').pass, true);
  assert.equal(checks.evaluate(chinese, '预算为420亿美元。').status, 'needs_review');
});