// Decisions API Speed Benchmark
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-decisions-speed-baselines-v1';
  const kInterRunCooldownMs = 200;
  const hwDetect =
    (typeof window !== 'undefined' && window.AIHardwareDetect) ||
    (typeof require === 'function' ? require('../../hardware-detect.js') : null);
  const hw = hwDetect ? hwDetect.createHardwareController('hardwareLabel', 'hardwarePresets') : null;
  const escapeHtml = hwDetect ? hwDetect.escapeHtml : s => String(s ?? '');
  let activeRunController = null;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function ensureDecisionProvisioned(signal) {
    if (!window.DecisionModel || typeof window.DecisionModel.availability !== 'function') return;
    const avail = await window.DecisionModel.availability({});
    signal?.throwIfAborted();
    if (avail === 'unavailable' || avail === 'no') {
      throw new Error('DecisionModel is unavailable.');
    }
    if (avail !== 'available' && avail !== 'readily') {
      const prov = await window.DecisionModel.create({
        context: 'Warmup',
        questions: [{ id: 'ok', prompt: 'Ready?', type: 'boolean' }],
        ...(signal ? { signal } : {}),
      });
      if (prov && typeof prov.destroy === 'function') prov.destroy();
      signal?.throwIfAborted();
    }
  }

  const INPUTS = [
    'Every time I click Pay Now on the checkout page, the tab freezes and I was billed twice on my credit card.',
    'The new vertical tabs layout in Edge saves so much screen space and feels super snappy!',
    'Could you add a keyboard shortcut to toggle dark mode in the PDF reader?',
    'I cannot sign in to my corporate profile after resetting my two-factor authenticator.',
    'Release v2.8.15 reduces translation latency by 35% and passes all 136 regression tests.',
  ];

  async function runBoolBench() {
    if (!window.DecisionModel) return;
    const signal = activeRunController?.signal;
    await ensureDecisionProvisioned(signal);
    const model = await window.DecisionModel.create({
      context: 'Triage incoming support messages.',
      questions: [{ id: 'urgent', prompt: 'Does this ticket require urgent escalation?', type: 'boolean' }],
      ...(signal ? { signal } : {}),
    });
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        await model.decide(INPUTS[i], signal ? { signal } : undefined);
        const ms = performance.now() - start;
        document.getElementById(`bool-${i + 1}`).textContent = ms.toFixed(1);
        sum += ms;
      }
    } finally {
      if (typeof model.destroy === 'function') model.destroy();
    }
    await sleep(kInterRunCooldownMs);
    const mean = (sum / 5).toFixed(1);
    document.getElementById('bool-mean').textContent = mean;
    document.getElementById('hero-bool-ms').textContent = mean;
  }

  async function runChoiceBench() {
    if (!window.DecisionModel) return;
    const signal = activeRunController?.signal;
    await ensureDecisionProvisioned(signal);
    const model = await window.DecisionModel.create({
      context: 'Classify incoming customer tickets.',
      questions: [
        {
          id: 'category',
          prompt: 'Which category best describes the issue?',
          type: 'choice',
          options: [
            { label: 'bug', description: 'Crash, freeze, or broken functionality' },
            { label: 'billing', description: 'Duplicate charge or invoice issue' },
            { label: 'feature', description: 'Request for new capability' },
            { label: 'account', description: 'Login or password help' },
          ],
        },
      ],
      ...(signal ? { signal } : {}),
    });
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        await model.decide(INPUTS[i], signal ? { signal } : undefined);
        const ms = performance.now() - start;
        document.getElementById(`choice-${i + 1}`).textContent = ms.toFixed(1);
        sum += ms;
      }
    } finally {
      if (typeof model.destroy === 'function') model.destroy();
    }
    await sleep(kInterRunCooldownMs);
    const mean = (sum / 5).toFixed(1);
    document.getElementById('choice-mean').textContent = mean;
    document.getElementById('hero-choice-ms').textContent = mean;
  }

  async function runRubricBench() {
    if (!window.DecisionModel) return;
    const signal = activeRunController?.signal;
    await ensureDecisionProvisioned(signal);
    const model = await window.DecisionModel.create({
      context: 'Triage support tickets by urgency, category, and 1-5 severity.',
      questions: [
        { id: 'urgent', prompt: 'Does this ticket require urgent escalation?', type: 'boolean' },
        {
          id: 'category',
          prompt: 'Which category best describes the issue?',
          type: 'choice',
          options: [
            { label: 'bug', description: 'Crash or freeze' },
            { label: 'billing', description: 'Payment issue' },
            { label: 'feature', description: 'Feature request' },
            { label: 'account', description: 'Account login issue' },
          ],
        },
        {
          id: 'severity',
          prompt: 'Rate customer impact from 1 (minimal) to 5 (critical).',
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
      ...(signal ? { signal } : {}),
    });
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        await model.decide(INPUTS[i], signal ? { signal } : undefined);
        const ms = performance.now() - start;
        document.getElementById(`rubric-${i + 1}`).textContent = ms.toFixed(1);
        sum += ms;
      }
    } finally {
      if (typeof model.destroy === 'function') model.destroy();
    }
    await sleep(kInterRunCooldownMs);
    const meanMs = sum / 5;
    document.getElementById('rubric-mean').textContent = meanMs.toFixed(1);
    document.getElementById('hero-rubric-ms').textContent = meanMs.toFixed(1);
    document.getElementById('hero-ops').textContent = ((11 * 1000) / Math.max(1, meanMs)).toFixed(1);
  }

  function renderBaselines() {
    const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const keys = Object.keys(store);
    const sec = document.getElementById('baselineComparisonSection');
    const tbl = document.getElementById('baselineComparisonTable');
    if (!keys.length) {
      sec.style.display = 'none';
      return;
    }
    sec.style.display = 'block';
    tbl.innerHTML = `
      <thead>
        <tr><th>Slot / Label</th><th>Hardware / Backend</th><th>Boolean (ms)</th><th>4-Option Choice (ms)</th><th>3-Q Rubric (ms)</th><th>Options/sec</th></tr>
      </thead>
      <tbody>
        ${keys
          .map(k => {
            const b = store[k];
            return `<tr><td><strong>${escapeHtml(b.label || k)}</strong></td><td>${escapeHtml(b.gpu || '-')}</td><td>${escapeHtml(b.boolMs)}</td><td>${escapeHtml(b.choiceMs)}</td><td>${escapeHtml(b.rubricMs)}</td><td><strong>${escapeHtml(b.ops)}</strong></td></tr>`;
          })
          .join('')}
      </tbody>`;
  }

  function getBrowserColumns() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return ['Edge', (ua.match(/Edg\/([\d.]+)/) || [])[1] || ''];
    if (ua.includes('Chrome/')) return ['Chrome', (ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''];
    return ['Browser', 'Unknown'];
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderBaselines();
    if (hw) hw.scheduleInit();
    if (typeof window.DecisionModel !== 'undefined' && typeof window.DecisionModel.availability === 'function') {
      document.getElementById('statusText').textContent = 'DecisionModel detected — checking readiness...';
      void window.DecisionModel.availability({}).then(avail => {
        const ready = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'after-download';
        document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
        document.getElementById('statusText').textContent = ready ? `DecisionModel Available (${avail})` : `DecisionModel (${avail})`;
      }).catch(() => {
        document.getElementById('statusIndicator').className = 'status-indicator unavailable';
        document.getElementById('statusText').textContent = 'DecisionModel (unavailable)';
      });
    } else {
      document.getElementById('statusIndicator').className = 'status-indicator unavailable';
      document.getElementById('statusText').textContent = 'DecisionModel (unavailable)';
    }

    let isRunning = false;
    function stopBenchmark() {
      if (activeRunController) activeRunController.abort();
    }
    async function runExclusive(fn) {
      if (isRunning) return;
      isRunning = true;
      activeRunController = new AbortController();
      const statusEl = document.getElementById('benchmark-status');
      if (statusEl) statusEl.textContent = 'Running';
      const stopBtn = document.getElementById('stopBench');
      if (stopBtn) stopBtn.disabled = false;
      ['measureAllBtn', 'replayBool', 'replayChoice', 'replayRubric'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      try {
        const res = await fn();
        if (statusEl) statusEl.textContent = 'Ready';
        return res;
      } catch (e) {
        if (activeRunController?.signal.aborted) {
          if (statusEl) statusEl.textContent = 'Canceled';
        } else {
          if (statusEl) statusEl.textContent = `Error: ${e.message}`;
          throw e;
        }
      } finally {
        activeRunController = null;
        isRunning = false;
        if (stopBtn) stopBtn.disabled = true;
        ['measureAllBtn', 'replayBool', 'replayChoice', 'replayRubric'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.disabled = false;
        });
      }
    }

    const stopBtn = document.getElementById('stopBench');
    if (stopBtn) stopBtn.addEventListener('click', stopBenchmark);
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', stopBenchmark);
    }

    document.getElementById('measureAllBtn').addEventListener('click', () => runExclusive(async () => {
      await runBoolBench();
      await runChoiceBench();
      await runRubricBench();
    }));
    document.getElementById('replayBool').addEventListener('click', () => runExclusive(runBoolBench));
    document.getElementById('replayChoice').addEventListener('click', () => runExclusive(runChoiceBench));
    document.getElementById('replayRubric').addEventListener('click', () => runExclusive(runRubricBench));

    document.getElementById('copyTsvBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const row = [
        new Date().toLocaleDateString(),
        ...getBrowserColumns(),
        gpu,
        document.getElementById('bool-mean').textContent,
        document.getElementById('choice-mean').textContent,
        document.getElementById('rubric-mean').textContent,
        document.getElementById('hero-ops').textContent,
      ].join('\t');
      await navigator.clipboard.writeText(row);
      const copyBtn = document.getElementById('copyTsvBtn');
      if (copyBtn) {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = 'Copy TSV'; }, 2000);
      }
    });

    document.getElementById('saveBaselineBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const label = `${getBrowserColumns().join(' ')} #${Object.keys(store).length + 1}`;
      store[label] = {
        label,
        gpu,
        boolMs: document.getElementById('bool-mean').textContent,
        choiceMs: document.getElementById('choice-mean').textContent,
        rubricMs: document.getElementById('rubric-mean').textContent,
        ops: document.getElementById('hero-ops').textContent,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      renderBaselines();
    });

    document.getElementById('clearBaselinesBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      renderBaselines();
    });
  });
})();
