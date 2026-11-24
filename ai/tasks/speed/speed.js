// Task APIs Speed Benchmark (Summarizer, Writer, Rewriter, Proofreader)
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-tasks-speed-baselines-v1';
  const kInterRunCooldownMs = 200;
  const hwDetect =
    (typeof window !== 'undefined' && window.AIHardwareDetect) ||
    (typeof require === 'function' ? require('../../hardware-detect.js') : null);
  const hw = hwDetect ? hwDetect.createHardwareController('hardwareLabel', 'hardwarePresets') : null;
  const escapeHtml = hwDetect ? hwDetect.escapeHtml : s => String(s ?? '');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let activeRunController = null;

  const ARTICLE = `Artificial intelligence and machine learning technologies are revolutionizing how we approach language translation and natural language processing. Modern models are trained on billions of parallel text segments, allowing them to capture subtle patterns across linguistic boundaries. Attention mechanisms and transformer architectures enable models to consider the full context of a sentence when generating outputs rather than processing words in isolation. International businesses, healthcare providers, and legal professionals rely on on-device AI tools to summarize documents, draft updates, and communicate privately without cloud round-trips.`;

  function getApi(name) {
    if (name === 'summarizer') return window.Summarizer || window.ai?.summarizer || null;
    if (name === 'writer') return window.Writer || window.ai?.writer || null;
    if (name === 'rewriter') return window.Rewriter || window.ai?.rewriter || null;
    if (name === 'proofreader') return window.Proofreader || window.ai?.proofreader || null;
    return null;
  }

  function withTaskLanguages(taskName, opts = {}) {
    if (taskName === 'proofreader') {
      return { expectedInputLanguages: ['en'], ...opts };
    }
    return { outputLanguage: 'en', expectedInputLanguages: ['en'], ...opts };
  }

  async function ensureProvisioned(api, createOpts, signal) {
    if (typeof api.availability !== 'function') return;
    const avail = await api.availability(createOpts);
    signal?.throwIfAborted();
    if (avail === 'unavailable' || avail === 'no') {
      throw new Error('Selected Task API configuration is unavailable.');
    }
    if (avail !== 'available' && avail !== 'readily') {
      const prov = await api.create({ ...createOpts, ...(signal ? { signal } : {}) });
      if (prov && typeof prov.destroy === 'function') prov.destroy();
      signal?.throwIfAborted();
    }
  }

  async function measureStreamingTask(api, createOpts, invokeMethod, input) {
    const signal = activeRunController?.signal;
    signal?.throwIfAborted();
    await ensureProvisioned(api, createOpts, signal);
    const instance = await api.create({ ...createOpts, ...(signal ? { signal } : {}) });
    const genStart = performance.now();
    let ttft = 0;
    let out = '';
    try {
      const streamFn = instance[`${invokeMethod}Streaming`];
      if (typeof streamFn === 'function') {
        const callOpts = signal ? { signal } : undefined;
        const stream = callOpts ? streamFn.call(instance, input, callOpts) : streamFn.call(instance, input);
        for await (const chunk of stream) {
          signal?.throwIfAborted();
          if (!chunk) continue;
          if (ttft === 0) {
            ttft = performance.now() - genStart;
          }
          out = chunk.startsWith(out) ? chunk : out + chunk;
        }
      } else {
        const callOpts = signal ? { signal } : undefined;
        out = callOpts ? await instance[invokeMethod](input, callOpts) : await instance[invokeMethod](input);
        ttft = performance.now() - genStart;
      }
    } finally {
      if (typeof instance.destroy === 'function') instance.destroy();
    }
    signal?.throwIfAborted();
    const genMs = Math.max(1, performance.now() - genStart);
    const outCodePoints = Array.from(out).length;
    const cps = (outCodePoints * 1000) / genMs;
    await sleep(kInterRunCooldownMs);
    return { ttft: ttft || genMs, totalMs: genMs, cps };
  }

  async function runSummarizerBench() {
    const api = getApi('summarizer');
    if (!api) return;
    const modes = ['key-points', 'tldr', 'headline'];
    let sumCps = 0;
    let sumTtft = 0;
    for (let i = 0; i < modes.length; i++) {
      const r = await measureStreamingTask(api, withTaskLanguages('summarizer', { type: modes[i], length: 'short', format: 'plain-text' }), 'summarize', ARTICLE);
      document.getElementById(`sum-ttft-${i + 1}`).textContent = r.ttft.toFixed(1);
      document.getElementById(`sum-cps-${i + 1}`).textContent = r.cps.toFixed(1);
      sumCps += r.cps;
      sumTtft += r.ttft;
    }
    const meanCps = (sumCps / modes.length).toFixed(1);
    document.getElementById('sum-mean-cps').textContent = meanCps;
    document.getElementById('hero-sum-cps').textContent = meanCps;
    document.getElementById('hero-sum-ttft').textContent = (sumTtft / modes.length).toFixed(1);
  }

  async function runWriterBench() {
    const api = getApi('writer');
    if (!api) return;
    const prompts = [
      'Write a short release note for Edge on-device AI.',
      'Write a brief status email confirming all unit tests passed.',
      'Write a short summary of browser sandboxing benefits.',
    ];
    let sumCps = 0;
    let sumTtft = 0;
    for (let i = 0; i < prompts.length; i++) {
      const r = await measureStreamingTask(api, withTaskLanguages('writer', { tone: 'neutral', length: 'short', format: 'plain-text' }), 'write', prompts[i]);
      document.getElementById(`wrt-ttft-${i + 1}`).textContent = r.ttft.toFixed(1);
      document.getElementById(`wrt-cps-${i + 1}`).textContent = r.cps.toFixed(1);
      sumCps += r.cps;
      sumTtft += r.ttft;
    }
    const meanCps = (sumCps / prompts.length).toFixed(1);
    document.getElementById('wrt-mean-cps').textContent = meanCps;
    document.getElementById('hero-writer-cps').textContent = meanCps;
    document.getElementById('hero-writer-ttft').textContent = (sumTtft / prompts.length).toFixed(1);
  }

  async function runRewriterBench() {
    const api = getApi('rewriter');
    if (!api) return;
    const configs = [
      { tone: 'more-formal', length: 'as-is' },
      { tone: 'as-is', length: 'shorter' },
      { tone: 'more-casual', length: 'as-is' },
    ];
    let sumCps = 0;
    let sumTtft = 0;
    for (let i = 0; i < configs.length; i++) {
      const r = await measureStreamingTask(api, withTaskLanguages('rewriter', { ...configs[i], format: 'plain-text' }), 'rewrite', ARTICLE);
      document.getElementById(`rew-ttft-${i + 1}`).textContent = r.ttft.toFixed(1);
      document.getElementById(`rew-cps-${i + 1}`).textContent = r.cps.toFixed(1);
      sumCps += r.cps;
      sumTtft += r.ttft;
    }
    const meanCps = (sumCps / configs.length).toFixed(1);
    document.getElementById('rew-mean-cps').textContent = meanCps;
    document.getElementById('hero-rewriter-cps').textContent = meanCps;
    document.getElementById('hero-rewriter-ttft').textContent = (sumTtft / configs.length).toFixed(1);
  }

  async function runProofreaderBench() {
    const api = getApi('proofreader');
    if (!api) {
      document.getElementById('prf-mean-ms').textContent = 'N/A';
      document.getElementById('hero-proof-ms').textContent = 'N/A';
      return;
    }
    const inputs = [
      'We are thrilled to anounce that our team has acheived a 35% reduction in latency.',
      'The package for department 14 was delayed becuase the webhook URL was trucated.',
      'Please wierdly check weather the configeration file has any mispelled keys.',
    ];
    const signal = activeRunController?.signal;
    const prfOpts = withTaskLanguages('proofreader');
    await ensureProvisioned(api, prfOpts, signal);
    let total = 0;
    for (let i = 0; i < inputs.length; i++) {
      signal?.throwIfAborted();
      const start = performance.now();
      const inst = await api.create({ ...prfOpts, ...(signal ? { signal } : {}) });
      try {
        await inst.proofread(inputs[i], signal ? { signal } : undefined);
      } finally {
        if (typeof inst.destroy === 'function') inst.destroy();
      }
      signal?.throwIfAborted();
      const ms = performance.now() - start;
      document.getElementById(`prf-ms-${i + 1}`).textContent = ms.toFixed(1);
      total += ms;
      await sleep(kInterRunCooldownMs);
    }
    const meanMs = (total / inputs.length).toFixed(1);
    document.getElementById('prf-mean-ms').textContent = meanMs;
    document.getElementById('hero-proof-ms').textContent = meanMs;
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
        <tr>
          <th>Slot / Label</th>
          <th>Hardware / Backend</th>
          <th>Summarizer (ch/s)</th>
          <th>Writer (ch/s)</th>
          <th>Rewriter (ch/s)</th>
          <th>Proofreader (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${keys
          .map(k => {
            const b = store[k];
            return `<tr>
              <td><strong>${escapeHtml(b.label || k)}</strong></td>
              <td>${escapeHtml(b.gpu || '-')}</td>
              <td>${escapeHtml(b.sumCps)}</td>
              <td>${escapeHtml(b.wrtCps)}</td>
              <td>${escapeHtml(b.rewCps)}</td>
              <td>${escapeHtml(b.prfMs)}</td>
            </tr>`;
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

  const TASK_LABELS = {
    summarizer: 'Summarizer API',
    writer: 'Writer API',
    rewriter: 'Rewriter API',
    proofreader: 'Proofreader API',
  };

  function getActiveTaskFromUrl() {
    const params = new URLSearchParams(window.location.search || '');
    const t = (params.get('api') || '').toLowerCase();
    return ['summarizer', 'writer', 'rewriter', 'proofreader'].includes(t) ? t : null;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const activeTask = getActiveTaskFromUrl();
    if (activeTask) {
      const titlePrefix = TASK_LABELS[activeTask];
      document.title = `${titlePrefix} - Speed Benchmark`;
      const h1 = document.querySelector('header h1');
      if (h1) h1.textContent = `${titlePrefix} - Speed Benchmark`;
      document.getElementById('measureAllBtn').textContent = `▶ Measure ${titlePrefix.replace(' API', '')}`;

      // Highlight the selected task's scorecard tile
      const tiles = document.querySelectorAll('.score-grid .score-item');
      const idxMap = { summarizer: 0, writer: 1, rewriter: 2, proofreader: 3 };
      tiles.forEach((tile, idx) => {
        tile.classList.toggle('score-item--hero', idx === idxMap[activeTask]);
      });
    }

    renderBaselines();
    if (hw) hw.scheduleInit();

    const checkTarget = activeTask || 'summarizer';
    const api = getApi(checkTarget);
    if (!api) {
      document.getElementById('statusIndicator').className = 'status-indicator unavailable';
      document.getElementById('statusText').textContent = activeTask
        ? `${TASK_LABELS[activeTask]} Not Detected`
        : 'Task APIs Not Detected';
    } else if (typeof api.availability === 'function') {
      document.getElementById('statusText').textContent = activeTask
        ? `${TASK_LABELS[activeTask]}: checking readiness...`
        : 'Task APIs detected — checking readiness...';
      void api.availability(withTaskLanguages(checkTarget)).then(avail => {
        const ready = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'after-download';
        document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
        document.getElementById('statusText').textContent = activeTask
          ? `${TASK_LABELS[activeTask]}: ${avail}`
          : (ready ? `Task APIs Detected (${avail})` : 'Task APIs Not Detected');
      }).catch(() => {
        document.getElementById('statusIndicator').className = 'status-indicator unavailable';
      });
    } else {
      document.getElementById('statusIndicator').className = 'status-indicator available';
      document.getElementById('statusText').textContent = activeTask
        ? `${TASK_LABELS[activeTask]}: available`
        : 'Task APIs Detected (available)';
    }

    let isRunning = false;
    function stopBenchmark() {
      if (activeRunController) activeRunController.abort();
    }
    async function runExclusive(fn) {
      if (isRunning) return;
      isRunning = true;
      activeRunController = new AbortController();
      const measureBtn = document.getElementById('measureAllBtn');
      const stopBtn = document.getElementById('stopBench');
      const replayBtns = document.querySelectorAll('[data-replay]');
      const statusEl = document.getElementById('benchmark-status');
      if (statusEl) statusEl.textContent = 'Running';
      if (measureBtn) measureBtn.disabled = true;
      if (stopBtn) stopBtn.disabled = false;
      replayBtns.forEach(b => { b.disabled = true; });
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
        if (measureBtn) measureBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        replayBtns.forEach(b => { b.disabled = false; });
      }
    }

    const stopBtn = document.getElementById('stopBench');
    if (stopBtn) stopBtn.addEventListener('click', stopBenchmark);
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', stopBenchmark);
    }

    document.getElementById('measureAllBtn').addEventListener('click', () => runExclusive(async () => {
      if (activeTask === 'summarizer') await runSummarizerBench();
      else if (activeTask === 'writer') await runWriterBench();
      else if (activeTask === 'rewriter') await runRewriterBench();
      else if (activeTask === 'proofreader') await runProofreaderBench();
      else {
        await runSummarizerBench();
        await runWriterBench();
        await runRewriterBench();
        await runProofreaderBench();
      }
    }));

    document.querySelectorAll('[data-replay]').forEach(btn => {
      btn.addEventListener('click', () => runExclusive(async () => {
        const t = btn.getAttribute('data-replay');
        if (t === 'summarizer') await runSummarizerBench();
        if (t === 'writer') await runWriterBench();
        if (t === 'rewriter') await runRewriterBench();
        if (t === 'proofreader') await runProofreaderBench();
      }));
    });

    document.getElementById('copyTsvBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const row = [
        new Date().toLocaleDateString(),
        ...getBrowserColumns(),
        gpu,
        document.getElementById('sum-mean-cps').textContent,
        document.getElementById('wrt-mean-cps').textContent,
        document.getElementById('rew-mean-cps').textContent,
        document.getElementById('prf-mean-ms').textContent,
      ].join('\t');
      await navigator.clipboard.writeText(row);
      const copyBtn = document.getElementById('copyTsvBtn');
      if (copyBtn) {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy TSV'; }, 2000);
      }
    });

    document.getElementById('saveBaselineBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const label = `${getBrowserColumns().join(' ')} #${Object.keys(store).length + 1}`;
      store[label] = {
        label,
        gpu,
        sumCps: document.getElementById('sum-mean-cps').textContent,
        wrtCps: document.getElementById('wrt-mean-cps').textContent,
        rewCps: document.getElementById('rew-mean-cps').textContent,
        prfMs: document.getElementById('prf-mean-ms').textContent,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      renderBaselines();
    });

    document.getElementById('clearBaselinesBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      renderBaselines();
    });
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { measureStreamingTask };
  }
})();
