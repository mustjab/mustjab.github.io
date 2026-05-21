// ─── Reference translations for quality scoring ────────────────────
// Each entry: { source, refs: { langCode: referenceTranslation } }
// Reference translations cover common test pairs.
// For pairs without references, round-trip translation is used.

const QUALITY_TEST_DATA = [
  {
    id: 1,
    category: 'Simple',
    source: 'The weather is beautiful today.',
    refs: {
      'es': 'El clima es hermoso hoy.',
      'fr': 'Le temps est magnifique aujourd\'hui.',
      'de': 'Das Wetter ist heute wunderschön.',
      'zh-hans': '今天天气很好。',
      'ja': '今日はとても良い天気です。',
      'pt': 'O tempo está bonito hoje.',
      'it': 'Il tempo è bellissimo oggi.',
      'ko': '오늘 날씨가 아름답습니다.',
    }
  },
  {
    id: 2,
    category: 'Simple',
    source: 'She reads a book every night before going to sleep.',
    refs: {
      'es': 'Ella lee un libro cada noche antes de irse a dormir.',
      'fr': 'Elle lit un livre chaque soir avant de s\'endormir.',
      'de': 'Sie liest jede Nacht ein Buch, bevor sie schlafen geht.',
      'zh-hans': '她每天晚上睡觉前都会读一本书。',
      'ja': '彼女は毎晩寝る前に本を読みます。',
      'pt': 'Ela lê um livro toda noite antes de dormir.',
      'it': 'Lei legge un libro ogni sera prima di andare a dormire.',
      'ko': '그녀는 매일 밤 잠자리에 들기 전에 책을 읽습니다.',
    }
  },
  {
    id: 3,
    category: 'Numbers & Dates',
    source: 'The meeting is scheduled for March 15, 2025, at 2:30 PM.',
    refs: {
      'es': 'La reunión está programada para el 15 de marzo de 2025, a las 2:30 PM.',
      'fr': 'La réunion est prévue pour le 15 mars 2025, à 14h30.',
      'de': 'Das Treffen ist für den 15. März 2025 um 14:30 Uhr geplant.',
      'zh-hans': '会议定于2025年3月15日下午2:30举行。',
      'ja': '会議は2025年3月15日午後2時30分に予定されています。',
      'pt': 'A reunião está agendada para 15 de março de 2025, às 14h30.',
      'it': 'La riunione è programmata per il 15 marzo 2025, alle 14:30.',
      'ko': '회의는 2025년 3월 15일 오후 2시 30분에 예정되어 있습니다.',
    }
  },
  {
    id: 4,
    category: 'Numbers & Dates',
    source: 'The company reported revenue of $4.7 billion in the third quarter.',
    refs: {
      'es': 'La empresa reportó ingresos de $4.7 mil millones en el tercer trimestre.',
      'fr': 'L\'entreprise a déclaré un chiffre d\'affaires de 4,7 milliards de dollars au troisième trimestre.',
      'de': 'Das Unternehmen meldete im dritten Quartal einen Umsatz von 4,7 Milliarden Dollar.',
      'zh-hans': '该公司第三季度报告收入为47亿美元。',
      'ja': '同社は第3四半期に47億ドルの収益を報告しました。',
    }
  },
  {
    id: 5,
    category: 'Proper Nouns',
    source: 'Albert Einstein developed the theory of relativity while working at the Swiss Patent Office in Bern.',
    refs: {
      'es': 'Albert Einstein desarrolló la teoría de la relatividad mientras trabajaba en la Oficina Suiza de Patentes en Berna.',
      'fr': 'Albert Einstein a développé la théorie de la relativité alors qu\'il travaillait à l\'Office suisse des brevets à Berne.',
      'de': 'Albert Einstein entwickelte die Relativitätstheorie, während er im Schweizerischen Patentamt in Bern arbeitete.',
      'zh-hans': '阿尔伯特·爱因斯坦在伯尔尼的瑞士专利局工作期间发展了相对论。',
      'ja': 'アルベルト・アインシュタインはベルンのスイス特許庁で働いていた時に相対性理論を開発しました。',
    }
  },
  {
    id: 6,
    category: 'Proper Nouns',
    source: 'The United Nations headquarters is located in New York City, on the east side of Manhattan.',
    refs: {
      'es': 'La sede de las Naciones Unidas está ubicada en la ciudad de Nueva York, en el lado este de Manhattan.',
      'fr': 'Le siège des Nations Unies est situé à New York, sur le côté est de Manhattan.',
      'de': 'Der Hauptsitz der Vereinten Nationen befindet sich in New York City, auf der Ostseite von Manhattan.',
      'zh-hans': '联合国总部位于纽约市曼哈顿东侧。',
      'ja': '国連本部はニューヨーク市のマンハッタン東側にあります。',
    }
  },
  {
    id: 7,
    category: 'Idioms',
    source: 'It is raining cats and dogs outside, so we should stay indoors.',
    refs: {
      'es': 'Está lloviendo a cántaros afuera, así que deberíamos quedarnos adentro.',
      'fr': 'Il pleut des cordes dehors, donc nous devrions rester à l\'intérieur.',
      'de': 'Es regnet in Strömen draußen, also sollten wir drinnen bleiben.',
      'zh-hans': '外面下着倾盆大雨，所以我们应该待在室内。',
      'ja': '外は土砂降りなので、室内にいるべきです。',
    }
  },
  {
    id: 8,
    category: 'Idioms',
    source: 'He decided to bite the bullet and submit his resignation letter.',
    refs: {
      'es': 'Él decidió armarse de valor y presentar su carta de renuncia.',
      'fr': 'Il a décidé de serrer les dents et de soumettre sa lettre de démission.',
      'de': 'Er beschloss, in den sauren Apfel zu beißen und sein Kündigungsschreiben einzureichen.',
      'zh-hans': '他决定咬紧牙关提交辞职信。',
      'ja': '彼は覚悟を決めて辞表を提出することにしました。',
    }
  },
  {
    id: 9,
    category: 'Technical',
    source: 'The neural network architecture uses convolutional layers followed by fully connected layers for image classification.',
    refs: {
      'es': 'La arquitectura de la red neuronal utiliza capas convolucionales seguidas de capas completamente conectadas para la clasificación de imágenes.',
      'fr': 'L\'architecture du réseau neuronal utilise des couches convolutives suivies de couches entièrement connectées pour la classification d\'images.',
      'de': 'Die neuronale Netzwerkarchitektur verwendet Faltungsschichten gefolgt von vollständig verbundenen Schichten zur Bildklassifizierung.',
      'zh-hans': '该神经网络架构使用卷积层和全连接层进行图像分类。',
      'ja': 'このニューラルネットワークアーキテクチャは、画像分類のために畳み込み層の後に全結合層を使用しています。',
    }
  },
  {
    id: 10,
    category: 'Technical',
    source: 'Quantum entanglement allows particles to be correlated regardless of the distance separating them.',
    refs: {
      'es': 'El entrelazamiento cuántico permite que las partículas estén correlacionadas independientemente de la distancia que las separa.',
      'fr': 'L\'intrication quantique permet aux particules d\'être corrélées indépendamment de la distance qui les sépare.',
      'de': 'Die Quantenverschränkung ermöglicht es Teilchen, unabhängig von der sie trennenden Entfernung korreliert zu sein.',
      'zh-hans': '量子纠缠使粒子无论相距多远都能保持关联。',
      'ja': '量子もつれにより、粒子は距離に関係なく相関を持つことができます。',
    }
  },
  {
    id: 11,
    category: 'Grammar',
    source: 'If I had known about the delay, I would have taken an earlier flight.',
    refs: {
      'es': 'Si hubiera sabido del retraso, habría tomado un vuelo más temprano.',
      'fr': 'Si j\'avais su le retard, j\'aurais pris un vol plus tôt.',
      'de': 'Wenn ich von der Verspätung gewusst hätte, hätte ich einen früheren Flug genommen.',
      'zh-hans': '如果我知道延误的话，我就会坐更早的航班。',
      'ja': '遅延を知っていたら、もっと早い便に乗っていたでしょう。',
    }
  },
  {
    id: 12,
    category: 'Grammar',
    source: 'The bridge that was built in the nineteenth century has been declared a national monument.',
    refs: {
      'es': 'El puente que fue construido en el siglo diecinueve ha sido declarado monumento nacional.',
      'fr': 'Le pont qui a été construit au dix-neuvième siècle a été déclaré monument national.',
      'de': 'Die Brücke, die im neunzehnten Jahrhundert erbaut wurde, wurde zum Nationaldenkmal erklärt.',
      'zh-hans': '这座建于十九世纪的桥梁已被宣布为国家纪念碑。',
      'ja': '19世紀に建設されたその橋は国の記念碑に指定されました。',
    }
  },
  {
    id: 13,
    category: 'Cultural',
    source: 'The traditional tea ceremony is an important cultural practice that emphasizes mindfulness and respect.',
    refs: {
      'es': 'La ceremonia del té tradicional es una práctica cultural importante que enfatiza la atención plena y el respeto.',
      'fr': 'La cérémonie du thé traditionnelle est une pratique culturelle importante qui met l\'accent sur la pleine conscience et le respect.',
      'de': 'Die traditionelle Teezeremonie ist eine wichtige kulturelle Praxis, die Achtsamkeit und Respekt betont.',
      'zh-hans': '传统茶道是一种重要的文化实践，强调正念和尊重。',
      'ja': '伝統的な茶道は、マインドフルネスと敬意を重視する重要な文化的慣習です。',
    }
  },
  {
    id: 14,
    category: 'Long Sentence',
    source: 'The research team published their findings in a peer-reviewed journal, demonstrating that the new treatment reduced symptoms by forty percent compared to the control group over a twelve-month observation period.',
    refs: {
      'es': 'El equipo de investigación publicó sus hallazgos en una revista revisada por pares, demostrando que el nuevo tratamiento redujo los síntomas en un cuarenta por ciento en comparación con el grupo de control durante un período de observación de doce meses.',
      'fr': 'L\'équipe de recherche a publié ses résultats dans une revue à comité de lecture, démontrant que le nouveau traitement réduisait les symptômes de quarante pour cent par rapport au groupe témoin sur une période d\'observation de douze mois.',
      'de': 'Das Forschungsteam veröffentlichte seine Ergebnisse in einer begutachteten Fachzeitschrift und zeigte, dass die neue Behandlung die Symptome über einen Beobachtungszeitraum von zwölf Monaten im Vergleich zur Kontrollgruppe um vierzig Prozent reduzierte.',
      'zh-hans': '研究团队在同行评审期刊上发表了他们的发现，表明新疗法在十二个月的观察期内与对照组相比减少了百分之四十的症状。',
      'ja': '研究チームは査読付きジャーナルに研究結果を発表し、新しい治療法が12か月の観察期間中に対照群と比較して症状を40パーセント軽減したことを実証しました。',
    }
  },
  {
    id: 15,
    category: 'Ambiguity',
    source: 'The bank near the river closed early because of the flood warning.',
    refs: {
      'es': 'El banco cerca del río cerró temprano debido a la advertencia de inundación.',
      'fr': 'La banque près de la rivière a fermé tôt en raison de l\'alerte aux inondations.',
      'de': 'Die Bank in der Nähe des Flusses schloss wegen der Hochwasserwarnung früh.',
      'zh-hans': '河边的银行因洪水警报提前关闭。',
      'ja': '川の近くの銀行は洪水警報のため早く閉まりました。',
    }
  },
  {
    id: 16,
    category: 'Negation',
    source: 'The committee has not yet reached a consensus on the proposed policy changes.',
    refs: {
      'es': 'El comité aún no ha llegado a un consenso sobre los cambios de política propuestos.',
      'fr': 'Le comité n\'a pas encore atteint un consensus sur les changements de politique proposés.',
      'de': 'Der Ausschuss hat noch keinen Konsens über die vorgeschlagenen politischen Änderungen erzielt.',
      'zh-hans': '委员会尚未就提议的政策变更达成共识。',
      'ja': '委員会は提案された政策変更についてまだ合意に達していません。',
    }
  },
  {
    id: 17,
    category: 'Passive Voice',
    source: 'The results were analyzed by an independent laboratory and confirmed by three separate institutions.',
    refs: {
      'es': 'Los resultados fueron analizados por un laboratorio independiente y confirmados por tres instituciones separadas.',
      'fr': 'Les résultats ont été analysés par un laboratoire indépendant et confirmés par trois institutions distinctes.',
      'de': 'Die Ergebnisse wurden von einem unabhängigen Labor analysiert und von drei separaten Institutionen bestätigt.',
      'zh-hans': '结果由一个独立实验室分析，并由三个独立机构确认。',
      'ja': '結果は独立した研究所によって分析され、3つの別々の機関によって確認されました。',
    }
  },
  {
    id: 18,
    category: 'List Structure',
    source: 'The project requires three key resources: skilled engineers, advanced computing infrastructure, and sufficient funding for at least two years.',
    refs: {
      'es': 'El proyecto requiere tres recursos clave: ingenieros calificados, infraestructura informática avanzada y financiación suficiente durante al menos dos años.',
      'fr': 'Le projet nécessite trois ressources clés : des ingénieurs qualifiés, une infrastructure informatique avancée et un financement suffisant pour au moins deux ans.',
      'de': 'Das Projekt erfordert drei Schlüsselressourcen: qualifizierte Ingenieure, fortschrittliche Computerinfrastruktur und ausreichende Finanzierung für mindestens zwei Jahre.',
      'zh-hans': '该项目需要三个关键资源：技术熟练的工程师、先进的计算基础设施以及至少两年的充足资金。',
      'ja': 'このプロジェクトには3つの重要なリソースが必要です：熟練したエンジニア、高度なコンピューティングインフラストラクチャ、そして少なくとも2年間の十分な資金。',
    }
  },
  {
    id: 19,
    category: 'Formal',
    source: 'We respectfully request that you review the attached documents and provide your feedback at your earliest convenience.',
    refs: {
      'es': 'Le solicitamos respetuosamente que revise los documentos adjuntos y proporcione sus comentarios a la mayor brevedad posible.',
      'fr': 'Nous vous prions respectueusement de bien vouloir examiner les documents ci-joints et de nous faire part de vos commentaires dans les meilleurs délais.',
      'de': 'Wir bitten Sie höflich, die beigefügten Dokumente zu überprüfen und uns Ihre Rückmeldung zum frühestmöglichen Zeitpunkt mitzuteilen.',
      'zh-hans': '我们恳请您审阅所附文件，并尽早提供您的反馈意见。',
      'ja': '添付の書類をご確認いただき、お早めにご意見をお聞かせくださいますようお願い申し上げます。',
    }
  },
  {
    id: 20,
    category: 'Colloquial',
    source: 'I am going to grab some coffee and then figure out what went wrong with the server.',
    refs: {
      'es': 'Voy a tomar un café y luego voy a averiguar qué salió mal con el servidor.',
      'fr': 'Je vais prendre un café et ensuite comprendre ce qui n\'a pas fonctionné avec le serveur.',
      'de': 'Ich hole mir einen Kaffee und finde dann heraus, was mit dem Server schiefgelaufen ist.',
      'zh-hans': '我去喝杯咖啡，然后弄清楚服务器出了什么问题。',
      'ja': 'コーヒーを買ってきて、それからサーバーの何が問題だったのか調べます。',
    }
  },
  // ── Defect-trigger sentences: added so BLEU also moves when on-device fixes land.
  // Each contains tokens that on-device translation is known to corrupt
  // (brands, acronyms, mixed-case product names, URLs, version numbers).
  {
    id: 21,
    category: 'Tech Products',
    source: 'I bought a new iPhone running iOS and installed Discord and Steam on it.',
    refs: {
      'es': 'Compré un nuevo iPhone con iOS e instalé Discord y Steam en él.',
      'fr': 'J\'ai acheté un nouvel iPhone sous iOS et j\'ai installé Discord et Steam dessus.',
      'de': 'Ich habe ein neues iPhone mit iOS gekauft und Discord und Steam darauf installiert.',
      'zh-hans': '我买了一部运行iOS的新iPhone，并在上面安装了Discord和Steam。',
      'ja': 'iOSが動作する新しいiPhoneを購入し、DiscordとSteamをインストールしました。',
    }
  },
  {
    id: 22,
    category: 'Tech Acronyms',
    source: 'The API returned 179.5 MB of data via HTTP in JSON format.',
    refs: {
      'es': 'La API devolvió 179.5 MB de datos a través de HTTP en formato JSON.',
      'fr': 'L\'API a renvoyé 179,5 Mo de données via HTTP au format JSON.',
      'de': 'Die API gab 179,5 MB Daten über HTTP im JSON-Format zurück.',
      'zh-hans': 'API通过HTTP以JSON格式返回了179.5 MB的数据。',
      'ja': 'APIはHTTP経由で179.5 MBのデータをJSON形式で返しました。',
    }
  },
  {
    id: 23,
    category: 'Tech Products',
    source: 'Watch YouTube videos through PowerShell while using ChatGPT, MySQL, and WhatsApp.',
    refs: {
      'es': 'Mira videos de YouTube a través de PowerShell mientras usas ChatGPT, MySQL y WhatsApp.',
      'fr': 'Regardez des vidéos YouTube via PowerShell tout en utilisant ChatGPT, MySQL et WhatsApp.',
      'de': 'Schauen Sie YouTube-Videos über PowerShell, während Sie ChatGPT, MySQL und WhatsApp verwenden.',
      'zh-hans': '在使用ChatGPT、MySQL和WhatsApp的同时，通过PowerShell观看YouTube视频。',
      'ja': 'ChatGPT、MySQL、WhatsAppを使いながら、PowerShellでYouTubeの動画を見ます。',
    }
  },
  {
    id: 24,
    category: 'Tech Acronyms',
    source: 'Install the MSI package to enable RSS feeds with OCR and SDK support.',
    refs: {
      'es': 'Instala el paquete MSI para habilitar los feeds RSS con soporte de OCR y SDK.',
      'fr': 'Installez le paquet MSI pour activer les flux RSS avec prise en charge OCR et SDK.',
      'de': 'Installieren Sie das MSI-Paket, um RSS-Feeds mit OCR- und SDK-Unterstützung zu aktivieren.',
      'zh-hans': '安装MSI软件包以启用支持OCR和SDK的RSS订阅源。',
      'ja': 'MSIパッケージをインストールして、OCRとSDKをサポートするRSSフィードを有効にします。',
    }
  },
  {
    id: 25,
    category: 'Proper Nouns',
    source: 'Albert Einstein worked at MIT and later collaborated with DeepMind in London.',
    refs: {
      'es': 'Albert Einstein trabajó en MIT y más tarde colaboró con DeepMind en Londres.',
      'fr': 'Albert Einstein a travaillé au MIT et a ensuite collaboré avec DeepMind à Londres.',
      'de': 'Albert Einstein arbeitete am MIT und kollaborierte später mit DeepMind in London.',
      'zh-hans': '阿尔伯特·爱因斯坦曾在MIT工作，后来在伦敦与DeepMind合作。',
      'ja': 'アルベルト・アインシュタインはMITで働き、後にロンドンのDeepMindと協力しました。',
    }
  },
  {
    id: 26,
    category: 'Numbers & Dates',
    source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    refs: {
      'es': 'Actualiza a la versión 7.0 para Windows 11 para gestionar el presupuesto de $3.8M este año.',
      'fr': 'Mettez à niveau vers la version 7.0 pour Windows 11 pour gérer le budget de 3,8 M$ cette année.',
      'de': 'Aktualisieren Sie auf Version 7.0 für Windows 11, um das Budget von 3,8 Mio. $ in diesem Jahr zu verwalten.',
      'zh-hans': '升级到适用于Windows 11的7.0版本以处理今年380万美元的预算。',
      'ja': 'Windows 11用のバージョン7.0にアップグレードして、今年の380万ドルの予算に対応します。',
    }
  },
];

// ─── Language names (shared) ────────────────────────────────────────
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

// ─── Searchable Language Select (reused) ────────────────────────────
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
        this.updateHighlight(); break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        this.updateHighlight(); break;
      case 'Enter':
        e.preventDefault();
        if (this.selectedIndex >= 0) this.selectLanguage(this.filteredLanguages[this.selectedIndex]);
        else if (this.filteredLanguages.length > 0) this.selectLanguage(this.filteredLanguages[0]);
        break;
      case 'Escape':
        e.preventDefault(); this.close(); break;
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

// ─── BLEU-like scoring ──────────────────────────────────────────────

function tokenize(text) {
  // CJK-aware tokenization: split CJK characters individually (standard for BLEU on Chinese/Japanese/Korean)
  // For Latin/other scripts: word-level tokenization with punctuation separated
  const normalized = text.toLowerCase();
  const tokens = [];
  // CJK Unified Ideographs, Hiragana, Katakana, Hangul, full-width chars
  const cjkPattern = /[\u3000-\u9fff\uf900-\ufaff\uac00-\ud7af\uff00-\uffef]/;

  let currentWord = '';
  for (const char of normalized) {
    if (cjkPattern.test(char)) {
      // Flush any accumulated Latin word
      if (currentWord.trim()) tokens.push(currentWord.trim());
      currentWord = '';
      // Each CJK character is its own token
      tokens.push(char);
    } else if (/[.,!?;:"""''(){}[\]、。！？「」『』（）]/.test(char)) {
      if (currentWord.trim()) tokens.push(currentWord.trim());
      currentWord = '';
      tokens.push(char);
    } else if (/\s/.test(char)) {
      if (currentWord.trim()) tokens.push(currentWord.trim());
      currentWord = '';
    } else {
      currentWord += char;
    }
  }
  if (currentWord.trim()) tokens.push(currentWord.trim());

  return tokens.filter(t => t.length > 0);
}

function getNgrams(tokens, n) {
  const ngrams = {};
  for (let i = 0; i <= tokens.length - n; i++) {
    const gram = tokens.slice(i, i + n).join(' ');
    ngrams[gram] = (ngrams[gram] || 0) + 1;
  }
  return ngrams;
}

function countClippedMatches(candidateNgrams, referenceNgrams) {
  let matches = 0;
  for (const gram in candidateNgrams) {
    if (referenceNgrams[gram]) {
      matches += Math.min(candidateNgrams[gram], referenceNgrams[gram]);
    }
  }
  return matches;
}

function computeBLEU(candidate, reference) {
  const candTokens = tokenize(candidate);
  const refTokens = tokenize(reference);

  if (candTokens.length === 0) return 0;

  // Compute modified precision for n=1..4
  const maxN = Math.min(4, candTokens.length);
  let logPrecisionSum = 0;
  let validN = 0;

  for (let n = 1; n <= maxN; n++) {
    const candNgrams = getNgrams(candTokens, n);
    const refNgrams = getNgrams(refTokens, n);
    const total = Object.values(candNgrams).reduce((a, b) => a + b, 0);
    const matches = countClippedMatches(candNgrams, refNgrams);

    if (total > 0 && matches > 0) {
      logPrecisionSum += Math.log(matches / total);
      validN++;
    } else if (total > 0) {
      // Smoothing: add small epsilon to avoid log(0)
      logPrecisionSum += Math.log(0.01 / total);
      validN++;
    }
  }

  if (validN === 0) return 0;

  // Brevity penalty
  const bp = candTokens.length >= refTokens.length
    ? 1
    : Math.exp(1 - refTokens.length / candTokens.length);

  return bp * Math.exp(logPrecisionSum / validN) * 100; // 0-100 scale
}

// Round-trip similarity: compare original to round-tripped text
function computeRoundTripScore(original, roundTripped) {
  const origTokens = tokenize(original);
  const rtTokens = tokenize(roundTripped);

  if (origTokens.length === 0 || rtTokens.length === 0) return 0;

  // Use unigram + bigram overlap as a simple similarity measure
  let totalScore = 0;
  for (let n = 1; n <= 2; n++) {
    const origNgrams = getNgrams(origTokens, n);
    const rtNgrams = getNgrams(rtTokens, n);
    const origTotal = Object.values(origNgrams).reduce((a, b) => a + b, 0);
    const matches = countClippedMatches(rtNgrams, origNgrams);
    const rtTotal = Object.values(rtNgrams).reduce((a, b) => a + b, 0);

    // F1-like: harmonic mean of precision and recall
    const precision = rtTotal > 0 ? matches / rtTotal : 0;
    const recall = origTotal > 0 ? matches / origTotal : 0;
    const f1 = (precision + recall) > 0 ? 2 * precision * recall / (precision + recall) : 0;
    totalScore += f1;
  }

  return (totalScore / 2) * 100; // 0-100 scale
}

// ─── Quality Benchmark ─────────────────────────────────────────────

class TranslationQualityBenchmark {
  constructor() {
    this.translator = null;
    this.reverseTranslator = null;
    this.sourceSelect = null;
    this.targetSelect = null;
    this.testing = false;
    this.results = [];
    this.defectTesting = false;
    this.defectResults = [];
    this.init();
  }

  async init() {
    this.setupLanguageSelectors();
    this.setupEventListeners();
    this.updateTestMode();
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
    document.getElementById('startTest').addEventListener('click', () => this.runTests());
    document.getElementById('stopTest').addEventListener('click', () => this.stopTests());
    document.getElementById('clearResults').addEventListener('click', () => this.clearResults());
    document.getElementById('copyResults').addEventListener('click', () => this.copyResults());
    document.getElementById('swapLanguages').addEventListener('click', () => this.swapLanguages());
    document.getElementById('sourceLanguage').addEventListener('change', () => this.onLanguageChange());
    document.getElementById('targetLanguage').addEventListener('change', () => this.onLanguageChange());
    document.getElementById('runDefectTests').addEventListener('click', () => this.runDefectTests());
    document.getElementById('stopDefectTests').addEventListener('click', () => this.stopDefectTests());
    document.getElementById('copyDefectResults').addEventListener('click', () => this.copyDefectResults());
    document.getElementById('saveSnapshot').addEventListener('click', () => this.saveSnapshot());
    document.getElementById('compareSnapshot').addEventListener('click', () => this.compareSnapshot());
    document.getElementById('clearSnapshot').addEventListener('click', () => this.clearSnapshot());
  }

  async checkAPI() {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    indicator.className = 'status-indicator checking';

    if ('Translator' in self) {
      indicator.className = 'status-indicator available';
      text.textContent = 'Translation API is available';
      document.getElementById('startTest').disabled = false;
      document.getElementById('runDefectTests').disabled = false;
    } else {
      indicator.className = 'status-indicator unavailable';
      text.textContent = 'Translation API is not available';
    }
  }

  getTestMode() {
    const source = document.getElementById('sourceLanguage').value;
    const target = document.getElementById('targetLanguage').value;

    // Check if we have reference translations for this pair
    if (source === 'en') {
      const hasRefs = QUALITY_TEST_DATA.some(d => d.refs[target]);
      if (hasRefs) return 'reference';
    }
    return 'roundtrip';
  }

  updateTestMode() {
    const mode = this.getTestMode();
    const badge = document.getElementById('modeBadge');
    const desc = document.getElementById('modeDescription');
    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;

    if (mode === 'reference') {
      const count = QUALITY_TEST_DATA.filter(d => d.refs[target]).length;
      badge.textContent = 'Reference';
      badge.className = 'mode-badge mode-reference';
      desc.textContent = `${count} test sentences with reference translations for ${targetName}. Scored using n-gram similarity (BLEU).`;
    } else {
      badge.textContent = 'Round-Trip';
      badge.className = 'mode-badge mode-roundtrip';
      desc.textContent = `No reference translations for ${targetName}. Will use round-trip translation (source → target → source) to measure fidelity.`;
    }

    document.getElementById('totalCount').textContent = QUALITY_TEST_DATA.length;

    // Defect-test panel: count cases that match current target.
    const defectInfo = document.getElementById('defectInfoText');
    if (defectInfo) {
      const target = document.getElementById('targetLanguage').value;
      const cases = DEFECT_TEST_DATA.filter(c => c.lang === target);
      if (cases.length > 0) {
        const byId = {};
        cases.forEach(c => { byId[c.id] = (byId[c.id] || 0) + 1; });
        const catCount = Object.keys(byId).length;
        defectInfo.textContent =
          `${cases.length} defect cases across ${catCount} categories will run for ${targetName}.`;
      } else {
        defectInfo.textContent =
          `No defect cases defined for ${targetName} yet. Defect tests target es, ja, and zh-hans.`;
      }
    }
  }

  onLanguageChange() {
    this.translator = null;
    this.reverseTranslator = null;
    this.updateTestMode();
  }

  swapLanguages() {
    const srcVal = this.sourceSelect.getValue();
    const tgtVal = this.targetSelect.getValue();
    this.sourceSelect.setValue(tgtVal);
    this.targetSelect.setValue(srcVal);
    this.onLanguageChange();
  }

  async ensureTranslators() {
    const source = document.getElementById('sourceLanguage').value;
    const target = document.getElementById('targetLanguage').value;
    const progressContainer = document.getElementById('downloadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    try {
      // Forward translator
      if (!this.translator) {
        this.log(`Initializing translator: ${LANGUAGE_NAMES[source]} → ${LANGUAGE_NAMES[target]}...`, 'info');
        this.translator = await Translator.create({
          sourceLanguage: source,
          targetLanguage: target,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              progressContainer.style.display = 'block';
              const percent = Math.round(e.loaded * 100);
              progressFill.style.width = `${percent}%`;
              progressText.textContent = `${percent}%`;
            });
          }
        });
        progressContainer.style.display = 'none';
      }

      // Reverse translator (for round-trip mode)
      if (this.getTestMode() === 'roundtrip' && !this.reverseTranslator) {
        this.log(`Initializing reverse translator: ${LANGUAGE_NAMES[target]} → ${LANGUAGE_NAMES[source]}...`, 'info');
        this.reverseTranslator = await Translator.create({
          sourceLanguage: target,
          targetLanguage: source,
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              progressContainer.style.display = 'block';
              const percent = Math.round(e.loaded * 100);
              progressFill.style.width = `${percent}%`;
              progressText.textContent = `${percent}%`;
            });
          }
        });
        progressContainer.style.display = 'none';
      }

      return true;
    } catch (error) {
      progressContainer.style.display = 'none';
      this.log(`Failed to initialize translator: ${error.message}`, 'error');
      return false;
    }
  }

  // ── Test execution ───────────────────────────────────────────────

  async runTests() {
    if (this.testing) return;
    this.testing = true;
    this.results = [];

    document.getElementById('startTest').disabled = true;
    document.getElementById('stopTest').disabled = false;
    document.getElementById('copyResults').disabled = true;

    const logEl = document.getElementById('testLog');
    logEl.innerHTML = '';

    if (!(await this.ensureTranslators())) {
      this.testing = false;
      document.getElementById('startTest').disabled = false;
      document.getElementById('stopTest').disabled = true;
      return;
    }

    const mode = this.getTestMode();
    const target = document.getElementById('targetLanguage').value;
    const testData = mode === 'reference'
      ? QUALITY_TEST_DATA.filter(d => d.refs[target])
      : QUALITY_TEST_DATA;

    document.getElementById('totalCount').textContent = testData.length;
    this.log(`Starting ${mode} quality test (${testData.length} sentences)...`, 'info');

    let totalScore = 0;
    let totalTime = 0;

    for (let i = 0; i < testData.length; i++) {
      if (!this.testing) {
        this.log('Test paused by user.', 'warning');
        break;
      }

      const item = testData[i];
      const startTime = performance.now();

      try {
        let score, translated, details;

        if (mode === 'reference') {
          // Reference mode: translate and compare to reference
          translated = await this.translator.translate(item.source);
          const reference = item.refs[target];
          score = computeBLEU(translated, reference);
          details = { reference, translated };

          const scoreClass = score >= 50 ? 'good' : score >= 25 ? 'ok' : 'poor';
          this.log(
            `<span class="log-q">Q${i + 1} [${item.category}]:</span> ${this.escapeHtml(item.source)}` +
            `<br><span class="log-ref">Reference:</span> ${this.escapeHtml(reference)}` +
            `<br><span class="log-out">Output:</span> ${this.escapeHtml(translated)}` +
            `<br><span class="log-score ${scoreClass}">Score: ${score.toFixed(1)}%</span>`,
            score >= 50 ? 'success' : score >= 25 ? 'warning' : 'error'
          );
        } else {
          // Round-trip mode: source → target → source
          translated = await this.translator.translate(item.source);
          const roundTripped = await this.reverseTranslator.translate(translated);
          score = computeRoundTripScore(item.source, roundTripped);
          details = { translated, roundTripped };

          const scoreClass = score >= 70 ? 'good' : score >= 40 ? 'ok' : 'poor';
          this.log(
            `<span class="log-q">Q${i + 1} [${item.category}]:</span> ${this.escapeHtml(item.source)}` +
            `<br><span class="log-out">Translated:</span> ${this.escapeHtml(translated)}` +
            `<br><span class="log-rt">Round-trip:</span> ${this.escapeHtml(roundTripped)}` +
            `<br><span class="log-score ${scoreClass}">Fidelity: ${score.toFixed(1)}%</span>`,
            score >= 70 ? 'success' : score >= 40 ? 'warning' : 'error'
          );
        }

        const elapsed = performance.now() - startTime;
        totalTime += elapsed;
        totalScore += score;

        this.results.push({
          id: item.id,
          category: item.category,
          source: item.source,
          score,
          time: elapsed,
          ...details
        });

      } catch (error) {
        this.log(`Q${i + 1}: Error - ${error.message}`, 'error');
        this.results.push({
          id: item.id,
          category: item.category,
          source: item.source,
          score: 0,
          time: 0,
          error: error.message
        });
      }

      // Update UI
      const completed = this.results.length;
      document.getElementById('completedCount').textContent = completed;
      document.getElementById('overallScore').textContent = (totalScore / completed).toFixed(1);
      document.getElementById('avgTime').textContent = Math.round(totalTime / completed);
      document.getElementById('testProgressFill').style.width =
        ((completed / testData.length) * 100) + '%';
      document.getElementById('testProgressText').textContent =
        `${completed} / ${testData.length}`;
    }

    // Final
    if (this.results.length > 0) {
      const avgScore = (totalScore / this.results.length).toFixed(1);
      this.log(`\nTest complete! Overall score: ${avgScore}% (${this.results.length} sentences)`, 'info');
      document.getElementById('copyResults').disabled = false;
    }

    this.testing = false;
    document.getElementById('startTest').disabled = false;
    document.getElementById('stopTest').disabled = true;
  }

  stopTests() {
    this.testing = false;
    document.getElementById('stopTest').disabled = true;
  }

  clearResults() {
    this.results = [];
    document.getElementById('testLog').innerHTML = '';
    document.getElementById('overallScore').textContent = '0';
    document.getElementById('completedCount').textContent = '0';
    document.getElementById('avgTime').textContent = '0';
    document.getElementById('testProgressFill').style.width = '0%';
    document.getElementById('testProgressText').textContent = '0 / 0';
    document.getElementById('copyResults').disabled = true;
    this.updateTestMode();
  }

  // ── Logging ──────────────────────────────────────────────────────

  log(message, type = 'info') {
    const logEl = document.getElementById('testLog');
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ── Copy Results ─────────────────────────────────────────────────

  copyResults() {
    if (this.results.length === 0) return;

    const source = document.getElementById('sourceLanguage').value;
    const target = document.getElementById('targetLanguage').value;
    const sourceName = LANGUAGE_NAMES[source] || source;
    const targetName = LANGUAGE_NAMES[target] || target;
    const mode = this.getTestMode();
    const browserInfo = this.getBrowserInfo();

    const avgScore = (this.results.reduce((s, r) => s + r.score, 0) / this.results.length).toFixed(1);
    const avgTime = Math.round(this.results.reduce((s, r) => s + r.time, 0) / this.results.length);

    // Category breakdown
    const categories = {};
    this.results.forEach(r => {
      if (!categories[r.category]) categories[r.category] = [];
      categories[r.category].push(r.score);
    });

    const categoryLines = Object.entries(categories).map(([cat, scores]) => {
      const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
      return `  ${cat.padEnd(16)} ${avg}%  (${scores.length} tests)`;
    });

    const lines = [
      'Translation Quality Benchmark',
      '═'.repeat(50),
      `Date:           ${new Date().toLocaleString()}`,
      `Browser:        ${browserInfo}`,
      `Language Pair:  ${sourceName} → ${targetName} (${source} → ${target})`,
      `Test Mode:      ${mode === 'reference' ? 'Reference (BLEU)' : 'Round-Trip Fidelity'}`,
      '',
      'Results',
      '─'.repeat(50),
      `Overall Score:  ${avgScore}%`,
      `Tests Run:      ${this.results.length}`,
      `Avg Time:       ${avgTime} ms per sentence`,
      '',
      'By Category:',
      ...categoryLines,
      '',
      'Per-Sentence Scores:',
      ...this.results.map(r =>
        `  Q${String(r.id).padStart(2)}  [${r.category.padEnd(14)}]  ${r.score.toFixed(1).padStart(5)}%  ${Math.round(r.time).toString().padStart(4)} ms`
      ),
      '═'.repeat(50),
    ];

    // TSV
    const tsvHeader = ['Date', 'Browser', 'Language Pair', 'Mode', 'Overall Score (%)',
      'Tests', 'Avg Time (ms)'].join('\t');
    const tsvRow = [
      new Date().toLocaleDateString(), browserInfo,
      `${sourceName} → ${targetName}`, mode, avgScore,
      this.results.length, avgTime
    ].join('\t');

    const clipboardData = lines.join('\n') + '\n\n' + tsvHeader + '\n' + tsvRow;

    navigator.clipboard.writeText(clipboardData).then(() => {
      const btn = document.getElementById('copyResults');
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

  // ── Defect tests ─────────────────────────────────────────────────

  defectLog(message, type = 'info') {
    const logEl = document.getElementById('defectLog');
    if (!logEl) return;
    const entry = document.createElement('div');
    entry.className = `log-entry log-${type}`;
    const timestamp = new Date().toLocaleTimeString();
    entry.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
  }

  async runDefectTests() {
    if (this.defectTesting) return;
    const target = document.getElementById('targetLanguage').value;
    const cases = DEFECT_TEST_DATA.filter(c => c.lang === target);
    if (cases.length === 0) {
      this.defectLog(`No defect cases defined for ${LANGUAGE_NAMES[target] || target}. Try es, ja, or zh-hans.`, 'warning');
      return;
    }

    this.defectTesting = true;
    this.defectResults = [];

    document.getElementById('runDefectTests').disabled = true;
    document.getElementById('stopDefectTests').disabled = false;
    document.getElementById('copyDefectResults').disabled = true;
    document.getElementById('saveSnapshot').disabled = true;
    document.getElementById('defectLog').innerHTML = '';
    document.getElementById('defectResults').innerHTML = '';

    if (!(await this.ensureTranslators())) {
      this.defectTesting = false;
      document.getElementById('runDefectTests').disabled = false;
      document.getElementById('stopDefectTests').disabled = true;
      return;
    }

    this.defectLog(
      `Running ${cases.length} defect cases against ${LANGUAGE_NAMES[target] || target}\u2026`,
      'info'
    );

    const progressFill = document.getElementById('defectProgressFill');
    const progressText = document.getElementById('defectProgressText');

    for (let i = 0; i < cases.length; i++) {
      if (!this.defectTesting) {
        this.defectLog('Defect tests paused by user.', 'warning');
        break;
      }
      const testCase = cases[i];
      const startTime = performance.now();
      try {
        const output = await this.translator.translate(testCase.source);
        const evalResult = evaluateDefectCase(testCase, output);
        const elapsed = performance.now() - startTime;
        this.defectResults.push({
          id: testCase.id,
          source: testCase.source,
          output,
          lang: testCase.lang,
          time: elapsed,
          ...evalResult,
        });
        const status = evalResult.pass ? 'success' : 'error';
        const reasons = [];
        if (evalResult.missing.length > 0) {
          reasons.push(`missing: ${evalResult.missing.map(s => `<code>${this.escapeHtml(s)}</code>`).join(', ')}`);
        }
        if (evalResult.forbidden.length > 0) {
          reasons.push(`found forbidden: ${evalResult.forbidden.map(s => `<code>${this.escapeHtml(s)}</code>`).join(', ')}`);
        }
        if (evalResult.sentenceShortfall > 0) {
          reasons.push(`missing ${evalResult.sentenceShortfall} sentence-final punctuation mark(s)`);
        }
        const reasonHtml = reasons.length > 0
          ? `<br><span class="log-out">Why fail:</span> ${reasons.join('; ')}` : '';
        this.defectLog(
          `<span class="log-q">[${testCase.id}]</span> ${this.escapeHtml(testCase.source)}`
          + `<br><span class="log-out">Output:</span> ${this.escapeHtml(output)}`
          + `<br><span class="log-score ${evalResult.pass ? 'good' : 'poor'}">${evalResult.pass ? 'PASS' : 'FAIL'}</span>`
          + reasonHtml,
          status
        );
      } catch (error) {
        this.defectResults.push({
          id: testCase.id,
          source: testCase.source,
          lang: testCase.lang,
          time: 0,
          pass: false,
          missing: [],
          forbidden: [],
          sentenceShortfall: 0,
          error: error.message,
        });
        this.defectLog(`[${testCase.id}] Error \u2014 ${this.escapeHtml(error.message)}`, 'error');
      }

      const completed = this.defectResults.length;
      progressFill.style.width = ((completed / cases.length) * 100) + '%';
      progressText.textContent = `${completed} / ${cases.length}`;
      this.renderDefectResults();
    }

    if (this.defectResults.length > 0) {
      const passed = this.defectResults.filter(r => r.pass).length;
      const total = this.defectResults.length;
      this.defectLog(
        `Defect tests complete: ${passed}/${total} passed (${(100 * passed / total).toFixed(1)}%).`,
        'info'
      );
      document.getElementById('copyDefectResults').disabled = false;
      document.getElementById('saveSnapshot').disabled = false;
    }
    this.defectTesting = false;
    document.getElementById('runDefectTests').disabled = false;
    document.getElementById('stopDefectTests').disabled = true;
  }

  stopDefectTests() {
    this.defectTesting = false;
    document.getElementById('stopDefectTests').disabled = true;
  }

  // Renders per-category pass-rate table. `compareTo` (optional) is a
  // saved snapshot's defect-results array; when supplied, a delta column
  // is shown.
  renderDefectResults(compareTo = null) {
    const container = document.getElementById('defectResults');
    if (!container) return;
    if (this.defectResults.length === 0) {
      container.innerHTML = '';
      return;
    }

    const byCat = {};
    this.defectResults.forEach(r => {
      if (!byCat[r.id]) byCat[r.id] = { pass: 0, total: 0 };
      byCat[r.id].total++;
      if (r.pass) byCat[r.id].pass++;
    });

    let priorByCat = null;
    if (compareTo) {
      priorByCat = {};
      compareTo.forEach(r => {
        if (!priorByCat[r.id]) priorByCat[r.id] = { pass: 0, total: 0 };
        priorByCat[r.id].total++;
        if (r.pass) priorByCat[r.id].pass++;
      });
    }

    const totalPass = this.defectResults.filter(r => r.pass).length;
    const totalAll = this.defectResults.length;
    const overall = ((totalPass / totalAll) * 100).toFixed(1);

    const rows = Object.entries(byCat).map(([id, c]) => {
      const rate = ((c.pass / c.total) * 100).toFixed(1);
      const cellClass = c.pass === c.total ? 'good' : c.pass === 0 ? 'poor' : 'ok';
      let deltaCell = '';
      if (priorByCat) {
        const prior = priorByCat[id];
        if (prior) {
          const priorRate = (prior.pass / prior.total) * 100;
          const currRate = (c.pass / c.total) * 100;
          const delta = currRate - priorRate;
          const sign = delta > 0 ? '+' : '';
          const deltaClass = delta > 0 ? 'good' : delta < 0 ? 'poor' : '';
          deltaCell = `<td class="${deltaClass}">${sign}${delta.toFixed(1)} pp</td>`;
        } else {
          deltaCell = '<td>—</td>';
        }
      }
      return `<tr>
        <td><code>${id}</code></td>
        <td class="${cellClass}">${c.pass} / ${c.total}</td>
        <td class="${cellClass}">${rate}%</td>
        ${deltaCell}
      </tr>`;
    }).join('');

    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;
    const compareHeader = priorByCat ? '<th>Δ vs snapshot</th>' : '';

    container.innerHTML = `
      <div class="defect-summary">
        <strong>Overall:</strong> ${totalPass} / ${totalAll} cases passed
        (<span class="${overall >= 80 ? 'good' : overall >= 50 ? 'ok' : 'poor'}">${overall}%</span>)
        for ${targetName}.
      </div>
      <table class="inner-table defect-table">
        <thead>
          <tr><th>Category</th><th>Passed</th><th>Pass rate</th>${compareHeader}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  // ── Snapshots (localStorage, scoped by target language) ──────────

  snapshotKey() {
    const target = document.getElementById('targetLanguage').value;
    return `quality-defect-snapshot-${target}`;
  }

  saveSnapshot() {
    if (this.defectResults.length === 0) return;
    const target = document.getElementById('targetLanguage').value;
    const snapshot = {
      target,
      browser: this.getBrowserInfo(),
      timestamp: new Date().toISOString(),
      results: this.defectResults.map(r => ({
        id: r.id, pass: r.pass, source: r.source, output: r.output,
        missing: r.missing, forbidden: r.forbidden,
        sentenceShortfall: r.sentenceShortfall,
      })),
    };
    try {
      localStorage.setItem(this.snapshotKey(), JSON.stringify(snapshot));
      this.defectLog(
        `Snapshot saved for ${LANGUAGE_NAMES[target] || target} (${snapshot.browser}, ${this.defectResults.length} cases).`,
        'success'
      );
    } catch (e) {
      this.defectLog(`Failed to save snapshot: ${e.message}`, 'error');
    }
  }

  compareSnapshot() {
    const target = document.getElementById('targetLanguage').value;
    const raw = localStorage.getItem(this.snapshotKey());
    if (!raw) {
      this.defectLog(
        `No saved snapshot for ${LANGUAGE_NAMES[target] || target}. Run defect tests, then click \u201cSave Snapshot\u201d to create one.`,
        'warning'
      );
      return;
    }
    if (this.defectResults.length === 0) {
      this.defectLog('Run defect tests first \u2014 nothing to compare against.', 'warning');
      return;
    }
    try {
      const snap = JSON.parse(raw);
      this.defectLog(
        `Comparing current run against snapshot from ${snap.timestamp} (${snap.browser}, ${snap.results.length} cases).`,
        'info'
      );
      this.renderDefectResults(snap.results);
    } catch (e) {
      this.defectLog(`Failed to read snapshot: ${e.message}`, 'error');
    }
  }

  clearSnapshot() {
    const target = document.getElementById('targetLanguage').value;
    localStorage.removeItem(this.snapshotKey());
    this.defectLog(`Snapshot cleared for ${LANGUAGE_NAMES[target] || target}.`, 'info');
    this.renderDefectResults();
  }

  copyDefectResults() {
    if (this.defectResults.length === 0) return;
    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;
    const browserInfo = this.getBrowserInfo();

    const byCat = {};
    this.defectResults.forEach(r => {
      if (!byCat[r.id]) byCat[r.id] = { pass: 0, total: 0 };
      byCat[r.id].total++;
      if (r.pass) byCat[r.id].pass++;
    });
    const passed = this.defectResults.filter(r => r.pass).length;
    const total = this.defectResults.length;
    const overall = ((passed / total) * 100).toFixed(1);

    const catLines = Object.entries(byCat).map(([id, c]) => {
      const rate = ((c.pass / c.total) * 100).toFixed(1);
      return `  ${id.padEnd(20)} ${String(c.pass).padStart(2)} / ${String(c.total).padEnd(2)}  (${rate}%)`;
    });

    const failures = this.defectResults.filter(r => !r.pass).map(r => {
      const reasons = [];
      if (r.missing && r.missing.length > 0) reasons.push(`missing: ${r.missing.join(', ')}`);
      if (r.forbidden && r.forbidden.length > 0) reasons.push(`forbidden: ${r.forbidden.join(', ')}`);
      if (r.sentenceShortfall) reasons.push(`-${r.sentenceShortfall} sentence(s)`);
      if (r.error) reasons.push(`error: ${r.error}`);
      return `  [${r.id}] ${r.source}\n    -> ${r.output || '(error)'}\n    ${reasons.join('; ')}`;
    });

    const lines = [
      'Translation Defect Tests',
      '='.repeat(50),
      `Date:           ${new Date().toLocaleString()}`,
      `Browser:        ${browserInfo}`,
      `Target:         ${targetName} (${target})`,
      '',
      `Overall:        ${passed} / ${total} passed (${overall}%)`,
      '',
      'By Category:',
      ...catLines,
      '',
      'Failures:',
      ...(failures.length > 0 ? failures : ['  (none)']),
      '='.repeat(50),
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      const btn = document.getElementById('copyDefectResults');
      btn.textContent = '\u2713 Copied!';
      setTimeout(() => { btn.textContent = '\ud83d\udccb Copy Results'; }, 2000);
    }).catch(() => {
      alert('Failed to copy defect results to clipboard');
    });
  }
}

// ─── Known Issues Data ─────────────────────────────────────────────

const KNOWN_ISSUES = [
  {
    id: 'case_change',
    title: 'Capitalization Corrupted',
    severity: 'medium',
    pattern: 'The model systematically lowercases the last letter of uppercase tokens (GPU→GPu, MCP→MCp, API→APi) and sometimes lowercases entire full-width sequences in Japanese.',
    examples: [
      { lang: 'zh-CN', source: '(ZSPD)', output: '(Zspd)', explanation: 'Airport code fully lowercased from all-caps' },
      { lang: 'zh-CN', source: '(alternative MSI installer)', output: '(替代 MSi 安装程序)', explanation: 'Acronym MSI → MSi, last letter lowered' },
      { lang: 'zh-CN', source: 'RSS', output: 'RSs', explanation: 'Acronym RSS → RSs, last letter lowered' },
      { lang: 'ja', source: 'ＢＭＷ', output: 'ｂｍｗ', explanation: 'Full-width brand name fully lowercased' },
      { lang: 'ja', source: 'ＭＩＮＩ', output: 'ｍｉｎｉ', explanation: 'Full-width brand name fully lowercased' },
      { lang: 'es', source: '[#GPC_BANNER_ICON#]', output: '[#Gpc_banner_icon#]', explanation: 'Placeholder token case destroyed' },
    ]
  },
  {
    id: 'char_insertion',
    title: 'Spurious L/T/U Characters Injected',
    severity: 'high',
    pattern: 'Spurious L insertion is most common (API→APIL, PC→PCL), followed by T (WhatsApp→WhatsTapp, PowerPoint→PowerTpoint) and U (MySQL→MyUsql, ChatGPT→ChatUgpt). en→es has the highest rate (36.3% of errors).',
    examples: [
      { lang: 'ja', source: 'HTML5ゲームポータルサイト', output: 'HTMLL5ゲームポータルサイト', explanation: 'Spurious L inserted: HTML5 → HTMLL5' },
      { lang: 'ja', source: 'nginx', output: 'NGinxLの', explanation: 'Case changed, spurious L and の appended' },
      { lang: 'es', source: 'FAVORITE - Holy Quran', output: 'FAVORITo - Sagrado Corán', explanation: 'Last letter of FAVORITE lowered' },
      { lang: 'es', source: 'API documentation', output: 'APIL documentación', explanation: 'Spurious L appended to all-caps token' },
    ]
  },
  {
    id: 'char_corruption',
    title: 'Characters Garbled/Doubled',
    severity: 'high',
    pattern: 'YouTube → YouTtube is universal across all three languages. Apple product names are consistently corrupted: iOS→iUos, iPhone→iTphone, macOS→macUos, iPad→iTpad.',
    examples: [
      { lang: 'ja', source: 'YouTube Video Player', output: 'YouTtube動画プレーヤー', explanation: 't doubled: YouTube → YouTtube' },
      { lang: 'es', source: 'YouTube Video Player', output: 'Reproductor de video de YouTtube', explanation: 'Same YouTtube bug across languages' },
      { lang: 'zh-CN', source: 'USBKey', output: 'USBkLey', explanation: 'Key garbled to kLey' },
      { lang: 'zh-CN', source: 'BIP系统', output: 'BIpL系统', explanation: 'P → pL corruption' },
    ]
  },
  {
    id: 'brand_translated',
    title: 'Brand/Product Names Literally Translated',
    severity: 'high',
    pattern: 'The model cannot distinguish brand names from common words. Worst in en→es where even well-known brands like Discord, Steam, and Blender are translated to their Spanish dictionary meanings.',
    examples: [
      { lang: 'es', source: 'Discord', output: 'Discordia', explanation: 'Chat platform → "discord/strife"' },
      { lang: 'es', source: 'Steam Deck', output: 'plataforma de vapor', explanation: 'Gaming device → "steam platform"' },
      { lang: 'es', source: 'Blender', output: 'Licuadora', explanation: '3D software name → kitchen blender' },
      { lang: 'es', source: 'Copilot', output: 'Copiloto', explanation: 'Microsoft product name translated' },
      { lang: 'zh-CN', source: '#clawhub', output: '#爪轴', explanation: 'Platform name → "claw shaft"' },
      { lang: 'ja', source: 'Shopee', output: 'ショピー', explanation: 'E-commerce brand transliterated to katakana' },
    ]
  },
  {
    id: 'semantic_error',
    title: 'Wrong Meaning/Sense Chosen',
    severity: 'high',
    pattern: 'Technical/domain-specific terms are translated using their most common dictionary meaning. Worst for tech jargon (agents, forks, LLM) and context-dependent UI terms (Play, Dislike).',
    examples: [
      { lang: 'zh-CN', source: '"2026 is already the year of personal agents."', output: '"2026年已经是个人经纪人年了。"', explanation: 'AI agents → 个人经纪人 (real estate brokers)' },
      { lang: 'zh-CN', source: 'LLM', output: '法学硕士', explanation: 'Large Language Model → Master of Laws' },
      { lang: 'zh-CN', source: 'forks', output: '叉子', explanation: 'Code forks → eating forks' },
      { lang: 'zh-CN', source: 'game jams', output: '游戏果酱', explanation: 'Game jams (hackathons) → game jam/jelly' },
      { lang: 'ja', source: 'Play', output: '遊ぶ', explanation: 'Video player "Play" → 遊ぶ (have fun) instead of 再生 (playback)' },
      { lang: 'es', source: 'Future', output: 'futuro', explanation: 'Artist/brand name treated as common noun → Spanish word for "future"' },
    ]
  },
  {
    id: 'code_translated',
    title: 'Code/Technical Identifiers Translated',
    severity: 'medium',
    pattern: 'The model does not recognize code-like tokens (hashtags, search operators, cookie names, variable names) and translates them as natural language.',
    examples: [
      { lang: 'zh-CN', source: '(II[chr] OR 2[chr]) AND adh*[sym]', output: '(II[chr] 或 2[chr]) 和 adh*[sym]', explanation: 'PubMed boolean operators OR/AND translated' },
      { lang: 'ja', source: '#jazeektypebeat', output: '#ジャジークタイプビート', explanation: 'Hashtag transliterated — would break search' },
      { lang: 'es', source: 'test_cookie', output: 'cookie_prueba', explanation: 'Technical cookie name translated' },
      { lang: 'es', source: 'CookieConsent', output: 'Consentimiento de cookies', explanation: 'Technical identifier translated' },
    ]
  },
  {
    id: 'acronym_error',
    title: 'Acronyms Expanded, Corrupted, or Mistranslated',
    severity: 'medium',
    pattern: 'Two sub-patterns: (1) last-letter lowering (MCP→MCp, OCR→OCr) — mechanical, and (2) full expansion/translation (API→エディファイ, EC→欧洲, MB→メガバイト) — semantic.',
    examples: [
      { lang: 'ja', source: 'API', output: 'エディファイ', explanation: 'API → "edify" — completely wrong translation' },
      { lang: 'ja', source: '179.5 MB', output: '179.5メガバイト', explanation: 'MB expanded to full word メガバイト' },
      { lang: 'zh-CN', source: '1.9.3.1[EC]', output: '1.9.3.1[欧洲]', explanation: 'EC (enzyme classification) → 欧洲 (Europe)' },
      { lang: 'es', source: 'OCR World Champs', output: 'Campeonatos del Mundo OCr', explanation: 'OCR → OCr, last letter lowered' },
    ]
  },
  {
    id: 'proper_noun_error',
    title: 'Names Mistranslated or Transliterated',
    severity: 'high',
    pattern: 'The model cannot reliably distinguish proper nouns from translatable content. GitHub usernames, YouTube channel names, rapper names, and product names are all at risk.',
    examples: [
      { lang: 'zh-CN', source: 'HKUDS', output: '香港统计学硕士', explanation: 'All-caps identifier wrongly expanded → "HK statistics master"' },
      { lang: 'zh-CN', source: 'DeepTutor', output: '深度导师', explanation: 'Product name → "deep tutor" literally' },
      { lang: 'ja', source: 'noizy', output: '騒々しい', explanation: 'Channel/handle treated as common word → "noisy" (dictionary meaning)' },
      { lang: 'es', source: 'Moon Knight', output: 'Caballero de la Luna', explanation: 'Multi-word proper noun literally translated → "Knight of the Moon"' },
    ]
  },
  {
    id: 'number_changed',
    title: 'Numbers Altered, Swapped, or Misinterpreted',
    severity: 'high',
    pattern: 'The model actively reinterprets numbers: swapping version numbers, misinterpreting magnitude suffixes (M ≠ 万), misreading ratings as dates, and inserting/removing digits.',
    examples: [
      { lang: 'zh-CN', source: 'CiteSpace 7.0 Advanced for Windows 11', output: '适用于 Windows 7.0 的 CiteSpace 11 Advanced', explanation: 'Version numbers swapped: CiteSpace 7.0 ↔ Windows 11' },
      { lang: 'zh-CN', source: '$3.8M-a-year side hustle', output: '每年 3.8 万美元的副业', explanation: '$3.8M (3.8 million) → 3.8万 (38,000) — 100× error' },
      { lang: 'ja', source: '10/10', output: '10月10日', explanation: 'Rating 10/10 misread as date October 10' },
      { lang: 'es', source: '4/9/26', output: '09/04/2026', explanation: 'Date format reinterpreted (US → EU format)' },
    ]
  },
  {
    id: 'url_translated',
    title: 'URLs, Emails, and Domains Translated',
    severity: 'high',
    pattern: 'The model treats URL components as translatable text. Especially dangerous for en→es where even email addresses get translated. URL parameters and anchors are also at risk.',
    examples: [
      { lang: 'es', source: 'someone@example.com', output: 'alguien@ejemplo.com', explanation: 'Email address translated' },
      { lang: 'es', source: 'academic.oup.com', output: 'académico.oup.com', explanation: 'URL subdomain translated' },
      { lang: 'zh-CN', source: '/automation/cron-jobs#troubleshooting', output: '/automation/cron-jobs#故障排除', explanation: 'URL anchor #troubleshooting translated' },
      { lang: 'ja', source: 'aha-music.com', output: 'アハミュージック.com', explanation: 'Domain name partially transliterated' },
    ]
  },
  {
    id: 'spurious_content',
    title: 'Extra Words/Content Added',
    severity: 'medium',
    pattern: 'The model hallucinates additional content, especially for short inputs. Domain extensions get 域名 appended in Chinese, bare numbers get contextual words in Spanish.',
    examples: [
      { lang: 'zh-CN', source: '.co.uk', output: '.co.uk 域名', explanation: 'Spurious 域名 (domain name) appended' },
      { lang: 'ja', source: 'New', output: '新機能', explanation: '"New" → 新機能 (new feature) — extra concept added' },
      { lang: 'es', source: '676', output: 'Artículo 676', explanation: 'Number → "Article 676" — spurious word added' },
      { lang: 'zh-CN', source: '.ani', output: '.ani 域名', explanation: '域名 (domain name) added from nowhere' },
    ]
  },
  {
    id: 'tag_corruption',
    title: 'HTML/XML Tags Broken',
    severity: 'medium',
    pattern: 'The model does not treat HTML tags as opaque tokens. It reorders content across tag boundaries, duplicates closing tags, and converts HTML entities to their rendered form.',
    examples: [
      { lang: 'zh-CN', source: '<b10></b10> made their first contribution in <b11>#176</b11>', output: '<b10></b10>在<b11>#176</b11中做出了...贡献</b11>', explanation: 'Extra </b11> appended, breaking tag structure' },
      { lang: 'es', source: 'Rules &amp; Policies', output: 'Reglas y políticas', explanation: 'HTML entity &amp; not preserved' },
      { lang: 'ja', source: '<b10>"Fever Dream"</b10> on <b11>YouTube</b11>', output: 'Tag corrupted + YouTtube', explanation: 'Closing tag corrupted + char corruption' },
    ]
  },
  {
    id: 'missing_content',
    title: 'Content Dropped from Translation',
    severity: 'medium',
    pattern: 'Short words, emojis, and trailing content are most at risk. Non-Latin script content (Russian months, Vietnamese text) is especially prone to being dropped.',
    examples: [
      { lang: 'zh-CN', source: '# Works everywhere. Installs everything. You\'re welcome. 🦞', output: '# 无处不在。安装所有内容。不客气。', explanation: 'Lobster emoji 🦞 dropped' },
      { lang: 'zh-CN', source: '20 окт. 2025', output: '20 2025 年', explanation: 'Month окт. (October) entirely dropped' },
      { lang: 'es', source: 'Condition: Great clean condition. Batteries included.', output: 'Estado: Excelente estado de limpieza.', explanation: '"Batteries included." entirely missing' },
      { lang: 'ja', source: 'Bạn mới biết đến Shopee?', output: 'Shopee は?', explanation: 'Most Vietnamese content dropped' },
    ]
  },
];

// ─── Defect-Targeted Test Data ─────────────────────────────────────
// Per-category pass/fail tests. Each case lists substrings the output
// MUST contain verbatim and substrings it MUST NOT contain. A single
// broken token causes a clean fail (no BLEU averaging).
// `minSentences`: minimum sentence-final punctuation count (any of
// . ! ? 。 ！ ？) required in the output. Used for "missing_content".

const DEFECT_TEST_DATA = [
  // case_change: model lowercases the last letter of all-caps tokens.
  { id: 'case_change', lang: 'es',      source: 'Install the MSI package to enable RSS feeds with OCR support and SDK access.',
    mustPreserve: ['MSI', 'RSS', 'OCR', 'SDK'], mustNotContain: ['MSi', 'RSs', 'OCr', 'SDk'] },
  { id: 'case_change', lang: 'ja',      source: 'Install the MSI package to enable RSS feeds with OCR support and SDK access.',
    mustPreserve: ['MSI', 'RSS', 'OCR', 'SDK'], mustNotContain: ['MSi', 'RSs', 'OCr', 'SDk'] },
  { id: 'case_change', lang: 'zh-hans', source: 'Install the MSI package to enable RSS feeds with OCR support and SDK access.',
    mustPreserve: ['MSI', 'RSS', 'OCR', 'SDK'], mustNotContain: ['MSi', 'RSs', 'OCr', 'SDk'] },
  { id: 'case_change', lang: 'ja',      source: 'The GPU and CPU together handle GPGPU workloads via CUDA.',
    mustPreserve: ['GPU', 'CPU', 'GPGPU', 'CUDA'], mustNotContain: ['GPu', 'CPu', 'GPGPu', 'CUDa'] },
  { id: 'case_change', lang: 'zh-hans', source: 'The GPU and CPU together handle GPGPU workloads via CUDA.',
    mustPreserve: ['GPU', 'CPU', 'GPGPU', 'CUDA'], mustNotContain: ['GPu', 'CPu', 'GPGPu', 'CUDa'] },

  // char_insertion: spurious L/T/U letters appear in/after mixed-case tokens.
  { id: 'char_insertion', lang: 'es',      source: 'The iPhone runs iOS, the iPad runs iPadOS, and macOS runs on Mac.',
    mustPreserve: ['iPhone', 'iOS', 'iPad', 'iPadOS', 'macOS'], mustNotContain: ['iTphone', 'iUos', 'iTpad', 'macUos'] },
  { id: 'char_insertion', lang: 'ja',      source: 'The iPhone runs iOS, the iPad runs iPadOS, and macOS runs on Mac.',
    mustPreserve: ['iPhone', 'iOS', 'iPad', 'iPadOS', 'macOS'], mustNotContain: ['iTphone', 'iUos', 'iTpad', 'macUos'] },
  { id: 'char_insertion', lang: 'zh-hans', source: 'The iPhone runs iOS, the iPad runs iPadOS, and macOS runs on Mac.',
    mustPreserve: ['iPhone', 'iOS', 'iPad', 'iPadOS', 'macOS'], mustNotContain: ['iTphone', 'iUos', 'iTpad', 'macUos'] },
  { id: 'char_insertion', lang: 'es',      source: 'Open API documentation and the HTML5 reference manual.',
    mustPreserve: ['API', 'HTML5'], mustNotContain: ['APIL', 'HTMLL5'] },
  { id: 'char_insertion', lang: 'ja',      source: 'Open API documentation and the HTML5 reference manual.',
    mustPreserve: ['API', 'HTML5'], mustNotContain: ['APIL', 'HTMLL5'] },

  // char_corruption: internal letters doubled or letters swapped.
  { id: 'char_corruption', lang: 'es',      source: 'Watch YouTube videos through PowerShell while using ChatGPT, MySQL, and WhatsApp.',
    mustPreserve: ['YouTube', 'PowerShell', 'ChatGPT', 'MySQL', 'WhatsApp'],
    mustNotContain: ['YouTtube', 'PowerTshell', 'ChatUgpt', 'MyUsql', 'WhatsTapp'] },
  { id: 'char_corruption', lang: 'ja',      source: 'Watch YouTube videos through PowerShell while using ChatGPT, MySQL, and WhatsApp.',
    mustPreserve: ['YouTube', 'PowerShell', 'ChatGPT', 'MySQL', 'WhatsApp'],
    mustNotContain: ['YouTtube', 'PowerTshell', 'ChatUgpt', 'MyUsql', 'WhatsTapp'] },
  { id: 'char_corruption', lang: 'zh-hans', source: 'Watch YouTube videos through PowerShell while using ChatGPT, MySQL, and WhatsApp.',
    mustPreserve: ['YouTube', 'PowerShell', 'ChatGPT', 'MySQL', 'WhatsApp'],
    mustNotContain: ['YouTtube', 'PowerTshell', 'ChatUgpt', 'MyUsql', 'WhatsTapp'] },

  // brand_translated: brand names rendered as dictionary translations.
  { id: 'brand_translated', lang: 'es', source: 'Open Discord and Steam, then download Blender and start Copilot.',
    mustPreserve: ['Discord', 'Steam', 'Blender', 'Copilot'],
    mustNotContain: ['Discordia', 'Vapor', 'Licuadora', 'Copiloto'] },
  { id: 'brand_translated', lang: 'es', source: 'I bought a Tesla and ordered an Amazon Kindle for the trip.',
    mustPreserve: ['Tesla', 'Amazon', 'Kindle'], mustNotContain: ['Amazonas'] },
  { id: 'brand_translated', lang: 'es', source: 'Use Apple, Twitter, Facebook, and Instagram every day.',
    mustPreserve: ['Apple', 'Twitter', 'Facebook', 'Instagram'], mustNotContain: ['Manzana', 'Pajarito'] },
  { id: 'brand_translated', lang: 'ja', source: 'Open Discord and Steam, then download Blender and start Copilot.',
    mustPreserve: ['Discord', 'Steam', 'Blender', 'Copilot'], mustNotContain: [] },

  // semantic_error: wrong sense chosen for polysemous tokens.
  { id: 'semantic_error', lang: 'zh-hans', source: 'The LLM agents collaborated on the code forks during the game jam.',
    mustPreserve: ['LLM'], mustNotContain: ['法学硕士', '游戏果酱', '叉子', '游戏堵塞'] },
  { id: 'semantic_error', lang: 'ja',      source: 'Click Play to start the video.',
    mustPreserve: [], mustNotContain: ['遊ぶ', '遊んで'] },
  { id: 'semantic_error', lang: 'zh-hans', source: 'Two thousand twenty-six is already the year of personal agents.',
    mustPreserve: [], mustNotContain: ['个人经纪人', '房产经纪'] },

  // code_translated: identifiers, hashtags, and URLs treated as text.
  { id: 'code_translated', lang: 'es',      source: 'The test_cookie and CookieConsent identifiers are documented at https://example.com/cookies.',
    mustPreserve: ['test_cookie', 'CookieConsent', 'https://example.com/cookies'],
    mustNotContain: ['cookie_prueba', 'consentimiento_de_cookies'] },
  { id: 'code_translated', lang: 'ja',      source: 'The test_cookie and CookieConsent identifiers are documented at https://example.com/cookies.',
    mustPreserve: ['test_cookie', 'CookieConsent', 'https://example.com/cookies'], mustNotContain: [] },
  { id: 'code_translated', lang: 'zh-hans', source: 'Use #example and @user when posting on social media.',
    mustPreserve: ['#example', '@user'], mustNotContain: [] },

  // acronym_error: acronyms expanded into a word, or wrongly translated.
  { id: 'acronym_error', lang: 'es',      source: 'The API returned 179.5 MB of data via HTTP in JSON format.',
    mustPreserve: ['API', 'MB', 'HTTP', 'JSON', '179.5'], mustNotContain: [] },
  { id: 'acronym_error', lang: 'ja',      source: 'The API returned 179.5 MB of data via HTTP in JSON format.',
    mustPreserve: ['API', 'MB', 'HTTP', 'JSON', '179.5'],
    mustNotContain: ['エディファイ', 'メガバイト'] },
  { id: 'acronym_error', lang: 'zh-hans', source: 'The API returned 179.5 MB of data via HTTP in JSON format.',
    mustPreserve: ['API', 'MB', 'HTTP', 'JSON', '179.5'], mustNotContain: ['欧洲'] },

  // proper_noun_error: people, places, products mistranslated.
  { id: 'proper_noun_error', lang: 'es',      source: 'Albert Einstein worked at MIT before joining DeepMind in London.',
    mustPreserve: ['Albert Einstein', 'MIT', 'DeepMind'], mustNotContain: [] },
  { id: 'proper_noun_error', lang: 'zh-hans', source: 'Albert Einstein worked at MIT before joining DeepMind in London.',
    mustPreserve: ['Albert Einstein', 'MIT', 'DeepMind'], mustNotContain: ['深度导师', '深度教师', '麻省理工学院'] },
  { id: 'proper_noun_error', lang: 'zh-hans', source: 'The HKUST and HKUDS research teams collaborate on AI projects.',
    mustPreserve: ['HKUST', 'HKUDS'], mustNotContain: ['香港统计学硕士'] },

  // number_changed: digits / versions swapped, magnitude misread.
  { id: 'number_changed', lang: 'es',      source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11', '$3.8M'], mustNotContain: ['Windows 7.0'] },
  { id: 'number_changed', lang: 'ja',      source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11'], mustNotContain: ['Windows 7.0'] },
  { id: 'number_changed', lang: 'zh-hans', source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11'], mustNotContain: ['Windows 7.0', '3.8万'] },

  // url_translated: URL parts / email addresses translated.
  { id: 'url_translated', lang: 'es',      source: 'Visit https://academic.oup.com or email someone@example.com to learn more.',
    mustPreserve: ['https://academic.oup.com', 'someone@example.com'],
    mustNotContain: ['académico.oup.com', 'alguien@ejemplo.com'] },
  { id: 'url_translated', lang: 'ja',      source: 'Visit https://academic.oup.com or email someone@example.com to learn more.',
    mustPreserve: ['https://academic.oup.com', 'someone@example.com'], mustNotContain: [] },
  { id: 'url_translated', lang: 'zh-hans', source: 'Browse /automation/cron-jobs#troubleshooting in the docs.',
    mustPreserve: ['/automation/cron-jobs#troubleshooting'], mustNotContain: ['#故障排除', '#疑难解答'] },

  // spurious_content: model adds extra words to short inputs.
  { id: 'spurious_content', lang: 'zh-hans', source: 'The .com and .co.uk extensions are popular.',
    mustPreserve: ['.com', '.co.uk'], mustNotContain: ['.com 域名', '.co.uk 域名'] },
  { id: 'spurious_content', lang: 'ja',      source: 'New',
    mustPreserve: [], mustNotContain: ['新機能', '新しい機能'] },
  { id: 'spurious_content', lang: 'es',      source: 'See item 676 below.',
    mustPreserve: ['676'], mustNotContain: ['Artículo 676'] },

  // tag_corruption: HTML tags reordered or duplicated.
  { id: 'tag_corruption', lang: 'es',      source: 'Read <b>the rules</b> and <i>the policies</i> before continuing.',
    mustPreserve: ['<b>', '</b>', '<i>', '</i>'], mustNotContain: [] },
  { id: 'tag_corruption', lang: 'ja',      source: 'Read <b>the rules</b> and <i>the policies</i> before continuing.',
    mustPreserve: ['<b>', '</b>', '<i>', '</i>'], mustNotContain: [] },
  { id: 'tag_corruption', lang: 'zh-hans', source: 'Read <b>the rules</b> and <i>the policies</i> before continuing.',
    mustPreserve: ['<b>', '</b>', '<i>', '</i>'], mustNotContain: [] },

  // missing_content: short trailing content dropped.
  { id: 'missing_content', lang: 'es',      source: 'Works everywhere. Installs everything. You are welcome.',
    mustPreserve: [], mustNotContain: [], minSentences: 3 },
  { id: 'missing_content', lang: 'ja',      source: 'Works everywhere. Installs everything. You are welcome.',
    mustPreserve: [], mustNotContain: [], minSentences: 3 },
  { id: 'missing_content', lang: 'zh-hans', source: 'Works everywhere. Installs everything. You are welcome.',
    mustPreserve: [], mustNotContain: [], minSentences: 3 },
];

// Counts sentence-final punctuation across scripts. Used by
// "missing_content" tests to detect dropped trailing sentences.
function countSentences(text) {
  const m = text.match(/[.!?。！？]/g);
  return m ? m.length : 0;
}

// Evaluates one defect case against the on-device translation output.
function evaluateDefectCase(testCase, output) {
  const missing = (testCase.mustPreserve || []).filter(s => !output.includes(s));
  const forbidden = (testCase.mustNotContain || []).filter(s => output.includes(s));
  let sentenceShortfall = 0;
  if (typeof testCase.minSentences === 'number') {
    const actual = countSentences(output);
    if (actual < testCase.minSentences) {
      sentenceShortfall = testCase.minSentences - actual;
    }
  }
  return {
    pass: missing.length === 0 && forbidden.length === 0 && sentenceShortfall === 0,
    missing,
    forbidden,
    sentenceShortfall,
  };
}

// ─── Render Known Issues ─────────────────────────────────────

function renderKnownIssues() {
  const container = document.getElementById('issuesList');
  const summary = document.getElementById('issuesSummary');

  // Summary counts
  const high = KNOWN_ISSUES.filter(i => i.severity === 'high').length;
  const medium = KNOWN_ISSUES.filter(i => i.severity === 'medium').length;
  summary.innerHTML = `
    <div class="issues-stats">
      <span class="issue-stat"><span class="severity-dot high"></span> ${high} High Severity</span>
      <span class="issue-stat"><span class="severity-dot medium"></span> ${medium} Medium Severity</span>
      <span class="issue-stat">${KNOWN_ISSUES.length} Total Categories</span>
    </div>
  `;

  // Render each issue as a collapsible section
  container.innerHTML = KNOWN_ISSUES.map(issue => `
    <details class="issue-category">
      <summary class="issue-header">
        <span class="severity-badge severity-${issue.severity}">${issue.severity}</span>
        <span class="issue-title">${issue.id}: ${issue.title}</span>
      </summary>
      <div class="issue-body">
        <p class="issue-pattern"><strong>Pattern:</strong> ${escapeHtmlStatic(issue.pattern)}</p>
        <table class="issue-examples">
          <thead>
            <tr><th>Language</th><th>Source</th><th>On-Device Output</th><th>Explanation</th></tr>
          </thead>
          <tbody>
            ${issue.examples.map(ex => `
              <tr>
                <td><span class="lang-badge">${escapeHtmlStatic(ex.lang)}</span></td>
                <td class="text-cell">${escapeHtmlStatic(ex.source)}</td>
                <td class="text-cell issue-output">${escapeHtmlStatic(ex.output)}</td>
                <td>${escapeHtmlStatic(ex.explanation)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </details>
  `).join('');
}

function escapeHtmlStatic(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const benchmark = new TranslationQualityBenchmark();
  renderKnownIssues();
  // Defect tests UI is wired up in the constructor.
  window.__qualityBenchmark = benchmark;
});
