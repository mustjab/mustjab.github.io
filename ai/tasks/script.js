// Task APIs Playground (Summarizer, Writer, Rewriter, Proofreader)
(function () {
  'use strict';

  const WEBPAGE_SUMMARIZE_PREFIX = 'Summarize content of this webpage to main points:\n\n';

  const SAMPLE_INPUTS = {
    summarizer: `Scientists aboard the autonomous research vessel Nautilus mapped 4,200 square kilometers of hydrothermal vents along the Mid-Atlantic Ridge this week, discovering three bioluminescent shrimp species that thrive at 380°C without sunlight.\n\nUsing compact onboard sensors, the expedition compressed 18 terabytes of raw bathymetry into 12-kilobyte daily telemetry bursts over satellite links while keeping raw field logs stored aboard the ship.`,
    writer: `Write a friendly weekend newsletter note inviting neighborhood readers to a Saturday rooftop stargazing night with hot cider and telescopes.`,
    rewriter: `Hey everyone, the trail shuttle is running 15 mins late cuz the main gate was blocked by a delivery truck. Grab a coffee at the visitor center and we'll roll out at 9:15 AM!`,
    proofreader: `We are thrilled to anounce that the neighborhood library has acheived a 35% increase in weekend visitors becuase of the new Saturday storytime program.`,
  };

  function getTaskApi(task) {
    if (task === 'summarizer') return window.Summarizer || window.ai?.summarizer || null;
    if (task === 'writer') return window.Writer || window.ai?.writer || null;
    if (task === 'rewriter') return window.Rewriter || window.ai?.rewriter || null;
    if (task === 'proofreader') return window.Proofreader || window.ai?.proofreader || null;
    return null;
  }

  const TASK_TITLES = {
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

  function updateTaskOptionsUI() {
    const task = document.getElementById('taskSelector').value;
    const titlePrefix = TASK_TITLES[task] || 'Task APIs';
    document.title = `${titlePrefix} - Playground`;
    const h1 = document.querySelector('header h1');
    if (h1) h1.textContent = `${titlePrefix} Playground`;
    const g1 = document.getElementById('optGroup1');
    const g2 = document.getElementById('optGroup2');
    const g3 = document.getElementById('optGroup3');
    const opt1 = document.getElementById('opt1');
    const opt2 = document.getElementById('opt2');
    const l1 = document.getElementById('opt1Label');
    const l2 = document.getElementById('opt2Label');

    document.getElementById('inputText').value = SAMPLE_INPUTS[task] || SAMPLE_INPUTS.summarizer;

    if (task === 'summarizer') {
      g1.style.display = '';
      g2.style.display = '';
      g3.style.display = '';
      l1.textContent = 'Type';
      opt1.innerHTML = `<option value="webpage" selected>webpage (Main Points)</option><option value="key-points">key-points</option><option value="tldr">tldr</option><option value="teaser">teaser</option><option value="headline">headline</option>`;
      l2.textContent = 'Length';
      opt2.innerHTML = `<option value="short">short</option><option value="medium" selected>medium</option><option value="long">long</option>`;
    } else if (task === 'writer') {
      g1.style.display = '';
      g2.style.display = '';
      g3.style.display = '';
      l1.textContent = 'Tone';
      opt1.innerHTML = `<option value="neutral" selected>neutral</option><option value="formal">formal</option><option value="casual">casual</option>`;
      l2.textContent = 'Length';
      opt2.innerHTML = `<option value="short" selected>short</option><option value="medium">medium</option><option value="long">long</option>`;
    } else if (task === 'rewriter') {
      g1.style.display = '';
      g2.style.display = '';
      g3.style.display = '';
      l1.textContent = 'Tone';
      opt1.innerHTML = `<option value="more-formal" selected>more-formal</option><option value="as-is">as-is</option><option value="more-casual">more-casual</option>`;
      l2.textContent = 'Length';
      opt2.innerHTML = `<option value="as-is" selected>as-is</option><option value="shorter">shorter</option><option value="longer">longer</option>`;
    } else {
      g1.style.display = 'none';
      g2.style.display = 'none';
      g3.style.display = 'none';
    }
    checkAvailability();
  }

  async function checkAvailability() {
    const task = document.getElementById('taskSelector').value;
    const opt1Val = document.getElementById('opt1')?.value || '';
    const usesLmAdapter =
      task === 'summarizer' && opt1Val === 'webpage' && Boolean(window.LanguageModel);
    const api = usesLmAdapter ? window.LanguageModel : getTaskApi(task);
    const ind = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    if (!api) {
      ind.className = 'status-indicator unavailable';
      txt.textContent = `${task} API not detected in this browser`;
      return;
    }
    try {
      const langOpts = usesLmAdapter
        ? { expectedOutputs: [{ type: 'text', languages: ['en'] }] }
        : task === 'proofreader'
          ? { expectedInputLanguages: ['en'] }
          : { outputLanguage: 'en', expectedInputLanguages: ['en'] };
      const avail = typeof api.availability === 'function' ? await api.availability(langOpts) : 'available';
      ind.className = 'status-indicator ' + (avail === 'available' || avail === 'readily' ? 'available' : '');
      txt.textContent = `${task}: ${avail}`;
    } catch (e) {
      ind.className = 'status-indicator unavailable';
      txt.textContent = e.message;
    }
  }

  async function runTask() {
    const task = document.getElementById('taskSelector').value;
    const outEl = document.getElementById('outputContent');
    const input = document.getElementById('inputText').value.trim();
    const useStreaming = document.getElementById('useStreaming').checked;
    const opt1 = document.getElementById('opt1').value;
    const opt2 = document.getElementById('opt2').value;
    const opt3 = document.getElementById('opt3').value;

    const useWebpageSummarizerLora = task === 'summarizer' && opt1 === 'webpage' && Boolean(window.LanguageModel);

    if (useWebpageSummarizerLora) {
      outEl.textContent = 'Running...';
      const start = performance.now();
      let ttft = 0;
      let output = '';
      try {
        const session = await window.LanguageModel.create({
          expectedInputs: [{ type: 'text', languages: ['en'] }],
          expectedOutputs: [{ type: 'text', languages: ['en'] }],
        });
        const userPrompt = `${WEBPAGE_SUMMARIZE_PREFIX}${input}`;
        try {
          if (useStreaming && typeof session.promptStreaming === 'function') {
            let first = true;
            for await (const chunk of session.promptStreaming(userPrompt)) {
              if (!chunk) continue;
              if (first) {
                first = false;
                ttft = performance.now() - start;
              }
              output += chunk;
              outEl.textContent = output;
            }
          } else {
            output = await session.prompt(userPrompt);
            ttft = performance.now() - start;
          }
        } finally {
          session.destroy?.();
        }
        const totalMs = performance.now() - start;
        outEl.textContent = output;
        document.getElementById('statTtft').textContent = (ttft || totalMs).toFixed(1);
        document.getElementById('statTotalMs').textContent = totalMs.toFixed(1);
        document.getElementById('statChars').textContent = String(output.length);
        document.getElementById('statCps').textContent = ((output.length * 1000) / Math.max(1, totalMs)).toFixed(1);
      } catch (e) {
        outEl.textContent = `Error: ${e.message || e}`;
      }
      return;
    }

    const api = getTaskApi(task);
    if (!api) {
      outEl.textContent = `${task} API is not available in this browser.`;
      return;
    }
    const effectiveSummaryType = opt1 === 'webpage' ? 'key-points' : opt1;

    let createOpts = task === 'proofreader'
      ? { expectedInputLanguages: ['en'] }
      : { outputLanguage: 'en', expectedInputLanguages: ['en'] };
    if (task === 'summarizer') createOpts = { ...createOpts, type: effectiveSummaryType, length: opt2, format: opt3 };
    else if (task === 'writer' || task === 'rewriter') createOpts = { ...createOpts, tone: opt1, length: opt2, format: opt3 };

    outEl.textContent = 'Running...';
    const start = performance.now();
    let ttft = 0;
    let output = '';

    try {
      const instance = await api.create(createOpts);
      try {
        if (task === 'proofreader') {
          const res = await instance.proofread(input);
          ttft = performance.now() - start;
          output = typeof res === 'string' ? res : (res?.correctedInput || res?.corrected || JSON.stringify(res, null, 2));
        } else {
          const method = task === 'summarizer' ? 'summarize' : task === 'writer' ? 'write' : 'rewrite';
          const streamMethod = `${method}Streaming`;
          if (useStreaming && typeof instance[streamMethod] === 'function') {
            const stream = instance[streamMethod](input);
            let first = true;
            for await (const chunk of stream) {
              if (first) {
                first = false;
                ttft = performance.now() - start;
              }
              output = chunk.startsWith(output) ? chunk : output + chunk;
              outEl.textContent = output;
            }
          } else {
            output = await instance[method](input);
            ttft = performance.now() - start;
          }
        }
      } finally {
        if (typeof instance.destroy === 'function') instance.destroy();
      }
      const totalMs = performance.now() - start;
      outEl.textContent = output;
      document.getElementById('statTtft').textContent = (ttft || totalMs).toFixed(1);
      document.getElementById('statTotalMs').textContent = totalMs.toFixed(1);
      document.getElementById('statChars').textContent = String(output.length);
      document.getElementById('statCps').textContent = ((output.length * 1000) / Math.max(1, totalMs)).toFixed(1);
    } catch (e) {
      outEl.textContent = `Error: ${e.message || e}`;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const urlTask = getActiveTaskFromUrl();
    const sel = document.getElementById('taskSelector');
    if (urlTask && sel) {
      sel.value = urlTask;
      const wrapper = sel.closest('.bench-label-group');
      if (wrapper) wrapper.style.display = 'none';
    }
    updateTaskOptionsUI();
    sel.addEventListener('change', updateTaskOptionsUI);
    document.getElementById('opt1')?.addEventListener('change', checkAvailability);
    document.getElementById('processBtn').addEventListener('click', runTask);
    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('outputContent').textContent = 'Output will appear here...';
    });
  });
})();
