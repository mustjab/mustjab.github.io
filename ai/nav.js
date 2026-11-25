/* Shared 2-level navigation for Built-in AI Demos & Benchmarks (/ai/*) */
(function () {
  'use strict';

  const PROMPT_API_ORIGIN_TRIAL_TOKEN =
    'AzfmQd5WeCR1czyG5r870L/lVteg6zZW240+bw4KWXXMJWNHC1DvPbBhkPNEIbKoPykxzUFsVBTlfLH0MnFuUFIAAABpeyJvcmlnaW4iOiJodHRwczovL211c3RqYWIuZ2l0aHViLmlvOjQ0MyIsImZlYXR1cmUiOiJBSVByb21wdEFQSSIsImV4cGlyeSI6MTgwMjkwNzc4NCwiaXNTdWJkb21haW4iOnRydWV9';

  function ensureOriginTrialMeta() {
    if (typeof document === 'undefined' || !document.head) return;
    const existing = document.head.querySelectorAll('meta[http-equiv="origin-trial"]');
    for (const meta of existing) {
      if (meta.getAttribute('content') === PROMPT_API_ORIGIN_TRIAL_TOKEN) return;
    }
    const meta = document.createElement('meta');
    meta.httpEquiv = 'origin-trial';
    meta.content = PROMPT_API_ORIGIN_TRIAL_TOKEN;
    document.head.appendChild(meta);
  }

  ensureOriginTrialMeta();

  function getAiBasePrefix() {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      const src = s.getAttribute('src') || '';
      const match = src.match(/^(.*\/)?nav\.js(?:\?.*)?$/);
      if (match) return match[1] || './';
    }
    const path = (window.location.pathname || '').replace(/\\/g, '/');
    const idx = path.indexOf('/ai/');
    if (idx !== -1) {
      const after = path.slice(idx + 4).replace(/\/[^/]*$/, '');
      const depth = after ? after.split('/').filter(Boolean).length : 0;
      return depth ? '../'.repeat(depth) : './';
    }
    return './';
  }

  function detectActiveRoute() {
    const path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    const params = new URLSearchParams(window.location.search || '');
    const taskApi = (params.get('api') || 'summarizer').toLowerCase();
    const validTask = ['summarizer', 'writer', 'rewriter', 'proofreader'].includes(taskApi)
      ? taskApi
      : 'summarizer';

    if (path.includes('/ai/translate/speed')) return { api: 'translate', mode: 'speed' };
    if (path.includes('/ai/translate/quality')) return { api: 'translate', mode: 'quality' };
    if (path.includes('/ai/translate')) return { api: 'translate', mode: 'playground' };

    if (path.includes('/ai/tasks/speed')) return { api: validTask, mode: 'speed' };
    if (path.includes('/ai/tasks/quality')) return { api: validTask, mode: 'quality' };
    if (path.includes('/ai/tasks')) return { api: validTask, mode: 'playground' };

    if (path.includes('/ai/decisions/speed')) return { api: 'decisions', mode: 'speed' };
    if (path.includes('/ai/decisions/quality')) return { api: 'decisions', mode: 'quality' };
    if (path.includes('/ai/decisions')) return { api: 'decisions', mode: 'playground' };

    if (path.includes('/ai/speech/speed')) return { api: 'speech', mode: 'speed' };
    if (path.includes('/ai/speech/quality')) return { api: 'speech', mode: 'quality' };
    if (path.includes('/ai/speech')) return { api: 'speech', mode: 'playground' };

    if (path.includes('/ai/lid/speed')) return { api: 'lid', mode: 'speed' };
    if (path.includes('/ai/lid/quality')) return { api: 'lid', mode: 'quality' };
    if (path.includes('/ai/lid')) return { api: 'lid', mode: 'playground' };

    if (path.includes('/ai/e2e')) return { api: 'e2e', mode: 'playground' };

    if (path.includes('/ai/tools')) return { api: 'tools', mode: 'playground' };
    if (path.includes('/ai/speed')) return { api: 'prompt', mode: 'speed' };
    if (path.includes('/ai/quality')) return { api: 'prompt', mode: 'quality' };
    return { api: 'prompt', mode: 'playground' };
  }

  function routeHref(base, subpath, query = '') {
    if (window.location.protocol === 'file:') {
      return subpath ? `${base}${subpath}index.html${query}` : `${base}index.htm${query}`;
    }
    return `${base}${subpath}${query}`;
  }

  const API_DIAGNOSTICS = {
    prompt: {
      name: 'Prompt API',
      flag: 'Prompt API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/prompt-api',
    },
    tools: {
      name: 'Prompt API Tool Use',
      flag: 'Prompt API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/prompt-api',
    },
    summarizer: {
      name: 'Summarizer API',
      flag: 'Summarizer API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/writing-assistance-apis',
    },
    writer: {
      name: 'Writer API',
      flag: 'Writer API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/writing-assistance-apis',
    },
    rewriter: {
      name: 'Rewriter API',
      flag: 'Rewriter API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/writing-assistance-apis',
    },
    proofreader: {
      name: 'Proofreader API',
      flag: 'Proofreader API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/proofreader-api',
    },
    decisions: {
      name: 'Decisions API',
      flag: 'Decisions API',
      generative: true,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/decisions-api',
    },
    speech: {
      name: 'SpeechRecognition API',
      flag: 'msOnDeviceSpeechRecognitionAPI',
      generative: false,
      docs: 'https://w3c.github.io/speech-api/#speechrecognition',
    },
    translate: {
      name: 'Translator API',
      flag: 'Translator API',
      generative: false,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/translator-api',
    },
    lid: {
      name: 'LanguageDetector API',
      flag: 'Language Detector API',
      generative: false,
      docs: 'https://learn.microsoft.com/microsoft-edge/web-platform/languagedetector-api',
    },
  };

  function ensureSpeculationRules() {
    if (
      typeof document === 'undefined' ||
      !document.head ||
      typeof HTMLScriptElement === 'undefined' ||
      typeof HTMLScriptElement.supports !== 'function' ||
      !HTMLScriptElement.supports('speculationrules')
    ) {
      return;
    }
    if (document.head.querySelector('script[type="speculationrules"]')) return;
    const spec = document.createElement('script');
    spec.type = 'speculationrules';
    spec.textContent = JSON.stringify({
      prefetch: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }],
    });
    document.head.appendChild(spec);
  }

  const THEME_STORAGE_KEY = 'ai-demo-theme';

  function getStoredTheme() {
    try {
      if (typeof localStorage !== 'undefined') {
        const val = localStorage.getItem(THEME_STORAGE_KEY);
        if (val === 'light' || val === 'dark') return val;
      }
    } catch {}
    return null;
  }

  function getSystemTheme() {
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } catch {}
    return 'light';
  }

  function getEffectiveTheme() {
    const stored = getStoredTheme();
    return stored || getSystemTheme();
  }

  function applyStoredTheme() {
    if (typeof document === 'undefined' || !document.documentElement) return;
    const stored = getStoredTheme();
    if (stored && stored !== getSystemTheme()) {
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  applyStoredTheme();

  function attachDiagnosticConsoleHint(apiId) {
    const diag = API_DIAGNOSTICS[apiId];
    if (!diag || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
    const statusTextEl = document.getElementById('statusText') || document.getElementById('model-status');
    const statusIndEl = document.getElementById('statusIndicator');
    if (!statusTextEl) return;

    let logged = false;
    const checkUnavailable = () => {
      if (logged) return;
      const txt = (statusTextEl.textContent || '').toLowerCase();
      const cls = statusIndEl?.className || '';
      const isUnavailable =
        cls.includes('unavailable') ||
        txt.includes('unavailable') ||
        txt.includes('not detected') ||
        txt.includes('not available') ||
        txt.includes('not supported');
      if (!isUnavailable) return;
      logged = true;
      const settingsHint = diag.generative
        ? 'Verify Settings > Copilot and AI > On-device AI (edge://settings/ai) is enabled, or enable '
        : 'Enable ';
      console.warn(
        `[${diag.name}] API unavailable — ${settingsHint}the "${diag.flag}" flag at edge://flags and restart Edge. Docs: ${diag.docs}`
      );
    };

    const obs = new MutationObserver(checkUnavailable);
    obs.observe(statusTextEl, { childList: true, characterData: true, subtree: true });
    if (statusIndEl) obs.observe(statusIndEl, { attributes: true, attributeFilter: ['class'] });
    checkUnavailable();
  }

  function mountHeaderModeTabs(currentApi, activeMode) {
    if (!currentApi.modes || currentApi.modes.length < 2 || typeof document === 'undefined') return;
    const headerEl = document.querySelector('.container > header, header.prompt-page-header');
    if (!headerEl) return;

    let existingTabs = headerEl.querySelector('.header-mode-tabs');
    if (existingTabs) existingTabs.remove();

    const tabsNav = document.createElement('nav');
    tabsNav.className = 'header-mode-tabs';
    tabsNav.setAttribute('aria-label', `${currentApi.label} views`);
    tabsNav.innerHTML = currentApi.modes
      .map(m => {
        const active = m.id === activeMode;
        return `<a href="${m.href}" class="header-mode-tab${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${m.label}</a>`;
      })
      .join('');

    let titleGroup = headerEl.querySelector('.header-title-group');
    if (!titleGroup) {
      const h1Parent = headerEl.querySelector('.prompt-header-titles');
      const h1 = headerEl.querySelector('h1');
      if (h1Parent) {
        h1Parent.classList.add('header-title-group');
        titleGroup = h1Parent;
      } else if (h1 && h1.parentNode === headerEl) {
        titleGroup = document.createElement('div');
        titleGroup.className = 'header-title-group';
        headerEl.insertBefore(titleGroup, h1);
        titleGroup.appendChild(h1);
      }
    }

    if (titleGroup) {
      titleGroup.appendChild(tabsNav);
    } else {
      headerEl.insertBefore(tabsNav, headerEl.firstChild);
    }
  }

  function buildNav() {
    const navEl = document.querySelector('.demo-nav, .demo-links');
    if (!navEl) return;

    ensureSpeculationRules();

    const base = getAiBasePrefix();
    const { api, mode } = detectActiveRoute();

    const apis = [
      {
        id: 'prompt',
        label: 'Prompt',
        href: routeHref(base, ''),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, '') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'speed/') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'quality/') },
        ],
      },
      {
        id: 'tools',
        label: 'Tools',
        href: routeHref(base, 'tools/'),
        modes: [],
      },
      {
        id: 'summarizer',
        label: 'Summarizer',
        href: routeHref(base, 'tasks/', '?api=summarizer'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'tasks/', '?api=summarizer') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'tasks/speed/', '?api=summarizer') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'tasks/quality/', '?api=summarizer') },
        ],
      },
      {
        id: 'writer',
        label: 'Writer',
        href: routeHref(base, 'tasks/', '?api=writer'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'tasks/', '?api=writer') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'tasks/speed/', '?api=writer') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'tasks/quality/', '?api=writer') },
        ],
      },
      {
        id: 'rewriter',
        label: 'Rewriter',
        href: routeHref(base, 'tasks/', '?api=rewriter'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'tasks/', '?api=rewriter') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'tasks/speed/', '?api=rewriter') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'tasks/quality/', '?api=rewriter') },
        ],
      },
      {
        id: 'proofreader',
        label: 'Proofreader',
        href: routeHref(base, 'tasks/', '?api=proofreader'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'tasks/', '?api=proofreader') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'tasks/speed/', '?api=proofreader') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'tasks/quality/', '?api=proofreader') },
        ],
      },
      {
        id: 'decisions',
        label: 'Decisions',
        href: routeHref(base, 'decisions/'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'decisions/') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'decisions/speed/') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'decisions/quality/') },
        ],
      },
      {
        id: 'speech',
        label: 'Speech',
        href: routeHref(base, 'speech/'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'speech/') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'speech/speed/') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'speech/quality/') },
        ],
      },
      {
        id: 'translate',
        label: 'Translator',
        href: routeHref(base, 'translate/'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'translate/') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'translate/speed/') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'translate/quality/') },
        ],
      },
      {
        id: 'lid',
        label: 'Detector',
        href: routeHref(base, 'lid/'),
        modes: [
          { id: 'playground', label: 'Playground', href: routeHref(base, 'lid/') },
          { id: 'speed', label: 'Speed', href: routeHref(base, 'lid/speed/') },
          { id: 'quality', label: 'Quality', href: routeHref(base, 'lid/quality/') },
        ],
      },
      {
        id: 'e2e',
        label: 'E2E',
        href: routeHref(base, 'e2e/'),
        modes: [],
      },
    ];

    const currentApi = apis.find(item => item.id === api) || apis[0];

    navEl.classList.add('demo-nav');
    navEl.classList.remove('demo-nav-2tier');
    const brandIcon = `<span class="demo-nav-brand"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="3"/><path d="M5.5 8h5M8 5.5v5"/></svg>Built-in AI</span>`;
    const primaryLinks = apis
      .map(item => {
        const active = item.id === currentApi.id;
        const matchingMode = item.modes.find(m => m.id === mode);
        const targetHref = matchingMode ? matchingMode.href : item.href;
        return `<a href="${targetHref}" class="nav-api-pill${active ? ' is-active' : ''}"${active ? ' aria-current="true"' : ''}>${item.label}</a>`;
      })
      .join('');

    const sunIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.58 3.58l1.06 1.06M11.36 11.36l1.06 1.06M12.42 3.58l-1.06 1.06M4.64 11.36l-1.06 1.06"/></svg>`;
    const moonIcon = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M13.2 9.8A5.5 5.5 0 0 1 6.2 2.8a5.5 5.5 0 1 0 7 7Z"/></svg>`;
    const activeTheme = getEffectiveTheme();
    const themeToggleHtml = `<button type="button" class="nav-theme-toggle" title="Switch to ${activeTheme === 'dark' ? 'light' : 'dark'} theme" aria-label="Toggle color theme">${activeTheme === 'dark' ? sunIcon : moonIcon}</button>`;

    navEl.innerHTML = `<div class="demo-nav-primary">${brandIcon}${primaryLinks}</div><div class="demo-nav-right">${themeToggleHtml}</div>`;
    mountHeaderModeTabs(currentApi, mode);

    const themeBtn = navEl.querySelector('.nav-theme-toggle');
    const syncThemeButton = () => {
      if (!themeBtn) return;
      const cur = getEffectiveTheme();
      themeBtn.innerHTML = cur === 'dark' ? sunIcon : moonIcon;
      themeBtn.title = `Switch to ${cur === 'dark' ? 'light' : 'dark'} theme`;
    };
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
        const sys = getSystemTheme();
        if (next === sys) {
          if (document.documentElement) document.documentElement.removeAttribute('data-theme');
          try {
            if (typeof localStorage !== 'undefined') localStorage.removeItem(THEME_STORAGE_KEY);
          } catch {}
        } else {
          if (document.documentElement) document.documentElement.setAttribute('data-theme', next);
          try {
            if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {}
        }
        syncThemeButton();
      });
    }
    try {
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        if (typeof mql.addEventListener === 'function') {
          mql.addEventListener('change', () => {
            try {
              if (typeof localStorage !== 'undefined') localStorage.removeItem(THEME_STORAGE_KEY);
            } catch {}
            if (document.documentElement) document.documentElement.removeAttribute('data-theme');
            syncThemeButton();
          });
        }
      }
    } catch {}

    attachDiagnosticConsoleHint(currentApi.id);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
