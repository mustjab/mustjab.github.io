// Standardized benchmark texts for batch test (15 multi-sentence paragraphs: 5 plain prose, 5 numeric/technical, 5 inline <bN> DOM-tagged)
const BENCHMARK_TEXTS = [
  "The rapid advancement of artificial intelligence has fundamentally transformed how businesses operate across virtually every industry. Companies are leveraging machine learning algorithms to automate complex processes, predict market trends, and deliver personalized customer experiences at unprecedented scale. As deployment expands from cloud data centers to client devices, low-latency local inference has become essential for interactive applications.",
  "In the field of modern medicine, researchers are making remarkable breakthroughs by combining genomic data analysis with sophisticated computational models. These innovations enable earlier disease detection, more targeted therapeutic interventions, and the development of precision medicine approaches tailored to individual genetic profiles. Clinical trials increasingly rely on real-time multilingual collaboration across research hospitals.",
  "The global transition toward renewable energy sources represents one of the most significant economic and environmental shifts in human history. Solar and wind power installations continue to grow exponentially, while advances in battery storage technology are addressing the intermittency challenges that previously limited widespread adoption of clean energy alternatives. Grid operators are modernizing transmission infrastructure to balance regional supply and demand.",
  "International trade agreements and diplomatic negotiations require exceptional linguistic precision to ensure that all parties fully understand the terms and implications of complex multilateral arrangements. Professional translators play a crucial role in facilitating cross-cultural communication and preventing costly misunderstandings between nations. Accurate terminology management remains vital when reviewing regulatory frameworks.",
  "Urban planning and sustainable city design have become increasingly important as the global population continues to concentrate in metropolitan areas. Innovative approaches to public transportation, green infrastructure, and mixed-use development are helping cities reduce their environmental footprint while improving quality of life for residents. Municipal leaders are prioritizing pedestrian-friendly neighborhoods and resilient utility networks.",
  "Global cloud infrastructure spending reached $154 billion in Q4 2025, with annual capital expenditures projected between $150 and $200 billion across major providers. Upgrading clusters to .NET 8 and Node.js 22.4.1 reduced median API latency from 245.8 ms to 112.4 ms across 14,500 production nodes. Full telemetry dashboards and release notes are published at https://example.com/docs/2.8.15?id=676 for platform engineers.",
  "Modern battery packs deliver 285 Wh/kg energy density and retain 91.5% capacity after 1,500 charge cycles at temperatures between -10°C and 45°C. Charging from 10% to 80% requires 18 minutes on a 350 kW DC fast charger, adding 420 km of highway range. Fleet operators tracking 12,840 electric vehicles reported $18.6 million in fuel and maintenance savings during 2025.",
  "The astronomical survey cataloged 4,280 exoplanet candidates across 1,150 star systems located between 12.5 and 640 light-years from Earth. Spectroscopic observations at wavelengths from 0.6 to 28.5 micrometers detected water vapor and carbon dioxide in 38 planetary atmospheres. Researchers published the 208.96 GB dataset under identifier PRD-2026-0513 for independent verification.",
  "Enterprise cybersecurity teams mitigated 3,420 intrusion attempts per day in March 2026, blocking 99.4% of automated phishing payloads within 150 ms. Updating TLS 1.3 cipher suites and enforcing hardware security keys across 48,000 employee accounts eliminated credential-stuffing breaches. Incident response playbooks can be downloaded from /docs/security/2.8.15?id=676 or requested via support@example.com.",
  "Semiconductor fabs operating 2 nm EUV lithography lines achieved a 78.5% wafer yield while reducing power consumption by 24% at 3.6 GHz clock speeds. Each processor integrates 1,024 matrix units delivering 45 TOPS for on-device neural network inference within a 15 W thermal envelope. Volume shipments of 2.5 million units are scheduled for October 24, 2026.",
  "The <b10>James Webb Space Telescope</b10> (<b11>JWST</b11>) is a space telescope designed primarily to conduct <b12>infrared astronomy</b12><b13><b14>[</b14>12<b15>]</b15></b13>. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the <b16>Hubble Space Telescope</b16>. This enables investigations across many fields of <b17>astronomy</b17> and <b18>cosmology</b18>, such as observation of the first stars and the formation of the first <b19>galaxies</b19>.",
  "In <b10>computer science</b10>, <b11>neural machine translation</b11> (<b12>NMT</b12>) is an approach to <b13>machine translation</b13> that uses an <b14>artificial neural network</b14> to predict the likelihood of a sequence of words<b15><b16>[</b16>1<b17>]</b17></b15>. Unlike traditional <b18>statistical machine translation</b18>, which translates individual phrases separately, neural models consider the entire input sentence context at once. Modern <b19>transformer architectures</b19> have significantly improved fluency and grammatical accuracy across dozens of languages.",
  "<b10>Photosynthesis</b10> is a biological process used by many cellular organisms to convert <b11>light energy</b11> into <b12>chemical energy</b12>, which is stored in <b13>organic compounds</b13> that can later be metabolized through <b14>cellular respiration</b14> to fuel the organism's activities<b15><b16>[</b16>4<b17>]</b17></b15>. In <b18>plants</b18>, <b19>algae</b19>, and <b20>cyanobacteria</b20>, photosynthesis uses carbon dioxide and water, releasing <b21>oxygen</b21> as a byproduct. This process is responsible for producing and maintaining the oxygen content of the Earth's atmosphere.",
  "The <b10>Industrial Revolution</b10> was the transition to new manufacturing processes in <b11>Great Britain</b11>, continental <b12>Europe</b12>, and the <b13>United States</b13>, in the period from about 1760 to sometime between 1820 and 1840<b14><b15>[</b15>2<b16>]</b16></b14>. This transition included going from <b17>hand production methods</b17> to <b18>machines</b18>, new chemical manufacturing and <b19>iron production</b19> processes, the increasing use of <b20>water power</b20> and <b21>steam power</b21>, and the rise of the <b22>mechanized factory system</b22>. Output increased dramatically, leading to an unprecedented rise in population growth.",
  "The <b10>World Wide Web</b10> (<b11>WWW</b11> or simply the <b12>Web</b12>) is an information system that enables content sharing over the <b13>Internet</b13> through user-friendly ways meant to appeal to users beyond IT specialists and hobbyists<b14><b15>[</b15>3<b16>]</b16></b14>. It allows documents and other web resources to be accessed over the network according to specific rules of the <b17>Hypertext Transfer Protocol</b17> (<b18>HTTP</b18>). The Web was invented by English computer scientist <b19>Tim Berners-Lee</b19> while at <b20>CERN</b20> in 1989 and opened to the public in 1991."
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

// Numbers (including slash-dates and colon-times, excluding prose percentages
// like 15%), Cyrillic Supplement product codes, URLs, relative query paths,
// emails, and inline <bN>...</bN> DOM tags use phrase-fix span annotations.
const DOM_TAG_SPAN_RE = /<\/?b\d+>/;
const PROTECTED_SPAN_RE = /<\/?b\d+>|\b\d+(?:[.,:/]\d+)*(?![.,:/]?\d|\s*%)|[\u0500-\u052F]+|https?:\/\/\S+|\/[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+\?[A-Za-z0-9._~:/?#[\]@!$&'()*+,;=-]+|\bwww\.\S+|\S+@\S+\.\w+/;

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
    'Docs: https://example.com/docs/2.8.15?id=676',
    'Release path: /docs/release/2.8.15?id=676',
    'Support: support@example.com',
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
    'Our platform leverages cutting-edge artificial intelligence to deliver seamless translation experiences across more than forty languages. Whether you are a small business expanding internationally or a large enterprise managing multilingual content, our tools are designed to meet your needs. Dedicated regional clusters keep response times predictable throughout peak traffic hours.',
    'The latest update includes significant improvements to translation accuracy for East Asian languages, with particular attention to context-dependent terminology and idiomatic expressions. Users can expect faster processing times thanks to optimized neural network inference. Continuous evaluation across domain benchmarks ensures consistent terminology.',
    'Customer satisfaction remains our top priority across every product tier. Our support team is available around the clock to assist with technical questions, account management, and integration guidance. We pride ourselves on rapid resolution for all engineering and billing inquiries.',
    'Security is built into every layer of our infrastructure from day one. All data is encrypted in transit and at rest using industry-standard cryptographic protocols. We undergo regular third-party security audits and maintain compliance with major international data protection regulations.',
    'The API supports both synchronous and streaming translation modes for web applications. Synchronous mode returns the complete translation in a single response, while streaming mode delivers results progressively as each segment finishes. This allows your interface to display partial translations immediately while longer passages continue decoding.',
    'Machine translation quality has improved dramatically over the past decade thanks to advances in deep learning and natural language processing. Modern neural translation models can handle complex grammatical structures, preserve formatting, and maintain consistent terminology across long documents. Hybrid phrase-fixing safeguards keep structured spans intact.',
    'Getting started is simple: create a free account, select your source and target languages, and begin translating immediately. No credit card is required for the free tier, which includes 100,000 characters per month and 250 requests per minute. Enterprise plans scale from $150 to $200 billion in annual processed volume across 48 global regions.',
    'Upgrading the runtime to .NET 8 and ONNX Runtime 1.21.2 reduced average batch latency from 1,744.2 ms to 1,115.5 ms per 1,000 characters on 4-core client devices. Memory footprint stayed under 420 MB while translating 1,250 concurrent segments. Full benchmark reports are available at https://example.com/benchmarks/2.8.15?id=676.',
    'We recommend using the batch translation endpoint with width 512 and batch size 4 when processing 12 to 64 text segments simultaneously. In production telemetry across 18,400 sessions, dynamic batching improved throughput from 1,280 chars/sec to 2,640 chars/sec. Contact support@example.com for custom quota adjustments.',
    'Browser-based translation runs entirely on the user\'s device, ensuring that sensitive records never leave the local machine. Version 159.0.4372.0 processes 24.5 MB language packs using INT4 quantization with zero network round-trips. This privacy-preserving architecture is ideal for healthcare, legal, and financial workflows.',
    'Performance monitoring dashboards provide real-time visibility into p50, p95, and p99 latency percentiles across 142 supported language pairs. Automated alerts notify engineering teams within 60 seconds if error rates exceed 0.25% or throughput drops below 1,100 chars/sec. Historical logs are retained for 90 days at /logs/metrics/2.8.15?id=676.',
    'Regular model updates incorporate the latest training data and tokenizer refinements on a 14-day release cadence. Each candidate model must pass 34 automated regression checks and 1,500 sentence-level BLEU evaluations before shipping to Canary. Rollback takes less than 5 minutes if a regression is detected.',
    'The <b10>James Webb Space Telescope</b10> (<b11>JWST</b11>) is a space telescope designed primarily to conduct <b12>infrared astronomy</b12><b13><b14>[</b14>12<b15>]</b15></b13>. As the largest optical telescope in space, its high resolution and sensitivity allow it to view objects too old, distant, or faint for the <b16>Hubble Space Telescope</b16>. This enables investigations across many fields of <b17>astronomy</b17> and <b18>cosmology</b18>.',
    'In <b10>computer science</b10>, <b11>neural machine translation</b11> (<b12>NMT</b12>) is an approach to <b13>machine translation</b13> that uses an <b14>artificial neural network</b14> to predict the likelihood of a sequence of words<b15><b16>[</b16>1<b17>]</b17></b15>. Unlike traditional <b18>statistical machine translation</b18>, neural models translate entire sentences in context. Modern <b19>transformer models</b19> preserve inline markup tags during page translation.',
    '<b10>Photosynthesis</b10> is a biological process used by cellular organisms to convert <b11>light energy</b11> into <b12>chemical energy</b12>, which is stored in <b13>organic compounds</b13> and later metabolized through <b14>cellular respiration</b14><b15><b16>[</b16>4<b17>]</b17></b15>. In <b18>plants</b18>, <b19>algae</b19>, and <b20>cyanobacteria</b20>, photosynthesis uses carbon dioxide and water while releasing <b21>oxygen</b21>.',
    'The <b10>World Wide Web</b10> (<b11>WWW</b11> or simply the <b12>Web</b12>) is an information system that enables content sharing over the <b13>Internet</b13><b14><b15>[</b15>3<b16>]</b16></b14>. It allows documents and web resources to be accessed according to the rules of the <b17>Hypertext Transfer Protocol</b17> (<b18>HTTP</b18>). The Web was invented by <b19>Tim Berners-Lee</b19> at <b20>CERN</b20> in 1989.',
    'The <b10>International Space Station</b10> (<b11>ISS</b11>) is a modular <b12>space station</b12> in <b13>low Earth orbit</b13><b14><b15>[</b15>6<b16>]</b16></b14>. It is a multinational collaborative project involving five participating space agencies: <b17>NASA</b17>, <b18>Roscosmos</b18>, <b19>JAXA</b19>, <b20>ESA</b20>, and <b21>CSA</b21>. The station serves as a <b22>microgravity</b22> and space environment research laboratory.',
    '<b10>Quantum computing</b10> is a multidisciplinary field comprising aspects of <b11>computer science</b11>, <b12>physics</b12>, and <b13>mathematics</b13> that utilizes <b14>quantum mechanics</b14> to solve complex problems faster than on <b15>classical computers</b15><b16><b17>[</b17>8<b18>]</b18></b16>. The field includes hardware research and <b19>quantum algorithm</b19> development using <b20>qubits</b20>.',
    'An <b10>operating system</b10> (<b11>OS</b11>) is <b12>system software</b12> that manages <b13>computer hardware</b13> and <b14>software</b14> resources, and provides common services for <b15>computer programs</b15><b16><b17>[</b17>9<b18>]</b18></b16>. Time-sharing operating systems schedule tasks for efficient use of the system and may also include accounting software for processor time and <b19>mass storage</b19>.',
    'The <b10>ribosome</b10> is a complex <b11>molecular machine</b11> found within all living <b12>cells</b12> that serves as the site of biological <b13>protein synthesis</b13> (<b14>translation</b14>)<b15><b16>[</b16>11<b17>]</b17></b15>. Ribosomes link <b18>amino acids</b18> together in the order specified by <b19>messenger RNA</b19> (<b20>mRNA</b20>) molecules to form <b21>polypeptide</b21> chains.',
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

    const saveSnapBtn = document.getElementById('saveSpeedSnapshot');
    if (saveSnapBtn) saveSnapBtn.addEventListener('click', () => this.saveSnapshot());
    const cmpSnapBtn = document.getElementById('compareSpeedSnapshot');
    if (cmpSnapBtn) cmpSnapBtn.addEventListener('click', () => this.compareSnapshot());
    const expRunBtn = document.getElementById('exportSpeedRun');
    if (expRunBtn) expRunBtn.addEventListener('click', () => this.exportRun());
    const clrSnapBtn = document.getElementById('clearSpeedSnapshot');
    if (clrSnapBtn) clrSnapBtn.addEventListener('click', () => this.clearSnapshot());
    const snapFile = document.getElementById('speedSnapshotFile');
    if (snapFile) snapFile.addEventListener('change', (e) => this.importSnapshot(e.target.files[0]));

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
      const initMirror = document.getElementById('initTimeMirror');
      if (initMirror) initMirror.textContent = initTime;
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
    const initMirror = document.getElementById('initTimeMirror');
    if (initMirror) initMirror.textContent = '0';
    document.getElementById('initResult').style.display = 'none';
    document.getElementById('saveResults').disabled = true;
    const saveSnapBtn = document.getElementById('saveSpeedSnapshot');
    if (saveSnapBtn) saveSnapBtn.disabled = true;
    const expRunBtn = document.getElementById('exportSpeedRun');
    if (expRunBtn) expRunBtn.disabled = true;
  }

  enableResultActions() {
    const saveBtn = document.getElementById('saveResults');
    if (saveBtn) saveBtn.disabled = false;
    const saveSnapBtn = document.getElementById('saveSpeedSnapshot');
    if (saveSnapBtn) saveSnapBtn.disabled = false;
    const expRunBtn = document.getElementById('exportSpeedRun');
    if (expRunBtn) expRunBtn.disabled = false;
    this.updateOverallScore();
  }

  updateOverallScore() {
    const num = id => {
      const val = parseFloat(String(document.getElementById(id)?.textContent || '0').replace(/[^0-9.-]/g, ''));
      return Number.isFinite(val) && val > 0 ? val : 0;
    };
    const pillars = [
      num('singleScoreCps'),
      num('avgThroughput'),
      num('batchPrimaryThroughput') || num('batchConcThroughput') || num('batchThroughput'),
      num('cmpStreamCps'),
      num('simScoreCps'),
    ].filter(v => v > 0);

    const overallEl = document.getElementById('overallSpeedScore');
    if (!overallEl) return 0;
    if (!pillars.length) {
      overallEl.textContent = '0';
      return 0;
    }
    const geoMean = Math.round(Math.exp(pillars.reduce((sum, v) => sum + Math.log(v), 0) / pillars.length));
    overallEl.textContent = String(geoMean);
    return geoMean;
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
    const ms = performance.now() - start;
    const duration = ms.toFixed(2);
    const cps = ms > 0 ? Math.round((text.length / ms) * 1000) : 0;

    document.getElementById('singleLatency').textContent = duration;
    const latMirror = document.getElementById('singleLatencyMirror');
    if (latMirror) latMirror.textContent = duration;
    const cpsEl = document.getElementById('singleScoreCps');
    if (cpsEl) cpsEl.textContent = String(cps);
    const cpsMirror = document.getElementById('singleCpsMirror');
    if (cpsMirror) cpsMirror.textContent = String(cps);
    this.enableResultActions();
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
    const avgMirror = document.getElementById('avgThroughputMirror');
    if (avgMirror) avgMirror.textContent = avg;
    scratch.innerHTML = '&nbsp;';
    this.enableResultActions();
    this.showStatus('Ready');
  }

  async measureBatch() {
    if (!(await this.ensureTranslator())) return;
    this.showStatus('Running sequential batch benchmark (1×15)...', true);

    const totalChars = BENCHMARK_TEXTS.reduce((sum, text) => sum + text.length, 0);
    const seqGroupMs = { plain: 0, numeric: 0, domTag: 0 };
    const groupChars = { plain: 0, numeric: 0, domTag: 0 };
    const groupKeyFor = text => DOM_TAG_SPAN_RE.test(text)
      ? 'domTag'
      : PROTECTED_SPAN_RE.test(text) ? 'numeric' : 'plain';
    for (const text of BENCHMARK_TEXTS) {
      groupChars[groupKeyFor(text)] += text.length;
    }

    const seqStart = performance.now();
    for (let i = 0; i < BENCHMARK_TEXTS.length; i++) {
      this.setProgress(Math.round(((i + 1) / (BENCHMARK_TEXTS.length * 2)) * 100));
      const text = BENCHMARK_TEXTS[i];
      const itemStart = performance.now();
      await this.translator.translate(text);
      seqGroupMs[groupKeyFor(text)] += (performance.now() - itemStart);
    }

    const seqMs = performance.now() - seqStart;
    const seqCps = Math.round((totalChars / seqMs) * 1000);
    const seqMsPer1k = totalChars > 0 ? (seqMs / totalChars) * 1000 : 0;

    document.getElementById('batchThroughput').textContent = seqCps;
    document.getElementById('batchTotalTime').textContent = seqMs.toFixed(1);
    const seqMsPer1kEl = document.getElementById('batchSeqMsPer1k');
    if (seqMsPer1kEl) seqMsPer1kEl.textContent = seqMsPer1k.toFixed(1);

    this.showStatus('Running concurrent batch benchmark (15×1 Promise.all)...', true);
    let completed = 0;
    const concStart = performance.now();
    await Promise.all(BENCHMARK_TEXTS.map(text =>
      this.translator.translate(text).then(res => {
        completed++;
        this.setProgress(50 + Math.round((completed / BENCHMARK_TEXTS.length) * 50));
        return res;
      })
    ));
    const concMs = performance.now() - concStart;
    const concCps = Math.round((totalChars / concMs) * 1000);
    const concMsPer1k = totalChars > 0 ? (concMs / totalChars) * 1000 : 0;
    const speedup = concMs > 0 ? (seqMs / concMs) : 1;
    const speedupText = `${speedup.toFixed(2)}\u00d7`;

    const concTimeEl = document.getElementById('batchConcTime');
    if (concTimeEl) concTimeEl.textContent = concMs.toFixed(1);
    const concMsPer1kEl = document.getElementById('batchConcMsPer1k');
    if (concMsPer1kEl) concMsPer1kEl.textContent = concMsPer1k.toFixed(1);
    const concCpsEl = document.getElementById('batchConcThroughput');
    if (concCpsEl) concCpsEl.textContent = concCps;
    const speedupEl = document.getElementById('batchSpeedup');
    if (speedupEl) speedupEl.textContent = speedupText;
    const primaryEl = document.getElementById('batchPrimaryThroughput');
    if (primaryEl) primaryEl.textContent = concCps;
    const concMirrorEl = document.getElementById('batchConcMirror');
    if (concMirrorEl) concMirrorEl.textContent = concCps;
    const seqSumEl = document.getElementById('batchSeqSummary');
    if (seqSumEl) seqSumEl.textContent = `${seqMs.toFixed(1)} ms (${seqMsPer1k.toFixed(0)} ms/1k)`;
    const concSumEl = document.getElementById('batchConcSummary');
    if (concSumEl) concSumEl.textContent = `${concMs.toFixed(1)} ms (${concMsPer1k.toFixed(0)} ms/1k)`;
    const badgeEl = document.getElementById('batchSpeedupBadge');
    if (badgeEl) badgeEl.textContent = speedupText;
    const highlightEl = document.getElementById('batchSpeedupHighlight');
    if (highlightEl) {
      highlightEl.style.display = 'block';
      const mirrorBadgeEl = document.getElementById('batchSpeedupMirror');
      if (mirrorBadgeEl) mirrorBadgeEl.textContent = `${speedupText} (${seqCps} \u2192 ${concCps} chars/sec)`;
    }

    for (const [key, prefix] of [['plain', 'batchPlain'], ['numeric', 'batchNumeric'], ['domTag', 'batchDomTag']]) {
      const chars = groupChars[key];
      const ms = seqGroupMs[key];
      const msPer1k = chars > 0 ? (ms / chars) * 1000 : 0;
      const cps = ms > 0 ? Math.round((chars / ms) * 1000) : 0;
      const msEl = document.getElementById(`${prefix}SeqMs`);
      if (msEl) msEl.textContent = ms.toFixed(1);
      const ms1kEl = document.getElementById(`${prefix}MsPer1k`);
      if (ms1kEl) ms1kEl.textContent = msPer1k.toFixed(1);
      const cpsEl = document.getElementById(`${prefix}Cps`);
      if (cpsEl) cpsEl.textContent = String(cps);
    }

    this.batchResult = { totalChars, seqMs, seqCps, seqMsPer1k, concMs, concCps, concMsPer1k, speedup, seqGroupMs, groupChars };
    this.setProgress(100);
    this.showStatus('Ready');
    this.enableResultActions();
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
    const firstMirror = document.getElementById('cmpFirstChunkMirror');
    if (firstMirror) firstMirror.textContent = firstChunkTime;
    const cpsMirror = document.getElementById('cmpStreamCpsMirror');
    if (cpsMirror) cpsMirror.textContent = streamCps;
    const primaryStreamEl = document.getElementById('cmpStreamPrimaryCps');
    if (primaryStreamEl) primaryStreamEl.textContent = streamCps;

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

    this.enableResultActions();
    this.showStatus('Ready');
  }

  // ── Page Simulation ───────────────────────────────────────────

  async measurePageSimulation() {
    if (!(await this.ensureTranslator())) return;

    const btn = document.getElementById('runPageSim');
    btn.disabled = true;
    if (btn.tagName === 'BUTTON') {
      btn.innerHTML = '<div class="loading"></div> Translating page...';
    } else {
      btn.textContent = '⏳';
    }

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
      domTags: { count: 0, totalLen: 0, totalTime: 0 },
      withSpans: { count: 0, totalLen: 0, totalTime: 0 },
      noSpans: { count: 0, totalLen: 0, totalTime: 0 },
    };

    this.showStatus('Running page simulation...', true);
    const overallStart = performance.now();

    try {
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

        if (DOM_TAG_SPAN_RE.test(seg.text)) {
          bySpan.domTags.count++;
          bySpan.domTags.totalLen += seg.text.length;
          bySpan.domTags.totalTime += elapsed;
        }

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
      const spanMap = { domTags: 'simDomTag', withSpans: 'simSpan', noSpans: 'simNoSpan' };
      for (const [key, prefix] of Object.entries(spanMap)) {
        const d = bySpan[key];
        const avgLen = d.count > 0 ? d.totalLen / d.count : 0;
        const avgTime = d.count > 0 ? d.totalTime / d.count : 0;
        const countEl = document.getElementById(prefix + 'Count');
        if (countEl) countEl.textContent = String(d.count);
        const lenEl = document.getElementById(prefix + 'AvgLen');
        if (lenEl) lenEl.textContent = String(Math.round(avgLen));
        const timeEl = document.getElementById(prefix + 'AvgTime');
        if (timeEl) timeEl.textContent = avgTime.toFixed(1);
        const per100El = document.getElementById(prefix + 'Per100');
        if (per100El) per100El.textContent = avgLen > 0 ? (avgTime / avgLen * 100).toFixed(1) : '0';
      }
      const domPer100 = bySpan.domTags.totalLen > 0
        ? (bySpan.domTags.totalTime / bySpan.domTags.totalLen * 100) : 0;
      const withPer100 = bySpan.withSpans.totalLen > 0
        ? (bySpan.withSpans.totalTime / bySpan.withSpans.totalLen * 100) : 0;
      const noPer100 = bySpan.noSpans.totalLen > 0
        ? (bySpan.noSpans.totalTime / bySpan.noSpans.totalLen * 100) : 0;
      const taxStr = noPer100 > 0 ? (withPer100 / noPer100).toFixed(2) + '\u00d7' : '-';
      const domTaxStr = noPer100 > 0 && domPer100 > 0 ? (domPer100 / noPer100).toFixed(2) + '\u00d7' : '-';
      document.getElementById('simSpanTax').textContent = taxStr;
      const taxMirror = document.getElementById('simSpanTaxMirror');
      if (taxMirror) taxMirror.textContent = taxStr;
      const domTaxEl = document.getElementById('simDomTagTax');
      if (domTaxEl) domTaxEl.textContent = domTaxStr;
      const simCps = totalTime > 0 ? Math.round((totalChars / totalTime) * 1000) : 0;
      const simScoreEl = document.getElementById('simScoreCps');
      if (simScoreEl) simScoreEl.textContent = String(simCps);
      const simScoreMirror = document.getElementById('simScoreCpsMirror');
      if (simScoreMirror) simScoreMirror.textContent = String(simCps);
      this.pageSimResult.spanTax = { domPer100, withPer100, noPer100, bySpan };
      this.pageSimResult.cps = simCps;

      progressEl.style.display = 'none';
      this.enableResultActions();
      this.showStatus('Ready');
    } finally {
      btn.disabled = false;
      if (btn.tagName === 'BUTTON') btn.textContent = 'Run Page Simulation';
      else btn.textContent = '↻';
    }
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
      this.setProgress(75);
      await this.measureStreamingComparison();

      // 6. Real-World Page Mix
      this.setProgress(88);
      await this.measurePageSimulation();

      this.setProgress(100);
      this.showStatus('Complete');
      this.enableResultActions();
      if (this.hasAnyBaseline()) {
        this.compareSnapshot();
      }
    } catch (error) {
      this.showStatus(`Error: ${error.message}`);
    } finally {
      btn.disabled = false;
      btn.textContent = '▶ Run Benchmark';
    }
  }

  // ── Baseline Snapshots & Comparison (Edge Canary / Chrome / Custom) ───

  snapshotKey(slot = null) {
    const src = document.getElementById('sourceLanguage')?.value || 'en';
    const tgt = document.getElementById('targetLanguage')?.value || 'es';
    if (!slot) return `speed-run-v1-${src}-${tgt}`;
    return `speed-run-v1-${slot}-${src}-${tgt}`;
  }

  hasAnyBaseline() {
    if (this.baseline || (this.baselines && Object.keys(this.baselines).length > 0)) return true;
    for (const slot of ['canary', 'chrome', 'custom', null]) {
      if (localStorage.getItem(this.snapshotKey(slot))) return true;
    }
    return false;
  }

  buildSnapshot() {
    const sourceLanguage = document.getElementById('sourceLanguage')?.value || 'en';
    const targetLanguage = document.getElementById('targetLanguage')?.value || 'es';
    const num = id => {
      const text = document.getElementById(id)?.textContent ?? '0';
      const parsed = parseFloat(String(text).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    };
    const overallScoreCps = this.updateOverallScore();
    return {
      schemaVersion: 1,
      kind: 'translation-speed-snapshot',
      timestamp: new Date().toISOString(),
      buildLabel: document.getElementById('speedBuildLabel')?.value?.trim() || this.getBrowserInfo(),
      browser: this.getBrowserInfo(),
      gpu: this.getGpuInfo(),
      source: sourceLanguage,
      target: targetLanguage,
      metrics: {
        overallScoreCps,
        initMs: num('initTime'),
        singleLatencyMs: num('singleLatency'),
        singleScoreCps: num('singleScoreCps'),
        avgThroughputCps: num('avgThroughput'),
        batchSeqThroughputCps: num('batchThroughput'),
        batchSeqTotalMs: num('batchTotalTime'),
        batchSeqMsPer1k: num('batchSeqMsPer1k'),
        batchConcThroughputCps: num('batchConcThroughput'),
        batchConcTotalMs: num('batchConcTime'),
        batchConcMsPer1k: num('batchConcMsPer1k'),
        batchSpeedup: num('batchSpeedup'),
        batchDomTagMsPer1k: num('batchDomTagMsPer1k'),
        syncTimeMs: num('cmpSyncTime'),
        streamTimeMs: num('cmpStreamTime'),
        streamCps: num('cmpStreamCps'),
        firstChunkMs: num('cmpFirstChunk'),
        streamChunks: num('cmpStreamChunks'),
        pageSimTotalMs: num('simTotalTime'),
        pageSimAvgMs: num('simAvgPerCall'),
        pageSimCps: num('simScoreCps'),
        domTagPer100Ms: num('simDomTagPer100'),
        domTagTax: num('simDomTagTax'),
        spanPer100Ms: num('simSpanPer100'),
        prosePer100Ms: num('simNoSpanPer100'),
        spanTax: num('simSpanTax'),
        conc1Ms: num('conc1Time'),
        conc2Ms: num('conc2Time'),
        conc4Ms: num('conc4Time'),
        conc8Ms: num('conc8Time'),
        concBestSpeedup: num('concBestSpeedup'),
      },
    };
  }

  static compareSnapshots(current, prior) {
    if (!current?.metrics || !prior?.metrics) {
      throw new Error('Both current and baseline snapshots must include metrics.');
    }
    if (current.source !== prior.source || current.target !== prior.target) {
      throw new Error(`Language pair mismatch: ${current.source}→${current.target} vs ${prior.source}→${prior.target}.`);
    }
    const defs = [
      { key: 'overallScoreCps', label: '🏆 Overall Speed Score (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'singleScoreCps', label: '1. Single Call Speed (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'singleLatencyMs', label: '   Single Call Latency (ms)', unit: 'ms', lowerBetter: true },
      { key: 'avgThroughputCps', label: '2. Long-Passage Throughput (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'batchConcThroughputCps', label: '3. Batched 15× Throughput (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'batchConcTotalMs', label: '   Batched 15× Total Time (ms)', unit: 'ms', lowerBetter: true },
      { key: 'batchConcMsPer1k', label: '   Batched 15× (ms / 1k chars)', unit: 'ms/1k', lowerBetter: true },
      { key: 'batchSeqTotalMs', label: '   Sequential 1×15 Total Time (ms)', unit: 'ms', lowerBetter: true },
      { key: 'batchDomTagMsPer1k', label: '   Inline <bN> DOM Tags (ms / 1k chars)', unit: 'ms/1k', lowerBetter: true },
      { key: 'batchSpeedup', label: '   Batching Speedup (×)', unit: '×', lowerBetter: false },
      { key: 'streamCps', label: '4. Streaming Throughput (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'firstChunkMs', label: '   Streaming 1st Chunk (ms)', unit: 'ms', lowerBetter: true },
      { key: 'pageSimCps', label: '5. Real-Page Mix Speed (chars/sec)', unit: 'chars/sec', lowerBetter: false },
      { key: 'pageSimTotalMs', label: '   Page Simulation Total (ms)', unit: 'ms', lowerBetter: true },
      { key: 'spanTax', label: '   Protected-Span Tax (×)', unit: '×', lowerBetter: true },
      { key: 'domTagTax', label: '   Inline <bN> DOM-Tag Tax (×)', unit: '×', lowerBetter: true },
      { key: 'initMs', label: 'Translator Init (ms)', unit: 'ms', lowerBetter: true },
    ];
    return defs.flatMap(def => {
      const before = prior.metrics[def.key] || 0;
      const after = current.metrics[def.key] || 0;
      if (before <= 0 && after <= 0) return [];
      const deltaPct = before > 0 ? ((after - before) / before) * 100 : null;
      const improved = deltaPct === null ? null : def.lowerBetter ? deltaPct < -1 : deltaPct > 1;
      const regressed = deltaPct === null ? null : def.lowerBetter ? deltaPct > 1 : deltaPct < -1;
      return [{
        ...def,
        before,
        after,
        deltaPct,
        status: improved ? 'improved' : regressed ? 'regressed' : 'neutral',
      }];
    });
  }

  saveSnapshot() {
    try {
      const slot = document.getElementById('baselineSlotSelect')?.value || 'canary';
      const slotNames = { canary: 'Edge Canary', chrome: 'Chrome', custom: 'Custom Baseline' };
      const snapshot = this.buildSnapshot();
      if (!document.getElementById('speedBuildLabel')?.value?.trim()) {
        snapshot.buildLabel = slotNames[slot] || snapshot.buildLabel;
      }
      snapshot.slot = slot;
      localStorage.setItem(this.snapshotKey(slot), JSON.stringify(snapshot));
      localStorage.setItem(this.snapshotKey(null), JSON.stringify(snapshot));
      this.baselines = this.baselines || {};
      this.baselines[slot] = snapshot;
      this.baseline = snapshot;
      this.showInitResult(`Saved ${slotNames[slot] || slot} baseline: ${snapshot.buildLabel} (${snapshot.source} → ${snapshot.target})`, 'success');
    } catch (error) {
      this.showInitResult(`Failed to save baseline: ${error.message}`, 'error');
    }
  }

  async importSnapshot(file) {
    if (!file) return;
    try {
      const snapshot = JSON.parse(await file.text());
      if (snapshot.kind !== 'translation-speed-snapshot' || !snapshot.metrics) {
        throw new Error('Invalid speed benchmark snapshot JSON.');
      }
      const slot = document.getElementById('baselineSlotSelect')?.value || snapshot.slot || 'custom';
      this.baselines = this.baselines || {};
      this.baselines[slot] = snapshot;
      this.baseline = snapshot;
      localStorage.setItem(this.snapshotKey(slot), JSON.stringify(snapshot));
      this.showInitResult(`Imported baseline into ${slot}: ${snapshot.buildLabel || snapshot.browser} (${snapshot.source} → ${snapshot.target})`, 'success');
    } catch (error) {
      this.showInitResult(`Baseline import failed: ${error.message}`, 'error');
    }
  }

  exportRun() {
    const snapshot = this.buildSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translation-speed-${snapshot.source}-${snapshot.target}-${snapshot.timestamp.replace(/[:.]/g, '-')}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  clearSnapshot() {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('speed-run-v1-')) localStorage.removeItem(key);
    }
    this.baseline = null;
    this.baselines = {};
    const cmpEl = document.getElementById('speedSnapshotComparison');
    if (cmpEl) {
      cmpEl.style.display = 'none';
      cmpEl.innerHTML = '';
    }
    const fileInput = document.getElementById('speedSnapshotFile');
    if (fileInput) fileInput.value = '';
    this.showInitResult('Cleared saved speed baselines.', 'info');
  }

  getAvailableBaselines() {
    const list = [];
    const seen = new Set();
    for (const [slot, fallbackName] of [['canary', 'Edge Canary'], ['chrome', 'Chrome'], ['custom', 'Custom']]) {
      const snap = this.baselines?.[slot] || JSON.parse(localStorage.getItem(this.snapshotKey(slot)) || 'null');
      if (snap && snap.metrics) {
        seen.add(JSON.stringify([snap.timestamp, snap.buildLabel]));
        list.push({ slot, title: snap.buildLabel || fallbackName, snapshot: snap });
      }
    }
    if (!list.length) {
      const legacy = this.baseline || JSON.parse(localStorage.getItem(this.snapshotKey(null)) || 'null');
      if (legacy && legacy.metrics) {
        list.push({ slot: 'baseline', title: legacy.buildLabel || legacy.browser || 'Baseline', snapshot: legacy });
      }
    }
    return list;
  }

  compareSnapshot() {
    const cmpEl = document.getElementById('speedSnapshotComparison');
    if (!cmpEl) return;
    try {
      const baselines = this.getAvailableBaselines();
      if (!baselines.length) throw new Error('No saved or imported baselines found for this language pair.');
      const current = this.buildSnapshot();
      const comparisons = baselines.map(b => ({
        title: b.title,
        rows: new Map(TranslationSpeedBenchmark.compareSnapshots(current, b.snapshot).map(r => [r.key, r])),
      }));
      const allKeys = [];
      for (const c of comparisons) {
        for (const [k, r] of c.rows) {
          if (!allKeys.some(item => item.key === k)) allKeys.push({ key: k, label: r.label, after: r.after });
        }
      }
      if (!allKeys.length) throw new Error('Run at least one benchmark test before comparing.');

      const headerCols = comparisons.map(c => `<th>${c.title}</th><th>vs. ${c.title}</th>`).join('');
      const bodyRows = allKeys.map(item => {
        const cols = comparisons.map(c => {
          const row = c.rows.get(item.key);
          if (!row) return '<td>—</td><td>—</td>';
          const deltaStr = row.deltaPct === null ? '—' : `${row.deltaPct > 0 ? '+' : ''}${row.deltaPct.toFixed(1)}%`;
          const color = row.status === 'improved' ? 'var(--success-color, #10b981)'
            : row.status === 'regressed' ? 'var(--error-color, #ef4444)' : 'var(--text-secondary)';
          return `<td>${row.before}</td><td style="font-weight:700; color:${color};">${deltaStr}</td>`;
        }).join('');
        return `<tr>
          <td style="text-align:left; font-weight:${item.key === 'overallScoreCps' ? '700' : '500'};">${item.label}</td>
          <td style="font-weight:700;">${item.after}</td>
          ${cols}
        </tr>`;
      }).join('');

      cmpEl.style.display = 'block';
      cmpEl.innerHTML = `
        <h3>📊 Speed Comparison: ${current.buildLabel || current.browser} vs. ${comparisons.map(c => c.title).join(' & ')}</h3>
        <table class="inner-table" style="width:100%;">
          <thead>
            <tr><th style="text-align:left;">Benchmark Pillar</th><th>Current (${current.buildLabel || current.browser})</th>${headerCols}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      `;
    } catch (error) {
      cmpEl.style.display = 'block';
      cmpEl.innerHTML = `<strong>Comparison unavailable:</strong> ${error.message}`;
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
    const batchConcThroughput = document.getElementById('batchConcThroughput')?.textContent || '0';
    const batchConcTime = document.getElementById('batchConcTime')?.textContent || '0';
    const batchSpeedup = document.getElementById('batchSpeedup')?.textContent || '-';
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
      `Batch (15 texts):`,
      `  Sequential (1×15):    ${batchThroughput} chars/sec  (${batchTotalTime} ms total)`,
      `  Batched (15×1):       ${batchConcThroughput} chars/sec  (${batchConcTime} ms total, speedup ${batchSpeedup})`,
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
      'Batch Seq Throughput (chars/sec)', 'Batch Seq Total (ms)',
      'Batch Conc Throughput (chars/sec)', 'Batch Conc Total (ms)', 'Batch Speedup',
      'Sync Time (ms)', 'Stream Time (ms)', '1st Chunk (ms)', 'Chunks', 'Stream Overhead',
      'Page Sim Segments', 'Page Sim Total (ms)', 'Page Sim Avg/Call (ms)',
      'Span Tax', 'Span ms/100ch', 'Prose ms/100ch',
      'Conc 1 (ms)', 'Conc 2 (ms)', 'Conc 4 (ms)', 'Conc 8 (ms)', 'Best Speedup'].join('\t');
    const tsvRow = [
      new Date().toLocaleDateString(), browserInfo, gpuInfo,
      `${sourceName} → ${targetName}`, `${sourceLanguage} → ${targetLanguage}`,
      initTime, singleLatency, avgThroughput,
      batchThroughput, batchTotalTime, batchConcThroughput, batchConcTime, batchSpeedup,
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
      setTimeout(() => { btn.textContent = '📋 Copy'; }, 2000);
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
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    new TranslationSpeedBenchmark();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TranslationSpeedBenchmark,
    BENCHMARK_TEXTS,
    THROUGHPUT_TEXTS,
    STREAMING_TEST_TEXT,
    PAGE_SIM_SEGMENTS,
    PROTECTED_SPAN_RE,
    DOM_TAG_SPAN_RE,
  };
}
