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

  context.window.DecisionModel = {
    async availability() {
      return 'available';
    },
    async create(options) {
      return {
        destroy() {},
        async decide(_input) {
          const out = {};
          for (const q of options.questions) {
            if (q.type === 'boolean') {
              out[q.id] = {
                id: q.id,
                label: 'true',
                confidence: 0.85,
                probabilities: { true: 0.85, false: 0.15 },
              };
            } else if (q.type === 'choice') {
              const opts = q.options || [{ label: 'a' }, { label: 'b' }];
              out[q.id] = {
                id: q.id,
                label: opts[0].label,
                confidence: 0.75,
                probabilities: { [opts[0].label]: 0.75, [opts[1].label]: 0.25 },
              };
            } else if (q.type === 'score') {
              out[q.id] = {
                id: q.id,
                label: '4',
                confidence: 0.5,
                expectedScore: 4.1,
                probabilities: { '1': 0.05, '2': 0.05, '3': 0.15, '4': 0.5, '5': 0.25 },
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

test('DecisionsDemo loads presets and runs createAndDecide', async () => {
  const { demo, getElement } = createDecisionsHarness();

  await demo.createAndDecide();
  assert.match(getElement('timingMeta').textContent, /3 questions/);
  assert.match(getElement('rawJsonOutput').textContent, /"urgent"/);
  assert.match(getElement('rawJsonOutput').textContent, /"expectedScore"/);
});