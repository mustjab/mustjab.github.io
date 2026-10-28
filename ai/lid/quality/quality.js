// Language Detection API Quality Benchmark
(function () {
  'use strict';

  const CASES = [
    { id: 'core:en', category: 'core', expected: 'en', text: 'The quick brown fox jumps over the lazy dog near the riverbank.' },
    { id: 'core:es', category: 'core', expected: 'es', text: 'La inteligencia artificial integrada en el navegador mejora la privacidad del usuario.' },
    { id: 'core:fr', category: 'core', expected: 'fr', text: 'Les modèles de traduction locaux fonctionnent directement sur votre appareil sans connexion.' },
    { id: 'core:de', category: 'core', expected: 'de', text: 'Die lokale Sprachverarbeitung im Browser schützt vertrauliche Unternehmensdaten zuverlässig.' },
    { id: 'core:it', category: 'core', expected: 'it', text: 'Il riconoscimento automatico della lingua consente di tradurre le pagine web in tempo reale.' },
    { id: 'core:pt', category: 'core', expected: 'pt', text: 'O navegador processa todas as solicitações localmente sem enviar dados para servidores externos.' },
    { id: 'core:ja', category: 'core', expected: 'ja', text: 'ブラウザ内蔵の言語検出モデルは、ネットワーク接続なしで高速にテキストの言語を 판別します。'.replace('판別', '判別') },
    { id: 'core:zh', category: 'core', expected: 'zh', text: '浏览器内置的语言检测接口可以在本地快速识别文本语言并保护用户隐私。' },
    { id: 'core:ko', category: 'core', expected: 'ko', text: '온디바이스 언어 감지 기능은 서버로 데이터를 전송하지 않고 빠르게 언어를 식별합니다.' },
    { id: 'core:ru', category: 'core', expected: 'ru', text: 'Локальное определение языка в браузере обеспечивает высокую скорость и конфиденциальность.' },
    { id: 'core:ar', category: 'core', expected: 'ar', text: 'يتيح اكتشاف اللغة المدمج في المتصفح ترجمة الصفحات بسرعة عالية مع الحفاظ على الخصوصية.' },
    { id: 'core:hi', category: 'core', expected: 'hi', text: 'ब्राउज़र में अंतर्निहित भाषा पहचान तकनीक उपयोगकर्ता की गोपनीयता की रक्षा करती है।' },

    // Close pairs & short sentences
    { id: 'close:nl-vs-de', category: 'close', expected: 'nl', text: 'Hoe gaat het vandaag met de ontwikkeling van de nieuwe applicatie?' },
    { id: 'close:uk-vs-ru', category: 'close', expected: 'uk', text: 'Дякуємо за те, що скористалися нашим сервісом перекладу повідомлень.' },
    { id: 'close:sv-vs-no', category: 'close', expected: 'sv', text: 'Vi behöver uppdatera inställningarna för säkerhet och sekretess i webbläsaren.' },
    { id: 'close:pl-vs-cs', category: 'close', expected: 'pl', text: 'Proszę sprawdzić ustawienia połączenia sieciowego przed ponownym uruchomieniem.' },

    // Noisy text with URLs, numbers, and code tokens
    { id: 'noisy:es-with-url-and-email', category: 'noisy', expected: 'es', text: 'Visita https://contoso.com/docs/v2 o escribe a support@contoso.com antes de las 6 PM para obtener ayuda.' },
    { id: 'noisy:de-with-version-and-code', category: 'noisy', expected: 'de', text: 'Bitte installieren Sie ASP.NET Core Runtime 8.0.4 über winget install Microsoft.DotNet.Runtime.8.' },
    { id: 'noisy:ja-with-currency-and-dates', category: 'noisy', expected: 'ja', text: '2026年10月22日の売上高は USD 24.2 billion（前年比 +14.5%）に達しました。' },
    { id: 'noisy:fr-with-json-identifiers', category: 'noisy', expected: 'fr', text: 'Veuillez vérifier le paramètre max_Retries_Count_2 dans le fichier config_v3.json avant le déploiement.' },
  ];

  function matchesLang(actual, expected) {
    if (!actual) return false;
    const a = actual.toLowerCase();
    const e = expected.toLowerCase();
    return a === e || a.startsWith(e + '-');
  }

  document.addEventListener('DOMContentLoaded', async () => {
    let avail = 'unavailable';
    if ('LanguageDetector' in self && typeof LanguageDetector.availability === 'function') {
      try { avail = await LanguageDetector.availability(); } catch (_) {}
    }
    const ready = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'after-download';
    const hasApi = ready;
    document.getElementById('statusIndicator').className = 'status-indicator ' + (ready ? 'available' : 'unavailable');
    document.getElementById('statusText').textContent = ready ? `LanguageDetector Available (${avail})` : `LanguageDetector (${avail})`;

    let lastRecords = [];

    document.getElementById('startBtn').addEventListener('click', async () => {
      if (!hasApi) return;
      const list = document.getElementById('caseResultsList');
      list.innerHTML = '';
      lastRecords = [];
      const det = await LanguageDetector.create();

      let passCount = 0;
      let corePass = 0, coreTot = 0;
      let closePass = 0, closeTot = 0;
      let noisyPass = 0, noisyTot = 0;

      try {
        for (let i = 0; i < CASES.length; i++) {
          const c = CASES[i];
          const t0 = performance.now();
          const results = await det.detect(c.text);
          const elapsedMs = Math.round(performance.now() - t0);
          const top = Array.isArray(results) && results.length ? results[0] : null;
          const actual = top?.detectedLanguage || 'unknown';
          const conf = top?.confidence != null ? (top.confidence * 100).toFixed(1) + '%' : '—';
          const pass = matchesLang(actual, c.expected);
          lastRecords.push({ id: c.id, category: c.category, expected: c.expected, actual, conf, pass, elapsedMs, text: c.text });

          if (pass) passCount++;
          if (c.category === 'core') { coreTot++; if (pass) corePass++; }
          else if (c.category === 'close') { closeTot++; if (pass) closePass++; }
          else { noisyTot++; if (pass) noisyPass++; }

          document.getElementById('totalPass').textContent = String(passCount);
          document.getElementById('totalCount').textContent = String(i + 1);
          document.getElementById('passRate').textContent = ((passCount / (i + 1)) * 100).toFixed(1);
          document.getElementById('coreScore').textContent = coreTot ? `${corePass} / ${coreTot}` : '—';
          document.getElementById('closeScore').textContent = closeTot ? `${closePass} / ${closeTot}` : '—';
          document.getElementById('noisyScore').textContent = noisyTot ? `${noisyPass} / ${noisyTot}` : '—';
          document.getElementById('progressBar').style.width = `${((i + 1) / CASES.length) * 100}%`;

          const card = document.createElement('div');
          card.className = `quality-case-card ${pass ? 'pass' : 'fail'}`;
          card.innerHTML = `
            <div class="quality-case-header">
              <span><code>${c.id}</code> (expected: <code>${c.expected}</code>)</span>
              <span>
                <small style="color: var(--text-muted); margin-right: 0.45rem;">${elapsedMs} ms</small>
                <span class="badge ${pass ? 'badge-pass' : 'badge-fail'}">${pass ? 'PASS' : 'FAIL'}</span>
              </span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.2rem;">
              <strong>Text:</strong> ${c.text}
            </div>
            <div style="font-size: 0.82rem; font-family: ui-monospace, monospace;">
              <strong>Detected:</strong> ${actual} (confidence: ${conf})
            </div>
          `;
          list.appendChild(card);
        }
      } finally {
        if (det && typeof det.destroy === 'function') det.destroy();
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
      const headerLine = [
        new Date().toLocaleDateString(),
        ...browserCols,
        `${document.getElementById('totalPass').textContent}/${document.getElementById('totalCount').textContent}`,
        `${document.getElementById('passRate').textContent}%`,
        `Core:${document.getElementById('coreScore').textContent}`,
        `Close:${document.getElementById('closeScore').textContent}`,
        `Noisy:${document.getElementById('noisyScore').textContent}`,
      ].join('\t');
      const detailLines = [
        'Case ID\tCategory\tExpected\tDetected\tConfidence\tResult\tLatency (ms)',
        ...lastRecords.map(r => [r.id, r.category, r.expected, r.actual, r.conf, r.pass ? 'PASS' : 'FAIL', r.elapsedMs].join('\t')),
      ];
      navigator.clipboard.writeText([headerLine, '', ...detailLines].join('\n'));
    });
  });
})();
