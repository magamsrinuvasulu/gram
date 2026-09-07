import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Trash2,
  Camera,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  RefreshCw,
  X,
  MessageSquare,
  Globe,
  Settings,
  User,
  Square,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Language,
  UserProfile,
  ChatMessage,
} from '../types';
import { TeluguVoicePersona, TELUGU_VOICE_CONFIGS } from '../services/teluguPhonetics';
import { translations } from '../translations';
import { storageService } from '../services/storageService';
import { speechService } from '../services/speechService';
import { buildTranslationWrapperPrompt } from '../services/translationService';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface ChatbotProps {
  language: Language;
  userProfile: UserProfile;
  aiLanguageMode?: 'single' | 'multi';
  onOpenVoiceModal?: () => void;
}

export const Chatbot: React.FC<ChatbotProps> = ({
  language,
  userProfile,
  aiLanguageMode = 'single',
  onOpenVoiceModal,
}) => {
  const t = translations[language];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [voiceNoteTranscript, setVoiceNoteTranscript] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activePersona, setActivePersona] = useState<TeluguVoicePersona>(speechService.getTeluguPersona());
  const [activeRate, setActiveRate] = useState<number>(speechService.getTeluguSpeechRate());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const voiceNoteTimerRef = useRef<any>(null);

  // Initialize messages from history
  useEffect(() => {
    const history = storageService.getChatHistory();
    if (history.length === 0) {
      const welcome: ChatMessage = {
        id: 'bot-welcome',
        sender: 'assistant',
        text: getWelcomeMessage(language),
        timestamp: new Date().toISOString(),
        isVoiceMessage: true,
        audioDurationSeconds: 10,
      };
      setMessages([welcome]);
      storageService.addChatMessage(welcome);
    } else {
      setMessages(history);
    }

    setActivePersona(speechService.getTeluguPersona());
    setActiveRate(speechService.getTeluguSpeechRate());

    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
      if (voiceNoteTimerRef.current) {
        clearInterval(voiceNoteTimerRef.current);
      }
    };
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecordingVoiceNote]);

  function getWelcomeMessage(lang: Language): string {
    if (lang === 'multi') {
      return `🇮🇳 **తెలుగు (Telugu):**
నమస్తే! నేను మీ రూరల్ హెల్త్ ఏఐ చాట్‌బాట్. మీ ఆరోగ్య సమస్యలు, లక్షణాలు లేదా మందుల గురించి ఇక్కడ టైప్ చేయండి లేదా మైక్ బటన్ నొక్కి వాయిస్ ద్వారా అడగండి.

🇮🇳 **हिन्दी (Hindi):**
नमस्ते! मैं आपका रूरल हेल्थ एआई चैटबॉट हूँ। अपनी स्वास्थ्य समस्याओं या दवाओं के बारे में यहाँ टाइप करें या बोलकर पूछें।

🇬🇧 **English:**
Hello! I am your Rural Health AI Chatbot. Type your symptoms or health queries here, or tap the microphone to speak with voice assistant!`;
    } else if (lang === 'te') {
      return `నమస్తే! నేను మీ గ్రామీణ ఆరోగ్య ఏఐ సహాయకుడిని (AI Health Chatbot).
మీరు ఇక్కడ మీ ప్రశ్నలను తెలుగు లేదా ఇంగ్లీష్ లో **టైప్ చేయవచ్చు**, లేదా క్రింద ఉన్న మైక్ బటన్ నొక్కి **వాయిస్ ద్వారా మాట్లాడవచ్చు**. 

జ్వరం, బీపీ, షుగర్, గర్భధారణ లేదా మందుల వివరాల గురించి ఏదైనా అడగండి!`;
    } else if (lang === 'hi') {
      return `नमस्ते! मैं आपका ग्रामीण स्वास्थ्य एआई चैटबॉट हूँ।
आप यहाँ अपने प्रश्न **टाइप कर सकते हैं**, या नीचे दिए गए माइक से **बोलकर वॉयस असिस्टेंट** से सहायता ले सकते हैं।

बुखार, बीपी, शुगर या दवाओं के बारे में कुछ भी पूछें!`;
    } else {
      return `Hello! I am your Rural Health AI Chatbot with integrated Voice Assistant.
You can **type your questions** in the text box, or tap the **microphone icon** to speak naturally.

Ask about symptoms, blood pressure, fever, first aid, or medications anytime!`;
    }
  }

  // Quick Prompt Chips
  const promptSuggestions = [
    {
      label: language === 'te' ? '🤒 జ్వరం & తలనొప్పి' : language === 'hi' ? '🤒 बुखार और सिरदर्द' : '🤒 Fever & Headache',
      query: language === 'te' ? 'నాకు 2 రోజుల నుండి తీవ్రమైన జ్వరం మరియు తలనొప్పి ఉంది. ఏం చేయాలి?' : language === 'hi' ? 'मुझे 2 दिन से बुखार और सिरदर्द है। क्या प्राथमिक उपचार करें?' : 'I have high fever and severe headache for 2 days. What should I do?',
    },
    {
      label: language === 'te' ? '🩺 బీపీ నియంత్రణ ఆహారం' : language === 'hi' ? '🩺 बीपी नियंत्रण और भोजन' : '🩺 High BP Diet Tips',
      query: language === 'te' ? 'అధిక రక్తపోటు (High BP) నియంత్రణకు గ్రామీణ ప్రాంతంలో పాటించాల్సిన ఆహార నియమాలు చెప్పండి' : language === 'hi' ? 'हाई ब्लड प्रेशर नियंत्रित करने के लिए क्या खाना चाहिए?' : 'What diet and precautions should be taken to manage high blood pressure?',
    },
    {
      label: language === 'te' ? '💧 విరేచనాలు & ORS' : language === 'hi' ? '💧 दस्त और ORS घोल' : '💧 Diarrhea & ORS',
      query: language === 'te' ? 'విరేచనాలు మరియు వాంతులు అవుతున్నాయి. ఇంట్లోనే ORS ద్రావణం ఎలా తయారు చేయాలి?' : language === 'hi' ? 'दस्त होने पर घर पर ORS का घोल कैसे तैयार करें?' : 'How to make ORS solution at home for dehydration and diarrhea?',
    },
    {
      label: language === 'te' ? '🤰 గర్భిణీ ANC జాగ్రత్తలు' : language === 'hi' ? '🤰 गर्भवती महिलाओं की देखभाल' : '🤰 Pregnancy Care',
      query: language === 'te' ? 'గర్భిణీ స్త్రీలు తీసుకోవాల్సిన పోషకాహారం మరియు టీకాల వివరాలు చెప్పండి' : language === 'hi' ? 'गर्भवती महिला के लिए जरूरी आहार और टीके क्या हैं?' : 'What nutritious diet and ANC checkups are needed during pregnancy?',
    },
    {
      label: language === 'te' ? '🐍 పాము కాటు అత్యవసర చికిత్స' : language === 'hi' ? '🐍 सांप काटने पर इमरजेंसी' : '🐍 Snake Bite Emergency',
      query: language === 'te' ? 'పొలంలో పాము లేదా తేలు కాటు వేస్తే వెంటనే చేయవలసిన ప్రథమ చికిత్స ఏమిటి?' : language === 'hi' ? 'सांप या बिच्छू काटने पर तुरंत क्या प्राथमिक उपचार करें?' : 'What immediate first aid should be done for a snake bite emergency?',
    },
    {
      label: language === 'te' ? '💉 పిల్లల టీకాలు' : language === 'hi' ? '💉 बच्चों का टीकाकरण' : '💉 Child Vaccines',
      query: language === 'te' ? 'నవజాత శిశువుకు పుట్టినప్పటి నుండి వేయించాల్సిన ముఖ్యమైన టీకాల పట్టిక చెప్పండి' : language === 'hi' ? 'बच्चों के जरूरी टीकाकरण की समय सारणी क्या है?' : 'What is the recommended immunization schedule for infants and children?',
    },
  ];

  // Send Message Logic
  const handleSendMessage = async (
    textToSend?: string,
    isVoiceNote: boolean = false,
    duration: number = 0
  ) => {
    const query = (textToSend !== undefined ? textToSend : inputQuery).trim();
    if (!query && !selectedImage) return;

    speechService.stopSpeaking();
    setInputQuery('');

    // Add User message
    const userMsg = storageService.addChatMessage({
      sender: 'user',
      text: query || (selectedImage ? 'Attached Document / Prescription Photo' : ''),
      attachmentUrl: selectedImage || undefined,
      isVoiceMessage: isVoiceNote,
      audioDurationSeconds: duration || (isVoiceNote ? 5 : undefined),
    });

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      if (selectedImage) {
        // OCR / Image Analysis call
        const response = await fetch('/api/health-ai/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: selectedImage,
            language,
            documentType: 'prescription',
          }),
        });
        const data = await response.json();
        const aiMsg = storageService.addChatMessage({
          sender: 'assistant',
          text: data.analysis || 'Analysis completed.',
          isVoiceMessage: true,
          audioDurationSeconds: speechService.estimateDuration(data.analysis || ''),
        });
        setMessages((prev) => [...prev, aiMsg]);
        setSelectedImage(null);
        speechService.playAudioTone('message_received');
      } else {
        // AI Chat call
        const { enhancedMessage } = buildTranslationWrapperPrompt(query, language, aiLanguageMode);

        const response = await fetch('/api/health-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: enhancedMessage,
            language,
            conversationHistory: messages.slice(-6),
            userProfile,
          }),
        });
        const data = await response.json();

        const aiMsg = storageService.addChatMessage({
          sender: 'assistant',
          text: data.text,
          isEmergency: data.isEmergency,
          isVoiceMessage: true,
          audioDurationSeconds: speechService.estimateDuration(data.text),
        });

        setMessages((prev) => [...prev, aiMsg]);
        speechService.playAudioTone('message_received');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg = storageService.addChatMessage({
        sender: 'assistant',
        text: 'Network issue. Offline health guidelines: For sudden chest pain or breathing difficulty, call 108 immediately or visit the nearest Primary Health Centre.',
        isVoiceMessage: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Live Voice-to-Text Dictation inside the input bar
  const handleToggleDictation = () => {
    if (isDictating) {
      speechService.stopListening();
      setIsDictating(false);
      return;
    }

    if (isRecordingVoiceNote) {
      handleCancelVoiceNote();
    }

    speechService.stopSpeaking();
    setIsDictating(true);
    speechService.playAudioTone('record_start');

    speechService.startListening(
      language,
      (result) => {
        setInputQuery(result.transcript);
        if (result.isFinal) {
          setIsDictating(false);
          speechService.playAudioTone('record_end');
        }
      },
      (error) => {
        console.warn('Voice dictation error:', error);
        setIsDictating(false);
      }
    );
  };

  // Full Voice Note Recording Mode
  const handleStartVoiceNote = () => {
    if (isRecordingVoiceNote) {
      handleStopAndSendVoiceNote();
      return;
    }

    if (isDictating) {
      speechService.stopListening();
      setIsDictating(false);
    }

    speechService.stopSpeaking();
    setIsRecordingVoiceNote(true);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');
    speechService.playAudioTone('record_start');

    voiceNoteTimerRef.current = setInterval(() => {
      setVoiceNoteDuration((prev) => prev + 1);
    }, 1000);

    speechService.startListening(
      language,
      (result) => {
        setVoiceNoteTranscript(result.transcript);
      },
      (error) => {
        console.warn('Voice note error:', error);
      }
    );
  };

  const handleStopAndSendVoiceNote = () => {
    if (voiceNoteTimerRef.current) {
      clearInterval(voiceNoteTimerRef.current);
      voiceNoteTimerRef.current = null;
    }
    speechService.stopListening();
    speechService.playAudioTone('record_end');

    const transcript = voiceNoteTranscript.trim();
    const duration = voiceNoteDuration;

    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');

    if (transcript) {
      handleSendMessage(transcript, true, duration);
    }
  };

  const handleCancelVoiceNote = () => {
    if (voiceNoteTimerRef.current) {
      clearInterval(voiceNoteTimerRef.current);
      voiceNoteTimerRef.current = null;
    }
    speechService.stopListening();
    speechService.playAudioTone('record_end');
    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearChat = () => {
    storageService.clearChatHistory();
    const welcome: ChatMessage = {
      id: 'bot-welcome-' + Date.now(),
      sender: 'assistant',
      text: getWelcomeMessage(language),
      timestamp: new Date().toISOString(),
      isVoiceMessage: true,
      audioDurationSeconds: 10,
    };
    setMessages([welcome]);
    storageService.addChatMessage(welcome);
    setShowClearConfirm(false);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="health-chatbot-container" className="space-y-4 pb-20 max-w-4xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-4 sm:p-5 shadow-lg border border-emerald-700/60 relative overflow-hidden">
        {/* Subtle Decorative Backdrop */}
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-emerald-200 shadow-md shrink-0">
              <Bot className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{t.chatbotTitle}</span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-pulse" />
                  Text & Voice
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {t.chatbotSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Telugu Voice Persona & Settings toggle */}
            <button
              type="button"
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                showVoiceSettings
                  ? 'bg-white text-emerald-900 border-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-emerald-100 border-white/20'
              }`}
              title="Voice Assistant Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>
                {activePersona === 'sumitra' ? 'సుమిత్ర (Sumitra)' : activePersona === 'srinivas' ? 'శ్రీనివాస్ (Srinivas)' : 'గాయత్రి (Gayatri)'}
              </span>
              {showVoiceSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-emerald-100 hover:text-white border border-white/20 transition-colors"
              title={t.clearChat}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Persona & Speed Expandable Settings Bar */}
        {showVoiceSettings && (
          <div className="mt-4 pt-4 border-t border-white/15 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-200">
                వాయిస్ వ్యక్తిత్వం (Voice Persona):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['sumitra', 'srinivas', 'gayatri'] as TeluguVoicePersona[]).map((pKey) => {
                  const cfg = TELUGU_VOICE_CONFIGS[pKey];
                  const isSel = activePersona === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setActivePersona(pKey);
                        speechService.setTeluguPersona(pKey);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                        isSel
                          ? 'bg-white text-emerald-950 shadow-md font-black'
                          : 'bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60'
                      }`}
                    >
                      <span>{pKey === 'sumitra' ? '🌸' : pKey === 'srinivas' ? '🩺' : '🌟'}</span>
                      <span>{cfg.displayNameTe.split(' ')[0]}</span>
                      {isSel && <Check className="w-3 h-3 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-emerald-200">
                ఉచ్ఛారణ వేగం (Voice Speed):
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: '0.8x నిదానంగా (Calm)', rate: 0.8 },
                  { label: '0.88x స్పష్టత (Optimal)', rate: 0.88 },
                  { label: '1.0x సాధారణం (Normal)', rate: 1.0 },
                ].map((s) => (
                  <button
                    key={s.rate}
                    type="button"
                    onClick={() => {
                      setActiveRate(s.rate);
                      speechService.setTeluguSpeechRate(s.rate);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      Math.abs(activeRate - s.rate) < 0.03
                        ? 'bg-emerald-300 text-emerald-950 font-black shadow-xs'
                        : 'bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          {language === 'te' ? 'త్వరిత ప్రశ్నలు (Quick Questions)' : language === 'hi' ? 'त्वरित प्रश्न (Quick Questions)' : 'Quick Health Questions'}
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {promptSuggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(item.query)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/90 text-slate-800 text-xs font-bold whitespace-nowrap shadow-2xs transition-all active:scale-95 shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4 text-emerald-200" />
                </div>
              )}

              <div className="max-w-[90%] sm:max-w-[82%] space-y-2">
                {/* Photo attachment preview */}
                {msg.attachmentUrl && (
                  <img
                    src={msg.attachmentUrl}
                    alt="Prescription Attachment"
                    className="max-h-52 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                )}

                {msg.sender === 'assistant' ? (
                  <VoiceMessagePlayer
                    id={msg.id}
                    sender="assistant"
                    text={msg.text}
                    currentLanguage={language}
                    timestamp={msg.timestamp}
                    isEmergency={msg.isEmergency}
                    audioDurationSeconds={msg.audioDurationSeconds}
                  />
                ) : msg.isVoiceMessage ? (
                  <VoiceMessagePlayer
                    id={msg.id}
                    sender="user"
                    text={msg.text}
                    currentLanguage={language}
                    timestamp={msg.timestamp}
                    audioDurationSeconds={msg.audioDurationSeconds}
                  />
                ) : (
                  /* Standard User Message */
                  <div className="bg-emerald-700 text-white p-3.5 sm:p-4 rounded-3xl rounded-tr-xs shadow-xs text-sm leading-relaxed">
                    <p className="font-medium whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-[10px] text-emerald-200 text-right mt-1.5 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-4 h-4 animate-spin text-emerald-300" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="font-medium">
                  {language === 'te'
                    ? 'ఏఐ సమాధానం సిద్ధం చేస్తోంది...'
                    : language === 'hi'
                    ? 'एआई जवाब तैयार कर रहा है...'
                    : 'AI Health Assistant is replying...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Voice Note Recording Banner */}
        {isRecordingVoiceNote && (
          <div className="p-3.5 bg-rose-50 border-t-2 border-rose-500 flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600"></span>
                </span>
                <span className="font-mono font-black text-sm text-rose-700">
                  {formatTimer(voiceNoteDuration)}
                </span>
                <span className="text-xs font-bold text-rose-900">
                  {language === 'te'
                    ? 'వాయిస్ సందేశం రికార్డ్ అవుతోంది...'
                    : language === 'hi'
                    ? 'वॉयस संदेश रिकॉर्ड हो रहा है...'
                    : 'Recording Voice Note...'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelVoiceNote}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.cancel}</span>
                </button>
                <button
                  type="button"
                  onClick={handleStopAndSendVoiceNote}
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice</span>
                </button>
              </div>
            </div>

            <div className="bg-white/95 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between text-xs text-slate-800 font-mono">
              <span className="truncate pr-2">
                {voiceNoteTranscript
                  ? `"${voiceNoteTranscript}"`
                  : language === 'te'
                  ? 'మీ ప్రశ్న లేదా నొప్పుల గురించి మాట్లాడండి...'
                  : language === 'hi'
                  ? 'अपनी समस्या बोलें...'
                  : 'Speak your question clearly...'}
              </span>
              <AudioWaveformVisualizer isListening={true} mode="compact" colorTheme="red" barCount={5} />
            </div>
          </div>
        )}

        {/* Selected Image Attachment Preview */}
        {selectedImage && (
          <div className="p-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-xl shadow-xs" />
              <span className="text-xs text-slate-700 font-bold">
                Prescription / Medicine Strip Photo Ready
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="text-rose-600 p-1 hover:bg-rose-50 rounded-lg text-xs font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Live Voice Dictation Active Bar */}
        {isDictating && (
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-900">
                {language === 'te' ? 'వాయిస్ టైపింగ్ యాక్టివ్ - మాట్లాడండి...' : language === 'hi' ? 'वॉयस टाइपिंग सक्रिय - बोलें...' : 'Voice typing active - speak now...'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleDictation}
              className="text-xs font-bold text-amber-900 underline hover:text-amber-950"
            >
              Stop
            </button>
          </div>
        )}

        {/* Bottom Input Field for Text Typing & Voice Assistant Integration */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {/* Camera / Photo Attachment */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
              title="Attach Prescription or Medicine Photo"
            >
              <ImageIcon className="w-5 h-5 text-emerald-700" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Input Field with Live Voice-to-Text Integration */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  language === 'te'
                    ? 'ఇక్కడ టైప్ చేయండి లేదా మైక్ నొక్కి మాట్లాడండి...'
                    : language === 'hi'
                    ? 'यहाँ टाइप करें या माइक दबाकर बोलें...'
                    : 'Type your health question or tap mic to speak...'
                }
                className={`w-full bg-slate-100 text-slate-800 text-sm pl-4 pr-11 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 border transition-all ${
                  isDictating ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300' : 'border-transparent'
                }`}
              />

              {/* Voice-to-Text Microphone inside input field */}
              <button
                type="button"
                onClick={handleToggleDictation}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  isDictating
                    ? 'bg-amber-500 text-white animate-pulse shadow-md shadow-amber-500/40'
                    : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
                title={t.voiceTyping}
                aria-label="Toggle voice typing"
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>

            {/* Send Text Message Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() && !selectedImage}
              className="p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all shadow-md shrink-0 active:scale-95"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Voice Assistant Trigger Bar (Dedicated Voice Note Workflow) */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'te'
                ? 'వాయిస్ ద్వారా అడగాలనుకుంటున్నారా?'
                : language === 'hi'
                ? 'वॉयस से पूछना चाहते हैं?'
                : 'Prefer speaking with voice assistant?'}
            </span>

            <button
              type="button"
              onClick={handleStartVoiceNote}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{t.tapToSpeak}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">{t.clearChat}</h3>
              <p className="text-xs text-slate-600">
                {language === 'te'
                  ? 'మీరు ప్రస్తుత చాట్ చరిత్రను పూర్తిగా తొలగించాలనుకుంటున్నారా?'
                  : language === 'hi'
                  ? 'क्या आप पूरी चैट हिस्ट्री साफ़ करना चाहते हैं?'
                  : 'Are you sure you want to clear your chat conversation history?'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.delete}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
