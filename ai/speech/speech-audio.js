/* Shared On-Device Speech & Audio helper for /ai/speech/ and /ai/e2e/
 * Supports bundled MP3 samples without requiring user file uploads,
 * Web Speech API MediaStreamTrack transcription (SpeechRecognition.start(track)),
 * and Prompt API multimodal audio (LanguageModel expectedInputs: [{ type: 'audio' }]).
 */
(function (root) {
  'use strict';

  const SPEECH_SAMPLES = {
    overview: {
      id: 'overview',
      file: 'sample-en.mp3',
      label: 'Coastal Weather Forecast (sample-en.mp3)',
      lang: 'en-US',
      reference:
        'Clear skies and a gentle coastal breeze are expected across Seattle this weekend, with afternoon temperatures reaching seventy two degrees.',
    },
    meeting: {
      id: 'meeting',
      file: 'sample-meeting.mp3',
      label: 'Monday Planning Note (sample-meeting.mp3)',
      lang: 'en-US',
      reference:
        'Reminder for Monday morning: finalize the quarterly design presentation, review the accessibility checklist, and share the updated schedule with the team.',
    },
    numbers: {
      id: 'numbers',
      file: 'sample-numbers.mp3',
      label: 'Mars Rover Telemetry (sample-numbers.mp3)',
      lang: 'en-US',
      reference:
        'The autonomous rover traveled fourteen point five kilometers across the crater floor and collected twenty eight mineral samples in six days.',
    },
  };

  function normalizeWords(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function computeWordAccuracy(referenceText, hypothesisText) {
    const ref = normalizeWords(referenceText);
    const hyp = normalizeWords(hypothesisText);
    if (!ref.length) {
      return { accuracyPct: hyp.length ? 0 : 100, werPct: hyp.length ? 100 : 0, edits: hyp.length, refWords: 0, hypWords: hyp.length };
    }
    const rows = ref.length + 1;
    const cols = hyp.length + 1;
    const dp = Array.from({ length: rows }, () => new Int32Array(cols));
    for (let i = 0; i < rows; i++) dp[i][0] = i;
    for (let j = 0; j < cols; j++) dp[0][j] = j;
    for (let i = 1; i < rows; i++) {
      for (let j = 1; j < cols; j++) {
        const cost = ref[i - 1] === hyp[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    const edits = dp[ref.length][hyp.length];
    const wer = edits / ref.length;
    const accuracyPct = Math.max(0, Math.round((1 - wer) * 1000) / 10);
    const werPct = Math.round(wer * 1000) / 10;
    return { accuracyPct, werPct, edits, refWords: ref.length, hypWords: hyp.length };
  }

  function getSpeechRecognitionCtor(win = root) {
    return win?.SpeechRecognition || win?.webkitSpeechRecognition || null;
  }

  async function checkSpeechAvailability(options = {}, win = root) {
    const Ctor = getSpeechRecognitionCtor(win);
    if (!Ctor) {
      return { supported: false, onDeviceSupported: false, status: 'unavailable' };
    }
    const lang = options.lang || 'en-US';
    const processLocally = options.processLocally ?? true;
    const quality = options.quality || 'command';
    if (typeof Ctor.available === 'function') {
      try {
        const status = await Ctor.available({
          langs: [lang],
          processLocally,
          quality,
        });
        return { supported: true, onDeviceSupported: true, status: String(status || 'available') };
      } catch (err) {
        return { supported: true, onDeviceSupported: false, status: 'browser-default', error: err?.message || String(err) };
      }
    }
    return { supported: true, onDeviceSupported: false, status: 'browser-default' };
  }

  async function ensureSpeechModelReady(options = {}, win = root) {
    const Ctor = options.SpeechRecognition || getSpeechRecognitionCtor(win);
    if (!Ctor) return;
    const lang = options.lang || 'en-US';
    const processLocally = options.processLocally ?? true;
    const quality = options.quality || 'command';
    if (!processLocally || typeof Ctor.available !== 'function' || typeof Ctor.install !== 'function') {
      return;
    }
    try {
      const avail = await Ctor.available({ langs: [lang], processLocally: true, quality });
      if (avail === 'downloadable') {
        if (typeof options.onStatus === 'function') {
          options.onStatus('Installing on-device speech model...');
        }
        const timeoutMs = options.installTimeoutMs ?? 15000;
        await Promise.race([
          Ctor.install({ langs: [lang], processLocally: true, quality }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('SpeechRecognition.install() timed out')), timeoutMs)
          ),
        ]);
      }
    } catch {}
  }
  async function installSpeechModel(options = {}, win = root) {
    const Ctor = getSpeechRecognitionCtor(win);
    if (!Ctor || typeof Ctor.install !== 'function') {
      throw new Error('SpeechRecognition.install() is not available in this browser.');
    }
    const lang = options.lang || 'en-US';
    const quality = options.quality || 'command';
    return Ctor.install({
      langs: [lang],
      processLocally: true,
      quality,
    });
  }

  async function decodeAudioSourceToBuffer(source, options = {}) {
    const win = options.window || root;
    const AudioCtx = options.AudioContext || win?.AudioContext || win?.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('Web Audio API (AudioContext) is not available.');
    }
    const fetchFn = options.fetch || (typeof fetch === 'function' ? fetch.bind(win) : null);

    let arrayBuffer;
    if (source instanceof ArrayBuffer) {
      arrayBuffer = source.slice(0);
    } else if (source && typeof source.arrayBuffer === 'function') {
      arrayBuffer = await source.arrayBuffer();
    } else if (typeof source === 'string') {
      if (!fetchFn) throw new Error('fetch() is unavailable to load audio URL.');
      const resp = await fetchFn(source);
      if (!resp.ok) {
        throw new Error(`Failed to fetch audio (${resp.status} ${resp.statusText}): ${source}`);
      }
      arrayBuffer = await resp.arrayBuffer();
    } else {
      throw new Error('Unsupported audio source.');
    }

    let ctx;
    try {
      ctx = new AudioCtx({ sampleRate: 16000 });
    } catch {
      ctx = new AudioCtx();
    }
    try {
      return await ctx.decodeAudioData(arrayBuffer);
    } finally {
      try {
        await ctx.close();
      } catch {}
    }
  }

  async function transcribeAudioBufferWithSpeechRecognition(audioBuffer, options = {}) {
    const win = options.window || root;
    const Ctor = options.SpeechRecognition || getSpeechRecognitionCtor(win);
    if (!Ctor) {
      throw new Error('Web Speech API (SpeechRecognition) is not supported in this browser.');
    }
    const AudioCtx = options.AudioContext || win?.AudioContext || win?.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('AudioContext is required to stream MP3 audio into SpeechRecognition.');
    }

    const lang = options.lang || 'en-US';
    const processLocally = options.processLocally ?? true;
    const quality = options.quality || 'command';
    const playAudio = Boolean(options.playAudio);
    const trailingSilenceMs = options.trailingSilenceMs ?? 850;
    const signal = options.signal || null;

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    await ensureSpeechModelReady({ lang, processLocally, quality, SpeechRecognition: Ctor, onStatus: options.onStatus }, win);

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    let ctx;
    try {
      ctx = new AudioCtx({ sampleRate: audioBuffer.sampleRate || 16000 });
    } catch {
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
      await ctx.resume();
    }

    const dest = ctx.createMediaStreamDestination();
    let silentKeepalive = null;
    if (typeof ctx.createConstantSource === 'function') {
      try {
        silentKeepalive = ctx.createConstantSource();
        silentKeepalive.offset.value = 0;
        silentKeepalive.connect(dest);
        silentKeepalive.start();
      } catch {
        silentKeepalive = null;
      }
    }
    const audioTrack = dest.stream.getAudioTracks()[0];
    if (!audioTrack) {
      await ctx.close().catch(() => {});
      throw new Error('Unable to create MediaStreamTrack from AudioContext.');
    }

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    if ('processLocally' in recognition) {
      recognition.processLocally = Boolean(processLocally);
    }
    if ('quality' in recognition && quality) {
      try {
        recognition.quality = quality;
      } catch {}
    }

    const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    let firstResultMs = null;
    let interimCount = 0;
    let finalTranscript = '';
    let latestInterim = '';
    let sourceStarted = false;
    let settled = false;
    let sourceNode = null;
    let stopTimer = null;
    let startFallbackTimer = null;

    return new Promise((resolve, reject) => {
      const cleanup = () => {
        if (stopTimer) clearTimeout(stopTimer);
        if (startFallbackTimer) clearTimeout(startFallbackTimer);
        try {
          if (sourceNode) sourceNode.disconnect();
        } catch {}
        try {
          if (silentKeepalive) {
            silentKeepalive.stop();
            silentKeepalive.disconnect();
          }
        } catch {}
        try {
          audioTrack.stop();
        } catch {}
        ctx.close().catch(() => {});
      };

      const finishResolve = () => {
        if (settled) return;
        settled = true;
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const totalMs = Math.max(1, Math.round(now - t0));
        const combined = (finalTranscript + (latestInterim ? ` ${latestInterim}` : '')).replace(/\s+/g, ' ').trim();
        const durationSec = Number(audioBuffer.duration || 0);
        const rtf = durationSec > 0 ? Math.round(((totalMs / 1000) / durationSec) * 100) / 100 : null;
        cleanup();
        resolve({
          transcript: combined,
          finalTranscript: finalTranscript.trim(),
          interimCount,
          firstResultMs,
          totalMs,
          durationSec,
          rtf,
        });
      };

      const finishReject = err => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(err);
      };

      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            try {
              recognition.abort();
            } catch {}
            finishReject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      }

      const startBufferPlayback = () => {
        if (sourceStarted || settled) return;
        sourceStarted = true;
        sourceNode = ctx.createBufferSource();
        sourceNode.buffer = audioBuffer;
        sourceNode.connect(dest);
        if (playAudio && ctx.destination) {
          sourceNode.connect(ctx.destination);
        }
        sourceNode.onended = () => {
          stopTimer = setTimeout(() => {
            try {
              recognition.stop();
            } catch {
              finishResolve();
            }
          }, trailingSilenceMs);
        };
        const leadInSec = 0.12;
        sourceNode.start((ctx.currentTime || 0) + leadInSec);
      };

      recognition.onaudiostart = startBufferPlayback;
      recognition.onstart = () => {
        startFallbackTimer = setTimeout(startBufferPlayback, 180);
      };

      recognition.onresult = event => {
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        if (firstResultMs === null) {
          firstResultMs = Math.max(1, Math.round(now - t0));
        }
        let finals = '';
        let interims = '';
        const results = event?.results || [];
        for (let i = 0; i < results.length; i++) {
          const res = results[i];
          const text = res?.[0]?.transcript || '';
          if (res?.isFinal) {
            finals += (finals && !finals.endsWith(' ') ? ' ' : '') + text.trim();
          } else {
            interims += (interims ? ' ' : '') + text.trim();
          }
        }
        finalTranscript = finals.trim();
        latestInterim = interims.trim();
        if (latestInterim) interimCount += 1;
        if (typeof options.onProgress === 'function') {
          options.onProgress({
            finalTranscript,
            interimTranscript: latestInterim,
            combined: (finalTranscript + (latestInterim ? ` ${latestInterim}` : '')).trim(),
            firstResultMs,
          });
        }
      };

      recognition.onerror = event => {
        const code = event?.error || 'unknown';
        if (code === 'no-speech' && (finalTranscript || latestInterim)) {
          finishResolve();
          return;
        }
        finishReject(new Error(`SpeechRecognition error: ${code}${event?.message ? ` (${event.message})` : ''}`));
      };

      recognition.onend = () => {
        finishResolve();
      };

      try {
        recognition.start(audioTrack);
        startFallbackTimer = setTimeout(startBufferPlayback, 200);
      } catch (err) {
        finishReject(
          new Error(
            `SpeechRecognition.start(MediaStreamTrack) failed: ${err?.message || err}. Ensure MediaStreamTrackWebSpeech is supported in your browser.`
          )
        );
      }
    });
  }

  async function analyzeAudioBufferWithPromptApi(audioBuffer, promptText, options = {}) {
    const win = options.window || root;
    const LM = options.LanguageModel || win?.LanguageModel;
    if (!LM || typeof LM.create !== 'function') {
      throw new Error('Prompt API (LanguageModel) is not available in this browser.');
    }
    const signal = options.signal || null;
    const createOpts = {
      expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'audio' }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    };
    if (signal) createOpts.signal = signal;

    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const session = await LM.create(createOpts);
    let ttftMs = null;
    let output = '';
    try {
      const promptInput = [
        {
          role: 'user',
          content: [
            { type: 'text', value: promptText || 'Transcribe this audio clip verbatim.' },
            { type: 'audio', value: audioBuffer },
          ],
        },
      ];
      if (typeof session.promptStreaming === 'function') {
        const stream = session.promptStreaming(promptInput, signal ? { signal } : undefined);
        for await (const chunk of stream) {
          const text = String(chunk || '');
          if (!text) continue;
          if (ttftMs === null) {
            const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
            ttftMs = Math.max(1, Math.round(now - t0));
          }
          output += text;
          if (typeof options.onChunk === 'function') {
            options.onChunk(output, text);
          }
        }
      } else {
        output = String((await session.prompt(promptInput, signal ? { signal } : undefined)) || '');
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        ttftMs = Math.max(1, Math.round(now - t0));
      }
      const end = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        output: output.trim(),
        ttftMs: ttftMs ?? Math.max(1, Math.round(end - t0)),
        totalMs: Math.max(1, Math.round(end - t0)),
      };
    } finally {
      try {
        session.destroy?.();
      } catch {}
    }
  }

  const api = {
    SPEECH_SAMPLES,
    computeWordAccuracy,
    checkSpeechAvailability,
    ensureSpeechModelReady,
    installSpeechModel,
    decodeAudioSourceToBuffer,
    transcribeAudioBufferWithSpeechRecognition,
    analyzeAudioBufferWithPromptApi,
  };

  if (root) {
    root.SpeechAudioHelper = api;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
