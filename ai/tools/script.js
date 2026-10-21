// Browser Built-in AI Prompt API Tool Calling Demo

const DEFAULT_TOOLS = [
  {
    name: 'getWeather',
    description: 'Get the current weather for a city.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name to check.' },
      },
      required: ['location'],
    },
  },
  {
    name: 'getLocalTime',
    description: 'Get the current local time for a city.',
    inputSchema: {
      type: 'object',
      properties: {
        location: { type: 'string', description: 'City name to check.' },
      },
      required: ['location'],
    },
  },
  {
    name: 'lookupCatalog',
    description: 'Look up a product and its USD price in the catalog.',
    inputSchema: {
      type: 'object',
      properties: {
        product: { type: 'string', description: 'Product name or category.' },
      },
      required: ['product'],
    },
  },
  {
    name: 'convertCurrency',
    description: 'Convert an amount from one currency code to another.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Monetary amount to convert.' },
        from: { type: 'string', description: 'Source currency code (e.g. USD).' },
        to: { type: 'string', description: 'Target currency code (e.g. EUR, JPY).' },
      },
      required: ['amount', 'from', 'to'],
    },
  },
  {
    name: 'estimateShipping',
    description: 'Estimate delivery days and shipping cost to a destination city.',
    inputSchema: {
      type: 'object',
      properties: {
        destination: { type: 'string', description: 'Destination city.' },
      },
      required: ['destination'],
    },
  },
  {
    name: 'getServiceHealth',
    description: 'Check error rate, p95 latency, and on-call owner for a service.',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service identifier (e.g. translation-api, edge-ai).' },
      },
      required: ['service'],
    },
  },
];

const TOOL_PRESETS = {
  weatherTime: {
    prompt: 'What is the weather in Beijing and what time is it in Dublin, Ireland? Use your tools.',
    followUp: 'What is the weather in London and what time is it in Tokyo? Use your tools.',
  },
  commerce: {
    prompt: 'Look up "Surface Pro" in the catalog, convert $79 USD to EUR, and estimate shipping to Berlin.',
    followUp: 'Now look up "Edge AI Dock" in the catalog and estimate shipping to Seattle.',
  },
  incident: {
    prompt: 'Check the service health for "translation-api" and "edge-ai", and tell me what time it is in Seattle.',
    followUp: 'Also check the service health for "checkout-gateway" and the weather in Dublin.',
  },
};

const LOCAL_TOOL_EXECUTORS = {
  async getWeather({ location = 'unknown' } = {}) {
    const key = String(location).toLowerCase();
    const map = {
      beijing: { temperatureC: 19, condition: 'Sunny', humidity: 42 },
      dublin: { temperatureC: 13, condition: 'Breezy', humidity: 76 },
      ireland: { temperatureC: 13, condition: 'Breezy', humidity: 76 },
      london: { temperatureC: 15, condition: 'Light rain', humidity: 81 },
      seattle: { temperatureC: 12, condition: 'Overcast', humidity: 78 },
      tokyo: { temperatureC: 24, condition: 'Clear', humidity: 61 },
      berlin: { temperatureC: 16, condition: 'Partly cloudy', humidity: 68 },
    };
    const match = Object.keys(map).find((k) => key.includes(k));
    return {
      location,
      ...(match ? map[match] : { temperatureC: 20, condition: 'Partly cloudy', humidity: 55 }),
    };
  },
  async getLocalTime({ location = 'unknown' } = {}) {
    const key = String(location).toLowerCase();
    const map = {
      beijing: '18:30 CST',
      dublin: '11:30 IST',
      ireland: '11:30 IST',
      london: '11:30 BST',
      seattle: '03:30 PDT',
      tokyo: '19:30 JST',
      berlin: '12:30 CEST',
    };
    const match = Object.keys(map).find((k) => key.includes(k));
    return {
      location,
      localTime: match ? map[match] : '12:00 UTC',
    };
  },
  async lookupCatalog({ product = 'unknown' } = {}) {
    return {
      product,
      inStock: true,
      matches: [
        { sku: 'SKU-101', name: `${product} Standard`, priceUsd: 79 },
        { sku: 'SKU-202', name: `${product} Enterprise`, priceUsd: 149 },
      ],
    };
  },
  async convertCurrency({ amount = 100, from = 'USD', to = 'EUR' } = {}) {
    const rates = { EUR: 0.92, GBP: 0.79, JPY: 151.5, CAD: 1.36 };
    const rate = rates[String(to).toUpperCase()] || 1.0;
    return {
      amount: Number(amount),
      from: String(from).toUpperCase(),
      to: String(to).toUpperCase(),
      convertedAmount: Number((Number(amount) * rate).toFixed(2)),
      rate,
    };
  },
  async estimateShipping({ destination = 'unknown' } = {}) {
    return {
      destination,
      estimatedDays: 3,
      carrier: 'Priority Express',
      shippingUsd: 14.5,
    };
  },
  async getServiceHealth({ service = 'unknown' } = {}) {
    const key = String(service).toLowerCase();
    if (key.includes('translation')) {
      return { service, status: 'healthy', errorRatePct: 0.02, p95LatencyMs: 84, onCall: 'ai-platform@example.com' };
    }
    return { service, status: 'degraded', errorRatePct: 1.45, p95LatencyMs: 310, onCall: 'sre-oncall@example.com' };
  },
};

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function normalizePromptResult(result) {
  if (typeof result === 'string') {
    return { text: result, toolCalls: [], raw: result };
  }
  const parts = Array.isArray(result) ? result : [];
  const textParts = [];
  const toolCalls = [];
  for (const part of parts) {
    if (part?.type === 'text') {
      textParts.push(String(part.value ?? ''));
    } else if (part?.type === 'tool-call' && part.value) {
      toolCalls.push({
        callId: part.value.callId || `call-${toolCalls.length + 1}`,
        name: part.value.name,
        arguments: part.value.arguments || {},
        rawValue: part.value,
      });
    }
  }
  return {
    text: textParts.join(''),
    toolCalls,
    raw: parts,
  };
}

function buildToolResponseValue(callId, name, payload, isError = false) {
  if (!isError && typeof window !== 'undefined' && typeof window.LanguageModelToolSuccess === 'function') {
    return new window.LanguageModelToolSuccess({
      callId,
      name,
      result: [{ type: 'object', value: payload }],
    });
  }
  if (isError && typeof window !== 'undefined' && typeof window.LanguageModelToolError === 'function') {
    return new window.LanguageModelToolError({
      callId,
      name,
      errorMessage: String(payload),
    });
  }
  return isError
    ? { callId, name, errorMessage: String(payload) }
    : { callId, name, result: [{ type: 'object', value: payload }] };
}

async function executeLocalToolCall(toolCall) {
  const name = toolCall?.name || 'unknown';
  const callId = toolCall?.callId || 'call-1';
  const args = toolCall?.arguments || {};
  const fn = LOCAL_TOOL_EXECUTORS[name];
  if (!fn) {
    const errMsg = `No local executor registered for tool "${name}"`;
    return {
      callId,
      name,
      arguments: args,
      output: { error: errMsg },
      toolResponse: buildToolResponseValue(callId, name, errMsg, true),
    };
  }
  try {
    const output = await fn(args);
    return {
      callId,
      name,
      arguments: args,
      output,
      toolResponse: buildToolResponseValue(callId, name, output, false),
    };
  } catch (err) {
    const errMsg = err?.message || String(err);
    return {
      callId,
      name,
      arguments: args,
      output: { error: errMsg },
      toolResponse: buildToolResponseValue(callId, name, errMsg, true),
    };
  }
}

class ToolCallingDemo {
  constructor() {
    this.session = null;
    this.sessionKey = '';
    this.turnHistory = [];
    this.lastTranscriptJson = '';
    this.init();
  }

  init() {
    if ($('toolsSchemaInput')) {
      $('toolsSchemaInput').value = JSON.stringify(DEFAULT_TOOLS, null, 2);
    }
    this.loadPreset('weatherTime');
    this.wireEvents();
    this.checkAvailability();
  }

  wireEvents() {
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
    });

    $('runSingleTurnBtn')?.addEventListener('click', () => {
      const prompt = ($('userPrompt')?.value || '').trim();
      if (prompt) this.runTurn(prompt);
    });

    $('runFollowUpBtn')?.addEventListener('click', () => {
      const prompt = ($('followUpPrompt')?.value || '').trim();
      if (prompt) this.runTurn(prompt);
    });

    $('runTwoTurnBtn')?.addEventListener('click', () => this.runTwoTurnSequence());
    $('resetSessionBtn')?.addEventListener('click', () => this.resetSession());
    $('copyResultsBtn')?.addEventListener('click', async () => {
      if (this.lastTranscriptJson && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(this.lastTranscriptJson);
      }
    });
  }

  loadPreset(key) {
    const preset = TOOL_PRESETS[key];
    if (!preset) return;
    if ($('userPrompt')) $('userPrompt').value = preset.prompt;
    if ($('followUpPrompt')) $('followUpPrompt').value = preset.followUp;
  }

  setApiStatusBadge(state, text) {
    const indicator = $('statusIndicator');
    if (indicator) indicator.className = `status-indicator ${state}`;
    setText('statusText', text);
  }

  setBoxStatus(message, type = 'info') {
    const el = $('playgroundStatus');
    if (!el) return;
    if (!message) {
      el.className = 'result-box';
      el.textContent = '';
      return;
    }
    el.className = `result-box show ${type}`;
    el.textContent = message;
  }

  getLanguageModelNamespace() {
    if (typeof window !== 'undefined' && 'LanguageModel' in window) return window.LanguageModel;
    if (typeof self !== 'undefined' && 'LanguageModel' in self) return self.LanguageModel;
    return null;
  }

  parseToolsSchema() {
    const raw = ($('toolsSchemaInput')?.value || '').trim();
    const parsed = raw ? JSON.parse(raw) : DEFAULT_TOOLS;
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Tools schema must be a non-empty JSON array.');
    }
    return parsed;
  }

  async checkAvailability() {
    const lm = this.getLanguageModelNamespace();
    if (!lm) {
      this.setApiStatusBadge('unavailable', 'LanguageModel API not available');
      return 'unavailable';
    }
    try {
      const status = await lm.availability({
        expectedInputs: [{ type: 'tool-response' }],
        expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }],
      });
      if (status === 'available' || status === 'readily') {
        this.setApiStatusBadge('available', `Tool Calling Ready (${status})`);
      } else {
        this.setApiStatusBadge('checking', `Tool Calling: ${status}`);
      }
      return status;
    } catch (err) {
      this.setApiStatusBadge('unavailable', `Tool Calling unsupported (${err.message || err})`);
      return 'error';
    }
  }

  async ensureSession(forceNew = false) {
    const lm = this.getLanguageModelNamespace();
    if (!lm) throw new Error('window.LanguageModel is not exposed in this browser.');

    const tools = this.parseToolsSchema();
    const systemPrompt = ($('systemPrompt')?.value || '').trim();
    const key = JSON.stringify({ systemPrompt, tools });

    if (!forceNew && this.session && this.sessionKey === key) {
      return this.session;
    }

    if (this.session && typeof this.session.destroy === 'function') {
      try { this.session.destroy(); } catch { /* ignore */ }
    }
    this.session = null;
    this.turnHistory = [];

    const options = {
      temperature: 0.001,
      topK: 1,
      tools,
      expectedInputs: [{ type: 'tool-response' }],
      expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }],
    };
    if (systemPrompt) {
      options.initialPrompts = [{ role: 'system', content: systemPrompt }];
    }

    this.session = await lm.create(options);
    this.sessionKey = key;
    this.updateSessionBadge();
    return this.session;
  }

  updateSessionBadge() {
    if (!this.session) {
      setText('sessionInfoBox', 'No active session (created on first run)');
      return;
    }
    const usage = typeof this.session.contextUsage === 'number' ? `${this.session.contextUsage} tokens used` : 'active';
    setText('sessionInfoBox', `Session active · ${this.turnHistory.length} turn(s) completed · ${usage}`);
  }

  async resetSession() {
    if (this.session && typeof this.session.destroy === 'function') {
      try { this.session.destroy(); } catch { /* ignore */ }
    }
    this.session = null;
    this.sessionKey = '';
    this.turnHistory = [];
    if ($('turnCards')) $('turnCards').innerHTML = '';
    if ($('turnResultsSection')) $('turnResultsSection').style.display = 'none';
    this.updateSessionBadge();
    this.setBoxStatus('Session reset. Next turn will create a fresh session.', 'info');
  }

  async executeSingleToolTurn(session, promptText, turnNumber) {
    const t0 = performance.now();
    const firstResult = await session.prompt(promptText);
    const firstNormalized = normalizePromptResult(firstResult);

    const executedCalls = [];
    let finalAnswer = firstNormalized.text || '';
    let continuationRaw = null;

    if (firstNormalized.toolCalls.length > 0) {
      for (const tc of firstNormalized.toolCalls) {
        executedCalls.push(await executeLocalToolCall(tc));
      }

      const followUpMessage = [
        {
          role: 'user',
          content: executedCalls.map((item) => ({
            type: 'tool-response',
            value: item.toolResponse,
          })),
        },
      ];
      const secondResult = await session.prompt(followUpMessage);
      const secondNormalized = normalizePromptResult(secondResult);
      continuationRaw = secondNormalized.raw;
      finalAnswer = secondNormalized.text || JSON.stringify(secondNormalized.raw);
    }

    const elapsedMs = Math.max(1, Math.round(performance.now() - t0));
    const leakedDelimiter = /<\|?\/?tool_call\|?>/.test(finalAnswer);

    return {
      turn: turnNumber,
      prompt: promptText,
      toolCallCount: executedCalls.length,
      toolCalls: executedCalls.map(({ callId, name, arguments: args, output }) => ({
        callId,
        name,
        arguments: args,
        output,
      })),
      finalAnswer,
      leakedDelimiter,
      elapsedMs,
      firstRaw: firstNormalized.raw,
      continuationRaw,
    };
  }

  async runTurn(promptText) {
    try {
      this.setBoxStatus('Running tool-calling turn...', 'info');
      const session = await this.ensureSession(false);
      const turnRecord = await this.executeSingleToolTurn(session, promptText, this.turnHistory.length + 1);
      this.turnHistory.push(turnRecord);
      this.updateSessionBadge();
      this.renderTurnHistory();

      setText('timingMeta', `Turn ${turnRecord.turn}: ${turnRecord.toolCallCount} tool call(s) in ${turnRecord.elapsedMs} ms`);
      if (turnRecord.toolCallCount > 0 && !turnRecord.leakedDelimiter) {
        this.setBoxStatus(
          `Turn ${turnRecord.turn} succeeded: ${turnRecord.toolCallCount} tool call(s) executed and answered.`,
          'success'
        );
      } else if (turnRecord.leakedDelimiter) {
        this.setBoxStatus(
          `Turn ${turnRecord.turn} warning: raw tool-call delimiter leaked as plain text (${turnRecord.finalAnswer}).`,
          'error'
        );
      } else {
        this.setBoxStatus(`Turn ${turnRecord.turn} completed without tool calls.`, 'info');
      }
      return turnRecord;
    } catch (err) {
      this.setBoxStatus(`Tool-calling turn failed: ${err.message || err}`, 'error');
      throw err;
    }
  }

  async runTwoTurnSequence() {
    const p1 = ($('userPrompt')?.value || '').trim();
    const p2 = ($('followUpPrompt')?.value || '').trim();
    if (!p1 || !p2) {
      this.setBoxStatus('Enter both Turn 1 and Turn 2 prompts to run the 2-turn sequence.', 'error');
      return;
    }
    await this.resetSession();
    const r1 = await this.runTurn(p1);
    const r2 = await this.runTurn(p2);
    return [r1, r2];
  }

  renderTurnHistory() {
    const section = $('turnResultsSection');
    const stack = $('turnCards');
    if (!section || !stack) return;

    section.style.display = 'block';
    stack.innerHTML = '';

    for (const item of this.turnHistory) {
      const card = document.createElement('div');
      card.className = 'turn-card';

      const ok = item.toolCallCount > 0 && !item.leakedDelimiter;
      const badgeClass = ok ? 'pass' : 'fail';
      const badgeText = ok
        ? `${item.toolCallCount} Tool Call(s) · ${item.elapsedMs} ms`
        : item.leakedDelimiter
        ? 'Malformed Tool Delimiter'
        : `0 Tool Calls · ${item.elapsedMs} ms`;

      const callsHtml = item.toolCalls
        .map(
          (tc) => `
          <div class="tool-call-item">
            <div class="tool-call-item__head">
              <span>🔧 ${tc.name}</span>
              <code>${tc.callId}</code>
            </div>
            <div><strong>Args:</strong></div>
            <div class="tool-call-code">${JSON.stringify(tc.arguments)}</div>
            <div style="margin-top:0.35rem;"><strong>Result:</strong></div>
            <div class="tool-call-code">${JSON.stringify(tc.output)}</div>
          </div>`
        )
        .join('');

      card.innerHTML = `
        <div class="turn-card__header">
          <div class="turn-card__title">Turn ${item.turn}</div>
          <span class="turn-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="turn-prompt-line"><strong>Prompt:</strong> ${item.prompt}</div>
        ${callsHtml ? `<div class="tool-calls-grid">${callsHtml}</div>` : ''}
        <div class="turn-final-answer">${item.finalAnswer || '(empty response)'}</div>
      `;
      stack.appendChild(card);
    }

    this.lastTranscriptJson = JSON.stringify(this.turnHistory, null, 2);
    setText('rawJsonOutput', this.lastTranscriptJson);
    if ($('copyResultsBtn')) $('copyResultsBtn').disabled = false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.toolCallingDemo = new ToolCallingDemo();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ToolCallingDemo,
    DEFAULT_TOOLS,
    TOOL_PRESETS,
    LOCAL_TOOL_EXECUTORS,
    normalizePromptResult,
    executeLocalToolCall,
  };
}
