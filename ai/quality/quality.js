// Prompt API Quality Benchmark (MMLU Subset + Tool Calling + Structured Constraints)
(function () {
  'use strict';

  const MMLU_CASES = [
    {
      id: 'mmlu:physics-kepler',
      category: 'MMLU - Astronomy',
      question: 'According to Kepler’s third law, the square of a planet’s orbital period is proportional to what power of the semi-major axis of its orbit?',
      choices: ['First power', 'Second power', 'Third power', 'Fourth power'],
      answer: 2,
    },
    {
      id: 'mmlu:cs-binary-search',
      category: 'MMLU - Computer Science',
      question: 'What is the worst-case time complexity of binary search on a sorted array of n elements?',
      choices: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 1,
    },
    {
      id: 'mmlu:bio-mitochondria',
      category: 'MMLU - Biology',
      question: 'Which cellular organelle is primarily responsible for producing ATP through oxidative phosphorylation?',
      choices: ['Golgi apparatus', 'Lysosome', 'Mitochondrion', 'Endoplasmic reticulum'],
      answer: 2,
    },
    {
      id: 'mmlu:chem-ph',
      category: 'MMLU - Chemistry',
      question: 'A solution with a hydrogen ion concentration of 1.0 × 10^-3 M at 25°C has a pH of:',
      choices: ['1', '3', '7', '11'],
      answer: 1,
    },
    {
      id: 'mmlu:math-derivative',
      category: 'MMLU - Mathematics',
      question: 'What is the derivative of f(x) = x^3 - 4x + 7 with respect to x?',
      choices: ['3x^2 - 4', '3x^2 + 7', 'x^2 - 4', '3x - 4'],
      answer: 0,
    },
    {
      id: 'mmlu:econ-elasticity',
      category: 'MMLU - Microeconomics',
      question: 'If a 10% increase in price leads to a 20% decrease in quantity demanded, the price elasticity of demand (in absolute value) is:',
      choices: ['0.5', '1.0', '2.0', '10.0'],
      answer: 2,
    },
    {
      id: 'mmlu:law-jurisdiction',
      category: 'MMLU - Constitutional Law',
      question: 'Under Article III of the U.S. Constitution, the Supreme Court has original jurisdiction in cases involving:',
      choices: ['All federal tax disputes', 'Ambassadors and cases in which a State is a party', 'All patent infringement appeals', 'Municipal ordinance violations'],
      answer: 1,
    },
    {
      id: 'mmlu:cs-http-status',
      category: 'MMLU - Web Engineering',
      question: 'Which HTTP status code indicates that the client must authenticate itself to get the requested response (Unauthorized)?',
      choices: ['200', '301', '401', '500'],
      answer: 2,
    },
    {
      id: 'mmlu:stats-normal',
      category: 'MMLU - Statistics',
      question: 'In a standard normal distribution, approximately what percentage of values lie within one standard deviation of the mean?',
      choices: ['50%', '68%', '95%', '99.7%'],
      answer: 1,
    },
    {
      id: 'mmlu:logic-contrapositive',
      category: 'MMLU - Formal Logic',
      question: 'Which statement is logically equivalent (the contrapositive) to "If it is raining, then the ground is wet"?',
      choices: [
        'If the ground is wet, then it is raining.',
        'If it is not raining, then the ground is not wet.',
        'If the ground is not wet, then it is not raining.',
        'It is raining and the ground is not wet.',
      ],
      answer: 2,
    },
    {
      id: 'mmlu:physics-ohm',
      category: 'MMLU - Physics',
      question: 'If a 12-volt battery is connected across a 4-ohm resistor, what is the current flowing through the resistor?',
      choices: ['0.33 A', '3 A', '8 A', '48 A'],
      answer: 1,
    },
    {
      id: 'mmlu:cs-tcp-udp',
      category: 'MMLU - Computer Networks',
      question: 'Which transport-layer protocol provides connection-oriented, reliable, ordered byte-stream delivery?',
      choices: ['UDP', 'ICMP', 'TCP', 'ARP'],
      answer: 2,
    },
    {
      id: 'mmlu:history-printing',
      category: 'MMLU - World History',
      question: 'Who introduced mechanical movable-type printing to Europe in the 15th century?',
      choices: ['Johannes Gutenberg', 'Galileo Galilei', 'Isaac Newton', 'Martin Luther'],
      answer: 0,
    },
    {
      id: 'mmlu:med-insulin',
      category: 'MMLU - Physiology',
      question: 'Insulin is secreted by which cells of the pancreas in response to elevated blood glucose?',
      choices: ['Alpha cells', 'Beta cells', 'Delta cells', 'Acinar cells'],
      answer: 1,
    },
    {
      id: 'mmlu:cs-deadlock',
      category: 'MMLU - Operating Systems',
      question: 'Which of the following is NOT one of Coffman’s four necessary conditions for deadlock?',
      choices: ['Mutual exclusion', 'Hold and wait', 'Preemption', 'Circular wait'],
      answer: 2,
    },
  ];

  const TOOL_AND_CONSTRAINT_CASES = [
    {
      id: 'constraint:json-object',
      kind: 'constraint',
      category: 'Structured Output (responseConstraint)',
      prompt: 'Extract the product name "Surface Laptop 7" and price 1299 into JSON.',
      schema: {
        type: 'object',
        properties: {
          product: { type: 'string' },
          price: { type: 'number' },
        },
        required: ['product', 'price'],
        additionalProperties: false,
      },
      validate(output) {
        const parsed = JSON.parse(output);
        const pass =
          typeof parsed.product === 'string' &&
          parsed.product.toLowerCase().includes('surface') &&
          Number(parsed.price) === 1299;
        return { pass, detail: pass ? 'Valid JSON matching schema & values' : `Unexpected fields: ${output}` };
      },
    },
    {
      id: 'constraint:exact-three-bullets',
      kind: 'instruction',
      category: 'Instruction Adherence',
      prompt: 'List exactly 3 primary colors, one per line, starting each line with "- ". Output nothing else.',
      validate(output) {
        const lines = output.trim().split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const pass = lines.length === 3 && lines.every(l => /^[-*•]/.test(l));
        return { pass, detail: `Emitted ${lines.length} bullet lines` };
      },
    },
    {
      id: 'constraint:negative-no-apology',
      kind: 'instruction',
      category: 'Negative Constraint',
      prompt: 'State the capital of Japan in one sentence without using the word "Tokyo" — use "the eastern capital" instead.',
      validate(output) {
        const hasForbidden = /\btokyo\b/i.test(output);
        const pass = !hasForbidden && output.trim().length > 5;
        return { pass, detail: pass ? 'Omitted forbidden word "Tokyo"' : 'Violated negative constraint ("Tokyo" found)' };
      },
    },
    {
      id: 'constraint:json-array-classification',
      kind: 'constraint',
      category: 'Structured Output (responseConstraint)',
      prompt: 'Classify the sentiment of "The battery lasts all day and the screen is crisp!" as positive, neutral, or negative.',
      schema: {
        type: 'object',
        properties: {
          sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
        },
        required: ['sentiment'],
      },
      validate(output) {
        const parsed = JSON.parse(output);
        const pass = parsed.sentiment === 'positive';
        return { pass, detail: `sentiment=${parsed.sentiment}` };
      },
    },
    {
      id: 'tool:single-weather',
      kind: 'tool',
      category: 'Tool Calling - Single Tool',
      prompt: 'What is the current weather in Seattle? Use the available tool.',
      expectedTools: ['getWeather'],
      expectedArgMatch: /seattle/i,
    },
    {
      id: 'tool:single-currency',
      kind: 'tool',
      category: 'Tool Calling - Numeric Args',
      prompt: 'Convert 250 USD to JPY using the currency conversion tool.',
      expectedTools: ['convertCurrency'],
      expectedArgMatch: /250/,
    },
    {
      id: 'tool:multi-weather-time',
      kind: 'tool',
      category: 'Tool Calling - Multi-Tool',
      prompt: 'Check the weather in Beijing and the local time in Dublin using your tools.',
      expectedTools: ['getWeather', 'getLocalTime'],
      expectedArgMatch: /beijing|dublin/i,
    },
    {
      id: 'tool:service-health',
      kind: 'tool',
      category: 'Tool Calling - Identifier Args',
      prompt: 'Check the service health for "translation-api" using the health tool.',
      expectedTools: ['getServiceHealth'],
      expectedArgMatch: /translation-api/i,
    },
    {
      id: 'tool:catalog-lookup',
      kind: 'tool',
      category: 'Tool Calling - String Args',
      prompt: 'Look up "Surface Pro" in the product catalog.',
      expectedTools: ['lookupCatalog'],
      expectedArgMatch: /surface/i,
    },
    {
      id: 'tool:no-spurious-call',
      kind: 'tool-negative',
      category: 'Tool Calling - Restraint',
      prompt: 'What is 12 multiplied by 12? Answer directly without calling any weather or catalog tools.',
      expectedAnswerMatch: /\b144\b/,
    },
  ];

  function getLanguageModel() {
    if (typeof window.LanguageModel !== 'undefined') return window.LanguageModel;
    if (window.ai && window.ai.languageModel) return window.ai.languageModel;
    return null;
  }

  let running = false;
  let lastSummary = null;

  function setStatus(state, text) {
    const ind = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    if (ind) ind.className = 'status-indicator ' + state;
    if (txt) txt.textContent = text;
  }

  async function checkAvailability() {
    const lm = getLanguageModel();
    if (!lm) {
      setStatus('unavailable', 'Prompt API (LanguageModel) not detected');
      return;
    }
    try {
      const avail = typeof lm.availability === 'function' ? await lm.availability() : 'available';
      setStatus(avail === 'available' || avail === 'readily' ? 'available' : '', `Model: ${avail}`);
    } catch (e) {
      setStatus('unavailable', e.message);
    }
  }

  function buildToolsWithSpy(invocations) {
    const defs = [
      {
        name: 'getWeather',
        description: 'Get the current weather for a city.',
        inputSchema: { type: 'object', properties: { location: { type: 'string' } }, required: ['location'] },
        execute(args) {
          invocations.push({ name: 'getWeather', args });
          return JSON.stringify({ location: args?.location || 'Seattle', tempC: 19, condition: 'Sunny' });
        },
      },
      {
        name: 'getLocalTime',
        description: 'Get the current local time for a city.',
        inputSchema: { type: 'object', properties: { location: { type: 'string' } }, required: ['location'] },
        execute(args) {
          invocations.push({ name: 'getLocalTime', args });
          return JSON.stringify({ location: args?.location || 'Dublin', time: '14:30' });
        },
      },
      {
        name: 'convertCurrency',
        description: 'Convert an amount from one currency code to another.',
        inputSchema: {
          type: 'object',
          properties: { amount: { type: 'number' }, from: { type: 'string' }, to: { type: 'string' } },
          required: ['amount', 'from', 'to'],
        },
        execute(args) {
          invocations.push({ name: 'convertCurrency', args });
          return JSON.stringify({ converted: (Number(args?.amount) || 250) * 150, to: args?.to || 'JPY' });
        },
      },
      {
        name: 'getServiceHealth',
        description: 'Check error rate and latency for a service.',
        inputSchema: { type: 'object', properties: { service: { type: 'string' } }, required: ['service'] },
        execute(args) {
          invocations.push({ name: 'getServiceHealth', args });
          return JSON.stringify({ service: args?.service, status: 'healthy', p95Ms: 42 });
        },
      },
      {
        name: 'lookupCatalog',
        description: 'Look up a product in the catalog.',
        inputSchema: { type: 'object', properties: { product: { type: 'string' } }, required: ['product'] },
        execute(args) {
          invocations.push({ name: 'lookupCatalog', args });
          return JSON.stringify({ product: args?.product, priceUsd: 999, inStock: true });
        },
      },
    ];
    return defs;
  }

  async function runMmluCase(lm, item) {
    const letters = ['A', 'B', 'C', 'D'];
    const choicesText = item.choices.map((c, idx) => `${letters[idx]}. ${c}`).join('\n');
    const promptText = `Respond with a single letter option only (A, B, C, or D), no explanation.\n\nQuestion: ${item.question}\nChoices:\n${choicesText}\nAnswer:`;
    const session = await lm.create({ temperature: 1.0, topK: 1 });
    let raw = '';
    try {
      raw = (await session.prompt(promptText)).trim();
    } finally {
      if (typeof session.destroy === 'function') session.destroy();
    }
    const expectedLetter = letters[item.answer];
    const match = raw.match(/^\s*([A-D])\b/i) || raw.match(/\b([A-D])\s*[.)]?$/i);
    const chosen = match ? match[1].toUpperCase() : null;
    const isInvalid = !chosen;
    const pass = chosen === expectedLetter;
    return {
      id: item.id,
      category: item.category,
      prompt: item.question,
      output: raw,
      pass,
      isInvalid,
      detail: `Expected ${expectedLetter} (${item.choices[item.answer]}), got ${chosen || 'non-letter'}`,
    };
  }

  async function runToolOrConstraintCase(lm, item) {
    if (item.kind === 'constraint' || item.kind === 'instruction') {
      const session = await lm.create({ temperature: 1.0, topK: 1 });
      let raw = '';
      try {
        const opts = item.schema ? { responseConstraint: item.schema } : undefined;
        raw = (await session.prompt(item.prompt, opts)).trim();
      } finally {
        if (typeof session.destroy === 'function') session.destroy();
      }
      try {
        const res = item.validate(raw);
        return {
          id: item.id,
          category: item.category,
          prompt: item.prompt,
          output: raw,
          pass: res.pass,
          isInvalid: !res.pass && item.kind === 'constraint',
          detail: res.detail,
        };
      } catch (err) {
        return {
          id: item.id,
          category: item.category,
          prompt: item.prompt,
          output: raw,
          pass: false,
          isInvalid: true,
          detail: `JSON parse / validation error: ${err.message}`,
        };
      }
    }

    const invocations = [];
    const tools = buildToolsWithSpy(invocations);
    const session = await lm.create({ temperature: 1.0, topK: 1, tools });
    let raw = '';
    try {
      raw = String(await session.prompt(item.prompt)).trim();
    } finally {
      if (typeof session.destroy === 'function') session.destroy();
    }

    const calledNames = invocations.map(inv => inv.name);
    const serializedInvs = JSON.stringify(invocations);

    if (item.kind === 'tool-negative') {
      const noSpurious = calledNames.length === 0;
      const ansOk = item.expectedAnswerMatch.test(raw);
      const pass = noSpurious && ansOk;
      return {
        id: item.id,
        category: item.category,
        prompt: item.prompt,
        output: raw,
        pass,
        isInvalid: !noSpurious,
        detail: `Tools called: ${calledNames.length} | Answer: ${raw.slice(0, 80)}`,
      };
    }

    const hasTools = item.expectedTools.some(t => calledNames.includes(t)) ||
      item.expectedTools.some(t => raw.includes(t));
    const argsOk = item.expectedArgMatch.test(serializedInvs) || item.expectedArgMatch.test(raw);
    const pass = hasTools && argsOk;
    return {
      id: item.id,
      category: item.category,
      prompt: item.prompt,
      output: invocations.length ? `Tool calls: ${serializedInvs}\nResponse: ${raw}` : raw,
      pass,
      isInvalid: !hasTools,
      detail: `Expected tool(s): ${item.expectedTools.join(', ')} | Observed: ${calledNames.join(', ') || 'inline/none'}`,
    };
  }

  function renderCaseCard(res) {
    const list = document.getElementById('caseResultsList');
    const div = document.createElement('div');
    div.className = `quality-case-card ${res.pass ? 'pass' : 'fail'}`;
    div.innerHTML = `
      <div class="quality-case-header">
        <span><code>${res.id}</code> · ${res.category}</span>
        <span class="badge ${res.pass ? 'badge-pass' : 'badge-fail'}">${res.pass ? 'PASS' : 'FAIL'}</span>
      </div>
      <div style="font-size: 0.83rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
        <strong>Prompt:</strong> ${res.prompt}
      </div>
      <div style="font-size: 0.82rem; font-family: ui-monospace, monospace; margin-bottom: 0.2rem;">
        <strong>Output:</strong> ${res.output.slice(0, 240)}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">${res.detail}</div>
    `;
    list.appendChild(div);
  }

  async function startBenchmark() {
    const lm = getLanguageModel();
    if (!lm) {
      setStatus('unavailable', 'LanguageModel API not available');
      return;
    }
    running = true;
    document.getElementById('startTest').disabled = true;
    document.getElementById('stopTest').disabled = false;
    document.getElementById('caseResultsList').innerHTML = '';

    const suite = document.getElementById('suiteSelect').value;
    const plan = [
      ...(suite === 'all' || suite === 'mmlu' ? MMLU_CASES.map(c => ({ type: 'mmlu', item: c })) : []),
      ...(suite === 'all' || suite === 'tools' ? TOOL_AND_CONSTRAINT_CASES.map(c => ({ type: 'tool', item: c })) : []),
    ];

    let total = 0;
    let passed = 0;
    let invalid = 0;
    let mmluTotal = 0;
    let mmluPass = 0;
    let toolTotal = 0;
    let toolPass = 0;

    for (let i = 0; i < plan.length && running; i++) {
      const entry = plan[i];
      let res;
      try {
        res = entry.type === 'mmlu' ? await runMmluCase(lm, entry.item) : await runToolOrConstraintCase(lm, entry.item);
      } catch (err) {
        res = {
          id: entry.item.id,
          category: entry.item.category,
          prompt: entry.item.question || entry.item.prompt,
          output: `Error: ${err.message}`,
          pass: false,
          isInvalid: true,
          detail: 'Execution error',
        };
      }
      total++;
      if (res.pass) passed++;
      if (res.isInvalid) invalid++;
      if (entry.type === 'mmlu') {
        mmluTotal++;
        if (res.pass) mmluPass++;
      } else {
        toolTotal++;
        if (res.pass) toolPass++;
      }

      document.getElementById('correctCount').textContent = String(passed);
      document.getElementById('questionCount').textContent = String(total);
      document.getElementById('scorePercent').textContent = ((passed / total) * 100).toFixed(1);
      document.getElementById('nonLetterCount').textContent = String(invalid);
      document.getElementById('mmluScore').textContent = mmluTotal ? `${mmluPass} / ${mmluTotal}` : '—';
      document.getElementById('toolsScore').textContent = toolTotal ? `${toolPass} / ${toolTotal}` : '—';
      document.getElementById('progressBar').style.width = `${((i + 1) / plan.length) * 100}%`;
      renderCaseCard(res);
    }

    lastSummary = { total, passed, invalid, mmluPass, mmluTotal, toolPass, toolTotal };
    running = false;
    document.getElementById('startTest').disabled = false;
    document.getElementById('stopTest').disabled = true;
    document.getElementById('copyBtn').disabled = false;
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAvailability();
    document.getElementById('startTest').addEventListener('click', startBenchmark);
    document.getElementById('stopTest').addEventListener('click', () => {
      running = false;
    });
    document.getElementById('clearResults').addEventListener('click', () => {
      running = false;
      document.getElementById('caseResultsList').innerHTML = '';
      document.getElementById('correctCount').textContent = '0';
      document.getElementById('questionCount').textContent = '0';
      document.getElementById('scorePercent').textContent = '0';
      document.getElementById('nonLetterCount').textContent = '0';
      document.getElementById('mmluScore').textContent = '—';
      document.getElementById('toolsScore').textContent = '—';
      document.getElementById('progressBar').style.width = '0%';
    });
    document.getElementById('copyBtn').addEventListener('click', () => {
      if (!lastSummary) return;
      const label = document.getElementById('runLabel').value.trim() || 'Prompt API Quality';
      navigator.clipboard.writeText(
        `${label}\t${lastSummary.passed}/${lastSummary.total}\t${((lastSummary.passed / Math.max(1, lastSummary.total)) * 100).toFixed(1)}%\tMMLU:${lastSummary.mmluPass}/${lastSummary.mmluTotal}\tTools:${lastSummary.toolPass}/${lastSummary.toolTotal}`
      );
    });
  });
})();
