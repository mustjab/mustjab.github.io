// Decisions API Quality Benchmark
(function () {
  'use strict';

  const CASES = [
    {
      id: 'bool:urgent-outage',
      category: 'boolean',
      context: 'Treat production outages, crashes, and duplicate billing charges as urgent.',
      questions: [{ id: 'q', prompt: 'Is this ticket urgent?', type: 'boolean' }],
      input: 'Production checkout is returning HTTP 500 for all customers and charging cards twice.',
      expectedLabel: 'true',
    },
    {
      id: 'bool:non-urgent-question',
      category: 'boolean',
      context: 'Treat production outages, crashes, and duplicate billing charges as urgent.',
      questions: [{ id: 'q', prompt: 'Is this ticket urgent?', type: 'boolean' }],
      input: 'Where can I find the documentation for customizing the browser theme colors?',
      expectedLabel: 'false',
    },
    {
      id: 'bool:security-untrusted-exe',
      category: 'boolean',
      context: 'Unsigned executables (.exe/.scr) downloaded from raw IP addresses require a security warning.',
      questions: [{ id: 'q', prompt: 'Should a security warning be shown?', type: 'boolean' }],
      input: 'User is downloading setup_patch.exe from http://198.51.100.42/files/setup_patch.exe',
      expectedLabel: 'true',
    },
    {
      id: 'bool:sentiment-positive',
      category: 'boolean',
      context: 'Classify whether customer feedback is positive.',
      questions: [{ id: 'q', prompt: 'Is the customer feedback positive?', type: 'boolean' }],
      input: 'The new on-device translator is remarkably fast and keeps all our technical links intact!',
      expectedLabel: 'true',
    },
    {
      id: 'choice:support-billing',
      category: 'choice',
      context: 'Classify support tickets into the most appropriate department.',
      questions: [
        {
          id: 'q',
          prompt: 'Which department should handle this ticket?',
          type: 'choice',
          options: [
            { label: 'bug', description: 'Browser crash or rendering defect' },
            { label: 'billing', description: 'Invoice, refund, or duplicate credit card charge' },
            { label: 'feature', description: 'New feature suggestion' },
            { label: 'account', description: 'Password reset or 2FA login issue' },
          ],
        },
      ],
      input: 'I cancelled my subscription last month but my credit card was charged $30 again today. Please refund.',
      expectedLabel: 'billing',
    },
    {
      id: 'choice:support-account',
      category: 'choice',
      context: 'Classify support tickets into the most appropriate department.',
      questions: [
        {
          id: 'q',
          prompt: 'Which department should handle this ticket?',
          type: 'choice',
          options: [
            { label: 'bug', description: 'Browser crash or rendering defect' },
            { label: 'billing', description: 'Invoice, refund, or duplicate credit card charge' },
            { label: 'feature', description: 'New feature suggestion' },
            { label: 'account', description: 'Password reset or 2FA login issue' },
          ],
        },
      ],
      input: 'I lost my phone and cannot receive the two-factor authentication code to log in to my account.',
      expectedLabel: 'account',
    },
    {
      id: 'choice:support-bug',
      category: 'choice',
      context: 'Classify support tickets into the most appropriate department.',
      questions: [
        {
          id: 'q',
          prompt: 'Which department should handle this ticket?',
          type: 'choice',
          options: [
            { label: 'bug', description: 'Browser crash or rendering defect' },
            { label: 'billing', description: 'Invoice, refund, or duplicate credit card charge' },
            { label: 'feature', description: 'New feature suggestion' },
            { label: 'account', description: 'Password reset or 2FA login issue' },
          ],
        },
      ],
      input: 'Opening the print preview dialog on a PDF immediately crashes the tab with an access violation.',
      expectedLabel: 'bug',
    },
    {
      id: 'choice:release-pillar-performance',
      category: 'choice',
      context: 'Identify the primary engineering pillar described in the release note.',
      questions: [
        {
          id: 'q',
          prompt: 'Which engineering pillar is the primary focus?',
          type: 'choice',
          options: [
            { label: 'performance', description: 'Latency, speed, throughput, or memory reduction' },
            { label: 'compliance', description: 'Privacy, security audit, or policy governance' },
            { label: 'ux', description: 'Visual styling, icons, or typography' },
          ],
        },
      ],
      input: 'Enabled WebGPU KV-cache quantization and parallel tokenizer initialization, reducing prefill latency by 45%.',
      expectedLabel: 'performance',
    },
    {
      id: 'invariance:option-order-billing',
      category: 'invariance',
      context: 'Verify that reversing the option order yields the same winning choice label.',
      input: 'My company invoice shows a duplicate charge of $150 for our annual plan.',
      optionsForward: [
        { label: 'bug', description: 'Crash or technical defect' },
        { label: 'billing', description: 'Invoice or duplicate charge' },
        { label: 'feature', description: 'New feature request' },
      ],
      expectedLabel: 'billing',
    },
    {
      id: 'invariance:option-order-bug',
      category: 'invariance',
      context: 'Verify that reversing the option order yields the same winning choice label.',
      input: 'The GPU process crashes whenever WebGL context is lost on multi-monitor setups.',
      optionsForward: [
        { label: 'bug', description: 'Crash or technical defect' },
        { label: 'billing', description: 'Invoice or duplicate charge' },
        { label: 'feature', description: 'New feature request' },
      ],
      expectedLabel: 'bug',
    },
    {
      id: 'score:monotonicity-critical-vs-low',
      category: 'invariance',
      kind: 'score-pair',
      context: 'Rate incident severity from 1 (minimal) to 5 (critical).',
      highInput: 'Complete production database outage affecting 100% of enterprise customers with data loss risk.',
      lowInput: 'Minor 1-pixel alignment offset on the settings page footer tooltip in dark mode.',
    },
    {
      id: 'score:probability-normalization',
      category: 'invariance',
      kind: 'prob-sum',
      context: 'Verify returned option probabilities sum to ~1.0.',
      input: 'Please reset my account password.',
      optionsForward: [
        { label: 'account', description: 'Password or login help' },
        { label: 'billing', description: 'Payment or refund' },
        { label: 'bug', description: 'Technical crash' },
      ],
    },
  ];

  async function evaluateCase(c) {
    if (!window.DecisionModel) {
      return { id: c.id, category: c.category, input: c.input || c.highInput, output: 'DecisionModel unavailable', pass: false, detail: 'API unavailable' };
    }

    if (c.kind === 'score-pair') {
      const schema = {
        context: c.context,
        questions: [
          {
            id: 'sev',
            prompt: 'Rate severity from 1 (minimal) to 5 (critical).',
            type: 'score',
            options: [
              { label: '1', description: 'Minimal' },
              { label: '2', description: 'Low' },
              { label: '3', description: 'Moderate' },
              { label: '4', description: 'High' },
              { label: '5', description: 'Critical' },
            ],
          },
        ],
      };
      const m = await window.DecisionModel.create(schema);
      try {
        const hi = (await m.decide(c.highInput))?.sev;
        const lo = (await m.decide(c.lowInput))?.sev;
        const hiScore = Number(hi?.expectedScore ?? hi?.label ?? 0);
        const loScore = Number(lo?.expectedScore ?? lo?.label ?? 0);
        const pass = hiScore > loScore && hiScore >= 3.5;
        return {
          id: c.id,
          category: c.category,
          input: `High: "${c.highInput}" vs Low: "${c.lowInput}"`,
          output: `High score=${hiScore.toFixed(2)} (${hi?.label}), Low score=${loScore.toFixed(2)} (${lo?.label})`,
          pass,
          detail: pass ? 'Critical incident scored strictly higher than cosmetic issue' : 'Score monotonicity violated',
        };
      } finally {
        if (typeof m.destroy === 'function') m.destroy();
      }
    }

    if (c.kind === 'prob-sum') {
      const m = await window.DecisionModel.create({
        context: c.context,
        questions: [{ id: 'q', prompt: 'Choose category:', type: 'choice', options: c.optionsForward }],
      });
      try {
        const res = (await m.decide(c.input))?.q;
        const probs = Object.values(res?.probabilities || {}).map(Number);
        const sum = probs.reduce((a, b) => a + b, 0);
        const pass = probs.length === 3 && Math.abs(sum - 1.0) < 0.02;
        return {
          id: c.id,
          category: c.category,
          input: c.input,
          output: JSON.stringify(res?.probabilities || {}),
          pass,
          detail: `Probability sum = ${sum.toFixed(4)}`,
        };
      } finally {
        if (typeof m.destroy === 'function') m.destroy();
      }
    }

    if (c.category === 'invariance') {
      const m1 = await window.DecisionModel.create({
        context: c.context,
        questions: [{ id: 'q', prompt: 'Select category:', type: 'choice', options: c.optionsForward }],
      });
      const m2 = await window.DecisionModel.create({
        context: c.context,
        questions: [{ id: 'q', prompt: 'Select category:', type: 'choice', options: [...c.optionsForward].reverse() }],
      });
      try {
        const r1 = (await m1.decide(c.input))?.q;
        const r2 = (await m2.decide(c.input))?.q;
        const pass = r1?.label === c.expectedLabel && r2?.label === c.expectedLabel;
        return {
          id: c.id,
          category: c.category,
          input: c.input,
          output: `Forward: ${r1?.label} | Reversed: ${r2?.label}`,
          pass,
          detail: `Expected ${c.expectedLabel} in both option orders`,
        };
      } finally {
        if (typeof m1.destroy === 'function') m1.destroy();
        if (typeof m2.destroy === 'function') m2.destroy();
      }
    }

    const m = await window.DecisionModel.create({ context: c.context, questions: c.questions });
    try {
      const r = (await m.decide(c.input))?.q;
      const actual = String(r?.label ?? '').toLowerCase();
      const pass = actual === c.expectedLabel.toLowerCase();
      return {
        id: c.id,
        category: c.category,
        input: c.input,
        output: `label=${r?.label} (confidence=${((r?.confidence || 0) * 100).toFixed(1)}%)`,
        pass,
        detail: `Expected: ${c.expectedLabel} | Actual: ${r?.label}`,
      };
    } finally {
      if (typeof m.destroy === 'function') m.destroy();
    }
  }

  function renderCard(res) {
    const list = document.getElementById('caseResultsList');
    const div = document.createElement('div');
    div.className = `quality-case-card ${res.pass ? 'pass' : 'fail'}`;
    div.innerHTML = `
      <div class="quality-case-header">
        <span><code>${res.id}</code> (${res.category})</span>
        <span class="badge ${res.pass ? 'badge-pass' : 'badge-fail'}">${res.pass ? 'PASS' : 'FAIL'}</span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
        <strong>Input:</strong> ${res.input}
      </div>
      <div style="font-size: 0.82rem; font-family: ui-monospace, monospace; margin-bottom: 0.2rem;">
        <strong>Result:</strong> ${res.output}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">${res.detail}</div>
    `;
    list.appendChild(div);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    let avail = 'unavailable';
    if (typeof window.DecisionModel !== 'undefined' && typeof window.DecisionModel.availability === 'function') {
      try { avail = await window.DecisionModel.availability(); } catch (_) {}
    }
    const ready = avail === 'available' || avail === 'readily';
    document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = ready ? `DecisionModel Available (${avail})` : `DecisionModel (${avail})`;

    document.getElementById('startBtn').addEventListener('click', async () => {
      document.getElementById('caseResultsList').innerHTML = '';
      let passCount = 0;
      let bPass = 0, bTot = 0;
      let cPass = 0, cTot = 0;
      let iPass = 0, iTot = 0;

      for (let i = 0; i < CASES.length; i++) {
        let res;
        try {
          res = await evaluateCase(CASES[i]);
        } catch (e) {
          res = { id: CASES[i].id, category: CASES[i].category, input: CASES[i].input || '', output: `Error: ${e.message}`, pass: false, detail: 'Execution error' };
        }
        if (res.pass) passCount++;
        if (res.category === 'boolean') { bTot++; if (res.pass) bPass++; }
        else if (res.category === 'choice') { cTot++; if (res.pass) cPass++; }
        else { iTot++; if (res.pass) iPass++; }

        document.getElementById('totalPass').textContent = String(passCount);
        document.getElementById('totalCount').textContent = String(i + 1);
        document.getElementById('passRate').textContent = ((passCount / (i + 1)) * 100).toFixed(1);
        document.getElementById('boolScore').textContent = bTot ? `${bPass} / ${bTot}` : '—';
        document.getElementById('choiceScore').textContent = cTot ? `${cPass} / ${cTot}` : '—';
        document.getElementById('invarianceScore').textContent = iTot ? `${iPass} / ${iTot}` : '—';
        document.getElementById('progressBar').style.width = `${((i + 1) / CASES.length) * 100}%`;
        renderCard(res);
      }
      document.getElementById('copyBtn').disabled = false;
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('caseResultsList').innerHTML = '';
      document.getElementById('totalPass').textContent = '0';
      document.getElementById('passRate').textContent = '0';
      document.getElementById('progressBar').style.width = '0%';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
      const ua = navigator.userAgent;
      const browserCols = ua.includes('Edg/')
        ? ['Edge', (ua.match(/Edg\/([\d.]+)/) || [])[1] || '']
        : ua.includes('Chrome/')
          ? ['Chrome', (ua.match(/Chrome\/([\d.]+)/) || [])[1] || '']
          : ['Browser', 'Unknown'];
      navigator.clipboard.writeText(
        [
          new Date().toLocaleDateString(),
          ...browserCols,
          `${document.getElementById('totalPass').textContent}/${document.getElementById('totalCount').textContent}`,
          `${document.getElementById('passRate').textContent}%`,
          `Bool:${document.getElementById('boolScore').textContent}`,
          `Choice:${document.getElementById('choiceScore').textContent}`,
          `Invariance:${document.getElementById('invarianceScore').textContent}`,
        ].join('\t')
      );
    });
  });
})();
