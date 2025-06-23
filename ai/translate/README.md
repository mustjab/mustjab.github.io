# Edge Translation API Demo

A compact, professional demo page for testing Chrome's built-in Translation API in Microsoft Edge. This demo focuses on standardized translation benchmarking with a clean, concise UI, modeled after Jose Lea's benchmark page structure.

## Features

### 🔍 API Availability Check
- Detects if Translation API is available
- Checks language pair support for specific source/target combinations
- Shows API status with visual indicators

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

The demo supports the following **bidirectional** translation pairs:

- 🇺🇸 **English** ↔️ 🇨🇳 **Chinese (Simplified)** (`en` ↔️ `zh`)
- 🇺🇸 **English** ↔️ 🇹🇼 **Chinese (Traditional)** (`en` ↔️ `zh-Hant`)
- 🇺🇸 **English** ↔️ 🇯🇵 **Japanese** (`en` ↔️ `ja`)
- 🇺🇸 **English** ↔️ 🇵🇹 **Portuguese** (`en` ↔️ `pt`)
- 🇺🇸 **English** ↔️ 🇷🇺 **Russian** (`en` ↔️ `ru`)
- 🇺🇸 **English** ↔️ 🇪🇸 **Spanish** (`en` ↔️ `es`)
- 🇺🇸 **English** ↔️ 🇹🇷 **Turkish** (`en` ↔️ `tr`)
- 🇺🇸 **English** ↔️ 🇮🇳 **Hindi** (`en` ↔️ `hi`)
- 🇺🇸 **English** ↔️ 🇻🇳 **Vietnamese** (`en` ↔️ `vi`)
- 🇺🇸 **English** ↔️ 🇧🇩 **Bengali** (`en` ↔️ `bn`)
- 🇺🇸 **English** ↔️ 🇮🇳 **Kannada** (`en` ↔️ `kn`)
- 🇺🇸 **English** ↔️ 🇮🇳 **Tamil** (`en` ↔️ `ta`)
- 🇺🇸 **English** ↔️ 🇮🇳 **Telugu** (`en` ↔️ `te`)
- 🇺🇸 **English** ↔️ 🇮🇳 **Marathi** (`en` ↔️ `mr`)

All language pairs work bidirectionally, meaning you can translate from English to any of these languages, or from any of these languages back to English.

## Browser Requirements

### Chrome/Edge Requirements
- **Browser**: Chrome 138+ or Microsoft Edge (Chromium-based)
- **OS**: Windows 10/11, macOS 13+, or Linux
- **Storage**: At least 22 GB available space
- **Memory**: 4+ GB VRAM recommended
- **Network**: Unlimited data connection (for model downloads)

### API Availability
The Translation API is part of Chrome's Built-in AI features and requires:
1. Compatible browser version
2. Sufficient system resources
3. Model download (automatic on first use)

## How to Use

1. **Open the Demo**: Navigate to `index.html` in a compatible browser
2. **Check API Status**: The page automatically checks API availability
3. **Select Languages**: Choose source and target languages from dropdowns
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
1. Add new language pairs to the dropdown options
2. Implement additional performance metrics
3. Add visualization charts for batch results
4. Enhance the standardized benchmark texts

## References

- [Chrome Translation API Documentation](https://developer.chrome.com/docs/ai/translator-api)
- [Chrome Built-in AI Overview](https://developer.chrome.com/docs/ai/built-in)
- [Jose Lea's Demo Page](https://joselea.github.io/) (benchmark inspiration)

## License

This demo is provided for educational and testing purposes. Please refer to Chrome's API documentation for usage guidelines and limitations.