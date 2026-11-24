// Language Detection API Speed Benchmark
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-lid-speed-baselines-v1';
  const hwDetect =
    (typeof window !== 'undefined' && window.AIHardwareDetect) ||
    (typeof require === 'function' ? require('../../hardware-detect.js') : null);
  const hw = hwDetect ? hwDetect.createHardwareController('hardwareLabel', 'hardwarePresets') : null;
  const escapeHtml = hwDetect ? hwDetect.escapeHtml : s => String(s ?? '');
  let activeRunController = null;

  async function ensureLidProvisioned(signal) {
    if (!('LanguageDetector' in self) || typeof LanguageDetector.availability !== 'function') return;
    const avail = await LanguageDetector.availability();
    signal?.throwIfAborted();
    if (avail === 'unavailable' || avail === 'no') {
      throw new Error('LanguageDetector is unavailable.');
    }
    if (avail !== 'available' && avail !== 'readily') {
      const prov = await LanguageDetector.create(signal ? { signal } : undefined);
      if (prov && typeof prov.destroy === 'function') prov.destroy();
      signal?.throwIfAborted();
    }
  }

  const SHORT_SENTENCES = [
    'The quick brown fox jumps over the lazy dog.',
    'Bonjour, comment allez-vous aujourd’hui ?',
    'Hallo und herzlich willkommen zu unserem neuen Produkt.',
    'Hola, ¿cómo estás? Me alegro mucho de verte hoy.',
    'Ciao, come stai? È davvero una bella giornata di sole.',
    'こんにちは、本日の会議の資料を共有いたします。',
    '你好，请问今天下午的工程评审会议在哪个房间举行？',
    '안녕하세요, 오늘 배포 일정이 어떻게 되는지 확인 부탁드립니다.',
    'Привет, как продвигается работа над новым обновлением браузера?',
    'مرحباً، كيف حالك اليوم؟ أتمنى لك يوماً سعيداً.',
    'Olá, como você está hoje? Tudo pronto para o lançamento?',
    'Hallo, hoe gaat het vandaag met het nieuwe project?',
    'Hej, hur mår du idag? Vi ses på mötet klockan två.',
    'Cześć, jak się masz dzisiaj? Wszystko działa zgodnie z planem.',
    'Merhaba, bugün nasılsın? Yeni sürüm testleri başarıyla tamamlandı.',
  ];

  const PARAGRAPH_TEXT =
    'On-device language identification enables web applications to classify incoming user text instantly without network round-trips or cloud privacy concerns. By running compact neural and n-gram models locally inside the browser, applications can automatically route support tickets and select translation models.';

  const LONG_DOC_TEXT = Array.from({ length: 8 }, () => PARAGRAPH_TEXT).join('\n\n');

  async function runCreateBench() {
    if (!('LanguageDetector' in self)) return;
    const signal = activeRunController?.signal;
    await ensureLidProvisioned(signal);
    let sumWarm = 0;
    for (let i = 0; i < 5; i++) {
      signal?.throwIfAborted();
      const start = performance.now();
      const det = await LanguageDetector.create(signal ? { signal } : undefined);
      const ms = performance.now() - start;
      if (det && typeof det.destroy === 'function') det.destroy();
      document.getElementById(`create-${i + 1}`).textContent = ms.toFixed(2);
      if (i > 0) sumWarm += ms;
    }
    const mean = (sumWarm / 4).toFixed(2);
    document.getElementById('create-mean').textContent = mean;
    document.getElementById('hero-create-ms').textContent = mean;
  }

  async function runBatchBench() {
    if (!('LanguageDetector' in self)) return;
    const signal = activeRunController?.signal;
    await ensureLidProvisioned(signal);
    const det = await LanguageDetector.create(signal ? { signal } : undefined);
    let sumQps = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        for (const s of SHORT_SENTENCES) {
          signal?.throwIfAborted();
          await det.detect(s, signal ? { signal } : undefined);
        }
        const elapsedSec = Math.max(0.0001, (performance.now() - start) / 1000);
        const qps = SHORT_SENTENCES.length / elapsedSec;
        document.getElementById(`batch-${i + 1}`).textContent = qps.toFixed(0);
        sumQps += qps;
      }
    } finally {
      if (det && typeof det.destroy === 'function') det.destroy();
    }
    const meanQps = (sumQps / 5).toFixed(0);
    document.getElementById('batch-mean').textContent = meanQps;
    document.getElementById('hero-qps').textContent = meanQps;
  }

  async function runParaBench() {
    if (!('LanguageDetector' in self)) return;
    const signal = activeRunController?.signal;
    await ensureLidProvisioned(signal);
    const det = await LanguageDetector.create(signal ? { signal } : undefined);
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        await det.detect(PARAGRAPH_TEXT, signal ? { signal } : undefined);
        const ms = performance.now() - start;
        document.getElementById(`para-${i + 1}`).textContent = ms.toFixed(2);
        sum += ms;
      }
    } finally {
      if (det && typeof det.destroy === 'function') det.destroy();
    }
    const mean = (sum / 5).toFixed(2);
    document.getElementById('para-mean').textContent = mean;
    document.getElementById('hero-para-ms').textContent = mean;
  }

  async function runDocBench() {
    if (!('LanguageDetector' in self)) return;
    const signal = activeRunController?.signal;
    await ensureLidProvisioned(signal);
    const det = await LanguageDetector.create(signal ? { signal } : undefined);
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        signal?.throwIfAborted();
        const start = performance.now();
        await det.detect(LONG_DOC_TEXT, signal ? { signal } : undefined);
        const ms = performance.now() - start;
        document.getElementById(`doc-${i + 1}`).textContent = ms.toFixed(2);
        sum += ms;
      }
    } finally {
      if (det && typeof det.destroy === 'function') det.destroy();
    }
    const mean = (sum / 5).toFixed(2);
    document.getElementById('doc-mean').textContent = mean;
    document.getElementById('hero-doc-ms').textContent = mean;
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
        <tr><th>Slot / Label</th><th>Hardware / Backend</th><th>Create (ms)</th><th>Batch (det/s)</th><th>Paragraph (ms)</th><th>Long Doc (ms)</th></tr>
      </thead>
      <tbody>
        ${keys
          .map(k => {
            const b = store[k];
            return `<tr><td><strong>${escapeHtml(b.label || k)}</strong></td><td>${escapeHtml(b.gpu || '-')}</td><td>${escapeHtml(b.createMs)}</td><td><strong>${escapeHtml(b.qps)}</strong></td><td>${escapeHtml(b.paraMs)}</td><td>${escapeHtml(b.docMs)}</td></tr>`;
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

  document.addEventListener('DOMContentLoaded', async () => {
    let avail = 'unavailable';
    if ('LanguageDetector' in self && typeof LanguageDetector.availability === 'function') {
      try { avail = await LanguageDetector.availability(); } catch (_) {}
    }
    const ready = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'after-download';
    document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = ready ? `LanguageDetector Available (${avail})` : `LanguageDetector (${avail})`;
    if (hw) hw.init();
    renderBaselines();

    let isRunning = false;
    function stopBenchmark() {
      if (activeRunController) activeRunController.abort();
    }
    async function runExclusive(fn) {
      if (isRunning) return;
      isRunning = true;
      activeRunController = new AbortController();
      const stopBtn = document.getElementById('stopBench');
      if (stopBtn) stopBtn.disabled = false;
      ['measureAllBtn', 'replayCreate', 'replayBatch', 'replayPara', 'replayDoc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
      });
      try {
        return await fn();
      } catch (e) {
        if (!activeRunController?.signal.aborted) throw e;
      } finally {
        activeRunController = null;
        isRunning = false;
        if (stopBtn) stopBtn.disabled = true;
        ['measureAllBtn', 'replayCreate', 'replayBatch', 'replayPara', 'replayDoc'].forEach(id => {
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
      await runCreateBench();
      await runBatchBench();
      await runParaBench();
      await runDocBench();
    }));
    document.getElementById('replayCreate').addEventListener('click', () => runExclusive(runCreateBench));
    document.getElementById('replayBatch').addEventListener('click', () => runExclusive(runBatchBench));
    document.getElementById('replayPara').addEventListener('click', () => runExclusive(runParaBench));
    document.getElementById('replayDoc').addEventListener('click', () => runExclusive(runDocBench));

    document.getElementById('copyTsvBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const row = [
        new Date().toLocaleDateString(),
        ...getBrowserColumns(),
        gpu,
        document.getElementById('create-mean').textContent,
        document.getElementById('batch-mean').textContent,
        document.getElementById('para-mean').textContent,
        document.getElementById('doc-mean').textContent,
      ].join('\t');
      await navigator.clipboard.writeText(row);
    });

    document.getElementById('saveBaselineBtn').addEventListener('click', async () => {
      const gpu = hw ? await hw.resolveGpuInfo() : 'Unknown GPU';
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const label = `${getBrowserColumns().join(' ')} #${Object.keys(store).length + 1}`;
      store[label] = {
        label,
        gpu,
        createMs: document.getElementById('create-mean').textContent,
        qps: document.getElementById('batch-mean').textContent,
        paraMs: document.getElementById('para-mean').textContent,
        docMs: document.getElementById('doc-mean').textContent,
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
