import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

// Lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest'];

async function callGeminiChat(contents: any, systemInstruction: string) {
  const client = getGeminiClient();
  if (!client) return null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.4,
          },
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`Gemini chat model [${model}] attempt ${attempt} warning:`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
  return null;
}

async function callGeminiOCR(cleanBase64: string, mimeType: string, prompt: string) {
  const client = getGeminiClient();
  if (!client) return null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await client.models.generateContent({
          model,
          contents: {
            parts: [
              { inlineData: { mimeType, data: cleanBase64 } },
              { text: prompt },
            ],
          },
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`Gemini OCR model [${model}] attempt ${attempt} warning:`, err?.message || err);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }
  return null;
}

// Convert 24kHz 1-channel 16-bit LE PCM to WAV Buffer
function pcmToWav(pcmData: Buffer, sampleRate = 24000, channels = 1): Buffer {
  const byteRate = sampleRate * channels * 2;
  const blockAlign = channels * 2;
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // 16-bit

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  pcmData.copy(buffer, 44);
  return buffer;
}

const ttsAudioCache = new Map<string, string>();
let ttsCooldownUntil = 0;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '20mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Rural Health Monitoring AI', version: '1.0.0' });
  });

  // Dedicated AI Symptom & Pain Analysis Endpoint
  app.post('/api/health-ai/analyze-symptoms', async (req, res) => {
    try {
      const {
        textInput = '',
        bodyPains = [],
        quickSymptoms = [],
        language = 'te',
      } = req.body;

      const hasEmergency = checkStrictEmergency(textInput, bodyPains, quickSymptoms);

      const langNames: Record<string, string> = {
        te: 'Telugu (తెలుగు)',
        hi: 'Hindi (हिन्दी)',
        en: 'English',
        multi: 'Multiple Languages (Telugu, Hindi & English)',
      };
      const selectedLangName = langNames[language] || 'Telugu';

      // Assemble full symptom description
      const painDescriptions = bodyPains.map(
        (p: any) =>
          `${p.partName} (${p.partNameTe || ''} / ${p.partNameHi || ''}): ${p.painType} pain, severity: ${p.severity}, duration: ${p.duration}${p.notes ? `, note: ${p.notes}` : ''}`
      );

      const combinedText = [
        textInput ? `User Statement: "${textInput}"` : '',
        quickSymptoms.length > 0 ? `Selected Symptoms: ${quickSymptoms.join(', ')}` : '',
        painDescriptions.length > 0 ? `Body Pain Locations:\n${painDescriptions.join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      if (!combinedText.trim()) {
        return res.status(400).json({ error: 'No symptoms or pain details provided.' });
      }

      const prompt = `You are a clinical AI health assistant analyzing symptoms and human body pain points.
Target Language for all responses: ${selectedLangName}.

User's Symptom & Pain Description:
${combinedText}

${
  hasEmergency
    ? 'CRITICAL NOTE: Emergency red flags were detected (e.g., chest pain, breathing difficulty, severe bleeding, stroke signs, unconsciousness, severe pain). You MUST set urgencyLevel to "emergency" and recommend calling 108 Ambulance immediately.'
    : ''
}

Analyze the symptoms and return ONLY a valid JSON object strictly matching this schema with NO markdown ticks or other text:
{
  "symptomsDetected": ["string array of detected symptoms in ${selectedLangName}"],
  "possibleCauses": [
    {
      "condition": "Name of general condition in ${selectedLangName}",
      "description": "Simple 1-2 sentence explanation of why this condition may occur, in ${selectedLangName}",
      "probability": "possible" // or "likely" or "rare"
    }
  ],
  "urgencyLevel": "${hasEmergency ? 'emergency' : 'low'}", // must be one of: "low", "medium", "high", "emergency"
  "generalGuidance": ["3-4 clear, safe, non-medicinal general self-care or safety tips in ${selectedLangName}"],
  "recommendedAction": {
    "actionType": "${hasEmergency ? 'call_ambulance' : 'visit_doctor'}", // one of: "monitor_home", "visit_doctor", "seek_urgent_care", "call_ambulance"
    "label": "Short action label in ${selectedLangName}",
    "explanation": "Clear explanation of whether to monitor at home, visit PHC doctor, or seek urgent care, in ${selectedLangName}"
  },
  "isEmergency": ${hasEmergency ? 'true' : 'false'},
  "emergencyAlertText": "EMERGENCY: Please seek immediate medical assistance.",
  "disclaimer": "This AI assistant provides general health information and is not a replacement for a qualified doctor.",
  "spokenSummary": "A warm, natural 2-3 sentence speech summary in ${selectedLangName} that will be spoken aloud to the patient by the voice assistant."
}`;

      let aiResult: any = null;

      if (process.env.GEMINI_API_KEY) {
        try {
          const contents = [{ role: 'user', parts: [{ text: prompt }] }];
          const responseText = await callGeminiChat(
            contents,
            'You are an expert multilingual medical triage AI. Always return strict valid JSON.'
          );

          if (responseText) {
            const cleanJson = responseText
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            aiResult = JSON.parse(cleanJson);
          }
        } catch (err) {
          console.warn('Gemini symptom analysis error, falling back to rule engine:', err);
        }
      }

      if (!aiResult) {
        aiResult = generateRuleBasedSymptomAnalysis(
          textInput,
          bodyPains,
          quickSymptoms,
          language,
          hasEmergency
        );
      }

      // Ensure mandatory disclaimer
      aiResult.disclaimer =
        'This AI assistant provides general health information and is not a replacement for a qualified doctor.';

      if (hasEmergency) {
        aiResult.urgencyLevel = 'emergency';
        aiResult.isEmergency = true;
        aiResult.emergencyAlertText =
          language === 'te'
            ? 'అత్యవసర హెచ్చరిక: దయచేసి వెంటనే 108 ఆంబులెన్స్ లేదా అత్యవసర వైద్య సహాయాన్ని సంప్రదించండి.'
            : language === 'hi'
            ? 'आपातकालीन अलर्ट: कृपया तुरंत 108 एम्बुलेंस या आपातकालीन चिकित्सा सहायता लें।'
            : 'EMERGENCY: Please seek immediate medical assistance.';
      }

      aiResult.timestamp = new Date().toISOString();
      res.json(aiResult);
    } catch (error: any) {
      console.error('Error analyzing symptoms:', error);
      const fallback = generateRuleBasedSymptomAnalysis(
        req.body?.textInput || '',
        req.body?.bodyPains || [],
        req.body?.quickSymptoms || [],
        req.body?.language || 'te',
        checkStrictEmergency(req.body?.textInput || '', req.body?.bodyPains || [], req.body?.quickSymptoms || [])
      );
      res.json(fallback);
    }
  });

  // AI Chat and Health Assistant endpoint
  app.post('/api/health-ai/chat', async (req, res) => {
    try {
      const {
        message,
        language = 'te', // 'te', 'hi', 'en', or 'multi'
        conversationHistory = [],
        userProfile = {},
        offlineContext = false,
      } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const hasTelugu = /[\u0C00-\u0C7F]/.test(message);
      const hasHindi = /[\u0900-\u097F]/.test(message);
      const hasEnglish = /[a-zA-Z]/.test(message);
      const detectedInputLang = hasTelugu ? 'Telugu' : hasHindi ? 'Hindi' : hasEnglish ? 'English' : 'Unknown';

      const isMultiLanguageRequest =
        language === 'multi' ||
        /multiple|multi|languages|telugu.*english|english.*telugu|hindi.*telugu|all languages|మూడు భాషలలో|అన్ని భాషలు|తెలుగు ఇంగ్లీష్|हिंदी अंग्रेजी/i.test(
          message
        );

      const langNames: Record<string, string> = {
        te: 'Telugu (తెలుగు)',
        hi: 'Hindi (हिन्दी)',
        en: 'English',
        multi: 'Multiple Languages (Telugu, Hindi & English)',
      };

      const selectedLangName = langNames[language] || 'Telugu, Hindi & English';

      const systemInstruction = `You are "Gram Health AI", a compassionate, reliable, and multilingual AI Rural Health Assistant built for villagers, farmers, elderly people, pregnant women, and ASHA/ANM health workers in rural India.

CRITICAL MEDICAL & DISEASE KNOWLEDGE BASE RESPONSE GUIDELINES:
For any disease, condition, symptom, or health inquiry (covering Infectious, Respiratory, Heart/BP, Diabetes/Thyroid, Kidney, Digestive, Brain/Nervous, Bone/Joint, Skin, Eye, ENT, Women's Health, Children's Health, Mental Health, Cancer, Emergency, and Nutrition/Deficiencies), provide information using the following 12 clear, easy-to-read sections in simple language:

1. **Disease Name / వ్యాధి పేరు / बीमारी का नाम**
2. **What is the disease? (Overview) / వివరణ**
3. **Common Symptoms / ప్రధాన లక్షణాలు**
4. **Possible Causes / సాధ్యమయ్యే కారణాలు**
5. **Risk Factors / ప్రమాద కారకాలు**
6. **Prevention Tips / నివారణ జాగ్రత్తలు**
7. **Home Care (Self-care) / ఇంటి వద్ద తీసుకోదగిన జాగ్రత్తలు**
8. **When to See a Doctor / డాక్టర్‌ను ఎప్పుడు సంప్రదించాలి**
9. **Emergency Warning Signs / అత్యవసర ప్రమాద హెచ్చరికలు**
10. **Recommended Medical Tests / సూచించదగిన వైద్య పరీక్షలు**
11. **Basic Treatment Overview / చికిత్స విధానం (మందుల మోతాదులు రాయవద్దు)**
12. **Frequently Asked Questions (FAQs) / తరచుగా అడిగే ప్రశ్నలు**

CRITICAL LANGUAGE & RESPONSE RULES:
1. ${
  isMultiLanguageRequest
    ? `The user requested answer in MULTIPLE LANGUAGES (Telugu, Hindi, and English).
      You MUST provide your complete medical answer clearly structured in ALL THREE languages using distinct headings:

      🇮🇳 **తెలుగు (Telugu):**
      [Simple, clear, warm Telugu response with 12 structured points above]

      🇮🇳 **हिन्दी (Hindi):**
      [Simple, clear, warm Hindi response with 12 structured points above]

      🇬🇧 **English:**
      [Simple, clear, warm English response with 12 structured points above]`
    : `Speak in warm, respectful, extremely simple, easy-to-understand language.
      Detected input script: ${detectedInputLang}.
      Regardless of the input script, you MUST FORCE and TRANSLATE your final answer into ${selectedLangName} so the response perfectly matches the user's selected interface language!`
}
2. NEVER claim to replace a doctor or give definitive medical diagnoses.
3. NEVER prescribe exact medication dosages. Frame treatment as basic clinical steps (e.g. hydration, doctor consultation, antibiotics only if prescribed by doctor).
4. Always include a short disclaimer reminding them that this information is educational and not a substitute for a qualified doctor or Primary Health Centre (PHC) / ASHA worker visit.
5. EMERGENCY RED FLAGS:
   - If the user describes severe symptoms like chest pain, severe breathing difficulty, sudden weakness/paralysis, severe bleeding, snake bite, dog bite, poisoning, loss of consciousness, heat stroke, or high fever with seizures in children:
   - IMMEDIATELY state clearly in bold capital warning: "🚨 EMERGENCY ALERT / అత్యవసర హెచ్చరిక / आपातकालीन अलर्ट"
   - Instruct them to call 108 Ambulance immediately or go to the nearest Hospital/PHC right away!
   - Give 2-3 immediate emergency first-aid survival steps.
6. Provide actionable rural self-care tips (hydration, ORS for diarrhea, sponge bath for fever, clean boiled water, rest, nutritious local food).

User Context:
- Role: ${userProfile.role || 'Villager / Family'}
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Location: Rural Community Health Zone
- Offline context requested: ${offlineContext ? 'Yes (Include basic offline guide tips)' : 'No'}
`;

      const formattedHistory = conversationHistory.map((item: any) => ({
        role: item.sender === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }],
      }));

      const contents = [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ];

      let responseText = await callGeminiChat(contents, systemInstruction);
      let isFallback = false;

      if (!responseText) {
        responseText = getOfflineFallbackResponse(message, language);
        isFallback = true;
      }

      const isEmergency =
        checkEmergencyKeywords(message) ||
        responseText.includes('EMERGENCY') ||
        responseText.includes('అత్యవసర') ||
        responseText.includes('आपातकालीन');

      res.json({
        text: responseText,
        language,
        isEmergency,
        summary: responseText.slice(0, 120),
        isFallback,
      });
    } catch (error: any) {
      console.error('Gemini Chat API Error:', error);
      const lang = req.body?.language || 'te';
      const fallback = getOfflineFallbackResponse(req.body?.message || '', lang);
      res.json({
        text: fallback,
        language: lang,
        isEmergency: checkEmergencyKeywords(req.body?.message || ''),
        summary: fallback.slice(0, 120),
        isFallback: true,
      });
    }
  });

  // Dedicated AI Speech / Text-to-Speech Endpoint (High-fidelity Telugu, Hindi & English)
  app.post('/api/health-ai/tts', async (req, res) => {
    try {
      const { text, language = 'te', voiceName = 'Kore' } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text is required for TTS' });
      }

      // Clean text for speech
      let cleanText = text
        .replace(/[\*\_~`#]/g, '')
        .replace(/🚨|🩺|⚠️|📊|💡|🏥|📋|🔗|💊/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/http[s]?:\/\/\S+/g, '')
        .replace(/\n+/g, '. ')
        .trim();

      // Telugu phonetic & rural dialect normalization for accurate healthcare TTS pronunciation
      if (language === 'te') {
        cleanText = cleanText
          .replace(/\b108\b/g, 'నూరు ఎనిమిది (108)')
          .replace(/\b104\b/g, 'నూరు నాలుగు (104)')
          .replace(/\bPHC\b/gi, 'పీహెచ్‌సీ ప్రాథమిక ఆరోగ్య కేంద్రం')
          .replace(/\bCHC\b/gi, 'సామాజిక ఆరోగ్య కేంద్రం')
          .replace(/\bASHA\b/gi, 'ఆశా కార్యకర్త')
          .replace(/\bANM\b/gi, 'ఏఎన్‌ఎం ఆరోగ్య కార్యకర్త')
          .replace(/\bBP\b/gi, 'బీపీ రక్తపోటు')
          .replace(/\bSugar\b/gi, 'షుగర్ మధుమేహం')
          .replace(/\bORS\b/gi, 'ఓఆర్ఎస్ ద్రవం')
          .replace(/\bANC\b/gi, 'గర్భిణీ పరీక్ష')
          .replace(/\bDoctor\b/gi, 'డాక్టర్ గారు')
          .replace(/\bHospital\b/gi, 'ఆసుపత్రి')
          .replace(/\bTablet\b/gi, 'మాత్ర')
          .replace(/\bTablets\b/gi, 'మాత్రలు')
          .replace(/\bCapsule\b/gi, 'క్యాప్సూల్')
          .replace(/\bInjection\b/gi, 'సూది ఇంజక్షన్')
          .replace(/\bParacetamol\b/gi, 'పారాసిటమాల్')
          .replace(/\bmg\b/gi, 'మిల్లీగ్రాములు')
          .replace(/\bml\b/gi, 'మిల్లీలీటర్లు')
          .replace(/\bFever\b/gi, 'జ్వరం')
          .replace(/\bCold\b/gi, 'జలుబు')
          .replace(/\bCough\b/gi, 'దగ్గు');
      }

      // Limit to 450 characters for responsive playback
      const speechPrompt = cleanText.length > 450 ? cleanText.slice(0, 445) + '...' : cleanText;
      const cacheKey = `${language}_${voiceName}_${speechPrompt.slice(0, 100)}`;

      if (ttsAudioCache.has(cacheKey)) {
        return res.json({
          success: true,
          audioDataUrl: ttsAudioCache.get(cacheKey),
          language,
          cached: true,
        });
      }

      // Circuit breaker: if quota was exceeded recently, bypass remote API call and fall back instantly to client voice
      if (Date.now() < ttsCooldownUntil) {
        return res.json({
          success: false,
          fallbackToBrowser: true,
          inCooldown: true,
        });
      }

      const client = getGeminiClient();
      if (!client) {
        return res.json({ success: false, fallbackToBrowser: true });
      }

      const response = await client.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text: speechPrompt }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.[0];
      const pcmBase64 = audioPart?.inlineData?.data;

      if (!pcmBase64) {
        return res.json({ success: false, fallbackToBrowser: true });
      }

      const pcmBuffer = Buffer.from(pcmBase64, 'base64');
      const wavBuffer = pcmToWav(pcmBuffer, 24000, 1);
      const audioDataUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;

      // Keep cache size bounded
      if (ttsAudioCache.size > 80) {
        const firstKey = ttsAudioCache.keys().next().value;
        if (firstKey) ttsAudioCache.delete(firstKey);
      }
      ttsAudioCache.set(cacheKey, audioDataUrl);

      res.json({
        success: true,
        audioDataUrl,
        language,
        cached: false,
      });
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isRateLimit =
        err?.status === 429 ||
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('RESOURCE_EXHAUSTED') ||
        errMsg.includes('Quota exceeded');

      if (isRateLimit) {
        // Set a 65-second cooldown so subsequent requests don't hit 429 or spam logs
        ttsCooldownUntil = Date.now() + 65000;
        return res.json({
          success: false,
          fallbackToBrowser: true,
          rateLimited: true,
        });
      }

      // Graceful fallback to client browser speech synthesis
      res.json({ success: false, fallbackToBrowser: true });
    }
  });

  // OCR and Document / Prescription Analysis endpoint
  app.post('/api/health-ai/ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', language = 'te', documentType = 'prescription' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'Image base64 data is required' });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const langNames: Record<string, string> = {
        te: 'Telugu (తెలుగు)',
        hi: 'Hindi (हिन्दी)',
        en: 'English',
        multi: 'Multiple Languages (Telugu, Hindi & English)',
      };

      const selectedLangName = langNames[language] || 'Telugu, Hindi & English';

      const prompt = `Analyze this medical document or photo (${documentType}). 
Explain the findings in simple, easy-to-understand ${selectedLangName} for a rural villager with low digital literacy.

Identify:
1. What is this image? (Prescription / Lab Report / Medicine Box / Skin Condition)
2. Medicines & Dosage (Name of medicine, timing: Morning/Afternoon/Night, before/after food).
3. Important Doctor Instructions or Lab Test Summary in simple terms.
4. Key warning signs or precautions.
5. Reminder to consult the doctor or PHC.

Format the response clearly with bullet points and bold text for medicine names and times so it can be read aloud easily.`;

      let analysisText = await callGeminiOCR(cleanBase64, mimeType, prompt);
      let isFallback = false;

      if (!analysisText) {
        analysisText = getFallbackOCRAnalysis(documentType, language);
        isFallback = true;
      }

      res.json({
        analysis: analysisText,
        language,
        isFallback,
      });
    } catch (error: any) {
      console.error('Gemini OCR API Error:', error);
      const lang = req.body?.language || 'te';
      res.json({
        analysis: getFallbackOCRAnalysis(req.body?.documentType || 'prescription', lang),
        language: lang,
        isFallback: true,
      });
    }
  });

  // Offline Sync and News/Alerts endpoint
  app.get('/api/offline-sync-data', (req, res) => {
    res.json({
      lastUpdated: new Date().toISOString(),
      diseaseAlerts: [
        {
          id: 'alert-1',
          title: 'Monsoon Dengue & Malaria Alert',
          titleTe: 'వర్షాకాలం డెంగ్యూ & మలేరియా జాగ్రత్తలు',
          titleHi: 'मानसून डेंगू और मलेरिया अलर्ट',
          message: 'Ensure no stagnant water near homes. Use mosquito nets and drink boiled water.',
          messageTe: 'ఇళ్ల చుట్టూ నీరు నిల్వ ఉండకుండా చూడండి. దోమతెరలు వాడండి, కాచి చల్లార్చిన నీటిని తాగండి.',
          messageHi: 'घरों के आसपास पानी जमा न होने दें। मच्छरदानी का प्रयोग करें और उबला पानी पीएं।',
          severity: 'warning',
          date: new Date().toISOString().split('T')[0],
        },
        {
          id: 'alert-2',
          title: 'Free Health Camp at Mandal PHC',
          titleTe: 'మండల పి.హెచ్.సి వద్ద ఉచిత ఆరోగ్య శిబిరం',
          titleHi: 'मण्डल पीएचसी पर नि:शुल्क स्वास्थ्य शिविर',
          message: 'Free BP, Diabetes checkup and prenatal checkup for pregnant women this Friday.',
          messageTe: 'ఈ శుక్రవారం గర్భిణీ స్త్రీలకు ఉచిత బిపి, షుగర్ మరియు ప్రసవపూర్వ పరీక్షలు.',
          messageHi: 'इस शुक्रवार गर्भवती महिलाओं के लिए मुफ्त बीपी, शुगर और प्रसवपूर्व जांच।',
          severity: 'info',
          date: new Date().toISOString().split('T')[0],
        },
      ],
      seasonalTips: [
        {
          topic: 'Heat Stroke / వడదెబ్బ / लू से बचाव',
          tipTe: 'ఎండలో తిరిగేటప్పుడు మజ్జిగ, నిమ్మరసం, ఓ.ఆర్.ఎస్ తీసుకోండి.',
          tipHi: 'धूप में निकलने से पहले छाछ, नींबू पानी और ओआरएस पिएं।',
          tipEn: 'Drink buttermilk, lemon water, and ORS when going out in heat.',
        },
        {
          topic: 'Safe Drinking Water / సురక్షిత మంచినీరు / स्वच्छ पानी',
          tipTe: 'నీటిని 10 నిమిషాలు కాచి చల్లార్చి వడపోసి తాగండి.',
          tipHi: 'पानी को 10 मिनट उबालकर ठंडा करके पीएं।',
          tipEn: 'Boil water for 10 minutes, cool and strain before drinking.',
        },
      ],
    });
  });

  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rural Health Monitoring AI server running on http://0.0.0.0:${PORT}`);
  });
}

function checkEmergencyKeywords(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const keywords = [
    'snake', 'bite', 'chest pain', 'bleeding', 'breath', 'unconscious', 'poison',
    'పాము', 'కాటు', 'గుండె నెప్పి', 'రక్తం', 'శ్వాస', 'స్పృహ', 'విషం', 'వడదెబ్బ',
    'सांप', 'काटना', 'सीने में दर्द', 'खून', 'सांस', 'बेहोश', 'जहर'
  ];
  return keywords.some(k => lower.includes(k));
}

function getOfflineFallbackResponse(message: string, lang: string): string {
  const lower = message.toLowerCase();

  if (lang === 'multi' || /multiple|multi|languages|all languages/i.test(message)) {
    if (checkEmergencyKeywords(message)) {
      return `🚨 **EMERGENCY WARNING / అత్యవసర హెచ్చరిక / आपातकालीन अलर्ट!**

🇮🇳 **తెలుగు:**
మీరు చెప్పిన లక్షణాలు తీవ్రమైనవి కావచ్చు. దయచేసి వెంటనే **108 ఆంబులెన్స్** కు కాల్ చేయండి లేదా దగ్గరలోని ప్రాథమిక ఆరోగ్య కేంద్రానికి (PHC) వెళ్లండి!

🇮🇳 **हिन्दी:**
आपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत **108 एम्बुलेंस** को कॉल करें या निकटतम अस्पताल जाएं!

🇬🇧 **English:**
The symptoms described require immediate care. Please call **108 Ambulance** or go to the nearest Hospital / PHC right away!`;
    }

    if (lower.includes('fever') || lower.includes('జ్వరం') || lower.includes('बुखार')) {
      return `🏥 **Fever Self-Care Advice / జ్వరం సలహాలు / बुखार देखभाल:**

🇮🇳 **తెలుగు:**
జ్వరం తగ్గడానికి కాచి చల్లార్చిన నీటితో తడి గుడ్డ అద్దండి. ఓ.ఆర్.ఎస్ లేదా కొబ్బరి నీళ్ళు తాగండి. 2 రోజుల కంటే ఎక్కువ ఉంటే PHC డాక్టర్ ని కలవండి.

🇮🇳 **हिन्दी:**
बुखार कम करने के लिए साफ पानी की पट्टी रखें। ओआरएस पिएं। यदि 2 दिन से अधिक बुखार रहे तो पीएचसी डॉक्टर से मिलें।

🇬🇧 **English:**
Apply cold water sponge for fever. Stay hydrated with ORS. Consult PHC doctor if fever persists beyond 2 days.`;
    }

    return `🌐 **Gram Health AI Assistant (గ్రామ్ హెల్త్ ఏఐ):**

🇮🇳 **తెలుగు:**
నమస్తే! మీ ఆరోగ్య సమస్యను చెప్పండి. నేను మీకు తెలుగు, ఇంగ్లీష్ మరియు హిందీలలో సలహాలు ఇస్తాను.

🇮🇳 **हिन्दी:**
नमस्ते! अपनी स्वास्थ्य समस्या बताएं। मैं आपको तेलुगु, हिंदी और अंग्रेजी में जानकारी दूंगा।

🇬🇧 **English:**
Hello! Tell me your health concern. I can provide answers in Telugu, Hindi, and English.`;
  }

  if (checkEmergencyKeywords(message)) {
    if (lang === 'te') {
      return `🚨 **అత్యవసర హెచ్చరిక!**
మీరు చెప్పిన లక్షణాలు తీవ్రమైనవి కావచ్చు. దయచేసి వెంటనే **108 ఆంబులెన్స్** కు కాల్ చేయండి లేదా దగ్గరలోని ప్రాథమిక ఆరోగ్య కేంద్రానికి (PHC) లేదా ఆసుపత్రికి వెళ్లండి!

**వెంటనే చేయవలసిన ప్రథమ చికిత్స:**
1. రోగిని ప్రశాంతంగా పడుకోబెట్టండి.
2. కదలకుండా ఉంచండి.
3. ఏమీ తాపవద్దు. వెంటనే వాహనంలో ఆసుపత్రికి తరలించండి.`;
    } else if (lang === 'hi') {
      return `🚨 **आपातकालीन अलर्ट!**
आपके द्वारा बताए गए लक्षण गंभीर हो सकते हैं। कृपया तुरंत **108 एम्बुलेंस** को कॉल करें या निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) या अस्पताल जाएं!

**तुरंत किए जाने वाले प्राथमिक उपचार:**
1. मरीज को शांत रखें और लिटाएं।
2. हिलने-डुलने न दें।
3. तुरंत निकटतम अस्पताल ले जाएं।`;
    } else {
      return `🚨 **EMERGENCY WARNING!**
The symptoms you described require immediate emergency care. Please call **108 Ambulance** or go to the nearest Hospital / PHC right away!

**Immediate First-Aid Steps:**
1. Keep the person calm and still.
2. Do not offer food or heavy drinks.
3. Transport immediately to the emergency center.`;
    }
  }

  if (lower.includes('fever') || lower.includes('జ్వరం') || lower.includes('बुखार')) {
    if (lang === 'te') {
      return `గ్రామ్ హెల్త్ సలహా: జ్వరం తగ్గడానికి కాచి చల్లార్చిన నీటితో తడి గుడ్డ అద్దండి. తగినంత విశ్రాంతి తీసుకోండి, కొబ్బరి నీళ్ళు లేదా ఓ.ఆర్.ఎస్ తాగి శరీరాన్ని నిర్జలీకరణం కాకుండా చూసుకోండి. 2 రోజుల కంటే ఎక్కువ జ్వరం ఉంటే లేదా డెంగ్యూ/మలేరియా లక్షణాలు ఉంటే సమీప PHC డాక్టర్ లేదా ఆశా కార్యకర్తను సంప్రదించండి.`;
    } else if (lang === 'hi') {
      return `ग्राम हेल्थ सलाह: बुखार कम करने के लिए साफ पानी की पट्टी माथे पर रखें। पर्याप्त आराम करें और ओआरएस या नारियल पानी पिएं। यदि बुखार 2 दिन से अधिक रहता है तो तुरंत आशा कार्यकर्ता या प्राथमिक स्वास्थ्य केंद्र (PHC) के डॉक्टर से मिलें।`;
    } else {
      return `Gram Health Advice: For fever, apply cold water sponge to forehead. Rest well and drink ORS or warm water to stay hydrated. If fever lasts more than 2 days, consult your local PHC doctor or ASHA worker.`;
    }
  }

  if (lang === 'te') {
    return `నమస్తే! గ్రామ్ హెల్త్ ఏఐ మీ ఆరోగ్య రక్షణ కోసం సిద్ధంగా ఉంది. మీ సమస్యను లేదా లక్షణాలను స్పష్టంగా చెప్పండి లేదా మైక్రోఫోన్ ద్వారా మాట్లాడండి. తీవ్రమైన అనారోగ్య సమస్యలు ఉంటే తప్పక ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) డాక్టర్‌ను సంప్రదించండి.`;
  } else if (lang === 'hi') {
    return `नमस्ते! ग्राम हेल्थ एआई आपकी स्वास्थ्य देखभाल के लिए तैयार है। अपनी समस्या या लक्षण विस्तार से बताएं या माइक बटन दबाकर बोलें। किसी भी गंभीर स्थिति में निकटतम पीएचसी डॉक्टर से संपर्क करें।`;
  } else {
    return `Hello! Gram Health AI is ready to help with your health questions. Feel free to speak or type your symptoms. For persistent or severe health issues, always consult your nearest PHC doctor or ASHA worker.`;
  }
}

function checkStrictEmergency(
  textInput: string,
  bodyPains: any[] = [],
  quickSymptoms: string[] = []
): boolean {
  const text = (textInput || '').toLowerCase();

  const emergencyKeywords = [
    'severe chest pain',
    'chest hurting',
    'chest pressure',
    'chest pain',
    'heart attack',
    'difficulty breathing',
    'breathless',
    'shortness of breath',
    'cannot breathe',
    'gasping',
    'unconscious',
    'passed out',
    'fainted',
    'unresponsive',
    'severe bleeding',
    'bleeding heavily',
    'blood loss',
    'hemorrhage',
    'stroke',
    'face drooping',
    'slurred speech',
    'sudden weakness',
    'paralysis',
    'severe accident',
    'severe injury',
    'fracture',
    'head trauma',
    'snake bite',
    'poison',
    'cyanosis',
    'blue lips',
    'convulsion',
    'seizure',
    // Telugu
    'ఛాతీ నొప్పి',
    'గుండె నొప్పి',
    'గుండె నెప్పి',
    'ఛాతీ పట్టేయడం',
    'శ్వాస ఆడకపోవడం',
    'శ్వాస కష్టం',
    'ఆయాసం',
    'స్పృహ కోల్పోవడం',
    'సృహ తప్పడం',
    'తీవ్రమైన రక్తస్రావం',
    'రక్తం కారడం',
    'పక్షవాతం',
    'కాళ్ళు చేతులు పడిపోవడం',
    'పాము కాటు',
    'విషం',
    'తీవ్రమైన గాయం',
    'ప్రమాదం',
    'ఫిట్స్',
    // Hindi
    'सीने में दर्द',
    'छाती में दर्द',
    'सांस लेने में दिक्कत',
    'सांस फूलना',
    'बेहोश',
    'बेहोशी',
    'अचेत',
    'अधिक खून बहना',
    'रक्तस्राव',
    'लकवा',
    'अचानक कमजोरी',
    'गंभीर दुर्घटना',
    'गंभीर चोट',
    'सांप का काटना',
    'जहर',
    'दौरा',
  ];

  if (emergencyKeywords.some((kw) => text.includes(kw))) {
    return true;
  }

  if (quickSymptoms.some((s) => ['chest_pain', 'snake', 'breathless', 'unconscious'].includes(s))) {
    return true;
  }

  // Check body pains for high-risk flags
  for (const bp of bodyPains) {
    if (bp.id === 'chest' && (bp.severity === 'severe' || bp.painType === 'pressure' || bp.painType === 'sharp')) {
      return true;
    }
    if (bp.id === 'head' && bp.severity === 'severe' && bp.duration === 'few_hours') {
      return true;
    }
  }

  return false;
}

function generateRuleBasedSymptomAnalysis(
  textInput: string,
  bodyPains: any[] = [],
  quickSymptoms: string[] = [],
  language: string = 'te',
  isEmergency: boolean = false
): any {
  const text = (textInput || '').toLowerCase();

  // Determine detected symptoms
  const detected: string[] = [];
  if (textInput) detected.push(textInput.slice(0, 80));
  for (const p of bodyPains) {
    const label = language === 'te' ? p.partNameTe || p.partName : language === 'hi' ? p.partNameHi || p.partName : p.partName;
    detected.push(`${label} (${p.painType || 'pain'}, ${p.severity || 'moderate'})`);
  }
  for (const s of quickSymptoms) {
    detected.push(s.replace('_', ' '));
  }
  if (detected.length === 0) {
    detected.push(language === 'te' ? 'సాధారణ అసౌకర్యం' : language === 'hi' ? 'सामान्य अस्वस्थता' : 'General discomfort');
  }

  // Emergency scenario
  if (isEmergency) {
    if (language === 'te') {
      return {
        symptomsDetected: detected,
        possibleCauses: [
          {
            condition: 'తీవ్రమైన గుండె / శ్వాసకోశ అత్యవసర పరిస్థితి (Critical Cardiovascular / Respiratory Emergency)',
            description: 'ఛాతీ నొప్పి, శ్వాసలో ఇబ్బంది లేదా ఆకస్మిక బలహీనత తక్షణమే ఆసుపత్రి వైద్యుల పర్యవేక్షణ అవసరమైన గుండె లేదా రక్తనాళ సమస్యలను సూచిస్తాయి.',
            probability: 'likely',
          },
          {
            condition: 'తీవ్రమైన గాయం లేదా విషప్రభావం (Acute Trauma / Toxicity)',
            description: 'పాము కాటు, పక్షవాత లక్షణాలు లేదా తీవ్ర రక్తస్రావంలో ప్రతి క్షణం విలువైనది.',
            probability: 'possible',
          },
        ],
        urgencyLevel: 'emergency',
        generalGuidance: [
          'రోగిని వెంటనే ఒకచోట ప్రశాంతంగా పడుకోబెట్టండి. అనవసరంగా నడవనీయవద్దు.',
          'ఏ విధమైన ఆహారం, నీరు లేదా స్వంత మందులు ఇవ్వవద్దు.',
          'శ్వాస బాగా ఆడేందుకు దుస్తులను వదులు చేయండి మరియు గాలి వచ్చేలా ఉంచండి.',
          'వెంటనే 108 లేదా స్థానిక అంబులెన్స్‌కు సమాచారం అందించి దగ్గరలోని పెద్ద ఆసుపత్రికి తరలించండి.',
        ],
        recommendedAction: {
          actionType: 'call_ambulance',
          label: 'వెంటనే 108 ఆంబులెన్స్ పిలవండి (Call Ambulance Immediately)',
          explanation: 'ఈ లక్షణాలు అత్యవసర వైద్య పరిస్థితిని సూచిస్తున్నాయి. ఇంట్లో వేచి ఉండవద్దు, వెంటనే సమీప ఆసుపత్రి అత్యవసర విభాగానికి వెళ్ళండి.',
        },
        isEmergency: true,
        emergencyAlertText: 'అత్యవసర హెచ్చరిక: దయచేసి వెంటనే 108 ఆంబులెన్స్ లేదా అత్యవసర వైద్య సహాయాన్ని సంప్రదించండి.',
        disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
        spokenSummary: 'అత్యవసర హెచ్చరిక! మీరు చెప్పిన లక్షణాలు తీవ్రమైనవి. దయచేసి ఇంట్లో ఉండకుండా వెంటనే 108 ఆంబులెన్స్‌కు కాల్ చేసి ఆసుపత్రికి వెళ్ళండి.',
      };
    } else if (language === 'hi') {
      return {
        symptomsDetected: detected,
        possibleCauses: [
          {
            condition: 'आपातकालीन हृदय या श्वसन स्थिति (Critical Emergency)',
            description: 'सीने में दर्द, सांस लेने में तकलीफ या गंभीर कमजोरी तत्काल अस्पताल निगरानी की मांग करती है।',
            probability: 'likely',
          },
        ],
        urgencyLevel: 'emergency',
        generalGuidance: [
          'मरीज को तुरंत शांत लेटाएं, अनावश्यक हिलने-डुलने न दें।',
          'मुंह से कुछ भी खाने या पीने को न दें।',
          'कपड़ों को ढीला करें ताकि सांस आसानी से आ सके।',
          'तुरंत 108 एम्बुलेंस बुलाएं और निकटतम अस्पताल ले जाएं।',
        ],
        recommendedAction: {
          actionType: 'call_ambulance',
          label: 'तुरंत 108 एम्बुलेंस बुलाएं (Call Ambulance)',
          explanation: 'यह स्थिति अत्यंत गंभीर है। कृपया तुरंत 108 एम्बुलेंस को कॉल करें या निकटतम आपातकालीन केंद्र जाएं।',
        },
        isEmergency: true,
        emergencyAlertText: 'आपातकालीन अलर्ट: कृपया तुरंत 108 एम्बुलेंस या आपातकालीन चिकित्सा सहायता लें।',
        disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
        spokenSummary: 'आपातकालीन अलर्ट! आपके द्वारा बताए गए लक्षण अत्यंत गंभीर हैं। कृपया तुरंत 108 एम्बुलेंस बुलाएं और अस्पताल जाएं।',
      };
    } else {
      return {
        symptomsDetected: detected,
        possibleCauses: [
          {
            condition: 'Acute Cardiovascular or Respiratory Emergency',
            description: 'Severe chest pain, breathlessness, loss of consciousness, or sudden weakness require immediate emergency medical care.',
            probability: 'likely',
          },
        ],
        urgencyLevel: 'emergency',
        generalGuidance: [
          'Keep the patient resting calmly in a comfortable position; avoid exertion.',
          'Do not offer food, water, or unprescribed home medications.',
          'Loosen restrictive clothing and ensure unobstructed airway and ventilation.',
          'Call 108 / 911 / emergency services immediately for rapid transport to the nearest hospital.',
        ],
        recommendedAction: {
          actionType: 'call_ambulance',
          label: 'Call 108 Ambulance Immediately',
          explanation: 'Emergency symptoms detected. Do not delay or monitor at home; seek immediate hospital emergency care.',
        },
        isEmergency: true,
        emergencyAlertText: 'EMERGENCY: Please seek immediate medical assistance.',
        disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
        spokenSummary: 'Emergency alert! The described symptoms require immediate emergency care. Please call an ambulance or visit the nearest emergency hospital immediately.',
      };
    }
  }

  // Non-emergency standard symptom assessments
  const hasHead = bodyPains.some((p) => p.id === 'head') || text.includes('headache') || text.includes('తల') || text.includes('सिर');
  const hasStomach = bodyPains.some((p) => p.id === 'stomach') || text.includes('stomach') || text.includes('కడుపు') || text.includes('पेट');
  const hasBack = bodyPains.some((p) => p.id === 'back') || text.includes('back') || text.includes('నడుము') || text.includes('पीठ');
  const hasThroat = bodyPains.some((p) => p.id === 'throat') || text.includes('throat') || text.includes('గొంతు') || text.includes('गला');
  const hasFever = text.includes('fever') || text.includes('జ్వరం') || text.includes('बुखार') || quickSymptoms.includes('fever');

  let urgency: 'low' | 'medium' | 'high' = 'low';
  const hasSevere = bodyPains.some((p) => p.severity === 'severe');
  const hasModerate = bodyPains.some((p) => p.severity === 'moderate');
  if (hasSevere) urgency = 'high';
  else if (hasModerate || hasFever) urgency = 'medium';

  if (language === 'te') {
    return {
      symptomsDetected: detected,
      possibleCauses: [
        {
          condition: hasHead
            ? 'టెన్షన్ లేదా మైగ్రేన్ తలనొప్పి (Tension / Migraine Headache)'
            : hasStomach
            ? 'గ్యాస్ట్రిక్ సమస్య లేదా అజీర్ణం (Gastritis / Indigestion)'
            : hasBack
            ? 'కండరాల ఒత్తిడి లేదా నడుము నొప్పి (Muscle Strain / Lumbar Ache)'
            : hasThroat
            ? 'గొంతు ఇన్ఫెక్షన్ లేదా ఫారింజిటిస్ (Pharyngitis / Throat Irritation)'
            : 'సాధారణ అలసట లేదా వాతావరణ మార్పుల అసౌకర్యం',
          description: 'ఒత్తిడి, నిద్రలేమి, ఆహార మార్పులు లేదా సాధారణ అలసట వలన ఈ లక్షణాలు ప్రారంభమై ఉండవచ్చు.',
          probability: 'likely',
        },
        {
          condition: 'వైరల్ లేదా వాతావరణ మార్పుల ఇన్ఫెక్షన్ (Viral / Seasonal Flu)',
          description: 'శరీరంలో రోగనిరోధక శక్తి ప్రతిస్పందనగా తలనొప్పి, ఒళ్ళు నొప్పులు లేదా బలహీనత రావచ్చు.',
          probability: 'possible',
        },
      ],
      urgencyLevel: urgency,
      generalGuidance: [
        'కాచి చల్లార్చిన నీరు, ఓ.ఆర్.ఎస్ లేదా కొబ్బరి నీళ్ళు ఎక్కువగా తాగి శరీరాన్ని తేమగా ఉంచండి.',
        'కంటికి మరియు శరీరానికి తగినంత విశ్రాంతి (కనీసం 7-8 గంటలు) ఇవ్వండి.',
        'మసాలాలు మరియు నూనె పదార్థాలు తగ్గించి, తేలికగా జీర్ణమయ్యే ఆహారం (గంజి, పండ్లు) తీసుకోండి.',
        'వైద్యుల సలహా లేకుండా యాంటీబయాటిక్స్ లేదా అధిక మోతాదు నొప్పి నివారిణి మందులు వాడవద్దు.',
      ],
      recommendedAction: {
        actionType: urgency === 'high' ? 'visit_doctor' : urgency === 'medium' ? 'visit_doctor' : 'monitor_home',
        label: urgency === 'high' ? 'వైద్యుడిని సంప్రదించండి (Consult PHC Doctor)' : 'ఇంటి వద్ద గమనించండి (Monitor at Home)',
        explanation:
          urgency === 'high'
            ? 'లక్షణాలు తీవ్రంగా ఉన్నందున సమీప ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) లేదా డాక్టర్‌ను సంప్రదించి పరీక్ష చేయించుకోండి.'
            : '1-2 రోజులు ఇంటి వద్ద విశ్రాంతి తీసుకోండి. నొప్పి తగ్గకపోతే లేదా పెరిగితే ఆశా వర్కర్ లేదా డాక్టర్‌ను కలవండి.',
      },
      isEmergency: false,
      disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
      spokenSummary: `మీ లక్షణాలను పరిశీలించాము. తగినంత విశ్రాంతి తీసుకోండి మరియు నీరు బాగా తాగండి. ${
        urgency === 'high' ? 'లక్షణాలు తగ్గకపోతే సమీప PHC డాక్టర్‌ను సంప్రదించండి.' : 'లక్షణాలను 1-2 రోజులు గమనించండి.'
      }`,
    };
  } else if (language === 'hi') {
    return {
      symptomsDetected: detected,
      possibleCauses: [
        {
          condition: hasHead
            ? 'तनाव या माइग्रेन सिरदर्द (Tension / Migraine)'
            : hasStomach
            ? 'गैस या अपच (Gastritis / Acidity)'
            : hasBack
            ? 'मांसपेशियों में खिंचाव (Muscle Strain)'
            : 'सामान्य अस्वस्थता या मौसमी प्रभाव',
          description: 'थकान, तनाव, कम पानी पीने या दिनचर्या में बदलाव के कारण यह समस्या हो सकती है।',
          probability: 'likely',
        },
      ],
      urgencyLevel: urgency,
      generalGuidance: [
        'पर्याप्त पानी, ओआरएस या तरल पदार्थ पीकर शरीर में पानी की कमी न होने दें।',
        'पर्याप्त आराम करें और आंखों पर तनाव कम रखें।',
        'हल्का और सुपाच्य भोजन लें, तली-भुनी चीजों से बचें।',
        'लक्षण 2 दिन से अधिक रहें तो प्राथमिक स्वास्थ्य केंद्र (PHC) के डॉक्टर से संपर्क करें।',
      ],
      recommendedAction: {
        actionType: urgency === 'high' ? 'visit_doctor' : 'monitor_home',
        label: urgency === 'high' ? 'डॉक्टर को दिखाएं (Visit Doctor)' : 'घर पर देखभाल करें (Monitor at Home)',
        explanation:
          urgency === 'high'
            ? 'लक्षणों की गंभीरता को देखते हुए पीएचसी डॉक्टर से जांच करवाएं।'
            : 'घर पर आराम करें और 1-2 दिन लक्षणों पर नजर रखें।',
      },
      isEmergency: false,
      disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
      spokenSummary: `आपके लक्षणों का विश्लेषण किया गया है। पर्याप्त आराम करें और पानी पीएं। यदि समस्या बनी रहे तो नजदीकी डॉक्टर से मिलें।`,
    };
  } else {
    return {
      symptomsDetected: detected,
      possibleCauses: [
        {
          condition: hasHead
            ? 'Tension or Migraine Headache'
            : hasStomach
            ? 'Functional Dyspepsia / Gastritis'
            : hasBack
            ? 'Musculoskeletal Strain / Postural Ache'
            : 'Mild Seasonal Discomfort or Physical Fatigue',
          description: 'Can be triggered by stress, inadequate hydration, sleep deficit, or mild physical exertion.',
          probability: 'likely',
        },
        {
          condition: 'Mild Viral Infection',
          description: 'Common seasonal immune response presenting with localized discomfort, slight malaise, or fatigue.',
          probability: 'possible',
        },
      ],
      urgencyLevel: urgency,
      generalGuidance: [
        'Maintain optimal hydration with water, electrolyte solutions, or warm broths.',
        'Prioritize rest in a quiet, comfortable environment.',
        'Avoid self-medicating with unprescribed antibiotics or heavy analgesics.',
        'Monitor symptom progression; seek medical evaluation if symptoms worsen or fail to improve within 48 hours.',
      ],
      recommendedAction: {
        actionType: urgency === 'high' ? 'visit_doctor' : 'monitor_home',
        label: urgency === 'high' ? 'Consult a Healthcare Provider' : 'Monitor at Home',
        explanation:
          urgency === 'high'
            ? 'Persistent or severe discomfort warrants clinical evaluation at your nearest health clinic.'
            : 'Safely rest at home while staying hydrated. Consult a doctor if symptoms persist beyond 2-3 days.',
      },
      isEmergency: false,
      disclaimer: 'This AI assistant provides general health information and is not a replacement for a qualified doctor.',
      spokenSummary: `Your symptoms have been analyzed. Please get sufficient rest and stay well hydrated. ${
        urgency === 'high' ? 'We recommend consulting a doctor for clinical evaluation.' : 'Monitor your condition over the next day or two.'
      }`,
    };
  }
}

function getFallbackOCRAnalysis(type: string, lang: string): string {
  if (lang === 'te') {
    return `📋 **పత్రం పరిశీలన (ప్రిస్క్రిప్షన్ / నివేదిక):**
- **రకం:** ${type === 'prescription' ? 'వైద్యుల చీటీ (ప్రిస్క్రిప్షన్)' : 'ల్యాబ్ పరీక్షల నివేదిక'}
- **ముఖ్య సూచన:** మందులను సమయానికి తీసుకోండి. పొద్దున, మధ్యాహ్నం, రాత్రి భోజనం తర్వాత వేసుకోవాలి.
- **జాగ్రత్త:** డాక్టర్ చెప్పిన వ్యవధి ముగిసేవరకు మందులు ఆపకండి. సందేహాలు ఉంటే మీ ఆశా కార్యకర్తను లేదా PHC ని అడగండి.`;
  } else if (lang === 'hi') {
    return `📋 **दस्तावेज़ विश्लेषण (प्रिस्क्रिप्शन / रिपोर्ट):**
- **प्रकार:** ${type === 'prescription' ? 'डॉक्टर की पर्ची (प्रिस्क्रिप्शन)' : 'लैब टेस्ट रिपोर्ट'}
- **मुख्य निर्देश:** दवाइयां समय पर लें - सुबह, दोपहर और रात भोजन के बाद।
- **सावधानी:** डॉक्टर द्वारा बताई गई अवधि पूरी होने तक दवा बंद न करें। किसी भी संदेह के लिए आशा कार्यकर्ता या पीएचसी संपर्क करें।`;
  } else {
    return `📋 **Document Summary (${type}):**
- **Type:** ${type === 'prescription' ? 'Doctor Prescription' : 'Medical Test Report'}
- **Key Instruction:** Take prescribed medicines on time (Morning, Afternoon, Night after meals).
- **Precaution:** Do not stop medicine early. Contact your local ASHA worker or PHC doctor for queries.`;
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
