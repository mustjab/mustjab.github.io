'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const regressions = require('./regressions.js');

function spec(target, name) {
  const row = regressions.getCases(target).find(item => item.caseId === `focused:${name}`);
  assert(row);
  return row;
}

test('UMD exposes version1 and identical stable fifteen-case multilingual public corpora', () => {
  const context = {};
  vm.runInNewContext(fs.readFileSync(require.resolve('./regressions.js'), 'utf8'), context, {timeout: 1000});
  assert.equal(context.QualityRegressions.VERSION, '1');
  const ids = regressions.getCases('es').map(row => row.caseId);
  for (const target of ['es', 'ja', 'zh-hans']) {
    const cases = regressions.getCases(target);
    assert.equal(cases.length, 15);
    assert.deepEqual(cases.map(row => row.caseId), ids);
    assert(cases.every(row => row.sourceLanguage === 'en' && row.lang === target &&
      regressions.rules.includes(row.regressionRule) && row.expectedInvariant));
    assert.equal(spec(target, 'passages').source.length, 5950);
    assert.equal(spec(target, 'fields').source, 'Status\n Ready\n Count: 12\n Next update: tomorrow.');
    assert.deepEqual(cases.slice(-3).map(row => row.exactTokens[0]), ['Б', 'Ԁ', 'É']);
  }
  const altered = regressions.getCases('es');
  altered[2].exactTokens[0] = 'mutated';
  assert.equal(spec('es', 'opaque').exactTokens[0], 'support@example.com');
  assert.throws(() => regressions.getCases('fr'), /Unsupported/);
  assert.throws(() => regressions.evaluate({regressionRule: 'guess', lang: 'es'}, 'output'), /Unknown/);
  assert.throws(() => regressions.evaluate({regressionRule: 'budget', lang: 'fr'}, 'output'), /Unsupported/);
  assert.deepEqual(regressions.evaluate({}, 'output'), {failures: [], review: []});
});

test('departments require every numbered Monday-arrival association once and final cancellation/negation', () => {
  const fixtures = {
    es: {clause: id => `El paquete del departamento ${id} llega el lunes.`,
      final: 'El aviso final confirma la cancelación, no el retraso.'},
    ja: {clause: id => `部門${id}の小包は月曜日に到着します。`,
      final: '最終通知では遅延ではなくキャンセルを確認します。'},
    'zh-hans': {clause: id => `部门${id}的包裹将在星期一到达。`,
      final: '最终通知确认取消，而不是延期。'},
  };
  for (const [target, fixture] of Object.entries(fixtures)) {
    const clauses = Array.from({length: 30}, (_, i) => fixture.clause(i + 1));
    const row = spec(target, 'departments');
    assert.deepEqual(regressions.evaluate(row, clauses.join(' ') + fixture.final).failures, []);
    assert(regressions.evaluate(row, clauses.slice(1).join(' ') + fixture.final).failures.includes('department_clause_1: 0'));
    assert(regressions.evaluate(row, clauses.join(' ') + clauses[0] + fixture.final).failures.includes('department_clause_1: 2'));
    assert(regressions.evaluate(row, clauses.join(' ')).failures.includes('final_cancellation_negation'));
    assert(regressions.evaluate(row, clauses.join(' ') + fixture.clause(31) + fixture.final).failures.includes('unexpected_department'));
  }
  const kanji = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', '三十'];
  const japanese = kanji.map(id => `第${id}部門の小包は月曜日に届きます。`).join('') +
    fixtures.ja.final;
  assert.deepEqual(regressions.evaluate(spec('ja', 'departments'), japanese).failures, []);
});

test('long-passage keywords are development flags, never human semantic verdicts', () => {
  const row = spec('es', 'passages');
  const text = 'Atención y transformer. Tablas de alineación. Aplicaciones prácticas. Empresas internacionales.';
  const result = regressions.evaluate(row, text);
  assert.deepEqual(result.failures, []);
  assert(result.review.includes('full_passage_semantics_and_synonyms_need_review'));
  assert.equal('humanVerdict' in result, false);
  assert.equal(regressions.evaluate(row, 'Atención y transformer.').failures.length, 3);
});

test('discount versus percentage-of-price and 50-percent negation retain meaning flags', () => {
  for (const [target, good, bad] of [
    ['es', 'Obtenga un 15% de descuento.', 'Obtenga el 15% del paquete.'],
    ['ja', '15%割引です。', '15%の価格です。'],
    ['zh-hans', '享受8.5折优惠。', '价格是15%。'],
  ]) {
    assert.deepEqual(regressions.evaluate(spec(target, 'discount'), good).failures, []);
    assert(regressions.evaluate(spec(target, 'discount'), bad).failures.length);
  }
  for (const [target, good, bad] of [
    ['es', 'El precio bajó un 15%, no un 50%.', 'El precio bajó un 15% y un 50%.'],
    ['ja', '価格は50%ではなく15%下がりました。', '価格は15%と50%下がりました。'],
    ['zh-hans', '价格下降15%，而不是50%。', '价格下降15%和50%。'],
  ]) {
    assert.deepEqual(regressions.evaluate(spec(target, 'negation'), good).failures, []);
    assert(regressions.evaluate(spec(target, 'negation'), bad).failures.includes('percent_meaning_1'));
  }
});

test('budget binds magnitude to language scale, rejects known tenfold/million defects, reviews unknown wording', () => {
  for (const [target, good, bad] of [
    ['es', 'El presupuesto es de 42 mil millones de dólares.', 'El presupuesto es de 42 millones de dólares.'],
    ['es', 'El presupuesto es de 42.000 millones de dólares.', 'El presupuesto es de 42 billones de dólares.'],
    ['ja', '予算は420億ドルです。', '予算は42億ドルです。'],
    ['ja', '予算は四百二十億米ドルです。', '予算は四十二億ドルです。'],
    ['zh-hans', '预算为420亿美元。', '预算为42亿美元。'],
    ['zh-hans', '预算为四百二十亿美元。', '预算为四十二亿美元。'],
  ]) {
    const goodResult = regressions.evaluate(spec(target, 'budget'), good);
    assert.deepEqual(goodResult.failures, []);
    assert(!goodResult.review.some(topic => topic.includes('unrecognized')));
    assert(regressions.evaluate(spec(target, 'budget'), bad).failures.includes('budget_wrong_magnitude'));
    assert(spec(target, 'budget').expectedInvariant.includes('42,000,000,000'));
  }
  const ambiguous = regressions.evaluate(spec('ja', 'budget'), '42 billion USD');
  assert(ambiguous.review.includes('budget_english_scale_carryover_needs_review'));
  const unbound = regressions.evaluate(spec('ja', 'budget'), '予算は42です。億ドルを検討します。');
  assert(unbound.review.includes('budget_magnitude_unrecognized_needs_review'));
  assert(regressions.evaluate(spec('es', 'budget'), '42 cosas y mil millones de dólares').review.includes('budget_magnitude_unrecognized_needs_review'));
  const otherSource = regressions.evaluate({...spec('es', 'budget'), source: 'The budget is $4 billion.'},
    'El presupuesto es de cuatro mil millones de dólares.');
  assert(otherSource.review.includes('budget_rule_requires_controlled_42_billion_source'));
  assert.deepEqual(otherSource.failures, []);
});

test('message quantity is not a detached number or identifier; entity and unread role remain visible', () => {
  for (const [target, good, bad] of [
    ['es', '1 mensaje permanece sin leer.', '1 permanece sin leer.'],
    ['ja', '未読のメッセージが1件あります。', '1件が未読です。'],
    ['zh-hans', '有1条消息未读。', '1条未读。'],
  ]) {
    assert.deepEqual(regressions.evaluate(spec(target, 'message'), good).failures, []);
    assert(regressions.evaluate(spec(target, 'message'), bad).failures.includes('message_entity_missing'));
  }
  assert(regressions.evaluate(spec('es', 'message'), 'El mensaje número 1 está sin leer.').failures.includes('message_quantity_replaced_by_identifier'));
  assert(regressions.evaluate(spec('es', 'message'), '2 mensajes siguen sin leer.').failures.includes('message_quantity_unrecognized'));
});

test('bank, idiom, fields and date keep mandatory review and only targeted defect flags', () => {
  assert(regressions.evaluate(spec('es', 'bank'), 'La orilla cerca del río cerró temprano.').failures.includes('financial_bank_replaced_by_riverbank'));
  assert.deepEqual(regressions.evaluate(spec('es', 'bank'), 'El banco cerca de la orilla cerró temprano.').failures, []);
  assert(regressions.evaluate(spec('es', 'idiom'), 'Llueven gatos y perros afuera.').failures.includes('literal_raining_animals'));
  assert.deepEqual(regressions.evaluate(spec('es', 'idiom'), 'No llueven gatos y perros; llueve mucho.').failures, []);
  assert(regressions.evaluate(spec('es', 'fields'), 'Estado: Listacaba la próxima actualización: mañana. 12').failures.includes('four_field_lines_not_preserved'));
  assert(regressions.evaluate(spec('es', 'fields'), 'Estado\nListo\nReferencia: 12\nPróxima actualización: mañana.').failures.includes('invented_reference_field'));
  assert(regressions.evaluate(spec('es', 'fields'), 'Estado\nListo\nListo\nPróxima actualización: mañana.').failures.includes('repeated_field_line'));
  for (const name of ['bank', 'idiom', 'fields', 'datetime', 'opaque', 'literal-braces']) {
    const result = regressions.evaluate(spec('es', name), spec('es', name).source);
    assert(result.review.includes('expected_invariant_requires_human_review'));
    assert.equal('humanVerdict' in result, false);
  }
});
