import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Globe,
  Bot,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Language } from '../types';
import { speechService } from '../services/speechService';
import { extractSpokenTextForLanguage } from '../services/translationService';

interface VoiceMessagePlayerProps {
  id?: string;
  sender: 'user' | 'assistant';
  text: string;
  currentLanguage: Language;
  timestamp?: string;
  isEmergency?: boolean;
  audioDurationSeconds?: number;
  autoPlay?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
}

// Fixed pseudo-random wave heights for consistent audio waveform look
const WAVE_BARS = [
  30, 45, 60, 25, 75, 90, 40, 65, 80, 50,
  95, 70, 45, 85, 60, 35, 90, 55, 75, 40,
  80, 60, 45, 30
];

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  id,
  sender,
  text,
  currentLanguage,
  timestamp,
  isEmergency = false,
  audioDurationSeconds,
  autoPlay = false,
  onPlayingChange,
}) => {
  // Active voice language (can be switched by user on the voice note)
  const initialLang: 'te' | 'hi' | 'en' =
    currentLanguage === 'multi' || currentLanguage === 'te'
      ? 'te'
      : currentLanguage === 'hi'
      ? 'hi'
      : 'en';

  const [voiceLang, setVoiceLang] = useState<'te' | 'hi' | 'en'>(initialLang);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0); // 0 to 1
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [showTranscript, setShowTranscript] = useState(false);

  // Calculate estimated total duration
  const totalDuration =
    audioDurationSeconds ||
    speechService.estimateDuration(
      extractSpokenTextForLanguage(text, voiceLang),
      speechRate
    ) ||
    15;

  const isAssistant = sender === 'assistant';

  useEffect(() => {
    const updatedLang: 'te' | 'hi' | 'en' =
      currentLanguage === 'multi' || currentLanguage === 'te'
        ? 'te'
        : currentLanguage === 'hi'
        ? 'hi'
        : 'en';
    setVoiceLang(updatedLang);
  }, [currentLanguage]);

  useEffect(() => {
    if (autoPlay && isAssistant) {
      handlePlayVoice(voiceLang);
    }
    return () => {
      // Don't kill speech if another player starts, but notify state
    };
  }, []);

  const handlePlayVoice = (langToSpeak = voiceLang) => {
    setVoiceLang(langToSpeak);
    speechService.stopSpeaking();
    setIsPlaying(true);
    if (onPlayingChange) onPlayingChange(true);

    const spokenText = extractSpokenTextForLanguage(text, langToSpeak);

    speechService.speak(
      spokenText,
      langToSpeak,
      () => {
        setIsPlaying(false);
        setPlaybackProgress(1);
        if (onPlayingChange) onPlayingChange(false);
      },
      (curr, total, ratio) => {
        setCurrentTimeSec(curr);
        setPlaybackProgress(ratio);
      },
      speechRate
    );
  };

  const handlePauseVoice = () => {
    speechService.stopSpeaking();
    setIsPlaying(false);
    if (onPlayingChange) onPlayingChange(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePauseVoice();
    } else {
      handlePlayVoice(voiceLang);
    }
  };

  const handleReplay = () => {
    setPlaybackProgress(0);
    setCurrentTimeSec(0);
    handlePlayVoice(voiceLang);
  };

  const handleCycleSpeed = () => {
    const speeds = [0.85, 0.95, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(speechRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeechRate(nextSpeed);

    if (isPlaying) {
      handlePlayVoice(voiceLang);
    }
  };

  const handleLanguageSwitch = (newLang: 'te' | 'hi' | 'en') => {
    setVoiceLang(newLang);
    setPlaybackProgress(0);
    setCurrentTimeSec(0);
    handlePlayVoice(newLang);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const displayedTime = isPlaying
    ? `${formatSeconds(currentTimeSec)} / ${formatSeconds(totalDuration)}`
    : `${formatSeconds(totalDuration)}`;

  return (
    <div
      className={`rounded-3xl transition-all shadow-xs border ${
        isAssistant
          ? isEmergency
            ? 'bg-red-50/95 border-red-300 text-red-950'
            : 'bg-emerald-50/70 border-emerald-200/90 text-slate-800'
          : 'bg-slate-100 border-slate-300/80 text-slate-900'
      }`}
    >
      {/* Header Tag of the Voice Note */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-white shadow-2xs ${
              isAssistant
                ? isEmergency
                  ? 'bg-red-600'
                  : 'bg-emerald-600'
                : 'bg-slate-700'
            }`}
          >
            {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight">
                {isAssistant
                  ? 'Rural Health Monitoring AI Voice Message'
                  : 'You (Voice Message)'}
              </span>
              {isAssistant && (
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                  ✓ Verified Audio
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block font-medium">
              {voiceLang === 'te'
                ? '🇮🇳 తెలుగు వాయిస్ సందేశం'
                : voiceLang === 'hi'
                ? '🇮🇳 हिन्दी वॉयस मैसेज'
                : '🇬🇧 English Voice Note'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Speed Toggle Chip */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/80 hover:bg-white text-slate-700 border border-slate-300/80 shadow-2xs transition-all"
            title="Audio speech speed"
          >
            {speechRate === 0.95 ? '1.0x' : `${speechRate}x`}
          </button>

          {timestamp && (
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Main Voice Message Audio Player Body */}
      <div className="p-4 space-y-3">
        {/* Emergency Alert Tag if present */}
        {isEmergency && (
          <div className="flex items-center gap-2 p-2 bg-red-600 text-white rounded-xl text-xs font-black animate-pulse">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>🚨 EMERGENCY AUDIO WARNING: SEEK URGENT CARE</span>
          </div>
        )}

        {/* Audio Waveform & Play Button row */}
        <div className="flex items-center gap-3.5">
          {/* Large Circular Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${
              isEmergency
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            } ${isPlaying ? 'ring-4 ring-emerald-300 animate-pulse' : ''}`}
            title={isPlaying ? 'Pause voice message' : 'Play voice message'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          {/* Waveform Bars Scrubber */}
          <div className="flex-1 space-y-1.5">
            <div
              className="flex items-center gap-0.5 sm:gap-1 h-8 cursor-pointer py-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, clickX / rect.width));
                setPlaybackProgress(ratio);
                setCurrentTimeSec(ratio * totalDuration);
                if (!isPlaying) {
                  handlePlayVoice(voiceLang);
                }
              }}
              title="Click to seek audio"
            >
              {WAVE_BARS.map((heightPercent, idx) => {
                const barRatio = idx / WAVE_BARS.length;
                const isPassed = barRatio <= playbackProgress;
                return (
                  <span
                    key={idx}
                    className={`flex-1 rounded-full transition-all ${
                      isPassed
                        ? isEmergency
                          ? 'bg-red-600 shadow-2xs'
                          : 'bg-emerald-600 shadow-2xs'
                        : 'bg-slate-300/80 hover:bg-slate-400'
                    } ${isPlaying && isPassed ? 'opacity-100' : 'opacity-85'}`}
                    style={{
                      height: `${Math.max(15, heightPercent)}%`,
                    }}
                  />
                );
              })}
            </div>

            {/* Time Elapsed / Duration indicator */}
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-500">
              <span>{isPlaying ? 'Speaking voice note...' : 'Voice message ready'}</span>
              <span>{displayedTime}</span>
            </div>
          </div>

          {/* Quick Replay button */}
          <button
            type="button"
            onClick={handleReplay}
            className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-white/80 transition-all shrink-0"
            title="Replay from start"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* MULTILINGUAL VOICE MESSAGE SELECTOR (Listen in Telugu, Hindi, English) */}
        {isAssistant && (
          <div className="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-600" />
              <span>Listen In Another Language:</span>
            </span>

            <div className="inline-flex items-center gap-1 bg-white/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs">
              {/* Telugu Voice Note Button */}
              <button
                type="button"
                onClick={() => handleLanguageSwitch('te')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  voiceLang === 'te'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                }`}
                title="Play voice message in Telugu (తెలుగులో వినండి)"
              >
                <span>🇮🇳</span>
                <span>తెలుగు</span>
                {voiceLang === 'te' && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>

              {/* Hindi Voice Note Button */}
              <button
                type="button"
                onClick={() => handleLanguageSwitch('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  voiceLang === 'hi'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                }`}
                title="Play voice message in Hindi (हिन्दी में सुनें)"
              >
                <span>🇮🇳</span>
                <span>हिन्दी</span>
                {voiceLang === 'hi' && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>

              {/* English Voice Note Button */}
              <button
                type="button"
                onClick={() => handleLanguageSwitch('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  voiceLang === 'en'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                }`}
                title="Play voice message in English"
              >
                <span>🇬🇧</span>
                <span>English</span>
                {voiceLang === 'en' && isPlaying && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Accordion: Toggle Text Transcript */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 pt-1 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <span>{showTranscript ? 'Hide Text Transcript' : 'View Text Transcript'}</span>
            </span>
            {showTranscript ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTranscript && (
            <div className="mt-2.5 p-3.5 bg-white/90 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap animate-in fade-in">
              {text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
