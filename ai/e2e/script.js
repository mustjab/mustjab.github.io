/* Built-in AI End-to-End Pipeline
 * Runs Language Detector, Proofreader, Summarizer, Rewriter, Writer,
 * Prompt API (LanguageModel), and Translator from a single unified input.
 */

const PRESETS = {
    launch: {
        title: 'Product Launch Draft',
        text: `We are thrilled to anounce the general availability of Edge On-Device AI Studio v2.8.15 on March 15, 2025 at 2:30 PM! The new release reduces translation latency by 35% while preserving URLs like https://example.com/docs/2.8.15?id=676 and relative paths such as /docs/release/2.8.15?id=676 across sentence boundaries. Enterprise teams with a $42 billion annual cloud budget can now run Summarizer, Rewriter, Writer, and Translator locally with zero cloud round-trips. Contact support@example.com if 1 message remains unread in your onboarding queue.`
    },
    release: {
        title: 'Engineering Release Notes',
        text: `Release v2.8.15 introduces Neural Phrase Fix (NPF) with deterministic Hard Phrase Fix (HPF) fallback for on-device translation. Multi-sentence segments coalesce up to 4 protected spans within a 240-token budget before falling back to sentence-level splits. In 136 automated regression calls and 9,959 decoding steps, edge-case URL queries (?id=15&order=676) and 30 numbered department clauses were preserved with 0 unexpected errors.`
    },
    support: {
        title: 'Customer Escalation Email',
        text: `Hi team, our deployment of the translation widget in Department 14 failed yesterday becuase the webhook URL https://api.example.org/v2/hooks?tenant=676 was truncated during batch processing. We have 12 pending tickets and need a root-cause summary, a polished status update for leadership, and a Spanish translation for our regional operations team by Monday.`
    },
    multilingual: {
        title: 'Spanish Customer Feedback',
        text: `El nuevo servicio de traducción local funciona muy rápido en Windows 11. Hemos probado 15 documentos técnicos con enlaces como https://example.com/offers?id=15 y correos como soporte@example.com, y todos los números y direcciones se conservaron correctamente sin errores.`
    }
};

const DECISION_SCHEMAS = {
    general: {
        context: 'Classify the input text by whether it requires action, its primary category, and its priority score from 1 (low) to 5 (critical).',
        questions: [
            { id: 'actionable', prompt: 'Does this text require follow-up action?', type: 'boolean' },
            {
                id: 'category',
                prompt: 'Which category best fits this text?',
                type: 'choice',
                options: [
                    { label: 'announcement', description: 'Product launch, news, or general update' },
                    { label: 'engineering', description: 'Release notes, technical metrics, or architecture' },
                    { label: 'support', description: 'Customer issue, bug report, or escalation' },
                    { label: 'feedback', description: 'User review or sentiment' }
                ]
            },
            {
                id: 'priority',
                prompt: 'Rate priority or impact from 1 (minimal) to 5 (critical).',
                type: 'score',
                options: [
                    { label: '1', description: 'Minimal priority' },
                    { label: '2', description: 'Low priority' },
                    { label: '3', description: 'Moderate priority' },
                    { label: '4', description: 'High priority' },
                    { label: '5', description: 'Critical priority' }
                ]
            }
        ]
    },
    support: {
        context: 'You are triaging incoming customer support escalations. Treat outages, broken URLs, and billing issues as urgent.',
        questions: [
            { id: 'urgent', prompt: 'Does this escalation require immediate attention?', type: 'boolean' },
            {
                id: 'area',
                prompt: 'Which area is primarily affected?',
                type: 'choice',
                options: [
                    { label: 'bug', description: 'Crash, broken webhook, or technical failure' },
                    { label: 'billing', description: 'Payment, invoice, or pricing issue' },
                    { label: 'localization', description: 'Translation or regional language request' },
                    { label: 'account', description: 'Login or permissions issue' }
                ]
            },
            {
                id: 'severity',
                prompt: 'Rate customer impact from 1 (low) to 5 (critical).',
                type: 'score',
                options: [
                    { label: '1', description: 'Low impact' },
                    { label: '2', description: 'Moderately low impact' },
                    { label: '3', description: 'Medium impact' },
                    { label: '4', description: 'High impact' },
                    { label: '5', description: 'Critical impact' }
                ]
            }
        ]
    },
    release: {
        context: 'Evaluate engineering release notes for production readiness and primary quality pillar.',
        questions: [
            { id: 'ready_to_ship', prompt: 'Does the evidence indicate this release is ready to ship?', type: 'boolean' },
            {
                id: 'pillar',
                prompt: 'Which engineering pillar is the primary focus?',
                type: 'choice',
                options: [
                    { label: 'performance', description: 'Latency, speed, or memory improvements' },
                    { label: 'reliability', description: 'Regression coverage, error rate, or stability' },
                    { label: 'compliance', description: 'Security, privacy, or policy' },
                    { label: 'ux', description: 'Interface or user experience polish' }
                ]
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
                    { label: '5', description: 'Very high confidence' }
                ]
            }
        ]
    }
};

const E2E_TOOLS = [
    {
        name: 'extractEntities',
        description: 'Extract versions, URLs, emails, and key metrics from text.',
        inputSchema: {
            type: 'object',
            properties: {
                version: { type: 'string', description: 'Detected version string or release identifier.' },
                primaryMetric: { type: 'string', description: 'Key numeric metric or count in the text.' }
            },
            required: ['version']
        }
    },
    {
        name: 'lookupServiceStatus',
        description: 'Check deployment health and active ticket count for a service or component.',
        inputSchema: {
            type: 'object',
            properties: {
                service: { type: 'string', description: 'Service, product, or department name to check.' }
            },
            required: ['service']
        }
    },
    {
        name: 'createActionTicket',
        description: 'Create a tracked engineering or support action item.',
        inputSchema: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Short summary of the follow-up action.' },
                priority: { type: 'string', description: 'Priority level (P1, P2, P3).' }
            },
            required: ['title', 'priority']
        }
    },
    {
        name: 'getWeather',
        description: 'Get the current weather for a city.',
        inputSchema: {
            type: 'object',
            properties: {
                location: { type: 'string', description: 'City name.' }
            },
            required: ['location']
        }
    },
    {
        name: 'getLocalTime',
        description: 'Get the current local time for a city.',
        inputSchema: {
            type: 'object',
            properties: {
                location: { type: 'string', description: 'City name.' }
            },
            required: ['location']
        }
    }
];

const E2E_TOOL_EXECUTORS = {
    async extractEntities(args = {}) {
        return {
            extractedVersion: args.version || 'v2.8.15',
            primaryMetric: args.primaryMetric || '35% latency reduction',
            verifiedUrls: 2
        };
    },
    async lookupServiceStatus({ service = 'edge-ai-studio' } = {}) {
        return {
            service,
            status: 'healthy',
            uptimePct: 99.98,
            openTickets: 1
        };
    },
    async createActionTicket({ title = 'Follow-up review', priority = 'P2' } = {}) {
        return {
            ticketId: 'AI-4821',
            title,
            priority,
            status: 'created'
        };
    },
    async getWeather({ location = 'Seattle' } = {}) {
        return { location, temperatureC: 16, condition: 'Partly cloudy' };
    },
    async getLocalTime({ location = 'Dublin' } = {}) {
        return { location, localTime: '11:30 UTC+1' };
    }
};

const DEFAULTS = {
    prompt: {
        system: 'Analyze the user\'s text: extract key takeaways, any numbers/dates/URLs, and 2 recommended next steps.',
        input: PRESETS.launch.text,
        inputHint: 'Input sent to all enabled Built-in AI APIs.'
    },
    summarizer: {
        system: 'Summarize the input text. Preserve key facts and numbers.\nOutput concise bullet points unless the text is very short.',
        input: '',
        inputHint: 'Text to summarize.'
    },
    writer: {
        system: 'Write a concise follow-up announcement or action plan based on this source text:',
        input: '',
        inputHint: 'What should be written (topic, audience, constraints, etc.).'
    },
    rewriter: {
        system: 'Rewrite the input text based on the selected tone/length/format.\nPreserve meaning and key details; improve clarity and readability.',
        input: '',
        inputHint: 'Text to rewrite.'
    },
    proofreader: {
        system: 'Correct grammar, spelling, and punctuation while preserving meaning.\nReturn only the corrected text.',
        input: '',
        inputHint: 'Text to proofread.'
    }
};

function $(id) {
    return document.getElementById(id);
}

function setTextIfPresent(id, text) {
    const el = $(id);
    if (el) el.textContent = text;
}

function supportText(state, extra = '') {
    const suffix = extra ? ` ${extra}` : '';
    return `${state}${suffix}`;
}

function setSupportBadge(id, label, stateClass = '') {
    const el = $(id);
    if (!el) return;
    el.textContent = label;
    el.className = `support-badge${stateClass ? ' ' + stateClass : ''}`;
}

function safeText(x) {
    if (x === null || x === undefined) return '';
    return String(x);
}

function nowMs() {
    return performance.now();
}

function calcThroughput(chars, elapsedMs) {
    if (!elapsedMs || elapsedMs <= 0) return 0;
    return Math.round((chars / elapsedMs) * 1000);
}

function splitBySentence(text) {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];
    // Simple heuristic: split on sentence-ending punctuation.
    const parts = cleaned.split(/(?<=[.!?])\s+/);
    return parts.map(s => s.trim()).filter(Boolean);
}

function splitByParagraph(text) {
    const parts = text.split(/\n\s*\n+/);
    return parts.map(p => p.trim()).filter(Boolean);
}

function splitByChars(text, size) {
    const segments = [];
    for (let i = 0; i < text.length; i += size) {
        segments.push(text.slice(i, i + size));
    }
    return segments.map(s => s.trim()).filter(Boolean);
}

// Searchable Language Select Component (ported from ai/translate demo)
class SearchableLanguageSelect {
    constructor(inputId, dropdownId, hiddenInputId, languages, defaultValue = '') {
        this.input = document.getElementById(inputId);
        this.dropdown = document.getElementById(dropdownId);
        this.hiddenInput = document.getElementById(hiddenInputId);
        this.languages = languages;
        this.filteredLanguages = [...languages];
        this.selectedIndex = -1;
        this.isOpen = false;

        this.init();
        if (defaultValue) {
            this.setValue(defaultValue);
        }
    }

    init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('focus', (e) => this.handleFocus(e));
        this.input.addEventListener('blur', (e) => this.handleBlur(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

        document.addEventListener('click', (e) => {
            if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) {
                this.close();
            }
        });

        this.renderOptions();
    }

    handleInput(e) {
        const query = e.target.value.toLowerCase();
        this.filteredLanguages = this.languages.filter(lang =>
            lang.name.toLowerCase().includes(query) ||
            lang.code.toLowerCase().includes(query)
        );
        this.selectedIndex = -1;
        this.renderOptions();
        this.open();
    }

    handleFocus(e) {
        this.open();
        e.target.select();
    }

    handleBlur(_e) {
        setTimeout(() => {
            if (!this.dropdown.matches(':hover')) {
                this.close();
            }
        }, 150);
    }

    handleKeydown(e) {
        if (!this.isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                this.open();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredLanguages.length - 1);
                this.updateHighlight();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateHighlight();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0) {
                    this.selectLanguage(this.filteredLanguages[this.selectedIndex]);
                } else if (this.filteredLanguages.length > 0) {
                    this.selectLanguage(this.filteredLanguages[0]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                this.close();
                break;
        }
    }

    open() {
        this.isOpen = true;
        this.dropdown.style.display = 'block';
        this.renderOptions();
    }

    close() {
        this.isOpen = false;
        this.dropdown.style.display = 'none';
        this.selectedIndex = -1;
    }

    renderOptions() {
        const fragment = document.createDocumentFragment();

        if (this.filteredLanguages.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'searchable-select-no-results';
            noResults.textContent = 'No languages found';
            fragment.appendChild(noResults);
        } else {
            const categories = this.groupLanguagesByCategory(this.filteredLanguages);

            Object.entries(categories).forEach(([category, langs]) => {
                if (langs.length === 0) return;

                if (Object.keys(categories).length > 1) {
                    const categoryHeader = document.createElement('div');
                    categoryHeader.className = 'searchable-select-category';
                    categoryHeader.textContent = category;
                    fragment.appendChild(categoryHeader);
                }

                langs.forEach((language) => {
                    const option = document.createElement('div');
                    option.className = 'searchable-select-option';
                    option.setAttribute('data-filtered-index', this.filteredLanguages.indexOf(language).toString());
                    option.innerHTML = `
            ${language.name}
            <span class="language-code">${language.code}</span>
          `;

                    option.addEventListener('mousedown', (e) => {
                        e.preventDefault();
                        this.selectLanguage(language);
                    });

                    option.addEventListener('mouseenter', () => {
                        this.selectedIndex = this.filteredLanguages.indexOf(language);
                        this.updateHighlight();
                    });

                    fragment.appendChild(option);
                });
            });
        }

        this.dropdown.innerHTML = '';
        this.dropdown.appendChild(fragment);
        this.updateHighlight();
    }

    groupLanguagesByCategory(languages) {
        const categories = {
            'Core Languages': [],
            'Germanic Languages': [],
            'Romance Languages': [],
            'Latin Script Slavic': [],
            'Cyrillic Script': [],
            'East Asian': [],
            'South Asian': [],
            'Southeast Asian': [],
            'Arabic Script': [],
            'African Languages': [],
            'Other European': [],
            'Other': []
        };

        const coreCodes = ['en', 'auto'];
        const germanicCodes = ['de', 'nl', 'da', 'nb', 'sv', 'af', 'is', 'fo', 'lb'];
        const romanceCodes = ['es', 'fr', 'it', 'pt', 'pt-pt', 'ca', 'ro', 'gl', 'oc', 'la'];
        const latinSlavicCodes = ['pl', 'cs', 'sk', 'hr', 'sl', 'bs', 'dsb', 'hsb', 'sr-latn'];
        const cyrillicCodes = ['ru', 'bg', 'uk', 'be', 'mk', 'sr-cyrl', 'kk', 'ky', 'tg', 'tt', 'mn-cyrl', 'ba', 'ce', 'cv'];
        const eastAsianCodes = ['zh-hans', 'zh-hant', 'ja', 'ko', 'lzh', 'yue'];
        const southAsianCodes = ['hi', 'bn', 'gu', 'kn', 'ml', 'mr', 'ta', 'te', 'ur', 'as', 'or', 'pa', 'ne', 'si', 'my', 'dv', 'awa', 'bho', 'brx', 'doi', 'gom', 'kok', 'hne', 'kha', 'lus', 'mag', 'mai', 'mni', 'sat'];
        const southeastAsianCodes = ['th', 'vi', 'id', 'ms', 'km', 'lo', 'jv', 'su', 'ceb', 'fil', 'mi', 'fj', 'haw', 'sm', 'to', 'ty', 'tet'];
        const arabicScriptCodes = ['ar', 'fa', 'he', 'ps', 'prs', 'ku', 'ks', 'sd', 'ug'];
        const africanCodes = ['ha', 'ig', 'yo', 'zu', 'xh', 'sw', 'sn', 'st', 'tn', 'nso', 'run', 'rw', 'ln', 'lg', 'mg', 'so', 'am', 'ti', 'nya'];
        const otherEuropeanCodes = ['fi', 'hu', 'et', 'lv', 'lt', 'el', 'mt', 'eu', 'cy', 'ga', 'sq', 'hy', 'ka', 'tr', 'az', 'uz', 'tk', 'kk', 'ky'];

        languages.forEach(lang => {
            if (coreCodes.includes(lang.code)) {
                categories['Core Languages'].push(lang);
            } else if (germanicCodes.includes(lang.code)) {
                categories['Germanic Languages'].push(lang);
            } else if (romanceCodes.includes(lang.code)) {
                categories['Romance Languages'].push(lang);
            } else if (latinSlavicCodes.includes(lang.code)) {
                categories['Latin Script Slavic'].push(lang);
            } else if (cyrillicCodes.includes(lang.code)) {
                categories['Cyrillic Script'].push(lang);
            } else if (eastAsianCodes.includes(lang.code)) {
                categories['East Asian'].push(lang);
            } else if (southAsianCodes.includes(lang.code)) {
                categories['South Asian'].push(lang);
            } else if (southeastAsianCodes.includes(lang.code)) {
                categories['Southeast Asian'].push(lang);
            } else if (arabicScriptCodes.includes(lang.code)) {
                categories['Arabic Script'].push(lang);
            } else if (africanCodes.includes(lang.code)) {
                categories['African Languages'].push(lang);
            } else if (otherEuropeanCodes.includes(lang.code)) {
                categories['Other European'].push(lang);
            } else {
                categories['Other'].push(lang);
            }
        });

        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) delete categories[key];
        });

        return categories;
    }

    updateHighlight() {
        const options = this.dropdown.querySelectorAll('.searchable-select-option');
        options.forEach((option) => {
            const optionIndex = parseInt(option.getAttribute('data-filtered-index'), 10);
            option.classList.toggle('highlighted', optionIndex === this.selectedIndex);
        });

        if (this.selectedIndex >= 0) {
            const highlightedOption = this.dropdown.querySelector(`.searchable-select-option[data-filtered-index="${this.selectedIndex}"]`);
            if (highlightedOption) highlightedOption.scrollIntoView({ block: 'nearest' });
        }
    }

    selectLanguage(language) {
        this.setValue(language.code);
        this.close();

        const event = new Event('change', { bubbles: true });
        this.hiddenInput.dispatchEvent(event);
    }

    setValue(code) {
        const language = this.languages.find(lang => lang.code === code);
        if (language) {
            this.input.value = language.name;
            this.input.classList.add('has-value');
            this.hiddenInput.value = code;
        }
    }

    getValue() {
        return this.hiddenInput.value;
    }
}

// Language list used by the translation demo (ported here for the E2E page)
const LANGUAGE_NAMES = {
    'af': 'Afrikaans',
    'am': 'Amharic',
    'ar': 'Arabic',
    'as': 'Assamese',
    'awa': 'Awadhi',
    'az': 'Azerbaijani',
    'ba': 'Bashkir',
    'be': 'Belarusian',
    'bg': 'Bulgarian',
    'bho': 'Bhojpuri',
    'bn': 'Bangla',
    'bo': 'Tibetan',
    'brx': 'Bodo',
    'bs': 'Bosnian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'ce': 'Chechen',
    'zh-hans': 'Chinese Simplified',
    'zh-hant': 'Chinese Traditional',
    'cv': 'Chuvash',
    'cs': 'Czech',
    'cy': 'Welsh',
    'da': 'Danish',
    'de': 'German',
    'doi': 'Dogri',
    'dv': 'Divehi',
    'dsb': 'Lower Sorbian',
    'dz': 'Dzongkha',
    'el': 'Greek',
    'en': 'English',
    'es': 'Spanish',
    'et': 'Estonian',
    'eu': 'Basque',
    'fa': 'Persian',
    'fj': 'Fijian',
    'fil': 'Filipino',
    'fi': 'Finnish',
    'fo': 'Faroese',
    'fr': 'French',
    'fr-ca': 'French (Canada)',
    'gl': 'Galician',
    'gom': 'Konkani',
    'kok': 'Konkani (Goan)',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hne': 'Chhattisgarhi',
    'hr': 'Croatian',
    'hsb': 'Upper Sorbian',
    'hu': 'Hungarian',
    'hy': 'Armenian',
    'ig': 'Igbo',
    'ikt': 'Inuinnaqtun',
    'id': 'Indonesian',
    'ga': 'Irish',
    'is': 'Icelandic',
    'it': 'Italian',
    'iu-latn': 'Inuktitut (Latin)',
    'iu': 'Inuktitut',
    'jv': 'basa Djawa',
    'ja': 'Japanese',
    'ks': 'Kashmiri',
    'ka': 'Georgian',
    'kn': 'Kannada',
    'kha': 'Khasi',
    'km': 'Khmer',
    'rw': 'Kinyarwanda',
    'kk': 'Kazakh',
    'kmr': 'Kurdish (Northern)',
    'ko': 'Korean',
    'ku': 'Kurdish (Central)',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lb': 'Luxembourgish',
    'ln': 'Lingala',
    'lt': 'Lithuanian',
    'lg': 'Ganda',
    'luo': 'Dholuo',
    'lus': 'Mizo',
    'lv': 'Latvian',
    'lzh': 'Chinese (Literary)',
    'mag': 'Magahi',
    'mai': 'Maithili',
    'mr': 'Marathi',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'mt': 'Maltese',
    'mn-mong': 'Mongolian (Traditional)',
    'mni': 'Manipuri',
    'mn-cyrl': 'Mongolian (Cyrillic)',
    'mi': 'Māori',
    'ms': 'Malay',
    'mww': 'Hmong Daw',
    'my': 'Myanmar (Burmese)',
    'ml': 'Malayalam',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'nb': 'Norwegian',
    'nso': 'Sesotho sa Leboa',
    'nya': 'Nyanja',
    'oc': 'Occitan',
    'or': 'Odia',
    'otq': 'Querétaro Otomi',
    'pa': 'Punjabi',
    'ps': 'Pashto',
    'pl': 'Polish',
    'prs': 'Dari',
    'pt': 'Portuguese (Brazil)',
    'pt-pt': 'Portuguese (Portugal)',
    'ro': 'Romanian',
    'run': 'Rundi',
    'ru': 'Russian',
    'sa': 'Sanskrit',
    'sat': 'Santali',
    'si': 'Sinhala',
    'sd': 'Sindhi',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'sm': 'Samoan',
    'sn': 'Shona',
    'so': 'Somali',
    'st': 'Sesotho',
    'sq': 'Albanian',
    'sr-latn': 'Serbian (Latin)',
    'sr-cyrl': 'Serbian (Cyrillic)',
    'su': 'Sundanese',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'ty': 'Tahitian',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'te': 'Telugu',
    'tet': 'Tetum',
    'th': 'Thai',
    'ti': 'Tigrinya',
    'tlh-latn': 'Klingon (Latin)',
    'to': 'Tongan',
    'tr': 'Turkish',
    'tn': 'Setswana',
    'tt': 'Tatar',
    'tk': 'Turkmen',
    'ug': 'Uyghur',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'uz': 'Uzbek (Latin)',
    'vi': 'Vietnamese',
    'xh': 'Xhosa',
    'yo': 'Yoruba',
    'yua': 'Yucatec Maya',
    'yue': 'Cantonese (Traditional)',
    'zu': 'Zulu'
};

async function copyToClipboard(text) {
    await navigator.clipboard.writeText(text);
}

class E2EPlayground {
    constructor() {
        this.activeTab = 'prompt';

        this.tabState = Object.fromEntries(
            Object.entries(DEFAULTS).map(([key, defaults]) => [
                key,
                { system: defaults.system, input: defaults.input }
            ])
        );

        this.stageOutputs = {
            lid: '',
            proofreader: '',
            summarizer: '',
            rewriter: '',
            writer: '',
            prompt: '',
            tools: '',
            decisions: '',
            translator: ''
        };
        this.detectedLanguageCode = 'en';

        this.promptSession = null;
        this.toolsSession = null;
        this.summarizerSession = null;
        this.writerSession = null;
        this.rewriterSession = null;
        this.proofreader = null;
        this.decisionsSession = null;

        this.translatorSession = null;
        this.languageDetector = null;

        this.currentStream = null;
        this.currentAbortController = null;

        this.translateStream = null;
        this.translateAbortController = null;

        this.lastOutput = '';
        this.lastError = null;

        this.init();
    }

    init() {
        this.setupLanguageSelectors();
        this.wireTabs();
        this.wireButtons();
        this.wireTranslateMode();
        this.wirePerTabState();
        this.loadTabState('prompt', { force: true });
        this.updateInputCounter();
        this.refreshAvailability();
    }

    setupLanguageSelectors() {
        const languages = [
            { code: 'auto', name: 'Auto detect' },
            ...Object.entries(LANGUAGE_NAMES)
                .map(([code, name]) => ({ code, name }))
                .sort((a, b) => a.name.localeCompare(b.name))
        ];

        if ($('sourceLanguageSearch') && $('sourceLanguageDropdown') && $('sourceLanguage')) {
            this.sourceLanguageSelect = new SearchableLanguageSelect(
                'sourceLanguageSearch',
                'sourceLanguageDropdown',
                'sourceLanguage',
                languages,
                $('sourceLanguage')?.value || 'auto'
            );
        }

        if ($('targetLanguageSearch') && $('targetLanguageDropdown') && $('targetLanguage')) {
            this.targetLanguageSelect = new SearchableLanguageSelect(
                'targetLanguageSearch',
                'targetLanguageDropdown',
                'targetLanguage',
                languages.filter(l => l.code !== 'auto'),
                $('targetLanguage')?.value || 'es'
            );
        }
    }

    updateInputCounter() {
        const text = ($('inputText')?.value || '');
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        setTextIfPresent('inputCounter', `${text.length} chars · ${words} words`);
    }

    applyPreset(presetKey) {
        const preset = PRESETS[presetKey];
        if (!preset || !$('inputText')) return;
        $('inputText').value = preset.text;
        this.updateInputCounter();
    }

    wirePerTabState() {
        $('systemPrompt')?.addEventListener('input', () => {
            if (!this.tabState[this.activeTab]) this.tabState[this.activeTab] = { system: '', input: '' };
            this.tabState[this.activeTab].system = $('systemPrompt').value;
        });

        $('inputText')?.addEventListener('input', () => {
            if (!this.tabState[this.activeTab]) this.tabState[this.activeTab] = { system: '', input: '' };
            this.tabState[this.activeTab].input = $('inputText').value;
            this.updateInputCounter();
        });
    }

    wireTabs() {
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTab(btn.dataset.tab);
            });
        });
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyPreset(btn.dataset.preset);
            });
        });
    }

    wireButtons() {
        $('runBtn')?.addEventListener('click', () => this.runAllPipeline());
        $('stopBtn')?.addEventListener('click', () => this.stopTask());
        $('clearBtn')?.addEventListener('click', () => this.clearAll());
        $('copyAllReportBtn')?.addEventListener('click', () => this.copyFullReport());

        $('dismissError')?.addEventListener('click', () => this.clearError());

        $('copyOutput')?.addEventListener('click', async () => {
            await copyToClipboard(this.stageOutputs.prompt || this.lastOutput);
        });

        $('detectLangBtn')?.addEventListener('click', () => this.runStage('lid'));
        $('runProofreaderBtn')?.addEventListener('click', () => this.runStage('proofreader'));
        $('runSummarizerBtn')?.addEventListener('click', () => this.runStage('summarizer'));
        $('runRewriterBtn')?.addEventListener('click', () => this.runStage('rewriter'));
        $('runWriterBtn')?.addEventListener('click', () => this.runStage('writer'));
        $('runPromptBtn')?.addEventListener('click', () => this.runStage('prompt'));
        $('runToolsBtn')?.addEventListener('click', () => this.runStage('tools'));
        $('runDecisionsBtn')?.addEventListener('click', () => this.runStage('decisions'));
        $('decisionsPreset')?.addEventListener('change', () => {
            const preset = DECISION_SCHEMAS[$('decisionsPreset').value];
            if (preset && $('decisionsContext')) {
                $('decisionsContext').value = preset.context;
            }
        });

        $('translateBtn')?.addEventListener('click', () => this.runStage('translator'));
        $('stopTranslateBtn')?.addEventListener('click', () => this.stopTranslate());

        $('copyTranslated')?.addEventListener('click', async () => {
            await copyToClipboard($('translatedOutput')?.textContent || '');
        });

        document.querySelectorAll('.copy-stage-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const stage = btn.dataset.stage;
                const text = this.stageOutputs[stage] || '';
                if (text) await copyToClipboard(text);
            });
        });

        document.querySelectorAll('.use-as-input-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const stage = btn.dataset.stage;
                const text = this.stageOutputs[stage] || '';
                if (text && $('inputText')) {
                    $('inputText').value = text;
                    this.updateInputCounter();
                }
            });
        });
    }

    wireTranslateMode() {
        $('translateMode')?.addEventListener('change', () => {
            if ($('segmentOptions')) {
                $('segmentOptions').style.display = $('translateMode').value === 'segmented' ? 'grid' : 'none';
            }
        });
    }

    setActiveTab(tab) {
        this.activeTab = tab;
    }

    saveActiveTabState() {}
    showOptionsForTab() {}

    loadTabState(tab) {
        const defaults = DEFAULTS[tab];
        if (!defaults) return;
        if ($('systemPrompt') && !$('systemPrompt').value) $('systemPrompt').value = defaults.system;
        if ($('inputText') && !$('inputText').value) $('inputText').value = defaults.input;
        setTextIfPresent('inputHint', defaults.inputHint);
    }

    setStageStatus(stage, statusText, stateClass = '') {
        const el = $(`status-${stage}`);
        if (!el) return;
        el.textContent = statusText;
        el.className = `stage-status${stateClass ? ' ' + stateClass : ''}`;
    }

    setStageOutput(stage, text) {
        const val = safeText(text);
        this.stageOutputs[stage] = val;
        if (stage === 'prompt') {
            this.lastOutput = val;
            setTextIfPresent('modelOutput', val);
            if ($('copyOutput')) $('copyOutput').disabled = !val;
        } else if (stage === 'translator') {
            setTextIfPresent('translatedOutput', val);
            if ($('copyTranslated')) $('copyTranslated').disabled = !val;
        } else if (stage === 'lid') {
            setTextIfPresent('lidOutput', val);
        } else {
            setTextIfPresent(`output-${stage}`, val);
        }
        document.querySelectorAll(`[data-stage="${stage}"]`).forEach(btn => {
            btn.disabled = !val;
        });
        const anyOutput = Object.values(this.stageOutputs).some(Boolean);
        if ($('copyAllReportBtn')) $('copyAllReportBtn').disabled = !anyOutput;
    }

    updateStageStats(stage, chars, startMs, chunks) {
        const elapsedMs = Math.max(1, Math.round(nowMs() - startMs));
        if (stage === 'prompt') {
            this.updateStats(chars, startMs, chunks);
            return;
        }
        setTextIfPresent(`statChars-${stage}`, String(chars));
        setTextIfPresent(`statTime-${stage}`, String(elapsedMs));
        setTextIfPresent(`statChunks-${stage}`, String(chunks));
        setTextIfPresent(`statThroughput-${stage}`, String(calcThroughput(chars, elapsedMs)));
    }

    clearAll() {
        Object.keys(this.stageOutputs).forEach(stage => {
            this.setStageOutput(stage, '');
            this.setStageStatus(stage, 'Idle');
            setTextIfPresent(`statChars-${stage}`, '0');
            setTextIfPresent(`statTime-${stage}`, '0');
            setTextIfPresent(`statChunks-${stage}`, '0');
            setTextIfPresent(`statThroughput-${stage}`, '0');
        });
        setTextIfPresent('lidOutput', 'Run pipeline to detect language…');
        setTextIfPresent('lidPrimary', '-');
        setTextIfPresent('lidConfidence', '-');
        setTextIfPresent('lidTime', '0');

        if ($('proofDetails')) {
            $('proofDetails').style.display = 'none';
            $('proofDetails').innerHTML = '';
        }
        if ($('decisionsDetails')) {
            $('decisionsDetails').style.display = 'none';
            $('decisionsDetails').innerHTML = '';
        }
        setTextIfPresent('decisionsPrimary', '-');
        setTextIfPresent('decisionsScore', '-');
        if ($('toolsDetails')) {
            $('toolsDetails').style.display = 'none';
            $('toolsDetails').innerHTML = '';
        }
        setTextIfPresent('toolsPrimary', '-');
        setTextIfPresent('toolsTurns', '0');

        setTextIfPresent('detectedLang', '-');
        setTextIfPresent('translateDetectedLang', '-');
        setTextIfPresent('translateSegments', '-');
        setTextIfPresent('translateTime', '0');
        setTextIfPresent('translateThroughput', '0');
        setTextIfPresent('pipelineStatus', 'Ready');
        setTextIfPresent('pipelineStagesDone', '0 / 0');
        setTextIfPresent('pipelineTotalTime', '0');

        this.clearError();
        this.resetStats();
    }

    resetStats() {
        setTextIfPresent('statChars', '0');
        setTextIfPresent('statTime', '0');
        setTextIfPresent('statChunks', '0');
        setTextIfPresent('statThroughput', '0');
    }

    setOutput(text) {
        this.setStageOutput('prompt', text);
    }

    setProgress(show, loaded = 0) {
        if (!$('downloadProgress')) return;
        $('downloadProgress').style.display = show ? 'block' : 'none';
        const percent = Math.max(0, Math.min(100, Math.round(loaded * 100)));
        if ($('progressFill')) $('progressFill').style.width = `${percent}%`;
        setTextIfPresent('progressText', `${percent}%`);
    }

    /**
     * When the page loads and the model is already downloading (started by a
     * previous page/session), eagerly create a Prompt API session so the
     * monitor callback can report byte-level progress.  If user-activation is
     * still required the browser will throw – we catch that and let the
     * availability text serve as the fallback indicator.
     */
    async monitorOngoingPromptDownload() {
        try {
            const sys = DEFAULTS.prompt.system || '';
            await this.getOrCreatePromptSession(sys);
            // Session created – monitor callback is now attached and will
            // call setProgress() as download events arrive.
        } catch (e) {
            console.log('Could not attach progress monitor for ongoing download:', e.message);
            // Fall back: progress bar stays at 0 %; availability polling will
            // flip the label to "Available" once the download finishes.
        }
    }

    formatError(err, context = '') {
        const timestamp = new Date().toISOString();
        const ctx = context ? `[${context}] ` : '';

        const e = err && err.error ? err.error : err;
        const message = e && e.message ? e.message : (typeof e === 'string' ? e : (err && err.message ? err.message : String(err)));
        const stack = e && e.stack ? String(e.stack) : '';

        let details = '';
        if (stack) {
            details = stack;
        } else {
            // Give devs something actionable even without stack.
            try {
                details = JSON.stringify(e, Object.getOwnPropertyNames(e), 2);
            } catch {
                details = String(e);
            }
        }

        return {
            timestamp,
            message: `${ctx}${message}`,
            details
        };
    }

    showError(err, context = '', { title = 'Error' } = {}) {
        try {
            const banner = document.getElementById('errorBanner');
            const titleEl = document.getElementById('errorTitle');
            const msg = document.getElementById('errorMsg');
            const details = document.getElementById('errorDetails');
            if (!banner || !msg || !details) return;

            const formatted = this.formatError(err, context);
            this.lastError = formatted;

            banner.style.display = 'block';
            if (titleEl) titleEl.textContent = title;
            msg.textContent = `${formatted.message}`;
            details.textContent = `${formatted.timestamp}\n${formatted.details || ''}`.trim();
        } catch {
            // Never let error reporting cause additional failures.
        }
    }

    clearError() {
        const banner = document.getElementById('errorBanner');
        const titleEl = document.getElementById('errorTitle');
        const msg = document.getElementById('errorMsg');
        const details = document.getElementById('errorDetails');
        if (banner) banner.style.display = 'none';
        if (titleEl) titleEl.textContent = 'Error';
        if (msg) msg.textContent = '';
        if (details) details.textContent = '';
        this.lastError = null;
    }

    async refreshAvailability() {
        await Promise.all([
            this.updatePromptAvailability(),
            this.updateToolsAvailability(),
            this.updateWritingAvailability('Summarizer', 'summarizer'),
            this.updateWritingAvailability('Writer', 'writer'),
            this.updateWritingAvailability('Rewriter', 'rewriter'),
            this.updateProofreaderAvailability(),
            this.updateDecisionsAvailability(),
            this.updateTranslatorAvailability(),
            this.updateLIDAvailability()
        ]);
    }

    async updateToolsAvailability() {
        if (!('LanguageModel' in window)) {
            setSupportBadge('supportTools', 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const lm = window.LanguageModel;
            const status = await lm.availability({
                expectedInputs: [{ type: 'tool-response' }],
                expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }]
            });
            if (status === 'available' || status === 'readily') {
                setSupportBadge('supportTools', 'Available', 'is-available');
            } else if (status === 'downloadable' || status === 'downloading' || status === 'after-download') {
                setSupportBadge('supportTools', 'Downloadable', 'is-downloadable');
            } else {
                setSupportBadge('supportTools', safeText(status) || 'Unavailable', 'is-unavailable');
            }
        } catch {
            setSupportBadge('supportTools', 'Unavailable', 'is-unavailable');
        }
    }

    async updatePromptAvailability() {
        const has = 'LanguageModel' in window;
        if (!has) {
            setSupportBadge('supportPrompt', 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const lm = window.LanguageModel;
            const outputLanguage = 'en';
            const availabilityOptions = {
                expectedOutputs: [{ type: 'text', languages: [outputLanguage] }]
            };

            const info = lm.capabilities
                ? await lm.capabilities(availabilityOptions)
                : await lm.availability(availabilityOptions);
            const state = typeof info === 'string' ? info : (info && info.available ? info.available : 'unknown');

            if (state === 'available' || state === 'readily') {
                setSupportBadge('supportPrompt', 'Available', 'is-available');
            } else if (state === 'downloading') {
                setSupportBadge('supportPrompt', 'Downloading', 'is-downloadable');
                this.setProgress(true, 0);
                this.monitorOngoingPromptDownload();
            } else if (state === 'downloadable' || state === 'after-download') {
                setSupportBadge('supportPrompt', 'Downloadable', 'is-downloadable');
            } else {
                setSupportBadge('supportPrompt', safeText(state) || 'Unknown');
            }
        } catch {
            setSupportBadge('supportPrompt', 'Unknown');
        }
    }

    async updateWritingAvailability(globalName, key) {
        const supportId = key === 'summarizer'
            ? 'supportSummarizer'
            : key === 'writer'
                ? 'supportWriter'
                : 'supportRewriter';

        if (!(globalName in window)) {
            setSupportBadge(supportId, 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const api = window[globalName];
            const availability = await api.availability();
            if (availability === 'available' || availability === 'readily') {
                setSupportBadge(supportId, 'Available', 'is-available');
            } else if (availability === 'downloadable' || availability === 'downloading' || availability === 'after-download') {
                setSupportBadge(supportId, 'Downloadable', 'is-downloadable');
            } else if (availability === 'unavailable' || availability === 'no') {
                setSupportBadge(supportId, 'Unavailable', 'is-unavailable');
            } else {
                setSupportBadge(supportId, safeText(availability) || 'Unknown');
            }
        } catch {
            setSupportBadge(supportId, 'Unknown');
        }
    }

    async updateDecisionsAvailability() {
        if (!('DecisionModel' in window)) {
            setSupportBadge('supportDecisions', 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const api = window.DecisionModel;
            if (typeof api.availability === 'function') {
                const a = await api.availability();
                if (a === 'available' || a === 'readily') {
                    setSupportBadge('supportDecisions', 'Available', 'is-available');
                } else if (a === 'downloadable' || a === 'downloading' || a === 'after-download') {
                    setSupportBadge('supportDecisions', 'Downloadable', 'is-downloadable');
                } else if (a === 'unavailable' || a === 'no') {
                    setSupportBadge('supportDecisions', 'Unavailable', 'is-unavailable');
                } else {
                    setSupportBadge('supportDecisions', safeText(a) || 'Unknown');
                }
            } else {
                setSupportBadge('supportDecisions', 'Present', 'is-available');
            }
        } catch {
            setSupportBadge('supportDecisions', 'Unknown');
        }
    }

    async updateProofreaderAvailability() {
        if (!('Proofreader' in window)) {
            setSupportBadge('supportProofreader', 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const api = window.Proofreader;
            if (typeof api.availability === 'function') {
                const a = await api.availability();
                const cls = (a === 'available' || a === 'readily') ? 'is-available'
                    : (a === 'downloadable' || a === 'after-download') ? 'is-downloadable' : '';
                setSupportBadge('supportProofreader', safeText(a) || 'Unknown', cls);
            } else {
                setSupportBadge('supportProofreader', 'Present', 'is-available');
            }
        } catch {
            setSupportBadge('supportProofreader', 'Unknown');
        }
    }

    async updateTranslatorAvailability() {
        if (!('Translator' in window)) {
            setSupportBadge('supportTranslator', 'Not supported', 'is-unavailable');
            return;
        }
        setSupportBadge('supportTranslator', 'Available', 'is-available');
    }

    async updateLIDAvailability() {
        if (!('LanguageDetector' in window)) {
            setSupportBadge('supportLID', 'Not supported', 'is-unavailable');
            return;
        }

        try {
            const api = window.LanguageDetector;
            if (typeof api.availability === 'function') {
                const a = await api.availability();
                if (a === 'readily' || a === 'available') {
                    setSupportBadge('supportLID', 'Available', 'is-available');
                } else if (a === 'after-download' || a === 'downloadable' || a === 'downloading') {
                    setSupportBadge('supportLID', 'Downloadable', 'is-downloadable');
                } else if (a === 'no' || a === 'unavailable') {
                    setSupportBadge('supportLID', 'Unavailable', 'is-unavailable');
                } else {
                    setSupportBadge('supportLID', safeText(a) || 'Unknown');
                }
            } else {
                setSupportBadge('supportLID', 'Present', 'is-available');
            }
        } catch {
            setSupportBadge('supportLID', 'Unknown');
        }
    }

    setBusy(isBusy) {
        if ($('runBtn')) $('runBtn').disabled = isBusy;
        if ($('stopBtn')) $('stopBtn').disabled = !isBusy;
    }

    stopTask() {
        if (this.currentAbortController) {
            try { this.currentAbortController.abort(); } catch { /* noop */ }
        }

        if (this.currentStream) {
            try {
                if (this.currentStream.controller && this.currentStream.controller.abort) {
                    this.currentStream.controller.abort();
                }
            } catch { /* noop */ }
        }

        this.stopTranslate();
        this.currentAbortController = null;
        this.currentStream = null;
        this.setBusy(false);
        setTextIfPresent('pipelineStatus', 'Stopped');
    }

    getEffectiveInputText(stage) {
        const rawInput = ($('inputText')?.value || '').trim();
        const chainProofread = $('chainProofread')?.checked;
        if (chainProofread && stage !== 'lid' && stage !== 'proofreader' && this.stageOutputs.proofreader) {
            return this.stageOutputs.proofreader;
        }
        return rawInput;
    }

    async runStage(stage, sharedSignal = null) {
        const rawInput = ($('inputText')?.value || '').trim();
        if (!rawInput) {
            this.showError(new Error('Please enter source text first.'), 'Input');
            return false;
        }

        const singleRun = !sharedSignal;
        if (singleRun) {
            this.clearError();
            this.currentAbortController = new AbortController();
            sharedSignal = this.currentAbortController.signal;
            this.setBusy(true);
        }

        const start = nowMs();
        this.setStageStatus(stage, 'Running…', 'is-running');

        try {
            if (stage === 'lid') {
                const detector = await this.ensureLanguageDetector();
                if (!detector) {
                    this.setStageStatus('lid', 'Unavailable', 'is-error');
                    this.setStageOutput('lid', 'Language Detector API is not available in this browser.');
                    return false;
                }
                const results = await detector.detect(rawInput);
                const elapsed = Math.max(1, Math.round(nowMs() - start));
                setTextIfPresent('lidTime', String(elapsed));
                if (!results || !results.length) {
                    this.setStageStatus('lid', 'Done', 'is-done');
                    this.setStageOutput('lid', 'No language candidates returned.');
                    return true;
                }
                const best = results[0];
                const code = best.detectedLanguage || best.language || best.code || 'en';
                const pct = best.confidence !== undefined ? `${Math.round(best.confidence * 100)}%` : '-';
                this.detectedLanguageCode = code;
                const langName = LANGUAGE_NAMES[code] || code;
                setTextIfPresent('lidPrimary', `${langName} (${code})`);
                setTextIfPresent('lidConfidence', pct);
                setTextIfPresent('detectedLang', `${code} (${pct})`);
                const topList = results.slice(0, 4).map(r => {
                    const c = r.detectedLanguage || r.language || r.code;
                    const p = r.confidence !== undefined ? `${(r.confidence * 100).toFixed(1)}%` : '';
                    return `${LANGUAGE_NAMES[c] || c} [${c}]: ${p}`;
                }).join('\n');
                this.setStageOutput('lid', topList);
                this.setStageStatus('lid', 'Done', 'is-done');
                return true;
            }

            if (stage === 'proofreader') {
                if ($('proofDetails')) {
                    $('proofDetails').style.display = 'none';
                    $('proofDetails').innerHTML = '';
                }
                const expectedInputLanguages = await this.getExpectedProofreaderLanguages(rawInput);
                const proofreader = await this.getOrCreateProofreader(expectedInputLanguages);
                if (!proofreader) {
                    this.setStageStatus('proofreader', 'Unavailable', 'is-error');
                    this.setStageOutput('proofreader', 'Proofreader API is not available in this browser.');
                    return false;
                }
                const result = await proofreader.proofread(rawInput);
                const output = result.correctedInput || result.correction || rawInput;
                const correctionsCount = result?.corrections?.length ?? 0;
                this.setStageOutput('proofreader', output);
                this.updateStageStats('proofreader', output.length, start, correctionsCount);
                this.renderProofDetails(result);
                this.setStageStatus('proofreader', 'Done', 'is-done');
                return true;
            }

            if (stage === 'summarizer') {
                const input = this.getEffectiveInputText('summarizer');
                const session = await this.getOrCreateSummarizerSession();
                if (!session) {
                    this.setStageStatus('summarizer', 'Unavailable', 'is-error');
                    this.setStageOutput('summarizer', 'Summarizer API is not available in this browser.');
                    return false;
                }
                let output = '';
                let chunks = 0;
                if (session.summarizeStreaming) {
                    const stream = session.summarizeStreaming(input, { signal: sharedSignal });
                    this.currentStream = stream;
                    for await (const chunk of stream) {
                        output += chunk;
                        chunks++;
                        this.setStageOutput('summarizer', output);
                        this.updateStageStats('summarizer', output.length, start, chunks);
                    }
                } else {
                    output = await session.summarize(input, { signal: sharedSignal });
                    chunks = 1;
                    this.setStageOutput('summarizer', output);
                    this.updateStageStats('summarizer', output.length, start, chunks);
                }
                this.setStageStatus('summarizer', 'Done', 'is-done');
                return true;
            }

            if (stage === 'rewriter') {
                const input = this.getEffectiveInputText('rewriter');
                const session = await this.getOrCreateRewriterSession();
                if (!session) {
                    this.setStageStatus('rewriter', 'Unavailable', 'is-error');
                    this.setStageOutput('rewriter', 'Rewriter API is not available in this browser.');
                    return false;
                }
                let output = '';
                let chunks = 0;
                if (session.rewriteStreaming) {
                    const stream = session.rewriteStreaming(input, { signal: sharedSignal });
                    this.currentStream = stream;
                    for await (const chunk of stream) {
                        output += chunk;
                        chunks++;
                        this.setStageOutput('rewriter', output);
                        this.updateStageStats('rewriter', output.length, start, chunks);
                    }
                } else {
                    output = await session.rewrite(input, { signal: sharedSignal });
                    chunks = 1;
                    this.setStageOutput('rewriter', output);
                    this.updateStageStats('rewriter', output.length, start, chunks);
                }
                this.setStageStatus('rewriter', 'Done', 'is-done');
                return true;
            }

            if (stage === 'writer') {
                const baseInput = this.getEffectiveInputText('writer');
                const directive = ($('writerTaskPrompt')?.value || '').trim();
                const writerInput = directive ? `${directive}\n\n${baseInput}` : baseInput;
                const session = await this.getOrCreateWriterSession();
                if (!session) {
                    this.setStageStatus('writer', 'Unavailable', 'is-error');
                    this.setStageOutput('writer', 'Writer API is not available in this browser.');
                    return false;
                }
                let output = '';
                let chunks = 0;
                if (session.writeStreaming) {
                    const stream = session.writeStreaming(writerInput, { signal: sharedSignal });
                    this.currentStream = stream;
                    for await (const chunk of stream) {
                        output += chunk;
                        chunks++;
                        this.setStageOutput('writer', output);
                        this.updateStageStats('writer', output.length, start, chunks);
                    }
                } else {
                    output = await session.write(writerInput, { signal: sharedSignal });
                    chunks = 1;
                    this.setStageOutput('writer', output);
                    this.updateStageStats('writer', output.length, start, chunks);
                }
                this.setStageStatus('writer', 'Done', 'is-done');
                return true;
            }

            if (stage === 'prompt') {
                const input = this.getEffectiveInputText('prompt');
                const systemPrompt = ($('systemPrompt')?.value || '').trim();
                const session = await this.getOrCreatePromptSession(systemPrompt);
                if (!session) {
                    this.setStageStatus('prompt', 'Unavailable', 'is-error');
                    this.setStageOutput('prompt', 'Prompt API (LanguageModel) is not available in this browser.');
                    return false;
                }
                let output = '';
                let chunks = 0;
                if (session.promptStreaming) {
                    let stream;
                    try {
                        stream = session.promptStreaming(input, { signal: sharedSignal });
                    } catch {
                        stream = session.promptStreaming(input);
                    }
                    this.currentStream = stream;
                    for await (const chunk of stream) {
                        output += chunk;
                        chunks++;
                        this.setStageOutput('prompt', output);
                        this.updateStageStats('prompt', output.length, start, chunks);
                    }
                } else {
                    output = await session.prompt(input, { signal: sharedSignal });
                    chunks = 1;
                    this.setStageOutput('prompt', output);
                    this.updateStageStats('prompt', output.length, start, chunks);
                }
                this.setStageStatus('prompt', 'Done', 'is-done');
                return true;
            }

            if (stage === 'tools') {
                if ($('toolsDetails')) {
                    $('toolsDetails').style.display = 'none';
                    $('toolsDetails').innerHTML = '';
                }
                const input = this.getEffectiveInputText('tools');
                const mode = $('toolsMode')?.value || 'multi_turn';
                const directive = ($('toolsDirective')?.value || '').trim();
                const session = await this.getOrCreateToolsSession();
                if (!session) {
                    this.setStageStatus('tools', 'Unavailable', 'is-error');
                    this.setStageOutput('tools', 'Prompt API Tool Calling is not available in this browser.');
                    return false;
                }

                const turn1Prompt = directive ? `${directive}\n\nInput:\n${input}` : input;
                const turns = [];
                turns.push(await this.executeToolTurnOnSession(session, turn1Prompt, 1));

                if (mode === 'multi_turn') {
                    const turn2Prompt = 'Now also check the weather in London and the local time in Dublin using your tools.';
                    turns.push(await this.executeToolTurnOnSession(session, turn2Prompt, 2));
                }

                const allToolCalls = turns.flatMap(t => t.toolCalls);
                const toolNames = allToolCalls.map(tc => tc.name);
                const hasLeak = turns.some(t => t.leakedDelimiter);

                setTextIfPresent('toolsPrimary', toolNames.length ? toolNames.join(', ') : 'None');
                setTextIfPresent('toolsTurns', String(turns.length));

                const formattedLines = turns.map(t => {
                    const callSummary = t.toolCalls.map(tc => `${tc.name}(${JSON.stringify(tc.arguments)})`).join(', ') || 'none';
                    return `[Turn ${t.turn}] Tools (${t.toolCalls.length}): ${callSummary}\nAnswer: ${t.finalAnswer}`;
                });
                const outputText = formattedLines.join('\n\n');
                this.setStageOutput('tools', outputText);
                this.updateStageStats('tools', outputText.length, start, allToolCalls.length);
                this.renderToolsDetails(turns);
                this.setStageStatus('tools', hasLeak ? 'Warning' : 'Done', hasLeak ? 'is-error' : 'is-done');
                return !hasLeak;
            }

            if (stage === 'decisions') {
                if ($('decisionsDetails')) {
                    $('decisionsDetails').style.display = 'none';
                    $('decisionsDetails').innerHTML = '';
                }
                const input = this.getEffectiveInputText('decisions');
                const session = await this.getOrCreateDecisionsSession();
                if (!session) {
                    this.setStageStatus('decisions', 'Unavailable', 'is-error');
                    this.setStageOutput('decisions', 'Decisions API (DecisionModel) is not available in this browser.');
                    return false;
                }
                const result = await session.decide(input);
                const entries = Object.entries(result || {});
                const summaryParts = [];
                let expectedScoreText = '-';
                const formattedLines = [];

                for (const [qId, dec] of entries) {
                    const confPct = typeof dec.confidence === 'number' ? `${(dec.confidence * 100).toFixed(1)}%` : '-';
                    summaryParts.push(`${qId}: ${dec.label} (${confPct})`);
                    if (typeof dec.expectedScore === 'number') {
                        expectedScoreText = `${qId} = ${dec.expectedScore.toFixed(2)}`;
                    }
                    const scoreSuffix = typeof dec.expectedScore === 'number' ? ` | expectedScore=${dec.expectedScore.toFixed(2)}` : '';
                    formattedLines.push(`${qId}: ${dec.label} (confidence ${confPct}${scoreSuffix})`);
                }

                setTextIfPresent('decisionsPrimary', summaryParts.join(' · ') || '-');
                setTextIfPresent('decisionsScore', expectedScoreText);
                const outputText = formattedLines.join('\n');
                this.setStageOutput('decisions', outputText);
                this.updateStageStats('decisions', outputText.length, start, entries.length);
                this.renderDecisionsDetails(result);
                this.setStageStatus('decisions', 'Done', 'is-done');
                return true;
            }

            if (stage === 'translator') {
                await this.translateOutput();
                return true;
            }

            return false;
        } catch (e) {
            const message = e && e.message ? e.message : String(e);
            this.setStageStatus(stage, 'Error', 'is-error');
            this.setStageOutput(stage, `Error: ${message}`);
            return false;
        } finally {
            if (singleRun) {
                this.currentStream = null;
                this.currentAbortController = null;
                this.setBusy(false);
            }
        }
    }

    async runAllPipeline() {
        const inputText = ($('inputText')?.value || '').trim();
        if (!inputText) {
            this.showError(new Error('Please enter source text first.'), 'Pipeline');
            return;
        }

        const stageConfig = [
            { id: 'lid', checkbox: 'enableLid' },
            { id: 'proofreader', checkbox: 'enableProofreader' },
            { id: 'summarizer', checkbox: 'enableSummarizer' },
            { id: 'rewriter', checkbox: 'enableRewriter' },
            { id: 'writer', checkbox: 'enableWriter' },
            { id: 'prompt', checkbox: 'enablePrompt' },
            { id: 'tools', checkbox: 'enableTools' },
            { id: 'decisions', checkbox: 'enableDecisions' },
            { id: 'translator', checkbox: 'enableTranslator' }
        ];

        const enabledStages = stageConfig
            .filter(s => !$(s.checkbox) || $(s.checkbox).checked)
            .map(s => s.id);

        if (!enabledStages.length) {
            this.showError(new Error('Enable at least one API stage to run the pipeline.'), 'Pipeline');
            return;
        }

        this.clearError();
        this.setBusy(true);
        this.currentAbortController = new AbortController();
        const signal = this.currentAbortController.signal;

        const pipelineStart = nowMs();
        let completed = 0;
        setTextIfPresent('pipelineStatus', 'Running…');
        setTextIfPresent('pipelineStagesDone', `0 / ${enabledStages.length}`);

        stageConfig.forEach(s => {
            if (!enabledStages.includes(s.id)) {
                this.setStageStatus(s.id, 'Skipped');
            } else {
                this.setStageStatus(s.id, 'Queued');
            }
        });

        try {
            for (const stage of enabledStages) {
                if (signal.aborted) break;
                setTextIfPresent('pipelineStatus', `Running ${stage}…`);
                await this.runStage(stage, signal);
                completed++;
                setTextIfPresent('pipelineStagesDone', `${completed} / ${enabledStages.length}`);
                setTextIfPresent('pipelineTotalTime', String(Math.round(nowMs() - pipelineStart)));
            }
            if (!signal.aborted) {
                setTextIfPresent('pipelineStatus', 'Complete');
            }
        } finally {
            this.currentStream = null;
            this.currentAbortController = null;
            this.setBusy(false);
        }
    }

    async runTask() {
        await this.runAllPipeline();
    }

    async copyFullReport() {
        const input = ($('inputText')?.value || '').trim();
        const lines = [
            'Built-in AI End-to-End Pipeline Report',
            '═'.repeat(50),
            `Input (${input.length} chars):`,
            input,
            ''
        ];
        for (const [stage, label] of [
            ['lid', 'Language Detector'],
            ['proofreader', 'Proofreader'],
            ['summarizer', 'Summarizer'],
            ['rewriter', 'Rewriter'],
            ['writer', 'Writer'],
            ['prompt', 'Prompt API'],
            ['tools', 'Tool Calling'],
            ['decisions', 'Decisions API'],
            ['translator', 'Translator']
        ]) {
            if (this.stageOutputs[stage]) {
                lines.push(`── ${label} ──`, this.stageOutputs[stage], '');
            }
        }
        await copyToClipboard(lines.join('\n'));
    }

    updateStats(chars, startMs, chunks) {
        const elapsedMs = Math.max(1, Math.round(nowMs() - startMs));
        $('statChars').textContent = String(chars);
        $('statTime').textContent = String(elapsedMs);
        $('statChunks').textContent = String(chunks);
        $('statThroughput').textContent = String(calcThroughput(chars, elapsedMs));
    }

    async getOrCreatePromptSession(systemPrompt) {
        if (!('LanguageModel' in window)) return null;

        const sys = systemPrompt || '';
        const outputLanguage = 'en';

        const key = JSON.stringify({ sys, outputLanguage });
        const needsNew = !this.promptSession || this.promptSession.__key !== key;

        if (!needsNew) return this.promptSession;

        // Destroy previous session if possible.
        if (this.promptSession && this.promptSession.destroy) {
            try { await this.promptSession.destroy(); } catch { /* noop */ }
        }
        this.promptSession = null;

        const lm = window.LanguageModel;

        // temperature/topK are gated behind an origin trial on Chrome's open
        // web Prompt API (and only available in the Extensions variant), so
        // this demo no longer passes them. maxTokens was never part of the
        // spec.
        const config = {
            // Chromium Prompt API expects language via expectedInputs/expectedOutputs.
            expectedInputs: [{ type: 'text', languages: [outputLanguage] }],
            expectedOutputs: [{ type: 'text', languages: [outputLanguage] }],
            // Some builds still look for an explicit outputLanguage field.
            outputLanguage,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    // Edge uses percentage-style progress (loaded 0..1, total 1)
                    if (typeof e.loaded === 'number') {
                        this.setProgress(true, e.loaded);
                    }
                    if (e.total && e.loaded === e.total) {
                        this.setProgress(false);
                    }
                });
            }
        };

        if (sys) {
            config.initialPrompts = [{ role: 'system', content: sys }];
        }

        try {
            let session;
            try {
                session = await lm.create(config);
            } catch (e) {
                // Some builds may not support expectedInputs/expectedOutputs yet.
                const fallback = { ...config };
                delete fallback.expectedInputs;
                delete fallback.expectedOutputs;
                // And some won't accept outputLanguage either.
                // (We keep it in the first attempt because it can suppress browser warnings.)
                try {
                    session = await lm.create(fallback);
                } catch {
                    const fallback2 = { ...fallback };
                    delete fallback2.outputLanguage;
                    session = await lm.create(fallback2);
                }
            }

            session.__key = key;
            this.promptSession = session;
            this.setProgress(false);
            return session;
        } catch (e) {
            // User activation is commonly required for download.
            throw e;
        }
    }

    async getOrCreateSummarizerSession() {
        if (!('Summarizer' in window)) return null;

        const options = {
            type: $('sumType').value,
            length: $('sumLength').value,
            format: $('sumFormat').value,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
                        this.setProgress(true, e.loaded / e.total);
                    }
                    if (e.loaded === e.total) this.setProgress(false);
                });
            }
        };

        const key = JSON.stringify(options);
        if (this.summarizerSession && this.summarizerSession.__key === key) return this.summarizerSession;

        if (this.summarizerSession && this.summarizerSession.destroy) {
            try { await this.summarizerSession.destroy(); } catch { /* noop */ }
        }

        const session = await window.Summarizer.create(options);
        session.__key = key;
        this.summarizerSession = session;
        this.setProgress(false);
        return session;
    }

    async getOrCreateWriterSession() {
        if (!('Writer' in window)) return null;

        const options = {
            tone: $('writerTone').value,
            length: $('writerLength').value,
            format: $('writerFormat').value,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
                        this.setProgress(true, e.loaded / e.total);
                    }
                    if (e.loaded === e.total) this.setProgress(false);
                });
            }
        };

        const key = JSON.stringify(options);
        if (this.writerSession && this.writerSession.__key === key) return this.writerSession;

        if (this.writerSession && this.writerSession.destroy) {
            try { await this.writerSession.destroy(); } catch { /* noop */ }
        }

        const session = await window.Writer.create(options);
        session.__key = key;
        this.writerSession = session;
        this.setProgress(false);
        return session;
    }

    async getOrCreateRewriterSession() {
        if (!('Rewriter' in window)) return null;

        const options = {
            tone: $('rewriterTone').value,
            length: $('rewriterLength').value,
            format: $('rewriterFormat').value,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
                        this.setProgress(true, e.loaded / e.total);
                    }
                    if (e.loaded === e.total) this.setProgress(false);
                });
            }
        };

        const key = JSON.stringify(options);
        if (this.rewriterSession && this.rewriterSession.__key === key) return this.rewriterSession;

        if (this.rewriterSession && this.rewriterSession.destroy) {
            try { await this.rewriterSession.destroy(); } catch { /* noop */ }
        }

        const session = await window.Rewriter.create(options);
        session.__key = key;
        this.rewriterSession = session;
        this.setProgress(false);
        return session;
    }

    parseExpectedLangsFromUI() {
        const raw = ($('proofExpectedLangs')?.value || '').trim();
        if (!raw) return [];
        return raw
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
    }

    async getExpectedProofreaderLanguages(text) {
        const manual = this.parseExpectedLangsFromUI();
        if (manual.length) return manual;

        // Auto-detect via LanguageDetector when possible.
        try {
            const detector = await this.ensureLanguageDetector();
            if (detector) {
                const results = await detector.detect(text);
                if (results && results.length) {
                    const best = results[0];
                    const code = best.detectedLanguage || best.language || best.code;
                    if (code) return [code];
                }
            }
        } catch (e) {
            // If auto-detect fails, fall back without blocking Proofreader.
            console.warn('Proofreader auto-detect failed:', e);
        } finally {
            this.setProgress(false);
        }

        // Conservative fallback.
        return ['en'];
    }

    async getOrCreateProofreader(expectedInputLanguages) {
        if (!('Proofreader' in window)) return null;

        const expected = Array.isArray(expectedInputLanguages) ? expectedInputLanguages : this.parseExpectedLangsFromUI();
        const normalized = (expected.length ? expected : ['en']).map(s => String(s).trim()).filter(Boolean);
        const key = JSON.stringify({ expectedInputLanguages: normalized });

        if (this.proofreader && this.proofreader.__key === key) return this.proofreader;

        if (this.proofreader && this.proofreader.destroy) {
            try { await this.proofreader.destroy(); } catch { /* noop */ }
        }
        this.proofreader = null;
        this.decisionsSession = null;

        const options = {
            expectedInputLanguages: normalized,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number') {
                        // Chrome uses fraction 0..1
                        this.setProgress(true, e.loaded);
                    }
                });
            }
        };

        const pr = await window.Proofreader.create(options);
        pr.__key = key;
        this.proofreader = pr;
        this.setProgress(false);
        return pr;
    }

    renderProofDetails(result) {
        const container = $('proofDetails');
        container.style.display = 'block';

        const corrections = result && result.corrections ? result.corrections : [];
        const corrected = result && (result.correctedInput || result.correction) ? (result.correctedInput || result.correction) : '';

        const heading = document.createElement('h4');
        heading.textContent = `Corrections (${corrections.length})`;

        const summary = document.createElement('div');
        summary.className = 'hint';
        summary.textContent = corrected ? 'Corrected output is shown above. Details below.' : 'No corrected output provided; details below.';

        container.innerHTML = '';
        container.appendChild(heading);
        container.appendChild(summary);

        if (!corrections.length) {
            const p = document.createElement('div');
            p.className = 'hint';
            p.textContent = 'No corrections returned.';
            container.appendChild(p);
            return;
        }

        corrections.slice(0, 30).forEach((c) => {
            const row = document.createElement('div');
            row.className = 'correction';

            const left = document.createElement('div');
            const right = document.createElement('div');

            left.innerHTML = `
        <div><strong>${safeText(c.correctionType || c.type || 'correction')}</strong></div>
        <div class="hint">${safeText(c.explanation || '')}</div>
        <div class="hint">Replace: “${safeText(c.originalText || '')}” → “${safeText(c.replacementText || '')}”</div>
      `;

            right.className = 'hint';
            const idx = (c.startIndex !== undefined && c.endIndex !== undefined)
                ? `${c.startIndex}–${c.endIndex}`
                : '';
            right.textContent = idx;

            row.appendChild(left);
            row.appendChild(right);
            container.appendChild(row);
        });
    }

    async getOrCreateDecisionsSession() {
        if (!('DecisionModel' in window)) return null;

        const presetKey = $('decisionsPreset')?.value || 'general';
        const preset = DECISION_SCHEMAS[presetKey] || DECISION_SCHEMAS.general;
        const customContext = ($('decisionsContext')?.value || '').trim();
        const context = customContext || preset.context;
        const questions = preset.questions;

        const key = JSON.stringify({ presetKey, context });
        if (this.decisionsSession && this.decisionsSession.__key === key) {
            return this.decisionsSession;
        }

        if (this.decisionsSession && this.decisionsSession.destroy) {
            try { this.decisionsSession.destroy(); } catch { /* noop */ }
        }
        this.decisionsSession = null;

        const session = await window.DecisionModel.create({
            context,
            questions,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
                        this.setProgress(true, e.loaded / e.total);
                    } else if (typeof e.loaded === 'number') {
                        this.setProgress(true, e.loaded);
                    }
                    if (e.total && e.loaded >= e.total) {
                        this.setProgress(false);
                    }
                });
            }
        });
        session.__key = key;
        this.decisionsSession = session;
        this.setProgress(false);
        return session;
    }

    renderDecisionsDetails(result) {
        const container = $('decisionsDetails');
        if (!container) return;
        const entries = Object.entries(result || {});
        if (!entries.length) return;

        container.style.display = 'block';
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'decisions-prob-grid';

        for (const [qId, dec] of entries) {
            const card = document.createElement('div');
            card.className = 'decision-mini-card';

            const header = document.createElement('div');
            header.className = 'decision-mini-header';
            const scoreStr = typeof dec.expectedScore === 'number' ? ` (score ${dec.expectedScore.toFixed(2)})` : '';
            header.innerHTML = `<span>${safeText(qId)}</span><span>${safeText(dec.label)}${scoreStr}</span>`;
            card.appendChild(header);

            if (dec.probabilities && typeof dec.probabilities === 'object') {
                for (const [optLabel, prob] of Object.entries(dec.probabilities)) {
                    const pct = Math.max(0, Math.min(100, Number(prob) * 100));
                    const row = document.createElement('div');
                    row.className = 'decision-mini-row';
                    row.innerHTML = `
                        <div><code>${safeText(optLabel)}</code></div>
                        <div class="decision-mini-track"><div class="decision-mini-fill" style="width:${pct.toFixed(1)}%"></div></div>
                        <div style="text-align:right">${pct.toFixed(1)}%</div>
                    `;
                    card.appendChild(row);
                }
            }
            grid.appendChild(card);
        }

        container.appendChild(grid);
    }

    async getOrCreateToolsSession() {
        if (!('LanguageModel' in window)) return null;

        if (this.toolsSession && this.toolsSession.destroy) {
            try { this.toolsSession.destroy(); } catch { /* noop */ }
        }
        this.toolsSession = null;

        const session = await window.LanguageModel.create({
            temperature: 0.001,
            topK: 1,
            tools: E2E_TOOLS,
            expectedInputs: [{ type: 'tool-response' }],
            expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }],
            initialPrompts: [{
                role: 'system',
                content: 'You are a helpful assistant. Use the provided tools when appropriate to inspect the input and perform requested actions.'
            }],
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number') {
                        this.setProgress(true, e.loaded);
                    }
                    if (e.total && e.loaded >= e.total) {
                        this.setProgress(false);
                    }
                });
            }
        });
        this.toolsSession = session;
        this.setProgress(false);
        return session;
    }

    normalizeToolPromptResult(result) {
        if (typeof result === 'string') {
            return { text: result, toolCalls: [] };
        }
        const parts = Array.isArray(result) ? result : [];
        const textParts = [];
        const toolCalls = [];
        for (const part of parts) {
            if (part?.type === 'text') {
                textParts.push(String(part.value ?? ''));
            } else if (part?.type === 'tool-call' && part.value) {
                toolCalls.push({
                    callId: part.value.callId || `call-${toolCalls.length + 1}`,
                    name: part.value.name,
                    arguments: part.value.arguments || {}
                });
            }
        }
        return { text: textParts.join(''), toolCalls };
    }

    async executeToolTurnOnSession(session, promptText, turnNumber) {
        const firstResult = await session.prompt(promptText);
        const firstNorm = this.normalizeToolPromptResult(firstResult);
        const executedCalls = [];
        let finalAnswer = firstNorm.text || '';

        if (firstNorm.toolCalls.length > 0) {
            for (const tc of firstNorm.toolCalls) {
                const fn = E2E_TOOL_EXECUTORS[tc.name];
                const payload = fn ? await fn(tc.arguments) : { status: 'ok' };
                const responseVal = typeof window.LanguageModelToolSuccess === 'function'
                    ? new window.LanguageModelToolSuccess({
                        callId: tc.callId,
                        name: tc.name,
                        result: [{ type: 'object', value: payload }]
                    })
                    : { callId: tc.callId, name: tc.name, result: [{ type: 'object', value: payload }] };
                executedCalls.push({ ...tc, output: payload, toolResponse: responseVal });
            }

            const followUp = await session.prompt([{
                role: 'user',
                content: executedCalls.map(item => ({
                    type: 'tool-response',
                    value: item.toolResponse
                }))
            }]);
            const secondNorm = this.normalizeToolPromptResult(followUp);
            finalAnswer = secondNorm.text || JSON.stringify(followUp);
        }

        const leakedDelimiter = /<\|?\/?tool_call\|?>/.test(finalAnswer);
        return {
            turn: turnNumber,
            toolCalls: executedCalls.map(({ callId, name, arguments: args, output }) => ({
                callId,
                name,
                arguments: args,
                output
            })),
            finalAnswer,
            leakedDelimiter
        };
    }

    renderToolsDetails(turns) {
        const container = $('toolsDetails');
        if (!container || !Array.isArray(turns) || !turns.length) return;

        container.style.display = 'block';
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'decisions-prob-grid';

        for (const t of turns) {
            const card = document.createElement('div');
            card.className = 'decision-mini-card';

            const header = document.createElement('div');
            header.className = 'decision-mini-header';
            const statusLabel = t.leakedDelimiter
                ? '⚠️ Leaked Delimiter'
                : `${t.toolCalls.length} Tool Call(s)`;
            header.innerHTML = `<span>Turn ${t.turn}</span><span>${safeText(statusLabel)}</span>`;
            card.appendChild(header);

            for (const tc of t.toolCalls) {
                const row = document.createElement('div');
                row.className = 'hint';
                row.innerHTML = `<code>${safeText(tc.name)}(${safeText(JSON.stringify(tc.arguments))})</code> → <code>${safeText(JSON.stringify(tc.output))}</code>`;
                card.appendChild(row);
            }

            grid.appendChild(card);
        }

        container.appendChild(grid);
    }

    async ensureLanguageDetector() {
        if (!('LanguageDetector' in window)) return null;
        if (this.languageDetector) return this.languageDetector;

        const availability = typeof window.LanguageDetector.availability === 'function'
            ? await window.LanguageDetector.availability()
            : 'unknown';

        if (availability === 'no' || availability === 'unavailable') return null;

        const detector = await window.LanguageDetector.create({
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number') {
                        // Chrome uses fraction.
                        this.setProgress(true, e.loaded);
                    }
                });
            }
        });

        this.languageDetector = detector;
        this.setProgress(false);
        return detector;
    }

    getTextForTranslateAndDetect() {
        const selectedStage = ($('translateSourceStage')?.value || 'all');
        const effectiveInput = this.getEffectiveInputText('translator');

        if (selectedStage === 'all') {
            const sections = [];
            if (effectiveInput) sections.push({ label: 'Source Input', text: effectiveInput });
            if (this.stageOutputs.summarizer && !this.stageOutputs.summarizer.startsWith('Error:') && !this.stageOutputs.summarizer.includes('not available')) {
                sections.push({ label: 'Summary', text: this.stageOutputs.summarizer });
            }
            if (this.stageOutputs.rewriter && !this.stageOutputs.rewriter.startsWith('Error:') && !this.stageOutputs.rewriter.includes('not available')) {
                sections.push({ label: 'Rewritten', text: this.stageOutputs.rewriter });
            }
            if (this.stageOutputs.writer && !this.stageOutputs.writer.startsWith('Error:') && !this.stageOutputs.writer.includes('not available')) {
                sections.push({ label: 'Writer Draft', text: this.stageOutputs.writer });
            }
            if (sections.length <= 1) {
                return { source: 'input', label: 'Source Input', text: effectiveInput, sections };
            }
            const combined = sections.map(s => `[${s.label}]\n${s.text}`).join('\n\n');
            return { source: 'all', label: 'All Available Outputs', text: combined, sections };
        }

        if (selectedStage !== 'input' && this.stageOutputs[selectedStage]) {
            return {
                source: selectedStage,
                label: selectedStage,
                text: this.stageOutputs[selectedStage],
                sections: [{ label: selectedStage, text: this.stageOutputs[selectedStage] }]
            };
        }

        return {
            source: 'input',
            label: 'Source Input',
            text: effectiveInput,
            sections: effectiveInput ? [{ label: 'Source Input', text: effectiveInput }] : []
        };
    }

    async detectLanguageForOutput() {
        await this.runStage('lid');
    }

    stopTranslate() {
        if (this.translateAbortController) {
            try { this.translateAbortController.abort(); } catch { /* noop */ }
        }

        if (this.translateStream) {
            try {
                if (this.translateStream.controller && this.translateStream.controller.abort) {
                    this.translateStream.controller.abort();
                }
            } catch { /* noop */ }
        }

        this.translateAbortController = null;
        this.translateStream = null;
        if ($('stopTranslateBtn')) $('stopTranslateBtn').disabled = true;
        if ($('translateBtn')) $('translateBtn').disabled = false;
    }

    async translateOutput() {
        const { text, sections } = this.getTextForTranslateAndDetect();
        if (!text) {
            this.showError(new Error('No text to translate. Add source input text first.'), 'Translate');
            return;
        }

        if (!('Translator' in window)) {
            this.setStageStatus('translator', 'Unavailable', 'is-error');
            this.setStageOutput('translator', 'Translator API is not available in this browser.');
            return;
        }

        this.setStageStatus('translator', 'Running…', 'is-running');
        this.setStageOutput('translator', '');

        if ($('translateBtn')) $('translateBtn').disabled = true;
        if ($('stopTranslateBtn')) $('stopTranslateBtn').disabled = false;

        setTextIfPresent('translateSegments', '-');
        setTextIfPresent('translateTime', '0');
        setTextIfPresent('translateThroughput', '0');

        const mode = $('translateMode')?.value || 'whole';
        const source = ($('sourceLanguage')?.value || '').trim();
        const target = ($('targetLanguage')?.value || '').trim();

        try {
            let sourceLang = source;
            if (!sourceLang || sourceLang.toLowerCase() === 'auto') {
                if (this.detectedLanguageCode && this.detectedLanguageCode !== '-') {
                    sourceLang = this.detectedLanguageCode;
                } else {
                    const detector = await this.ensureLanguageDetector();
                    if (detector) {
                        const results = await detector.detect(text);
                        if (results && results.length) {
                            sourceLang = results[0].detectedLanguage || results[0].language || results[0].code;
                            const pct = results[0].confidence !== undefined ? ` (${Math.round(results[0].confidence * 100)}%)` : '';
                            setTextIfPresent('detectedLang', `${sourceLang}${pct}`);
                        }
                    }
                }
                if (!sourceLang || sourceLang.toLowerCase() === 'auto') {
                    sourceLang = 'en';
                }
            }

            const targetLang = target || 'es';
            setTextIfPresent('translateDetectedLang', `${sourceLang} → ${targetLang}`);

            const translator = await this.getOrCreateTranslator(sourceLang, targetLang);
            if (!translator) throw new Error('Could not create translator session.');

            this.translateAbortController = new AbortController();
            const start = nowMs();

            if (sections && sections.length > 1 && mode === 'whole') {
                // Translate all sections concurrently so browser batching can coalesce them
                setTextIfPresent('translateSegments', `${sections.length} sections`);
                const translatedParts = await Promise.all(
                    sections.map(sec => translator.translate(sec.text, { signal: this.translateAbortController.signal }))
                );
                const combinedOut = sections
                    .map((sec, idx) => `[${sec.label}]\n${translatedParts[idx]}`)
                    .join('\n\n');
                this.setStageOutput('translator', combinedOut);
                const elapsed = Math.max(1, Math.round(nowMs() - start));
                setTextIfPresent('translateTime', String(elapsed));
                setTextIfPresent('translateThroughput', String(calcThroughput(text.length, elapsed)));
            } else if (mode === 'whole') {
                const translated = await translator.translate(text, { signal: this.translateAbortController.signal });
                this.setStageOutput('translator', translated);

                const elapsed = Math.max(1, Math.round(nowMs() - start));
                setTextIfPresent('translateTime', String(elapsed));
                setTextIfPresent('translateThroughput', String(calcThroughput(text.length, elapsed)));
                setTextIfPresent('translateSegments', '1');
            } else if (mode === 'stream') {
                let out = '';
                let chunks = 0;
                const stream = translator.translateStreaming(text, { signal: this.translateAbortController.signal });
                this.translateStream = stream;

                for await (const chunk of stream) {
                    out += chunk;
                    chunks++;
                    this.setStageOutput('translator', out);
                    const elapsed = Math.max(1, Math.round(nowMs() - start));
                    setTextIfPresent('translateTime', String(elapsed));
                    setTextIfPresent('translateThroughput', String(calcThroughput(text.length, elapsed)));
                    setTextIfPresent('translateSegments', `${chunks} chunks`);
                }
            } else {
                const by = $('segmentBy')?.value || 'sentence';
                const joiner = ($('segmentJoin')?.value === 'newline') ? '\n\n' : ' ';
                const size = Math.max(50, Number($('segmentChars')?.value) || 500);

                let segments = [];
                if (by === 'sentence') segments = splitBySentence(text);
                else if (by === 'paragraph') segments = splitByParagraph(text);
                else segments = splitByChars(text, size);

                if (!segments.length) segments = [text];

                setTextIfPresent('translateSegments', String(segments.length));

                let out = '';
                for (let i = 0; i < segments.length; i++) {
                    const part = segments[i];
                    const translated = await translator.translate(part, { signal: this.translateAbortController.signal });
                    out += (i === 0 ? '' : joiner) + translated;
                    this.setStageOutput('translator', out);

                    const elapsed = Math.max(1, Math.round(nowMs() - start));
                    setTextIfPresent('translateTime', String(elapsed));
                    setTextIfPresent('translateThroughput', String(calcThroughput(text.length, elapsed)));
                }
            }

            this.setStageStatus('translator', 'Done', 'is-done');
        } catch (e) {
            console.error(e);
            this.setStageStatus('translator', 'Error', 'is-error');
            this.setStageOutput('translator', `Error: ${e.message || String(e)}`);
            this.showError(e, 'Translate');
        } finally {
            this.translateAbortController = null;
            this.translateStream = null;
            if ($('stopTranslateBtn')) $('stopTranslateBtn').disabled = true;
            if ($('translateBtn')) $('translateBtn').disabled = false;
        }
    }

    async getOrCreateTranslator(sourceLanguage, targetLanguage) {
        const key = `${sourceLanguage}→${targetLanguage}`;

        if (this.translatorSession && this.translatorSession.__key === key) {
            return this.translatorSession;
        }

        if (this.translatorSession && this.translatorSession.destroy) {
            try { await this.translatorSession.destroy(); } catch { /* noop */ }
        }

        const availability = typeof window.Translator.availability === 'function'
            ? await window.Translator.availability({ sourceLanguage, targetLanguage })
            : 'unknown';

        if (availability === 'unavailable') {
            throw new Error(`Translator unavailable for ${key}`);
        }

        const session = await window.Translator.create({
            sourceLanguage,
            targetLanguage,
            monitor: (m) => {
                m.addEventListener('downloadprogress', (e) => {
                    if (typeof e.loaded === 'number' && typeof e.total === 'number' && e.total > 0) {
                        this.setProgress(true, e.loaded / e.total);
                    } else if (typeof e.loaded === 'number') {
                        // Some implementations use 0..1.
                        this.setProgress(true, e.loaded);
                    }
                    if (e.total && e.loaded === e.total) this.setProgress(false);
                });
            }
        });

        session.__key = key;
        this.translatorSession = session;
        this.setProgress(false);
        return session;
    }
}

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.__e2ePlayground = new E2EPlayground();
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { E2EPlayground, PRESETS, DEFAULTS, DECISION_SCHEMAS, E2E_TOOLS };
}

// Forward console warnings/errors into the on-page banner so devs don't have to keep DevTools open.
(function installConsoleForwarding() {
    if (window.__e2eConsoleForwardingInstalled) return;
    window.__e2eConsoleForwardingInstalled = true;

    const seen = new Set();
    const buffer = (window.__e2eConsoleBuffer ||= []);

    const originals = {
        warn: console.warn.bind(console),
        error: console.error.bind(console)
    };

    function toText(val) {
        if (typeof val === 'string') return val;
        if (val instanceof Error) return val.stack || val.message || String(val);
        try { return JSON.stringify(val, Object.getOwnPropertyNames(val), 2); } catch { return String(val); }
    }

    function forward(level, args) {
        const message = args.map(toText).join(' ').trim();
        if (!message) return;

        const key = `${level}:${message}`;
        if (seen.has(key)) return;
        seen.add(key);

        const pg = window.__e2ePlayground;
        if (!pg) {
            buffer.push({ level, message, ts: Date.now() });
            return;
        }

        const title = level === 'warn' ? 'Warning' : 'Error';
        pg.showError(new Error(message), `console.${level}`, { title });
    }

    console.warn = (...args) => {
        originals.warn(...args);
        forward('warn', args);
    };

    console.error = (...args) => {
        originals.error(...args);
        forward('error', args);
    };

    // Flush buffered messages once the playground exists.
    window.addEventListener('DOMContentLoaded', () => {
        const pg = window.__e2ePlayground;
        if (!pg || !buffer.length) return;
        while (buffer.length) {
            const item = buffer.shift();
            const title = item.level === 'warn' ? 'Warning' : 'Error';
            pg.showError(new Error(item.message), `console.${item.level}`, { title });
        }
    });
})();

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    try { window.__e2ePlayground?.showError(event.reason || event, 'Unhandled promise rejection', { title: 'Unhandled rejection' }); } catch { /* noop */ }
});

window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    try { window.__e2ePlayground?.showError(event.error || event.message || event, 'Uncaught error', { title: 'Uncaught error' }); } catch { /* noop */ }
});
