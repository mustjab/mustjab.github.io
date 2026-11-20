'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const AI_DIR = __dirname;
const EXPECTED_TOKEN =
  'AzfmQd5WeCR1czyG5r870L/lVteg6zZW240+bw4KWXXMJWNHC1DvPbBhkPNEIbKoPykxzUFsVBTlfLH0MnFuUFIAAABpeyJvcmlnaW4iOiJodHRwczovL211c3RqYWIuZ2l0aHViLmlvOjQ0MyIsImZlYXR1cmUiOiJBSVByb21wdEFQSSIsImV4cGlyeSI6MTgwMjkwNzc4NCwiaXNTdWJkb21haW4iOnRydWV9';

function collectAiHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAiHtmlFiles(full, out);
    } else if (/\.(?:html|htm)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

test('Every /ai/* HTML page includes the AIPromptAPI Origin Trial meta tag in <head>', () => {
  const files = collectAiHtmlFiles(AI_DIR);
  assert.ok(files.length >= 18, `expected at least 18 /ai/* HTML pages, found ${files.length}`);

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
    assert.ok(headMatch, `missing <head> in ${path.relative(AI_DIR, file)}`);
    assert.ok(
      headMatch[1].includes(`http-equiv="origin-trial" content="${EXPECTED_TOKEN}"`),
      `missing AIPromptAPI origin-trial meta tag in ${path.relative(AI_DIR, file)}`
    );
  }
});

test('nav.js injects origin-trial meta tag when absent and avoids duplicates when present', () => {
  const navSrc = fs.readFileSync(path.join(AI_DIR, 'nav.js'), 'utf8');

  function runNavWithInitialMetas(initialTokens) {
    const headMetas = initialTokens.map(token => ({
      httpEquiv: 'origin-trial',
      content: token,
      getAttribute(attr) {
        if (attr === 'content') return this.content;
        if (attr === 'http-equiv') return this.httpEquiv;
        return null;
      },
    }));

    const sandbox = {
      URLSearchParams,
      window: {
        location: { pathname: '/ai/speed/', search: '', protocol: 'https:' },
      },
      document: {
        readyState: 'complete',
        head: {
          querySelectorAll(selector) {
            return selector === 'meta[http-equiv="origin-trial"]' ? headMetas.slice() : [];
          },
          appendChild(el) {
            headMetas.push(el);
          },
        },
        querySelector() {
          return null;
        },
        querySelectorAll() {
          return [];
        },
        createElement(tag) {
          assert.equal(tag, 'meta');
          return {
            httpEquiv: '',
            content: '',
            getAttribute(attr) {
              if (attr === 'content') return this.content;
              if (attr === 'http-equiv') return this.httpEquiv;
              return null;
            },
          };
        },
        addEventListener() {},
      },
    };

    vm.runInNewContext(navSrc, sandbox);
    return headMetas;
  }

  const injected = runNavWithInitialMetas([]);
  assert.equal(injected.length, 1);
  assert.equal(injected[0].httpEquiv, 'origin-trial');
  assert.equal(injected[0].content, EXPECTED_TOKEN);

  const deduplicated = runNavWithInitialMetas([EXPECTED_TOKEN]);
  assert.equal(deduplicated.length, 1);
});