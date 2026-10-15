'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createE2EHarness() {
  const elements = new Map();
  let clipboardText = '';
  const calls = [];

  const getElement = (id) => {
    if (!elements.has(id)) {
      const defaults = {
        inputText: '',
        systemPrompt: 'Analyze the text.',
        writerTaskPrompt: 'Draft a follow-up:',
        sumType: 'key-points',
        sumLength: 'medium',
        sumFormat: 'markdown',
        rewriterTone: 'more-formal',
        rewriterLength: 'as-is',
        rewriterFormat: 'as-is',
        writerTone: 'neutral',
        writerLength: 'short',
        writerFormat: 'markdown',
        translateSourceStage: 'all',
        sourceLanguage: 'auto',
        targetLanguage: 'es',
        translateMode: 'whole',
      };
      elements.set(id, {
        id,
        value: defaults[id] ?? '',
        checked: id.startsWith('enable') || id === 'chainProofread',
        textContent: '',
        innerHTML: '',
        disabled: false,
        dataset: {},
        style: { display: 'none', width: '0%' },
        className: '',
        classList: { add() {}, remove() {}, toggle() {} },
        handlers: {},
        addEventListener(type, fn) { this.handlers[type] = fn; },
        setAttribute() {},
        getAttribute() { return '0'; },
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
      querySelectorAll() { return []; },
      createDocumentFragment() { return { appendChild() {} }; },
      createElement() {
        return {
          className: '',
          textContent: '',
          innerHTML: '',
          style: {},
          setAttribute() {},
          addEventListener() {},
          appendChild() {},
        };
      },
    },
    navigator: {
      clipboard: {
        async writeText(text) { clipboardText = text; },
      },
    },
    performance: { now: () => 100 },
    AbortController,
    Event: class { constructor(type) { this.type = type; } },
    setTimeout(fn) { fn(); return 1; },
    console: { log() {}, warn() {}, error() {} },
    module: { exports: {} },
  });

  context.window = context;
  context.window.addEventListener = () => {};

  context.window.LanguageDetector = {
    async availability() { return 'available'; },
    async create() {
      return {
        async detect(input) {
          calls.push({ api: 'lid', input });
          return [{ detectedLanguage: 'en', confidence: 0.99 }];
        },
      };
    },
  };

  context.window.Proofreader = {
    async availability() { return 'available'; },
    async create() {
      return {
        async proofread(input) {
          calls.push({ api: 'proofreader', input });
          return {
            correctedInput: input.replace('anounce', 'announce'),
            corrections: [{ correctionType: 'spelling', originalText: 'anounce', replacementText: 'announce' }],
          };
        },
      };
    },
  };

  context.window.Summarizer = {
    async availability() { return 'available'; },
    async create() {
      return {
        async *summarizeStreaming(input) {
          calls.push({ api: 'summarizer', input });
          yield '- Key point 1\n';
          yield '- Key point 2';
        },
      };
    },
  };

  context.window.Rewriter = {
    async availability() { return 'available'; },
    async create() {
      return {
        async *rewriteStreaming(input) {
          calls.push({ api: 'rewriter', input });
          yield `Polished: ${input}`;
        },
      };
    },
  };

  context.window.Writer = {
    async availability() { return 'available'; },
    async create() {
      return {
        async *writeStreaming(input) {
          calls.push({ api: 'writer', input });
          yield `Action plan for: ${input.split('\n').pop()}`;
        },
      };
    },
  };

  context.window.LanguageModel = {
    async availability() { return 'available'; },
    async create() {
      return {
        async *promptStreaming(input) {
          calls.push({ api: 'prompt', input });
          yield `Takeaways for: ${input}`;
        },
      };
    },
  };

  context.window.Translator = {
    async availability() { return 'available'; },
    async create({ sourceLanguage, targetLanguage }) {
      return {
        async translate(input) {
          calls.push({ api: 'translator', sourceLanguage, targetLanguage, input });
          return `[${targetLanguage}] ${input}`;
        },
      };
    },
  };

  const scriptCode = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
  vm.runInContext(scriptCode, context);

  const { E2EPlayground, PRESETS } = context.module.exports;
  const pg = new E2EPlayground();

  return { pg, getElement, calls, getClipboard: () => clipboardText, PRESETS };
}

test('single input runs all 7 Built-in AI APIs end-to-end and chains Proofreader output', async () => {
  const { pg, getElement, calls, getClipboard } = createE2EHarness();

  getElement('inputText').value = 'We are thrilled to anounce v2.8.15 today.';
  await pg.runAllPipeline();

  assert.equal(getElement('pipelineStatus').textContent, 'Complete');
  assert.equal(getElement('pipelineStagesDone').textContent, '7 / 7');
  assert.equal(pg.detectedLanguageCode, 'en');
  assert.equal(pg.stageOutputs.proofreader, 'We are thrilled to announce v2.8.15 today.');

  // Because chainProofread is checked, downstream tasks receive the proofread text ('announce', not 'anounce')
  const summarizerCall = calls.find(c => c.api === 'summarizer');
  assert.equal(summarizerCall.input, 'We are thrilled to announce v2.8.15 today.');
  assert.equal(pg.stageOutputs.summarizer, '- Key point 1\n- Key point 2');
  assert.equal(pg.stageOutputs.rewriter, 'Polished: We are thrilled to announce v2.8.15 today.');
  assert.match(pg.stageOutputs.writer, /Action plan for: We are thrilled to announce v2\.8\.15 today\./);
  assert.equal(pg.stageOutputs.prompt, 'Takeaways for: We are thrilled to announce v2.8.15 today.');

  // Translator translates all generated sections concurrently when translateSourceStage === 'all'
  assert.match(pg.stageOutputs.translator, /\[Source Input\]\n\[es\] We are thrilled to announce v2\.8\.15 today\./);
  assert.match(pg.stageOutputs.translator, /\[Summary\]\n\[es\] - Key point 1/);
  assert.match(pg.stageOutputs.translator, /\[Rewritten\]\n\[es\] Polished:/);

  await pg.copyFullReport();
  assert.match(getClipboard(), /Built-in AI End-to-End Pipeline Report/);
  assert.match(getClipboard(), /── Summarizer ──/);
  assert.match(getClipboard(), /── Translator ──/);
});
