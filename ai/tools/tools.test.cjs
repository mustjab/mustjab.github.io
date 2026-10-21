'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

test('ToolCallingDemo runs multi-tool Turn 1 and Turn 2 sequence on the same session', async () => {
  const elements = new Map();
  const getEl = (id) => {
    if (!elements.has(id)) {
      elements.set(id, {
        id,
        value: '',
        textContent: '',
        innerHTML: '',
        disabled: false,
        className: '',
        dataset: {},
        style: { display: 'none' },
        addEventListener() {},
        appendChild() {},
      });
    }
    return elements.get(id);
  };

  let createCalls = 0;
  const promptCalls = [];

  const sandbox = {
    document: {
      getElementById: getEl,
      querySelectorAll: () => [],
      createElement: () => ({
        className: '',
        textContent: '',
        innerHTML: '',
        appendChild() {},
      }),
      addEventListener() {},
    },
    navigator: { clipboard: { writeText: async () => {} } },
    performance: { now: () => 1000 },
    console,
    module: { exports: {} },
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.window.LanguageModelToolSuccess = class {
    constructor(init) { Object.assign(this, init); }
  };
  sandbox.window.LanguageModelToolError = class {
    constructor(init) { Object.assign(this, init); }
  };
  sandbox.window.LanguageModel = {
    availability: async () => 'available',
    create: async () => {
      createCalls += 1;
      return {
        contextUsage: 142,
        destroy() {},
        prompt: async (input) => {
          promptCalls.push(input);
          if (typeof input === 'string' && input.includes('Beijing')) {
            return [
              { type: 'tool-call', value: { callId: 'c1', name: 'getWeather', arguments: { location: 'Beijing' } } },
              { type: 'tool-call', value: { callId: 'c2', name: 'getLocalTime', arguments: { location: 'Dublin' } } },
            ];
          }
          if (typeof input === 'string' && input.includes('London')) {
            return [
              { type: 'tool-call', value: { callId: 'c3', name: 'getWeather', arguments: { location: 'London' } } },
              { type: 'tool-call', value: { callId: 'c4', name: 'getLocalTime', arguments: { location: 'Tokyo' } } },
            ];
          }
          return [{ type: 'text', value: 'Synthesized tool answer.' }];
        },
      };
    },
  };

  const code = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  vm.runInNewContext(code, sandbox);

  const demo = new sandbox.module.exports.ToolCallingDemo();
  const [turn1, turn2] = await demo.runTwoTurnSequence();

  assert.equal(createCalls, 1, 'Turn 1 and Turn 2 should share a single LanguageModel session');
  assert.equal(turn1.toolCallCount, 2);
  assert.equal(turn2.toolCallCount, 2);
  assert.equal(turn1.leakedDelimiter, false);
  assert.equal(turn2.leakedDelimiter, false);
  assert.equal(promptCalls.length, 4);
});
