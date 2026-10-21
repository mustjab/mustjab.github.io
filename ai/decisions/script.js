// Browser Built-in AI Decisions API Demo & Validation Suite

const DECISION_PRESETS = {
  support: {
    title: 'Customer Support Triage',
    context:
      'You are triaging incoming browser support tickets. Treat production outages, crashes, and duplicate billing charges as urgent.',
    input:
      'Every time I click Pay Now on the checkout page, the tab freezes and I was billed twice on my credit card.',
    questions: [
      {
        id: 'urgent',
        prompt: 'Does this support ticket require urgent escalation?',
        type: 'boolean',
      },
      {
        id: 'category',
        prompt: 'Which category best describes the issue?',
        type: 'choice',
        options: [
          { label: 'bug', description: 'Crash, freeze, or broken functionality' },
          { label: 'billing', description: 'Duplicate charge, invoice, or payment issue' },
          { label: 'feature', description: 'Request for new capability' },
          { label: 'account', description: 'Password reset or login help' },
        ],
      },
      {
        id: 'severity',
        prompt: 'Rate the customer impact from 1 (minimal) to 5 (critical).',
        type: 'score',
      },
    ],
  },
  security: {
    title: 'Download & Security Risk Rubric',
    context:
      'Security classification rubric: Unsigned executables (.exe/.scr) from unknown or IP-literal hosts are high risk (10). Verified documentation pages are low risk (0).',
    input:
      'User initiated download of invoice_update_installer.exe from http://198.51.100.42/payload/',
    questions: [
      {
        id: 'should_warn',
        prompt: 'Should the browser display a prominent security warning?',
        type: 'boolean',
      },
      {
        id: 'threat_type',
        prompt: 'What is the primary risk category?',
        type: 'choice',
        options: [
          { label: 'untrusted_binary', description: 'Executable from unverified origin' },
          { label: 'phishing', description: 'Credential harvesting page' },
          { label: 'benign', description: 'Normal safe browsing activity' },
        ],
      },
      {
        id: 'risk_score',
        prompt: 'Assign a numeric risk weight (0 = safe, 5 = moderate, 10 = severe).',
        type: 'score',
        options: [
          { label: '0', description: 'Safe' },
          { label: '5', description: 'Moderate risk' },
          { label: '10', description: 'Severe risk' },
        ],
      },
    ],
  },
  moderation: {
    title: 'Product Feedback & Sentiment',
    context:
      'Evaluate user-submitted review comments for constructive feedback, product area, and overall satisfaction.',
    input:
      'The new vertical tabs layout in Edge saves so much screen space and feels super snappy!',
    questions: [
      {
        id: 'is_positive',
        prompt: 'Is the overall feedback positive?',
        type: 'boolean',
      },
      {
        id: 'topic',
        prompt: 'Which product area is mentioned?',
        type: 'choice',
        options: [
          { label: 'tabs_ux', description: 'Tab strip, vertical tabs, or window layout' },
          { label: 'networking', description: 'Proxy, DNS, or page loading errors' },
          { label: 'extensions', description: 'Browser add-ons' },
          { label: 'ai_features', description: 'Built-in AI or Copilot tools' },
        ],
      },
      {
        id: 'satisfaction',
        prompt: 'Rate user satisfaction from 1 (very dissatisfied) to 5 (very satisfied).',
        type: 'score',
      },
    ],
  },
  release: {
    title: 'Release Readiness Triage',
    context:
      'Evaluate engineering release notes to determine whether a feature is ready for production rollout and which quality pillar it primarily advances.',
    input:
      'Release v2.8.15 reduces translation latency by 35% and passes all 136 automated regression tests with 0 unexpected errors across 9,959 decoding steps.',
    questions: [
      {
        id: 'ready_to_ship',
        prompt: 'Does the evidence indicate this release is ready to ship?',
        type: 'boolean',
      },
      {
        id: 'pillar',
        prompt: 'Which engineering pillar is the primary focus?',
        type: 'choice',
        options: [
          { label: 'performance', description: 'Throughput, latency, or memory improvements' },
          { label: 'reliability', description: 'Crash fixes, regression coverage, or stability' },
          { label: 'compliance', description: 'Privacy, security, or policy governance' },
          { label: 'ux', description: 'Visual design or layout polish' },
        ],
      },
      {
        id: 'confidence_rating',
        prompt: 'Rate release readiness confidence from 1 (low) to 5 (high).',
        type: 'score',
      },
    ],
  },
};

function $(id) {
  return document.getElementById(id);
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

async function copyTextWithFeedback(text, buttonEl) {
  if (!text) return;
  const original = buttonEl ? (buttonEl.dataset.originalLabel || buttonEl.textContent) : '';
  if (buttonEl) buttonEl.dataset.originalLabel = original;
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    }
    if (buttonEl) buttonEl.textContent = '✓ Copied!';
  } catch (err) {
    if (buttonEl) buttonEl.textContent = `Copy failed (${err.name || 'Error'})`;
  }
  if (buttonEl) {
    setTimeout(() => {
      buttonEl.textContent = original;
    }, 1500);
  }
}

class DecisionsDemo {
  constructor() {
    this.activeSession = null;
    this.lastResultsJson = '';
    this.lastSuiteReport = '';
    this.init();
  }

  init() {
    this.wireEvents();
    this.loadPreset('support');
    this.updateEnvironmentStatus();
    this.checkAvailability();
  }

  wireEvents() {
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
    });

    $('formatSchemaBtn')?.addEventListener('click', () => this.formatSchemaJson());
    $('checkAvailabilityBtn')?.addEventListener('click', () => this.checkAvailability());
    $('createAndDecideBtn')?.addEventListener('click', () => this.createAndDecide());
    $('reuseDecideBtn')?.addEventListener('click', () => this.reuseDecide());
    $('destroySessionBtn')?.addEventListener('click', () => this.destroySession());

    $('copyLaunchCmdBtn')?.addEventListener('click', (e) => {
      copyTextWithFeedback($('launchCmd')?.textContent || '', e.currentTarget);
    });
    $('copyResultsBtn')?.addEventListener('click', (e) => {
      copyTextWithFeedback(this.lastResultsJson, e.currentTarget);
    });
    $('copyRawJsonBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      copyTextWithFeedback(this.lastResultsJson, e.currentTarget);
    });

    $('runSuiteBtn')?.addEventListener('click', () => this.runValidationSuite());
    $('copySuiteBtn')?.addEventListener('click', (e) => {
      copyTextWithFeedback(this.lastSuiteReport, e.currentTarget);
    });
    $('clearSuiteBtn')?.addEventListener('click', () => this.clearSuiteResults());
  }

  updateEnvironmentStatus() {
    const isSecure = typeof window !== 'undefined' && Boolean(window.isSecureContext);
    setText('envSecure', isSecure ? 'Yes (SecureContext)' : 'No (Insecure)');

    const hasApi = typeof window !== 'undefined' && typeof window.DecisionModel !== 'undefined';
    setText('envApi', hasApi ? 'Exposed' : 'Missing (enable flag)');
  }

  setApiStatusBadge(state, text) {
    const indicator = $('statusIndicator');
    if (indicator) {
      indicator.className = `status-indicator ${state}`;
    }
    setText('statusText', text);
  }

  setProgress(show, fraction = 0) {
    const container = $('downloadProgress');
    if (!container) return;
    container.style.display = show ? 'block' : 'none';
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    if ($('progressFill')) $('progressFill').style.width = `${pct}%`;
    setText('progressText', `${pct}%`);
  }

  setBoxStatus(id, message, type = 'info') {
    const el = $(id);
    if (!el) return;
    el.textContent = message;
    el.className = message ? `result-box ${type}` : 'result-box';
  }

  loadPreset(key) {
    const preset = DECISION_PRESETS[key] || DECISION_PRESETS.support;
    if ($('schemaContext')) $('schemaContext').value = preset.context;
    if ($('schemaQuestions')) $('schemaQuestions').value = JSON.stringify(preset.questions, null, 2);
    if ($('decideInput')) $('decideInput').value = preset.input;
  }

  formatSchemaJson() {
    const el = $('schemaQuestions');
    if (!el) return;
    try {
      const parsed = JSON.parse(el.value);
      el.value = JSON.stringify(parsed, null, 2);
      this.setBoxStatus('playgroundStatus', '', 'info');
    } catch (err) {
      this.setBoxStatus('playgroundStatus', `Invalid JSON in Questions Schema: ${err.message}`, 'error');
    }
  }

  async checkAvailability() {
    this.updateEnvironmentStatus();
    if (typeof window === 'undefined' || typeof window.DecisionModel === 'undefined') {
      setText('envAvailability', 'Unavailable (API not exposed)');
      this.setApiStatusBadge('unavailable', 'DecisionModel API not exposed — enable edge://flags/#edge-llm-decisions-api-for-default');
      return null;
    }

    this.setApiStatusBadge('checking', 'Checking DecisionModel.availability()...');
    try {
      const availability = await window.DecisionModel.availability();
      setText('envAvailability', availability);
      if (availability === 'available' || availability === 'readily') {
        this.setApiStatusBadge('available', `DecisionModel Ready (${availability})`);
      } else if (availability === 'downloadable' || availability === 'downloading' || availability === 'after-download') {
        this.setApiStatusBadge('checking', `Model Downloadable (${availability})`);
      } else {
        this.setApiStatusBadge('unavailable', `DecisionModel Unavailable (${availability})`);
      }
      return availability;
    } catch (err) {
      setText('envAvailability', `Error: ${err.message}`);
      this.setApiStatusBadge('unavailable', `Error checking availability: ${err.message}`);
      return null;
    }
  }

  attachDownloadMonitor(options) {
    return {
      ...options,
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          const frac = typeof e.total === 'number' && e.total > 0 ? e.loaded / e.total : Number(e.loaded) || 0;
          this.setProgress(true, frac);
          if (e.total && e.loaded >= e.total) {
            this.setProgress(false);
          }
        });
      },
    };
  }

  renderDecisionCards(result) {
    const section = $('decisionResultsSection');
    const container = $('decisionCards');
    if (!section || !container) return;

    section.style.display = 'block';
    container.innerHTML = '';

    this.lastResultsJson = JSON.stringify(result, null, 2);
    setText('rawJsonOutput', this.lastResultsJson);
    if ($('copyResultsBtn')) $('copyResultsBtn').disabled = false;

    for (const [questionId, dec] of Object.entries(result || {})) {
      const card = document.createElement('div');
      card.className = 'decision-card';

      const header = document.createElement('div');
      header.className = 'decision-card__header';

      const idSpan = document.createElement('span');
      idSpan.className = 'decision-card__id';
      idSpan.textContent = questionId;

      const badges = document.createElement('div');
      badges.className = 'decision-badges';

      const confPct = typeof dec.confidence === 'number' ? `${(dec.confidence * 100).toFixed(1)}%` : '-';
      const labelBadge = document.createElement('span');
      labelBadge.className = 'decision-pill';
      labelBadge.textContent = `${dec.label} (${confPct})`;
      badges.appendChild(labelBadge);

      if (typeof dec.expectedScore === 'number') {
        const scoreBadge = document.createElement('span');
        scoreBadge.className = 'decision-pill decision-pill--score';
        scoreBadge.textContent = `expectedScore: ${dec.expectedScore.toFixed(2)}`;
        badges.appendChild(scoreBadge);
      }

      header.appendChild(idSpan);
      header.appendChild(badges);
      card.appendChild(header);

      if (dec.probabilities && typeof dec.probabilities === 'object') {
        const list = document.createElement('div');
        list.className = 'prob-list';
        for (const [optLabel, prob] of Object.entries(dec.probabilities)) {
          const pct = Math.max(0, Math.min(100, Number(prob) * 100));
          const row = document.createElement('div');
          row.className = 'prob-row';

          const labelEl = document.createElement('div');
          labelEl.className = `prob-label${optLabel === dec.label ? ' is-winner' : ''}`;
          labelEl.textContent = optLabel;

          const track = document.createElement('div');
          track.className = 'prob-bar-track';
          const fill = document.createElement('div');
          fill.className = 'prob-bar-fill';
          fill.style.width = `${pct.toFixed(1)}%`;
          track.appendChild(fill);

          const pctEl = document.createElement('div');
          pctEl.className = 'prob-pct';
          pctEl.textContent = `${pct.toFixed(1)}%`;

          row.appendChild(labelEl);
          row.appendChild(track);
          row.appendChild(pctEl);
          list.appendChild(row);
        }
        card.appendChild(list);
      }

      container.appendChild(card);
    }
  }

  async createAndDecide() {
    if (typeof window === 'undefined' || typeof window.DecisionModel === 'undefined') {
      this.setBoxStatus(
        'playgroundStatus',
        'window.DecisionModel is not available. Enable edge://flags/#edge-llm-decisions-api-for-default first.',
        'error'
      );
      return;
    }

    let questions;
    try {
      questions = JSON.parse($('schemaQuestions')?.value || '[]');
    } catch (err) {
      this.setBoxStatus('playgroundStatus', `Invalid Questions Schema JSON: ${err.message}`, 'error');
      return;
    }

    const context = ($('schemaContext')?.value || '').trim();
    const input = ($('decideInput')?.value || '').trim();
    if (!input) {
      this.setBoxStatus('playgroundStatus', 'Please enter input text to classify.', 'warning');
      return;
    }

    this.destroySession({ silent: true });
    this.setBoxStatus('playgroundStatus', 'Creating DecisionModel session and scoring options...', 'info');

    try {
      const t0 = performance.now();
      const createOpts = { questions };
      if (context) createOpts.context = context;

      this.activeSession = await window.DecisionModel.create(this.attachDownloadMonitor(createOpts));
      const t1 = performance.now();

      const result = await this.activeSession.decide(input);
      const t2 = performance.now();
      this.setProgress(false);

      const createMs = (t1 - t0).toFixed(1);
      const decideMs = (t2 - t1).toFixed(1);
      const qCount = Object.keys(result || {}).length;

      if ($('playgroundMetrics')) $('playgroundMetrics').style.display = 'grid';
      setText('metricCreateMs', `${createMs} ms`);
      setText('metricDecideMs', `${decideMs} ms`);
      setText('metricQuestions', String(qCount));
      setText('metricPreference', this.activeSession.preference || 'default');
      setText('envSessionState', `Active (${qCount} question${qCount === 1 ? '' : 's'})`);

      if ($('reuseDecideBtn')) $('reuseDecideBtn').disabled = false;
      if ($('destroySessionBtn')) $('destroySessionBtn').disabled = false;

      this.setBoxStatus(
        'playgroundStatus',
        `Scored ${qCount} question${qCount === 1 ? '' : 's'} in ${decideMs} ms (session create: ${createMs} ms).`,
        'success'
      );
      this.renderDecisionCards(result);
    } catch (err) {
      this.setProgress(false);
      this.setBoxStatus('playgroundStatus', `${err.name || 'Error'}: ${err.message}`, 'error');
    }
  }

  async reuseDecide() {
    if (!this.activeSession) return;
    const input = ($('decideInput')?.value || '').trim();
    if (!input) {
      this.setBoxStatus('playgroundStatus', 'Please enter input text to classify.', 'warning');
      return;
    }

    try {
      const t0 = performance.now();
      const result = await this.activeSession.decide(input);
      const decideMs = (performance.now() - t0).toFixed(1);
      const qCount = Object.keys(result || {}).length;

      setText('metricDecideMs', `${decideMs} ms (reused)`);
      setText('metricQuestions', String(qCount));
      this.setBoxStatus(
        'playgroundStatus',
        `Re-ran decide() on active session in ${decideMs} ms.`,
        'success'
      );
      this.renderDecisionCards(result);
    } catch (err) {
      this.setBoxStatus('playgroundStatus', `${err.name || 'Error'}: ${err.message}`, 'error');
    }
  }

  destroySession({ silent = false } = {}) {
    if (this.activeSession) {
      try {
        this.activeSession.destroy();
      } catch {
        /* noop */
      }
      this.activeSession = null;
    }
    if ($('reuseDecideBtn')) $('reuseDecideBtn').disabled = true;
    if ($('destroySessionBtn')) $('destroySessionBtn').disabled = true;
    setText('envSessionState', 'None');
    if (!silent) {
      this.setBoxStatus('playgroundStatus', 'Active DecisionModel session destroyed.', 'info');
    }
  }

  clearSuiteResults() {
    this.lastSuiteReport = '';
    if ($('suiteResultsContainer')) $('suiteResultsContainer').style.display = 'none';
    if ($('suiteResultsList')) $('suiteResultsList').innerHTML = '';
    if ($('copySuiteBtn')) $('copySuiteBtn').disabled = true;
    if ($('clearSuiteBtn')) $('clearSuiteBtn').disabled = true;
    this.setBoxStatus('suiteSummaryBox', '', 'info');
  }

  async runValidationSuite() {
    const listEl = $('suiteResultsList');
    const containerEl = $('suiteResultsContainer');
    if (listEl) listEl.innerHTML = '';
    if (containerEl) containerEl.style.display = 'block';

    const reportLines = [];
    let passed = 0;
    let failed = 0;
    const suiteStart = performance.now();

    const recordCheck = (name, ok, detail) => {
      if (ok) passed++;
      else failed++;
      reportLines.push(`[${ok ? 'PASS' : 'FAIL'}] ${name} — ${detail}`);

      if (listEl) {
        const item = document.createElement('div');
        item.className = 'batch-result-item';
        const left = document.createElement('div');
        left.innerHTML = `<strong>${name}</strong><div class="hint">${detail}</div>`;
        const badge = document.createElement('span');
        badge.className = `check-status-badge ${ok ? 'pass' : 'fail'}`;
        badge.textContent = ok ? 'PASS' : 'FAIL';
        item.appendChild(left);
        item.appendChild(badge);
        listEl.appendChild(item);
      }
    };

    this.setBoxStatus('suiteSummaryBox', 'Running automated E2E validation checks...', 'info');

    // Check 1: availability()
    const avail = await this.checkAvailability();
    const availOk = avail === 'available' || avail === 'readily' || avail === 'downloadable' || avail === 'downloading';
    recordCheck('1. DecisionModel.availability()', availOk, `availability() returned "${avail}"`);

    if (!availOk) {
      const elapsed = Math.round(performance.now() - suiteStart);
      setText('suitePassed', String(passed));
      setText('suiteFailed', String(failed));
      setText('suiteTotalTime', `${elapsed} ms`);
      this.setBoxStatus('suiteSummaryBox', `Suite stopped: DecisionModel is not available (${avail}).`, 'error');
      this.lastSuiteReport = reportLines.join('\n');
      if ($('copySuiteBtn')) $('copySuiteBtn').disabled = false;
      if ($('clearSuiteBtn')) $('clearSuiteBtn').disabled = false;
      return;
    }

    // Check 2 & 3: Multi-question schema + determinism
    let model = null;
    try {
      const schema = {
        context: 'Customer support ticket triage',
        questions: [
          { id: 'urgent', prompt: 'Is this ticket urgent?', type: 'boolean' },
          {
            id: 'area',
            prompt: 'Which area is affected?',
            type: 'choice',
            options: [
              { label: 'checkout', description: 'Cart, payment, or billing' },
              { label: 'profile', description: 'Account settings or avatar' },
              { label: 'sync', description: 'Bookmarks or history sync' },
            ],
          },
          { id: 'impact', prompt: 'Rate severity from 1 (low) to 5 (critical).', type: 'score' },
          {
            id: 'priority_weight',
            prompt: 'Select priority weight (10, 50, or 100).',
            type: 'score',
            options: [
              { label: '10', description: 'Low' },
              { label: '50', description: 'Medium' },
              { label: '100', description: 'High' },
            ],
          },
        ],
      };

      const t0 = performance.now();
      model = await window.DecisionModel.create(this.attachDownloadMonitor(schema));
      const res1 = await model.decide('Production checkout is failing with HTTP 500 for all customers.');
      const elapsed = (performance.now() - t0).toFixed(1);

      const sumProbs = (probs) => Object.values(probs || {}).reduce((a, b) => a + b, 0);
      const urgent = res1.urgent;
      const area = res1.area;
      const impact = res1.impact;
      const weight = res1.priority_weight;

      const urgentOk =
        urgent &&
        (urgent.label === 'true' || urgent.label === 'false') &&
        Math.abs(sumProbs(urgent.probabilities) - 1.0) < 1e-3;
      const areaOk =
        area &&
        ['checkout', 'profile', 'sync'].includes(area.label) &&
        Math.abs(sumProbs(area.probabilities) - 1.0) < 1e-3;
      const impactOk =
        impact && typeof impact.expectedScore === 'number' && impact.expectedScore >= 1.0 && impact.expectedScore <= 5.0;
      const weightOk =
        weight &&
        typeof weight.expectedScore === 'number' &&
        weight.expectedScore >= 10.0 &&
        weight.expectedScore <= 100.0;

      recordCheck(
        '2. Multi-question schema (boolean, choice, score, weighted score)',
        Boolean(urgentOk && areaOk && impactOk && weightOk),
        `urgent=${urgent?.label} (${((urgent?.confidence || 0) * 100).toFixed(1)}%), area=${area?.label}, impact=${impact?.expectedScore?.toFixed(2)}, priority_weight=${weight?.expectedScore?.toFixed(2)} [${elapsed} ms]`
      );

      const res2 = await model.decide('Production checkout is failing with HTTP 500 for all customers.');
      const drift = Math.abs((res1.urgent?.probabilities?.true || 0) - (res2.urgent?.probabilities?.true || 0));
      recordCheck(
        '3. Repeated decide() determinism & clone isolation',
        drift < 1e-4,
        `P(urgent=true) run1=${(res1.urgent?.probabilities?.true || 0).toFixed(6)}, run2=${(res2.urgent?.probabilities?.true || 0).toFixed(6)} (diff=${drift.toExponential(2)})`
      );
    } catch (err) {
      recordCheck('2/3. Multi-question decide()', false, `${err.name}: ${err.message}`);
    } finally {
      if (model) {
        try { model.destroy(); } catch { /* noop */ }
      }
    }

    // Check 4: Custom context sensitivity
    try {
      const mStrict = await window.DecisionModel.create({
        context: "Policy: Always classify requests mentioning 'refund' as urgent=true.",
        questions: [{ id: 'urgent', prompt: 'Is this urgent under the policy?', type: 'boolean' }],
      });
      const mLenient = await window.DecisionModel.create({
        context: 'Policy: Requests about refunds are routine and never urgent (urgent=false).',
        questions: [{ id: 'urgent', prompt: 'Is this urgent under the policy?', type: 'boolean' }],
      });
      const rStrict = await mStrict.decide("Customer asks for a refund on last month's subscription.");
      const rLenient = await mLenient.decide("Customer asks for a refund on last month's subscription.");
      mStrict.destroy();
      mLenient.destroy();

      const pStrict = rStrict.urgent?.probabilities?.true ?? 0;
      const pLenient = rLenient.urgent?.probabilities?.true ?? 0;
      recordCheck(
        '4. Custom context & prompt sensitivity',
        Math.abs(pStrict - pLenient) > 1e-4,
        `P(true | strict context)=${pStrict.toFixed(4)} vs P(true | lenient context)=${pLenient.toFixed(4)}`
      );
    } catch (err) {
      recordCheck('4. Custom context & prompt sensitivity', false, `${err.name}: ${err.message}`);
    }

    // Check 5: Schema validation & destroy() lifecycle
    try {
      let rejectedEmpty = false;
      try {
        await window.DecisionModel.create({ questions: [] });
      } catch (e) {
        rejectedEmpty = e instanceof TypeError || e.name === 'TypeError';
      }

      const tempModel = await window.DecisionModel.create({
        questions: [{ id: 'q', prompt: 'Is valid?', type: 'boolean' }],
      });
      tempModel.destroy();
      let rejectedAfterDestroy = false;
      try {
        await tempModel.decide('test');
      } catch (e) {
        rejectedAfterDestroy = e.name === 'InvalidStateError';
      }

      recordCheck(
        '5. Schema TypeError validation & destroy() InvalidStateError',
        Boolean(rejectedEmpty && rejectedAfterDestroy),
        `empty questions TypeError=${rejectedEmpty}, decide() after destroy() InvalidStateError=${rejectedAfterDestroy}`
      );
    } catch (err) {
      recordCheck('5. Schema validation & destroy()', false, `${err.name}: ${err.message}`);
    }

    const totalMs = Math.round(performance.now() - suiteStart);
    setText('suitePassed', String(passed));
    setText('suiteFailed', String(failed));
    setText('suiteTotalTime', `${totalMs} ms`);

    const summaryMsg =
      failed === 0
        ? `All ${passed}/${passed} E2E validation checks passed in ${totalMs} ms!`
        : `${failed} check(s) failed, ${passed} passed (${totalMs} ms).`;
    this.setBoxStatus('suiteSummaryBox', summaryMsg, failed === 0 ? 'success' : 'error');
    this.lastSuiteReport = `${summaryMsg}\n${reportLines.join('\n')}`;
    if ($('copySuiteBtn')) $('copySuiteBtn').disabled = false;
    if ($('clearSuiteBtn')) $('clearSuiteBtn').disabled = false;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.__decisionsDemo = new DecisionsDemo();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DecisionsDemo, DECISION_PRESETS };
}