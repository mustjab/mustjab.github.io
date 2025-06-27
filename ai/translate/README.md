# Edge Translation API Demo

A compact, professional demo page for testing Chrome's built-in Translation API in Microsoft Edge. This demo focuses on standardized translation benchmarking with a clean, concise UI, modeled after Jose Lea's benchmark page structure.

## Features

### 🏷️ Standards Compliance
- **BCP 47 Language Tags**: All language selection and API calls use standardized [BCP 47 language tags](https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag) for maximum compatibility
- **Web API Integration**: Fully compatible with Chrome's built-in Translation API and other web translation services
- **Language Code Examples**: `en` (English), `zh-CN` (Chinese Simplified), `zh-TW` (Chinese Traditional), `he` (Hebrew), `jv` (Javanese)

### 🔍 API Availability Check
- Detects if Translation API is available
- Checks language pair support for specific source/target combinations
- Shows API status with visual indicators

### 🌐 Smart Language Selection
- **Searchable Language Dropdowns**: Type to quickly find any of 100+ supported languages
- **Categorized Results**: Languages grouped by regions (Popular, African, Asian, European, etc.)
- **Keyboard Navigation**: Use arrow keys and Enter to navigate options
- **Language Code Display**: Shows both language names and ISO codes

### 🚀 Translator Initialization
- Initialize translator for specific language pairs
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

The demo now supports **100+ languages** using Chrome's built-in Translation API. All language pairs work **bidirectionally** with most languages supporting translation to and from English, with many supporting direct language-to-language translation.

### Language Categories

#### � **African Languages (21)**
- Afrikaans, Amharic, Hausa, Igbo, Ganda, Lingala, Dholuo, Malagasy, Sesotho sa Leboa, Nyanja, Rundi, Kinyarwanda, Shona, Somali, Sesotho, Swahili, Tigrinya, Setswana, Xhosa, Yoruba, Zulu

#### � **Asian Languages (8)**
- Chinese (Simplified), Chinese (Traditional), Japanese, Korean, Chinese (Literary), Cantonese (Traditional), Mongolian (Cyrillic), Mongolian (Traditional)

#### 🌏 **Southeast Asian Languages (11)**
- Vietnamese, Thai, Khmer, Lao, Myanmar (Burmese), Indonesian, Malay, Filipino, Javanese, Sundanese, Cebuano

#### 🕌 **South Asian Languages (25)**
- Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Odia, Assamese, Nepali, Sinhala, Divehi, Sanskrit, Bhojpuri, Maithili, Magahi, Awadhi, Chhattisgarhi, Konkani, Manipuri, Santali, Bodo, Dogri, Khasi, Mizo

#### �️ **Romance Languages (11)**
- Spanish, French, French (Canada), Italian, Portuguese, Portuguese (Portugal), Catalan, Galician, Occitan, Romanian, Latin

#### � **Germanic Languages (8)**
- German, Dutch, Danish, Swedish, Norwegian, Icelandic, Faroese, Luxembourgish

#### 🪆 **Slavic Languages (15)**
- Russian, Ukrainian, Polish, Czech, Slovak, Croatian, Serbian (Latin), Serbian (Cyrillic), Bosnian, Slovenian, Bulgarian, Macedonian, Belarusian, Lower Sorbian, Upper Sorbian

#### � **Turkic Languages (9)**
- Turkish, Azerbaijani, Kazakh, Kyrgyz, Tajik, Tatar, Uzbek (Latin), Turkmen, Uyghur

#### 🕌 **Middle Eastern Languages (10)**
- Arabic, Persian, Hebrew, Urdu, Pashto, Dari, Kurdish (Central), Kurdish (Northern), Sindhi, Kashmiri

#### �️ **Other European Languages (13)**
- Greek, Basque, Maltese, Finnish, Estonian, Latvian, Lithuanian, Hungarian, Armenian, Georgian, Irish, Welsh

#### ⛰️ **Caucasian Languages (3)**
- Chechen, Chuvash, Bashkir

#### �️ **Pacific Languages (7)**
- Māori, Hawaiian, Samoan, Tongan, Fijian, Tahitian, Tetum

#### � **American Languages (4)**
- Haitian Creole, Hmong Daw, Querétaro Otomi, Yucatec Maya

#### 🧊 **Arctic Languages (3)**
- Inuktitut, Inuktitut (Latin), Inuinnaqtun

#### 🛸 **Constructed Languages (1)**
- Klingon (Latin)

#### �️ **Tibetan Languages (2)**
- Tibetan, Dzongkha

### Translation Patterns

The multilingual models support various translation patterns:
- **English ↔️ Any Language**: Direct bidirectional translation
- **Any Language → English → Any Language**: Pivot translation through English
- **Multilingual Models**: Some models support multiple target languages simultaneously

### Model Architecture

The language support is based on Microsoft's multilingual translation models optimized for Edge devices:
- **36 multilingual models** covering 305+ unique languages
- **4-bit quantized ONNX models** optimized for performance
- **Grouped by linguistic families** for optimal model efficiency
- **Bidirectional support** for all language pairs with English

## Browser Requirements

### Chrome/Edge Requirements
- **Browser**: Chrome 138+ or Microsoft Edge (Chromium-based)
- **OS**: Windows 10/11, macOS 13+, or Linux
- **Storage**: At least 5+ GB available space (multilingual models are larger)
- **Memory**: 8+ GB RAM recommended (4+ GB VRAM for optimal performance)
- **Network**: Unlimited data connection (for model downloads - models can be several GB each)

### API Availability
The Translation API is part of Chrome's Built-in AI features and requires:
1. Compatible browser version
2. Sufficient system resources
3. Model download (automatic on first use)

## How to Use

1. **Open the Demo**: Navigate to `index.html` in a compatible browser
2. **Check API Status**: The page automatically checks API availability
3. **Select Languages**: 
   - **Type to Search**: Click on language fields and type to find languages quickly
   - **Browse Categories**: Languages are organized by regions for easy browsing
   - **Keyboard Navigation**: Use arrow keys to navigate, Enter to select
4. **Check Availability**: Click "Check Availability" to verify language pair support
5. **Initialize Translator**: Click "Initialize Translator" to set up the translation model
6. **Test Translations**: Use single translation or batch testing features

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
- Ensure you're using Chrome 138+ or compatible Edge version
- Check that your system meets hardware requirements
- Verify network connection for model downloads

### Language Pair Not Supported
- Try different language combinations
- Check the Chrome documentation for supported language pairs
- Some languages may require additional downloads

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
1. Add new language pairs to the dropdown options (based on available Edge models)
2. Implement additional performance metrics for multilingual models
3. Add visualization charts for batch results across language families
4. Enhance the standardized benchmark texts for better cross-linguistic evaluation
5. Add model-specific performance comparisons
6. Implement language family grouping in the UI

## References

- [Chrome Translation API Documentation](https://developer.chrome.com/docs/ai/translator-api)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Microsoft Translator Edge Integration](https://docs.microsoft.com/translator/)
- [Jose Lea's Demo Page](https://joselea.github.io/) (benchmark inspiration)
- [Microsoft Multilingual Models](https://edgemodelstorage.blob.core.windows.net/models/Translation/) (Edge Team)

## License

This demo is provided for educational and testing purposes. Please refer to Chrome's API documentation for usage guidelines and limitations.