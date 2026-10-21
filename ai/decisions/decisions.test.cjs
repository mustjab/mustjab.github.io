'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createDecisionsHarness() {
  const elements = new Map();
  let clipboardText = '';

  const getElement = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        disabled: false,
        dataset: {},
        style: { display: 'none', width: '0%' },
        className: '',
        children: [],
        handlers: {},
        addEventListener(type, fn) {
          this.handlers[type] = fn;
        },
        appendChild(child) {
          this.children.push(child);
        },
      });
    }
    return elements.get(id);
  };

  const context = vm.createContext({
    document: {
      addEventListener() {},
      getElementById: getElement,
      querySelectorAll() {
        return [];
      },
      createElement(tag) {
        return {
          tag,
          className: '',
          textContent: '',
          innerHTML: '',
          style: {},
          dataset: {},
          children: [],
          addEventListener() {},
          appendChild(child) {
            this.children.push(child);
          },
        };
      },
    },
    navigator: {
      clipboard: {
        async writeText(text) {
          clipboardText = text;
        },
      },
    },
    performance: { now: () => 250 },
    setTimeout(fn) {
      fn();
      return 1;
    },
    TypeError,
    console: { log() {}, warn() {}, error() {} },
    module: { exports: {} },
  });

  context.window = context;
  context.window.isSecureContext = true;

  context.window.DecisionModel = {
    async availability() {
      return 'available';
    },
    async create(options) {
      if (!options || !Array.isArray(options.questions) || options.questions.length === 0) {
        throw new TypeError('At least one question is required.');
      }
      let destroyed = false;
      const isStrict = (options.context || '').includes("Always classify requests mentioning 'refund' as urgent=true");
      return {
        preference: 'default',
        destroy() {
          destroyed = true;
        },
        async decide(_input) {
          if (destroyed) {
            const err = new Error('Session has been destroyed.');
            err.name = 'InvalidStateError';
            throw err;
          }
          const out = {};
          for (const q of options.questions) {
            if (q.type === 'boolean') {
              const pTrue = isStrict ? 0.96 : 0.82;
              const pFalse = Number((1 - pTrue).toFixed(4));
              out[q.id] = {
                id: q.id,
                label: pTrue >= 0.5 ? 'true' : 'false',
                confidence: Math.max(pTrue, pFalse),
                probabilities: { true: pTrue, false: pFalse },
              };
            } else if (q.type === 'choice') {
              const opts = q.options || [{ label: 'a' }, { label: 'b' }];
              const probs = {};
              const topProb = 0.75;
              const rem = opts.length > 1 ? 0.25 / (opts.length - 1) : 0;
              opts.forEach((o, idx) => {
                probs[o.label] = idx === 0 ? topProb : rem;
              });
              out[q.id] = {
                id: q.id,
                label: opts[0].label,
                confidence: topProb,
                probabilities: probs,
              };
            } else if (q.type === 'score') {
              const opts = q.options || [
                { label: '1' },
                { label: '2' },
                { label: '3' },
                { label: '4' },
                { label: '5' },
              ];
              const probs = {};
              const pEach = 1 / opts.length;
              let expectedScore = 0;
              opts.forEach((o) => {
                probs[o.label] = pEach;
                expectedScore += Number(o.label) * pEach;
              });
              out[q.id] = {
                id: q.id,
                label: opts[opts.length - 1].label,
                confidence: pEach,
                expectedScore,
                probabilities: probs,
              };
            }
          }
          return out;
        },
      };
    },
  };

  const scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  vm.runInContext(scriptCode, context);

  const { DecisionsDemo, DECISION_PRESETS } = context.module.exports;
  const demo = new DecisionsDemo();
  return { demo, getElement, getClipboard: () => clipboardText, DECISION_PRESETS };
}

test('DecisionsDemo loads presets, runs createAndDecide, and executes full E2E validation suite', async () => {
  const { demo, getElement } = createDecisionsHarness();

  await demo.createAndDecide();
  assert.equal(getElement('metricQuestions').textContent, '3');
  assert.match(getElement('rawJsonOutput').textContent, /"urgent"/);
  assert.match(getElement('rawJsonOutput').textContent, /"expectedScore"/);

  await demo.runValidationSuite();
  assert.equal(getElement('suitePassed').textContent, '5');
  assert.equal(getElement('suiteFailed').textContent, '0');
  assert.match(getElement('suiteSummaryBox').textContent, /All 5\/5 E2E validation checks passed/);
});