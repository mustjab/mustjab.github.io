// Speech API Speed Benchmark (/ai/speech/speed/)
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-speech-speed-baselines-v1';
  const hwDetect =
    (typeof window !== 'undefined' && window.AIHardwareDetect) ||
    (typeof require === 'function' ? require('../../hardware-detect.js') : null);
  const hw = hwDetect ? hwDetect.createHardwareController('hardwareLabel', 'hardwarePresets') : null;
  const escapeHtml = hwDetect ? hwDetect.escapeHtml : s => String(s ?? '');
  const helper =
    (typeof window !== 'undefined' && window.SpeechAudioHelper) ||
    (typeof require === 'function' ? require('../speech-audio.js') : null);

  let activeRunController = null;
  let lastSummary = null;

  const $ = id => document.getElementById(id);

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

  async function measureClip(clipKey, signal) {
    const sample = helper.SPEECH_SAMPLES[clipKey];
    const audioBuffer = await helper.decodeAudioSourceToBuffer(`../${sample.file}`);
    signal?.throwIfAborted();
    const res = await helper.transcribeAudioBufferWithSpeechRecognition(audioBuffer, {
      lang: sample.lang,
      processLocally: true,
      quality: 'command',
      signal,
    });
    const outCodePoints = Array.from(res.transcript || '').length;
    const cps = (outCodePoints * 1000) / Math.max(1, res.totalMs);
    if ($(`dur-${clipKey}`)) $(`dur-${clipKey}`).textContent = `${res.durationSec.toFixed(1)}s`;
    if ($(`first-${clipKey}`)) $(`first-${clipKey}`).textContent = res.firstResultMs !== null ? `${res.firstResultMs}` : '—';
    if ($(`total-${clipKey}`)) $(`total-${clipKey}`).textContent = `${res.totalMs}`;
    if ($(`rtf-${clipKey}`)) $(`rtf-${clipKey}`).textContent = res.rtf !== null ? `${res.rtf.toFixed(2)}x` : '—';
    if ($(`cps-${clipKey}`)) $(`cps-${clipKey}`).textContent = cps.toFixed(1);
    return { ...res, cps };
  }

  async function runExclusive(fn) {
    if (activeRunController) return;
    activeRunController = new AbortController();
    if ($('measureAllBtn')) $('measureAllBtn').disabled = true;
    if ($('stopBench')) $('stopBench').disabled = false;
    try {
      await fn(activeRunController.signal);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        if ($('statusText')) $('statusText').textContent = `Error: ${err.message || err}`;
      }
    } finally {
      activeRunController = null;
      if ($('measureAllBtn')) $('measureAllBtn').disabled = false;
      if ($('stopBench')) $('stopBench').disabled = true;
    }
  }

  async function measureAll() {
    await runExclusive(async signal => {
      const keys = ['overview', 'meeting', 'numbers'];
      const results = [];
      for (const key of keys) {
        signal.throwIfAborted();
        results.push(await measureClip(key, signal));
      }
      const meanRtf = results.reduce((s, r) => s + (r.rtf || 0), 0) / results.length;
      const firstVals = results.filter(r => r.firstResultMs !== null).map(r => r.firstResultMs);
      const meanFirst = firstVals.length ? firstVals.reduce((s, v) => s + v, 0) / firstVals.length : 0;
      const meanTotal = results.reduce((s, r) => s + r.totalMs, 0) / results.length;
      const meanCps = results.reduce((s, r) => s + r.cps, 0) / results.length;

      if ($('hero-rtf')) $('hero-rtf').textContent = meanRtf.toFixed(2);
      if ($('hero-first-ms')) $('hero-first-ms').textContent = Math.round(meanFirst).toString();
      if ($('hero-total-ms')) $('hero-total-ms').textContent = Math.round(meanTotal).toString();
      if ($('hero-cps')) $('hero-cps').textContent = meanCps.toFixed(1);

      lastSummary = {
        timestamp: new Date().toISOString(),
        hardware: hw ? hw.getLabel() : 'Unknown',
        meanRtf: Number(meanRtf.toFixed(2)),
        meanFirstMs: Math.round(meanFirst),
        meanTotalMs: Math.round(meanTotal),
        meanCps: Number(meanCps.toFixed(1)),
      };
    });
  }

  function loadBaselines() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function renderBaselines() {
    const list = loadBaselines();
    const sec = $('baselineComparisonSection');
    const tbl = $('baselineComparisonTable');
    if (!sec || !tbl) return;
    if (!list.length) {
      sec.style.display = 'none';
      return;
    }
    sec.style.display = '';
    tbl.innerHTML = `<thead><tr><th>Saved At</th><th>Hardware / Backend</th><th>Mean RTF</th><th>First Interim (ms)</th><th>Total (ms)</th><th>Output CPS</th></tr></thead><tbody>${list
      .map(
        b =>
          `<tr><td>${escapeHtml(b.timestamp)}</td><td>${escapeHtml(b.hardware || '-')}</td><td>${escapeHtml(b.meanRtf)}x</td><td>${escapeHtml(b.meanFirstMs)}</td><td>${escapeHtml(b.meanTotalMs)}</td><td>${escapeHtml(b.meanCps)}</td></tr>`
      )
      .join('')}</tbody>`;
  }

  function copyTsv() {
    const hwLabel = hw ? hw.getLabel() : 'Unknown';
    const header = 'Hardware / Backend\tMean RTF\tFirst Interim (ms)\tMean Total (ms)\tOutput CPS';
    const row = `${hwLabel}\t${$('hero-rtf')?.textContent || '0'}\t${$('hero-first-ms')?.textContent || '0'}\t${$('hero-total-ms')?.textContent || '0'}\t${$('hero-cps')?.textContent || '0'}`;
    navigator.clipboard?.writeText(`${header}\n${row}`);
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      if (hw) hw.init();
      refreshStatus();
      renderBaselines();
      $('measureAllBtn')?.addEventListener('click', measureAll);
      $('replayOverview')?.addEventListener('click', () => runExclusive(sig => measureClip('overview', sig)));
      $('stopBench')?.addEventListener('click', () => activeRunController?.abort());
      $('copyTsvBtn')?.addEventListener('click', copyTsv);
      $('saveBaselineBtn')?.addEventListener('click', () => {
        if (!lastSummary) return;
        const list = loadBaselines();
        list.unshift({ ...lastSummary, hardware: hw ? hw.getLabel() : lastSummary.hardware });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 10)));
        renderBaselines();
      });
      $('clearBaselinesBtn')?.addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        renderBaselines();
      });
      window.addEventListener('pagehide', () => activeRunController?.abort());
    });
  }
})();
