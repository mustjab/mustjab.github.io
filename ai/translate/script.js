// Standardized benchmark texts for consistent testing
const BENCHMARK_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the river.",
  "In today's interconnected world, effective communication across language barriers has become increasingly important for global business success.",
  "Artificial intelligence and machine learning technologies are revolutionizing how we approach language translation and natural language processing.",
  "Climate change presents unprecedented challenges that require coordinated international efforts and innovative technological solutions.",
  "The emergence of quantum computing promises to transform industries ranging from cryptography to pharmaceutical research and development.",
  "Digital transformation initiatives are reshaping traditional business models and creating new opportunities for growth and innovation.",
  "Sustainable development goals emphasize the importance of balancing economic progress with environmental conservation and social responsibility.",
  "Educational institutions worldwide are adapting to remote learning technologies and hybrid classroom environments.",
  "Cybersecurity threats continue to evolve, requiring organizations to implement robust defense mechanisms and employee training programs.",
  "The healthcare industry is experiencing rapid digitalization through telemedicine platforms, electronic health records, and AI-powered diagnostic tools.",
  "Scientific research collaboration across borders accelerates discovery and innovation in fields such as renewable energy and biotechnology.",
  "Cultural diversity enriches societies by bringing together different perspectives, traditions, and approaches to problem-solving.",
  "Space exploration missions are advancing our understanding of the universe while developing technologies that benefit life on Earth.",
  "Financial technology innovations are democratizing access to banking services and investment opportunities for underserved populations.",
  "Social media platforms have fundamentally changed how people communicate, share information, and build communities in the digital age."
];

// Translation API Demo Script
class TranslationAPIDemo {
  constructor() {
    this.translator = null;
    this.batchResults = [];
    this.isTranslatorReady = false;

    this.init();
  } async init() {
    this.setupLanguageSelectors();
    this.setupEventListeners();
    this.calculateBenchmarkStats();
    await this.checkAPIAvailability();
  }

  setupLanguageSelectors() {
    // Create language list from LANGUAGE_NAMES
    const languages = Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
      code,
      name
    })).sort((a, b) => a.name.localeCompare(b.name));

    // Initialize searchable language selectors
    this.sourceLanguageSelect = new SearchableLanguageSelect(
      'sourceLanguageSearch',
      'sourceLanguageDropdown',
      'sourceLanguage',
      languages,
      'en'
    );

    this.targetLanguageSelect = new SearchableLanguageSelect(
      'targetLanguageSearch',
      'targetLanguageDropdown',
      'targetLanguage',
      languages,
      'zh-CN'
    );
  }  setupEventListeners() {
    // Translator Initialization
    document.getElementById('initializeTranslator').addEventListener('click', () => this.initializeTranslator());

    // Single Translation
    document.getElementById('translateSingle').addEventListener('click', () => this.translateSingle());

    // Batch Translation
    document.getElementById('runBatchTest').addEventListener('click', () => this.runBatchTest());
    document.getElementById('exportResults').addEventListener('click', () => this.exportResults());
    document.getElementById('clearResults').addEventListener('click', () => this.clearResults());

    // Language swap button
    document.getElementById('swapLanguages').addEventListener('click', () => this.swapLanguages());

    // Language selector changes
    document.getElementById('sourceLanguage').addEventListener('change', () => this.resetTranslator());
    document.getElementById('targetLanguage').addEventListener('change', () => this.resetTranslator());
  }async checkAPIAvailability() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    statusIndicator.className = 'status-indicator checking';
    statusText.textContent = 'Checking API availability...';

    try {
      let translatorAvailable = false;

      // Check Translation API
      if ('Translator' in self) {
        translatorAvailable = true;
      }
      // Update status indicator
      if (translatorAvailable) {
        statusIndicator.className = 'status-indicator available';
        statusText.textContent = 'Translation API is available';
        // Enable initialization button when API is available
        document.getElementById('initializeTranslator').disabled = false;
      } else {
        statusIndicator.className = 'status-indicator unavailable';
        statusText.textContent = 'Translation API is not available';
      }

    } catch (error) {
      statusIndicator.className = 'status-indicator unavailable';
      statusText.textContent = 'Error checking API availability';
    }
  }

  async initializeTranslator() {
    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const targetLanguage = document.getElementById('targetLanguage').value;
    const initButton = document.getElementById('initializeTranslator');
    const progressContainer = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    try {
      initButton.disabled = true;
      initButton.innerHTML = '<div class="loading"></div> Initializing...';

      // Check if language pair is in our supported list
      if (!isSupportedPair(sourceLanguage, targetLanguage)) {
        const sourceName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage;
        const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
        throw new Error(`Language pair ${sourceName} → ${targetName} may not be supported by Chrome's Translation API. Try a different language pair.`);
      }

      const startTime = performance.now();

      this.translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            progressContainer.style.display = 'block';
            const percent = Math.round(e.loaded * 100);
            progressFill.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
          });
        }
      });

      const endTime = performance.now();
      const initTime = Math.round(endTime - startTime);

      progressContainer.style.display = 'none';
      this.isTranslatorReady = true;

      // Enable translation buttons
      document.getElementById('translateSingle').disabled = false;
      document.getElementById('runBatchTest').disabled = false;

      initButton.innerHTML = 'Translator Initialized ✅';
      this.logResult('initResult', `Translator initialized successfully in ${initTime}ms`, 'success');

    } catch (error) {
      initButton.disabled = false;
      initButton.innerHTML = 'Initialize Translator';
      progressContainer.style.display = 'none';
      
      // Provide specific error message for unsupported language pairs
      let errorMessage = error.message;
      if (error.message.includes('unsupported') || error.message.includes('not supported')) {
        const sourceName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage;
        const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;
        errorMessage = `Language pair ${sourceName} → ${targetName} is not supported by Chrome's Translation API. Please try a different language combination.`;
      }
      
      this.logResult('initResult', `Failed to initialize translator: ${errorMessage}`, 'error');
    }
  } async translateSingle() {
    const inputText = document.getElementById('inputText').value.trim();

    if (!inputText) {
      alert('Please enter text to translate');
      return;
    }

    if (!this.translator) {
      alert('Please initialize the translator first');
      return;
    }

    try {
      const startTime = performance.now();
      const translatedText = await this.translator.translate(inputText);
      const endTime = performance.now();

      const translationTime = Math.round(endTime - startTime);
      const charactersPerSecond = Math.round((inputText.length / translationTime) * 1000);
      const totalCharacters = inputText.length;

      // Update results
      document.getElementById('translatedText').textContent = translatedText;

      // Update performance metrics
      document.getElementById('singleChars').textContent = totalCharacters;
      document.getElementById('singleTime').textContent = translationTime;
      document.getElementById('singleThroughput').textContent = charactersPerSecond;

    } catch (error) {
      alert(`Translation failed: ${error.message}`);
    }
  } async runBatchTest() {
    // Use predefined benchmark texts
    const batchTexts = BENCHMARK_TEXTS;

    if (!this.translator) {
      alert('Please initialize the translator first');
      return;
    }

    const runButton = document.getElementById('runBatchTest');
    runButton.disabled = true;
    runButton.innerHTML = '<div class="loading"></div> Running standardized benchmark...';

    // Clear previous results and initialize table
    this.batchResults = [];
    this.initializeBatchTable();

    try {
      const batchStartTime = performance.now();

      for (let i = 0; i < batchTexts.length; i++) {
        const text = batchTexts[i];
        const startTime = performance.now();

        // Update button to show progress
        runButton.innerHTML = `<div class="loading"></div> Translating ${i + 1}/${batchTexts.length}...`;

        try {
          const translatedText = await this.translator.translate(text);
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);

          const result = {
            index: i + 1,
            originalText: text,
            translatedText,
            duration,
            charactersPerSecond: Math.round((text.length / duration) * 1000),
            status: 'success'
          };

          this.batchResults.push(result);

          // Add row to table immediately
          this.addBatchResultRow(result);

          // Update running statistics
          const currentTime = performance.now();
          const elapsedTime = Math.round(currentTime - batchStartTime);
          this.updateRunningStats(this.batchResults, elapsedTime);

        } catch (error) {
          const result = {
            index: i + 1,
            originalText: text,
            translatedText: `Error: ${error.message}`,
            duration: 0,
            charactersPerSecond: 0,
            status: 'error'
          };

          this.batchResults.push(result);
          this.addBatchResultRow(result);
        }
      }

      const batchEndTime = performance.now();
      const totalTime = Math.round(batchEndTime - batchStartTime);

      // Final statistics update
      this.updateBatchStats(this.batchResults, totalTime);

      document.getElementById('exportResults').disabled = false;

    } catch (error) {
      alert(`Benchmark test failed: ${error.message}`);
    } finally {
      runButton.disabled = false;
      runButton.innerHTML = 'Run Standardized Benchmark';
    }
  }

  initializeBatchTable() {
    const tableContainer = document.getElementById('batchResultsTable');
    const table = document.createElement('table');
    table.id = 'resultsTable';
    table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Original Text</th>
                    <th>Translated Text</th>
                    <th>Time (ms)</th>
                    <th>Chars/Sec</th>
                </tr>
            </thead>
            <tbody id="resultsTableBody">
            </tbody>
        `;

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);

    // Reset stats
    document.getElementById('totalTranslations').textContent = '0';
    document.getElementById('averageTime').textContent = '0';
    document.getElementById('totalTime').textContent = '0';
    document.getElementById('throughput').textContent = '0';
  }

  addBatchResultRow(result) {
    const tbody = document.getElementById('resultsTableBody');
    const row = document.createElement('tr');
    row.className = result.status === 'error' ? 'text-error' : '';
    row.innerHTML = `
            <td>${result.index}</td>
            <td class="text-cell">${this.escapeHtml(result.originalText)}</td>
            <td class="text-cell">${this.escapeHtml(result.translatedText)}</td>
            <td>${result.duration}</td>
            <td>${result.charactersPerSecond}</td>
        `;

    tbody.appendChild(row);

    // Scroll to the new row
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  updateRunningStats(results, elapsedTime) {
    const successfulResults = results.filter(r => r.status === 'success');
    const averageTime = successfulResults.length > 0
      ? Math.round(successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length)
      : 0;

    const totalCharacters = successfulResults.reduce((sum, r) => sum + r.originalText.length, 0);
    const throughput = elapsedTime > 0 ? Math.round((totalCharacters / elapsedTime) * 1000) : 0;

    document.getElementById('totalTranslations').textContent = results.length;
    document.getElementById('averageTime').textContent = averageTime;
    document.getElementById('totalTime').textContent = elapsedTime;
    document.getElementById('throughput').textContent = throughput;
  }

  updateBatchStats(results, totalTime) {
    const successfulResults = results.filter(r => r.status === 'success');
    const averageTime = successfulResults.length > 0
      ? Math.round(successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length)
      : 0;

    const totalCharacters = successfulResults.reduce((sum, r) => sum + r.originalText.length, 0);
    const throughput = totalTime > 0 ? Math.round((totalCharacters / totalTime) * 1000) : 0;

    document.getElementById('totalTranslations').textContent = results.length;
    document.getElementById('averageTime').textContent = averageTime;
    document.getElementById('totalTime').textContent = totalTime;
    document.getElementById('throughput').textContent = throughput;
  }

  displayBatchResults(results) {
    const tableContainer = document.getElementById('batchResultsTable');
    const table = document.createElement('table');
    table.innerHTML = `
            <thead>
                <tr>
                    <th>#</th>
                    <th>Original Text</th>
                    <th>Translated Text</th>
                    <th>Time (ms)</th>
                    <th>Chars/Sec</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(result => `
                    <tr class="${result.status === 'error' ? 'text-error' : ''}">
                        <td>${result.index}</td>
                        <td>${this.escapeHtml(result.originalText)}</td>
                        <td>${this.escapeHtml(result.translatedText)}</td>
                        <td>${result.duration}</td>
                        <td>${result.charactersPerSecond}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;

    tableContainer.innerHTML = '';
    tableContainer.appendChild(table);
  }
  exportResults() {
    if (this.batchResults.length === 0) {
      alert('No results to export');
      return;
    }

    // Get browser information
    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent;
      let browserName = 'Unknown';
      let browserVersion = 'Unknown';

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/(\d+\.\d+)/);
        browserVersion = match ? match[1] : 'Unknown';
      }

      return `${browserName} ${browserVersion}`;
    };

    // Get language pair information
    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const targetLanguage = document.getElementById('targetLanguage').value;
    const sourceName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage;
    const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    // Create CSV with metadata and results
    const timestamp = new Date().toISOString();
    const browserInfo = getBrowserInfo();

    const csvLines = [
      // Metadata section
      ['Translation Benchmark Export'],
      ['Generated:', timestamp],
      ['Browser:', browserInfo],
      ['Language Pair:', `${sourceName} → ${targetName}`],
      ['Source Language Code:', sourceLanguage],
      ['Target Language Code:', targetLanguage],
      ['Total Tests:', this.batchResults.length.toString()],
      [''], // Empty line separator

      // Results header
      ['Index', 'Original Text', 'Translated Text', 'Time (ms)', 'Characters/Second', 'Status'],

      // Results data
      ...this.batchResults.map(result => [
        result.index,
        `"${result.originalText.replace(/"/g, '""')}"`,
        `"${result.translatedText.replace(/"/g, '""')}"`,
        result.duration,
        result.charactersPerSecond,
        result.status
      ])];    // Convert to CSV string
    const csvContent = csvLines.map(row => row.join(',')).join('\n');    // Use UTF-8 encoding with proper MIME type - works in both Excel and text viewers
    // The key is using the right MIME type and file extension
    const fileTimestamp = timestamp.slice(0, 19).replace(/:/g, '-');
    const filename = `translation-benchmark-${browserInfo.replace(/\s+/g, '-')}-${fileTimestamp}.csv`;

    // Create blob with UTF-8 encoding but no BOM
    // This works because:
    // 1. Modern Excel versions detect UTF-8 automatically when opened properly
    // 2. Text viewers don't see any BOM artifacts
    // 3. The .csv extension helps Excel choose the right import method
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  clearResults() {
    this.batchResults = [];
    document.getElementById('batchResultsTable').innerHTML = '';
    document.getElementById('totalTranslations').textContent = '0';
    document.getElementById('averageTime').textContent = '0';
    document.getElementById('totalTime').textContent = '0';
    document.getElementById('throughput').textContent = '0'; document.getElementById('exportResults').disabled = true;
  } resetTranslator() {
    this.translator = null;
    this.isTranslatorReady = false;

    // Only enable initialization button if API is available
    const apiAvailable = 'Translator' in self;
    document.getElementById('initializeTranslator').disabled = !apiAvailable;
    document.getElementById('initializeTranslator').innerHTML = 'Initialize Translator';
    document.getElementById('translateSingle').disabled = true;
    document.getElementById('runBatchTest').disabled = true;
    // Clear results
    document.getElementById('initResult').innerHTML = '';
  }

  logResult(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.innerHTML = this.escapeHtml(message);
    element.className = `result-box ${type}`;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  calculateBenchmarkStats() {
    const totalChars = BENCHMARK_TEXTS.reduce((sum, text) => sum + text.length, 0);
    const avgLength = Math.round(totalChars / BENCHMARK_TEXTS.length);

    document.getElementById('totalChars').textContent = totalChars.toLocaleString();
    document.getElementById('avgLength').textContent = `${avgLength} chars`;
  }
  swapLanguages() {
    // Get current values
    const sourceValue = this.sourceLanguageSelect.getValue();
    const targetValue = this.targetLanguageSelect.getValue();
    
    // Check if there's a translated result to move to input
    const translatedTextElement = document.getElementById('translatedText');
    const inputTextElement = document.getElementById('inputText');
    const translatedText = translatedTextElement.textContent.trim();
    
    // If there's translated text, move it to the input field for reverse translation
    if (translatedText && translatedText !== '') {
      inputTextElement.value = translatedText;
      // Clear the translated text display
      translatedTextElement.textContent = '';
    }
    
    // Swap the values
    this.sourceLanguageSelect.setValue(targetValue);
    this.targetLanguageSelect.setValue(sourceValue);
    
    // Reset translator since language pair changed
    this.resetTranslator();
  }
}

// Searchable Language Select Component
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
    // Event listeners
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('focus', (e) => this.handleFocus(e));
    this.input.addEventListener('blur', (e) => this.handleBlur(e));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Click outside to close
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

  handleBlur(e) {
    // Delay to allow for option clicks
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
      // Group languages by category for better UX
      // Categories based on linguistic families and translation model clustering
      const categories = this.groupLanguagesByCategory(this.filteredLanguages);

      Object.entries(categories).forEach(([category, langs]) => {
        if (langs.length === 0) return;

        // Add category header if we have multiple categories
        if (Object.keys(categories).length > 1) {
          const categoryHeader = document.createElement('div');
          categoryHeader.className = 'searchable-select-category';
          categoryHeader.textContent = category;
          fragment.appendChild(categoryHeader);
        }

        langs.forEach((language, index) => {
          const option = document.createElement('div');
          option.className = 'searchable-select-option';
          // Store the filtered index as a data attribute
          option.setAttribute('data-filtered-index', this.filteredLanguages.indexOf(language).toString());
          option.innerHTML = `
            ${language.name}
            <span class="language-code">${language.code}</span>
          `;

          option.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent blur
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
      'Arabic & Middle Eastern': [],
      'Other': []
    };

    // Script and model-based categorization aligned with Chrome's on-device Translation API
    // Based on Edge translation model clustering and script families
    const coreCodes = ['en']; // Base language - always available
    const germanicCodes = ['de', 'nl', 'da', 'no', 'sv']; // Germanic family
    const romanceCodes = ['es', 'fr', 'it', 'pt', 'ca', 'ro']; // Romance family
    const latinSlavicCodes = ['pl', 'cs', 'sk', 'hr', 'sl']; // Slavic languages using Latin script
    const cyrillicCodes = ['ru', 'bg', 'uk']; // Languages using Cyrillic script
    const eastAsianCodes = ['zh-CN', 'zh-TW', 'ja', 'ko', 'th', 'vi', 'id']; // East/Southeast Asian
    const southAsianCodes = ['hi', 'bn', 'gu', 'kn', 'ml', 'mr', 'ta', 'te', 'ur']; // Indian subcontinent
    const arabicMiddleEasternCodes = ['ar', 'he', 'tr']; // Arabic and Middle Eastern
    const otherCodes = ['fi', 'hu', 'et', 'lv', 'lt', 'el']; // Finno-Ugric, Baltic, Greek

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
      } else if (arabicMiddleEasternCodes.includes(lang.code)) {
        categories['Arabic & Middle Eastern'].push(lang);
      } else {
        categories['Other'].push(lang);
      }
    });

    // Remove empty categories
    Object.keys(categories).forEach(key => {
      if (categories[key].length === 0) {
        delete categories[key];
      }
    });

    return categories;
  }

  updateHighlight() {
    const options = this.dropdown.querySelectorAll('.searchable-select-option');
    options.forEach((option) => {
      const optionIndex = parseInt(option.getAttribute('data-filtered-index'), 10);
      option.classList.toggle('highlighted', optionIndex === this.selectedIndex);
    });

    // Scroll highlighted option into view
    if (this.selectedIndex >= 0) {
      const highlightedOption = this.dropdown.querySelector(`.searchable-select-option[data-filtered-index="${this.selectedIndex}"]`);
      if (highlightedOption) {
        highlightedOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  selectLanguage(language) {
    this.setValue(language.code);
    this.close();

    // Trigger change event
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

// Language mappings for Chrome's on-device Translation API
// Based on official Chrome Translator API documentation and Chromium source
// Using BCP 47 language codes as documented at https://developer.chrome.com/docs/ai/translator-api
const LANGUAGE_NAMES = {
  // Core languages supported by Chrome's on-device Translation API
  'ar': 'Arabic',
  'bg': 'Bulgarian',
  'bn': 'Bengali',
  'ca': 'Catalan',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  'hr': 'Croatian',
  'cs': 'Czech',
  'da': 'Danish',
  'nl': 'Dutch',
  'en': 'English',
  'et': 'Estonian',
  'fi': 'Finnish',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'gu': 'Gujarati',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'it': 'Italian',
  'ja': 'Japanese',
  'kn': 'Kannada',
  'ko': 'Korean',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'ml': 'Malayalam',
  'mr': 'Marathi',
  'no': 'Norwegian',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ro': 'Romanian',
  'ru': 'Russian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'es': 'Spanish',
  'sv': 'Swedish',
  'ta': 'Tamil',
  'te': 'Telugu',
  'th': 'Thai',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'ur': 'Urdu',
  'vi': 'Vietnamese'
};

// Supported language pairs for Chrome's on-device Translation API
// Based on official documentation - most languages support bidirectional translation with English
const SUPPORTED_PAIRS = [
  // English pairs (comprehensive support with all languages)
  ['en', 'ar'], ['en', 'bg'], ['en', 'bn'], ['en', 'ca'], ['en', 'zh-CN'], 
  ['en', 'zh-TW'], ['en', 'hr'], ['en', 'cs'], ['en', 'da'], ['en', 'nl'], 
  ['en', 'et'], ['en', 'fi'], ['en', 'fr'], ['en', 'de'], ['en', 'el'], 
  ['en', 'gu'], ['en', 'he'], ['en', 'hi'], ['en', 'hu'], ['en', 'id'], 
  ['en', 'it'], ['en', 'ja'], ['en', 'kn'], ['en', 'ko'], ['en', 'lv'], 
  ['en', 'lt'], ['en', 'ml'], ['en', 'mr'], ['en', 'no'], ['en', 'pl'], 
  ['en', 'pt'], ['en', 'ro'], ['en', 'ru'], ['en', 'sk'], ['en', 'sl'], 
  ['en', 'es'], ['en', 'sv'], ['en', 'ta'], ['en', 'te'], ['en', 'th'], 
  ['en', 'tr'], ['en', 'uk'], ['en', 'ur'], ['en', 'vi']
];

// Check if a language pair is supported by Chrome's on-device Translation API
function isSupportedPair(source, target) {
  // Same language check
  if (source === target) return false;
  
  // Check if both languages exist in our language list
  if (!LANGUAGE_NAMES[source] || !LANGUAGE_NAMES[target]) return false;
  
  // Check our explicit supported pairs list (bidirectional)
  const isInSupportedPairs = SUPPORTED_PAIRS.some(pair =>
    (pair[0] === source && pair[1] === target) ||
    (pair[1] === source && pair[0] === target)
  );
  
  return isInSupportedPairs;
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new TranslationAPIDemo();
});

// Add error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
