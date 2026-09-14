(function (root) {
  'use strict';

  const VERSION = '5';
  const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function occurrences(text, token) {
    const before = /^\p{N}/u.test(token) ? '(?<!\\p{N})' :
      /^[\p{Script=Latin}_]/u.test(token) ? '(?<![\\p{Script=Latin}\\p{N}_])' : '';
    const after = /\p{N}$/u.test(token) ? '(?!\\p{N})' :
      /[\p{Script=Latin}_]$/u.test(token) ? '(?![\\p{Script=Latin}\\p{N}_])' : '';
    return [...text.matchAll(new RegExp(before + escapeRegex(token) + after, 'gu'))].length;
  }

  function markers(text) {
    return [...text.matchAll(/<\/?(?:b\d+|b|i|em|strong)>/gi)].map(match => match[0]);
  }

  function markerStructure(text) {
    const stack = [];
    const counts = {};
    const parents = {};
    let valid = true;
    for (const token of markers(text)) {
      counts[token] = (counts[token] || 0) + 1;
      const closing = token.startsWith('</');
      const name = token.slice(closing ? 2 : 1, -1);
      if (closing) {
        if (stack.pop() !== name) valid = false;
      } else {
        const relation = `${stack.join('/')}|${name}`;
        parents[relation] = (parents[relation] || 0) + 1;
        stack.push(name);
      }
    }
    return { valid: valid && stack.length === 0, counts, parents };
  }

  function sameCounts(left, right) {
    return Object.keys(left).length === Object.keys(right).length &&
      Object.keys(left).every(key => left[key] === right[key]);
  }

  function evaluate(test, output, normalize = value => value) {
    const failures = [];
    const review = [];
    const missing = [];
    const forbidden = [];
    if (typeof output !== 'string' || !output.trim()) {
      return { pass: false, status: 'fail', failures: ['empty_output'], review, missing, forbidden, sentenceShortfall: 0 };
    }

    const source = test.source;
    const sourceMarkers = markerStructure(source);
    const outputMarkers = markerStructure(output);
    const sourceIds = new Set([...source.matchAll(/<\/?b(\d+)\b/gi)].map(match => match[1]));
    if ([...output.matchAll(/<\/?b(\d+)\b/gi)].some(match => Number(match[1]) >= 9000 && !sourceIds.has(match[1]))) {
      failures.push('synthetic_placeholder_leak');
    }
    const literalMarkers = new Set(source.match(/\{\s*\d+\s*\}/g) || []);
    if ([...output.matchAll(/\{\s*\d+\s*\}/g)].some(match => !literalMarkers.has(match[0]))) {
      failures.push('synthetic_placeholder_leak');
    }
    if (!sameCounts(sourceMarkers.counts, outputMarkers.counts)) failures.push('marker_count_or_identity');
    if (sourceMarkers.valid && (!outputMarkers.valid || !sameCounts(sourceMarkers.parents, outputMarkers.parents))) {
      failures.push('marker_nesting');
    }
    if (!sourceMarkers.valid) review.push('source_marker_structure');

    const opaqueTokens = [...source.matchAll(/https?:\/\/[^\s<>"']+|[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi)]
      .map(match => match[0].replace(/[.,;!]+$/, ''));
    for (const token of new Set([...(test.mustPreserve || []), ...opaqueTokens])) {
      const variants = test.allowedTokens?.[token] || [token];
      const count = variants.reduce((total, variant) => total + occurrences(output, variant), 0);
      const expected = Math.max(1, occurrences(source, token));
      const exact = opaqueTokens.includes(token) || (test.exactTokens || []).includes(token);
      const normalizedCount = count || (exact ? 0 : occurrences(normalize(output, test.lang), normalize(token, test.lang)));
      if (normalizedCount < expected) missing.push(token);
      if (normalizedCount > expected) failures.push(`duplicated_token: ${token}`);
    }
    for (const token of test.mustNotContain || []) {
      if (occurrences(output, token)) forbidden.push(token);
    }
    if (missing.length) failures.push('required_token_missing');
    if (forbidden.length) failures.push('forbidden_content');

    const opaqueOnly = /^\s*[\d\s.,%+\-]+\s*$/.test(source) || /^\s*(?:https?:\/\/\S+|[\w.+-]+@[\w.-]+)\s*$/i.test(source);
    if (output.trim() === source.trim() && !opaqueOnly) review.push('unchanged_source');
    if (output.length > Math.max(160, source.length * 4)) review.push('excessive_expansion');
    if (/(.)\1{15,}/u.test(output)) review.push('repeated_characters');
    const words = output.match(/[\p{L}\p{N}]+/gu) || [];
    const trigrams = new Map();
    for (let index = 0; index + 2 < words.length; index++) {
      const gram = words.slice(index, index + 3).join(' ');
      trigrams.set(gram, (trigrams.get(gram) || 0) + 1);
    }
    if ([...trigrams.values()].some(count => count >= 4)) review.push('repeated_phrase');
    if (!/[\p{L}\p{N}]/u.test(output) && /[\p{L}\p{N}]/u.test(source)) failures.push('content_missing');

    const sourceNumbers = source.replace(/<[^>]*>/g, '').match(/\d+(?:[.,]\d+)*/g) || [];
    if (sourceNumbers.length && !opaqueOnly) review.push('numeric_value_and_role');
    if (test.minSentences) review.push('clause_coverage');
    if (test.reviewTopics) review.push(...test.reviewTopics);
    if (test.acceptedOutputs && !test.acceptedOutputs.includes(output)) review.push('reference_variant');
    const status = failures.length ? 'fail' : 'needs_review';
    return { pass: failures.length === 0, status, failures: [...new Set(failures)],
      review: [...new Set(review)], missing, forbidden, sentenceShortfall: 0 };
  }

  function importRows(rows, headers) {
    const required = ['outcome', 'segment_id', 'source_text', 'old_od_translation', 'july_2026_od_translation'];
    for (const field of required) {
      if (!headers.includes(field)) throw new Error(`Missing CSV column: ${field}`);
    }
    const cases = [];
    const warnings = [];
    const seen = new Set();
    for (const [index, row] of rows.entries()) {
      if (!row.source_text?.trim()) { warnings.push(`Row ${index + 2}: missing source`); continue; }
      const key = JSON.stringify([row.segment_id, row.url_hash || '', row.source_text]);
      if (seen.has(key)) { warnings.push(`Row ${index + 2}: duplicate case`); continue; }
      seen.add(key);
      const paired = Boolean(row.old_od_translation?.trim() && row.july_2026_od_translation?.trim());
      if (!paired) warnings.push(`Row ${index + 2}: incomplete old/July pair`);
      if (paired && row.old_od_translation === row.july_2026_od_translation) warnings.push(`Row ${index + 2}: identical old/July output`);
      cases.push({ caseId: `csv:${cases.length + 1}`, id: 'csv_imported', lang: 'es', sourceLanguage: 'en',
        source: row.source_text, origin: 'import',
        oldOutput: row.old_od_translation || '', julyOutput: row.july_2026_od_translation || '', paired,
        reviewTopics: ['meaning_and_entity_roles'] });
    }
    return { cases, warnings };
  }

  function importCorpus(corpus) {
    if (corpus?.schemaVersion !== 1 || corpus.kind !== 'translation-quality-corpus' ||
        corpus.source !== 'en' || typeof corpus.target !== 'string' || !corpus.target ||
        !Array.isArray(corpus.cases) || corpus.cases.length === 0) {
      throw new Error('Expected a version-1 translation-quality-corpus with English source cases.');
    }
    const seen = new Set();
    const imported = corpus.cases.map(test => {
      if (!test || typeof test.caseId !== 'string' || !test.caseId || seen.has(test.caseId) ||
          typeof test.source !== 'string' || !test.source.trim() || typeof test.id !== 'string' ||
          test.lang !== corpus.target || test.sourceLanguage !== corpus.source) {
        throw new Error('Corpus cases must have unique IDs, source text, and matching language pairs.');
      }
      seen.add(test.caseId);
      const result = { caseId: test.caseId, id: test.id, source: test.source, lang: test.lang,
        sourceLanguage: test.sourceLanguage, origin: 'import' };
      for (const field of ['mustPreserve', 'mustNotContain', 'exactTokens', 'reviewTopics', 'acceptedOutputs']) {
        if (test[field] !== undefined) {
          if (!Array.isArray(test[field]) || test[field].some(value => typeof value !== 'string' || !value)) {
            throw new Error(`Invalid ${field} in ${test.caseId}`);
          }
          result[field] = [...test[field]];
        }
      }
      for (const field of ['oldOutput', 'julyOutput', 'baselineOutput']) {
        if (test[field] !== undefined) {
          if (typeof test[field] !== 'string') throw new Error(`Invalid ${field} in ${test.caseId}`);
          result[field] = test[field];
        }
      }
      return result;
    });
    return { cases: imported, warnings: [], target: corpus.target };
  }

  function compare(current, prior) {
    if (Boolean(current.compareStreaming) !== Boolean(prior.compareStreaming) ||
        current.harnessVersion !== prior.harnessVersion) {
      throw new Error('Snapshots use different execution modes or harness versions.');
    }
    if (current.source !== prior.source || current.target !== prior.target ||
        current.corpusHash !== prior.corpusHash || current.validatorVersion !== prior.validatorVersion) {
      throw new Error('Snapshots differ in language pair, corpus, or validator version.');
    }
    if (!current.complete || !prior.complete) throw new Error('Only complete runs can be compared.');
    for (const run of [current, prior]) {
      if (run.error || run.initializationError ||
          [...(run.requests || []), ...(run.quality || []), ...run.defects].some(row => row.error || row.streaming?.error)) {
        throw new Error('Runs with execution errors cannot be used for baseline comparison.');
      }
    }
    const previous = new Map(prior.defects.map(result => [result.caseId, result]));
    if (previous.size !== prior.defects.length || previous.size !== current.defects.length ||
        new Set(current.defects.map(result => result.caseId)).size !== current.defects.length) {
      throw new Error('Snapshots contain different or duplicate case IDs.');
    }
    return current.defects.map(result => {
      const old = previous.get(result.caseId);
      if (!old) throw new Error(`Snapshot is missing case ${result.caseId}`);
      if (old.source !== result.source) throw new Error(`Source changed for ${result.caseId}`);
      if (current.compareStreaming && (!old.streaming || !result.streaming)) {
        throw new Error(`Missing streaming result for ${result.caseId}`);
      }
      const state = old.error || result.error ? 'execution_error' :
        old.output === result.output && (!current.compareStreaming || old.streaming.output === result.streaming.output) ? 'unchanged_output' :
        old.pass && !result.pass ? 'check_regression' :
        !old.pass && result.pass ? 'check_improvement' : 'changed_needs_review';
      return { caseId: result.caseId, source: result.source, state, before: old.output, after: result.output,
        beforeFailures: old.failures, afterFailures: result.failures,
        ...(current.compareStreaming ? { streaming: { before: old.streaming.output, after: result.streaming.output,
          changed: old.streaming.output !== result.streaming.output,
          beforeFailures: old.streaming.failures, afterFailures: result.streaming.failures } } : {}) };
    });
  }

  const cases = [
    { caseId: 'check:compact-quantity', id: 'placeholder_leak', lang: 'es', source: 'The sample contains 2k entries.', mustPreserve: ['2k'] },
    { caseId: 'check:bare-domain', id: 'placeholder_leak', lang: 'es', source: 'Read the guide at example.org.', mustPreserve: ['example.org'] },
    { caseId: 'check:tagged-links', id: 'marker_structure', lang: 'es', source: 'Open <b10>https://example.com/guide</b10>, <b11>https://example.org/help</b11> or <b12>https://example.net/about</b12>. Ask for assistance.', mustPreserve: ['https://example.com/guide', 'https://example.org/help', 'https://example.net/about'] },
    { caseId: 'check:version-time', id: 'numeric_roles', lang: 'es', source: 'The editor updated to 2.8.15.<b10></b10> <b11>3 hours ago</b11>', mustPreserve: ['2.8.15'], reviewTopics: ['time_phrase_and_marker_content'] },
    { caseId: 'check:large-count', id: 'numeric_roles', lang: 'es', source: 'Search over 2M records and save the matching entries.', reviewTopics: ['magnitude_and_connectors'] },
    { caseId: 'check:singular-count', id: 'numeric_roles', lang: 'es', source: '1 message remains unread.', reviewTopics: ['count_agreement_and_added_content'] },
    { caseId: 'check:units-resolution', id: 'numeric_roles', lang: 'es', source: 'The camera records 60fps video at 4K resolution.', reviewTopics: ['units_and_word_order'] },
    { caseId: 'check:platform-label', id: 'partial_untranslated', lang: 'es', source: 'Install the 64-bit application on Windows 11.', mustPreserve: ['Windows'], reviewTopics: ['bit_depth_translation'] },
    { caseId: 'check:discount', id: 'partial_untranslated', lang: 'es', source: 'Get 15% off the sample bundle.', mustNotContain: ['off'], reviewTopics: ['discount_meaning'] },
    { caseId: 'quantity:budget', id: 'numeric_roles', lang: 'zh-hans', source: 'The fictional project has a $42 billion budget and a $25 monthly subscription.', reviewTopics: ['budget_42_billion_USD', 'subscription_25_USD_per_month'] },
    { caseId: 'control:decimal', id: 'numeric_control', lang: 'es', source: '0.1176', mustPreserve: ['0.1176'] },
    { caseId: 'control:literal-marker', id: 'marker_collision', lang: 'es', source: 'Keep <b9000></b9000> and visit https://example.com.', mustPreserve: ['https://example.com'] },
    { caseId: 'unicode:latin', id: 'unicode_case', lang: 'es', source: 'The product code is ÉCOLE-ÜBER.', mustPreserve: ['ÉCOLE-ÜBER'] },
    { caseId: 'repetition:short', id: 'repetition', lang: 'es', source: 'yooooooooooo', reviewTopics: ['runaway_generation'] },
    { caseId: 'coverage:long', id: 'clause_coverage', lang: 'es', source: Array.from({ length: 30 }, (_, index) => `The parcel for department ${index + 1} arrives on Monday.`).join(' ') + ' The final parcel is cancelled, not delayed.', reviewTopics: ['all_departments_present', 'final_clause_and_negation', 'segment_join_spacing'] },
  ];

  const reportCases = [
    { key: 'brands', id: 'brand_preservation', source: 'Open YouTube, Discord, and Twitch.', mustPreserve: ['YouTube', 'Discord', 'Twitch'], exactTokens: ['YouTube', 'Discord', 'Twitch'] },
    { key: 'products', id: 'brand_preservation', source: 'Use GitHub Copilot with Microsoft Teams.', mustPreserve: ['GitHub Copilot', 'Microsoft Teams'], exactTokens: ['GitHub Copilot', 'Microsoft Teams'] },
    ...['12 MB', '12mb', '12MB', '208.96 MB'].map((source, index) => ({
      key: `unit-${index}`, id: 'unit_consistency', source, mustPreserve: [source.match(/[\d.]+/)[0]],
      reviewTopics: ['unit_magnitude_and_identity', 'unit_spacing_and_case_consistency'],
    })),
    { key: 'decimal', id: 'numeric_control', source: '12.34', mustPreserve: ['12.34'], reviewTopics: ['not_a_calendar_date'] },
    { key: 'units-in-prose', id: 'unit_consistency', source: 'The download is 208.96 MB and takes 12 minutes.', mustPreserve: ['208.96', '12'], reviewTopics: ['units_and_numeric_roles'] },
    { key: 'code', id: 'code_preservation', source: 'Run git status --short before continuing.', mustPreserve: ['git status --short'], exactTokens: ['git status --short'] },
    { key: 'entities', id: 'entity_preservation', source: 'Email first.last+tag@example.com or visit https://example.com/docs?v=12.34.', reviewTopics: ['surrounding_prose_translated'] },
    { key: 'newlines', id: 'structured_text', source: 'Status\n Ready\n Count: 12\n Next update: tomorrow.', mustPreserve: ['12'], reviewTopics: ['no_spurious_colons_or_tokens', 'line_structure_and_clause_coverage'] },
    { key: 'tag-meaning', id: 'marker_content', source: 'Open the <b10>GitHub app</b10> on your Windows 11 computer.', mustPreserve: ['Windows', '11', 'GitHub'], reviewTopics: ['entire_translation_of_GitHub_app_inside_b10', 'not_just_balanced_tags'] },
    { key: 'tag-price', id: 'marker_content', source: 'Try the sample service.<b10></b10><b11></b11><b12>A plan costs <b20>$7.50</b20>/month</b12>.', mustPreserve: ['7.50'], reviewTopics: ['price_inside_b20', 'monthly_plan_clause_inside_b12', 'empty_tags_preserved'] },
    { key: 'brand-tag', id: 'marker_content', source: 'Compare <b10>GitHub</b10> with <b11><b20>GitLab</b20></b11> for this example.', mustPreserve: ['GitHub', 'GitLab'], exactTokens: ['GitHub', 'GitLab'], reviewTopics: ['brand_names_inside_original_tags'] },
    { key: 'cjk-format', id: 'structured_text', source: 'Name: GitHub Copilot\n Size: 12.34 MB\n Language: English', mustPreserve: ['GitHub Copilot', '12.34'], exactTokens: ['GitHub Copilot'], reviewTopics: ['no_added_in_English_annotation', 'no_spurious_tokens', 'unit_identity'] },
    { key: 'segmentation', id: 'api_segmentation', source: Array.from({ length: 30 }, (_, index) => `The parcel for department ${index + 1} arrives on Monday.`).join(' ') + ' The final parcel is cancelled, not delayed.', reviewTopics: ['standard_streaming_clause_parity', 'segment_join_spacing', 'final_negation'] },
  ];
  for (const lang of ['es', 'ja', 'zh-hans']) {
    for (const { key, ...test } of reportCases) {
      cases.push({ ...test, lang, sourceLanguage: 'en', caseId: `report:${lang}:${key}` });
    }
  }

  const api = { VERSION, occurrences, markerStructure, evaluate, importRows, importCorpus, compare, cases };
  root.QualityChecks = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);