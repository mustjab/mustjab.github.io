// Language Detection API Demo Script

// Sample texts in different languages for testing
const SAMPLE_TEXTS = [
    {
        text: "The quick brown fox jumps over the lazy dog.",
        expectedLang: "en",
        language: "English"
    },
    {
        text: "Bonjour, comment allez-vous aujourd'hui?",
        expectedLang: "fr",
        language: "French"
    },
    {
        text: "Hallo und herzlich willkommen!",
        expectedLang: "de",
        language: "German"
    },
    {
        text: "Hola, ¿cómo estás? Me alegro de verte.",
        expectedLang: "es",
        language: "Spanish"
    },
    {
        text: "Ciao, come stai? È una bella giornata.",
        expectedLang: "it",
        language: "Italian"
    },
    {
        text: "こんにちは、お元気ですか？",
        expectedLang: "ja",
        language: "Japanese"
    },
    {
        text: "你好，你今天好吗？",
        expectedLang: "zh",
        language: "Chinese (Simplified)"
    },
    {
        text: "안녕하세요, 오늘 어떻게 지내세요?",
        expectedLang: "ko",
        language: "Korean"
    },
    {
        text: "Привет, как дела сегодня?",
        expectedLang: "ru",
        language: "Russian"
    },
    {
        text: "مرحبا، كيف حالك اليوم؟",
        expectedLang: "ar",
        language: "Arabic"
    },
    {
        text: "Olá, como você está hoje?",
        expectedLang: "pt",
        language: "Portuguese"
    },
    {
        text: "Hallo, hoe gaat het vandaag met je?",
        expectedLang: "nl",
        language: "Dutch"
    },
    {
        text: "Hej, hur mår du idag?",
        expectedLang: "sv",
        language: "Swedish"
    },
    {
        text: "Cześć, jak się masz dzisiaj?",
        expectedLang: "pl",
        language: "Polish"
    },
    {
        text: "Merhaba, bugün nasılsın?",
        expectedLang: "tr",
        language: "Turkish"
    }
];

// Language code to full name mapping
const LANGUAGE_NAMES = {
    'af': 'Afrikaans',
    'ar': 'Arabic',
    'bg': 'Bulgarian',
    'bn': 'Bengali',
    'ca': 'Catalan',
    'cs': 'Czech',
    'cy': 'Welsh',
    'da': 'Danish',
    'de': 'German',
    'el': 'Greek',
    'en': 'English',
    'es': 'Spanish',
    'et': 'Estonian',
    'fa': 'Persian',
    'fi': 'Finnish',
    'fr': 'French',
    'gu': 'Gujarati',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hr': 'Croatian',
    'hu': 'Hungarian',
    'id': 'Indonesian',
    'it': 'Italian',
    'ja': 'Japanese',
    'kn': 'Kannada',
    'ko': 'Korean',
    'lt': 'Lithuanian',
    'lv': 'Latvian',
    'mk': 'Macedonian',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'ne': 'Nepali',
    'nl': 'Dutch',
    'no': 'Norwegian',
    'pa': 'Punjabi',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'sq': 'Albanian',
    'sv': 'Swedish',
    'sw': 'Swahili',
    'ta': 'Tamil',
    'te': 'Telugu',
    'th': 'Thai',
    'tl': 'Tagalog',
    'tr': 'Turkish',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'vi': 'Vietnamese',
    'zh': 'Chinese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)'
};

class LanguageDetectionDemo {
    constructor() {
        this.detector = null;
        this.batchResults = [];
        this.isDetectorReady = false;

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.populateSamples();
        await this.checkAPIAvailability();
    }

    setupEventListeners() {
        // Detector Initialization
        document.getElementById('initializeDetector').addEventListener('click', () => this.initializeDetector());

        // Language Detection
        document.getElementById('detectLanguage').addEventListener('click', () => this.detectLanguage());

        // Batch Detection
        document.getElementById('runBatchTest').addEventListener('click', () => this.runBatchTest());
        document.getElementById('exportBatchResults').addEventListener('click', () => this.exportBatchResults());
        document.getElementById('clearBatchResults').addEventListener('click', () => this.clearBatchResults());
    }

    populateSamples() {
        const samplesGrid = document.getElementById('samplesGrid');
        samplesGrid.innerHTML = '';

        SAMPLE_TEXTS.forEach((sample, index) => {
            const sampleCard = document.createElement('div');
            sampleCard.className = 'sample-card';
            sampleCard.innerHTML = `
        <div class="sample-language">${sample.language}</div>
        <div class="sample-text">"${sample.text}"</div>
      `;
            sampleCard.addEventListener('click', () => {
                document.getElementById('inputText').value = sample.text;
                if (this.isDetectorReady) {
                    this.detectLanguage();
                }
            });
            samplesGrid.appendChild(sampleCard);
        });
    }

    async checkAPIAvailability() {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        statusIndicator.className = 'status-indicator checking';
        statusText.textContent = 'Checking API availability...';

        try {
            let detectorAvailable = false;

            // Check Language Detection API
            if ('LanguageDetector' in self) {
                detectorAvailable = true;
            }

            // Update status indicator
            if (detectorAvailable) {
                statusIndicator.className = 'status-indicator available';
                statusText.textContent = 'Language Detection API is available';
                // Enable initialization button when API is available
                document.getElementById('initializeDetector').disabled = false;
            } else {
                statusIndicator.className = 'status-indicator unavailable';
                statusText.textContent = 'Language Detection API is not available in this browser';
                this.showMessage('initResult', 'Language Detection API is not supported. Please use Chrome 138+ with built-in AI enabled.', 'error');
            }
        } catch (error) {
            statusIndicator.className = 'status-indicator unavailable';
            statusText.textContent = 'Error checking API availability';
            console.error('API availability check error:', error);
        }
    }

    async initializeDetector() {
        const initBtn = document.getElementById('initializeDetector');
        const progressContainer = document.getElementById('downloadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const resultDiv = document.getElementById('initResult');

        initBtn.disabled = true;
        resultDiv.innerHTML = '';
        progressContainer.style.display = 'none';

        try {
            this.showMessage('initResult', 'Checking language detector availability...', 'info');

            // Check availability
            const availability = await LanguageDetector.availability();
            console.log('Language Detector availability:', availability);

            if (availability === 'no') {
                this.showMessage('initResult', 'Language Detection is not available on this device.', 'error');
                return;
            }

            if (availability === 'after-download') {
                this.showMessage('initResult', 'Downloading language detection model...', 'info');
                progressContainer.style.display = 'block';
            } else if (availability === 'readily') {
                this.showMessage('initResult', 'Language detection model is already available. Initializing...', 'info');
            }

            // Create detector with download progress monitoring
            this.detector = await LanguageDetector.create({
                monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                        const percent = Math.round(e.loaded * 100);
                        progressFill.style.width = percent + '%';
                        progressText.textContent = percent + '%';
                        console.log(`Downloaded ${percent}%`);
                    });
                }
            });

            progressContainer.style.display = 'none';
            this.isDetectorReady = true;

            this.showMessage('initResult', 'Language detector initialized successfully!', 'success');

            // Enable detection buttons
            document.getElementById('detectLanguage').disabled = false;
            document.getElementById('runBatchTest').disabled = false;

        } catch (error) {
            progressContainer.style.display = 'none';
            this.showMessage('initResult', `Error initializing detector: ${error.message}`, 'error');
            console.error('Detector initialization error:', error);
        } finally {
            initBtn.disabled = false;
        }
    }

    async detectLanguage() {
        if (!this.detector) {
            alert('Please initialize the language detector first.');
            return;
        }

        const inputText = document.getElementById('inputText').value.trim();
        if (!inputText) {
            alert('Please enter text to detect.');
            return;
        }

        const detectBtn = document.getElementById('detectLanguage');
        const resultsDiv = document.getElementById('detectionResults');

        detectBtn.disabled = true;
        detectBtn.textContent = 'Detecting...';

        try {
            const startTime = performance.now();
            const results = await this.detector.detect(inputText);
            const endTime = performance.now();
            const detectionTime = Math.round(endTime - startTime);

            console.log('Detection results:', results);

            // Display results
            this.displayDetectionResults(results, detectionTime);
            resultsDiv.style.display = 'block';

        } catch (error) {
            alert(`Error detecting language: ${error.message}`);
            console.error('Detection error:', error);
        } finally {
            detectBtn.disabled = false;
            detectBtn.textContent = 'Detect Language';
        }
    }

    displayDetectionResults(results, detectionTime) {
        if (!results || results.length === 0) {
            document.getElementById('detectionResults').innerHTML = '<p>No languages detected.</p>';
            return;
        }

        // Display primary result (most likely language)
        const primaryResult = results[0];
        const primaryLanguageName = this.getLanguageName(primaryResult.detectedLanguage);
        const primaryConfidence = (primaryResult.confidence * 100).toFixed(2);

        document.getElementById('primaryLanguage').innerHTML = `
      <strong>${primaryLanguageName}</strong> (${primaryResult.detectedLanguage})
      <span class="detection-time">Detected in ${detectionTime}ms</span>
    `;
        document.getElementById('primaryConfidence').textContent = `${primaryConfidence}%`;
        document.getElementById('primaryConfidenceBar').style.width = `${primaryConfidence}%`;

        // Display all candidates
        const candidatesList = document.getElementById('allCandidates');
        candidatesList.innerHTML = '';

        results.forEach((result, index) => {
            const languageName = this.getLanguageName(result.detectedLanguage);
            const confidence = (result.confidence * 100).toFixed(2);

            const candidateItem = document.createElement('div');
            candidateItem.className = 'candidate-item';
            candidateItem.innerHTML = `
        <div class="candidate-rank">#${index + 1}</div>
        <div class="candidate-info">
          <div class="candidate-language">
            <strong>${languageName}</strong> <span class="candidate-code">(${result.detectedLanguage})</span>
          </div>
          <div class="confidence-container">
            <div class="confidence-bar-mini" style="width: ${confidence}%"></div>
            <span class="confidence-percent">${confidence}%</span>
          </div>
        </div>
      `;
            candidatesList.appendChild(candidateItem);
        });
    }

    async runBatchTest() {
        if (!this.detector) {
            alert('Please initialize the language detector first.');
            return;
        }

        const batchInput = document.getElementById('batchInput').value.trim();
        let texts = [];

        if (batchInput) {
            // Use user-provided texts
            texts = batchInput.split('\n').filter(line => line.trim());
        } else {
            // Use sample texts
            texts = SAMPLE_TEXTS.map(s => s.text);
        }

        if (texts.length === 0) {
            alert('Please enter texts to test (one per line) or use the default samples.');
            return;
        }

        const runBtn = document.getElementById('runBatchTest');
        const resultsDiv = document.getElementById('batchResults');
        const resultsList = document.getElementById('batchResultsList');

        runBtn.disabled = true;
        runBtn.textContent = 'Running Tests...';
        resultsList.innerHTML = '<p>Processing...</p>';
        resultsDiv.style.display = 'block';

        this.batchResults = [];
        let totalTime = 0;
        let totalConfidence = 0;

        try {
            for (let i = 0; i < texts.length; i++) {
                const text = texts[i];
                const startTime = performance.now();
                const results = await this.detector.detect(text);
                const endTime = performance.now();
                const detectionTime = Math.round(endTime - startTime);

                const topResult = results[0];
                const batchResult = {
                    index: i + 1,
                    text: text,
                    detectedLanguage: topResult.detectedLanguage,
                    confidence: topResult.confidence,
                    detectionTime: detectionTime,
                    allResults: results
                };

                this.batchResults.push(batchResult);
                totalTime += detectionTime;
                totalConfidence += topResult.confidence;

                // Update progress
                this.displayBatchResults();
            }

            // Update stats
            const avgTime = Math.round(totalTime / texts.length);
            const avgConfidence = ((totalConfidence / texts.length) * 100).toFixed(2);

            document.getElementById('batchTotal').textContent = texts.length;
            document.getElementById('batchAvgTime').textContent = avgTime;
            document.getElementById('batchAvgConfidence').textContent = avgConfidence + '%';

            // Enable export and clear buttons
            document.getElementById('exportBatchResults').disabled = false;
            document.getElementById('clearBatchResults').disabled = false;

        } catch (error) {
            alert(`Error during batch testing: ${error.message}`);
            console.error('Batch test error:', error);
        } finally {
            runBtn.disabled = false;
            runBtn.textContent = 'Run Batch Test';
        }
    }

    displayBatchResults() {
        const resultsList = document.getElementById('batchResultsList');
        resultsList.innerHTML = '';

        this.batchResults.forEach((result) => {
            const languageName = this.getLanguageName(result.detectedLanguage);
            const confidence = (result.confidence * 100).toFixed(2);

            const resultCard = document.createElement('div');
            resultCard.className = 'batch-result-card';
            resultCard.innerHTML = `
        <div class="batch-result-header">
          <span class="batch-result-number">#${result.index}</span>
          <span class="batch-result-time">${result.detectionTime}ms</span>
        </div>
        <div class="batch-result-text">"${this.truncateText(result.text, 100)}"</div>
        <div class="batch-result-detection">
          <strong>${languageName}</strong> (${result.detectedLanguage})
          <span class="batch-confidence">${confidence}% confidence</span>
        </div>
      `;
            resultsList.appendChild(resultCard);
        });
    }

    exportBatchResults() {
        if (this.batchResults.length === 0) {
            alert('No results to export.');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            totalTests: this.batchResults.length,
            results: this.batchResults.map(r => ({
                index: r.index,
                text: r.text,
                detectedLanguage: r.detectedLanguage,
                languageName: this.getLanguageName(r.detectedLanguage),
                confidence: r.confidence,
                detectionTime: r.detectionTime,
                topCandidates: r.allResults.slice(0, 3).map(res => ({
                    language: res.detectedLanguage,
                    confidence: res.confidence
                }))
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `language-detection-results-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearBatchResults() {
        this.batchResults = [];
        document.getElementById('batchResults').style.display = 'none';
        document.getElementById('batchResultsList').innerHTML = '';
        document.getElementById('exportBatchResults').disabled = true;
        document.getElementById('clearBatchResults').disabled = true;
    }

    getLanguageName(langCode) {
        return LANGUAGE_NAMES[langCode] || langCode;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    showMessage(elementId, message, type) {
        const element = document.getElementById(elementId);
        element.className = `result-box ${type}`;
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LanguageDetectionDemo();
});
