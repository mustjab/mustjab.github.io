// Browser Built-in AI Decisions API Demo

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
        options: [
          { label: '1', description: 'Minimal impact' },
          { label: '2', description: 'Low impact' },
          { label: '3', description: 'Moderate impact' },
          { label: '4', description: 'High impact' },
          { label: '5', description: 'Critical impact' },
        ],
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
        options: [
          { label: '1', description: 'Very dissatisfied' },
          { label: '2', description: 'Dissatisfied' },
          { label: '3', description: 'Neutral' },
          { label: '4', description: 'Satisfied' },
          { label: '5', description: 'Very satisfied' },
        ],
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
        options: [
          { label: '1', description: 'Very low confidence' },
          { label: '2', description: 'Low confidence' },
          { label: '3', description: 'Moderate confidence' },
          { label: '4', description: 'High confidence' },
          { label: '5', description: 'Very high confidence' },
        ],
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
    this.activeSessionKey = '';
    this.lastResultsJson = '';
    this.init();
  }

  init() {
    this.wireEvents();
    this.loadPreset('support');
    this.checkAvailability();
  }

  wireEvents() {
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => this.loadPreset(btn.dataset.preset));
    });

    $('createAndDecideBtn')?.addEventListener('click', () => this.createAndDecide());
    $('copyResultsBtn')?.addEventListener('click', (e) => {
      copyTextWithFeedback(this.lastResultsJson, e.currentTarget);
    });
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

  async checkAvailability() {
    if (typeof window === 'undefined' || typeof window.DecisionModel === 'undefined') {
      this.setApiStatusBadge('unavailable', 'DecisionModel API unavailable');
      return null;
    }

    this.setApiStatusBadge('checking', 'Checking DecisionModel.availability()...');
    try {
      const availability = await window.DecisionModel.availability();
      if (availability === 'available' || availability === 'readily') {
        this.setApiStatusBadge('available', `DecisionModel Ready (${availability})`);
      } else if (availability === 'downloadable' || availability === 'downloading' || availability === 'after-download') {
        this.setApiStatusBadge('checking', `Model Downloadable (${availability})`);
      } else {
        this.setApiStatusBadge('unavailable', `DecisionModel Unavailable (${availability})`);
      }
      return availability;
    } catch (err) {
      this.setApiStatusBadge('unavailable', `Unavailable (${err.message})`);
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
        scoreBadge.textContent = `score: ${dec.expectedScore.toFixed(2)}`;
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
      this.setBoxStatus('playgroundStatus', 'window.DecisionModel is not available in this browser.', 'error');
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

    if ($('createAndDecideBtn')) $('createAndDecideBtn').disabled = true;
    this.setBoxStatus('playgroundStatus', '', 'info');
    setText('timingMeta', 'Running decide()...');

    try {
      const schemaKey = JSON.stringify({ context, questions });
      const t0 = performance.now();

      if (!this.activeSession || this.activeSessionKey !== schemaKey) {
        if (this.activeSession) {
          try { this.activeSession.destroy(); } catch { /* noop */ }
        }
        const createOpts = { questions };
        if (context) createOpts.context = context;
        this.activeSession = await window.DecisionModel.create(this.attachDownloadMonitor(createOpts));
        this.activeSessionKey = schemaKey;
      }

      const t1 = performance.now();
      const result = await this.activeSession.decide(input);
      const t2 = performance.now();
      this.setProgress(false);

      const decideMs = (t2 - t1).toFixed(0);
      const totalMs = (t2 - t0).toFixed(0);
      const qCount = Object.keys(result || {}).length;

      setText('timingMeta', `${qCount} question${qCount === 1 ? '' : 's'} · ${decideMs} ms (total ${totalMs} ms)`);
      this.renderDecisionCards(result);
    } catch (err) {
      this.setProgress(false);
      setText('timingMeta', '');
      this.setBoxStatus('playgroundStatus', `${err.name || 'Error'}: ${err.message}`, 'error');
    } finally {
      if ($('createAndDecideBtn')) $('createAndDecideBtn').disabled = false;
    }
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