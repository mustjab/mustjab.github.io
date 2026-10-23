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

function createOperationAbort(parentSignal, timeoutMs) {
  if (parentSignal.aborted) return { signal: parentSignal, dispose() {} };
  const controller = new AbortController();
  const onParentAbort = () => controller.abort(parentSignal.reason);
  parentSignal.addEventListener('abort', onParentAbort, { once: true });
  const timer = setTimeout(() => {
    controller.abort(new DOMException('Operation timed out', 'TimeoutError'));
  }, timeoutMs);
  return {
    signal: controller.signal,
    dispose() {
      clearTimeout(timer);
      parentSignal.removeEventListener('abort', onParentAbort);
    },
  };
}

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
    this.runningAll = false;
    this.importedCases = [];
    this.importWarnings = [];
    this.run = null;
    this.runController = null;
    this.importing = false;
    this.baseline = null;
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
      'sourceLanguageSearch', 'sourceLanguageDropdown', 'sourceLanguage', [{ code: 'en', name: 'English' }], 'en'
    );
    document.getElementById('sourceLanguageSearch').disabled = true;
    this.targetSelect = new SearchableLanguageSelect(
      'targetLanguageSearch', 'targetLanguageDropdown', 'targetLanguage', languages, 'es'
    );
  }

  setupEventListeners() {
    document.getElementById('swapLanguages').addEventListener('click', () => this.swapLanguages());
    document.getElementById('sourceLanguage').addEventListener('change', () => this.onLanguageChange());
    document.getElementById('targetLanguage').addEventListener('change', () => this.onLanguageChange());
    document.getElementById('saveSnapshot').addEventListener('click', () => this.saveSnapshot());
    document.getElementById('compareSnapshot').addEventListener('click', () => this.compareSnapshot());
    document.getElementById('clearSnapshot').addEventListener('click', () => this.clearSnapshot());
    document.getElementById('runAllTests').addEventListener('click', () => this.runAllTests());
    document.getElementById('stopAllTests').addEventListener('click', () => this.stopAllTests());
    document.getElementById('clearAllResults').addEventListener('click', () => this.clearAllResults());
    document.getElementById('copyAllResults').addEventListener('click', () => this.copyAllResults());
    document.getElementById('regressionCsv').addEventListener('change', event => this.importCsv(event.target.files[0]));
    document.getElementById('corpusSelection').addEventListener('change', () => this.onLanguageChange());
    document.getElementById('exportRun').addEventListener('click', () => this.exportRun());
    document.getElementById('snapshotFile').addEventListener('change', event => this.importSnapshot(event.target.files[0]));
    document.getElementById('testLog').addEventListener('change', event => {
      if (event.target.dataset.verdict === undefined) return;
      const result = this.defectResults[Number(event.target.dataset.verdict)];
      const api = event.target.dataset.api;
      const selected = api === 'streaming' ? result?.streaming :
        api === 'concurrent' ? result?.concurrent : result;
      if (selected) selected.humanVerdict = event.target.value;
      this.renderDefectResults();
    });
  }

  async checkAPI() {
    const indicator = document.getElementById('statusIndicator');
    const text = document.getElementById('statusText');
    indicator.className = 'status-indicator checking';

    if ('Translator' in self) {
      indicator.className = 'status-indicator available';
      text.textContent = 'Translation API is available';
      document.getElementById('runAllTests').disabled = false;
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

  getDefectCases() {
    const target = document.getElementById('targetLanguage').value;
    const selection = document.getElementById('corpusSelection').value;
    if (selection === 'focused') {
      return target && target !== 'en' ? QualityRegressions.getCases(target) : [];
    }
    const isPrimaryDefectTarget = ['es', 'ja', 'zh-hans'].includes(target);
    let builtin;
    if (isPrimaryDefectTarget) {
      builtin = [
        ...DEFECT_TEST_DATA.map((test, index) => ({ ...test, caseId: `builtin:${index}`, sourceLanguage: 'en' })),
        ...QualityChecks.cases,
      ].filter(test => test.lang === target);
    } else if (target && target !== 'en') {
      const seenSources = new Set();
      const universalDefects = [];
      for (const test of DEFECT_TEST_DATA) {
        if ((!test.mustPreserve || test.mustPreserve.length === 0) && !test.minSentences) continue;
        const key = `${test.id}|${test.source}`;
        if (seenSources.has(key)) continue;
        seenSources.add(key);
        universalDefects.push({
          id: test.id,
          lang: target,
          sourceLanguage: 'en',
          source: test.source,
          caseId: `builtin:${target}:${universalDefects.length}`,
          mustPreserve: [...(test.mustPreserve || [])],
          mustNotContain: test.lang === 'es' ? [...(test.mustNotContain || [])] : [],
          ...(test.minSentences ? { minSentences: test.minSentences } : {}),
        });
      }
      const checkCases = typeof QualityChecks.getCases === 'function'
        ? QualityChecks.getCases(target)
        : QualityChecks.cases.filter(test => test.lang === target);
      builtin = [...universalDefects, ...checkCases];
    } else {
      builtin = [];
    }
    return selection === 'imported'
      ? this.importedCases.filter(test => test.lang === target)
      : selection === 'combined'
        ? [...builtin, ...this.importedCases.filter(test => test.lang === target)]
        : builtin;
  }

  async importCsv(file) {
    if (!file || this.runningAll || this.importing) return;
    this.importing = true;
    document.getElementById('runAllTests').disabled = true;
    document.getElementById('regressionCsv').disabled = true;
    const status = document.getElementById('corpusStatus');
    try {
      if (file.size > 25 * 1024 * 1024) throw new Error('Corpus exceeds the 25 MB limit.');
      const bytes = await file.arrayBuffer();
      const isJson = file.name.toLowerCase().endsWith('.json');
      let encoding = isJson ? 'utf-8' : document.getElementById('csvEncoding').value;
      let text;
      if (encoding === 'auto') {
        try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); encoding = 'utf-8'; }
        catch { text = new TextDecoder('windows-1252').decode(bytes); encoding = 'windows-1252'; }
      } else {
        text = new TextDecoder(encoding, { fatal: true }).decode(bytes);
      }
      let imported;
      if (isJson) {
        imported = QualityChecks.importCorpus(JSON.parse(text));
        if (!LANGUAGE_NAMES[imported.target]) throw new Error('Unsupported corpus target language.');
      } else {
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
        if (parsed.errors.length) throw new Error(`CSV parse error: ${parsed.errors[0].message}`);
        imported = QualityChecks.importRows(parsed.data, parsed.meta.fields || []);
      }
      this.importedCases = imported.cases;
      this.importWarnings = imported.warnings;
      this.importMetadata = { encoding, rows: imported.cases.length };
      this.targetSelect.setValue(imported.target || 'es');
      document.getElementById('corpusSelection').value = isJson ? 'imported' : 'combined';
      this.onLanguageChange();
      status.textContent = `${file.name}: ${imported.cases.length} cases; ${encoding}; ${imported.warnings.length} import warnings. Local only.`;
      for (const warning of imported.warnings) this.log(this.escapeHtml(warning), 'warning');
    } catch (error) {
      status.textContent = `Import failed: ${error.message}`;
    } finally {
      this.importing = false;
      document.getElementById('regressionCsv').disabled = false;
      document.getElementById('runAllTests').disabled = !('Translator' in self);
    }
  }

  async translateText(translator, input, api = 'standard', phase = null) {
    const operation = createOperationAbort(this.runController.signal, this.run.timeoutSeconds * 1000);
    const { signal } = operation;
    const start = performance.now();
    const chunks = [];
    let firstChunkMs = null;
    let onAbort;
    try {
      signal.throwIfAborted();
      const aborted = new Promise((resolve, reject) => {
        onAbort = () => reject(signal.reason);
        signal.addEventListener('abort', onAbort, { once: true });
      });
      const translate = async () => {
        if (api === 'standard') return translator.translate(input, { signal });
        if (api !== 'streaming' || typeof translator.translateStreaming !== 'function') {
          throw new Error('Streaming translation is unavailable.');
        }
        for await (const chunk of translator.translateStreaming(input, { signal })) {
          signal.throwIfAborted();
          if (typeof chunk !== 'string') throw new Error('Unexpected streaming chunk type.');
          if (firstChunkMs === null) firstChunkMs = performance.now() - start;
          chunks.push(chunk);
        }
        return chunks.join('');
      };
      const output = await Promise.race([translate(), aborted]);
      signal.throwIfAborted();
      this.run.requests.push({ input, api, output, time: performance.now() - start,
        ...(phase ? { phase } : {}),
        ...(api === 'streaming' ? { chunks, firstChunkMs } : {}) });
      return output;
    } catch (error) {
      this.run.requests.push({ input, api, error: error.message, time: performance.now() - start,
        ...(phase ? { phase } : {}),
        ...(api === 'streaming' ? { partialOutput: chunks.join(''), chunks, firstChunkMs } : {}) });
      if (signal.aborted || error.name === 'InvalidStateError') {
        translator.destroy();
        if (this.translator === translator) this.translator = null;
        if (this.reverseTranslator === translator) this.reverseTranslator = null;
        this.runController.abort(error);
      }
      throw error;
    } finally {
      if (onAbort) signal.removeEventListener('abort', onAbort);
      operation.dispose();
    }
  }

  updateTestMode() {
    const mode = this.getTestMode();
    const badge = document.getElementById('modeBadge');
    const desc = document.getElementById('modeDescription');
    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;

    const focused = document.getElementById('corpusSelection').value === 'focused';
    if (focused) {
      badge.textContent = 'Focused';
      badge.className = 'mode-badge mode-reference';
      desc.textContent = `${this.getDefectCases().length} development cases: objective checks and semantic review are separate. No similarity score.`;
    } else if (mode === 'reference') {
      const count = QUALITY_TEST_DATA.filter(d => d.refs[target]).length;
      badge.textContent = 'Reference';
      badge.className = 'mode-badge mode-reference';
      desc.textContent = `${count} references for ${targetName}. BLEU-like similarity, not accuracy.`;
    } else {
      badge.textContent = 'Round-Trip';
      badge.className = 'mode-badge mode-roundtrip';
      desc.textContent = `Round-trip similarity for ${targetName}; semantic quality is unverified.`;
    }

    document.getElementById('totalCount').textContent = focused ? 0 : QUALITY_TEST_DATA.length;
    if (focused) document.getElementById('overallScore').textContent = 'N/A';

    // Defect-test panel: count cases that match current target.
    const defectInfo = document.getElementById('defectInfoText');
    if (defectInfo) {
      const target = document.getElementById('targetLanguage').value;
      const cases = this.getDefectCases();
      if (cases.length > 0) {
        const byId = {};
        cases.forEach(c => { byId[c.id] = (byId[c.id] || 0) + 1; });
        const catCount = Object.keys(byId).length;
        defectInfo.textContent =
          `${cases.length} defect cases across ${catCount} categories will run for ${targetName}.`;
        const checksEl = document.getElementById('checksClearScore');
        if (checksEl && !this.defectResults.length) checksEl.textContent = `0 / ${cases.length}`;
      } else {
        defectInfo.textContent =
          `No defect cases defined for ${targetName} yet. Defect tests target es, ja, and zh-hans.`;
      }
    }
  }

  onLanguageChange() {
    if (this.runningAll) return;
    this.translator?.destroy();
    this.reverseTranslator?.destroy();
    this.translator = null;
    this.reverseTranslator = null;
    this.clearAllResults();
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
        this.translator = await this.createTranslator({
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
        this.reverseTranslator = await this.createTranslator({
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
      this.log(`Failed to initialize translator: ${this.escapeHtml(error.message)}`, 'error');
      this.run.initializationError = error.message;
      return false;
    }
  }

  // ── Test execution ───────────────────────────────────────────────

  async createTranslator(options) {
    const operation = createOperationAbort(this.runController.signal, 300000);
    const { signal } = operation;
    signal.throwIfAborted();
    let onAbort;
    const aborted = new Promise((resolve, reject) => {
      onAbort = () => reject(signal.reason);
      signal.addEventListener('abort', onAbort, { once: true });
    });
    try {
      const pending = Translator.create({ ...options, signal }).then(translator => {
        if (signal.aborted) translator.destroy();
        signal.throwIfAborted();
        return translator;
      });
      return await Promise.race([pending, aborted]);
    } finally {
      signal.removeEventListener('abort', onAbort);
      operation.dispose();
    }
  }

  async runTests() {
    if (this.testing) return;
    this.testing = true;
    this.results = [];

    if (!(await this.ensureTranslators())) {
      this.testing = false;
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
      if (!this.testing || this.runController.signal.aborted) {
        this.log('Test paused by user.', 'warning');
        break;
      }

      const item = testData[i];
      const startTime = performance.now();

      try {
        let score, translated, details;

        if (mode === 'reference') {
          // Reference mode: translate and compare to reference
          translated = await this.translateText(this.translator, item.source);
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
          translated = await this.translateText(this.translator, item.source);
          const roundTripped = await this.translateText(this.reverseTranslator, translated);
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
          checks: QualityChecks.evaluate({ source: item.source, lang: target }, translated),
          ...details
        });

      } catch (error) {
        this.log(`Q${i + 1}: Error - ${this.escapeHtml(error.message)}`, 'error');
        this.results.push({
          id: item.id,
          category: item.category,
          source: item.source,
          score: null,
          time: performance.now() - startTime,
          error: error.message
        });
      }

      // Update UI
      const completed = this.results.length;
      document.getElementById('completedCount').textContent = completed;
      const scored = this.results.filter(result => !result.error).length;
      document.getElementById('overallScore').textContent = scored ? (totalScore / scored).toFixed(1) : '--';
      document.getElementById('avgTime').textContent = scored ? Math.round(totalTime / scored) : '--';
      const total = this._allTestsTotal || testData.length;
      document.getElementById('testProgressFill').style.width =
        ((completed / total) * 100) + '%';
      document.getElementById('testProgressText').textContent =
        `${completed} / ${total}`;
    }

    // Final
    if (this.results.length > 0) {
      const scored = this.results.filter(result => !result.error).length;
      this.log(`Similarity phase: ${scored} scored; ${this.results.length - scored} execution errors.`, 'info');
    }

    this.testing = false;
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

  _formatQualityResults() {
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

    return lines.join('\n');
  }

  _formatQualityTsv() {
    const source = document.getElementById('sourceLanguage').value;
    const target = document.getElementById('targetLanguage').value;
    const sourceName = LANGUAGE_NAMES[source] || source;
    const targetName = LANGUAGE_NAMES[target] || target;
    const mode = this.getTestMode();
    const browserInfo = this.getBrowserInfo();
    const avgScore = (this.results.reduce((s, r) => s + r.score, 0) / this.results.length).toFixed(1);
    const avgTime = Math.round(this.results.reduce((s, r) => s + r.time, 0) / this.results.length);
    const tsvHeader = ['Date', 'Browser', 'Language Pair', 'Mode', 'Overall Score (%)',
      'Tests', 'Avg Time (ms)'].join('\t');
    const tsvRow = [
      new Date().toLocaleDateString(), browserInfo,
      `${sourceName} → ${targetName}`, mode, avgScore,
      this.results.length, avgTime
    ].join('\t');
    return tsvHeader + '\n' + tsvRow;
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

  async runDefectRequest(testCase, api, phase = null) {
    const empty = { output: '', pass: false, failures: [], review: [], missing: [], forbidden: [], sentenceShortfall: 0, coverage: null };
    if (this.runController.signal.aborted) {
      return { ...empty, status: 'not_run', reason: this.runController.signal.reason?.message || 'Run stopped.' };
    }
    const requestIndex = this.run.requests.length;
    const start = performance.now();
    try {
      const output = await this.translateText(this.translator, testCase.source, api, phase);
      const request = this.run.requests[requestIndex];
      return { output, time: performance.now() - start, ...evaluateDefectCase(testCase, output),
        ...(api === 'streaming' ? { chunks: request?.chunks, firstChunkMs: request?.firstChunkMs } : {}) };
    } catch (error) {
      const request = this.run.requests[requestIndex];
      return { ...empty, status: this.runController.signal.aborted ? 'aborted' : 'error',
        error: error.message, time: performance.now() - start,
        ...(api === 'streaming' ? { partialOutput: request?.partialOutput || '',
          chunks: request?.chunks || [], firstChunkMs: request?.firstChunkMs } : {}) };
    }
  }

  async runDefectTests() {
    if (this.defectTesting) return;
    const target = document.getElementById('targetLanguage').value;
    const cases = this.getDefectCases();
    if (cases.length === 0) {
      this.log(`No defect cases defined for ${LANGUAGE_NAMES[target] || target}. Try es, ja, or zh-hans.`, 'warning');
      return;
    }

    this.defectTesting = true;
    this.defectResults = [];
    document.getElementById('saveSnapshot').disabled = true;
    document.getElementById('defectResults').innerHTML = '';

    if (!(await this.ensureTranslators())) {
      this.defectTesting = false;
      return;
    }

    this.log(
      `Running ${cases.length} defect cases against ${LANGUAGE_NAMES[target] || target}\u2026`,
      'info'
    );

    for (let i = 0; i < cases.length; i++) {
      if (!this.defectTesting || this.runController.signal.aborted) {
        this.log('Defect tests paused by user.', 'warning');
        break;
      }
      const testCase = cases[i];
      const startTime = performance.now();
      try {
        const evalResult = await this.runDefectRequest(testCase, 'standard');
        const output = evalResult.output;
        const elapsed = performance.now() - startTime;
        this.defectResults.push({
          ...testCase,
          id: testCase.id,
          source: testCase.source,
          output,
          lang: testCase.lang,
          time: elapsed,
          ...evalResult,
          humanVerdict: 'unreviewed',
        });
        const result = this.defectResults.at(-1);
        if (this.run.compareStreaming) {
          result.streaming = { ...await this.runDefectRequest(testCase, 'streaming'), humanVerdict: 'unreviewed' };
          if (!result.error && !result.streaming.error && result.streaming.status !== 'not_run') {
            result.streaming.identical = result.streaming.output === output;
          }
        }
        const status = evalResult.pass ? 'warning' : 'error';
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
        reasons.push(...evalResult.failures.map(reason => this.escapeHtml(reason)));
        reasons.push(...evalResult.review.map(reason => `review: ${this.escapeHtml(reason)}`));
        const reasonHtml = reasons.length > 0
          ? `<br><span class="log-out">Findings:</span> ${reasons.join('; ')}` : '';
        this.log(
          `<span class="log-q">[${this.escapeHtml(testCase.segmentId || testCase.caseId)}]</span> ${this.escapeHtml(testCase.source)}`
          + `<br><span class="log-out">Output:</span> ${this.escapeHtml(result.error ? `Error: ${result.error}` : output)}`
          + (testCase.expectedInvariant ? `<br><span class="log-out">Expected invariant:</span> ${this.escapeHtml(testCase.expectedInvariant)}` : '')
          + (result.streaming ? `<br><span class="log-out">Streaming:</span> ${this.escapeHtml(result.streaming.error ? `Error: ${result.streaming.error}` : result.streaming.status === 'not_run' ? `Not run: ${result.streaming.reason}` : result.streaming.output)}<br>API parity: ${result.streaming.identical === undefined ? 'unavailable' : result.streaming.identical ? 'identical' : 'different / needs review'}; checks: ${this.escapeHtml(result.streaming.error || result.streaming.status === 'not_run' ? 'not evaluated' : (result.streaming.failures || []).join(', ') || 'clear')}` : '')
          + (result.streaming?.error && result.streaming.partialOutput ? `<br><span class="log-out">Partial streaming output:</span> ${this.escapeHtml(result.streaming.partialOutput)}` : '')
          + (testCase.origin === 'import' ? `<br>Old: ${this.escapeHtml(testCase.oldOutput || '(missing)')}<br>July: ${this.escapeHtml(testCase.julyOutput || '(missing)')}` : '')
          + (testCase.baselineOutput !== undefined ? `<br>Canary baseline: ${this.escapeHtml(testCase.baselineOutput)}` : '')
          + `<br><span class="log-score ${evalResult.pass ? 'ok' : 'poor'}">${result.error ? 'EXECUTION ERROR / NOT EVALUATED' :
            evalResult.pass ? 'CHECKS CLEAR / NEEDS REVIEW' : 'AUTOMATIC CHECK FLAGS / NEEDS REVIEW'}</span>`
          + reasonHtml
          + (result.error ? '' : this.semanticVerdictControl(this.defectResults.length - 1, 'standard'))
          + (!result.streaming || result.streaming.error || result.streaming.status === 'not_run' ? '' :
            this.semanticVerdictControl(this.defectResults.length - 1, 'streaming')),
          status
        );
      } catch (error) {
        this.defectResults.push({
          ...testCase,
          id: testCase.id,
          source: testCase.source,
          output: '',
          lang: testCase.lang,
          time: performance.now() - startTime,
          pass: false,
          status: this.runController.signal.aborted ? 'aborted' : 'error',
          failures: [],
          review: [],
          missing: [],
          forbidden: [],
          sentenceShortfall: 0,
          error: error.message,
        });
        this.log(`[${this.escapeHtml(testCase.caseId)}] Error: ${this.escapeHtml(error.message)}`, 'error');
      }

      const completed = this.defectResults.length;
      const allDone = this.results.length + completed;
      const allTotal = this._allTestsTotal || (this.results.length + cases.length);
      document.getElementById('testProgressFill').style.width =
        ((allDone / allTotal) * 100) + '%';
      document.getElementById('testProgressText').textContent =
        `${allDone} / ${allTotal}`;
      if (completed % 25 === 0 || completed === cases.length) this.renderDefectResults();
    }

    if (this.defectResults.length > 0) {
      const passed = this.defectResults.filter(r => r.pass).length;
      const total = this.defectResults.length;
      this.log(
        `Automatic checks clear: ${passed}/${total}. Semantic verdicts remain separate.`,
        'info'
      );
      this.renderDefectResults();
    }
    this.defectTesting = false;
  }

  // Repeats each sequentially evaluated case as overlapping standard requests
  // so the browser may batch them, and compares each output with the
  // sequential standard output. Waves bound how many requests overlap.
  async runConcurrentDefectTests() {
    const width = this.run.concurrency;
    this.run.concurrentWaves = [];
    this.log(`Repeating ${this.defectResults.length} cases as concurrent standard requests, ` +
      `${width} per wave\u2026`, 'info');
    for (let start = 0; start < this.defectResults.length; start += width) {
      const wave = this.defectResults.slice(start, start + width);
      const started = performance.now();
      const outcomes = await Promise.all(
        wave.map(result => this.runDefectRequest(result, 'standard', 'concurrent')));
      const waveIndex = this.run.concurrentWaves.length;
      this.run.concurrentWaves.push({ start, size: wave.length, ms: performance.now() - started,
        attempted: outcomes.filter(outcome => outcome.status !== 'not_run').length });
      wave.forEach((result, offset) => {
        const concurrent = { ...outcomes[offset], wave: waveIndex, humanVerdict: 'unreviewed' };
        if (!result.error && !concurrent.error && concurrent.status !== 'not_run') {
          concurrent.identical = concurrent.output === result.output;
        }
        result.concurrent = concurrent;
        if (concurrent.error || concurrent.identical === false) {
          const index = this.defectResults.indexOf(result);
          this.log(
            `<span class="log-q">[${this.escapeHtml(result.segmentId || result.caseId)}] concurrent</span>`
            + `<br><span class="log-out">Sequential:</span> ${this.escapeHtml(result.error ? `Error: ${result.error}` : result.output)}`
            + `<br><span class="log-out">Concurrent:</span> ${this.escapeHtml(concurrent.error ? `Error: ${concurrent.error}` : concurrent.output)}`
            + `<br>Concurrent parity: ${concurrent.error ? 'not evaluated' : 'different / needs review'}; checks: `
            + this.escapeHtml(concurrent.error ? 'not evaluated' : (concurrent.failures || []).join(', ') || 'clear')
            + (concurrent.error ? '' : this.semanticVerdictControl(index, 'concurrent')),
            concurrent.error ? 'error' : 'warning');
        }
      });
      this.renderDefectResults();
    }
    const differences = this.defectResults.filter(result => result.concurrent?.identical === false).length;
    this.log(`Concurrent comparison: ${differences} output differences from sequential standard ` +
      'output (needs review).', differences ? 'warning' : 'info');
  }

  // Renders per-category pass-rate table. `compareTo` (optional) is a
  // saved snapshot's defect-results array; when supplied, a delta column
  // is shown.
  semanticVerdictControl(index, api) {
    const label = { streaming: 'Streaming', concurrent: 'Concurrent' }[api] || 'Standard';
    return `<br><label>${label} semantic verdict <select data-verdict="${index}" data-api="${api}"><option value="unreviewed">Unreviewed</option><option value="acceptable">Acceptable</option><option value="defect">Defect</option><option value="uncertain">Uncertain</option></select></label>`;
  }

  renderDefectResults(compareTo = null) {
    const container = document.getElementById('defectResults');
    if (!container) return;
    if (this.defectResults.length === 0 && !this.run?.corpus?.length) {
      container.innerHTML = '';
      return;
    }

    const byCat = Object.create(null);
    (this.run?.corpus || this.defectResults).forEach(r => {
      if (!byCat[r.id]) byCat[r.id] = { pass: 0, total: 0 };
      byCat[r.id].total++;
    });
    this.defectResults.forEach(r => {
      if (r.pass) byCat[r.id].pass++;
    });

    let priorByCat = null;
    if (compareTo) {
      priorByCat = Object.create(null);
      compareTo.forEach(r => {
        if (!priorByCat[r.id]) priorByCat[r.id] = { pass: 0, total: 0 };
        priorByCat[r.id].total++;
        if (r.pass) priorByCat[r.id].pass++;
      });
    }

    const totalPass = this.defectResults.filter(r => r.pass).length;
    const totalAll = this.run?.corpus?.length ?? this.defectResults.length;
    const notRun = totalAll - this.defectResults.length;
    const overall = ((totalPass / totalAll) * 100).toFixed(1);
    const failureCounts = Object.create(null);
    for (const result of this.defectResults) {
      for (const failure of result.failures || []) {
        const category = failure.split(':')[0];
        failureCounts[category] = (failureCounts[category] || 0) + 1;
      }
    }

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
        <td><code>${this.escapeHtml(id)}</code></td>
        <td class="${cellClass}">${c.pass} / ${c.total}</td>
        <td class="${cellClass}">${rate}%</td>
        ${deltaCell}
      </tr>`;
    }).join('');

    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;
    const compareHeader = priorByCat ? '<th>Δ vs snapshot</th>' : '';
    const streamed = this.defectResults.filter(result => result.streaming).map(result => result.streaming);
    const planned = this.run?.corpus || this.defectResults;
    const coverageTotal = planned.filter(spec => ['departments', 'departments14', 'passages'].includes(spec.regressionRule)).length;
    const evaluated = results => results.filter(result =>
      !result.error && result.status !== 'not_run' && typeof result.output === 'string' && result.output.trim());
    const reviewed = results => {
      const valid = evaluated(results);
      const acceptable = valid.filter(result => result.humanVerdict === 'acceptable').length;
      const defects = valid.filter(result => result.humanVerdict === 'defect').length;
      const uncertain = valid.filter(result => result.humanVerdict === 'uncertain').length;
      return `${acceptable} acceptable, ${defects} defects, ${uncertain} uncertain; ${totalAll - acceptable - defects - uncertain} unreviewed or not run (of ${totalAll} planned).`;
    };
    const coverageSummary = results => coverageTotal ?
      `<p>Coverage checks clear: ${results.filter(result => result.coverage?.pass && evaluated([result]).length).length} / ${coverageTotal} planned coverage cases (development checks, not accuracy).</p>` : '';
    const streamingSummary = this.run?.compareStreaming ? `<p><strong>Streaming checks clear:</strong>
      ${streamed.filter(result => result.pass).length} / ${totalAll} cases.
      Streaming execution errors: ${streamed.filter(result => result.error).length}.
      Streaming not run: ${totalAll - streamed.filter(result => result.status !== 'not_run').length}.
      API output differences: ${streamed.filter(result => result.identical === false).length} (needs review).
      Execution completed: ${evaluated(streamed).length} / ${totalAll}.
      Semantic review: ${reviewed(streamed)}</p>${coverageSummary(streamed)}` : '';
    const concurrent = this.defectResults.filter(result => result.concurrent).map(result => result.concurrent);
    const waves = this.run?.concurrentWaves || [];
    const waveMs = waves.map(wave => wave.ms);
    const concurrentSummary = this.run?.compareConcurrent ? `<p><strong>Concurrent checks clear:</strong>
      ${concurrent.filter(result => result.pass).length} / ${totalAll} cases.
      Concurrent execution errors: ${concurrent.filter(result => result.error).length}.
      Concurrent not run: ${totalAll - concurrent.filter(result => result.status !== 'not_run').length}.
      Differences from sequential standard output: ${concurrent.filter(result => result.identical === false).length} (needs review).
      Waves: ${waves.length} of up to ${this.run.concurrency} requests${waveMs.length ?
        `; mean ${(waveMs.reduce((sum, ms) => sum + ms, 0) / waveMs.length).toFixed(0)} ms, max ${Math.max(...waveMs).toFixed(0)} ms` : ''}.
      Semantic review: ${reviewed(concurrent)}
      Batching runs only if the browser enables it; identical output does not prove batching ran.</p>` : '';

    container.innerHTML = `
      <div class="defect-summary">
        <strong>Standard checks clear:</strong> ${totalPass} / ${totalAll} cases
        (<span class="${overall >= 80 ? 'good' : overall >= 50 ? 'ok' : 'poor'}">${overall}%</span>)
        for ${targetName}.
        Execution completed: ${evaluated(this.defectResults).length} / ${totalAll}.
        Semantic review: ${reviewed(this.defectResults)}
        Execution errors: ${this.defectResults.filter(result => result.error).length}.
        Not run: ${notRun}.
        ${this.run?.initializationError ? `<p>Initialization error: ${this.escapeHtml(this.run.initializationError)}</p>` : ''}
        <p>${Object.entries(failureCounts).map(([label, count]) => `${this.escapeHtml(label)}: ${count}`).join('; ')}</p>
        <p>Checks clear means no automatic rule failed. It does not mean the translation is semantically correct.</p>
        ${coverageSummary(this.defectResults)}
        ${streamingSummary}
        ${concurrentSummary}
      </div>
      <table class="inner-table defect-table">
        <thead>
          <tr><th>Category</th><th>Checks clear</th><th>Check rate</th>${compareHeader}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const checksScoreEl = document.getElementById('checksClearScore');
    if (checksScoreEl) checksScoreEl.textContent = `${totalPass} / ${totalAll}`;
    const checksSubEl = document.getElementById('checksClearSub');
    if (checksSubEl) checksSubEl.textContent = `${overall}% checks clear`;
    const parityScoreEl = document.getElementById('streamingParityScore');
    const paritySubEl = document.getElementById('streamingParitySub');
    if (parityScoreEl && this.run?.compareStreaming) {
      const streamClear = streamed.filter(result => result.pass).length;
      const diffs = streamed.filter(result => result.identical === false).length;
      parityScoreEl.textContent = `${streamClear} / ${totalAll}`;
      if (paritySubEl) paritySubEl.textContent = `${diffs} output diff${diffs === 1 ? '' : 's'} vs standard`;
    } else if (parityScoreEl) {
      parityScoreEl.textContent = '—';
    }
    const concScoreEl = document.getElementById('concurrentParityScore');
    const concSubEl = document.getElementById('concurrentParitySub');
    if (concScoreEl && this.run?.compareConcurrent) {
      const concClear = concurrent.filter(result => result.pass).length;
      const concDiffs = concurrent.filter(result => result.identical === false).length;
      concScoreEl.textContent = `${concClear} / ${totalAll}`;
      if (concSubEl) {
        const waveInfo = waveMs.length ? ` · ${(waveMs.reduce((sum, ms) => sum + ms, 0) / waveMs.length).toFixed(0)}ms/wave` : '';
        concSubEl.textContent = `${concDiffs} diff${concDiffs === 1 ? '' : 's'} vs sequential${waveInfo}`;
      }
    } else if (concScoreEl) {
      concScoreEl.textContent = '—';
    }
    if (!this.results?.length && this.defectResults?.length) {
      const avgTimeEl = document.getElementById('avgTime');
      if (avgTimeEl) {
        const meanMs = Math.round(this.defectResults.reduce((s, r) => s + (r.time || 0), 0) / this.defectResults.length);
        avgTimeEl.textContent = String(meanMs);
      }
    }
  }

  // ── Snapshots (localStorage, scoped by target language) ──────────

  snapshotKey() {
    return `quality-run-v2-${this.run?.source}-${this.run?.target}-${this.run?.corpusHash}`;
  }

  buildSnapshot() {
    if (!this.run) throw new Error('No run available.');
    return structuredClone({ schemaVersion: 2, ...this.run, quality: this.results, defects: this.defectResults });
  }

  saveSnapshot() {
    if (!this.run || this.runningAll) return;
    try {
      const snapshot = this.buildSnapshot();
      QualityChecks.snapshotCases(snapshot);
      localStorage.setItem(this.snapshotKey(), JSON.stringify(snapshot));
      this.baseline = snapshot;
      this.log(snapshot.complete ? 'Run saved as baseline.' : 'Incomplete run saved with errors and unattempted cases.', 'info');
    } catch (e) {
      this.log(`Snapshot not saved: ${this.escapeHtml(e.message)}. Download Run JSON instead.`, 'error');
    }
  }

  compareSnapshot() {
    try {
      if (this.runningAll) throw new Error('Stop the current run before comparing.');
      const prior = this.baseline || JSON.parse(localStorage.getItem(this.snapshotKey()) || 'null');
      if (!prior) throw new Error('No baseline saved or imported.');
      const comparison = QualityChecks.compare(this.buildSnapshot(), prior);
      const priorQuality = new Map((prior.quality || []).map(row => [row.id, row]));
      const currentQuality = new Map(this.results.map(row => [row.id, row]));
      this.run.similarityComparison = (this.run.qualityCorpus || this.results).map(spec => {
        const old = priorQuality.get(spec.id);
        const row = currentQuality.get(spec.id);
        return { id: spec.id, source: spec.source, before: old?.translated, after: row?.translated,
          beforeStatus: !old ? 'not_run' : old.error ? 'error' : 'ok',
          afterStatus: !row ? 'not_run' : row.error ? 'error' : 'ok',
          beforeError: old?.error, afterError: row?.error,
          scoreDelta: !row || !old || row.error || old.error ? null : row.score - old.score };
      });
      const execution = run => ({ complete: run.complete, error: run.error,
        initializationError: run.initializationError, aborted: run.aborted, stopReason: run.stopReason,
        requestErrors: (run.requests || []).filter(row => row.error !== undefined) });
      this.run.comparison = { baselineTimestamp: prior.timestamp, baselineBuild: prior.buildLabel,
        beforeExecution: execution(prior), afterExecution: execution(this.run), rows: comparison };
      const counts = {};
      for (const row of comparison) counts[row.state] = (counts[row.state] || 0) + 1;
      const container = document.getElementById('snapshotComparison');
      container.replaceChildren();
      const heading = document.createElement('p');
      heading.textContent = `Case comparison (${comparison.length} planned): ${Object.entries(counts).map(([key, value]) => `${key}: ${value}`).join('; ')}`;
      container.appendChild(heading);
      const runStatus = document.createElement('pre');
      runStatus.textContent = `Baseline run: ${prior.complete ? 'complete' : 'incomplete'}${prior.initializationError || prior.error || prior.stopReason ? `; ${prior.initializationError || prior.error || prior.stopReason}` : ''}\nCurrent run: ${this.run.complete ? 'complete' : 'incomplete'}${this.run.initializationError || this.run.error || this.run.stopReason ? `; ${this.run.initializationError || this.run.error || this.run.stopReason}` : ''}`;
      container.appendChild(runStatus);
      const formatOutcome = (outcome, side) => {
        const status = outcome[`${side}Status`];
        if (status === 'not_run') return `Not run: ${outcome[`${side}Reason`] || 'No result recorded.'}`;
        if (status === 'error') return `Error: ${outcome[`${side}Error`] || 'Request failed.'}`
          + (outcome[`${side}PartialOutput`] ? `\nPartial output: ${outcome[`${side}PartialOutput`]}` : '');
        return outcome[side] ?? '';
      };
      for (const row of comparison.filter(item => item.state !== 'unchanged_output')) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `${row.state}: ${row.source}`;
        const body = document.createElement('pre');
        body.textContent = `Standard (${row.standard.state})\nBefore: ${formatOutcome(row.standard, 'before')}\nAfter: ${formatOutcome(row.standard, 'after')}\nBefore checks: ${(row.beforeFailures || []).join(', ')}\nAfter checks: ${(row.afterFailures || []).join(', ')}\nSemantic verdict: ${row.standard.beforeVerdict} → ${row.standard.afterVerdict}`
          + (row.streaming ? `\nStreaming (${row.streaming.state})\nBefore: ${formatOutcome(row.streaming, 'before')}\nAfter: ${formatOutcome(row.streaming, 'after')}\nSemantic verdict: ${row.streaming.beforeVerdict} → ${row.streaming.afterVerdict}` : '');
        details.append(summary, body);
        container.appendChild(details);
      }
      for (const row of this.run.similarityComparison.filter(item => item.beforeStatus !== 'ok' || item.afterStatus !== 'ok')) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = `Reference execution: ${row.source}`;
        const body = document.createElement('pre');
        body.textContent = `Before: ${row.beforeStatus}${row.beforeError ? `; ${row.beforeError}` : ''}\nAfter: ${row.afterStatus}${row.afterError ? `; ${row.afterError}` : ''}`;
        details.append(summary, body);
        container.appendChild(details);
      }
    } catch (e) {
      this.log(`Comparison unavailable: ${this.escapeHtml(e.message)}`, 'error');
    }
  }

  clearSnapshot() {
    for (let index = localStorage.length - 1; index >= 0; index--) {
      const key = localStorage.key(index);
      if (key?.startsWith('quality-run-v2-') || key?.startsWith('quality-defect-snapshot-')) {
        localStorage.removeItem(key);
      }
    }
    this.baseline = null;
    document.getElementById('snapshotFile').value = '';
    document.getElementById('snapshotComparison').replaceChildren();
    this.log('Saved baselines cleared.', 'info');
  }

  async importSnapshot(file) {
    if (!file || this.runningAll) return;
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error('Snapshot exceeds the 50 MB limit.');
      const snapshot = JSON.parse(await file.text());
      if (snapshot.schemaVersion !== 2) throw new Error('Expected a version-2 run.');
      QualityChecks.snapshotCases(snapshot);
      this.baseline = snapshot;
      this.log(`Baseline imported: ${this.escapeHtml(snapshot.buildLabel || snapshot.browser)} (${snapshot.complete ? 'complete' : 'incomplete'}).`, 'info');
    } catch (error) {
      this.baseline = null;
      this.log(`Baseline import failed: ${this.escapeHtml(error.message)}`, 'error');
    }
  }

  exportRun() {
    if (!this.run || this.runningAll) return;
    const blob = new Blob([JSON.stringify(this.buildSnapshot(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `translation-${this.run.source}-${this.run.target}-${this.run.timestamp.replace(/[:.]/g, '-')}.json`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  _formatDefectResults() {
    const target = document.getElementById('targetLanguage').value;
    const targetName = LANGUAGE_NAMES[target] || target;
    const browserInfo = this.getBrowserInfo();

    const byCat = Object.create(null);
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

    return lines.join('\n');
  }

  // ── Snapshots (localStorage, scoped by target language) ──────────────

  async runAllTests() {
    if (this.runningAll || this.importing) return;
    const target = document.getElementById('targetLanguage').value;
    if (target === 'en') { this.log('Choose a target other than English.', 'warning'); return; }
    const cases = this.getDefectCases();
    const importedOnly = document.getElementById('corpusSelection').value === 'imported';
    const focused = document.getElementById('corpusSelection').value === 'focused';
    if (importedOnly && !cases.length) { this.log('No imported cases for this pair.', 'warning'); return; }
    const timeoutSeconds = Number(document.getElementById('requestTimeout').value);
    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds < 1 || timeoutSeconds > 600) {
      this.log('Request timeout must be between 1 and 600 seconds.', 'warning'); return;
    }
    const compareConcurrent = document.getElementById('compareConcurrent').checked;
    const concurrency = Number(document.getElementById('concurrency').value);
    if (compareConcurrent && (!Number.isInteger(concurrency) || concurrency < 2 || concurrency > 32)) {
      this.log('Concurrent requests per wave must be a whole number from 2 to 32.', 'warning'); return;
    }
    this.clearAllResults();
    this.runningAll = true;
    this.runController = new AbortController();

    const mode = this.getTestMode();
    const qualityCases = importedOnly || focused ? [] : mode === 'reference' ? QUALITY_TEST_DATA.filter(test => test.refs[target]) : QUALITY_TEST_DATA;
    const qualityCount = qualityCases.length;
    const defectCount = cases.length;
    this._allTestsTotal = qualityCount + defectCount;
    this.run = { source: 'en', target, mode, timestamp: new Date().toISOString(),
      browser: this.getBrowserInfo(), userAgent: navigator.userAgent, validatorVersion: QualityChecks.VERSION, harnessVersion: '8',
      corpusSelection: document.getElementById('corpusSelection').value,
      regressionCorpusVersion: focused ? QualityRegressions.VERSION : undefined,
      compareStreaming: document.getElementById('compareStreaming').checked,
      ...(compareConcurrent ? { compareConcurrent, concurrency, concurrentHarnessVersion: '1' } : {}),
      buildLabel: document.getElementById('buildLabel').value, runtimeLabel: document.getElementById('runtimeLabel').value || 'unknown',
      timeoutSeconds, complete: false, requests: [], corpus: cases, qualityCorpus: qualityCases,
      importMetadata: this.importMetadata || null, importWarnings: this.importWarnings };
    const locked = ['targetLanguageSearch', 'regressionCsv', 'csvEncoding', 'corpusSelection', 'buildLabel',
      'runtimeLabel', 'requestTimeout', 'compareStreaming', 'compareConcurrent', 'concurrency',
      'clearAllResults', 'snapshotFile', 'compareSnapshot', 'clearSnapshot'];
    for (const id of locked) document.getElementById(id).disabled = true;
    this.targetSelect.close();

    // Reset display before kicking off both phases.
    this.results = [];
    this.defectResults = [];
    document.getElementById('testLog').innerHTML = '';
    document.getElementById('defectResults').innerHTML = '';
    document.getElementById('overallScore').textContent = qualityCount ? '0' : 'N/A';
    document.getElementById('completedCount').textContent = '0';
    document.getElementById('avgTime').textContent = '0';
    document.getElementById('totalCount').textContent = qualityCount;
    document.getElementById('testProgressFill').style.width = '0%';
    document.getElementById('testProgressText').textContent = `0 / ${this._allTestsTotal}`;

    document.getElementById('runAllTests').disabled = true;
    document.getElementById('stopAllTests').disabled = false;
    document.getElementById('copyAllResults').disabled = true;

    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify({ qualityCases, cases })));
      this.run.corpusHash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      if (!this.runController.signal.aborted && qualityCount) await this.runTests();
      if (!this.runController.signal.aborted && !this.run.initializationError && defectCount) await this.runDefectTests();
      if (!this.runController.signal.aborted && !this.run.initializationError && defectCount &&
          compareConcurrent) await this.runConcurrentDefectTests();
      this.run.complete = !this.runController.signal.aborted && !this.run.initializationError &&
        this.results.length === qualityCount && this.defectResults.length === defectCount &&
        !this.run.requests.some(request => request.error) &&
        !this.results.some(result => result.error) && !this.defectResults.some(result => result.error || result.streaming?.error) &&
        (!compareConcurrent || this.defectResults.every(result => result.concurrent &&
          !result.concurrent.error && result.concurrent.status !== 'not_run'));
    } catch (error) {
      this.run.error = error.message;
      this.log(`Run failed: ${this.escapeHtml(error.message)}`, 'error');
    } finally {
      this.run.finishedAt = new Date().toISOString();
      this.run.aborted = this.runController.signal.aborted;
      if (this.run.aborted) this.run.stopReason = this.runController.signal.reason?.message || 'Run stopped.';
      this.runningAll = false;
      this.testing = false;
      this.defectTesting = false;
      this._allTestsTotal = 0;
      for (const id of locked) document.getElementById(id).disabled = false;
      document.getElementById('runAllTests').disabled = false;
      document.getElementById('stopAllTests').disabled = true;
      document.getElementById('copyAllResults').disabled = false;
      document.getElementById('exportRun').disabled = false;
      document.getElementById('saveSnapshot').disabled = false;
      this.renderDefectResults();
      this.log(this.run.complete ? 'Run complete.' : 'Run incomplete; errors and unattempted cases retained.', this.run.complete ? 'info' : 'warning');
    }
  }

  stopAllTests() {
    this.runController?.abort();
    this.testing = false;
    this.defectTesting = false;
    document.getElementById('stopAllTests').disabled = true;
  }

  copyAllResults() {
    if (!this.run || this.runningAll) return;
    const text = JSON.stringify(this.buildSnapshot(), null, 2);
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copyAllResults');
      btn.textContent = '\u2713 Copied!';
      setTimeout(() => { btn.textContent = '\ud83d\udccb Copy'; }, 2000);
    }).catch(() => {
      alert('Failed to copy results to clipboard');
    });
  }

  clearAllResults() {
    if (this.runningAll) return;
    this.run = null;
    this.results = [];
    this.defectResults = [];
    document.getElementById('testLog').innerHTML = '';
    document.getElementById('defectResults').innerHTML = '';
    document.getElementById('overallScore').textContent = '0';
    document.getElementById('completedCount').textContent = '0';
    document.getElementById('avgTime').textContent = '0';
    const parityScoreEl = document.getElementById('streamingParityScore');
    if (parityScoreEl) parityScoreEl.textContent = '—';
    const concScoreEl = document.getElementById('concurrentParityScore');
    if (concScoreEl) concScoreEl.textContent = '—';
    document.getElementById('testProgressFill').style.width = '0%';
    document.getElementById('testProgressText').textContent = '0 / 0';
    document.getElementById('saveSnapshot').disabled = true;
    document.getElementById('copyAllResults').disabled = true;
    document.getElementById('exportRun').disabled = true;
    document.getElementById('snapshotComparison').replaceChildren();
    this.updateTestMode();
  }
}

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
    mustPreserve: ['Albert Einstein', 'MIT', 'DeepMind'], mustNotContain: ['深度导师', '深度教师'],
    allowedTokens: { 'Albert Einstein': ['Albert Einstein', '阿尔伯特·爱因斯坦'], 'MIT': ['MIT', '麻省理工学院'] } },
  { id: 'proper_noun_error', lang: 'zh-hans', source: 'The HKUST and HKUDS research teams collaborate on AI projects.',
    mustPreserve: ['HKUST', 'HKUDS'], mustNotContain: ['香港统计学硕士'] },

  // number_changed: digits / versions swapped, magnitude misread.
  { id: 'number_changed', lang: 'es',      source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11', '$3.8M'], mustNotContain: ['Windows 7.0'] },
  { id: 'number_changed', lang: 'ja',      source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11'], mustNotContain: ['Windows 7.0'] },
  { id: 'number_changed', lang: 'zh-hans', source: 'Upgrade to version 7.0 for Windows 11 to handle the budget of $3.8M this year.',
    mustPreserve: ['7.0', 'Windows 11'], mustNotContain: ['Windows 7.0', '3.8万'] },

  // number_changed (reverse-order experiment): same numbers, opposite
  // source word order. If the noun↔number binding still inverts in
  // zh-hans, the failure is an order-invariant attachment bias in the
  // decoder cross-attention. If it now binds correctly, the original
  // failure was positional. es/ja are controls — should bind correctly.
  { id: 'number_changed', lang: 'es',      source: 'Upgrade to Windows 11 from version 7.0 to handle the budget of $3.8M this year.',
    mustPreserve: ['Windows 11', '7.0', '$3.8M'], mustNotContain: ['Windows 7.0', 'version 11'] },
  { id: 'number_changed', lang: 'ja',      source: 'Upgrade to Windows 11 from version 7.0 to handle the budget of $3.8M this year.',
    mustPreserve: ['Windows 11', '7.0'], mustNotContain: ['Windows 7.0', 'version 11'] },
  { id: 'number_changed', lang: 'zh-hans', source: 'Upgrade to Windows 11 from version 7.0 to handle the budget of $3.8M this year.',
    mustPreserve: ['Windows 11', '7.0'], mustNotContain: ['Windows 7.0'] },

  // number_changed (letter-substituted control): Roman numerals replace
  // digits in the same syntactic slots. Numbers tokenize as per-digit
  // BPE pieces (`[1][1]`, `[7][.][0]`) with weak positional signal;
  // Roman numerals are single-token-like identifiers. If zh-hans binds
  // these correctly but swaps the digit version, numeric tokenization
  // fragmentation is contributing. If it still swaps, the binding bug
  // is purely in the model and tokenization is not a factor.
  { id: 'number_changed', lang: 'es',      source: 'Upgrade to version VII for Windows XI to handle the budget of MXM this year.',
    mustPreserve: ['VII', 'Windows XI', 'MXM'], mustNotContain: ['Windows VII'] },
  { id: 'number_changed', lang: 'ja',      source: 'Upgrade to version VII for Windows XI to handle the budget of MXM this year.',
    mustPreserve: ['VII', 'Windows XI', 'MXM'], mustNotContain: ['Windows VII'] },
  { id: 'number_changed', lang: 'zh-hans', source: 'Upgrade to version VII for Windows XI to handle the budget of MXM this year.',
    mustPreserve: ['VII', 'Windows XI', 'MXM'], mustNotContain: ['Windows VII'] },

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
  const m = text.match(/[.!?。！？؟।]/g);
  return m ? m.length : 0;
}

// Locales that use comma as the decimal separator. Used to treat "179,5"
// as equivalent to "179.5" when checking numeric preservation.
const COMMA_DECIMAL_LANGS = new Set([
  'es', 'es-419', 'es-es', 'es-mx', 'fr', 'fr-ca', 'de', 'it', 'pt', 'pt-br', 'pt-pt',
  'nl', 'pl', 'ru', 'tr', 'sv', 'no', 'nb', 'da', 'fi', 'cs', 'el', 'hu', 'ro', 'bg',
  'uk', 'be', 'sr-latn', 'sr-cyrl', 'sl', 'hr', 'bs', 'sk', 'id', 'vi', 'af', 'ca',
  'gl', 'eu', 'et', 'lv', 'lt', 'is', 'fo', 'sq', 'mk', 'az', 'kk', 'uz',
]);

// Magnitude-word substitutions that map locale-specific expansions back
// to abbreviated suffixes (M / B / K). Lets us treat "3.8 millones" as
// equivalent to "3.8M" when the model expands magnitude suffixes.
const MAGNITUDE_PATTERNS = [
  // Spanish
  [/(\d+(?:\.\d+)?)\s*mil\s+millones?/gi, '$1B'],
  [/(\d+(?:\.\d+)?)\s*millones?\b/gi, '$1M'],
  [/(\d+(?:\.\d+)?)\s*mil\b/gi, '$1K'],
  // French
  [/(\d+(?:\.\d+)?)\s*milliards?/gi, '$1B'],
  // German
  [/(\d+(?:\.\d+)?)\s*Milliarden?/gi, '$1B'],
  [/(\d+(?:\.\d+)?)\s*Millionen?/gi, '$1M'],
  [/(\d+(?:\.\d+)?)\s*Tausend/gi, '$1K'],
  // Italian
  [/(\d+(?:\.\d+)?)\s*miliardi?/gi, '$1B'],
  [/(\d+(?:\.\d+)?)\s*milioni?/gi, '$1M'],
  // Portuguese
  [/(\d+(?:\.\d+)?)\s*bilh[õo]es?/gi, '$1B'],
  [/(\d+(?:\.\d+)?)\s*milh[õo]es?/gi, '$1M'],
  // Russian
  [/(\d+(?:\.\d+)?)\s*(?:миллиард(?:а|ов)?|млрд)/giu, '$1B'],
  [/(\d+(?:\.\d+)?)\s*(?:миллион(?:а|ов)?|млн)/giu, '$1M'],
  [/(\d+(?:\.\d+)?)\s*(?:тысяч(?:и|а)?|тыс)/giu, '$1K'],
  // Arabic
  [/(\d+(?:\.\d+)?)\s*مليار(?:ات)?/gu, '$1B'],
  [/(\d+(?:\.\d+)?)\s*(?:مليون|ملايين)/gu, '$1M'],
  [/(\d+(?:\.\d+)?)\s*(?:ألف|آلاف)/gu, '$1K'],
  // Hindi
  [/(\d+(?:\.\d+)?)\s*अरब/gu, '$1B'],
  [/(\d+(?:\.\d+)?)\s*मिलियन/gu, '$1M'],
  // Generic / English (covers French "millions" too)
  [/(\d+(?:\.\d+)?)\s*billions?/gi, '$1B'],
  [/(\d+(?:\.\d+)?)\s*millions?/gi, '$1M'],
  [/(\d+(?:\.\d+)?)\s*thousands?/gi, '$1K'],
];

// Currency-word substitutions that map a trailing currency word back to
// the leading symbol form. Lets us treat "3.8M de dólares" as equivalent
// to "$3.8M" when the model drops the symbol and uses the word instead.
// Applied AFTER MAGNITUDE_PATTERNS so suffixes are already collapsed.
const CURRENCY_PATTERNS = [
  // USD: "3.8M de dólares" / "3.8M dólares" / "3.8M dollars" / "3.8M USD"
  [/(\d+(?:\.\d+)?[KMB]?)\s+(?:de\s+|d'\s*)?(?:d[óo]lares?|dollars?|dollari|доллар(?:а|ов)?|دولار(?:ات)?|डॉलर|달러|USD|US\$)/giu, '$$$1'],
  // EUR
  [/(\d+(?:\.\d+)?[KMB]?)\s+(?:de\s+)?(?:euros?|EUR)/gi, '€$1'],
  // GBP
  [/(\d+(?:\.\d+)?[KMB]?)\s+(?:de\s+)?(?:pounds?|libras?|GBP)/gi, '£$1'],
  // JPY
  [/(\d+(?:\.\d+)?[KMB]?)\s+(?:de\s+)?(?:yen|円|JPY)/gi, '¥$1'],
];

// Normalises numeric / currency strings so locale-equivalent renderings
// compare as equal. Used only as a fallback after a literal substring
// check fails — we still flag genuine corruption, just not these:
//   "179.5"  ↔ "179,5"                  (decimal separator localised)
//   "$3.8M"  ↔ "$ 3.8 millones"         (currency space + magnitude expanded)
//   "$3.8M"  ↔ "3,8 millones de dólares" (symbol replaced by word + decimal localised)
function normalizeNumeric(s, lang) {
  if (!s) return s;
  let t = s.replace(/\p{Nd}/gu, char => {
    const code = char.codePointAt(0);
    for (const zero of [0x0030, 0x0660, 0x06F0, 0x0966, 0x09E6, 0x0A66, 0x0AE6, 0x0B66, 0x0BE6, 0x0C66, 0x0CE6, 0x0D66, 0x0E50, 0x0ED0, 0x0F20, 0x1040, 0xFF10]) {
      if (code >= zero && code <= zero + 9) return String(code - zero);
    }
    return char;
  });
  // Collapse whitespace after currency symbol: "$ 3.8" -> "$3.8".
  t = t.replace(/([$€£¥¢])\s+/g, '$1');
  // Decimal separator: "," or "٫" between digits -> "." in comma-decimal / Arabic locales.
  if (COMMA_DECIMAL_LANGS.has(lang) || ['ar', 'fa', 'prs', 'ur', 'ps', 'ug'].includes(lang)) {
    t = t.replace(/(\d)[,٫](\d)/g, '$1.$2');
  }
  // Magnitude words -> abbreviated suffix.
  for (const [re, repl] of MAGNITUDE_PATTERNS) {
    t = t.replace(re, repl);
  }
  // Trailing currency word -> leading currency symbol.
  for (const [re, repl] of CURRENCY_PATTERNS) {
    t = t.replace(re, repl);
  }
  return t;
}

// Evaluates one defect case against the on-device translation output.
function evaluateDefectCase(testCase, output) {
  return QualityChecks.evaluate(testCase, output, normalizeNumeric);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const benchmark = new TranslationQualityBenchmark();
  window.__qualityBenchmark = benchmark;
});
