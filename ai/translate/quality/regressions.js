(function (root) {
  'use strict';

  const VERSION = '1';
  const rules = Object.freeze([
    'departments', 'departments14', 'passages', 'identity', 'discount', 'decrease',
    'datetime', 'message', 'budget', 'bank', 'idiom', 'fields',
  ]);
  const targets = ['es', 'ja', 'zh-hans'];
  const longPassage = "Artificial intelligence and machine learning technologies are revolutionizing how we approach language translation and natural language processing. These advanced systems can now understand context, idioms, and cultural nuances that were previously challenging for automated translation systems. The integration of neural networks has significantly improved translation quality across multiple languages, enabling real-time communication between people who speak different languages.\n\nModern translation models are trained on billions of parallel text segments, allowing them to capture subtle patterns in how meaning is expressed across linguistic boundaries. The development of attention mechanisms and transformer architectures has been particularly transformative, enabling models to consider the full context of a sentence when generating translations rather than processing words in isolation. These architectures have replaced earlier statistical methods that relied heavily on phrase-based alignment tables and language models with limited context windows.\n\nThe practical applications of machine translation extend far beyond simple text conversion. International businesses rely on translation technology to localize their products, services, and marketing materials for diverse global markets. Healthcare organizations use translation tools to communicate with patients who speak different languages, ensuring that critical medical information is accurately conveyed regardless of linguistic barriers. Legal professionals employ specialized translation systems to handle contracts, patents, and regulatory documents that require exceptional precision.\n\nDespite these remarkable advances, significant challenges remain in handling low-resource languages, preserving stylistic elements, and accurately translating domain-specific terminology in fields such as medicine, law, and engineering. Idiomatic expressions, humor, and cultural references continue to pose difficulties for even the most sophisticated translation systems. The ambiguity inherent in natural language means that context beyond the immediate sentence is often necessary to produce accurate translations.\n\nLooking ahead, the future of translation technology promises even greater capabilities. Multimodal translation systems that can process text, speech, and images simultaneously are emerging as a powerful new paradigm. Real-time translation of spoken language is becoming increasingly accurate, opening possibilities for seamless cross-lingual communication in business meetings, international conferences, and everyday conversations. The ongoing development of more efficient model architectures and training techniques continues to push the boundaries of what automated translation can achieve.\n\nThe history of machine translation stretches back to the earliest days of computing, when researchers first envisioned machines that could bridge language barriers automatically. Early rule-based systems required extensive linguistic knowledge and hand-crafted grammar rules for each language pair, making them expensive to develop and difficult to maintain. The transition to statistical machine translation in the 1990s marked a significant paradigm shift, as systems began learning translation patterns directly from large collections of translated documents rather than relying on explicit linguistic rules.\n\nThe quality of training data plays a crucial role in determining the accuracy and fluency of modern translation systems. Curating high-quality parallel corpora remains an ongoing challenge, particularly for language pairs where professional translations are scarce. Researchers have developed innovative techniques such as back-translation, data augmentation, and transfer learning to address these data limitations. These approaches allow models trained on resource-rich language pairs to transfer their knowledge to less common languages, significantly expanding the reach of automated translation.\n\nEducation and academic research have been profoundly impacted by advances in translation technology. Students and researchers can now access scientific literature published in languages they do not speak, breaking down barriers that previously limited the global exchange of knowledge. Universities are using translation tools to support international students and facilitate cross-border academic collaboration. The ability to rapidly translate educational materials has democratized access to learning resources in developing regions where content in local languages may be limited.\n\nThe economic implications of improved translation technology are substantial and far-reaching. Global e-commerce platforms rely on automated translation to make product listings accessible to buyers worldwide, enabling small businesses to reach international customers without the cost of professional translation services. The tourism and hospitality industry benefits from real-time translation applications that help travelers navigate foreign countries and communicate with local service providers. Financial institutions use translation technology to process international documents, comply with multilingual regulatory requirements, and serve customers across different language communities.\n\nAs translation technology continues to evolve, ethical considerations have become increasingly important. Questions about data privacy arise when sensitive documents are processed through cloud-based translation services. The potential displacement of human translators by automated systems raises concerns about employment in the language services industry. Researchers and developers are working to address biases in training data that can lead to inaccurate or culturally insensitive translations. Ensuring that translation technology serves all communities equitably, including speakers of minority and indigenous languages, remains a critical priority for the field.";

  const definitions = [
    {name: 'departments', id: 'clause_coverage', regressionRule: 'departments',
      source: Array.from({length: 30}, (_, i) => `The parcel for department ${i + 1} arrives on Monday.`).join(' ') +
        ' The final notice confirms cancellation, not delay.',
      expectedInvariant: 'Each department 1-30 has exactly one parcel-arrival-on-Monday association; the final notice confirms cancellation, explicitly not delay.'},
    {name: 'fourteen-departments', id: 'clause_coverage', regressionRule: 'departments14',
      source: Array.from({length: 14}, (_, i) => `Parcel for department ${101 + i} arrives on Monday.`).join(' ') +
        ' The final notice confirms cancellation, not a delay.',
      expectedInvariant: 'Each department 101-114 has exactly one parcel-arrival-on-Monday association; the final notice confirms cancellation, explicitly not a delay.'},
    {name: 'url-query-boundary', id: 'opaque_identity', regressionRule: 'identity',
      source: 'Visit https://example.com/offers?id=15&order=676 and email first@example.com.\n\n' +
        Array.from({length: 20}, (_, i) => `The parcel for department ${i + 1} arrives on Monday with reference ${100 + i}.`).join(' ') +
        '\n\nUse /docs/release/2.8.15?id=676 and contact second@example.com.',
      mustPreserve: ['https://example.com/offers?id=15&order=676', '/docs/release/2.8.15?id=676', 'first@example.com', 'second@example.com'],
      exactTokens: ['https://example.com/offers?id=15&order=676', '/docs/release/2.8.15?id=676', 'first@example.com', 'second@example.com'],
      mustNotContain: ['? id='],
      expectedInvariant: 'Preserve absolute and relative URL query parameters (?id=15&order=676 and /docs/release/2.8.15?id=676) and emails verbatim across multi-sentence segmentation boundaries without inserting spaces after ?.'},
    {name: 'passages', id: 'passage_coverage', regressionRule: 'passages', source: longPassage,
      expectedInvariant: 'Preserve the entire passage, including attention mechanisms and transformer architectures, phrase-based alignment tables, practical applications, and international businesses; keyword coverage alone does not establish completeness.'},
    {name: 'opaque', id: 'opaque_identity', regressionRule: 'identity',
      source: 'Contact support@example.com or https://example.com/offers?id=15 and call getUserById(user_id).',
      mustPreserve: ['support@example.com', 'https://example.com/offers?id=15', 'getUserById', 'user_id'],
      exactTokens: ['support@example.com', 'https://example.com/offers?id=15', 'getUserById', 'user_id'],
      expectedInvariant: 'Preserve the exact email, URL including its query, function name, and argument identifier.'},
    {name: 'discount', id: 'percentage_meaning', regressionRule: 'discount',
      source: 'Get 15% off the sample bundle.',
      expectedInvariant: 'A 15% discount, paying 85% of the original price; Chinese 8.5折 is equivalent. Not 15% of the bundle or price.'},
    {name: 'negation', id: 'percentage_meaning', regressionRule: 'decrease',
      source: 'The price decreased by 15%, not 50%.',
      expectedInvariant: 'The price decreases by 15%; the 50% decrease is explicitly negated.'},
    {name: 'datetime', id: 'placeholder_integrity', regressionRule: 'datetime',
      source: 'The meeting is scheduled for March 15, 2025, at 2:30 PM.',
      mustPreserve: ['15', '2025', '2', '30'],
      expectedInvariant: 'Meeting on March 15, 2025 at 2:30 PM (14:30); preserve each value and its date/time role.'},
    {name: 'literal-braces', id: 'literal_identity', regressionRule: 'identity',
      source: 'Keep the exact literal markers {2} and {3 in this example.',
      mustPreserve: ['{2}', '{3'], exactTokens: ['{2}', '{3'],
      expectedInvariant: 'Keep the source literals {2} and {3 exactly, without altering or inventing markers.'},
    {name: 'literal-collision', id: 'literal_identity', regressionRule: 'identity',
      source: 'Literal {0} is user text. Count 12. Email qa@example.com.',
      mustPreserve: ['{0}', '12', 'qa@example.com'], exactTokens: ['{0}', 'qa@example.com'],
      expectedInvariant: 'Keep literal {0} in user text intact alongside protected number 12 and email qa@example.com without placeholder collision.'},
    {name: 'message', id: 'meaning', regressionRule: 'message',
      source: '1 message remains unread.',
      expectedInvariant: 'Exactly one message remains unread. Keep the message entity; 1 is its quantity, not a detached number or identifier.',
      reviewTopics: ['message_entity_must_not_be_dropped']},
    {name: 'budget', id: 'meaning', regressionRule: 'budget',
      source: 'The budget is $42 billion.',
      expectedInvariant: 'Budget of 42,000,000,000 US dollars: Spanish 42 mil millones, Japanese 420億ドル, Chinese 420亿美元. Not 42 million or 42億/亿 (4.2 billion).',
      reviewTopics: ['budget_currency_magnitude_and_numeric_role']},
    {name: 'bank', id: 'meaning', regressionRule: 'bank',
      source: 'The bank near the river closed early because of the flood warning.',
      expectedInvariant: 'The financial institution near the river closed early because of a flood warning; the riverbank is not the institution.',
      reviewTopics: ['financial_bank_not_riverbank']},
    {name: 'idiom', id: 'meaning', regressionRule: 'idiom',
      source: 'It is raining cats and dogs outside, so we should stay indoors.',
      expectedInvariant: 'Heavy rain outside is the reason to stay indoors; do not describe literal falling cats and dogs.',
      reviewTopics: ['heavy_rain_not_literal_animals']},
    {name: 'fields', id: 'structured_text', regressionRule: 'fields',
      source: 'Status\n Ready\n Count: 12\n Next update: tomorrow.',
      expectedInvariant: 'Keep four ordered lines: status, ready, count 12, next update tomorrow. Do not invent reference fields, repeat content, or flatten the structure.',
      reviewTopics: ['no_invented_fields_or_content']},
    {name: 'ukm-books-2026', id: 'placeholder_integrity', regressionRule: 'identity',
      source: '10 of the best books of 2026 so far',
      mustPreserve: ['10', '2026'], exactTokens: ['10', '2026'],
      expectedInvariant: 'UKM regression: preserve 10 books and year 2026 in their proper semantic roles without swapping 10 and 2026.'},
    {name: 'ukm-rating-stars', id: 'placeholder_integrity', regressionRule: 'identity',
      source: 'Average rating 4.3 out of 5 stars, 1,685 ratings',
      mustPreserve: ['4.3', '5', '1,685'], exactTokens: ['4.3', '1,685'],
      expectedInvariant: 'UKM regression: preserve average rating 4.3 out of 5 stars and 1,685 total ratings without swapping 4.3 and 5.'},
    {name: 'ukm-paradox-titles', id: 'placeholder_integrity', regressionRule: 'identity',
      source: 'With over 100 titles stretching back almost 25 years, the Paradox catalog can take you through history, fantasy, strategy, and beyond.',
      mustPreserve: ['100', '25'], exactTokens: ['100', '25'],
      expectedInvariant: 'UKM regression: preserve over 100 titles and 25 years without swapping 100 and 25.'},
    {name: 'ukm-version-timestamp', id: 'opaque_identity', regressionRule: 'identity',
      source: 'en-US | 6/16/2026 2:11:58 AM | zuswpwssg00000T | MyHL | 6/16/2026 2:11:58 AM | 1.26.0605.03',
      mustPreserve: ['1.26.0605.03', '2026', '2:11:58'], exactTokens: ['1.26.0605.03'],
      expectedInvariant: 'UKM regression: preserve the full 4-part version string 1.26.0605.03 and timestamps without truncating leading segments.'},
    {name: 'dom-whitespace-citation', id: 'marker_content', regressionRule: 'identity',
      source: 'different attacks on<b10>  </b10>... different parties of ladies, in as many different streets, at the same period of time, we may conclude, to a certainty of conviction, that there must be a gang, or, at all events, there must certainly be several of these horrid monsters<b11>  </b11>...<b12><b20><b30><b40>[</b40>17<b41>]</b41></b30></b20></b12>',
      mustPreserve: ['17', '<b40>[</b40>', '<b41>]</b41>'], exactTokens: ['17', '<b40>[</b40>', '<b41>]</b41>'],
      expectedInvariant: 'DOM whitespace regression: preserve multi-space empty inline tags (<b10>  </b10>, <b11>  </b11>) as whitespace-only and deeply nested citation tags (<b12><b20><b30><b40>[</b40>17<b41>]</b41></b30></b20></b12>) without hallucinated (phrasefix) tokens, invalid UTF-8 bytes, or swallowed prose inside empty tags.'},
    {name: 'literal-phrasefix-syntax', id: 'literal_identity', regressionRule: 'identity',
      source: 'Literal (#1) and <=> are user text for item 42 at qa@example.com.',
      mustPreserve: ['42', 'qa@example.com'], exactTokens: ['qa@example.com'],
      expectedInvariant: 'Keep literal reserved phrase-fix tokens (#1) and <=> in user text intact alongside protected number 42 and email qa@example.com without output-validation failure or synthetic placeholder leak.'},
    {name: 'batch-padding-acropora', id: 'meaning', regressionRule: 'identity',
      source: 'Bleached colony of Acropora coral',
      mustNotContain: ['Acropura'],
      expectedInvariant: 'Preserve the genus name Acropora (or its target-script transliteration) without the Acropura corruption and keep sequential vs batched outputs identical.'},
    ...[['cyrillic-be', '\u0411'], ['cyrillic-komi', '\u0500'], ['latin-accent', '\u00c9']].map(([name, code]) => ({
      name, id: 'code_identity', regressionRule: 'identity',
      source: `The product code is ${code}.`, mustPreserve: [code], exactTokens: [code],
      expectedInvariant: `Preserve the exact product-code character ${code} (U+${code.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}); no case folding or transliteration.`,
    })),
  ];

  function getCases(target) {
    if (typeof target !== 'string' || !target.trim() || target === 'en') {
      throw new Error(`Unsupported focused target: ${target}`);
    }
    return definitions.map(({name, ...spec}) => ({
      ...spec, caseId: `focused:${name}`, sourceLanguage: 'en', lang: target,
      ...(spec.mustPreserve ? {mustPreserve: [...spec.mustPreserve]} : {}),
      ...(spec.exactTokens ? {exactTokens: [...spec.exactTokens]} : {}),
      ...(spec.mustNotContain ? {mustNotContain: [...spec.mustNotContain]} : {}),
      ...(spec.reviewTopics ? {reviewTopics: [...spec.reviewTopics]} : {}),
    }));
  }

  function toAsciiDigits(value) {
    return value.replace(/\p{Nd}/gu, char => {
      const code = char.codePointAt(0);
      for (const zero of [0x0030, 0x0660, 0x06F0, 0x0966, 0x09E6, 0x0A66, 0x0AE6, 0x0B66, 0x0BE6, 0x0C66, 0x0CE6, 0x0D66, 0x0E50, 0x0ED0, 0x0F20, 0x1040, 0xFF10]) {
        if (code >= zero && code <= zero + 9) return String(code - zero);
      }
      return char;
    });
  }

  function normalizeTargetLang(target) {
    if (target === 'zh-hant' || target === 'yue' || target === 'lzh') return 'zh-hans';
    if (target === 'fr-ca') return 'fr';
    if (target === 'pt-pt' || target === 'pt-br') return 'pt';
    if (target === 'es-419' || target === 'es-es' || target === 'es-mx') return 'es';
    return target;
  }

  function numeral(value) {
    const ascii = toAsciiDigits(value);
    if (/^\d+$/.test(ascii)) return Number(ascii);
    const digits = '〇一二三四五六七八九';
    const normalized = ascii.replaceAll('零', '〇').replaceAll('两', '二').replaceAll('兩', '二');
    if (normalized.includes('十')) {
      const parts = normalized.split('十');
      if (parts.length !== 2) return NaN;
      return (parts[0] ? digits.indexOf(parts[0]) : 1) * 10 +
        (parts[1] ? digits.indexOf(parts[1]) : 0);
    }
    return Number([...normalized].map(char => digits.indexOf(char)).join(''));
  }

  const departmentRules = {
    es: {label: /(?:departamento|depto\.?)\s*(?:n[úu]mero\s*)?(\d+)(?!\d)/giu,
      monday: /lunes/iu, arrival: /llega|llegará|llegan|arriba/iu,
      negative: /\bno\s+(?:llega|arriba)/iu,
      final: /(?:final|últim[oa])[^.!?\n]{0,80}cancel[^.!?\n]{0,60}(?:no|en lugar de)[^.!?\n]{0,30}(?:retras|demora)/iu},
    ja: {label: /(?:第\s*)?([0-9〇零一二三四五六七八九十]+)\s*(?:部門|部署)|(?:部門|部署)\s*(?:第\s*)?([0-9〇零一二三四五六七八九十]+)/gu,
      monday: /月曜(?:日)?/u, arrival: /到着|届|到達/u,
      negative: /届かない|到着しない/u,
      final: /(?:最終|最後)[^。\n]{0,120}(?:(?:遅延|遅れ|延期)[^。\n]{0,20}(?:ではなく|でなく|じゃなく)[^。\n]{0,30}(?:キャンセル|取り消|取消|中止)|(?:キャンセル|取り消|取消|中止)[^。\n]{0,40}(?:遅延|遅れ|延期)[^。\n]{0,20}(?:ではない|でない|ありません))/u},
    'zh-hans': {label: /(?:第\s*)?([0-9〇零一二两三四五六七八九十]+)\s*(?:号\s*)?部[门門]|部[门門]\s*(?:第\s*)?([0-9〇零一二两三四五六七八九十]+)/gu,
      monday: /星期一|周一|週一/u, arrival: /到达|到達|抵达|抵達|送达|送達/u,
      negative: /不会到达|未到达|不到达/u,
      final: /(?:最终|最后|最終|最後)[^。\n]{0,120}(?:取消[^。\n]{0,30}(?:不是|而非|而不是)[^。\n]{0,20}(?:延迟|延期|延误|延遲)|(?:不是|并非)[^。\n]{0,20}(?:延迟|延期|延误|延遲)[^。\n]{0,30}取消)/u},
  };

  function departments(lang, output, startId = 1, endId = 30) {
    const rule = departmentRules[lang];
    if (!rule) {
      const failures = [];
      for (let id = startId; id <= endId; id++) {
        const matches = [...output.matchAll(new RegExp(`(?<!\\p{N})${id}(?!\\p{N})`, 'gu'))].length;
        if (matches === 0) failures.push(`department_clause_${id}: 0`);
      }
      return failures;
    }
    const labels = [...output.matchAll(rule.label)];
    const associations = [];
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i];
      const clause = output.slice(label.index + label[0].length, labels[i + 1]?.index ?? output.length)
        .split(/[.!?。\n]/u)[0];
      if (rule.monday.test(clause) && rule.arrival.test(clause) && !rule.negative.test(clause)) {
        associations.push(numeral(label[1] || label[2]));
      }
    }
    const failures = [];
    for (let id = startId; id <= endId; id++) {
      const count = associations.filter(value => value === id).length;
      if (count !== 1) failures.push(`department_clause_${id}: ${count}`);
    }
    if (labels.some(label => {
      const id = numeral(label[1] || label[2]);
      return id < startId || id > endId;
    })) failures.push('unexpected_department');
    if (!rule.final.test(output)) failures.push('final_cancellation_negation');
    return failures;
  }

  const passageRules = {
    es: [/atención|attention/iu, /transformador|transformer/iu,
      /tablas[^.!?]{0,60}alineación/iu, /aplicaciones[^.!?]{0,30}prácticas/iu,
      /(?:empresas|negocios)[^.!?]{0,30}internacionales/iu],
    ja: [/注意|アテンション/u, /トランスフォーマ|transformer/iu,
      /アライメント|対応表|整列.*表/u, /実用|実践/u, /国際.*企業|多国籍/u],
    'zh-hans': [/注意力/u, /变压器|变形器|变换器|transformer/iu, /对齐表/u,
      /实际应用|实用/u, /国际企业|跨国企业/u],
  };
  const passageNames = ['attention', 'transformer', 'alignment_tables',
    'practical_applications', 'international_businesses'];

  function percentages(lang, output, discount) {
    const failures = [];
    const idiomatic = discount && lang === 'zh-hans' && /(?<!\d)8\.5\s*折/u.test(output);
    for (const value of discount ? [15] : [15, 50]) {
      if (!new RegExp(`(?<!\\d)${value}\\s*[%٪](?!\\d)`, 'u').test(output) && !idiomatic) {
        failures.push(`percent_value_${value}`);
      }
    }
    const discountMeaning = {
      es: /descuento|ahorr|rebaja/iu,
      ja: /割引|オフ/u,
      'zh-hans': /折扣|节省|减免|优惠|優惠|8\.5\s*折/u,
      fr: /réduction|remise|rabais|économis/iu,
      de: /rabatt|ersparnis|sparen|nachlass/iu,
      it: /sconto|risparmi/iu,
      pt: /desconto|economiz|abatimento/iu,
      ru: /скидк|сэконом/iu,
      ko: /할인/u,
      ar: /خصم|تخفيض|وفر/u,
      hi: /छूट|बचत/u,
    };
    const decreaseMeaning = {
      es: /disminu|baj|redu/iu,
      ja: /下が|下落|低下|減/u,
      'zh-hans': /下降|下跌|降低|减少|減少/u,
      fr: /diminu|baiss|rédui/iu,
      de: /gesunken|verringert|reduziert|gefallen|sank/iu,
      it: /diminuit|calat|ridott|sces/iu,
      pt: /diminu|ca[íi]|reduz|baixa/iu,
      ru: /сниз|уменьш|упал/iu,
      ko: /감소|하락|내려|줄/u,
      ar: /انخفض|تراجع|قل/u,
      hi: /कम|घट|गिरावट/u,
    };
    const negation = {
      es: /(?:\bno\b|en lugar de)[^.!?\n]{0,20}50\s*%/iu,
      ja: /50\s*%[^。\n]{0,15}(?:ではなく|じゃなく|でなく|ではない|ではありません)/u,
      'zh-hans': /(?:不是|而非|而不是|并非|並非)[^。\n]{0,15}50\s*%/u,
      fr: /(?:\bnon\b|\bpas\b|au lieu de)[^.!?\n]{0,25}50\s*%/iu,
      de: /(?:\bnicht\b|statt|anstelle)[^.!?\n]{0,25}50\s*%/iu,
      it: /(?:\bnon\b|invece di)[^.!?\n]{0,25}50\s*%/iu,
      pt: /(?:\bnão\b|em vez de)[^.!?\n]{0,25}50\s*%/iu,
      ru: /(?:\bне\b|вместо)[^.!?\n]{0,25}50\s*%/iu,
      ko: /50\s*%[^.\n]{0,15}(?:아니|아닌)/u,
      ar: /(?:وليس|لا|بدلاً من)[^.!؟\n]{0,25}50\s*[%٪]/u,
      hi: /50\s*%[^।.\n]{0,15}नहीं|न कि[^।.\n]{0,20}50\s*%/u,
    };
    if ((discount ? discountMeaning : decreaseMeaning)[lang] &&
        !(discount ? discountMeaning : decreaseMeaning)[lang].test(output)) {
      failures.push('percent_meaning_0');
    }
    if (!discount && negation[lang] && !negation[lang].test(output)) failures.push('percent_meaning_1');
    return failures;
  }

  function budget(lang, output, failures, review) {
    const correct = {
      es: /(?<![\d.,])(?:42\s+mil\s+millones|42[.]000\s+millones|cuarenta y dos\s+mil\s+millones|42[.]000[.]000[.]000)(?!\d)/iu,
      ja: /(?<!\d)(?:420|四百二十|四佰二十)\s*億/u,
      'zh-hans': /(?<!\d)(?:420|四百二十|四佰贰拾)\s*[亿億]/u,
      fr: /(?<![\d.,])42\s*milliards?(?!\d)/iu,
      de: /(?<![\d.,])42\s*milliarden?(?!\d)/iu,
      it: /(?<![\d.,])42\s*miliardi?(?!\d)/iu,
      pt: /(?<![\d.,])(?:42\s*bilh[õo]es|42\s*mil\s*milh[õo]es)(?!\d)/iu,
      ru: /(?<![\d.,])42\s*(?:миллиард|млрд)(?!\d)/iu,
      ko: /(?<!\d)(?:420|사백이십)\s*억/u,
      ar: /(?<!\d)42\s*مليار/u,
      hi: /(?<!\d)42\s*अरब/u,
    };
    const wrong = {
      es: /(?<![\d.,])(?:42\s*(?:millones|billones)|cuarenta y dos\s*(?:millones|billones))(?!\p{L})/iu,
      ja: /(?<!\d)(?:42|四十二)\s*億/u,
      'zh-hans': /(?<!\d)(?:42|四十二)\s*[亿億]/u,
      fr: /(?<![\d.,])42\s*millions?(?!\p{L})/iu,
      de: /(?<![\d.,])42\s*(?:millionen?|billionen?)(?!\p{L})/iu,
      it: /(?<![\d.,])42\s*(?:milioni?|bilioni?)(?!\p{L})/iu,
      pt: /(?<![\d.,])42\s*milh[õo]es(?!\p{L})/iu,
      ru: /(?<![\d.,])42\s*(?:миллион|млн)(?!\p{L})/iu,
      ko: /(?<!\d)(?:42|사십이)\s*억/u,
      ar: /(?<!\d)42\s*مليون/u,
      hi: /(?<!\d)42\s*(?:करोड़|लाख)/u,
    };
    const currency = {
      es: /dólares|USD|US\$/iu, ja: /米ドル|ドル|USD/u,
      'zh-hans': /美元|美金|USD/u, fr: /dollars?|USD|\$/iu,
      de: /dollar|USD|\$/iu, it: /dollari|USD|\$/iu,
      pt: /d[óo]lares|USD|\$/iu, ru: /доллар|USD|\$/iu,
      ko: /달러|불|USD|\$/u, ar: /دولار|USD|\$/u, hi: /डॉलर|USD|\$/u,
    };
    if (!correct[lang]) {
      review.push('budget_magnitude_unrecognized_needs_review');
      return;
    }
    const recognized = correct[lang].test(output);
    if (wrong[lang]?.test(output)) {
      if (recognized) review.push('budget_multiple_magnitudes_need_review');
      else failures.push('budget_wrong_magnitude');
    }
    if (!recognized) review.push(/(?<!\d)42\s*billion/iu.test(output) ?
      'budget_english_scale_carryover_needs_review' : 'budget_magnitude_unrecognized_needs_review');
    if (currency[lang] && !currency[lang].test(output)) review.push('budget_USD_currency_unrecognized_needs_review');
  }

  function message(lang, output) {
    const rules = {
      es: {entity: /\bmensaje(?:s)?\b/iu,
        quantity: /(?:\b1\b|\bun(?:o)?\b)\s+(?:solo\s+|único\s+)?mensaje|mensaje[^.!?\n]{0,25}:\s*1\b/iu,
        unread: /sin leer|no leíd|sin leíd|pendiente de lectura/iu,
        identifier: /mensaje\s+(?:n[úu]mero|n[.º°]*|id)\s*1\b/iu},
      ja: {entity: /メッセージ/u,
        quantity: /(?:(?<!\d)1(?!\d)|一)\s*(?:(?:件|通)[^。\n]{0,20})?メッセージ|メッセージ[^。\n]{0,20}(?:(?<!\d)1(?!\d)|一)\s*(?:件|通)/u,
        unread: /未読|読まれていない/u, identifier: /メッセージ\s*(?:番号|ID)\s*1|1番.*メッセージ/u},
      'zh-hans': {entity: /消息|信息/u,
        quantity: /(?:1|一)\s*(?:条|則|则|个)[^。\n]{0,15}(?:消息|信息)|(?:消息|信息)[^。\n]{0,15}[:：]\s*1/u,
        unread: /未读|尚未阅读|没有读/u, identifier: /(?:消息|信息)\s*(?:编号|ID)\s*1/u},
    };
    const rule = rules[lang];
    const failures = [];
    if (!rule) return failures;
    if (!rule.entity.test(output)) failures.push('message_entity_missing');
    if (!rule.quantity.test(output)) failures.push('message_quantity_unrecognized');
    if (!rule.unread.test(output)) failures.push('message_unread_meaning_unrecognized');
    if (rule.identifier.test(output)) failures.push('message_quantity_replaced_by_identifier');
    return failures;
  }

  function evaluate(test, output) {
    const result = {failures: [], review: []};
    if (!test.regressionRule) return result;
    if (!rules.includes(test.regressionRule)) throw new Error(`Unknown regression rule: ${test.regressionRule}`);
    if (typeof test.lang !== 'string' || !test.lang.trim() || test.lang === 'en') {
      throw new Error(`Unsupported regression target: ${test.lang}`);
    }
    const lang = normalizeTargetLang(test.lang);
    if (typeof output !== 'string') throw new Error('Regression output must be text.');
    const text = toAsciiDigits(output.normalize('NFKC'));
    result.review.push('expected_invariant_requires_human_review');
    const {failures, review} = result;
    switch (test.regressionRule) {
      case 'departments':
        failures.push(...departments(lang, text, 1, 30));
        review.push('coverage_patterns_are_development_flags_not_accuracy', 'alternative_department_wording_needs_review');
        break;
      case 'departments14':
        failures.push(...departments(lang, text, 101, 114));
        review.push('coverage_patterns_are_development_flags_not_accuracy', 'alternative_department_wording_needs_review');
        break;
      case 'passages':
        if (passageRules[lang]) {
          failures.push(...passageRules[lang].flatMap((pattern, i) =>
            pattern.test(text) ? [] : [`passage_${passageNames[i]}`]));
        }
        review.push('coverage_patterns_are_development_flags_not_accuracy', 'full_passage_semantics_and_synonyms_need_review');
        break;
      case 'discount':
      case 'decrease':
        failures.push(...percentages(lang, text, test.regressionRule === 'discount'));
        review.push('percentage_value_role_and_alternative_wording_need_review');
        break;
      case 'budget':
        if (test.source !== 'The budget is $42 billion.') {
          review.push('budget_rule_requires_controlled_42_billion_source');
          break;
        }
        budget(lang, text, failures, review);
        review.push('budget_currency_magnitude_and_numeric_role');
        break;
      case 'message':
        failures.push(...message(lang, text));
        review.push('message_quantity_entity_and_unread_meaning_need_review');
        break;
      case 'bank': {
        const financial = {
          es: /\bbanco\b|entidad bancaria/iu, ja: /銀行|金融機関/u,
          'zh-hans': /银行|金融机构|銀行|金融機構/u, fr: /\bbanque\b/iu,
          de: /\bbank\b|geldinstitut/iu, it: /\bbanca\b/iu, pt: /\bbanco\b/iu,
          ru: /\bбанк/iu, ko: /은행/u, ar: /بنك|مصرف/u, hi: /बैंक/u,
        };
        const riverbank = {
          es: /\borilla\b|\bribera\b/iu, ja: /川岸|河岸/u, 'zh-hans': /河岸/u,
          fr: /\brive\b|\bberge\b/iu, de: /\bufer\b|\bflussufer\b/iu,
          it: /\briva\b|\bsponda\b/iu, pt: /\bmargem\b|\bbeira\b/iu,
          ru: /\bберег/iu, ko: /강둑|강가/u, ar: /ضفة/u, hi: /किनार|तट/u,
        };
        if (riverbank[lang]?.test(text) && !financial[lang]?.test(text)) failures.push('financial_bank_replaced_by_riverbank');
        review.push('financial_bank_not_riverbank', 'closure_flood_warning_and_causality_need_review');
        break;
      }
      case 'idiom': {
        const literal = {
          es: /lluev[^.!?\n]{0,35}gatos[^.!?\n]{0,15}perros/iu,
          ja: /猫[^。\n]{0,15}犬[^。\n]{0,25}(?:降|雨)/u,
          'zh-hans': /(?:下|降)[^。\n]{0,15}[猫貓][^。\n]{0,15}狗/u,
          fr: /pleu[^.!?\n]{0,35}chats?[^.!?\n]{0,15}chiens?/iu,
          de: /regne[^.!?\n]{0,35}katzen[^.!?\n]{0,15}hunde/iu,
          it: /piov[^.!?\n]{0,35}gatti[^.!?\n]{0,15}cani/iu,
          pt: /chov[^.!?\n]{0,35}gatos[^.!?\n]{0,15}c(?:ã|a)es|cachorros/iu,
          ru: /дожд[^.!?\n]{0,35}кош[^.!?\n]{0,15}собак/iu,
          ko: /고양이[^.\n]{0,15}개[^.\n]{0,20}비/u,
          ar: /تمطر[^.!؟\n]{0,30}قطط[^.!؟\n]{0,15}كلاب/u,
          hi: /बिल्ल[^।.\n]{0,20}कुत्त[^।.\n]{0,20}बारिश/u,
        };
        const negated = {
          es: /\bno\b[^.!?\n]{0,20}lluev/iu,
          ja: /ではな|わけでは/u, 'zh-hans': /不是[^。\n]{0,20}(?:下|降)/u,
          fr: /\bne\b[^.!?\n]{0,20}pleu/iu, de: /\bnicht\b/iu,
          it: /\bnon\b[^.!?\n]{0,20}piov/iu, pt: /\bnão\b[^.!?\n]{0,20}chov/iu,
          ru: /\bне\b/iu, ko: /아니/u, ar: /\bلا\b|\bليس\b/u, hi: /नहीं/u,
        };
        if (literal[lang]?.test(text) && !negated[lang]?.test(text)) failures.push('literal_raining_animals');
        review.push('heavy_rain_not_literal_animals', 'stay_indoors_and_causality_need_review');
        break;
      }
      case 'fields': {
        const lines = output.split(/\r?\n/u).map(line => line.trim()).filter(Boolean);
        if (lines.length !== 4) failures.push('four_field_lines_not_preserved');
        if (new Set(lines).size !== lines.length) failures.push('repeated_field_line');
        const invented = {es: /\breferencia\b/iu, ja: /参考|参照/u, 'zh-hans': /参考|引用|參考/u};
        if (invented[lang]?.test(text)) failures.push('invented_reference_field');
        review.push('ordered_status_ready_count12_update_tomorrow_and_no_repeated_content_need_review');
        break;
      }
      case 'datetime': {
        const timeValid = /(?:(?<!\d)(?:2|14)\s*[:：]\s*30(?!\d)|(?:2|二|14|十四)\s*[時时点點]\s*(?:30\s*分?|三十\s*分?|半))/u.test(text);
        const detachedTrailingDigits = /[.!?。！？]\s*\d+(?:\s+\d+)*\s*$/u.test(text);
        if (!timeValid || detachedTrailingDigits) {
          failures.push('datetime_time_corrupted_or_detached');
        }
        review.push('March15_2025_1430_date_time_values_and_roles_need_review');
        break;
      }
      case 'identity':
        break;
    }
    return result;
  }

  const api = {VERSION, rules, getCases, evaluate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QualityRegressions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
