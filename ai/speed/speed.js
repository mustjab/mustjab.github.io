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

Earley parsers are appealing because they can parse all context-free languages, unlike LR parsers and LL parsers, which are more typically used in compilers but which can only handle restricted classes of languages. The Earley parser executes in cubic time in the general case O(n^3), where n is the length of the parsed string, quadratic time for unambiguous grammars O(n^2),[4] and linear time for all deterministic context-free grammars. It performs particularly well when the rules are written left-recursively.

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

  async function createSession(extraOptions = {}) {
    const lm = getLanguageModel();
    if (!lm) throw new Error('LanguageModel API is not available in this browser.');
    const controller = new AbortController();
    const session = await lm.create({
      temperature: 1.0,
      topK: 1,
      signal: controller.signal,
      ...extraOptions,
    });
    return { session, controller };
  }

  async function measureLoadTime(prompt, elementId) {
    showBusy(true, 'Measuring first-token latency...');
    const start = performance.now();
    const { session, controller } = await createSession();
    let end = start;
    try {
      const stream = session.promptStreaming(prompt);
      let first = true;
      for await (const _chunk of stream) {
        if (first) {
          first = false;
          end = performance.now();
        } else {
          controller.abort();
          break;
        }
      }
    } catch (_err) {
      if (end === start) end = performance.now();
    } finally {
      if (typeof session.destroy === 'function') session.destroy();
    }
    const ms = end - start;
    const el = document.getElementById(elementId);
    if (el) el.textContent = ms.toFixed(2);
    if (elementId === 'time-to-first-token') {
      document.getElementById('hero-ttft').textContent = ms.toFixed(1);
    }
    showBusy(false);
    return ms;
  }

  async function runPrefillTest() {
    const prompts = [k1KTokenPrompt2, k1KTokenPrompt, k1KTokenPrompt2, k1KTokenPrompt, k1KTokenPrompt2];
    let total = 0;
    for (let i = 0; i < prompts.length; i++) {
      document.getElementById('progressBar').style.width = `${((i + 1) / prompts.length) * 100}%`;
      total += await measureLoadTime(prompts[i], `1kt${i + 1}`);
    }
    const avg = (total / prompts.length).toFixed(2);
    document.getElementById('time-to-prefill-1k').textContent = avg;
    document.getElementById('hero-prefill').textContent = Number(avg).toFixed(1);
    return Number(avg);
  }

  async function measureTPS(prompt, el1Id, el2Id, scratchEl) {
    showBusy(true, `Measuring TPS (${prompt.slice(0, 28)}...)`);
    const { session } = await createSession();
    let start = 0;
    let interval1 = 0;
    let interval2 = 0;
    let count = 0;
    const numIgnore = 10;
    const numInitial = 50;
    const numFinal = 100;
    if (scratchEl) scratchEl.textContent = '';

    try {
      const stream = session.promptStreaming(prompt);
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
          break;
        }
      }
      if (count > numIgnore && interval1 === 0) {
        const end = performance.now();
        interval1 = ((count - numIgnore) * kMillisecond) / Math.max(1, end - start);
        document.getElementById(el1Id).textContent = interval1.toFixed(2);
        interval2 = interval1;
        document.getElementById(el2Id).textContent = interval2.toFixed(2);
      }
    } finally {
      if (typeof session.destroy === 'function') session.destroy();
      showBusy(false);
    }
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
    if (scratch) scratch.textContent = 'Completed 5 generation runs.';
    return Number(meanTps);
  }

  async function runToolCallingLatencyTest() {
    showBusy(true, 'Measuring Tool Calling latency...');
    const tools = [
      {
        name: 'getWeather',
        description: 'Get the current weather for a city.',
        inputSchema: {
          type: 'object',
          properties: { location: { type: 'string' } },
          required: ['location'],
        },
        async execute({ location }) {
          return JSON.stringify({ location, temperatureC: 18, condition: 'Partly cloudy' });
        },
      },
      {
        name: 'getLocalTime',
        description: 'Get the local time for a city.',
        inputSchema: {
          type: 'object',
          properties: { location: { type: 'string' } },
          required: ['location'],
        },
        async execute({ location }) {
          return JSON.stringify({ location, localTime: '14:30' });
        },
      },
    ];
    const start = performance.now();
    try {
      const { session } = await createSession({ tools });
      try {
        await session.prompt('What is the weather in Beijing and what time is it in Dublin? Use your tools.');
      } finally {
        if (typeof session.destroy === 'function') session.destroy();
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
      await measureLoadTime('Hi', 'time-to-first-token');
      await runPrefillTest();
      await runTPSTest();
      await runToolCallingLatencyTest();
    } catch (e) {
      setStatus('unavailable', e.message || String(e));
      showBusy(false);
    }
  }

  function getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return `Edge ${(ua.match(/Edg\/([\d.]+)/) || [])[1] || ''}`;
    if (ua.includes('Chrome/')) return `Chrome ${(ua.match(/Chrome\/([\d.]+)/) || [])[1] || ''}`;
    return 'Browser Unknown';
  }

  function getGpuInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL unavailable';
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'Standard WebGL';
    } catch {
      return 'Unknown GPU';
    }
  }

  function saveResultsToClipboard() {
    const ttft = document.getElementById('time-to-first-token').textContent;
    const prefill = document.getElementById('time-to-prefill-1k').textContent;
    const tps = document.getElementById('tps-result').textContent;
    const toolMs = document.getElementById('tool-call-ms').textContent;
    const [browserName, browserVersion] = getBrowserInfo().split(' ');
    const row = [
      new Date().toLocaleDateString(),
      browserName,
      browserVersion,
      getGpuInfo(),
      ttft,
      prefill,
      tps,
      toolMs,
    ].join('\t');
    navigator.clipboard.writeText(row);
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
              <td><strong>${b.label || k}</strong></td>
              <td>${b.browser || '-'}</td>
              <td>${b.ttft}</td>
              <td>${b.prefill}</td>
              <td><strong>${b.tps}</strong></td>
              <td>${b.toolMs}</td>
            </tr>`;
          })
          .join('')}
      </tbody>`;
  }

  function saveBaselineSlot() {
    const slot = document.getElementById('baselineSlot').value;
    const label = document.getElementById('runLabel').value.trim() || slot;
    const store = loadBaselines();
    store[slot] = {
      label,
      browser: getBrowserInfo(),
      ttft: document.getElementById('time-to-first-token').textContent,
      prefill: document.getElementById('time-to-prefill-1k').textContent,
      tps: document.getElementById('tps-result').textContent,
      toolMs: document.getElementById('tool-call-ms').textContent,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    renderBaselines();
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAvailability();
    renderBaselines();
    document.getElementById('bench').addEventListener('click', measureAll);
    document.getElementById('replayTtft').addEventListener('click', () => measureLoadTime('Hi', 'time-to-first-token'));
    document.getElementById('replayPrefill').addEventListener('click', runPrefillTest);
    document.getElementById('replayTps').addEventListener('click', runTPSTest);
    document.getElementById('replayTools').addEventListener('click', runToolCallingLatencyTest);
    document.getElementById('save').addEventListener('click', saveResultsToClipboard);
    document.getElementById('saveBaselineBtn').addEventListener('click', saveBaselineSlot);
    document.getElementById('clearBaselinesBtn').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      renderBaselines();
    });
  });
})();
