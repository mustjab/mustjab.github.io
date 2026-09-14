const assert = require('node:assert/strict');
const { test } = require('node:test');
const checks = require('./checks.js');

test('report cases cover the same missing scenarios for all three targets', () => {
  const cases = checks.cases.filter(row => row.caseId.startsWith('report:'));
  assert.equal(cases.length, 48);
  assert.equal(new Set(cases.map(row => row.caseId)).size, cases.length);
  for (const lang of ['es', 'ja', 'zh-hans']) {
    const selected = cases.filter(row => row.lang === lang);
    assert.equal(selected.length, 16);
    for (const source of ['12 MB', '12mb', '12MB', '208.96 MB', '12.34']) {
      assert.ok(selected.some(row => row.source === source));
    }
    assert.ok(selected.every(row => row.sourceLanguage === 'en'));
  }
});

test('brand translation is flagged and semantic tag placement remains a review obligation', () => {
  const brands = checks.cases.find(row => row.caseId === 'report:es:brands');
  assert.equal(checks.evaluate(brands, 'Abre YouTube, Discord y Twitch.').pass, true);
  assert.equal(checks.evaluate(brands, 'Abre YouTube, Discord y Contraccion.').pass, false);
  const tags = checks.cases.find(row => row.caseId === 'report:es:tag-meaning');
  const result = checks.evaluate(tags, 'Usa Windows 11 y la aplicacion <b10>GitHub</b10>.');
  assert.ok(result.review.includes('entire_translation_of_GitHub_app_inside_b10'));
  assert.equal(result.status, 'needs_review');
});

test('public cases have unique descriptive IDs rather than internal regression IDs', () => {
  assert.equal(new Set(checks.cases.map(row => row.caseId)).size, checks.cases.length);
  assert.ok(checks.cases.every(row => !row.caseId.startsWith('regression:')));
  assert.ok(checks.cases.every(row => row.segmentId === undefined && row.urlHash === undefined));
});

test('snapshot comparison includes streaming-only changes and rejects incompatible runs', () => {
  const row = { caseId: 'one', source: 'Hello', output: 'Hola', pass: true,
    streaming: { output: 'Hola', pass: true, failures: [] } };
  const prior = { complete: true, source: 'en', target: 'es', harnessVersion: '5', validatorVersion: checks.VERSION,
    corpusHash: 'one', compareStreaming: true, defects: [row] };
  const current = { ...prior, defects: [{ ...row, streaming: { ...row.streaming, output: 'Buenos dias' } }] };
  const comparison = checks.compare(current, prior)[0];
  assert.equal(comparison.state, 'changed_needs_review');
  assert.equal(comparison.streaming.changed, true);
  assert.throws(() => checks.compare(current, { ...prior, compareStreaming: false }), /execution modes/);
  assert.throws(() => checks.compare(current, { ...prior, defects: [{ ...row, streaming: { error: 'failed' } }] }), /execution errors/);
});