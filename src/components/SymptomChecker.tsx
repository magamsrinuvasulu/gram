import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  FileDown,
  FileText,
  Globe,
  HeartPulse,
  Info,
  Loader2,
  MapPin,
  Mic,
  MicOff,
  Navigation,
  PhoneCall,
  Printer,
  RotateCcw,
  Share2,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  Language,
  BodyPartPain,
  BodyPartId,
  SymptomAnalysisResult,
  UrgencyLevel,
  SymptomDraft,
} from '../types';
import { translations } from '../translations';
import { speechService } from '../services/speechService';
import { HumanBodyPainSelector } from './HumanBodyPainSelector';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { VoiceMessagePlayer } from './VoiceMessagePlayer';
import { defaultFacilities, storageService } from '../services/storageService';
import { SymptomExportModal } from './SymptomExportModal';
import { downloadTextReport, copyReportToClipboard } from '../utils/symptomExportUtil';

interface SymptomCheckerProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  onOpenVoiceAssistant?: () => void;
  onNavigateTab?: (tab: string) => void;
}

const QUICK_SYMPTOMS = [
  { id: 'fever', labelEn: 'Fever', labelTe: 'జ్వరం (Fever)', labelHi: 'बुखार (Fever)' },
  { id: 'cough_cold', labelEn: 'Cough & Cold', labelTe: 'దగ్గు, జలుబు', labelHi: 'खांसी व जुकाम' },
  { id: 'chest_pain', labelEn: 'Chest Pain / Pressure', labelTe: 'ఛాతీ నొప్పి / పట్టేయడం', labelHi: 'सीने में दर्द व दबाव' },
  { id: 'breathlessness', labelEn: 'Difficulty Breathing', labelTe: 'శ్వాస ఆడకపోవడం', labelHi: 'सांस लेने में दिक्कत' },
  { id: 'stomach_ache', labelEn: 'Stomach Ache', labelTe: 'కడుపునొప్పి', labelHi: 'पेट दर्द' },
  { id: 'headache', labelEn: 'Severe Headache', labelTe: 'తీవ్ర తలనొప్పి', labelHi: 'तेज सिरदर्द' },
  { id: 'vomiting_diarrhea', labelEn: 'Vomiting / Diarrhea', labelTe: 'వాంతులు / విరేచనాలు', labelHi: 'उल्टी या दस्त' },
  { id: 'weakness_dizziness', labelEn: 'Dizziness / Weakness', labelTe: 'తలతిరుగుడు / నీరసం', labelHi: 'चक्कर आना व कमजोरी' },
  { id: 'skin_rash', labelEn: 'Skin Rash / Itching', labelTe: 'చర్మంపై దద్దుర్లు / దురద', labelHi: 'त्वचा पर चकत्ते / खुजली' },
  { id: 'joint_pain', labelEn: 'Joint / Muscle Pain', labelTe: 'కీళ్ళ / ఒంటి నొప్పులు', labelHi: 'जोड़ों व बदन में दर्द' },
  { id: 'snake_bite', labelEn: 'Snake / Animal Bite', labelTe: 'పాము / జంతువు కాటు', labelHi: 'सांप या जानवर का काटना' },
];

const EXAMPLE_QUERIES = [
  {
    en: 'I have severe headache and fever for 2 days',
    te: 'నాకు రెండు రోజులుగా తీవ్రమైన తలనొప్పి మరియు జ్వరం ఉంది',
    hi: 'मुझे दो दिनों से तेज सिरदर्द और बुखार है',
  },
  {
    en: 'My chest is hurting and I feel tightness',
    te: 'నా ఛాతీ నొప్పిగా ఉంది మరియు గుండెల్లో భారంగా అనిపిస్తుంది',
    hi: 'मेरे सीने में दर्द है और भारीपन महसूस हो रहा है',
  },
  {
    en: 'I have sharp stomach pain after eating',
    te: 'భోజనం చేసిన తర్వాత కడుపులో తీవ్రమైన కుచ్చుతున్న నొప్పి వస్తుంది',
    hi: 'खाना खाने के बाद पेट में तेज दर्द हो रहा है',
  },
];

export const SymptomChecker: React.FC<SymptomCheckerProps> = ({
  language,
  onLanguageChange,
  onOpenVoiceAssistant,
  onNavigateTab,
}) => {
  const t = translations[language];

  // Load any previously auto-saved draft from localStorage
  const [initialDraft] = useState<SymptomDraft | null>(() => storageService.getSymptomDraft());

  // Primary Symptom Input State (with draft restoration support)
  const [textInput, setTextInput] = useState<string>(() => initialDraft?.textInput || '');
  const [selectedQuickSymptoms, setSelectedQuickSymptoms] = useState<string[]>(
    () => initialDraft?.selectedQuickSymptoms || []
  );
  const [selectedBodyPains, setSelectedBodyPains] = useState<BodyPartPain[]>(
    () => initialDraft?.selectedBodyPains || []
  );
  const [analysisResult, setAnalysisResult] = useState<SymptomAnalysisResult | null>(
    () => initialDraft?.analysisResult || null
  );

  // Auto-Save notification states
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(() => initialDraft?.savedAt || null);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(
    () => Boolean(initialDraft && (initialDraft.textInput || initialDraft.selectedQuickSymptoms?.length || initialDraft.selectedBodyPains?.length))
  );

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // AI Analysis Results & Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Export & Sharing states
  const [showExportModal, setShowExportModal] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const [quickDownloadingText, setQuickDownloadingText] = useState(false);

  // Hospital locator drawer / GPS permission modal
  const [showHospitalsModal, setShowHospitalsModal] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied'>('idle');

  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-save current inputs (symptoms, selected body parts, analysis) to localStorage
  useEffect(() => {
    const hasContent =
      textInput.trim() !== '' ||
      selectedQuickSymptoms.length > 0 ||
      selectedBodyPains.length > 0 ||
      analysisResult !== null;

    if (hasContent) {
      const nowIso = new Date().toISOString();
      storageService.saveSymptomDraft({
        textInput,
        selectedQuickSymptoms,
        selectedBodyPains,
        analysisResult,
        savedAt: nowIso,
      });
      setLastAutoSavedTime(nowIso);
    } else {
      storageService.clearSymptomDraft();
      setLastAutoSavedTime(null);
    }
  }, [textInput, selectedQuickSymptoms, selectedBodyPains, analysisResult]);

  // Stop speaking when unmounting or changing tabs
  useEffect(() => {
    return () => {
      speechService.stopSpeaking();
      speechService.stopListening();
    };
  }, []);

  // Voice Input Handler
  const handleToggleVoiceInput = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    speechService.stopSpeaking();
    setIsSpeaking(false);
    setVoiceTranscript('');
    setErrorMsg(null);

    speechService.startListening(
      language,
      (result) => {
        setVoiceTranscript(result.transcript);
        if (result.isFinal || result.transcript.length > 5) {
          setTextInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${result.transcript}` : result.transcript;
          });
        }
      },
      (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
    setIsListening(true);
  };

  const handleToggleQuickSymptom = (id: string) => {
    setSelectedQuickSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddBodyPain = (pain: BodyPartPain) => {
    setSelectedBodyPains((prev) => {
      const filtered = prev.filter((p) => p.id !== pain.id);
      return [...filtered, pain];
    });
  };

  const handleRemoveBodyPain = (partId: BodyPartId) => {
    setSelectedBodyPains((prev) => prev.filter((p) => p.id !== partId));
  };

  const handleResetForm = () => {
    speechService.stopSpeaking();
    speechService.stopListening();
    setTextInput('');
    setSelectedQuickSymptoms([]);
    setSelectedBodyPains([]);
    setAnalysisResult(null);
    setErrorMsg(null);
    setIsListening(false);
    setIsSpeaking(false);
    setShowRestoredNotice(false);
    storageService.clearSymptomDraft();
    setLastAutoSavedTime(null);
  };

  // Run AI Symptom & Pain Analysis
  const handleAnalyze = async () => {
    if (!textInput.trim() && selectedQuickSymptoms.length === 0 && selectedBodyPains.length === 0) {
      setErrorMsg(
        language === 'te'
          ? 'దయచేసి మీ సమస్యను టైప్ చేయండి, మైక్ ద్వారా మాట్లాడండి లేదా శరీర భాగాన్ని ఎంచుకోండి.'
          : language === 'hi'
          ? 'कृपया अपने लक्षण लिखें, बोलें या शरीर के दर्द वाले हिस्से को चुनें।'
          : 'Please enter symptoms, speak via microphone, or select a body pain area.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    speechService.stopSpeaking();
    setIsSpeaking(false);

    try {
      const response = await fetch('/api/health-ai/analyze-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textInput: textInput.trim(),
          bodyPains: selectedBodyPains,
          quickSymptoms: selectedQuickSymptoms,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze symptoms.');
      }

      const data: SymptomAnalysisResult = await response.json();
      setAnalysisResult(data);

      // Auto-read response if not muted
      if (!isMuted && data.spokenSummary) {
        setIsSpeaking(true);
        speechService.speak(data.spokenSummary, language, () => {
          setIsSpeaking(false);
        });
      }

      // Scroll smoothly to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Symptom analysis error:', err);
      setErrorMsg(
        language === 'te'
          ? 'విశ్లేషణలో లోపం ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          : language === 'hi'
          ? 'विश्लेषण में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error analyzing symptoms. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Replay voice spoken summary
  const handleReplayVoice = () => {
    if (!analysisResult?.spokenSummary) return;
    speechService.stopSpeaking();
    setIsSpeaking(true);
    speechService.speak(analysisResult.spokenSummary, language, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setIsSpeaking(false);
  };

  // Request GPS permission and display nearby hospitals
  const handleOpenNearbyHospitals = () => {
    setShowHospitalsModal(true);
    if ('geolocation' in navigator && gpsStatus === 'idle') {
      setGpsStatus('requesting');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsStatus('granted');
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          setGpsStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  // Quick direct text export without opening modal
  const handleQuickDownloadText = () => {
    if (!analysisResult) return;
    setQuickDownloadingText(true);
    const userProfile = storageService.getUserProfile();
    try {
      downloadTextReport({
        analysisResult,
        userStatement: textInput,
        selectedQuickSymptoms,
        bodyPains: selectedBodyPains,
        language,
        patientProfile: {
          name: userProfile.name || 'Patient',
          age: userProfile.age || 40,
          gender: userProfile.gender === 'female' ? 'Female' : 'Male',
          village: userProfile.village,
          mandal: userProfile.mandal,
          district: userProfile.district,
          emergencyContact: `${userProfile.emergencyContactName} (${userProfile.emergencyContactPhone})`,
        },
      });
    } finally {
      setTimeout(() => setQuickDownloadingText(false), 800);
    }
  };

  // Quick clipboard copy of clinical summary
  const handleQuickCopySummary = async () => {
    if (!analysisResult) return;
    const userProfile = storageService.getUserProfile();
    const success = await copyReportToClipboard({
      analysisResult,
      userStatement: textInput,
      selectedQuickSymptoms,
      bodyPains: selectedBodyPains,
      language,
      patientProfile: {
        name: userProfile.name || 'Patient',
        age: userProfile.age || 40,
        gender: userProfile.gender === 'female' ? 'Female' : 'Male',
        village: userProfile.village,
        mandal: userProfile.mandal,
        district: userProfile.district,
        emergencyContact: `${userProfile.emergencyContactName} (${userProfile.emergencyContactPhone})`,
      },
    });
    if (success) {
      setQuickCopied(true);
      setTimeout(() => setQuickCopied(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner: AI Pain & Symptom Detection Header with Language Switcher */}
      <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-blue-800 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-sky-600/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-xs border border-white/20">
              <Stethoscope className="w-8 h-8 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {language === 'te'
                    ? 'ఏఐ నొప్పి & లక్షణాల పరిశీలన'
                    : language === 'hi'
                    ? 'एआई दर्द और लक्षण विश्लेषक'
                    : 'AI Pain & Symptoms Detection'}
                </h2>
                <span className="bg-sky-400/20 text-sky-200 border border-sky-300/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Multilingual AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl">
                {language === 'te'
                  ? 'మీ నొప్పి మరియు లక్షణాలను వాయిస్ లేదా టెక్స్ట్ ద్వారా చెప్పండి. ఏఐ శరీర భాగాల నొప్పిని గుర్తించి తక్షణ మార్గదర్శకాలను అందిస్తుంది.'
                  : language === 'hi'
                  ? 'अपनी परेशानी बोलकर या लिखकर बताएं। एआई लक्षणों का विश्लेषण कर सही सलाह व तात्कालिक मार्गदर्शन देगा।'
                  : 'Describe pain and symptoms using voice or text. AI analyzes symptoms, detects urgency, and recommends next steps.'}
              </p>
            </div>
          </div>

          {/* Multilingual Selector & Voice Assistant Button */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {onLanguageChange && (
              <div className="inline-flex bg-white/15 p-1 rounded-2xl border border-white/20 backdrop-blur-xs">
                {(['te', 'hi', 'en'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      speechService.stopSpeaking();
                      onLanguageChange(lang);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      language === lang
                        ? 'bg-white text-sky-950 shadow-xs'
                        : 'text-sky-100 hover:text-white'
                    }`}
                  >
                    {lang === 'te' ? '🇮🇳 తె' : lang === 'hi' ? '🇮🇳 हि' : '🇬🇧 En'}
                  </button>
                ))}
              </div>
            )}

            {onOpenVoiceAssistant && (
              <button
                type="button"
                onClick={onOpenVoiceAssistant}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span className="hidden sm:inline">Voice Assistant</span>
                <span className="sm:hidden">Voice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auto-Save Draft Restored Notice Banner */}
      {showRestoredNotice && (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💾</span>
            <div>
              <span className="font-extrabold text-amber-950 block text-xs sm:text-sm">
                {t.draftRestored}
              </span>
              <span className="text-[11px] text-amber-800">
                {lastAutoSavedTime
                  ? `${language === 'te' ? 'భద్రపరిచిన సమయం:' : language === 'hi' ? 'सुरक्षित समय:' : 'Last saved:'} ${new Date(
                      lastAutoSavedTime
                    ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Auto-saved locally on your device'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowRestoredNotice(false)}
              className="px-3 py-1.5 bg-amber-200/70 hover:bg-amber-200 text-amber-950 rounded-xl text-xs font-bold transition-all"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {t.clearDraft}
            </button>
          </div>
        </div>
      )}

      {/* Feature 1: SYMPTOM INPUT (Text & Voice Input Box) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-sky-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {language === 'te'
                ? '1. మీ లక్షణాలను వివరించండి (Symptom Input)'
                : language === 'hi'
                ? '1. अपने लक्षण बताएं (Symptom Input)'
                : '1. Describe Your Symptoms'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {lastAutoSavedTime && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.autoSaved}</span>
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              {language === 'te' ? 'వాయిస్ లేదా టెక్స్ట్ ద్వారా' : language === 'hi' ? 'बोलकर या लिखकर' : 'Type naturally or speak'}
            </span>
          </div>
        </div>

        {/* Input Area with Integrated Microphone Button */}
        <div className="relative">
          <textarea
            rows={3}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              language === 'te'
                ? 'ఉదాహరణ: "నాకు రెండు రోజులుగా తీవ్రమైన తలనొప్పి మరియు జ్వరం ఉంది" లేదా "ఛాతీలో నొప్పిగా ఉంది"...'
                : language === 'hi'
                ? 'उदाहरण: "मुझे दो दिनों से तेज सिरदर्द और बुखार है" या "सीने में दर्द हो रहा है"...'
                : 'e.g., "I have severe headache and fever for two days", "My chest is hurting", "I have stomach pain"...'
            }
            className="w-full p-4 pr-16 text-sm text-slate-900 placeholder-slate-400 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all resize-none font-sans leading-relaxed"
          />

          {/* Microphone Action Button */}
          <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-3 rounded-2xl font-bold shadow-md transition-all flex items-center justify-center ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                  : 'bg-sky-600 hover:bg-sky-700 text-white'
              }`}
              title={isListening ? 'Stop listening' : 'Speak symptoms'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Active Audio Waveform Visualizer when Listening */}
        {isListening && (
          <AudioWaveformVisualizer
            isListening={true}
            colorTheme="amber"
            label={
              language === 'te'
                ? 'మీ మాటలను వింటున్నాను... చెప్పండి (Listening)'
                : language === 'hi'
                ? 'आपकी आवाज सुन रहा हूं... बोलें (Listening)'
                : 'Listening to your symptoms... speak clearly'
            }
          />
        )}

        {/* Voice Transcript Live Feedback */}
        {voiceTranscript && isListening && (
          <div className="p-3 bg-sky-50 rounded-xl text-xs text-sky-900 border border-sky-200 flex items-center gap-2 animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
            <span className="font-medium truncate">{voiceTranscript}</span>
          </div>
        )}

        {/* Example Quick Phrases for Fast Symptom Entry */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">
            {language === 'te' ? 'ఉదాహరణలు:' : language === 'hi' ? 'उदाहरण:' : 'Try:'}
          </span>
          {EXAMPLE_QUERIES.map((item, idx) => {
            const query = language === 'te' ? item.te : language === 'hi' ? item.hi : item.en;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setTextInput(query)}
                className="px-3 py-1 bg-slate-100 hover:bg-sky-100/70 text-slate-700 hover:text-sky-900 rounded-xl text-xs font-medium border border-slate-200 shrink-0 transition-all text-left truncate max-w-xs"
              >
                "{query}"
              </button>
            );
          })}
        </div>

        {/* Quick Multi-Symptom Selection Chips */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
              {language === 'te'
                ? 'సాధారణ లక్షణాలను ఎంచుకోండి (Multiple Symptoms):'
                : language === 'hi'
                ? 'सामान्य लक्षण चुनें (Multiple Symptoms):'
                : 'Quick Multiple Symptoms Selection:'}
            </label>
            <span className="text-[11px] text-slate-500">
              {selectedQuickSymptoms.length} {language === 'te' ? 'ఎంపికయ్యాయి' : language === 'hi' ? 'चुने' : 'selected'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_SYMPTOMS.map((sym) => {
              const isSelected = selectedQuickSymptoms.includes(sym.id);
              const label =
                language === 'te'
                  ? sym.labelTe
                  : language === 'hi'
                  ? sym.labelHi
                  : sym.labelEn;

              const isEmergencySym = ['chest_pain', 'breathlessness', 'snake_bite'].includes(sym.id);

              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => handleToggleQuickSymptom(sym.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? isEmergencySym
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : isEmergencySym
                      ? 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100/80'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-900'
                  }`}
                >
                  <span>{label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature 2: HUMAN BODY PAIN SELECTION (Interactive Body Map) */}
      <HumanBodyPainSelector
        language={language}
        selectedPains={selectedBodyPains}
        onAddPain={handleAddBodyPain}
        onRemovePain={handleRemoveBodyPain}
      />

      {/* Error Message if any */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Analysis Action Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="flex-1 w-full py-4 px-6 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                {language === 'te'
                  ? 'ఏఐ లక్షణాలను విశ్లేషిస్తోంది...'
                  : language === 'hi'
                  ? 'एआई विश्लेषण कर रहा है...'
                  : 'AI Analyzing Symptoms & Pain Points...'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>
                {language === 'te'
                  ? 'లక్షణాల సమగ్ర విశ్లేషణ చేయండి (Analyze Now)'
                  : language === 'hi'
                  ? 'लक्षणों का समग्र विश्लेषण करें (Analyze Now)'
                  : 'Analyze Symptoms & Get Guidance'}
              </span>
            </>
          )}
        </button>

        {(textInput || selectedQuickSymptoms.length > 0 || selectedBodyPains.length > 0 || analysisResult) && (
          <button
            type="button"
            onClick={handleResetForm}
            className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all self-stretch sm:self-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'te' ? 'రీసెట్' : language === 'hi' ? 'रीसेट' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {/* Features 3, 4, 6, 7: AI RESPONSE FORMAT & EMERGENCY DETECTION */}
      {analysisResult && (
        <div ref={resultRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Audio Waveform Visualizer when Speaking Response */}
          {isSpeaking && (
            <AudioWaveformVisualizer
              isSpeaking={true}
              colorTheme={analysisResult.isEmergency ? 'red' : 'emerald'}
              label={
                language === 'te'
                  ? 'ఏఐ సమాధానాన్ని గట్టిగా చదువుతోంది (Reading Aloud)'
                  : language === 'hi'
                  ? 'एआई उत्तर पढ़कर सुना रहा है (Reading Aloud)'
                  : 'AI Voice Speaking Health Guidance'
              }
            />
          )}

          {/* FEATURE 4: EMERGENCY DETECTION RED BANNER */}
          {analysisResult.isEmergency && (
            <div className="bg-red-600 text-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-red-500 space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-2xl shrink-0">
                    <AlertOctagon className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                      {language === 'te'
                        ? '🚨 అత్యవసర హెచ్చరిక: తక్షణ వైద్య సహాయం అవసరం!'
                        : language === 'hi'
                        ? '🚨 आपातकालीन अलर्ट: तुरंत चिकित्सा सहायता लें!'
                        : '🚨 EMERGENCY: Please seek immediate medical assistance.'}
                    </h3>
                    <p className="text-xs sm:text-sm text-red-100 font-bold mt-1">
                      {analysisResult.emergencyAlertText ||
                        'Severe symptoms detected. Do not wait at home. Get to an emergency clinic immediately.'}
                    </p>
                  </div>
                </div>

                {/* Emergency Action Buttons */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href="tel:108"
                    className="flex-1 sm:flex-initial bg-white text-red-700 hover:bg-red-50 px-5 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-5 h-5 text-red-600" />
                    <span>CALL 108 AMBULANCE</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleOpenNearbyHospitals}
                    className="flex-1 sm:flex-initial bg-red-950/70 hover:bg-red-950 text-white px-4 py-3 rounded-2xl font-black text-xs sm:text-sm border border-red-400 flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>NEARBY HOSPITAL</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Voice Message Player (WhatsApp-style interactive voice note answering in Telugu, Hindi & English) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'te'
                    ? 'ఏఐ వాయిస్ మెసేజ్ సమాధానం (Telugu / Hindi / English)'
                    : language === 'hi'
                    ? 'एआई वॉयस संदेश उत्तर (Telugu / Hindi / English)'
                    : 'AI Voice Message Response (Telugu / Hindi / English)'}
                </span>
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                🎙️ Voice Note
              </span>
            </div>

            <VoiceMessagePlayer
              sender="assistant"
              text={[
                analysisResult.spokenSummary || '',
                `**తెలుగు (Telugu):**\nలక్షణాలు: ${analysisResult.symptomsDetected.join(', ')}. సంభావ్య కారణాలు: ${analysisResult.possibleCauses.map((c) => c.conditionTe || c.condition).join(', ')}. సిఫార్సు: ${analysisResult.recommendedAction.label}. ${analysisResult.recommendedAction.explanation}. జాగ్రత్తలు: ${analysisResult.generalGuidance.join('. ')}.`,
                `**हिन्दी (Hindi):**\nलक्षण: ${analysisResult.symptomsDetected.join(', ')}. संभावित कारण: ${analysisResult.possibleCauses.map((c) => c.conditionHi || c.condition).join(', ')}. सिफारिश: ${analysisResult.recommendedAction.label}. ${analysisResult.recommendedAction.explanation}. मार्गदर्शन: ${analysisResult.generalGuidance.join('. ')}.`,
                `**English:**\nDetected symptoms: ${analysisResult.symptomsDetected.join(', ')}. Possible conditions: ${analysisResult.possibleCauses.map((c) => c.condition).join(', ')}. Urgency level: ${analysisResult.urgencyLevel}. Action: ${analysisResult.recommendedAction.label}. ${analysisResult.recommendedAction.explanation}. Guidance: ${analysisResult.generalGuidance.join('. ')}.`
              ].filter(Boolean).join('\n\n')}
              currentLanguage={language}
              isEmergency={analysisResult.isEmergency}
              onPlayingChange={(playing) => setIsSpeaking(playing)}
            />
          </div>

          {/* EXPORT CLINICAL REPORT BANNER & ACTIONS */}
          <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white rounded-3xl p-4 sm:p-5 shadow-xl border border-sky-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/20 text-sky-300 rounded-2xl border border-sky-400/30 shrink-0">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm sm:text-base text-white">
                      {language === 'te'
                        ? 'వైద్య నివేదిక ఎగుమతి (Export Clinical Report)'
                        : language === 'hi'
                        ? 'चिकित्सा रिपोर्ट निर्यात (Export Clinical Report)'
                        : 'Export Symptom Analysis & Clinical Triage Report'}
                    </h4>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/30 text-sky-200 border border-sky-400/30">
                      PDF & TXT
                    </span>
                  </div>
                  <p className="text-xs text-sky-200/90 font-medium mt-0.5">
                    {language === 'te'
                      ? 'రోగి ఆరోగ్య పరిశీలన మరియు నివేదికను PDF లేదా టెక్స్ట్ ఫైల్‌గా భద్రపరచుకోండి'
                      : language === 'hi'
                      ? 'रोगी स्वास्थ्य विश्लेषण रिपोर्ट को पीडीएफ या टेक्स्ट में डाउनलोड व सहेजें'
                      : 'Download or copy clinical summary to save or share for health records'}
                  </p>
                </div>
              </div>

              {/* Primary Action Button: Opens Full Modal */}
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all self-stretch sm:self-auto shrink-0"
              >
                <FileDown className="w-4 h-4" />
                <span>
                  {language === 'te'
                    ? 'నివేదిక ప్రివ్యూ & ఎగుమతి'
                    : language === 'hi'
                    ? 'रिपोर्ट देखें व निर्यात करें'
                    : 'Preview & Export Report'}
                </span>
              </button>
            </div>

            {/* Quick Export Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {language === 'te' ? 'పీడీఎఫ్ డౌన్‌లోడ్ (PDF)' : language === 'hi' ? 'पीडीएफ डाउनलोड' : 'Download PDF'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleQuickDownloadText}
                disabled={quickDownloadingText}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sky-100 rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-sky-300" />
                <span>{quickDownloadingText ? 'Saving...' : 'Download .TXT'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickCopySummary}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-sky-100 rounded-xl text-xs font-bold border border-white/20 flex items-center gap-1.5 transition-all"
              >
                {quickCopied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-extrabold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>
                      {language === 'te'
                        ? 'కాపీ సారాంశం (Copy for WhatsApp)'
                        : 'Copy Summary / WhatsApp'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Structured Cards Layout (Features 7 & 8) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: 🩺 SYMPTOMS DETECTED */}
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-xl">🩺</span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {language === 'te'
                    ? 'గుర్తించబడిన లక్షణాలు (Symptoms Detected)'
                    : language === 'hi'
                    ? 'पहचाने गए लक्षण (Symptoms Detected)'
                    : 'Symptoms Detected'}
                </h4>
              </div>

              <div className="flex flex-wrap gap-2">
                {analysisResult.symptomsDetected.map((sym, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-900 border border-sky-200 rounded-xl text-xs font-bold"
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    {sym}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: 📊 URGENCY LEVEL */}
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-xl">📊</span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {language === 'te'
                    ? 'తీవ్రత స్థాయి (Urgency Level)'
                    : language === 'hi'
                    ? 'गंभीरता स्तर (Urgency Level)'
                    : 'Urgency Level'}
                </h4>
              </div>

              <div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm uppercase tracking-wide border ${
                    analysisResult.urgencyLevel === 'emergency'
                      ? 'bg-red-500 text-white border-red-600 shadow-md'
                      : analysisResult.urgencyLevel === 'high'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                      : analysisResult.urgencyLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-900 border-yellow-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                  <span>{analysisResult.urgencyLevel.toUpperCase()}</span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  {analysisResult.urgencyLevel === 'emergency'
                    ? 'Critical condition requiring instant medical stabilization.'
                    : analysisResult.urgencyLevel === 'high'
                    ? 'High priority. Clinical examination at health center strongly advised.'
                    : analysisResult.urgencyLevel === 'medium'
                    ? 'Moderate discomfort. Rest well and monitor closely over 24 hours.'
                    : 'Low risk. Manage with basic home care and hydration.'}
                </p>
              </div>
            </div>

            {/* Card 3: ⚠️ POSSIBLE CAUSES */}
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {language === 'te'
                      ? 'సాధ్యమయ్యే కారణాలు (Possible Causes)'
                      : language === 'hi'
                      ? 'संभावित कारण (Possible Causes)'
                      : 'Possible Causes'}
                  </h4>
                  <span className="text-[10px] text-amber-700 font-bold">
                    * {language === 'te' ? 'సాధ్యమైన అంచనాలు మాత్రమే (Not a diagnosis)' : 'General possibilities, not a confirmed diagnosis'}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {analysisResult.possibleCauses.map((cause, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-extrabold text-xs text-slate-900">
                        {cause.condition}
                      </h5>
                      {cause.probability && (
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          {cause.probability}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {cause.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4: 🏥 RECOMMENDED ACTION */}
            <div className="bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-xl">🏥</span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {language === 'te'
                    ? 'సిఫార్సు చేసిన తదుపరి చర్య (Recommended Action)'
                    : language === 'hi'
                    ? 'अनुशंसित कदम (Recommended Action)'
                    : 'Recommended Next Action'}
                </h4>
              </div>

              <div
                className={`p-4 rounded-2xl border space-y-2 ${
                  analysisResult.recommendedAction.actionType === 'call_ambulance'
                    ? 'bg-red-50 border-red-200 text-red-950'
                    : analysisResult.recommendedAction.actionType === 'seek_urgent_care' ||
                      analysisResult.recommendedAction.actionType === 'visit_doctor'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm">
                    {analysisResult.recommendedAction.label}
                  </span>
                </div>
                <p className="text-xs font-medium leading-relaxed">
                  {analysisResult.recommendedAction.explanation}
                </p>

                {/* Direct Action Link */}
                <div className="pt-2">
                  {analysisResult.recommendedAction.actionType === 'call_ambulance' ? (
                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black shadow-md"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial 108</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenNearbyHospitals}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{language === 'te' ? 'దగ్గరి PHC చూడండి' : language === 'hi' ? 'निकटतम पीएचसी' : 'Find Nearby Clinic / PHC'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Card 5: 💡 GENERAL GUIDANCE (Full Width) */}
            <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-sky-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <span className="text-xl">💡</span>
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {language === 'te'
                    ? 'సాధారణ ఆరోగ్య మార్గదర్శకాలు (General Guidance)'
                    : language === 'hi'
                    ? 'सामान्य स्वास्थ्य निर्देश (General Guidance)'
                    : 'General Guidance & Home Care'}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysisResult.generalGuidance.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-sky-50/60 rounded-2xl border border-sky-100 flex items-start gap-2.5 text-xs text-slate-800 font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Secondary Export Bar */}
          <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-sky-700 shrink-0" />
              <div>
                <span className="font-extrabold text-xs text-sky-950 block">
                  {language === 'te'
                    ? 'రోగి ఆరోగ్య విశ్లేషణ రికార్డు సిద్ధంగా ఉంది'
                    : 'Patient Health Summary Ready'}
                </span>
                <span className="text-[11px] text-sky-800">
                  {language === 'te'
                    ? 'ఈ విశ్లేషణను పీడీఎఫ్ లేదా టెక్స్ట్ రూపంలో భద్రపరచండి'
                    : 'Export as official A4 PDF or download text file for health records'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-all"
              >
                <FileDown className="w-4 h-4" />
                <span>{language === 'te' ? 'రిపోర్ట్ ఎగుమతి (Export)' : 'Export PDF / Text'}</span>
              </button>
            </div>
          </div>

          {/* Mandatory Medical Disclaimer Banner */}
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-3">
            <Info className="w-5 h-5 text-slate-500 shrink-0" />
            <p>
              <strong className="text-slate-800">Medical Disclaimer: </strong>
              {analysisResult.disclaimer ||
                'This AI assistant provides general health information and is not a replacement for a qualified doctor.'}
            </p>
          </div>
        </div>
      )}

      {/* NEARBY HOSPITALS & CLINIC FINDER MODAL */}
      {showHospitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-sky-100 text-sky-700 rounded-2xl">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {language === 'te'
                      ? 'సమీప ఆసుపత్రులు & ప్రాథమిక ఆరోగ్య కేంద్రాలు'
                      : language === 'hi'
                      ? 'निकटतम अस्पताल एवं स्वास्थ्य केंद्र'
                      : 'Nearby Hospitals & Primary Health Centers'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {gpsStatus === 'granted'
                      ? 'GPS active • Located nearest emergency care facilities'
                      : 'Emergency healthcare network directory'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHospitalsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Status Indicator */}
            {gpsStatus === 'requesting' && (
              <div className="p-3 bg-sky-50 rounded-2xl text-xs text-sky-800 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                <span>Requesting location permission to calculate real-time distance...</span>
              </div>
            )}

            {/* List of Hospitals / PHCs */}
            <div className="space-y-3">
              {defaultFacilities.slice(0, 4).map((f) => {
                const name =
                  language === 'te'
                    ? f.nameTe
                    : language === 'hi'
                    ? f.nameHi
                    : f.name;

                const address = f.address;

                return (
                  <div
                    key={f.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 hover:bg-sky-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {name}
                        </span>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                          {f.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{address}</p>
                      <span className="text-[11px] text-sky-700 font-bold block">
                        📍 ~{f.distanceKm} km away • {f.openHours}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${f.phone}`}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${f.latitude},${f.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl text-xs font-extrabold flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Route</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => {
                    setShowHospitalsModal(false);
                    onNavigateTab('locator');
                  }}
                  className="text-xs font-bold text-sky-700 hover:underline flex items-center gap-1"
                >
                  <span>View All Facilities Directory</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowHospitalsModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYMPTOM ANALYSIS EXPORT MODAL (PDF, TXT, DOCTOR HANDOVER) */}
      {analysisResult && (
        <SymptomExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          analysisResult={analysisResult}
          userStatement={textInput}
          selectedQuickSymptoms={selectedQuickSymptoms}
          bodyPains={selectedBodyPains}
          language={language}
        />
      )}
    </div>
  );
};
