// Language Detection API Speed Benchmark
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-lid-speed-baselines-v1';

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
    let sumWarm = 0;
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      const det = await LanguageDetector.create();
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
    const det = await LanguageDetector.create();
    let sumQps = 0;
    try {
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        for (const s of SHORT_SENTENCES) {
          await det.detect(s);
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
    const det = await LanguageDetector.create();
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await det.detect(PARAGRAPH_TEXT);
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
    const det = await LanguageDetector.create();
    let sum = 0;
    try {
      for (let i = 0; i < 5; i++) {
        const start = performance.now();
        await det.detect(LONG_DOC_TEXT);
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
        <tr><th>Slot / Label</th><th>Create (ms)</th><th>Batch (det/s)</th><th>Paragraph (ms)</th><th>Long Doc (ms)</th></tr>
      </thead>
      <tbody>
        ${keys
          .map(k => {
            const b = store[k];
            return `<tr><td><strong>${b.label || k}</strong></td><td>${b.createMs}</td><td><strong>${b.qps}</strong></td><td>${b.paraMs}</td><td>${b.docMs}</td></tr>`;
          })
          .join('')}
      </tbody>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const hasApi = 'LanguageDetector' in self;
    document.getElementById('statusIndicator').className = 'status-indicator ' + (hasApi ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = hasApi ? 'LanguageDetector Available' : 'LanguageDetector Unavailable';
    renderBaselines();

    document.getElementById('measureAllBtn').addEventListener('click', async () => {
      await runCreateBench();
      await runBatchBench();
      await runParaBench();
      await runDocBench();
    });
    document.getElementById('replayCreate').addEventListener('click', runCreateBench);
    document.getElementById('replayBatch').addEventListener('click', runBatchBench);
    document.getElementById('replayPara').addEventListener('click', runParaBench);
    document.getElementById('replayDoc').addEventListener('click', runDocBench);

    document.getElementById('copyTsvBtn').addEventListener('click', () => {
      const row = [
        new Date().toLocaleDateString(),
        document.getElementById('create-mean').textContent,
        document.getElementById('batch-mean').textContent,
        document.getElementById('para-mean').textContent,
        document.getElementById('doc-mean').textContent,
      ].join('\t');
      navigator.clipboard.writeText(row);
    });

    document.getElementById('saveBaselineBtn').addEventListener('click', () => {
      const slot = document.getElementById('baselineSlot').value;
      const label = document.getElementById('runLabel').value.trim() || slot;
      const store = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      store[slot] = {
        label,
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
