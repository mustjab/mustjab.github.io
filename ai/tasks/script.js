// Task APIs Playground (Summarizer, Writer, Rewriter, Proofreader)
(function () {
  'use strict';

  const SAMPLE_INPUTS = {
    summarizer: `The moon landing on July 20, 1969, was a monumental event that left an indelible mark on human history. When Neil Armstrong took his first steps on the lunar surface and uttered the famous words, "That's one small step for man, one giant leap for mankind," it symbolized a pinnacle of human achievement and ingenuity.\n\nThe Apollo program spurred significant technological advancements in computing, telecommunications, and materials science. Broadcast globally to an estimated 600 million viewers, the mission provided invaluable lunar samples and demonstrated what humanity could achieve when working toward a shared scientific goal.`,
    writer: `Write a concise release announcement for Edge's built-in on-device AI APIs highlighting privacy, zero cloud cost, and offline reliability.`,
    rewriter: `Hey team, the build broke yesterday cuz the config file had a typo in the timeout setting. We fixed it this morning and pushed a patch so everything should be good now.`,
    proofreader: `We are thrilled to anounce that our team has acheived a 35% reduction in latency becuase of the new on-device cacheing layer.`,
  };

  function getTaskApi(task) {
    if (task === 'summarizer') return window.Summarizer || window.ai?.summarizer || null;
    if (task === 'writer') return window.Writer || window.ai?.writer || null;
    if (task === 'rewriter') return window.Rewriter || window.ai?.rewriter || null;
    if (task === 'proofreader') return window.Proofreader || window.ai?.proofreader || null;
    return null;
  }

  function updateTaskOptionsUI() {
    const task = document.getElementById('taskSelector').value;
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
      opt1.innerHTML = `<option value="key-points" selected>key-points</option><option value="tldr">tldr</option><option value="teaser">teaser</option><option value="headline">headline</option>`;
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
    const api = getTaskApi(task);
    const ind = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    if (!api) {
      ind.className = 'status-indicator unavailable';
      txt.textContent = `${task} API not detected in this browser`;
      return;
    }
    try {
      const avail = typeof api.availability === 'function' ? await api.availability() : 'available';
      ind.className = 'status-indicator ' + (avail === 'available' || avail === 'readily' ? 'available' : '');
      txt.textContent = `${task}: ${avail}`;
    } catch (e) {
      ind.className = 'status-indicator unavailable';
      txt.textContent = e.message;
    }
  }

  async function runTask() {
    const task = document.getElementById('taskSelector').value;
    const api = getTaskApi(task);
    const outEl = document.getElementById('outputContent');
    if (!api) {
      outEl.textContent = `${task} API is not available in this browser.`;
      return;
    }
    const input = document.getElementById('inputText').value.trim();
    const useStreaming = document.getElementById('useStreaming').checked;
    const opt1 = document.getElementById('opt1').value;
    const opt2 = document.getElementById('opt2').value;
    const opt3 = document.getElementById('opt3').value;

    let createOpts = {};
    if (task === 'summarizer') createOpts = { type: opt1, length: opt2, format: opt3 };
    else if (task === 'writer' || task === 'rewriter') createOpts = { tone: opt1, length: opt2, format: opt3 };

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
    updateTaskOptionsUI();
    document.getElementById('taskSelector').addEventListener('change', updateTaskOptionsUI);
    document.getElementById('processBtn').addEventListener('click', runTask);
    document.getElementById('clearBtn').addEventListener('click', () => {
      document.getElementById('outputContent').textContent = 'Output will appear here...';
    });
  });
})();
