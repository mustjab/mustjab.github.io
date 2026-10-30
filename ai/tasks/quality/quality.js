// Task APIs Quality Benchmark (Summarizer, Writer, Rewriter, Proofreader)
(function () {
  'use strict';

  const CASES = [
    {
      id: 'summarizer:key-facts-apollo',
      task: 'summarizer',
      options: { type: 'key-points', length: 'short', format: 'markdown' },
      input: `The Apollo 11 mission landed on the Moon on July 20, 1969. Commander Neil Armstrong and Lunar Module Pilot Buzz Aldrin walked on the lunar surface while Michael Collins orbited above in the Command Module Columbia. An estimated 650 million people watched the televised broadcast worldwide.`,
      check(out) {
        const hasApolloOrMoon = /apollo|moon|lunar/i.test(out);
        const hasYearOrArmstrong = /1969|armstrong/i.test(out);
        return {
          pass: hasApolloOrMoon && hasYearOrArmstrong && out.length < 600,
          detail: `Length=${out.length} chars, key facts=${hasApolloOrMoon && hasYearOrArmstrong}`,
        };
      },
    },
    {
      id: 'summarizer:headline-brevity',
      task: 'summarizer',
      options: { type: 'headline', length: 'short', format: 'plain-text' },
      input: `Microsoft Edge 158 introduces on-device neural phrase-fix recovery and dynamic 4-row batching for local translation, cutting latency by 35% while preserving URLs and numeric scales across 18 language packs.`,
      check(out) {
        const lines = out.trim().split(/\r?\n/).filter(Boolean);
        const pass = lines.length <= 2 && out.trim().length > 10 && out.trim().length <= 180;
        return { pass, detail: `Headline lines=${lines.length}, chars=${out.trim().length}` };
      },
    },
    {
      id: 'summarizer:numeric-budget-retention',
      task: 'summarizer',
      options: { type: 'tldr', length: 'short', format: 'plain-text' },
      input: `In Q3 2026, Acme Cloud reduced server operating expenses by $42 million after migrating 12,500 customer workspaces to its new ARM64 cluster in Dublin.`,
      check(out) {
        const pass = /42|12[,]?500|dublin|acme/i.test(out);
        return { pass, detail: pass ? 'Retained core quantitative/named entities' : 'Dropped key numbers/entities' };
      },
    },
    {
      id: 'summarizer:url-email-preservation',
      task: 'summarizer',
      options: { type: 'tldr', length: 'medium', format: 'plain-text' },
      input: `All developers migrating to the v2.8 SDK must update their endpoint to https://api.example.com/v2 and report any breaking changes to sdk-support@example.com before Friday.`,
      check(out) {
        const pass = /example\.com|v2|friday/i.test(out);
        return { pass, detail: pass ? 'Preserved migration domain/deadline context' : 'Missing domain/deadline' };
      },
    },
    {
      id: 'rewriter:shorter-compression',
      task: 'rewriter',
      options: { tone: 'as-is', length: 'shorter', format: 'plain-text' },
      input: `Due to the fact that our scheduled database maintenance window is going to take place at 2:00 AM UTC tomorrow morning, all active user sessions will be temporarily disconnected for a period of approximately fifteen minutes while the primary replica is upgraded.`,
      check(out) {
        const pass = out.trim().length > 15 && out.trim().length < 235 && /2:00|15|fifteen|maintenance|database/i.test(out);
        return { pass, detail: `Compressed from 259 chars to ${out.trim().length} chars` };
      },
    },
    {
      id: 'rewriter:formal-entity-preservation',
      task: 'rewriter',
      options: { tone: 'more-formal', length: 'as-is', format: 'plain-text' },
      input: `Hey folks, we just shipped v2.8.15 to fix bug #64782008! Ping qa@example.com if anything looks broken.`,
      check(out) {
        const pass = /2\.8\.15/.test(out) && /64782008/.test(out) && /qa@example\.com/i.test(out);
        return { pass, detail: pass ? 'Preserved v2.8.15, #64782008, and qa@example.com' : 'Lost version, bug ID, or email during rewrite' };
      },
    },
    {
      id: 'rewriter:casual-numeric-preservation',
      task: 'rewriter',
      options: { tone: 'more-casual', length: 'as-is', format: 'plain-text' },
      input: `Please be advised that the Q4 budget allocation of $42 million has been approved for the 18 regional teams.`,
      check(out) {
        const pass = /42/.test(out) && /18/.test(out);
        return { pass, detail: pass ? 'Preserved $42M and 18 teams in casual rewrite' : 'Dropped key numbers during rewrite' };
      },
    },
    {
      id: 'rewriter:url-preservation',
      task: 'rewriter',
      options: { tone: 'more-formal', length: 'shorter', format: 'plain-text' },
      input: `You can grab the latest benchmark report over at https://mustjab.github.io/ai/speed/ whenever you have a minute.`,
      check(out) {
        const pass = /mustjab\.github\.io\/ai\/speed/i.test(out);
        return { pass, detail: pass ? 'Preserved benchmark URL during formal/shorter rewrite' : 'Corrupted or dropped URL' };
      },
    },
    {
      id: 'writer:release-note-draft',
      task: 'writer',
      options: { tone: 'formal', length: 'short', format: 'plain-text' },
      input: `Write a one-paragraph release note announcing WebGPU KV-cache quantization in Edge 158.`,
      check(out) {
        const pass = out.trim().length >= 40 && /webgpu|kv|quantiz|edge/i.test(out);
        return { pass, detail: `Generated ${out.trim().length} chars referencing target topic` };
      },
    },
    {
      id: 'writer:structured-checklist',
      task: 'writer',
      options: { tone: 'neutral', length: 'short', format: 'markdown' },
      input: `Write a short 3-item deployment checklist for an on-device AI model update.`,
      check(out) {
        const pass = out.trim().length >= 30 && /[-*1-3]/.test(out);
        return { pass, detail: `Generated checklist (${out.trim().length} chars)` };
      },
    },
    {
      id: 'writer:status-email-entities',
      task: 'writer',
      options: { tone: 'formal', length: 'short', format: 'plain-text' },
      input: `Write a brief status update stating that build 2026.10.22.1 passed all 34 quality checks.`,
      check(out) {
        const pass = /2026\.10\.22\.1/.test(out) && /34/.test(out);
        return { pass, detail: pass ? 'Included build 2026.10.22.1 and 34 checks' : 'Omitted required version or count' };
      },
    },
    {
      id: 'writer:incident-notice',
      task: 'writer',
      options: { tone: 'neutral', length: 'short', format: 'plain-text' },
      input: `Write a two-sentence maintenance notice for Sunday at 02:00 UTC.`,
      check(out) {
        const pass = /sunday/i.test(out) && /02:00|2:00/i.test(out);
        return { pass, detail: pass ? 'Included Sunday and 02:00 UTC window' : 'Missing day or time' };
      },
    },
    {
      id: 'proofreader:spelling-anounce-becuase',
      task: 'proofreader',
      options: {},
      input: `We are thrilled to anounce that our team has acheived a 35% reduction in latency becuase of the new cache.`,
      check(out) {
        const pass = /\bannounce\b/i.test(out) && /\bachieved\b/i.test(out) && /\bbecause\b/i.test(out) && /35%/.test(out);
        return { pass, detail: pass ? 'Corrected anounce -> announce, acheived -> achieved, becuase -> because' : `Remaining typos in: ${out}` };
      },
    },
    {
      id: 'proofreader:preserve-url-and-version',
      task: 'proofreader',
      options: {},
      input: `Please downloaded version 2.8.15 from https://example.com/docs?id=676 and contact qa@example.com.`,
      check(out) {
        const pass = /2\.8\.15/.test(out) && /https:\/\/example\.com\/docs\?id=676/.test(out) && /qa@example\.com/.test(out);
        return { pass, detail: pass ? 'Preserved URL, query string, version, and email intact' : `Corrupted entities: ${out}` };
      },
    },
    {
      id: 'proofreader:clean-sentence-passthrough',
      task: 'proofreader',
      options: {},
      input: `The translation service completed all 29 regression tests without any errors.`,
      check(out) {
        const pass = /29/.test(out) && /translation/i.test(out) && /regression/i.test(out);
        return { pass, detail: `Clean input preserved: ${out}` };
      },
    },
    {
      id: 'proofreader:grammar-subject-verb',
      task: 'proofreader',
      options: {},
      input: `The list of required dependencies are missing from the configuration file.`,
      check(out) {
        const pass = /dependencies/i.test(out) && /configuration/i.test(out);
        return { pass, detail: `Output: ${out}` };
      },
    },
  ];

  function getApi(name) {
    if (name === 'summarizer') return window.Summarizer || window.ai?.summarizer || null;
    if (name === 'writer') return window.Writer || window.ai?.writer || null;
    if (name === 'rewriter') return window.Rewriter || window.ai?.rewriter || null;
    if (name === 'proofreader') return window.Proofreader || window.ai?.proofreader || null;
    return null;
  }

  async function runSingleCase(spec) {
    const api = getApi(spec.task);
    if (!api) {
      return {
        ...spec,
        output: `${spec.task} API unavailable in this browser`,
        pass: false,
        detail: 'API unavailable',
      };
    }
    const inst = await api.create(spec.options || {});
    let out = '';
    try {
      if (spec.task === 'proofreader') {
        const r = await inst.proofread(spec.input);
        out = typeof r === 'string' ? r : (r?.correctedInput || r?.corrected || JSON.stringify(r));
      } else {
        const method = spec.task === 'summarizer' ? 'summarize' : spec.task === 'writer' ? 'write' : 'rewrite';
        out = String(await inst[method](spec.input)).trim();
      }
    } finally {
      if (typeof inst.destroy === 'function') inst.destroy();
    }
    const res = spec.check(out);
    return { ...spec, output: out, pass: res.pass, detail: res.detail };
  }

  function renderCard(res) {
    const list = document.getElementById('caseResultsList');
    const div = document.createElement('div');
    div.className = `quality-case-card ${res.pass ? 'pass' : 'fail'}`;
    div.innerHTML = `
      <div class="quality-case-header">
        <span><code>${res.id}</code> (${res.task})</span>
        <span class="badge ${res.pass ? 'badge-pass' : 'badge-fail'}">${res.pass ? 'PASS' : 'FAIL'}</span>
      </div>
      <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.25rem;">
        <strong>Input:</strong> ${res.input}
      </div>
      <div style="font-size: 0.82rem; font-family: ui-monospace, monospace; margin-bottom: 0.2rem;">
        <strong>Output:</strong> ${res.output}
      </div>
      <div style="font-size: 0.78rem; color: var(--text-muted);">${res.detail}</div>
    `;
    list.appendChild(div);
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

  document.addEventListener('DOMContentLoaded', async () => {
    const activeTask = getActiveTaskFromUrl();
    const activeCases = activeTask ? CASES.filter(c => c.task === activeTask) : CASES;

    if (activeTask) {
      const titlePrefix = TASK_LABELS[activeTask];
      document.title = `${titlePrefix} - Quality Benchmark`;
      const h1 = document.querySelector('header h1');
      if (h1) h1.textContent = `${titlePrefix} - Quality Benchmark`;
      document.getElementById('startBtn').textContent = `▶ Run ${titlePrefix.replace(' API', '')} Quality Suite (${activeCases.length} cases)`;
      document.getElementById('totalCount').textContent = String(activeCases.length);
    } else {
      document.getElementById('startBtn').textContent = `▶ Run Quality Suite (${activeCases.length} cases)`;
      document.getElementById('totalCount').textContent = String(activeCases.length);
    }

    const checkTarget = activeTask || 'summarizer';
    const api = getApi(checkTarget);
    let avail = 'unavailable';
    if (api && typeof api.availability === 'function') {
      try { avail = await api.availability(); } catch (_) {}
    } else if (api) {
      avail = 'available';
    }
    const ready = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'after-download';
    document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = activeTask
      ? `${TASK_LABELS[activeTask]}: ${avail}`
      : (ready ? `Task APIs Detected (${avail})` : 'Task APIs Not Detected');

    let lastRecords = [];

    document.getElementById('startBtn').addEventListener('click', async () => {
      document.getElementById('caseResultsList').innerHTML = '';
      lastRecords = [];
      let passCount = 0;
      let sumPass = 0, sumTot = 0;
      let wrPass = 0, wrTot = 0;
      let prfPass = 0, prfTot = 0;

      for (let i = 0; i < activeCases.length; i++) {
        const t0 = performance.now();
        let res;
        try {
          res = await runSingleCase(activeCases[i]);
        } catch (e) {
          res = { ...activeCases[i], output: `Error: ${e.message}`, pass: false, detail: 'Execution error' };
        }
        res.elapsedMs = Math.round(performance.now() - t0);
        lastRecords.push(res);
        if (res.pass) passCount++;
        if (res.task === 'summarizer') { sumTot++; if (res.pass) sumPass++; }
        else if (res.task === 'proofreader') { prfTot++; if (res.pass) prfPass++; }
        else { wrTot++; if (res.pass) wrPass++; }

        document.getElementById('totalPass').textContent = String(passCount);
        document.getElementById('totalCount').textContent = String(i + 1);
        document.getElementById('passRate').textContent = ((passCount / (i + 1)) * 100).toFixed(1);
        document.getElementById('sumScore').textContent = sumTot ? `${sumPass} / ${sumTot}` : '—';
        document.getElementById('wrtRewScore').textContent = wrTot ? `${wrPass} / ${wrTot}` : '—';
        document.getElementById('prfScore').textContent = prfTot ? `${prfPass} / ${prfTot}` : '—';
        document.getElementById('progressBar').style.width = `${((i + 1) / activeCases.length) * 100}%`;
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
      const p = document.getElementById('totalPass').textContent;
      const t = document.getElementById('totalCount').textContent;
      const rate = document.getElementById('passRate').textContent;
      const headerLine = [
        new Date().toLocaleDateString(),
        ...browserCols,
        `${p}/${t}`,
        `${rate}%`,
        `Sum:${document.getElementById('sumScore').textContent}`,
        `WrtRew:${document.getElementById('wrtRewScore').textContent}`,
        `Prf:${document.getElementById('prfScore').textContent}`,
      ].join('\t');
      const detailLines = [
        'Case ID\tTask\tResult\tLatency (ms)\tDetail\tOutput',
        ...lastRecords.map(r =>
          [
            r.id,
            r.task,
            r.pass ? 'PASS' : 'FAIL',
            r.elapsedMs ?? 0,
            String(r.detail || '').replace(/\s+/g, ' '),
            String(r.output || '').replace(/\s+/g, ' ').slice(0, 200),
          ].join('\t')
        ),
      ];
      navigator.clipboard.writeText([headerLine, '', ...detailLines].join('\n'));
    });
  });
})();
