# Edge Translation API Demo

A professional demo page for testing Microsoft Edge's built-in on-device Translation API. This demo provides comprehensive translation benchmarking with a clean, intuitive UI and supports all languages available in Edge's Translation models.

## Features

### 🏷️ Standards Compliance
- **Microsoft Language Codes**: All language selection and API calls use Microsoft Translator API language codes as defined in the Edge translation models
- **Official Edge API**: Uses Edge's built-in Translation API with comprehensive language support based on Microsoft's translation models
- **Language Code Examples**: `en` (English), `zh-hans` (Chinese Simplified), `zh-hant` (Chinese Traditional), `he` (Hebrew), `hi` (Hindi)

### 🔍 API Availability Check
- Detects if Translation API is available
- Checks language pair support for specific source/target combinations
- Shows API status with visual indicators

### 🌐 Smart Language Selection
- **Searchable Language Dropdowns**: Type to quickly find any of 130+ officially supported languages
- **Script-Based Categorization**: Languages grouped by script families (Latin Script Slavic, Cyrillic Script, East Asian, South Asian, Arabic Script, African Languages, etc.)
- **Keyboard Navigation**: Use arrow keys and Enter to navigate options
- **Language Code Display**: Shows both language names and Microsoft language codes

### 🚀 Translator Initialization
- Initialize translator for specific language pairs
- **Comprehensive Support**: Supports all language pairs available in Microsoft's Edge translation models
- Monitor download progress for language models
- Real-time feedback on initialization status

### 📝 Single Translation Testing
- Translate individual text snippets
- Measure translation time and throughput
- Character-per-second performance metrics

### 📊 Batch Translation Benchmark
- **Standardized Benchmark**: Uses a fixed set of 15 benchmark texts for consistent, comparable results
- Real-time results display as each translation completes
- Comprehensive performance statistics
- Export results to CSV format

## Supported Languages

The demo supports **43 languages** officially supported by Chrome's on-device Translation API, as documented in the [Chrome Developer documentation](https://developer.chrome.com/docs/ai/translator-api). This ensures compatibility and reliability.

### Supported Language Categories

#### 🌟 **Major Languages (Most Popular)**
- English, Spanish, French, German, Italian, Portuguese, Russian, Chinese (Simplified/Traditional), Japanese, Korean, Arabic, Hindi

#### 🇪🇺 **European Languages**
- Bulgarian, Catalan, Croatian, Czech, Danish, Dutch, Estonian, Finnish, German, Greek, Hungarian, Italian, Latvian, Lithuanian, Norwegian, Polish, Romanian, Slovak, Slovenian, Swedish, Turkish, Ukrainian

#### 🌏 **Asian Languages**
- Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Thai, Vietnamese, Indonesian

#### 🇮🇳 **South Asian Languages**
- Arabic, Bengali, Gujarati, Hebrew, Hindi, Kannada, Malayalam, Marathi, Tamil, Telugu, Urdu

### Language Support Details

- **✅ Official Chrome API**: All 43 languages are officially supported by Chrome's on-device Translation API
- **🔄 Bidirectional Translation**: Most language pairs support translation in both directions
- **⚡ On-Device Processing**: No cloud dependency, translations happen locally
- **📱 Cross-Platform**: Works on Windows, macOS, and Linux (Chrome 138+)

### Hardware Requirements

Chrome's on-device Translation API requires:
- **Operating System**: Windows, macOS 13+, or Linux
- **Storage**: At least 22 GB available space
- **GPU**: More than 4 GB VRAM
- **Network**: Unmetered connection for initial model download

### Translation Quality

- **Highest Quality**: English ↔ Major languages (Spanish, French, German, Chinese, Japanese, etc.)
- **Good Quality**: Regional language pairs and commonly used combinations
- **Note**: Translation quality may vary based on language complexity and available training data

## Browser Requirements

### Chrome Requirements
- **Browser**: Chrome 138+ 
- **OS**: Windows 10/11, macOS 13+, or Linux
- **Storage**: At least 22 GB available space
- **Memory**: 8+ GB RAM recommended (4+ GB VRAM for optimal performance)
- **Network**: Unmetered connection for model downloads

### API Availability
The Translation API is part of Chrome's Built-in AI features and requires:
1. Compatible browser version
2. Sufficient system resources
3. Model download (automatic on first use)

## How to Use

1. **Open the Demo**: Navigate to `index.html` in Chrome 138+
2. **Check API Status**: The page automatically checks API availability
3. **Select Languages**: 
   - **Type to Search**: Click on language fields and type to find languages quickly
   - **Browse Categories**: Languages are organized by regions for easy browsing
   - **Keyboard Navigation**: Use arrow keys to navigate, Enter to select
4. **Initialize Translator**: Click "Initialize Translator" to set up the translation model
5. **Test Translations**: Use single translation or batch testing features

## File Structure

```
ai/translate/
├── index.html          # Main demo page
├── style.css           # Styling and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## Key Features Explained

### API Detection
The demo automatically detects if the Translation API is available using:
```javascript
if ('Translator' in self) {
    // API is available
}
```

### Language Pair Checking
Before initialization, the demo checks if a language pair is supported:
```javascript
const availability = await Translator.availability({
    sourceLanguage: 'en',
    targetLanguage: 'es'
});
```

### Progress Monitoring
During translator initialization, download progress is monitored:
```javascript
const translator = await Translator.create({
    sourceLanguage: 'en',
    targetLanguage: 'es',
    monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
            console.log(`Downloaded ${e.loaded * 100}%`);
        });
    }
});
```

### Performance Metrics
The demo tracks several performance metrics:
- **Translation Time**: Time taken for individual translations
- **Characters per Second**: Throughput measurement
- **Batch Statistics**: Average times, total time, overall throughput

## Troubleshooting

### API Not Available
- Ensure you're using Chrome 138+
- Check that your system meets hardware requirements
- Verify network connection for model downloads

### Language Pair Not Supported
- Try different language combinations
- Check the Chrome documentation for supported language pairs
- Most languages support translation with English

### Slow Performance
- Ensure sufficient system resources
- Close other resource-intensive applications
- Check network connection for initial model downloads

## Development Notes

### Code Structure
- **Modular Design**: Main functionality wrapped in `TranslationAPIDemo` class
- **Searchable Language Selection**: `SearchableLanguageSelect` component for improved UX
- **Error Handling**: Comprehensive error handling for API failures
- **Responsive UI**: Mobile-friendly design with CSS Grid/Flexbox
- **Accessibility**: ARIA labels and semantic HTML structure

### Styling
- **Modern Design**: Gradient backgrounds and smooth animations
- **Visual Feedback**: Loading indicators and status badges
- **Responsive Layout**: Adapts to different screen sizes
- **Color Coding**: Success/error states with appropriate colors

## Contributing

To extend this demo:
1. Add new language pairs based on Chrome's official API updates
2. Implement additional performance metrics
3. Add visualization charts for batch results
4. Enhance the standardized benchmark texts
5. Add language family grouping in the UI

## References

- [Chrome Translation API Documentation](https://developer.chrome.com/docs/ai/translator-api)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [BCP 47 Language Tags](https://www.rfc-editor.org/info/bcp47)
- [Chrome Early Preview Program](https://developer.chrome.com/docs/ai/join-epp)

## License

This demo is provided for educational and testing purposes. Please refer to Chrome's API documentation for usage guidelines and limitations.
