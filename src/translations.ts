import { Language } from './types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  onlineStatus: string;
  offlineStatus: string;
  syncNow: string;
  dataSyncedSuccess: string;
  selectLanguage: string;
  telugu: string;
  hindi: string;
  english: string;
  roleVillager: string;
  roleAsha: string;
  roleDoctor: string;
  
  // Navigation
  navDashboard: string;
  navChatbot: string;
  navVoiceAssistant: string;
  navSymptomChecker: string;
  navReminders: string;
  navEmergency: string;
  navLocator: string;
  navEducation: string;
  navPrescriptions: string;
  navAshaTools: string;
  navAnalytics: string;
  
  // Voice Assistant & Chatbot
  tapToSpeak: string;
  listening: string;
  thinking: string;
  speaking: string;
  stopVoice: string;
  wakeWordHelp: string;
  attachPrescription: string;
  typeMessagePlaceholder: string;
  quickQuestionsTitle: string;
  chatbotTitle: string;
  chatbotSubtitle: string;
  voiceTyping: string;
  clearChat: string;
  
  // Dashboard & Vitals
  healthSummary: string;
  familyMembers: string;
  addFamilyMember: string;
  deleteFamilyMember: string;
  confirmDeleteFamilyMember: string;
  healthQrCard: string;
  scanPatientQr: string;
  qrScanSuccess: string;
  patientHistory: string;
  downloadQr: string;
  printHealthCard: string;
  ashaVisitNotes: string;
  addVisitNote: string;
  referToDoctor: string;
  logVitals: string;
  bp: string;
  bloodSugar: string;
  pulseRate: string;
  spo2: string;
  temperature: string;
  weight: string;
  height: string;
  bmi: string;
  normal: string;
  high: string;
  low: string;
  
  // Emergency
  sosButton: string;
  sosSubtext: string;
  call108Ambulance: string;
  nearbyHospitals: string;
  firstAidTitle: string;
  shareLocation: string;
  snakeBiteGuide: string;
  dogBiteGuide: string;
  heatStrokeGuide: string;
  dehydrationGuide: string;
  
  // Medicine
  todaysMedicines: string;
  takeMedicine: string;
  taken: string;
  missedAlert: string;
  addReminder: string;
  readAloud: string;
  
  // Maternal & Child
  pregnancyTracker: string;
  childVaccination: string;
  dueSoon: string;
  overdue: string;
  completed: string;
  
  // Accessibility
  highContrast: string;
  textSize: string;
  voiceGuide: string;

  // Export & Share with Doctor
  exportReport: string;
  exportPdf: string;
  exportText: string;
  shareWithDoctor: string;
  downloadPdf: string;
  downloadText: string;
  copySummary: string;
  copiedSuccess: string;

  // Auto-Save
  autoSaved: string;
  draftRestored: string;
  clearDraft: string;

  // General
  save: string;
  cancel: string;
  delete: string;
  viewAll: string;
  callNow: string;
  getDirections: string;

  // Geolocation & PHC Transit Locator
  nearestPhcTitle: string;
  detectingLocation: string;
  gpsActive: string;
  gpsDenied: string;
  refreshLocation: string;
  walkingDistance: string;
  walkingTime: string;
  vehicleTime: string;
  ambulanceTime: string;
  walkRoute: string;
  driveRoute: string;
  phcEmergencyServices: string;
  listenDirections: string;
  usePresetLocation: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  te: {
    appName: 'రూరల్ హెల్త్ మానిటరింగ్ ఏఐ',
    tagline: 'గ్రామీణ ఆరోగ్య రక్షణ & బహుభాషా వాయిస్ అసిస్టెంట్',
    onlineStatus: 'ఆన్‌లైన్ (ఇంటర్నెట్ ఉంది)',
    offlineStatus: 'ఆఫ్‌లైన్ మోడ్ (సమాచారం భద్రంగా ఉంది)',
    syncNow: 'డేటా సింక్ చేయండి',
    dataSyncedSuccess: 'సమాచారం విజయవంతంగా నవీకరించబడింది!',
    selectLanguage: 'భాష ఎంచుకోండి',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    english: 'English',
    roleVillager: 'గ్రామస్థులు / కుటుంబం',
    roleAsha: 'ఆశా కార్యకర్త (ASHA)',
    roleDoctor: 'పి.హెచ్.సి డాక్టర్',

    navDashboard: 'హోమ్ డ్యాష్‌బోర్డ్',
    navChatbot: 'ఏఐ చాట్‌బాట్',
    navVoiceAssistant: 'వాయిస్ సహాయకుడు',
    navSymptomChecker: 'లక్షణాల పరిశీలన',
    navReminders: 'మందుల గుర్తుచేయునది',
    navEmergency: 'అత్యవసర సహాయం (SOS)',
    navLocator: 'ఆసుపత్రుల గుర్తింపు',
    navEducation: 'ఆరోగ్య పాఠాలు',
    navPrescriptions: 'మందుల చీటీలు',
    navAshaTools: 'ఆశా వర్కర్ టూల్స్',
    navAnalytics: 'ఆరోగ్య విశ్లేషణ',

    tapToSpeak: 'మాట్లాడటానికి ఇక్కడ నొక్కండి',
    listening: 'వింటున్నాను... చెప్పండి',
    thinking: 'ఆలోచిస్తున్నాను...',
    speaking: 'సమాధానం చెప్తున్నాను...',
    stopVoice: 'వాయిస్ ఆపు',
    wakeWordHelp: '"హలో రూరల్ హెల్త్" అని గట్టిగా చెప్పండి',
    attachPrescription: 'మందుల చీటీ/రిపోర్ట్ ఫోటో తీయండి',
    typeMessagePlaceholder: 'మీ ఆరోగ్య సమస్యను ఇక్కడ టైప్ చేయండి...',
    quickQuestionsTitle: 'సాధారణంగా అడిగే ప్రశ్నలు:',
    chatbotTitle: 'ఆరోగ్య ఏఐ చాట్‌బాట్',
    chatbotSubtitle: 'టైపింగ్ లేదా వాయిస్ అసిస్టెంట్ ద్వారా తక్షణ ఆరోగ్య సలహాలు పొందండి',
    voiceTyping: 'వాయిస్ ద్వారా టైప్ చేయండి',
    clearChat: 'చాట్ చరిత్రను క్లియర్ చేయండి',

    healthSummary: 'ఆరోగ్య వివరాలు',
    familyMembers: 'కుటుంబ సభ్యుల ప్రొఫైల్స్',
    addFamilyMember: 'సభ్యుడిని చేర్చండి',
    deleteFamilyMember: 'సభ్యుడిని తొలగించండి',
    confirmDeleteFamilyMember: 'ఈ కుటుంబ సభ్యుడిని మీ రికార్డుల నుండి తొలగించాలనుకుంటున్నారా?',
    healthQrCard: 'డిజిటల్ హెల్త్ క్యూఆర్ కార్డ్',
    scanPatientQr: 'రోగి హెల్త్ QR స్కాన్ చేయండి',
    qrScanSuccess: 'రోగి వివరాలు విజయవంతంగా పొందబడ్డాయి',
    patientHistory: 'రోగి పూర్తి ఆరోగ్య రికార్డు',
    downloadQr: 'QR కార్డ్ డౌన్‌లోడ్',
    printHealthCard: 'కార్డు ప్రింట్ చేయండి',
    ashaVisitNotes: 'ఆశా ఫీల్డ్ విజిట్ నోట్స్',
    addVisitNote: 'తనిఖీ వివరాలు నమోదు చేయండి',
    referToDoctor: 'వైద్యుడికి రిఫర్ చేయండి',
    logVitals: 'బిపి, షుగర్ నమోదు చేయండి',
    bp: 'రక్తపోటు (BP)',
    bloodSugar: 'బ్లడ్ షుగర్',
    pulseRate: 'పల్స్ రేట్',
    spo2: 'ఆక్సిజన్ (SpO2)',
    temperature: 'శరీర ఉష్ణోగ్రత',
    weight: 'బరువు (కట)',
    height: 'ఎత్తు (సెం.మీ)',
    bmi: 'బి.ఎమ్.ఐ (BMI)',
    normal: 'సమానం (నార్మల్)',
    high: 'ఎక్కువ (హై)',
    low: 'తక్కువ (లో)',

    sosButton: 'అత్యవసర SOS',
    sosSubtext: 'వెంటనే 108 ఆంబులెన్స్ & కుటుంబానికి సందేశం పంపుతుంది',
    call108Ambulance: '108 ఆంబులెన్స్ కాల్ చేయి',
    nearbyHospitals: 'దగ్గరలోని ఆసుపత్రులు & PHC ల జాబితా',
    firstAidTitle: 'వెంటనే చేయవలసిన ప్రథమ చికిత్స',
    shareLocation: 'నా నివాస ప్రాంత స్థానం పంపు',
    snakeBiteGuide: 'పాము కాటుకు వెంటనే చేయవలసినది',
    dogBiteGuide: 'పిచ్చి కుక్క కాటు ప్రథమ చికిత్స',
    heatStrokeGuide: 'వడదెబ్బ తగలకుండా జాగ్రత్తలు',
    dehydrationGuide: 'ఓ.ఆర్.ఎస్ (ORS) తయారుచేసే విధానం',

    todaysMedicines: 'ఈరోజు వేసుకోవాల్సిన మందులు',
    takeMedicine: 'మందు వేసుకున్నాను',
    taken: 'పూర్తయింది',
    missedAlert: 'మందుల సమయం మించిపోయింది!',
    addReminder: 'మందు గుర్తుచేయునది జోడించు',
    readAloud: 'వాయిస్ ద్వారా వినండి',

    pregnancyTracker: 'గర్భిణీ స్త్రీల సంరక్షణ',
    childVaccination: 'పిల్లల టీకాల చార్ట్',
    dueSoon: 'త్వరలో రాబోయే టీకా',
    overdue: 'సమయం దాటిపోయింది',
    completed: 'టీకా వేయబడింది',

    highContrast: 'స్పష్టమైన రంగులు',
    textSize: 'అక్షరాల సైజు',
    voiceGuide: 'వాయిస్ గైడ్ ఆన్ చేయి',

    // Export & Share
    exportReport: 'వైద్య నివేదిక ఎగుమతి (Export Report)',
    exportPdf: 'పీడీఎఫ్ డౌన్‌లోడ్ (PDF)',
    exportText: 'టెక్స్ట్ ఫైల్ (.txt)',
    shareWithDoctor: 'డాక్టర్‌తో పంచుకోండి',
    downloadPdf: 'పీడీఎఫ్ డౌన్‌లోడ్',
    downloadText: 'టెక్స్ట్ డౌన్‌లోడ్',
    copySummary: 'సారాంశం కాపీ చేయి',
    copiedSuccess: 'క్లిప్‌బోర్డ్‌కి కాపీ చేయబడింది!',

    // Auto-Save
    autoSaved: 'ఆటో-సేవ్ అయింది',
    draftRestored: 'మీ మునుపటి లక్షణాలు పునరుద్ధరించబడ్డాయి',
    clearDraft: 'డ్రాఫ్ట్ తొలగించు',

    save: 'భద్రపరచు',
    cancel: 'రద్దు చేయి',
    delete: 'తొలగించు',
    viewAll: 'అన్నీ చూడండి',
    callNow: 'ఇప్పుడే కాల్ చేయండి',
    getDirections: 'దారి చూడండి',

    // Geolocation & PHC Transit Locator
    nearestPhcTitle: 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC)',
    detectingLocation: 'మీ ప్రస్తుత GPS లొకేషన్ గుర్తిస్తోంది...',
    gpsActive: 'లైవ్ జీపీఎస్ లొకేషన్ యాక్టివ్',
    gpsDenied: 'జీపీఎస్ అనుమతి లేదు - డిఫాల్ట్ గ్రామం ఎంపిక చేయబడింది',
    refreshLocation: 'లొకేషన్ రీఫ్రెష్ చేయి',
    walkingDistance: 'నడక దూరం',
    walkingTime: 'నడక సమయం',
    vehicleTime: 'వాహనం / ఆటో సమయం',
    ambulanceTime: '108 అంబులెన్స్ ప్రయాణ సమయం',
    walkRoute: 'నడక దారి (Google Maps)',
    driveRoute: 'వాహనం దారి',
    phcEmergencyServices: '24x7 అత్యవసర సేవలు & మందులు',
    listenDirections: 'దిశానిర్దేశాలు వినండి',
    usePresetLocation: 'గ్రామ స్థానం ఎంచుకోండి',
  },

  hi: {
    appName: 'रूरल हेल्थ मॉनिटरिंग एआई',
    tagline: 'ग्रामीण स्वास्थ्य निगरानी और बहुभाषी आवाज सहायक',
    onlineStatus: 'ऑनलाइन (इंटरनेट कनेक्टेड)',
    offlineStatus: 'ऑफ़लाइन मोड (डेटा सुरक्षित है)',
    syncNow: 'डेटा सिंक करें',
    dataSyncedSuccess: 'जानकारी सफलतापूर्वक अपडेट की गई!',
    selectLanguage: 'भाषा चुनें',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    english: 'English',
    roleVillager: 'ग्रामीण / परिवार',
    roleAsha: 'आशा कार्यकर्ता (ASHA)',
    roleDoctor: 'पीएचसी डॉक्टर',

    navDashboard: 'होम डैशबोर्ड',
    navChatbot: 'एआई चैटबॉट',
    navVoiceAssistant: 'आवाज सहायक',
    navSymptomChecker: 'लक्षण जांच',
    navReminders: 'दवा रिमाइंडर',
    navEmergency: 'आपातकालीन सहायता (SOS)',
    navLocator: 'अस्पताल खोजें',
    navEducation: 'स्वास्थ्य शिक्षा',
    navPrescriptions: 'दवा पर्ची scan',
    navAshaTools: 'आशा वर्कर टूल्स',
    navAnalytics: 'स्वास्थ्य रुझान',

    tapToSpeak: 'बोलने के लिए यहाँ दबाएं',
    listening: 'सुन रहा हूँ... बोलिए',
    thinking: 'सोच रहा हूँ...',
    speaking: 'उत्तर दे रहा हूँ...',
    stopVoice: 'आवाज रोकें',
    wakeWordHelp: '"हेलो रूरल हेल्थ" बोलें',
    attachPrescription: 'दवा पर्ची की फोटो लें',
    typeMessagePlaceholder: 'अपनी स्वास्थ्य समस्या यहाँ लिखें...',
    quickQuestionsTitle: 'सामान्य प्रश्न:',
    chatbotTitle: 'हेल्थ एआई चैटबॉट',
    chatbotSubtitle: 'टाइपिंग या वॉयस असिस्टेंट के साथ तुरंत स्वास्थ्य सलाह प्राप्त करें',
    voiceTyping: 'आवाज से टाइप करें',
    clearChat: 'चैट मिटाएं',

    healthSummary: 'स्वास्थ्य विवरण',
    familyMembers: 'परिवार के सदस्य',
    addFamilyMember: 'सदस्य जोड़ें',
    deleteFamilyMember: 'सदस्य हटाएं',
    confirmDeleteFamilyMember: 'क्या आप इस परिवार के सदस्य को हटाना चाहते हैं?',
    healthQrCard: 'डिजिटल हेल्थ QR कार्ड',
    scanPatientQr: 'मरीज़ का QR स्कैन करें',
    qrScanSuccess: 'मरीज़ का विवरण सफलतापूर्वक प्राप्त हुआ',
    patientHistory: 'मरीज़ का संपूर्ण स्वास्थ्य इतिहास',
    downloadQr: 'QR कार्ड डाउनलोड करें',
    printHealthCard: 'हेल्थ कार्ड प्रिंट करें',
    ashaVisitNotes: 'आशा फील्ड विज़िट नोट्स',
    addVisitNote: 'विज़िट नोट दर्ज करें',
    referToDoctor: 'पीएचसी डॉक्टर को रेफर करें',
    logVitals: 'बीपी, शुगर दर्ज करें',
    bp: 'ब्लड प्रेशर (BP)',
    bloodSugar: 'ब्लड शुगर',
    pulseRate: 'पल्स रेट',
    spo2: 'ऑक्सीजन (SpO2)',
    temperature: 'तापमान',
    weight: 'वजन (किग्रा)',
    height: 'ऊंचाई (सेमी)',
    bmi: 'बीएमआई (BMI)',
    normal: 'सामान्य',
    high: 'ज्यादा (हाई)',
    low: 'कम (लो)',

    sosButton: 'आपातकालीन SOS',
    sosSubtext: 'तुरंत 108 एम्बुलेंस और परिवार को कॉल/अलर्ट भेजता है',
    call108Ambulance: '108 एम्बुलेंस को कॉल करें',
    nearbyHospitals: 'निकटतम अस्पताल और पीएचसी',
    firstAidTitle: 'प्राथमिक उपचार निर्देश',
    shareLocation: 'लाइव लोकेशन शेयर करें',
    snakeBiteGuide: 'सांप काटने पर प्राथमिक उपचार',
    dogBiteGuide: 'कुत्ते के काटने पर क्या करें',
    heatStrokeGuide: 'लू से बचाव के उपाय',
    dehydrationGuide: 'ओआरएस (ORS) बनाने का तरीका',

    todaysMedicines: 'आज की दवाइयां',
    takeMedicine: 'दवा ले ली',
    taken: 'ली गई',
    missedAlert: 'दवा का समय निकल गया!',
    addReminder: 'दवा रिमाइंडर जोड़ें',
    readAloud: 'आवाज में सुनें',

    pregnancyTracker: 'गर्भवती महिला देखभाल',
    childVaccination: 'बच्चों का टीकाकरण चार्ट',
    dueSoon: 'आगामी टीका',
    overdue: 'समय बीत चुका है',
    completed: 'टीका लग गया',

    highContrast: 'हाई कंट्रास्ट',
    textSize: 'अक्षर का आकार',
    voiceGuide: 'आवाज गाइड चालू करें',

    // Export & Share
    exportReport: 'चिकित्सा रिपोर्ट निर्यात (Export)',
    exportPdf: 'पीडीएफ डाउनलोड (PDF)',
    exportText: 'टेक्स्ट फाइल (.txt)',
    shareWithDoctor: 'डॉक्टर से साझा करें',
    downloadPdf: 'पीडीएफ डाउनलोड करें',
    downloadText: 'टेक्स्ट डाउनलोड करें',
    copySummary: 'सारांश कॉपी करें',
    copiedSuccess: 'क्लिपबोर्ड पर कॉपी हो गया!',

    // Auto-Save
    autoSaved: 'ऑटो-सेव सुरक्षित',
    draftRestored: 'आपके पिछले लक्षण पुनर्स्थापित किए गए',
    clearDraft: 'ड्राफ्ट हटाएं',

    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    viewAll: 'सभी देखें',
    callNow: 'अभी कॉल करें',
    getDirections: 'रास्ता देखें',

    // Geolocation & PHC Transit Locator
    nearestPhcTitle: 'निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC)',
    detectingLocation: 'वर्तमान जीपीएस स्थान खोजा जा रहा है...',
    gpsActive: 'सक्रिय लाइव जीपीएस स्थान',
    gpsDenied: 'जीपीएस अनुमति नहीं मिली - डिफ़ॉल्ट गांव चुना गया',
    refreshLocation: 'स्थान रिफ्रेश करें',
    walkingDistance: 'पैदल दूरी',
    walkingTime: 'पैदल समय',
    vehicleTime: 'वाहन / ऑटो समय',
    ambulanceTime: '108 एम्बुलेंस आपातकालीन समय',
    walkRoute: 'पैदल रास्ता (Google Maps)',
    driveRoute: 'वाहन रास्ता',
    phcEmergencyServices: '24x7 आपातकालीन सेवा व दवाएं',
    listenDirections: 'रास्ता आवाज में सुनें',
    usePresetLocation: 'गांव का स्थान चुनें',
  },

  en: {
    appName: 'Rural Health Monitoring AI',
    tagline: 'Multilingual Rural Health Monitoring & Voice Assistant',
    onlineStatus: 'Online Mode Connected',
    offlineStatus: 'Offline Mode Active (Data Saved)',
    syncNow: 'Sync Data Now',
    dataSyncedSuccess: 'Health data updated successfully!',
    selectLanguage: 'Select Language',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    english: 'English',
    roleVillager: 'Villager / Household',
    roleAsha: 'ASHA Worker',
    roleDoctor: 'PHC Doctor',

    navDashboard: 'Dashboard',
    navChatbot: 'AI Chatbot',
    navVoiceAssistant: 'Voice Assistant',
    navSymptomChecker: 'Symptom Checker',
    navReminders: 'Medicine Reminders',
    navEmergency: 'Emergency SOS',
    navLocator: 'Healthcare Locator',
    navEducation: 'Health Education',
    navPrescriptions: 'Prescription Vault',
    navAshaTools: 'ASHA Tools',
    navAnalytics: 'Health Trends',

    tapToSpeak: 'Tap to Speak',
    listening: 'Listening... Speak now',
    thinking: 'Thinking...',
    speaking: 'Speaking response...',
    stopVoice: 'Stop Voice',
    wakeWordHelp: 'Or say "Hello Rural Health AI"',
    attachPrescription: 'Attach Prescription Photo',
    typeMessagePlaceholder: 'Type your health question...',
    quickQuestionsTitle: 'Quick Health Topics:',
    chatbotTitle: 'Health AI Chatbot',
    chatbotSubtitle: 'Instant health assistance via text typing or voice assistant',
    voiceTyping: 'Voice Typing Dictation',
    clearChat: 'Clear Chat History',

    healthSummary: 'Health Vitals Summary',
    familyMembers: 'Family Member Profiles',
    addFamilyMember: 'Add Member',
    deleteFamilyMember: 'Delete Member',
    confirmDeleteFamilyMember: 'Are you sure you want to delete this family member from your health records?',
    healthQrCard: 'Digital Health QR Card',
    scanPatientQr: 'Scan Patient Health QR',
    qrScanSuccess: 'Patient profile retrieved successfully',
    patientHistory: 'Comprehensive Patient History',
    downloadQr: 'Download QR Card',
    printHealthCard: 'Print Health Card',
    ashaVisitNotes: 'ASHA Field Visit Records',
    addVisitNote: 'Log Visit Note',
    referToDoctor: 'Refer to PHC Doctor',
    logVitals: 'Log BP & Sugar Vitals',
    bp: 'Blood Pressure (BP)',
    bloodSugar: 'Blood Sugar',
    pulseRate: 'Pulse Rate',
    spo2: 'Blood Oxygen (SpO2)',
    temperature: 'Body Temperature',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    bmi: 'BMI Index',
    normal: 'Normal',
    high: 'High',
    low: 'Low',

    sosButton: 'Emergency SOS',
    sosSubtext: 'Instantly alerts 108 Ambulance and family contacts',
    call108Ambulance: 'Call 108 Ambulance',
    nearbyHospitals: 'Nearby Hospitals & PHCs',
    firstAidTitle: 'Emergency First Aid Guide',
    shareLocation: 'Share Live Location',
    snakeBiteGuide: 'Snake Bite First Aid',
    dogBiteGuide: 'Rabies / Dog Bite Care',
    heatStrokeGuide: 'Heat Stroke Prevention',
    dehydrationGuide: 'ORS Preparation Guide',

    todaysMedicines: "Today's Medicine Schedule",
    takeMedicine: 'Mark Taken',
    taken: 'Taken',
    missedAlert: 'Missed Medicine Alert!',
    addReminder: 'Add Medicine Reminder',
    readAloud: 'Read Aloud',

    pregnancyTracker: 'Pregnancy Tracker',
    childVaccination: 'Child Vaccination Schedule',
    dueSoon: 'Due Soon',
    overdue: 'Overdue',
    completed: 'Completed',

    highContrast: 'High Contrast',
    textSize: 'Text Size',
    voiceGuide: 'Voice Guidance',

    // Export & Share
    exportReport: 'Export Clinical Report',
    exportPdf: 'Export PDF',
    exportText: 'Export Text (.txt)',
    shareWithDoctor: 'Share with Healthcare Professional',
    downloadPdf: 'Download PDF',
    downloadText: 'Download Text',
    copySummary: 'Copy Clinical Summary',
    copiedSuccess: 'Copied to clipboard!',

    // Auto-Save
    autoSaved: 'Auto-saved to device',
    draftRestored: 'Restored symptoms from your previous session',
    clearDraft: 'Clear Draft',

    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    viewAll: 'View All',
    callNow: 'Call Now',
    getDirections: 'Get Directions',

    // Geolocation & PHC Transit Locator
    nearestPhcTitle: 'Nearest Primary Health Centre (PHC)',
    detectingLocation: 'Detecting your GPS coordinates...',
    gpsActive: 'Live GPS Coordinates Active',
    gpsDenied: 'GPS unavailable / permission denied - using village preset',
    refreshLocation: 'Refresh Location',
    walkingDistance: 'Walking Distance',
    walkingTime: 'Walking Time',
    vehicleTime: 'Vehicle / Auto Time',
    ambulanceTime: '108 Ambulance Transit Time',
    walkRoute: 'Walking Route (Google Maps)',
    driveRoute: 'Driving Route',
    phcEmergencyServices: '24x7 Emergency Services & Medicines',
    listenDirections: 'Listen to Directions',
    usePresetLocation: 'Select Village Center',
  },
  multi: {
    appName: 'రూరల్ హెల్త్ మానిటరింగ్ ఏఐ / Rural Health Monitoring AI',
    tagline: 'బహుభాషా ఆరోగ్య రక్షణ / Multilingual Health AI (తెలుగు | हिन्दी | English)',
    onlineStatus: 'ఆన్‌లైన్ / Online',
    offlineStatus: 'ఆఫ్‌లైన్ / Offline',
    syncNow: 'డేటా సింక్ / Sync Data',
    dataSyncedSuccess: 'డేటా సింక్ అయింది! / Data Synced!',
    selectLanguage: 'భాషలు / Languages',
    telugu: 'తెలుగు',
    hindi: 'हिन्दी',
    english: 'English',
    roleVillager: 'గ్రామస్థులు / Villager',
    roleAsha: 'ఆశా వర్కర్ / ASHA Worker',
    roleDoctor: 'డాక్టర్ / PHC Doctor',

    navDashboard: 'హోమ్ / Home',
    navChatbot: 'ఏఐ చాట్‌బాట్ / AI Chatbot',
    navVoiceAssistant: 'వాయిస్ సహాయకుడు / Voice AI',
    navSymptomChecker: 'లక్షణాలు / Symptoms',
    navReminders: 'మందుల గుర్తుచేయునది / Reminders',
    navEmergency: 'అత్యవసరం / SOS',
    navLocator: 'ఆసుపత్రులు / Hospitals',
    navEducation: 'పాఠాలు / Education',
    navPrescriptions: 'మందుల చీటీలు / Prescriptions',
    navAshaTools: 'ఆశా టూల్స్ / ASHA Tools',
    navAnalytics: 'విశ్లేషణ / Analytics',

    tapToSpeak: 'మాట్లాడటానికి నొక్కండి / Tap to Speak',
    listening: 'వింటున్నాను... / Listening...',
    thinking: 'ఆలోచిస్తున్నాను... / Thinking...',
    speaking: 'సమాధానం చెప్తున్నాను... / Speaking...',
    stopVoice: 'వాయిస్ ఆపు / Stop Voice',
    wakeWordHelp: '"హలో రూరల్ హెల్త్" అని చెప్పండి / Say "Hello Rural Health AI"',
    attachPrescription: 'ఫోటో జతచేయండి / Attach Photo',
    typeMessagePlaceholder: 'తెలుగు, ఇంగ్లీష్ లేదా హిందీలో టైప్ చేయండి / Type in Telugu, English or Hindi...',
    quickQuestionsTitle: 'సాధారణ ప్రశ్నలు / Quick Questions:',
    chatbotTitle: 'ఆరోగ్య ఏఐ చాట్‌బాట్ / Health AI Chatbot',
    chatbotSubtitle: 'టైపింగ్ లేదా వాయిస్ ద్వారా ఆరోగ్య సలహాలు / Health guidance via Text & Voice',
    voiceTyping: 'వాయిస్ టైపింగ్ / Voice Typing',
    clearChat: 'చాట్ చరిత్ర తీసివేయి / Clear Chat',

    healthSummary: 'ఆరోగ్య వివరాలు / Health Summary',
    familyMembers: 'కుటుంబ సభ్యులు / Family Members',
    addFamilyMember: 'సభ్యుడిని చేర్చండి / Add Member',
    deleteFamilyMember: 'సభ్యుడిని తొలగించండి / Delete Member',
    confirmDeleteFamilyMember: 'ఈ కుటుంబ సభ్యుడిని తొలగించాలనుకుంటున్నారా? / Delete this family member?',
    healthQrCard: 'డిజిటల్ హెల్త్ QR / Health QR Card',
    scanPatientQr: 'QR స్కాన్ చేయండి / Scan Patient QR',
    qrScanSuccess: 'వివరాలు పొందబడ్డాయి / Profile Retrieved',
    patientHistory: 'ఆరోగ్య రికార్డు / Patient History',
    downloadQr: 'QR డౌన్‌లోడ్ / Download QR',
    printHealthCard: 'కార్డ్ ప్రింట్ / Print Card',
    ashaVisitNotes: 'ఆశా విజిట్ నోట్స్ / Visit Notes',
    addVisitNote: 'నోట్ నమోదు / Add Visit Note',
    referToDoctor: 'డాక్టర్‌కు రిఫర్ / Refer to Doctor',
    logVitals: 'బిపి, షుగర్ నమోదు / Log Vitals',
    bp: 'రక్తపోటు (BP)',
    bloodSugar: 'బ్లడ్ షుగర్ / Sugar',
    pulseRate: 'పల్స్ / Pulse Rate',
    spo2: 'SpO2 ఆక్సిజన్',
    temperature: 'ఉష్ణోగ్రత / Temperature',
    weight: 'బరువు / Weight (kg)',
    height: 'ఎత్తు / Height (cm)',
    bmi: 'BMI',
    normal: 'నార్మల్ / Normal',
    high: 'ఎక్కువ / High',
    low: 'తక్కువ / Low',

    sosButton: 'అత్యవసర SOS',
    sosSubtext: '108 ఆంబులెన్స్ పిలుస్తుంది / Calls 108 Ambulance',
    call108Ambulance: '108 కాల్ చేయి / Call 108',
    nearbyHospitals: 'దగ్గరలోని ఆసుపత్రులు / Nearby Hospitals',
    firstAidTitle: 'ప్రథమ చికిత్స / Emergency First-Aid',
    shareLocation: 'స్థానం పంపు / Share Location',
    snakeBiteGuide: 'పాము కాటు చికిత్స / Snake Bite First-Aid',
    dogBiteGuide: 'పిచ్చి కుక్క కాటు / Dog Bite First-Aid',
    heatStrokeGuide: 'వడదెబ్బ జాగ్రత్తలు / Heat Stroke Guide',
    dehydrationGuide: 'ORS తయారుచేసే విధానం / ORS Preparation',

    todaysMedicines: "Today's Medicine Schedule",
    takeMedicine: 'మందు వేసుకోండి / Take Medicine',
    taken: 'వేసుకున్నాను / Taken',
    missedAlert: 'మందు వేసుకోలేదు / Missed Medicine',
    addReminder: 'రిమైండర్ చేర్చండి / Add Reminder',
    readAloud: 'చదివి వినిపించు / Read Aloud',

    pregnancyTracker: 'గర్భిణీ సంరక్షణ / Pregnancy Tracker',
    childVaccination: 'పిల్లల టీకాలు / Child Vaccination',
    dueSoon: 'త్వరలో ఇవ్వాలి / Due Soon',
    overdue: 'ఆలస్యమైంది / Overdue',
    completed: 'పూర్తయింది / Completed',

    highContrast: 'హై కాంట్రాస్ట్ / High Contrast',
    textSize: 'అక్షరాల సైజు / Text Size',
    voiceGuide: 'వాయిస్ గైడ్ / Voice Guide',

    // Export & Share
    exportReport: 'రిపోర్ట్ ఎగుమతి / Export Report',
    exportPdf: 'PDF డౌన్‌లోడ్ / Download PDF',
    exportText: 'టెక్స్ట్ ఫైల్ / Text File (.txt)',
    shareWithDoctor: 'డాక్టర్‌తో షేర్ చేయండి / Share with Doctor',
    downloadPdf: 'PDF డౌన్‌లోడ్ / Download PDF',
    downloadText: 'టెక్స్ట్ డౌన్‌లోడ్ / Download Text',
    copySummary: 'కాపీ సారాంశం / Copy Summary',
    copiedSuccess: 'కాపీ అయింది! / Copied to Clipboard!',

    // Auto-Save
    autoSaved: 'ఆటో-సేవ్ / Auto-saved',
    draftRestored: 'పునరుద్ధరించబడింది / Draft Restored',
    clearDraft: 'డ్రాఫ్ట్ క్లియర్ / Clear Draft',

    save: 'సేవ్ చేయి / Save',
    cancel: 'రద్దు చేయి / Cancel',
    delete: 'తొలగించు / Delete',
    viewAll: 'అన్నీ చూడండి / View All',
    callNow: 'కాల్ చేయి / Call Now',
    getDirections: 'రూట్ / Get Directions',

    // Geolocation & PHC Transit Locator
    nearestPhcTitle: 'సమీప ప్రాథమిక ఆరోగ్య కేంద్రం / Nearest PHC',
    detectingLocation: 'లొకేషన్ వెతుకుతోంది / Detecting GPS...',
    gpsActive: 'లైవ్ GPS యాక్టివ్ / Live GPS Active',
    gpsDenied: 'GPS లేదు / GPS Unavailable',
    refreshLocation: 'రీఫ్రెష్ / Refresh Location',
    walkingDistance: 'నడక దూరం / Walking Distance',
    walkingTime: 'నడక సమయం / Walking Time',
    vehicleTime: 'వాహనం సమయం / Vehicle Time',
    ambulanceTime: '108 అంబులెన్స్ / 108 Ambulance Time',
    walkRoute: 'నడక దారి / Walking Route',
    driveRoute: 'వాహనం దారి / Driving Route',
    phcEmergencyServices: '24x7 ఎమర్జెన్సీ / 24x7 Emergency Services',
    listenDirections: 'వినండి / Listen Directions',
    usePresetLocation: 'గ్రామం ఎంచుకోండి / Select Village',
  },
};
