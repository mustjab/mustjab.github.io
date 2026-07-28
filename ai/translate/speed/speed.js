// Standardized benchmark texts for batch test (~300-500 chars each, ~5500 total)
const BENCHMARK_TEXTS = [
  "The rapid advancement of artificial intelligence has fundamentally transformed how businesses operate across virtually every industry. Companies are leveraging machine learning algorithms to automate complex processes, predict market trends, and deliver personalized customer experiences at unprecedented scale.",
  "In the field of modern medicine, researchers are making remarkable breakthroughs by combining genomic data analysis with sophisticated computational models. These innovations enable earlier disease detection, more targeted therapeutic interventions, and the development of precision medicine approaches tailored to individual genetic profiles.",
  "The global transition toward renewable energy sources represents one of the most significant economic and environmental shifts in human history. Solar and wind power installations continue to grow exponentially, while advances in battery storage technology are addressing the intermittency challenges that previously limited widespread adoption of clean energy alternatives.",
  "International trade agreements and diplomatic negotiations require exceptional linguistic precision to ensure that all parties fully understand the terms and implications of complex multilateral arrangements. Professional translators play a crucial role in facilitating cross-cultural communication and preventing costly misunderstandings between nations.",
  "Urban planning and sustainable city design have become increasingly important as the global population continues to concentrate in metropolitan areas. Innovative approaches to public transportation, green infrastructure, and mixed-use development are helping cities reduce their environmental footprint while improving quality of life for residents.",
  "The evolution of cybersecurity practices reflects the growing sophistication of digital threats facing organizations and individuals worldwide. Advanced persistent threats, ransomware attacks, and social engineering schemes require comprehensive defense strategies that combine technical safeguards with ongoing employee education and awareness programs.",
  "Marine biology research has revealed fascinating insights into the complex ecosystems that exist beneath the ocean surface. Scientists studying coral reef degradation, deep-sea hydrothermal vents, and marine biodiversity patterns are contributing valuable knowledge that informs conservation policies and environmental protection efforts around the world.",
  "The democratization of financial services through technology has opened new pathways for economic participation among previously underserved populations. Mobile banking platforms, peer-to-peer lending networks, and cryptocurrency systems are creating alternative financial infrastructure that operates alongside traditional banking institutions.",
  "Archaeological discoveries continue to reshape our understanding of ancient civilizations and the complex societies that flourished thousands of years before the modern era. Advanced imaging technologies and DNA analysis techniques are providing researchers with unprecedented tools to reconstruct historical narratives and understand human migration patterns.",
  "The intersection of neuroscience and computer science has given rise to brain-computer interface technologies that hold enormous potential for treating neurological disorders and enhancing human cognitive capabilities. Researchers are developing implantable devices that can interpret neural signals and translate them into commands for external systems.",
  "Agricultural innovation is essential for feeding a growing global population while minimizing environmental degradation and preserving natural resources for future generations. Precision farming techniques, drought-resistant crop varieties, and vertical farming operations represent promising approaches to sustainable food production in an era of climate uncertainty.",
  "The publishing industry has undergone dramatic transformation with the rise of digital content platforms, self-publishing tools, and audiobook services that have expanded access to literature and educational materials. These changes have created new opportunities for authors while challenging traditional business models.",
  "International space agencies and private aerospace companies are collaborating on ambitious missions to establish a sustained human presence beyond Earth orbit. The development of reusable launch vehicles, advanced life support systems, and in-situ resource utilization technologies are bringing the dream of interplanetary exploration closer to reality.",
  "Educational psychology research demonstrates that effective learning environments incorporate multiple modalities, encourage active participation, and provide timely feedback to students. Technology-enhanced learning platforms are increasingly able to adapt instructional content to individual learning styles and pace.",
  "The preservation of linguistic diversity is a critical challenge as globalization and digital communication continue to reshape how communities interact and share knowledge. Language documentation projects and revitalization programs are working to ensure that endangered languages and the cultural heritage they embody are not lost to future generations."
];

// Throughput test texts (increasing length: ~200, ~500, ~1000, ~1500, ~2000 chars)
const THROUGHPUT_TEXTS = [
  "The rapid advancement of artificial intelligence has fundamentally transformed how businesses operate across virtually every industry. Companies are leveraging machine learning algorithms to automate complex processes and predict market trends.",
  "In the field of modern medicine, researchers are making remarkable breakthroughs by combining genomic data analysis with sophisticated computational models. These innovations enable earlier disease detection, more targeted therapeutic interventions, and the development of precision medicine approaches tailored to individual genetic profiles. The integration of artificial intelligence into clinical workflows is accelerating the pace of drug discovery and improving diagnostic accuracy across multiple medical specialties.",
  "The global transition toward renewable energy sources represents one of the most significant economic and environmental shifts in human history. Solar and wind power installations continue to grow exponentially, while advances in battery storage technology are addressing the intermittency challenges that previously limited widespread adoption of clean energy alternatives. Government policies and international agreements are creating favorable conditions for investment in sustainable infrastructure. The declining cost of photovoltaic panels and wind turbines has made renewable energy competitive with fossil fuels in many markets, driving a fundamental restructuring of the global energy landscape. Research into next-generation technologies such as solid-state batteries, green hydrogen production, and advanced nuclear reactors promises to further accelerate the energy transition in the coming decades.",
  "International trade agreements and diplomatic negotiations require exceptional linguistic precision to ensure that all parties fully understand the terms and implications of complex multilateral arrangements. Professional translators play a crucial role in facilitating cross-cultural communication and preventing costly misunderstandings between nations. The complexity of legal terminology, combined with cultural nuances that vary significantly between languages, makes accurate translation both an art and a science. Machine translation systems have made impressive strides in recent years, leveraging neural network architectures and vast multilingual datasets to produce increasingly fluent and accurate translations. However, the subtle contextual understanding required for high-stakes diplomatic communication continues to necessitate human expertise. Translation memory systems and terminology databases help professional translators maintain consistency across large document collections while improving efficiency. The growing volume of international commerce and cross-border collaboration has created unprecedented demand for skilled linguists and translation technology solutions.",
  "Urban planning and sustainable city design have become increasingly important as the global population continues to concentrate in metropolitan areas. Innovative approaches to public transportation, green infrastructure, and mixed-use development are helping cities reduce their environmental footprint while improving quality of life for residents. Smart city technologies, including sensor networks, data analytics platforms, and automated traffic management systems, are enabling more efficient resource allocation and service delivery. The concept of the fifteen-minute city, where essential amenities are accessible within a short walk or bicycle ride, is gaining traction among urban planners seeking to reduce automobile dependence and promote healthier lifestyles. Affordable housing remains one of the most pressing challenges facing rapidly growing urban centers, with innovative construction methods such as modular building and three-dimensional printing offering potential solutions to the housing supply crisis. Community engagement and participatory planning processes are essential for ensuring that urban development projects reflect the needs and aspirations of diverse populations. The integration of nature-based solutions, including urban forests, bioswales, and green rooftops, is helping cities adapt to the impacts of climate change while creating more livable and resilient environments. As cities around the world grapple with the interconnected challenges of population growth, environmental sustainability, and social equity, the importance of thoughtful and inclusive urban planning has never been greater."
];

// Streaming comparison text (~1000 chars)
const STREAMING_TEST_TEXT = `Artificial intelligence and machine learning technologies are revolutionizing how we approach language translation and natural language processing. These advanced systems can now understand context, idioms, and cultural nuances that were previously challenging for automated translation systems. The integration of neural networks has significantly improved translation quality across multiple languages, enabling real-time communication between people who speak different languages.

Modern translation models are trained on billions of parallel text segments, allowing them to capture subtle patterns in how meaning is expressed across linguistic boundaries. The development of attention mechanisms and transformer architectures has been particularly transformative, enabling models to consider the full context of a sentence when generating translations rather than processing words in isolation. These architectures have replaced earlier statistical methods that relied heavily on phrase-based alignment tables and language models with limited context windows.

The practical applications of machine translation extend far beyond simple text conversion. International businesses rely on translation technology to localize their products, services, and marketing materials for diverse global markets. Healthcare organizations use translation tools to communicate with patients who speak different languages, ensuring that critical medical information is accurately conveyed regardless of linguistic barriers. Legal professionals employ specialized translation systems to handle contracts, patents, and regulatory documents that require exceptional precision.

Despite these remarkable advances, significant challenges remain in handling low-resource languages, preserving stylistic elements, and accurately translating domain-specific terminology in fields such as medicine, law, and engineering. Idiomatic expressions, humor, and cultural references continue to pose difficulties for even the most sophisticated translation systems. The ambiguity inherent in natural language means that context beyond the immediate sentence is often necessary to produce accurate translations.

Looking ahead, the future of translation technology promises even greater capabilities. Multimodal translation systems that can process text, speech, and images simultaneously are emerging as a powerful new paradigm. Real-time translation of spoken language is becoming increasingly accurate, opening possibilities for seamless cross-lingual communication in business meetings, international conferences, and everyday conversations. The ongoing development of more efficient model architectures and training techniques continues to push the boundaries of what automated translation can achieve.

The history of machine translation stretches back to the earliest days of computing, when researchers first envisioned machines that could bridge language barriers automatically. Early rule-based systems required extensive linguistic knowledge and hand-crafted grammar rules for each language pair, making them expensive to develop and difficult to maintain. The transition to statistical machine translation in the 1990s marked a significant paradigm shift, as systems began learning translation patterns directly from large collections of translated documents rather than relying on explicit linguistic rules.

The quality of training data plays a crucial role in determining the accuracy and fluency of modern translation systems. Curating high-quality parallel corpora remains an ongoing challenge, particularly for language pairs where professional translations are scarce. Researchers have developed innovative techniques such as back-translation, data augmentation, and transfer learning to address these data limitations. These approaches allow models trained on resource-rich language pairs to transfer their knowledge to less common languages, significantly expanding the reach of automated translation.

Education and academic research have been profoundly impacted by advances in translation technology. Students and researchers can now access scientific literature published in languages they do not speak, breaking down barriers that previously limited the global exchange of knowledge. Universities are using translation tools to support international students and facilitate cross-border academic collaboration. The ability to rapidly translate educational materials has democratized access to learning resources in developing regions where content in local languages may be limited.

The economic implications of improved translation technology are substantial and far-reaching. Global e-commerce platforms rely on automated translation to make product listings accessible to buyers worldwide, enabling small businesses to reach international customers without the cost of professional translation services. The tourism and hospitality industry benefits from real-time translation applications that help travelers navigate foreign countries and communicate with local service providers. Financial institutions use translation technology to process international documents, comply with multilingual regulatory requirements, and serve customers across different language communities.

As translation technology continues to evolve, ethical considerations have become increasingly important. Questions about data privacy arise when sensitive documents are processed through cloud-based translation services. The potential displacement of human translators by automated systems raises concerns about employment in the language services industry. Researchers and developers are working to address biases in training data that can lead to inaccurate or culturally insensitive translations. Ensuring that translation technology serves all communities equitably, including speakers of minority and indigenous languages, remains a critical priority for the field.`;

// Language names (same as translate page)
const LANGUAGE_NAMES = {
  'af': 'Afrikaans', 'am': 'Amharic', 'ar': 'Arabic', 'as': 'Assamese',
  'awa': 'Awadhi', 'az': 'Azerbaijani', 'ba': 'Bashkir', 'be': 'Belarusian',
  'bg': 'Bulgarian', 'bho': 'Bhojpuri', 'bn': 'Bangla', 'bo': 'Tibetan',
  'brx': 'Bodo', 'bs': 'Bosnian', 'ca': 'Catalan', 'ceb': 'Cebuano',
  'ce': 'Chechen', 'zh-hans': 'Chinese Simplified', 'zh-hant': 'Chinese Traditional',
  'cv': 'Chuvash', 'cs': 'Czech', 'cy': 'Welsh', 'da': 'Danish',
  'de': 'German', 'doi': 'Dogri', 'dv': 'Divehi', 'dsb': 'Lower Sorbian',
  'dz': 'Dzongkha', 'el': 'Greek', 'en': 'English', 'es': 'Spanish',
  'et': 'Estonian', 'eu': 'Basque', 'fa': 'Persian', 'fj': 'Fijian',
  'fil': 'Filipino', 'fi': 'Finnish', 'fo': 'Faroese', 'fr': 'French',
  'fr-ca': 'French (Canada)', 'gl': 'Galician', 'gom': 'Konkani',
  'kok': 'Konkani (Goan)', 'gu': 'Gujarati', 'ht': 'Haitian Creole',
  'ha': 'Hausa', 'haw': 'Hawaiian', 'he': 'Hebrew', 'hi': 'Hindi',
  'hne': 'Chhattisgarhi', 'hr': 'Croatian', 'hsb': 'Upper Sorbian',
  'hu': 'Hungarian', 'hy': 'Armenian', 'ig': 'Igbo', 'ikt': 'Inuinnaqtun',
  'id': 'Indonesian', 'ga': 'Irish', 'is': 'Icelandic', 'it': 'Italian',
  'iu-latn': 'Inuktitut (Latin)', 'iu': 'Inuktitut', 'jv': 'basa Djawa',
  'ja': 'Japanese', 'ks': 'Kashmiri', 'ka': 'Georgian', 'kn': 'Kannada',
  'kha': 'Khasi', 'km': 'Khmer', 'rw': 'Kinyarwanda', 'kk': 'Kazakh',
  'kmr': 'Kurdish (Northern)', 'ko': 'Korean', 'ku': 'Kurdish (Central)',
  'ky': 'Kyrgyz', 'lo': 'Lao', 'la': 'Latin', 'lb': 'Luxembourgish',
  'ln': 'Lingala', 'lt': 'Lithuanian', 'lg': 'Ganda', 'luo': 'Dholuo',
  'lus': 'Mizo', 'lv': 'Latvian', 'lzh': 'Chinese (Literary)',
  'mag': 'Magahi', 'mai': 'Maithili', 'mr': 'Marathi', 'mk': 'Macedonian',
  'mg': 'Malagasy', 'mt': 'Maltese', 'mn-mong': 'Mongolian (Traditional)',
  'mni': 'Manipuri', 'mn-cyrl': 'Mongolian (Cyrillic)', 'mi': 'Māori',
  'ms': 'Malay', 'mww': 'Hmong Daw', 'my': 'Myanmar (Burmese)',
  'ml': 'Malayalam', 'ne': 'Nepali', 'nl': 'Dutch', 'nb': 'Norwegian',
  'nso': 'Sesotho sa Leboa', 'nya': 'Nyanja', 'oc': 'Occitan', 'or': 'Odia',
  'otq': 'Querétaro Otomi', 'pa': 'Punjabi', 'ps': 'Pashto', 'pl': 'Polish',
  'prs': 'Dari', 'pt': 'Portuguese (Brazil)', 'pt-pt': 'Portuguese (Portugal)',
  'ro': 'Romanian', 'run': 'Rundi', 'ru': 'Russian', 'sa': 'Sanskrit',
  'sat': 'Santali', 'si': 'Sinhala', 'sd': 'Sindhi', 'sk': 'Slovak',
  'sl': 'Slovenian', 'sm': 'Samoan', 'sn': 'Shona', 'so': 'Somali',
  'st': 'Sesotho', 'sq': 'Albanian', 'sr-latn': 'Serbian (Latin)',
  'sr-cyrl': 'Serbian (Cyrillic)', 'su': 'Sundanese', 'sv': 'Swedish',
  'sw': 'Swahili', 'ty': 'Tahitian', 'tg': 'Tajik', 'ta': 'Tamil',
  'te': 'Telugu', 'tet': 'Tetum', 'th': 'Thai', 'ti': 'Tigrinya',
  'tlh-latn': 'Klingon (Latin)', 'to': 'Tongan', 'tr': 'Turkish',
  'tn': 'Setswana', 'tt': 'Tatar', 'tk': 'Turkmen', 'ug': 'Uyghur',
  'uk': 'Ukrainian', 'ur': 'Urdu', 'uz': 'Uzbek (Latin)',
  'vi': 'Vietnamese', 'xh': 'Xhosa', 'yo': 'Yoruba',
  'yua': 'Yucatec Maya', 'yue': 'Cantonese (Traditional)', 'zu': 'Zulu'
};

// ─── Page Simulation Data ──────────────────────────────────────────
// Simulates a real web page with ~300 text segments of varying types and lengths.
// Modeled after typical content-heavy pages (news, docs, e-commerce).

// Numbers, URLs and emails are replaced with placeholder markup before the
// model sees them, and that markup is tokenized one token per character, so
// these segments cost far more than their length suggests.
const PROTECTED_SPAN_RE = /\b\d+(?:[.,]\d+)*|https?:\/\/\S+|\bwww\.\S+|\S+@\S+\.\w+/;

const PAGE_SIM_SEGMENTS = {
  nav: [
    'Home', 'About', 'Products', 'Services', 'Contact', 'Blog', 'Pricing',
    'Sign In', 'Sign Up', 'Log Out', 'My Account', 'Settings', 'Help',
    'Search', 'Cart (0)', 'Notifications', 'Dashboard', 'Profile',
    'Downloads', 'Documentation', 'Support Center', 'Community Forum',
    'What\'s New', 'Resources', 'Partners', 'Careers', 'Privacy Policy',
    'Terms of Service', 'Cookie Settings', 'Language', 'Dark Mode',
    'View All', 'Load More', 'Subscribe', 'Share', 'Print', 'Save',
    'Edit', 'Delete', 'Cancel', 'Confirm', 'Submit', 'Apply',
    'Next', 'Previous', 'Back to Top', 'Read More', 'Show Details',
    'Collapse', 'Expand All', 'Sort By', 'Filter', 'Clear All',
    'Add to Cart', 'Buy Now', 'Add to Wishlist', 'Compare',
    'Free Shipping', 'In Stock', 'Out of Stock', 'Limited Availability',
    'New Arrival', 'Best Seller', 'Sale', 'Trending', 'Featured',
    'Recommended', 'Popular', 'Recently Viewed', 'You May Also Like',
  ],
  headings: [
    'Welcome to Our Platform',
    'Breaking News: Global Markets Update',
    'Getting Started with the Translation API',
    'Frequently Asked Questions',
    'Customer Reviews and Ratings',
    'Product Specifications',
    'Related Articles You Might Enjoy',
    'System Requirements and Compatibility',
    'Latest Updates and Release Notes',
    'How It Works: Step-by-Step Guide',
    'Shipping and Return Policy',
    'About the Author',
    'Join Our Newsletter',
    'Upcoming Events and Webinars',
    'Awards and Recognition',
    'Our Mission and Values',
    'Meet the Team Behind the Product',
    'Developer Documentation and API Reference',
    'Performance Benchmarks and Comparisons',
    'Security and Privacy Overview',
    'Troubleshooting Common Issues',
    'Advanced Configuration Options',
    'Integration with Third-Party Services',
    'Case Studies and Success Stories',
    'Community Guidelines and Code of Conduct',
  ],
  short: [
    'Last updated: May 13, 2026',
    'Version 3.2.1',
    'Rating: 4.7 out of 5 stars',
    'Based on 2,847 reviews',
    'Estimated delivery: 3-5 business days',
    'Price: $49.99',
    'Was $79.99 — Save 37%',
    'Available in 12 colors',
    'Size: Medium (M)',
    'Weight: 1.5 kg',
    'Dimensions: 24 × 16 × 8 cm',
    'Material: 100% organic cotton',
    'SKU: PRD-2026-0513',
    'Category: Electronics > Accessories',
    'Tags: wireless, bluetooth, portable',
    'Published on March 15, 2026',
    'By John Smith | 8 min read',
    'Viewed 14,392 times',
    'Shared 847 times on social media',
    'Licensed under MIT License',
    'Compatible with Windows, macOS, and Linux',
    'Requires Node.js 18 or later',
    'Minimum 8 GB RAM recommended',
    'Copyright © 2026 All rights reserved.',
    'Powered by artificial intelligence',
    'Results may vary. See terms for details.',
    'This site uses cookies to improve your experience.',
    'Your data is encrypted and secure.',
    'No credit card required for free trial.',
    '30-day money-back guarantee',
    'Trusted by over 10,000 companies worldwide',
    'Available in 40+ languages',
    'Response time: under 200ms',
    'Uptime: 99.9% guaranteed',
    'GDPR and SOC 2 compliant',
    'ISO 27001 certified',
    'Enterprise-grade security',
    '24/7 customer support',
    'Free for personal use',
    'Starting at $9.99/month for teams',
    'Custom pricing for enterprise',
    'Contact sales for a demo',
    'See all pricing plans',
    'Download the mobile app',
    'Follow us on Twitter',
    'Join our Discord community',
    'Watch the tutorial video',
    'Read the full documentation',
    'Report a bug or issue',
    'Request a new feature',
    'Table of Contents',
    'Chapter 1: Introduction',
    'Chapter 2: Core Concepts',
    'Chapter 3: Advanced Topics',
    'Appendix A: Reference Tables',
    'Index of Terms',
    'Figure 1: System Architecture',
    'Note: This feature is in beta.',
    'Warning: Breaking changes in v3.0',
    'Tip: Use keyboard shortcuts for faster navigation.',
    'Important: Back up your data before updating.',
    'Error: Something went wrong. Please try again.',
    'Success! Your changes have been saved.',
    'Loading... Please wait.',
    'No results found for your search.',
    'Showing 1-20 of 347 results',
    'Page 1 of 18',
    '← Older Posts | Newer Posts →',
    'Jump to: Top | Comments | Related',
  ],
  paragraphs: [
    'Our platform leverages cutting-edge artificial intelligence to deliver seamless translation experiences across more than forty languages. Whether you are a small business expanding internationally or a large enterprise managing multilingual content, our tools are designed to meet your needs.',
    'The latest update includes significant improvements to translation accuracy for East Asian languages, with particular attention to context-dependent terminology and idiomatic expressions. Users can expect up to thirty percent faster processing times thanks to optimized neural network inference.',
    'Customer satisfaction remains our top priority. Our support team is available around the clock to assist with technical questions, account management, and integration guidance. We pride ourselves on an average response time of under two hours for all support tickets.',
    'Security is built into every layer of our infrastructure. All data is encrypted in transit and at rest using industry-standard protocols. We undergo regular third-party security audits and maintain compliance with major international data protection regulations.',
    'Getting started is simple: create a free account, select your source and target languages, and begin translating immediately. No credit card is required for the free tier, which includes up to one hundred thousand characters per month.',
    'The API supports both synchronous and streaming translation modes. Synchronous mode returns the complete translation in a single response, while streaming mode delivers results progressively, allowing your application to display partial translations as they become available.',
    'Machine translation quality has improved dramatically over the past decade thanks to advances in deep learning and natural language processing. Modern neural translation models can handle complex grammatical structures, preserve formatting, and maintain consistent terminology across long documents.',
    'We recommend using the batch translation endpoint for processing multiple text segments simultaneously. This approach significantly reduces total latency compared to making individual API calls for each segment, as the model can share context across related texts.',
    'Our enterprise plan includes dedicated infrastructure, custom model training, and priority support with guaranteed response times. Contact our sales team to discuss volume pricing and deployment options tailored to your organization\'s specific requirements.',
    'The translation memory feature automatically stores and reuses previously translated segments, improving consistency across your content while reducing costs. This is especially valuable for technical documentation and marketing materials that share common phrases and terminology.',
    'Browser-based translation runs entirely on the user\'s device, ensuring that sensitive content never leaves the local machine. This privacy-preserving approach is ideal for healthcare, legal, and financial applications where data confidentiality is paramount.',
    'Accessibility is a core design principle. Our interface supports screen readers, keyboard navigation, and high-contrast display modes. Translation output preserves semantic HTML structure to maintain accessibility in the target language.',
    'Performance monitoring dashboards provide real-time visibility into translation throughput, error rates, and latency percentiles. Automated alerts notify your team when quality metrics fall below configured thresholds, enabling rapid response to potential issues.',
    'The glossary management feature allows you to define custom translation rules for brand names, technical terms, and industry-specific vocabulary. These rules take precedence over the model\'s default translations, ensuring consistency with your organization\'s preferred terminology.',
    'Regular model updates incorporate the latest research findings and training data improvements. We follow a staged rollout process with automated quality gates to ensure that updates maintain or improve translation accuracy across all supported language pairs.',
    'Integration is available through REST APIs, client SDKs for major programming languages, and pre-built plugins for popular content management systems. Comprehensive documentation and code samples make it easy to add translation capabilities to your existing workflows.',
    'Our quality evaluation framework uses a combination of automated metrics and human review to continuously monitor translation accuracy. We publish quarterly quality reports for all supported language pairs, demonstrating our commitment to transparency and continuous improvement.',
    'The collaborative review feature enables bilingual team members to provide feedback on translations directly within the platform. Accepted corrections are incorporated into the translation memory, creating a continuous learning loop that improves quality over time.',
    'For high-volume applications, our content delivery network caches frequently requested translations at edge locations worldwide, reducing latency for end users and lowering costs through reduced API calls to the translation backend.',
    'We are committed to supporting linguistic diversity and have partnered with academic institutions and language preservation organizations to expand coverage to underrepresented languages. Our goal is to make high-quality machine translation accessible to every language community.',
  ],
};

// Reuse SearchableLanguageSelect from parent
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
    if (defaultValue) this.setValue(defaultValue);
  }

  init() {
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('focus', (e) => { this.open(); e.target.select(); });
    this.input.addEventListener('blur', () => {
      setTimeout(() => { if (!this.dropdown.matches(':hover')) this.close(); }, 150);
    });
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target) && !this.dropdown.contains(e.target)) this.close();
    });
    this.renderOptions();
  }

  handleInput(e) {
    const query = e.target.value.toLowerCase();
    this.filteredLanguages = this.languages.filter(lang =>
      lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query)
    );
    this.selectedIndex = -1;
    this.renderOptions();
    this.open();
  }

  handleKeydown(e) {
    if (!this.isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); this.open(); }
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
        if (this.selectedIndex >= 0) this.selectLanguage(this.filteredLanguages[this.selectedIndex]);
        else if (this.filteredLanguages.length > 0) this.selectLanguage(this.filteredLanguages[0]);
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  }

  open() { this.isOpen = true; this.dropdown.style.display = 'block'; this.renderOptions(); }
  close() { this.isOpen = false; this.dropdown.style.display = 'none'; this.selectedIndex = -1; }

  renderOptions() {
    const fragment = document.createDocumentFragment();
    if (this.filteredLanguages.length === 0) {
      const el = document.createElement('div');
      el.className = 'searchable-select-no-results';
      el.textContent = 'No languages found';
      fragment.appendChild(el);
    } else {
      this.filteredLanguages.forEach((language, index) => {
        const option = document.createElement('div');
        option.className = 'searchable-select-option';
        option.setAttribute('data-filtered-index', index.toString());
        option.innerHTML = `${language.name} <span class="language-code">${language.code}</span>`;
        option.addEventListener('mousedown', (e) => { e.preventDefault(); this.selectLanguage(language); });
        option.addEventListener('mouseenter', () => { this.selectedIndex = index; this.updateHighlight(); });
        fragment.appendChild(option);
      });
    }
    this.dropdown.innerHTML = '';
    this.dropdown.appendChild(fragment);
    this.updateHighlight();
  }

  updateHighlight() {
    this.dropdown.querySelectorAll('.searchable-select-option').forEach(option => {
      const idx = parseInt(option.getAttribute('data-filtered-index'), 10);
      option.classList.toggle('highlighted', idx === this.selectedIndex);
    });
    if (this.selectedIndex >= 0) {
      const el = this.dropdown.querySelector(`.searchable-select-option[data-filtered-index="${this.selectedIndex}"]`);
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }

  selectLanguage(language) {
    this.setValue(language.code);
    this.close();
    this.hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  setValue(code) {
    const language = this.languages.find(lang => lang.code === code);
    if (language) {
      this.input.value = language.name;
      this.input.classList.add('has-value');
      this.hiddenInput.value = code;
    }
  }

  getValue() { return this.hiddenInput.value; }
}

// ─── Speed Benchmark ───────────────────────────────────────────────

class TranslationSpeedBenchmark {
  constructor() {
    this.translator = null;
    this.sourceSelect = null;
    this.targetSelect = null;
    this.init();
  }

  async init() {
    this.setupLanguageSelectors();
    this.setupEventListeners();
    await this.checkAPI();
  }

  setupLanguageSelectors() {
    const languages = Object.entries(LANGUAGE_NAMES)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    this.sourceSelect = new SearchableLanguageSelect(
      'sourceLanguageSearch', 'sourceLanguageDropdown', 'sourceLanguage', languages, 'en'
    );
    this.targetSelect = new SearchableLanguageSelect(
      'targetLanguageSearch', 'targetLanguageDropdown', 'targetLanguage', languages, 'es'
    );
  }

  setupEventListeners() {
    document.getElementById('runAll').addEventListener('click', () => this.measureAll());
    document.getElementById('saveResults').addEventListener('click', () => this.saveResults());
    document.getElementById('swapLanguages').addEventListener('click', () => this.swapLanguages());
    document.getElementById('replaySingle').addEventListener('click', () => this.measureSingleLatency());
    document.getElementById('replayThroughput').addEventListener('click', () => this.measureThroughput());
    document.getElementById('replayBatch').addEventListener('click', () => this.measureBatch());
    document.getElementById('replayStreaming').addEventListener('click', () => this.measureStreamingComparison());
    document.getElementById('runPageSim').addEventListener('click', () => this.measurePageSimulation());
    document.getElementById('runConcurrency').addEventListener('click', () => this.measureConcurrency());

    document.getElementById('sourceLanguage').addEventListener('change', () => this.resetTranslator());
    document.getElementById('targetLanguage').addEventListener('change', () => this.resetTranslator());
  }

  async checkAPI() {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    indicator.className = 'status-indicator checking';
    text.textContent = 'Checking API availability...';

    if ('Translator' in self) {
      indicator.className = 'status-indicator available';
      text.textContent = 'Translation API is available';
      document.getElementById('runAll').disabled = false;
      document.getElementById('runPageSim').disabled = false;
      document.getElementById('runConcurrency').disabled = false;
    } else {
      indicator.className = 'status-indicator unavailable';
      text.textContent = 'Translation API is not available';
    }
  }

  showStatus(msg, running = false) {
    const el = document.getElementById('benchStatus');
    el.textContent = msg;
    el.className = running ? 'status-running' : 'status-ready';
    document.getElementById('benchProgress').style.display = running ? 'block' : 'none';
  }

  setProgress(pct) {
    document.getElementById('benchProgressFill').style.width = pct + '%';
  }

  showInitResult(msg, type) {
    const el = document.getElementById('initResult');
    el.style.display = 'block';
    el.textContent = msg;
    el.className = `result-box ${type}`;
  }

  async ensureTranslator() {
    if (this.translator) return true;

    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const targetLanguage = document.getElementById('targetLanguage').value;
    const progressContainer = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    try {
      this.showStatus('Initializing translator...', true);
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

      const initTime = (performance.now() - startTime).toFixed(2);
      progressContainer.style.display = 'none';
      document.getElementById('initTime').textContent = initTime;
      this.showInitResult(
        `Translator initialized: ${LANGUAGE_NAMES[sourceLanguage] || sourceLanguage} → ${LANGUAGE_NAMES[targetLanguage] || targetLanguage} (${initTime} ms)`,
        'success'
      );
      return true;
    } catch (error) {
      progressContainer.style.display = 'none';
      this.showInitResult(`Failed: ${error.message}`, 'error');
      this.showStatus('Error', false);
      return false;
    }
  }

  resetTranslator() {
    this.translator = null;
    document.getElementById('initTime').textContent = '0';
    document.getElementById('initResult').style.display = 'none';
    document.getElementById('saveResults').disabled = true;
  }

  swapLanguages() {
    const srcVal = this.sourceSelect.getValue();
    const tgtVal = this.targetSelect.getValue();
    this.sourceSelect.setValue(tgtVal);
    this.targetSelect.setValue(srcVal);
    this.resetTranslator();
  }

  // ── Individual tests ──────────────────────────────────────────

  async measureInitTime() {
    // Force re-init
    this.translator = null;
    const ok = await this.ensureTranslator();
    return ok;
  }

  async measureSingleLatency() {
    if (!(await this.ensureTranslator())) return;
    this.showStatus('Measuring single latency...', true);

    const text = "The rapid advancement of artificial intelligence has fundamentally transformed how businesses operate across virtually every industry. Companies are leveraging machine learning algorithms to automate complex processes and predict market trends.";
    const start = performance.now();
    await this.translator.translate(text);
    const duration = (performance.now() - start).toFixed(2);

    document.getElementById('singleLatency').textContent = duration;
    this.showStatus('Ready');
  }

  async measureThroughput() {
    if (!(await this.ensureTranslator())) return;
    this.showStatus('Measuring throughput...', true);

    const scratch = document.getElementById('scratchArea');
    let totalCps = 0;

    for (let i = 0; i < THROUGHPUT_TEXTS.length; i++) {
      const text = THROUGHPUT_TEXTS[i];
      const start = performance.now();
      const result = await this.translator.translate(text);
      const ms = performance.now() - start;
      const cps = Math.round((text.length / ms) * 1000);

      document.getElementById(`tp${i + 1}`).textContent = cps;
      document.getElementById(`ms${i + 1}`).textContent = ms.toFixed(1);
      scratch.textContent = result.substring(0, 80) + '...';
      totalCps += cps;
    }

    const avg = Math.round(totalCps / THROUGHPUT_TEXTS.length);
    document.getElementById('avgThroughput').textContent = avg;
    scratch.innerHTML = '&nbsp;';
    this.showStatus('Ready');
  }

  async measureBatch() {
    if (!(await this.ensureTranslator())) return;
    this.showStatus('Running batch benchmark...', true);

    const batchStart = performance.now();
    let totalChars = 0;

    for (let i = 0; i < BENCHMARK_TEXTS.length; i++) {
      this.setProgress(Math.round(((i + 1) / BENCHMARK_TEXTS.length) * 100));
      const text = BENCHMARK_TEXTS[i];
      totalChars += text.length;
      await this.translator.translate(text);
    }

    const totalMs = performance.now() - batchStart;
    const cps = Math.round((totalChars / totalMs) * 1000);

    document.getElementById('batchThroughput').textContent = cps;
    document.getElementById('batchTotalTime').textContent = totalMs.toFixed(1);
    this.setProgress(100);
    this.showStatus('Ready');
  }

  async measureStreamingComparison() {
    if (!(await this.ensureTranslator())) return;
    this.showStatus('Comparing sync vs streaming...', true);

    const text = STREAMING_TEST_TEXT;

    // Sync
    const syncStart = performance.now();
    await this.translator.translate(text);
    const syncMs = (performance.now() - syncStart).toFixed(1);
    const syncCps = Math.round((text.length / parseFloat(syncMs)) * 1000);

    document.getElementById('cmpSyncTime').textContent = syncMs;
    document.getElementById('cmpSyncCps').textContent = syncCps;

    // Streaming
    const streamStart = performance.now();
    let chunks = 0;
    let firstChunkTime = 0;
    let prevChunkLength = 0;
    const stream = this.translator.translateStreaming(text);
    console.group('translateStreaming()');
    for await (const chunk of stream) {
      chunks++;
      if (chunks === 1) firstChunkTime = (performance.now() - streamStart).toFixed(1);
      console.log(`Chunk ${chunks}: ${chunk.length} chars (delta +${chunk.length - prevChunkLength})`);
      prevChunkLength = chunk.length;
    }
    console.log(`${chunks} chunks, first chunk at ${firstChunkTime} ms`);
    console.groupEnd();
    const streamMs = (performance.now() - streamStart).toFixed(1);
    const streamCps = Math.round((text.length / parseFloat(streamMs)) * 1000);

    document.getElementById('cmpStreamTime').textContent = streamMs;
    document.getElementById('cmpStreamCps').textContent = streamCps;
    document.getElementById('cmpStreamChunks').textContent = chunks;
    document.getElementById('cmpFirstChunk').textContent = firstChunkTime;

    // Overhead
    const overhead = ((parseFloat(streamMs) / parseFloat(syncMs) - 1) * 100).toFixed(1);
    const overheadEl = document.getElementById('streamingOverhead');
    if (parseFloat(overhead) > 0) {
      overheadEl.textContent = `+${overhead}%`;
    } else {
      overheadEl.textContent = `${overhead}%`;
    }

    // Time to first content highlight
    const highlight = document.getElementById('firstContentHighlight');
    const syncMsNum = parseFloat(syncMs);
    const firstChunkNum = parseFloat(firstChunkTime);
    if (firstChunkNum > 0 && syncMsNum > 0) {
      highlight.style.display = 'block';
      document.getElementById('highlightStreaming').textContent = firstChunkTime;
      document.getElementById('highlightSync').textContent = syncMs;
      const speedup = (syncMsNum / firstChunkNum).toFixed(1);
      document.getElementById('highlightSpeedup').textContent = `${speedup}x faster first content`;
    }

    this.showStatus('Ready');
  }

  // ── Page Simulation ───────────────────────────────────────────

  async measurePageSimulation() {
    if (!(await this.ensureTranslator())) return;

    const btn = document.getElementById('runPageSim');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div> Translating page...';

    const resultsEl = document.getElementById('pageSimResults');
    resultsEl.style.display = 'block';
    const progressEl = document.getElementById('simProgress');
    progressEl.style.display = 'flex';

    // Build segment list with type tags
    const segments = [
      ...PAGE_SIM_SEGMENTS.nav.map(t => ({ text: t, type: 'nav' })),
      ...PAGE_SIM_SEGMENTS.headings.map(t => ({ text: t, type: 'heading' })),
      ...PAGE_SIM_SEGMENTS.short.map(t => ({ text: t, type: 'short' })),
      ...PAGE_SIM_SEGMENTS.paragraphs.map(t => ({ text: t, type: 'paragraph' })),
    ];

    const totalChars = segments.reduce((s, seg) => s + seg.text.length, 0);
    document.getElementById('simSegments').textContent = segments.length;
    document.getElementById('simTotalChars').textContent = totalChars.toLocaleString();

    // Per-type accumulators
    const byType = {
      nav: { count: 0, totalLen: 0, totalTime: 0 },
      heading: { count: 0, totalLen: 0, totalTime: 0 },
      short: { count: 0, totalLen: 0, totalTime: 0 },
      paragraph: { count: 0, totalLen: 0, totalTime: 0 },
    };

    // Cross-cutting split: segments carrying protected spans are spread across
    // every type, so their cost is invisible in the per-type breakdown.
    const bySpan = {
      withSpans: { count: 0, totalLen: 0, totalTime: 0 },
      noSpans: { count: 0, totalLen: 0, totalTime: 0 },
    };

    this.showStatus('Running page simulation...', true);
    const overallStart = performance.now();

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const start = performance.now();
      await this.translator.translate(seg.text);
      const elapsed = performance.now() - start;

      byType[seg.type].count++;
      byType[seg.type].totalLen += seg.text.length;
      byType[seg.type].totalTime += elapsed;

      const spanBucket = PROTECTED_SPAN_RE.test(seg.text) ? bySpan.withSpans : bySpan.noSpans;
      spanBucket.count++;
      spanBucket.totalLen += seg.text.length;
      spanBucket.totalTime += elapsed;

      // Update progress
      const pct = Math.round(((i + 1) / segments.length) * 100);
      document.getElementById('simProgressFill').style.width = pct + '%';
      document.getElementById('simProgressText').textContent = `${i + 1} / ${segments.length}`;
    }

    const totalTime = performance.now() - overallStart;

    // Summary
    document.getElementById('simTotalTime').textContent = totalTime.toFixed(0);
    document.getElementById('simAvgPerCall').textContent = (totalTime / segments.length).toFixed(1);

    // Per-type breakdown
    const typeMap = {
      nav: { countEl: 'simNavCount', lenEl: 'simNavAvgLen', avgEl: 'simNavAvgTime', totalEl: 'simNavTotal' },
      heading: { countEl: 'simHeadCount', lenEl: 'simHeadAvgLen', avgEl: 'simHeadAvgTime', totalEl: 'simHeadTotal' },
      short: { countEl: 'simShortCount', lenEl: 'simShortAvgLen', avgEl: 'simShortAvgTime', totalEl: 'simShortTotal' },
      paragraph: { countEl: 'simParaCount', lenEl: 'simParaAvgLen', avgEl: 'simParaAvgTime', totalEl: 'simParaTotal' },
    };

    for (const [type, els] of Object.entries(typeMap)) {
      const d = byType[type];
      document.getElementById(els.countEl).textContent = d.count;
      document.getElementById(els.lenEl).textContent = d.count > 0 ? Math.round(d.totalLen / d.count) : 0;
      document.getElementById(els.avgEl).textContent = d.count > 0 ? (d.totalTime / d.count).toFixed(1) : 0;
      document.getElementById(els.totalEl).textContent = d.totalTime.toFixed(0);
    }

    // Store for copy
    this.pageSimResult = { totalTime, segments: segments.length, totalChars, avgPerCall: totalTime / segments.length, byType };

    // Protected-span split, normalized per 100 chars so the comparison is not
    // just a restatement of segment length.
    const spanMap = { withSpans: 'simSpan', noSpans: 'simNoSpan' };
    for (const [key, prefix] of Object.entries(spanMap)) {
      const d = bySpan[key];
      const avgLen = d.count > 0 ? d.totalLen / d.count : 0;
      const avgTime = d.count > 0 ? d.totalTime / d.count : 0;
      document.getElementById(prefix + 'Count').textContent = d.count;
      document.getElementById(prefix + 'AvgLen').textContent = Math.round(avgLen);
      document.getElementById(prefix + 'AvgTime').textContent = avgTime.toFixed(1);
      document.getElementById(prefix + 'Per100').textContent =
        avgLen > 0 ? (avgTime / avgLen * 100).toFixed(1) : '0';
    }
    const withPer100 = bySpan.withSpans.totalLen > 0
      ? (bySpan.withSpans.totalTime / bySpan.withSpans.totalLen * 100) : 0;
    const noPer100 = bySpan.noSpans.totalLen > 0
      ? (bySpan.noSpans.totalTime / bySpan.noSpans.totalLen * 100) : 0;
    document.getElementById('simSpanTax').textContent =
      noPer100 > 0 ? (withPer100 / noPer100).toFixed(2) + '\u00d7' : '-';
    this.pageSimResult.spanTax = { withPer100, noPer100, bySpan };

    progressEl.style.display = 'none';
    btn.disabled = false;
    btn.textContent = 'Run Page Simulation';
    this.showStatus('Ready');
  }

  // ── Concurrency ───────────────────────────────────────────────

  // Runs `texts` through a fixed-size pool of overlapping translate() calls.
  async runConcurrentPool(texts, concurrency) {
    let next = 0;
    const worker = async () => {
      for (let i = next++; i < texts.length; i = next++) {
        await this.translator.translate(texts[i]);
      }
    };
    const start = performance.now();
    await Promise.all(Array.from({ length: concurrency }, worker));
    return performance.now() - start;
  }

  // Each translate() call carries a fixed dispatch cost that does not scale
  // with input length. If the API can overlap calls, that cost is recoverable
  // without batched inference; if the speedup stays at 1x the API serializes
  // and only true batching will help.
  async measureConcurrency() {
    if (!(await this.ensureTranslator())) return;

    const btn = document.getElementById('runConcurrency');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div> Measuring...';
    document.getElementById('concurrencyResults').style.display = 'block';

    const texts = [
      ...PAGE_SIM_SEGMENTS.nav,
      ...PAGE_SIM_SEGMENTS.headings,
      ...PAGE_SIM_SEGMENTS.short,
    ];
    const totalChars = texts.reduce((s, t) => s + t.length, 0);
    document.getElementById('concSegments').textContent = texts.length;

    try {
      // Warm-up so the first level is not charged for lazy setup.
      await this.translator.translate(texts[0]);

      let baseline = 0;
      for (const level of [1, 2, 4, 8]) {
        this.showStatus(`Concurrency ${level}...`, true);
        const elapsed = await this.runConcurrentPool(texts, level);
        if (level === 1) baseline = elapsed;

        document.getElementById(`conc${level}Time`).textContent = elapsed.toFixed(0);
        document.getElementById(`conc${level}Cps`).textContent =
          Math.round(totalChars / (elapsed / 1000));
        document.getElementById(`conc${level}Speedup`).textContent =
          baseline > 0 ? (baseline / elapsed).toFixed(2) + '\u00d7' : '-';
      }

      const best = [1, 2, 4, 8]
        .map(l => parseFloat(document.getElementById(`conc${l}Speedup`).textContent))
        .reduce((a, b) => Math.max(a, b), 0);
      document.getElementById('concBestSpeedup').textContent = best.toFixed(2) + '\u00d7';
      document.getElementById('concVerdict').textContent = best >= 1.15
        ? 'Calls overlap: per-call dispatch cost is partly recoverable without batched inference.'
        : 'No speedup: the API serializes translate() calls, so only batched inference will help.';
      this.showStatus('Ready');
    } catch (error) {
      this.showStatus(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Run Concurrency Test';
    }
  }

  // ── Run All ───────────────────────────────────────────────────

  async measureAll() {
    const btn = document.getElementById('runAll');
    btn.disabled = true;
    btn.innerHTML = '<div class="loading"></div> Running...';

    try {
      // 1. Init
      this.showStatus('Initializing translator...', true);
      this.setProgress(5);
      if (!(await this.measureInitTime())) {
        btn.disabled = false;
        btn.textContent = 'Measure All';
        return;
      }

      // 2. Single latency
      this.setProgress(20);
      await this.measureSingleLatency();

      // 3. Throughput
      this.setProgress(40);
      await this.measureThroughput();

      // 4. Batch
      this.setProgress(60);
      await this.measureBatch();

      // 5. Streaming comparison
      this.setProgress(90);
      await this.measureStreamingComparison();

      this.setProgress(100);
      this.showStatus('Complete');
      document.getElementById('saveResults').disabled = false;
    } catch (error) {
      this.showStatus(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Measure All';
    }
  }

  // ── Save / Copy Results ───────────────────────────────────────

  saveResults() {
    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const targetLanguage = document.getElementById('targetLanguage').value;
    const sourceName = LANGUAGE_NAMES[sourceLanguage] || sourceLanguage;
    const targetName = LANGUAGE_NAMES[targetLanguage] || targetLanguage;

    const browserInfo = this.getBrowserInfo();
    const gpuInfo = this.getGpuInfo();

    const initTime = document.getElementById('initTime').textContent;
    const singleLatency = document.getElementById('singleLatency').textContent;
    const avgThroughput = document.getElementById('avgThroughput').textContent;
    const batchThroughput = document.getElementById('batchThroughput').textContent;
    const batchTotalTime = document.getElementById('batchTotalTime').textContent;
    const syncTime = document.getElementById('cmpSyncTime').textContent;
    const streamTime = document.getElementById('cmpStreamTime').textContent;
    const firstChunkTime = document.getElementById('cmpFirstChunk').textContent;
    const streamChunks = document.getElementById('cmpStreamChunks').textContent;
    const streamOverhead = document.getElementById('streamingOverhead').textContent;

    // Throughput per-run details
    const tpRuns = [];
    for (let i = 1; i <= 5; i++) {
      tpRuns.push(`  Run ${i}: ${document.getElementById('tp' + i).textContent} chars/sec (${document.getElementById('ms' + i).textContent} ms)`);
    }

    // Human-readable format
    const lines = [
      `Translation Speed Benchmark`,
      `${'═'.repeat(50)}`,
      `Date:           ${new Date().toLocaleString()}`,
      `Browser:        ${browserInfo}`,
      `GPU:            ${gpuInfo}`,
      `Language Pair:  ${sourceName} → ${targetName} (${sourceLanguage} → ${targetLanguage})`,
      ``,
      `Results`,
      `${'─'.repeat(50)}`,
      `Translator Init:        ${initTime} ms`,
      `Single Translation:     ${singleLatency} ms`,
      ``,
      `Throughput (5 runs):    ${avgThroughput} chars/sec avg`,
      ...tpRuns,
      ``,
      `Batch (15 texts):       ${batchThroughput} chars/sec  (${batchTotalTime} ms total)`,
      ``,
      `Streaming Comparison:`,
      `  translate():          ${syncTime} ms`,
      `  translateStreaming():  ${streamTime} ms  (${streamChunks} chunks, 1st chunk ${firstChunkTime} ms)`,
      `  Overhead:             ${streamOverhead}`,
    ];

    // Page simulation results (if available)
    const simTotal = document.getElementById('simTotalTime').textContent;
    const simSegs = document.getElementById('simSegments').textContent;
    const simAvg = document.getElementById('simAvgPerCall').textContent;
    const simChars = document.getElementById('simTotalChars').textContent;
    if (simTotal !== '0') {
      lines.push(
        ``,
        `Page Simulation (${simSegs} segments, ${simChars} chars):`,
        `  Total Time:           ${simTotal} ms`,
        `  Avg per Call:         ${simAvg} ms`,
        `  Nav/Buttons:          ${document.getElementById('simNavCount').textContent} segs, avg ${document.getElementById('simNavAvgTime').textContent} ms`,
        `  Headings:             ${document.getElementById('simHeadCount').textContent} segs, avg ${document.getElementById('simHeadAvgTime').textContent} ms`,
        `  Short Text/Labels:    ${document.getElementById('simShortCount').textContent} segs, avg ${document.getElementById('simShortAvgTime').textContent} ms`,
        `  Paragraphs:           ${document.getElementById('simParaCount').textContent} segs, avg ${document.getElementById('simParaAvgTime').textContent} ms`,
      );
      lines.push(
        `  With numbers/URLs:    ${document.getElementById('simSpanCount').textContent} segs, avg ${document.getElementById('simSpanAvgTime').textContent} ms, ${document.getElementById('simSpanPer100').textContent} ms/100ch`,
        `  Plain prose:          ${document.getElementById('simNoSpanCount').textContent} segs, avg ${document.getElementById('simNoSpanAvgTime').textContent} ms, ${document.getElementById('simNoSpanPer100').textContent} ms/100ch`,
        `  Protected-span tax:   ${document.getElementById('simSpanTax').textContent}`,
      );
    }

    // Concurrency results (if available)
    const concBest = document.getElementById('concBestSpeedup').textContent;
    if (concBest !== '-') {
      lines.push(
        ``,
        `Concurrency (${document.getElementById('concSegments').textContent} segments):`,
        ...[1, 2, 4, 8].map(l =>
          `  ${String(l).padStart(2)} parallel:          ${document.getElementById('conc' + l + 'Time').textContent} ms, ` +
          `${document.getElementById('conc' + l + 'Cps').textContent} chars/sec, ${document.getElementById('conc' + l + 'Speedup').textContent}`),
        `  Best speedup:         ${concBest}`,
      );
    }

    lines.push(`${'═'.repeat(50)}`);

    // Also include TSV row for spreadsheet pasting
    const tsvHeader = ['Date', 'Browser', 'GPU', 'Language Pair', 'Language Codes',
      'Init (ms)', 'Single Latency (ms)', 'Avg Throughput (chars/sec)',
      'Batch Throughput (chars/sec)', 'Batch Total (ms)',
      'Sync Time (ms)', 'Stream Time (ms)', '1st Chunk (ms)', 'Chunks', 'Stream Overhead',
      'Page Sim Segments', 'Page Sim Total (ms)', 'Page Sim Avg/Call (ms)',
      'Span Tax', 'Span ms/100ch', 'Prose ms/100ch',
      'Conc 1 (ms)', 'Conc 2 (ms)', 'Conc 4 (ms)', 'Conc 8 (ms)', 'Best Speedup'].join('\t');
    const tsvRow = [
      new Date().toLocaleDateString(), browserInfo, gpuInfo,
      `${sourceName} → ${targetName}`, `${sourceLanguage} → ${targetLanguage}`,
      initTime, singleLatency, avgThroughput, batchThroughput, batchTotalTime,
      syncTime, streamTime, firstChunkTime, streamChunks, streamOverhead,
      simSegs, simTotal, simAvg,
      document.getElementById('simSpanTax').textContent,
      document.getElementById('simSpanPer100').textContent,
      document.getElementById('simNoSpanPer100').textContent,
      ...[1, 2, 4, 8].map(l => document.getElementById('conc' + l + 'Time').textContent),
      document.getElementById('concBestSpeedup').textContent
    ].join('\t');

    const clipboardData = lines.join('\n') + '\n\n' + tsvHeader + '\n' + tsvRow;

    navigator.clipboard.writeText(clipboardData).then(() => {
      const btn = document.getElementById('saveResults');
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = '📋 Copy Results'; }, 2000);
    }).catch(() => {
      alert('Failed to copy results to clipboard');
    });
  }

  getBrowserInfo() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg')) return 'Edge ' + (ua.match(/Edg\/([0-9.]+)/) || ['', '?'])[1];
    if (ua.includes('Chrome')) return 'Chrome ' + (ua.match(/Chrome\/([0-9.]+)/) || ['', '?'])[1];
    if (ua.includes('Firefox')) return 'Firefox ' + (ua.match(/Firefox\/([0-9.]+)/) || ['', '?'])[1];
    if (ua.includes('Safari')) return 'Safari ' + (ua.match(/Version\/([0-9.]+)/) || ['', '?'])[1];
    return 'Unknown';
  }

  getGpuInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'WebGL not supported';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    } catch {
      return 'Unknown';
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new TranslationSpeedBenchmark();
});
