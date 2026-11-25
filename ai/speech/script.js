/* On-Device Speech & Audio Playground controller (/ai/speech/) */
(function () {
  'use strict';

  const helper = window.SpeechAudioHelper;
  const $ = id => document.getElementById(id);

  class SpeechDemoApp {
    constructor() {
      this.selectedSampleKey = 'overview';
      this.customFile = null;
      this.speechAbort = null;
      this.micRecognition = null;
      this.promptAbort = null;
      this.lastTranscript = '';
      this.init();
    }

    init() {
      document.querySelectorAll('.preset-pill').forEach(btn => {
        btn.addEventListener('click', () => this.selectPreset(btn.dataset.sample));
      });

      $('audioUploadInput')?.addEventListener('change', e => {
        const file = e.target.files?.[0];
        if (file) this.selectCustomFile(file);
      });

      $('speechLang')?.addEventListener('change', () => this.refreshAvailability());
      $('speechMode')?.addEventListener('change', () => this.refreshAvailability());
      $('speechQuality')?.addEventListener('change', () => this.refreshAvailability());

      $('installModelBtn')?.addEventListener('click', () => this.handleInstallModel());
      $('transcribeMp3Btn')?.addEventListener('click', () => this.transcribeSelectedAudio());
      $('liveMicBtn')?.addEventListener('click', () => this.startLiveMic());
      $('stopSpeechBtn')?.addEventListener('click', () => this.stopSpeech());
      $('copyTranscriptBtn')?.addEventListener('click', () => {
        if (this.lastTranscript) navigator.clipboard?.writeText(this.lastTranscript);
      });

      $('runPromptAudioBtn')?.addEventListener('click', () => this.runPromptAudio());
      $('stopPromptAudioBtn')?.addEventListener('click', () => this.promptAbort?.abort());

      this.refreshAvailability();
    }

    selectPreset(key) {
      const sample = helper.SPEECH_SAMPLES[key];
      if (!sample) return;
      this.selectedSampleKey = key;
      this.customFile = null;
      document.querySelectorAll('.preset-pill').forEach(btn => {
        btn.classList.toggle('is-selected', btn.dataset.sample === key);
      });
      if ($('activeSourceLabel')) $('activeSourceLabel').textContent = sample.file;
      if ($('audioPreview')) $('audioPreview').src = `./${sample.file}`;
      if ($('referenceBox')) $('referenceBox').style.display = '';
      if ($('referenceText')) $('referenceText').textContent = sample.reference;
    }

    selectCustomFile(file) {
      this.customFile = file;
      this.selectedSampleKey = null;
      document.querySelectorAll('.preset-pill').forEach(btn => btn.classList.remove('is-selected'));
      if ($('activeSourceLabel')) $('activeSourceLabel').textContent = file.name;
      if ($('audioPreview')) $('audioPreview').src = URL.createObjectURL(file);
      if ($('referenceBox')) $('referenceBox').style.display = 'none';
    }

    getSpeechOptions() {
      return {
        lang: $('speechLang')?.value || 'en-US',
        processLocally: ($('speechMode')?.value || 'local') === 'local',
        quality: $('speechQuality')?.value || 'command',
      };
    }

    async refreshAvailability() {
      const ind = $('statusIndicator');
      const txt = $('statusText');
      const installBtn = $('installModelBtn');
      const opts = this.getSpeechOptions();
      const res = await helper.checkSpeechAvailability(opts, window);

      if (!res.supported) {
        if (ind) ind.className = 'status-indicator unavailable';
        if (txt) txt.textContent = 'SpeechRecognition unavailable';
        if (installBtn) installBtn.style.display = 'none';
        return;
      }

      if (res.status === 'available' || res.status === 'browser-default') {
        if (ind) ind.className = 'status-indicator available';
        if (txt) {
          txt.textContent =
            res.status === 'available'
              ? `On-Device Speech ready (${opts.lang})`
              : `Web Speech available (${opts.lang})`;
        }
        if (installBtn) installBtn.style.display = 'none';
      } else if (res.status === 'downloadable' || res.status === 'downloading') {
        if (ind) ind.className = 'status-indicator checking';
        if (txt) txt.textContent = `On-Device model ${res.status} (${opts.lang})`;
        if (installBtn) installBtn.style.display = res.status === 'downloadable' ? '' : 'none';
      } else {
        if (ind) ind.className = 'status-indicator unavailable';
        if (txt) txt.textContent = `On-Device Speech: ${res.status} (${opts.lang})`;
        if (installBtn) installBtn.style.display = 'none';
      }
    }

    async handleInstallModel() {
      const btn = $('installModelBtn');
      const opts = this.getSpeechOptions();
      if (btn) btn.disabled = true;
      if ($('speechRunStatus')) $('speechRunStatus').textContent = 'Installing on-device speech model...';
      try {
        const ok = await helper.installSpeechModel(opts, window);
        if ($('speechRunStatus')) {
          $('speechRunStatus').textContent = ok ? 'On-device speech model installed' : 'Model install returned false';
        }
      } catch (err) {
        if ($('speechRunStatus')) $('speechRunStatus').textContent = `Install failed: ${err.message || err}`;
      } finally {
        if (btn) btn.disabled = false;
        await this.refreshAvailability();
      }
    }

    async loadSelectedAudioBuffer() {
      if (this.customFile) {
        return helper.decodeAudioSourceToBuffer(this.customFile);
      }
      const sample = helper.SPEECH_SAMPLES[this.selectedSampleKey || 'overview'];
      return helper.decodeAudioSourceToBuffer(`./${sample.file}`);
    }

    setSpeechBusy(busy, statusMsg) {
      if ($('transcribeMp3Btn')) $('transcribeMp3Btn').disabled = busy;
      if ($('liveMicBtn')) $('liveMicBtn').disabled = busy;
      if ($('stopSpeechBtn')) $('stopSpeechBtn').disabled = !busy;
      if ($('speechRunStatus') && statusMsg) $('speechRunStatus').textContent = statusMsg;
    }

    async transcribeSelectedAudio() {
      this.stopSpeech();
      this.speechAbort = new AbortController();
      this.setSpeechBusy(true, 'Decoding MP3...');
      if ($('speechTranscript')) $('speechTranscript').textContent = '';

      try {
        const opts = this.getSpeechOptions();
        // Run model readiness/install check immediately while transient user activation is still active
        await helper.ensureSpeechModelReady(
          {
            ...opts,
            onStatus: msg => {
              if ($('speechRunStatus')) $('speechRunStatus').textContent = msg;
            },
          },
          window
        );
        if ($('speechRunStatus')) $('speechRunStatus').textContent = 'Decoding MP3...';
        const audioBuffer = await this.loadSelectedAudioBuffer();
        if ($('metricDuration')) $('metricDuration').textContent = `${audioBuffer.duration.toFixed(1)}s`;
        if ($('speechRunStatus')) $('speechRunStatus').textContent = 'Streaming MP3 into SpeechRecognition...';
        const result = await helper.transcribeAudioBufferWithSpeechRecognition(audioBuffer, {
          ...opts,
          playAudio: Boolean($('playOutLoudToggle')?.checked),
          signal: this.speechAbort.signal,
          onStatus: msg => {
            if ($('speechRunStatus')) $('speechRunStatus').textContent = msg;
          },
          onProgress: prog => {
            if ($('metricFirstMs') && prog.firstResultMs !== null) {
              $('metricFirstMs').textContent = `${prog.firstResultMs} ms`;
            }
            if ($('speechTranscript')) {
              $('speechTranscript').innerHTML = '';
              const finalSpan = document.createElement('span');
              finalSpan.textContent = prog.finalTranscript || '';
              $('speechTranscript').appendChild(finalSpan);
              if (prog.interimTranscript) {
                const interimSpan = document.createElement('span');
                interimSpan.className = 'transcript-interim';
                interimSpan.textContent = (prog.finalTranscript ? ' ' : '') + prog.interimTranscript;
                $('speechTranscript').appendChild(interimSpan);
              }
            }
          },
        });

        this.lastTranscript = result.transcript;
        if ($('speechTranscript')) {
          $('speechTranscript').textContent = result.transcript || '(No speech detected)';
        }
        if ($('copyTranscriptBtn')) $('copyTranscriptBtn').disabled = !result.transcript;
        if ($('metricFirstMs')) {
          $('metricFirstMs').textContent = result.firstResultMs !== null ? `${result.firstResultMs} ms` : '-';
        }
        if ($('metricTotalMs')) $('metricTotalMs').textContent = `${result.totalMs} ms`;
        if ($('metricRtf')) $('metricRtf').textContent = result.rtf !== null ? `${result.rtf}x` : '-';

        if (this.selectedSampleKey && helper.SPEECH_SAMPLES[this.selectedSampleKey]) {
          const acc = helper.computeWordAccuracy(
            helper.SPEECH_SAMPLES[this.selectedSampleKey].reference,
            result.transcript
          );
          if ($('metricAccuracy')) $('metricAccuracy').textContent = `${acc.accuracyPct}%`;
        } else if ($('metricAccuracy')) {
          $('metricAccuracy').textContent = 'N/A';
        }
        this.setSpeechBusy(false, 'Done');
      } catch (err) {
        if (err?.name === 'AbortError') {
          this.setSpeechBusy(false, 'Stopped');
          return;
        }
        if ($('speechTranscript')) $('speechTranscript').textContent = `Error: ${err.message || err}`;
        this.setSpeechBusy(false, 'Error');
      } finally {
        this.speechAbort = null;
      }
    }

    startLiveMic() {
      this.stopSpeech();
      const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Ctor) {
        if ($('speechTranscript')) $('speechTranscript').textContent = 'SpeechRecognition is not supported.';
        return;
      }
      const opts = this.getSpeechOptions();
      const rec = new Ctor();
      this.micRecognition = rec;
      rec.lang = opts.lang;
      rec.continuous = true;
      rec.interimResults = true;
      if ('processLocally' in rec) rec.processLocally = opts.processLocally;
      if ('quality' in rec) {
        try {
          rec.quality = opts.quality;
        } catch {}
      }

      const t0 = performance.now();
      let firstMs = null;
      this.setSpeechBusy(true, 'Listening on microphone...');
      if ($('speechTranscript')) $('speechTranscript').textContent = 'Speak into your microphone...';
      if ($('metricDuration')) $('metricDuration').textContent = 'Live Mic';
      if ($('metricAccuracy')) $('metricAccuracy').textContent = 'N/A';
      if ($('metricRtf')) $('metricRtf').textContent = 'Live';

      rec.onresult = event => {
        if (firstMs === null) {
          firstMs = Math.round(performance.now() - t0);
          if ($('metricFirstMs')) $('metricFirstMs').textContent = `${firstMs} ms`;
        }
        let finals = '';
        let interims = '';
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) finals += (finals ? ' ' : '') + r[0].transcript.trim();
          else interims += (interims ? ' ' : '') + r[0].transcript.trim();
        }
        this.lastTranscript = (finals + (interims ? ` ${interims}` : '')).trim();
        if ($('speechTranscript')) $('speechTranscript').textContent = this.lastTranscript;
        if ($('copyTranscriptBtn')) $('copyTranscriptBtn').disabled = !this.lastTranscript;
      };

      rec.onerror = e => {
        if ($('speechTranscript')) $('speechTranscript').textContent = `Microphone error: ${e.error}`;
        this.micRecognition = null;
        this.setSpeechBusy(false, 'Error');
      };

      rec.onend = () => {
        if ($('metricTotalMs')) $('metricTotalMs').textContent = `${Math.round(performance.now() - t0)} ms`;
        this.micRecognition = null;
        this.setSpeechBusy(false, 'Done');
      };

      rec.start();
    }

    stopSpeech() {
      if (this.speechAbort) {
        this.speechAbort.abort();
        this.speechAbort = null;
      }
      if (this.micRecognition) {
        try {
          this.micRecognition.stop();
        } catch {}
        this.micRecognition = null;
      }
    }

    async runPromptAudio() {
      if (this.promptAbort) this.promptAbort.abort();
      this.promptAbort = new AbortController();
      if ($('runPromptAudioBtn')) $('runPromptAudioBtn').disabled = true;
      if ($('stopPromptAudioBtn')) $('stopPromptAudioBtn').disabled = false;
      if ($('promptAudioStats')) $('promptAudioStats').textContent = 'Decoding MP3 & invoking LanguageModel...';
      if ($('promptAudioOutput')) $('promptAudioOutput').textContent = '';

      try {
        const audioBuffer = await this.loadSelectedAudioBuffer();
        const promptText = $('audioPromptInput')?.value || 'Transcribe this audio clip verbatim.';
        const res = await helper.analyzeAudioBufferWithPromptApi(audioBuffer, promptText, {
          signal: this.promptAbort.signal,
          onChunk: partial => {
            if ($('promptAudioOutput')) $('promptAudioOutput').textContent = partial;
          },
        });
        if ($('promptAudioOutput')) $('promptAudioOutput').textContent = res.output || '(Empty response)';
        if ($('promptAudioStats')) {
          $('promptAudioStats').textContent = `TTFT ${res.ttftMs} ms · Total ${res.totalMs} ms`;
        }
      } catch (err) {
        if (err?.name === 'AbortError') {
          if ($('promptAudioStats')) $('promptAudioStats').textContent = 'Stopped';
        } else {
          if ($('promptAudioOutput')) $('promptAudioOutput').textContent = `Error: ${err.message || err}`;
          if ($('promptAudioStats')) $('promptAudioStats').textContent = 'Unavailable / Error';
        }
      } finally {
        this.promptAbort = null;
        if ($('runPromptAudioBtn')) $('runPromptAudioBtn').disabled = false;
        if ($('stopPromptAudioBtn')) $('stopPromptAudioBtn').disabled = true;
      }
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => new SpeechDemoApp());
    } else {
      new SpeechDemoApp();
    }
  }
})();
