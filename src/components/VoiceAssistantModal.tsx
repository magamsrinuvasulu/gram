import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Send,
  Image as ImageIcon,
  Sparkles,
  ShieldAlert,
  Bot,
  User as UserIcon,
  RefreshCw,
  Globe,
  Radio,
  Trash2,
  Sliders,
  Settings2,
  Check,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Language, ChatMessage, UserProfile } from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';
import { storageService } from '../services/storageService';
import {
  cleanForSpeech,
  buildTranslationWrapperPrompt,
  parseMultiLangSegments,
} from '../services/translationService';
import {
  TeluguVoicePersona,
  TELUGU_VOICE_CONFIGS,
} from '../services/teluguPhonetics';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  userProfile: UserProfile;
  aiLanguageMode?: 'single' | 'multi';
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
  userProfile,
  aiLanguageMode = 'single',
}) => {
  const t = translations[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [voiceNoteDuration, setVoiceNoteDuration] = useState(0);
  const [voiceNoteTranscript, setVoiceNoteTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Telugu Voice Configuration state
  const [isTeluguConfigOpen, setIsTeluguConfigOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<TeluguVoicePersona>(speechService.getTeluguPersona());
  const [activeRate, setActiveRate] = useState<number>(speechService.getTeluguSpeechRate());
  const [isTestingTeluguVoice, setIsTestingTeluguVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const voiceNoteTimerRef = useRef<any>(null);

  useEffect(() => {
    setActivePersona(speechService.getTeluguPersona());
    setActiveRate(speechService.getTeluguSpeechRate());
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const history = storageService.getChatHistory();
      if (history.length === 0) {
        // Add initial greeting voice note
        const initialMsg: ChatMessage = {
          id: 'welcome-1',
          sender: 'assistant',
          text: getWelcomeMessage(language),
          timestamp: new Date().toISOString(),
          isVoiceMessage: true,
          audioDurationSeconds: 12,
        };
        setMessages([initialMsg]);
        storageService.addChatMessage(initialMsg);
      } else {
        setMessages(history);
      }
    } else {
      speechService.stopSpeaking();
      speechService.stopListening();
      stopVoiceNoteTimer();
    }
  }, [isOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isRecordingVoiceNote]);

  const stopVoiceNoteTimer = () => {
    if (voiceNoteTimerRef.current) {
      clearInterval(voiceNoteTimerRef.current);
      voiceNoteTimerRef.current = null;
    }
  };

  if (!isOpen) return null;

  function getWelcomeMessage(lang: Language): string {
    if (lang === 'multi') {
      return `🇮🇳 **తెలుగు (Telugu):**
నమస్తే! నేను మీ రూరల్ హెల్త్ మానిటరింగ్ ఏఐ వాయిస్ అసిస్టెంట్‌ని. మీ ఆరోగ్య సందేహాలు లేదా నొప్పి లక్షణాలను వాయిస్ మెసేజ్ ద్వారా అడగండి.

🇮🇳 **हिन्दी (Hindi):**
नमस्ते! मैं आपका रूरल हेल्थ मॉनिटरिंग एआई वॉयस असिस्टेंट हूँ। अपनी स्वास्थ्य समस्याओं या दर्द के लक्षणों के बारे में वॉयस मैसेज भेजकर पूछें।

🇬🇧 **English:**
Hello! I am your Rural Health Monitoring AI Voice Assistant. Speak or send a voice message describing your pain or symptoms, and I will answer with voice messages in Telugu, Hindi, and English!`;
    } else if (lang === 'te') {
      return `నమస్తే! నేను మీ "రూరల్ హెల్త్ మానిటరింగ్ ఏఐ" వాయిస్ సహాయకుడిని. 
మీ ఆరోగ్య సమస్యలు, జ్వరం, నొప్పి లేదా మందుల సందేహాల గురించి క్రింద ఉన్న మైక్ బటన్ నొక్కి వాయిస్ మెసేజ్ పంపండి. నేను మీకు తెలుగు, హిందీ మరియు ఇంగ్లీష్ లో వాయిస్ సమాధానం ఇస్తాను!`;
    } else if (lang === 'hi') {
      return `नमस्ते! मैं आपका "रूरल हेल्थ मॉनिटरिंग एआई" वॉयस असिस्टेंट हूँ। 
अपनी स्वास्थ्य समस्या, बुखार, दर्द या दवाओं के बारे में नीचे दिए गए माइक से वॉयस संदेश भेजें। मैं आपको वॉयस संदेश द्वारा मार्गदर्शन दूंगा!`;
    } else {
      return `Hello! I am your "Rural Health Monitoring AI" Voice Assistant. 
Record and send a voice message describing your symptoms or health queries. I will answer back as a voice message in Telugu, Hindi, and English!`;
    }
  }

  // Handle WhatsApp-style Voice Note Recording
  const handleStartVoiceNote = () => {
    if (isRecordingVoiceNote) {
      handleStopAndSendVoiceNote();
      return;
    }

    speechService.stopSpeaking();
    setIsSpeaking(false);
    speechService.playAudioTone('record_start');

    setIsRecordingVoiceNote(true);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');

    stopVoiceNoteTimer();
    voiceNoteTimerRef.current = setInterval(() => {
      setVoiceNoteDuration((prev) => prev + 1);
    }, 1000);

    const langCodes: Record<Language, Language> = {
      te: 'te',
      hi: 'hi',
      en: 'en',
      multi: 'te',
    };

    speechService.startListening(
      langCodes[language] || 'te',
      (result) => {
        setVoiceNoteTranscript(result.transcript);
      },
      (err) => {
        console.warn('Voice recording error:', err);
      },
      () => {
        // Recognition ended
      }
    );
  };

  const handleCancelVoiceNote = () => {
    stopVoiceNoteTimer();
    speechService.stopListening();
    speechService.playAudioTone('record_end');
    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');
  };

  const handleStopAndSendVoiceNote = () => {
    stopVoiceNoteTimer();
    speechService.stopListening();
    speechService.playAudioTone('message_sent');

    const duration = Math.max(1, voiceNoteDuration);
    const transcript = voiceNoteTranscript.trim() || 'Spoken Voice Message';

    setIsRecordingVoiceNote(false);
    setVoiceNoteDuration(0);
    setVoiceNoteTranscript('');

    handleSendMessage(transcript, true, duration);
  };

  const handleSendMessage = async (
    textToSend?: string,
    isVoiceNote: boolean = false,
    recordedDuration: number = 0
  ) => {
    const query = (textToSend || inputQuery).trim();
    if (!query && !selectedImage) return;

    speechService.stopSpeaking();
    setIsSpeaking(false);
    setInputQuery('');

    // Add User Message (tagged as voice message if sent by voice)
    const userMsg = storageService.addChatMessage({
      sender: 'user',
      text: query || (selectedImage ? 'Attached Document/Prescription Photo' : ''),
      attachmentUrl: selectedImage || undefined,
      isVoiceMessage: isVoiceNote,
      audioDurationSeconds: recordedDuration || (isVoiceNote ? 6 : undefined),
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
          text: data.analysis,
          isVoiceMessage: true,
          audioDurationSeconds: speechService.estimateDuration(data.analysis),
        });
        setMessages((prev) => [...prev, aiMsg]);
        setSelectedImage(null);
        speechService.playAudioTone('message_received');
      } else {
        // AI Chat call with real-time translation wrapper & language mode
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
        text: 'Network error. Rural Health Monitoring offline voice guide is active. Please consult your local Primary Health Centre (PHC).',
        isVoiceMessage: true,
      });
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const quickPrompts = [
    {
      te: 'పాము కాటు వస్తే ప్రథమ చికిత్స ఏమిటి?',
      hi: 'सांप काटने पर पहला इलाज क्या है?',
      en: 'Snake bite emergency first aid?',
      multi: 'పాము కాటు ప్రథమ చికిత్స 3 భాషల్లో (తెలుగు, Hindi, English) వివరించండి',
    },
    {
      te: 'నా భార్య 6వ నెల గర్భిణి. ఏ ఆహారం తీసుకోవాలి?',
      hi: 'मेरी पत्नी 6 महीने की गर्भवती है। क्या खाना चाहिए?',
      en: 'Pregnancy 6th month food guide?',
      multi: 'గర్భిణీ ఆహార సలహాలు తెలుగు, హిందీ మరియు ఇంగ్లీష్ లో తెలపండి',
    },
    {
      te: 'పిల్లలకు విరేచనాలు తగ్గడానికి ORS ఎలా చేయాలి?',
      hi: 'बच्चों में दस्त रोकने के लिए ओआरएस कैसे बनाएं?',
      en: 'How to prepare ORS for diarrhea?',
      multi: 'ORS తయారుచేసే విధానం తెలుగు, हिन्दी & English లో చెప్పండి',
    },
    {
      te: 'తీవ్రమైన తలనొప్పి మరియు జ్వరం ఉంది',
      hi: 'तेज सिरदर्द और बुखार है',
      en: 'Severe headache and fever guidance',
      multi: 'తలనెప్పి, జ్వరం లక్షణాలు Telugu, Hindi, English లో వివరించండి',
    },
  ];

  return (
    <div
      id="voice-assistant-modal"
      className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl h-[92vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-4 flex items-center justify-between border-b border-emerald-600">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
              <Bot className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight flex items-center gap-2">
                {t.appName} {t.navVoiceAssistant}
              </h2>
              <p className="text-xs text-emerald-100/80 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-300" />
                <span>Multilingual AI Voice Notes (తెలుగు • हिन्दी • English)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-telugu-voice-config-toggle"
              onClick={() => setIsTeluguConfigOpen(!isTeluguConfigOpen)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border shadow-xs ${
                isTeluguConfigOpen
                  ? 'bg-amber-400 text-emerald-950 border-amber-300'
                  : 'bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/40'
              }`}
              title="తెలుగు వాయిస్ సెట్టింగ్‌లు & గ్రామీణ ఉచ్ఛారణ (Telugu Voice Configuration)"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-200" />
              <span>తెలుగు వాయిస్ సెట్టింగ్స్</span>
              {isTeluguConfigOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
            <button
              id="btn-voice-assistant-stop-all"
              onClick={() => {
                speechService.stopSpeaking();
                setIsSpeaking(false);
                setIsTestingTeluguVoice(false);
              }}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking || isTestingTeluguVoice
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-emerald-700/50 text-emerald-100'
              }`}
              title={t.stopVoice}
            >
              {isSpeaking || isTestingTeluguVoice ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <button
              id="btn-voice-assistant-modal-close"
              onClick={onClose}
              className="p-2 rounded-full bg-emerald-700/50 hover:bg-emerald-700 text-emerald-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* LOCALE-AWARE TELUGU VOICE CONFIGURATION PANEL */}
        {isTeluguConfigOpen && (
          <div
            id="telugu-voice-settings-panel"
            className="bg-emerald-900/95 text-white p-4 border-b border-emerald-700 space-y-3.5 animate-in slide-in-from-top-2 duration-200 shadow-inner"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🇮🇳</span>
                <div>
                  <h3 className="text-xs font-black text-emerald-200 tracking-wide uppercase flex items-center gap-1.5">
                    <span>గ్రామీణ తెలుగు వాయిస్ కాన్ఫిగరేషన్ (Rural Telugu Speech AI)</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-700 text-[10px] text-emerald-100 font-bold">
                      HD Voice
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-100/75">
                    గ్రామీణ ప్రజల కోసం సహజ సిద్ధమైన యాస, స్థానిక ఉచ్ఛారణ & వైద్య పదాల స్పష్టత.
                  </p>
                </div>
              </div>

              {/* Test Audio Button */}
              <button
                id="btn-test-telugu-voice-hd"
                type="button"
                onClick={() => {
                  if (isTestingTeluguVoice) {
                    speechService.stopSpeaking();
                    setIsTestingTeluguVoice(false);
                    setIsSpeaking(false);
                  } else {
                    setIsTestingTeluguVoice(true);
                    setIsSpeaking(true);
                    speechService.testTeluguVoice(activePersona, () => {
                      setIsTestingTeluguVoice(false);
                      setIsSpeaking(false);
                    });
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                  isTestingTeluguVoice
                    ? 'bg-amber-400 text-emerald-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950'
                }`}
              >
                {isTestingTeluguVoice ? (
                  <>
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>ఆపండి (Stop Test)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>🔊 వాయిస్ టెస్ట్ చేయండి (Test Voice)</span>
                  </>
                )}
              </button>
            </div>

            {/* Persona Selection */}
            <div>
              <label className="text-[11px] font-bold text-emerald-200 block mb-1.5">
                వాయిస్ శైలి / వ్యక్తిత్వం ఎంచుకోండి (Select Telugu Voice Persona):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['sumitra', 'srinivas', 'gayatri'] as TeluguVoicePersona[]).map((pKey) => {
                  const cfg = TELUGU_VOICE_CONFIGS[pKey];
                  const isSelected = activePersona === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        setActivePersona(pKey);
                        speechService.setTeluguPersona(pKey);
                      }}
                      className={`p-2.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-white text-emerald-950 border-white shadow-md ring-2 ring-emerald-300'
                          : 'bg-emerald-800/60 hover:bg-emerald-800 text-white border-emerald-700/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">
                          {pKey === 'sumitra' ? '🌸 ' : pKey === 'srinivas' ? '🩺 ' : '🌟 '}
                          {cfg.displayNameTe}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p
                        className={`text-[10px] mt-1 line-clamp-2 ${
                          isSelected ? 'text-slate-600' : 'text-emerald-200/80'
                        }`}
                      >
                        {cfg.roleDescription}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed & Rural Enunciation Cadence */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-emerald-800">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-200">
                  ఉచ్ఛారణ వేగం (Speech Pacing):
                </span>
                <div className="inline-flex rounded-xl bg-emerald-950/60 p-0.5 border border-emerald-700">
                  {[
                    { label: '0.8x నిదానంగా (Rural Calm)', rate: 0.8 },
                    { label: '0.88x స్పష్టత (Recommended)', rate: 0.88 },
                    { label: '1.0x సాధారణ (Normal)', rate: 1.0 },
                  ].map((spd) => (
                    <button
                      key={spd.rate}
                      type="button"
                      onClick={() => {
                        setActiveRate(spd.rate);
                        speechService.setTeluguSpeechRate(spd.rate);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        Math.abs(activeRate - spd.rate) < 0.03
                          ? 'bg-emerald-400 text-emerald-950 shadow-xs'
                          : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phonetic Features Badge */}
              <div className="flex items-center gap-2 text-[10px] text-emerald-200 bg-emerald-950/40 px-2.5 py-1 rounded-xl border border-emerald-700/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>✓ BP, Sugar, 108, ORS, మందుల మోతాదుల సహజ తెలుగు ధ్వని యాక్టివ్</span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Voice Bar when collapsed */}
        {!isTeluguConfigOpen && (language === 'te' || language === 'multi') && (
          <div className="bg-emerald-50 px-4 py-1.5 border-b border-emerald-200/80 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="font-bold">
                తెలుగు వాయిస్:{' '}
                {activePersona === 'sumitra'
                  ? '🌸 సుమిత్ర (ఆశా వర్కర్ శైలి)'
                  : activePersona === 'srinivas'
                  ? '🩺 డా. శ్రీనివాస్'
                  : '🌟 గాయత్రి'}
              </span>
              <span className="text-emerald-700 text-[11px]">
                • {activeRate}x గ్రామీణ స్పష్టత • స్థానిక ఉచ్ఛారణ
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsTeluguConfigOpen(true)}
              className="text-emerald-700 hover:text-emerald-900 font-extrabold underline text-[11px] ml-2"
            >
              సెట్టింగ్స్ మార్చండి
            </button>
          </div>
        )}

        {/* Chat Conversation History with Voice Message Players */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="max-w-[90%] sm:max-w-[85%] space-y-2">
                {/* Prescription photo preview if attached */}
                {msg.attachmentUrl && (
                  <img
                    src={msg.attachmentUrl}
                    alt="Prescription"
                    className="max-h-48 rounded-2xl mb-1 object-cover border border-slate-200 shadow-xs"
                  />
                )}

                {/* If it's an Assistant response: Render dedicated Multilingual VoiceMessagePlayer */}
                {msg.sender === 'assistant' ? (
                  <VoiceMessagePlayer
                    id={msg.id}
                    sender="assistant"
                    text={msg.text}
                    currentLanguage={language}
                    timestamp={msg.timestamp}
                    isEmergency={msg.isEmergency}
                    audioDurationSeconds={msg.audioDurationSeconds}
                    onPlayingChange={(playing) => setIsSpeaking(playing)}
                  />
                ) : msg.isVoiceMessage ? (
                  /* If user sent a voice message */
                  <VoiceMessagePlayer
                    id={msg.id}
                    sender="user"
                    text={msg.text}
                    currentLanguage={language}
                    timestamp={msg.timestamp}
                    audioDurationSeconds={msg.audioDurationSeconds}
                    onPlayingChange={(playing) => setIsSpeaking(playing)}
                  />
                ) : (
                  /* Standard user text message */
                  <div className="bg-emerald-700 text-white p-3.5 rounded-2xl rounded-br-none shadow-xs text-sm leading-relaxed">
                    {msg.text}
                    <div className="text-[10px] text-emerald-200/80 text-right mt-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>
                  {language === 'te'
                    ? 'ఏఐ వాయిస్ మెసేజ్ సిద్ధం చేస్తోంది...'
                    : language === 'hi'
                    ? 'एआई वॉयस मैसेज तैयार कर रहा है...'
                    : 'AI Preparing Voice Message Response in Telugu, Hindi & English...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Voice Prompt Chips */}
        <div className="px-3 py-2 bg-emerald-50/60 border-t border-emerald-100 flex gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((promptObj, idx) => {
            const promptText = (promptObj as any)[language] || promptObj.multi || promptObj.en;
            return (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="shrink-0 bg-white hover:bg-emerald-100/70 border border-emerald-200 text-emerald-900 text-xs px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1 shadow-2xs"
              >
                <span>🎙️</span>
                <span>{promptText}</span>
              </button>
            );
          })}
        </div>

        {/* LIVE VOICE NOTE RECORDING BANNER (WhatsApp / Telegram style) */}
        {isRecordingVoiceNote && (
          <div className="p-3 bg-red-50 border-t-2 border-red-500 flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                </span>
                <span className="font-mono font-black text-sm text-red-700">
                  {formatTimer(voiceNoteDuration)}
                </span>
                <span className="text-xs font-bold text-red-900">
                  {language === 'te'
                    ? 'వాయిస్ సందేశం రికార్డ్ అవుతోంది...'
                    : language === 'hi'
                    ? 'वॉयस संदेश रिकॉर्ड हो रहा है...'
                    : 'Recording Voice Message...'}
                </span>
              </div>

              {/* Action buttons: Cancel & Send */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCancelVoiceNote}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-100 text-red-700 border border-red-300 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleStopAndSendVoiceNote}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice Note</span>
                </button>
              </div>
            </div>

            {/* Spoken interim words preview */}
            <div className="bg-white/95 p-2.5 rounded-xl border border-red-200 flex items-center justify-between text-xs text-slate-800 font-mono">
              <span className="truncate pr-2">
                {voiceNoteTranscript
                  ? `"${voiceNoteTranscript}"`
                  : language === 'te'
                  ? 'మీ సమస్యను స్పష్టంగా మాట్లాడండి...'
                  : language === 'hi'
                  ? 'अपनी समस्या बोलें...'
                  : 'Speak your symptoms clearly...'}
              </span>
              <AudioWaveformVisualizer isListening={true} mode="compact" colorTheme="red" barCount={5} />
            </div>
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="p-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={selectedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
              <span className="text-xs text-slate-700 font-medium">Prescription / Lab Photo Attached</span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-red-600 p-1 hover:bg-red-50 rounded-lg text-xs font-bold"
            >
              Remove
            </button>
          </div>
        )}

        {/* Bottom Input & Voice Note Controls */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {/* Camera / Photo Attachment */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
              title={t.attachPrescription}
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

            {/* Input Field */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                language === 'te'
                  ? 'టైప్ చేయండి లేదా క్రింద వాయిస్ మెసేజ్ పంపండి...'
                  : language === 'hi'
                  ? 'टाइप करें या नीचे वॉयस मैसेज भेजें...'
                  : 'Type symptoms or send voice message below...'
              }
              className="flex-1 bg-slate-100 text-slate-800 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 border border-transparent font-sans"
            />

            {/* Send Text Button */}
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() && !selectedImage}
              className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-all shadow-md shrink-0"
              title="Send text message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* PRIMARY RECORD VOICE MESSAGE BUTTON (Instant Voice Note Workflow) */}
          <button
            type="button"
            onClick={handleStartVoiceNote}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 ${
              isRecordingVoiceNote
                ? 'bg-red-600 hover:bg-red-700 text-white ring-4 ring-red-300 shadow-red-500/40 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
            }`}
          >
            <Mic className={`w-5 h-5 ${isRecordingVoiceNote ? 'animate-bounce' : ''}`} />
            <span>
              {isRecordingVoiceNote
                ? language === 'te'
                  ? 'వాయిస్ రికార్డింగ్ ఆపి పంపండి (Tap to Send)'
                  : language === 'hi'
                  ? 'रिकॉर्डिंग समाप्त कर भेजें (Tap to Send)'
                  : 'Stop & Send Voice Message'
                : language === 'te'
                ? '🎙️ వాయిస్ మెసేజ్ రికార్డ్ చేయండి (Record Voice Message)'
                : language === 'hi'
                ? '🎙️ वॉयस मैसेज रिकॉर्ड करें (Record Voice Message)'
                : '🎙️ Record Voice Message (AI Answers by Voice)'}
            </span>
            {isRecordingVoiceNote && (
              <span className="font-mono bg-white/20 px-2 py-0.5 rounded-md text-xs">
                {formatTimer(voiceNoteDuration)}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
