// Speech API Quality Benchmark (/ai/speech/quality/)
(function () {
  'use strict';

  const helper = window.SpeechAudioHelper;
  const $ = id => document.getElementById(id);

  const CASES = [
    {
      id: 'command:overview',
      clip: 'overview',
      quality: 'command',
      requiredPattern: /seattle|seventy[\s-]?two|72/i,
    },
    {
      id: 'command:meeting',
      clip: 'meeting',
      quality: 'command',
      requiredPattern: /monday|quarterly|accessibility/i,
    },
    {
      id: 'command:numbers',
      clip: 'numbers',
      quality: 'command',
      requiredPattern: /fourteen|14\.5|twenty[\s-]?eight|28|six|6/i,
    },
    {
      id: 'dictation:overview',
      clip: 'overview',
      quality: 'dictation',
      requiredPattern: /seattle|seventy[\s-]?two|72/i,
    },
    {
      id: 'dictation:meeting',
      clip: 'meeting',
      quality: 'dictation',
      requiredPattern: /monday|quarterly|accessibility/i,
    },
    {
      id: 'dictation:numbers',
      clip: 'numbers',
      quality: 'dictation',
      requiredPattern: /fourteen|14\.5|twenty[\s-]?eight|28|six|6/i,
    },
  ];

  let abortCtrl = null;
  let lastReport = '';

  async function refreshStatus() {
    const ind = $('statusIndicator');
    const txt = $('statusText');
    if (!helper) return;
    const res = await helper.checkSpeechAvailability({ lang: 'en-US', processLocally: true }, window);
    if (!res.supported) {
      if (ind) ind.className = 'status-indicator unavailable';
      if (txt) txt.textContent = 'SpeechRecognition unavailable';
    } else if (res.status === 'available' || res.status === 'browser-default') {
      if (ind) ind.className = 'status-indicator available';
      if (txt) txt.textContent = res.status === 'available' ? 'On-Device Speech ready' : 'Web Speech available';
    } else {
      if (ind) ind.className = res.status === 'unavailable' ? 'status-indicator unavailable' : 'status-indicator checking';
      if (txt) txt.textContent = `On-Device Speech: ${res.status}`;
    }
  }

  async function runSuite() {
    if (abortCtrl) return;
    abortCtrl = new AbortController();
    $('startBtn').disabled = true;
    $('stopBtn').disabled = false;
    $('copyBtn').disabled = true;
    $('caseResultsList').innerHTML = '';
    $('progressBar').style.width = '0%';

    let passCount = 0;
    let cmdPass = 0;
    let dictPass = 0;
    let accSum = 0;
    let completed = 0;
    const lines = [];

    try {
      const bufferCache = {};
      for (let i = 0; i < CASES.length; i++) {
        abortCtrl.signal.throwIfAborted();
        const c = CASES[i];
        const sample = helper.SPEECH_SAMPLES[c.clip];
        if (!bufferCache[c.clip]) {
          bufferCache[c.clip] = await helper.decodeAudioSourceToBuffer(`../${sample.file}`);
        }
        const res = await helper.transcribeAudioBufferWithSpeechRecognition(bufferCache[c.clip], {
          lang: sample.lang,
          processLocally: true,
          quality: c.quality,
          signal: abortCtrl.signal,
        });
        const acc = helper.computeWordAccuracy(sample.reference, res.transcript);
        const entityOk = c.requiredPattern.test(res.transcript);
        const passed = acc.accuracyPct >= 75 && entityOk;

        completed++;
        accSum += acc.accuracyPct;
        if (passed) {
          passCount++;
          if (c.quality === 'command') cmdPass++;
          else dictPass++;
        }

        const card = document.createElement('div');
        card.className = `quality-case-card ${passed ? 'pass' : 'fail'}`;
        card.innerHTML = `
          <div class="quality-case-header">
            <span>${c.id} (${sample.file})</span>
            <span class="badge ${passed ? 'badge-pass' : 'badge-fail'}">${passed ? 'PASS' : 'FAIL'} · ${acc.accuracyPct}% acc</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:0.25rem;"><strong>Ref:</strong> ${sample.reference}</div>
          <div style="font-size:0.82rem;"><strong>Out:</strong> ${res.transcript || '(empty)'}</div>
        `;
        $('caseResultsList').appendChild(card);

        $('totalPass').textContent = String(passCount);
        $('passRate').textContent = String(Math.round((passCount / CASES.length) * 100));
        $('meanAccuracy').textContent = `${(accSum / completed).toFixed(1)}%`;
        $('commandScore').textContent = `${cmdPass} / 3`;
        $('dictationScore').textContent = `${dictPass} / 3`;
        $('progressBar').style.width = `${Math.round(((i + 1) / CASES.length) * 100)}%`;

        lines.push(`${c.id}\t${passed ? 'PASS' : 'FAIL'}\t${acc.accuracyPct}%\t${res.totalMs}ms\t${res.transcript}`);
      }
      lastReport = `Case\tResult\tWordAccuracy\tTime\tTranscript\n${lines.join('\n')}`;
      $('copyBtn').disabled = false;
    } catch (err) {
      if (err?.name !== 'AbortError') {
        const errCard = document.createElement('div');
        errCard.className = 'quality-case-card fail';
        errCard.textContent = `Suite stopped: ${err.message || err}`;
        $('caseResultsList').appendChild(errCard);
      }
    } finally {
      abortCtrl = null;
      $('startBtn').disabled = false;
      $('stopBtn').disabled = true;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    refreshStatus();
    $('startBtn')?.addEventListener('click', runSuite);
    $('stopBtn')?.addEventListener('click', () => abortCtrl?.abort());
    $('copyBtn')?.addEventListener('click', () => {
      if (lastReport) navigator.clipboard?.writeText(lastReport);
    });
    $('clearBtn')?.addEventListener('click', () => {
      $('caseResultsList').innerHTML = '';
      $('totalPass').textContent = '0';
      $('passRate').textContent = '0';
      $('meanAccuracy').textContent = '—';
      $('commandScore').textContent = '—';
      $('dictationScore').textContent = '—';
      $('progressBar').style.width = '0%';
      $('copyBtn').disabled = true;
    });
  });
})();
