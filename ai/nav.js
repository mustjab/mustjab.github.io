/* Shared 2-level navigation for Built-in AI Demos & Benchmarks (/ai/*) */
(function () {
  'use strict';

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

    if (path.includes('/ai/lid/speed')) return { api: 'lid', mode: 'speed' };
    if (path.includes('/ai/lid/quality')) return { api: 'lid', mode: 'quality' };
    if (path.includes('/ai/lid')) return { api: 'lid', mode: 'playground' };

    if (path.includes('/ai/e2e')) return { api: 'e2e', mode: 'playground' };

    if (path.includes('/ai/tools')) return { api: 'prompt', mode: 'tools' };
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

  function buildNav() {
    const navEl = document.querySelector('.demo-nav, .demo-links');
    if (!navEl) return;

    const base = getAiBasePrefix();
    const { api, mode } = detectActiveRoute();

    const apis = [
      {
        id: 'prompt',
        label: '🤖 Prompt API',
        href: routeHref(base, ''),
        modes: [
          { id: 'playground', label: '💬 Chat Playground', href: routeHref(base, '') },
          { id: 'tools', label: '🛠️ Tool Calling', href: routeHref(base, 'tools/') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'speed/') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'quality/') },
        ],
      },
      {
        id: 'summarizer',
        label: '📝 Summarizer',
        href: routeHref(base, 'tasks/', '?api=summarizer'),
        modes: [
          { id: 'playground', label: '📝 Summarizer Playground', href: routeHref(base, 'tasks/', '?api=summarizer') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'tasks/speed/', '?api=summarizer') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'tasks/quality/', '?api=summarizer') },
        ],
      },
      {
        id: 'writer',
        label: '✍️ Writer',
        href: routeHref(base, 'tasks/', '?api=writer'),
        modes: [
          { id: 'playground', label: '✍️ Writer Playground', href: routeHref(base, 'tasks/', '?api=writer') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'tasks/speed/', '?api=writer') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'tasks/quality/', '?api=writer') },
        ],
      },
      {
        id: 'rewriter',
        label: '✨ Rewriter',
        href: routeHref(base, 'tasks/', '?api=rewriter'),
        modes: [
          { id: 'playground', label: '✨ Rewriter Playground', href: routeHref(base, 'tasks/', '?api=rewriter') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'tasks/speed/', '?api=rewriter') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'tasks/quality/', '?api=rewriter') },
        ],
      },
      {
        id: 'proofreader',
        label: '✅ Proofreader',
        href: routeHref(base, 'tasks/', '?api=proofreader'),
        modes: [
          { id: 'playground', label: '✅ Proofreader Playground', href: routeHref(base, 'tasks/', '?api=proofreader') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'tasks/speed/', '?api=proofreader') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'tasks/quality/', '?api=proofreader') },
        ],
      },
      {
        id: 'decisions',
        label: '⚖️ Decisions API',
        href: routeHref(base, 'decisions/'),
        modes: [
          { id: 'playground', label: '⚖️ Decisions Playground', href: routeHref(base, 'decisions/') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'decisions/speed/') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'decisions/quality/') },
        ],
      },
      {
        id: 'translate',
        label: '🌐 Translator API',
        href: routeHref(base, 'translate/'),
        modes: [
          { id: 'playground', label: '🌐 Translator Playground', href: routeHref(base, 'translate/') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'translate/speed/') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'translate/quality/') },
        ],
      },
      {
        id: 'lid',
        label: '🔍 Language Detection',
        href: routeHref(base, 'lid/'),
        modes: [
          { id: 'playground', label: '🔍 Detector Playground', href: routeHref(base, 'lid/') },
          { id: 'speed', label: '⚡ Speed Benchmark', href: routeHref(base, 'lid/speed/') },
          { id: 'quality', label: '🏆 Quality Benchmark', href: routeHref(base, 'lid/quality/') },
        ],
      },
      {
        id: 'e2e',
        label: '🔗 E2E Pipeline',
        href: routeHref(base, 'e2e/'),
        modes: [],
      },
    ];

    const currentApi = apis.find(item => item.id === api) || apis[0];

    navEl.classList.add('demo-nav', 'demo-nav-2tier');
    const primaryLinks = apis
      .map(item => {
        const active = item.id === currentApi.id;
        return `<a href="${item.href}" class="nav-api-pill${active ? ' is-active' : ''}"${active ? ' aria-current="true"' : ''}>${item.label}</a>`;
      })
      .join('');

    const subLinks = currentApi.modes.length
      ? `<div class="demo-nav-sub" role="navigation" aria-label="${currentApi.label} views">
           <span class="demo-nav-sub-label">${currentApi.label.replace(/^[^\s]+\s/, '')}:</span>
           ${currentApi.modes
             .map(m => {
               const active = m.id === mode;
               return `<a href="${m.href}" class="nav-mode-tab${active ? ' is-active' : ''}"${active ? ' aria-current="page"' : ''}>${m.label}</a>`;
             })
             .join('')}
         </div>`
      : '';

    navEl.innerHTML = `<div class="demo-nav-primary">${primaryLinks}</div>${subLinks}`;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
