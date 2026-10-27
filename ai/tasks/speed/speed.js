// Task APIs Speed Benchmark (Summarizer, Writer, Rewriter, Proofreader)
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-tasks-speed-baselines-v1';

  const ARTICLE = `Artificial intelligence and machine learning technologies are revolutionizing how we approach language translation and natural language processing. Modern models are trained on billions of parallel text segments, allowing them to capture subtle patterns across linguistic boundaries. Attention mechanisms and transformer architectures enable models to consider the full context of a sentence when generating outputs rather than processing words in isolation. International businesses, healthcare providers, and legal professionals rely on on-device AI tools to summarize documents, draft updates, and communicate privately without cloud round-trips.`;

  function getApi(name) {
    if (name === 'summarizer') return window.Summarizer || window.ai?.summarizer || null;
    if (name === 'writer') return window.Writer || window.ai?.writer || null;
    if (name === 'rewriter') return window.Rewriter || window.ai?.rewriter || null;
    if (name === 'proofreader') return window.Proofreader || window.ai?.proofreader || null;
    return null;
  }

  async function measureStreamingTask(api, createOpts, invokeMethod, input) {
    const start = performance.now();
    const instance = await api.create(createOpts);
    let ttft = 0;
    let out = '';
    try {
      const streamFn = instance[`${invokeMethod}Streaming`];
      if (typeof streamFn === 'function') {
        let first = true;
        for await (const chunk of streamFn.call(instance, input)) {
          if (first) {
            first = false;
            ttft = performance.now() - start;
          }
          out = chunk.startsWith(out) ? chunk : out + chunk;
        }
      } else {
        out = await instance[invokeMethod](input);
        ttft = performance.now() - start;
      }
    } finally {
      if (typeof instance.destroy === 'function') instance.destroy();
    }
    const totalMs = Math.max(1, performance.now() - start);
    const cps = (out.length * 1000) / totalMs;
    return { ttft: ttft || totalMs, totalMs, cps };
  }

  async function runSummarizerBench() {
    const api = getApi('summarizer');
    if (!api) return;
    const modes = ['key-points', 'tldr', 'headline'];
    let sumCps = 0;
    let sumTtft = 0;
    for (let i = 0; i < modes.length; i++) {
      const r = await measureStreamingTask(api, { type: modes[i], length: 'short', format: 'plain-text' }, 'summarize', ARTICLE);
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
      const r = await measureStreamingTask(api, { tone: 'neutral', length: 'short', format: 'plain-text' }, 'write', prompts[i]);
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
      const r = await measureStreamingTask(api, { ...configs[i], format: 'plain-text' }, 'rewrite', ARTICLE);
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
    let total = 0;
    for (let i = 0; i < inputs.length; i++) {
      const start = performance.now();
      const inst = await api.create();
      try {
        await inst.proofread(inputs[i]);
      } finally {
        if (typeof inst.destroy === 'function') inst.destroy();
      }
      const ms = performance.now() - start;
      document.getElementById(`prf-ms-${i + 1}`).textContent = ms.toFixed(1);
      total += ms;
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
              <td><strong>${b.label || k}</strong></td>
              <td>${b.sumCps}</td>
              <td>${b.wrtCps}</td>
              <td>${b.rewCps}</td>
              <td>${b.prfMs}</td>
            </tr>`;
          })
          .join('')}
      </tbody>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const anyAvailable = ['summarizer', 'writer', 'rewriter', 'proofreader'].some(k => Boolean(getApi(k)));
    document.getElementById('statusIndicator').className = 'status-indicator ' + (anyAvailable ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = anyAvailable ? 'Task APIs Detected' : 'Task APIs Not Detected';
    renderBaselines();

    document.getElementById('measureAllBtn').addEventListener('click', async () => {
      await runSummarizerBench();
      await runWriterBench();
      await runRewriterBench();
      await runProofreaderBench();
    });

    document.querySelectorAll('[data-replay]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-replay');
        if (t === 'summarizer') runSummarizerBench();
        if (t === 'writer') runWriterBench();
        if (t === 'rewriter') runRewriterBench();
        if (t === 'proofreader') runProofreaderBench();
      });
    });

    document.getElementById('copyTsvBtn').addEventListener('click', () => {
      const row = [
        new Date().toLocaleDateString(),
        document.getElementById('sum-mean-cps').textContent,
        document.getElementById('wrt-mean-cps').textContent,
        document.getElementById('rew-mean-cps').textContent,
        document.getElementById('prf-mean-ms').textContent,
      ].join('\t');
      navigator.clipboard.writeText(row);
    });

    document.getElementById('saveBaselineBtn').addEventListener('click', () => {
      const slot = document.getElementById('baselineSlot').value;
      const label = document.getElementById('runLabel').value.trim() || slot;
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[slot] = {
        label,
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
})();
