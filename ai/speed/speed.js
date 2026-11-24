// Prompt API Speed Benchmark (TTFT, 1K Prefill, Token Generation TPS, and Tool Calling)
(function () {
  'use strict';

  const STORAGE_KEY = 'edge-ai-prompt-speed-baselines-v1';
  const kMillisecond = 1000;

  const k1KTokenPrompt = `Summarize this text: The National Aeronautics and Space Administration (NASA /ˈnæsə/) is an independent agency of the U.S. federal government responsible for the civil space program, aeronautics research, and space research. Established in 1958, it succeeded the National Advisory Committee for Aeronautics (NACA) to give the U.S. space development effort a distinct civilian orientation, emphasizing peaceful applications in space science. It has since led most of America's space exploration programs, including Project Mercury, Project Gemini, the 1968–1972 Apollo Moon landing missions, the Skylab space station, and the Space Shuttle. Currently, NASA supports the International Space Station (ISS) along with the Commercial Crew Program, and oversees the development of the Orion spacecraft and the Space Launch System for the lunar Artemis program.

NASA's science division is focused on better understanding Earth through the Earth Observing System; advancing heliophysics through the efforts of the Science Mission Directorate's Heliophysics Research Program; exploring bodies throughout the Solar System with advanced robotic spacecraft such as New Horizons and planetary rovers such as Perseverance; and researching astrophysics topics, such as the Big Bang, through the James Webb Space Telescope, the four Great Observatories, and associated programs. The Launch Services Program oversees launch operations for its uncrewed launches.

History
Creation
Main articles: Creation of NASA and National Advisory Committee for Aeronautics

A U.S. Air Force Bell X-1 test flight
NASA traces its roots to the National Advisory Committee for Aeronautics (NACA). Despite being the birthplace of aviation, by 1914 the United States recognized that it was far behind Europe in aviation capability. Determined to regain American leadership in aviation, the United States Congress created the Aviation Section of the U.S. Army Signal Corps in 1914 and established NACA in 1915 to foster aeronautical research and development. Over the next forty years, NACA would conduct aeronautical research in support of the U.S. Air Force, U.S. Army, U.S. Navy, and the civil aviation sector. After the end of World War II, NACA became interested in the possibilities of guided missiles and supersonic aircraft, developing and testing the Bell X-1 in a joint program with the U.S. Air Force. NACA's interest in space grew out of its rocketry program at the Pilotless Aircraft Research Division.[4]


Launch of the Army Ballistic Missile Agency's Explorer 1, America's first satellite
The Soviet Union's launch of Sputnik 1 ushered in the Space Age and kicked off the Space Race. Despite NACA's early rocketry program, the responsibility for launching the first American satellite fell to the Naval Research Laboratory's Project Vanguard, whose operational issues ensured the Army Ballistic Missile Agency would launch Explorer 1, America's first satellite, on February 1, 1958.

The Eisenhower Administration decided to split the United States' military and civil spaceflight programs, which were organized together under the Defense Department's Advanced Research Projects Agency. NASA was established on July 29, 1958, with the signing of the National Aeronautics and Space Act and it began operations on October 1, 1958.[4]

As the United States' premier aeronautics agency, NACA formed the core of NASA's new structure by reassigning 8,000 employees and three major research laboratories. NASA also proceeded to absorb the Naval Research Laboratory's Project Vanguard, the Army's Jet Propulsion Laboratory (JPL), and the Army Ballistic Missile Agency under Wernher von Braun. This left NASA firmly as the United States' civil space lead and the Air Force as the military space lead.[4]

First orbital and hypersonic flights
Main article: Project Mercury

Launch of Friendship 7, NASA's first orbital flight, February 20, 1962
Plans for human spaceflight began in`;

  const k1KTokenPrompt2 = `Summarize this text: In computer science, the Earley parser is an algorithm for parsing strings that belong to a given context-free language, though (depending on the variant) it may suffer problems with certain nullable grammars.[1] The algorithm, named after its inventor, Jay Earley, is a chart parser that uses dynamic programming; it is mainly used for parsing in computational linguistics. It was first introduced in his dissertation[2] in 1968 (and later appeared in an abbreviated, more legible, form in a journal[3]).

Earley parsers are appealing because they can parse all context-free languages, unlike LR parsers and LL parsers, which are more typically used in compilers but which can only handle restricted classes of languages. The Earley parser executes in cubic time in the general case 
O
(
n
3
)
{\\displaystyle {O}(n^{3})}, where n is the length of the parsed string, quadratic time for unambiguous grammars 
O
(
n
2
)
{\\displaystyle {O}(n^{2})},[4] and linear time for all deterministic context-free grammars. It performs particularly well when the rules are written left-recursively.

Earley recogniser
The following algorithm describes the Earley recogniser. The recogniser can be modified to create a parse tree as it recognises, and in that way can be turned into a parser.

The algorithm
In the following descriptions, α, β, and γ represent any string of terminals/nonterminals (including the empty string), X and Y represent single nonterminals, and a represents a terminal symbol.

Earley's algorithm is a top-down dynamic programming algorithm. In the following, we use Earley's dot notation: given a production X → αβ, the notation X → α • β represents a condition in which α has already been parsed and β is expected.

Input position 0 is the position prior to input. Input position n is the position after accepting the nth token. (Informally, input positions can be thought of as locations at token boundaries.) For every input position, the parser generates a state set. Each state is a tuple (X → α • β, i), consisting of

the production currently being matched (X → α β)
the current position in that production (visually represented by the dot •)
the position i in the input at which the matching of this production began: the origin position
(Earley's original algorithm included a look-ahead in the state; later research showed this to have little practical effect on the parsing efficiency, and it has subsequently been dropped from most implementations.)

A state is finished when its current position is the last position of the right side of the production, that is, when there is no symbol to the right of the dot • in the visual representation of the state.

The state set at input position k is called S(k). The parser is seeded with S(0) consisting of only the top-level rule. The parser then repeatedly executes three operations: prediction, scanning, and completion.

Prediction: For every state in S(k) of the form (X → α • Y β, j) (where j is the origin position as above), add (Y → • γ, k) to S(k) for every production in the grammar with Y on the left-hand side (Y → γ).
Scanning: If a is the next symbol in the input stream, for every state in S(k) of the form (X → α • a β, j), add (X → α a • β, j) to S(k+1).
Completion: For every state in S(k) of the form (Y → γ •, j), find all states in S(j) of the form (X → α • Y β, i) and add (X → α Y • β, i) to S(k).
Duplicate states are not added to the state set, only new ones. These three operations are repeated until no new states can be added to the set. The set is generally implemented as a queue of states to process, with the operation to be performed depending on what kind of state it is.

The algorithm accepts if (X → γ •, 0) ends up in S(n), where (X → γ) is the top level-rule and n the input length, otherwise it rejects.

Pse`;

  function getLanguageModel() {
    if (typeof window.LanguageModel !== 'undefined') return window.LanguageModel;
    if (window.ai && window.ai.languageModel) return window.ai.languageModel;
    return null;
  }

  function setStatus(state, text) {
    const ind = document.getElementById('statusIndicator');
    const txt = document.getElementById('statusText');
    if (ind) ind.className = 'status-indicator ' + state;
    if (txt) txt.textContent = text;
  }

  function showBusy(busy, label) {
    const statusEl = document.getElementById('benchmark-status');
    const prog = document.getElementById('progressContainer');
    const bar = document.getElementById('progressBar');
    if (statusEl) statusEl.textContent = busy ? (label || 'Running...') : 'Ready';
    if (prog) prog.style.display = busy ? 'block' : 'none';
    if (bar && !busy) bar.style.width = '0%';
  }

  async function checkAvailability() {
    const lm = getLanguageModel();
    if (!lm) {
      setStatus('unavailable', 'Prompt API (LanguageModel) not detected');
      return false;
    }
    try {
      const avail = typeof lm.availability === 'function' ? await lm.availability() : 'available';
      if (avail === 'available' || avail === 'readily') {
        setStatus('available', 'Model: Available');
        return true;
      }
      setStatus('', `Model: ${avail}`);
      return true;
    } catch (e) {
      setStatus('unavailable', `Error checking availability: ${e.message}`);
      return false;
    }
  }

  function supportsSamplingMode(lm) {
    return Boolean(lm?.prototype && 'samplingMode' in lm.prototype);
  }

  function getDeterministicSamplingOptions(lm) {
    return supportsSamplingMode(lm) ? { samplingMode: 'most-predictable' } : { temperature: 1.0, topK: 1 };
  }

  let activeRunController = null;

  async function ensureModelProvisioned(lm, options, signal) {
    if (typeof lm.availability !== 'function') return;
    const avail = await lm.availability(options);
    signal?.throwIfAborted();
    if (avail === 'unavailable' || avail === 'no') {
      throw new Error('LanguageModel is unavailable. Enable On-device AI in browser settings/flags.');
    }
    if (avail !== 'available' && avail !== 'readily') {
      showBusy(true, 'Downloading on-device model...');
      const prov = await lm.create({
        ...options,
        ...(signal ? { signal } : {}),
        monitor(m) {
          m.addEventListener('downloadprogress', e => {
            const frac = e.total > 0 ? e.loaded / e.total : e.loaded;
            setStatus('', `Model: Downloading ${Math.round(frac * 100)}%`);
          });
        },
      });
      if (prov && typeof prov.destroy === 'function') prov.destroy();
      signal?.throwIfAborted();
      setStatus('available', 'Model: Available');
    }
  }

  async function createSession(extraOptions = {}) {
    const lm = getLanguageModel();
    if (!lm) throw new Error('LanguageModel API is not available in this browser.');
    const baseOpts = { ...getDeterministicSamplingOptions(lm), ...extraOptions };
    await ensureModelProvisioned(lm, baseOpts, activeRunController?.signal);
    const controller = new AbortController();
    const onRunAbort = () => controller.abort(activeRunController.signal.reason);
    if (activeRunController) {
      if (activeRunController.signal.aborted) controller.abort(activeRunController.signal.reason);
      else activeRunController.signal.addEventListener('abort', onRunAbort, { once: true });
    }
    try {
      const createStart = performance.now();
      const session = await lm.create({
        ...baseOpts,
        signal: controller.signal,
      });
      const creationTime = performance.now() - createStart;
      if (baseOpts.samplingMode && session.samplingMode && session.samplingMode !== baseOpts.samplingMode) {
        if (typeof session.destroy === 'function') session.destroy();
        throw new Error('Sampling modes are not supported or enabled.');
      }
      return { session, controller, creationTime, detachRunAbort: () => activeRunController?.signal.removeEventListener('abort', onRunAbort) };
    } catch (err) {
      activeRunController?.signal.removeEventListener('abort', onRunAbort);
      throw err;
    }
  }

  let isRunning = false;

  function setControlsDisabled(disabled) {
    ['bench', 'replayTtft', 'replayPrefill', 'replayTps', 'replayTools'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = disabled;
    });
    const stopBtn = document.getElementById('stopBench');
    if (stopBtn) stopBtn.disabled = !disabled;
  }

  function stopBenchmark() {
    if (activeRunController) {
      activeRunController.abort();
    }
  }

  async function runExclusive(fn) {
    if (isRunning) return;
    isRunning = true;
    activeRunController = new AbortController();
    setControlsDisabled(true);
    try {
      return await fn();
    } catch (e) {
      if (activeRunController?.signal.aborted) {
        showBusy(false);
        const st = document.getElementById('benchmark-status');
        if (st) st.textContent = 'Canceled';
      } else {
        throw e;
      }
    } finally {
      activeRunController = null;
      isRunning = false;
      setControlsDisabled(false);
    }
  }

  const kInterRunCooldownMs = 200;

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function measureLoadTime(prompt, elementId, showSessionBreakdown = false) {
    activeRunController?.signal.throwIfAborted();
    showBusy(true, 'Measuring first-token latency...');
    const { session, controller, creationTime, detachRunAbort } = await createSession();
    const promptStart = performance.now();
    let promptEnd = null;
    try {
      // Pass controller.signal to promptStreaming() (not just create()) so
      // controller.abort() triggers StreamingResponder::OnAborted() in Blink
      // as soon as the first non-empty token arrives.
      const stream = session.promptStreaming(prompt, { signal: controller.signal });
      for await (const chunk of stream) {
        if (!chunk) continue;
        promptEnd = performance.now();
        controller.abort();
        break;
      }
    } catch (_err) {
      if (promptEnd === null && !activeRunController?.signal.aborted) {
        promptEnd = performance.now();
      }
    } finally {
      detachRunAbort();
      if (typeof session.destroy === 'function') session.destroy();
    }
    activeRunController?.signal.throwIfAborted();
    const promptTtft = Math.max(0, (promptEnd ?? performance.now()) - promptStart);
    const ms = creationTime + promptTtft;
    const el = document.getElementById(elementId);
    if (el) el.textContent = ms.toFixed(2);
    if (elementId === 'time-to-first-token') {
      document.getElementById('hero-ttft').textContent = ms.toFixed(1);
      if (showSessionBreakdown) {
        const sub = document.getElementById('ttft-sub');
        if (sub) sub.textContent = `Create ${creationTime.toFixed(1)} ms + Prompt ${promptTtft.toFixed(1)} ms`;
      }
    }
    // Allow the async Mojo disconnect + in-flight single token step (~28ms) to
    // settle in the on_device_model service before the next run's timer starts.
    await sleep(kInterRunCooldownMs);
    showBusy(false);
    return ms;
  }

  const kPrefillPrompts = [k1KTokenPrompt2, k1KTokenPrompt, k1KTokenPrompt2, k1KTokenPrompt, k1KTokenPrompt2];

  async function measurePrefillTokenCounts() {
    let session = null;
    let detach = () => {};
    try {
      activeRunController?.signal.throwIfAborted();
      const created = await createSession();
      session = created.session;
      detach = created.detachRunAbort;
      const measureFn =
        typeof session.measureContextUsage === 'function' ? p => session.measureContextUsage(p)
        : typeof session.measureInputUsage === 'function' ? p => session.measureInputUsage(p)
        : null;
      if (!measureFn) return;
      for (let i = 0; i < kPrefillPrompts.length; i++) {
        activeRunController?.signal.throwIfAborted();
        const count = await measureFn(kPrefillPrompts[i]);
        const cell = document.getElementById(`1k-tokens-${i + 1}`);
        if (cell && Number.isFinite(count)) cell.textContent = Math.round(count).toLocaleString();
      }
    } catch (_err) {
      // Optional post-benchmark metadata; preserve measured timings if unsupported.
    } finally {
      detach();
      if (session && typeof session.destroy === 'function') session.destroy();
    }
  }

  async function runPrefillTest(measureTokensAfter = true) {
    let total = 0;
    for (let i = 0; i < kPrefillPrompts.length; i++) {
      document.getElementById('progressBar').style.width = `${((i + 1) / kPrefillPrompts.length) * 100}%`;
      total += await measureLoadTime(kPrefillPrompts[i], `1kt${i + 1}`);
    }
    const avg = (total / kPrefillPrompts.length).toFixed(2);
    document.getElementById('time-to-prefill-1k').textContent = avg;
    document.getElementById('hero-prefill').textContent = Number(avg).toFixed(1);
    if (measureTokensAfter) await measurePrefillTokenCounts();
    return Number(avg);
  }

  async function measureTPS(prompt, el1Id, el2Id, scratchEl) {
    activeRunController?.signal.throwIfAborted();
    showBusy(true, `Measuring TPS (${prompt.slice(0, 28)}...)`);
    const { session, controller, detachRunAbort } = await createSession();
    let start = 0;
    let interval1 = 0;
    let interval2 = 0;
    let count = 0;
    const numIgnore = 10;
    const numInitial = 50;
    const numFinal = 100;
    if (scratchEl) scratchEl.textContent = '';

    try {
      const stream = session.promptStreaming(prompt, { signal: controller.signal });
      for await (const chunk of stream) {
        count++;
        if (scratchEl) scratchEl.textContent = chunk;
        if (count === numIgnore) {
          start = performance.now();
        } else if (count === numInitial) {
          const end = performance.now();
          interval1 = ((numInitial - numIgnore) * kMillisecond) / Math.max(1, end - start);
          document.getElementById(el1Id).textContent = interval1.toFixed(2);
          start = performance.now();
        } else if (count === numFinal) {
          const end = performance.now();
          interval2 = ((numFinal - numInitial) * kMillisecond) / Math.max(1, end - start);
          document.getElementById(el2Id).textContent = interval2.toFixed(2);
          controller.abort();
          break;
        }
      }
      if (count > numIgnore && interval1 === 0) {
        const end = performance.now();
        interval1 = ((count - numIgnore) * kMillisecond) / Math.max(1, end - start);
        document.getElementById(el1Id).textContent = interval1.toFixed(2);
        interval2 = interval1;
        document.getElementById(el2Id).textContent = interval2.toFixed(2);
      } else if (count > numInitial && interval2 === 0) {
        const end = performance.now();
        interval2 = ((count - numInitial) * kMillisecond) / Math.max(1, end - start);
        document.getElementById(el2Id).textContent = interval2.toFixed(2);
      }
    } catch (_err) {
      // Ignore AbortError thrown when aborting stream at token 100.
    } finally {
      detachRunAbort();
      if (typeof session.destroy === 'function') session.destroy();
      if (!activeRunController?.signal.aborted) await sleep(kInterRunCooldownMs);
      showBusy(false);
    }
    activeRunController?.signal.throwIfAborted();
    return { interval1, interval2: interval2 || interval1 };
  }

  async function runTPSTest() {
    const prompts = [
      'Write me a poem about LLMs',
      'Tell me funny story.',
      'Explain thermodynamics in simple terms.',
      'Write me an essay about planet earth.',
      'Write me a poem about web browsers.',
    ];
    const scratch = document.getElementById('scratch-tps');
    if (scratch) scratch.style.display = 'block';
    let d1 = 0;
    let d2 = 0;
    for (let i = 0; i < prompts.length; i++) {
      document.getElementById('progressBar').style.width = `${((i + 1) / prompts.length) * 100}%`;
      const r = await measureTPS(prompts[i], `tps${i + 1}-1`, `tps${i + 1}-2`, scratch);
      d1 += r.interval1;
      d2 += r.interval2;
    }
    const meanTps = ((d1 + d2) / (prompts.length * 2)).toFixed(2);
    document.getElementById('tps-result').textContent = meanTps;
    document.getElementById('hero-tps').textContent = meanTps;
    if (scratch) {
      scratch.textContent = '';
      scratch.style.display = 'none';
    }
    return Number(meanTps);
  }

  async function runToolCallingLatencyTest() {
    showBusy(true, 'Measuring Tool Calling latency...');
    const schemaTools = [
      {
        name: 'getWeather',
        description: 'Get the current weather for a city.',
        inputSchema: {
          type: 'object',
          properties: { location: { type: 'string', description: 'City name to check.' } },
          required: ['location'],
        },
      },
      {
        name: 'getLocalTime',
        description: 'Get the local time for a city.',
        inputSchema: {
          type: 'object',
          properties: { location: { type: 'string', description: 'City name to check.' } },
          required: ['location'],
        },
      },
    ];
    const start = performance.now();
    try {
      let session;
      let detachRunAbort = () => {};
      let toolCalled = false;
      try {
        ({ session, detachRunAbort } = await createSession({
          temperature: 0.001,
          topK: 1,
          tools: schemaTools,
          expectedInputs: [{ type: 'tool-response' }],
          expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }],
        }));
      } catch (_) {
        const closedLoopTools = schemaTools.map(t => ({
          ...t,
          async execute(args) {
            toolCalled = true;
            return JSON.stringify({ ok: true, ...args });
          },
        }));
        ({ session, detachRunAbort } = await createSession({ tools: closedLoopTools }));
      }
      try {
        const opts = activeRunController?.signal ? { signal: activeRunController.signal } : undefined;
        const res = await session.prompt('What is the weather in Beijing and what time is it in Dublin? Use your tools.', opts);
        if (Array.isArray(res) && res.some(p => p?.type === 'tool-call')) {
          toolCalled = true;
        }
      } finally {
        detachRunAbort();
        if (typeof session.destroy === 'function') session.destroy();
      }
      if (!toolCalled) {
        document.getElementById('tool-call-ms').textContent = 'N/A';
        document.getElementById('hero-tool-ms').textContent = 'N/A';
        return 0;
      }
      const ms = (performance.now() - start).toFixed(2);
      document.getElementById('tool-call-ms').textContent = ms;
      document.getElementById('hero-tool-ms').textContent = Number(ms).toFixed(1);
      return Number(ms);
    } catch (_err) {
      document.getElementById('tool-call-ms').textContent = 'N/A';
      document.getElementById('hero-tool-ms').textContent = 'N/A';
      return 0;
    } finally {
      showBusy(false);
    }
  }

  async function measureAll() {
    try {
      await measureLoadTime('Hi', 'time-to-first-token', true);
      await runPrefillTest(false);
      await runTPSTest();
      await runToolCallingLatencyTest();
      await measurePrefillTokenCounts();
    } catch (e) {
      if (!activeRunController?.signal.aborted) {
        setStatus('unavailable', e.message || String(e));
      }
      showBusy(false);
    }
  }

  const VENDOR_DISPLAY_NAMES = {
    nvidia: 'NVIDIA',
    amd: 'AMD',
    intel: 'Intel',
    apple: 'Apple',
    qualcomm: 'Qualcomm',
    arm: 'ARM',
    microsoft: 'Microsoft',
    google: 'Google',
    mesa: 'Mesa',
    samsung: 'Samsung',
    broadcom: 'Broadcom',
    imgtec: 'Imagination',
  };

  const VENDOR_WEBGL_PATTERNS = {
    nvidia: /nvidia|geforce|quadro|\brtx\b|\bgtx\b|nouveau|\bnvk\b/i,
    amd: /\bamd\b|radeon|\bati\b|\bgfx\d+/i,
    intel: /intel|iris|\buhd\b|\barc\b/i,
    apple: /apple/i,
    qualcomm: /qualcomm|adreno/i,
    arm: /\barm\b|mali|immortalis/i,
    microsoft: /microsoft|basic render|warp/i,
    google: /swiftshader|google/i,
  };

  function escapeHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ''}`;
    if (ua.includes('Chrome/')) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''}`;
    return 'Browser Unknown';
  }

  function getWebGlRenderer(powerPreference = 'high-performance') {
    try {
      const canvas = document.createElement('canvas');
      const attrs = powerPreference ? { powerPreference } : undefined;
      const gl =
        canvas.getContext('webgl2', attrs) ||
        canvas.getContext('webgl', attrs) ||
        canvas.getContext('experimental-webgl', attrs) ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL unavailable';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'Standard WebGL';
      const loseCtx = gl.getExtension('WEBGL_lose_context');
      if (loseCtx && typeof loseCtx.loseContext === 'function') loseCtx.loseContext();
      return renderer || 'Standard WebGL';
    } catch {
      return 'Unknown GPU';
    }
  }

  async function queryWebGpuAdapter(powerPreference, timeoutMs = 2500) {
    if (typeof navigator === 'undefined' || !navigator.gpu || typeof navigator.gpu.requestAdapter !== 'function') {
      return null;
    }
    let timer = null;
    try {
      const adapterPromise = navigator.gpu.requestAdapter(powerPreference ? { powerPreference } : undefined);
      const timeoutPromise = new Promise(resolve => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      });
      const adapter = await Promise.race([adapterPromise, timeoutPromise]);
      if (!adapter) return null;
      const info =
        adapter.info ||
        (typeof adapter.requestAdapterInfo === 'function' ? await adapter.requestAdapterInfo() : null);
      if (!info) return null;
      return {
        vendor: String(info.vendor || '').trim(),
        architecture: String(info.architecture || '').trim(),
        device: String(info.device || '').trim(),
        description: String(info.description || '').trim(),
        isFallbackAdapter: Boolean(info.isFallbackAdapter),
      };
    } catch {
      return null;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function formatWebGpuAdapter(info) {
    if (!info) return null;
    const vendorKey = info.vendor.toLowerCase();
    const vendorLabel = VENDOR_DISPLAY_NAMES[vendorKey] || info.vendor;
    if (info.description) {
      const hasVendor = vendorKey && info.description.toLowerCase().includes(vendorKey);
      const parts = hasVendor || !vendorLabel ? [info.description] : [vendorLabel, info.description];
      return `WebGPU (${parts.join(', ')})`;
    }
    const parts = [vendorLabel, info.architecture, info.device].filter(Boolean);
    return parts.length ? `WebGPU (${parts.join(', ')})` : null;
  }

  function doesWebGlMatchWebGpu(webglRenderer, gpuInfo) {
    if (!webglRenderer || webglRenderer === 'WebGL unavailable' || webglRenderer === 'Standard WebGL' || webglRenderer === 'Unknown GPU') {
      return false;
    }
    if (!gpuInfo || !gpuInfo.vendor) return true;
    const vendorKey = gpuInfo.vendor.toLowerCase();
    const pattern = VENDOR_WEBGL_PATTERNS[vendorKey];
    return pattern ? pattern.test(webglRenderer) : webglRenderer.toLowerCase().includes(vendorKey);
  }

  function sameWebGpuAdapter(a, b) {
    return (
      Boolean(a && b) &&
      a.vendor === b.vendor &&
      a.architecture === b.architecture &&
      a.device === b.device &&
      a.description === b.description
    );
  }

  async function detectHardwareDetails() {
    const [highPerfGpu, lowPowerGpu] = await Promise.all([
      queryWebGpuAdapter('high-performance'),
      queryWebGpuAdapter('low-power'),
    ]);
    const webglHighPerf = getWebGlRenderer('high-performance');
    const webglLowPower = getWebGlRenderer('low-power');
    const webgpuLabel = formatWebGpuAdapter(highPerfGpu);

    let primary = webglHighPerf;
    if (highPerfGpu && !highPerfGpu.isFallbackAdapter && webgpuLabel) {
      if (highPerfGpu.description) {
        primary = webgpuLabel;
      } else {
        const vendorMatches = doesWebGlMatchWebGpu(webglHighPerf, highPerfGpu);
        const dualGpuStuckOnDisplayAdapter =
          Boolean(lowPowerGpu) && !sameWebGpuAdapter(highPerfGpu, lowPowerGpu) && webglHighPerf === webglLowPower;
        primary = vendorMatches && !dualGpuStuckOnDisplayAdapter ? webglHighPerf : webgpuLabel;
      }
    }

    const presets = [];
    for (const option of [primary, webgpuLabel, webglHighPerf, 'CPU', 'NPU']) {
      if (option && option !== 'WebGL unavailable' && option !== 'Unknown GPU' && !presets.includes(option)) {
        presets.push(option);
      }
    }
    if (!presets.includes('CPU')) presets.push('CPU');
    if (!presets.includes('NPU')) presets.push('NPU');

    return { primary: primary || 'Unknown GPU', presets };
  }

  let detectedGpuInfo = null;
  let lastAutoHardwareValue = '';
  let hardwareEditedByUser = false;
  let hardwareInitPromise = null;

  function applyDetectedHardware(details) {
    detectedGpuInfo = details.primary;
    const input = document.getElementById('hardwareLabel');
    if (input && !hardwareEditedByUser && (!input.value.trim() || input.value === lastAutoHardwareValue)) {
      input.value = details.primary;
      lastAutoHardwareValue = details.primary;
    }
    const datalist = document.getElementById('hardwarePresets');
    if (datalist) {
      datalist.innerHTML = details.presets
        .map(opt => `<option value="${escapeHtml(opt)}"></option>`)
        .join('');
    }
    return details;
  }

  function initHardwareField() {
    if (!hardwareInitPromise) {
      const startedHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';
      hardwareInitPromise = detectHardwareDetails().then(details => {
        applyDetectedHardware(details);
        if (startedHidden && typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
          const onVisible = () => {
            if (document.visibilityState === 'visible') {
              document.removeEventListener('visibilitychange', onVisible);
              hardwareInitPromise = detectHardwareDetails().then(applyDetectedHardware);
            }
          };
          document.addEventListener('visibilitychange', onVisible);
        }
        return details;
      });
    }
    return hardwareInitPromise;
  }

  function getGpuInfo() {
    const override = document.getElementById('hardwareLabel')?.value?.trim();
    if (override) return override;
    if (detectedGpuInfo) return detectedGpuInfo;
    return getWebGlRenderer('high-performance');
  }

  async function resolveGpuInfo() {
    const override = document.getElementById('hardwareLabel')?.value?.trim();
    if (override) return override;
    if (!detectedGpuInfo) {
      await initHardwareField();
    }
    return getGpuInfo();
  }

  async function saveResultsToClipboard() {
    const ttft = document.getElementById('time-to-first-token').textContent;
    const prefill = document.getElementById('time-to-prefill-1k').textContent;
    const tps = document.getElementById('tps-result').textContent;
    const toolMs = document.getElementById('tool-call-ms').textContent;
    const [browserName, browserVersion] = getBrowserInfo().split(' ');
    const gpu = await resolveGpuInfo();
    const row = [
      new Date().toLocaleDateString(),
      browserName,
      browserVersion,
      gpu,
      ttft,
      prefill,
      tps,
      toolMs,
    ].join('\t');
    await navigator.clipboard.writeText(row);
  }

  function loadBaselines() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function renderBaselines() {
    const store = loadBaselines();
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
        <tr>
          <th>Slot / Label</th>
          <th>Browser</th>
          <th>Hardware / Backend</th>
          <th>TTFT (ms)</th>
          <th>1K Prefill (ms)</th>
          <th>Generation (TPS)</th>
          <th>Tool Call (ms)</th>
        </tr>
      </thead>
      <tbody>
        ${keys
          .map(k => {
            const b = store[k];
            return `<tr>
              <td><strong>${escapeHtml(b.label || k)}</strong></td>
              <td>${escapeHtml(b.browser || '-')}</td>
              <td>${escapeHtml(b.gpu || '-')}</td>
              <td>${escapeHtml(b.ttft)}</td>
              <td>${escapeHtml(b.prefill)}</td>
              <td><strong>${escapeHtml(b.tps)}</strong></td>
              <td>${escapeHtml(b.toolMs)}</td>
            </tr>`;
          })
          .join('')}
      </tbody>`;
  }

  async function saveBaselineSlot() {
    const gpu = await resolveGpuInfo();
    const store = loadBaselines();
    const key = `${getBrowserInfo()} #${Object.keys(store).length + 1}`;
    store[key] = {
      label: key,
      browser: getBrowserInfo(),
      gpu,
      ttft: document.getElementById('time-to-first-token').textContent,
      prefill: document.getElementById('time-to-prefill-1k').textContent,
      tps: document.getElementById('tps-result').textContent,
      toolMs: document.getElementById('tool-call-ms').textContent,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    renderBaselines();
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const hardwareInput = document.getElementById('hardwareLabel');
      if (hardwareInput) {
        hardwareInput.addEventListener('input', () => {
          hardwareEditedByUser = true;
        });
      }
      initHardwareField();
      checkAvailability();
      renderBaselines();
      document.getElementById('bench').addEventListener('click', () => runExclusive(measureAll));
      const stopBtn = document.getElementById('stopBench');
      if (stopBtn) stopBtn.addEventListener('click', stopBenchmark);
      document.getElementById('replayTtft').addEventListener('click', () => runExclusive(() => measureLoadTime('Hi', 'time-to-first-token', true)));
      document.getElementById('replayPrefill').addEventListener('click', () => runExclusive(() => runPrefillTest(true)));
      document.getElementById('replayTps').addEventListener('click', () => runExclusive(runTPSTest));
      document.getElementById('replayTools').addEventListener('click', () => runExclusive(runToolCallingLatencyTest));
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        window.addEventListener('pagehide', stopBenchmark);
      }
      document.getElementById('save').addEventListener('click', saveResultsToClipboard);
      document.getElementById('saveBaselineBtn').addEventListener('click', saveBaselineSlot);
      document.getElementById('clearBaselinesBtn').addEventListener('click', () => {
        localStorage.removeItem(STORAGE_KEY);
        renderBaselines();
      });
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      detectHardwareDetails,
      initHardwareField,
      getGpuInfo,
      resolveGpuInfo,
      saveResultsToClipboard,
      saveBaselineSlot,
      renderBaselines,
      measureLoadTime,
      runPrefillTest,
    };
  }
})();
