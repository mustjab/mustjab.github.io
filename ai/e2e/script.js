/* Built-in AI End-to-End Playground
 * - Prompt API (Edge: window.LanguageModel)
 * - Writing Assistance APIs (Summarizer/Writer/Rewriter)
 * - Proofreader API (Chrome origin trial)
 * - Translator API
 * - Language Detector API
 */

const DEFAULTS = {
    // Defaults are intentionally task-specific per API (aligned with the Edge playgrounds).
    prompt: {
        system: 'You are a helpful assistant.',
        input: '',
        inputHint: 'Prompt sent to the Prompt API.'
    },
    summarizer: {
        system: 'Summarize the input text. Preserve key facts and numbers.\nOutput concise bullet points unless the text is very short.',
        input: '',
        inputHint: 'Text to summarize.'
    },
    writer: {
        system: 'Write based on the user input. Be clear, accurate, and well-structured.\nAsk a brief clarifying question only if required.',
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
    return `Support: ${state}${suffix}`;
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

        // Per-tab UI state (so each feature keeps its own system prompt/input).
        this.tabState = Object.fromEntries(
            Object.entries(DEFAULTS).map(([key, defaults]) => [
                key,
                { system: defaults.system, input: defaults.input }
            ])
        );

        this.promptSession = null;
        this.summarizerSession = null;
        this.writerSession = null;
        this.rewriterSession = null;
        this.proofreader = null;

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

        this.refreshAvailability();
    }

    setupLanguageSelectors() {
        const languages = [
            { code: 'auto', name: 'Auto detect' },
            ...Object.entries(LANGUAGE_NAMES)
                .map(([code, name]) => ({ code, name }))
                .sort((a, b) => a.name.localeCompare(b.name))
        ];

        this.sourceLanguageSelect = new SearchableLanguageSelect(
            'sourceLanguageSearch',
            'sourceLanguageDropdown',
            'sourceLanguage',
            languages,
            $('sourceLanguage')?.value || 'en'
        );

        this.targetLanguageSelect = new SearchableLanguageSelect(
            'targetLanguageSearch',
            'targetLanguageDropdown',
            'targetLanguage',
            languages.filter(l => l.code !== 'auto'),
            $('targetLanguage')?.value || 'en'
        );
    }

    wirePerTabState() {
        $('systemPrompt').addEventListener('input', () => {
            if (!this.tabState[this.activeTab]) this.tabState[this.activeTab] = { system: '', input: '' };
            this.tabState[this.activeTab].system = $('systemPrompt').value;
        });

        $('inputText').addEventListener('input', () => {
            if (!this.tabState[this.activeTab]) this.tabState[this.activeTab] = { system: '', input: '' };
            this.tabState[this.activeTab].input = $('inputText').value;
        });
    }

    wireTabs() {
        document.querySelectorAll('.tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setActiveTab(btn.dataset.tab);
            });
        });
    }

    wireButtons() {
        $('runBtn').addEventListener('click', () => this.runTask());
        $('stopBtn').addEventListener('click', () => this.stopTask());
        $('clearBtn').addEventListener('click', () => this.clearAll());

        $('dismissError')?.addEventListener('click', () => this.clearError());

        $('copyOutput').addEventListener('click', async () => {
            await copyToClipboard(this.lastOutput);
        });

        $('detectLangBtn').addEventListener('click', () => this.detectLanguageForOutput());
        $('translateBtn').addEventListener('click', () => this.translateOutput());
        $('stopTranslateBtn').addEventListener('click', () => this.stopTranslate());

        $('copyTranslated').addEventListener('click', async () => {
            await copyToClipboard($('translatedOutput').textContent);
        });
    }

    wireTranslateMode() {
        $('translateMode').addEventListener('change', () => {
            $('segmentOptions').style.display = $('translateMode').value === 'segmented' ? 'grid' : 'none';
        });
    }

    setActiveTab(tab) {
        if (this.activeTab === tab) return;

        // Persist current tab values before switching.
        this.saveActiveTabState();

        this.activeTab = tab;

        document.querySelectorAll('.tab').forEach(b => {
            const isActive = b.dataset.tab === tab;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        this.showOptionsForTab(tab);
        this.loadTabState(tab);
    }

    saveActiveTabState() {
        if (!this.tabState[this.activeTab]) {
            this.tabState[this.activeTab] = { system: '', input: '' };
        }
        this.tabState[this.activeTab].system = $('systemPrompt').value;
        this.tabState[this.activeTab].input = $('inputText').value;
    }

    showOptionsForTab(tab) {
        $('optionsPrompt').style.display = tab === 'prompt' ? 'grid' : 'none';
        $('optionsSummarizer').style.display = tab === 'summarizer' ? 'grid' : 'none';
        $('optionsWriter').style.display = tab === 'writer' ? 'grid' : 'none';
        $('optionsRewriter').style.display = tab === 'rewriter' ? 'grid' : 'none';
        $('optionsProofreader').style.display = tab === 'proofreader' ? 'grid' : 'none';
    }

    loadTabState(tab, { force = false } = {}) {
        const defaults = DEFAULTS[tab];
        if (!defaults) return;

        if (!this.tabState[tab]) {
            this.tabState[tab] = { system: defaults.system, input: defaults.input };
        }

        // Only overwrite the visible inputs if we're switching tabs, or if forced.
        const nextSystem = this.tabState[tab].system ?? defaults.system;
        const nextInput = this.tabState[tab].input ?? defaults.input;

        if (force || this.activeTab === tab) {
            $('systemPrompt').value = nextSystem;
            $('inputText').value = nextInput;
        } else {
            // When called during a tab switch, we still want to load values.
            $('systemPrompt').value = nextSystem;
            $('inputText').value = nextInput;
        }

        $('inputHint').textContent = defaults.inputHint;
    }

    clearAll() {
        // Clear UI and per-tab stored values.
        Object.keys(this.tabState).forEach(k => {
            this.tabState[k] = { system: '', input: '' };
        });

        $('systemPrompt').value = '';
        $('inputText').value = '';

        this.setOutput('');
        $('translatedOutput').textContent = '';
        $('proofDetails').style.display = 'none';
        $('proofDetails').innerHTML = '';

        $('detectedLang').textContent = '-';
        $('translateSegments').textContent = '-';
        $('translateTime').textContent = '0';
        $('translateThroughput').textContent = '0';

        this.clearError();

        this.resetStats();
    }

    resetStats() {
        $('statChars').textContent = '0';
        $('statTime').textContent = '0';
        $('statChunks').textContent = '0';
        $('statThroughput').textContent = '0';
    }

    setOutput(text) {
        this.lastOutput = safeText(text);
        $('modelOutput').textContent = this.lastOutput;
        $('copyOutput').disabled = !this.lastOutput;
    }

    setProgress(show, loaded = 0) {
        $('downloadProgress').style.display = show ? 'block' : 'none';
        const percent = Math.max(0, Math.min(100, Math.round(loaded * 100)));
        $('progressFill').style.width = `${percent}%`;
        $('progressText').textContent = `${percent}%`;
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
            this.updateWritingAvailability('Summarizer', 'summarizer'),
            this.updateWritingAvailability('Writer', 'writer'),
            this.updateWritingAvailability('Rewriter', 'rewriter'),
            this.updateProofreaderAvailability(),
            this.updateTranslatorAvailability(),
            this.updateLIDAvailability()
        ]);
    }

    async updatePromptAvailability() {
        const has = 'LanguageModel' in window;
        if (!has) {
            setTextIfPresent('supportPrompt', supportText('Not supported'));
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
            // Edge returns strings or objects with .available.
            const state = typeof info === 'string' ? info : (info && info.available ? info.available : 'unknown');

            if (state === 'available' || state === 'readily') {
                setTextIfPresent('supportPrompt', supportText('Available'));
            } else if (state === 'downloadable' || state === 'downloading' || state === 'after-download') {
                setTextIfPresent('supportPrompt', supportText('Downloadable'));
            } else {
                setTextIfPresent('supportPrompt', supportText(safeText(state) || 'Unknown'));
            }
        } catch {
            setTextIfPresent('supportPrompt', supportText('Unknown'));
        }
    }

    async updateWritingAvailability(globalName, key) {
        const supportId = key === 'summarizer'
            ? 'supportSummarizer'
            : key === 'writer'
                ? 'supportWriter'
                : 'supportRewriter';

        if (!(globalName in window)) {
            setTextIfPresent(supportId, supportText('Not supported'));
            return;
        }

        try {
            const api = window[globalName];
            const availability = await api.availability();
            if (availability === 'available') {
                setTextIfPresent(supportId, supportText('Available'));
            } else if (availability === 'downloadable' || availability === 'downloading') {
                setTextIfPresent(supportId, supportText('Downloadable'));
            } else if (availability === 'unavailable') {
                setTextIfPresent(supportId, supportText('Unavailable'));
            } else {
                setTextIfPresent(supportId, supportText(safeText(availability) || 'Unknown'));
            }
        } catch {
            setTextIfPresent(supportId, supportText('Unknown'));
        }
    }

    async updateProofreaderAvailability() {
        if (!('Proofreader' in window)) {
            setTextIfPresent('supportProofreader', supportText('Not supported'));
            return;
        }

        // Chrome doc mentions availability(), but behavior varies across builds.
        try {
            const api = window.Proofreader;
            if (typeof api.availability === 'function') {
                const a = await api.availability();
                setTextIfPresent('supportProofreader', supportText(safeText(a) || 'Unknown'));
            } else {
                setTextIfPresent('supportProofreader', supportText('Present'));
            }
        } catch {
            setTextIfPresent('supportProofreader', supportText('Unknown'));
        }
    }

    async updateTranslatorAvailability() {
        if (!('Translator' in window)) {
            setTextIfPresent('supportTranslator', 'Translator support: Not supported');
            return;
        }

        try {
            setTextIfPresent('supportTranslator', 'Translator support: Available');
        } catch {
            setTextIfPresent('supportTranslator', 'Translator support: Unknown');
        }
    }

    async updateLIDAvailability() {
        if (!('LanguageDetector' in window)) {
            setTextIfPresent('supportLID', 'Language Detector support: Not supported');
            return;
        }

        try {
            const api = window.LanguageDetector;
            if (typeof api.availability === 'function') {
                const a = await api.availability();
                // Chrome uses: "no" | "after-download" | "readily".
                if (a === 'readily' || a === 'available') {
                    setTextIfPresent('supportLID', 'Language Detector support: Available');
                } else if (a === 'after-download') {
                    setTextIfPresent('supportLID', 'Language Detector support: Downloadable');
                } else if (a === 'no' || a === 'unavailable') {
                    setTextIfPresent('supportLID', 'Language Detector support: Unavailable');
                } else {
                    setTextIfPresent('supportLID', `Language Detector support: ${safeText(a) || 'Unknown'}`);
                }
            } else {
                setTextIfPresent('supportLID', 'Language Detector support: Present');
            }
        } catch {
            setTextIfPresent('supportLID', 'Language Detector support: Unknown');
        }
    }

    setBusy(isBusy) {
        $('runBtn').disabled = isBusy;
        $('stopBtn').disabled = !isBusy;
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

        this.currentAbortController = null;
        this.currentStream = null;
        this.setBusy(false);
    }

    async runTask() {
        const systemPrompt = $('systemPrompt').value.trim();
        const inputText = $('inputText').value.trim();
        const streaming = true;

        $('proofDetails').style.display = 'none';
        $('proofDetails').innerHTML = '';

        this.resetStats();
        this.setOutput('');
        this.clearError();

        if (!inputText) {
            this.showError(new Error('Please enter input text.'), 'Input');
            return;
        }

        this.setBusy(true);

        const start = nowMs();
        let chunks = 0;
        let output = '';

        this.currentAbortController = new AbortController();

        try {
            switch (this.activeTab) {
                case 'prompt': {
                    const session = await this.getOrCreatePromptSession(systemPrompt);
                    if (!session) throw new Error('Prompt session not available.');

                    const requestOptions = { signal: this.currentAbortController.signal };
                    let stream;
                    try {
                        stream = session.promptStreaming(inputText, requestOptions);
                    } catch (e) {
                        // Retry with minimal options.
                        stream = session.promptStreaming(inputText, { signal: this.currentAbortController.signal });
                    }

                    this.currentStream = stream;
                    for await (const chunk of stream) {
                        output += chunk;
                        chunks++;
                        this.setOutput(output);
                        this.updateStats(output.length, start, chunks);
                    }
                    break;
                }

                case 'summarizer': {
                    const session = await this.getOrCreateSummarizerSession();
                    if (!session) throw new Error('Summarizer session not available.');

                    if (streaming && session.summarizeStreaming) {
                        const stream = session.summarizeStreaming(inputText, { signal: this.currentAbortController.signal });
                        this.currentStream = stream;
                        for await (const chunk of stream) {
                            output += chunk;
                            chunks++;
                            this.setOutput(output);
                            this.updateStats(output.length, start, chunks);
                        }
                    } else {
                        output = await session.summarize(inputText, { signal: this.currentAbortController.signal });
                        chunks = 1;
                        this.setOutput(output);
                        this.updateStats(output.length, start, chunks);
                    }
                    break;
                }

                case 'writer': {
                    const session = await this.getOrCreateWriterSession();
                    if (!session) throw new Error('Writer session not available.');

                    if (streaming && session.writeStreaming) {
                        const stream = session.writeStreaming(inputText, { signal: this.currentAbortController.signal });
                        this.currentStream = stream;
                        for await (const chunk of stream) {
                            output += chunk;
                            chunks++;
                            this.setOutput(output);
                            this.updateStats(output.length, start, chunks);
                        }
                    } else {
                        output = await session.write(inputText, { signal: this.currentAbortController.signal });
                        chunks = 1;
                        this.setOutput(output);
                        this.updateStats(output.length, start, chunks);
                    }
                    break;
                }

                case 'rewriter': {
                    const session = await this.getOrCreateRewriterSession();
                    if (!session) throw new Error('Rewriter session not available.');

                    if (streaming && session.rewriteStreaming) {
                        const stream = session.rewriteStreaming(inputText, { signal: this.currentAbortController.signal });
                        this.currentStream = stream;
                        for await (const chunk of stream) {
                            output += chunk;
                            chunks++;
                            this.setOutput(output);
                            this.updateStats(output.length, start, chunks);
                        }
                    } else {
                        output = await session.rewrite(inputText, { signal: this.currentAbortController.signal });
                        chunks = 1;
                        this.setOutput(output);
                        this.updateStats(output.length, start, chunks);
                    }
                    break;
                }

                case 'proofreader': {
                    const expectedInputLanguages = await this.getExpectedProofreaderLanguages(inputText);
                    const proofreader = await this.getOrCreateProofreader(expectedInputLanguages);
                    if (!proofreader) throw new Error('Proofreader not available.');

                    const result = await proofreader.proofread(inputText);
                    output = result.correctedInput || result.correction || '';
                    chunks = 1;
                    this.setOutput(output);
                    this.updateStats(output.length, start, chunks);
                    this.renderProofDetails(result);
                    break;
                }

                default:
                    throw new Error('Unknown tab');
            }

        } catch (e) {
            const message = e && e.message ? e.message : String(e);
            this.setOutput(`Error: ${message}`);
            this.showError(e, `Task: ${this.activeTab}`);
            console.error(e);
        } finally {
            this.currentStream = null;
            this.currentAbortController = null;
            this.setBusy(false);
        }
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
        const temperature = Number($('optTemperature').value) || 1;
        const topK = Number($('optTopK').value) || 3;
        const maxTokens = Number($('optMaxTokens').value) || 2048;

        const key = JSON.stringify({ sys, outputLanguage, temperature, topK, maxTokens });
        const needsNew = !this.promptSession || this.promptSession.__key !== key;

        if (!needsNew) return this.promptSession;

        // Destroy previous session if possible.
        if (this.promptSession && this.promptSession.destroy) {
            try { await this.promptSession.destroy(); } catch { /* noop */ }
        }
        this.promptSession = null;

        const lm = window.LanguageModel;

        const config = {
            temperature,
            topK,
            maxTokens,
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
        const outputText = (this.lastOutput || '').trim();
        if (outputText) {
            return {
                source: 'output',
                label: 'Model output',
                text: outputText
            };
        }

        const inputText = ($('inputText')?.value || '').trim();
        return {
            source: 'input',
            label: 'Input',
            text: inputText
        };
    }

    async detectLanguageForOutput() {
        const { text, label } = this.getTextForTranslateAndDetect();
        if (!text) {
            this.showError(new Error('No text to detect. Add input text or generate model output.'), 'Language detection');
            return;
        }

        try {
            const detector = await this.ensureLanguageDetector();
            if (!detector) {
                this.showError(new Error('Language Detector API is not available in this browser.'), 'Language detection');
                return;
            }

            const results = await detector.detect(text);
            if (!results || !results.length) {
                $('detectedLang').textContent = '-';
                return;
            }

            const best = results[0];
            const code = best.detectedLanguage || best.language || best.code || '-';
            const confidence = best.confidence !== undefined ? ` (${Math.round(best.confidence * 100)}%)` : '';

            $('detectedLang').textContent = `${code}${confidence}`;
            if (this.sourceLanguageSelect) this.sourceLanguageSelect.setValue(code);
            else if ($('sourceLanguage')) $('sourceLanguage').value = code;
        } catch (e) {
            console.error(e);
            this.showError(e, 'Language detection');
        } finally {
            this.setProgress(false);
        }
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
        $('stopTranslateBtn').disabled = true;
        $('translateBtn').disabled = false;
    }

    async translateOutput() {
        const { text, label } = this.getTextForTranslateAndDetect();
        if (!text) {
            this.showError(new Error('No text to translate. Add input text or generate model output.'), 'Translate');
            return;
        }

        if (!('Translator' in window)) {
            this.showError(new Error('Translator API is not available in this browser.'), 'Translate');
            return;
        }

        this.clearError();

        $('translatedOutput').textContent = '';
        $('copyTranslated').disabled = true;

        $('translateBtn').disabled = true;
        $('stopTranslateBtn').disabled = false;

        $('translateSegments').textContent = '-';
        $('translateTime').textContent = '0';
        $('translateThroughput').textContent = '0';

        const mode = $('translateMode').value;
        const source = ($('sourceLanguage')?.value || '').trim();
        const target = ($('targetLanguage')?.value || '').trim();

        try {
            let sourceLang = source;
            if (!sourceLang || sourceLang.toLowerCase() === 'auto') {
                const detector = await this.ensureLanguageDetector();
                if (detector) {
                    const results = await detector.detect(text);
                    if (results && results.length) {
                        sourceLang = results[0].detectedLanguage;
                        $('detectedLang').textContent = `${sourceLang} (${Math.round(results[0].confidence * 100)}%)`;
                    }
                }

                if (!sourceLang || sourceLang.toLowerCase() === 'auto') {
                    // Fallback: default to English if unknown.
                    sourceLang = 'en';
                }
            }

            const targetLang = target || 'es';

            const translator = await this.getOrCreateTranslator(sourceLang, targetLang);
            if (!translator) throw new Error('Could not create translator session.');

            this.translateAbortController = new AbortController();
            const start = nowMs();

            if (mode === 'whole') {
                const translated = await translator.translate(text, { signal: this.translateAbortController.signal });
                $('translatedOutput').textContent = translated;
                $('copyTranslated').disabled = !translated;

                const elapsed = Math.round(nowMs() - start);
                $('translateTime').textContent = String(elapsed);
                $('translateThroughput').textContent = String(calcThroughput(text.length, elapsed));
                $('translateSegments').textContent = '1';
            } else if (mode === 'stream') {
                let out = '';
                let chunks = 0;
                const stream = translator.translateStreaming(text, { signal: this.translateAbortController.signal });
                this.translateStream = stream;

                for await (const chunk of stream) {
                    out += chunk;
                    chunks++;
                    $('translatedOutput').textContent = out;
                    const elapsed = Math.round(nowMs() - start);
                    $('translateTime').textContent = String(elapsed);
                    $('translateThroughput').textContent = String(calcThroughput(text.length, elapsed));
                    $('translateSegments').textContent = `${chunks} chunks`;
                }

                $('copyTranslated').disabled = !out;
            } else {
                const by = $('segmentBy').value;
                const joiner = $('segmentJoin').value === 'newline' ? '\n\n' : ' ';
                const size = Math.max(50, Number($('segmentChars').value) || 500);

                let segments = [];
                if (by === 'sentence') segments = splitBySentence(text);
                else if (by === 'paragraph') segments = splitByParagraph(text);
                else segments = splitByChars(text, size);

                if (!segments.length) segments = [text];

                $('translateSegments').textContent = String(segments.length);

                let out = '';
                for (let i = 0; i < segments.length; i++) {
                    const part = segments[i];
                    const translated = await translator.translate(part, { signal: this.translateAbortController.signal });
                    out += (i === 0 ? '' : joiner) + translated;
                    $('translatedOutput').textContent = out;

                    const elapsed = Math.round(nowMs() - start);
                    $('translateTime').textContent = String(elapsed);
                    $('translateThroughput').textContent = String(calcThroughput(text.length, elapsed));
                }

                $('copyTranslated').disabled = !out;
            }

        } catch (e) {
            console.error(e);
            $('translatedOutput').textContent = `Error: ${e.message || String(e)}`;
            this.showError(e, 'Translate');
        } finally {
            this.translateAbortController = null;
            this.translateStream = null;
            $('stopTranslateBtn').disabled = true;
            $('translateBtn').disabled = false;
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

document.addEventListener('DOMContentLoaded', () => {
    window.__e2ePlayground = new E2EPlayground();
});

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
