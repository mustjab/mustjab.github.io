(function (root) {
  'use strict';

  const VERSION = '6';
  const regressions = root.QualityRegressions || (typeof module !== 'undefined' ? require('./regressions.js') : null);
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

  function placeholderLeaks(source, output) {
    const pattern = /\{\s*\d+(?:\s*\})?|\d+\s*\}|\(\s*#?\s*phrasefix\s*\)|\(\s*#\s*\d+\s*\)|<\[>|<=>|<\]>/giu;
    const counts = text => {
      const result = new Map();
      for (const token of text.match(pattern) || []) {
        const key = token.replace(/\s+/gu, '').toLowerCase();
        result.set(key, (result.get(key) || 0) + 1);
      }
      return result;
    };
    const original = counts(source);
    return [...counts(output)].filter(([token, count]) => count > (original.get(token) || 0)).map(([token]) => token);
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
    if (placeholderLeaks(source, output).length) {
      failures.push('synthetic_placeholder_leak');
    }
    if (occurrences(output, '\uFFFD') > occurrences(source, '\uFFFD') ||
        (output.match(/[\u0080-\u009F]/g) || []).length > (source.match(/[\u0080-\u009F]/g) || []).length) {
      failures.push('invalid_utf8_or_control_byte');
    }
    if (!sameCounts(sourceMarkers.counts, outputMarkers.counts)) failures.push('marker_count_or_identity');
    if (sourceMarkers.valid && (!outputMarkers.valid || !sameCounts(sourceMarkers.parents, outputMarkers.parents))) {
      failures.push('marker_nesting');
    }
    if (!sourceMarkers.valid) review.push('source_marker_structure');
    const emptySourceTags = [...source.matchAll(/<(b\d+|b|i|em|strong)>\s*<\/\1>/gi)].map(match => match[1].toLowerCase());
    if (emptySourceTags.some(tag => [...output.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
        .some(match => match[1].trim().length > 0))) {
      failures.push('empty_tag_non_empty');
    }

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
    const regression = regressions.evaluate(test, output);
    failures.push(...regression.failures);
    review.push(...regression.review);
    const coverageFailures = regression.failures.filter(value =>
      value.startsWith('department_') || value.startsWith('unexpected_department') ||
      value.startsWith('final_cancellation') || value.startsWith('passage_'));
    const coverage = ['departments', 'departments14', 'passages'].includes(test.regressionRule) ?
      { pass: coverageFailures.length === 0, failures: coverageFailures } : null;
    const status = failures.length ? 'fail' : 'needs_review';
    return { pass: failures.length === 0, status, failures: [...new Set(failures)],
      review: [...new Set(review)], missing, forbidden, sentenceShortfall: 0, coverage };
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
      if (test.regressionRule !== undefined) {
        if (!regressions.rules.includes(test.regressionRule)) throw new Error(`Invalid regression rule in ${test.caseId}`);
        result.regressionRule = test.regressionRule;
      }
      if (test.expectedInvariant !== undefined) {
        if (typeof test.expectedInvariant !== 'string' || !test.expectedInvariant.trim()) {
          throw new Error(`Invalid expected invariant in ${test.caseId}`);
        }
        result.expectedInvariant = test.expectedInvariant;
      }
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

  function snapshotCases(run) {
    if (!Array.isArray(run.defects) || typeof run.complete !== 'boolean') {
      throw new Error('Expected run results and a completion status.');
    }
    if (!run.complete && !Array.isArray(run.corpus)) {
      throw new Error('Incomplete runs must include their planned corpus.');
    }
    const cases = run.corpus || run.defects;
    for (const rows of [cases, run.defects]) {
      if (rows.some(row => !row || typeof row.caseId !== 'string' || !row.caseId || typeof row.source !== 'string') ||
          new Set(rows.map(row => row.caseId)).size !== rows.length) {
        throw new Error('Snapshots contain invalid or duplicate case IDs.');
      }
    }
    const planned = new Map(cases.map(row => [row.caseId, row]));
    for (const row of run.defects) {
      if (planned.get(row.caseId)?.source !== row.source) throw new Error(`Unexpected result or source changed for ${row.caseId}`);
      for (const outcome of [row, row.streaming].filter(Boolean)) {
        if ((outcome.output !== undefined && typeof outcome.output !== 'string') ||
            (outcome.error !== undefined && typeof outcome.error !== 'string') ||
            (outcome.partialOutput !== undefined && typeof outcome.partialOutput !== 'string')) {
          throw new Error(`Invalid outcome for ${row.caseId}`);
        }
      }
    }
    return cases;
  }

  function compareOutcome(old, result) {
    const status = row => !row || row.status === 'not_run' ? 'not_run' :
      row.error !== undefined || row.status === 'error' || row.status === 'aborted' ? 'error' :
      typeof row.output === 'string' ? 'ok' : 'not_run';
    const beforeStatus = status(old);
    const afterStatus = status(result);
    const beforeVerdict = old?.humanVerdict || old?.semanticVerdict || 'unreviewed';
    const afterVerdict = result?.humanVerdict || result?.semanticVerdict || 'unreviewed';
    const state = beforeStatus === 'not_run' || afterStatus === 'not_run' ? 'not_run' :
      beforeStatus === 'ok' && afterStatus === 'error' ? 'execution_regression' :
      beforeStatus === 'error' && afterStatus === 'ok' ? 'execution_recovery' :
      beforeStatus === 'error' && afterStatus === 'error' ? 'execution_error' :
      old.pass && !result.pass ? 'check_regression' :
      !old.pass && result.pass ? 'check_improvement' :
      beforeVerdict === 'acceptable' && afterVerdict === 'defect' ? 'semantic_regression' :
      beforeVerdict === 'defect' && afterVerdict === 'acceptable' ? 'semantic_improvement' :
      beforeVerdict !== afterVerdict ? 'semantic_review_changed' :
      old.output === result.output ? 'unchanged_output' : 'changed_needs_review';
    return { state, beforeStatus, afterStatus, before: old?.output, after: result?.output,
      beforeError: old?.error, afterError: result?.error,
      beforeReason: old?.reason, afterReason: result?.reason,
      beforePartialOutput: old?.partialOutput, afterPartialOutput: result?.partialOutput,
      beforeChunks: old?.chunks, afterChunks: result?.chunks,
      beforeFailures: old?.failures, afterFailures: result?.failures,
      beforeVerdict, afterVerdict,
      changed: beforeStatus !== afterStatus || old?.output !== result?.output || old?.error !== result?.error ||
        old?.partialOutput !== result?.partialOutput || beforeVerdict !== afterVerdict };
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
    const cases = snapshotCases(current);
    const priorCases = new Map(snapshotCases(prior).map(row => [row.caseId, row]));
    if (cases.length !== priorCases.size) throw new Error('Snapshots contain different planned case IDs.');
    const previous = new Map(prior.defects.map(result => [result.caseId, result]));
    const results = new Map(current.defects.map(result => [result.caseId, result]));
    const indexRequests = run => {
      const requests = new Map();
      for (const request of run.requests || []) {
        const key = JSON.stringify([request.input, request.api]);
        requests.set(key, requests.has(key) ? null : request);
      }
      return requests;
    };
    const requestIndexes = new Map([[prior, indexRequests(prior)], [current, indexRequests(current)]]);
    const outcome = (run, row, spec, api) => {
      const value = api === 'streaming' ? row?.streaming : row;
      if (!value) return { status: 'not_run', reason: run.initializationError || run.error || run.stopReason || 'No result recorded.' };
      const request = requestIndexes.get(run).get(JSON.stringify([spec.source, api]));
      return { ...request, ...value };
    };
    return cases.map(spec => {
      if (!priorCases.has(spec.caseId)) throw new Error(`Snapshot is missing case ${spec.caseId}`);
      if (priorCases.get(spec.caseId).source !== spec.source) throw new Error(`Source changed for ${spec.caseId}`);
      const old = previous.get(spec.caseId);
      const result = results.get(spec.caseId);
      const standard = compareOutcome(outcome(prior, old, spec, 'standard'), outcome(current, result, spec, 'standard'));
      const streaming = current.compareStreaming ?
        compareOutcome(outcome(prior, old, spec, 'streaming'), outcome(current, result, spec, 'streaming')) : undefined;
      const states = [standard.state, streaming?.state];
      const state = ['execution_regression', 'not_run', 'execution_error', 'execution_recovery',
        'check_regression', 'semantic_regression', 'check_improvement', 'semantic_improvement',
        'semantic_review_changed', 'changed_needs_review', 'unchanged_output'].find(value => states.includes(value));
      return { caseId: spec.caseId, source: spec.source, ...standard, state, standard,
        ...(streaming ? { streaming } : {}) };
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
    { key: 'dom-whitespace-citation', id: 'marker_content', source: 'different attacks on<b10>  </b10>... different parties of ladies, in as many different streets, at the same period of time, we may conclude, to a certainty of conviction, that there must be a gang, or, at all events, there must certainly be several of these horrid monsters<b11>  </b11>...<b12><b20><b30><b40>[</b40>17<b41>]</b41></b30></b20></b12>', mustPreserve: ['17', '<b40>[</b40>', '<b41>]</b41>'], exactTokens: ['17', '<b40>[</b40>', '<b41>]</b41>'], reviewTopics: ['opening_clause_preserved_before_b10', 'multi_space_empty_tags_and_nested_citation_preserved'] },
    { key: 'brand-tag', id: 'marker_content', source: 'Compare <b10>GitHub</b10> with <b11><b20>GitLab</b20></b11> for this example.', mustPreserve: ['GitHub', 'GitLab'], exactTokens: ['GitHub', 'GitLab'], reviewTopics: ['brand_names_inside_original_tags'] },
    { key: 'cjk-format', id: 'structured_text', source: 'Name: GitHub Copilot\n Size: 12.34 MB\n Language: English', mustPreserve: ['GitHub Copilot', '12.34'], exactTokens: ['GitHub Copilot'], reviewTopics: ['no_added_in_English_annotation', 'no_spurious_tokens', 'unit_identity'] },
    { key: 'segmentation', id: 'api_segmentation', source: Array.from({ length: 30 }, (_, index) => `The parcel for department ${index + 1} arrives on Monday.`).join(' ') + ' The final parcel is cancelled, not delayed.', reviewTopics: ['standard_streaming_clause_parity', 'segment_join_spacing', 'final_negation'] },
  ];
  for (const lang of ['es', 'ja', 'zh-hans']) {
    for (const { key, ...test } of reportCases) {
      cases.push({ ...test, lang, sourceLanguage: 'en', caseId: `report:${lang}:${key}` });
    }
  }

  function getCases(target) {
    if (typeof target !== 'string' || !target.trim() || target === 'en') return [];
    if (['es', 'ja', 'zh-hans'].includes(target)) {
      return cases.filter(row => row.lang === target).map(row => ({ ...row }));
    }
    const baseChecks = cases
      .filter(row => !row.caseId.startsWith('report:'))
      .map(row => ({
        ...row,
        caseId: `${row.caseId}:${target}`,
        lang: target,
        sourceLanguage: 'en',
        ...(row.mustPreserve ? { mustPreserve: [...row.mustPreserve] } : {}),
        ...(row.mustNotContain ? { mustNotContain: [...row.mustNotContain] } : {}),
        ...(row.reviewTopics ? { reviewTopics: [...row.reviewTopics] } : {}),
      }));
    const targetReports = reportCases.map(({ key, ...test }) => ({
      ...test,
      lang: target,
      sourceLanguage: 'en',
      caseId: `report:${target}:${key}`,
      ...(test.mustPreserve ? { mustPreserve: [...test.mustPreserve] } : {}),
      ...(test.exactTokens ? { exactTokens: [...test.exactTokens] } : {}),
      ...(test.reviewTopics ? { reviewTopics: [...test.reviewTopics] } : {}),
    }));
    return [...baseChecks, ...targetReports];
  }

  const api = { VERSION, occurrences, markerStructure, placeholderLeaks, evaluate, importRows, importCorpus, snapshotCases, compare, cases, getCases };
  root.QualityChecks = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);